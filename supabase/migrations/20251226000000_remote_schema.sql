


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."add_dinner_party_contribution"("p_contributor_id" "uuid", "p_transaction_id" "uuid", "p_amount_cents" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_pool_id UUID;
  v_new_total INTEGER;
  v_target_amount INTEGER;
BEGIN
  -- Get or create active pool
  SELECT id, current_amount_cents, target_amount_cents
  INTO v_pool_id, v_new_total, v_target_amount
  FROM dinner_party_pools
  WHERE status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no active pool exists, create one
  IF v_pool_id IS NULL THEN
    INSERT INTO dinner_party_pools (
      pool_name,
      target_amount_cents,
      status,
      description
    ) VALUES (
      'Dinner Party Pool ' || TO_CHAR(NOW(), 'YYYY-MM'),
      50000,
      'active',
      'Community dinner party fund'
    )
    RETURNING id INTO v_pool_id;

    v_new_total := 0;
    v_target_amount := 50000;
  END IF;

  -- Add contribution
  INSERT INTO dinner_party_contributions (
    pool_id,
    contributor_id,
    transaction_id,
    amount_cents,
    is_credit
  ) VALUES (
    v_pool_id,
    p_contributor_id,
    p_transaction_id,
    p_amount_cents,
    TRUE
  );

  -- Update pool total
  v_new_total := v_new_total + p_amount_cents;

  UPDATE dinner_party_pools
  SET
    current_amount_cents = v_new_total,
    updated_at = NOW()
  WHERE id = v_pool_id;

  -- Update user credits
  UPDATE users
  SET dinner_party_credits_cents = dinner_party_credits_cents + p_amount_cents
  WHERE id = p_contributor_id;

  -- Check if pool is now funded
  IF v_new_total >= v_target_amount THEN
    UPDATE dinner_party_pools
    SET
      status = 'funded',
      updated_at = NOW()
    WHERE id = v_pool_id;
  END IF;
END;
$$;


ALTER FUNCTION "public"."add_dinner_party_contribution"("p_contributor_id" "uuid", "p_transaction_id" "uuid", "p_amount_cents" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_old_audit_logs"("days_old" integer DEFAULT 90) RETURNS TABLE("archived_count" integer, "archived_date" "date")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
  deleted_count INTEGER;
BEGIN
  cutoff_date := NOW() - (days_old || ' days')::INTERVAL;

  -- In production, you would export to S3 here before deleting
  -- For now, just delete old success logs
  DELETE FROM audit_logs
  WHERE created_at < cutoff_date
    AND event_status = 'success'
    AND log_level NOT IN ('ERROR', 'WARN');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN QUERY SELECT deleted_count, cutoff_date::DATE;
END;
$$;


ALTER FUNCTION "public"."archive_old_audit_logs"("days_old" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_copy_placements_to_new_session"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
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
    END IF;

    RETURN NEW;
  END;
  $$;


ALTER FUNCTION "public"."auto_copy_placements_to_new_session"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_copy_placements_to_new_session"() IS 'Automatically copies placements from user''s previous sessions when creating a new product session';



CREATE OR REPLACE FUNCTION "public"."auto_enroll_affiliate"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_referral_code TEXT;
  v_base_url TEXT;
  v_opted_out BOOLEAN;
BEGIN
  -- Check if user has opted out of affiliate program
  SELECT affiliate_opted_out INTO v_opted_out
  FROM users
  WHERE id = NEW.user_id;

  -- Only auto-enroll if:
  -- 1. User doesn't already have a referral_hierarchy record
  -- 2. User has not explicitly opted out
  IF NOT EXISTS(SELECT 1 FROM referral_hierarchy WHERE affiliate_id = NEW.user_id)
     AND (v_opted_out IS NULL OR v_opted_out = FALSE) THEN

    -- Generate unique referral code
    v_referral_code := generate_referral_code();
    v_base_url := 'https://quantumstrategies.online';

    -- Create referral_hierarchy record
    INSERT INTO referral_hierarchy (
      affiliate_id,
      referral_code,
      referral_link,
      current_track,
      enrolled_at
    ) VALUES (
      NEW.user_id,
      v_referral_code,
      v_base_url || '?ref=' || v_referral_code,
      'community_builder',
      NOW()
    );

    -- Update users table to mark as affiliate
    UPDATE users
    SET
      is_affiliate = TRUE,
      affiliate_enrolled_at = NOW()
    WHERE id = NEW.user_id;

  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_enroll_affiliate"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_enroll_affiliate"() IS 'Auto-enrolls users as affiliates on first purchase, respecting opt-out preferences';



CREATE OR REPLACE FUNCTION "public"."auto_grant_test_access_on_new_product"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Get test user ID (FIXED: added .com)
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'santos.93.aus@gmail.com';

  -- If test user exists, grant access to new product
  IF test_user_id IS NOT NULL THEN
    INSERT INTO product_access (
      user_id,
      product_slug,
      access_granted,
      purchase_date,
      stripe_session_id,
      amount_paid
    ) VALUES (
      test_user_id,
      NEW.product_slug,
      true,
      NOW(),
      'test_account',
      0
    )
    ON CONFLICT (user_id, product_slug)
    DO UPDATE SET
      access_granted = true,
      purchase_date = NOW();

    RAISE NOTICE 'Auto-granted test access to new product: %', NEW.name;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_grant_test_access_on_new_product"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_commission"("p_amount_cents" integer, "p_track" "text", "p_is_direct" boolean) RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_percentage DECIMAL;
BEGIN
  -- Direct referrer commission
  IF p_is_direct THEN
    CASE p_track
      WHEN 'community_builder' THEN v_percentage := 0.30;
      WHEN 'high_performer' THEN v_percentage := 0.40;
      WHEN 'independent' THEN v_percentage := 0.60;
      ELSE v_percentage := 0;
    END CASE;
  ELSE
    -- Override commission (always 10% if eligible)
    v_percentage := 0.10;
  END IF;

  RETURN FLOOR(p_amount_cents * v_percentage);
END;
$$;


ALTER FUNCTION "public"."calculate_commission"("p_amount_cents" integer, "p_track" "text", "p_is_direct" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_dinner_party_contribution"("p_amount_cents" integer, "p_track" "text") RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_percentage DECIMAL;
BEGIN
  CASE p_track
    WHEN 'community_builder' THEN v_percentage := 0.40;
    WHEN 'high_performer' THEN v_percentage := 0.30;
    WHEN 'independent' THEN v_percentage := 0.00;
    ELSE v_percentage := 0;
  END CASE;

  RETURN FLOOR(p_amount_cents * v_percentage);
END;
$$;


ALTER FUNCTION "public"."calculate_dinner_party_contribution"("p_amount_cents" integer, "p_track" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_create_new_version"("p_user_id" "uuid", "p_product_slug" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."can_create_new_version"("p_user_id" "uuid", "p_product_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_audit_logs"() RETURNS TABLE("deleted_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  rows_deleted INTEGER;
BEGIN
  -- Only delete old success logs, keep errors longer
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND event_status = 'success';

  GET DIAGNOSTICS rows_deleted = ROW_COUNT;

  RETURN QUERY SELECT rows_deleted;
END;
$$;


ALTER FUNCTION "public"."cleanup_old_audit_logs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."copy_placements_between_sessions"("source_session_id" "uuid", "target_session_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."copy_placements_between_sessions"("source_session_id" "uuid", "target_session_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_session_version"("p_user_id" "uuid", "p_product_slug" "text", "p_parent_session_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."create_session_version"("p_user_id" "uuid", "p_product_slug" "text", "p_parent_session_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_referral_code"() RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code (uppercase)
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM referral_hierarchy WHERE referral_code = code) INTO code_exists;

    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN code;
END;
$$;


ALTER FUNCTION "public"."generate_referral_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_affiliate_stats"("p_affiliate_id" "uuid") RETURNS TABLE("referral_code" "text", "referral_link" "text", "current_track" "text", "total_earnings_cents" integer, "available_balance_cents" integer, "total_referrals" integer, "active_referrals" integer, "dinner_party_credits_cents" integer, "stripe_connect_onboarding_complete" boolean)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    rh.referral_code,
    rh.referral_link,
    rh.current_track,
    u.total_earnings_cents,
    u.available_balance_cents,
    rh.total_referrals,
    rh.active_referrals,
    u.dinner_party_credits_cents,
    rh.stripe_connect_onboarding_complete
  FROM users u
  LEFT JOIN referral_hierarchy rh ON rh.affiliate_id = u.id
  WHERE u.id = p_affiliate_id;
END;
$$;


ALTER FUNCTION "public"."get_affiliate_stats"("p_affiliate_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_session_versions"("p_user_id" "uuid", "p_product_slug" "text") RETURNS TABLE("session_id" "uuid", "version" integer, "is_complete" boolean, "completed_at" timestamp with time zone, "created_at" timestamp with time zone, "is_latest" boolean, "has_deliverable" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_session_versions"("p_user_id" "uuid", "p_product_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_slow_requests"("threshold_ms" integer DEFAULT 2000, "hours_ago" integer DEFAULT 24) RETURNS TABLE("user_email" "text", "event_action" "text", "duration_ms" integer, "request_path" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.user_email,
    al.event_action,
    al.duration_ms,
    al.request_path,
    al.created_at
  FROM audit_logs al
  WHERE al.duration_ms > threshold_ms
    AND al.created_at > NOW() - (hours_ago || ' hours')::INTERVAL
  ORDER BY al.duration_ms DESC
  LIMIT 100;
END;
$$;


ALTER FUNCTION "public"."get_slow_requests"("threshold_ms" integer, "hours_ago" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_activity_summary"("p_user_id" "uuid") RETURNS TABLE("event_type" "text", "total_events" bigint, "success_count" bigint, "error_count" bigint, "avg_duration_ms" numeric, "last_activity" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.event_type,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE al.event_status = 'success') as success_count,
    COUNT(*) FILTER (WHERE al.event_status = 'error') as error_count,
    AVG(al.duration_ms) as avg_duration_ms,
    MAX(al.created_at) as last_activity
  FROM audit_logs al
  WHERE al.user_id = p_user_id
  GROUP BY al.event_type
  ORDER BY total_events DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_activity_summary"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."grant_product_access"("p_email" "text", "p_product_slug" "text", "p_stripe_session_id" "text", "p_amount_paid" numeric) RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_id UUID;
  v_access_id UUID;
BEGIN
  -- Get or create user
  SELECT id INTO v_user_id FROM users WHERE email = p_email;

  IF v_user_id IS NULL THEN
    INSERT INTO users (email) VALUES (p_email) RETURNING id INTO v_user_id;
  END IF;

  -- Grant product access
  INSERT INTO product_access (
    user_id,
    product_slug,
    stripe_session_id,
    amount_paid
  ) VALUES (
    v_user_id,
    p_product_slug,
    p_stripe_session_id,
    p_amount_paid
  )
  ON CONFLICT (user_id, product_slug) DO UPDATE
    SET access_granted = TRUE,
        stripe_session_id = p_stripe_session_id,
        amount_paid = p_amount_paid
  RETURNING id INTO v_access_id;

  RETURN v_access_id;
END;
$$;


ALTER FUNCTION "public"."grant_product_access"("p_email" "text", "p_product_slug" "text", "p_stripe_session_id" "text", "p_amount_paid" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."grant_test_account_access"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  test_user_id uuid;
  product_record RECORD;
BEGIN
  -- Get test user ID by email
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'santos.93.aus@gmail.com';

  -- If test user doesn't exist, exit
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'Test account not found: santos.93.aus@gmail.com';
    RETURN;
  END IF;

  -- Loop through all products and grant access
  FOR product_record IN
    SELECT product_slug, name, price
    FROM product_definitions
    ORDER BY created_at
  LOOP
    -- Insert or update product access
    INSERT INTO product_access (
      user_id,
      product_slug,
      access_granted,
      purchase_date,
      stripe_session_id,
      amount_paid
    ) VALUES (
      test_user_id,
      product_record.product_slug,
      true,
      NOW(),
      'test_account',
      0
    )
    ON CONFLICT (user_id, product_slug)
    DO UPDATE SET
      access_granted = true,
      purchase_date = NOW(),
      stripe_session_id = 'test_account';

    RAISE NOTICE 'Granted access to: %', product_record.name;
  END LOOP;

  RAISE NOTICE 'Test account access granted for all products';
END;
$$;


ALTER FUNCTION "public"."grant_test_account_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_affiliate_earnings"("p_affiliate_id" "uuid", "p_amount_cents" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE users
  SET
    total_earnings_cents = total_earnings_cents + p_amount_cents,
    available_balance_cents = available_balance_cents + p_amount_cents
  WHERE id = p_affiliate_id;
END;
$$;


ALTER FUNCTION "public"."increment_affiliate_earnings"("p_affiliate_id" "uuid", "p_amount_cents" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_referral_count"("p_referrer_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE referral_hierarchy
  SET
    total_referrals = total_referrals + 1,
    active_referrals = active_referrals + 1,
    updated_at = NOW()
  WHERE affiliate_id = p_referrer_id;
END;
$$;


ALTER FUNCTION "public"."increment_referral_count"("p_referrer_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_affiliate_enrollment"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_email_value TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email_value
  FROM users
  WHERE id = NEW.affiliate_id;

  INSERT INTO audit_logs (
    user_id,
    user_email,
    event_type,
    event_action,
    event_status,
    metadata
  ) VALUES (
    NEW.affiliate_id,
    user_email_value,
    'affiliate',
    'enrolled',
    'success',
    jsonb_build_object(
      'referral_code', NEW.referral_code,
      'referred_by_id', NEW.referred_by_id,
      'current_track', NEW.current_track
    )
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_affiliate_enrollment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_product_access_grant"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    event_type,
    event_action,
    event_status,
    metadata
  ) VALUES (
    NEW.user_id,
    'product',
    'access_granted',
    'success',
    jsonb_build_object(
      'product_slug', NEW.product_slug,
      'granted_at', NEW.granted_at
    )
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_product_access_grant"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_user_creation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    user_email,
    event_type,
    event_action,
    event_status,
    metadata
  ) VALUES (
    NEW.id,
    NEW.email,
    'system',
    'user_created',
    'success',
    jsonb_build_object(
      'email', NEW.email,
      'name', NEW.name
    )
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_user_creation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_critical_error"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only notify on critical errors
  IF NEW.event_status = 'error' AND (
    NEW.event_type = 'payment' OR
    NEW.event_action LIKE '%stripe%' OR
    NEW.log_level = 'ERROR'
  ) THEN
    PERFORM pg_notify(
      'critical_error',
      json_build_object(
        'user_email', NEW.user_email,
        'event_type', NEW.event_type,
        'event_action', NEW.event_action,
        'error_message', NEW.error_message,
        'created_at', NEW.created_at
      )::text
    );
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_critical_error"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."redact_user_logs"("p_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  redacted_count INTEGER;
BEGIN
  -- Instead of deleting, redact personal data
  UPDATE audit_logs
  SET
    user_email = NULL,
    user_email_hash = NULL,
    ip_address = NULL,
    user_agent = NULL,
    request_body = NULL,
    response_body = NULL,
    metadata = jsonb_build_object(
      'redacted', true,
      'redacted_at', NOW()
    )
  WHERE user_id = p_user_id
    AND event_status = 'success'; -- Keep error logs for debugging

  GET DIAGNOSTICS redacted_count = ROW_COUNT;
  RETURN redacted_count;
END;
$$;


ALTER FUNCTION "public"."redact_user_logs"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_audit_error_summary"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY audit_error_summary;
END;
$$;


ALTER FUNCTION "public"."refresh_audit_error_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_session_progress"("p_session_id" "uuid", "p_current_step" integer, "p_total_steps" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_percentage INTEGER;
BEGIN
  -- Calculate completion percentage
  v_percentage := ROUND((p_current_step::DECIMAL / p_total_steps) * 100);

  -- Update session
  UPDATE product_sessions
  SET
    current_step = p_current_step,
    completion_percentage = v_percentage,
    last_activity_at = NOW()
  WHERE id = p_session_id;

  -- Update product_access completion percentage
  UPDATE product_access
  SET completion_percentage = v_percentage
  WHERE user_id = (SELECT user_id FROM product_sessions WHERE id = p_session_id)
    AND product_slug = (SELECT product_slug FROM product_sessions WHERE id = p_session_id);
END;
$$;


ALTER FUNCTION "public"."update_session_progress"("p_session_id" "uuid", "p_current_step" integer, "p_total_steps" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."affiliate_transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "purchaser_id" "uuid" NOT NULL,
    "product_slug" "text" NOT NULL,
    "stripe_session_id" "text" NOT NULL,
    "stripe_payment_intent_id" "text",
    "amount_cents" integer NOT NULL,
    "direct_referrer_id" "uuid",
    "override_referrer_id" "uuid",
    "direct_commission_cents" integer DEFAULT 0,
    "override_commission_cents" integer DEFAULT 0,
    "direct_track" "text",
    "override_track" "text",
    "direct_transfer_id" "text",
    "override_transfer_id" "text",
    "dinner_party_contribution_cents" integer DEFAULT 0,
    "commission_status" "text" DEFAULT 'pending'::"text",
    "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_commission_status" CHECK (("commission_status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'paid'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."affiliate_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "user_email" "text",
    "session_id" "text",
    "event_type" "text" NOT NULL,
    "event_action" "text" NOT NULL,
    "event_status" "text" NOT NULL,
    "ip_address" "text",
    "user_agent" "text",
    "request_method" "text",
    "request_path" "text",
    "request_body" "jsonb",
    "response_status" integer,
    "response_body" "jsonb",
    "error_message" "text",
    "error_stack" "text",
    "error_code" "text",
    "metadata" "jsonb",
    "duration_ms" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_email_hash" "text",
    "trace_id" "uuid",
    "log_level" "text" DEFAULT 'INFO'::"text",
    "is_sampled" boolean DEFAULT false
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."audit_error_summary" AS
 SELECT "event_type",
    "event_action",
    "error_code",
    "count"(*) AS "error_count",
    "count"(DISTINCT "user_id") AS "affected_users",
    "max"("created_at") AS "last_occurrence"
   FROM "public"."audit_logs"
  WHERE (("event_status" = 'error'::"text") AND ("created_at" > ("now"() - '24:00:00'::interval)))
  GROUP BY "event_type", "event_action", "error_code"
  ORDER BY ("count"(*)) DESC
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."audit_error_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "step_number" integer NOT NULL,
    "messages" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "follow_up_count" integer DEFAULT 0,
    "max_follow_ups" integer DEFAULT 3,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


COMMENT ON TABLE "public"."conversations" IS 'AI conversation history per step';



CREATE TABLE IF NOT EXISTS "public"."dinner_party_contributions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "pool_id" "uuid" NOT NULL,
    "contributor_id" "uuid" NOT NULL,
    "transaction_id" "uuid",
    "amount_cents" integer NOT NULL,
    "is_credit" boolean DEFAULT true,
    "redeemed" boolean DEFAULT false,
    "redeemed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."dinner_party_contributions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dinner_party_pools" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "pool_name" "text" NOT NULL,
    "target_amount_cents" integer DEFAULT 50000 NOT NULL,
    "current_amount_cents" integer DEFAULT 0,
    "status" "text" DEFAULT 'active'::"text",
    "event_date" timestamp with time zone,
    "location" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_pool_status" CHECK (("status" = ANY (ARRAY['active'::"text", 'funded'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."dinner_party_pools" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."error_logs" AS
 SELECT "id",
    "user_id",
    "user_email",
    "event_type",
    "event_action",
    "error_message",
    "error_stack",
    "error_code",
    "request_path",
    "metadata",
    "created_at"
   FROM "public"."audit_logs"
  WHERE ("event_status" = 'error'::"text")
  ORDER BY "created_at" DESC;


ALTER VIEW "public"."error_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_access" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_slug" "text" NOT NULL,
    "purchase_date" timestamp with time zone DEFAULT "now"(),
    "stripe_session_id" "text",
    "amount_paid" numeric(10,2),
    "access_granted" boolean DEFAULT true,
    "expires_at" timestamp with time zone,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "completion_percentage" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "free_attempts_used" integer DEFAULT 0,
    "free_attempts_limit" integer DEFAULT 2
);


ALTER TABLE "public"."product_access" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_access" IS 'Tracks which products each user has purchased';



COMMENT ON COLUMN "public"."product_access"."free_attempts_used" IS 'Number of free sessions user has created';



COMMENT ON COLUMN "public"."product_access"."free_attempts_limit" IS 'Maximum free sessions allowed (default 2)';



CREATE TABLE IF NOT EXISTS "public"."product_definitions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2),
    "steps" "jsonb" NOT NULL,
    "system_prompt" "text" NOT NULL,
    "final_deliverable_prompt" "text" NOT NULL,
    "model" "text" DEFAULT 'gpt-4'::"text",
    "estimated_duration" "text",
    "total_steps" integer NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "instructions" "jsonb"
);


ALTER TABLE "public"."product_definitions" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_definitions" IS 'Product configurations and prompt engineering';



COMMENT ON COLUMN "public"."product_definitions"."instructions" IS 'Instructional experience configuration with welcome, processing, transitions, and deliverable messages';



CREATE TABLE IF NOT EXISTS "public"."product_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_slug" "text" NOT NULL,
    "current_step" integer DEFAULT 1,
    "total_steps" integer NOT NULL,
    "is_complete" boolean DEFAULT false,
    "step_data" "jsonb" DEFAULT '{}'::"jsonb",
    "deliverable_content" "text",
    "deliverable_url" "text",
    "deliverable_generated_at" timestamp with time zone,
    "started_at" timestamp with time zone DEFAULT "now"(),
    "last_activity_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "placements" "jsonb",
    "placements_confirmed" boolean DEFAULT false NOT NULL,
    "current_section" integer DEFAULT 1 NOT NULL,
    "followup_counts" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "version" integer DEFAULT 1,
    "parent_session_id" "uuid",
    "is_latest_version" boolean DEFAULT true
);


ALTER TABLE "public"."product_sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_sessions" IS 'User progress through product experiences';



COMMENT ON COLUMN "public"."product_sessions"."version" IS 'Version number for this session (1, 2, 3, etc.)';



COMMENT ON COLUMN "public"."product_sessions"."parent_session_id" IS 'ID of the session this version was created from';



COMMENT ON COLUMN "public"."product_sessions"."is_latest_version" IS 'True if this is the current/active version';



CREATE TABLE IF NOT EXISTS "public"."product_steps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "text" NOT NULL,
    "step_number" integer NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_steps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prompts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_slug" "text" NOT NULL,
    "scope" "text" NOT NULL,
    "step_number" integer,
    "prompt" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."prompts" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."recent_user_activity" AS
 SELECT "user_id",
    "user_email" AS "email",
    "event_type",
    "event_action",
    "event_status",
    "created_at"
   FROM "public"."audit_logs"
  WHERE ("created_at" > ("now"() - '7 days'::interval))
  ORDER BY "created_at" DESC;


ALTER VIEW "public"."recent_user_activity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."referral_hierarchy" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "affiliate_id" "uuid" NOT NULL,
    "referred_by_id" "uuid",
    "referral_code" "text" NOT NULL,
    "referral_link" "text" NOT NULL,
    "current_track" "text" DEFAULT 'community_builder'::"text" NOT NULL,
    "stripe_connect_account_id" "text",
    "stripe_connect_onboarding_complete" boolean DEFAULT false,
    "stripe_connect_charges_enabled" boolean DEFAULT false,
    "stripe_connect_payouts_enabled" boolean DEFAULT false,
    "total_referrals" integer DEFAULT 0,
    "active_referrals" integer DEFAULT 0,
    "enrolled_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_track" CHECK (("current_track" = ANY (ARRAY['community_builder'::"text", 'high_performer'::"text", 'independent'::"text"])))
);


ALTER TABLE "public"."referral_hierarchy" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stripe_connect_onboarding" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "affiliate_id" "uuid" NOT NULL,
    "stripe_account_id" "text" NOT NULL,
    "onboarding_url" "text",
    "onboarding_expires_at" timestamp with time zone,
    "details_submitted" boolean DEFAULT false,
    "charges_enabled" boolean DEFAULT false,
    "payouts_enabled" boolean DEFAULT false,
    "requirements" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."stripe_connect_onboarding" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."track_changes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "affiliate_id" "uuid" NOT NULL,
    "previous_track" "text" NOT NULL,
    "new_track" "text" NOT NULL,
    "reason" "text",
    "changed_by_user_id" "uuid",
    "change_type" "text" DEFAULT 'manual'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_new_track" CHECK (("new_track" = ANY (ARRAY['community_builder'::"text", 'high_performer'::"text", 'independent'::"text"]))),
    CONSTRAINT "valid_previous_track" CHECK (("previous_track" = ANY (ARRAY['community_builder'::"text", 'high_performer'::"text", 'independent'::"text"])))
);


ALTER TABLE "public"."track_changes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."uploaded_documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_id" "uuid" NOT NULL,
    "step_number" integer,
    "file_name" "text" NOT NULL,
    "file_type" "text",
    "file_size" integer,
    "storage_path" "text" NOT NULL,
    "processed" boolean DEFAULT false,
    "extracted_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."uploaded_documents" OWNER TO "postgres";


COMMENT ON TABLE "public"."uploaded_documents" IS 'Files uploaded during product experience';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "stripe_customer_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_affiliate" boolean DEFAULT false,
    "affiliate_enrolled_at" timestamp with time zone,
    "total_earnings_cents" integer DEFAULT 0,
    "available_balance_cents" integer DEFAULT 0,
    "total_withdrawn_cents" integer DEFAULT 0,
    "dinner_party_credits_cents" integer DEFAULT 0,
    "affiliate_opted_out" boolean DEFAULT false,
    "first_affiliate_visit" timestamp with time zone
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'User accounts - linked to Supabase Auth';



COMMENT ON COLUMN "public"."users"."affiliate_opted_out" IS 'True if user explicitly declined to join affiliate program';



COMMENT ON COLUMN "public"."users"."first_affiliate_visit" IS 'Timestamp of first visit to affiliate section';



ALTER TABLE ONLY "public"."affiliate_transactions"
    ADD CONSTRAINT "affiliate_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_session_id_step_number_key" UNIQUE ("session_id", "step_number");



ALTER TABLE ONLY "public"."dinner_party_contributions"
    ADD CONSTRAINT "dinner_party_contributions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dinner_party_pools"
    ADD CONSTRAINT "dinner_party_pools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_access"
    ADD CONSTRAINT "product_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_access"
    ADD CONSTRAINT "product_access_user_id_product_slug_key" UNIQUE ("user_id", "product_slug");



ALTER TABLE ONLY "public"."product_definitions"
    ADD CONSTRAINT "product_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_definitions"
    ADD CONSTRAINT "product_definitions_product_slug_key" UNIQUE ("product_slug");



ALTER TABLE ONLY "public"."product_sessions"
    ADD CONSTRAINT "product_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_steps"
    ADD CONSTRAINT "product_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_steps"
    ADD CONSTRAINT "product_steps_product_id_step_number_key" UNIQUE ("product_id", "step_number");



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prompts"
    ADD CONSTRAINT "prompts_product_slug_scope_step_number_key" UNIQUE ("product_slug", "scope", "step_number");



ALTER TABLE ONLY "public"."referral_hierarchy"
    ADD CONSTRAINT "referral_hierarchy_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referral_hierarchy"
    ADD CONSTRAINT "referral_hierarchy_referral_code_key" UNIQUE ("referral_code");



ALTER TABLE ONLY "public"."stripe_connect_onboarding"
    ADD CONSTRAINT "stripe_connect_onboarding_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."track_changes"
    ADD CONSTRAINT "track_changes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referral_hierarchy"
    ADD CONSTRAINT "unique_affiliate" UNIQUE ("affiliate_id");



ALTER TABLE ONLY "public"."stripe_connect_onboarding"
    ADD CONSTRAINT "unique_affiliate_onboarding" UNIQUE ("affiliate_id");



ALTER TABLE ONLY "public"."uploaded_documents"
    ADD CONSTRAINT "uploaded_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_affiliate_transactions_created" ON "public"."affiliate_transactions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_affiliate_transactions_direct_referrer" ON "public"."affiliate_transactions" USING "btree" ("direct_referrer_id");



CREATE INDEX "idx_affiliate_transactions_override_referrer" ON "public"."affiliate_transactions" USING "btree" ("override_referrer_id");



CREATE INDEX "idx_affiliate_transactions_purchaser" ON "public"."affiliate_transactions" USING "btree" ("purchaser_id");



CREATE INDEX "idx_affiliate_transactions_session" ON "public"."affiliate_transactions" USING "btree" ("stripe_session_id");



CREATE INDEX "idx_affiliate_transactions_status" ON "public"."affiliate_transactions" USING "btree" ("commission_status");



CREATE UNIQUE INDEX "idx_audit_error_summary_unique" ON "public"."audit_error_summary" USING "btree" ("event_type", "event_action", COALESCE("error_code", ''::"text"));



CREATE INDEX "idx_audit_logs_created_at" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_logs_email_hash" ON "public"."audit_logs" USING "btree" ("user_email_hash");



CREATE INDEX "idx_audit_logs_event_status" ON "public"."audit_logs" USING "btree" ("event_status");



CREATE INDEX "idx_audit_logs_event_type" ON "public"."audit_logs" USING "btree" ("event_type");



CREATE INDEX "idx_audit_logs_event_type_status" ON "public"."audit_logs" USING "btree" ("event_type", "event_status");



CREATE INDEX "idx_audit_logs_log_level" ON "public"."audit_logs" USING "btree" ("log_level");



CREATE INDEX "idx_audit_logs_trace_id" ON "public"."audit_logs" USING "btree" ("trace_id");



CREATE INDEX "idx_audit_logs_user_email" ON "public"."audit_logs" USING "btree" ("user_email");



CREATE INDEX "idx_audit_logs_user_id" ON "public"."audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_conversations_session_id" ON "public"."conversations" USING "btree" ("session_id");



CREATE INDEX "idx_conversations_step" ON "public"."conversations" USING "btree" ("session_id", "step_number");



CREATE INDEX "idx_dinner_party_contributions_contributor" ON "public"."dinner_party_contributions" USING "btree" ("contributor_id");



CREATE INDEX "idx_dinner_party_contributions_pool" ON "public"."dinner_party_contributions" USING "btree" ("pool_id");



CREATE INDEX "idx_dinner_party_contributions_transaction" ON "public"."dinner_party_contributions" USING "btree" ("transaction_id");



CREATE INDEX "idx_dinner_party_pools_status" ON "public"."dinner_party_pools" USING "btree" ("status");



CREATE INDEX "idx_product_access_product_slug" ON "public"."product_access" USING "btree" ("product_slug");



CREATE INDEX "idx_product_access_stripe_session" ON "public"."product_access" USING "btree" ("stripe_session_id");



CREATE INDEX "idx_product_access_user_id" ON "public"."product_access" USING "btree" ("user_id");



CREATE INDEX "idx_product_definitions_active" ON "public"."product_definitions" USING "btree" ("is_active");



CREATE INDEX "idx_product_definitions_slug" ON "public"."product_definitions" USING "btree" ("product_slug");



CREATE INDEX "idx_product_sessions_complete" ON "public"."product_sessions" USING "btree" ("is_complete");



CREATE INDEX "idx_product_sessions_current_section" ON "public"."product_sessions" USING "btree" ("current_section");



CREATE INDEX "idx_product_sessions_placements_confirmed" ON "public"."product_sessions" USING "btree" ("placements_confirmed");



CREATE INDEX "idx_product_sessions_product_slug" ON "public"."product_sessions" USING "btree" ("product_slug");



CREATE INDEX "idx_product_sessions_user_id" ON "public"."product_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_prompts_lookup" ON "public"."prompts" USING "btree" ("product_slug", "scope", "step_number");



CREATE INDEX "idx_referral_hierarchy_affiliate" ON "public"."referral_hierarchy" USING "btree" ("affiliate_id");



CREATE INDEX "idx_referral_hierarchy_code" ON "public"."referral_hierarchy" USING "btree" ("referral_code");



CREATE INDEX "idx_referral_hierarchy_referred_by" ON "public"."referral_hierarchy" USING "btree" ("referred_by_id");



CREATE INDEX "idx_referral_hierarchy_stripe_account" ON "public"."referral_hierarchy" USING "btree" ("stripe_connect_account_id");



CREATE INDEX "idx_sessions_parent" ON "public"."product_sessions" USING "btree" ("parent_session_id");



CREATE INDEX "idx_sessions_user_product_version" ON "public"."product_sessions" USING "btree" ("user_id", "product_slug", "version" DESC);



CREATE INDEX "idx_stripe_connect_onboarding_account" ON "public"."stripe_connect_onboarding" USING "btree" ("stripe_account_id");



CREATE INDEX "idx_stripe_connect_onboarding_affiliate" ON "public"."stripe_connect_onboarding" USING "btree" ("affiliate_id");



CREATE INDEX "idx_track_changes_affiliate" ON "public"."track_changes" USING "btree" ("affiliate_id");



CREATE INDEX "idx_track_changes_created" ON "public"."track_changes" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_uploaded_documents_session_id" ON "public"."uploaded_documents" USING "btree" ("session_id");



CREATE INDEX "idx_uploaded_documents_user_id" ON "public"."uploaded_documents" USING "btree" ("user_id");



CREATE INDEX "idx_users_affiliate_opted_out" ON "public"."users" USING "btree" ("affiliate_opted_out") WHERE ("affiliate_opted_out" = true);



CREATE INDEX "idx_users_earnings" ON "public"."users" USING "btree" ("total_earnings_cents" DESC);



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_first_affiliate_visit" ON "public"."users" USING "btree" ("first_affiliate_visit");



CREATE INDEX "idx_users_is_affiliate" ON "public"."users" USING "btree" ("is_affiliate");



CREATE INDEX "idx_users_stripe_customer_id" ON "public"."users" USING "btree" ("stripe_customer_id");



CREATE OR REPLACE TRIGGER "auto_copy_placements_trigger" BEFORE INSERT ON "public"."product_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."auto_copy_placements_to_new_session"();



CREATE OR REPLACE TRIGGER "auto_grant_test_access_trigger" AFTER INSERT ON "public"."product_definitions" FOR EACH ROW EXECUTE FUNCTION "public"."auto_grant_test_access_on_new_product"();



CREATE OR REPLACE TRIGGER "trigger_auto_enroll_affiliate" AFTER INSERT ON "public"."product_access" FOR EACH ROW EXECUTE FUNCTION "public"."auto_enroll_affiliate"();



CREATE OR REPLACE TRIGGER "trigger_log_affiliate_enrollment" AFTER INSERT ON "public"."referral_hierarchy" FOR EACH ROW EXECUTE FUNCTION "public"."log_affiliate_enrollment"();



CREATE OR REPLACE TRIGGER "trigger_log_product_access" AFTER INSERT ON "public"."product_access" FOR EACH ROW EXECUTE FUNCTION "public"."log_product_access_grant"();



CREATE OR REPLACE TRIGGER "trigger_log_user_creation" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."log_user_creation"();



CREATE OR REPLACE TRIGGER "trigger_notify_critical_error" AFTER INSERT ON "public"."audit_logs" FOR EACH ROW EXECUTE FUNCTION "public"."notify_critical_error"();



CREATE OR REPLACE TRIGGER "update_conversations_updated_at" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_product_definitions_updated_at" BEFORE UPDATE ON "public"."product_definitions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_product_sessions_updated_at" BEFORE UPDATE ON "public"."product_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."affiliate_transactions"
    ADD CONSTRAINT "affiliate_transactions_direct_referrer_id_fkey" FOREIGN KEY ("direct_referrer_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."affiliate_transactions"
    ADD CONSTRAINT "affiliate_transactions_override_referrer_id_fkey" FOREIGN KEY ("override_referrer_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."affiliate_transactions"
    ADD CONSTRAINT "affiliate_transactions_purchaser_id_fkey" FOREIGN KEY ("purchaser_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."product_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dinner_party_contributions"
    ADD CONSTRAINT "dinner_party_contributions_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dinner_party_contributions"
    ADD CONSTRAINT "dinner_party_contributions_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "public"."dinner_party_pools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dinner_party_contributions"
    ADD CONSTRAINT "dinner_party_contributions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."affiliate_transactions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_access"
    ADD CONSTRAINT "product_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_sessions"
    ADD CONSTRAINT "product_sessions_parent_session_id_fkey" FOREIGN KEY ("parent_session_id") REFERENCES "public"."product_sessions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_sessions"
    ADD CONSTRAINT "product_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referral_hierarchy"
    ADD CONSTRAINT "referral_hierarchy_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referral_hierarchy"
    ADD CONSTRAINT "referral_hierarchy_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stripe_connect_onboarding"
    ADD CONSTRAINT "stripe_connect_onboarding_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."track_changes"
    ADD CONSTRAINT "track_changes_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."track_changes"
    ADD CONSTRAINT "track_changes_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."uploaded_documents"
    ADD CONSTRAINT "uploaded_documents_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."product_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."uploaded_documents"
    ADD CONSTRAINT "uploaded_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow authenticated insert" ON "public"."uploaded_documents" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated select" ON "public"."uploaded_documents" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anonymous users can read product steps" ON "public"."product_steps" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anonymous users can read prompts" ON "public"."prompts" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anyone can read active products" ON "public"."product_definitions" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Authenticated users can read product steps" ON "public"."product_steps" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read prompts" ON "public"."prompts" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view pools" ON "public"."dinner_party_pools" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Service role can manage affiliate transactions" ON "public"."affiliate_transactions" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage contributions" ON "public"."dinner_party_contributions" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage conversations" ON "public"."conversations" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage dinner party pools" ON "public"."dinner_party_pools" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage onboarding" ON "public"."stripe_connect_onboarding" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage product access" ON "public"."product_access" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage products" ON "public"."product_definitions" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage referral hierarchy" ON "public"."referral_hierarchy" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage sessions" ON "public"."product_sessions" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage track changes" ON "public"."track_changes" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage uploads" ON "public"."uploaded_documents" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role has full access to product steps" ON "public"."product_steps" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role has full access to prompts" ON "public"."prompts" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role has full access to users" ON "public"."users" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Users can create conversations for own sessions" ON "public"."conversations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."product_sessions"
  WHERE (("product_sessions"."id" = "conversations"."session_id") AND (("product_sessions"."user_id")::"text" = ("auth"."uid"())::"text")))));



CREATE POLICY "Users can create sessions for owned products" ON "public"."product_sessions" FOR INSERT WITH CHECK (((("auth"."uid"())::"text" = ("user_id")::"text") AND (EXISTS ( SELECT 1
   FROM "public"."product_access"
  WHERE (("product_access"."user_id" = "product_sessions"."user_id") AND ("product_access"."product_slug" = "product_sessions"."product_slug") AND ("product_access"."access_granted" = true))))));



CREATE POLICY "Users can delete own uploads" ON "public"."uploaded_documents" FOR DELETE USING ((("auth"."uid"())::"text" = ("user_id")::"text"));



CREATE POLICY "Users can update own conversations" ON "public"."conversations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."product_sessions"
  WHERE (("product_sessions"."id" = "conversations"."session_id") AND (("product_sessions"."user_id")::"text" = ("auth"."uid"())::"text")))));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING ((("auth"."uid"())::"text" = ("id")::"text"));



CREATE POLICY "Users can update own sessions" ON "public"."product_sessions" FOR UPDATE USING ((("auth"."uid"())::"text" = ("user_id")::"text"));



CREATE POLICY "Users can update own track" ON "public"."referral_hierarchy" FOR UPDATE USING (("auth"."uid"() = "affiliate_id")) WITH CHECK (("auth"."uid"() = "affiliate_id"));



CREATE POLICY "Users can upload for own sessions" ON "public"."uploaded_documents" FOR INSERT WITH CHECK (((("auth"."uid"())::"text" = ("user_id")::"text") AND (EXISTS ( SELECT 1
   FROM "public"."product_sessions"
  WHERE (("product_sessions"."id" = "uploaded_documents"."session_id") AND (("product_sessions"."user_id")::"text" = ("auth"."uid"())::"text"))))));



CREATE POLICY "Users can view own affiliate transactions" ON "public"."affiliate_transactions" FOR SELECT USING ((("auth"."uid"() = "purchaser_id") OR ("auth"."uid"() = "direct_referrer_id") OR ("auth"."uid"() = "override_referrer_id")));



CREATE POLICY "Users can view own contributions" ON "public"."dinner_party_contributions" FOR SELECT USING (("auth"."uid"() = "contributor_id"));



CREATE POLICY "Users can view own conversations" ON "public"."conversations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."product_sessions"
  WHERE (("product_sessions"."id" = "conversations"."session_id") AND (("product_sessions"."user_id")::"text" = ("auth"."uid"())::"text")))));



CREATE POLICY "Users can view own onboarding" ON "public"."stripe_connect_onboarding" FOR SELECT USING (("auth"."uid"() = "affiliate_id"));



CREATE POLICY "Users can view own product access" ON "public"."product_access" FOR SELECT USING ((("auth"."uid"())::"text" = ("user_id")::"text"));



CREATE POLICY "Users can view own profile" ON "public"."users" FOR SELECT USING ((("auth"."uid"())::"text" = ("id")::"text"));



CREATE POLICY "Users can view own referral hierarchy" ON "public"."referral_hierarchy" FOR SELECT USING (("auth"."uid"() = "affiliate_id"));



CREATE POLICY "Users can view own sessions" ON "public"."product_sessions" FOR SELECT USING ((("auth"."uid"())::"text" = ("user_id")::"text"));



CREATE POLICY "Users can view own track changes" ON "public"."track_changes" FOR SELECT USING (("auth"."uid"() = "affiliate_id"));



CREATE POLICY "Users can view own uploads" ON "public"."uploaded_documents" FOR SELECT USING ((("auth"."uid"())::"text" = ("user_id")::"text"));



ALTER TABLE "public"."affiliate_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dinner_party_contributions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dinner_party_pools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_access" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_steps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prompts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referral_hierarchy" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stripe_connect_onboarding" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."track_changes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."uploaded_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."add_dinner_party_contribution"("p_contributor_id" "uuid", "p_transaction_id" "uuid", "p_amount_cents" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."add_dinner_party_contribution"("p_contributor_id" "uuid", "p_transaction_id" "uuid", "p_amount_cents" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_dinner_party_contribution"("p_contributor_id" "uuid", "p_transaction_id" "uuid", "p_amount_cents" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_old_audit_logs"("days_old" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."archive_old_audit_logs"("days_old" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_old_audit_logs"("days_old" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_copy_placements_to_new_session"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_copy_placements_to_new_session"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_copy_placements_to_new_session"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_enroll_affiliate"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_enroll_affiliate"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_enroll_affiliate"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_grant_test_access_on_new_product"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_grant_test_access_on_new_product"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_grant_test_access_on_new_product"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_commission"("p_amount_cents" integer, "p_track" "text", "p_is_direct" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_commission"("p_amount_cents" integer, "p_track" "text", "p_is_direct" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_commission"("p_amount_cents" integer, "p_track" "text", "p_is_direct" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_dinner_party_contribution"("p_amount_cents" integer, "p_track" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_dinner_party_contribution"("p_amount_cents" integer, "p_track" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_dinner_party_contribution"("p_amount_cents" integer, "p_track" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_create_new_version"("p_user_id" "uuid", "p_product_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_new_version"("p_user_id" "uuid", "p_product_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_new_version"("p_user_id" "uuid", "p_product_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_audit_logs"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_audit_logs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_audit_logs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."copy_placements_between_sessions"("source_session_id" "uuid", "target_session_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."copy_placements_between_sessions"("source_session_id" "uuid", "target_session_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."copy_placements_between_sessions"("source_session_id" "uuid", "target_session_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_session_version"("p_user_id" "uuid", "p_product_slug" "text", "p_parent_session_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_session_version"("p_user_id" "uuid", "p_product_slug" "text", "p_parent_session_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_session_version"("p_user_id" "uuid", "p_product_slug" "text", "p_parent_session_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_referral_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_affiliate_stats"("p_affiliate_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_affiliate_stats"("p_affiliate_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_affiliate_stats"("p_affiliate_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_session_versions"("p_user_id" "uuid", "p_product_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_session_versions"("p_user_id" "uuid", "p_product_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_session_versions"("p_user_id" "uuid", "p_product_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_slow_requests"("threshold_ms" integer, "hours_ago" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_slow_requests"("threshold_ms" integer, "hours_ago" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_slow_requests"("threshold_ms" integer, "hours_ago" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_activity_summary"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_activity_summary"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_activity_summary"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."grant_product_access"("p_email" "text", "p_product_slug" "text", "p_stripe_session_id" "text", "p_amount_paid" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."grant_product_access"("p_email" "text", "p_product_slug" "text", "p_stripe_session_id" "text", "p_amount_paid" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."grant_product_access"("p_email" "text", "p_product_slug" "text", "p_stripe_session_id" "text", "p_amount_paid" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."grant_test_account_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."grant_test_account_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."grant_test_account_access"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_affiliate_earnings"("p_affiliate_id" "uuid", "p_amount_cents" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_affiliate_earnings"("p_affiliate_id" "uuid", "p_amount_cents" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_affiliate_earnings"("p_affiliate_id" "uuid", "p_amount_cents" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_referral_count"("p_referrer_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_referral_count"("p_referrer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_referral_count"("p_referrer_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_affiliate_enrollment"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_affiliate_enrollment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_affiliate_enrollment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_product_access_grant"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_product_access_grant"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_product_access_grant"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_user_creation"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_user_creation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_user_creation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_critical_error"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_critical_error"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_critical_error"() TO "service_role";



GRANT ALL ON FUNCTION "public"."redact_user_logs"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."redact_user_logs"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."redact_user_logs"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_audit_error_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_audit_error_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_audit_error_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_session_progress"("p_session_id" "uuid", "p_current_step" integer, "p_total_steps" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_session_progress"("p_session_id" "uuid", "p_current_step" integer, "p_total_steps" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_session_progress"("p_session_id" "uuid", "p_current_step" integer, "p_total_steps" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."affiliate_transactions" TO "anon";
GRANT ALL ON TABLE "public"."affiliate_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."affiliate_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";
GRANT SELECT,INSERT ON TABLE "public"."audit_logs" TO PUBLIC;



GRANT ALL ON TABLE "public"."audit_error_summary" TO "anon";
GRANT ALL ON TABLE "public"."audit_error_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_error_summary" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."dinner_party_contributions" TO "anon";
GRANT ALL ON TABLE "public"."dinner_party_contributions" TO "authenticated";
GRANT ALL ON TABLE "public"."dinner_party_contributions" TO "service_role";



GRANT ALL ON TABLE "public"."dinner_party_pools" TO "anon";
GRANT ALL ON TABLE "public"."dinner_party_pools" TO "authenticated";
GRANT ALL ON TABLE "public"."dinner_party_pools" TO "service_role";



GRANT ALL ON TABLE "public"."error_logs" TO "anon";
GRANT ALL ON TABLE "public"."error_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."error_logs" TO "service_role";



GRANT ALL ON TABLE "public"."product_access" TO "anon";
GRANT ALL ON TABLE "public"."product_access" TO "authenticated";
GRANT ALL ON TABLE "public"."product_access" TO "service_role";



GRANT ALL ON TABLE "public"."product_definitions" TO "anon";
GRANT ALL ON TABLE "public"."product_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."product_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."product_sessions" TO "anon";
GRANT ALL ON TABLE "public"."product_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."product_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."product_steps" TO "anon";
GRANT ALL ON TABLE "public"."product_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."product_steps" TO "service_role";



GRANT ALL ON TABLE "public"."prompts" TO "anon";
GRANT ALL ON TABLE "public"."prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."prompts" TO "service_role";



GRANT ALL ON TABLE "public"."recent_user_activity" TO "anon";
GRANT ALL ON TABLE "public"."recent_user_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."recent_user_activity" TO "service_role";



GRANT ALL ON TABLE "public"."referral_hierarchy" TO "anon";
GRANT ALL ON TABLE "public"."referral_hierarchy" TO "authenticated";
GRANT ALL ON TABLE "public"."referral_hierarchy" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_connect_onboarding" TO "anon";
GRANT ALL ON TABLE "public"."stripe_connect_onboarding" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_connect_onboarding" TO "service_role";



GRANT ALL ON TABLE "public"."track_changes" TO "anon";
GRANT ALL ON TABLE "public"."track_changes" TO "authenticated";
GRANT ALL ON TABLE "public"."track_changes" TO "service_role";



GRANT ALL ON TABLE "public"."uploaded_documents" TO "anon";
GRANT ALL ON TABLE "public"."uploaded_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."uploaded_documents" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







