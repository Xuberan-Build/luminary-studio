-- =====================================================
-- AFFILIATE SYSTEM DATABASE FUNCTIONS
-- Migration 003: Core business logic functions
-- =====================================================

-- Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Auto-enroll user as affiliate on first purchase
CREATE OR REPLACE FUNCTION auto_enroll_affiliate()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
  v_base_url TEXT;
BEGIN
  -- Only enroll if not already an affiliate
  IF NOT EXISTS(SELECT 1 FROM referral_hierarchy WHERE affiliate_id = NEW.user_id) THEN

    -- Generate referral code
    v_referral_code := generate_referral_code();
    v_base_url := 'https://quantumstrategies.online';

    -- Insert into referral_hierarchy
    INSERT INTO referral_hierarchy (
      affiliate_id,
      referral_code,
      referral_link,
      current_track
    ) VALUES (
      NEW.user_id,
      v_referral_code,
      v_base_url || '?ref=' || v_referral_code,
      'community_builder'
    );

    -- Update users table
    UPDATE users
    SET
      is_affiliate = TRUE,
      affiliate_enrolled_at = NOW()
    WHERE id = NEW.user_id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_auto_enroll_affiliate ON product_access;

-- Trigger: Auto-enroll on product access grant
CREATE TRIGGER trigger_auto_enroll_affiliate
  AFTER INSERT ON product_access
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_affiliate();

-- Calculate commission based on track and level
CREATE OR REPLACE FUNCTION calculate_commission(
  p_amount_cents INTEGER,
  p_track TEXT,
  p_is_direct BOOLEAN
)
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql;

-- Calculate dinner party contribution based on track
CREATE OR REPLACE FUNCTION calculate_dinner_party_contribution(
  p_amount_cents INTEGER,
  p_track TEXT
)
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql;

-- Increment affiliate earnings
CREATE OR REPLACE FUNCTION increment_affiliate_earnings(
  p_affiliate_id UUID,
  p_amount_cents INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET
    total_earnings_cents = total_earnings_cents + p_amount_cents,
    available_balance_cents = available_balance_cents + p_amount_cents
  WHERE id = p_affiliate_id;
END;
$$ LANGUAGE plpgsql;

-- Increment referral count
CREATE OR REPLACE FUNCTION increment_referral_count(
  p_referrer_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE referral_hierarchy
  SET
    total_referrals = total_referrals + 1,
    active_referrals = active_referrals + 1,
    updated_at = NOW()
  WHERE affiliate_id = p_referrer_id;
END;
$$ LANGUAGE plpgsql;

-- Add dinner party contribution to pool
CREATE OR REPLACE FUNCTION add_dinner_party_contribution(
  p_contributor_id UUID,
  p_transaction_id UUID,
  p_amount_cents INTEGER
)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql;

-- Get affiliate stats (for dashboard)
CREATE OR REPLACE FUNCTION get_affiliate_stats(p_affiliate_id UUID)
RETURNS TABLE (
  referral_code TEXT,
  referral_link TEXT,
  current_track TEXT,
  total_earnings_cents INTEGER,
  available_balance_cents INTEGER,
  total_referrals INTEGER,
  active_referrals INTEGER,
  dinner_party_credits_cents INTEGER,
  stripe_connect_onboarding_complete BOOLEAN
) AS $$
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
$$ LANGUAGE plpgsql;
