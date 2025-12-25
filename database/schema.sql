-- =====================================================
-- Luminary Studio - Supabase Database Schema
-- Native GPT Products System
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,

  -- Stripe integration
  stripe_customer_id TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);

-- =====================================================
-- PRODUCT ACCESS TABLE
-- Tracks which products each user has purchased/unlocked
-- =====================================================

CREATE TABLE product_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,

  -- Purchase details
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_session_id TEXT,
  amount_paid DECIMAL(10, 2),

  -- Access control
  access_granted BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = lifetime access

  -- Completion tracking
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_percentage INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure user can only have one access record per product
  UNIQUE(user_id, product_slug)
);

CREATE INDEX idx_product_access_user_id ON product_access(user_id);
CREATE INDEX idx_product_access_product_slug ON product_access(product_slug);
CREATE INDEX idx_product_access_stripe_session ON product_access(stripe_session_id);

-- =====================================================
-- PRODUCT DEFINITIONS TABLE
-- Stores product configurations (prompt engineering)
-- =====================================================

CREATE TABLE product_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_slug TEXT UNIQUE NOT NULL,

  -- Product metadata
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),

  -- Product flow configuration (JSONB for flexibility)
  steps JSONB NOT NULL,
  -- Example structure:
  -- [
  --   {
  --     "step": 1,
  --     "title": "Birth Details",
  --     "subtitle": "We'll use this to create your astrological foundation",
  --     "question": "What is your birth date, time, and location?",
  --     "prompt": "System prompt for this step...",
  --     "allow_file_upload": false,
  --     "file_upload_prompt": "Upload instructions...",
  --     "required": true,
  --     "max_follow_ups": 3
  --   }
  -- ]

  -- AI configuration
  system_prompt TEXT NOT NULL, -- Base system prompt for entire product
  final_deliverable_prompt TEXT NOT NULL, -- Prompt for generating final output
  model TEXT DEFAULT 'gpt-4', -- OpenAI model to use

  -- Settings
  estimated_duration TEXT, -- "15-20 minutes"
  total_steps INTEGER NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_definitions_slug ON product_definitions(product_slug);
CREATE INDEX idx_product_definitions_active ON product_definitions(is_active);

-- =====================================================
-- PRODUCT SESSIONS TABLE
-- Tracks user progress through a product experience
-- =====================================================

CREATE TABLE product_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,

  -- Session state
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER NOT NULL,
  is_complete BOOLEAN DEFAULT FALSE,

  -- Step data stored as JSONB for flexibility
  step_data JSONB DEFAULT '{}',
  -- Example structure:
  -- {
  --   "step_1": {
  --     "answer": "User's answer to main question",
  --     "follow_ups": [
  --       { "question": "...", "answer": "..." }
  --     ],
  --     "completed_at": "2024-01-15T10:30:00Z"
  --   },
  --   "step_2": { ... }
  -- }

  -- Final deliverable
  deliverable_content TEXT, -- Markdown/HTML content
  deliverable_url TEXT, -- PDF URL if generated
  deliverable_generated_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_sessions_user_id ON product_sessions(user_id);
CREATE INDEX idx_product_sessions_product_slug ON product_sessions(product_slug);
CREATE INDEX idx_product_sessions_complete ON product_sessions(is_complete);

-- =====================================================
-- CONVERSATIONS TABLE
-- Stores AI conversation history per step
-- =====================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES product_sessions(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,

  -- Message history stored as JSONB
  messages JSONB NOT NULL DEFAULT '[]',
  -- Example structure:
  -- [
  --   { "role": "system", "content": "You are..." },
  --   { "role": "assistant", "content": "Hello! Let's start..." },
  --   { "role": "user", "content": "My birth date is..." },
  --   { "role": "assistant", "content": "Great! I've got..." }
  -- ]

  -- Follow-up tracking
  follow_up_count INTEGER DEFAULT 0,
  max_follow_ups INTEGER DEFAULT 3,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One conversation per session per step
  UNIQUE(session_id, step_number)
);

CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_step ON conversations(session_id, step_number);

-- =====================================================
-- UPLOADED DOCUMENTS TABLE
-- Tracks files uploaded by users during product experience
-- =====================================================

CREATE TABLE uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES product_sessions(id) ON DELETE CASCADE,
  step_number INTEGER,

  -- File details
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER, -- bytes
  storage_path TEXT NOT NULL, -- Supabase Storage path

  -- Processing status
  processed BOOLEAN DEFAULT FALSE,
  extracted_text TEXT, -- If file text is extracted for AI context

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_uploaded_documents_user_id ON uploaded_documents(user_id);
CREATE INDEX idx_uploaded_documents_session_id ON uploaded_documents(session_id);

-- =====================================================
-- UPDATE TRIGGERS
-- Automatically update 'updated_at' timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_definitions_updated_at
  BEFORE UPDATE ON product_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_sessions_updated_at
  BEFORE UPDATE ON product_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to grant product access
CREATE OR REPLACE FUNCTION grant_product_access(
  p_email TEXT,
  p_product_slug TEXT,
  p_stripe_session_id TEXT,
  p_amount_paid DECIMAL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_access_id UUID;
BEGIN
  -- Get or create user
  SELECT id INTO v_user_id FROM users WHERE email = p_email;

  IF v_user_id IS NULL THEN
    INSERT INTO users (email) VALUES (p_email) RETURNING id INTO v_user_id;
  END IF;

  -- Grant product access
  INSERT INTO product_access (
    user_id,
    product_slug,
    stripe_session_id,
    amount_paid
  ) VALUES (
    v_user_id,
    p_product_slug,
    p_stripe_session_id,
    p_amount_paid
  )
  ON CONFLICT (user_id, product_slug) DO UPDATE
    SET access_granted = TRUE,
        stripe_session_id = p_stripe_session_id,
        amount_paid = p_amount_paid
  RETURNING id INTO v_access_id;

  RETURN v_access_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update session progress
CREATE OR REPLACE FUNCTION update_session_progress(
  p_session_id UUID,
  p_current_step INTEGER,
  p_total_steps INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_percentage INTEGER;
BEGIN
  -- Calculate completion percentage
  v_percentage := ROUND((p_current_step::DECIMAL / p_total_steps) * 100);

  -- Update session
  UPDATE product_sessions
  SET
    current_step = p_current_step,
    completion_percentage = v_percentage,
    last_activity_at = NOW()
  WHERE id = p_session_id;

  -- Update product_access completion percentage
  UPDATE product_access
  SET completion_percentage = v_percentage
  WHERE user_id = (SELECT user_id FROM product_sessions WHERE id = p_session_id)
    AND product_slug = (SELECT product_slug FROM product_sessions WHERE id = p_session_id);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA
-- Insert Quantum Initiation Protocol product definition
-- =====================================================

INSERT INTO product_definitions (
  product_slug,
  name,
  description,
  price,
  total_steps,
  estimated_duration,
  system_prompt,
  final_deliverable_prompt,
  steps
) VALUES (
  'quantum-initiation',
  'Quantum Initiation Protocol',
  'Build your personalized brand blueprint based on your Astrology and Human Design.',
  7.00,
  5,
  '15-20 minutes',
  'You are a Quantum Business Framework expert helping users build their personalized brand blueprint based on their Astrology and Human Design. You are warm, insightful, grounding, and non-woo. You ask clarifying questions when needed and help users articulate their vision clearly. You focus on practical business strategy informed by energetic alignment.',
  'Based on the user''s responses across all steps, generate a comprehensive Quantum Blueprint that includes:

1. **Astrological Overview** - Key placements and what they mean for business strategy
2. **Human Design Integration** - How their design informs their approach
3. **Brand Archetype** - Their unique positioning in the market
4. **Offer Clarity** - Refined articulation of what they do and who they serve
5. **Strategic Focus** - Top 3 priorities for the next 90 days based on their design
6. **Energetic Alignment** - How to build in a way that honors their natural patterns
7. **Next Steps** - Concrete, actionable steps to implement

Make it practical, actionable, and inspiring. Use their specific language and reference details they shared. Format as a clear, structured report with headers and bullet points.',
  '[
    {
      "step": 1,
      "title": "Birth Information",
      "subtitle": "We''ll use this to create your astrological foundation",
      "question": "What is your birth date, birth time, and birth location (city)?",
      "prompt": "Ask the user for their birth date, time, and location. If they don''t know their exact birth time, explain that we can still work with a noon chart, though the rising sign may be less precise. Be encouraging and briefly explain why this matters for understanding their business strategy (planetary placements, chart rulers, etc). Keep it practical, not overly mystical.",
      "allow_file_upload": false,
      "required": true,
      "max_follow_ups": 3
    },
    {
      "step": 2,
      "title": "Business Overview",
      "subtitle": "Tell us about what you''re building",
      "question": "Describe your business or the business idea you''re developing. What do you do (or want to do) and who do you serve?",
      "prompt": "Help the user articulate their business clearly. If they''re vague, ask follow-up questions to help them define: their core offer, their target customer, and the transformation/value they provide. If they have multiple ideas, help them identify which ONE to focus on for this exercise. Be a guide who asks questions, not a teacher who gives advice yet.",
      "allow_file_upload": true,
      "file_upload_prompt": "Upload any relevant documents: business plan, website info, brand materials, etc. (optional)",
      "required": true,
      "max_follow_ups": 3
    },
    {
      "step": 3,
      "title": "Current Challenge",
      "subtitle": "What''s blocking your progress?",
      "question": "What''s your biggest challenge or frustration in your business right now?",
      "prompt": "Listen deeply to the user''s challenge. Don''t offer solutions yet - just help them articulate what''s really going on beneath the surface. If the challenge seems surface-level (''I need more clients''), ask what''s beneath that. Help them identify the real bottleneck.",
      "allow_file_upload": false,
      "required": true,
      "max_follow_ups": 3
    },
    {
      "step": 4,
      "title": "Human Design",
      "subtitle": "Understanding your energetic blueprint",
      "question": "Do you know your Human Design type, strategy, and authority? If yes, please share. If no, that''s okay!",
      "prompt": "If they know their Human Design, ask them to share their type, strategy, and authority. If they don''t know it, briefly explain what Human Design is (a system that shows how you''re designed to make decisions and interact with energy) and offer to help determine their type based on their birth info from step 1. Keep it practical and business-focused, not overly mystical or woo. If they''re skeptical, validate that and focus on practical patterns.",
      "allow_file_upload": false,
      "required": false,
      "max_follow_ups": 3
    },
    {
      "step": 5,
      "title": "Vision & Goals",
      "subtitle": "Where are you headed?",
      "question": "What does success look like for your business in the next 12 months? What do you want to build and why?",
      "prompt": "Help the user articulate concrete, meaningful goals. Push past vague answers like ''make more money'' or ''get more clients'' - help them define what they REALLY want to build and why it matters to them. What would make them feel successful? What would make the work feel aligned? Be curious and help them go deeper.",
      "allow_file_upload": false,
      "required": true,
      "max_follow_ups": 3
    }
  ]'::jsonb
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'User accounts - linked to Supabase Auth';
COMMENT ON TABLE product_access IS 'Tracks which products each user has purchased';
COMMENT ON TABLE product_definitions IS 'Product configurations and prompt engineering';
COMMENT ON TABLE product_sessions IS 'User progress through product experiences';
COMMENT ON TABLE conversations IS 'AI conversation history per step';
COMMENT ON TABLE uploaded_documents IS 'Files uploaded during product experience';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Set up Row Level Security (run rls-policies.sql)';
  RAISE NOTICE '2. Configure Storage (run storage-setup.sql)';
  RAISE NOTICE '3. Test connection from your Next.js app';
END $$;
