-- =====================================================
-- Add Welcome Instructions to All Products
-- Simplify Personal Alignment Steps
-- Fix Welcome Modal Display
-- =====================================================

-- Add welcome instructions to Personal Alignment
UPDATE product_definitions
SET instructions = jsonb_build_object(
  'welcome', jsonb_build_object(
    'title', 'Welcome to Your Personal Alignment Orientation',
    'description', E'In the next 15-20 minutes, you''ll discover:\n\n• Your core values (what truly matters to you)\n• Your natural energy design (how you''re wired to work)\n• Your Life''s Task (what you''re uniquely here to do)\n\nWe''ll use your Astrology & Human Design charts to reveal who you are at your core—before you decide what to build.',
    'estimatedTime', '15-20 minutes',
    'ctaText', 'Let''s Begin'
  ),
  'processing', jsonb_build_array(
    'Reading your chart placements...',
    'Analyzing your core identity patterns...',
    'Mapping your values to your design...',
    'Crafting your personalized insights...'
  )
)
WHERE product_slug = 'personal-alignment';

-- Add welcome instructions to Business Alignment
UPDATE product_definitions
SET instructions = jsonb_build_object(
  'welcome', jsonb_build_object(
    'title', 'Welcome to Your Business Alignment Orientation',
    'description', E'In the next 20-25 minutes, you''ll discover:\n\n• What business game you''re designed to play\n• How to structure offers aligned with your energy\n• Your natural monetization strategy\n\nWe''ll use your chart to show you how to build a business that honors who you are.',
    'estimatedTime', '20-25 minutes',
    'ctaText', 'Let''s Begin'
  ),
  'processing', jsonb_build_array(
    'Reading your chart placements...',
    'Analyzing your business design patterns...',
    'Mapping your monetization strategy...',
    'Crafting your business blueprint...'
  )
)
WHERE product_slug = 'business-alignment';

-- Add welcome instructions to Brand Alignment
UPDATE product_definitions
SET instructions = jsonb_build_object(
  'welcome', jsonb_build_object(
    'title', 'Welcome to Your Brand Alignment Orientation',
    'description', E'In the next 25-30 minutes, you''ll discover:\n\n• Your authentic brand voice and positioning\n• How to show up consistently as yourself\n• Your magnetic personal brand strategy\n\nWe''ll use your chart to unify who you are with how you show up.',
    'estimatedTime', '25-30 minutes',
    'ctaText', 'Let''s Begin'
  ),
  'processing', jsonb_build_array(
    'Reading your chart placements...',
    'Analyzing your brand archetype...',
    'Mapping your voice and positioning...',
    'Crafting your brand strategy...'
  )
)
WHERE product_slug = 'brand-alignment';

-- Simplify Personal Alignment Step 2 (Life Satisfaction & Core Values)
UPDATE product_definitions
SET steps = jsonb_set(
  steps,
  '{1,question}',
  to_jsonb('**Current Life Alignment**

Across all areas of your life, how aligned do you feel with who you truly are?
Rate it 1-10. (1 = living someone else''s life, 10 = completely authentic)

**What Matters Most to You**

Answer honestly in your own words:

• What lights you up? When do you feel most alive?
• What would you never compromise on—even if it cost you money or status?
• What makes you angry? (This reveals violated values)
• If you could design your life with zero constraints, what would you prioritize?

Think about:
• Freedom vs. Security
• Growth vs. Comfort
• Connection vs. Independence
• Impact vs. Personal fulfillment

**Your Response:**
Share your 1-10 rating and why. Then answer the questions above. We''ll help you identify your core values from what you share.'::text)
)
WHERE product_slug = 'personal-alignment';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Added welcome instructions to all products';
  RAISE NOTICE '✅ Simplified Personal Alignment Step 2';
  RAISE NOTICE '✅ Welcome modal will now display on product start';
END $$;
