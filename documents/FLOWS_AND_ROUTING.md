# Application Flows & Routing Documentation

**Last Updated:** 2025-12-27
**Purpose:** Comprehensive documentation of all user flows, routing, and pathways through the application

---

## 📋 Table of Contents

1. [Authentication Flows](#authentication-flows)
2. [Product Purchase Flow](#product-purchase-flow)
3. [Product Experience Flow](#product-experience-flow)
4. [Affiliate System Flows](#affiliate-system-flows)
5. [Payment & Webhook Flow](#payment--webhook-flow)
6. [Email Flows](#email-flows)
7. [File Upload & Processing Flow](#file-upload--processing-flow)
8. [API Routing Architecture](#api-routing-architecture)
9. [Database Flow Patterns](#database-flow-patterns)
10. [Error Handling Flows](#error-handling-flows)

---

## 🔐 Authentication Flows

### Signup Flow

```
User Journey:
┌─────────────────────────────────────────────────────────────────┐
│ 1. User visits /signup                                          │
│    ↓                                                             │
│ 2. Component: src/app/(auth)/login/page.tsx                     │
│    - Renders signup form                                        │
│    - Email + password fields                                    │
│    ↓                                                             │
│ 3. User submits form                                            │
│    ↓                                                             │
│ 4. Client calls: supabase.auth.signUp()                         │
│    ↓                                                             │
│ 5. Supabase Auth creates user in auth.users table               │
│    ↓                                                             │
│ 6. Database Trigger: create_user_on_signup()                    │
│    - Automatically creates record in public.users table         │
│    - Copies: id, email from auth.users                          │
│    ↓                                                             │
│ 7. Redirect to /dashboard                                       │
│    ↓                                                             │
│ 8. Middleware checks auth: src/middleware.ts                    │
│    - Verifies session exists                                    │
│    - Allows access to protected routes                          │
└─────────────────────────────────────────────────────────────────┘
```

**Files Involved:**
- `/src/app/(auth)/login/page.tsx` - Signup UI
- `/src/middleware.ts` - Route protection
- `/database/migrations/001_initial_schema.sql` - Trigger definition

**Database Tables:**
- `auth.users` (Supabase managed)
- `public.users` (Application managed)

---

### Login Flow

```
User Journey:
┌─────────────────────────────────────────────────────────────────┐
│ 1. User visits /login                                           │
│    ↓                                                             │
│ 2. Component: src/app/(auth)/login/page.tsx                     │
│    - Renders login form                                         │
│    ↓                                                             │
│ 3. User submits credentials                                     │
│    ↓                                                             │
│ 4. Client calls: supabase.auth.signInWithPassword()             │
│    ↓                                                             │
│ 5. Supabase validates credentials                               │
│    - Returns session token                                      │
│    - Sets httpOnly cookie                                       │
│    ↓                                                             │
│ 6. Redirect to /dashboard                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Session Management:**
- Cookies stored in browser (httpOnly, secure)
- Middleware validates on every protected route
- Auto-refresh handled by Supabase client

---

### Logout Flow

```
User Journey:
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks logout button                                    │
│    ↓                                                             │
│ 2. Client calls: supabase.auth.signOut()                        │
│    ↓                                                             │
│ 3. Supabase clears session                                      │
│    - Deletes cookies                                            │
│    - Invalidates tokens                                         │
│    ↓                                                             │
│ 4. Redirect to /login                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💳 Product Purchase Flow

### Complete Purchase Journey

```
User Journey:
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Product Discovery                                              │
│ ────────────────────────────────────────────────────────────────────── │
│ 1. User visits marketing page (e.g., /products/quantum-initiation)     │
│    - Marketing layout: src/app/(marketing)/layout.tsx                  │
│    - CTA button with Stripe payment link                               │
│    ↓                                                                    │
│ 2. User clicks "Purchase" button                                       │
│    - Redirects to Stripe Checkout (external)                           │
│    - URL contains referral code if present (from cookie)               │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ STEP 2: Stripe Checkout (External)                                     │
│ ────────────────────────────────────────────────────────────────────── │
│ 3. Stripe Checkout page                                                │
│    - User enters payment details                                       │
│    - Email address (may differ from signup email)                      │
│    ↓                                                                    │
│ 4. User completes payment                                              │
│    - Stripe processes card                                             │
│    - Creates Stripe Customer                                           │
│    - Creates Stripe Subscription/Payment                               │
│    ↓                                                                    │
│ 5. Stripe sends webhook to your app                                    │
│    - Event: checkout.session.completed                                 │
│    - Endpoint: POST /api/stripe-webhook                                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ STEP 3: Webhook Processing (Server-Side)                               │
│ ────────────────────────────────────────────────────────────────────── │
│ 6. Webhook handler: /src/app/api/stripe-webhook/route.ts               │
│    ↓                                                                    │
│ 7. Verify webhook signature                                            │
│    - Ensures request is from Stripe                                    │
│    - Uses STRIPE_WEBHOOK_SECRET                                        │
│    ↓                                                                    │
│ 8. Extract data from webhook event:                                    │
│    - customer_email                                                    │
│    - stripe_customer_id                                                │
│    - product_slug (from metadata)                                      │
│    - referral_code (from metadata if present)                          │
│    ↓                                                                    │
│ 9. Check if user exists (by email)                                     │
│    - Query: SELECT * FROM users WHERE email = ?                        │
│    ↓                                                                    │
│    ┌─────────────────────┬─────────────────────┐                       │
│    │ User NOT Found      │ User Found          │                       │
│    │ ↓                   │ ↓                   │                       │
│    │ Create user:        │ Update user:        │                       │
│    │ - auth.users        │ - stripe_customer_id│                       │
│    │ - public.users      │                     │                       │
│    └─────────────────────┴─────────────────────┘                       │
│    ↓                                                                    │
│ 10. Grant product access                                               │
│     - INSERT INTO product_access (user_id, product_slug)               │
│     ↓                                                                   │
│ 11. Database Trigger: auto_enroll_affiliate()                          │
│     - Checks: Is this user's FIRST product purchase?                   │
│     - Checks: Has user opted out of affiliate program?                 │
│     ↓                                                                   │
│     ┌────────────────────────────────────────┐                         │
│     │ First purchase + NOT opted out         │                         │
│     │ ↓                                       │                         │
│     │ Auto-enroll as affiliate:               │                         │
│     │ - Generate unique referral_code         │                         │
│     │ - Create referral_link                  │                         │
│     │ - Set current_track = 'community_builder'│                        │
│     │ - Link to referrer if code exists       │                         │
│     │ - Create Stripe Connect account         │                         │
│     │ - INSERT INTO referral_hierarchy        │                         │
│     └────────────────────────────────────────┘                         │
│     ↓                                                                   │
│ 12. Process referral commissions (if referred)                         │
│     - Calculate direct commission (30%/40%/60% based on track)         │
│     - Calculate override commission (0.70 for upline)                  │
│     - Calculate dinner party contribution                              │
│     - INSERT INTO affiliate_transactions                               │
│     - Call increment_affiliate_earnings() for each affiliate           │
│     ↓                                                                   │
│ 13. Send welcome email                                                 │
│     - Gmail API: lib/email/gmail.ts                                    │
│     - Contains product access instructions                             │
│     - Product-specific welcome message                                 │
│     ↓                                                                   │
│ 14. Return 200 OK to Stripe                                            │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ STEP 4: User Returns to Site                                           │
│ ────────────────────────────────────────────────────────────────────── │
│ 15. User clicks link in welcome email OR visits /dashboard             │
│     ↓                                                                   │
│ 16. Dashboard loads: /src/app/dashboard/page.tsx                       │
│     - Fetches user's product_access records                            │
│     - Shows purchased products as cards                                │
│     - Each card has "Start Experience" button                          │
│     ↓                                                                   │
│ 17. User clicks "Start Experience"                                     │
│     - Navigates to /products/[slug]/experience                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Decision Points:**

1. **User Creation:**
   - If email exists → Update stripe_customer_id
   - If email not exists → Create auth user + public user

2. **Affiliate Enrollment:**
   - Only on FIRST product purchase
   - Only if NOT opted out
   - Automatic - no user action required

3. **Commission Processing:**
   - Only if referred_by_code exists
   - Calculates based on referrer's track
   - Updates both direct and override earnings

**Files Involved:**
- `/src/app/api/stripe-webhook/route.ts` - Main webhook handler
- `/database/migrations/003_affiliate_functions.sql` - auto_enroll_affiliate() trigger
- `/src/lib/email/gmail.ts` - Welcome email sender
- `/src/lib/affiliate/commission-processor.ts` - Commission calculations

---

## 🎯 Product Experience Flow

### Complete Product Journey

```
User Journey:
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Session Initialization                                        │
│ ────────────────────────────────────────────────────────────────────── │
│ 1. User clicks "Start Experience" from dashboard                       │
│    - Route: /products/[slug]/experience                                │
│    ↓                                                                    │
│ 2. Page loads: src/app/products/[slug]/experience/page.tsx             │
│    - Server component checks product access                            │
│    - Query: SELECT * FROM product_access WHERE user_id AND product_slug│
│    ↓                                                                    │
│    ┌─────────────────────┬─────────────────────┐                       │
│    │ No Access           │ Has Access          │                       │
│    │ ↓                   │ ↓                   │                       │
│    │ Redirect to /dashboard │ Continue          │                       │
│    └─────────────────────┴─────────────────────┘                       │
│    ↓                                                                    │
│ 3. Fetch or create product session                                     │
│    - Query: SELECT * FROM product_sessions WHERE user_id AND product_slug│
│    ↓                                                                    │
│    ┌─────────────────────┬─────────────────────┐                       │
│    │ Session Exists      │ No Session          │                       │
│    │ ↓                   │ ↓                   │                       │
│    │ Load existing session│ Create new session  │                       │
│    │ - Resume at current_step│ - current_step = 1   │                   │
│    │                     │ - placements = null │                       │
│    └─────────────────────┴─────────────────────┘                       │
│    ↓                                                                    │
│ 4. Load product definition                                             │
│    - Query: SELECT * FROM product_definitions WHERE product_slug       │
│    - Includes: steps (JSONB), system_prompt, name                      │
│    ↓                                                                    │
│ 5. Render ProductExperience component                                  │
│    - Component: src/components/product-experience/ProductExperience.tsx│
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: File Upload (Step 1)                                          │
│ ────────────────────────────────────────────────────────────────────── │
│ 6. Check if step allows file upload                                    │
│    - step.allow_file_upload = true for Step 1                          │
│    ↓                                                                    │
│ 7. Render FileUploadStep component                                     │
│    - Dropzone for drag & drop                                          │
│    - Accepts: PDF, PNG, JPG                                            │
│    - Instructions: "Upload Birth Chart + Human Design Chart"           │
│    ↓                                                                    │
│ 8. User selects/drops files                                            │
│    ↓                                                                    │
│ 9. Client-side upload to Supabase Storage                              │
│    - Bucket: user-uploads                                              │
│    - Path: {userId}/{sessionId}/{timestamp}_{filename}                 │
│    - Multiple files allowed                                            │
│    ↓                                                                    │
│ 10. Store file paths in state                                          │
│     - uploadedFiles: string[] (storage paths)                          │
│     ↓                                                                   │
│ 11. Record in database: uploaded_documents                             │
│     - INSERT INTO uploaded_documents (user_id, session_id, storage_path)│
│     ↓                                                                   │
│ 12. User clicks "Extract Placements" button                            │
│     ↓                                                                   │
│ 13. Call extraction API                                                │
│     - POST /api/products/extract-placements                            │
│     - Body: { sessionId, storagePaths: [...] }                         │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: Chart Extraction (GPT Vision Processing)                      │
│ ────────────────────────────────────────────────────────────────────── │
│ 14. API Route: src/app/api/products/extract-placements/route.ts        │
│     ↓                                                                   │
│ 15. For each storage path:                                             │
│     ↓                                                                   │
│     A. Download file from storage                                      │
│        - Use service role to bypass RLS                                │
│        - Create signed URL (10 min expiry)                             │
│        ↓                                                                │
│     B. Categorize file (Astrology vs Human Design)                     │
│        - Check filename for keywords: 'hd', 'human', 'design', 'bodygraph'│
│        ↓                                                                │
│     C. Process based on file type:                                     │
│        ↓                                                                │
│        ┌─────────────────┬─────────────────┐                           │
│        │ PDF File        │ Image File      │                           │
│        │ ↓               │ ↓               │                           │
│        │ Extract text:   │ Create signed URL│                          │
│        │ - pdf-parse lib │ - For GPT Vision│                           │
│        │ - Get first 8000 chars│            │                           │
│        │ - Add to astro or HD array│       │                           │
│        └─────────────────┴─────────────────┘                           │
│        ↓                                                                │
│ 16. Call GPT-4o Vision API (twice - separate extractions)              │
│     ↓                                                                   │
│     A. Astrology Extraction:                                           │
│        - Model: gpt-4o                                                 │
│        - Input: astro images (up to 3) + astro PDF texts              │
│        - Prompt: Extract Sun, Moon, Rising, Houses, Planets            │
│        - Output: JSON with placements                                  │
│        ↓                                                                │
│     B. Human Design Extraction:                                        │
│        - Model: gpt-4o                                                 │
│        - Input: HD images (up to 3) + HD PDF texts                    │
│        - Prompt: Extract Type, Strategy, Authority, Profile, Centers   │
│        - Output: JSON with placements                                  │
│        ↓                                                                │
│ 17. Merge extraction results                                           │
│     - Combine astrology + human_design objects                         │
│     - Structure: { astrology: {...}, human_design: {...} }             │
│     ↓                                                                   │
│ 18. Update product_sessions table                                      │
│     - UPDATE product_sessions SET placements = ? WHERE id = sessionId  │
│     ↓                                                                   │
│ 19. Return placements to client                                        │
│     - Response: { placements: {...} }                                  │
│     ↓                                                                   │
│ 20. Client updates UI                                                  │
│     - Shows extracted placements                                       │
│     - "Continue" button enabled                                        │
│     ↓                                                                   │
│ 21. User clicks "Continue" → Advances to Step 2                        │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Questionnaire Steps (Steps 2-5)                               │
│ ────────────────────────────────────────────────────────────────────── │
│ 22. Render QuestionStep component                                      │
│     - Shows step title                                                 │
│     - Shows step question                                              │
│     - Textarea for user response                                       │
│     ↓                                                                   │
│ 23. User types answer                                                  │
│     ↓                                                                   │
│ 24. User clicks "Submit Answer"                                        │
│     ↓                                                                   │
│ 25. Call step insight API                                              │
│     - POST /api/products/step-insight                                  │
│     - Body: {                                                          │
│         sessionId,                                                     │
│         stepNumber,                                                    │
│         stepData: { title, question },                                 │
│         mainResponse: "user's answer",                                 │
│         placements: { astrology: {...}, human_design: {...} },         │
│         systemPrompt: "from product_definitions",                      │
│         productSlug                                                    │
│       }                                                                 │
│     ↓                                                                   │
│ 26. API Route: src/app/api/products/step-insight/route.ts              │
│     ↓                                                                   │
│ 27. Load prompts from database                                         │
│     - Query: SELECT prompt FROM prompts                                │
│              WHERE product_slug = ? AND scope = 'step_insight'         │
│     - Fallback if not found (hardcoded in route)                       │
│     ↓                                                                   │
│ 28. Build placement summary string                                     │
│     - Astrology: Sun, Moon, Rising, Houses, Planets                    │
│     - Human Design: Type, Strategy, Authority, Profile, Centers        │
│     ↓                                                                   │
│ 29. Call GPT-5 reasoning model                                         │
│     - Model: gpt-5                                                     │
│     - Messages: [                                                      │
│         { role: 'system', content: systemPrompt + context },           │
│         { role: 'user', content: user's answer }                       │
│       ]                                                                 │
│     - max_completion_tokens: 10000 (for thinking + output)             │
│     - Special for Step 2: Wizard introduces itself                     │
│     ↓                                                                   │
│ 30. GPT generates personalized insight                                 │
│     - Grounds in chart placements                                      │
│     - High school reading level                                        │
│     - Ends with actionable next step                                   │
│     ↓                                                                   │
│ 31. Log conversation to database                                       │
│     - INSERT/UPDATE conversations table                                │
│     - Structure: {                                                     │
│         session_id,                                                    │
│         step_number,                                                   │
│         messages: [                                                    │
│           { role: 'user', content: answer, type: 'user_response' },    │
│           { role: 'assistant', content: insight, type: 'step_insight' }│
│         ]                                                              │
│       }                                                                 │
│     ↓                                                                   │
│ 32. Return insight to client                                           │
│     - Response: { aiResponse: "..." }                                  │
│     ↓                                                                   │
│ 33. Client displays AI insight                                         │
│     - Wizard card with gradient background                             │
│     - Formatted text with proper line breaks                           │
│     ↓                                                                   │
│ 34. User can ask follow-up questions                                   │
│     ↓                                                                   │
│     ┌────────────────────────────────────────┐                         │
│     │ FOLLOW-UP LOOP                         │                         │
│     │ ───────────────────────────────────── │                         │
│     │ A. User types follow-up question       │                         │
│     │    ↓                                    │                         │
│     │ B. POST /api/products/followup-response│                         │
│     │    - Body: {                            │                         │
│     │        sessionId,                       │                         │
│     │        stepNumber,                      │                         │
│     │        followUpQuestion,                │                         │
│     │        conversationHistory: [...]       │                         │
│     │      }                                   │                         │
│     │    ↓                                    │                         │
│     │ C. Load followup prompt from DB         │                         │
│     │    ↓                                    │                         │
│     │ D. Call GPT-5 with full conversation   │                         │
│     │    - Includes all prior messages        │                         │
│     │    - max_completion_tokens: 10000       │                         │
│     │    ↓                                    │                         │
│     │ E. Return followup response             │                         │
│     │    ↓                                    │                         │
│     │ F. Log to conversations table           │                         │
│     │    - Append to messages array           │                         │
│     │    - Types: followup_question, followup_response│                │
│     │    ↓                                    │                         │
│     │ G. Display response                     │                         │
│     │    ↓                                    │                         │
│     │ [Loop back to A or continue to next step]│                        │
│     └────────────────────────────────────────┘                         │
│     ↓                                                                   │
│ 35. User clicks "Continue to Next Step"                                │
│     - current_step increments                                          │
│     - Repeat steps 22-35 for remaining steps (3, 4, 5)                 │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: Final Briefing Generation                                     │
│ ────────────────────────────────────────────────────────────────────── │
│ 36. After completing Step 5, user clicks "Generate Final Blueprint"    │
│     ↓                                                                   │
│ 37. Call final briefing API                                            │
│     - POST /api/products/final-briefing                                │
│     - Body: { sessionId, placements, productName, productSlug }        │
│     ↓                                                                   │
│ 38. API Route: src/app/api/products/final-briefing/route.ts            │
│     ↓                                                                   │
│ 39. Fetch ALL conversations for this session                           │
│     - Query: SELECT * FROM conversations                               │
│              WHERE session_id = ? ORDER BY created_at ASC              │
│     ↓                                                                   │
│ 40. Extract user responses (all steps)                                 │
│     - Filter messages where role = 'user'                              │
│     - Format: "Step X: user's answer"                                  │
│     ↓                                                                   │
│ 41. Extract wizard's actionable nudges                                 │
│     - Filter messages where role = 'assistant' AND type = 'step_insight'│
│     - Format: "Step X Insight: wizard's nudge"                         │
│     ↓                                                                   │
│ 42. Extract money/revenue goals mentioned                              │
│     - Search all messages for: $, revenue, profit, MRR, ARR, etc.      │
│     - Take last 5 mentions                                             │
│     ↓                                                                   │
│ 43. Build placement summary (only confirmed data)                      │
│     - Skip any placements marked as "UNKNOWN"                          │
│     - Include astrology + human design data                            │
│     ↓                                                                   │
│ 44. Load final_briefing prompt from database                           │
│     - Query: SELECT prompt FROM prompts                                │
│              WHERE product_slug = ? AND scope = 'final_briefing'       │
│     ↓                                                                   │
│ 45. Call GPT-5 with complete context                                   │
│     - Model: gpt-5                                                     │
│     - Messages: [                                                      │
│         { role: 'system', content: systemPrompt },                     │
│         { role: 'user', content: placementSummary },                   │
│         { role: 'user', content: userResponses + wizardNudges },       │
│         { role: 'user', content: instructionMessage }                  │
│       ]                                                                 │
│     - max_completion_tokens: 15000                                     │
│     - temperature: default (1) - GPT-5 only supports default           │
│     - Instruction: Generate 7-section blueprint                        │
│       1. Brand Essence                                                 │
│       2. Zone of Genius                                                │
│       3. What to Sell (1-2 offers with pricing)                        │
│       4. How to Sell (voice, channels, what NOT to do)                 │
│       5. Money Model (30-day experiment)                               │
│       6. Execution Spine (3-5 concrete actions)                        │
│       7. Value Elicitation (3 sharp questions)                         │
│     ↓                                                                   │
│ 46. GPT generates comprehensive blueprint                              │
│     - 500-700 words                                                    │
│     - High school reading level                                        │
│     - Synthesizes wizard nudges into execution spine                   │
│     - References specific user details                                 │
│     ↓                                                                   │
│ 47. Update product_sessions table                                      │
│     - UPDATE product_sessions SET                                      │
│         deliverable = briefing,                                        │
│         completed_at = NOW()                                           │
│       WHERE id = sessionId                                             │
│     ↓                                                                   │
│ 48. Log to conversations (step_number = 999)                           │
│     - Special step for final deliverable                               │
│     - Type: 'final_briefing'                                           │
│     ↓                                                                   │
│ 49. Return briefing to client                                          │
│     - Response: { briefing: "..." }                                    │
│     ↓                                                                   │
│ 50. Client transitions to DeliverableView                              │
│     - Component: src/components/product-experience/DeliverableView.tsx │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 6: Deliverable Display & Download                                │
│ ────────────────────────────────────────────────────────────────────── │
│ 51. DeliverableView component parses blueprint                         │
│     - Regex to find section headers: "1. Brand Essence", "2. Zone..."  │
│     - Split content into sections                                      │
│     - Each section gets: number, title, content                        │
│     ↓                                                                   │
│ 52. Render beautiful deliverable UI                                    │
│     - Success header with checkmark icon                               │
│     - Section cards with gradient backgrounds                          │
│     - Numbered badges                                                  │
│     - Formatted text (bold, bullets, paragraphs)                       │
│     ↓                                                                   │
│ 53. User can copy to clipboard                                         │
│     - Click "Copy" button                                              │
│     - navigator.clipboard.writeText(deliverable)                       │
│     - Shows "Copied!" confirmation                                     │
│     ↓                                                                   │
│ 54. User can download as PDF                                           │
│     ↓                                                                   │
│     A. Click "Download" button                                         │
│        ↓                                                                │
│     B. Client-side PDF generation (jsPDF library)                      │
│        - Create new jsPDF instance                                     │
│        - Add title page                                                │
│        - Process each section:                                         │
│          • Section headers (bold, 14pt)                                │
│          • Content paragraphs (normal, 10pt)                           │
│          • Handle bold text (**text**)                                 │
│          • Line wrapping (max width)                                   │
│          • Multi-page support (auto page breaks)                       │
│        ↓                                                                │
│     C. Save PDF                                                        │
│        - Filename: "{product-name}-blueprint.pdf"                      │
│        - Downloads to user's computer                                  │
│     ↓                                                                   │
│ 55. User clicks "Return to Dashboard"                                  │
│     - Redirect to /dashboard                                           │
│     - Can access deliverable again from session history                │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Data Structures:**

**Product Session:**
```typescript
{
  id: string;
  user_id: string;
  product_slug: 'quantum-initiation';
  current_step: 1-5;
  total_steps: 5;
  placements: {
    astrology: { sun, moon, rising, houses, planets... },
    human_design: { type, strategy, authority... }
  };
  deliverable: string; // Final blueprint text
  completed_at: timestamp | null;
}
```

**Conversation Structure:**
```typescript
{
  id: string;
  session_id: string;
  step_number: 1-5 (or 999 for final);
  messages: [
    { role: 'user', content: '...', type: 'user_response' },
    { role: 'assistant', content: '...', type: 'step_insight' },
    { role: 'user', content: '...', type: 'followup_question' },
    { role: 'assistant', content: '...', type: 'followup_response' }
  ]
}
```

**Files Involved:**
- `/src/app/products/[slug]/experience/page.tsx` - Main experience page
- `/src/components/product-experience/ProductExperience.tsx` - Main orchestrator
- `/src/components/product-experience/FileUploadStep.tsx` - Upload UI
- `/src/components/product-experience/QuestionStep.tsx` - Question UI
- `/src/components/product-experience/DeliverableView.tsx` - Final view
- `/src/app/api/products/extract-placements/route.ts` - Chart extraction
- `/src/app/api/products/step-insight/route.ts` - Step insights
- `/src/app/api/products/followup-response/route.ts` - Follow-ups
- `/src/app/api/products/final-briefing/route.ts` - Final blueprint

---

## 💰 Affiliate System Flows

### Auto-Enrollment Flow (On First Purchase)

```
Trigger: First product_access INSERT for a user
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Stripe webhook inserts product_access record                        │
│    - INSERT INTO product_access (user_id, product_slug)                │
│    ↓                                                                    │
│ 2. Database Trigger: auto_enroll_affiliate() fires                     │
│    - Location: database/migrations/003_affiliate_functions.sql         │
│    ↓                                                                    │
│ 3. Check if first purchase                                             │
│    - Count: SELECT COUNT(*) FROM product_access WHERE user_id = ?      │
│    ↓                                                                    │
│    ┌─────────────────────┬─────────────────────┐                       │
│    │ Count > 1           │ Count = 1           │                       │
│    │ (Not first purchase)│ (First purchase!)   │                       │
│    │ ↓                   │ ↓                   │                       │
│    │ EXIT - Do nothing   │ Continue to step 4  │                       │
│    └─────────────────────┴─────────────────────┘                       │
│    ↓                                                                    │
│ 4. Check opt-out status                                                │
│    - Query: SELECT affiliate_opted_out FROM users WHERE id = ?         │
│    ↓                                                                    │
│    ┌─────────────────────┬─────────────────────┐                       │
│    │ opted_out = true    │ opted_out = false/null│                     │
│    │ ↓                   │ ↓                   │                       │
│    │ EXIT - Respect choice│ Continue to step 5  │                       │
│    └─────────────────────┴─────────────────────┘                       │
│    ↓                                                                    │
│ 5. Generate unique referral code                                       │
│    - Call: generate_referral_code()                                    │
│    - Returns: 8-character alphanumeric (e.g., "A7K2M9P3")             │
│    ↓                                                                    │
│ 6. Create referral link                                                │
│    - Format: https://quantumstrategies.online?ref=A7K2M9P3             │
│    ↓                                                                    │
│ 7. Check for referral cookie (referred_by_code)                        │
│    - Check metadata from Stripe checkout                               │
│    ↓                                                                    │
│ 8. INSERT INTO referral_hierarchy                                      │
│    - user_id: new user                                                 │
│    - referral_code: generated code                                     │
│    - referral_link: full URL                                           │
│    - current_track: 'community_builder' (default)                      │
│    - referred_by_id: upline user_id (if referred)                      │
│    - stripe_connect_account_id: null (created later)                   │
│    ↓                                                                    │
│ 9. Update users table                                                  │
│    - UPDATE users SET is_affiliate = true WHERE id = ?                 │
│    ↓                                                                    │
│ 10. Create Stripe Connect Express account (async, non-blocking)        │
│     - Call Stripe API                                                  │
│     - Store account_id in referral_hierarchy                           │
│     - User can complete onboarding later                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Manual Opt-In Flow (New Users)

```
User Journey:
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. User purchases product but hasn't visited Affiliate tab yet         │
│    - affiliate_opted_out = null                                        │
│    - first_affiliate_visit = null                                      │
│    ↓                                                                    │
│ 2. User clicks "Affiliate" tab in dashboard                            │
│    - Route: /dashboard/affiliate                                       │
│    ↓                                                                    │
│ 3. Dashboard component loads: /src/app/dashboard/affiliate/page.tsx    │
│    ↓                                                                    │
│ 4. useEffect → checkEnrollmentStatus()                                 │
│    - GET /api/affiliate/check-enrollment                               │
│    ↓                                                                    │
│ 5. API checks enrollment: src/app/api/affiliate/check-enrollment/route.ts│
│    ↓                                                                    │
│    A. Query referral_hierarchy:                                        │
│       SELECT * FROM referral_hierarchy WHERE user_id = ?               │
│       - isEnrolled = (record exists)                                   │
│       ↓                                                                 │
│    B. Query users table:                                               │
│       SELECT affiliate_opted_out FROM users WHERE id = ?               │
│       - hasOptedOut = affiliate_opted_out value                        │
│       ↓                                                                 │
│    C. Update first_affiliate_visit if null:                            │
│       UPDATE users SET first_affiliate_visit = NOW()                   │
│       WHERE id = ? AND first_affiliate_visit IS NULL                   │
│       ↓                                                                 │
│    D. Return status:                                                   │
│       { isEnrolled: bool, hasOptedOut: bool }                          │
│    ↓                                                                    │
│ 6. Client receives response and decides route:                         │
│    ↓                                                                    │
│    ┌──────────────────┬──────────────────┬──────────────────┐          │
│    │ isEnrolled=true  │ hasOptedOut=true │ Both false       │          │
│    │ ↓                │ ↓                │ ↓                │          │
│    │ Show affiliate   │ Redirect to      │ Redirect to      │          │
│    │ dashboard        │ /dashboard       │ /welcome page    │          │
│    └──────────────────┴──────────────────┴──────────────────┘          │
│    ↓                                                                    │
│ 7. Welcome Page: /src/app/dashboard/affiliate/welcome/page.tsx         │
│    ↓                                                                    │
│ 8. Display sales page:                                                 │
│    - Headline: "Join the Affiliate Program"                            │
│    - Benefits explanation                                              │
│    - Three commission tracks explained                                 │
│    - Example earnings                                                  │
│    - How it works (5 steps)                                            │
│    - Check if user was referred: GET /api/affiliate/referral-status    │
│      (Shows special badge if referred)                                 │
│    ↓                                                                    │
│ 9. User makes decision:                                                │
│    ↓                                                                    │
│    ┌─────────────────────┬─────────────────────┐                       │
│    │ Clicks "Join"       │ Clicks "Maybe Later"│                       │
│    │ ↓                   │ ↓                   │                       │
│    │ POST /api/affiliate/enroll│ POST /api/affiliate/opt-out│          │
│    │ ↓                   │ ↓                   │                       │
│    │ ENROLLMENT FLOW:    │ OPT-OUT FLOW:       │                       │
│    │                     │                     │                       │
│    │ A. Generate code    │ A. UPDATE users SET │                       │
│    │ B. Create link      │    affiliate_opted_out = true│              │
│    │ C. INSERT referral_hierarchy│                      │              │
│    │ D. UPDATE users     │ B. Record timestamp │                       │
│    │    is_affiliate=true│                     │                       │
│    │ E. Create Stripe    │ C. Return success   │                       │
│    │    Connect (optional)│                    │                       │
│    │ F. Redirect to      │ D. Redirect to      │                       │
│    │    /dashboard/affiliate│    /dashboard    │                       │
│    └─────────────────────┴─────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Affiliate Dashboard Flow

```
User Journey:
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Enrolled affiliate visits /dashboard/affiliate                      │
│    ↓                                                                    │
│ 2. Page loads: src/app/dashboard/affiliate/page.tsx                    │
│    ↓                                                                    │
│ 3. Check enrollment (as shown in opt-in flow)                          │
│    - If not enrolled → Redirect to welcome                             │
│    - If opted out → Redirect to main dashboard                         │
│    ↓                                                                    │
│ 4. Fetch affiliate stats                                               │
│    - GET /api/affiliate/stats                                          │
│    ↓                                                                    │
│ 5. API calls database function: src/app/api/affiliate/stats/route.ts   │
│    - SELECT * FROM get_affiliate_stats(user_id)                        │
│    ↓                                                                    │
│ 6. Database function aggregates data:                                  │
│    - referral_code, referral_link                                      │
│    - current_track                                                     │
│    - total_earnings_cents                                              │
│    - available_balance_cents                                           │
│    - pending_payout_cents                                              │
│    - total_referrals (count)                                           │
│    - active_referrals (who purchased)                                  │
│    - total_sales (downline purchases)                                  │
│    - Stripe Connect status (details_submitted, charges_enabled, etc.)  │
│    ↓                                                                    │
│ 7. Return stats to client                                              │
│    ↓                                                                    │
│ 8. Render dashboard UI:                                                │
│    ↓                                                                    │
│    A. Header section:                                                  │
│       - Welcome message                                                │
│       - Current track badge                                            │
│       ↓                                                                 │
│    B. Stats cards:                                                     │
│       - Total Earnings                                                 │
│       - Available Balance                                              │
│       - Total Referrals                                                │
│       - Active Referrals                                               │
│       ↓                                                                 │
│    C. Referral link section:                                           │
│       - Display link with copy button                                  │
│       - QR code (optional)                                             │
│       ↓                                                                 │
│    D. Stripe Connect status:                                           │
│       ┌─────────────────────┬─────────────────────┐                   │
│       │ Not Set Up          │ Set Up              │                   │
│       │ ↓                   │ ↓                   │                   │
│       │ Show onboarding CTA │ Show "Connected"    │                   │
│       │ "Set Up Payouts"    │ badge               │                   │
│       └─────────────────────┴─────────────────────┘                   │
│       ↓                                                                 │
│    E. Commission breakdown:                                            │
│       - Direct commissions                                             │
│       - Override commissions                                           │
│       - Dinner party contributions                                     │
│       ↓                                                                 │
│    F. Track progress:                                                  │
│       - Requirements for next track                                    │
│       - Visual progress bar                                            │
│       ↓                                                                 │
│    G. Recent transactions table:                                       │
│       - Date, Type, Amount, Status                                     │
│    ↓                                                                    │
│ 9. User interactions:                                                  │
│    ↓                                                                    │
│    A. Copy referral link:                                              │
│       - navigator.clipboard.writeText(link)                            │
│       - Show "Copied!" toast                                           │
│       ↓                                                                 │
│    B. Set up Stripe Connect:                                           │
│       - POST /api/affiliate/onboarding                                 │
│       - Returns Stripe onboarding URL                                  │
│       - Redirects to Stripe (external)                                 │
│       - User completes identity verification                           │
│       - Stripe redirects back to /dashboard/affiliate                  │
│       - Webhook updates stripe_connect_onboarding table                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Commission Processing Flow

```
Trigger: New product purchase via referral link
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. User purchases using referral link                                  │
│    - URL: ?ref=A7K2M9P3                                                │
│    - Cookie stored: referred_by_code                                   │
│    ↓                                                                    │
│ 2. Stripe webhook fires (checkout.session.completed)                   │
│    - Includes metadata: { referral_code: "A7K2M9P3" }                  │
│    ↓                                                                    │
│ 3. Webhook handler: src/app/api/stripe-webhook/route.ts                │
│    ↓                                                                    │
│ 4. Product access granted (triggers auto_enroll_affiliate)             │
│    - New user gets their own referral code                             │
│    - referred_by_id set to referrer's user_id                          │
│    ↓                                                                    │
│ 5. Process referral commissions:                                       │
│    ↓                                                                    │
│    A. Look up referrer (direct upline):                                │
│       - Query: SELECT * FROM referral_hierarchy                        │
│                WHERE referral_code = 'A7K2M9P3'                        │
│       - Get: user_id, current_track                                    │
│       ↓                                                                 │
│    B. Calculate direct commission:                                     │
│       - Call: calculate_commission(amount, track, is_direct=true)      │
│       - Community Builder: $7 * 30% = $2.10                            │
│       - High Performer: $7 * 40% = $2.80                               │
│       - Independent: $7 * 60% = $4.20                                  │
│       ↓                                                                 │
│    C. Calculate dinner party contribution:                             │
│       - Community Builder: $7 * 40% = $2.80                            │
│       - High Performer: $7 * 30% = $2.10                               │
│       - Independent: $0                                                │
│       ↓                                                                 │
│    D. Look up referrer's upline (if exists):                           │
│       - Query: SELECT referred_by_id FROM referral_hierarchy           │
│                WHERE user_id = referrer_user_id                        │
│       ↓                                                                 │
│       ┌─────────────────────┬─────────────────────┐                   │
│       │ Has upline          │ No upline           │                   │
│       │ ↓                   │ ↓                   │                   │
│       │ Calculate override  │ Skip override       │                   │
│       │ $7 * 10% = $0.70    │                     │                   │
│       └─────────────────────┴─────────────────────┘                   │
│       ↓                                                                 │
│    E. Insert affiliate transaction(s):                                 │
│       ↓                                                                 │
│       -- Direct referrer transaction                                   │
│       INSERT INTO affiliate_transactions (                             │
│         user_id: referrer_user_id,                                     │
│         referred_user_id: new_user_id,                                 │
│         product_slug: 'quantum-initiation',                            │
│         sale_amount_cents: 700,                                        │
│         direct_commission_cents: 210 (or 280/420),                     │
│         override_commission_cents: 0,                                  │
│         dinner_party_cents: 280 (or 210/0),                            │
│         commission_status: 'pending',                                  │
│         commission_track: 'community_builder'                          │
│       )                                                                 │
│       ↓                                                                 │
│       -- Upline override transaction (if exists)                       │
│       INSERT INTO affiliate_transactions (                             │
│         user_id: upline_user_id,                                       │
│         referred_user_id: new_user_id,                                 │
│         product_slug: 'quantum-initiation',                            │
│         sale_amount_cents: 700,                                        │
│         direct_commission_cents: 0,                                    │
│         override_commission_cents: 70,                                 │
│         dinner_party_cents: 0,                                         │
│         commission_status: 'pending',                                  │
│         commission_track: upline_track                                 │
│       )                                                                 │
│       ↓                                                                 │
│    F. Update affiliate earnings:                                       │
│       ↓                                                                 │
│       -- Direct referrer                                               │
│       CALL increment_affiliate_earnings(                               │
│         referrer_user_id,                                              │
│         direct_commission_cents                                        │
│       )                                                                 │
│       - Updates: total_earnings_cents                                  │
│       - Updates: available_balance_cents                               │
│       ↓                                                                 │
│       -- Upline (if exists)                                            │
│       CALL increment_affiliate_earnings(                               │
│         upline_user_id,                                                │
│         override_commission_cents                                      │
│       )                                                                 │
│       ↓                                                                 │
│    G. Process dinner party contribution:                               │
│       - Query active dinner party pool                                 │
│       - INSERT INTO dinner_party_contributions                         │
│       - Update pool current_amount                                     │
│       - Check if pool filled → distribute if yes                       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Commission Examples:**

**Community Builder ($7 sale):**
- Direct commission: $2.10 (30%)
- Dinner party: $2.80 (40%)
- Upline override: $0.70 (10%)
- Total distributed: $5.60 of $7

**High Performer ($7 sale):**
- Direct commission: $2.80 (40%)
- Dinner party: $2.10 (30%)
- Upline override: $0.70 (10%)
- Total distributed: $5.60 of $7

**Independent ($7 sale):**
- Direct commission: $4.20 (60%)
- Dinner party: $0
- Upline override: $0.70 (10%)
- Total distributed: $4.90 of $7

---

## 📧 Email Flows

### Welcome Email Flow

```
Trigger: Product access granted (Stripe webhook)
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Stripe webhook completes processing                                 │
│    - User created/updated                                              │
│    - Product access granted                                            │
│    - Affiliate enrollment complete                                     │
│    ↓                                                                    │
│ 2. Call sendWelcomeEmail() function                                    │
│    - Location: src/lib/email/gmail.ts                                  │
│    - Parameters: { email, name, productSlug }                          │
│    ↓                                                                    │
│ 3. Load email template                                                 │
│    - Check for product-specific template                               │
│    - Fallback to generic welcome template                              │
│    ↓                                                                    │
│ 4. Personalize email content:                                          │
│    - Replace {{name}} with user's name                                 │
│    - Replace {{product_link}} with direct link                         │
│    - Replace {{dashboard_link}} with dashboard URL                     │
│    ↓                                                                    │
│ 5. Send via Gmail API                                                  │
│    - Uses service account credentials                                  │
│    - From: support@quantumstrategies.online                            │
│    - To: customer email                                                │
│    - Subject: "Welcome to [Product Name]!"                             │
│    ↓                                                                    │
│ 6. Log email send                                                      │
│    - Record in database (optional)                                     │
│    - Track delivery status                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

**Email Content Structure:**

```html
Subject: Welcome to Quantum Initiation! 🎯

Hi [Name],

Welcome! You now have access to Quantum Initiation.

Here's how to get started:

1. Visit your dashboard: [Dashboard Link]
2. Click "Start Experience"
3. Upload your charts (Birth Chart + Human Design)
4. Answer the 5-step questionnaire
5. Get your personalized Quantum Brand Blueprint

Your access is ready: [Direct Product Link]

Questions? Reply to this email.

Best,
The Quantum Strategies Team
```

---

### Affiliate Invitation Email Flow (Future)

```
Planned Flow:
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. User completes product experience                                   │
│    - deliverable generated                                             │
│    ↓                                                                    │
│ 2. Trigger affiliate invitation email (sequence)                       │
│    - Delay: 1 hour after completion                                    │
│    ↓                                                                    │
│ 3. Check if user is already affiliate                                  │
│    ↓                                                                    │
│    ┌─────────────────────┬─────────────────────┐                       │
│    │ Already affiliate   │ Not affiliate       │                       │
│    │ ↓                   │ ↓                   │                       │
│    │ Skip email          │ Send invitation     │                       │
│    └─────────────────────┴─────────────────────┘                       │
│    ↓                                                                    │
│ 4. Send affiliate invitation email                                     │
│    - Explain program benefits                                          │
│    - Show earning potential                                            │
│    - CTA: "Set Up Your Referral Link"                                  │
│    - Link: /dashboard/affiliate                                        │
│    ↓                                                                    │
│ 5. User clicks link → Affiliate opt-in flow                            │
└─────────────────────────────────────────────────────────────────────────┘
```

**Note:** This flow is planned but not yet implemented. Current behavior is auto-enrollment on first purchase.

---

## 📤 File Upload & Processing Flow

### Detailed Upload Flow

```
User Journey:
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Client-Side Upload Preparation                                 │
│ ────────────────────────────────────────────────────────────────────── │
│ 1. User on Step 1 (File Upload)                                        │
│    - Component: src/components/product-experience/FileUploadStep.tsx   │
│    ↓                                                                    │
│ 2. User drags/drops files OR clicks to select                          │
│    - Dropzone accepts: .pdf, .png, .jpg, .jpeg                         │
│    - Multiple files allowed                                            │
│    ↓                                                                    │
│ 3. Client validates files:                                             │
│    - Check file type (MIME type)                                       │
│    - Check file size (max 10MB per file)                               │
│    - Check total count (max 6 files)                                   │
│    ↓                                                                    │
│    ┌─────────────────────┬─────────────────────┐                       │
│    │ Validation fails    │ Validation passes   │                       │
│    │ ↓                   │ ↓                   │                       │
│    │ Show error message  │ Continue to upload  │                       │
│    │ - "File too large"  │                     │                       │
│    │ - "Invalid format"  │                     │                       │
│    └─────────────────────┴─────────────────────┘                       │
│    ↓                                                                    │
│ 4. For each valid file:                                                │
│    ↓                                                                    │
│    A. Generate storage path:                                           │
│       - Format: {userId}/{sessionId}/{timestamp}_{filename}            │
│       - Example: "abc123/def456/1703721234_birth-chart.pdf"            │
│       ↓                                                                 │
│    B. Create FormData:                                                 │
│       - Append file                                                    │
│       - Append metadata (userId, sessionId)                            │
│       ↓                                                                 │
│    C. Upload to Supabase Storage:                                      │
│       ```typescript                                                    │
│       const { data, error } = await supabase                           │
│         .storage                                                       │
│         .from('user-uploads')                                          │
│         .upload(storagePath, file, {                                   │
│           cacheControl: '3600',                                        │
│           upsert: false                                                │
│         });                                                            │
│       ```                                                              │
│       ↓                                                                 │
│    D. Check upload result:                                             │
│       ┌─────────────────────┬─────────────────────┐                   │
│       │ Error               │ Success             │                   │
│       │ ↓                   │ ↓                   │                   │
│       │ Show error toast    │ Add to uploadedFiles│                   │
│       │ Retry option        │ array               │                   │
│       └─────────────────────┴─────────────────────┘                   │
│       ↓                                                                 │
│    E. Record in database:                                              │
│       ```sql                                                           │
│       INSERT INTO uploaded_documents (                                 │
│         user_id,                                                       │
│         session_id,                                                    │
│         storage_path,                                                  │
│         filename,                                                      │
│         file_type,                                                     │
│         file_size_bytes                                                │
│       ) VALUES (?, ?, ?, ?, ?, ?)                                      │
│       ```                                                              │
│       ↓                                                                 │
│    F. Update UI:                                                       │
│       - Show file preview card                                         │
│       - File name, size, type                                          │
│       - Remove button                                                  │
│       - Upload progress bar                                            │
│    ↓                                                                    │
│ 5. All files uploaded                                                  │
│    - Enable "Extract Placements" button                                │
│    - uploadedFiles state contains all storage paths                    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ STEP 2: Extraction Trigger                                             │
│ ────────────────────────────────────────────────────────────────────── │
│ 6. User clicks "Extract Placements"                                    │
│    ↓                                                                    │
│ 7. Show loading state:                                                 │
│    - Disable button                                                    │
│    - Show spinner                                                      │
│    - Text: "Analyzing your charts..."                                  │
│    ↓                                                                    │
│ 8. Call extraction API:                                                │
│    ```typescript                                                       │
│    const response = await fetch('/api/products/extract-placements', {  │
│      method: 'POST',                                                   │
│      headers: { 'Content-Type': 'application/json' },                  │
│      body: JSON.stringify({                                            │
│        sessionId: session.id,                                          │
│        storagePaths: uploadedFiles                                     │
│      })                                                                │
│    });                                                                 │
│    ```                                                                 │
│    ↓                                                                    │
│ 9. Server processes extraction (see Product Experience Flow)           │
│    - Downloads files                                                   │
│    - Categorizes by filename                                           │
│    - Extracts PDF text                                                 │
│    - Calls GPT Vision                                                  │
│    - Returns placements JSON                                           │
│    ↓                                                                    │
│ 10. Client receives placements:                                        │
│     ```json                                                            │
│     {                                                                  │
│       "placements": {                                                  │
│         "astrology": {                                                 │
│           "sun": "Aries",                                              │
│           "moon": "Taurus",                                            │
│           "rising": "Gemini",                                          │
│           ...                                                          │
│         },                                                             │
│         "human_design": {                                              │
│           "type": "Generator",                                         │
│           "strategy": "To Respond",                                    │
│           ...                                                          │
│         }                                                              │
│       }                                                                │
│     }                                                                  │
│     ```                                                                 │
│     ↓                                                                   │
│ 11. Update UI with extracted data:                                     │
│     - Show success message                                             │
│     - Display extracted placements in cards                            │
│     - Astrology section (Sun, Moon, Rising, etc.)                      │
│     - Human Design section (Type, Strategy, etc.)                      │
│     - "Continue" button enabled                                        │
│     ↓                                                                   │
│ 12. User can review and edit if needed                                 │
│     - Manual corrections supported                                     │
│     - Click "Continue" to proceed to questionnaire                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Storage Bucket Configuration:**

```yaml
Bucket: user-uploads
Public: false (private)
File Size Limit: 10MB per file
Allowed MIME Types:
  - application/pdf
  - image/png
  - image/jpeg
  - image/jpg

RLS Policies:
  - INSERT: Authenticated users can upload to own folder
  - SELECT: Users can read own files
  - DELETE: Users can delete own files
  - UPDATE: Not allowed

Folder Structure:
  user-uploads/
    {user_id_1}/
      {session_id_1}/
        1703721234_birth-chart.pdf
        1703721235_hd-chart.png
      {session_id_2}/
        ...
    {user_id_2}/
      ...
```

---

## 🗺️ API Routing Architecture

### Route Organization

```
/api/
├── auth/
│   ├── signup/route.ts              → User registration
│   ├── login/route.ts               → User login
│   └── logout/route.ts              → Session termination
│
├── products/
│   ├── extract-placements/route.ts  → GPT Vision chart extraction
│   ├── step-insight/route.ts        → AI response after each step
│   ├── followup-response/route.ts   → Follow-up question handling
│   └── final-briefing/route.ts      → Final blueprint generation
│
├── affiliate/
│   ├── check-enrollment/route.ts    → Check if user is enrolled
│   ├── enroll/route.ts              → Enroll user in program
│   ├── opt-out/route.ts             → User declines affiliate
│   ├── referral-status/route.ts     → Check if user was referred
│   ├── stats/route.ts               → Dashboard statistics
│   └── onboarding/route.ts          → Stripe Connect setup
│
├── stripe-webhook/route.ts          → Payment processing
│
├── cron/
│   ├── process-payouts/route.ts     → Automated affiliate payouts
│   └── update-tracks/route.ts       → Track promotions
│
├── test-supabase/route.ts           → Database connection test
│
└── unsubscribe/route.ts             → Email unsubscribe handling
```

### API Route Patterns

**Standard Request/Response Pattern:**

```typescript
// All API routes follow this structure:

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();
    const { param1, param2 } = body;

    // 2. Validate required parameters
    if (!param1) {
      return NextResponse.json(
        { error: 'param1 is required' },
        { status: 400 }
      );
    }

    // 3. Authenticate user (if needed)
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 4. Database operations
    const { data, error } = await supabaseAdmin
      .from('table_name')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) throw error;

    // 5. Business logic processing
    const result = processData(data);

    // 6. Return success response
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    // 7. Error handling
    console.error('Route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Authentication Middleware

**Route Protection:**

```typescript
// src/middleware.ts

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ['/', '/login', '/signup', '/api/stripe-webhook'];

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Protected routes (auth required)
  const session = await getSession(request);

  if (!session) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check product access for product routes
  if (pathname.startsWith('/products/')) {
    const productSlug = pathname.split('/')[2];
    const hasAccess = await checkProductAccess(session.user.id, productSlug);

    if (!hasAccess) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 🗄️ Database Flow Patterns

### Common Query Patterns

**1. User Lookup:**
```sql
-- By ID
SELECT * FROM users WHERE id = 'user_uuid';

-- By email
SELECT * FROM users WHERE email = 'user@example.com';

-- With affiliate data
SELECT u.*, rh.referral_code, rh.current_track
FROM users u
LEFT JOIN referral_hierarchy rh ON rh.user_id = u.id
WHERE u.id = 'user_uuid';
```

**2. Product Access Check:**
```sql
-- Check if user has access
SELECT EXISTS (
  SELECT 1 FROM product_access
  WHERE user_id = 'user_uuid'
  AND product_slug = 'quantum-initiation'
) AS has_access;

-- Get all user's products
SELECT pa.*, pd.name, pd.description
FROM product_access pa
JOIN product_definitions pd ON pd.product_slug = pa.product_slug
WHERE pa.user_id = 'user_uuid'
ORDER BY pa.granted_at DESC;
```

**3. Session Management:**
```sql
-- Get or create session
INSERT INTO product_sessions (
  user_id,
  product_slug,
  current_step,
  total_steps
) VALUES (
  'user_uuid',
  'quantum-initiation',
  1,
  5
)
ON CONFLICT (user_id, product_slug)
DO UPDATE SET updated_at = NOW()
RETURNING *;

-- Update session progress
UPDATE product_sessions
SET
  current_step = 3,
  placements = '{"astrology": {...}, "human_design": {...}}',
  updated_at = NOW()
WHERE id = 'session_uuid';
```

**4. Conversation Logging:**
```sql
-- Upsert conversation with messages array
INSERT INTO conversations (
  session_id,
  step_number,
  messages
) VALUES (
  'session_uuid',
  2,
  '[
    {"role": "user", "content": "...", "created_at": "2025-12-27T10:00:00Z"},
    {"role": "assistant", "content": "...", "created_at": "2025-12-27T10:00:05Z", "type": "step_insight"}
  ]'::jsonb
)
ON CONFLICT (session_id, step_number)
DO UPDATE SET
  messages = conversations.messages || EXCLUDED.messages,
  updated_at = NOW();
```

**5. Affiliate Stats Aggregation:**
```sql
-- Get comprehensive affiliate stats
SELECT
  rh.referral_code,
  rh.referral_link,
  rh.current_track,
  u.total_earnings_cents,
  u.available_balance_cents,
  COUNT(DISTINCT downline.id) AS total_referrals,
  COUNT(DISTINCT CASE WHEN pa.id IS NOT NULL THEN downline.id END) AS active_referrals,
  COUNT(DISTINCT pa.id) AS total_sales,
  SUM(COALESCE(at.direct_commission_cents, 0)) AS total_direct_cents,
  SUM(COALESCE(at.override_commission_cents, 0)) AS total_override_cents
FROM referral_hierarchy rh
JOIN users u ON u.id = rh.user_id
LEFT JOIN referral_hierarchy downline ON downline.referred_by_id = rh.user_id
LEFT JOIN product_access pa ON pa.user_id = downline.id
LEFT JOIN affiliate_transactions at ON at.user_id = rh.user_id
WHERE rh.user_id = 'user_uuid'
GROUP BY rh.id, u.id;
```

### Database Triggers

**1. Auto-Create User on Signup:**
```sql
CREATE OR REPLACE FUNCTION create_user_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_on_signup();
```

**2. Auto-Enroll Affiliate on First Purchase:**
```sql
CREATE OR REPLACE FUNCTION auto_enroll_affiliate()
RETURNS TRIGGER AS $$
DECLARE
  purchase_count INT;
  opted_out BOOLEAN;
  new_code TEXT;
BEGIN
  -- Check if first purchase
  SELECT COUNT(*) INTO purchase_count
  FROM product_access
  WHERE user_id = NEW.user_id;

  IF purchase_count > 1 THEN
    RETURN NEW;
  END IF;

  -- Check opt-out status
  SELECT affiliate_opted_out INTO opted_out
  FROM users
  WHERE id = NEW.user_id;

  IF opted_out = true THEN
    RETURN NEW;
  END IF;

  -- Generate code
  new_code := generate_referral_code();

  -- Create referral hierarchy
  INSERT INTO referral_hierarchy (
    user_id,
    referral_code,
    referral_link,
    current_track,
    referred_by_id
  ) VALUES (
    NEW.user_id,
    new_code,
    'https://quantumstrategies.online?ref=' || new_code,
    'community_builder',
    (SELECT user_id FROM referral_hierarchy WHERE referral_code = get_referral_cookie())
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Update user
  UPDATE users
  SET is_affiliate = true
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ⚠️ Error Handling Flows

### API Error Hierarchy

```
Error Levels:
├── 400 - Bad Request
│   ├── Missing required parameters
│   ├── Invalid parameter format
│   ├── Validation failures
│   └── Malformed JSON
│
├── 401 - Unauthorized
│   ├── No session/token
│   ├── Expired session
│   └── Invalid credentials
│
├── 403 - Forbidden
│   ├── No product access
│   ├── Wrong user accessing resource
│   └── Rate limit exceeded
│
├── 404 - Not Found
│   ├── Product not found
│   ├── Session not found
│   └── User not found
│
├── 429 - Too Many Requests
│   ├── Rate limit hit (30 req/min)
│   └── Retry-After header included
│
└── 500 - Internal Server Error
    ├── Database errors
    ├── OpenAI API errors
    ├── Stripe API errors
    └── Unexpected exceptions
```

### Error Response Format

```typescript
// Standardized error response
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",           // Optional
  "details": {                    // Optional
    "field": "parameter_name",
    "reason": "Specific issue"
  }
}
```

### Client-Side Error Handling

```typescript
// Standard pattern in components:

try {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  const result = await response.json();
  // Handle success

} catch (error) {
  console.error('Error:', error);
  setError(error.message);
  // Show toast/alert to user
}
```

---

## 📊 Complete User Journey Map

```
New User → Power User Journey:
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  [1] Discovery                                                   │
│      ↓                                                            │
│      Lands on marketing page                                     │
│      - Sees product value proposition                            │
│      - May have referral code in URL (?ref=ABC123)              │
│      - Cookie stores referral code                               │
│                                                                  │
│  [2] Signup                                                      │
│      ↓                                                            │
│      Creates account                                             │
│      - /signup page                                              │
│      - Email + password                                          │
│      - Supabase Auth creates user                                │
│      - Trigger creates public.users record                       │
│                                                                  │
│  [3] Purchase                                                    │
│      ↓                                                            │
│      Completes Stripe checkout                                   │
│      - Payment link with metadata (product, referral code)       │
│      - Stripe processes payment                                  │
│      - Webhook grants product access                             │
│      - Auto-enrolls as affiliate (first purchase)                │
│      - Processes referral commissions (if referred)              │
│      - Sends welcome email                                       │
│                                                                  │
│  [4] Product Experience                                          │
│      ↓                                                            │
│      Completes questionnaire                                     │
│      - Uploads charts (PDF/images)                               │
│      - GPT extracts placements                                   │
│      - Answers 5 steps                                           │
│      - QBF Wizard provides insights                              │
│      - Receives final blueprint                                  │
│      - Downloads PDF                                             │
│                                                                  │
│  [5] Affiliate Activation (Optional)                             │
│      ↓                                                            │
│      Sets up affiliate program                                   │
│      - Already has referral code (auto-enrolled)                 │
│      - Completes Stripe Connect onboarding (optional)            │
│      - Shares referral link                                      │
│      - Earns commissions on sales                                │
│                                                                  │
│  [6] Referral Growth                                             │
│      ↓                                                            │
│      Brings in referrals                                         │
│      - Direct referrals purchase (30-60% commission)             │
│      - Downline purchases (10% override)                         │
│      - Track promotion (CB → HP → Ind)                           │
│      - Dinner party pool contributions                           │
│                                                                  │
│  [7] Power User                                                  │
│      ↓                                                            │
│      Active in ecosystem                                         │
│      - Completed product                                         │
│      - Active affiliate earning commissions                      │
│      - Growing downline                                          │
│      - Receiving payouts                                         │
│      - May purchase additional products                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Management Patterns

### Product Experience State Flow

```typescript
// Component state management in ProductExperience.tsx

const [state, setState] = useState({
  // Session data
  session: ProductSession | null,
  currentStep: number,
  totalSteps: number,

  // Upload state
  uploadedFiles: string[],
  isUploading: boolean,
  uploadProgress: number,

  // Extraction state
  placements: Placements | null,
  isExtracting: boolean,

  // Questionnaire state
  currentAnswer: string,
  isGeneratingInsight: boolean,
  currentInsight: string,
  conversationHistory: Message[],

  // Deliverable state
  deliverable: string | null,
  isGeneratingDeliverable: boolean,

  // UI state
  error: string | null,
  showFollowUp: boolean
});

// State transitions:
// 1. INIT → UPLOADING → EXTRACTING → STEP_ANSWERING
// 2. STEP_ANSWERING → INSIGHT_RECEIVED → FOLLOW_UP (optional)
// 3. FOLLOW_UP → NEXT_STEP (loop 2-3 for steps 2-5)
// 4. FINAL_STEP → GENERATING_DELIVERABLE → COMPLETE
```

---

This documentation provides a complete map of every flow and routing pattern in the application. Each section can be expanded with additional detail as needed.
