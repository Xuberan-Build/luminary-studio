-- =====================================================
-- Test Account Auto-Access System
-- Automatically grants all product access to test accounts
-- =====================================================

-- Function to grant access to all products for test accounts
CREATE OR REPLACE FUNCTION grant_test_account_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to auto-grant access when new products are created
CREATE OR REPLACE FUNCTION auto_grant_test_access_on_new_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Get test user ID
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'santos.93.aus@gmail';

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

-- Create trigger to auto-grant access when products are created
DROP TRIGGER IF EXISTS auto_grant_test_access_trigger ON product_definitions;
CREATE TRIGGER auto_grant_test_access_trigger
  AFTER INSERT ON product_definitions
  FOR EACH ROW
  EXECUTE FUNCTION auto_grant_test_access_on_new_product();

-- Run the function immediately to grant access to existing products
SELECT grant_test_account_access();

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '✅ Test account auto-access system created';
  RAISE NOTICE '✅ Test account: santos.93.aus@gmail.com';
  RAISE NOTICE '✅ Auto-grant trigger active for new products';
  RAISE NOTICE '';
  RAISE NOTICE 'To manually grant access again, run:';
  RAISE NOTICE '  SELECT grant_test_account_access();';
END $$;
