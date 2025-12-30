# Stripe CLI Testing Guide

## Test Webhook Flow Locally & Production

Use Stripe CLI to simulate webhook events and verify the 308 redirect fix.

---

## Setup Stripe CLI

### 1. Install (if not already installed)
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### 2. Login to Stripe
```bash
stripe login
```

This opens your browser to authenticate with your Stripe account.

---

## Option A: Test Production Webhook (Recommended)

Test the actual deployed webhook endpoint at quantumstrategies.online.

### 1. Trigger a Test Checkout Session Completed Event
```bash
stripe trigger checkout.session.completed \
  --add checkout_session:metadata[product_slug]=personal-alignment \
  --add checkout_session:customer_details[email]=test@example.com \
  --add checkout_session:customer_details[name]="Test User" \
  --add checkout_session:amount_total=700
```

### 2. Check Webhook Delivery
```bash
# View recent webhook events
stripe events list --limit 5

# Get specific event details
stripe events retrieve evt_xxxxx
```

### 3. Verify in Stripe Dashboard
- Go to: **Developers → Webhooks**
- Find latest `checkout.session.completed` event
- **Expected:** HTTP 200 ✅ (not 308)
- Response body shows success

### 4. Verify Database
```bash
npm run show-access
```

Should show new test@example.com user with personal-alignment access.

---

## Option B: Test Local Development

Test against your local dev server (http://localhost:3000).

### 1. Start Local Server
```bash
npm run dev
```

### 2. Forward Webhooks to Local Server
```bash
# In a new terminal
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

This gives you a webhook signing secret like: `whsec_xxxxx`

### 3. Update .env.local
```bash
# Add the webhook secret from step 2
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 4. Restart Dev Server
```bash
# Stop and restart to load new secret
npm run dev
```

### 5. Trigger Test Event
```bash
# In another terminal
stripe trigger checkout.session.completed
```

### 6. Watch Logs
You should see in your dev server terminal:
```
=== CHECKOUT SESSION COMPLETED ===
Session ID: cs_test_xxxxx
Customer Email: jenny.rosen@example.com
Metadata: { product_slug: 'personal-alignment' }
📝 Inserting product_access record
✅ Product access granted successfully
```

---

## Option C: Create Real Test Checkout (Most Realistic)

Create an actual checkout session and complete it with test card.

### 1. Get Your Payment Link
```bash
stripe payment_links list --limit 5
```

Or from Stripe Dashboard → Products → Payment Links

### 2. Open Payment Link in Browser
```
https://buy.stripe.com/test_xxxxx  # Your test mode payment link
```

### 3. Complete Checkout with Test Card
```
Card: 4242 4242 4242 4242
Exp: 12/34
CVC: 123
ZIP: 10001
Email: test-purchase@example.com
Name: Test Purchase
```

### 4. Webhook Fires Automatically
- Stripe calls your production webhook
- Check delivery in Stripe Dashboard
- Verify HTTP 200 response

### 5. Verify Access
```bash
npm run show-access
```

Should show test-purchase@example.com with product access.

---

## Troubleshooting

### Issue: "Webhook signature verification failed"
**Cause:** Wrong STRIPE_WEBHOOK_SECRET
**Fix:**
- Production: Use secret from Stripe Dashboard → Webhooks
- Local: Use secret from `stripe listen` output

### Issue: Still getting HTTP 308
**Cause:** Deployment hasn't completed or cached
**Fix:**
```bash
# Check deployment status
vercel ls

# Force redeploy
git commit --allow-empty -m "redeploy"
git push
```

### Issue: No webhook events firing
**Cause:** Webhook endpoint not configured
**Fix:**
- Go to Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://quantumstrategies.online/api/stripe-webhook`
- Select event: `checkout.session.completed`

---

## Expected Success Output

### Stripe Webhook Dashboard:
```
✅ checkout.session.completed
   Status: 200 OK
   Response: {"received": true}
```

### Vercel Logs:
```
=== CHECKOUT SESSION COMPLETED ===
Session ID: cs_test_a1xxxxx
Customer Email: test@example.com
Metadata: {product_slug: 'personal-alignment'}
📝 Inserting product_access record: {...}
✅ Product access granted successfully
```

### Database:
```bash
npm run show-access

# Shows:
📦 PERSONAL-ALIGNMENT
   1. Test User (test@example.com)
      Purchase: [today] - $7
      Session: cs_test_xxxxx
      Access: ✅ Granted
```

---

## Quick Test Commands

```bash
# Test production webhook (fastest)
stripe trigger checkout.session.completed

# Watch webhook events
stripe events list --limit 5

# Check who has access
npm run show-access

# View Vercel logs
vercel logs --follow
```

---

## What We're Testing

✅ Webhook receives POST without 308 redirect
✅ Stripe signature verification passes
✅ Product slug extracted from metadata
✅ User created if doesn't exist
✅ product_access record created
✅ Customer can access product on dashboard

---

**Ready to test!** Start with Option A (trigger production webhook) for fastest verification.
