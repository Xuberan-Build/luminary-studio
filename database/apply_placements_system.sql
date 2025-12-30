-- ============================================================
-- Apply Placements System & Copy Existing Placements
-- Run this once to:
-- 1. Install auto-copy trigger for future sessions
-- 2. Copy existing placements to all current sessions
-- ============================================================

-- Part 1: Create Auto-Copy Trigger
-- This ensures future product sessions auto-copy placements

CREATE OR REPLACE FUNCTION auto_copy_placements_to_new_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  previous_placements jsonb;
BEGIN
  -- Skip if placements already exist
  IF NEW.placements IS NOT NULL OR NEW.placements_confirmed = true THEN
    RETURN NEW;
  END IF;

  -- Find most recent session with placements for this user
  SELECT placements INTO previous_placements
  FROM product_sessions
  WHERE user_id = NEW.user_id
    AND placements_confirmed = true
    AND placements IS NOT NULL
    AND id != NEW.id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Copy placements if found
  IF previous_placements IS NOT NULL THEN
    NEW.placements := previous_placements;
    NEW.placements_confirmed := true;

    RAISE NOTICE 'Auto-copied placements from previous session to new session %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_copy_placements_trigger ON product_sessions;

-- Create trigger on product_sessions
CREATE TRIGGER auto_copy_placements_trigger
  BEFORE INSERT OR UPDATE ON product_sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_copy_placements_to_new_session();

-- Grant permissions
GRANT EXECUTE ON FUNCTION auto_copy_placements_to_new_session() TO authenticated;

COMMENT ON FUNCTION auto_copy_placements_to_new_session()
IS 'Automatically copies placements from user''s previous sessions when creating a new product session';


-- Part 2: Copy Placements to Existing Sessions
-- This is a one-time operation to backfill existing sessions

DO $$
DECLARE
  user_record RECORD;
  source_placements jsonb;
  sessions_updated integer := 0;
BEGIN
  RAISE NOTICE 'Starting placements backfill...';

  -- For each user, find their session with placements and copy to sessions without
  FOR user_record IN
    SELECT DISTINCT user_id FROM product_sessions
  LOOP
    -- Find this user's source placements (any session with placements)
    SELECT placements INTO source_placements
    FROM product_sessions
    WHERE user_id = user_record.user_id
      AND placements IS NOT NULL
      AND placements_confirmed = true
    ORDER BY created_at DESC
    LIMIT 1;

    -- If user has placements, copy to all their sessions that don't have them
    IF source_placements IS NOT NULL THEN
      UPDATE product_sessions
      SET
        placements = source_placements,
        placements_confirmed = true
      WHERE user_id = user_record.user_id
        AND (placements IS NULL OR placements_confirmed = false);

      GET DIAGNOSTICS sessions_updated = ROW_COUNT;

      IF sessions_updated > 0 THEN
        RAISE NOTICE 'Copied placements to % session(s) for user %', sessions_updated, user_record.user_id;
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE 'Placements backfill complete!';
END $$;

-- Part 3: Verification Query
-- Run this to see the results

SELECT
  ps.user_id,
  u.email,
  ps.product_slug,
  ps.version,
  CASE
    WHEN ps.placements IS NOT NULL THEN '✅ Has placements'
    ELSE '❌ Missing placements'
  END as placements_status,
  ps.placements_confirmed
FROM product_sessions ps
JOIN auth.users u ON ps.user_id = u.id
ORDER BY u.email, ps.product_slug, ps.version;
