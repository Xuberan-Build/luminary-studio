# ⚡ Quick Start: Stripe Testing (30 minutes)

**Goal:** Complete one successful test purchase and verify everything works

---

## 🏃 Fast Track Setup

### 1. Get Google Credentials (2 min)

```bash
cd /Users/studio/Projects/luminary-studio-nextjs
./scripts/extract-google-keys.sh > google-keys.txt
cat google-keys.txt
```

**Copy the two variables** and add to `.env.production`

### 2. Set Up Stripe Webhook (5 min)

1. **Open Stripe:**
   ```bash
   open https://dashboard.stripe.com/webhooks
   ```

2. **Click "Add endpoint"**

3. **Enter:**
   - URL: `https://quantumstrategies.online/api/stripe-webhook`
   - Events: Select `checkout.session.completed`
   - Click "Add endpoint"

4. **Reveal signing secret:**
   - Click on the webhook you just created
   - Click "Reveal" next to "Signing secret"
   - Copy the value (starts with `whsec_`)

5. **Add to `.env.production`:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### 3. Configure Payment Link (3 min)

1. **Open Payment Links:**
   ```bash
   open https://dashboard.stripe.com/payment-links
   ```

2. **Find your Quantum Initiation link, click to edit**

3. **Advanced settings → Metadata:**
   - Add: `product_slug` = `quantum-initiation`

4. **After payment:**
   - Success URL: `https://quantumstrategies.online/products/quantum-initiation/experience?session_id={CHECKOUT_SESSION_ID}`

5. **Save**

### 4. Deploy (2 min)

```bash
vercel --prod
```

---

## 🧪 Run Test Purchase (15 min)

### Test Mode Purchase

1. **Get your test payment link:**
   ```bash
   echo $NEXT_PUBLIC_STRIPE_PAYMENT_LINK_QUANTUM
   ```

2. **Open in browser** (incognito mode recommended)

3. **Use Stripe test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
   - Email: Use your real email (to test email delivery)

4. **Complete purchase**

5. **Wait 30 seconds**, then check:

#### ✅ Verification Steps:

**A. Stripe Dashboard:**
```bash
open https://dashboard.stripe.com/test/payments
```
- Latest payment should show "Succeeded"

**B. Webhook Logs:**
```bash
open https://dashboard.stripe.com/test/webhooks
```
- Click on your webhook
- Check "Recent events"
- Should see "checkout.session.completed" with "succeeded"

**C. Email Inbox:**
- Check your email (including spam folder)
- Should receive: "🎉 Your Business Alignment Orientation is Ready!"

**D. Supabase Database:**
```bash
open https://supabase.com/dashboard/project/znpspiwsgztophzpoxub/editor
```

Run this SQL:
```sql
SELECT * FROM users WHERE email = 'your-test-email@example.com';
SELECT * FROM product_access WHERE product_slug = 'quantum-initiation';
```

Should see:
- New user created
- Product access granted

**E. Test User Experience:**
1. Open: `https://quantumstrategies.online/login`
2. Log in with your test email
3. Should see "Business Alignment Orientation" in dashboard
4. Click "Start"
5. Upload chart images
6. Go through experience
7. Receive final blueprint

---

## 🎯 Success Criteria

### ✅ You're ready to go live if:

- [ ] Webhook fired successfully
- [ ] User created in Supabase
- [ ] Product access granted
- [ ] Welcome email received
- [ ] Can log in to dashboard
- [ ] Product appears in dashboard
- [ ] Can access experience
- [ ] Can complete full journey
- [ ] Final blueprint delivered

### ⚠️ Need to fix if:

- **No webhook event:** Check webhook URL and secret
- **No email:** Check Google credentials
- **Can't access product:** Check product_access table
- **Can't log in:** Check users table

---

## 🚀 Go Live

Once test mode works perfectly:

### Switch to Live Mode (5 min)

1. **Stripe Dashboard:**
   - Toggle from "Test mode" to "Live mode"
   - All webhooks automatically work in both modes

2. **Create Live Mode Webhook:**
   - Same URL: `https://quantumstrategies.online/api/stripe-webhook`
   - Same event: `checkout.session.completed`
   - Get new signing secret (different from test mode)

3. **Update `.env.production`:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_live_secret_here
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

5. **Make ONE real purchase** ($7 - you'll keep it):
   - Use real credit card
   - Verify everything works
   - Don't refund (you earned it!)

### Start Selling! 🎉

Your payment system is now live and ready to handle customers.

---

## 📞 Quick Debugging

### If webhook doesn't fire:

```bash
# Check Vercel logs
vercel logs --prod --follow

# Should see: "Stripe webhook received"
```

### If email doesn't send:

```bash
# Verify credentials in .env.production
vercel env pull

# Check these are populated:
grep GOOGLE_GMAIL_PRIVATE_KEY .env.production
grep GOOGLE_DRIVE_PRIVATE_KEY .env.production
```

### If product access not granted:

```sql
-- Manually grant access (emergency)
INSERT INTO product_access (user_id, product_slug, access_granted, stripe_session_id, amount_paid, purchase_date)
SELECT
  id,
  'quantum-initiation',
  true,
  'manual_grant_' || now(),
  7.00,
  now()
FROM users
WHERE email = 'customer@example.com';
```

---

## 🎯 Next Steps After First Sale

1. **Monitor:** Check Stripe dashboard every few hours
2. **Respond:** Reply to customer emails within 1 hour
3. **Improve:** Collect feedback from first 10 customers
4. **Scale:** Once 20+ sales, automate more

---

**Total Time:** 30 minutes
**Result:** Fully functional payment system ready to sell

Good luck! 🚀
