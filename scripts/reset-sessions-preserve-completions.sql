-- =====================================================
-- Reset All Product Sessions
-- Preserves: deliverable_content, completed_at
-- Resets: current_step to 1, placements_confirmed to false
-- =====================================================

BEGIN;

-- Show current state
SELECT
  id,
  product_slug,
  current_step,
  placements_confirmed,
  completed_at IS NOT NULL as has_completion,
  deliverable_content IS NOT NULL as has_deliverable
FROM product_sessions
ORDER BY created_at DESC;

-- Reset all sessions to step 1 with unconfirmed placements
-- BUT preserve completions and deliverables
UPDATE product_sessions
SET
  current_step = 1,
  current_section = 1,
  placements_confirmed = false
-- We keep: placements, deliverable_content, completed_at, all other fields
WHERE true;

-- Show updated state
SELECT
  id,
  product_slug,
  current_step,
  placements_confirmed,
  completed_at IS NOT NULL as has_completion,
  deliverable_content IS NOT NULL as has_deliverable
FROM product_sessions
ORDER BY created_at DESC;

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All sessions reset to step 1';
  RAISE NOTICE '';
  RAISE NOTICE 'Reset:';
  RAISE NOTICE '  - current_step → 1';
  RAISE NOTICE '  - placements_confirmed → false';
  RAISE NOTICE '';
  RAISE NOTICE 'Preserved:';
  RAISE NOTICE '  - placements (auto-copied data)';
  RAISE NOTICE '  - deliverable_content';
  RAISE NOTICE '  - completed_at';
  RAISE NOTICE '';
  RAISE NOTICE 'Next time you click "Continue Experience" you will see the confirmation gate.';
END $$;
