# Session Versioning System

## Overview

The session versioning system allows users to:
- Create multiple versions of the same product session
- Track free attempts (2 per product by default)
- Navigate between current and previous session versions
- View previous deliverables
- Start new versions while preserving all previous work

## How It Works

### Database Structure

**New Columns in `product_sessions`:**
- `version` (integer) - Version number (1, 2, 3, etc.)
- `parent_session_id` (uuid) - ID of the session this version was created from
- `is_latest_version` (boolean) - True if this is the current active version

**New Columns in `product_access`:**
- `free_attempts_used` (integer) - Number of sessions created (default: 0)
- `free_attempts_limit` (integer) - Maximum free sessions allowed (default: 2)

### User Flow

1. **First Session**: User starts product → creates version 1
2. **Complete Session**: User finishes → receives deliverable
3. **Start New Version**:
   - User clicks "Start New Version (1 left)" button
   - System creates version 2 with:
     - Copied placements (no need to re-upload charts)
     - Fresh conversation history
     - Current step = 1
     - Links to parent session (version 1)
   - Counter updates: `free_attempts_used = 2`
4. **View Previous Versions**:
   - User clicks "View All Versions" button
   - Modal shows all versions with status
   - User can view any previous deliverable

### Free Attempts Limit

- Each product purchase includes **2 free sessions**
- Test accounts have unlimited attempts (limit check bypassed)
- When limit reached:
  - "Start New Version" button shows message
  - User must purchase additional sessions (future feature)

## Files Created

### Database Migration
**File**: `/supabase/migrations/20251228200000_session_versioning_system.sql`

Creates:
- Version tracking columns
- Free attempts tracking
- Database functions:
  - `create_session_version()` - Creates new version with placements copied
  - `get_session_versions()` - Returns all versions for a product
  - `can_create_new_version()` - Checks if user can create new version
- Indexes for performance

### API Routes

**1. POST `/api/sessions/create-version`**
- Creates new session version
- Checks attempt limits
- Returns new session ID

**2. GET `/api/sessions/get-versions?productSlug=quantum-initiation`**
- Returns all versions for a product
- Ordered by version (newest first)

**3. GET `/api/sessions/check-attempts?productSlug=quantum-initiation`**
- Checks if user can create new version
- Returns attempts used/remaining

### UI Components

**File**: `/src/components/dashboard/SessionVersionManager.tsx`

Client component that provides:
- "View All Versions" button → Opens modal with version history
- "Start New Version (X left)" button → Creates new version
- Version history modal showing:
  - Version number
  - Status (Complete/In Progress)
  - Created/completed dates
  - "View Deliverable" link for each version

**File**: `/src/components/dashboard/SessionVersionManager.module.css`

Styling for version manager component.

### Updated Files

**File**: `/src/app/dashboard/page.tsx`

Changes:
- Replaced `resetSession()` with `createNewVersion()` server action
- Added `getSessionAttempts()` function
- Updated sessions query to show only latest versions
- Integrated `SessionVersionManager` component
- Shows version badges (v2, v3, etc.)
- Shows attempt counters

**File**: `/src/app/dashboard/dashboard.module.css`

Added `.versionBadge` style for version numbers.

## Applying the Migration

### Option 1: Supabase CLI (Recommended)
```bash
# Make sure Docker is running
docker ps

# Apply migration
supabase db push

# Verify migration applied
supabase db diff
```

### Option 2: Manual SQL (if Docker unavailable)
```bash
# Copy SQL from migration file
cat supabase/migrations/20251228200000_session_versioning_system.sql

# Paste into Supabase Dashboard → SQL Editor → New Query
# Execute the query
```

### Option 3: Script (Alternative)
```bash
# Create TypeScript script to apply migration
npm run apply-migration
```

## Recovering Lost Deliverables

### Regeneration Script

**File**: `/scripts/regenerate-deliverable.ts`

Usage:
```bash
npm run regenerate-deliverable -- <session-id>
```

Example:
```bash
npm run regenerate-deliverable -- 578eab72-4d6e-4cd0-b5e5-ce11afdaf2ab
```

What it does:
1. Fetches session data (placements, conversations)
2. Rebuilds context from all user responses
3. Calls AI with complete context
4. Saves regenerated deliverable to database
5. Marks session as complete

Requirements:
- Session must have conversation history
- Placements must be intact
- OpenAI API key must be configured

Output:
```
🔄 Regenerating deliverable for session: 578eab72...
📋 Session Info: quantum-initiation, 5/5 steps
💬 Found 6 conversation records
✅ Placements loaded
🤖 Calling AI to regenerate deliverable...
✅ Deliverable generated (12,450 characters)
✅ Deliverable saved to database!
🎉 Regeneration Complete!
```

## Testing Checklist

Before deploying to production:

- [ ] Migration applied successfully
- [ ] Existing sessions have version = 1
- [ ] Free attempts initialized correctly
- [ ] Test creating new version (version 2 created)
- [ ] Test version history modal shows all versions
- [ ] Test viewing previous deliverable
- [ ] Test attempt limit (stops at 2 for regular users)
- [ ] Test placements copied from parent session
- [ ] Test regeneration script recovers lost deliverable
- [ ] Test test account bypasses limits

## User-Facing Features

### Dashboard Improvements

1. **Version Badges**: Sessions show "v2", "v3" badges when multiple versions exist
2. **Attempt Counter**: Shows "Attempts: 1/2" or "Attempts: 2/2"
3. **View All Versions**: Button opens modal with version history
4. **Start New Version**: Green button creates new session (shows remaining attempts)
5. **Previous Deliverables**: Access any past version's deliverable

### Session Detail Page Improvements (Future)

Could add:
- Version selector dropdown
- "Compare Versions" feature
- "Restore This Version" button (creates new version from old one)

## Database Queries

### Get all versions for a product
```sql
SELECT * FROM get_session_versions(
  'user-uuid-here',
  'quantum-initiation'
);
```

### Check if user can create new version
```sql
SELECT * FROM can_create_new_version(
  'user-uuid-here',
  'quantum-initiation'
);
```

### Manually create new version
```sql
SELECT create_session_version(
  'user-uuid-here',
  'quantum-initiation',
  'parent-session-uuid-here'
);
```

## Cleanup Old Sessions (Optional)

If you want to auto-delete old incomplete versions (keep completed ones):

```sql
-- Delete incomplete sessions older than 90 days
DELETE FROM product_sessions
WHERE is_complete = false
  AND created_at < NOW() - INTERVAL '90 days'
  AND is_latest_version = false;  -- Keep latest even if incomplete
```

## Future Enhancements

1. **Paid Additional Sessions**: Allow users to purchase extra attempts beyond free limit
2. **Version Comparison**: Side-by-side view of two versions
3. **Version Templates**: Start new version from any previous version (not just latest)
4. **Version Notes**: Let users add notes to each version
5. **Export All Versions**: Download all deliverables as PDF bundle

## Troubleshooting

### "Free attempts limit reached" error
**Cause**: User has used all 2 free attempts
**Solution**:
- Increase limit: `UPDATE product_access SET free_attempts_limit = 5 WHERE user_id = '...'`
- Or implement paid sessions feature

### Version history shows duplicate versions
**Cause**: Migration ran multiple times or manual inserts
**Solution**: Check `version` column uniqueness per user+product

### Placements not copied to new version
**Cause**: Parent session had no placements
**Solution**: User must upload charts in new session's Step 1

### Regeneration script fails
**Cause**: No conversation history or missing OpenAI key
**Solution**:
- Check `conversations` table for session_id
- Verify `OPENAI_API_KEY` in `.env.local`

## Support

For issues:
1. Check migration applied: `SELECT version FROM product_sessions LIMIT 1;`
2. Check attempts tracking: `SELECT free_attempts_used, free_attempts_limit FROM product_access;`
3. Run diagnostics: `npm run diagnostics`
4. Recover data: `npm run recover-session -- <session-id>`
