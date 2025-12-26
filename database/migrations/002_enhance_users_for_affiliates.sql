-- =====================================================
-- ENHANCE USERS TABLE FOR AFFILIATE SYSTEM
-- Migration 002: Add affiliate-related fields
-- =====================================================

-- Add affiliate-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS affiliate_enrolled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_earnings_cents INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS available_balance_cents INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_withdrawn_cents INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dinner_party_credits_cents INTEGER DEFAULT 0;

-- Add indexes for affiliate queries
CREATE INDEX IF NOT EXISTS idx_users_is_affiliate ON users(is_affiliate);
CREATE INDEX IF NOT EXISTS idx_users_earnings ON users(total_earnings_cents DESC);
