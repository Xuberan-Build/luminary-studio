-- =====================================================
-- AFFILIATE SYSTEM CORE SCHEMA
-- Migration 001: Core tables for referral system
-- =====================================================

-- 1. REFERRAL HIERARCHY TABLE
CREATE TABLE IF NOT EXISTS referral_hierarchy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referral_link TEXT NOT NULL,

  -- Track assignment
  current_track TEXT NOT NULL DEFAULT 'community_builder',
  -- Tracks: 'community_builder', 'high_performer', 'independent'

  -- Stripe Connect
  stripe_connect_account_id TEXT,
  stripe_connect_onboarding_complete BOOLEAN DEFAULT FALSE,
  stripe_connect_charges_enabled BOOLEAN DEFAULT FALSE,
  stripe_connect_payouts_enabled BOOLEAN DEFAULT FALSE,

  -- Metrics
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,

  -- Timestamps
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_affiliate UNIQUE(affiliate_id),
  CONSTRAINT valid_track CHECK (current_track IN ('community_builder', 'high_performer', 'independent'))
);

CREATE INDEX IF NOT EXISTS idx_referral_hierarchy_affiliate ON referral_hierarchy(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referral_hierarchy_referred_by ON referral_hierarchy(referred_by_id);
CREATE INDEX IF NOT EXISTS idx_referral_hierarchy_code ON referral_hierarchy(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_hierarchy_stripe_account ON referral_hierarchy(stripe_connect_account_id);

-- 2. AFFILIATE TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS affiliate_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Purchase details
  purchaser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,
  stripe_session_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,

  -- Referral chain
  direct_referrer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  override_referrer_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Commission tracking
  direct_commission_cents INTEGER DEFAULT 0,
  override_commission_cents INTEGER DEFAULT 0,
  direct_track TEXT,
  override_track TEXT,

  -- Stripe Transfer IDs
  direct_transfer_id TEXT,
  override_transfer_id TEXT,

  -- Dinner Party contribution
  dinner_party_contribution_cents INTEGER DEFAULT 0,

  -- Status
  commission_status TEXT DEFAULT 'pending',
  -- Statuses: 'pending', 'processing', 'paid', 'failed'

  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_commission_status CHECK (commission_status IN ('pending', 'processing', 'paid', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_affiliate_transactions_purchaser ON affiliate_transactions(purchaser_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_transactions_direct_referrer ON affiliate_transactions(direct_referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_transactions_override_referrer ON affiliate_transactions(override_referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_transactions_session ON affiliate_transactions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_transactions_status ON affiliate_transactions(commission_status);
CREATE INDEX IF NOT EXISTS idx_affiliate_transactions_created ON affiliate_transactions(created_at DESC);

-- 3. TRACK CHANGE HISTORY
CREATE TABLE IF NOT EXISTS track_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  previous_track TEXT NOT NULL,
  new_track TEXT NOT NULL,
  reason TEXT,

  -- Admin or automatic
  changed_by_user_id UUID REFERENCES users(id),
  change_type TEXT DEFAULT 'manual',
  -- Types: 'manual', 'automatic', 'performance_based'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_previous_track CHECK (previous_track IN ('community_builder', 'high_performer', 'independent')),
  CONSTRAINT valid_new_track CHECK (new_track IN ('community_builder', 'high_performer', 'independent'))
);

CREATE INDEX IF NOT EXISTS idx_track_changes_affiliate ON track_changes(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_track_changes_created ON track_changes(created_at DESC);

-- 4. DINNER PARTY POOLS
CREATE TABLE IF NOT EXISTS dinner_party_pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  pool_name TEXT NOT NULL,
  target_amount_cents INTEGER NOT NULL DEFAULT 50000, -- $500
  current_amount_cents INTEGER DEFAULT 0,

  -- Pool status
  status TEXT DEFAULT 'active',
  -- Statuses: 'active', 'funded', 'completed', 'cancelled'

  -- Event details
  event_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  description TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_pool_status CHECK (status IN ('active', 'funded', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_dinner_party_pools_status ON dinner_party_pools(status);

-- 5. DINNER PARTY CONTRIBUTIONS
CREATE TABLE IF NOT EXISTS dinner_party_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  pool_id UUID NOT NULL REFERENCES dinner_party_pools(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES affiliate_transactions(id) ON DELETE SET NULL,

  amount_cents INTEGER NOT NULL,

  -- Credits (non-cash tracking)
  is_credit BOOLEAN DEFAULT TRUE,
  redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dinner_party_contributions_pool ON dinner_party_contributions(pool_id);
CREATE INDEX IF NOT EXISTS idx_dinner_party_contributions_contributor ON dinner_party_contributions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_dinner_party_contributions_transaction ON dinner_party_contributions(transaction_id);

-- 6. STRIPE CONNECT ONBOARDING
CREATE TABLE IF NOT EXISTS stripe_connect_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL,

  -- Onboarding flow
  onboarding_url TEXT,
  onboarding_expires_at TIMESTAMP WITH TIME ZONE,

  -- Status tracking
  details_submitted BOOLEAN DEFAULT FALSE,
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,

  -- Requirements
  requirements JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_affiliate_onboarding UNIQUE(affiliate_id)
);

CREATE INDEX IF NOT EXISTS idx_stripe_connect_onboarding_affiliate ON stripe_connect_onboarding(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_stripe_connect_onboarding_account ON stripe_connect_onboarding(stripe_account_id);

-- Create initial active dinner party pool
INSERT INTO dinner_party_pools (pool_name, target_amount_cents, status, description)
VALUES (
  'Inaugural Dinner Party Pool',
  50000,
  'active',
  'First community dinner party - Full Moon celebration'
)
ON CONFLICT DO NOTHING;
