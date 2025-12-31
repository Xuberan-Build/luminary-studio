# Stripe Product Testing Workflow

## The Problem
- Live payment links don't accept test cards (by design)
- Test payment links must be created in Stripe TEST mode
- We need a reliable way to test every new product before launch

---

## Solution: Dual Environment Setup

### Test Mode (Development)
- Use Stripe TEST mode payment links
- Accept test cards (4242 4242 4242 4242)
- Test webhook flow without real money
- Verify emails, database, access

### Live Mode (Production)
- Use Stripe LIVE mode payment links
- Real cards only
- Real customer purchases
- Real revenue

---

## Step-by-Step: Test New Product

### Phase 1: Create Product in Stripe TEST Mode

1. **Switch to TEST mode** in Stripe Dashboard (toggle top-left)

2. **Create Product:**
   - Go to: Products → Create Product
   - Name: "Personal Alignment Orientation (TEST)"
   - Price: $7.00 USD
   - Click "Save product"

3. **Create Payment Link:**
   - Click "Create payment link"
   - Select the product
   - **Add metadata:**
     - Key: `product_slug`
     - Value: `personal-alignment`
   - Success URL: `https://quantumstrategies.online/products/personal-alignment/interact`
   - Click "Create link"

4. **Copy TEST payment link:**
   - Should look like: `https://buy.stripe.com/test_xxxxx`
   - Note the `test_` prefix

### Phase 2: Test Purchase Flow

1. **Open test payment link** in incognito browser

2. **Complete checkout:**
   ```
   Card: 4242 4242 4242 4242
   Exp: 12/34
   CVC: 123
   ZIP: 10001
   Email: test-{product-slug}-{timestamp}@example.com
   Name: Test Purchase
   ```

3. **Verify webhook fired:**
   - Check Stripe Dashboard → Developers → Webhooks
   - Find latest `checkout.session.completed` event
   - **Must show: HTTP 200** ✅
   - If shows HTTP 308: Deployment failed ❌

4. **Check admin notification:**
   - Email should arrive at santos.93.aus@gmail.com
   - Subject: `💰 New Purchase: [Product] - $7.00`
   - Within 30 seconds

5. **Verify database access:**
   ```bash
   npm run show-access
   ```
   - Should show test-{product-slug}@example.com with access

6. **Test product experience:**
   - Log in as test user
   - Dashboard should show "Start" button
   - Click through product steps
   - Verify deliverable generation

### Phase 3: Production Deployment

Once TEST mode works perfectly:

1. **Create LIVE product** (repeat Phase 1 in LIVE mode)

2. **Update product page** with live payment link

3. **Deploy to production**

4. **Do ONE real test purchase:**
   - Use real card
   - Verify webhook (HTTP 200)
   - Verify admin email
   - **Immediately refund** in Stripe Dashboard

5. **Product is live** ✅

---

## Required: Test Mode Webhook Endpoint

Your webhook endpoint must handle BOTH test and live events:
- Test events: `evt_test_xxxxx`
- Live events: `evt_xxxxx`

Current webhook: `https://quantumstrategies.online/api/stripe-webhook`
- ✅ Already configured to handle both modes
- Uses different webhook secrets per mode

---

## Quick Test Commands

```bash
# Check who has access
npm run show-access

# List all payment links
npm run test-purchase-flow

# Check Stripe configuration
npx tsx scripts/check-stripe-config.ts
```

---

## For Every New Product

**Checklist:**
- [ ] Create product in Stripe TEST mode
- [ ] Create test payment link with metadata
- [ ] Test purchase with test card
- [ ] Verify webhook HTTP 200
- [ ] Verify admin email received
- [ ] Verify database access granted
- [ ] Verify product experience works
- [ ] Create LIVE product
- [ ] Create live payment link with metadata
- [ ] Do ONE real test purchase
- [ ] Refund test purchase
- [ ] Product live ✅

---

## Common Issues

### "Card declined" with test card
**Cause:** Using test card on LIVE payment link
**Fix:** Use TEST mode payment link (has `test_` prefix)

### Webhook returns HTTP 308
**Cause:** `skipTrailingSlashRedirect` not deployed
**Fix:** Check `next.config.ts` has the fix, redeploy

### No admin email received
**Cause:** Gmail API permissions or email send failed
**Fix:** Check Vercel logs for error message

### Customer can't access product
**Cause:** No product_access record in database
**Fix:** Check webhook logs, verify metadata present

---

## Setting Up Test Mode Webhook (First Time)

1. **Go to Stripe Dashboard (TEST mode)**
2. **Developers → Webhooks → Add endpoint**
3. **Endpoint URL:** `https://quantumstrategies.online/api/stripe-webhook`
4. **Events to send:**
   - `checkout.session.completed`
5. **Copy webhook signing secret** (starts with `whsec_`)
6. **Add to environment variables:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx  # For test mode
   ```

---

## Current Status

✅ **Live Mode:** Configured and working
✅ **Webhook Fix:** Deployed (skipTrailingSlashRedirect)
✅ **Admin Notifications:** Deployed
⚠️  **Test Mode:** Needs payment links created in Stripe Dashboard

---

**Next Action:** Create test mode payment links for personal-alignment and quantum-initiation in Stripe Dashboard (TEST mode).
