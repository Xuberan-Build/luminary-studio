-- =====================================================
-- Unlimited Resets for Admin User
-- Give santos.93.aus@gmail.com unlimited product resets
-- Everyone else gets 2 resets (default)
-- =====================================================

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
  v_user_email text;
  v_is_admin boolean;
  v_result jsonb;
BEGIN
  -- Get user email to check if admin
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;

  -- Check if this is the admin user
  v_is_admin := (v_user_email = 'santos.93.aus@gmail.com');

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
    'canCreate',
      CASE
        WHEN v_is_admin THEN true  -- Admin always can create
        ELSE (v_free_attempts_used < v_free_attempts_limit)
      END,
    'attemptsUsed', COALESCE(v_free_attempts_used, 0),
    'attemptsLimit',
      CASE
        WHEN v_is_admin THEN 999999  -- Show high limit for admin
        ELSE COALESCE(v_free_attempts_limit, 2)
      END,
    'attemptsRemaining',
      CASE
        WHEN v_is_admin THEN 999999  -- Always show unlimited
        ELSE COALESCE(v_free_attempts_limit, 2) - COALESCE(v_free_attempts_used, 0)
      END,
    'hasAccess', COALESCE(v_access_granted, false),
    'isAdmin', v_is_admin
  );

  RETURN v_result;
END;
$$;

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '✅ Unlimited resets enabled for santos.93.aus@gmail.com';
  RAISE NOTICE '✅ Standard users limited to 2 resets per product';
END $$;
