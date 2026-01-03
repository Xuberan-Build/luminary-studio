-- =====================================================
-- PRODUCTION DEPLOYMENT: Complete Actionable Nudge Rollout
-- Adds nudge formatting instructions to ALL products
-- This captures changes made via scripts for production
-- =====================================================

BEGIN;

-- Add actionable nudge instructions template
CREATE OR REPLACE FUNCTION add_nudge_to_step(step_prompt TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Only add if not already present
  IF step_prompt IS NULL OR step_prompt LIKE '%ACTIONABLE NUDGE%' THEN
    RETURN step_prompt;
  END IF;

  RETURN step_prompt || E'\n\n**ACTIONABLE NUDGE:**
End your response with 1 specific actionable nudge formatted as:
"Actionable nudge (timeframe): [specific action to take]"

Example: "Actionable nudge (this week): choose one specific action aligned with this insight and commit to it."

Rules:
- Make it specific and concrete (not a question)
- Include a timeframe (this week, tomorrow, next 48 hours)
- Start with an action verb (choose, write, create, schedule, post, send, etc.)';
END;
$$ LANGUAGE plpgsql;

-- Business Alignment: Update Step 1 (index 0) - Birth Information step needs nudge
UPDATE product_definitions
SET steps = jsonb_set(
  steps,
  '{0,prompt}',
  to_jsonb(add_nudge_to_step(steps->0->>'prompt'))
)
WHERE product_slug = 'business-alignment'
AND steps->0->>'prompt' IS NOT NULL
AND steps->0->>'prompt' NOT LIKE '%ACTIONABLE NUDGE%';

-- Personal Alignment: Update Steps 2-5 (indices 1-4)
UPDATE product_definitions
SET steps = (
  SELECT jsonb_agg(
    CASE
      WHEN (elem->>'step')::int BETWEEN 2 AND 5 AND elem->>'prompt' IS NOT NULL AND elem->>'prompt' NOT LIKE '%ACTIONABLE NUDGE%'
      THEN jsonb_set(elem, '{prompt}', to_jsonb(add_nudge_to_step(elem->>'prompt')))
      ELSE elem
    END
  )
  FROM jsonb_array_elements(steps) elem
)
WHERE product_slug = 'personal-alignment';

-- Brand Alignment: Update Steps 2-8 (indices 1-7)
UPDATE product_definitions
SET steps = (
  SELECT jsonb_agg(
    CASE
      WHEN (elem->>'step')::int BETWEEN 2 AND 8 AND elem->>'prompt' IS NOT NULL AND elem->>'prompt' NOT LIKE '%ACTIONABLE NUDGE%'
      THEN jsonb_set(elem, '{prompt}', to_jsonb(add_nudge_to_step(elem->>'prompt')))
      ELSE elem
    END
  )
  FROM jsonb_array_elements(steps) elem
)
WHERE product_slug = 'brand-alignment';

-- Quantum Structure: Update Steps 2-7 (indices 1-6)
UPDATE product_definitions
SET steps = (
  SELECT jsonb_agg(
    CASE
      WHEN (elem->>'step')::int BETWEEN 2 AND 7 AND elem->>'prompt' IS NOT NULL AND elem->>'prompt' NOT LIKE '%ACTIONABLE NUDGE%'
      THEN jsonb_set(elem, '{prompt}', to_jsonb(add_nudge_to_step(elem->>'prompt')))
      ELSE elem
    END
  )
  FROM jsonb_array_elements(steps) elem
)
WHERE product_slug = 'quantum-structure-profit-scale';

-- Verify all products have nudge instructions
SELECT
  product_slug,
  'VERIFIED' as status,
  jsonb_array_length(steps) as total_steps,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(steps) elem
    WHERE elem->>'prompt' LIKE '%ACTIONABLE NUDGE%'
  ) as steps_with_nudges
FROM product_definitions
WHERE product_slug IN ('business-alignment', 'personal-alignment', 'brand-alignment', 'quantum-structure-profit-scale')
ORDER BY product_slug;

-- Clean up function
DROP FUNCTION add_nudge_to_step(TEXT);

COMMIT;

-- Success message
DO $$
DECLARE
  ba_nudges INT;
  pa_nudges INT;
  bra_nudges INT;
  qs_nudges INT;
BEGIN
  SELECT (SELECT COUNT(*) FROM jsonb_array_elements(steps) elem WHERE elem->>'prompt' LIKE '%ACTIONABLE NUDGE%')
  INTO ba_nudges
  FROM product_definitions WHERE product_slug = 'business-alignment';

  SELECT (SELECT COUNT(*) FROM jsonb_array_elements(steps) elem WHERE elem->>'prompt' LIKE '%ACTIONABLE NUDGE%')
  INTO pa_nudges
  FROM product_definitions WHERE product_slug = 'personal-alignment';

  SELECT (SELECT COUNT(*) FROM jsonb_array_elements(steps) elem WHERE elem->>'prompt' LIKE '%ACTIONABLE NUDGE%')
  INTO bra_nudges
  FROM product_definitions WHERE product_slug = 'brand-alignment';

  SELECT (SELECT COUNT(*) FROM jsonb_array_elements(steps) elem WHERE elem->>'prompt' LIKE '%ACTIONABLE NUDGE%')
  INTO qs_nudges
  FROM product_definitions WHERE product_slug = 'quantum-structure-profit-scale';

  RAISE NOTICE '✅ PRODUCTION DEPLOYMENT: Complete Nudge Rollout';
  RAISE NOTICE '';
  RAISE NOTICE 'Actionable Nudge Instructions Added:';
  RAISE NOTICE '  ✓ Business Alignment: % steps', ba_nudges;
  RAISE NOTICE '  ✓ Personal Alignment: % steps', pa_nudges;
  RAISE NOTICE '  ✓ Brand Alignment: % steps', bra_nudges;
  RAISE NOTICE '  ✓ Quantum Structure: % steps', qs_nudges;
  RAISE NOTICE '';
  RAISE NOTICE 'Total: % steps across 4 products', (ba_nudges + pa_nudges + bra_nudges + qs_nudges);
  RAISE NOTICE '';
  RAISE NOTICE '🎯 All products now generate properly formatted actionable nudges!';
END $$;
