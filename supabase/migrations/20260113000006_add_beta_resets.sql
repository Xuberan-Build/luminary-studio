-- Give beta participants 5 additional attempts for testing improved scans
-- Improvements: Money Signal restructure, character limits reduced, slider UI, better questions, actionable nudges

-- Increase free_attempts_limit by 5 for all active beta participants
UPDATE product_access
SET free_attempts_limit = free_attempts_limit + 5
WHERE user_id IN (
  SELECT user_id
  FROM beta_participants
  WHERE status = 'active'
);

-- Verify the update
SELECT
  u.email,
  pa.product_slug,
  pa.free_attempts_used,
  pa.free_attempts_limit,
  (pa.free_attempts_limit - pa.free_attempts_used) as remaining
FROM product_access pa
JOIN users u ON pa.user_id = u.id
JOIN beta_participants bp ON bp.user_id = u.id
WHERE bp.status = 'active'
ORDER BY u.email, pa.product_slug;
