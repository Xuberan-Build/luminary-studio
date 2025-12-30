# Google Drive Storage Quota Fix

## Problem Identified

**Date:** December 29, 2025
**Issue:** Service account cannot create Google Docs (403 quota exceeded error)
**Root Cause:** Service accounts have **0 B storage quota** by default

## Technical Details

```
Storage Limit: 0 B
Storage Used: 0 B
Result: Cannot create any documents in service account's personal Drive
```

Service accounts in Google Drive:
- ❌ Don't get personal Drive storage (0 B limit)
- ✅ Can use Shared Drives
- ✅ Can create documents with immediate ownership transfer (if using impersonation)
- ✅ Can create folders (minimal storage needed)

## Solutions

### Option 1: Use Google Shared Drives (Recommended)

**What:** Create all documents in a Shared Drive instead of personal Drive

**Benefits:**
- No storage quota limits
- Documents accessible to entire team
- Service account can create/edit without ownership transfer
- Best for production use

**Implementation:**
1. Create a Shared Drive in Google Drive (requires Google Workspace)
2. Add service account as a member with "Content Manager" role
3. Update `GoogleDocsService.ts` to use Shared Drive ID
4. All documents created in Shared Drive instead of personal Drive

**Status:** ⏳ Requires Google Workspace admin access to create Shared Drive

---

### Option 2: Domain-Wide Delegation with Impersonation

**What:** Service account impersonates a real user to create docs in their Drive

**Benefits:**
- Documents created directly in user's Drive
- Uses user's storage quota (15 GB free tier)
- No Shared Drive needed
- Automatic ownership (created as the user)

**Implementation:**
1. Enable domain-wide delegation for service account
2. Update `GoogleDocsService.ts` to use `subject: userEmail` in auth
3. Documents created as if the user made them

**Status:** ⏳ Requires Google Workspace admin to enable delegation

---

### Option 3: Store Templates in Database/Code (Alternative)

**What:** Stop using Google Docs for templates, use JSON/Markdown instead

**Benefits:**
- No Google Drive storage needed
- Version controlled in git
- Faster (no API calls)
- No quota issues ever

**Drawbacks:**
- Less user-friendly for non-technical product creators
- No rich text formatting
- Have to rebuild existing product templates

**Status:** 🤔 Consider for future architecture

---

## Current Workaround

For now, the product template system is **non-functional** due to storage quota.

**Affected scripts:**
- `npm run setup-products` ❌ Cannot create template documents
- `npm run test-doc-creation` ❌ All document tests fail
- Product creation workflow blocked

**Immediate action needed:**
- Choose Option 1 (Shared Drives) or Option 2 (Impersonation)
- Requires Google Workspace admin access

---

## Testing After Fix

### If Using Shared Drives:
```bash
# Update .env.local
GOOGLE_SHARED_DRIVE_ID=your_shared_drive_id_here

# Test
npm run test-doc-creation
# Should show: ✅ All tests pass
```

### If Using Impersonation:
```bash
# Enable domain-wide delegation in Google Workspace Admin
# Update GoogleDocsService.ts to use subject parameter

# Test
npm run test-doc-creation
# Should show: ✅ All tests pass
```

---

## Related Files

- `scripts/test-doc-creation.ts` - Diagnostic tests
- `scripts/check-storage-details.ts` - Storage quota checker (NEW)
- `scripts/cleanup-all-service-account-files.ts` - Updated to clean all files
- `src/lib/services/GoogleDocsService.ts` - Will need updates for chosen solution

---

## Why This Happened

Google Drive service accounts are designed for:
- API access and automation
- Using **Shared Drives** (not personal Drive)
- Impersonating users via domain-wide delegation

They are **not** designed to own files in personal Drive, hence the 0 B quota.

---

**Status:** 🔍 Awaiting decision on Option 1 vs Option 2
**Priority:** High (blocks product template creation)
**Owner:** Requires Google Workspace admin access
