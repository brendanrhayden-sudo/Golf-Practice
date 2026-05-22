# Forefront Golf Coach Builder — Drill / Session Alignment Audit

**Scope:** `forefront-golf-coach-builder` POC (static vanilla HTML/CSS/JS).
**Date:** 2026-05-22
**Constraints honored:** No localStorage / sessionStorage / IndexedDB / cookies. No external APIs. No DB writes. No PII or secrets. No deployment performed in this turn — parent agent deploys.

---

## 1. Problem statement

Before this pass, the wizard's branch layer surfaced a `branch_intent.id` (e.g. `ground_force_pressure`, `equipment_fit`, `mobility_pain_readiness`) but the **Drills** and **Session Builder** steps did not honor that intent. Symptoms observed in the prior QA pass:

1. **Category leakage.** A `face_control` branch could surface ground-force pump drills in primary slots; an `equipment_fit` branch could surface full-swing primaries before an A/B / strike-compare proof had passed.
2. **Pump Drill placement.** `DR-GRF-004` (Step-and-Pump Trail Load) could end up duplicated as primary across multiple blocks instead of being used once primary + carryover variant elsewhere.
3. **Mobility / pain gates not enforced at the session level.** A `pain` gate or a `mobility_pain_readiness` intent did not strip high-intent blocks; the user could still build a normal session.
4. **Speed readiness blocked nothing.** A red `readiness` gate with a `speed_transfer` intent still let speed drills land as primary.
5. **No "why allowed / do not use if" surface.** Drill candidate cards explained the fault reference but not the alignment decision.

These all stemmed from the absence of a single explicit map between **intent** and **drill category / session block kind / gate preconditions**.

---

## 2. Fix architecture

A new alignment layer was added as the single source of truth:

```
data/alignment-layer.js   →  FF_INTENT_ALIGNMENT  (20 intents)
                            FF_ALIGNMENT_BLOCKS  (8 block kinds)
                            FF_ALIGNMENT helpers (evaluateDrillForIntent,
                                                  alignmentGateFlags,
                                                  getAlignment,
                                                  resolveIntentId,
                                                  dominantIntent,
                                                  sessionModeFor,
                                                  blocksForKind)
```

Each intent record carries, at minimum:

| Field | Purpose |
|---|---|
| `allowed_categories` | Drill categories permitted as **primary** |
| `carryover_categories` | Categories permitted only in **carryover / variability / scoring / retest / reflection** blocks |
| `blocked_categories` | Hard-block from this intent's session at any block |
| `preferred_primary_block` | The block kind the intent prefers for primary slot |
| `allowed_carryover_blocks` | Block kinds where carryover-only drills may land |
| `do_not_use_if` | Plain-language conditions surfaced on drill cards |
| `primary_once_drills` | Drill IDs that may only appear primary once per session (carryover variant allowed) |
| `session_mode` | `full`, `modified_only`, `stop_refer` |
| `notes` | Coaching rationale (Helms / Wulf / Winkelman / GBC etc.) |

Selected intents also carry:

- `must_pass_first: "eq_ab"` (equipment_fit) — A/B + strike compare gate
- `requires_green_gates: ["readiness", ...]` (speed_transfer) — refuses high-intent primary unless green
- `stop_refer_language` (mobility_pain_readiness) — fixed copy used in red-gate stop/refer notice

This is the **explicit map** the task brief required, replacing keyword heuristics that previously lived in `stepDrills` and `allocateSessionDrills`.

---

## 3. The 20 intents and where they came from

All 20 keys mirror the canonical `branch_intent.id` values produced in `data/diagnostic-layer.js`:

```
aim_setup                 face_control               path_delivery
wrist_release_hackmotion  strike_lowpoint            dynamic_loft_spinloft
ground_force_pressure     sequencing_kinematics      speed_readiness
speed_transfer            equipment_fit              putting_start_line
putting_speed_control     putting_read_aim           short_game_entry
short_game_landing_window bunker_entry               pressure_attention
course_decision           mobility_pain_readiness
```

The per-intent rules encoded in `FF_INTENT_ALIGNMENT` follow the task brief:

| Intent | Primary categories | Blocked from primary | Notes |
|---|---|---|---|
| `equipment_fit` | warmup_prep, course_transfer (A/B compare) | full_swing, speed | Requires `must_pass_first: eq_ab` before swing drills |
| `mobility_pain_readiness` | warmup_prep only | full_swing, speed, ground_force, club_face_path, contact_lowpoint | Forces `session_mode = modified_only` or `stop_refer` |
| `pressure_attention` | psychology, course_transfer | speed (no high-intent primary) | Routine/regulation primary; mechanical secondary |
| `ground_force_pressure` | ground_force, warmup_prep | club_face_path (face-only), short_game (wrist-only) | DR-GRF-004 in `primary_once_drills` |
| `face_control` / `path_delivery` | club_face_path (corridor/face-to-path), warmup_prep | ground_force (unless sequencing intent overrides) | Corridor + face-to-path emphasis |
| `strike_lowpoint` / `dynamic_loft_spinloft` | contact_lowpoint, warmup_prep | speed, course_transfer (pressure) | Strike map + brush primary; speed/pressure blocked |
| `putting_*` | putting only | every other category | Own category only |
| `short_game_entry` / `short_game_landing_window` | short_game | full_swing, speed | Own category only |
| `bunker_entry` | short_game (bunker variants) | full_swing, speed | Own category only |
| `speed_transfer` | speed, warmup_prep | (none categorically) | `requires_green_gates: [readiness, mobility]` |
| `speed_readiness` | warmup_prep | speed, ground_force | Blocks high-intent until readiness clears |

The full record set lives in `data/alignment-layer.js` lines 67–325.

---

## 4. Wiring changes

### 4.1 `index.html`
Added `<script src="data/alignment-layer.js"></script>` before `assets/app.js` so `window.FF_INTENT_ALIGNMENT`, `window.FF_ALIGNMENT_BLOCKS`, and `window.FF_ALIGNMENT` are available when the app boots.

### 4.2 `assets/app.js`

| Location | Change |
|---|---|
| ~L1823 — helpers | Added `currentBranchIntents()`, `currentDominantIntent()`, `evaluateDrillAlignment()`; exposed via `window.FF_currentBranchIntents`, `window.FF_evaluateDrillAlignment`, `window.FF_currentDominantIntent` for QA driving. |
| `stepDrills()` ~L434 | Hard-filters category-blocked drills out of the candidate pool. Sort booster: `+25` for primary-allowed match, `+10` for carryover match, `-50` if `do_not_use_if` gate flag fires. |
| `drillCard()` ~L649 | Renders a per-card alignment badge (`✓ Primary OK` / `→ Carryover only` / `⚠ Conditional` / `✕ Blocked`) and a red-bordered **Do not use if** box listing the active conditions. |
| `allocateSessionDrills()` ~L818 | Honors `primary_once_drills` (DR-GRF-004 pump drill): keeps it primary once, pushes a carryover variant into `block2`/`retest`/`reflection` with `__carryover_variant: true`. Returns `_alignment` metadata on the placed plan. |
| `buildSessionPlan()` ~L995 | Sets `plan.session_mode`, `plan.session_mode_reason`, `plan.alignment`. When mode is `modified_only` or `stop_refer`, strips drills from non-warmup blocks and writes `modified_notice` for the renderer. |
| `renderBlock()` ~L2163 | Displays red `modified_notice` banner and a green **carryover variant** pill on drills flagged with `__carryover_variant`. |

### 4.3 New validator
`_validate_drill_session_alignment.js` — 17 numbered checks across schema, helper return shapes, intent-by-intent invariants, gate flag resolution, primary-once placement of DR-GRF-004, and session-mode resolution for pain-red / mobility branches. **All 17 pass.**

---

## 5. Audit issues found and fixed

| # | Issue | Root cause | Fix |
|---|---|---|---|
| A1 | Ground-force pump drills could appear on a `face_control` branch | `stepDrills()` matched on fault tags, not intent categories | Hard-filter via `blocked_categories` in `evaluateDrillForIntent`; UI shows blocked drills hidden from the pool |
| A2 | `equipment_fit` branch surfaced swing primaries before A/B passed | No precondition gate at the alignment layer | Added `must_pass_first: "eq_ab"` — until `gates.eq_ab !== "green"`, swing categories are downgraded to carryover-only and primary slot defaults to warmup_prep + course_transfer (A/B compare drill) |
| A3 | DR-GRF-004 placed primary twice | Allocator picked top-ranked drill per block without dedupe | `allocateSessionDrills` consults `primary_once_drills`; second placement clones drill, sets `__carryover_variant: true`, routes to `block2`/`retest`/`reflection` |
| A4 | Pain-red gate did not block high-intent blocks | Gate state existed but session builder ignored it | `sessionModeFor()` returns `stop_refer` when `pain` is red; `buildSessionPlan` strips primary/carryover/scoring/retest blocks and writes `modified_notice` |
| A5 | `mobility_pain_readiness` intent allowed normal sessions | Same as A4 plus intent rule missing | Intent record forces `session_mode: "modified_only"`; warmup_prep is the only block allowed to carry drills |
| A6 | Speed primaries placed with red readiness | `speed_transfer` rule was implicit | `requires_green_gates: ["readiness","mobility"]` enforces; if any required gate is non-green, alignment evaluates to **Blocked** with a `do_not_use_if` reason ("speed primary requires green gates — not green: readiness") |
| A7 | `pressure_attention` (e.g. bunker sand-fear branch) ranked mechanical drills above routine/regulation | Drill ranking ignored psychology/course_transfer preference | Sort booster `+25` for `allowed_categories` matches surfaces routine/regulation primary; mechanical drills stay available as carryover |
| A8 | Putting + short-game intents leaked into full-swing block | Categories were not mutually exclusive in the allocator | Putting / short-game / bunker intents declare their own category as the only `allowed_categories`; every other category is `blocked_categories` |
| A9 | No transparency on why a drill was allowed or which condition blocked it | UI never showed alignment decision | `drillCard()` renders badge + "Do not use if" box; QA screenshot 09 shows the red-bordered conditions for `speed_transfer` with red readiness |
| A10 | Allocator could not distinguish a primary-once carryover instance from a duplicate | Plan blocks were plain drill references | `__carryover_variant: true` flag survives clone; renderer paints a green carryover pill (QA screenshot 12) |

---

## 6. Per-intent rules verified by scenario screenshots

All screenshots live in `forefront-golf-coach-builder/docs/` with the prefix `qa_drill_session_alignment_*`.

| File | Scenario | Verifies |
|---|---|---|
| `00_landing.png` | Wizard landing | Build runs without alignment regressions |
| `01_pressure_trail.png` | `ground_force_pressure` branch | GRF + pump drills primary-allowed; face-only/wrist-only blocked |
| `02_slice_face_start.png` | `face_control` branch | Corridor + face-to-path primary; ground-force shown carryover-only |
| `03_slice_heel_gear_equipment.png` | `equipment_fit` branch | Swing primaries downgraded; A/B compare + strike-compare carry primary slot |
| `04_chunk_lowpoint_back.png` | `strike_lowpoint` branch | Strike map + brush primary; speed and pressure blocked |
| `05_putt_startline.png` | `putting_start_line` branch | Only putting category surfaces |
| `06_putt_speed.png` | `putting_speed_control` branch | Only putting category surfaces |
| `07_wedge_entry.png` | `short_game_entry` branch | Only short-game category surfaces |
| `08_bunker_sand_fear.png` | `pressure_attention` branch (bunker sand-fear) | Routine/regulation primary; mechanical drills carryover |
| `09_speed_readiness_red.png` | `speed_transfer` intent + `readiness=red` gate | "Do not use if" red box: *speed primary requires green gates — not green: readiness* |
| `10_pain_gate_modified.png` | `mobility_pain_readiness` drill panel | Warmup-only drills allowed; all swing/speed categories filtered out |
| `11_session_modified_mobility.png` | Same as 10, session view | Red **Modified only — skip high-intent work** notice on block1 / block2 / retest |
| `11_session_pain_red.png` | Pain-red gate + any swing branch | Stop/refer mode kicks in regardless of intent |
| `12_session_pump_carryover.png` | `ground_force_pressure` full session w/ DR-GRF-004 selected | DR-GRF-004 primary in block1, **carryover variant** pill on the block2 copy |

---

## 7. Validation summary

```
$ node _validate_proof_cards.js          → PASS (existing checks unchanged)
$ node _validate_branch_layer.js         → PASS (existing checks unchanged)
$ node _validate_drill_session_alignment.js
  17 sections, ALL CHECKS PASS — drill/session alignment layer is consistent.
```

The new validator covers:

1. `FF_INTENT_ALIGNMENT` shape (20 intents present, every record has required fields)
2. `FF_ALIGNMENT_BLOCKS` shape (8 block kinds present, all reference legal categories)
3. `evaluateDrillForIntent` returns `{verdict, reason, do_not_use_if[]}` for every intent
4. `alignmentGateFlags` resolves `pain/readiness/mobility/contact/stage` correctly
5. `getAlignment` returns null for unknown intent (no throw)
6. `resolveIntentId` accepts both raw id and `branch_intent` object
7. `dominantIntent` ranks by gate severity then frequency
8. `sessionModeFor` priority: pain-red → stop_refer ⟶ readiness-red → modified_only ⟶ intent.session_mode ⟶ full
9. `blocksForKind` returns an array (no string leakage)
10–16. Per-intent invariants (one section per category family)
17. Pump Drill DR-GRF-004 is reachable as first `primary_once` entry for `ground_force_pressure`

---

## 8. Remaining risks / known gaps

| Risk | Severity | Notes |
|---|---|---|
| Branch lane override `FAULT-SPEED-CEILING:readiness-fatigue` referenced in `BRANCH_LANE_OVERRIDES` but not synthesized in `FF_DIAGNOSTIC_BRANCHES` | Low | Scenario 9 worked around by using `force-amplitude-low` branch with `readiness=red`; same alignment outcome. Should be authored next pass. |
| Carryover slot selection is deterministic (first allowed block) rather than load-balanced | Low | Acceptable for POC; could distribute across `serial_variability` and `random_variability` in a future pass. |
| `must_pass_first: eq_ab` precondition assumes a `gates.eq_ab` value exists | Medium | Today the gate cells render `pain/readiness/mobility/contact/stage`; `eq_ab` is only set programmatically by alignment code. Need a UI surface (chip on the Drills step) for `eq_ab` proof state once equipment cards exist in the live build. |
| Pump drill primary-once logic targets a single drill ID | Medium | If more drills join the primary-once list, the allocator handles arrays but UX should label "rotation drill" rather than "carryover variant". |
| Alignment layer is read-only at runtime | None | By design — no DB writes, all rules in JS module. |

---

## 9. Files touched

```
NEW    data/alignment-layer.js                     480 lines
NEW    _validate_drill_session_alignment.js        239 lines
MOD    index.html                                  +1 script tag
MOD    assets/app.js                               5 regions (helpers, stepDrills, drillCard, allocateSessionDrills, buildSessionPlan, renderBlock)
NEW    docs/qa_drill_session_alignment_00…12.png  14 screenshots
```

Deployment was intentionally skipped — parent agent owns the deploy step.
