# DRAFT - FOR BRENDAN REVIEW - NOT PRODUCTION

This folder contains the current Forefront golf research and prescription
materials, captured here as **draft research/system-design inputs** for future
wiring into the Practice Session Builder (PSB) and Coach Builder.

**These documents are not production engine rules yet.** Nothing in this folder
is loaded, parsed, or executed by the application. Treat this as a review
staging area only.

## Status

- **Review owner:** Brendan
- **Status:** Draft research capture
- **Production status:** Not wired, not active
- **Next step:** Brendan review, then convert selected rules into validated
  app data (drill library entries, branch logic, gate definitions, dataset
  rows) through the normal app data pipeline.
- **RLU dose-model report (`rlu-dose-model-research.pplx.md`):** Evidence
  input for a future practice-dose / proposal-engine layer and for
  marketing language refinement. Not wired into the app; no app behavior
  or production data changes from adding this file.

## Purpose

The materials here are intended to:

1. Centralize the source-of-truth research underpinning the PSB session
   block model, branch intents, drill families, proof tests, and gate
   conditions.
2. Capture the GRF (ground reaction force) expert deep dive that will inform
   the GRF-related branches, drills, and coach-card content.
3. Capture the daily progressive practice prescription framework that will
   inform multi-day plan generation in the Coach Builder.
4. Provide a draft dataset seed (`psb-dataset-seed.draft.json`) that
   enumerates blocks, branch intents, drill families, proof tests, and
   gates. This file is **reference only** — it is NOT loaded by the app.
5. Capture the RLU (Resolved/Representative Learning Unit) dose-model
   research as evidence input for a future practice-dose / proposal-engine
   layer and for marketing language refinement. **Not wired into the app.**

## Contents

| File | Source | Notes |
|---|---|---|
| `practice-session-builder-research.pplx.md` | `forefront-golf-practice-session-builder.pplx.md` | Full PSB research synthesis with citations |
| `psb-dataset-seed.draft.json` | `forefront_golf_psb_dataset_seed.json` | Draft dataset seed; reference data only, not consumed by the app |
| `grf-expert-deep-dive.pplx.md` | `forefront-golf-grf-expert-deep-dive.pplx.md` | Ground reaction force expert deep dive |
| `daily-progressive-practice-prescription.pplx.md` | `forefront-golf-daily-progressive-practice-prescription.pplx.md` | Daily progressive practice prescription framework |
| `rlu-dose-model-research.pplx.md` | `forefront_rlu_research_report.pplx.md` | **DRAFT - FOR BRENDAN REVIEW - NOT PRODUCTION.** RLU dose-model research; evidence input for a future practice-dose / proposal-engine layer and marketing language. Not wired into the app. |
| `practice-proposal-engine-v0.1.md` | new — this folder | **DRAFT - FOR BRENDAN REVIEW - NOT PRODUCTION - DO NOT WIRE YET.** v0.1 design spec for the Practice Proposal Engine resolver that sits between the Diagnostic Layer and the Practice Session Builder UI. Defines inputs, the canonical `practice_proposal` output, resolver flow, safety/readiness gates, RLU dose integration, block/drill rules, scoring/retest rules, reactive adaptation, coach vs client output, sendability checks, data contracts needed, MVP plan, QA scenarios, and the Brendan review queue. Not wired into the app; no schema changes implied. |

All source materials were present and copied successfully — no missing files.

Citations and content from the original `.pplx.md` documents are preserved as
delivered.

## Review checklist (for Brendan)

Before any portion of this material is promoted to production:

- [ ] Confirm research framings still match current Forefront methodology
- [ ] Reconcile block/intent/drill IDs with existing app data (`data/`)
- [ ] Decide which gates, conflicts, and contraindications become hard rules
      vs. coach-side advisories
- [ ] Validate evidence tags (`evidence_supported` vs `expert_framework`)
- [ ] Approve dataset seed rows for migration into validated app data
- [ ] Decide whether this folder should remain in-repo or move to a separate
      research repository once promotion is complete

## What this folder is NOT

- Not loaded by the app at runtime.
- Not a substitute for the validated data in `data/` or the validators in
  `_validate_*.js`.
- Not authoritative for production behavior. If anything here conflicts with
  shipped app data or validators, the shipped app data wins until Brendan
  signs off on a promotion.

## Privacy / safety review

These files were screened before commit for emails, phone numbers, API keys,
bearer tokens, common secret patterns, and direct client identifiers. None
were found. If you spot any private client detail, contact info, or
credential that slipped through, remove it and note it in the commit history.
