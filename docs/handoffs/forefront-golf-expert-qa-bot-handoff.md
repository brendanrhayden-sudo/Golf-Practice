# Forefront Coach Builder — Expert QA Bot v0.1 Handoff

## What this is

A reusable QA harness that drives realistic coaching scenarios through the
Forefront Coach Builder, checks deterministic routing rules, and produces
LLM-judge-ready packets so we can grade Forefront output against expert-pattern
lenses (Wulf, Winkelman, TrackMan/3D, Lynn/Kwon/Cheetham/GEARS, Sieckmann/Short
Game Chef/Mayo, equipment-first thinking, TPI-style readiness, course-transfer
strategy thinking).

The harness is split into two layers so we can run continuously without LLM
credentials, then optionally grade with Claude:

1. **Deterministic layer** — pure-data routing checks that fail loudly when a
   branch_intent → proof T1/T2/T3 → allowed-categories → session-mode chain is
   wrong. Cannot hallucinate; runs in Node with no external dependencies. This
   is what runs in CI.

2. **LLM judge layer** — packets the harness emits per scenario, paired with
   a rubric (`tests/rubrics/expert-rubric.md`) that frames named experts as
   qualitative *lenses*, not citations. The judge returns a single JSON object
   we parse back into the report. Can run in dry-run (no creds needed) or
   live (`ANTHROPIC_API_KEY`).

## Files added / changed

- Added `tests/scenarios/expert-scenarios.json` — 12 fixtures across:
  pressure-stays-trail, no-lead-brake slide, slice face-start, slice heel-gear
  equipment, chunk lowpoint-back, putting start-line, putting speed, wedge
  entry, bunker sand-fear, speed ceiling under readiness-red, pain readiness
  red, course decision / club-selection mismatch.
- Added `tests/rubrics/expert-rubric.md` — 9 named lenses, 10 grading
  dimensions, hard-fail triggers, JSON output schema, severity scale.
- Added `tests/lib/harness.js` — pure-logic library that loads
  `data/drills.js`, `data/deepening.js`, `data/diagnostic-layer.js`,
  `data/alignment-layer.js` into a sandboxed VM, then re-implements the
  routing logic that lives in `assets/app.js` (proof-card composer,
  alignment-layer evaluation, session-mode resolution, drill block placement,
  primary-once Pump Drill rule).
- Added `tests/run-expert-scenarios.js` — runner that calls the harness,
  produces the report + judge packets, optionally runs a Playwright DOM
  smoke check against the static app.
- Added `tests/judge-with-llm.js` — adapter that builds Claude-ready bundles
  per scenario, a JSONL for batch use, and (if `ANTHROPIC_API_KEY` is set)
  calls Anthropic Messages API directly.
- Added `tests/reports/latest-expert-qa-report.md` — generated report.
- Added `tests/reports/judge-packets/*.json` — one packet per scenario,
  plus `*.judge.md` Claude-ready bundles after `judge-with-llm.js`.

No app-facing files were modified. The static app behavior is unchanged.

## Architecture

```
                 ┌─────────────────────────────────────────────┐
                 │  tests/scenarios/expert-scenarios.json      │
                 │  (12 fixtures: fault + branch + gates +     │
                 │   drills + expectations)                    │
                 └─────────────────┬───────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│ tests/lib/harness.js                                                  │
│   • loadAppContext(): vm.runInContext for data/*.js (no DOM, no fs)   │
│   • proofPlanForBranch(): mirrors assets/app.js composer              │
│   • placeDrills(): mirrors allocateSessionDrills + alignment eval     │
│   • extractScenarioOutput(): structured app output                    │
│   • runDeterministicChecks(): 8–9 deterministic rules per scenario    │
└────────────────┬─────────────────────────────────────────────────────┘
                 │ extracted output + check results
                 ▼
┌────────────────────────────────────┐        ┌────────────────────────────┐
│ tests/run-expert-scenarios.js      │        │ existing validators (3)    │
│   • runs validators first          │◀──────▶│   _validate_proof_cards.js │
│   • runs all 12 scenarios          │        │   _validate_branch_layer.js│
│   • writes latest-expert-qa-       │        │   _validate_drill_session_ │
│     report.md                      │        │     alignment.js           │
│   • writes one judge-packet/<id>   │        └────────────────────────────┘
│   • optional --playwright smoke    │
└────────────────┬───────────────────┘
                 │ judge packets
                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│ tests/judge-with-llm.js                                              │
│   • writes Claude-ready .judge.md bundles (no creds needed)          │
│   • writes _all-packets.jsonl for batch tools                        │
│   • if ANTHROPIC_API_KEY: live grading via Messages API,             │
│     stores parsed JSON in *.judge-response.json                      │
│   • writes tests/reports/judge-summary.md                            │
└──────────────────────────────────────────────────────────────────────┘
```

## How to run

From `/home/user/workspace/forefront-golf-coach-builder`:

```bash
# Full suite (validators + 12 scenarios + judge packets)
node tests/run-expert-scenarios.js

# Skip the three existing validators
node tests/run-expert-scenarios.js --skip-validators

# Add a Playwright DOM smoke check (boots index.html headless, asserts that
# FF.state, FF_ALIGNMENT, FF_DIAGNOSTIC_BRANCHES, FF_DRILLS are present).
# Requires `playwright` to be installed in node_modules or globally.
node tests/run-expert-scenarios.js --playwright

# Produce Claude-ready judge bundles without any API call
node tests/judge-with-llm.js --dry-run

# Auto-detect: if ANTHROPIC_API_KEY is in env, run live; else dry-run
node tests/judge-with-llm.js

# Force live grading (still needs the env var)
ANTHROPIC_API_KEY=sk-ant-... node tests/judge-with-llm.js --live

# Only re-judge a single scenario
node tests/judge-with-llm.js --packet SC-04-slice-heel-gear-equipment
```

Exit code from `run-expert-scenarios.js`:
- `0` if all 3 validators + all scenario deterministic checks pass
- `1` if anything failed
- `2` on harness internal error

## How the deterministic layer works

Per scenario, the harness:

1. Loads `data/drills.js`, `data/deepening.js`, `data/diagnostic-layer.js`,
   `data/alignment-layer.js` into a sandboxed VM context with a fake `window`
   global — exactly the same pattern the existing three validators use.
2. Resolves each `fault_id → branch_id` to the branch record in
   `FF_DIAGNOSTIC_BRANCHES`, including the authored `branch_intent`.
3. Computes the proof-card T1/T2/T3 plan via the mirrored `FF_PROOF_INTENT_PLAN`
   and family-fallback logic from `assets/app.js`.
4. Picks a dominant intent via `FF_ALIGNMENT.dominantIntent(...)`.
5. Places each selected drill into a block via `FF_ALIGNMENT.evaluateDrillForIntent`:
   - primary if the drill's category is in `allowed_categories` of the intent
     and no `do_not_use_if` flag has fired,
   - carryover if `allowed_carryover_blocks` applies,
   - filtered out otherwise (recorded for the report).
6. Resolves session mode via `FF_ALIGNMENT.sessionModeFor(...)`. Pain-red and
   mobility-pain-readiness intents force `stop_refer` or `modified_only`.
7. Runs the deterministic check set:
   - expected branch intent present
   - T1 proof family/profile aligns with intent
   - forbidden proof/tool/drill categories absent
   - expected primary categories present
   - expected session mode matches
   - no duplicate primary drill IDs
   - Pump Drill (DR-GRF-004) primary once + carryover only
   - readiness/pain/equipment gates enforced

If any check fails, the runner sets exit code 1, and the report adds an entry
to **Recommended next config edits** pointing at the right data file.

## How the LLM judge layer works

Per scenario, a packet JSON contains:

- `scenario_fixture` — the fixture from `expert-scenarios.json`
- `extracted_output` — branch intents, proof cards, drill summary, session
  blocks (warmup/block1/block2/retest/reflection), session mode, alignment
  record, filtered-out drills
- `deterministic_checks` — already-run checks (the judge does NOT re-run them;
  treats them as evidence)
- `rubric_path` + `rubric_summary` — pointer back to `expert-rubric.md`
- `judge_question` — the exact question the judge is asked

`judge-with-llm.js` then builds a single prompt per packet — rubric + packet +
"return only JSON" — and either:

- writes `<id>.judge.md` (a Claude-ready markdown bundle you can copy/paste),
- writes `_all-packets.jsonl` for batch tooling,
- and if `ANTHROPIC_API_KEY` is set, calls Anthropic and saves the parsed
  response in `<id>.judge-response.json`.

The rubric (`tests/rubrics/expert-rubric.md`) is intentionally cautious about
naming experts: they are treated as **comparison axes**, not as sources of
verbatim recommendations. The script never claims a named coach endorses a
specific drill; it only asks "how close is Forefront to what these expert-
pattern lenses would broadly recommend?"

## How to add scenarios

Edit `tests/scenarios/expert-scenarios.json` and append to the `scenarios`
array. Required fields:

| Field                              | Example                                            |
| ---------------------------------- | -------------------------------------------------- |
| `id`                               | `"SC-13-foo"`                                      |
| `title`                            | One-line summary                                   |
| `fault_ids`                        | `["FAULT-SLICE"]`                                  |
| `branch_ids`                       | `{"FAULT-SLICE": "face-start"}` (must exist in `FF_DIAGNOSTIC_BRANCHES`) |
| `gates`                            | `{"pain":"green","readiness":"green",...}`          |
| `gpl`                              | `1..5`                                              |
| `tools`                            | Array of tool ids (informational; not enforced)    |
| `selected_drills`                  | Array of drill ids from `FF_DRILLS`                |
| `expected_branch_intents`          | Subset that must appear in intents                 |
| `expected_t1_profile_prefix` OR `expected_t1_profile_prefix_any` | `"gf_"` or `["sp_","rd_"]` |
| `expected_primary_categories`      | Subset that must appear in primary slot            |
| `forbidden_categories_primary`     | Must NOT appear as primary                          |
| `expected_session_mode`            | `"normal"` \| `"modified_only"` \| `"stop_refer"`    |
| `expected_session_blocks`          | Subset of `warmup,block1,block2,retest,reflection`  |
| `expected_expert_patterns`         | Free text — used by LLM judge                       |
| `forbidden_language_patterns`      | Free text — used by LLM judge                       |
| `expert_reference_tags`            | Tags for rubric mapping; LLM judge consumes them   |
| `expected_must_pass_first` (opt.)  | e.g., `"eq_ab"` for equipment_fit                   |

To validate the fixture:

```bash
node tests/run-expert-scenarios.js --skip-validators
```

If a branch_id doesn't exist, the harness logs `expected_branch_intents_present`
as FAIL with the actual intents (empty). That tells you to look in
`data/deepening.js` or `data/diagnostic-layer.js` for the right branch id.

## Continuous testing

For local CI loops:

```bash
# Pre-commit / pre-deploy
node _validate_proof_cards.js && \
node _validate_branch_layer.js && \
node _validate_drill_session_alignment.js && \
node tests/run-expert-scenarios.js
```

For sharpening over time:

1. Whenever a coach reports a "Forefront said X but I would have said Y" case,
   add a fixture that captures that scenario.
2. Run the harness. If it fails deterministically, the report points at the
   data file to edit. If it passes deterministically but the LLM judge marks
   `pass: false` with `severity: high`, the rubric's `recommended_config_edits`
   suggest what to tighten.
3. Each rubric edit should add a *lens*, never a verbatim quote.
4. Hold the line on rubric caveats: lenses are comparison axes, not citations.

## Limitations / review_required

- **Drill placement** in `tests/lib/harness.js` mirrors but does not literally
  call `assets/app.js`'s `allocateSessionDrills`. If that function's behavior
  drifts substantially (e.g., a new block kind, a new allocation heuristic),
  the harness will report results consistent with its mirror and the live UI
  may differ. The two existing proof-card and branch-layer validators have the
  same trade-off, and the harness uses the same vm-context pattern as them.
- **Playwright DOM drive** is currently a *smoke check only* — it boots the
  static page and asserts globals exist. Driving the wizard form (Gate →
  Layer → Fault → Diagnose → GP-L → Tools → Drills → Build) would require
  significant DOM interaction; the deterministic VM path is more stable for
  routing checks and is the primary verification.
- **Live LLM grading** is opt-in and not required to pass the suite. The
  rubric's JSON schema makes the response machine-parseable, but model output
  variance means we cannot guarantee a parseable JSON every time. The script
  saves both `raw` and `parsed` (null if unparseable) so a follow-up review
  can correct it manually.
- **Expert lens framing** is qualitative on purpose. Where a named coach or
  vendor protocol *would* disagree with Forefront, the rubric instructs the
  judge to flag it as a *tradeoff note*, not a hard fail, unless the disagreement
  crosses a safety line (pain-red, readiness-red).
- **No CI hook** is wired up here. To wire one, add an npm script (e.g.
  `"qa": "node _validate_proof_cards.js && node _validate_branch_layer.js && node _validate_drill_session_alignment.js && node tests/run-expert-scenarios.js"`)
  to a `package.json` if one is added later. The current project intentionally
  has no `package.json` / `node_modules` per the static-app constraint.

## Deployment

This is a test harness only. No app-facing files were changed. Parent can
deploy at its discretion.
