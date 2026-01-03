# 🚀 Production Deployment Checklist - quantumstrategies.online

**Date:** 2026-01-02
**Deploy Target:** Production (quantumstrategies.online)
**Critical Changes:** Product optimization, slug migration, actionable nudges, bug fixes

---

## ✅ Pre-Deployment Checklist

### 1. Database Migrations (CRITICAL - Must run in order!)

**Total Migrations to Apply:** 8 files

Run these migrations in **EXACT ORDER**:

```bash
# 1. Backup (already in production - verify)
supabase/migrations/20260101000001_backup_product_prompts.sql

# 2. Product Optimizations
supabase/migrations/20260101000002_optimize_personal_alignment.sql
supabase/migrations/20260101000003_optimize_business_alignment.sql
supabase/migrations/20260101000004_optimize_quantum_structure.sql
supabase/migrations/20260101000005_optimize_brand_alignment.sql

# 3. Critical Fixes
supabase/migrations/20260102000001_CRITICAL_fix_business_alignment_step1.sql
supabase/migrations/20260102000002_add_actionable_nudge_formatting.sql
supabase/migrations/20260102000003_rename_quantum_initiation_to_business_alignment.sql

# 4. Complete Nudge Rollout (PRODUCTION ONLY)
supabase/migrations/20260102000004_PRODUCTION_complete_nudge_rollout.sql
```

**Migration Commands:**
```bash
# Via Supabase CLI
npx supabase db push

# OR manually apply each migration via Supabase Dashboard SQL Editor
```

---

### 2. Code Changes (Already completed)

**Files Modified:**
- ✅ `src/lib/constants/products.ts` - Updated quantum-initiation → business-alignment
- ✅ `src/app/dashboard/page.tsx` - Updated product name display + link
- ✅ `next.config.ts` - Added redirect from old slug to new
- ✅ `src/components/product-experience/ProductExperience.tsx` - Refactored nudge extraction
- ✅ `src/app/products/[slug]/experience/page.tsx` - Fixed gate logic, uses shared utility
- ✅ `src/components/product-experience/DeliverableView.tsx` - Fixed styling, added nudges section
- ✅ `src/components/product-experience/StepView.tsx` - Fixed React key duplication

**Files Created:**
- ✅ `src/lib/utils/placements.ts` - Shared utility for placement validation

---

### 3. Environment Variables

**Required in Production:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_QUANTUM=price_xxx
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PERSONAL_ALIGNMENT=price_xxx
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_BRAND_ALIGNMENT=price_xxx
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_ORIENTATION_BUNDLE=price_xxx

# OpenAI
OPENAI_API_KEY=sk-xxx
```

✅ Verify all environment variables are set in production!

---

## 🔍 Post-Deployment Verification

### 1. Database Verification

Run this query in Supabase SQL Editor to verify all migrations applied:

```sql
-- Verify product slugs
SELECT product_slug, name
FROM product_definitions
ORDER BY created_at;

-- Expected results:
-- business-alignment | Business Alignment Orientation
-- personal-alignment | Personal Alignment Orientation
-- brand-alignment | Brand Alignment Orientation
-- quantum-structure-profit-scale | Quantum Structure, Profit & Scale

-- Verify actionable nudge instructions
SELECT
  product_slug,
  (SELECT COUNT(*)
   FROM jsonb_array_elements(steps) elem
   WHERE elem->>'prompt' LIKE '%ACTIONABLE NUDGE%') as steps_with_nudges,
  jsonb_array_length(steps) as total_steps
FROM product_definitions;

-- Expected results (approximate):
-- business-alignment: 5 steps with nudges / 5 total
-- personal-alignment: 4 steps with nudges / 5 total
-- brand-alignment: 7 steps with nudges / 8 total
-- quantum-structure-profit-scale: 6 steps with nudges / 7 total

-- Verify all Step 1s use file upload
SELECT
  product_slug,
  steps->0->>'title' as step1_title,
  steps->0->>'allow_file_upload' as step1_upload
FROM product_definitions;

-- Expected: All should have allow_file_upload = true
```

---

### 2. Frontend Verification

**Test on quantumstrategies.online:**

1. **Product Access**
   - ✅ Visit `/products/business-alignment` (NEW URL)
   - ✅ Visit `/products/quantum-initiation` (OLD URL - should redirect to business-alignment)
   - ✅ Verify redirect works (301 permanent redirect)

2. **File Upload Flow**
   - ✅ Start Business Alignment product
   - ✅ Step 1 should show file upload (NOT text input for birth info)
   - ✅ Upload charts → See confirmation gate
   - ✅ Confirm placements → Advance to step 2

3. **Auto-Copy Flow**
   - ✅ Complete Personal Alignment first
   - ✅ Start Business Alignment
   - ✅ Should see "Use existing placements?" gate (auto-copied)
   - ✅ Click "Use These Placements" → Advance to step 2
   - ✅ Click "Upload New Charts" → Reset and show file upload

4. **Actionable Nudges**
   - ✅ Complete any product
   - ✅ View deliverable
   - ✅ Scroll to bottom → See "Actionable Nudges" bonus section
   - ✅ Should show 6 actionable items (NOT questions)
   - ✅ Format: "Actionable nudge (timeframe): [action]"

5. **Dashboard**
   - ✅ Visit `/dashboard`
   - ✅ Product card should say "Business Alignment Orientation" (NOT "quantum-initiation")
   - ✅ Sessions list should show proper product names

---

## ⚠️ Rollback Plan

If deployment fails, rollback procedure:

```bash
# 1. Revert code changes
git revert <commit-hash>
git push origin main

# 2. Revert database (if needed)
# Run these in Supabase SQL Editor:

BEGIN;

-- Revert slug rename
UPDATE product_definitions
SET product_slug = 'quantum-initiation'
WHERE product_slug = 'business-alignment';

UPDATE product_access
SET product_slug = 'quantum-initiation'
WHERE product_slug = 'business-alignment';

UPDATE product_sessions
SET product_slug = 'quantum-initiation'
WHERE product_slug = 'business-alignment';

COMMIT;
```

---

## 📊 Changes Summary

### What Changed:

**Database:**
- ✅ Product slug renamed: `quantum-initiation` → `business-alignment`
- ✅ All Step 1s use file upload (no text input for birth info)
- ✅ 18 steps across 4 products now have actionable nudge formatting instructions
- ✅ System prompts enhanced (200 words, strategic frameworks)
- ✅ Deliverable prompts optimized (500-600 words with upsells)

**Code:**
- ✅ Fixed duplicate `isPlacementsEmpty` logic (now shared utility)
- ✅ Fixed actionable nudge extraction (excludes questions)
- ✅ Fixed React key duplication in file uploads
- ✅ Fixed confirmation gate logic (never skip)
- ✅ Added legacy redirect for old URLs

**UX:**
- ✅ Consistent warm white text (removed purple)
- ✅ Proper markdown rendering
- ✅ 6 actionable nudges in deliverable bonus section
- ✅ Upload → Extract → Confirm → Steps flow (all products)

---

## 🎯 Success Criteria

Deployment is successful when:

1. ✅ All 8 migrations applied without errors
2. ✅ `/products/business-alignment` loads correctly
3. ✅ `/products/quantum-initiation` redirects to `/products/business-alignment`
4. ✅ All products show file upload on Step 1
5. ✅ Confirmation gates work (upload + auto-copy)
6. ✅ Completed deliverables show actionable nudges
7. ✅ No console errors in browser
8. ✅ All product flows complete end-to-end

---

## 👥 Stakeholder Communication

**Before Deployment:**
- [ ] Notify team of deployment window
- [ ] Set maintenance mode if needed
- [ ] Backup production database

**After Deployment:**
- [ ] Verify all success criteria met
- [ ] Test 1 complete product flow end-to-end
- [ ] Monitor error logs for 24 hours
- [ ] Notify team deployment complete

---

## 📝 Notes

- The `quantum-initiation` slug rename is permanent (301 redirect in place)
- Old URLs will continue to work via redirect
- All existing user data preserved (sessions, completions, placements)
- No breaking changes for existing users
- Migrations are idempotent (safe to re-run)

---

**Deployment Owner:** Studio
**Reviewed By:** _____________
**Deployed By:** _____________
**Deployment Date:** _____________
**Status:** [ ] Success [ ] Failed [ ] Rolled Back
