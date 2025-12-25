-- =====================================================
-- Product Definitions Seed File
-- Add new GPT products here
-- =====================================================

-- NOTE: quantum-initiation is already seeded in schema.sql
-- This file is for adding additional products

-- =====================================================
-- Quantum Structure, Profit & Scale ($14)
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
  'quantum-structure-profit-scale',
  'Quantum Structure, Profit & Scale',
  'Map your business structure, identify profit paths, and create a disciplined expansion strategy.',
  14.00,
  7,
  '25-35 minutes',
  'You are a Quantum Business Framework expert specializing in business structure, profit optimization, and strategic scaling. You help entrepreneurs clarify their business model, identify revenue streams, and create sustainable growth strategies. You are direct, practical, and focused on actionable business outcomes. You ask probing questions to help users think strategically about their business architecture.',
  'Based on the user''s responses across all steps, generate a comprehensive Quantum Scale Blueprint that includes:

1. **Business Structure Analysis** - Current state assessment and structural recommendations
2. **Profit Path Mapping** - All potential revenue streams and which to prioritize
3. **Customer Journey & Offerings** - Clear articulation of offers and how customers progress
4. **Pricing Strategy** - Strategic pricing aligned with value and positioning
5. **Scale Framework** - Systems, team, and infrastructure needed to scale
6. **90-Day Action Plan** - Prioritized, concrete steps to implement the strategy
7. **Metrics & Milestones** - Key numbers to track and goals to hit

Make it practical, strategic, and actionable. Use their specific business details and reference their responses. Format as a clear, structured report with headers, bullet points, and specific numbers/timelines.',
  '[
    {
      "step": 1,
      "title": "Business Overview",
      "subtitle": "Tell us about your current business",
      "question": "Describe your business: What do you do, who do you serve, and what is your current revenue/stage?",
      "prompt": "Help the user clearly articulate their business. Get specifics: What products/services do they sell? Who are their customers? What is their current monthly revenue or stage (pre-revenue, 0-10k/mo, 10-50k/mo, etc.)? How long have they been in business? What is their business model (1:1 services, group programs, digital products, etc.)? Be direct and ask for concrete numbers.",
      "allow_file_upload": true,
      "file_upload_prompt": "Upload any business documents: P&L, pricing sheets, offer outlines, etc. (optional)",
      "required": true,
      "max_follow_ups": 3
    },
    {
      "step": 2,
      "title": "Current Offers & Pricing",
      "subtitle": "What are you selling and for how much?",
      "question": "List all your current offers/products/services and their prices. What is selling well? What is not?",
      "prompt": "Get a complete inventory of everything they currently sell. For each offer, ask: What is it? What is the price? How many sold in the last 3 months? What is the delivery method (1:1, group, self-paced, etc.)? Which offers are generating the most revenue? Which are taking the most time? Help them see patterns in what is working vs what is not.",
      "allow_file_upload": false,
      "required": true,
      "max_follow_ups": 3
    },
    {
      "step": 3,
      "title": "Profit Paths & Revenue Goals",
      "subtitle": "Where could money come from?",
      "question": "What is your revenue goal for the next 12 months? What potential revenue streams or business ideas are you considering?",
      "prompt": "Get their revenue target first. Then explore all possible ways they could generate revenue in their business (existing offers, new offers, upsells, partnerships, etc.). Help them brainstorm all paths to revenue, even ideas they are unsure about. Push them to be specific about numbers and timelines. Ask: What would need to be true to hit that goal? What is stopping them from implementing each idea?",
      "allow_file_upload": false,
      "required": true,
      "max_follow_ups": 3
    },
    {
      "step": 4,
      "title": "Customer Journey & Ascension",
      "subtitle": "How do customers progress through your offers?",
      "question": "Map out your customer journey: How do people discover you? What do they buy first? What do they buy next? Is there a clear progression?",
      "prompt": "Help the user map their customer journey from awareness to repeat purchase. Where do new customers come from? What is the entry offer? Is there a natural next step or upsell? Are there gaps in the journey? Do people get stuck anywhere? Help them identify where the journey breaks down or where opportunities exist to serve customers at multiple levels.",
      "allow_file_upload": false,
      "required": true,
      "max_follow_ups": 3
    },
    {
      "step": 5,
      "title": "Operations & Capacity",
      "subtitle": "What is your current capacity and infrastructure?",
      "question": "How many hours per week do you work? What takes up most of your time? Do you have a team? What systems/tools do you use?",
      "prompt": "Get a realistic picture of their current operations. How much time are they spending on delivery vs sales vs admin? Are they maxed out on capacity? Do they have systems or is everything manual? Do they have team members or contractors? What tools/software are they using? Help them see where they are operationally constrained and what would need to change to scale.",
      "allow_file_upload": false,
      "required": true,
      "max_follow_ups": 3
    },
    {
      "step": 6,
      "title": "Growth Bottlenecks",
      "subtitle": "What is blocking you from scaling?",
      "question": "What is the biggest bottleneck preventing you from growing revenue right now?",
      "prompt": "Push for the real answer, not the surface answer. Is it lack of leads? Lack of sales skills? Delivery capacity? Pricing? Positioning? Help them identify the single biggest constraint. If they say ''I need more clients,'' ask what is stopping them from getting more clients. Dig deeper to find the root cause bottleneck.",
      "allow_file_upload": false,
      "required": true,
      "max_follow_ups": 3
    },
    {
      "step": 7,
      "title": "Strategic Vision",
      "subtitle": "Where do you want this business to go?",
      "question": "What does your ideal business look like 2-3 years from now? What revenue? What lifestyle? What team structure?",
      "prompt": "Help them articulate a clear, specific vision for their scaled business. What is the revenue? What offers are they selling? How many hours are they working? Do they have a team? What does their day-to-day look like? What feels aligned vs what feels like ''shoulds''? Help them design a business they actually want to run, not just one that makes money.",
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

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Product definitions seeded successfully!';
  RAISE NOTICE 'Products available:';
  RAISE NOTICE '  - quantum-structure-profit-scale ($14)';
END $$;
