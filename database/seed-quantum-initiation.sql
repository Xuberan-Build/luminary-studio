-- =====================================================
-- Quantum Initiation Protocol - Product Definition
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
) ON CONFLICT (product_slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  total_steps = EXCLUDED.total_steps,
  estimated_duration = EXCLUDED.estimated_duration,
  system_prompt = EXCLUDED.system_prompt,
  final_deliverable_prompt = EXCLUDED.final_deliverable_prompt,
  steps = EXCLUDED.steps;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Quantum Initiation product seeded successfully!';
END $$;
