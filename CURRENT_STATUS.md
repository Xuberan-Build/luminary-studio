# Quantum Strategies - Current Status & Architecture

**Last Updated:** 2025-12-27
**Production URL:** https://quantumstrategies.online
**Branch Strategy:** `nextjs` (development) → `main` (production)

---

## 🚀 Deployment Status

### ✅ Recently Deployed Features
- Product experience upload fix (starts at upload stage, not confirmation gate)
- Extraction API with detailed logging
- Affiliate onboarding opt-in system (4 new API routes)
- Database security fixes (RLS policies, function search_path)

### ⚠️ Pending Tasks
- [ ] Run 3 database migrations (006, 007, 008) in Supabase
- [ ] Debug GPT extraction issue (logs now in place)
- [ ] Test affiliate onboarding flow
- [ ] Enable leaked password protection in Supabase Auth settings

---

## 📁 Project Structure

```
luminary-studio-nextjs/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (content)/           # Protected product pages
│   │   │   └── products/quantum-initiation/
│   │   ├── (marketing)/         # Public pages
│   │   ├── dashboard/           # User dashboard
│   │   │   ├── page.tsx        # Main dashboard
│   │   │   ├── affiliate/      # Affiliate system
│   │   │   │   ├── page.tsx    # Affiliate dashboard
│   │   │   │   ├── welcome/    # NEW: Opt-in onboarding
│   │   │   │   └── onboarding/ # Stripe Connect setup
│   │   │   └── sessions/[id]/  # Product session viewer
│   │   ├── products/[slug]/experience/  # Product experience flow
│   │   └── api/                # API routes
│   │       ├── auth/           # Auth endpoints
│   │       ├── products/       # Product APIs (extraction, insights)
│   │       ├── affiliate/      # NEW: Affiliate APIs
│   │       ├── stripe-webhook/ # Payment processing
│   │       └── cron/           # Scheduled tasks
│   ├── components/
│   │   ├── product-experience/ # Product flow components
│   │   ├── portal/             # Dashboard navigation
│   │   └── legal/              # NEW: Cookie consent, etc.
│   └── lib/
│       ├── ai/                 # OpenAI integration
│       ├── stripe/             # Stripe & Connect
│       ├── supabase/           # Database client
│       ├── email/              # Gmail API
│       └── affiliate/          # Commission processing
├── database/
│   └── migrations/             # SQL migrations
└── scripts/                    # Utility scripts
```

---

## 🗄️ Database Schema

### Core Tables

**users**
- Primary user table synced from Supabase Auth
- Fields: id, email, name, stripe_customer_id
- Affiliate fields: is_affiliate, total_earnings_cents, available_balance_cents
- NEW: affiliate_opted_out, first_affiliate_visit

**product_access**
- Grants users access to purchased products
- Triggers auto_enroll_affiliate() on first purchase

**product_sessions**
- Stores user progress through product experience
- Fields: user_id, product_slug, current_step, placements (JSONB)

**conversations**
- Stores AI conversation history for product experiences

**uploaded_documents**
- Tracks files uploaded by users
- References: user_id, session_id, storage_path

### Affiliate System Tables

**referral_hierarchy**
- Core affiliate tracking
- Fields: referral_code (8-char unique), referral_link, current_track
- Stripe Connect: stripe_connect_account_id, onboarding flags
- NEW: Auto-respects affiliate_opted_out flag

**affiliate_transactions**
- Commission tracking per sale
- Fields: direct_commission_cents, override_commission_cents, commission_status

**stripe_connect_onboarding**
- Stripe Connect account status
- Fields: details_submitted, charges_enabled, payouts_enabled, requirements (JSONB)

**dinner_party_pools & dinner_party_contributions**
- Community contribution fund system
- Pools fill to target amount, then release

**track_changes**
- Audit log for affiliate track changes

---

## 📦 Storage Buckets

### `user-uploads` (ACTIVE)
**Purpose:** User chart uploads for product experience
**Location:** Supabase Storage
**Structure:** `{userId}/{sessionId}/{timestamp}_{filename}`
**Access:**
- Users can upload to own folder (authenticated)
- Service role can read/sign URLs for GPT extraction
- Signed URLs valid for 10 minutes

**IMPORTANT:** This is the CORRECT bucket name. Do NOT change to `product-uploads`.

### Storage Policies
- Users can INSERT into their own folder
- Users can SELECT their own files
- Public can SELECT (for signed URL access)
- Service role has full access

---

## 🔌 API Routes

### Product APIs

**POST /api/products/extract-placements**
- Extracts chart placements using GPT-5.2 Vision
- Input: `{ storagePaths: string[] }` (paths in user-uploads bucket)
- Process:
  1. Downloads PDFs, extracts text
  2. Creates signed URLs for images
  3. Categorizes as Astrology or Human Design
  4. Calls OpenAI GPT-5.2 with images
  5. Returns structured placements JSON
- **Status:** ✅ Has detailed logging for debugging
- **Known Issue:** Not extracting in production (investigating with logs)

**POST /api/products/step-insight**
- Generates AI response for each product step
- Uses GPT model with placements context

**POST /api/products/followup-response**
- Handles follow-up questions in product experience

**POST /api/products/final-briefing**
- Generates final deliverable/blueprint

### Affiliate APIs (NEW)

**GET /api/affiliate/check-enrollment**
- Checks if user is enrolled, opted out, or needs onboarding
- Returns: `{ isEnrolled, hasOptedOut, isAffiliate }`

**POST /api/affiliate/enroll**
- Enrolls user in affiliate program
- Generates referral code, creates Stripe Connect account
- Non-blocking: Stripe failure doesn't stop enrollment

**POST /api/affiliate/opt-out**
- Marks user as opted out (sets affiliate_opted_out = true)

**GET /api/affiliate/referral-status**
- Checks if user was referred by someone

**GET /api/affiliate/stats**
- Returns affiliate dashboard data
- Calls `get_affiliate_stats()` database function

**POST /api/affiliate/onboarding**
- Creates Stripe Connect account link
- Returns onboarding URL

### Webhook

**POST /api/stripe-webhook**
- Processes `checkout.session.completed` events
- Creates user if needed, grants product access
- Auto-enrolls user as affiliate (if not opted out)
- Processes referral commissions
- Sends welcome email

---

## 🔐 Environment Variables

### Required in Vercel Production

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Stripe:**
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

**OpenAI:**
- `OPENAI_API_KEY` (Must have GPT-5.2 access)

**Google APIs:**
- `GOOGLE_DRIVE_PRIVATE_KEY`
- `GOOGLE_GMAIL_PRIVATE_KEY`

**Site:**
- `NEXT_PUBLIC_SITE_URL` = `https://quantumstrategies.online`

---

## 🎯 Feature Status

### ✅ Working Features

**Authentication:**
- ✅ Signup/login with Supabase Auth
- ✅ Protected routes via middleware
- ✅ Session management

**Product Experience:**
- ✅ 5-step questionnaire flow
- ✅ File upload to user-uploads bucket
- ✅ Upload interface starts correctly (fixed 2025-12-27)
- ⚠️ Chart extraction (investigating - logs added)
- ✅ AI-powered step insights
- ✅ Follow-up chat system
- ✅ Final blueprint generation

**Stripe Integration:**
- ✅ Checkout with payment links
- ✅ Webhook processes payments
- ✅ Product access granted automatically
- ✅ Welcome email sent

**Affiliate System:**
- ✅ Two-level commission tracking (direct + override)
- ✅ Three tracks: Community Builder (30%), High Performer (40%), Independent (60%)
- ✅ Stripe Connect for payouts
- ✅ Dinner party pool contributions
- ✅ Affiliate dashboard with stats
- ✅ Auto-enrollment on first purchase
- ✅ NEW: Opt-in onboarding flow

### ⚠️ Issues Being Investigated

**GPT Extraction Not Working:**
- **Symptom:** Tiona uploaded charts successfully but no placements extracted
- **Status:** Detailed logging added to production
- **Next Step:** Have user test and check Vercel function logs
- **Possible Causes:**
  - OpenAI API key issue
  - GPT-5.2 access/permissions
  - Signed URL CORS issue
  - API response parsing

---

## 🔄 User Flows

### New User Journey

1. **Sign Up** → Creates auth user + public.users record
2. **Purchase Product** → Stripe checkout
3. **Webhook Processes:**
   - Grants product access
   - Auto-enrolls as affiliate (if not opted out)
   - Creates Stripe Connect account
   - Sends welcome email
4. **Dashboard** → See purchased products
5. **First Affiliate Tab Click** → Redirect to welcome page (opt-in)
6. **Product Experience** → Upload → Extract → Steps → Deliverable

### Affiliate Onboarding

1. User clicks "Affiliate" tab
2. System checks enrollment status
3. **If not enrolled & not opted out:** → `/dashboard/affiliate/welcome`
4. Welcome page shows program benefits and tracks
5. User clicks "Join" → Enrolls with referral code
6. **Optional:** Set up Stripe Connect for payouts (can do later)
7. Redirect to affiliate dashboard

---

## 📊 Commission Structure

### Community Builder (30% direct)
- $2.10 direct commission per $7 sale
- $2.80 to dinner party pool
- $0.70 override on downline sales

### High Performer (40% direct)
- $2.80 direct commission per $7 sale
- $2.10 to dinner party pool
- $0.70 override on downline sales

### Independent (60% direct)
- $4.20 direct commission per $7 sale
- $0.00 to dinner party pool
- $0.70 override on downline sales

---

## 🔧 Database Functions

### Affiliate Functions
- `generate_referral_code()` - Creates unique 8-char code
- `auto_enroll_affiliate()` - Trigger on product_access insert (respects opt-out)
- `calculate_commission(amount, track, is_direct)` - Commission math
- `increment_affiliate_earnings(user_id, amount)` - Updates earnings
- `get_affiliate_stats(user_id)` - Dashboard data aggregation

### Product Functions
- `grant_product_access(email, product_slug, ...)` - Manual access grant
- `update_session_progress(session_id, step, total)` - Progress tracking

---

## 🛡️ Security

### Row Level Security (RLS)
- ✅ Enabled on: users, product_access, product_sessions, conversations
- ✅ NEW: Enabled on prompts, product_steps (migration 007)
- Users can only access their own data
- Service role bypasses RLS for webhooks/admin

### Function Security
- ✅ NEW: All functions have `search_path = public` (migration 008)
- Prevents search path injection attacks

### Input Validation
- Rate limiting on product APIs (30 req/min per session)
- Prompt injection protection
- File upload validation

---

## 📝 Pending Migrations

### 006_affiliate_opt_in_system.sql
- Adds `affiliate_opted_out` boolean to users
- Adds `first_affiliate_visit` timestamp
- Updates `auto_enroll_affiliate()` to respect opt-out

### 007_fix_rls_security.sql
- Enables RLS on `prompts` table
- Enables RLS on `product_steps` table
- Creates read policies for authenticated/anon users
- Service role full access policies

### 008_fix_function_search_path.sql
- Sets `search_path = public` on all 11 functions
- Prevents search path attacks
- Verification check included

**To run:** Copy SQL to Supabase SQL Editor and execute in order

---

## 🐛 Known Issues & Debugging

### Chart Extraction Issue
**Problem:** GPT not extracting placements in production
**Debugging Steps:**
1. Check Vercel function logs for `/api/products/extract-placements`
2. Look for console logs starting with `=== EXTRACTION API CALLED ===`
3. Check for OpenAI API errors with status codes
4. Verify `OPENAI_API_KEY` is set in Vercel

**Logs will show:**
- Storage paths received
- File processing (PDFs, images)
- Signed URL creation
- OpenAI model and request details
- Response or error

---

## 🎨 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Payments:** Stripe + Stripe Connect
- **AI:** OpenAI GPT-5.2
- **Email:** Gmail API
- **CRM:** Google Sheets
- **Deployment:** Vercel
- **Language:** TypeScript

---

## 📞 Support & Debugging

### How to Debug Issues

1. **Check Vercel Logs:**
   - Dashboard → Deployments → Functions tab
   - Filter by API route
   - Look for console.log and console.error outputs

2. **Check Supabase Logs:**
   - Dashboard → Logs → Postgres Logs
   - Look for RLS policy violations or query errors

3. **Check Browser Console:**
   - Network tab for API calls
   - Console for client-side errors

4. **Check Database:**
   - Query tables directly in SQL Editor
   - Verify data exists where expected

---

## 🔮 Next Steps

1. ✅ Deploy extraction logging to production (DONE)
2. ⏳ Have Tiona test extraction again
3. ⏳ Check Vercel logs for exact error
4. ⏳ Run pending database migrations
5. ⏳ Test affiliate onboarding flow
6. ⏳ Enable leaked password protection in Supabase Auth
7. ⏳ Update React to latest secure version
