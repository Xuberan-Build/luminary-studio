-- Migration: 006_affiliate_opt_in_system
-- Description: Add opt-in tracking fields for affiliate program
-- Date: 2025-12-27

-- Add opt-in tracking fields to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS affiliate_opted_out BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS first_affiliate_visit TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN users.affiliate_opted_out IS 'True if user explicitly declined to join affiliate program';
COMMENT ON COLUMN users.first_affiliate_visit IS 'Timestamp of first visit to affiliate section';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_affiliate_opted_out ON users(affiliate_opted_out) WHERE affiliate_opted_out = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_first_affiliate_visit ON users(first_affiliate_visit);

-- Update auto_enroll_affiliate() function to respect opt-out status
CREATE OR REPLACE FUNCTION auto_enroll_affiliate()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Add comment explaining the change
COMMENT ON FUNCTION auto_enroll_affiliate() IS 'Auto-enrolls users as affiliates on first purchase, respecting opt-out preferences';
