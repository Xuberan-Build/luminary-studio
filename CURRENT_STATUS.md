# Quantum Strategies - Current Status & Architecture

**Last Updated:** 2025-12-27
**Production URL:** https://quantumstrategies.online
**Branch Strategy:** `nextjs` (development) → `main` (production)

---

## 🚀 Deployment Status

### ✅ Recently Deployed Features
- ✅ **Chart extraction fixes** - PDF text now correctly categorized (astrology vs HD)
- ✅ **GPT response generation fixes** - Increased token limits for GPT-5 reasoning models
- ✅ **Wizard personality** - QBF Wizard introduction on first response
- ✅ **High school clarity** - All prompts updated for simple, accessible language
- ✅ **Wizard nudges synthesis** - Step insights now integrated into final blueprint
- ✅ **PDF downloads** - Deliverable downloads as formatted PDF (was .md file)
- ✅ **Step 2 question updated** - Now asks current alignment (1-10) + desired state
- ✅ Product experience upload fix (starts at upload stage, not confirmation gate)
- ✅ Extraction API with detailed logging
- ✅ Affiliate onboarding opt-in system (4 new API routes)
- ✅ Database security fixes (RLS policies, function search_path)

### 🆕 Just Implemented (Not Yet Deployed)
- ✅ **Affiliate email sequence system** - Automated email 30 min after deliverable completion
- ✅ **EmailSequenceService** - Database-driven email scheduling and management
- ✅ **EmailTemplateService** - Personalized email templates with opt-out links
- ✅ **Cron job for email processing** - Runs every 5 minutes via Vercel Cron
- ✅ **One-click email opt-out** - Unsubscribe endpoint with no auth required
- ✅ **TypeScript database types** - Complete type safety for all tables

### ⚠️ Pending Tasks
- [ ] Run 5 database migrations (006, 007, 008, 009, update-prompts) in Supabase
- [ ] Test affiliate onboarding flow
- [ ] Test affiliate email sequence flow
- [ ] Enable leaked password protection in Supabase Auth settings
- [ ] Clean up hardcoded "Quantum Brand Architect" language in API routes
- [ ] Consolidate multi-source prompting architecture

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
│   ├── lib/
│   │   ├── ai/                 # OpenAI integration
│   │   ├── stripe/             # Stripe & Connect
│   │   ├── supabase/           # Database client
│   │   ├── email/              # Gmail API
│   │   ├── affiliate/          # Commission processing
│   │   └── services/           # NEW: Business logic services
│   │       ├── EmailSequenceService.ts
│   │       └── EmailTemplateService.ts
│   └── types/
│       └── database.ts         # NEW: TypeScript types for all tables
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

**email_sequences** (NEW)
- Automated email scheduling and delivery tracking
- Fields: user_id, sequence_type, trigger_event, scheduled_send_at, email_status
- Email content stored as JSONB (product_name, deliverable_preview, etc.)
- Statuses: scheduled, sent, failed, cancelled
- Unique constraint: one active sequence per user per type
- Auto-cancels when user enrolls or opts out

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
- Extracts chart placements using GPT-4o Vision (was gpt-5.2)
- Input: `{ storagePaths: string[] }` (paths in user-uploads bucket)
- Process:
  1. Downloads PDFs, extracts text with pdf-parse
  2. **Categorizes PDF text separately** for astrology vs HD
  3. Creates signed URLs for images (categorized by filename)
  4. Calls OpenAI GPT-4o Vision with images + PDF text
  5. Returns structured placements JSON
- **Status:** ✅ Working - PDF text categorization fixed
- **Recent Fix:** PDF text was going to single array (only HD got text, astrology got null)

**POST /api/products/step-insight**
- Generates AI response for each product step
- Uses GPT-5 reasoning model with placements context
- **Token Limit:** 10,000 (increased from 2,000 for GPT-5 thinking tokens)
- **Prompts:** Loads from database `prompts` table (scope='step_insight') with fallback
- **Recent Changes:**
  - First response (Step 2) introduces "QBF Wizard"
  - All responses written at high school reading level
  - Explains astrology/HD terms in plain English
  - Ends with one powerful next step
- New idea: Add token budget data based on users.
-Allow users to deep dive with their  for clarity after the chart has 

**POST /api/products/followup-response**
- Handles follow-up questions in product experience
- **Token Limit:** 10,000 (increased from 2,000)
- **Prompts:** Loads from database (scope='followup')
- Simple, clear language for accessibility

**POST /api/products/final-briefing**
- Generates final deliverable/blueprint
- **Token Limit:** 15,000 (increased from 3,000)
- **Temperature:** Uses default (1) - GPT-5 doesn't support custom values
- **Recent Changes:**
  - Extracts user responses + wizard's actionable nudges separately
  - Synthesizes nudges into execution spine
  - 7-section structure with high school clarity
  - References money/revenue goals from conversation
- **Prompts:** Loads from database (scope='final_briefing')

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

**GET /api/affiliate/opt-out-email** (NEW)
- One-click email unsubscribe (no auth required)
- Sets affiliate_opted_out = true
- Cancels pending email sequences
- Returns HTML success/error page

### Cron Jobs

**GET /api/cron/send-affiliate-emails** (NEW)
- Runs every 5 minutes via Vercel Cron
- Fetches up to 50 scheduled emails ready to send
- Validates emails still eligible (user hasn't enrolled/opted out)
- Sends via Gmail API using EmailTemplateService
- Updates email_status (sent, failed, cancelled)
- Requires CRON_SECRET authorization header

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
- `GOOGLE_GMAIL_CLIENT_EMAIL`
- `GMAIL_FROM_EMAIL` (e.g., hello@quantumstrategies.online)
- `GMAIL_FROM_NAME` (e.g., Quantum Strategies)

**Site:**
- `NEXT_PUBLIC_SITE_URL` = `https://quantumstrategies.online`

**Cron:**
- `CRON_SECRET` - Secret token for authenticating cron job requests

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
- ✅ Upload interface starts correctly
- ✅ Chart extraction from PDFs and images (GPT-4o Vision)
- ✅ AI-powered step insights with QBF Wizard personality
- ✅ Follow-up chat system with high school clarity
- ✅ Final blueprint generation (synthesizes wizard nudges)
- ✅ PDF download with formatting (headers, bold, wrapping, multi-page)

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
- ✅ Opt-in onboarding flow
- 🆕 **Automated email sequences** (implemented, not yet deployed):
  - Sends affiliate invitation 30 min after deliverable completion
  - Personalized with user name, product name, deliverable preview
  - One-click opt-out with no authentication required
  - Auto-cancels if user enrolls or opts out
  - Cron-based processing every 5 minutes
  - Full email tracking (scheduled, sent, failed, cancelled)

---

## 🔄 User Flows

### New User Journey

1. **Sign Up** → Creates auth user + public.users record
2. **Purchase Product** → Stripe checkout
3. **Webhook Processes:**
   - Grants product access
   - Sends welcome email
4. **Dashboard** → See purchased products
5. **Product Experience** → Upload → Extract → Steps → Deliverable
6. **Deliverable Completion** → 🆕 Schedules affiliate invitation email (30 min delay)
7. **Email Sent** → 🆕 User receives personalized affiliate invitation with opt-out link
8. **First Affiliate Tab Click** → Redirect to welcome page (opt-in) OR dashboard (if opted out)

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

### Email Sequence Functions (NEW)
- `cancel_user_pending_emails(user_id)` - Cancel all scheduled emails for user
- `cleanup_old_email_sequences(days_to_keep)` - Delete old emails (retention policy)
- `update_email_sequences_updated_at()` - Auto-update timestamp trigger

---

## 🛡️ Security

### Row Level Security (RLS)
- ✅ Enabled on: users, product_access, product_sessions, conversations
- ✅ Enabled on: prompts, product_steps (migration 007)
- 🆕 Enabled on: email_sequences (migration 009)
- Users can only access their own data
- Service role bypasses RLS for webhooks/admin/cron

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

### 009_email_sequences.sql (NEW - EMAIL AUTOMATION)
- Creates `email_sequences` table for automated email scheduling
- Fields: user_id, sequence_type, trigger_event, scheduled_send_at, email_status, email_content (JSONB)
- Indexes: scheduled emails, user lookup, analytics
- RLS policies: users view own, service role full access
- Helper functions: `cancel_user_pending_emails()`, `cleanup_old_email_sequences()`
- **Required for:** Affiliate invitation email automation

### update-prompts-quantum-initiation.sql (CRITICAL FOR NEW FEATURES)
- Updates Step 2 question to ask current alignment (1-10) + desired state
- Updates system prompt for QBF Wizard
- Updates step_insight prompt (introduces wizard on first response, high school clarity)
- Updates followup prompt (simple language, explain terms)
- Updates final_briefing prompt (7-section structure, synthesize nudges)
- **Required for:** Wizard personality, high school clarity, nudge synthesis

**To run:** Copy SQL to Supabase SQL Editor and execute in order (006, 007, 008, 009, then update-prompts)

---

## 🐛 Known Issues & Debugging

### ✅ Recently Fixed Issues

**Chart Extraction (FIXED 2025-12-27):**
- **Problem:** PDF text wasn't being categorized correctly
- **Solution:** Split into separate arrays for astrology vs HD
- **Root Cause:** All PDF text was going to single array, only sent to HD extraction

**Empty GPT Responses (FIXED 2025-12-27):**
- **Problem:** GPT-5 returning empty content with finish_reason: "length"
- **Solution:** Increased max_completion_tokens (10k-15k) to account for thinking tokens
- **Root Cause:** GPT-5 reasoning models use tokens for both thinking and output

**Temperature Parameter Error (FIXED 2025-12-27):**
- **Problem:** 400 error on temperature parameter
- **Solution:** Removed temperature parameter (GPT-5 only supports default=1)

### Debugging Steps for Future Issues

1. **Check Vercel Function Logs:**
   - Dashboard → Deployments → Functions tab
   - Filter by API route
   - Look for console logs starting with `===`

2. **Check OpenAI API Errors:**
   - Look for status codes (400, 401, 429, 500)
   - Check model names and parameters
   - Verify `OPENAI_API_KEY` in Vercel

3. **Check Extraction Logs:**
   - Storage paths received
   - File processing (PDFs, images)
   - Signed URL creation
   - Model and request details

---

## 🎨 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Payments:** Stripe + Stripe Connect
- **AI Models:**
  - GPT-4o (chart extraction with vision)
  - GPT-4o-mini (lightweight conversations)
  - GPT-5 (reasoning model for step insights, followups, final briefing)
- **PDF Processing:** pdf-parse (text extraction), jsPDF (client-side generation)
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

### Immediate (Production Ready)
1. ✅ Chart extraction fixes - DEPLOYED
2. ✅ GPT response generation fixes - DEPLOYED
3. ✅ Wizard personality improvements - DEPLOYED
4. ✅ PDF download functionality - DEPLOYED
5. ⏳ **Run pending database migrations** (006, 007, 008, update-prompts)
6. ⏳ Test complete product experience flow with new wizard personality
7. ⏳ Test affiliate onboarding flow

### Architecture Improvements (Planned)
1. ⏳ Consolidate multi-source prompting (database-first with clear fallbacks)
2. ⏳ Remove hardcoded "Quantum Brand Architect" language
3. ⏳ Create PromptService class for centralized prompt loading
4. ⏳ Extract PDF generation into reusable service
5. ⏳ Add comprehensive TypeScript types for all database schemas

### Security & Maintenance
1. ⏳ Enable leaked password protection in Supabase Auth
2. ⏳ Update React to latest secure version
3. ⏳ Review and optimize AI token usage costs
