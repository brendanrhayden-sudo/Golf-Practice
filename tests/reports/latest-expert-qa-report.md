# Forefront Coach Builder — Expert QA Report

- Generated: 2026-05-22T16:36:24.267Z
- Scenarios: 12 (pass: 12, fail: 0)
- Rubric: `tests/rubrics/expert-rubric.md`

## 1. Existing validators

- **_validate_proof_cards.js** — PASS (exit=0)
- **_validate_branch_layer.js** — PASS (exit=0)
- **_validate_drill_session_alignment.js** — PASS (exit=0)

## 2. Scenario-by-scenario findings

### SC-01-pressure-stays-trail — Pressure stays trail / ground-force first, not psychology

- Deterministic: **PASS** (8/8 checks)
- Dominant intent: `ground_force_pressure`
- Session mode: `normal`
- T1 proof: `gf_recenter_station`
- Primary categories: `["ground_force","contact_lowpoint","warmup_prep"]`
- Filtered-out drills: 0

    Checks:
    - PASS  expected_branch_intents_present
    - PASS  t1_profile_prefix_match
    - PASS  expected_primary_categories_present
    - PASS  forbidden_categories_absent_primary
    - PASS  expected_session_mode
    - PASS  expected_session_blocks_present
    - PASS  no_duplicate_primary_drills
    - PASS  pump_drill_primary_once

- Judge packet: `tests/reports/judge-packets/SC-01-pressure-stays-trail.json`

### SC-02-no-lead-brake-slide — Slide / no-lead-brake — lead-side post + recenter, not face mechanics

- Deterministic: **PASS** (8/8 checks)
- Dominant intent: `ground_force_pressure`
- Session mode: `normal`
- T1 proof: `gf_recenter_station`
- Primary categories: `["ground_force","contact_lowpoint","warmup_prep"]`
- Filtered-out drills: 0

    Checks:
    - PASS  expected_branch_intents_present
    - PASS  t1_profile_prefix_match
    - PASS  expected_primary_categories_present
    - PASS  forbidden_categories_absent_primary
    - PASS  expected_session_mode
    - PASS  expected_session_blocks_present
    - PASS  no_duplicate_primary_drills
    - PASS  pump_drill_primary_once

- Judge packet: `tests/reports/judge-packets/SC-02-no-lead-brake-slide.json`

### SC-03-slice-face-start — Slice face-start — face/path corridor primary, GRF carryover

- Deterministic: **PASS** (8/8 checks)
- Dominant intent: `face_control`
- Session mode: `normal`
- T1 proof: `fp_corridor`
- Primary categories: `["club_face_path","contact_lowpoint","warmup_prep"]`
- Filtered-out drills: 0

    Checks:
    - PASS  expected_branch_intents_present
    - PASS  t1_profile_prefix_match
    - PASS  expected_primary_categories_present
    - PASS  forbidden_categories_absent_primary
    - PASS  expected_session_mode
    - PASS  expected_session_blocks_present
    - PASS  no_duplicate_primary_drills
    - PASS  pump_drill_primary_once

- Judge packet: `tests/reports/judge-packets/SC-03-slice-face-start.json`

### SC-04-slice-heel-gear-equipment — Slice heel-gear — equipment_fit A/B, no swing rebuild until eq_ab passes

- Deterministic: **PASS** (9/9 checks)
- Dominant intent: `equipment_fit`
- Session mode: `normal`
- T1 proof: `eq_ab`
- Primary categories: `["contact_lowpoint","club_face_path","warmup_prep"]`
- Filtered-out drills: 0

    Checks:
    - PASS  expected_branch_intents_present
    - PASS  t1_profile_prefix_match
    - PASS  expected_primary_categories_present
    - PASS  forbidden_categories_absent_primary
    - PASS  expected_session_mode
    - PASS  expected_session_blocks_present
    - PASS  no_duplicate_primary_drills
    - PASS  pump_drill_primary_once
    - PASS  equipment_must_pass_first_present

- Judge packet: `tests/reports/judge-packets/SC-04-slice-heel-gear-equipment.json`

### SC-05-chunk-lowpoint-back — Chunk / low-point back — strike map first, no speed or pressure primary

- Deterministic: **PASS** (8/8 checks)
- Dominant intent: `ground_force_pressure`
- Session mode: `normal`
- T1 proof: `gf_recenter_station`
- Primary categories: `["ground_force","contact_lowpoint","warmup_prep"]`
- Filtered-out drills: 0

    Checks:
    - PASS  expected_branch_intents_present
    - PASS  t1_profile_prefix_match
    - PASS  expected_primary_categories_present
    - PASS  forbidden_categories_absent_primary
    - PASS  expected_session_mode
    - PASS  expected_session_blocks_present
    - PASS  no_duplicate_primary_drills
    - PASS  pump_drill_primary_once

- Judge packet: `tests/reports/judge-packets/SC-05-chunk-lowpoint-back.json`

### SC-06-putting-startline — Putting start-line — putting-only, no full-swing tools

- Deterministic: **PASS** (8/8 checks)
- Dominant intent: `putting_start_line`
- Session mode: `normal`
- T1 proof: `pt_gate`
- Primary categories: `["putting","warmup_prep"]`
- Filtered-out drills: 0

    Checks:
    - PASS  expected_branch_intents_present
    - PASS  t1_profile_prefix_match
    - PASS  expected_primary_categories_present
    - PASS  forbidden_categories_absent_primary
    - PASS  expected_session_mode
    - PASS  expected_session_blocks_present
    - PASS  no_duplicate_primary_drills
    - PASS  pump_drill_primary_once

- Judge packet: `tests/reports/judge-packets/SC-06-putting-startline.json`

### SC-07-putting-speed — Putting speed — distance ladder / tempo, no full-swing tools

- Deterministic: **PASS** (8/8 checks)
- Dominant intent: `putting_speed_control`
- Session mode: `normal`
- T1 proof: `pt_distance_ladder`
- Primary categories: `["putting","warmup_prep"]`
- Filtered-out drills: 0

    Checks:
    - PASS  expected_branch_intents_present
    - PASS  t1_profile_prefix_match
    - PASS  expected_primary_categories_present
    - PASS  forbidden_categories_absent_primary
    - PASS  expected_session_mode
    - PASS  expected_session_blocks_present
    - PASS  no_duplicate_primary_drills
    - PASS  pump_drill_primary_once

- Judge packet: `tests/reports/judge-packets/SC-07-putting-speed.json`

### SC-08-wedge-entry — Wedge entry-point — short_game only, no full-swing primary

- Deterministic: **PASS** (8/8 checks)
- Dominant intent: `short_game_entry`
- Session mode: `normal`
- T1 proof: `sg_entry_line`
- Primary categories: `["short_game","warmup_prep"]`
- Filtered-out drills: 0

    Checks:
    - PASS  expected_branch_intents_present
    - PASS  t1_profile_prefix_match
    - PASS  expected_primary_categories_present
    - PASS  forbidden_categories_absent_primary
    - PASS  expected_session_mode
    - PASS  expected_session_blocks_present
    - PASS  no_duplicate_primary_drills
    - PASS  pump_drill_primary_once

- Judge packet: `tests/reports/judge-packets/SC-08-wedge-entry.json`

### SC-09-bunker-sand-fear — Bunker sand-fear — pressure_attention primary, mechanics carryover

- Deterministic: **PASS** (8/8 checks)
- Dominant intent: `pressure_attention`
- Session mode: `normal`
- T1 proof: `ps_threat_screen`
- Primary categories: `["psychology","warmup_prep"]`
- Filtered-out drills: 0

    Checks:
    - PASS  expected_branch_intents_present
    - PASS  t1_profile_prefix_match
    - PASS  expected_primary_categories_present
    - PASS  forbidden_categories_absent_primary
    - PASS  expected_session_mode
    - PASS  expected_session_blocks_present
    - PASS  no_duplicate_primary_drills
    - PASS  pump_drill_primary_once

- Judge packet: `tests/reports/judge-packets/SC-09-bunker-sand-fear.json`

### SC-10-speed-ceiling-readiness-red — Speed ceiling under readiness-red — speed primary BLOCKED, modified only

- Deterministic: **PASS** (9/9 checks)
- Dominant intent: `mobility_pain_readiness`
- Session mode: `modified_only`
- T1 proof: `sp_readiness_baseline, rd_pain_gate`
- Primary categories: `["warmup_prep"]`
- Filtered-out drills: 1

    Checks:
    - PASS  expected_branch_intents_present
    - PASS  t1_profile_prefix_any_match
    - PASS  expected_primary_categories_present
    - PASS  forbidden_categories_absent_primary
    - PASS  expected_session_mode
    - PASS  expected_session_blocks_present
    - PASS  no_duplicate_primary_drills
    - PASS  pump_drill_primary_once
    - PASS  readiness_red_blocks_speed_primary

- Judge packet: `tests/reports/judge-packets/SC-10-speed-ceiling-readiness-red.json`

### SC-11-pain-readiness-red — Pain RED — STOP / refer, no normal practice

- Deterministic: **PASS** (9/9 checks)
- Dominant intent: `mobility_pain_readiness`
- Session mode: `stop_refer`
- T1 proof: `rd_pain_gate`
- Primary categories: `["warmup_prep"]`
- Filtered-out drills: 0

    Checks:
    - PASS  expected_branch_intents_present
    - PASS  t1_profile_prefix_match
    - PASS  expected_primary_categories_present
    - PASS  forbidden_categories_absent_primary
    - PASS  expected_session_mode
    - PASS  expected_session_blocks_present
    - PASS  no_duplicate_primary_drills
    - PASS  pump_drill_primary_once
    - PASS  pain_red_forces_stop_refer

- Judge packet: `tests/reports/judge-packets/SC-11-pain-readiness-red.json`

### SC-12-course-decision-club-selection — Course-transfer decision / club-selection mismatch — strategy primary, mechanics carryover

- Deterministic: **PASS** (8/8 checks)
- Dominant intent: `course_decision`
- Session mode: `normal`
- T1 proof: `cd_decision_audit`
- Primary categories: `["course_transfer","psychology","warmup_prep"]`
- Filtered-out drills: 0

    Checks:
    - PASS  expected_branch_intents_present
    - PASS  t1_profile_prefix_match
    - PASS  expected_primary_categories_present
    - PASS  forbidden_categories_absent_primary
    - PASS  expected_session_mode
    - PASS  expected_session_blocks_present
    - PASS  no_duplicate_primary_drills
    - PASS  pump_drill_primary_once

- Judge packet: `tests/reports/judge-packets/SC-12-course-decision-club-selection.json`

## 3. Recurring issue patterns

- None — all deterministic checks green.

## 4. LLM judge packet status

- One JSON packet per scenario was written to `tests/reports/judge-packets/`.
- Run `node tests/judge-with-llm.js --dry-run` to produce Claude-ready markdown bundles without needing credentials.
- Set `ANTHROPIC_API_KEY` and run `node tests/judge-with-llm.js` to grade live (optional; not required).

## 5. Recommended next config edits (deterministic)

- None — deterministic layer clean.

> LLM-judge layer may add qualitative recommendations (cueing language, expert-pattern coverage). See judge-packets.
