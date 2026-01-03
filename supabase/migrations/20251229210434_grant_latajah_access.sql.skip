-- =====================================================
-- Emergency: Grant Latajah Lassus Access to Personal Alignment
-- User paid but webhook may have failed
-- =====================================================

-- First, ensure user exists
INSERT INTO users (id, email, name, created_at)
VALUES (
  '23700648-d0f8-4b4a-bd89-77a0c0b6600b',
  'thebrighteststarfire@gmail.com',
  'Latajah Lassus',
  '2025-12-29 19:30:00'
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name;

-- Grant product access
INSERT INTO product_access (
  user_id,
  product_slug,
  stripe_session_id,
  amount_paid,
  access_granted,
  purchase_date,
  created_at
) VALUES (
  '23700648-d0f8-4b4a-bd89-77a0c0b6600b',
  'personal-alignment',
  'cs_test_session_or_actual_session_id',
  7.00,
  true,
  '2025-12-29 19:30:00',
  NOW()
)
ON CONFLICT (user_id, product_slug) DO UPDATE SET
  access_granted = true,
  purchase_date = EXCLUDED.purchase_date,
  stripe_session_id = EXCLUDED.stripe_session_id,
  amount_paid = EXCLUDED.amount_paid;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Access granted to Latajah Lassus';
  RAISE NOTICE '✅ Email: thebrighteststarfire@gmail.com';
  RAISE NOTICE '✅ Product: Personal Alignment Orientation';
  RAISE NOTICE '✅ Amount: $7.00';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 User can now access the product at:';
  RAISE NOTICE '   https://quantumstrategies.online/products/personal-alignment/experience';
END $$;
