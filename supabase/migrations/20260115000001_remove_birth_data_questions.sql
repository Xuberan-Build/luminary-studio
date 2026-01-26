-- Remove any step that asks users to type birth data (date/time/location).
-- Step 1 remains chart upload + confirmation, so questions should not request birth data.

WITH updated AS (
  UPDATE product_definitions
  SET steps = (
    SELECT COALESCE(
      jsonb_agg(
        step
        ORDER BY
          CASE
            WHEN step ? 'order' AND (step->>'order') ~ '^[0-9]+$'
              THEN (step->>'order')::int
            ELSE 9999
          END
      ),
      '[]'::jsonb
    )
    FROM jsonb_array_elements(steps) AS step
    WHERE NOT (
      (step->>'question') ILIKE '%birth date%'
      OR (step->>'question') ILIKE '%birth time%'
      OR (step->>'question') ILIKE '%birth location%'
      OR (step->>'question') ILIKE '%date of birth%'
      OR (step->>'question') ILIKE '%time of birth%'
      OR (step->>'question') ILIKE '%place of birth%'
      OR (step->>'prompt') ILIKE '%birth date%'
      OR (step->>'prompt') ILIKE '%birth time%'
      OR (step->>'prompt') ILIKE '%birth location%'
      OR (step->>'prompt') ILIKE '%date of birth%'
      OR (step->>'prompt') ILIKE '%time of birth%'
      OR (step->>'prompt') ILIKE '%place of birth%'
    )
  )
  WHERE steps IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(steps) AS step
      WHERE
        (step->>'question') ILIKE '%birth date%'
        OR (step->>'question') ILIKE '%birth time%'
        OR (step->>'question') ILIKE '%birth location%'
        OR (step->>'question') ILIKE '%date of birth%'
        OR (step->>'question') ILIKE '%time of birth%'
        OR (step->>'question') ILIKE '%place of birth%'
        OR (step->>'prompt') ILIKE '%birth date%'
        OR (step->>'prompt') ILIKE '%birth time%'
        OR (step->>'prompt') ILIKE '%birth location%'
        OR (step->>'prompt') ILIKE '%date of birth%'
        OR (step->>'prompt') ILIKE '%time of birth%'
        OR (step->>'prompt') ILIKE '%place of birth%'
    )
  RETURNING id
)
UPDATE product_definitions
SET total_steps = jsonb_array_length(steps)
WHERE id IN (SELECT id FROM updated);
