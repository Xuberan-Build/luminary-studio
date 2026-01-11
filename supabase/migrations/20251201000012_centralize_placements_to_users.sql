-- =====================================================
-- Centralize Placements to Users Table
-- Move chart data from session-scoped to user-level
-- Single source of truth for astrology + Human Design data
-- =====================================================

-- ============================================
-- 1. ADD COLUMNS TO USERS TABLE
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS placements JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS placements_confirmed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS placements_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Index for efficient queries on confirmed placements
CREATE INDEX IF NOT EXISTS idx_users_placements_confirmed
  ON users(placements_confirmed)
  WHERE placements_confirmed = TRUE;

-- Index for timestamp sorting
CREATE INDEX IF NOT EXISTS idx_users_placements_updated
  ON users(placements_updated_at DESC NULLS LAST)
  WHERE placements_updated_at IS NOT NULL;

DO $$
BEGIN
  RAISE NOTICE '✅ Added placements columns to users table';
  RAISE NOTICE '✅ Created indexes for performance';
END $$;


-- ============================================
-- 2. MIGRATE EXISTING DATA
-- ============================================

-- Copy most recent confirmed placements from product_sessions to each user's profile
-- This preserves existing user data and creates the initial user-level placements
WITH latest_confirmed_placements AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    placements,
    created_at
  FROM product_sessions
  WHERE placements_confirmed = TRUE
    AND placements IS NOT NULL
  ORDER BY user_id, created_at DESC
)
UPDATE users
SET
  placements = lcp.placements,
  placements_confirmed = TRUE,
  placements_updated_at = lcp.created_at
FROM latest_confirmed_placements lcp
WHERE users.id = lcp.user_id;

-- Log migration results
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM users
  WHERE placements IS NOT NULL;

  RAISE NOTICE '✅ Migrated placements for % users', migrated_count;
END $$;


-- ============================================
-- 3. UPDATE AUTO-COPY TRIGGER
-- ============================================

-- New function: Prioritize user profile, fallback to previous session
CREATE OR REPLACE FUNCTION auto_copy_placements_to_new_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_placements jsonb;
  previous_session_placements jsonb;
  source_type text;
BEGIN
  -- Only run for new sessions without placements
  IF NEW.placements IS NOT NULL OR NEW.placements_confirmed = true THEN
    RETURN NEW;
  END IF;

  -- PRIORITY 1: Copy from user profile (new behavior)
  SELECT placements INTO user_placements
  FROM users
  WHERE id = NEW.user_id
    AND placements_confirmed = TRUE
    AND placements IS NOT NULL;

  IF user_placements IS NOT NULL THEN
    NEW.placements := user_placements;
    NEW.placements_confirmed := false;  -- Always require confirmation
    source_type := 'user profile';

    RAISE NOTICE 'Auto-copied placements from % to % session for user % (requires confirmation)',
      source_type, NEW.product_slug, NEW.user_id;

    RETURN NEW;
  END IF;

  -- PRIORITY 2: Fallback to previous session (backward compatibility)
  SELECT placements INTO previous_session_placements
  FROM product_sessions
  WHERE user_id = NEW.user_id
    AND placements_confirmed = TRUE
    AND placements IS NOT NULL
    AND id != NEW.id
  ORDER BY created_at DESC
  LIMIT 1;

  IF previous_session_placements IS NOT NULL THEN
    NEW.placements := previous_session_placements;
    NEW.placements_confirmed := false;  -- Always require confirmation
    source_type := 'previous session';

    RAISE NOTICE 'Auto-copied placements from % to % session for user % (requires confirmation)',
      source_type, NEW.product_slug, NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  RAISE NOTICE '✅ Updated auto_copy_placements_to_new_session() function';
  RAISE NOTICE '✅ Priority 1: Copy from user profile';
  RAISE NOTICE '✅ Priority 2: Fallback to previous session';
END $$;


-- ============================================
-- 4. VERIFICATION QUERIES
-- ============================================

-- Show migration statistics
DO $$
DECLARE
  total_users INTEGER;
  users_with_placements INTEGER;
  total_sessions INTEGER;
  sessions_with_placements INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(*) INTO users_with_placements FROM users WHERE placements IS NOT NULL;
  SELECT COUNT(*) INTO total_sessions FROM product_sessions;
  SELECT COUNT(*) INTO sessions_with_placements FROM product_sessions WHERE placements IS NOT NULL;

  RAISE NOTICE '';
  RAISE NOTICE '📊 MIGRATION STATISTICS';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Users: % total, % with placements (%.1f%%)',
    total_users,
    users_with_placements,
    (users_with_placements::float / NULLIF(total_users, 0) * 100);
  RAISE NOTICE 'Sessions: % total, % with placements (%.1f%%)',
    total_sessions,
    sessions_with_placements,
    (sessions_with_placements::float / NULLIF(total_sessions, 0) * 100);
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $$;


-- ============================================
-- 5. ROLLBACK SCRIPT (commented out)
-- ============================================

/*
-- To rollback this migration, run:

-- Remove columns from users table
ALTER TABLE users
  DROP COLUMN IF EXISTS placements,
  DROP COLUMN IF EXISTS placements_confirmed,
  DROP COLUMN IF EXISTS placements_updated_at;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_placements_confirmed;
DROP INDEX IF EXISTS idx_users_placements_updated;

-- Restore original auto_copy function (from migration 011)
CREATE OR REPLACE FUNCTION auto_copy_placements_to_new_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  previous_placements jsonb;
BEGIN
  IF NEW.placements IS NOT NULL OR NEW.placements_confirmed = true THEN
    RETURN NEW;
  END IF;

  SELECT placements INTO previous_placements
  FROM product_sessions
  WHERE user_id = NEW.user_id
    AND placements_confirmed = true
    AND placements IS NOT NULL
    AND id != NEW.id
  ORDER BY created_at DESC
  LIMIT 1;

  IF previous_placements IS NOT NULL THEN
    NEW.placements := previous_placements;
    NEW.placements_confirmed := false;

    RAISE NOTICE 'Auto-copied placements from previous session to new % session for user % (requires confirmation)',
      NEW.product_slug, NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

RAISE NOTICE '✅ Rollback complete - restored to migration 011 state';
*/


-- ============================================
-- 6. SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 MIGRATION 013 COMPLETE';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Users table now has placements columns';
  RAISE NOTICE '✅ Existing data migrated to user profiles';
  RAISE NOTICE '✅ Auto-copy prioritizes user profile';
  RAISE NOTICE '✅ Session-level placements still supported (overrides)';
  RAISE NOTICE '✅ Backward compatible with existing sessions';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create API routes for profile placements management';
  RAISE NOTICE '2. Build Profile page UI with edit capabilities';
  RAISE NOTICE '3. Update ProductExperience to read from user profile';
  RAISE NOTICE '4. Add Profile tab to navigation';
  RAISE NOTICE '';
END $$;
