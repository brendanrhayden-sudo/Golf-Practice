# Forefront Golf — Full Branch Authoring Handoff

**Date:** 2026-05-22
**Author:** Subagent (Computer)
**Working tree:** `/home/user/workspace/forefront-golf-coach-builder`
**Deploy status:** NOT deployed (main agent will deploy after review)

---

## TL;DR

Authored explicit `BRANCH_LANE_OVERRIDES` entries for every remaining
diagnostic branch in `FF_DIAGNOSTIC_BRANCHES` that previously relied on
inferred / category-fallback routing. Diagnostic-layer authored coverage
rose **from 31 / 210 (14.8%) → 210 / 210 (100%)**. No new branch intents
were introduced (existing 20-intent taxonomy reused). Validator extended
with seven lane-safety assertions; all pass.

No localStorage / sessionStorage / IndexedDB / cookies / external APIs /
DB writes / PII were added — the project stays in vanilla static
HTML/CSS/JS as required.

---

## Files Changed

| File | Before | After | Change |
|---|---|---|---|
| `data/diagnostic-layer.js` | 1,295 lines | 1,477 lines | +182 lines: appended 179 new override entries inside `BRANCH_LANE_OVERRIDES` |
| `_validate_branch_layer.js` | 76 lines | 157 lines | Full rewrite — now asserts 100 % authored coverage + lane-safety contracts |
| `docs/validation_output.txt` | n/a | new | Full validator transcript |
| `docs/qa_full_branch_authoring_*.png` | n/a | 12 new | Scenario screenshots showing `(authored)` badge in UI |

**Untouched (intentionally):** `data/deepening.js`, `data/drills.js`,
`assets/app.js`, `assets/style.css`, `index.html`. The UI already
distinguishes `(authored)` vs `(inferred)` via `br.branch_intent.override`
at `assets/app.js:275` and the deepening view at `assets/app.js:1088-1108`,
so no UI code changes were required for the new badges to surface.

---

## Coverage — Before / After

```
                          Before          After
total branches              210            210
authored overrides           31            210   (+179)
inferred fallback           179              0   (-179)
authored coverage         14.8 %        100.0 %
override map size            40            219   (extra 9 are dormant
                                                  declarations for
                                                  branches not yet in
                                                  FF_DIAGNOSTIC_BRANCHES
                                                  — harmless)
fault families fully         12             66   (+54)
authored
```

**Per-fault coverage:** All 66 fault families show `OK n/n` in the validator
output (`docs/validation_output.txt`).

---

## Maps & Functions Changed

### `BRANCH_LANE_OVERRIDES` (in `data/diagnostic-layer.js`)

The single source of truth for branch routing. Each new entry follows the
key format **`FAULT-ID:branch-id`** and supplies:

- `intent` — one of the 20 keys in `BRANCH_INTENTS`
- `lane` — drives drill-pool routing in `branchLaneFromBranch()`
- `why_this_branch` — coach-facing rationale (1 sentence)
- `do_not_assume` — coach guard-rail (1 sentence)
- `proof_test_ids` — when override needs to replace the family-seed proof
  flow (e.g. setup-variability branches push PC-04 → PC-02 → PC-01 ahead
  of the swing-mechanics seed)
- `technology_signs_keys` — when tools deviate from family seed (e.g.
  equipment branches force `equipment_ab`, putting branches force
  `sam_puttlab` + `trackman_putting`, force-amplitude branches keep
  `force_plate`)
- `gates_red` / `gates_yellow` — when the branch implies a gating
  condition that must be reconciled before drill prescription
- `false_positives_keys` — additions when the branch has its own
  signature confounders
- `session_implication_patch` — used by 31 putting / short-game /
  bunker / speed / readiness branches to bypass the default full-swing
  block (e.g. `Putting`, `Short game`, `Bunker`, `Speed`, `Warm-up only`)

All 20 `BRANCH_INTENTS` from the existing taxonomy were sufficient — no
intents added.

### `_validate_branch_layer.js`

Now asserts:

1. **Coverage** — every branch in `FF_DIAGNOSTIC_BRANCHES` must resolve to
   `override = true`. Inferred count must be 0.
2. **Putting tool isolation** — putting-lane branches cannot carry
   full-swing / force-plate / Mach3 / speed tools.
3. **Equipment isolation** — equipment-fit branches cannot carry
   `sleep_required` or contamination-window flags.
4. **Pain/readiness isolation** — `mobility_pain_readiness` branches
   cannot carry speed-training tools.
5. **Pressure isolation** — `pressure_attention` branches cannot lead
   with mechanics-first proof (PC-01..PC-07 cannot be the first proof
   card).
6. **Authored copy completeness** — every override must carry
   `why_this_branch` + `do_not_assume`.
7. **Target fault families** — explicit allow-list (the high-leverage
   families called out in the task spec) must all be 100 %.

Validator also prints a per-fault coverage table and 8 sample authored
branches for spot-check.

---

## Tool Selection Patterns Used

Per the task spec routing rules, overrides applied these defaults:

| Branch type | Tools / proof emphasis |
|---|---|
| **aim / setup variability** | TrackMan shot analysis + video + `PC-04 → PC-02 → PC-01` |
| **equipment fit** | `equipment_ab` + TrackMan, `PC-08 → PC-02 → PC-04` |
| **face / path** | TrackMan corridors + 3D, family-seed proof flow |
| **wrist / release** | HackMotion seeded by family |
| **strike / low point** | Foresight strike pattern + force_plate, family seed |
| **ground force / pressure** | Force plate, TrackMan 3D, `PC-01 → PC-06 → PC-04` |
| **putting — start line** | `sam_puttlab` + `trackman_putting`, `PC-10 → PC-11 → PC-07`, putting session patch |
| **putting — speed / read** | `sam_puttlab` + `trackman_putting`, putting session patch |
| **short game / wedge** | `equipment_ab` + TrackMan + video, short-game session patch |
| **bunker** | Video + `equipment_ab`, short-game session patch |
| **speed transfer** | TrackMan speed + Mach 3, conditional on readiness gate |
| **speed readiness** | Force plate + warm-up; pressure/readiness gating mandatory |
| **pressure / attention** | Pressure / decision proof (PC-14..PC-16), not mechanical proof |
| **course decision** | Decision/course proof, no mechanical proof first |
| **mobility / pain / readiness** | Warm-up-only session patch; speed tools forbidden |

---

## Validation Summary

```
Meta: branch_authoring_pass = true, branch_overrides_count = 219
Intents: 20
Overrides: 219
Coverage: 210/210 branches authored (100.0%).
OK: All current branches must be authored. Unexpected inferred: 0
OK: Putting branches must not carry full-swing / force / Mach3 / speed tools (0 violations).
OK: Equipment branches must not require sleep / contamination window (0 violations).
OK: Pain / readiness branches must not carry speed-training / Mach3 tools (0 violations).
OK: Pressure / attention branches must not present mechanics-first proof cards (0 violations).
OK: Every authored branch must carry why/do_not_assume + override=true (0 violations).
OK: Target fault families must all be authored (0 missing).

Validation complete.
```

All 66 fault families: `OK n/n`. Full output preserved at
`docs/validation_output.txt`.

**Reproduce:**
```bash
cd /home/user/workspace/forefront-golf-coach-builder
node _validate_branch_layer.js
```

---

## Screenshots

12 PNGs saved under `docs/` with prefix `qa_full_branch_authoring_*`:

| File | Scenario | Lane / Intents shown |
|---|---|---|
| `qa_full_branch_authoring_00_overview_multifault.png` | SLICE + HOOK + HEEL-TOE-STRIKE multi-fault overview | full step view, multiple authored badges |
| `qa_full_branch_authoring_01_slice.png` | FAULT-SLICE | face_control, path_delivery, equipment_fit |
| `qa_full_branch_authoring_02_hook.png` | FAULT-HOOK | face_control, path_delivery, strike_lowpoint |
| `qa_full_branch_authoring_03_chunk.png` | FAULT-CHUNK | strike_lowpoint, ground_force_pressure, wrist_release |
| `qa_full_branch_authoring_04_putt_startline.png` | FAULT-PUTT-STARTLINE | putting_start_line ×3 |
| `qa_full_branch_authoring_05_wedge_contact.png` | FAULT-WEDGE-CONTACT | short_game_entry, equipment_fit, course_decision |
| `qa_full_branch_authoring_06_speed_ceiling.png` | FAULT-SPEED-CEILING | speed_transfer, strike_lowpoint, pressure_attention |
| `qa_full_branch_authoring_07_readiness_red.png` | FAULT-READINESS-RED | mobility_pain_readiness ×3 (warm-up-only patch) |
| `qa_full_branch_authoring_08_bunker_entry.png` | FAULT-BUNKER-ENTRY | bunker_entry, pressure_attention, equipment_fit |
| `qa_full_branch_authoring_09_freeze_ball.png` | FAULT-FREEZE-BALL | pressure_attention ×4 |
| `qa_full_branch_authoring_10_heel_toe_strike.png` | FAULT-HEEL-TOE-STRIKE | equipment_fit, path_delivery, ground_force_pressure |
| `qa_full_branch_authoring_11_zoom_authored_detail.png` | Equipment branch expanded — branch_intent / why / do_not_assume / proof flow |

Every visible branch card shows the `(authored)` badge in `.diag-meta`,
confirming the new overrides resolve correctly through
`branchLaneFromBranch()` at runtime.

---

## Known Limitations / Caveats

- **9 dormant overrides.** Override map carries 219 entries while
  `FF_DIAGNOSTIC_BRANCHES` exposes 210 branches. The 9 extra entries
  (e.g. `FAULT-SPEED-CEILING:readiness-fatigue`,
  `FAULT-CHUNK:mobility-block`, `FAULT-SLICE:setup-alignment`,
  `FAULT-SLICE:grip-weak`, `FAULT-SLICE:face-start`) are dormant
  declarations from prior authoring work that target branch ids not yet
  surfaced in the diagnostic catalog. They are harmless — they are
  simply never read by `branchLaneFromBranch()`. If those branches are
  added to `FF_DIAGNOSTIC_BRANCHES` later, the overrides will activate
  automatically.
- **No new intents added.** The 20-intent taxonomy was sufficient. If
  future fault families demand a new intent (e.g. distinct
  `tempo_rhythm` separate from `sequencing_kinematics`), add it to
  `BRANCH_INTENTS` first and the validator will accept it.
- **Evidence flags preserved.** All `coach_review_required` /
  `review_required` upstream flags from `deepening.js` are unchanged.
  Authored copy improves the routing decision but does not by itself
  promote a branch from "review_required" to "evidence_supported" —
  that promotion still requires Brendan's review of the proof flow and
  technology signs.
- **Some intents repeat within a fault.** E.g. `FAULT-FREEZE-BALL` has
  4 `pressure_attention` branches and `FAULT-PUTT-STARTLINE` has 3
  `putting_start_line` branches. That is intentional — the **branch
  intent** describes the routing lane, while the per-branch `why` /
  `do_not_assume` differentiates them. Validator does not flag
  intra-fault intent duplication.
- **Deployment skipped.** Per task spec, the main agent owns the
  deploy step.

---

## Reproduce / Next Steps

```bash
cd /home/user/workspace/forefront-golf-coach-builder

# Validate
node _validate_branch_layer.js

# Serve locally for visual QA
python3 -m http.server 8765
# then open http://localhost:8765/index.html
# Coach Wizard → step 3 (pick a flaw) → step 4 shows the authored badges.
```

When ready, main agent can `deploy_website(project_path="forefront-golf-coach-builder")`.
