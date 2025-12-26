# Database Migrations for Affiliate System

## Overview

These migrations create the complete database schema for the two-level affiliate referral system.

## Migration Files

1. **001_affiliate_system_core.sql** - Core tables (referral_hierarchy, affiliate_transactions, track_changes, dinner_party_pools, dinner_party_contributions, stripe_connect_onboarding)
2. **002_enhance_users_for_affiliates.sql** - Add affiliate columns to existing users table
3. **003_affiliate_functions.sql** - Database functions for business logic
4. **004_affiliate_rls_policies.sql** - Row Level Security policies

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order (001 → 004)
4. Verify tables were created in **Table Editor**

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref znpspiwsgztophzpoxub

# Run migrations
supabase db push
```

### Option 3: Manual Execution

```bash
# Using psql (if you have direct database access)
psql $DATABASE_URL -f database/migrations/001_affiliate_system_core.sql
psql $DATABASE_URL -f database/migrations/002_enhance_users_for_affiliates.sql
psql $DATABASE_URL -f database/migrations/003_affiliate_functions.sql
psql $DATABASE_URL -f database/migrations/004_affiliate_rls_policies.sql
```

## Verification

After running migrations, verify:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'referral_hierarchy',
  'affiliate_transactions',
  'track_changes',
  'dinner_party_pools',
  'dinner_party_contributions',
  'stripe_connect_onboarding'
);

-- Check functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'generate_referral_code',
  'auto_enroll_affiliate',
  'calculate_commission',
  'calculate_dinner_party_contribution',
  'increment_affiliate_earnings',
  'add_dinner_party_contribution',
  'get_affiliate_stats'
);

-- Check trigger exists
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_enroll_affiliate';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'referral_hierarchy',
  'affiliate_transactions',
  'track_changes',
  'dinner_party_pools',
  'dinner_party_contributions',
  'stripe_connect_onboarding'
);
```

## Rollback

If you need to rollback:

```sql
-- Drop all affiliate tables
DROP TABLE IF EXISTS stripe_connect_onboarding CASCADE;
DROP TABLE IF EXISTS dinner_party_contributions CASCADE;
DROP TABLE IF EXISTS dinner_party_pools CASCADE;
DROP TABLE IF EXISTS track_changes CASCADE;
DROP TABLE IF EXISTS affiliate_transactions CASCADE;
DROP TABLE IF EXISTS referral_hierarchy CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS generate_referral_code();
DROP FUNCTION IF EXISTS auto_enroll_affiliate();
DROP FUNCTION IF EXISTS calculate_commission(INTEGER, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS calculate_dinner_party_contribution(INTEGER, TEXT);
DROP FUNCTION IF EXISTS increment_affiliate_earnings(UUID, INTEGER);
DROP FUNCTION IF EXISTS add_dinner_party_contribution(UUID, UUID, INTEGER);
DROP FUNCTION IF EXISTS get_affiliate_stats(UUID);

-- Remove columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS is_affiliate;
ALTER TABLE users DROP COLUMN IF EXISTS affiliate_enrolled_at;
ALTER TABLE users DROP COLUMN IF EXISTS total_earnings_cents;
ALTER TABLE users DROP COLUMN IF EXISTS available_balance_cents;
ALTER TABLE users DROP COLUMN IF EXISTS total_withdrawn_cents;
ALTER TABLE users DROP COLUMN IF EXISTS dinner_party_credits_cents;
```

## Next Steps

After running migrations:

1. Test the `auto_enroll_affiliate` trigger by creating a test product_access record
2. Verify referral code generation works
3. Test commission calculation functions
4. Set up Stripe Connect integration
