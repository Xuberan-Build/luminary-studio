-- Session Versioning System
-- Allows users to:
-- 1. Create multiple versions of the same product
-- 2. Track free attempts (2 per product)
-- 3. Navigate between versions
-- 4. View previous deliverables

-- Add versioning columns to product_sessions
ALTER TABLE product_sessions
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_session_id UUID REFERENCES product_sessions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_latest_version BOOLEAN DEFAULT true;

-- Add free attempts tracking to product_access
ALTER TABLE product_access
ADD COLUMN IF NOT EXISTS free_attempts_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_attempts_limit INTEGER DEFAULT 2;

-- Create index for version queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_product_version
ON product_sessions(user_id, product_slug, version DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_parent
ON product_sessions(parent_session_id);

-- Function to create new session version
CREATE OR REPLACE FUNCTION create_session_version(
  p_user_id uuid,
  p_product_slug text,
  p_parent_session_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_session_id uuid;
  v_next_version integer;
  v_parent_placements jsonb;
  v_total_steps integer;
  v_free_attempts_used integer;
  v_free_attempts_limit integer;
BEGIN
  -- Get free attempts info
  SELECT free_attempts_used, free_attempts_limit
  INTO v_free_attempts_used, v_free_attempts_limit
  FROM product_access
  WHERE user_id = p_user_id AND product_slug = p_product_slug;

  -- Check if user has exceeded free attempts
  IF v_free_attempts_used >= v_free_attempts_limit THEN
    RAISE EXCEPTION 'Free attempts limit reached. User must purchase additional sessions.';
  END IF;

  -- Get next version number
  SELECT COALESCE(MAX(version), 0) + 1
  INTO v_next_version
  FROM product_sessions
  WHERE user_id = p_user_id AND product_slug = p_product_slug;

  -- Get parent session placements (to copy)
  SELECT placements INTO v_parent_placements
  FROM product_sessions
  WHERE id = p_parent_session_id AND user_id = p_user_id;

  -- Get total steps from product definition
  SELECT jsonb_array_length(steps) INTO v_total_steps
  FROM product_definitions
  WHERE product_slug = p_product_slug;

  -- Mark all previous versions as not latest
  UPDATE product_sessions
  SET is_latest_version = false
  WHERE user_id = p_user_id
    AND product_slug = p_product_slug
    AND is_latest_version = true;

  -- Create new session version
  INSERT INTO product_sessions (
    user_id,
    product_slug,
    current_step,
    current_section,
    total_steps,
    is_complete,
    placements_confirmed,
    placements,
    version,
    parent_session_id,
    is_latest_version
  ) VALUES (
    p_user_id,
    p_product_slug,
    1,
    1,
    v_total_steps,
    false,
    CASE WHEN v_parent_placements IS NOT NULL THEN true ELSE false END,
    v_parent_placements, -- Copy placements from parent
    v_next_version,
    p_parent_session_id,
    true
  )
  RETURNING id INTO v_new_session_id;

  -- Increment free attempts counter
  UPDATE product_access
  SET free_attempts_used = free_attempts_used + 1
  WHERE user_id = p_user_id AND product_slug = p_product_slug;

  RETURN v_new_session_id;
END;
$$;

-- Function to get session version history
CREATE OR REPLACE FUNCTION get_session_versions(
  p_user_id uuid,
  p_product_slug text
)
RETURNS TABLE (
  session_id uuid,
  version integer,
  is_complete boolean,
  completed_at timestamptz,
  created_at timestamptz,
  is_latest boolean,
  has_deliverable boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.id as session_id,
    ps.version,
    ps.is_complete,
    ps.completed_at,
    ps.created_at,
    ps.is_latest_version as is_latest,
    (ps.deliverable_content IS NOT NULL) as has_deliverable
  FROM product_sessions ps
  WHERE ps.user_id = p_user_id
    AND ps.product_slug = p_product_slug
  ORDER BY ps.version DESC;
END;
$$;

-- Function to check if user can create new version
CREATE OR REPLACE FUNCTION can_create_new_version(
  p_user_id uuid,
  p_product_slug text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_free_attempts_used integer;
  v_free_attempts_limit integer;
  v_access_granted boolean;
  v_result jsonb;
BEGIN
  -- Get product access info
  SELECT
    access_granted,
    free_attempts_used,
    free_attempts_limit
  INTO
    v_access_granted,
    v_free_attempts_used,
    v_free_attempts_limit
  FROM product_access
  WHERE user_id = p_user_id AND product_slug = p_product_slug;

  -- Build result
  v_result := jsonb_build_object(
    'canCreate', (v_free_attempts_used < v_free_attempts_limit),
    'attemptsUsed', COALESCE(v_free_attempts_used, 0),
    'attemptsLimit', COALESCE(v_free_attempts_limit, 2),
    'attemptsRemaining', COALESCE(v_free_attempts_limit, 2) - COALESCE(v_free_attempts_used, 0),
    'hasAccess', COALESCE(v_access_granted, false)
  );

  RETURN v_result;
END;
$$;

-- Update existing sessions to have version = 1
UPDATE product_sessions
SET version = 1, is_latest_version = true
WHERE version IS NULL;

-- Initialize free_attempts_used based on existing sessions
UPDATE product_access pa
SET free_attempts_used = (
  SELECT COUNT(*)
  FROM product_sessions ps
  WHERE ps.user_id = pa.user_id
    AND ps.product_slug = pa.product_slug
)
WHERE free_attempts_used = 0;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_session_version(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_session_versions(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_new_version(uuid, text) TO authenticated;

-- Comments
COMMENT ON COLUMN product_sessions.version IS 'Version number for this session (1, 2, 3, etc.)';
COMMENT ON COLUMN product_sessions.parent_session_id IS 'ID of the session this version was created from';
COMMENT ON COLUMN product_sessions.is_latest_version IS 'True if this is the current/active version';
COMMENT ON COLUMN product_access.free_attempts_used IS 'Number of free sessions user has created';
COMMENT ON COLUMN product_access.free_attempts_limit IS 'Maximum free sessions allowed (default 2)';
