-- =====================================================
-- CRITICAL FIX: Business Alignment Step 1
-- Step 1 should NEVER ask for birth info - use file upload
-- =====================================================

BEGIN;

UPDATE product_definitions
SET steps = jsonb_set(
  steps,
  '{0}',
  '{
    "step": 1,
    "title": "Upload Your Charts",
    "description": "Upload your Birth Chart and Human Design Chart so we can extract your placements and create your personalized Business Alignment Blueprint.",
    "file_upload_prompt": "📊 **Get Your Birth Chart:**\nVisit https://horoscopes.astro-seek.com/ - Enter your birth date, time, and location, then download or screenshot your chart.\n\n🔮 **Get Your Human Design Chart:**\nVisit https://www.myhumandesign.com/ - Enter your birth details, then download or screenshot your chart.\n\nUpload both charts below (PDF, PNG, or JPG).",
    "allow_file_upload": true,
    "required": true,
    "max_follow_ups": 0
  }'::jsonb
)
WHERE product_slug = 'quantum-initiation';

-- Verify fix
SELECT
  product_slug,
  'FIXED' as status,
  steps->0->>'title' as step1_title,
  steps->0->>'allow_file_upload' as allows_upload
FROM product_definitions
WHERE product_slug = 'quantum-initiation';

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🚨 CRITICAL FIX APPLIED: Business Alignment Step 1';
  RAISE NOTICE '';
  RAISE NOTICE 'Changed:';
  RAISE NOTICE '  ❌ BEFORE: "Birth Information" (text input)';
  RAISE NOTICE '  ✅ AFTER: "Upload Your Charts" (file upload)';
  RAISE NOTICE '';
  RAISE NOTICE 'Step 1 now properly uses:';
  RAISE NOTICE '  - File upload screen';
  RAISE NOTICE '  - Placement confirmation gate';
  RAISE NOTICE '  - Auto-copy from previous products';
END $$;
