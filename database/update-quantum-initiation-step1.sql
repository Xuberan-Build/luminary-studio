-- =====================================================
-- Update Quantum Initiation - Step 1 to File Upload
-- =====================================================

UPDATE product_definitions
SET steps = '[
    {
      "step": 1,
      "title": "Upload Your Charts",
      "description": "Upload your Birth Chart and Human Design Chart so we can extract your placements and create your personalized Quantum Brand Identity Blueprint.",
      "file_upload_prompt": "📊 **Get Your Birth Chart:**\nVisit https://horoscopes.astro-seek.com/ - Enter your birth date, time, and location, then download or screenshot your chart.\n\n🔮 **Get Your Human Design Chart:**\nVisit https://www.myhumandesign.com/ - Enter your birth details, then download or screenshot your chart.\n\nUpload both charts below (PDF, PNG, or JPG).",
      "allow_file_upload": true,
      "required": true,
      "max_follow_ups": 0
    },
    {
      "step": 2,
      "title": "Work & Value Snapshot",
      "subtitle": "Where are you right now—and who do you want to help?",
      "question": "Tell me how you currently earn (or want to earn), how you feel about money/self-worth, and what transformation you most want to create. If you have a business, describe your offer and who you serve. If you’re pre-business or employed, share your skills/role and the people or change you feel called to create.",
      "prompt": "Lead with money/offer alignment and desire. If they have a business, get: what they offer, who they serve, how they generate revenue, and how they feel about money/self-worth. If pre-business/idea-stage or employed, get: their core skills/role, the people they want to impact, how they currently earn, and their relationship to money/creation. Ask concise follow-ups to clarify offer/skills, audience/beneficiaries, the transformation they want to create, and how aligned they feel. Do not advise; keep gathering clarity.",
      "allow_file_upload": true,
      "file_upload_prompt": "Upload any relevant documents: business plan, resume/portfolio, website info, brand materials, or examples of work (optional).",
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
WHERE product_slug = 'quantum-initiation';

-- Verify update
SELECT product_slug, name, steps->0 as step_1_config
FROM product_definitions
WHERE product_slug = 'quantum-initiation';
