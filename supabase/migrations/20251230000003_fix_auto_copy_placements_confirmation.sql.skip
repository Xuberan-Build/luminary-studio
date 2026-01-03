-- =====================================================
-- Fix Auto-Copy Placements Confirmation Gate
-- Users should confirm auto-copied placements before using them
-- =====================================================

-- Update function to NOT auto-confirm placements
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

  -- If we found previous placements, copy them BUT DON'T auto-confirm
  IF previous_placements IS NOT NULL THEN
    NEW.placements := previous_placements;
    -- CHANGED: Set to false so user sees confirmation gate
    NEW.placements_confirmed := false;

    RAISE NOTICE 'Auto-copied placements from previous session to new % session for user % (requires confirmation)',
      NEW.product_slug, NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '✅ Auto-copy placements function updated';
  RAISE NOTICE '✅ Users will now see confirmation gate for auto-copied placements';
  RAISE NOTICE '✅ Better UX: users can review their chart data before proceeding';
END $$;
