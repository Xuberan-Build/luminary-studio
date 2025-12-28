# Referral System Implementation Status

## ✅ COMPLETED - Core Foundation

### 1. Database Schema (100%)

**Created Files:**
- `database/migrations/001_affiliate_system_core.sql` - 6 core tables
- `database/migrations/002_enhance_users_for_affiliates.sql` - Users table enhancements
- `database/migrations/003_affiliate_functions.sql` - Database functions and triggers
- `database/migrations/004_affiliate_rls_policies.sql` - Row Level Security policies
- `database/migrations/README.md` - Migration instructions

**Tables Created:**
1. `referral_hierarchy` - Tracks affiliates, referral codes, tracks, and Stripe Connect accounts
2. `affiliate_transactions` - Records all purchases with commission details
3. `track_changes` - Audit log for track switching
4. `dinner_party_pools` - Manages dinner party fund pools
5. `dinner_party_contributions` - Tracks individual contributions to pools
6. `stripe_connect_onboarding` - Manages Stripe Connect onboarding status

**Database Functions:**
- `generate_referral_code()` - Creates unique 8-character codes
- `auto_enroll_affiliate()` - Trigger to auto-enroll purchasers as affiliates
- `calculate_commission()` - Computes commission based on track
- `calculate_dinner_party_contribution()` - Computes pool contribution
- `increment_affiliate_earnings()` - Updates user earnings
- `increment_referral_count()` - Tracks referral metrics
- `add_dinner_party_contribution()` - Adds to pool and manages funding status
- `get_affiliate_stats()` - Dashboard data retrieval

### 2. Stripe Connect Integration (100%)

**Created File:** `src/lib/stripe/connect.ts`

**Functions:**
- ✅ `createConnectAccount()` - Creates Express accounts for affiliates
- ✅ `createAccountLink()` - Generates Stripe onboarding URLs
- ✅ `getAccountStatus()` - Checks onboarding completion
- ✅ `createTransfer()` - Sends commission payouts
- ✅ `canReceivePayouts()` - Validates payout eligibility
- ✅ `retryTransfer()` - Retry logic for failed transfers

**Stripe Features Used:**
- Express Connected Accounts (for affiliates)
- Account Links (hosted onboarding)
- Transfers API (commission payouts)
- Automatic 1099 generation

### 3. Commission Processing (100%)

**Created File:** `src/lib/affiliate/commission-processor.ts`

**Functions:**
- ✅ `processReferralCommission()` - Main orchestrator
- ✅ `getReferralChain()` - Identifies direct + override referrers
- ✅ `calculateCommissionSplits()` - Applies track percentages
- ✅ `executeStripeTransfers()` - Creates transfers to affiliates
- ✅ `recordAffiliateTransaction()` - Logs to database
- ✅ `incrementEarnings()` - Updates user balances
- ✅ `contributeToDinnerParty()` - Adds to pool
- ✅ `linkPurchaserToReferrer()` - Sets referral hierarchy

**Commission Tracks Implemented:**
- **Community Builder (30/40%)**: $2.10 direct, $2.80 dinner party
- **High Performer (40/30%)**: $2.80 direct, $2.10 dinner party
- **Independent (60/0%)**: $4.20 direct, $0 dinner party
- **Override**: $0.70 (10%) for level 2 referrers

### 4. Webhook Integration (100%)

**Modified File:** `src/app/api/stripe-webhook/route.ts`

**Added Logic:**
1. Auto-create Stripe Connect account after product access grant
2. Check for `referral_code` in session metadata
3. Link purchaser to referrer in hierarchy
4. Process commission splits and execute transfers
5. Update all tracking metrics

**Flow:**
```
Payment Succeeds
  ↓
Grant Product Access
  ↓
Create Connect Account (affiliate enrollment)
  ↓
Check Referral Code
  ↓
Link Purchaser → Referrer
  ↓
Calculate Commissions (based on referrer's track)
  ↓
Execute Stripe Transfers
  ↓
Update Earnings & Metrics
  ↓
Add Dinner Party Contribution
```

---

## 🔄 NEXT STEPS - To Complete System

### Step 1: Run Database Migrations

**Action Required:**
1. Go to Supabase Dashboard: https://app.supabase.com/project/znpspiwsgztophzpoxub
2. Navigate to **SQL Editor**
3. Run each migration in order:
   - `001_affiliate_system_core.sql`
   - `002_enhance_users_for_affiliates.sql`
   - `003_affiliate_functions.sql`
   - `004_affiliate_rls_policies.sql`
4. Verify tables exist in **Table Editor**

**Verification SQL:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'referral_hierarchy', 'affiliate_transactions',
  'track_changes', 'dinner_party_pools',
  'dinner_party_contributions', 'stripe_connect_onboarding'
);

-- Check trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_enroll_affiliate';
```

### Step 2: Referral Code Tracking (Purchase Flow)

**What Needs to Be Built:**
When a user clicks a referral link (`?ref=ABC123`), we need to:
1. Capture the code in URL parameters
2. Store it in a cookie (30-day expiry)
3. Pass it to Stripe Checkout as metadata

**Files to Create/Modify:**

#### A. Middleware Enhancement
**File:** `src/middleware.ts`

Add referral code capture logic:
```typescript
// Capture ?ref= parameter
const referralCode = req.nextUrl.searchParams.get('ref');
if (referralCode) {
  // Validate and store in cookie
  res.cookies.set('referral_code', referralCode, {
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
    secure: true
  });
}
```

#### B. Checkout Session Creation
**File:** Create `src/lib/stripe/checkout.ts`

Function to create checkout with referral metadata:
```typescript
export async function createCheckoutSession(
  productSlug: string,
  referralCode?: string
) {
  return await stripe.checkout.sessions.create({
    // ... existing config
    metadata: {
      product_slug: productSlug,
      referral_code: referralCode || ''
    }
  });
}
```

#### C. Product Page Integration
**File:** Modify product pages to use checkout helper

Replace direct Stripe checkout links with API call that includes referral code.

### Step 3: Affiliate Dashboard

**Pages to Create:**

#### A. Main Dashboard
**File:** `src/app/dashboard/affiliate/page.tsx`

Display:
- Referral code + shareable link
- Total earnings, available balance
- Recent referrals table
- Commission history
- Stripe Connect onboarding status
- Track switcher

#### B. Onboarding Flow
**File:** `src/app/dashboard/affiliate/onboarding/page.tsx`

Features:
- Generate Stripe Connect account link
- Redirect to Stripe Express onboarding
- Handle return URL
- Display completion status

#### C. API Routes

**Files to Create:**
- `src/app/api/affiliate/stats/route.ts` - Get earnings, referrals
- `src/app/api/affiliate/onboarding/route.ts` - Create/check Connect account
- `src/app/api/affiliate/track/route.ts` - Change commission track

### Step 4: Email Notifications

**Templates to Create:**

1. **Affiliate Welcome Email** (after first purchase)
   - Your referral link
   - How commissions work
   - Next steps: Complete Stripe onboarding

2. **Commission Earned Email** (after each referral sale)
   - Who purchased
   - Commission amount
   - Current balance

3. **Onboarding Reminder** (if incomplete after 7 days)
   - Complete setup to receive payouts
   - New onboarding link

4. **Dinner Party Funded** (when pool reaches $500)
   - Pool unlocked!
   - Your contribution
   - Event details

### Step 5: Admin Panel (Optional)

**File:** `src/app/dashboard/admin/affiliates/page.tsx`

Features:
- View all affiliates
- Approve track changes
- View commission transactions
- Manage dinner party pools
- Override commission splits

---

## 🎯 HOW IT WORKS - Live Flow

### Scenario: Sarah makes a sale

1. **Sarah shares her link:** `https://quantumstrategies.online?ref=SARAH2024`

2. **Mike clicks and purchases:**
   - Cookie stores `SARAH2024` for 30 days
   - Stripe Checkout includes `metadata: { referral_code: "SARAH2024" }`
   - Mike pays $7.00

3. **Webhook processes payment:**
   - Creates Mike's user account
   - Grants product access
   - **Auto-enrolls Mike as affiliate** (via DB trigger)
   - Creates Stripe Connect account for Mike
   - Looks up Sarah's referral hierarchy
   - Checks Sarah's track (Community Builder)
   - Calculates commissions:
     - Sarah: $2.10 (30%)
     - Dinner Party: $2.80 (40%)
     - Platform: $1.40 (20%)
   - Creates Stripe Transfer to Sarah's Connect account
   - Updates Sarah's earnings in database
   - Adds $2.80 to dinner party pool
   - Links Mike → Sarah in hierarchy

4. **Mike is now an affiliate:**
   - Receives his own referral code: `MIKE2024`
   - Can start referring others
   - When Mike's referrals buy, Sarah gets $0.70 override

5. **Jessica clicks Mike's link and buys:**
   - Mike (direct): $2.80 (his High Performer rate)
   - Sarah (override): $0.70 (10%)
   - Dinner Party: $2.10 (Mike's contribution)
   - Platform: $1.40

---

## 📊 COMMISSION CALCULATOR

**For $7 Sale:**

| Track | Direct | Override | Dinner | Platform |
|-------|--------|----------|--------|----------|
| Community Builder | $2.10 (30%) | $0.70 (10%) | $2.80 (40%) | $1.40 (20%) |
| High Performer | $2.80 (40%) | $0.70 (10%) | $2.10 (30%) | $1.40 (20%) |
| Independent | $4.20 (60%) | $0.70 (10%) | $0.00 (0%) | $2.10 (30%) |

**Dinner Party Math:**
- Community Builder: 179 sales = $500 pool ($2.80 × 179 = $501.20)
- High Performer: 238 sales = $500 pool ($2.10 × 238 = $499.80)
- Independent: Never contributes to pool

---

## 🔐 ENVIRONMENT VARIABLES NEEDED

Add to `.env.production`:

```bash
# Stripe Connect URLs
NEXT_PUBLIC_SITE_URL=https://quantumstrategies.online
STRIPE_CONNECT_REFRESH_URL=https://quantumstrategies.online/dashboard/affiliate/onboarding
STRIPE_CONNECT_RETURN_URL=https://quantumstrategies.online/dashboard/affiliate/onboarding/complete

# Affiliate Settings
AFFILIATE_COOKIE_DURATION_DAYS=30
AFFILIATE_MIN_PAYOUT_CENTS=1000
```

---

## ✅ TESTING CHECKLIST

Before going live:

### Database
- [ ] All migrations run successfully
- [ ] Triggers fire correctly (test with product_access insert)
- [ ] RLS policies allow proper access
- [ ] Functions execute without errors

### Stripe Connect
- [ ] Express account creation works
- [ ] Onboarding link generation works
- [ ] Account status updates correctly
- [ ] Transfers execute successfully
- [ ] Test mode accounts receive test payouts

### Commission Processing
- [ ] Referral chain lookup works
- [ ] Commission calculation is accurate
- [ ] Transfers go to correct accounts
- [ ] Earnings increment properly
- [ ] Dinner party pool updates
- [ ] Transaction records created

### Purchase Flow
- [ ] Referral code captured from URL
- [ ] Code stored in cookie
- [ ] Metadata passed to Stripe
- [ ] Webhook processes correctly
- [ ] Affiliate auto-enrollment works

### Edge Cases
- [ ] Purchase without referral code (no commission)
- [ ] Self-referral prevention
- [ ] Invalid referral code handling
- [ ] Failed transfer retry logic
- [ ] Incomplete onboarding handling

---

## 📈 NEXT PHASE - FEATURES TO ADD

1. **Leaderboard** - Top affiliates by sales/earnings
2. **Performance Bonuses** - Tier upgrades based on volume
3. **Custom Links** - Branded short links
4. **Marketing Assets** - Pre-made social media graphics
5. **A/B Testing** - Track conversion by source
6. **Payout Management** - Manual withdrawal requests
7. **Multi-Currency** - Support international affiliates
8. **Mobile App** - Affiliate dashboard on mobile

---

## 🚀 DEPLOYMENT CHECKLIST

1. [ ] Run all database migrations in production
2. [ ] Add environment variables to Vercel
3. [ ] Enable Stripe Connect in live mode
4. [ ] Create test affiliate account
5. [ ] Process test referral purchase
6. [ ] Verify commission transfer
7. [ ] Monitor webhook logs
8. [ ] Set up error alerting
9. [ ] Document support procedures
10. [ ] Train team on affiliate management

---

## 📚 DOCUMENTATION

- **Database Schema:** See migration files in `database/migrations/`
- **API Reference:** See function comments in lib files
- **User Guide:** (To be created)
- **Admin Guide:** (To be created)
- **Tax/Legal Guide:** See original spec document

---

**Last Updated:** 2025-12-25
**Status:** Core foundation complete, ready for dashboard and testing
**Next Sprint:** Run migrations, build dashboard, add referral tracking
