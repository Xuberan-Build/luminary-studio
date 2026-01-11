-- Further simplify Step 4 to reduce form fatigue
-- Three simple questions (one per time period)

UPDATE product_definitions
SET steps = jsonb_set(
  steps,
  '{3,question}',
  to_jsonb(E'**Identity Evolution**

You''re not the same person you were 5 years ago—and you won''t be the same person 5 years from now.

**Who were you 5 years ago?**
What were your priorities and what made you feel successful?

**Who are you now?**
What matters to you today that didn''t matter before?

**Who are you becoming?**
What needs to die so the new you can emerge?'::text)
)
WHERE product_slug = 'personal-alignment';
