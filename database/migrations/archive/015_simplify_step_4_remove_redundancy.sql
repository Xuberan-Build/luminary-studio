-- =====================================================
-- Simplify Personal Alignment Step 4
-- Remove Redundant Future Vision Questions
-- (Step 5 already covers Life Purpose/Vision in depth)
-- =====================================================

-- Update Step 4 to focus only on identity evolution (past → present → becoming)
-- Remove detailed morning/midday/evening future vision breakdown (redundant with Step 5)
UPDATE product_definitions
SET steps = jsonb_set(
  steps,
  '{3,question}',
  to_jsonb('**Why This Matters:**
You're not meant to stay the same person forever. Identity evolution is natural and necessary. Your chart shows your growth direction—where you've been, where you are, and where you're being called.

**Past Identity (5 years ago):**
• What were your priorities and goals back then?
• What did you believe about yourself and the world?
• What made you feel successful or valuable?

**Present Identity (Now):**
• How have your priorities shifted since then?
• What beliefs have changed?
• What matters to you now that didn't matter before?
• What used to matter that doesn't matter anymore?

**Future Direction (Who You're Becoming):**
• What version of yourself are you being called to become?
• What needs to die so the new you can emerge?
• If you could let go of one old identity, what would it be?

**Your Response:**
Describe who you were 5 years ago, who you are now, and the direction you sense yourself moving. Be honest about what's changing and what needs to change. Identity evolution is natural—your chart confirms it.'::text)
)
WHERE product_slug = 'personal-alignment';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Simplified Personal Alignment Step 4';
  RAISE NOTICE '✅ Removed redundant future vision questions (covered in Step 5)';
  RAISE NOTICE '✅ Step 4 now focuses on identity evolution only';
END $$;
