# Technical Specifications

**Last Updated:** 2025-12-27
**Purpose:** Detailed technical specifications for all systems, APIs, and data structures

---

## 📋 Table of Contents

1. [Database Schema Specifications](#database-schema-specifications)
2. [API Contract Specifications](#api-contract-specifications)
3. [AI Integration Specifications](#ai-integration-specifications)
4. [Storage & File Processing](#storage--file-processing)
5. [Authentication & Authorization](#authentication--authorization)
6. [Payment & Webhook Integration](#payment--webhook-integration)
7. [Email System Specifications](#email-system-specifications)
8. [Performance & Scalability](#performance--scalability)

---

## 🗄️ Database Schema Specifications

### Table: `users`

**Purpose:** Primary user table synced from Supabase Auth

```sql
CREATE TABLE public.users (
  -- Primary Key
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- User Information
  email TEXT UNIQUE NOT NULL,
  name TEXT,

  -- Stripe Integration
  stripe_customer_id TEXT UNIQUE,

  -- Affiliate Fields
  is_affiliate BOOLEAN DEFAULT false,
  affiliate_opted_out BOOLEAN DEFAULT false,
  first_affiliate_visit TIMESTAMPTZ,

  -- Earnings Tracking
  total_earnings_cents INT DEFAULT 0,
  available_balance_cents INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_is_affiliate ON users(is_affiliate) WHERE is_affiliate = true;

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Service role full access"
  ON users FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
```

**Field Specifications:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, FK to auth.users | User's unique identifier |
| `email` | TEXT | UNIQUE, NOT NULL | User's email address |
| `name` | TEXT | NULLABLE | User's display name |
| `stripe_customer_id` | TEXT | UNIQUE, NULLABLE | Stripe Customer ID |
| `is_affiliate` | BOOLEAN | DEFAULT false | Whether user is enrolled as affiliate |
| `affiliate_opted_out` | BOOLEAN | DEFAULT false | User explicitly declined affiliate |
| `first_affiliate_visit` | TIMESTAMPTZ | NULLABLE | First time user clicked Affiliate tab |
| `total_earnings_cents` | INT | DEFAULT 0 | Total affiliate earnings (all time) |
| `available_balance_cents` | INT | DEFAULT 0 | Available for payout |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

---

### Table: `product_definitions`

**Purpose:** Define available products and their configuration

```sql
CREATE TABLE public.product_definitions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Product Identity
  product_slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Pricing
  price_cents INT NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_price_id TEXT,

  -- AI Configuration
  system_prompt TEXT,
  brand_persona TEXT DEFAULT 'AI Assistant',

  -- Product Steps (JSONB)
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_steps INT GENERATED ALWAYS AS (jsonb_array_length(steps)) STORED,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_product_slug ON product_definitions(product_slug);
CREATE INDEX idx_product_stripe_price ON product_definitions(stripe_price_id);
```

**Steps JSONB Structure:**

```typescript
interface ProductStep {
  step: number;                     // 1-indexed
  title: string;                    // "Upload Your Charts"
  description?: string;             // Optional step description
  question?: string;                // For questionnaire steps
  allow_file_upload?: boolean;      // true for upload steps
  file_upload_prompt?: string;      // Instructions for file upload
}

// Example:
{
  "steps": [
    {
      "step": 1,
      "title": "Upload Your Charts",
      "description": "Upload your Birth Chart and Human Design Chart",
      "allow_file_upload": true,
      "file_upload_prompt": "Upload your charts as PDF, PNG, or JPG"
    },
    {
      "step": 2,
      "title": "Money & Current Reality",
      "question": "How are you currently earning money and how aligned does it feel (1-10)?"
    }
  ]
}
```

---

### Table: `product_access`

**Purpose:** Grant users access to purchased products

```sql
CREATE TABLE public.product_access (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL REFERENCES product_definitions(product_slug),

  -- Purchase Information
  stripe_payment_intent_id TEXT,
  purchase_price_cents INT,

  -- Timestamps
  granted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, product_slug)
);

-- Indexes
CREATE INDEX idx_product_access_user ON product_access(user_id);
CREATE INDEX idx_product_access_product ON product_access(product_slug);

-- Trigger: Auto-enroll affiliate on first purchase
CREATE TRIGGER after_product_access_insert
  AFTER INSERT ON product_access
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_affiliate();
```

---

### Table: `product_sessions`

**Purpose:** Track user progress through product experience

```sql
CREATE TABLE public.product_sessions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL REFERENCES product_definitions(product_slug),

  -- Progress Tracking
  current_step INT DEFAULT 1,
  total_steps INT NOT NULL,

  -- Extracted Data (JSONB)
  placements JSONB,

  -- Final Deliverable
  deliverable TEXT,

  -- Completion
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, product_slug)
);

-- Indexes
CREATE INDEX idx_sessions_user ON product_sessions(user_id);
CREATE INDEX idx_sessions_product ON product_sessions(product_slug);
CREATE INDEX idx_sessions_completed ON product_sessions(completed_at) WHERE completed_at IS NOT NULL;
```

**Placements JSONB Structure:**

```typescript
interface Placements {
  astrology?: {
    sun?: string;           // "Aries"
    moon?: string;          // "Taurus"
    rising?: string;        // "Gemini"
    mercury?: string;
    venus?: string;
    mars?: string;
    jupiter?: string;
    saturn?: string;
    uranus?: string;
    neptune?: string;
    pluto?: string;
    houses?: string;        // "2nd: Taurus, 8th: Scorpio..."
  };
  human_design?: {
    type?: string;          // "Generator"
    strategy?: string;      // "To Respond"
    authority?: string;     // "Sacral"
    profile?: string;       // "6/2"
    centers?: string;       // "Defined: Sacral, Solar Plexus..."
    gifts?: string;         // "Gate 34, Gate 20..."
  };
  notes?: string;          // Additional extraction notes
}
```

---

### Table: `conversations`

**Purpose:** Store AI conversation history for product experiences

```sql
CREATE TABLE public.conversations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  session_id UUID NOT NULL REFERENCES product_sessions(id) ON DELETE CASCADE,

  -- Conversation Data
  step_number INT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(session_id, step_number)
);

-- Indexes
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_step ON conversations(step_number);
```

**Messages JSONB Structure:**

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;          // ISO 8601 timestamp
  type?: MessageType;
}

type MessageType =
  | 'welcome'                  // Initial greeting
  | 'user_response'            // User's answer to question
  | 'step_insight'             // AI's main response after answer
  | 'followup_question'        // User's follow-up question
  | 'followup_response'        // AI's follow-up answer
  | 'final_briefing';          // Final deliverable

// Example:
{
  "messages": [
    {
      "role": "assistant",
      "content": "Hey, I'm the QBF Wizard...",
      "created_at": "2025-12-27T10:00:00Z",
      "type": "welcome"
    },
    {
      "role": "user",
      "content": "I earn through freelance consulting...",
      "created_at": "2025-12-27T10:05:00Z",
      "type": "user_response"
    },
    {
      "role": "assistant",
      "content": "Based on your Aries Sun and Generator type...",
      "created_at": "2025-12-27T10:05:15Z",
      "type": "step_insight"
    }
  ]
}
```

---

### Table: `referral_hierarchy`

**Purpose:** Track affiliate relationships and referral codes

```sql
CREATE TABLE public.referral_hierarchy (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Referral Information
  referral_code TEXT UNIQUE NOT NULL,
  referral_link TEXT NOT NULL,

  -- Hierarchy
  referred_by_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Track System
  current_track TEXT NOT NULL DEFAULT 'community_builder',
    CHECK (current_track IN ('community_builder', 'high_performer', 'independent')),

  -- Stripe Connect
  stripe_connect_account_id TEXT UNIQUE,
  onboarding_completed BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_referral_code ON referral_hierarchy(referral_code);
CREATE INDEX idx_referred_by ON referral_hierarchy(referred_by_id);
CREATE INDEX idx_current_track ON referral_hierarchy(current_track);
```

**Commission Tracks:**

| Track | Direct Commission | Dinner Party | Override |
|-------|-------------------|--------------|----------|
| Community Builder | 30% ($2.10) | 40% ($2.80) | 10% ($0.70) |
| High Performer | 40% ($2.80) | 30% ($2.10) | 10% ($0.70) |
| Independent | 60% ($4.20) | 0% ($0) | 10% ($0.70) |

---

### Table: `affiliate_transactions`

**Purpose:** Track individual commission transactions

```sql
CREATE TABLE public.affiliate_transactions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Product Information
  product_slug TEXT NOT NULL REFERENCES product_definitions(product_slug),
  sale_amount_cents INT NOT NULL,

  -- Commission Breakdown
  direct_commission_cents INT DEFAULT 0,
  override_commission_cents INT DEFAULT 0,
  dinner_party_cents INT DEFAULT 0,

  -- Status
  commission_status TEXT DEFAULT 'pending',
    CHECK (commission_status IN ('pending', 'paid', 'failed')),
  commission_track TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_transactions_user ON affiliate_transactions(user_id);
CREATE INDEX idx_transactions_referred_user ON affiliate_transactions(referred_user_id);
CREATE INDEX idx_transactions_status ON affiliate_transactions(commission_status);
CREATE INDEX idx_transactions_created ON affiliate_transactions(created_at DESC);
```

---

### Table: `prompts`

**Purpose:** Store AI prompts for different scopes and products

```sql
CREATE TABLE public.prompts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Product Scope
  product_slug TEXT NOT NULL REFERENCES product_definitions(product_slug),

  -- Prompt Scope
  scope TEXT NOT NULL,
    CHECK (scope IN ('system', 'step_insight', 'followup', 'final_briefing')),

  -- Step-specific (nullable for global prompts)
  step_number INT,

  -- Prompt Content
  prompt TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(product_slug, scope, step_number)
);

-- Indexes
CREATE INDEX idx_prompts_product_scope ON prompts(product_slug, scope);
```

**Scope Definitions:**

| Scope | Usage | Step Number |
|-------|-------|-------------|
| `system` | Global system prompt for product | NULL |
| `step_insight` | Prompt for generating step insights | NULL (applies to all steps) |
| `followup` | Prompt for follow-up responses | NULL |
| `final_briefing` | Prompt for final deliverable generation | NULL |

---

### Database Functions

**Function: `generate_referral_code()`**

```sql
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  -- Generate 8-character alphanumeric code
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;

  -- Check uniqueness
  IF EXISTS (SELECT 1 FROM referral_hierarchy WHERE referral_code = result) THEN
    -- Recursive retry
    RETURN generate_referral_code();
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

**Function: `calculate_commission()`**

```sql
CREATE OR REPLACE FUNCTION calculate_commission(
  amount_cents INT,
  track TEXT,
  is_direct BOOLEAN
)
RETURNS INT AS $$
BEGIN
  IF is_direct THEN
    -- Direct commission
    CASE track
      WHEN 'community_builder' THEN RETURN (amount_cents * 0.30)::INT;
      WHEN 'high_performer' THEN RETURN (amount_cents * 0.40)::INT;
      WHEN 'independent' THEN RETURN (amount_cents * 0.60)::INT;
    END CASE;
  ELSE
    -- Override commission (always 10%)
    RETURN (amount_cents * 0.10)::INT;
  END IF;

  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Function: `increment_affiliate_earnings()`**

```sql
CREATE OR REPLACE FUNCTION increment_affiliate_earnings(
  p_user_id UUID,
  p_amount_cents INT
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET
    total_earnings_cents = total_earnings_cents + p_amount_cents,
    available_balance_cents = available_balance_cents + p_amount_cents,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔌 API Contract Specifications

### POST `/api/products/extract-placements`

**Purpose:** Extract chart placements from uploaded files using GPT Vision

**Request:**

```typescript
{
  sessionId: string;           // UUID of product_sessions record
  storagePaths: string[];      // Array of storage paths in user-uploads bucket
}
```

**Response (Success 200):**

```typescript
{
  placements: {
    astrology?: {
      sun?: string;
      moon?: string;
      rising?: string;
      mercury?: string;
      venus?: string;
      mars?: string;
      jupiter?: string;
      saturn?: string;
      uranus?: string;
      neptune?: string;
      pluto?: string;
      houses?: string;
    };
    human_design?: {
      type?: string;
      strategy?: string;
      authority?: string;
      profile?: string;
      centers?: string;
      gifts?: string;
    };
    notes?: string;
  }
}
```

**Response (Error 400/500):**

```typescript
{
  error: string;               // Human-readable error message
  detail?: string;             // Technical details (dev mode only)
}
```

**Processing Steps:**

1. Download files from Supabase Storage (service role)
2. Categorize by filename (astrology vs HD)
3. For PDFs: Extract text with pdf-parse (first 8000 chars)
4. For images: Create signed URLs (10 min expiry)
5. Call GPT-4o Vision API twice (separate extractions)
6. Parse JSON responses
7. Merge results
8. Update product_sessions.placements
9. Return to client

**Rate Limiting:** None (authenticated requests only)

**Timeout:** 60 seconds (Lambda max)

---

### POST `/api/products/step-insight`

**Purpose:** Generate AI insight after user answers a question

**Request:**

```typescript
{
  sessionId: string;
  stepNumber: number;          // 1-5
  stepData: {
    title: string;
    question?: string;
  };
  mainResponse: string;        // User's answer
  placements: Placements;      // From product_sessions
  systemPrompt: string;        // From product_definitions
  productSlug: string;
  priorMessages?: Message[];   // Optional conversation history
  userId: string;              // For validation
}
```

**Response (Success 200):**

```typescript
{
  aiResponse: string;          // Generated insight (markdown formatted)
}
```

**Processing Steps:**

1. Rate limit check (30 req/min per session)
2. Validate session ownership
3. Sanitize user input (max 3000 chars)
4. Load prompt from database (scope='step_insight')
5. Build placement summary string
6. Call GPT-5 reasoning model
   - Model: `gpt-5`
   - max_completion_tokens: 10,000
   - Temperature: 1 (default only)
7. Log to conversations table
8. Return insight

**Special Behavior (Step 2):**
- Wizard introduces itself: "Hey, I'm the QBF Wizard..."
- Sets context for rest of journey

**Rate Limiting:** 30 requests per 60 seconds per sessionId

**Token Usage:** ~8,000-10,000 tokens (including thinking)

---

### POST `/api/products/followup-response`

**Purpose:** Handle follow-up questions during product experience

**Request:**

```typescript
{
  sessionId: string;
  stepNumber: number;
  stepData: {
    title: string;
    question?: string;
  };
  systemPrompt: string;
  mainResponse: string;        // Original answer
  followUpQuestion: string;    // User's follow-up
  conversationHistory: Message[];
  placements: Placements;
  productSlug: string;
  userId: string;
}
```

**Response (Success 200):**

```typescript
{
  aiResponse: string;
}
```

**Processing Steps:**

1. Rate limit check
2. Validate session ownership
3. Sanitize input (max 2000 chars)
4. Load prompt (scope='followup')
5. Build context with full conversation history
6. Call GPT-5
   - max_completion_tokens: 10,000
   - Includes all previous messages
7. Log exchange to conversations
8. Return response

**Rate Limiting:** 30 requests per 60 seconds per sessionId

---

### POST `/api/products/final-briefing`

**Purpose:** Generate comprehensive final blueprint

**Request:**

```typescript
{
  sessionId: string;
  placements: Placements;
  productName?: string;
  productSlug?: string;
}
```

**Response (Success 200):**

```typescript
{
  briefing: string;            // 500-700 word blueprint (markdown)
}
```

**Processing Steps:**

1. Fetch ALL conversations for session
2. Extract user responses from all steps
3. Extract wizard's step insights (type='step_insight')
4. Extract money/revenue goals (regex search)
5. Build placement summary (only confirmed data)
6. Load prompt (scope='final_briefing')
7. Call GPT-5
   - max_completion_tokens: 15,000
   - Temperature: 1 (default)
   - Four-message structure:
     a. System prompt
     b. Chart data
     c. User responses + wizard nudges
     d. Instruction message
8. Update product_sessions.deliverable
9. Log to conversations (step_number=999)
10. Return briefing

**Blueprint Structure (7 Sections):**

1. **Brand Essence** - Core identity from chart
2. **Zone of Genius** - What they're uniquely built for
3. **What to Sell** - 1-2 specific offers with pricing
4. **How to Sell** - Voice, channels, what NOT to do
5. **Money Model** - 30-day revenue experiment
6. **Execution Spine** - 3-5 concrete actions
7. **Value Elicitation** - 3 sharp questions

**Token Usage:** ~12,000-15,000 tokens

---

### POST `/api/stripe-webhook`

**Purpose:** Process Stripe payment events

**Request:**

```typescript
// Stripe webhook payload (raw body)
{
  type: 'checkout.session.completed';
  data: {
    object: {
      customer_email: string;
      customer: string;          // Stripe Customer ID
      metadata: {
        product_slug: string;
        referral_code?: string;
      };
      amount_total: number;
    }
  }
}
```

**Headers Required:**

```
stripe-signature: <webhook_signature>
```

**Response (Success 200):**

```typescript
{
  received: true
}
```

**Processing Steps:**

1. Verify webhook signature (STRIPE_WEBHOOK_SECRET)
2. Extract customer_email, metadata
3. Find or create user
   - If exists: Update stripe_customer_id
   - If not: Create auth user + public user
4. Grant product access (INSERT product_access)
5. Trigger: auto_enroll_affiliate()
   - Check if first purchase
   - Check opt-out status
   - Generate referral code
   - Create referral_hierarchy record
   - Link to referrer if code exists
6. Process commissions (if referred)
   - Calculate direct commission
   - Calculate override commission
   - Create affiliate_transactions
   - Update affiliate earnings
7. Send welcome email
8. Return 200 OK

**Critical:** Must respond within 10 seconds or Stripe retries

**Idempotency:** Check for existing product_access before processing

---

### GET `/api/affiliate/stats`

**Purpose:** Get affiliate dashboard statistics

**Request:**

```typescript
// Requires authenticated session
// user_id extracted from session
```

**Response (Success 200):**

```typescript
{
  referral_code: string;
  referral_link: string;
  current_track: 'community_builder' | 'high_performer' | 'independent';
  total_earnings_cents: number;
  available_balance_cents: number;
  pending_payout_cents: number;
  total_referrals: number;        // All downline users
  active_referrals: number;       // Downline who purchased
  total_sales: number;            // Total downline purchases
  stripe_connect: {
    account_id: string | null;
    details_submitted: boolean;
    charges_enabled: boolean;
    payouts_enabled: boolean;
  };
  recent_transactions: Array<{
    id: string;
    referred_user_email: string;
    product_name: string;
    commission_cents: number;
    type: 'direct' | 'override';
    status: 'pending' | 'paid';
    created_at: string;
  }>;
}
```

**Processing Steps:**

1. Authenticate user
2. Call database function: `get_affiliate_stats(user_id)`
3. Aggregate data from multiple tables
4. Return formatted response

**Caching:** None (real-time data)

---

## 🤖 AI Integration Specifications

### GPT-4o (Chart Extraction)

**Model:** `gpt-4o`
**Use Case:** Extract placements from chart images and PDFs

**API Call Pattern:**

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'system',
      content: 'You are an expert astrologer...'
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Extract placements from these charts:\n\nPDF Text:\n' + pdfText
        },
        {
          type: 'image_url',
          image_url: {
            url: signedImageUrl1
          }
        },
        {
          type: 'image_url',
          image_url: {
            url: signedImageUrl2
          }
        }
      ]
    }
  ],
  max_tokens: 2000,
  temperature: 0.3,           // Low temperature for accuracy
  response_format: { type: 'json_object' }
});
```

**Input Limits:**
- Max 3 images per call
- Max 8000 chars PDF text
- Images must be accessible URLs (signed URLs)

**Output Format:**

```json
{
  "sun": "Aries",
  "moon": "Taurus",
  "rising": "Gemini",
  "houses": "2nd: Taurus, 8th: Scorpio, 10th: Capricorn, 11th: Aquarius",
  "mercury": "Aries",
  "venus": "Taurus",
  "mars": "Gemini",
  "jupiter": "Cancer",
  "saturn": "Aquarius",
  "uranus": "Taurus",
  "neptune": "Pisces",
  "pluto": "Capricorn"
}
```

**Error Handling:**
- Retry on 500/503 errors (max 2 retries)
- Exponential backoff: 1s, 2s, 4s
- Fallback: Return partial data or prompt manual entry

---

### GPT-5 (Reasoning Model)

**Model:** `gpt-5`
**Use Cases:** Step insights, followups, final briefing

**API Call Pattern:**

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-5',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ],
  max_completion_tokens: 10000   // For thinking + output
  // temperature: 1 (default only - no custom values)
});
```

**Token Budget:**

| Use Case | max_completion_tokens | Typical Usage |
|----------|----------------------|---------------|
| Step Insight | 10,000 | 8,000-9,000 (thinking: 5-6k, output: 2-3k) |
| Followup | 10,000 | 6,000-8,000 |
| Final Briefing | 15,000 | 12,000-14,000 |

**Critical Differences from GPT-4:**
1. Uses `max_completion_tokens` (not `max_tokens`)
2. Only supports `temperature=1` (default)
3. Tokens include thinking (chain-of-thought) + output
4. finish_reason: "length" means token limit hit (need higher limit)

**Response Structure:**

```typescript
{
  choices: [{
    message: {
      content: string;         // Actual output
      role: 'assistant';
    },
    finish_reason: 'stop' | 'length' | 'content_filter';
  }],
  usage: {
    prompt_tokens: number;
    completion_tokens: number;    // Includes thinking
    total_tokens: number;
  }
}
```

---

### Prompt Engineering Patterns

**Pattern 1: Step Insight (First Response)**

```
SYSTEM:
You are the QBF Wizard. Ground everything in placements: money houses (2/8/10/11), Sun/Moon/Rising, Mars/Venus/Mercury/Saturn/Pluto, HD type/strategy/authority.

USER:
FIRST RESPONSE (Step 2): Start with "Hey, I'm the QBF Wizard. I've read your chart and I'm here to help align how you're earning with how you're designed to earn." Then give 2-3 short paragraphs about their chart's money themes.

Placements:
Sun: Aries, Moon: Taurus, Rising: Gemini
HD Type: Generator, Strategy: To Respond, Authority: Sacral

User's answer: "I earn through freelance consulting, feels about 5/10 aligned. Want recurring revenue."

FOR ALL RESPONSES: Write like you're talking to a smart high schooler. Use simple, everyday language. Short sentences. One idea per sentence. If you use astrology/HD terms, explain them in plain English.
```

**Pattern 2: Final Briefing**

```
SYSTEM:
You are the QBF Wizard. Create a powerful blueprint that a smart high schooler could understand but is deep enough to be worth $700. Short sentences. Simple words. Explain any jargon. No fluff.

USER 1 (Chart Data):
ASTROLOGY:
Sun: Aries, Moon: Taurus, Rising: Gemini
Houses: 2nd Taurus, 8th Scorpio, 10th Capricorn, 11th Aquarius
Mars: Gemini, Venus: Taurus, Mercury: Aries

HUMAN DESIGN:
Type: Generator, Strategy: To Respond, Authority: Sacral
Profile: 6/2, Centers: Defined Sacral & Solar Plexus

USER 2 (Conversation):
MY COMPLETE RESPONSES:
Step 2: I earn through freelance consulting...
Step 3: My bottleneck is inconsistent cashflow...
Step 4: I want to create a group coaching program...
Step 5: I'm energized by 1-on-1 work...

QBF WIZARD'S ACTIONABLE NUDGES:
Step 2 Insight: Your Generator design thrives on recurring work...
Step 3 Insight: With Taurus 2nd house, you need stability...

USER 3 (Instructions):
Generate my Quantum Brand Blueprint with these 7 sections:
1. Brand Essence (1-2 sentences)
2. Zone of Genius + Value Promise
3. What to Sell Next (1-2 offers with pricing)
4. How to Sell (voice, channels, what NOT to do)
5. Money Model (30-day revenue experiment)
6. Execution Spine (3-5 concrete actions)
7. Value Elicitation (3 sharp questions)

Synthesize the QBF Wizard's nudges into the action steps.
```

---

## 💾 Storage & File Processing

### Supabase Storage Configuration

**Bucket: `user-uploads`**

```typescript
{
  name: 'user-uploads',
  public: false,              // Private bucket
  fileSizeLimit: 10485760,    // 10MB per file
  allowedMimeTypes: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ]
}
```

**RLS Policies:**

```sql
-- Users can upload to own folder
CREATE POLICY "Users can insert own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read own files
CREATE POLICY "Users can select own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Service role has full access
CREATE POLICY "Service role full access"
  ON storage.objects FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
```

**File Path Structure:**

```
user-uploads/
  {user_id}/
    {session_id}/
      {timestamp}_{original_filename}

Example:
user-uploads/abc123-def456-789/session-uuid-123/1703721234_birth-chart.pdf
```

---

### PDF Processing

**Library:** `pdf-parse`

**Processing Flow:**

```typescript
import pdfParse from 'pdf-parse';

async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);

    return {
      text: data.text.slice(0, 8000),    // First 8000 chars
      pages: data.numpages,
      info: data.info                     // Metadata
    };
  } catch (error) {
    console.error('PDF parse error:', error);
    return null;
  }
}
```

**Categorization Logic:**

```typescript
function isHumanDesign(filename: string): boolean {
  const hdKeywords = ['hd', 'human', 'design', 'bodygraph', 'rave'];
  const lowerFilename = filename.toLowerCase();

  return hdKeywords.some(keyword => lowerFilename.includes(keyword));
}

// Usage:
if (isHumanDesign(storagePath)) {
  hdPdfTexts.push(extractedText);
} else {
  astroPdfTexts.push(extractedText);
}
```

---

### Image Processing

**Signed URL Generation:**

```typescript
async function createSignedUrl(
  storagePath: string,
  expiresIn: number = 600  // 10 minutes
): Promise<string> {
  const { data, error } = await supabaseAdmin
    .storage
    .from('user-uploads')
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;

  return data.signedUrl;
}
```

**Image Formats Accepted:**
- PNG (preferred for charts)
- JPEG/JPG
- Max dimensions: 4096x4096 (GPT Vision limit)
- Max file size: 10MB

---

## 🔐 Authentication & Authorization

### Supabase Auth Configuration

**Email Auth Enabled:**
- Email/password signup
- Email verification (optional)
- Password requirements: Min 6 chars

**Session Management:**
- Session stored in httpOnly cookies
- Auto-refresh enabled
- Session lifetime: 7 days
- Refresh token rotation: Enabled

**Auth Flow:**

```typescript
// Signup
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      name: 'User Name'
    }
  }
});

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Get session
const { data: { session } } = await supabase.auth.getSession();

// Logout
const { error } = await supabase.auth.signOut();
```

---

### Middleware Route Protection

**File:** `/src/middleware.ts`

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Public routes
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/api/stripe-webhook',
    '/api/test-supabase'
  ];

  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return res;
  }

  // Protected routes - require session
  if (!session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Product routes - check access
  if (request.nextUrl.pathname.startsWith('/products/')) {
    const slug = request.nextUrl.pathname.split('/')[2];

    const { data: access } = await supabase
      .from('product_access')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('product_slug', slug)
      .maybeSingle();

    if (!access) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

### RLS (Row Level Security)

**Pattern: Users can only access own data**

```sql
-- Example: product_sessions
CREATE POLICY "Users can select own sessions"
  ON product_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON product_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role bypasses RLS
CREATE POLICY "Service role full access"
  ON product_sessions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
```

---

## 💳 Payment & Webhook Integration

### Stripe Configuration

**API Version:** 2024-11-20.acacia

**Products:**
- Quantum Initiation: $7.00 USD
- Stripe Price ID: (stored in product_definitions)

**Checkout Session Metadata:**

```typescript
{
  product_slug: 'quantum-initiation',
  referral_code: 'ABC123XYZ',    // If present
  user_id: 'uuid'                 // If logged in
}
```

---

### Webhook Security

**Signature Verification:**

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook Error', { status: 400 });
  }

  // Process event
  if (event.type === 'checkout.session.completed') {
    // Handle payment
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

**Critical Timing:**
- Must respond within 10 seconds
- Stripe retries failed webhooks (exponential backoff)
- After 3 days of failures, webhook disabled

---

### Stripe Connect (Affiliates)

**Account Type:** Express

**Creation:**

```typescript
const account = await stripe.accounts.create({
  type: 'express',
  email: user.email,
  capabilities: {
    transfers: { requested: true },
  },
  metadata: {
    user_id: user.id
  }
});
```

**Onboarding:**

```typescript
const accountLink = await stripe.accountLinks.create({
  account: connectAccountId,
  refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/affiliate`,
  return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/affiliate`,
  type: 'account_onboarding',
});

// Redirect user to accountLink.url
```

**Payout Processing:**

```typescript
const transfer = await stripe.transfers.create({
  amount: amountCents,
  currency: 'usd',
  destination: connectAccountId,
  description: 'Affiliate commission payout',
});
```

---

## 📧 Email System Specifications

### Gmail API Integration

**Authentication:** Service Account

**Required Scopes:**
- `https://www.googleapis.com/auth/gmail.send`

**Send Email Pattern:**

```typescript
import { google } from 'googleapis';

const gmail = google.gmail({
  version: 'v1',
  auth: getAuthClient()
});

async function sendEmail(to: string, subject: string, html: string) {
  const message = [
    `To: ${to}`,
    `From: Quantum Strategies <support@quantumstrategies.online>`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage
    }
  });

  return res.data;
}
```

---

## ⚡ Performance & Scalability

### API Response Times (Target)

| Endpoint | Target | Typical | Max Acceptable |
|----------|--------|---------|----------------|
| extract-placements | 15s | 20-30s | 60s |
| step-insight | 5s | 8-12s | 30s |
| followup-response | 3s | 5-8s | 20s |
| final-briefing | 10s | 15-25s | 60s |
| affiliate/stats | 500ms | 800ms | 2s |

### Database Query Optimization

**Indexes Created:**

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_is_affiliate ON users(is_affiliate) WHERE is_affiliate = true;

-- Product Sessions
CREATE INDEX idx_sessions_user ON product_sessions(user_id);
CREATE INDEX idx_sessions_product ON product_sessions(product_slug);
CREATE INDEX idx_sessions_completed ON product_sessions(completed_at) WHERE completed_at IS NOT NULL;

-- Conversations
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_step ON conversations(step_number);

-- Affiliate Transactions
CREATE INDEX idx_transactions_user ON affiliate_transactions(user_id);
CREATE INDEX idx_transactions_created ON affiliate_transactions(created_at DESC);
```

### Vercel Function Limits

| Resource | Limit (Free/Pro) |
|----------|------------------|
| Max Duration | 10s / 60s |
| Memory | 1024MB / 3008MB |
| Request Body | 4.5MB |
| Response Body | 4.5MB |

**Long-Running Operations:**
- extract-placements: Uses 60s timeout (requires Pro)
- final-briefing: Uses 60s timeout (requires Pro)

### Cost Optimization

**OpenAI API Costs (GPT-5):**
- Input: $0.002 per 1K tokens
- Output: $0.01 per 1K tokens

**Typical Usage:**
- Step insight: ~8K tokens = $0.096
- Final briefing: ~13K tokens = $0.156
- Per user journey: ~$0.50-0.70

**Monthly Estimates (100 users):**
- AI costs: $50-70
- Stripe fees: $21 (3% + 30¢ per $7 transaction)
- Supabase: Free tier
- Vercel: Free tier (or $20/mo Pro)

---

**End of Technical Specifications**

This document provides complete technical specifications for all systems. Refer to FLOWS_AND_ROUTING.md for detailed flow diagrams and user journeys.
