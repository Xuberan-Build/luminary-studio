-- =====================================================
-- Fix Personal Alignment Step 1 Upload UI
-- Remove question field to use clean ChatWindow upload UI
-- =====================================================

UPDATE product_definitions
SET steps = jsonb_set(
  steps,
  '{0}',  -- Step 1 is at index 0 in the array
  jsonb_build_object(
    'step', 1,
    'title', 'Upload Your Charts',
    'description', 'Upload your Birth Chart and Human Design Chart so we can extract your placements and create your personalized Personal Alignment Blueprint.',
    'file_upload_prompt', '📊 **Get Your Birth Chart:**
Visit https://horoscopes.astro-seek.com/ - Enter your birth date, time, and location, then download or screenshot your chart.

🔮 **Get Your Human Design Chart:**
Visit https://www.myhumandesign.com/ - Enter your birth details, then download or screenshot your chart.

Upload both charts below (PDF, PNG, or JPG).',
    'allow_file_upload', true,
    'required', true,
    'max_follow_ups', 0
  )
)
WHERE product_slug = 'personal-alignment';

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '✅ Personal Alignment Step 1 updated to use clean upload UI';
  RAISE NOTICE '✅ Removed question field to match Quantum Initiation format';
END $$;
