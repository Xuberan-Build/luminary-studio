-- Migration: 007_fix_rls_security
-- Description: Enable RLS on prompts and product_steps tables (security fix)
-- Date: 2025-12-27

-- =====================================================
-- ENABLE RLS ON MISSING TABLES
-- =====================================================

-- Enable RLS on prompts table
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on product_steps table
ALTER TABLE product_steps ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROMPTS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read prompts" ON prompts;
DROP POLICY IF EXISTS "Anonymous users can read prompts" ON prompts;
DROP POLICY IF EXISTS "Service role has full access to prompts" ON prompts;

-- Authenticated users can read prompts (needed for product experience)
CREATE POLICY "Authenticated users can read prompts"
  ON prompts
  FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users can read prompts (for public product pages)
CREATE POLICY "Anonymous users can read prompts"
  ON prompts
  FOR SELECT
  TO anon
  USING (true);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role has full access to prompts"
  ON prompts
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- PRODUCT_STEPS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read product steps" ON product_steps;
DROP POLICY IF EXISTS "Anonymous users can read product steps" ON product_steps;
DROP POLICY IF EXISTS "Service role has full access to product steps" ON product_steps;

-- Authenticated users can read product steps (needed for product experience)
CREATE POLICY "Authenticated users can read product steps"
  ON product_steps
  FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users can read product steps (for public product pages)
CREATE POLICY "Anonymous users can read product steps"
  ON product_steps
  FOR SELECT
  TO anon
  USING (true);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role has full access to product steps"
  ON product_steps
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify RLS is enabled
DO $$
DECLARE
  prompts_rls boolean;
  steps_rls boolean;
BEGIN
  -- Check if RLS is enabled on prompts
  SELECT relrowsecurity INTO prompts_rls
  FROM pg_class
  WHERE relname = 'prompts' AND relnamespace = 'public'::regnamespace;

  -- Check if RLS is enabled on product_steps
  SELECT relrowsecurity INTO steps_rls
  FROM pg_class
  WHERE relname = 'product_steps' AND relnamespace = 'public'::regnamespace;

  -- Log results
  RAISE NOTICE 'RLS enabled on prompts: %', prompts_rls;
  RAISE NOTICE 'RLS enabled on product_steps: %', steps_rls;

  -- Ensure both are enabled
  IF NOT prompts_rls OR NOT steps_rls THEN
    RAISE EXCEPTION 'RLS not properly enabled on all tables';
  END IF;
END $$;
