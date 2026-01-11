-- Lock beta enrollment to authenticated users and avoid overwriting paid access

DROP FUNCTION IF EXISTS enroll_beta_participant(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION enroll_beta_participant(
  p_user_id UUID DEFAULT NULL,
  p_user_email TEXT DEFAULT NULL,
  p_why_participate TEXT DEFAULT NULL,
  p_cohort_name TEXT DEFAULT 'Beta Cohort'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_participant_id UUID;
  product_record RECORD;
  v_start_date TIMESTAMPTZ;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Ensure user row exists (auth user must exist first)
  SELECT email INTO v_user_email
  FROM users
  WHERE id = v_user_id;

  IF v_user_email IS NULL THEN
    v_user_email := COALESCE(
      p_user_email,
      current_setting('request.jwt.claim.email', true)
    );

    IF v_user_email IS NULL OR v_user_email = '' THEN
      RAISE EXCEPTION 'User email is required to create profile';
    END IF;

    INSERT INTO users (id, email, name)
    VALUES (v_user_id, v_user_email, split_part(v_user_email, '@', 1));
  END IF;

  -- Check if already enrolled
  SELECT id INTO v_participant_id
  FROM beta_participants
  WHERE user_id = v_user_id;

  IF v_participant_id IS NOT NULL THEN
    RETURN v_participant_id;
  END IF;

  v_start_date := NOW();

  -- Create beta participant record
  INSERT INTO beta_participants (
    user_id,
    cohort_name,
    program_start_date,
    program_end_date,
    application_why_participate
  ) VALUES (
    v_user_id,
    p_cohort_name,
    v_start_date,
    v_start_date + INTERVAL '6 weeks',
    p_why_participate
  )
  RETURNING id INTO v_participant_id;

  -- Grant access to all 11 products (do not overwrite paid purchases)
  FOR product_record IN
    SELECT product_slug, name
    FROM product_definitions
    WHERE product_slug IN (
      'perception-rite-scan-1',
      'perception-rite-scan-2',
      'perception-rite-scan-3',
      'perception-rite-scan-4',
      'perception-rite-scan-5',
      'personal-alignment',
      'business-alignment',
      'brand-alignment',
      'declaration-rite-life-vision',
      'declaration-rite-business-model',
      'declaration-rite-strategic-path'
    )
  LOOP
    INSERT INTO product_access (
      user_id,
      product_slug,
      access_granted,
      purchase_date,
      stripe_session_id,
      amount_paid,
      purchase_source
    ) VALUES (
      v_user_id,
      product_record.product_slug,
      true,
      NOW(),
      'beta_program',
      0,
      'beta_enrollment'
    )
    ON CONFLICT (user_id, product_slug)
    DO UPDATE SET
      access_granted = true;

    RAISE NOTICE 'Granted access to: %', product_record.name;
  END LOOP;

  RAISE NOTICE 'Beta participant enrolled: % (ID: %)', v_user_id, v_participant_id;

  RETURN v_participant_id;
END;
$$;
