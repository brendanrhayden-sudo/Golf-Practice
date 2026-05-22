-- =====================================================================
-- Forefront Golf Coach Builder — Supabase Migration (PROPOSED)
-- =====================================================================
-- ⚠️  DO NOT RUN AUTOMATICALLY.
--      Review every statement and execute manually in the Supabase SQL
--      editor (or via the Supabase CLI) only after a backup snapshot.
--
-- This migration is SILOED from the existing Forefront build:
--    • All objects live in their own schema  →  forefront_golf
--    • All table names are prefixed          →  forefront_golf_*
--    • RLS is enabled with permissive-read stubs only; no writes from
--      anon. Adjust before any client-facing deployment.
--
-- Author:   Brendan Hayden / Forefront
-- Version:  0.1.0  (proof-of-concept; no PII, no client data)
-- Targets:  Postgres 15+ on Supabase
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Schema
-- ---------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS forefront_golf;
COMMENT ON SCHEMA forefront_golf IS
  'Forefront Golf Coach Builder POC. Siloed from the main Forefront namespace.';


-- ---------------------------------------------------------------------
-- 2. Enumerated types
-- ---------------------------------------------------------------------
-- Defensive creates: skip if the type already exists (idempotent runs).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'ff_golf_gpl' AND n.nspname = 'forefront_golf'
  ) THEN
    CREATE TYPE forefront_golf.ff_golf_gpl AS ENUM
      ('L1','L2','L3','L4','L5');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'ff_golf_representativeness' AND n.nspname = 'forefront_golf'
  ) THEN
    CREATE TYPE forefront_golf.ff_golf_representativeness AS ENUM
      ('Low','Medium','High');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'ff_golf_feedback_schedule' AND n.nspname = 'forefront_golf'
  ) THEN
    CREATE TYPE forefront_golf.ff_golf_feedback_schedule AS ENUM
      ('every_rep','faded','summary','self_assessed','none');
  END IF;
END $$;


-- ---------------------------------------------------------------------
-- 3. Drill cards
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS forefront_golf.forefront_golf_drill_cards (
  drill_id                TEXT PRIMARY KEY,
  name                    TEXT NOT NULL,
  category                TEXT NOT NULL,                  -- speed | ground_force | club_face_path | ...
  solves                  TEXT[] NOT NULL DEFAULT '{}',   -- fault IDs (see lookup arrays in data/drills.js)
  cause_lane              TEXT NOT NULL,                  -- skill | physical | psych | equipment
  gpl_fit                 forefront_golf.ff_golf_gpl[] NOT NULL DEFAULT '{}',
  description             TEXT,
  when_why                TEXT,
  active_cue              TEXT NOT NULL,                  -- external, verb-first, ≤7 words
  description_note        TEXT,                           -- e.g. cue tightening / fading rationale
  cue_proximity           TEXT,                           -- distal | proximal-external | internal
  constraint_alternative  TEXT,                           -- representativeness substitute
  representativeness      forefront_golf.ff_golf_representativeness NOT NULL DEFAULT 'Medium',
  feedback_schedule       forefront_golf.ff_golf_feedback_schedule NOT NULL DEFAULT 'faded',
  conflict                TEXT,                           -- contraindications / when not to use
  progression             TEXT,
  regression              TEXT,
  proof_metric            TEXT,                           -- objective measurement (e.g. CHS ± 1 mph)
  source_tags             TEXT[] NOT NULL DEFAULT '{}',   -- Wulf, Winkelman, Gray, OPTIMAL, etc.
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE forefront_golf.forefront_golf_drill_cards IS
  'Canonical drill library. Mirrors the FF_DRILLS array in data/drills.js.';

CREATE INDEX IF NOT EXISTS ff_golf_drill_category_idx
  ON forefront_golf.forefront_golf_drill_cards (category);

CREATE INDEX IF NOT EXISTS ff_golf_drill_cause_lane_idx
  ON forefront_golf.forefront_golf_drill_cards (cause_lane);

CREATE INDEX IF NOT EXISTS ff_golf_drill_solves_gin_idx
  ON forefront_golf.forefront_golf_drill_cards USING GIN (solves);

CREATE INDEX IF NOT EXISTS ff_golf_drill_gpl_gin_idx
  ON forefront_golf.forefront_golf_drill_cards USING GIN (gpl_fit);


-- ---------------------------------------------------------------------
-- 4. Session templates
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS forefront_golf.forefront_golf_session_templates (
  template_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  duration_min    INTEGER NOT NULL CHECK (duration_min BETWEEN 15 AND 180),
  gpl             forefront_golf.ff_golf_gpl NOT NULL,
  goal            TEXT NOT NULL,                          -- speed | accuracy | short_game | ...
  layer           TEXT,                                   -- FM-300 6-layer diagnostic label
  faults          TEXT[] NOT NULL DEFAULT '{}',
  tools           TEXT[] NOT NULL DEFAULT '{}',           -- TrackMan, Mach3, etc.
  block_structure JSONB NOT NULL,                         -- {warmup, acquisition, transfer, scoring, retest}
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE forefront_golf.forefront_golf_session_templates IS
  'Reusable session blueprints produced by the Coach Builder wizard.';

CREATE INDEX IF NOT EXISTS ff_golf_template_gpl_idx
  ON forefront_golf.forefront_golf_session_templates (gpl);

CREATE INDEX IF NOT EXISTS ff_golf_template_goal_idx
  ON forefront_golf.forefront_golf_session_templates (goal);


-- ---------------------------------------------------------------------
-- 5. Session outputs
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS forefront_golf.forefront_golf_session_outputs (
  output_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id        UUID REFERENCES forefront_golf.forefront_golf_session_templates(template_id)
                     ON DELETE CASCADE,
  -- Three artifacts produced from the same selection:
  coach_plan_text    TEXT NOT NULL,        -- internal coach-facing plan (jargon allowed)
  client_assignment  TEXT NOT NULL,        -- jargon-free, ≤120 words, external cues only
  coach_card_html    TEXT NOT NULL,        -- print-ready single-page card
  -- Metadata for traceability (NO client PII permitted here):
  generated_by       TEXT,                 -- coach handle or 'system'
  generated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  drill_ids          TEXT[] NOT NULL DEFAULT '{}'   -- the drills referenced in this output
);

COMMENT ON TABLE forefront_golf.forefront_golf_session_outputs IS
  'Rendered artifacts: coach plan, client assignment, printable card. No PII.';

CREATE INDEX IF NOT EXISTS ff_golf_output_template_idx
  ON forefront_golf.forefront_golf_session_outputs (template_id);


-- ---------------------------------------------------------------------
-- 6. updated_at trigger
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION forefront_golf.ff_golf_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ff_golf_drill_touch ON forefront_golf.forefront_golf_drill_cards;
CREATE TRIGGER ff_golf_drill_touch
  BEFORE UPDATE ON forefront_golf.forefront_golf_drill_cards
  FOR EACH ROW EXECUTE FUNCTION forefront_golf.ff_golf_touch_updated_at();

DROP TRIGGER IF EXISTS ff_golf_template_touch ON forefront_golf.forefront_golf_session_templates;
CREATE TRIGGER ff_golf_template_touch
  BEFORE UPDATE ON forefront_golf.forefront_golf_session_templates
  FOR EACH ROW EXECUTE FUNCTION forefront_golf.ff_golf_touch_updated_at();


-- ---------------------------------------------------------------------
-- 7. Row-Level Security — STUBS ONLY
-- ---------------------------------------------------------------------
-- These policies are deliberately permissive READ-ONLY for anon.
-- Tighten before any production rollout. No writes from anon, ever.
-- ---------------------------------------------------------------------
ALTER TABLE forefront_golf.forefront_golf_drill_cards        ENABLE ROW LEVEL SECURITY;
ALTER TABLE forefront_golf.forefront_golf_session_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE forefront_golf.forefront_golf_session_outputs    ENABLE ROW LEVEL SECURITY;

-- Drill cards: public read (drill library is non-sensitive reference material).
DROP POLICY IF EXISTS ff_golf_drill_read ON forefront_golf.forefront_golf_drill_cards;
CREATE POLICY ff_golf_drill_read
  ON forefront_golf.forefront_golf_drill_cards
  FOR SELECT TO anon, authenticated
  USING (true);

-- Templates & outputs: authenticated read only. Adjust to per-coach scoping
-- (e.g. USING (coach_id = auth.uid())) before connecting any real client data.
DROP POLICY IF EXISTS ff_golf_template_read ON forefront_golf.forefront_golf_session_templates;
CREATE POLICY ff_golf_template_read
  ON forefront_golf.forefront_golf_session_templates
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS ff_golf_output_read ON forefront_golf.forefront_golf_session_outputs;
CREATE POLICY ff_golf_output_read
  ON forefront_golf.forefront_golf_session_outputs
  FOR SELECT TO authenticated
  USING (true);

-- NOTE: No INSERT/UPDATE/DELETE policies are defined. All writes must go
-- through a privileged server-side connection only, never a public client key.


-- ---------------------------------------------------------------------
-- 8. Seed pattern (DO NOT execute as-is — illustrative only)
-- ---------------------------------------------------------------------
-- The canonical drill list lives in /data/drills.js as FF_DRILLS. To seed
-- this table, generate INSERTs from that array. Example template:
--
-- INSERT INTO forefront_golf.forefront_golf_drill_cards (
--   drill_id, name, category, solves, cause_lane, gpl_fit,
--   description, when_why, active_cue, description_note,
--   cue_proximity, constraint_alternative, representativeness,
--   feedback_schedule, conflict, progression, regression,
--   proof_metric, source_tags
-- ) VALUES (
--   'speed_overspeed_protocol',
--   'SuperSpeed Overspeed Protocol',
--   'speed',
--   ARRAY['low_chs','speed_ceiling'],
--   'physical',
--   ARRAY['L2','L3']::forefront_golf.ff_golf_gpl[],
--   '...description...',
--   '...when/why...',
--   'Whip the tip past your hands',
--   'Fade cue by week 3',
--   'distal',
--   'Substitute lighter club if green stick unavailable',
--   'Medium'::forefront_golf.ff_golf_representativeness,
--   'faded'::forefront_golf.ff_golf_feedback_schedule,
--   'Avoid in-season for handicap >15',
--   'Add range-ball gates after week 4',
--   'Reduce reps to 2x6',
--   'CHS ± 1 mph (TrackMan)',
--   ARRAY['SuperSpeed','OPTIMAL','Wulf']
-- )
-- ON CONFLICT (drill_id) DO UPDATE SET
--   name = EXCLUDED.name,
--   updated_at = now();
--
-- A small Node script can iterate FF_DRILLS and emit one INSERT per drill;
-- run it locally and paste the output into the Supabase SQL editor.


-- ---------------------------------------------------------------------
-- 9. Rollback (if you need to undo this migration)
-- ---------------------------------------------------------------------
-- DROP TABLE  IF EXISTS forefront_golf.forefront_golf_session_outputs    CASCADE;
-- DROP TABLE  IF EXISTS forefront_golf.forefront_golf_session_templates  CASCADE;
-- DROP TABLE  IF EXISTS forefront_golf.forefront_golf_drill_cards        CASCADE;
-- DROP FUNCTION IF EXISTS forefront_golf.ff_golf_touch_updated_at();
-- DROP TYPE   IF EXISTS forefront_golf.ff_golf_feedback_schedule;
-- DROP TYPE   IF EXISTS forefront_golf.ff_golf_representativeness;
-- DROP TYPE   IF EXISTS forefront_golf.ff_golf_gpl;
-- DROP SCHEMA IF EXISTS forefront_golf CASCADE;
-- =====================================================================
-- END
-- =====================================================================
