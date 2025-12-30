# Safe Database Cleanup & Migration Guide

## 🛡️ Data Safety First

**RULE #1**: Never delete user data without backups and user consent

**RULE #2**: All cleanups are reversible

**RULE #3**: Test on local/staging before production

## 🎯 What Will Be Cleaned Up (Safe)

### ✅ Safe to Delete
- **Orphaned files**: Storage files with no database record
- **Orphaned DB records**: Database records with no actual file in storage
- **Old incomplete sessions**: Sessions >30 days old, never completed, user hasn't touched
- **Duplicate migrations**: Keep only the latest, proper format

### ❌ NEVER Delete
- **User placements**: Chart data (astrology/HD)
- **Completed deliverables**: Final blueprints
- **Active sessions**: Any session modified in last 30 days
- **Conversation history**: For completed sessions (valuable for improvements)
- **Product access records**: Purchase history

## 📋 Safe Cleanup Process

### Phase 1: Backup Everything (REQUIRED)

```bash
# 1. Backup production database
supabase db dump -f backup_$(date +%Y%m%d).sql

# 2. Download all storage buckets
# Via Supabase Dashboard → Storage → Download bucket

# 3. Export critical tables as JSON
```

**SQL Backup Commands:**
```sql
-- Backup all user sessions
COPY (SELECT * FROM product_sessions) TO '/tmp/sessions_backup.csv' CSV HEADER;

-- Backup placements data
COPY (SELECT user_id, product_slug, placements, created_at FROM product_sessions WHERE placements IS NOT NULL) TO '/tmp/placements_backup.csv' CSV HEADER;

-- Backup deliverables
COPY (SELECT id, user_id, product_slug, deliverable_content, completed_at FROM product_sessions WHERE is_complete = true) TO '/tmp/deliverables_backup.csv' CSV HEADER;
```

### Phase 2: Identify What to Clean (Read-Only)

**Run diagnostics** (these only SELECT, never DELETE):

```sql
-- See what would be deleted
\i database/diagnostics/database_health_check.sql
\i database/diagnostics/storage_and_data_audit.sql
```

**Review output carefully:**
- How many orphaned files?
- How many incomplete sessions?
- Are any sessions from test accounts?

### Phase 3: Dry Run Cleanup (Preview Only)

**Create preview queries** that show what would be deleted:

```sql
-- Preview: Orphaned files that would be deleted
SELECT
  'WOULD DELETE' as action,
  so.name as file_path,
  pg_size_pretty((so.metadata->>'size')::bigint) as size,
  so.created_at
FROM storage.objects so
LEFT JOIN uploaded_documents ud ON so.name = ud.storage_path
WHERE so.bucket_id = 'user-uploads'
  AND ud.id IS NULL
  AND so.created_at < NOW() - INTERVAL '30 days';  -- Only old orphans

-- Preview: Old incomplete sessions that would be cleaned
SELECT
  'WOULD DELETE' as action,
  ps.id,
  ps.product_slug,
  ps.current_step,
  ps.created_at,
  ps.updated_at,
  u.email
FROM product_sessions ps
JOIN auth.users u ON ps.user_id = u.id
WHERE ps.is_complete = false
  AND ps.updated_at < NOW() - INTERVAL '30 days'  -- Not touched in 30 days
  AND ps.placements_confirmed = false;  -- Never even uploaded charts
```

### Phase 4: Execute Cleanup (With Safety Checks)

**Cleanup migration template** (safe version):

```sql
-- Create archive table first (safety net)
CREATE TABLE IF NOT EXISTS deleted_sessions_archive (
  id uuid,
  user_id uuid,
  product_slug text,
  placements jsonb,
  deliverable_content text,
  deleted_at timestamptz DEFAULT NOW(),
  deletion_reason text
);

-- Move to archive before deleting
INSERT INTO deleted_sessions_archive (id, user_id, product_slug, placements, deliverable_content, deletion_reason)
SELECT
  id,
  user_id,
  product_slug,
  placements,
  deliverable_content,
  'Old incomplete session - not touched in 30+ days'
FROM product_sessions
WHERE is_complete = false
  AND updated_at < NOW() - INTERVAL '30 days'
  AND placements_confirmed = false
  AND user_id NOT IN (SELECT id FROM auth.users WHERE email LIKE '%@test.com'); -- Never delete test accounts

-- THEN delete (but data is archived)
DELETE FROM product_sessions
WHERE id IN (SELECT id FROM deleted_sessions_archive WHERE deleted_at > NOW() - INTERVAL '1 hour');
```

### Phase 5: Verify & Rollback Plan

**After cleanup:**

```sql
-- Verify critical data intact
SELECT COUNT(*) as total_sessions FROM product_sessions;
SELECT COUNT(*) as sessions_with_placements FROM product_sessions WHERE placements IS NOT NULL;
SELECT COUNT(*) as completed_sessions FROM product_sessions WHERE is_complete = true;
SELECT COUNT(*) as sessions_with_deliverables FROM product_sessions WHERE deliverable_content IS NOT NULL;

-- Check archive
SELECT COUNT(*) as archived_sessions FROM deleted_sessions_archive;
```

**Rollback if needed:**

```sql
-- Restore from archive
INSERT INTO product_sessions (id, user_id, product_slug, placements, deliverable_content, /* all fields */)
SELECT id, user_id, product_slug, placements, deliverable_content, /* all fields */
FROM deleted_sessions_archive
WHERE deletion_reason = 'Old incomplete session - not touched in 30+ days';

-- Delete from archive
DELETE FROM deleted_sessions_archive WHERE id IN (...);
```

## 🔐 Migration Safety Rules

### For Schema Changes

```sql
-- ✅ SAFE: Add new column (doesn't affect existing data)
ALTER TABLE product_sessions ADD COLUMN IF NOT EXISTS new_field text;

-- ✅ SAFE: Add index (improves performance, doesn't change data)
CREATE INDEX IF NOT EXISTS idx_sessions_user_product ON product_sessions(user_id, product_slug);

-- ⚠️ RISKY: Rename column (breaks old code referencing it)
-- DON'T DO: ALTER TABLE product_sessions RENAME COLUMN old_name TO new_name;
-- INSTEAD: Add new column, copy data, deprecate old

-- ❌ DANGEROUS: Drop column without backup
-- NEVER DO: ALTER TABLE product_sessions DROP COLUMN important_data;
```

### For Data Migrations

```sql
-- ✅ SAFE: Copy data with validation
UPDATE product_sessions
SET new_field = old_field
WHERE new_field IS NULL AND old_field IS NOT NULL;

-- ✅ SAFE: Add default for missing data
UPDATE product_sessions
SET placements_confirmed = false
WHERE placements_confirmed IS NULL;

-- ❌ DANGEROUS: Bulk delete without WHERE clause
-- NEVER DO: DELETE FROM product_sessions;
```

## 🧪 Testing Strategy

### Local Testing

```bash
# 1. Start local Supabase
supabase start

# 2. Apply migration locally
supabase db push

# 3. Test with real-ish data
# Create test user, test session, upload charts, etc.

# 4. Verify everything works
# Check that data flows correctly

# 5. Reset and try again
supabase db reset
```

### Staging Environment

1. Create separate Supabase project for staging
2. Copy production data snapshot to staging
3. Apply migrations to staging
4. Test thoroughly
5. Only then apply to production

## 📊 Migration Checklist

Before applying ANY migration:

- [ ] Backup created? (`supabase db dump`)
- [ ] Tested locally? (`supabase start` + `supabase db push`)
- [ ] Tested on staging with real data?
- [ ] Dry run executed (preview queries)?
- [ ] Rollback plan documented?
- [ ] Critical data verified intact?
- [ ] Team/users notified if downtime expected?

## 🚨 What If Something Goes Wrong?

### Immediate Rollback

```sql
-- If migration fails mid-way, rollback transaction
ROLLBACK;

-- Restore from backup
psql -h db.xxx.supabase.co -U postgres -d postgres -f backup_20251228.sql
```

### Data Recovery

```sql
-- Check archive tables
SELECT * FROM deleted_sessions_archive WHERE deleted_at > NOW() - INTERVAL '24 hours';

-- Restore specific sessions
INSERT INTO product_sessions SELECT * FROM deleted_sessions_archive WHERE id = 'xxx';
```

### User Communication

If user data is affected:
1. Immediately notify users via email
2. Explain what happened
3. Provide timeline for recovery
4. Offer compensation if needed

## ✅ Recommended Safe Cleanup

**Start with these low-risk cleanups:**

### 1. Remove Duplicate Migrations (File System Only)
```bash
# Rename duplicates with .old extension
mv database/migrations/007_fix_rls_security.sql database/migrations/007_fix_rls_security.sql.old
```

### 2. Archive Old Uploads (>90 days, incomplete sessions)
```sql
-- Just mark as archived, don't delete yet
ALTER TABLE uploaded_documents ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;

UPDATE uploaded_documents
SET archived = true
WHERE session_id IN (
  SELECT id FROM product_sessions
  WHERE is_complete = false
  AND created_at < NOW() - INTERVAL '90 days'
);
```

### 3. Clean Up Test Data Only
```sql
-- Only delete sessions from known test accounts
DELETE FROM product_sessions
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('santos.93.aus@gmail.com')  -- Test account
  AND is_complete = false
  AND created_at < NOW() - INTERVAL '7 days'
);
```

## 📝 Summary

**Safe cleanup means:**
1. ✅ Always backup first
2. ✅ Preview what will be deleted
3. ✅ Archive before deleting
4. ✅ Test on local/staging
5. ✅ Have rollback plan
6. ✅ Never delete completed user data
7. ✅ Keep data for 30-90 days before permanent deletion

**You control:**
- What gets cleaned
- When it happens
- How to rollback
- What's kept forever

No surprises, no data loss! 🛡️
