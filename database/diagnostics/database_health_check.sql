-- =====================================================
-- Database Health Check & Cleanup Diagnostic
-- Run this in Supabase SQL Editor to identify issues
-- =====================================================

-- 1. TABLE OVERVIEW
SELECT '=== TABLES OVERVIEW ===' as section;
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 2. ORPHANED SESSIONS (sessions without product definitions)
SELECT '=== ORPHANED SESSIONS ===' as section;
SELECT
  ps.id,
  ps.product_slug,
  ps.created_at,
  'No matching product definition' as issue
FROM product_sessions ps
LEFT JOIN product_definitions pd ON ps.product_slug = pd.product_slug
WHERE pd.product_slug IS NULL;

-- 3. ORPHANED CONVERSATIONS (conversations without sessions)
SELECT '=== ORPHANED CONVERSATIONS ===' as section;
SELECT
  c.id,
  c.session_id,
  c.step_number,
  'Session not found' as issue
FROM conversations c
LEFT JOIN product_sessions ps ON c.session_id = ps.id
WHERE ps.id IS NULL;

-- 4. ORPHANED UPLOADED DOCUMENTS (files without sessions)
SELECT '=== ORPHANED UPLOADED DOCUMENTS ===' as section;
SELECT
  ud.id,
  ud.session_id,
  ud.file_name,
  ud.storage_path,
  'Session not found' as issue
FROM uploaded_documents ud
LEFT JOIN product_sessions ps ON ud.session_id = ps.id
WHERE ps.id IS NULL;

-- 5. INCOMPLETE SESSIONS (old sessions stuck in progress)
SELECT '=== INCOMPLETE SESSIONS (>7 days old) ===' as section;
SELECT
  ps.id,
  ps.product_slug,
  ps.current_step,
  ps.total_steps,
  ps.placements_confirmed,
  ps.is_complete,
  ps.created_at,
  NOW() - ps.created_at as age
FROM product_sessions ps
WHERE ps.is_complete = false
  AND ps.created_at < NOW() - INTERVAL '7 days'
ORDER BY ps.created_at DESC;

-- 6. DUPLICATE SESSIONS (multiple sessions for same user/product)
SELECT '=== DUPLICATE SESSIONS ===' as section;
SELECT
  u.email,
  ps.product_slug,
  COUNT(*) as session_count,
  ARRAY_AGG(ps.id ORDER BY ps.created_at DESC) as session_ids,
  ARRAY_AGG(ps.created_at ORDER BY ps.created_at DESC) as created_dates
FROM product_sessions ps
JOIN auth.users u ON ps.user_id = u.id
GROUP BY u.email, ps.product_slug
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 7. STORAGE USAGE BY USER
SELECT '=== STORAGE USAGE BY USER ===' as section;
SELECT
  u.email,
  COUNT(ud.id) as file_count,
  SUM(ud.file_size) as total_bytes,
  pg_size_pretty(SUM(ud.file_size)::bigint) as total_size
FROM auth.users u
LEFT JOIN uploaded_documents ud ON u.id = ud.user_id
GROUP BY u.email
ORDER BY SUM(ud.file_size) DESC NULLS LAST;

-- 8. SESSIONS WITHOUT PLACEMENTS (should have been uploaded)
SELECT '=== SESSIONS MISSING PLACEMENTS ===' as section;
SELECT
  ps.id,
  ps.product_slug,
  ps.current_step,
  ps.placements_confirmed,
  ps.created_at
FROM product_sessions ps
WHERE ps.current_step > 1
  AND (ps.placements IS NULL OR ps.placements_confirmed = false)
ORDER BY ps.created_at DESC;

-- 9. PRODUCT ACCESS WITHOUT USERS
SELECT '=== ORPHANED PRODUCT ACCESS ===' as section;
SELECT
  pa.id,
  pa.user_id,
  pa.product_slug,
  'User not found' as issue
FROM product_access pa
LEFT JOIN auth.users u ON pa.user_id = u.id
WHERE u.id IS NULL;

-- 10. SUMMARY STATS
SELECT '=== SUMMARY STATISTICS ===' as section;
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM product_definitions) as total_products,
  (SELECT COUNT(*) FROM product_sessions) as total_sessions,
  (SELECT COUNT(*) FROM product_sessions WHERE is_complete = true) as completed_sessions,
  (SELECT COUNT(*) FROM conversations) as total_conversations,
  (SELECT COUNT(*) FROM uploaded_documents) as total_uploaded_files,
  (SELECT COUNT(*) FROM product_access WHERE access_granted = true) as total_access_grants;
