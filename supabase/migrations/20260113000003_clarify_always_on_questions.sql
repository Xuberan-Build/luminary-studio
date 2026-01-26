-- Clarify "always-on" questions in perception-rite-scan-3 (Boundary & Burnout)
-- Issue: Questions assumed everyone has "always-on" pattern and used unexplained "core state" jargon
-- Fix: Make questions more accessible and add help text

-- Update Step 1: Make it less assumptive
UPDATE product_definitions
SET steps = jsonb_set(
  jsonb_set(
    jsonb_set(
      steps,
      '{0,title}',
      '"Mental Loop"'
    ),
    '{0,question}',
    '"What thoughts or worries loop in your mind, even when you''re trying to rest or relax?"'
  ),
  '{0,text_input,placeholder}',
  '"Example: I keep replaying client conversations and thinking about what I should have said, or worrying about upcoming deadlines."'
)
WHERE product_slug = 'perception-rite-scan-3';

-- Update Step 8: Remove jargon and make it clearer
UPDATE product_definitions
SET steps = jsonb_set(
  jsonb_set(
    jsonb_set(
      steps,
      '{7,title}',
      '"Why You Stay On"'
    ),
    '{7,question}',
    '"Why do you keep this mental loop running? What are you afraid might happen if you truly turned it off? What deeper feeling of security or peace are you trying to create by staying vigilant?"'
  ),
  '{7,text_input,label}',
  '"The deeper reason I stay mentally \"on\""'
)
WHERE product_slug = 'perception-rite-scan-3';

-- Update Step 8 placeholder for clarity
UPDATE product_definitions
SET steps = jsonb_set(
  steps,
  '{7,text_input,placeholder}',
  '"Example: I stay vigilant about work because if I let my guard down, I might miss something critical and lose a client. What I really want is to feel secure and know my business is stable, so I can finally relax without guilt."'
)
WHERE product_slug = 'perception-rite-scan-3';
