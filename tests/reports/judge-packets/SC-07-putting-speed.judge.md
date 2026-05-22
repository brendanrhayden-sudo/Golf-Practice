# Judge bundle — SC-07-putting-speed

Paste the following into Claude (or another LLM) and ask for the JSON-only response described in the rubric.

---

You are grading a single Forefront Coach Builder scenario against the rubric below.

RUBRIC:
----- BEGIN RUBRIC -----
# Forefront Coach Builder — Expert-Pattern Alignment Rubric (v0.1)

## Purpose

This rubric is used by an LLM judge (e.g. Claude) to grade a single Coach Builder
scenario output against the **Forefront system** and a panel of **expert-pattern
lenses** drawn from public-domain ideas in golf coaching, motor learning, and
sports science. Treat it as "expert-pattern alignment" rather than "what
specifically expert X would prescribe." We are not putting words in any named
person's mouth. Their work is used as a comparison axis.

This rubric is paired with the deterministic harness output: the LLM does NOT
re-check deterministic facts (proof T1, allowed categories, session mode); the
harness has already done that. The LLM judges the qualitative dimensions:
intent fit, cueing language, sequencing, transfer plan, and red-flag avoidance.

## Hard caveats

- Do NOT fabricate quotes or specific recommendations attributed to any
  named expert. Phrase as "this aligns with the Forefront expert lens of X,
  which broadly emphasizes Y" — never "Sieckmann says exactly Z."
- If a Forefront output is reasonable but takes a different path than one
  particular expert lens, that is NOT automatically a fail. Multiple expert
  lenses can disagree. Flag it as a tradeoff, not a defect.
- Pain / readiness / mobility red gates are ABSOLUTE. No expert lens overrides
  a stop-refer or modified-only decision.

## Lenses

Each lens is a qualitative pattern, not a verbatim citation.

### L1. Forefront motor-learning protocol
- Pattern: one external cue per rep, constraints before cues, feedback fades
  with skill, distal-target focus over body-part focus, representative practice
  design.
- Sources used as background, not verbatim: Forefront Master Manual (FM-100,
  FM-300, FM-410, FM-500), the in-app Operating Rules block in the README and
  index.html.

### L2. Wulf / Winkelman attention & cueing
- Pattern: external focus > internal focus for far-aiming tasks; OPTIMAL
  theory (autonomy, expectancies, external focus); Winkelman's 3-Rs debrief
  and one-cue-per-rep construction.
- Red flag: cues that aim attention at body parts during the rep (e.g.,
  "keep your lead arm straight"); cues delivered mid-rep.

### L3. TrackMan / 3D diagnostic logic
- Pattern: face angle dominates start line (~70-85% rule of thumb), face-to-path
  drives curvature; ball-flight / strike numbers are PROOF, not opinion;
  strike pattern (heel/toe/sole) is read before mechanical edits.
- Red flag: prescribing a swing edit before reading face / path / strike
  numbers; using "swing plane" talk in putting or short-game blocks.

### L4. Ground-force / pressure-trace lens
- Background experts: Scott Lynn (force plates), Kwon (kinematics), Phil
  Cheetham (GEARS), Mike Adams / Dana / Josh Koch / Chris Como (style of
  pattern-fitting).
- Pattern: trail-side stay / no-lead-brake / chunk-from-back is a
  pressure-and-sequencing problem first; lead-side post / pelvis-then-thorax
  sequencing dominates over face-only cue.
- Red flag: leading the proof with a face/path drill when the dominant flaw
  is a pressure-trace problem; leading with a psychology screen when the
  signal is mechanical.

### L5. Short-game / putting lens
- Background experts: James Sieckmann, Short Game Chef (Parker McLachlin),
  Joseph Mayo.
- Pattern: short-game and putting categories stay in their own lane (no
  full-swing drills); landing-window framing over distance-only; gate /
  start-line work for putting start-line; distance-ladder for putting speed.
- Red flag: full-swing drills appearing in a putting / short-game session;
  "wristy / scoopy" body-part language during a wedge block.

### L6. Equipment / fitting lens
- Pattern: when a flaw has a heel / toe / gear-effect signature, equipment
  A/B + strike comparison must clear before any swing rebuild.
- Red flag: prescribing technique edits while the strike pattern itself
  hasn't been compared against an alternative club / shaft / lie.

### L7. Pressure / attention / threat
- Pattern: bunker sand-fear, shank threat-response, and similar pressure
  branches lead with routine / regulation / attention proof (graded
  exposure); mechanics are carryover.
- Red flag: trying to "fix" a sand-fear with a sand-mechanics drill while
  the threat-response is unaddressed.

### L8. Readiness / pain / TPI-style screen
- Pattern: readiness or pain red triggers modified-only or stop-refer;
  TPI-style screen results drive go/no-go on speed and high-intent work.
- Red flag: prescribing high-intent speed or heavy mechanical acquisition
  while pain is red or readiness is red.

### L9. Course transfer / decision lens
- Background ideas: shot-pattern thinking (Scott Fawcett / DECADE-style),
  strokes-gained strategy (Mark Broadie-style). Use as background only.
- Pattern: decision audit and routine proof are the primary work; mechanics
  are carryover in a course-transfer / club-selection branch.
- Red flag: prescribing a swing edit when the actual flaw is a decision /
  club-selection / commitment problem.

## Grading dimensions

For each scenario, score each dimension 0-10 (10 = excellent), then roll up to
`score_0_100` and a pass/fail decision.

| Dim                                  | What we look for                                                                                                          | Hard-fail trigger                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| D1. Branch intent fit                | The chosen branch_intent is the right family for the fault as described in the scenario.                                  | Wrong family entirely (e.g., psychology routed for a ground-force flaw).            |
| D2. Proof T1 alignment               | T1 proof key is the right profile prefix for the intent (gf_/fp_/cl_/pt_/sg_/bn_/eq_/sp_/rd_/cd_/ps_).                    | T1 starts with wrong prefix.                                                        |
| D3. Allowed primary categories       | Primary drill category is one of intent's allowed_categories.                                                              | Primary drill is in a blocked category.                                             |
| D4. Forbidden categories absent      | No drill in forbidden_categories_primary appears as primary.                                                                | Any forbidden primary present.                                                      |
| D5. Session mode                     | Session mode matches `expected_session_mode` (normal / modified_only / stop_refer).                                         | Wrong session mode (especially missing a stop_refer or modified_only when required). |
| D6. Drill diversity                  | No duplicate primary drill_id across blocks; Pump Drill (DR-GRF-004) primary once + carryover only when applicable.        | Pump Drill primary in two blocks.                                                   |
| D7. Cue / language sanity            | No forbidden_language_patterns appear in coach/client outputs if extractable; cues are external + before movement.          | Body-part cue during the rep; "stay positive" / "just relax" coaching.              |
| D8. Equipment / readiness gates      | If `expected_must_pass_first` set (e.g., eq_ab), the harness verifies and the LLM should NOT recommend a swing rebuild.    | Plan prescribes swing rebuild while gate not cleared.                               |
| D9. Expert-pattern coverage          | At least 2/3 of `expected_expert_patterns` are visible in the plan, proof copy, or block instructions.                     | 0/3 expert patterns visible.                                                        |
| D10. Reasonable alternative paths   | If Forefront takes a defensible different path than one named lens, this is a tradeoff note, not a fail.                  | None — this is qualitative.                                                         |

## Output schema (REQUIRED)

The LLM judge MUST return a single JSON object matching this shape. No prose
outside the JSON. The harness will parse this and append it to the report.

```json
{
  "scenario_id": "SC-XX-name",
  "pass": true,
  "score_0_100": 84,
  "severity": "low",
  "issues": [
    { "dimension": "D7", "severity": "low", "detail": "One block instruction uses 'just commit' — borderline forbidden cue language." }
  ],
  "matched_patterns": ["distal cue", "low-point in front of ball"],
  "missing_patterns": ["TPI-style readiness screen result mentioned explicitly"],
  "recommended_config_edits": [
    { "file": "data/alignment-layer.js", "change": "Add a notes line to `equipment_fit` reminding the coach not to author swing-rebuild language until eq_ab passes." }
  ],
  "notes": "Plan matches the ground-force lens; cue language clean; equipment-gate guidance could be louder."
}
```

### Severity scale
- `none` — pass, no issues
- `low` — pass with notes, minor copy or carryover suggestions
- `medium` — pass with caveats, but a specific dimension is borderline
- `high` — fail; one or more hard-fail triggers; config change needed
- `critical` — fail; safety / pain / readiness violation, or expert-lens-wide
  contradiction (e.g., putting block prescribed full-swing drills)

### Score → pass rule
- `pass = true` if `score_0_100 >= 70` AND no `severity` >= `high` in `issues`
- `pass = false` otherwise

## Recommended config-edit format

Each `recommended_config_edits[i]` should point at one of:
- `data/diagnostic-layer.js` (branch override copy)
- `data/alignment-layer.js` (intent → category / gate rules)
- `data/deepening.js` (proof-card copy and link rules)
- `data/drills.js` (drill metadata, gpl_fit, practice_block tags)
- `assets/app.js` (composer logic; only suggest narrow data-level edits)

The harness aggregates these into a "Recommended next config edits" section in
`tests/reports/latest-expert-qa-report.md`.

----- END RUBRIC -----

SCENARIO PACKET (deterministic checks already executed; do NOT re-run them — use them as evidence):
----- BEGIN PACKET -----
{
  "schema_version": "ff-expert-judge-packet/0.1",
  "scenario_id": "SC-07-putting-speed",
  "scenario_title": "Putting speed — distance ladder / tempo, no full-swing tools",
  "rubric_path": "tests/rubrics/expert-rubric.md",
  "rubric_summary": "See tests/rubrics/expert-rubric.md. Score each scenario against 10 lenses; return a single JSON object matching the rubric output schema.",
  "judge_question": "How close is the Forefront Coach Builder output for this scenario to what the listed expert-pattern lenses would broadly recommend? Treat lenses as comparison axes, not verbatim citations. Pain / readiness red gates are absolute.",
  "scenario_fixture": {
    "id": "SC-07-putting-speed",
    "title": "Putting speed — distance ladder / tempo, no full-swing tools",
    "fault_ids": [
      "FAULT-PUTT-SPEED"
    ],
    "branch_ids": {
      "FAULT-PUTT-SPEED": "distance-calibration"
    },
    "gates": {
      "pain": "green",
      "readiness": "green",
      "mobility": "green",
      "contact": "green",
      "stage": "green"
    },
    "client_level": "intermediate",
    "gpl": 3,
    "tools": [
      "sam_puttlab"
    ],
    "selected_drills": [
      "DR-WAR-001",
      "DR-PUT-004",
      "DR-PUT-005",
      "DR-PUT-002"
    ],
    "expected_branch_intents": [
      "putting_speed_control"
    ],
    "expected_t1_profile_prefix": "pt_",
    "expected_primary_categories": [
      "putting",
      "warmup_prep"
    ],
    "forbidden_categories_primary": [
      "full_swing",
      "speed",
      "ground_force",
      "club_face_path",
      "contact_lowpoint",
      "short_game",
      "psychology"
    ],
    "expected_session_mode": "normal",
    "expected_session_blocks": [
      "warmup",
      "block1",
      "block2",
      "retest",
      "reflection"
    ],
    "expected_expert_patterns": [
      "distance-ladder pace",
      "tempo as ratio not absolute",
      "die-it-in-the-hole vs. firm strategy is a separate decision"
    ],
    "forbidden_language_patterns": [
      "accelerate through the ball",
      "head down"
    ],
    "expert_reference_tags": [
      "sieckmann_short_game",
      "short_game_chef_putting",
      "mayo_pace"
    ]
  },
  "extracted_output": {
    "scenario_id": "SC-07-putting-speed",
    "fault_ids": [
      "FAULT-PUTT-SPEED"
    ],
    "branch_ids": {
      "FAULT-PUTT-SPEED": "distance-calibration"
    },
    "intents": [
      "putting_speed_control"
    ],
    "dominant_intent": "putting_speed_control",
    "gates": {
      "pain": "green",
      "readiness": "green",
      "mobility": "green",
      "contact": "green",
      "stage": "green"
    },
    "session_mode": "normal",
    "proof_cards": [
      {
        "fault_id": "FAULT-PUTT-SPEED",
        "branch_id": "distance-calibration",
        "branch_intent": "putting_speed_control",
        "proof_test_ids": [
          "PC-10",
          "PC-11",
          "PC-07"
        ],
        "t1": "pt_distance_ladder",
        "t2": "pt_tempo_map",
        "t3": "pt_pressure_retest",
        "proof_family": "putting"
      }
    ],
    "drill_summary": [
      {
        "drill_id": "DR-WAR-001",
        "category": "warmup_prep",
        "found": true,
        "practice_block": "warmup_prep",
        "name": "TPI Resistance Band Activation (5 movements)"
      },
      {
        "drill_id": "DR-PUT-004",
        "category": "putting",
        "found": true,
        "practice_block": "blocked_acquisition",
        "name": "Face Alignment Mirror"
      },
      {
        "drill_id": "DR-PUT-005",
        "category": "putting",
        "found": true,
        "practice_block": "blocked_acquisition",
        "name": "Double-Ball Impact Roll"
      },
      {
        "drill_id": "DR-PUT-002",
        "category": "putting",
        "found": true,
        "practice_block": "representative_transfer",
        "name": "Lag Ladder Speed Drill"
      }
    ],
    "primary_categories": [
      "putting",
      "warmup_prep"
    ],
    "primary_drill_ids": [
      "DR-PUT-004",
      "DR-PUT-005"
    ],
    "session_blocks": [
      {
        "kind": "warmup",
        "drills": [
          {
            "drill_id": "DR-WAR-001",
            "category": "warmup_prep",
            "carryover": false,
            "note": null
          }
        ]
      },
      {
        "kind": "block1",
        "drills": [
          {
            "drill_id": "DR-PUT-004",
            "category": "putting",
            "carryover": false,
            "note": null
          }
        ]
      },
      {
        "kind": "block2",
        "drills": [
          {
            "drill_id": "DR-PUT-005",
            "category": "putting",
            "carryover": false,
            "note": null
          }
        ]
      },
      {
        "kind": "retest",
        "drills": [
          {
            "drill_id": "DR-PUT-002",
            "category": "putting",
            "carryover": false,
            "note": null
          }
        ]
      },
      {
        "kind": "reflection",
        "drills": []
      }
    ],
    "alignment_record": {
      "allowed_categories": [
        "putting"
      ],
      "carryover_categories": [
        "putting"
      ],
      "blocked_categories": [
        "full_swing",
        "speed",
        "ground_force",
        "club_face_path",
        "contact_lowpoint",
        "short_game",
        "psychology"
      ],
      "preferred_primary_block": "primary",
      "allowed_carryover_blocks": [
        "carryover",
        "retest",
        "reflection"
      ],
      "do_not_use_if": [
        "pain_red"
      ],
      "session_mode": "normal",
      "notes": "Putting speed control — distance ladder / tempo. Not full-swing."
    },
    "filtered_out": []
  },
  "deterministic_checks": [
    {
      "name": "expected_branch_intents_present",
      "ok": true,
      "detail": {
        "expected": [
          "putting_speed_control"
        ],
        "got": [
          "putting_speed_control"
        ]
      }
    },
    {
      "name": "t1_profile_prefix_match",
      "ok": true,
      "detail": {
        "expected_prefix": "pt_",
        "got": "pt_distance_ladder"
      }
    },
    {
      "name": "expected_primary_categories_present",
      "ok": true,
      "detail": {
        "expected_subset": [
          "putting",
          "warmup_prep"
        ],
        "got": [
          "putting",
          "warmup_prep"
        ],
        "session_mode": "normal"
      }
    },
    {
      "name": "forbidden_categories_absent_primary",
      "ok": true,
      "detail": {
        "forbidden": [
          "full_swing",
          "speed",
          "ground_force",
          "club_face_path",
          "contact_lowpoint",
          "short_game",
          "psychology"
        ],
        "hits": []
      }
    },
    {
      "name": "expected_session_mode",
      "ok": true,
      "detail": {
        "expected": "normal",
        "got": "normal"
      }
    },
    {
      "name": "expected_session_blocks_present",
      "ok": true,
      "detail": {
        "expected": [
          "warmup",
          "block1",
          "block2",
          "retest",
          "reflection"
        ],
        "got": [
          "warmup",
          "block1",
          "block2",
          "retest",
          "reflection"
        ]
      }
    },
    {
      "name": "no_duplicate_primary_drills",
      "ok": true,
      "detail": {
        "duplicates": []
      }
    },
    {
      "name": "pump_drill_primary_once",
      "ok": true,
      "detail": {
        "primary_count": 0
      }
    }
  ],
  "deterministic_pass": true
}
----- END PACKET -----

Return ONLY a JSON object matching the rubric output schema. No prose, no markdown, no fenced code block. Just the JSON object.
