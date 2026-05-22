# Forefront Golf Coach Builder — Branch Authoring Pass

**Date:** 2026-05-22  
**Scope:** Branch-level override layer for the diagnostic enrichment pipeline. Sub-branches whose diagnostic intent differs from the parent visible fault can now select a more precise lane / tool / proof / gate / session implication than the parent fault id alone would route to.  
**Deploy status:** NOT deployed. Parent agent deploys after review.

---

## 1. Files changed

| File | Change |
|---|---|
| `data/diagnostic-layer.js` | Added `BRANCH_INTENTS`, `BRANCH_LANE_OVERRIDES`, `branchIntentFromSignals()`, `branchLaneFromBranch()`. Rewrote `sessionImplKeyFor()` to delegate to the new resolver. Extended `inferTechSigns()` and `inferProofTestIds()` to honor override-supplied lists verbatim. Enrichment loop now sets `branch_intent`, `why_this_branch`, `do_not_assume`, optional `session_implication_patch`, and override-supplied `false_positives` / `gates_red` / `gates_yellow`. Meta block now exposes `FF_BRANCH_INTENTS`, `FF_BRANCH_LANE_OVERRIDES`, and bumped to `version: "2026-05-22"`. All enrichment guards (`if (!br.X)`) preserved — overrides set values before the guard or replace explicitly. |
| `assets/app.js` | `renderDiagBranchDeepening()` now renders a top "intent block" with three reviewer-facing rows: **Branch intent**, **Why this branch**, **Do not assume**. Branch card meta line shows the intent label and whether it came from an authored override or category-signal inference. Empty-state check updated so the deepening panel still renders when only intent text is available. |
| `assets/style.css` | Added `.diag-intent-block`, `.diag-intent-row`, `.diag-intent-row.warn` styles for the reviewer labels. |
| `_validate_branch_layer.js` | New headless Node validation script that loads the three data files in a `vm` context and asserts the override map produces the expected lanes. Kept in repo for regression checks. |

No changes to `data/deepening.js`, `data/drills.js`, `index.html`, or `supabase/migration.sql`. The session duplicate-prevention / carryover rules in `FF_SESSION_LINK_RULES` are untouched.

---

## 2. Override structures

### `BRANCH_INTENTS` (20 ids)

Each intent maps to one canonical session lane:

| Intent id | Label | Lane |
|---|---|---|
| `aim_setup` | Aim / setup | `club_face_path` |
| `equipment_fit` | Equipment fit | `equipment` |
| `face_control` | Face control | `club_face_path` |
| `path_delivery` | Path delivery | `club_face_path` |
| `strike_lowpoint` | Strike / low point | `contact_lowpoint` |
| `dynamic_loft_spinloft` | Dynamic loft / spin loft | `contact_lowpoint` |
| `ground_force_pressure` | Ground force / pressure | `ground_force` |
| `sequencing_kinematics` | Sequencing / kinematics | `ground_force` |
| `wrist_release_hackmotion` | Wrist / release | `club_face_path` |
| `speed_readiness` | Speed readiness | `warmup_prep` |
| `speed_transfer` | Speed transfer | `speed` |
| `putting_start_line` | Putting — start line | `putting` |
| `putting_speed_control` | Putting — speed control | `putting` |
| `putting_read_aim` | Putting — read / aim | `putting` |
| `short_game_entry` | Short game — entry | `short_game` |
| `short_game_landing_window` | Short game — landing window | `short_game` |
| `bunker_entry` | Bunker — entry | `short_game` |
| `pressure_attention` | Pressure / attention | `psychology` |
| `course_decision` | Course decision | `course_transfer` |
| `mobility_pain_readiness` | Mobility / pain / readiness | `warmup_prep` |

### `BRANCH_LANE_OVERRIDES` (40 entries)

Keyed by stable `"FAULT-ID:branch-id"`. Each value can carry:

```js
{
  intent: "<id from BRANCH_INTENTS>",           // required
  technology_signs_keys: ["tool_key", ...],     // optional — replaces inferred tools
  proof_test_ids: ["PC-XX", ...],               // optional — replaces inferred PCs
  session_implication_patch: { ... },           // optional — shallow patch over lane impl
  gates_red: ["..."],                           // optional — replaces inferred red gates
  gates_yellow: ["..."],                        // optional — replaces inferred yellow gates
  false_positives: [{ masquerades_as, rule_out_first }],  // optional
  why: "Reviewer-facing 'why this branch' sentence",
  do_not_assume: "Reviewer-facing 'do not assume' caution"
}
```

**Authored fault families (40 entries):** SLICE (5), CHUNK (6), TOP (2), SHANK (3), SLIDE (3), PUTT-STARTLINE (4), PUTT-SPEED (3), WEDGE-CONTACT (4), BUNKER-ENTRY (3), SPEED-CEILING (4), READINESS-RED (3).

### `branchLaneFromBranch(branch, fault)` — resolver order

```
1. BRANCH_LANE_OVERRIDES[`${faultId}:${branchId}`]  →  use intent.lane + carry override
2. branchIntentFromSignals(branch)                   →  category/lane string match → intent
3. faultLaneFromId(fault.id)                          →  parent-fault fallback
4. "club_face_path"                                  →  hard default
```

Free-text matching is *not* used. The fallback at step 2 only consumes the structured `branch.categories[]` and `branch.lanes[]` arrays.

---

## 3. Before / after — examples of parent-fault leak fixed

| Branch | Before (parent-fault routing) | After (branch override) |
|---|---|---|
| `FAULT-SLICE:heel-gear` | lane `club_face_path` → TrackMan corridors, PC-03/05/01 | lane **equipment**, intent `equipment_fit` → equipment_ab + optimizer, PC-08/02/04 |
| `FAULT-CHUNK:trail-hang` | lane `contact_lowpoint` → TM shot analysis, PC-04/05/01 | lane **ground_force**, intent `ground_force_pressure` → force_plate + 3D, PC-01/06/04 |
| `FAULT-CHUNK:cast-dump` | lane `contact_lowpoint` | lane `club_face_path`, intent `wrist_release_hackmotion` → HackMotion seeded |
| `FAULT-SLIDE:mobility-avoidance` | lane `ground_force` → mobility-blind | lane **warmup_prep**, intent `mobility_pain_readiness` → readiness gate triggered |
| `FAULT-PUTT-SPEED:tempo-variance` | lane `putting` | lane **psychology**, intent `pressure_attention` → PC-07 / PC-14, on-course tool |
| `FAULT-PUTT-SPEED:visual-mapping` | lane `putting` (speed) | lane `putting`, intent `putting_read_aim` (different read vs. stroke) |
| `FAULT-SHANK:threat-response` | lane `contact_lowpoint` (drill-first) | lane **psychology**, intent `pressure_attention` — gates threat before mechanics |
| `FAULT-SHANK:setup-distance` | lane `contact_lowpoint` | lane **equipment**, intent `equipment_fit` |
| `FAULT-WEDGE-CONTACT:bounce-misuse` | lane `short_game` | lane **equipment**, intent `equipment_fit` (wedge A/B first) |
| `FAULT-SPEED-CEILING:intent-or-threat` | lane `speed` → unsafe Mach 3 | lane **psychology**, intent `pressure_attention` |
| `FAULT-SPEED-CEILING:readiness-fatigue` | lane `speed` | lane **warmup_prep**, intent `speed_readiness` — readiness gate triggered |
| `FAULT-READINESS-RED:pain-gate` | lane `warmup_prep` (no pain check) | lane `warmup_prep`, intent `mobility_pain_readiness`, `red_gate_checks: ["no_baseline","pain"]` |

The "session implication" rendered for each branch now reflects the branch lane, not the parent fault lane. Equipment branches no longer suggest acquisition sleep windows; pressure branches no longer require force-plate tooling.

---

## 4. Scenarios validated

All screenshots in `forefront-golf-coach-builder/docs/`:

| # | Scenario | Branch override hit | Lane after | Screenshot |
|---|---|---|---|---|
| 1 | Slice — heel-strike gears right | `FAULT-SLICE:heel-gear` → `equipment_fit` | equipment | `qa_branch_authoring_01_slice_heel_gear_equipment.png` |
| 2 | Chunk — trail side hang | `FAULT-CHUNK:trail-hang` → `ground_force_pressure` | ground_force | `qa_branch_authoring_02_chunk_trail_hang_groundforce.png` |
| 3 | Slide — hip mobility avoidance | `FAULT-SLIDE:mobility-avoidance` → `mobility_pain_readiness` | warmup_prep | `qa_branch_authoring_03_slide_mobility_avoidance_warmup.png` |
| 4 | Putt start line — face aim | `FAULT-PUTT-STARTLINE:face-aim` → `putting_start_line` | putting | `qa_branch_authoring_04_putt_startline_face_aim.png` |
| 5 | Putt speed — tempo variance under pressure | `FAULT-PUTT-SPEED:tempo-variance` → `pressure_attention` | psychology | `qa_branch_authoring_05_putt_speed_tempo_psychology.png` |
| 6 | Wedge contact — bounce misuse | `FAULT-WEDGE-CONTACT:bounce-misuse` → `equipment_fit` | equipment | `qa_branch_authoring_06_wedge_bounce_equipment.png` |
| 7 | Speed ceiling — force amplitude low | `FAULT-SPEED-CEILING:force-amplitude-low` → `speed_transfer` | speed | `qa_branch_authoring_07_speed_ceiling_force_amplitude.png` |
| 8 | Readiness red — pain gate | `FAULT-READINESS-RED:pain-gate` → `mobility_pain_readiness` | warmup_prep | `qa_branch_authoring_08_readiness_pain_gate.png` |
| 9 | Bunker entry — sand fear | `FAULT-BUNKER-ENTRY:sand-fear` → `pressure_attention` | psychology | `qa_branch_authoring_09_bunker_sand_fear_psychology.png` |
| zoom | Slice — all three branches side by side | shows lane divergence inside one fault | `qa_branch_authoring_zoom_slice_heel_gear.png` |

In the zoom screenshot you can see all three SLICE branches with distinct intent labels: face-start (face_control, club_face_path lane), pull-cut (path_delivery, club_face_path lane), heel-gear (**equipment_fit, equipment lane**). The "Why this branch" and "Do not assume" rows render under each card.

### Headless assertion suite

`node _validate_branch_layer.js` passes the following assertions:

```
OK: SLICE:heel-gear routed to equipment lane
OK: SLICE:heel-gear has equipment_fit intent
OK: SLICE:pull-cut has path_delivery intent
OK: CHUNK:trail-hang routed to ground_force lane
OK: PUTT-SPEED:tempo-variance routed to psychology lane
OK: SLIDE:mobility-avoidance routed to warmup_prep lane
```

Meta: `version: "2026-05-22"`, `branch_authoring_pass: true`, `branch_overrides_count: 40`, `branch_intents: 20`.

---

## 5. Preserved behavior

- **No `localStorage` / `sessionStorage` / IndexedDB / cookies.** Verified.
- **No external API or DB writes.** Verified — pure static edit.
- **Session duplicate-prevention / carryover (`FF_SESSION_LINK_RULES`)** — file not touched.
- **Non-destructive enrichment guards (`if (!br.X)`)** — all preserved. Override-supplied values land before the guard fires so the override wins, but anything an author already set on the branch in `deepening.js` still wins over the override (override only writes if branch field is empty for `why_this_branch`, `do_not_assume`, `session_implication`, `proof_test_ids`, etc.). `branch_intent` is always set — it's pure metadata.
- **Evidence flags and `review_required` defaults** — unchanged. Branches without explicit `source_tags` still flag `review_required`.
- **`sleep_required = false` for non-acquisition lanes** — still enforced at end of loop.

---

## 6. Remaining `review_required` items

| Item | Notes |
|---|---|
| **Branches without an explicit override** (~60 of ~100 in `FF_DIAGNOSTIC_BRANCHES`) | Still fall back to `branchIntentFromSignals()` → category match → parent fault id. Listed in the wizard UI with the badge "(inferred)" so reviewer can see which are authored vs. inferred. |
| `FAULT-CHUNK:mobility-block` and similar "mobility" branches | Override is authored but the branch id was not present in `deepening.js` at the time of this pass — override is dormant until the branch id is added. Same for `FAULT-SHANK:heel-handle-out` if not present; `node _validate_branch_layer.js` reports only the branches actually emitted. |
| Hypertrophy / golf-fitness layer faults | Out of scope — no overrides authored for non-golf-skill faults. |
| `false_positives` per override | Only `false_positives` array is allowed as override; copy still defers to parent fault `FF_FALSE_POSITIVES`. Per-branch FP authoring is a follow-up. |
| Tool-list overrides | `technology_signs_keys` is wired but only used where the inferred set was clearly wrong (zero entries in this pass — relying on lane inference). Adding explicit tool lists per override is a follow-up if reviewer disagrees with inferred tools. |
| `session_implication_patch` | Wired but unused — every override currently inherits the full lane implication. Patches (e.g. shorter contamination window, lower RLU cap for sub-branches) are a follow-up. |

---

## 7. Deployment

**Not deployed.** Per instructions, parent agent runs `deploy_website()` after review.

Quick deploy when ready:

```
deploy_website(project_path="forefront-golf-coach-builder", site_name="Forefront Golf Coach Builder")
```

---

## 8. How to add a new override

```js
// In data/diagnostic-layer.js, inside BRANCH_LANE_OVERRIDES:
"FAULT-XXX:branch-id": {
  intent: "face_control",                       // pick from BRANCH_INTENTS
  why: "One-sentence reviewer rationale.",
  do_not_assume: "One-sentence caution.",
  // Optional advanced fields:
  technology_signs_keys: ["trackman_shot_analysis", "video"],
  proof_test_ids: ["PC-03", "PC-05"],
  gates_red: ["no_baseline", "equipment_mismatch"],
  session_implication_patch: { max_rlu_per_day: 60 }
}
```

The next `node _validate_branch_layer.js` run will report whether the override fires for a branch present in the current `deepening.js`.
