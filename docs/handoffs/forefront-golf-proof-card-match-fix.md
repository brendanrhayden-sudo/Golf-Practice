# Proof Card Match Fix — Handoff

**Task:** Fix the diagnostic proof-card composer so T1 matches the selected diagnostic branch (no more psychology copy on ground-force lanes, no duplicate T2/T3, lane-correct cards for putting, equipment, contact, face/path, short-game, bunker, speed, and pressure branches).

**Scope:** Static vanilla HTML/CSS/JS only. No DB writes, no storage, no PII. Main agent will deploy.

---

## Files changed

- `forefront-golf-coach-builder/assets/app.js` — replaced the legacy two-line `diagnosticTestCardsForBranch` wrapper (previously delegating to `window.FF_DIAGNOSTIC_TEST_CARDS`) with a ~537-line branch-intent-routed composer. New exports:
  - `FF_PROOF_FAMILY_FROM_FID(fid)` — family inference from fault id prefix.
  - `FF_PROOF_INTENT_PLAN` — 20 intent-keyed T1/T2/T3 profile triples (one per `branch.branch_intent.id`).
  - `FF_PROOF_FAMILY_PLAN` — 8 family fallbacks for branches that lack an intent.
  - `FF_PROOF_PROFILES` — ~40 distinct proof profiles (objective / setup / protocol / pass / fail / use_result).
  - `_buildProofCard(profileKey, fid, branch, index, title)` — assembles a card; uses `branch.tests[i]` as the display title when present.
  - `_proofPlanForBranch(fid, branch)` — picks the plan: intent first, then family fallback.
  - `diagnosticTestCardsForBranch(fid, branch)` — produces the three cards; falls back to the legacy keyword-matched cards only if the composer returns nothing.
- `forefront-golf-coach-builder/_validate_proof_cards.js` — NEW headless validator (213 lines) mirroring the composer's intent → family → profile maps. Runs 12 targeted branch assertions + distinctness rules + lane-safety rules.

## Files created (new)

- `forefront-golf-coach-builder/docs/qa_proof_card_match_01_pressure_trail.png`
- `forefront-golf-coach-builder/docs/qa_proof_card_match_02_no_lead_brake.png`
- `forefront-golf-coach-builder/docs/qa_proof_card_match_03_slice_face_path.png`
- `forefront-golf-coach-builder/docs/qa_proof_card_match_04_heel_gear_equipment.png`
- `forefront-golf-coach-builder/docs/qa_proof_card_match_05_putt_startline.png`
- `forefront-golf-coach-builder/docs/qa_proof_card_match_06_wedge_contact.png`

---

## Root cause

The legacy `profileForTest()` in `data/deepening.js` (lines 916–1025) builds proof-card bodies by regex-matching keywords against the **test name string** (`branch.tests[i]`). For the "Pressure stays trail side" branch on `FAULT-LOWPOINT-BACK`, the test names included "Step drill screen", "Lead-finish gate", and "Line-in-front retest". The word "screen" matched the psychology regex (`/screen|score|breath|pressure|threat|reset|prediction|quiet|tempo|process|outcome/`) first, so T1 rendered with **psychology threat-screen copy** — "external task cue", "light consequence", etc. — on a branch whose actual lane is ground-force / pressure-recenter.

Compounding the bug, `FF_DIAGNOSTIC_TEST_CARDS` is materialised in `data/deepening.js` (lines 1041–1046) **before** `data/diagnostic-layer.js` runs the enrichment loop that attaches `branch.branch_intent` (diagnostic-layer.js lines 1351–1450). The map could not route on intent because intent did not exist at map-build time.

The result: T1 was wrong, and because T2 ("Lead-finish gate") fell into the face/path bucket and T3 ("Line-in-front retest") matched no regex and fell through to the ground-force generic, the three cards were also semantically duplicated — T2 and T3 read nearly identically across many branches.

## What changed in proof-card composition

The new `diagnosticTestCardsForBranch` runs **after** `data/diagnostic-layer.js` has attached `branch.branch_intent`, because `assets/app.js` is the last script loaded. Resolution order:

1. **Branch intent first.** If `branch.branch_intent.id` is present and `FF_PROOF_INTENT_PLAN[intent]` exists, use that plan. Twenty intents are mapped covering every lane that the diagnostic layer can assign (ground_force_pressure, sequencing_kinematics, face_control, path_delivery, wrist_release_hackmotion, strike_lowpoint, dynamic_loft_spinloft, aim_setup, equipment_fit, putting_start_line, putting_speed_control, putting_read_aim, short_game_entry, short_game_landing_window, bunker_entry, speed_transfer, speed_readiness, mobility_pain_readiness, course_decision, pressure_attention).
2. **Family fallback.** If no intent, infer family from the fault-id prefix (`FAULT-PUTT-*`, `FAULT-WEDGE-*`, `FAULT-BUNKER-*`, `FAULT-SPEED-*`, `FAULT-READINESS-*`, equipment / pressure / full-swing).
3. **Legacy fallback.** Only if the composer returns zero cards (impossible given current data), fall back to `window.FF_DIAGNOSTIC_TEST_CARDS`.

Each profile has distinct `objective`, `setup`, `protocol`, `pass`, `fail`, and `use_result` so T1, T2, and T3 are never duplicates. The branch's existing `tests[i]` shorthand still drives the card *display title* (so coach-facing labels like "Wall-post brake", "Downhill-lie brake-and-turn", "Low-point cluster" still appear), but the body content is now lane-correct.

Key intent → T1 profile mappings:

| Lane / intent | T1 profile | Why |
|---|---|---|
| ground_force_pressure, sequencing_kinematics | `gf_recenter_station` | Cheapest no-ball pressure-recenter station before any speed/face cue. |
| face_control, path_delivery | `fp_corridor` | TrackMan face/path corridor proof before any swing change. |
| wrist_release_hackmotion | `wr_release_proof` | HackMotion / impact-tape release-window proof. |
| strike_lowpoint | `cl_strike_map` | Face spray / impact tape strike map. |
| equipment_fit | `eq_ab` | A/B equipment proof — confirm gear, not swing. |
| putting_start_line | `pt_gate` | Putting gate / start-line proof. |
| short_game_entry | `sg_entry_line` | Entry-line proof before bounce/lie drills. |
| bunker_entry | `bn_entry_line` | Bunker entry-line proof before sand drills. |
| speed_transfer | `sp_readiness_baseline` | Readiness gate BEFORE any high-intent speed work. |
| mobility_pain_readiness | `rd_pain_gate` | Pain gate — stop / refer / modify before any mechanics. |
| pressure_attention | `ps_threat_screen` | **Threat screen IS appropriate here only.** |

This satisfies every constraint in the task spec:
- T1 is the cheapest relevant proof for the branch.
- T2/T3 are distinct profiles (verified by validator).
- Ground-force / no-lead-brake / trail-hang lead with pressure-recenter, NOT psychology.
- Putting branches use `pt_*` (or `ps_*` when intent is explicitly pressure_attention).
- Equipment branches lead with `eq_*`.
- Contact / lowpoint branches lead with strike-map / lowpoint-line.
- Face / path branches lead with corridor / TrackMan face/path.
- Short-game / bunker branches lead with entry / landing / lie proofs.
- Speed branches gate readiness before high-intent.

## Validation results

### `_validate_proof_cards.js` — 12/12 targeted assertions PASS

```
OK:   Pressure stays trail side T1 is a ground-force proof, NOT a psychology screen. Got T1="gf_recenter_station".
OK:   Trail-side hang-back chunk T1 is a ground-force proof. Got T1="gf_recenter_station".
OK:   Slide / no-lead-brake T1 is a ground-force proof. Got T1="gf_recenter_station".
OK:   Slice / face-start T1 is a face/path corridor proof. Got T1="fp_corridor".
OK:   Slice / heel-gear T1 is an equipment A-B proof. Got T1="eq_ab".
OK:   Putting start-line / face-aim T1 is a putting proof. Got T1="pt_gate".
OK:   Wedge entry-point T1 is a short-game proof. Got T1="sg_entry_line".
OK:   Bunker entry T1 is a bunker proof. Got T1="bn_entry_line".
OK:   Speed-ceiling / force-amplitude T1 is a speed proof. Got T1="sp_readiness_baseline".
OK:   Readiness / pain-gate T1 is a readiness proof. Got T1="rd_pain_gate".
OK:   Shank / threat-response T1 IS a psychology threat-screen proof. Got T1="ps_threat_screen".
OK:   Bunker sand-fear T1 IS a psychology threat-screen proof. Got T1="ps_threat_screen".
```

Distinctness: all 20 intent plans have 3 distinct T1/T2/T3 profile keys. Lane-safety rules:

```
OK:   Ground-force / sequencing branches must NOT lead with a psychology screen (0 violations).
OK:   Putting branches must use putting (pt_*) or pressure (ps_*) proofs (0 violations).
OK:   Equipment_fit branches must lead with eq_* T1 (0 violations).
```

### `_validate_branch_layer.js` — no regressions

```
branch_authoring_pass: true
Coverage: 210/210 branches authored (100.0%).
All current branches must be authored. Unexpected inferred: 0
Putting branches must not carry full-swing / force / Mach3 / speed tools (0 violations).
Equipment branches must not require sleep / contamination window (0 violations).
Pain / readiness branches must not carry speed-training / Mach3 tools (0 violations).
Pressure / attention branches must not present mechanics-first proof cards (0 violations).
Every authored branch must carry why/do_not_assume + override=true (0 violations).
Target fault families must all be authored (0 missing).
```

### QA screenshots — six scenarios captured

Driven by Playwright against `localhost:8765/index.html` against the actual wizard UI (fault selected → branch selected → diagnostic test deck rendered → element-scoped screenshot of `.diagnostic-test-deck`).

| File | Fault | Branch | T1 / T2 / T3 profile keys |
|---|---|---|---|
| `docs/qa_proof_card_match_01_pressure_trail.png` | FAULT-LOWPOINT-BACK | pressure-trail | gf_recenter_station / gf_lead_finish_strike / gf_variation_retest |
| `docs/qa_proof_card_match_02_no_lead_brake.png` | FAULT-SLIDE | no-lead-brake | gf_recenter_station / gf_lead_finish_strike / gf_variation_retest |
| `docs/qa_proof_card_match_03_slice_face_path.png` | FAULT-SLICE | face-start | fp_corridor / fp_trackman_face / fp_curve_variation |
| `docs/qa_proof_card_match_04_heel_gear_equipment.png` | FAULT-SLICE | heel-gear | eq_ab / eq_strike_compare / eq_transfer |
| `docs/qa_proof_card_match_05_putt_startline.png` | FAULT-PUTT-STARTLINE | face-aim | pt_gate / pt_face_aim / pt_distance_retest |
| `docs/qa_proof_card_match_06_wedge_contact.png` | FAULT-WEDGE-CONTACT | entry-point | sg_entry_line / sg_landing_window / sg_lie_variation |

Visual confirmation in screenshot 01: T1 body now reads "Confirm the player can shift pressure toward the lead side before contact at low cost — no full-speed swing required" with setup referencing a lead-side finish marker, force plate / pressure mat, lead-foot finish gate — pure ground-force language. The old psychology-screen copy ("external task cue", "light consequence", "routine + reset") is gone.

## Notes / remaining items

- **Display titles still come from `branch.tests[i]`.** This is intentional and matches the coach-facing UX (the branch author chooses the shorthand). The fix targets the body content. If a branch's `tests` array is updated upstream, the body content stays lane-correct because routing is now by `branch_intent`, not by the test name string.
- **Legacy `FF_DIAGNOSTIC_TEST_CARDS` / `profileForTest()` are still present** in `data/deepening.js` (lines 916–1046). They are no longer reached on the live render path but remain as a last-resort fallback inside the new composer. Safe to leave; removing them is not in scope for this fix.
- **`branch_intent_routed` and `review_required` source tags** are added to every composed card so downstream auditing and Supabase ingestion can flag them for coach review on the first pass.
- All cards carry the branch's `avoid` text into `do_not_overinterpret` so the upstream "do not assume" guardrails still surface.
- No deployment performed — main agent will deploy.

## Deployment

**Skipped per task instructions.** Static files updated locally at `/home/user/workspace/forefront-golf-coach-builder/`. Main agent will run `deploy_website`.
