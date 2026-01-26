-- =====================================================
-- COURSE ENROLLMENTS
-- =====================================================

-- Ensure the VCAP course exists in definitions
INSERT INTO course_definitions (slug, title, description, status)
VALUES (
  'vcap',
  'Visionary Creator''s Activation Protocol',
  'Reprogram your consciousness for creative life mastery.',
  'active'
)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  course_slug text NOT NULL REFERENCES course_definitions (slug) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE (user_id, course_slug)
);

CREATE INDEX IF NOT EXISTS course_enrollments_user_idx
  ON course_enrollments (user_id, course_slug);

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own course_enrollments" ON course_enrollments;
CREATE POLICY "Users read own course_enrollments"
  ON course_enrollments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own course_enrollments" ON course_enrollments;
CREATE POLICY "Users insert own course_enrollments"
  ON course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own course_enrollments" ON course_enrollments;
CREATE POLICY "Users update own course_enrollments"
  ON course_enrollments FOR UPDATE
  USING (auth.uid() = user_id);
