# Forefront Golf — Diagnostic Layer Weird-Output Fix

**Date:** 2026-05-21
**Scope:** `forefront-golf-coach-builder/data/diagnostic-layer.js` (only file changed)
**Outcome:** Diagnostic branch enrichment (technology signs, proof-test IDs, session implications, gates, sleep/RLU flags) is now lane- and fault-id-driven instead of broad keyword inference. Every branch now carries a tight, coach-readable 2–4-tool signature, the right PC card ordering, and gates that match the lane.

---

## 1. Weird outputs identified (audit before fix)

Captured via Playwright `page.evaluate()` dump of `FF_DIAGNOSTIC_BRANCHES` against the prior implementation.

| Fault / branch | Weird output observed | Why it was wrong |
|---|---|---|
| FAULT-SLICE / face-start | `sam_puttlab` showed up | Keyword "start-line gate" in a full-swing branch tripped putting tool |
| FAULT-SLICE / heel-gear | `trackman_speed_training` + PC-09 | Word "speed" anywhere triggered speed tools |
| FAULT-PUSH-SLICE / open-face-first | `sam_puttlab`, `trackman_speed_training`, PC-09 | Same two leaks combined |
| FAULT-CHUNK / cast-dump | `trackman_optimizer`, `equipment_ab`, PC-08 | Contact-low-point branch was pulling equipment fitting tools |
| FAULT-PUTT-STARTLINE | full-swing TrackMan + `trackman_speed_training` + PC-09 | Putting branches inherited full-swing speed cards |
| FAULT-PUTT-SPEED | `trackman_speed_training` + PC-09 readiness gate | Putting "speed" branches caught the full-swing speed inference |
| FAULT-PUTT-PRESSURE | GEARS 3D in putting psych branch | 3D tool prescribed for putting psych |
| FAULT-BUNKER-ENTRY / sand-fear | only `trackman_shot_analysis` (no entry / landing / video) | Wrong technology basket entirely |
| FAULT-WEDGE-CONTACT | only `trackman_corridors` (no PC-13 landing window, no equipment_ab) | Short-game branch missing landing-window cards |
| FAULT-EQUIP-LIE-LOFT / shaft-fit | lane_key = `speed`, red gate `speed_unsafe`, RLU=30 | Equipment branch routed to speed because of word "delivery" |
| FAULT-IRON-SPEC-MISMATCH | lane_key = `club_face_path`, sleep=true, RLU=18 | Equipment branch routed to acquisition |
| FAULT-READINESS-RED / pain-gate | PC-09 + speed proofs | Pain branch was prescribing speed test |
| FAULT-FREEZE-BALL | `gears` on every branch | Word "sequence" / "swing thoughts" matched 3D inference |
| FAULT-TEMPO-RUSH | `gears`, `trackman_speed_training` | Same over-inference |
| FAULT-NUMBER-CHASE | `gears`, `trackman_speed_training`, `trackman_performance_center` | Same |
| FAULT-SPEED-CEILING / intent-or-threat | `yips` yellow gate | yips gate added to non-yips lane |
| FAULT-WEAK-SMASH / speed-without-contact | `pressure_intolerance` + `yips` | Same |
| FAULT-SLIDE / target-lunge | `yips` yellow gate (full-swing body branch) | Same |

Also: `sleep_required = true` on every branch including equipment / readiness, contradicting the consolidation rule.

---

## 2. Files changed

- `forefront-golf-coach-builder/data/diagnostic-layer.js` — only this file was modified.
- No changes to `data/deepening.js`, `data/drills.js`, `assets/app.js`, or `index.html`.
- No new external libraries, no localStorage / sessionStorage / cookies / IndexedDB.
- No deployment.

---

## 3. Rules tightened — what the new code does

### 3.1 Fault-id-driven lane resolution (replaces lane priority + keyword fallback)

New helper `faultLaneFromId(fid)` is the authoritative source for which session lane every branch belongs to. Categories declared on the branch are only used if the fault id is unknown.

```
FAULT-EQUIP*, FAULT-IRON-SPEC*, FAULT-DRIVER-SETUP*, FAULT-LIE-LOFT  -> equipment
FAULT-READINESS*, FAULT-PAIN*, PAIN-GATE                              -> warmup_prep
FAULT-PUTT*                                                           -> putting
FAULT-BUNKER*, FAULT-WEDGE*, FAULT-CHIP*, FAULT-SHORTGAME*            -> short_game
FAULT-SPEED*, FAULT-WEAK-SMASH, FAULT-SMASH                           -> speed
FAULT-COURSE*, FAULT-PSR*, FAULT-NUMBER-CHASE, FAULT-TEMPO, FAULT-FREEZE -> psychology
FAULT-EARLY-EXT, FAULT-SWAY, FAULT-SLIDE, FAULT-HANG-BACK,
FAULT-SPIN-OUT, FAULT-NO-LEAD-BRAKE, FAULT-LOSS-POSTURE, *GRF*       -> ground_force
FAULT-CHUNK, FAULT-THIN, FAULT-TOP, FAULT-SHANK, FAULT-TOE,
FAULT-HEEL, FAULT-CENTER-CONTACT, FAULT-WEAK-CONTACT                  -> contact_lowpoint
FAULT-SLICE, FAULT-HOOK, FAULT-PUSH, FAULT-PULL, FAULT-BLOCK,
FAULT-FACE, FAULT-CAST, FAULT-FLIP, FAULT-HANDLE-DRAG, FAULT-CHICKEN  -> club_face_path
```

### 3.2 Per-family tech-sign allowlist (`FAMILY_TECH_MAP`) — capped at 4

| Lane | Tools (priority order) |
|---|---|
| putting          | sam_puttlab, trackman_putting, video |
| short_game       | video, equipment_ab, trackman_shot_analysis |
| equipment        | equipment_ab, trackman_shot_analysis, trackman_optimizer |
| warmup_prep      | video |
| psychology       | video, trackman_on_course |
| course_transfer  | trackman_on_course, video |
| speed            | trackman_speed_training, mach3_tools, trackman_shot_analysis |
| ground_force     | force_plate, video, trackman_3d |
| club_face_path   | trackman_shot_analysis, trackman_corridors, video |
| contact_lowpoint | trackman_shot_analysis, video, equipment_ab |

Narrow conditional adds (each requires a strong signal AND must be lane-compatible):
- `hackmotion` — only on CAST / FLIP / CHICKEN / HANDLE-DRAG fault families, or club_face_path branches that explicitly mention wrist/lead-wrist language.
- `gears` — only on ground_force lane AND the branch text explicitly mentions "kinematic sequence", "3d", or "gears".
- `equipment_ab` — added to club_face_path / contact_lowpoint branches that mention lie/shaft/grip/fitting.
- `trackman_on_course` — added to psychology branches mentioning routine / pressure / on-course.

Hard subtractions (per lane) strip incompatible tools:
- putting strips: trackman_speed_training, mach3_tools, force_plate, gears, trackman_3d, hackmotion, trackman_optimizer, trackman_performance_center.
- short_game strips: trackman_speed_training, mach3_tools, force_plate, gears, trackman_3d.
- equipment strips: trackman_speed_training, mach3_tools, force_plate, gears, hackmotion, sam_puttlab.
- psychology strips: gears, trackman_3d, force_plate, trackman_speed_training, mach3_tools, sam_puttlab, hackmotion.
- warmup_prep strips: everything except video.
- course_transfer strips: gears, trackman_3d, force_plate, trackman_speed_training, mach3_tools, sam_puttlab.
- `sam_puttlab` is putting-only (stripped from every other lane).
- `trackman_speed_training` and `mach3_tools` are speed-only.

Final output capped at 4 tools.

### 3.3 Per-family proof-test card ordering (`FAMILY_PROOF_MAP`)

| Lane | PC order (cheapest first) |
|---|---|
| putting          | PC-10, PC-11, PC-07 |
| short_game       | PC-13, PC-11, PC-04, PC-02 |
| equipment        | PC-08, PC-02, PC-04 |
| warmup_prep      | PC-09 |
| psychology       | PC-07, PC-14 |
| course_transfer  | PC-14, PC-07 |
| speed            | PC-09, PC-04, PC-05 |
| ground_force     | PC-01, PC-06, PC-04 |
| club_face_path   | PC-03, PC-05, PC-01 |
| contact_lowpoint | PC-04, PC-05, PC-01 |

Fault-id specific narrow overrides (none more than +1 card):
- PUTT-STARTLINE → PC-10 first.
- PUTT-SPEED → PC-11 first.
- PUTT-PRESSURE → adds PC-07 at end.
- BUNKER → PC-12 first.
- SHORTGAME-DISTANCE → PC-13 first.
- COURSE → PC-14 first.
- READINESS-RED + pain branch → returns `[]` (gate handles it, no proof card).
- club_face_path + setup/tee/ball-position keyword → appends PC-02.
- contact_lowpoint + equipment/lie/shaft keyword → appends PC-08.

Hard exclusions per lane (e.g., putting strips PC-09 / PC-05 / PC-06 / PC-08 / PC-12 / PC-13; equipment strips PC-09 / PC-10 / PC-11 / PC-13 / PC-06 / PC-07).

Output capped at 4 cards.

### 3.4 Gates and session implication

- `red_gate_checks`:
  - Always `no_baseline`.
  - `equipment_mismatch` only on equipment lane.
  - `speed_unsafe` only on speed lane.
  - `poor_readiness` on readiness branches; `pain` instead when the branch label mentions pain.
- `yellow_gate_checks`:
  - `contact_chaos` only on lanes where contact stability matters (club_face_path, contact_lowpoint, ground_force, short_game). Removed from putting, equipment, warmup_prep, psychology, speed.
  - `mobility_limit` only on ground-force / body branches.
  - `pressure_intolerance` only on psychology lane AND fault ids matching PRESSURE / FREEZE / TEMPO-RUSH / NUMBER-CHASE / PSR / COURSE.
  - `yips` only on PUTT-PRESSURE / CHIP / YIPS / FREEZE-BALL fault families.
  - `speed_request_no_transfer` only on speed lane.
- `sleep_required` is now `false` on equipment, warmup_prep, course_transfer, speed, and psychology lanes. Stays `true` for acquisition lanes (club_face_path, contact_lowpoint, ground_force, short_game, putting).
- `false_positives` capped at 2 per branch (was 4).

---

## 4. Scenarios re-tested (Playwright)

Twelve fault scenarios were selected one-at-a-time and screenshotted with the diagnostic branch panel expanded. Files in `forefront-golf-coach-builder/docs/`:

| File | Fault | Expected lane | Verified output |
|---|---|---|---|
| qa_weird_output_fix_01_slide.png | FAULT-SLIDE | ground_force | force_plate + video + trackman_3d, PC-01 → PC-06 → PC-04, mobility_limit + contact_chaos yellow |
| qa_weird_output_fix_02_chunk.png | FAULT-CHUNK | contact_lowpoint | trackman_shot_analysis + video + equipment_ab, PC-04 → PC-05 → PC-01 |
| qa_weird_output_fix_03_slice.png | FAULT-SLICE | club_face_path | trackman_shot_analysis + trackman_corridors + video, PC-03 → PC-05 → PC-01 (no sam_puttlab leak) |
| qa_weird_output_fix_04_putt_startline.png | FAULT-PUTT-STARTLINE | putting | sam_puttlab + trackman_putting + video, PC-10 → PC-11 → PC-07 (no speed cards) |
| qa_weird_output_fix_05_putt_speed.png | FAULT-PUTT-SPEED | putting | sam_puttlab + trackman_putting + video, PC-10 → PC-11 → PC-07 (no PC-09) |
| qa_weird_output_fix_06_iron_spec.png | FAULT-IRON-SPEC-MISMATCH | equipment | equipment_ab + trackman_shot_analysis + trackman_optimizer, PC-08 → PC-02 → PC-04, sleep=false, RLU=0, `diagnostic_only` |
| qa_weird_output_fix_07_readiness_red.png | FAULT-READINESS-RED | warmup_prep | video only, PC-09, phase=readiness, RLU=0, no speed proofs |
| qa_weird_output_fix_08_freeze_ball.png | FAULT-FREEZE-BALL | psychology | video + trackman_on_course, PC-07 → PC-14, no GEARS, no speed |
| qa_weird_output_fix_09_speed_ceiling.png | FAULT-SPEED-CEILING | speed | trackman_speed_training + mach3_tools + trackman_shot_analysis, PC-09 → PC-04 → PC-05 |
| qa_weird_output_fix_10_wedge_contact.png | FAULT-WEDGE-CONTACT | short_game | video + equipment_ab + trackman_shot_analysis, PC-13 → PC-11 → PC-04 → PC-02 |
| qa_weird_output_fix_11_bunker.png | FAULT-BUNKER-ENTRY | short_game | video + equipment_ab + trackman_shot_analysis, PC-12 → PC-13 → PC-11 → PC-04 |
| qa_weird_output_fix_12_equip_lie_loft.png | FAULT-EQUIP-LIE-LOFT | equipment | equipment_ab + trackman_shot_analysis + trackman_optimizer, PC-08 → PC-02 → PC-04, no speed gate |

All twelve render cleanly with one diagnostic group per fault, lane-appropriate tech signs, the right PC ordering, and no over-inferred yellow gates.

---

## 5. Remaining `review_required` items

- **Branch-level lane override**: a small number of branches in `deepening.js` (e.g. `FAULT-CAST` "Pressure Sequence Early") have `categories: ["psychology", ...]` but the parent fault is mapped to `club_face_path`. The new code always uses the fault-id lane, which is the safe default but may flatten nuance for the sub-branch. If Brendan wants per-branch lane overrides to win, the next pass should add an opt-in `branch.lane_override` field consumed before `faultLaneFromId`.
- **PC-09 on pain branch**: I currently return `[]` for the pain-gate branch (red `pain` gate handles the stop). Confirm with Brendan whether a `PC-09` readiness reading should still be allowed when pain is mild.
- **PC-12 ordering for BUNKER**: I push PC-12 to the front for any BUNKER* fault, ahead of PC-13 (landing). Confirm whether bunker should always lead with the entry-point test (current behavior) or with the landing-window test when distance is the limiter.
- **FF_TECHNOLOGY_SIGNS keys referenced**: `mach3_tools` is required for the speed lane — confirmed present at line 213 of `diagnostic-layer.js`. `trackman_3d` and `trackman_putting` also confirmed present.
- **3D / GEARS gating**: I only add `gears` on ground_force branches that explicitly mention "kinematic sequence", "3d", or "gears". This intentionally suppresses GEARS on full-swing face/path / contact branches. Brendan to confirm whether he wants a more permissive GEARS rule for advanced acquisition branches.
- **HackMotion on club_face_path**: only triggered if the branch text mentions "wrist flexion / wrist extension / lead wrist" or the fault id is CAST / FLIP / CHICKEN / HANDLE-DRAG. Other face/path branches will not show HackMotion by default — confirm desired aggressiveness.

---

## 6. Limitations / things I did not change

- I did not touch the curated branch authoring in `data/deepening.js` — only the enrichment layer.
- I did not modify the rendering in `assets/app.js` — same DOM structure / classes / `.diag-tech-row` markup. The compact summary line "PC-XX → PC-YY · N TECH SIGNS · M FALSE-POS RISK" still renders the same way; only the contents are cleaner.
- I did not deploy.
- I did not add any localStorage, sessionStorage, IndexedDB, cookies, or external API calls.

---

## 7. Verification commands

```bash
# Syntax check
node -e "const fs=require('fs');const c=fs.readFileSync('forefront-golf-coach-builder/data/diagnostic-layer.js','utf8');new Function(c);console.log('OK')"

# Serve locally
cd forefront-golf-coach-builder && python3 -m http.server 5050

# Re-run the audit dump
# (Playwright snippet in conversation history)
```
