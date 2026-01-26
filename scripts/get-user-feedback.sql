-- Get feedback for user: a81e864a-01cc-4b92-9306-a45a95f98daf

-- 1. Get all scan feedback
SELECT
  product_slug,
  clarity_score,
  relevance_score,
  actionability_score,
  surprise_level,
  (clarity_score + relevance_score + actionability_score + surprise_level) / 4.0 as average_score,
  biggest_aha,
  implementation_plan,
  confusion_points,
  survey_duration_seconds,
  created_at
FROM scan_feedback
WHERE user_id = 'a81e864a-01cc-4b92-9306-a45a95f98daf'
ORDER BY created_at;

-- 2. Get all completed sessions
SELECT
  product_slug,
  completed_at,
  deliverable_content IS NOT NULL as has_deliverable
FROM product_sessions
WHERE user_id = 'a81e864a-01cc-4b92-9306-a45a95f98daf'
  AND is_complete = true
ORDER BY completed_at;

-- 3. Get product access records
SELECT
  product_slug,
  completed_at,
  completion_percentage,
  purchase_source
FROM product_access
WHERE user_id = 'a81e864a-01cc-4b92-9306-a45a95f98daf'
  AND completed_at IS NOT NULL
ORDER BY completed_at;
