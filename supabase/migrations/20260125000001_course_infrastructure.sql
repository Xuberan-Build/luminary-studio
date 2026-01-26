-- =====================================================
-- COURSE INFRASTRUCTURE: Definitions, Modules, Submodules, Progress
-- =====================================================

-- Courses catalog
CREATE TABLE IF NOT EXISTS course_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Course modules
CREATE TABLE IF NOT EXISTS course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug text NOT NULL REFERENCES course_definitions (slug) ON DELETE CASCADE,
  module_id text NOT NULL,
  title text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (course_slug, module_id)
);

-- Course submodules
CREATE TABLE IF NOT EXISTS course_submodules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug text NOT NULL REFERENCES course_definitions (slug) ON DELETE CASCADE,
  module_id text NOT NULL,
  submodule_id text NOT NULL,
  title text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  start_coord text NOT NULL,
  end_coord text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (course_slug, module_id, submodule_id),
  CONSTRAINT course_submodules_module_fk
    FOREIGN KEY (course_slug, module_id)
    REFERENCES course_modules (course_slug, module_id)
    ON DELETE CASCADE
);

-- Aggregate progress (latest + furthest)
CREATE TABLE IF NOT EXISTS course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  course_slug text NOT NULL REFERENCES course_definitions (slug) ON DELETE CASCADE,
  module_id text NOT NULL,
  submodule_id text,
  current_coord text,
  max_coord text,
  max_coord_x integer,
  max_coord_y integer,
  started_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (user_id, course_slug, module_id, submodule_id)
);

-- Per-slide events (deduped)
CREATE TABLE IF NOT EXISTS course_slide_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  course_slug text NOT NULL REFERENCES course_definitions (slug) ON DELETE CASCADE,
  module_id text NOT NULL,
  submodule_id text,
  coord text NOT NULL,
  coord_x integer,
  coord_y integer,
  visited_at timestamptz DEFAULT now(),
  UNIQUE (user_id, course_slug, module_id, submodule_id, coord)
);

CREATE INDEX IF NOT EXISTS course_progress_user_idx
  ON course_progress (user_id, course_slug, module_id, submodule_id);

CREATE INDEX IF NOT EXISTS course_slide_events_user_idx
  ON course_slide_events (user_id, course_slug, module_id, submodule_id);

CREATE INDEX IF NOT EXISTS course_slide_events_visited_idx
  ON course_slide_events (visited_at);

-- =====================================================
-- RLS
-- =====================================================

ALTER TABLE course_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_submodules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_slide_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read course_definitions" ON course_definitions;
CREATE POLICY "Public read course_definitions"
  ON course_definitions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public read course_modules" ON course_modules;
CREATE POLICY "Public read course_modules"
  ON course_modules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public read course_submodules" ON course_submodules;
CREATE POLICY "Public read course_submodules"
  ON course_submodules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users read own course_progress" ON course_progress;
CREATE POLICY "Users read own course_progress"
  ON course_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users write own course_progress" ON course_progress;
CREATE POLICY "Users write own course_progress"
  ON course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own course_progress" ON course_progress;
CREATE POLICY "Users update own course_progress"
  ON course_progress FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own course_slide_events" ON course_slide_events;
CREATE POLICY "Users read own course_slide_events"
  ON course_slide_events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users write own course_slide_events" ON course_slide_events;
CREATE POLICY "Users write own course_slide_events"
  ON course_slide_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Function: record per-slide progress (dedup + furthest)
-- =====================================================

CREATE OR REPLACE FUNCTION record_course_slide_event(
  p_user_id uuid,
  p_course_slug text,
  p_module_id text,
  p_submodule_id text,
  p_coord text,
  p_coord_x integer,
  p_coord_y integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  use_coord_x integer := COALESCE(p_coord_x, 0);
  use_coord_y integer := COALESCE(p_coord_y, 0);
  is_furthest boolean := false;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  INSERT INTO course_slide_events (
    user_id,
    course_slug,
    module_id,
    submodule_id,
    coord,
    coord_x,
    coord_y
  )
  VALUES (
    p_user_id,
    p_course_slug,
    p_module_id,
    p_submodule_id,
    p_coord,
    use_coord_x,
    use_coord_y
  )
  ON CONFLICT DO NOTHING;

  INSERT INTO course_progress (
    user_id,
    course_slug,
    module_id,
    submodule_id,
    current_coord,
    max_coord,
    max_coord_x,
    max_coord_y,
    started_at,
    last_activity_at
  )
  VALUES (
    p_user_id,
    p_course_slug,
    p_module_id,
    p_submodule_id,
    p_coord,
    p_coord,
    use_coord_x,
    use_coord_y,
    now(),
    now()
  )
  ON CONFLICT (user_id, course_slug, module_id, submodule_id)
  DO UPDATE
  SET
    current_coord = EXCLUDED.current_coord,
    last_activity_at = now(),
    max_coord_x = CASE
      WHEN course_progress.max_coord_x IS NULL THEN use_coord_x
      WHEN use_coord_x > course_progress.max_coord_x THEN use_coord_x
      WHEN use_coord_x = course_progress.max_coord_x AND use_coord_y > course_progress.max_coord_y THEN use_coord_x
      ELSE course_progress.max_coord_x
    END,
    max_coord_y = CASE
      WHEN course_progress.max_coord_y IS NULL THEN use_coord_y
      WHEN use_coord_x > course_progress.max_coord_x THEN use_coord_y
      WHEN use_coord_x = course_progress.max_coord_x AND use_coord_y > course_progress.max_coord_y THEN use_coord_y
      ELSE course_progress.max_coord_y
    END,
    max_coord = CASE
      WHEN course_progress.max_coord_x IS NULL THEN p_coord
      WHEN use_coord_x > course_progress.max_coord_x THEN p_coord
      WHEN use_coord_x = course_progress.max_coord_x AND use_coord_y > course_progress.max_coord_y THEN p_coord
      ELSE course_progress.max_coord
    END;
END;
$$;

GRANT EXECUTE ON FUNCTION record_course_slide_event(
  uuid,
  text,
  text,
  text,
  text,
  integer,
  integer
) TO authenticated;
