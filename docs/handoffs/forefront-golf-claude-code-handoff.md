# Claude Code Handoff Brief — Forefront Golf Coach Builder
## Drill / Session Alignment Layer

**Status:** Implementation complete, validators green, screenshots captured. Ready for production hardening.

**Repo location (workspace-relative):** `forefront-golf-coach-builder/`

**Hard constraints (already met, must remain):**
- Static vanilla HTML/CSS/JS only — no build step.
- No localStorage / sessionStorage / IndexedDB / cookies.
- No external APIs. No DB writes. No secrets or PII.
- All logic in browser-side JS modules attached to `window.FF_*`.

---

## 1. What the alignment layer does (1-minute orientation)

`data/alignment-layer.js` is the **single source of truth** that maps each `branch_intent.id` (produced by `data/diagnostic-layer.js`) to:

- which drill **categories** are allowed as primary,
- which are carryover-only,
- which are hard-blocked,
- which **session block kind** is preferred for the primary slot,
- per-drill rules (e.g. **DR-GRF-004** Pump Drill is `primary_once`),
- gate preconditions (e.g. `speed_transfer` `requires_green_gates`),
- and a `session_mode` (`full` / `modified_only` / `stop_refer`).

The 20 supported intents are:

```
aim_setup, equipment_fit, face_control, path_delivery, wrist_release_hackmotion,
strike_lowpoint, dynamic_loft_spinloft, ground_force_pressure, sequencing_kinematics,
speed_readiness, speed_transfer, putting_start_line, putting_speed_control,
putting_read_aim, short_game_entry, short_game_landing_window, bunker_entry,
pressure_attention, course_decision, mobility_pain_readiness
```

All consumed via the global API exposed at the bottom of `alignment-layer.js`:

```js
window.FF_INTENT_ALIGNMENT     // map: intentId -> record
window.FF_ALIGNMENT_BLOCKS     // 8 session block kinds
window.FF_ALIGNMENT = {
  evaluateDrillForIntent(drill, intentId, gates) → {verdict, reason, do_not_use_if[]}
  alignmentGateFlags(gates) → ["readiness-red", ...]
  getAlignment(intentId) → record | null
  resolveIntentId(branchIntent | id | obj) → string
  dominantIntent(branches, gates) → intentId
  sessionModeFor(intentId, gates) → "full" | "modified_only" | "stop_refer"
  blocksForKind(kind) → string[] of block kinds
}
```

---

## 2. Where alignment is wired into the UI

Every integration point lives in `assets/app.js`. Keep these names so future patches stay grep-able.

| Region | Function | Behavior |
|---|---|---|
| Helpers (~L1823) | `currentBranchIntents()`, `currentDominantIntent()`, `evaluateDrillAlignment()` | Read intent off `window.FF.state.diagnostic.branches`. Exposed as `window.FF_currentBranchIntents` / `FF_currentDominantIntent` / `FF_evaluateDrillAlignment` for QA harnesses. |
| `stepDrills()` (~L434) | drill filtering + ranking | Hard-drops `blocked_categories` from the candidate pool. Sort booster `+25` primary-allowed, `+10` carryover, `-50` if a `do_not_use_if` flag fires. |
| `drillCard()` (~L649) | per-card UI | Renders alignment badge + red-bordered **Do not use if** box. |
| `allocateSessionDrills()` (~L818) | session block assignment | Honors `primary_once_drills`; clones to carryover slot with `__carryover_variant: true`. |
| `buildSessionPlan()` (~L995) | session-level mode | Sets `plan.session_mode`, `plan.session_mode_reason`, `plan.alignment`. Strips non-warmup drills when mode is `modified_only` or `stop_refer` and writes `plan.blocks[k].modified_notice`. |
| `renderBlock()` (~L2163) | session UI | Paints red modified-notice banner + green carryover pill. |

---

## 3. Acceptance checklist for any future change

Run these three before opening a PR:

```bash
cd forefront-golf-coach-builder
node _validate_proof_cards.js
node _validate_branch_layer.js
node _validate_drill_session_alignment.js   # ← new; 17 sections
```

All three must print their respective "ALL CHECKS PASS" / "complete" summary.

When touching `alignment-layer.js` you MUST also:

1. Keep all 20 intents present.
2. Keep DR-GRF-004 in `ground_force_pressure.primary_once_drills` (the Pump Drill rule is referenced by tests and QA scenarios).
3. Keep `must_pass_first: "eq_ab"` on `equipment_fit`.
4. Keep `requires_green_gates: ["readiness", "mobility"]` on `speed_transfer`.
5. Keep `session_mode: "modified_only"` on `mobility_pain_readiness`.
6. Update `_validate_drill_session_alignment.js` if you add a new intent or a new block kind.

---

## 4. QA scenarios to re-run after any UI / drills / branches change

These 10 scenarios are the contract this layer must keep upholding. Screenshots live at `docs/qa_drill_session_alignment_*.png`.

| # | Fault → Branch | Intent | Expected behavior |
|---|---|---|---|
| 1 | FAULT-CHUNK-TRAIL-HANG → `pressure-trail` | `ground_force_pressure` | GRF + warmup primary; face-only blocked. DR-GRF-004 primary once, carryover in block2. |
| 2 | FAULT-SLICE-PATH → `face-start` | `face_control` | Corridor + face-to-path primary; GRF carryover. |
| 3 | FAULT-SLICE-HEEL → `gear-equipment` | `equipment_fit` | A/B compare + strike-compare primary; full-swing primaries downgraded until `gates.eq_ab === "green"`. |
| 4 | FAULT-CHUNK-LOWPOINT → `lowpoint-back` | `strike_lowpoint` | Strike map + brush primary; speed and pressure blocked. |
| 5 | FAULT-PUTT → `start-line-face-aim` | `putting_start_line` | Putting-only category. |
| 6 | FAULT-PUTT → `speed-tempo-psychology` | `putting_speed_control` | Putting-only category. |
| 7 | FAULT-WEDGE → `entry-point` | `short_game_entry` | Short-game-only category. |
| 8 | FAULT-BUNKER-ENTRY → `sand-fear` | `pressure_attention` | Routine / regulation primary; mechanical drills carryover. |
| 9 | FAULT-SPEED-CEILING → `force-amplitude-low` w/ `readiness=red` | `speed_transfer` | Red **Do not use if** box: *speed primary requires green gates — not green: readiness*. |
| 10 | FAULT-SLIDE → `mobility-avoidance` | `mobility_pain_readiness` | `session_mode = modified_only`; red **Modified only — skip high-intent work** banner on block1/block2/retest; warmup_prep is the only block carrying drills. |

Plus a pain-red override scenario: any branch + `gates.pain = "red"` → `session_mode = stop_refer`, identical strip-and-banner behavior.

QA harness pattern (Playwright):

```js
// Inside a page.evaluate after wizard mount:
globalThis.driveScenario({
  faults:   ['FAULT-CHUNK-TRAIL-HANG'],
  branches: ['pressure-trail'],
  gates:    { pain:'green', readiness:'green', mobility:'green', contact:'green', stage:'green' },
  layer:    'club',
  gpl:      'iron'
});
// then click any .gate-cell.green to trigger renderWizard
```

This drives `window.FF.state` directly and triggers a re-render through the existing gate-cell onclick handler. Do NOT add new state-mutation paths just for tests.

---

## 5. Open follow-ups (suggested, not required)

| Priority | Task |
|---|---|
| P1 | Author the `readiness-fatigue` lane of `FAULT-SPEED-CEILING` in `FF_DIAGNOSTIC_BRANCHES` so scenario 9 stops relying on the `force-amplitude-low` workaround. |
| P1 | Add a UI surface for `gates.eq_ab` (chip on the Drills step) so coaches can mark A/B + strike-compare proof passed → unblocks `equipment_fit` swing primaries. Today this gate is set only programmatically. |
| P2 | Load-balance carryover placement across `serial_variability` and `random_variability` instead of taking the first allowed slot. |
| P2 | Label clones from `primary_once_drills` differently when the list grows beyond DR-GRF-004 (e.g. "rotation drill" vs. "carryover variant"). |
| P3 | Add a developer-only "alignment overlay" toggle that paints the verdict and reason on every candidate card, not just the conditional/blocked ones. |

---

## 6. Risk register

| # | Risk | Mitigation |
|---|---|---|
| R1 | Drift between `branch_intent.id` values in `diagnostic-layer.js` and keys in `FF_INTENT_ALIGNMENT` | Validator section 1 fails any time an intent record is missing a required field; add a sibling check that diffs the two key sets if/when the diagnostic layer grows. |
| R2 | Drill categories renamed in `data/drills.js` | Validator sections 2 and 10-16 enumerate allowed category strings; a rename will fail the build immediately. |
| R3 | `__carryover_variant` flag stripped by a future allocator rewrite | Keep `Object.assign({}, drill, { __carryover_variant: true })` exactly; renderer keys on this flag. |
| R4 | `modified_notice` not respected by a future block renderer | `renderBlock` is the only renderer; if you split it, port the banner branch. |
| R5 | Static-only constraint relaxed (e.g. someone introduces fetch) | Project still works offline today; add a CSP `connect-src 'none'` to `index.html` to enforce. |

---

## 7. Files of record

```
forefront-golf-coach-builder/
├── index.html                                    (1 script tag added)
├── data/
│   ├── alignment-layer.js                        (NEW — 480 lines, single source of truth)
│   ├── diagnostic-layer.js                       (unchanged, source of branch_intent ids)
│   └── drills.js                                 (unchanged, source of categories)
├── assets/
│   └── app.js                                    (5 regions modified — see §2 above)
├── _validate_drill_session_alignment.js          (NEW — 17 sections)
├── _validate_branch_layer.js                     (unchanged, still green)
├── _validate_proof_cards.js                      (unchanged, still green)
└── docs/
    ├── qa_drill_session_alignment_00_landing.png
    ├── qa_drill_session_alignment_01..09_*.png   (one per scenario)
    ├── qa_drill_session_alignment_10_pain_gate_modified.png
    ├── qa_drill_session_alignment_11_session_modified_mobility.png
    ├── qa_drill_session_alignment_11_session_pain_red.png
    └── qa_drill_session_alignment_12_session_pump_carryover.png
```

Audit detail report: `forefront-golf-drill-session-alignment-audit.md`.

**Deployment:** not performed in this pass; parent agent / Claude Code owns deploy.
