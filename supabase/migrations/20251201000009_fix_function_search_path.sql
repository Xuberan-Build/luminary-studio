-- Migration: 008_fix_function_search_path
-- Description: Set search_path on all functions to prevent search path attacks
-- Date: 2025-12-27

-- =====================================================
-- SECURITY: SET SEARCH_PATH ON ALL FUNCTIONS
-- =====================================================

-- This prevents search path injection attacks by explicitly
-- setting the search path for each function to 'public'

-- Affiliate system functions
ALTER FUNCTION generate_referral_code() SET search_path = public;
ALTER FUNCTION calculate_commission(INTEGER, TEXT, BOOLEAN) SET search_path = public;
ALTER FUNCTION calculate_dinner_party_contribution(INTEGER, TEXT) SET search_path = public;
ALTER FUNCTION increment_affiliate_earnings(UUID, INTEGER) SET search_path = public;
ALTER FUNCTION increment_referral_count(UUID) SET search_path = public;
ALTER FUNCTION add_dinner_party_contribution(UUID, UUID, INTEGER) SET search_path = public;
ALTER FUNCTION get_affiliate_stats(UUID) SET search_path = public;
ALTER FUNCTION auto_enroll_affiliate() SET search_path = public;

-- Product system functions
ALTER FUNCTION update_session_progress(UUID, INTEGER, INTEGER) SET search_path = public;
ALTER FUNCTION grant_product_access(TEXT, TEXT, TEXT, DECIMAL) SET search_path = public;

-- Utility functions
ALTER FUNCTION update_updated_at_column() SET search_path = public;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  function_count INTEGER;
  insecure_count INTEGER;
BEGIN
  -- Count total functions
  SELECT COUNT(*)
  INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prokind = 'f';

  -- Count functions without search_path set
  SELECT COUNT(*)
  INTO insecure_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.prokind = 'f'
    AND p.proconfig IS NULL;

  RAISE NOTICE 'Total public functions: %', function_count;
  RAISE NOTICE 'Functions without search_path: %', insecure_count;

  IF insecure_count > 0 THEN
    RAISE WARNING 'Some functions still have mutable search_path';
  ELSE
    RAISE NOTICE 'All functions have search_path configured ✓';
  END IF;
END $$;
