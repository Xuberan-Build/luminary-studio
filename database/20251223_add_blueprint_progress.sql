-- =====================================================
-- Blueprint experience state
-- Track placements, confirmation, section progress, and follow-up counts
-- =====================================================

ALTER TABLE product_sessions
  ADD COLUMN IF NOT EXISTS placements JSONB,
  ADD COLUMN IF NOT EXISTS placements_confirmed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_section INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS followup_counts JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_product_sessions_placements_confirmed
  ON product_sessions(placements_confirmed);

CREATE INDEX IF NOT EXISTS idx_product_sessions_current_section
  ON product_sessions(current_section);

