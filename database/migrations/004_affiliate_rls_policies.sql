-- =====================================================
-- AFFILIATE SYSTEM ROW LEVEL SECURITY POLICIES
-- Migration 004: RLS policies for data access control
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE referral_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dinner_party_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE dinner_party_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_connect_onboarding ENABLE ROW LEVEL SECURITY;

-- ====================
-- REFERRAL HIERARCHY POLICIES
-- ====================

-- Users can view their own referral hierarchy
DROP POLICY IF EXISTS "Users can view own referral hierarchy" ON referral_hierarchy;
CREATE POLICY "Users can view own referral hierarchy"
  ON referral_hierarchy FOR SELECT
  USING (auth.uid() = affiliate_id);

-- Users can update their own track
DROP POLICY IF EXISTS "Users can update own track" ON referral_hierarchy;
CREATE POLICY "Users can update own track"
  ON referral_hierarchy FOR UPDATE
  USING (auth.uid() = affiliate_id)
  WITH CHECK (auth.uid() = affiliate_id);

-- Service role can manage all referral hierarchy
DROP POLICY IF EXISTS "Service role can manage referral hierarchy" ON referral_hierarchy;
CREATE POLICY "Service role can manage referral hierarchy"
  ON referral_hierarchy FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ====================
-- AFFILIATE TRANSACTIONS POLICIES
-- ====================

-- Users can view transactions where they are involved
DROP POLICY IF EXISTS "Users can view own affiliate transactions" ON affiliate_transactions;
CREATE POLICY "Users can view own affiliate transactions"
  ON affiliate_transactions FOR SELECT
  USING (
    auth.uid() = purchaser_id
    OR auth.uid() = direct_referrer_id
    OR auth.uid() = override_referrer_id
  );

-- Service role can manage all transactions
DROP POLICY IF EXISTS "Service role can manage affiliate transactions" ON affiliate_transactions;
CREATE POLICY "Service role can manage affiliate transactions"
  ON affiliate_transactions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ====================
-- TRACK CHANGES POLICIES
-- ====================

-- Users can view their own track changes
DROP POLICY IF EXISTS "Users can view own track changes" ON track_changes;
CREATE POLICY "Users can view own track changes"
  ON track_changes FOR SELECT
  USING (auth.uid() = affiliate_id);

-- Service role can manage track changes
DROP POLICY IF EXISTS "Service role can manage track changes" ON track_changes;
CREATE POLICY "Service role can manage track changes"
  ON track_changes FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ====================
-- DINNER PARTY POOLS POLICIES
-- ====================

-- Anyone authenticated can view active pools
DROP POLICY IF EXISTS "Authenticated users can view pools" ON dinner_party_pools;
CREATE POLICY "Authenticated users can view pools"
  ON dinner_party_pools FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role can manage pools
DROP POLICY IF EXISTS "Service role can manage dinner party pools" ON dinner_party_pools;
CREATE POLICY "Service role can manage dinner party pools"
  ON dinner_party_pools FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ====================
-- DINNER PARTY CONTRIBUTIONS POLICIES
-- ====================

-- Users can view their own contributions
DROP POLICY IF EXISTS "Users can view own contributions" ON dinner_party_contributions;
CREATE POLICY "Users can view own contributions"
  ON dinner_party_contributions FOR SELECT
  USING (auth.uid() = contributor_id);

-- Service role can manage contributions
DROP POLICY IF EXISTS "Service role can manage contributions" ON dinner_party_contributions;
CREATE POLICY "Service role can manage contributions"
  ON dinner_party_contributions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ====================
-- STRIPE CONNECT ONBOARDING POLICIES
-- ====================

-- Users can view their own onboarding status
DROP POLICY IF EXISTS "Users can view own onboarding" ON stripe_connect_onboarding;
CREATE POLICY "Users can view own onboarding"
  ON stripe_connect_onboarding FOR SELECT
  USING (auth.uid() = affiliate_id);

-- Service role can manage onboarding
DROP POLICY IF EXISTS "Service role can manage onboarding" ON stripe_connect_onboarding;
CREATE POLICY "Service role can manage onboarding"
  ON stripe_connect_onboarding FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
