-- =====================================================
-- RENAME PRODUCT SLUG: quantum-initiation → business-alignment
-- Updates all references across database
-- =====================================================

BEGIN;

-- Step 1: Update product_definitions
UPDATE product_definitions
SET product_slug = 'business-alignment'
WHERE product_slug = 'quantum-initiation';

-- Step 2: Update product_access records
UPDATE product_access
SET product_slug = 'business-alignment'
WHERE product_slug = 'quantum-initiation';

-- Step 3: Update product_sessions records
UPDATE product_sessions
SET product_slug = 'business-alignment'
WHERE product_slug = 'quantum-initiation';

-- Step 4: Verify updates
SELECT
  'product_definitions' as table_name,
  COUNT(*) as records_updated
FROM product_definitions
WHERE product_slug = 'business-alignment'

UNION ALL

SELECT
  'product_access' as table_name,
  COUNT(*) as records_updated
FROM product_access
WHERE product_slug = 'business-alignment'

UNION ALL

SELECT
  'product_sessions' as table_name,
  COUNT(*) as records_updated
FROM product_sessions
WHERE product_slug = 'business-alignment';

-- Step 5: Verify no old slug remains
SELECT
  'OLD SLUG CHECK' as status,
  (
    (SELECT COUNT(*) FROM product_definitions WHERE product_slug = 'quantum-initiation') +
    (SELECT COUNT(*) FROM product_access WHERE product_slug = 'quantum-initiation') +
    (SELECT COUNT(*) FROM product_sessions WHERE product_slug = 'quantum-initiation')
  ) as remaining_old_slug_records;

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Product slug renamed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Renamed: quantum-initiation → business-alignment';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables Updated:';
  RAISE NOTICE '  ✓ product_definitions';
  RAISE NOTICE '  ✓ product_access';
  RAISE NOTICE '  ✓ product_sessions';
  RAISE NOTICE '';
  RAISE NOTICE 'New URL: /products/business-alignment/experience';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTE: You should add a redirect from the old URL to the new URL in your Next.js app.';
END $$;
