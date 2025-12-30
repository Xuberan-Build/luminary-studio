-- =====================================================
-- Fix Test Account Auto-Access Trigger
-- Fixes typo in email address (missing .com)
-- =====================================================

-- Update the trigger function with correct email
CREATE OR REPLACE FUNCTION auto_grant_test_access_on_new_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Manually grant access to all products for test account (including brand-alignment)
SELECT grant_test_account_access();

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '✅ Test account trigger fixed';
  RAISE NOTICE '✅ Granted access to all products for santos.93.aus@gmail.com';
  RAISE NOTICE '✅ Future products will auto-grant access';
END $$;
