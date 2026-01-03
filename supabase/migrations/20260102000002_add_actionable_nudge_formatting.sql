-- =====================================================
-- ADD ACTIONABLE NUDGE FORMATTING INSTRUCTIONS
-- Ensures AI formats nudges properly for extraction
-- =====================================================

BEGIN;

-- Add actionable nudge instructions to Step 2 (Business Overview)
UPDATE product_definitions
SET steps = jsonb_set(
  steps,
  '{1,prompt}',
  to_jsonb(
    steps->1->>'prompt' || E'\n\n**ACTIONABLE NUDGE:**\nEnd your response with 1 specific actionable nudge formatted as:\n"Actionable nudge (timeframe): [specific action to take]"\n\nExample: "Actionable nudge (this week): choose one audience hub and post 3 direction-setting messages about your expert positioning."\n\nRules:\n- Make it specific and concrete (not a question)\n- Include a timeframe (this week, tomorrow, next 48 hours)\n- Start with an action verb (choose, write, create, schedule, post, send)'
  )
)
WHERE product_slug = 'quantum-initiation';

-- Add actionable nudge instructions to Step 3 (Current Challenge)
UPDATE product_definitions
SET steps = jsonb_set(
  steps,
  '{2,prompt}',
  to_jsonb(
    steps->2->>'prompt' || E'\n\n**ACTIONABLE NUDGE:**\nEnd your response with 1 specific actionable nudge formatted as:\n"Actionable nudge (timeframe): [specific action to take]"\n\nExample: "Actionable nudge (tomorrow): write one 3-sentence script addressing your root constraint and practice saying it out loud."\n\nRules:\n- Make it specific and concrete (not a question)\n- Include a timeframe (this week, tomorrow, next 48 hours)\n- Start with an action verb (choose, write, create, schedule, post, send)'
  )
)
WHERE product_slug = 'quantum-initiation';

-- Add actionable nudge instructions to Step 4 (Human Design)
UPDATE product_definitions
SET steps = jsonb_set(
  steps,
  '{3,prompt}',
  to_jsonb(
    COALESCE(steps->3->>'prompt', '') || E'\n\n**ACTIONABLE NUDGE:**\nEnd your response with 1 specific actionable nudge formatted as:\n"Actionable nudge (timeframe): [specific action to take]"\n\nExample: "Actionable nudge (this week): schedule 2 hours to redesign your work process aligned with your Human Design type."\n\nRules:\n- Make it specific and concrete (not a question)\n- Include a timeframe (this week, tomorrow, next 48 hours)\n- Start with an action verb (choose, write, create, schedule, post, send)'
  )
)
WHERE product_slug = 'quantum-initiation';

-- Add actionable nudge instructions to Step 5 (Vision & Goals)
UPDATE product_definitions
SET steps = jsonb_set(
  steps,
  '{4,prompt}',
  to_jsonb(
    steps->4->>'prompt' || E'\n\n**ACTIONABLE NUDGE:**\nEnd your response with 1 specific actionable nudge formatted as:\n"Actionable nudge (timeframe): [specific action to take]"\n\nExample: "Actionable nudge (next 48 hours): create a simple one-page vision document with your 90-day goal and share it with one trusted peer for accountability."\n\nRules:\n- Make it specific and concrete (not a question)\n- Include a timeframe (this week, tomorrow, next 48 hours)\n- Start with an action verb (choose, write, create, schedule, post, send)'
  )
)
WHERE product_slug = 'quantum-initiation';

-- Verify updates
SELECT
  product_slug,
  'Updated' as status,
  jsonb_array_length(steps) as total_steps,
  (steps->1->>'prompt' LIKE '%ACTIONABLE NUDGE%') as step2_has_nudge,
  (steps->2->>'prompt' LIKE '%ACTIONABLE NUDGE%') as step3_has_nudge,
  (steps->3->>'prompt' LIKE '%ACTIONABLE NUDGE%') as step4_has_nudge,
  (steps->4->>'prompt' LIKE '%ACTIONABLE NUDGE%') as step5_has_nudge
FROM product_definitions
WHERE product_slug = 'quantum-initiation';

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Actionable Nudge formatting instructions added!';
  RAISE NOTICE '';
  RAISE NOTICE 'Updated Steps:';
  RAISE NOTICE '  ✓ Step 2: Business Overview';
  RAISE NOTICE '  ✓ Step 3: Current Challenge';
  RAISE NOTICE '  ✓ Step 4: Human Design';
  RAISE NOTICE '  ✓ Step 5: Vision & Goals';
  RAISE NOTICE '';
  RAISE NOTICE 'AI will now format actionable nudges as:';
  RAISE NOTICE '  "Actionable nudge (timeframe): [action]"';
  RAISE NOTICE '';
  RAISE NOTICE 'These will be properly extracted and displayed in the deliverable!';
END $$;
