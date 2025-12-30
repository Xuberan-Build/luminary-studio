-- =====================================================
-- Auto-Copy Placements Between Products
-- Automatically copies chart placements from previous sessions
-- So users don't have to re-upload charts for every product
-- =====================================================

-- Function to copy placements from most recent confirmed session
CREATE OR REPLACE FUNCTION auto_copy_placements_to_new_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  previous_placements jsonb;
BEGIN
  -- Only run for new sessions without placements
  IF NEW.placements IS NOT NULL OR NEW.placements_confirmed = true THEN
    RETURN NEW;
  END IF;

  -- Get the most recent confirmed placements from any other product for this user
  SELECT placements INTO previous_placements
  FROM product_sessions
  WHERE user_id = NEW.user_id
    AND placements_confirmed = true
    AND placements IS NOT NULL
    AND id != NEW.id  -- Don't copy from self
  ORDER BY created_at DESC
  LIMIT 1;

  -- If we found previous placements, copy them
  IF previous_placements IS NOT NULL THEN
    NEW.placements := previous_placements;
    NEW.placements_confirmed := true;

    RAISE NOTICE 'Auto-copied placements from previous session to new % session for user %',
      NEW.product_slug, NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to auto-copy placements on new session creation
DROP TRIGGER IF EXISTS auto_copy_placements_trigger ON product_sessions;
CREATE TRIGGER auto_copy_placements_trigger
  BEFORE INSERT ON product_sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_copy_placements_to_new_session();

-- Also create a manual function users can call to copy placements
CREATE OR REPLACE FUNCTION copy_placements_between_sessions(
  source_session_id uuid,
  target_session_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  source_placements jsonb;
  source_user_id uuid;
  target_user_id uuid;
BEGIN
  -- Get source session placements and user
  SELECT placements, user_id INTO source_placements, source_user_id
  FROM product_sessions
  WHERE id = source_session_id;

  -- Get target session user
  SELECT user_id INTO target_user_id
  FROM product_sessions
  WHERE id = target_session_id;

  -- Verify both sessions belong to same user
  IF source_user_id != target_user_id THEN
    RAISE EXCEPTION 'Cannot copy placements between different users';
  END IF;

  -- Verify source has placements
  IF source_placements IS NULL THEN
    RAISE EXCEPTION 'Source session has no placements to copy';
  END IF;

  -- Copy placements to target session
  UPDATE product_sessions
  SET
    placements = source_placements,
    placements_confirmed = true
  WHERE id = target_session_id;

  RAISE NOTICE 'Successfully copied placements from % to %', source_session_id, target_session_id;
  RETURN true;
END;
$$;

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '✅ Auto-copy placements system created';
  RAISE NOTICE '✅ New product sessions will automatically inherit chart data';
  RAISE NOTICE '✅ Users only need to upload charts once!';
  RAISE NOTICE '';
  RAISE NOTICE 'Manual copy function available:';
  RAISE NOTICE '  SELECT copy_placements_between_sessions(source_session_id, target_session_id);';
END $$;
