-- =====================================================
-- FIX: Beta Progress Tracking
-- =====================================================
-- Problem: Beta participant completion counts stay at 0 even when scans are completed
-- Root Cause: product_sessions.completed_at is updated, but product_access.completed_at is not
-- Solution: Add trigger to sync product_access.completed_at when product_sessions completes

-- =====================================================
-- TRIGGER: Sync product_access when product_session completes
-- =====================================================

CREATE OR REPLACE FUNCTION sync_product_access_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a product session is marked complete, update the corresponding product_access record
  UPDATE product_access
  SET
    completed_at = NEW.completed_at,
    completion_percentage = 100
  WHERE user_id = NEW.user_id
    AND product_slug = NEW.product_slug
    AND completed_at IS NULL; -- Only update if not already marked complete

  RETURN NEW;
END;
$$;

-- Create trigger on product_sessions
DROP TRIGGER IF EXISTS trigger_sync_product_access_completion ON product_sessions;
CREATE TRIGGER trigger_sync_product_access_completion
  AFTER UPDATE OF completed_at ON product_sessions
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL)
  EXECUTE FUNCTION sync_product_access_completion();

-- =====================================================
-- BACKFILL: Update existing completed sessions
-- =====================================================

-- Update product_access for all previously completed sessions that weren't synced
UPDATE product_access pa
SET
  completed_at = ps.completed_at,
  completion_percentage = 100
FROM product_sessions ps
WHERE pa.user_id = ps.user_id
  AND pa.product_slug = ps.product_slug
  AND ps.completed_at IS NOT NULL
  AND pa.completed_at IS NULL;

-- =====================================================
-- FORCE BETA PARTICIPANT PROGRESS UPDATE
-- =====================================================

-- Manually recalculate progress for all beta participants
-- This will update all completion counts now that product_access.completed_at is synced

DO $$
DECLARE
  participant_record RECORD;
  perception_count INTEGER;
  orientation_count INTEGER;
  declaration_count INTEGER;
  total_products INTEGER;
  total_feedback INTEGER;
  feedback_rate DECIMAL(5,2);
BEGIN
  FOR participant_record IN SELECT * FROM beta_participants
  LOOP
    -- Count completed products by rite
    SELECT COUNT(*) INTO perception_count
    FROM product_access
    WHERE user_id = participant_record.user_id
      AND product_slug SIMILAR TO 'perception-rite-scan-[1-5]'
      AND completed_at IS NOT NULL;

    SELECT COUNT(*) INTO orientation_count
    FROM product_access
    WHERE user_id = participant_record.user_id
      AND product_slug IN ('personal-alignment', 'business-alignment', 'brand-alignment')
      AND completed_at IS NOT NULL;

    SELECT COUNT(*) INTO declaration_count
    FROM product_access
    WHERE user_id = participant_record.user_id
      AND product_slug SIMILAR TO 'declaration-rite-%'
      AND completed_at IS NOT NULL;

    total_products := perception_count + orientation_count + declaration_count;

    -- Calculate feedback completion rate
    SELECT COUNT(*) INTO total_feedback
    FROM (
      SELECT id FROM scan_feedback WHERE beta_participant_id = participant_record.id
      UNION ALL
      SELECT id FROM blueprint_feedback WHERE beta_participant_id = participant_record.id
      UNION ALL
      SELECT id FROM declaration_feedback WHERE beta_participant_id = participant_record.id
      UNION ALL
      SELECT id FROM rite_one_consolidation WHERE beta_participant_id = participant_record.id
      UNION ALL
      SELECT id FROM rite_two_consolidation WHERE beta_participant_id = participant_record.id
      UNION ALL
      SELECT id FROM complete_journey_feedback WHERE beta_participant_id = participant_record.id
    ) AS all_feedback;

    IF total_products > 0 THEN
      feedback_rate := (total_feedback::DECIMAL / total_products::DECIMAL) * 100;
    ELSE
      feedback_rate := 0;
    END IF;

    -- Update beta participant record
    UPDATE beta_participants
    SET
      perception_completed_count = perception_count,
      orientation_completed_count = orientation_count,
      declaration_completed_count = declaration_count,
      total_completion_percentage = ((perception_count + orientation_count + declaration_count) / 11.0) * 100,
      feedback_completion_rate = feedback_rate,
      current_rite = CASE
        WHEN perception_count < 5 THEN 'perception'
        WHEN orientation_count < 3 THEN 'orientation'
        WHEN declaration_count < 3 THEN 'declaration'
        ELSE 'complete'
      END,
      updated_at = NOW()
    WHERE id = participant_record.id;

    RAISE NOTICE 'Updated participant: % - Perception: %, Orientation: %, Declaration: %',
      participant_record.user_id, perception_count, orientation_count, declaration_count;
  END LOOP;
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

DO $$
DECLARE
  total_participants INTEGER;
  participants_with_progress INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_participants FROM beta_participants;

  SELECT COUNT(*) INTO participants_with_progress
  FROM beta_participants
  WHERE total_completion_percentage > 0;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Beta Progress Tracking Fix Applied';
  RAISE NOTICE '';
  RAISE NOTICE 'Total beta participants: %', total_participants;
  RAISE NOTICE 'Participants with progress: %', participants_with_progress;
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run this query to verify:';
  RAISE NOTICE 'SELECT u.email, bp.perception_completed_count, bp.total_completion_percentage FROM beta_participants bp JOIN users u ON bp.user_id = u.id;';
  RAISE NOTICE '';
END $$;
