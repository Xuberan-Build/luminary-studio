export const createTestUser = (overrides: any = {}) => ({
  id: 'test-user-id',
  email: 'testuser@example.com',
  name: 'Test User',
  stripe_customer_id: null,
  is_affiliate: false,
  total_earnings_cents: 0,
  available_balance_cents: 0,
  affiliate_opted_out: false,
  affiliate_enrolled_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createAffiliate = (overrides: any = {}) => ({
  ...createTestUser(),
  is_affiliate: true,
  affiliate_enrolled_at: new Date().toISOString(),
  total_earnings_cents: 1000,
  available_balance_cents: 500,
  ...overrides,
});
