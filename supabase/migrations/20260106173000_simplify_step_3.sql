-- Simplify Step 3 (Energy Audit) to reduce form fatigue
-- Keep focused questions without overwhelming bullet lists

UPDATE product_definitions
SET steps = jsonb_set(
  steps,
  '{2,question}',
  to_jsonb(E'**Energy Audit**

Your energy is your most valuable resource. Understanding what energizes vs. drains you is essential for sustainable success.

**What energizes you?**
What activities make you lose track of time and feel most alive?

**What drains you?**
What do you procrastinate on or dread? What feels like obligation rather than opportunity?

**Your current daily reality:**
Describe a typical day from wake to sleep. What percentage is energizing vs. draining?'::text)
)
WHERE product_slug = 'personal-alignment';
