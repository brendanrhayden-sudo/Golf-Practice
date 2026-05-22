/* =============================================================================
   Forefront Golf — Diagnostic Layer Expansion
   -----------------------------------------------------------------------------
   Loads AFTER data/deepening.js. Adds:
     · FF_TECHNOLOGY_SIGNS    — what each tool/mode can / cannot prove
     · FF_PROOF_TEST_ARCHETYPES — 14 PC-* archetypes (Setup | Protocol | Pass | Fail | Use-Result)
     · FF_FALSE_POSITIVES     — masquerade map per fault id
     · FF_SESSION_IMPLICATIONS — block-level session ordering / cue / RLU rules
     · FF_GATES_RICH          — red / yellow gate copy + session implication
     · FF_FAULT_RELATIONSHIPS — inter-fault masquerade table

   Then enriches existing FF_DIAGNOSTIC_BRANCHES entries with:
     branch.technology_signs   {trackman, hackmotion, force_plate, video, gears, sam_puttlab}
     branch.false_positives    [strings]
     branch.session_implication {motor_learning_phase, sleep_required, cue_type, max_rlu, ...}
     branch.proof_test_ids     [PC-IDs]
     branch.evidence_flag      enum
     branch.coach_review_required bool

   Citations preserved as source_tags; full URLs live in research report.
   All cards default-tagged `review_required` so a coach validates before
   production use. No localStorage / sessionStorage / IndexedDB / cookies / DB writes.
============================================================================= */
(function () {
  const REVIEW = "review_required";

  /* ---------------------------------------------------------------------------
     1. Technology signs registry — keyed by tool/mode id.
        Each entry: can_prove, cannot_prove, best_block, misuse_risk,
        thresholds, source_tags, review_required.
        Source URLs documented inline in research report sections 6.1-6.5.
  --------------------------------------------------------------------------- */
  window.FF_TECHNOLOGY_SIGNS = {
    // ---------- TrackMan modes ----------
    "trackman_shot_analysis": {
      label: "TrackMan Shot Analysis",
      can_prove: "Face angle, club path, F2P, attack angle, dynamic loft, spin loft, low point, impact location at impact — single shot or cluster.",
      cannot_prove: "Cause of any metric deviation (face/path/AoA root cause requires HackMotion, video, force plates, GEARS, or setup A/B).",
      best_block: "warmup_prep / proof_test / blocked_acquisition (feedback every shot)",
      misuse_risk: "Treating TrackMan metric value as the cause. A 5° open face is a symptom; grip / lie / face-fear / aim could each produce it.",
      thresholds: {
        face_angle_open_deg: "> +3 = consistent open face contributor",
        face_to_path_deg: "> +3 slice spin; < -3 hook spin; ±2 ≈ straight",
        attack_angle_driver_deg: "+2 to +5 ideal; below 0 = bullet/distance loss risk",
        attack_angle_iron_deg: "-4 to -2 typical; below -6 = steep concern",
        spin_axis_deg: "> +10 visible slice; < -10 visible hook",
        consistency_sd: "SD > 3 across multiple metrics = contact chaos — not ready to diagnose"
      },
      source_tags: ["TrackMan ultimate guide", "GOLF-KB"],
      review_required: false
    },
    "trackman_corridors": {
      label: "TrackMan Corridors",
      can_prove: "Start direction tolerance, curve corridor pass/fail under blocked or serial conditions.",
      cannot_prove: "Why a shot exits the corridor — face, path, aim, contact, readiness, or decision can each cause exits.",
      best_block: "serial_variability / random_variability (corridor as constraint, not feedback metric)",
      misuse_risk: "Using corridor pass rate as a swing-quality score without separating face vs path cause.",
      thresholds: { pass_rate_random: ">= 65–70% = challenge point intact (Guadagnoli & Lee)" },
      source_tags: ["TrackMan", "ML"],
      review_required: false
    },
    "trackman_performance_center": {
      label: "TrackMan Performance Center",
      can_prove: "Skill score against TrackMan benchmarks across shot categories; gapping; carry distances.",
      cannot_prove: "Cause branch behind a low skill score (score = outcome, not mechanism).",
      best_block: "random_variability / representative_transfer / maintenance_retest",
      misuse_risk: "Running PC sessions to diagnose — PC is benchmark practice, not cause isolation.",
      thresholds: { combine_intervals: "Once per mesocycle (MN1 start, MN2 start); not every session" },
      source_tags: ["TrackMan", "GOLF-KB"],
      review_required: false
    },
    "trackman_combine": {
      label: "TrackMan Combine / Test Center",
      can_prove: "60-shot structured benchmark across distances; baseline number for handicap range.",
      cannot_prove: "Daily diagnostic — too many shots, averages obscure individual swing cause.",
      best_block: "maintenance_retest (mesocycle bookend, not weekly)",
      misuse_risk: "Treating Combine score as a diagnostic. It benchmarks, it does not isolate cause.",
      thresholds: { distance_sd_yds: "SD < 5 yards per club = consistent gapping" },
      source_tags: ["TrackMan", "GOLF-KB", REVIEW],
      review_required: true
    },
    "trackman_optimizer": {
      label: "TrackMan Optimizer",
      can_prove: "Optimal launch conditions for the player's current club speed; what is possible if launch is matched.",
      cannot_prove: "Whether to fix setup vs swing to reach those launch conditions.",
      best_block: "warmup_prep / equipment fitting referral / setup A-B",
      misuse_risk: "Reading Optimizer as a swing prescription — it shows endpoint, not path.",
      thresholds: { driver_dynamic_loft_deg: "~11–16° depending on speed" },
      source_tags: ["TrackMan", "GOLF-KB"],
      review_required: false
    },
    "trackman_3d": {
      label: "TrackMan 3D / AI Motion",
      can_prove: "Shaft deflection, body segment positions, full club + body 3D when available.",
      cannot_prove: "Cause of any 3D pattern in isolation — requires kinematic-sequence interpretation by qualified coach.",
      best_block: "proof_test / advanced acquisition (qualified 3D coach)",
      misuse_risk: "Sharing raw 3D data with player or feeding it directly into a drill block.",
      thresholds: { exact_thresholds: "[REVIEW] Specific 3D thresholds require Brendan validation with 3D coach" },
      source_tags: ["TrackMan", REVIEW],
      review_required: true
    },
    "trackman_speed_training": {
      label: "TrackMan Speed Training",
      can_prove: "Current session club speed vs baseline; readiness drop; overspeed protocol completion.",
      cannot_prove: "Whether the speed ceiling is sequencing, mobility, or strength limited.",
      best_block: "warmup_prep (readiness check) or dedicated speed session — NEVER same block as acquisition",
      misuse_risk: "Stacking overspeed inside a swing-change session — competing motor pattern, contaminates consolidation.",
      thresholds: { readiness_pass: "within 3% of baseline = green; >5% below = yellow gate" },
      source_tags: ["IKB Mach 3", "ML", REVIEW],
      review_required: true
    },
    "trackman_putting": {
      label: "TrackMan Putting Analysis",
      can_prove: "Face angle, path, tempo at impact for putting; start-line direction.",
      cannot_prove: "Green read accuracy, green speed, or whether a miss is a stroke vs read fault.",
      best_block: "proof_test (start-line gate) / blocked_acquisition (face control)",
      misuse_risk: "Using putting data without verifying aim on a flat putt first — read errors mimic stroke errors.",
      thresholds: { tempo_ratio: "Backswing:downswing roughly 2:1 (varies per player)" },
      source_tags: ["TrackMan", "SAM PuttLab cross-reference"],
      review_required: false
    },
    "trackman_on_course": {
      label: "TrackMan On Course / Virtual Golf",
      can_prove: "Decision quality, club selection, target selection under representative conditions.",
      cannot_prove: "Swing mechanics with the same precision as range mode — measurement gets noisier away from impact zone.",
      best_block: "representative_transfer / pressure_scoring",
      misuse_risk: "Running technical acquisition inside Virtual Golf — wrong block, wrong feedback schedule.",
      thresholds: {},
      source_tags: ["TrackMan", "ML"],
      review_required: false
    },

    // ---------- HackMotion ----------
    "hackmotion": {
      label: "HackMotion (lead wrist sensor)",
      can_prove: "Lead wrist extension/flexion at P1–P10; cast confirmed when impact extension > setup extension; flip confirmed when wrist extends through impact.",
      cannot_prove: "Why the wrist is in that position — could be grip, face-fear, sequencing, or body stop.",
      best_block: "proof_test (acquisition baseline) / blocked_acquisition (feedback fading)",
      misuse_risk: "Prescribing wrist drills without first ruling out face/grip/body cause. Technology dependency if not faded by serial block.",
      thresholds: {
        top_position: "Neutral / slightly flexed at top",
        impact_relative: "15–30° more flexed at impact vs setup is the elite window",
        cast_confirmed: "Impact extension > setup extension"
      },
      source_tags: ["HackMotion lead wrist", "HackMotion Tyler Ferrell", "ML"],
      review_required: false
    },

    // ---------- Force / pressure plates ----------
    "force_plate": {
      label: "Force / Pressure Plate (Boditrak, AMTI, Meloq, Swing Catalyst)",
      can_prove: "Pressure shift timing, vertical force application, lead-side braking peak post-impact, trail vs lead asymmetry.",
      cannot_prove: "Cause of GRF pattern (mobility, fear, cue, or sequencing can each produce the same trace).",
      best_block: "proof_test (ground force / lead-brake / spin-out) — early in session",
      misuse_risk: "Prescribing GRF drills before ruling out mobility (TPI screen) or coaching-cue history (\"shift your weight\").",
      thresholds: {
        lead_vertical_peak: "Lead vertical force peak post-impact = adequate braking present",
        no_peak: "Absent braking peak = spin-out / no-brake risk [REVIEW exact thresholds]"
      },
      source_tags: ["force plates research", "GOLF-KB", REVIEW],
      review_required: true
    },

    // ---------- GEARS ----------
    "gears": {
      label: "GEARS 3D Full Body + Club",
      can_prove: "Kinematic sequence (pelvis → thorax → arm → club velocity peaks); sway/slide/spin-out in 3D; shaft deflection; shoulder turn.",
      cannot_prove: "Why kinematic sequence is disrupted — physical vs technical vs attention cause requires further screen.",
      best_block: "proof_test (advanced) / before-and-after swing-change comparison",
      misuse_risk: "Raw GEARS data without qualified-coach interpretation is not actionable.",
      thresholds: { exact_timings: "[REVIEW] velocity thresholds require qualified 3D coach validation" },
      source_tags: ["GEARS sports", REVIEW],
      review_required: true
    },

    // ---------- Video ----------
    "video": {
      label: "Video (face-on / down-the-line)",
      can_prove: "Spine angle change (early extension proxy), OTT path direction in transition, club head vs hands position, lead arm post-impact, approximate low point.",
      cannot_prove: "Exact degree measurements (TrackMan / GEARS required); cause (mobility vs technical) requires TPI screen.",
      best_block: "proof_test / blocked_acquisition (slow-motion review)",
      misuse_risk: "Treating visual estimate as a metric. Video alone cannot separate physical from technical cause.",
      thresholds: { capture_rate: "Minimum 120 fps for impact zone; 240+ preferred" },
      source_tags: ["GOLF-KB"],
      review_required: false
    },

    // ---------- Putting tools ----------
    "sam_puttlab": {
      label: "SAM PuttLab / PuttStudio",
      can_prove: "Face angle at impact, path, tempo, backswing length, start-line deviation for putting.",
      cannot_prove: "Green read accuracy; whether the miss is read vs stroke (verify on a flat putt first).",
      best_block: "proof_test (start-line gate) / blocked_acquisition (face control)",
      misuse_risk: "Using path/tempo data without verifying aim independently first; aim mismatch causes start-line errors that look like stroke errors.",
      thresholds: { tempo_ratio: "Backswing:downswing roughly 2:1 (player-dependent)" },
      source_tags: ["SAM PuttLab", REVIEW],
      review_required: true
    },

    // ---------- Equipment ----------
    "equipment_ab": {
      label: "Equipment / Fitting A-B Test",
      can_prove: "Whether the fault is created by lie angle, length, shaft profile, grip size, or loft setting — by changing ONE variable and comparing 10-shot clusters.",
      cannot_prove: "Optimal final fit (that requires full fitting session); root cause when player adapts mid-test.",
      best_block: "proof_test (PC-08) before any swing prescription when equipment cause is plausible.",
      misuse_risk: "Changing multiple variables at once; fitting during fatigue or new swing install.",
      thresholds: { cluster_size: "Minimum 10 shots each condition; impact-location change is the cleanest signal" },
      source_tags: ["GOLFTEC lie angle", "GOLF-KB"],
      review_required: false
    },

    // ---------- Mach 3 / speed protocols ----------
    "mach3_tools": {
      label: "Mach 3 / Speed Sticks / Overspeed",
      can_prove: "Stimulus delivery for overspeed adaptation; weighted/lighted contrast.",
      cannot_prove: "Whether the player is recovered enough to absorb the stimulus (separate readiness check required).",
      best_block: "Dedicated speed session OR warmup_prep stimulus — NEVER same block as acquisition.",
      misuse_risk: "Stacking with technical change in the same session; ignoring readiness gate.",
      thresholds: { readiness_gate: "PC-09 pass required before max-intent reps" },
      source_tags: ["IKB Mach 3", REVIEW],
      review_required: true
    }
  };

  /* ---------------------------------------------------------------------------
     2. Proof-test archetypes (PC-01 → PC-14). Schema mirrors research §7.
  --------------------------------------------------------------------------- */
  window.FF_PROOF_TEST_ARCHETYPES = {
    "PC-01": {
      id: "PC-01",
      title: "Station / Constrained Rehearsal",
      objective: "Confirm whether the body can achieve the suspected position at low cost before drilling.",
      setup: "No ball or foam ball; specific position constraint (alignment stick gate, headcover, training aid).",
      protocol: "10 slow-motion or half-swing rehearsal reps targeting the suspected cause position. Coach or player confirms body/club position at the checkpoint.",
      pass_criteria: "Target position consistently attained in ≥ 7/10 reps.",
      fail_action: "Cannot achieve position at slow speed — activate physical screen before drill prescription.",
      use_result: "Pass → technical fault confirmed (body can do it, just not at full speed). Fail → physical limitation suspected.",
      best_block: "proof_test",
      source_tags: ["GOLF-KB"]
    },
    "PC-02": {
      id: "PC-02",
      title: "Environmental Lie / Setup A-B",
      objective: "Rule out setup or single equipment variable before drilling the swing.",
      setup: "Identical shot from identical lie; change only one setup or equipment variable (ball position, tee height, grip pressure, stance width).",
      protocol: "5 shots standard, then 5 shots with the single change. Compare ball flight, contact, and trajectory.",
      pass_criteria: "Ball flight meaningfully changes with the setup/equipment variable alone.",
      fail_action: "No meaningful change — fault persists regardless of the variable change.",
      use_result: "Pass → setup/equipment cause confirmed; fix the variable, do not drill swing. Fail → swing-mechanics cause more likely.",
      best_block: "proof_test",
      source_tags: ["GOLF-KB", "GOLFTEC lie angle"]
    },
    "PC-03": {
      id: "PC-03",
      title: "Ball-Flight Corridor",
      objective: "Low-cost separation of directional fault (one-side bias) from contact chaos (random).",
      setup: "Two alignment sticks or visual markers creating a corridor (e.g., 10 yards wide at 50 yards).",
      protocol: "10 shots with intent to land within the corridor. Note starting direction, curvature, and shape.",
      pass_criteria: "≥ 7/10 shots land within corridor with a consistent shape.",
      fail_action: "Random or one-side-dominant exits — define which exit pattern dominates.",
      use_result: "Consistent fail to one side → face/path dominant cause confirmed. Random fail → low-point / readiness / multiple causes; activate gate before deeper diagnosis.",
      best_block: "proof_test",
      source_tags: ["GOLF-KB"]
    },
    "PC-04": {
      id: "PC-04",
      title: "Strike Map",
      objective: "Locate the contact pattern on the face before any directional or distance diagnosis.",
      setup: "Impact tape, Dr. Scholl's foot spray, or chalk on the face before the shot.",
      protocol: "10 shots from a consistent setup. Map the contact location pattern.",
      pass_criteria: "≥ 7/10 contacts within 10mm of center face.",
      fail_action: "Consistent pattern off-center (heel, toe, high, low) OR random scatter across the face.",
      use_result: "Heel → distance/length; Toe → standing too far; Low → AoA or tee height; High → upswing on irons / tee too high driver; Scatter → contact chaos, readiness gate before drill.",
      best_block: "proof_test",
      source_tags: ["GOLF-KB"]
    },
    "PC-05": {
      id: "PC-05",
      title: "TrackMan Metric Screen",
      objective: "Confirm a sustained metric deviation before mapping it to a cause branch.",
      setup: "TrackMan active; player hits 10 balls with no coaching or cue intervention. Record raw data.",
      protocol: "After 10 balls, review face angle, club path, F2P, attack angle, dynamic loft, spin loft, impact location. Note consistency (SD) per metric.",
      pass_criteria: "Two or more consecutive metrics outside the diagnostic threshold consistently (e.g., face angle +5° open on ≥ 7/10 OR F2P +4° on ≥ 7/10).",
      fail_action: "Metrics inside thresholds OR highly variable — not ready to diagnose; readiness gate.",
      use_result: "Pass → map consistent metric pattern to cause branch. Fail (inconsistent) → no drill prescription this session; readiness or PC-04 first.",
      best_block: "proof_test",
      source_tags: ["TrackMan", "GOLF-KB"]
    },
    "PC-06": {
      id: "PC-06",
      title: "TrackMan 3D / Video Screen",
      objective: "Confirm a position-specific deviation across multiple swings at a defined checkpoint.",
      setup: "Down-the-line + face-on video; TrackMan 3D / GEARS if available.",
      protocol: "Record 5–10 swings at moderate speed. Review at P3 (top), P4 (transition), P5 (parallel down), P6 (impact), P7 (follow-through).",
      pass_criteria: "Same position deviation visible at the same checkpoint across ≥ 4/5 swings.",
      fail_action: "No consistent position deviation OR position changes shot to shot.",
      use_result: "Pass → position-specific fault confirmed; map to cause branch + drill. Fail → readiness or multiple competing faults; re-examine.",
      best_block: "proof_test",
      source_tags: ["GOLF-KB", REVIEW]
    },
    "PC-07": {
      id: "PC-07",
      title: "Pressure / Decision Test",
      objective: "Determine whether the fault is technical or reveals only under pressure / consequence.",
      setup: "Same shot type the player has been practicing. Apply consequence (score, game, real target with peer present).",
      protocol: "5 shots no-pressure vs 5 shots same shot with pressure added. Compare outcomes and reported attention focus.",
      pass_criteria: "Pass (pressure reveals fault) — fault appears only under pressure that was absent in no-pressure block.",
      fail_action: "Performance similar in both conditions — pressure is not the variable.",
      use_result: "Pass → pattern survives practice but not pressure; activate pressure protocol (Think Box / Play Box, pre-shot routine); do not add new swing change. Fail → fault is either technical or doesn't exist (cross-check PC-03).",
      best_block: "pressure_scoring",
      source_tags: ["Vision54", "ML"]
    },
    "PC-08": {
      id: "PC-08",
      title: "Equipment A-B Test",
      objective: "Confirm equipment as the cause before any swing prescription.",
      setup: "Player's current equipment vs adjusted/alternative (lie, shaft, grip size, length).",
      protocol: "10 shots current, 10 shots changed variable. TrackMan impact location + ball flight before vs after.",
      pass_criteria: "Impact location or ball flight meaningfully improved with equipment change alone.",
      fail_action: "No meaningful change — equipment is not the cause.",
      use_result: "Pass → flag for fitting referral; do NOT prescribe swing drills until equipment is corrected. Fail → proceed with swing diagnostic.",
      best_block: "proof_test",
      source_tags: ["GOLFTEC", "GOLF-KB"]
    },
    "PC-09": {
      id: "PC-09",
      title: "Speed-Readiness Test",
      objective: "Confirm the player is recovered enough to absorb speed or technical work today.",
      setup: "Player's baseline club speed known (TrackMan); current session speed measured before any drill.",
      protocol: "5 swings at max effort; compare to baseline.",
      pass_criteria: "Within 3% of baseline (fatigue/readiness acceptable).",
      fail_action: ">5% below baseline — yellow gate.",
      use_result: "Pass → speed-focused work / overspeed can proceed. Fail → no overspeed or max-intent; redirect to maintenance, short game, or putting.",
      best_block: "warmup_prep",
      source_tags: ["IKB Mach 3", "ML", REVIEW]
    },
    "PC-10": {
      id: "PC-10",
      title: "Putting Gate / Start-Line",
      objective: "Isolate face vs path vs aim as the start-line driver before broader putting work.",
      setup: "Two tee gates 2 inches in front of ball, slightly wider than putter head.",
      protocol: "20 putts from 6 feet on a flat surface; count clean gate exits.",
      pass_criteria: "≥ 16/20 exit cleanly through the gate.",
      fail_action: "Consistent miss to one side OR alternating misses.",
      use_result: "Consistent left → face open; consistent right → face closed; alternating → aim or path. Confirm before any green-reading work.",
      best_block: "proof_test",
      source_tags: ["SAM PuttLab", "GOLF-KB"]
    },
    "PC-11": {
      id: "PC-11",
      title: "Distance Ladder",
      objective: "Confirm whether distance chaos is a system absence or a swing fault.",
      setup: "Markers at fixed distances (50/75/100 yd for wedges; 3/6/10/15/20/30 ft for putting).",
      protocol: "10 shots to each distance; record carry average and SD.",
      pass_criteria: "Wedge SD < 5 yards / putting SD < 2 ft per station.",
      fail_action: "Wedge SD ≥ 8 yards OR putting SD ≥ 3 ft OR missing a distance category consistently.",
      use_result: "Distance gap confirmed → club gapping fault or absence of distance system. Speed inconsistency → tempo / contact fault.",
      best_block: "proof_test",
      source_tags: ["GOLF-KB"]
    },
    "PC-12": {
      id: "PC-12",
      title: "Bunker Entry",
      objective: "Confirm sand entry pattern before bunker technique prescription.",
      setup: "Greenside bunker, normal sand depth. Player marks a spot 2 inches behind the ball.",
      protocol: "10 bunker shots; note where the club enters the sand (behind mark = too early; on / ahead = correct entry).",
      pass_criteria: "Entry within 1 inch of mark ≥ 7/10.",
      fail_action: "Consistent dig (too steep), blade (too shallow / face not open), OR inconsistent.",
      use_result: "Dig → steeper angle / face less open; Blade → too shallow / face needs opening; Inconsistent → no system. Sand condition (wet vs dry) modifies prescription.",
      best_block: "proof_test",
      source_tags: ["GOLF-KB"]
    },
    "PC-13": {
      id: "PC-13",
      title: "Short-Game Landing Window",
      objective: "Validate distance / trajectory system on chips and pitches before stroke-level change.",
      setup: "Landing window marked at the correct zone (e.g., 3 ft past fringe for run-out chip). Player chipping to the window.",
      protocol: "20 chips; count landings inside the window.",
      pass_criteria: "≥ 14/20 land inside the window.",
      fail_action: "Consistent undershoot (heavy), overshoot (thin or too hard), OR wide scatter.",
      use_result: "Confirms distance-system accuracy before green-speed adjustment; confirms ball-first contact requirement for chip vs pitch distinction.",
      best_block: "proof_test",
      source_tags: ["GOLF-KB"]
    },
    "PC-14": {
      id: "PC-14",
      title: "On-Course Decision Audit",
      objective: "Separate decision errors from execution errors before assigning swing work.",
      setup: "Scorecard + shot notes from a round (18 or 9 holes). Note: club selected, target, risk/reward decision, outcome.",
      protocol: "Post-round score each tee shot / approach 1–5 (1 = aggressive / ego select; 5 = optimal miss-management).",
      pass_criteria: "Average decision score ≥ 3.5; zero penalty strokes from aggressive/ego decisions.",
      fail_action: "Average < 3 OR ≥ 2 penalty strokes from decision errors (not execution).",
      use_result: "Confirms course-management as primary lever; session shifts from swing work to representative practice + decision simulation.",
      best_block: "reflection / representative_transfer",
      source_tags: ["Broadie SG", "GOLF-KB"]
    }
  };

  /* ---------------------------------------------------------------------------
     3. False positives registry — keyed by fault id.
        Each entry: array of {masquerades_as, rule_out_first, source}
  --------------------------------------------------------------------------- */
  window.FF_FALSE_POSITIVES = {
    "FAULT-SLICE": [
      { masquerades_as: "Out-to-in path fault", rule_out_first: "Aim alignment — body aimed left forces compensatory OTT in 30–40% of apparent OTT cases", source: "GOLF-KB" },
      { masquerades_as: "Open face technical fault", rule_out_first: "Upright lie angle (flat-soled fitting test or impact tape) — face delivers open without any swing change", source: "GOLFTEC lie angle" },
      { masquerades_as: "Weak grip habit", rule_out_first: "Recent coaching cue — \"hold off the release\" can produce the same outcome", source: "GOLF-KB" }
    ],
    "FAULT-PUSH-SLICE": [
      { masquerades_as: "Standard slice with same drill stack", rule_out_first: "Path direction — push-slice has positive (in-to-out) path; standard slice has negative path. Different drill prescription.", source: "TrackMan" },
      { masquerades_as: "Block", rule_out_first: "F2P sign — push-slice has F2P open AND starts right; block has F2P open but path more positive without late curve", source: "GOLF-KB" }
    ],
    "FAULT-HOOK": [
      { masquerades_as: "Strong grip", rule_out_first: "Flat lie angle test — flat lie makes face point left at impact without any grip change", source: "GOLFTEC lie angle" },
      { masquerades_as: "Closed face technical", rule_out_first: "Equipment A/B before any grip or face drill", source: "GOLF-KB" }
    ],
    "FAULT-PULL": [
      { masquerades_as: "Out-to-in path fault", rule_out_first: "Aim — aim left produces a straight ball going left with no swing fault at all", source: "GOLF-KB" }
    ],
    "FAULT-PUSH": [
      { masquerades_as: "In-to-out path fault", rule_out_first: "Aim right produces a straight ball going right with no swing fault", source: "GOLF-KB" }
    ],
    "FAULT-BLOCK": [
      { masquerades_as: "Push (similar right miss)", rule_out_first: "Path direction (push has F2P ≈ 0; block has F2P open and path also positive)", source: "TrackMan" },
      { masquerades_as: "Hang-back / GRF issue", rule_out_first: "Force plate — confirm trail-side pressure retention before prescribing release drill", source: "force plates research" }
    ],
    "FAULT-TOP": [
      { masquerades_as: "Early extension (technical)", rule_out_first: "TPI overhead deep squat / toe-touch — failed mobility = physical cause, not technical", source: "TPI early extension" },
      { masquerades_as: "Sway-recovery thin", rule_out_first: "Force plate pressure trace — trail-side pressure at impact looks identical to early-extension top", source: "GOLF-KB" }
    ],
    "FAULT-CHUNK": [
      { masquerades_as: "Trail-side hang-back", rule_out_first: "Force plate pressure shift — fat can come from low-point or from no recenter, different drill prescriptions", source: "force plates research" },
      { masquerades_as: "Shank-adjacent fat near heel", rule_out_first: "Impact tape — verify heel vs ball-center contact before low-point drill", source: "GOLF-KB" }
    ],
    "FAULT-THIN": [
      { masquerades_as: "Top (different cause)", rule_out_first: "Low-point direction — thin = past ball; top = rising at ball. Different drill family.", source: "GOLF-KB" }
    ],
    "FAULT-SHANK": [
      { masquerades_as: "Heel strike (different cause)", rule_out_first: "Impact tape — shank is hosel; heel is face edge. Hosel = OTT or distance issue; heel = length or path issue.", source: "GOLF-KB" },
      { masquerades_as: "Anxiety pattern (psych)", rule_out_first: "Does it disappear in no-ball or no-target practice? If yes → psychological gate before any swing drill", source: "GOLF-KB" }
    ],
    "FAULT-TOE-STRIKE": [
      { masquerades_as: "Path / swing-plane fault", rule_out_first: "Setup distance + club length — systematic toe strike often = club too short for arm length", source: "GOLF-KB", review: REVIEW }
    ],
    "FAULT-HEEL-STRIKE": [
      { masquerades_as: "OTT path fault", rule_out_first: "Club length A-B test — too long = systematic heel strike", source: "GOLF-KB" }
    ],
    "FAULT-CAST": [
      { masquerades_as: "Open face compensation", rule_out_first: "Face direction first — if F2P open, the cast is a compensation. Fix face, the cast often resolves.", source: "HackMotion" }
    ],
    "FAULT-CHICKEN-WING": [
      { masquerades_as: "Lead-arm rotation deficit", rule_out_first: "Body rotation at P7 — if hips stop, arm collapses without any arm-rotation fault", source: "GOLF-KB" }
    ],
    "FAULT-EARLY-EXT": [
      { masquerades_as: "Technical pelvis thrust", rule_out_first: "TPI overhead deep squat + single-leg balance — failed mobility = 6× early-extension risk; mobility before any rotation drill", source: "TPI early extension PubMed" }
    ],
    "FAULT-SWAY": [
      { masquerades_as: "Hip IR mobility restriction", rule_out_first: "Hip IR ROM screen + recent coaching cue audit — \"shift your weight\" cue historically causes sway", source: "GOLF-KB" }
    ],
    "FAULT-SLIDE": [
      { masquerades_as: "Normal lead-side pressure shift", rule_out_first: "Some lead-ward movement is correct — only slide without rotation is the fault", source: "GOLF-KB" }
    ],
    "FAULT-HANG-BACK": [
      { masquerades_as: "Early extension top", rule_out_first: "Force plate GRF trace differentiates — hang-back has trail-side pressure dominance at impact", source: "force plates research" }
    ],
    "FAULT-SPIN-OUT": [
      { masquerades_as: "Fast hip turn (looks similar)", rule_out_first: "Kinematic sequence screen — spin-out = hips peak before thorax/arm, fast turn alone is not the fault", source: "GEARS sports", review: REVIEW }
    ],
    "FAULT-LOSS-POSTURE": [
      { masquerades_as: "Early extension (same TPI screen)", rule_out_first: "TPI mobility screen first", source: "TPI" }
    ],
    "FAULT-DOUBLE-CROSS": [
      { masquerades_as: "Technical face control fault", rule_out_first: "Pressure / commitment audit — does it appear only when attempting a fade under consequence? Psychological event, not a new swing issue.", source: "GOLF-KB" }
    ],
    "FAULT-BALLOON": [
      { masquerades_as: "Pure spin loft swing fault", rule_out_first: "Tee height + ball position + shaft profile (whippy shaft) — equipment A/B first", source: "GOLF-KB" }
    ],
    "FAULT-LOW-BULLET": [
      { masquerades_as: "Negative attack angle swing fault", rule_out_first: "Ball position + tee height A-B — setup correction first; swing diagnosis only if setup fix fails", source: "GOLF-KB" }
    ],
    "FAULT-SKYBALL": [
      { masquerades_as: "Lunge / spine-extension swing fault", rule_out_first: "Tee height — fastest single-variable fix; swing diagnosis only if tee fix fails", source: "GOLF-KB" }
    ],
    "FAULT-NUMBER-CHASE": [
      { masquerades_as: "Technical inconsistency", rule_out_first: "No-screen prediction set — if performance improves with data removed, the fault is feedback dependency, not swing", source: "ML" }
    ],
    "FAULT-FREEZE-BALL": [
      { masquerades_as: "Technical fault", rule_out_first: "Same shot under time limit vs no time limit — freeze is attention/psych, not swing", source: "ML" }
    ],
    "FAULT-TEMPO-RUSH": [
      { masquerades_as: "Technical sequencing fault", rule_out_first: "Readiness / fatigue gate — fatigue produces tempo rush without any technical change", source: "ML" }
    ],
    "FAULT-AIM-MISMATCH": [
      { masquerades_as: "Path fault (OTT or in-to-out)", rule_out_first: "Alignment station — verify aim before any path diagnosis. Largest single source of false-positive path faults.", source: "GOLF-KB" }
    ],
    "FAULT-IRON-SPEC-MISMATCH": [
      { masquerades_as: "Heel/toe contact swing fault", rule_out_first: "Lie tape / impact board + length check — most missed diagnosis in recreational coaching", source: "GOLFTEC lie angle" }
    ],
    "FAULT-DRIVER-SETUP-MISMATCH": [
      { masquerades_as: "Driver swing fault", rule_out_first: "Ball position + tee height A-B + Optimizer cluster before any swing change", source: "GOLF-KB" }
    ],
    "FAULT-EQUIP-LIE-LOFT": [
      { masquerades_as: "Face/path swing fault", rule_out_first: "Lie tape + A/B equipment test — equipment can produce face-open or face-closed without any swing fault", source: "GOLFTEC lie angle" }
    ],
    "FAULT-PUTT-STARTLINE": [
      { masquerades_as: "Stroke path fault", rule_out_first: "Aim mismatch on a flat putt — verify aim before any stroke diagnosis. Face is ~80%+ of start-line.", source: "SAM PuttLab" }
    ],
    "FAULT-PUTT-SPEED": [
      { masquerades_as: "Stroke tempo fault", rule_out_first: "Misread — on a flat putt the speed system is isolated; on a breaking putt, read errors mimic stroke errors", source: "GOLF-KB" }
    ],
    "FAULT-PUTT-PRESSURE": [
      { masquerades_as: "Yips (neurological)", rule_out_first: "Does the fault disappear in 0-pressure practice? Yes → psychological. No → escalate for neurological consult.", source: "GOLF-KB" }
    ],
    "FAULT-SHORTGAME-DISTANCE": [
      { masquerades_as: "Technique fault", rule_out_first: "Distance-ladder PC-11 — if SD is small but distance is wrong, it is a system / gapping issue, not technique", source: "GOLF-KB" }
    ],
    "FAULT-BUNKER-ENTRY": [
      { masquerades_as: "Single technique fault", rule_out_first: "Sand condition (wet vs dry) — different sand requires different technique; identify condition before diagnosis", source: "GOLF-KB" }
    ],
    "FAULT-POOR-PSR": [
      { masquerades_as: "Technical fault", rule_out_first: "Pressure / no-pressure contrast (PC-07) — if pattern survives random but collapses under pressure, it is a routine/PSR issue", source: "Vision54" }
    ],
    "FAULT-COURSE-TRANSFER": [
      { masquerades_as: "Swing fault on the course", rule_out_first: "Decision audit (PC-14) — penalty strokes from aggressive decisions are NOT swing faults", source: "Broadie SG" }
    ],
    "FAULT-READINESS-RED": [
      { masquerades_as: "Sudden technical regression", rule_out_first: "Sleep / RPE / pain check first — readiness drop produces 3–5% speed loss + technique noise without any swing change", source: "Sleep consolidation PubMed" }
    ],
    "FAULT-WEAK-SMASH": [
      { masquerades_as: "Speed deficit (swing-speed fault)", rule_out_first: "Strike map first — off-center contact loses ~2% ball speed per 10mm, looks like a speed problem", source: "GOLF-KB" }
    ]
  };

  /* ---------------------------------------------------------------------------
     4. Session implications by cause lane / category.
        Once a branch is confirmed via proof test, this drives session ordering.
  --------------------------------------------------------------------------- */
  window.FF_SESSION_IMPLICATIONS = {
    "club_face_path": {
      lane_label: "Face / Path / Strike",
      motor_learning_phase: "acquisition",
      sleep_required: true,
      contamination_window_hours: 6,
      cue_type: "external",
      max_rlu_per_day: 18,
      feedback_schedule: "every_shot_blocked_then_faded",
      block_order: ["warmup_prep", "proof_test", "blocked_acquisition", "serial_variability", "random_variability", "representative_transfer", "retest", "reflection"],
      pressure_unlock_rule: "Random block pass rate ≥ 65% required before pressure_scoring",
      session_note: "Face changes are acquisition-grade. Cap RLU at 18 per IKB; sleep consolidation rule applies before next session.",
      source_tags: ["IKB acquisition_RLU_18", "ML"]
    },
    "contact_lowpoint": {
      lane_label: "Contact / Low Point",
      motor_learning_phase: "acquisition",
      sleep_required: true,
      contamination_window_hours: 6,
      cue_type: "external",
      max_rlu_per_day: 18,
      feedback_schedule: "every_shot_blocked_then_faded",
      block_order: ["warmup_prep", "proof_test", "blocked_acquisition", "serial_variability", "random_variability", "representative_transfer", "retest", "reflection"],
      pressure_unlock_rule: "Strike pattern must be stable in random before pressure block",
      session_note: "Run PC-04 strike map before any direction drill. Low-point sits beneath face/path diagnostics.",
      source_tags: ["ML", "GOLF-KB"]
    },
    "ground_force": {
      lane_label: "Ground Force / GRF",
      motor_learning_phase: "acquisition",
      sleep_required: true,
      contamination_window_hours: 6,
      cue_type: "external",
      max_rlu_per_day: 14,
      feedback_schedule: "every_shot_with_force_plate_then_faded",
      block_order: ["warmup_prep", "proof_test_force_plate", "blocked_acquisition", "serial_variability", "representative_transfer", "retest"],
      pressure_unlock_rule: "Pressure block deferred until GRF pattern survives random for 2 sessions",
      session_note: "Mobility screen (TPI) before any GRF drill — physical cause masquerades as technical hang-back / sway / slide.",
      source_tags: ["force plates research", "TPI", "ML"]
    },
    "speed": {
      lane_label: "Speed / Power",
      motor_learning_phase: "physical / contextual",
      sleep_required: false,
      contamination_window_hours: 0,
      cue_type: "external",
      max_rlu_per_day: 30,
      feedback_schedule: "radar_after_each_set",
      block_order: ["warmup_prep_readiness_gate", "speed_block_isolated", "maintenance_retest"],
      pressure_unlock_rule: "Overspeed requires PC-09 pass (within 3% baseline)",
      session_note: "Speed and acquisition do NOT share a session. PC-09 readiness gate is mandatory before max-intent.",
      source_tags: ["IKB Mach 3", "ML", REVIEW]
    },
    "putting": {
      lane_label: "Putting",
      motor_learning_phase: "acquisition_or_maintenance",
      sleep_required: true,
      contamination_window_hours: 6,
      cue_type: "external",
      max_rlu_per_day: 60,
      feedback_schedule: "gate_or_chalk_then_faded",
      block_order: ["warmup_prep", "proof_test_gate", "blocked_acquisition", "serial_variability_distance", "random_variability_pressure", "retest"],
      pressure_unlock_rule: "Gate pass ≥ 16/20 required before pressure putting",
      session_note: "Start-line gate before any tempo or speed work. Aim verification first on flat putts.",
      source_tags: ["SAM PuttLab", "GOLF-KB"]
    },
    "short_game": {
      lane_label: "Short Game",
      motor_learning_phase: "acquisition",
      sleep_required: true,
      contamination_window_hours: 6,
      cue_type: "external",
      max_rlu_per_day: 40,
      feedback_schedule: "landing_window_then_faded",
      block_order: ["warmup_prep", "proof_test_landing_window", "blocked_acquisition", "serial_variability_distance", "random_variability_lie", "representative_transfer", "retest"],
      pressure_unlock_rule: "Landing-window pass ≥ 14/20 before pressure short game",
      session_note: "Lie condition (tight / fluffy / sand) modifies prescription. Use PC-12 / PC-13 before stroke change.",
      source_tags: ["GOLF-KB"]
    },
    "course_transfer": {
      lane_label: "Course Transfer / Decision",
      motor_learning_phase: "representative",
      sleep_required: false,
      contamination_window_hours: 0,
      cue_type: "external_or_none",
      max_rlu_per_day: 0,
      feedback_schedule: "post_shot_only",
      block_order: ["warmup_prep", "representative_transfer", "pressure_scoring", "reflection_decision_audit"],
      pressure_unlock_rule: "Run if decision-audit (PC-14) flags decision over execution",
      session_note: "No new swing change in this lane. Pre-shot routine + commitment + acceptable miss are the levers.",
      source_tags: ["Broadie SG", "Vision54"]
    },
    "psychology": {
      lane_label: "Psychology / Readiness",
      motor_learning_phase: "skill_consolidation",
      sleep_required: true,
      contamination_window_hours: 6,
      cue_type: "external_or_routine",
      max_rlu_per_day: 0,
      feedback_schedule: "routine_compliance",
      block_order: ["warmup_prep", "routine_rehearsal", "representative_with_consequence", "reflection"],
      pressure_unlock_rule: "Only consolidate existing pattern under pressure — never add new swing change",
      session_note: "Reduce threat; simplify task; verbalize external focus. Yips suspicion → coach review escalation.",
      source_tags: ["ML", "Vision54"]
    },
    "warmup_prep": {
      lane_label: "Warm-up / Prep",
      motor_learning_phase: "readiness",
      sleep_required: false,
      contamination_window_hours: 0,
      cue_type: "external",
      max_rlu_per_day: 0,
      feedback_schedule: "none",
      block_order: ["warmup_prep_only"],
      pressure_unlock_rule: "n/a",
      session_note: "Warm-up is not acquisition. No new technical cues. RPE check + readiness gate.",
      source_tags: ["IKB warmup_golf_priority", "ML"]
    },
    "equipment": {
      lane_label: "Equipment / Fitting",
      motor_learning_phase: "diagnostic_only",
      sleep_required: false,
      contamination_window_hours: 0,
      cue_type: "none",
      max_rlu_per_day: 0,
      feedback_schedule: "ab_cluster",
      block_order: ["warmup_prep", "proof_test_PC08", "fitting_referral"],
      pressure_unlock_rule: "n/a — equipment cause does not get drilled, it gets referred",
      session_note: "No swing drills until equipment cause is corrected. Document PC-08 clusters for fitting handoff.",
      source_tags: ["GOLFTEC", "GOLF-KB"]
    }
  };

  /* ---------------------------------------------------------------------------
     5. Red / Yellow gate copy — richer than existing FF_GATES.
        Each gate has: severity, condition, session_implication, gate_copy_short,
        gate_copy_long, escalation, source_tags.
  --------------------------------------------------------------------------- */
  window.FF_GATES_RICH = {
    "pain": {
      severity: "red",
      label: "Pain present",
      condition: "Player reports pain (joint, back, wrist) OR coach observes compensated movement.",
      session_implication: "Mobility / rehab only. NO swing acquisition. Refer for physical assessment. Log `pain_flag = true`.",
      gate_copy_short: "Red — pain. Switch to mobility/rehab only.",
      gate_copy_long: "Acquisition stops here. Coach finishes the session as mobility, breathing, or putting on a flat lie. The player is referred for assessment before any swing-change session is re-opened.",
      escalation: "Refer for medical / physical assessment.",
      source_tags: ["GOLF-KB", "TPI"]
    },
    "poor_readiness": {
      severity: "red",
      label: "Poor sleep / readiness",
      condition: "RPE > 7 pre-session, HRV well below baseline (if available), reported sleep < 6 hrs.",
      session_implication: "No swing-change acquisition. Maintenance, short game, or putting only. Sleep consolidation note.",
      gate_copy_short: "Red — readiness. No acquisition today.",
      gate_copy_long: "Motor learning at this state will not consolidate. The session shifts to maintenance, putting, or a representative round with no new cue. Acquisition window resumes when sleep + RPE recover.",
      escalation: "If chronic (3+ sessions), refer for sleep/recovery review.",
      source_tags: ["Sleep consolidation PubMed", "ML"]
    },
    "no_baseline": {
      severity: "red",
      label: "No baseline data",
      condition: "No goal-minimum-fields data for the goal code (GP-03 → GP-08) [IKB].",
      session_implication: "Block drill prescription until intake assessment is completed.",
      gate_copy_short: "Red — no baseline. Intake required first.",
      gate_copy_long: "Without baseline metrics, any drill prescription is a guess. Run TrackMan baseline, physical screen, and goal-specific intake before any acquisition block.",
      escalation: "Open intake assessment workflow.",
      source_tags: ["IKB goal_minimum_fields"]
    },
    "equipment_mismatch": {
      severity: "red",
      label: "Equipment mismatch confirmed",
      condition: "PC-08 equipment A/B shows equipment is the cause.",
      session_implication: "No swing drills until fitting referral is actioned. Document A/B cluster.",
      gate_copy_short: "Red — equipment cause. Fit before drill.",
      gate_copy_long: "Equipment is producing the fault. Swing drills here will install a compensation around bad gear. Refer for fitting; document the A/B cluster for the fitter; resume diagnostic after equipment is corrected.",
      escalation: "Fitting referral.",
      source_tags: ["GOLFTEC lie angle", "GOLF-KB"]
    },
    "speed_unsafe": {
      severity: "red",
      label: "Speed unsafe (PC-09 failed by large margin)",
      condition: ">5% below baseline club speed.",
      session_implication: "No overspeed, no max-intent. Redirect to maintenance, short game, or putting.",
      gate_copy_short: "Red — speed unsafe. No overspeed.",
      gate_copy_long: "Overspeed without recovery is an injury risk and a motor-pattern contaminant. Switch to maintenance or short game; retest speed next session.",
      escalation: "Recovery audit (sleep, fueling, load).",
      source_tags: ["IKB Mach 3", "ML", REVIEW]
    },
    "high_fatigue": {
      severity: "yellow",
      label: "High fatigue (moderate)",
      condition: "RPE 5–7; club speed 3–5% below baseline (PC-09 small-margin fail).",
      session_implication: "Reduce intensity. No overspeed. Short game, putting, or course management.",
      gate_copy_short: "Yellow — fatigue. Reduce intensity.",
      gate_copy_long: "Acquisition is still possible but the RLU cap drops. No overspeed. Prefer representative / decision work over technical change.",
      escalation: "Track across sessions — chronic yellow becomes red.",
      source_tags: ["ML"]
    },
    "mobility_limit": {
      severity: "yellow",
      label: "Mobility restriction confirmed",
      condition: "TPI screen fails (squat / toe-touch / single-leg balance) without pain.",
      session_implication: "Physical mobility work before swing acquisition. Log `mobility_restriction = true`.",
      gate_copy_short: "Yellow — mobility limit. Screen before drill.",
      gate_copy_long: "Failed mobility screen multiplies fault recurrence (e.g., toe-touch fail = 6× early extension risk). Mobility work moves to the front of the session; swing acquisition for the implicated lane defers until screen passes.",
      escalation: "TPI re-screen + physical / mobility programming.",
      source_tags: ["TPI early extension PubMed"]
    },
    "pre_tournament": {
      severity: "yellow",
      label: "Pre-tournament window",
      condition: "Within 4 weeks of next tournament [IKB] `gip_season_phase_overrides`.",
      session_implication: "No new technical acquisition. Maintenance + representative + pre-shot routine only.",
      gate_copy_short: "Yellow — tournament window. Maintenance only.",
      gate_copy_long: "New technical change inside the tournament window risks regression under pressure. Lock the current pattern, work pre-shot routine and acceptable miss, and shift to representative formats.",
      escalation: "n/a — calendar-driven.",
      source_tags: ["IKB gip_season_phase_overrides"]
    },
    "pressure_intolerance": {
      severity: "yellow",
      label: "Pressure intolerance",
      condition: "Pattern passes random practice but collapses under pressure ≥ 3 sessions in a row.",
      session_implication: "Pre-shot routine + external focus + psych referral consideration. No new swing change.",
      gate_copy_short: "Yellow — pressure collapse. Routine work.",
      gate_copy_long: "Adding swing change to a pressure-intolerant pattern reinforces the avoidance loop. Consolidate the existing pattern under low-stakes pressure first, then re-escalate.",
      escalation: "Consider sport-psych referral if persists.",
      source_tags: ["Vision54", "ML"]
    },
    "yips": {
      severity: "yellow",
      label: "Yips / anxiety flagged",
      condition: "Chipping, putting, or driver yips reported or observed.",
      session_implication: "Coach review required before any drill prescription. Psychological strategy first.",
      gate_copy_short: "Yellow — yips. Coach review required.",
      gate_copy_long: "Yips classification (neurological vs psychological) drives entirely different intervention paths. Escalate before stacking drills.",
      escalation: "Coach review + possible neurological consult if persistent.",
      source_tags: ["GOLF-KB", REVIEW]
    },
    "speed_request_no_transfer": {
      severity: "yellow",
      label: "Overspeed request without transfer stability",
      condition: "Player wants overspeed but transfer < 70% on current skill change [IKB].",
      session_implication: "Defer overspeed. Complete transfer phase first. (GP-02 vs GP-06 congruence conflict -0.30)",
      gate_copy_short: "Yellow — speed request, no transfer. Defer.",
      gate_copy_long: "Stacking overspeed on top of an unconsolidated technical change overwrites the new pattern with the old. Finish transfer for the current change before introducing speed stimulus.",
      escalation: "Reschedule speed block to next mesocycle.",
      source_tags: ["IKB congruence", "ML"]
    },
    "contact_chaos": {
      severity: "yellow",
      label: "Contact chaos (no stable pattern)",
      condition: "TrackMan consistency SD > 3 on ≥ 3 metrics OR impact scatter on PC-04.",
      session_implication: "No cause-specific drill. Readiness gate + 10-ball baseline + re-diagnose next session.",
      gate_copy_short: "Yellow — contact chaos. Re-baseline.",
      gate_copy_long: "No single fault is confirmable until pattern stabilizes. Acquisition is paused; the session collects clean baseline data and reschedules the diagnostic.",
      escalation: "n/a — re-baseline.",
      source_tags: ["GOLF-KB", "ML"]
    }
  };

  /* ---------------------------------------------------------------------------
     6. Fault relationship / masquerade map (research §9).
  --------------------------------------------------------------------------- */
  window.FF_FAULT_RELATIONSHIPS = [
    { apparent: "Path error (OTT)", actual: "Aim mismatch", differentiator: "Alignment station eliminates 30–40% of apparent OTT diagnoses", source: "GOLF-KB" },
    { apparent: "Face/path fault", actual: "Equipment lie angle", differentiator: "Lie tape test + A/B equipment", source: "GOLFTEC lie angle" },
    { apparent: "Path (in-to-out slice)", actual: "Grip / face → compensatory path", differentiator: "Neutralize grip first; path often self-corrects", source: "GOLF-KB" },
    { apparent: "Direction fault", actual: "Low-point chaos", differentiator: "Strike map shows scatter; low-point consistency drill before face/path drill", source: "GOLF-KB" },
    { apparent: "Swing fault under pressure", actual: "Pressure reveals latent fault (not new)", differentiator: "Fault absent in blocked/random but present in pressure = readiness/psych", source: "ML" },
    { apparent: "Early extension (technical)", actual: "Mobility restriction", differentiator: "TPI screen (squat, toe-touch, SLB) before rotation drill", source: "TPI early extension PubMed" },
    { apparent: "Speed loss", actual: "Sequencing disruption (cast)", differentiator: "HackMotion impact vs setup; fix cast before overspeed", source: "HackMotion" },
    { apparent: "Sway (trail-side)", actual: "Hip IR restriction + 'shift your weight' cue", differentiator: "Hip IR ROM + cue audit", source: "GOLF-KB" },
    { apparent: "Putting speed / distance errors", actual: "Misread (speed-line mismatch)", differentiator: "Test on flat putt first", source: "SAM PuttLab" },
    { apparent: "Three-putt count", actual: "Approach quality (long first putt)", differentiator: "SG-Putting vs SG-Approach", source: "Broadie SG" },
    { apparent: "Shank", actual: "Hosel delivery from OTT path (not heel strike)", differentiator: "Impact tape (hosel vs face edge) + P4 video", source: "GOLF-KB" },
    { apparent: "Wedge distance chaos", actual: "Absence of distance system", differentiator: "Distance ladder — SD consistent but distance wrong = system issue", source: "GOLF-KB" },
    { apparent: "Double-cross (hook on fade attempt)", actual: "Commitment failure + closing face under pressure", differentiator: "Pressure test + confidence in shape", source: "Vision54" },
    { apparent: "Yips", actual: "Neurological vs psychological", differentiator: "Fault disappears under 0-pressure = psych; persists = possible neuro escalate", source: "GOLF-KB" },
    { apparent: "Low trajectory", actual: "Setup (ball position / tee)", differentiator: "PC-02 A/B before swing screen", source: "GOLF-KB" },
    { apparent: "Ballooning driver", actual: "High-face contact (not AoA)", differentiator: "Impact tape first; then attack angle", source: "GOLF-KB" }
  ];

  /* ---------------------------------------------------------------------------
     7. Map cause-lane category -> session implication key (for branch enrichment).
  --------------------------------------------------------------------------- */
  // Fault-id-driven lane resolution. The fault family is the authoritative
  // signal for which session lane a branch belongs to. Categories on the branch
  // are only consulted as a secondary tiebreaker; this prevents equipment /
  // readiness / putting branches from being silently routed to a swing lane
  // just because their text mentions a swing keyword.
  const faultLaneFromId = (fid) => {
    fid = (fid || "").toUpperCase();
    if (/^FAULT-EQUIP|^FAULT-IRON-SPEC|^FAULT-DRIVER-SETUP|^FAULT-LIE-LOFT/.test(fid)) return "equipment";
    if (/^FAULT-READINESS|PAIN-GATE|^FAULT-PAIN/.test(fid)) return "warmup_prep";
    if (/^FAULT-PUTT/.test(fid)) return "putting";
    if (/^FAULT-BUNKER|^FAULT-WEDGE|^FAULT-CHIP|^FAULT-SHORTGAME/.test(fid)) return "short_game";
    if (/^FAULT-SPEED|^FAULT-WEAK-SMASH|^FAULT-SMASH/.test(fid)) return "speed";
    if (/^FAULT-COURSE|^FAULT-PSR|^FAULT-NUMBER-CHASE|^FAULT-TEMPO|^FAULT-FREEZE/.test(fid)) return "psychology";
    if (/^FAULT-EARLY-EXT|^FAULT-SWAY|^FAULT-SLIDE|^FAULT-HANG-BACK|^FAULT-SPIN-OUT|^FAULT-NO-LEAD-BRAKE|^FAULT-LOSS-POSTURE|GRF/.test(fid)) return "ground_force";
    if (/^FAULT-CHUNK|^FAULT-THIN|^FAULT-TOP|^FAULT-SHANK|^FAULT-TOE|^FAULT-HEEL|^FAULT-CENTER-CONTACT|^FAULT-WEAK-CONTACT/.test(fid)) return "contact_lowpoint";
    if (/^FAULT-SLICE|^FAULT-HOOK|^FAULT-PUSH|^FAULT-PULL|^FAULT-BLOCK|^FAULT-FACE|^FAULT-CAST|^FAULT-FLIP|^FAULT-HANDLE-DRAG|^FAULT-CHICKEN/.test(fid)) return "club_face_path";
    return null;
  };
  // Secondary priority only used if the fault id is unknown.
  const lanePriority = ["equipment", "putting", "short_game", "speed", "warmup_prep", "course_transfer", "psychology", "ground_force", "contact_lowpoint", "club_face_path"];

  /* ---------------------------------------------------------------------------
     7b. BRANCH-LEVEL OVERRIDE LAYER (added 2026-05-22 — branch authoring pass).
     Sub-branches whose diagnostic intent differs from their parent visible fault
     previously inherited the parent lane. This map lets individual branches
     declare a precise INTENT, which maps to a more accurate session lane and,
     optionally, narrows the technology signs / proof cards / gates / session
     copy. Stable keys: "FAULT-ID:branch-id". Free-text fallback is conservative.
  --------------------------------------------------------------------------- */
  const BRANCH_INTENTS = {
    aim_setup:               { label: "Aim / setup",                lane: "club_face_path"   },
    equipment_fit:           { label: "Equipment fit",              lane: "equipment"        },
    face_control:            { label: "Face control",               lane: "club_face_path"   },
    path_delivery:           { label: "Path delivery",              lane: "club_face_path"   },
    strike_lowpoint:         { label: "Strike / low point",         lane: "contact_lowpoint" },
    dynamic_loft_spinloft:   { label: "Dynamic loft / spin loft",   lane: "contact_lowpoint" },
    ground_force_pressure:   { label: "Ground force / pressure",    lane: "ground_force"     },
    sequencing_kinematics:   { label: "Sequencing / kinematics",    lane: "ground_force"     },
    wrist_release_hackmotion:{ label: "Wrist / release",            lane: "club_face_path"   },
    speed_readiness:         { label: "Speed readiness",            lane: "warmup_prep"      },
    speed_transfer:          { label: "Speed transfer",             lane: "speed"            },
    putting_start_line:      { label: "Putting — start line",       lane: "putting"          },
    putting_speed_control:   { label: "Putting — speed control",    lane: "putting"          },
    putting_read_aim:        { label: "Putting — read / aim",       lane: "putting"          },
    short_game_entry:        { label: "Short game — entry",         lane: "short_game"       },
    short_game_landing_window:{label: "Short game — landing window",lane: "short_game"       },
    bunker_entry:            { label: "Bunker — entry",             lane: "short_game"       },
    pressure_attention:      { label: "Pressure / attention",       lane: "psychology"       },
    course_decision:         { label: "Course decision",            lane: "course_transfer"  },
    mobility_pain_readiness: { label: "Mobility / pain / readiness",lane: "warmup_prep"      }
  };

  // Override map: "FAULT-ID:branch-id" -> { intent, technology_signs_keys?, proof_test_ids?,
  //   session_implication_patch?, gates_red?, gates_yellow?, false_positives?, why?, do_not_assume? }
  // - intent: id from BRANCH_INTENTS (required). Drives lane.
  // - technology_signs_keys: array, replaces inferred tool list when present.
  // - proof_test_ids: array, replaces inferred PC list when present.
  // - session_implication_patch: shallow patch over the lane's session implication.
  // - gates_red / gates_yellow: explicit gate-check lists for this branch only.
  // - false_positives: branch-specific overrides for parent-fault FP list.
  // - why: short reviewer-friendly explanation ("Why this branch").
  // - do_not_assume: short reviewer-friendly caution ("Do not assume").
  const BRANCH_LANE_OVERRIDES = {
    // ---------- SLICE ----------
    "FAULT-SLICE:face-start":           { intent: "face_control",          why: "Open face at impact starts the ball right of target line.",                                    do_not_assume: "Don't assume path before measuring face-to-target." },
    "FAULT-SLICE:pull-cut":             { intent: "path_delivery",         why: "Face closed to target but open to path produces left-then-right curve.",                       do_not_assume: "Do not chase face without measuring path direction." },
    "FAULT-SLICE:heel-gear":            { intent: "equipment_fit",         why: "Heel-side strike with driver gears the ball right — could be lie/CG/shaft fit.",                do_not_assume: "Don't rebuild swing before equipment A/B with current driver." },
    "FAULT-SLICE:setup-alignment":      { intent: "aim_setup",             why: "Body aim left + neutral face = pull-cut feel without a real path fault.",                       do_not_assume: "Do not change path without confirming setup alignment first." },
    "FAULT-SLICE:grip-weak":            { intent: "face_control",          why: "Weak grip cannot square the face under speed.",                                                do_not_assume: "Don't add release drills before correcting grip." },
    // ---------- CHUNK ----------
    "FAULT-CHUNK:lowpoint-back":        { intent: "strike_lowpoint",       why: "Low point behind the ball — classic chunk pattern.",                                            do_not_assume: "Don't assume ball position; measure low point on the mat or with TM." },
    "FAULT-CHUNK:trail-hang":           { intent: "ground_force_pressure", why: "Pressure stuck on trail side keeps low point behind the ball.",                                 do_not_assume: "Do not add lead-side cues before confirming pressure trace." },
    "FAULT-CHUNK:cast-dump":            { intent: "wrist_release_hackmotion", why: "Early wrist extension throws club head down behind ball.",                                  do_not_assume: "Don't treat as low-point fault if HackMotion shows early extension dump." },
    "FAULT-CHUNK:setup-ballpos":        { intent: "aim_setup",             why: "Ball position too far back stacks low point behind ball.",                                      do_not_assume: "Don't add motion drills before fixing static ball position." },
    "FAULT-CHUNK:lie-mismatch":         { intent: "equipment_fit",         why: "Lie too upright drops the heel and digs.",                                                      do_not_assume: "Don't change swing before fitting tape / lie-board check." },
    "FAULT-CHUNK:mobility-block":       { intent: "mobility_pain_readiness", why: "Hip / thoracic mobility limit prevents weight shift forward.",                              do_not_assume: "Do not coach pressure shift through a mobility wall." },
    // ---------- TOP ----------
    "FAULT-TOP:setup-ballpos":          { intent: "aim_setup",             why: "Ball too far forward or stance too tall puts low point above ball.",                            do_not_assume: "Don't add posture drills before re-measuring setup geometry." },
    "FAULT-TOP:early-extension":        { intent: "ground_force_pressure", why: "Early extension raises club arc through impact.",                                               do_not_assume: "Don't coach hands-down cues before pelvic depth check." },
    // ---------- SHANK ----------
    "FAULT-SHANK:heel-handle-out":      { intent: "face_control",          why: "Handle moving out through impact presents the hosel.",                                          do_not_assume: "Don't assume path-left; measure hand path on video." },
    "FAULT-SHANK:setup-distance":       { intent: "equipment_fit",         why: "Stance distance from ball + lie angle drives hosel proximity.",                                 do_not_assume: "Don't coach away from ball until lie + grip size are confirmed." },
    "FAULT-SHANK:threat-response":      { intent: "pressure_attention",    why: "Shank trauma creates threat-driven grip and freeze.",                                           do_not_assume: "Don't drill mechanics until threat is de-loaded." },
    // ---------- SLIDE ----------
    "FAULT-SLIDE:no-lead-brake":        { intent: "ground_force_pressure", why: "Lead leg does not brake / extend — pressure slides past lead foot.",                            do_not_assume: "Don't assume sway is a hip cue problem; check vertical GRF." },
    "FAULT-SLIDE:target-lunge":         { intent: "sequencing_kinematics", why: "Upper body leads sequence; pelvis trails — full-body slide.",                                  do_not_assume: "Do not add core drills before kinematic-sequence proof." },
    "FAULT-SLIDE:mobility-avoidance":   { intent: "mobility_pain_readiness", why: "Hip internal rotation limit forces lateral slide instead of rotation.",                       do_not_assume: "Do not coach rotation through a mobility ceiling — refer or modify." },
    // ---------- PUTT START LINE ----------
    "FAULT-PUTT-STARTLINE:face-aim":    { intent: "putting_start_line",    why: "Face angle at impact is the dominant start-line cause.",                                        do_not_assume: "Don't change stroke path before SAM PuttLab face data." },
    "FAULT-PUTT-STARTLINE:stroke-path": { intent: "putting_start_line",    why: "Stroke path can move start line within face-angle limits.",                                     do_not_assume: "Don't assume path is the cause if face is open/closed." },
    "FAULT-PUTT-STARTLINE:impact-location": { intent: "putting_start_line", why: "Off-centre strike on putter face starts ball offline.",                                        do_not_assume: "Don't rebuild face before impact-location proof (face tape / spray)." },
    "FAULT-PUTT-STARTLINE:read-aim":    { intent: "putting_read_aim",      why: "Visual aim error — putter aimed where coach reads, ball goes where putter aims.",               do_not_assume: "Don't coach stroke change if aim is the failure mode." },
    // ---------- PUTT SPEED ----------
    "FAULT-PUTT-SPEED:distance-calibration": { intent: "putting_speed_control", why: "Distance-to-speed calibration error — speed ladder is the proof.",                       do_not_assume: "Do not rebuild stroke before running a speed ladder." },
    "FAULT-PUTT-SPEED:visual-mapping":  { intent: "putting_read_aim",      why: "Green-read for distance / break combined errs.",                                                do_not_assume: "Don't change stroke if visual mapping is mis-calibrated." },
    "FAULT-PUTT-SPEED:tempo-variance":  { intent: "pressure_attention",    why: "Tempo variance under pressure changes effective stroke length.",                                do_not_assume: "Don't coach speed if tempo only fails under pressure." },
    // ---------- WEDGE / SHORT GAME CONTACT ----------
    "FAULT-WEDGE-CONTACT:entry-point":  { intent: "short_game_entry",      why: "Entry point ahead/behind ball drives heavy/thin.",                                              do_not_assume: "Don't add bounce drills before entry-point proof." },
    "FAULT-WEDGE-CONTACT:bounce-misuse":{ intent: "equipment_fit",         why: "Wrong bounce for the lie produces heavy/thin under intent.",                                    do_not_assume: "Don't rebuild action before wedge bounce A/B." },
    "FAULT-WEDGE-CONTACT:trajectory-lie-mismatch": { intent: "course_decision", why: "Trajectory selected does not fit lie / wind — decision error.",                              do_not_assume: "Do not treat as a contact fault if shot selection was wrong." },
    "FAULT-WEDGE-CONTACT:landing-window": { intent: "short_game_landing_window", why: "Landing window error compounds with entry to look like a contact issue.",                  do_not_assume: "Don't change contact pattern before re-checking the landing target." },
    // ---------- BUNKER ENTRY ----------
    "FAULT-BUNKER-ENTRY:entry-point-unknown": { intent: "bunker_entry",    why: "Coach has no entry-point measurement — must prove before drilling.",                            do_not_assume: "Don't prescribe sand drills until entry-point line is drawn." },
    "FAULT-BUNKER-ENTRY:sand-fear":     { intent: "pressure_attention",    why: "Threat response from prior bunker trauma creates entry randomness.",                            do_not_assume: "Don't drill mechanics if the threat is the constraint." },
    "FAULT-BUNKER-ENTRY:bounce-lie-mismatch": { intent: "equipment_fit",   why: "Wrong wedge bounce for sand depth.",                                                            do_not_assume: "Don't change technique before bounce / lie A/B." },
    // ---------- SPEED CEILING ----------
    "FAULT-SPEED-CEILING:force-amplitude-low": { intent: "speed_transfer", why: "Force amplitude (force plate) below benchmark — speed transfer block.",                          do_not_assume: "Don't add Mach 3 stimulus before checking readiness gate." },
    "FAULT-SPEED-CEILING:contact-limits-speed": { intent: "strike_lowpoint", why: "Centre-of-face contact failure caps usable club-head speed.",                                  do_not_assume: "Don't push speed if smash factor is unsafe." },
    "FAULT-SPEED-CEILING:intent-or-threat": { intent: "pressure_attention", why: "Speed intent suppressed by perceived threat — no real ceiling.",                                do_not_assume: "Don't program a true speed block if intent is the constraint." },
    "FAULT-SPEED-CEILING:readiness-fatigue": { intent: "speed_readiness",  why: "Sleep / readiness red — speed work contraindicated today.",                                    do_not_assume: "Do not run a speed block under red readiness gate." },
    // ---------- READINESS RED ----------
    "FAULT-READINESS-RED:poor-sleep":   { intent: "mobility_pain_readiness", why: "Sub-threshold sleep — high-intent acquisition blocked.",                                       do_not_assume: "Do not run an acquisition block under poor sleep — switch to maintenance." },
    "FAULT-READINESS-RED:fatigue":      { intent: "mobility_pain_readiness", why: "Cumulative fatigue — drop intent, no new motor patterns.",                                     do_not_assume: "Do not introduce new cues today." },
    "FAULT-READINESS-RED:pain-gate":    { intent: "mobility_pain_readiness", why: "Pain present — stop / refer / modify.",                                                        do_not_assume: "Do not coach through pain; gate the session." },
    // ============================================================================
    // FULL BRANCH AUTHORING PASS (2026-05-22b) — 179 additional overrides
    // ============================================================================
    "FAULT-AIM-MISMATCH:body-aimed-away-from-target": { intent: "aim_setup", why: "Body lines aimed off-target produce a 'path fault' that vanishes the moment alignment is corrected.", do_not_assume: "Don't diagnose a path fault before the alignment station has been checked." },
    "FAULT-AIM-MISMATCH:face-body-mismatch": { intent: "aim_setup", why: "Face aimed independently of body shoulders sends the ball relative to face, not to where it 'feels' aimed.", do_not_assume: "Don't change swing path before measuring face aim vs body aim on a flat lie." },
    "FAULT-AIM-MISMATCH:visual-perception-error": { intent: "aim_setup", why: "Visual aim error — coach reads one target, the player sees and aims at another.", do_not_assume: "Don't coach stroke or path if aim perception is the failure." },
    "FAULT-AIM-MISMATCH:compensatory-curve-habit": { intent: "path_delivery", why: "Player intentionally curves into a held-aim — looks like a swing fault but is a habituated compensation.", do_not_assume: "Don't strip the curve before confirming whether aim is the driver." },
    "FAULT-ALL-TURN-NO-SHIFT:no-lateral-load": { intent: "ground_force_pressure", why: "Pelvis stays centred — pressure never loads the trail side, so low point is unstable.", do_not_assume: "Don't add rotation drills before confirming the pressure trace can shift." },
    "FAULT-ALL-TURN-NO-SHIFT:torque-too-early": { intent: "sequencing_kinematics", why: "Rotation precedes pressure shift — sequence inverted on the kinematic trace.", do_not_assume: "Don't coach 'turn harder'; sequence — not magnitude — is the fault." },
    "FAULT-ALL-TURN-NO-SHIFT:fear-of-sway": { intent: "pressure_attention", why: "Player heard 'don't sway' and now refuses to load — psychological constraint, not a movement deficit.", do_not_assume: "Don't add mechanical drills if the cue history is the driver." },
    "FAULT-ARM-LIFT:turn-depth-missing": { intent: "sequencing_kinematics", why: "Arms lift because torso turn is shallow — sequence and depth are the cause, not arm position.", do_not_assume: "Don't drill arm position before verifying turn depth on video." },
    "FAULT-ARM-LIFT:width-concept-missing": { intent: "path_delivery", why: "Player has no internal concept of swing width — arm lift compensates for missing radius.", do_not_assume: "Don't drill the take-away mechanics if the concept of width is absent." },
    "FAULT-ARM-LIFT:mobility-compensation": { intent: "mobility_pain_readiness", why: "Limited thoracic/shoulder rotation forces arms to lift instead of turning behind the body.", do_not_assume: "Don't coach more turn through a mobility ceiling — refer or modify." },
    "FAULT-BALLOON:dynamic-loft": { intent: "dynamic_loft_spinloft", why: "Dynamic loft delivered too high for the speed — launch climbs and spin balloons.", do_not_assume: "Don't change attack angle before measuring delivered loft on TrackMan." },
    "FAULT-BALLOON:strike-low-face": { intent: "strike_lowpoint", why: "Low-face contact spins driver up and stalls trajectory — strike, not swing, is the cause.", do_not_assume: "Don't change swing before confirming impact location with face spray." },
    "FAULT-BALLOON:equipment-spin": { intent: "equipment_fit", why: "Shaft / loft / ball combination produces spin window outside Optimizer for this speed.", do_not_assume: "Don't rebuild swing before the Optimizer cluster and equipment A/B." },
    "FAULT-BLOCK:body-outraces-club": { intent: "sequencing_kinematics", why: "Pelvis and thorax peak too early — club arrives late and open from the inside.", do_not_assume: "Don't add face-rotation drills before kinematic sequence check." },
    "FAULT-BLOCK:trail-hang-block": { intent: "ground_force_pressure", why: "Trail-side pressure retention at impact stalls release and lays the face open.", do_not_assume: "Don't coach release without confirming the GRF trace shows hang-back." },
    "FAULT-BLOCK:driver-fit-block": { intent: "equipment_fit", why: "Block appears only with driver — loft / lie / shaft fit is the variable.", do_not_assume: "Don't drill swing if the pattern is exclusive to one club." },
    "FAULT-CAST:club-thrown-from-top": { intent: "wrist_release_hackmotion", why: "Lead wrist extends from the top — confirmed cast on HackMotion (impact extension > setup).", do_not_assume: "Don't add hands drills before HackMotion confirms cast versus face-save flip." },
    "FAULT-CAST:pressure-sequence-early": { intent: "pressure_attention", why: "Cast appears only under score/consequence — anxiety drives early release.", do_not_assume: "Don't drill mechanics if the cast vanishes in no-pressure practice." },
    "FAULT-CAST:fear-of-open-face": { intent: "face_control", why: "Player throws the club from the top to square a feared open face — protection, not technique.", do_not_assume: "Don't drill 'lag' before correcting the face-open root cause." },
    "FAULT-CAST:speed-intent-misapplied": { intent: "speed_readiness", why: "Player chases speed from the top — early effort triggers cast.", do_not_assume: "Don't add overspeed work; speed intent is the fault driver." },
    "FAULT-CENTER-CONTACT-CHAOS:setup-variability": { intent: "aim_setup", why: "Stance distance / posture changes shot to shot — chaos at setup creates chaos at strike.", do_not_assume: "Don't drill the strike pattern before fixing static setup variables.", proof_test_ids: ["PC-04", "PC-02", "PC-01"] },
    "FAULT-CENTER-CONTACT-CHAOS:tempo-chaos": { intent: "pressure_attention", why: "Tempo destabilises when intent rises — strike scatters because timing scatters.", do_not_assume: "Don't drill the strike pattern if tempo is the upstream cause." },
    "FAULT-CENTER-CONTACT-CHAOS:feedback-overload": { intent: "pressure_attention", why: "Too many swing thoughts and metrics produce attentional overload — pattern won't stabilise.", do_not_assume: "Don't add another cue; remove cues and rebaseline first." },
    "FAULT-CHICKEN-WING:face-control-compensation": { intent: "wrist_release_hackmotion", why: "Lead arm bends post-impact to prevent the face closing — face protection drives the bend.", do_not_assume: "Don't drill the arm before confirming face-control intent on HackMotion." },
    "FAULT-CHICKEN-WING:body-stalls": { intent: "sequencing_kinematics", why: "Body rotation stops at impact — arm has nowhere to go but up and across.", do_not_assume: "Don't drill the arm if the body is the upstream stall." },
    "FAULT-CHICKEN-WING:release-fear": { intent: "pressure_attention", why: "Player holds-off the release out of fear — chicken-wing is the visible consequence.", do_not_assume: "Don't drill the trail-arm release before de-loading the fear." },
    "FAULT-CHICKEN-WING:path-target-mismatch": { intent: "path_delivery", why: "Player aiming left or trying to pull-cut — chicken-wing is the geometry that fits the target.", do_not_assume: "Don't strip the arm pattern before alignment and target audit." },
    "FAULT-CLUB-SELECTION-MISMATCH:carry-window-unknown": { intent: "course_decision", why: "Player has no carry-distance system — every club selection is a guess.", do_not_assume: "Don't fix swing if the gapping data is absent." },
    "FAULT-CLUB-SELECTION-MISMATCH:dispersion-ignored": { intent: "course_decision", why: "Club selection ignores natural dispersion — aims for centre when miss-pattern requires offset.", do_not_assume: "Don't drill swing dispersion if the decision was already wrong." },
    "FAULT-CLUB-SELECTION-MISMATCH:pin-chasing": { intent: "course_decision", why: "Player attacks pin regardless of risk — execution looks bad because decision was aggressive.", do_not_assume: "Don't blame the swing for a high-risk target selection." },
    "FAULT-CLUB-SELECTION-MISMATCH:ego-distance": { intent: "course_decision", why: "Player selects the 'last-time-flushed' distance, not the realistic carry — over-clubs by ego.", do_not_assume: "Don't drill the swing for an ego-driven selection error." },
    "FAULT-COURSE-TRANSFER:blocked-dependency": { intent: "course_decision", why: "Player can hit the shot in blocked range work but cannot transfer to course — too much dependency on feedback / repetition.", do_not_assume: "Don't add more blocked work — random and representative practice are the gaps." },
    "FAULT-COURSE-TRANSFER:routine-gap": { intent: "pressure_attention", why: "Pre-shot routine collapses on course — pattern survives random practice but not real consequence.", do_not_assume: "Don't drill swing; routine is the lever." },
    "FAULT-COURSE-TRANSFER:decision-pressure": { intent: "course_decision", why: "Decision quality degrades under scoring pressure — penalty strokes are decision errors, not swing errors.", do_not_assume: "Don't rebuild swing if PC-14 shows decision-driven penalty strokes." },
    "FAULT-DOUBLE-CROSS:face-variance": { intent: "face_control", why: "Face control under shape attempt is variable — face closes when fade was intended.", do_not_assume: "Don't drill path; the face is the variable." },
    "FAULT-DOUBLE-CROSS:path-face-crossover": { intent: "path_delivery", why: "Path and face cross over wrong way — fade attempt produces in-to-in path with closing face.", do_not_assume: "Don't change face commitment before path is mapped on TrackMan." },
    "FAULT-DOUBLE-CROSS:fear-compensation": { intent: "pressure_attention", why: "Double cross appears only when miss-side is feared — commitment, not mechanic, is the issue.", do_not_assume: "Don't add new shape work without de-loading the feared miss." },
    "FAULT-DRIVER-SETUP-MISMATCH:tee-ballpos": { intent: "equipment_fit", why: "Tee height and ball position outside Optimizer for current driver / speed — setup is the cause.", do_not_assume: "Don't change swing before A/B-ing tee height and ball position." },
    "FAULT-DRIVER-SETUP-MISMATCH:loft-spin": { intent: "equipment_fit", why: "Loft sleeve / static loft mismatched to delivery — spin window outside Optimizer.", do_not_assume: "Don't rebuild swing if the loft setting alone shifts launch into window." },
    "FAULT-DRIVER-SETUP-MISMATCH:length-strike": { intent: "equipment_fit", why: "Driver length forces stance distance that drifts impact off-centre.", do_not_assume: "Don't drill swing before length / fit verification." },
    "FAULT-DYNAMIC-LOFT-HIGH:flip-scoop-loft": { intent: "wrist_release_hackmotion", why: "Lead-wrist scoop adds dynamic loft — confirmed flip on HackMotion (wrist extension through impact).", do_not_assume: "Don't add launch coaching before HackMotion confirms scoop versus shaft-lean leak." },
    "FAULT-DYNAMIC-LOFT-HIGH:shaft-lean-leak": { intent: "strike_lowpoint", why: "Shaft lean reduces between P5 and P7 — handle drifts up, loft climbs.", do_not_assume: "Don't coach 'hold off' before confirming low-point geometry on video." },
    "FAULT-DYNAMIC-LOFT-HIGH:trajectory-mismatch": { intent: "course_decision", why: "Player has chosen the wrong trajectory window for shot — high loft is intent, not fault.", do_not_assume: "Don't drill loft control if trajectory was the wrong selection." },
    "FAULT-EARLY-EXT:pelvis-space-loss": { intent: "ground_force_pressure", why: "Pelvis loses depth at P5 — classic early extension on force-plate / video.", do_not_assume: "Don't drill rotation through the failure if TPI screen indicates mobility." },
    "FAULT-EARLY-EXT:vertical-mistimed": { intent: "sequencing_kinematics", why: "Vertical force is applied too early — pelvis stands up before club arrives.", do_not_assume: "Don't add ground-cues before confirming the force-trace timing." },
    "FAULT-EARLY-EXT:face-path-save": { intent: "face_control", why: "Player stands up to create room because face is laid open — face is upstream, posture compensates.", do_not_assume: "Don't drill posture before fixing the face delivery driving the save." },
    "FAULT-EQUIP-LIE-LOFT:lie-angle-startline": { intent: "equipment_fit", why: "Lie too upright closes face, too flat opens it — start line shifts without any swing change.", do_not_assume: "Don't drill face / path before lie tape + lie board test." },
    "FAULT-EQUIP-LIE-LOFT:shaft-fit-delivery": { intent: "equipment_fit", why: "Shaft profile (weight, flex, kick) changes delivery geometry — equipment is upstream of any swing 'fault'.", do_not_assume: "Don't rebuild swing if a shaft swap A/Bs out the fault." },
    "FAULT-EQUIP-LIE-LOFT:loft-spin-window": { intent: "equipment_fit", why: "Static loft puts spin window outside ideal — same swing, wrong launch envelope.", do_not_assume: "Don't drill spin loft if a loft change A/Bs the cluster into window." },
    "FAULT-FACE-CLOSED:strong-grip": { intent: "face_control", why: "Strong lead-hand grip closes face at impact — confirmed on TrackMan face angle relative to target.", do_not_assume: "Don't drill release before re-checking grip geometry." },
    "FAULT-FACE-CLOSED:early-roll": { intent: "wrist_release_hackmotion", why: "Lead wrist rolls / flexes too early — HackMotion shows premature face closure.", do_not_assume: "Don't coach release timing without HackMotion data confirming the early roll." },
    "FAULT-FACE-CLOSED:toe-strike": { intent: "strike_lowpoint", why: "Toe-side strike gears the face left — looks like face-closed but is a contact issue.", do_not_assume: "Don't drill face if impact tape shows toe-side strike." },
    "FAULT-FACE-CLOSED:release-compensation": { intent: "face_control", why: "Player rolls hands to compensate for prior open-face history — release became closed by habit.", do_not_assume: "Don't strip the release without confirming whether grip or fear drove it." },
    "FAULT-FACE-OPEN:grip-face-start": { intent: "face_control", why: "Weak grip leaves face open at impact — most common cause on TrackMan face angle.", do_not_assume: "Don't drill release before confirming grip strength." },
    "FAULT-FACE-OPEN:late-closure": { intent: "wrist_release_hackmotion", why: "Lead wrist remains extended through impact — face never closes — HackMotion confirms late.", do_not_assume: "Don't drill 'hands' broadly; the wrist data dictates the specific intervention." },
    "FAULT-FACE-OPEN:fear-left-hold": { intent: "pressure_attention", why: "Player holds off the release out of fear of left miss — face stays open by intent.", do_not_assume: "Don't drill release through fear — de-load left miss first." },
    "FAULT-FAT-THIN-ALT:lowpoint-chaos": { intent: "strike_lowpoint", why: "Low point oscillates ball-to-ball — strike chaos with no consistent fault.", do_not_assume: "Don't pick a single drill — readiness gate and rebaseline first." },
    "FAULT-FAT-THIN-ALT:force-timing-chaos": { intent: "ground_force_pressure", why: "Pressure trace varies shot to shot — same swing produces different low points.", do_not_assume: "Don't drill technique through unstable force timing; mobility / readiness gate first." },
    "FAULT-FAT-THIN-ALT:setup-variable": { intent: "aim_setup", why: "Ball position / stance width drifts each shot — setup variance produces strike variance.", do_not_assume: "Don't drill the swing; stabilise setup first.", proof_test_ids: ["PC-04", "PC-02", "PC-01"] },
    "FAULT-FLIP-SCOOP:face-save-flip": { intent: "wrist_release_hackmotion", why: "Lead wrist extends through impact to square a held-open face — confirmed flip on HackMotion.", do_not_assume: "Don't drill 'shaft lean' before correcting the upstream face position." },
    "FAULT-FLIP-SCOOP:body-stall-flip": { intent: "sequencing_kinematics", why: "Body stops rotating — arms and club catch up by flipping.", do_not_assume: "Don't drill wrist if pelvis/thorax stall is upstream." },
    "FAULT-FLIP-SCOOP:help-it-up": { intent: "pressure_attention", why: "Player adds loft to 'help the ball up' — intent, not technique, is the cause.", do_not_assume: "Don't drill mechanics if the player's mental model is the constraint." },
    "FAULT-FREEZE-BALL:internal-focus-overload": { intent: "pressure_attention", why: "Too many internal swing thoughts freeze the player over the ball.", do_not_assume: "Don't add a new cue; reduce cues and use external focus.", gates_yellow: ["pressure_intolerance", "yips"] },
    "FAULT-FREEZE-BALL:fear-of-miss": { intent: "pressure_attention", why: "Threat appraisal at address — body freezes before motion.", do_not_assume: "Don't drill mechanics if the freeze is purely threat-driven.", gates_yellow: ["pressure_intolerance", "yips"] },
    "FAULT-FREEZE-BALL:too-many-swing-thoughts": { intent: "pressure_attention", why: "Player rehearsing 3+ cues over the ball — attention overflow.", do_not_assume: "Don't add more cues; collapse to one external focus.", gates_yellow: ["pressure_intolerance", "yips"] },
    "FAULT-FREEZE-BALL:low-autonomy": { intent: "pressure_attention", why: "Player is waiting for coach permission to swing — autonomy gap drives freeze.", do_not_assume: "Don't take over with more cues; give the player ownership of the pre-shot trigger.", gates_yellow: ["pressure_intolerance", "yips"] },
    "FAULT-HANDLE-DRAG:delayed-release": { intent: "wrist_release_hackmotion", why: "Lead wrist over-flexed at impact — handle is dragging, face stays open.", do_not_assume: "Don't coach 'more lag'; HackMotion shows lag is already excessive." },
    "FAULT-HANDLE-DRAG:body-outrace": { intent: "sequencing_kinematics", why: "Body racing the arms — handle leads excessively because the arms are late.", do_not_assume: "Don't drill wrist; sequencing is the upstream cause." },
    "FAULT-HANDLE-DRAG:anti-flip-overcorrect": { intent: "wrist_release_hackmotion", why: "Player over-corrected from a prior flip — now over-flexes lead wrist.", do_not_assume: "Don't add more 'hold off' coaching — the correction is already too far." },
    "FAULT-HANG-BACK:no-recenter": { intent: "ground_force_pressure", why: "Trail-side pressure persists through impact — no recenter to the lead side.", do_not_assume: "Don't add weight-shift cues until the pressure trace and TPI screen are reviewed." },
    "FAULT-HANG-BACK:turf-fear": { intent: "pressure_attention", why: "Player avoids ground interaction — hang-back protects against a feared fat.", do_not_assume: "Don't drill GRF if the fear is the lever." },
    "FAULT-HANG-BACK:driver-pattern-bleed": { intent: "aim_setup", why: "Player carries upward-AoA driver setup into irons — hang-back is iron's expression of that pattern.", do_not_assume: "Don't drill body mechanics until iron setup is separated from driver setup." },
    "FAULT-HEEL-STRIKE:handle-out": { intent: "path_delivery", why: "Handle moves out through impact — OTT path presents the heel.", do_not_assume: "Don't drill heel-strike as a contact fault until path is measured." },
    "FAULT-HEEL-STRIKE:crowded-or-long": { intent: "equipment_fit", why: "Standing too close OR club too long — systematic heel pattern from setup geometry.", do_not_assume: "Don't drill swing before length / lie A/B." },
    "FAULT-HEEL-STRIKE:open-face-heel": { intent: "face_control", why: "Open face at impact presents the heel — face direction drives heel contact.", do_not_assume: "Don't drill contact pattern if face is open at impact." },
    "FAULT-HEEL-TOE-STRIKE:setup-distance": { intent: "equipment_fit", why: "Standing distance / club length combination drives both heel and toe contact alternately.", do_not_assume: "Don't drill swing before length / lie A/B and impact-tape audit." },
    "FAULT-HEEL-TOE-STRIKE:delivery-drift": { intent: "path_delivery", why: "Path drifts in both directions across session — strike scatter follows path scatter.", do_not_assume: "Don't drill contact pattern if path itself is unstable." },
    "FAULT-HEEL-TOE-STRIKE:space-change": { intent: "ground_force_pressure", why: "Pelvis depth changes shot to shot — distance to ball changes — strike scatters.", do_not_assume: "Don't drill contact if early extension / mobility is the upstream cause." },
    "FAULT-HOOK:closed-face": { intent: "face_control", why: "Face closed at impact — confirmed on TrackMan face angle to target.", do_not_assume: "Don't drill path if face alone explains the curve." },
    "FAULT-HOOK:push-hook": { intent: "path_delivery", why: "Path excessively in-to-out, face matched closed to path — starts right and curves left.", do_not_assume: "Don't drill face if path direction is the dominant deviation." },
    "FAULT-HOOK:toe-gear": { intent: "strike_lowpoint", why: "Driver toe contact gears the ball left — strike, not swing, is the cause.", do_not_assume: "Don't drill swing if impact tape shows toe-side strike." },
    "FAULT-IRON-SPEC-MISMATCH:lie-angle": { intent: "equipment_fit", why: "Lie tape shows lie too upright or flat — face presented off-line without any swing change.", do_not_assume: "Don't drill face / path before lie tape and lie-board correction." },
    "FAULT-IRON-SPEC-MISMATCH:length": { intent: "equipment_fit", why: "Club length drives stance distance, which drives strike pattern.", do_not_assume: "Don't drill contact before length verification." },
    "FAULT-IRON-SPEC-MISMATCH:shaft-weight": { intent: "equipment_fit", why: "Shaft weight / flex outside player's delivery window — tempo and strike degrade.", do_not_assume: "Don't drill swing if a shaft A/B normalises the cluster." },
    "FAULT-IRON-SPEC-MISMATCH:loft-gapping": { intent: "equipment_fit", why: "Loft gaps stacked or doubled — distance ladder shows uncontrolled spacing.", do_not_assume: "Don't drill distance control before loft gapping is corrected." },
    "FAULT-LOSS-POSTURE:pelvis-toward-ball": { intent: "ground_force_pressure", why: "Pelvis moves toward ball through impact — same family as early extension.", do_not_assume: "Don't drill posture without TPI mobility screen first." },
    "FAULT-LOSS-POSTURE:mobility-stability-limit": { intent: "mobility_pain_readiness", why: "TPI screen failure (squat / SLB) — posture cannot hold without physical preparation.", do_not_assume: "Don't coach posture through a mobility ceiling — refer / modify." },
    "FAULT-LOSS-POSTURE:space-compensation": { intent: "face_control", why: "Player loses posture to make room for a face-open save.", do_not_assume: "Don't drill posture before correcting the face upstream." },
    "FAULT-LOW-BULLET:dynamic-loft-too-low": { intent: "dynamic_loft_spinloft", why: "Delivered loft below the Optimizer window — flight bullets out.", do_not_assume: "Don't change attack angle before loft delivery is measured." },
    "FAULT-LOW-BULLET:thin-low-launch": { intent: "strike_lowpoint", why: "Thin / low-on-face strike kills launch and spin.", do_not_assume: "Don't change swing if impact tape shows thin/low-face contact." },
    "FAULT-LOW-BULLET:equipment-loft-gap": { intent: "equipment_fit", why: "Static loft mismatched to speed — Optimizer shows launch window misaligned.", do_not_assume: "Don't rebuild swing before A/B-ing static loft." },
    "FAULT-LOWPOINT-BACK:pressure-trail": { intent: "ground_force_pressure", why: "Pressure stuck on trail side at impact — low point lags behind ball.", do_not_assume: "Don't drill ball position before pressure trace is corrected." },
    "FAULT-LOWPOINT-BACK:early-release-lowpoint": { intent: "wrist_release_hackmotion", why: "Early release dumps club head into ground behind ball.", do_not_assume: "Don't drill low point if HackMotion shows early extension dump." },
    "FAULT-LOWPOINT-BACK:ballpos-station": { intent: "aim_setup", why: "Ball position too far back / stance off — low point behind ball is a static problem.", do_not_assume: "Don't drill motion before fixing static setup.", proof_test_ids: ["PC-04", "PC-02", "PC-01"] },
    "FAULT-NUMBER-CHASE:continuous-feedback": { intent: "pressure_attention", why: "Player needs the number every shot — no internal feel calibrated.", do_not_assume: "Don't add more metrics; fade feedback and rebuild prediction.", gates_yellow: ["pressure_intolerance"] },
    "FAULT-NUMBER-CHASE:wrong-score": { intent: "course_decision", why: "Player chasing a metric that doesn't predict scoring — wrong success criterion.", do_not_assume: "Don't optimise the wrong number — verify SG vs scoring before drilling.", gates_yellow: ["pressure_intolerance"] },
    "FAULT-NUMBER-CHASE:threat-metric": { intent: "pressure_attention", why: "Specific metric triggers threat response — player chokes whenever it appears.", do_not_assume: "Don't drill the metric — defuse the threat first.", gates_yellow: ["pressure_intolerance"] },
    "FAULT-OTT:upper-body-start": { intent: "sequencing_kinematics", why: "Upper body initiates transition — club thrown over the top.", do_not_assume: "Don't drill path without confirming the sequence." },
    "FAULT-OTT:open-face-protection": { intent: "face_control", why: "OTT is a compensation to square an open face — face is the upstream cause.", do_not_assume: "Don't drill the path if face delivery is the driver." },
    "FAULT-OTT:alignment-left": { intent: "aim_setup", why: "Body aimed left forces OTT path to start the ball on target — alignment is the cause.", do_not_assume: "Don't drill path until alignment station is verified." },
    "FAULT-OVER-SWING:arm-body-timing-leak": { intent: "sequencing_kinematics", why: "Arms continue when body stops — overswing is a timing leak, not flexibility.", do_not_assume: "Don't add 'shorten backswing' cue; sequence is the cause." },
    "FAULT-OVER-SWING:mobility-stability-mismatch": { intent: "mobility_pain_readiness", why: "Stability deficit (core / lead-side) lets arms run past control point.", do_not_assume: "Don't drill arm position without TPI / stability screen." },
    "FAULT-OVER-SWING:tempo-too-long": { intent: "pressure_attention", why: "Backswing tempo too slow — arms drift past the control point.", do_not_assume: "Don't drill arm length; tempo is the lever." },
    "FAULT-OVER-SWING:speed-seeking": { intent: "speed_readiness", why: "Player adds length to chase speed — readiness/transfer block.", do_not_assume: "Don't add overspeed work — speed-seeking is the cause." },
    "FAULT-PATH-LEFT:open-shoulders": { intent: "aim_setup", why: "Shoulders open at address — path follows shoulders left.", do_not_assume: "Don't drill swing if shoulders correct the path." },
    "FAULT-PATH-LEFT:upper-body-dominance": { intent: "sequencing_kinematics", why: "Upper body dominates transition — same OTT family.", do_not_assume: "Don't drill path generically; confirm sequence first." },
    "FAULT-PATH-LEFT:early-lead-side-pull": { intent: "ground_force_pressure", why: "Lead side pulls early — pressure shoots leadward before club arrives.", do_not_assume: "Don't drill arms; the GRF / sequence is the upstream cause." },
    "FAULT-PATH-LEFT:swing-direction-left": { intent: "path_delivery", why: "Swing direction (TrackMan) is genuinely left — confirmed on path metric.", do_not_assume: "Don't drill face if path is the dominant deviation." },
    "FAULT-PATH-RIGHT:body-stalls": { intent: "sequencing_kinematics", why: "Body stalls — club gets stuck behind, path drifts right.", do_not_assume: "Don't drill path; the stall is upstream." },
    "FAULT-PATH-RIGHT:club-stuck-behind": { intent: "path_delivery", why: "Club drops behind the trail side — confirmed in-to-out path on TrackMan.", do_not_assume: "Don't drill face; path is the dominant deviation." },
    "FAULT-PATH-RIGHT:trail-side-hang-back": { intent: "ground_force_pressure", why: "Trail-side pressure retention drags path right.", do_not_assume: "Don't drill path before correcting the force trace." },
    "FAULT-PATH-RIGHT:overdraw-intent": { intent: "course_decision", why: "Player intending to draw — path is the chosen shape, not a fault.", do_not_assume: "Don't strip the shape; verify whether the shape was the intent." },
    "FAULT-POOR-PSR:commitment-gap": { intent: "pressure_attention", why: "Pre-shot routine breaks at commit step — player still rehearsing as the swing starts.", do_not_assume: "Don't add new swing cues; rebuild commit / trigger first.", gates_yellow: ["pressure_intolerance"] },
    "FAULT-POOR-PSR:attention-drift": { intent: "pressure_attention", why: "Attention drifts to consequence or technique in middle of routine.", do_not_assume: "Don't drill mechanics; rebuild the routine's external focus.", gates_yellow: ["pressure_intolerance"] },
    "FAULT-POOR-PSR:tempo-variability": { intent: "pressure_attention", why: "Routine tempo varies shot to shot — anchor missing.", do_not_assume: "Don't drill swing tempo; anchor the routine tempo first.", gates_yellow: ["pressure_intolerance"] },
    "FAULT-PULL:face-left": { intent: "face_control", why: "Face closed at address / impact — ball starts and stays left.", do_not_assume: "Don't drill path; face is the cause." },
    "FAULT-PULL:path-left-pull": { intent: "path_delivery", why: "Path significantly left, face matched — straight pull.", do_not_assume: "Don't drill face; path is the dominant deviation." },
    "FAULT-PULL:target-panic-pull": { intent: "pressure_attention", why: "Player pulling under pressure — fear of right miss steers ball left.", do_not_assume: "Don't drill mechanics if pull is pressure-specific." },
    "FAULT-PULL-HOOK:shut-face-start": { intent: "face_control", why: "Face closed at impact and to path — ball starts left and curves further left.", do_not_assume: "Don't drill path before face is corrected." },
    "FAULT-PULL-HOOK:flip-left": { intent: "wrist_release_hackmotion", why: "Lead wrist flips through impact — face dumps closed under pressure.", do_not_assume: "Don't drill 'lag'; the flip is the active cause." },
    "FAULT-PULL-HOOK:path-left-face-left": { intent: "path_delivery", why: "Both path and face left — full-left bias.", do_not_assume: "Don't drill face alone; correct both at the sequence level." },
    "FAULT-PUSH:face-right": { intent: "face_control", why: "Face open at address / impact — ball starts and stays right.", do_not_assume: "Don't drill path; face is the cause." },
    "FAULT-PUSH:path-right-face-matches": { intent: "path_delivery", why: "In-to-out path with matched face — straight push.", do_not_assume: "Don't drill face; path is the dominant deviation." },
    "FAULT-PUSH:alignment-right": { intent: "aim_setup", why: "Body aimed right — straight ball flies right, no swing fault.", do_not_assume: "Don't drill path if alignment alone explains it." },
    "FAULT-PUSH-SLICE:open-face-first": { intent: "face_control", why: "Face significantly open at impact — start right and curve right.", do_not_assume: "Don't drill path before face is corrected.", proof_test_ids: ["PC-05", "PC-03", "PC-01"] },
    "FAULT-PUSH-SLICE:heel-open-combo": { intent: "equipment_fit", why: "Heel-side strike + open face — driver fit / lie / shaft drives both.", do_not_assume: "Don't rebuild swing before driver A/B." },
    "FAULT-PUSH-SLICE:stall-late-face": { intent: "sequencing_kinematics", why: "Body stalls, face never closes — push-slice is the late-face consequence.", do_not_assume: "Don't drill release if the stall is upstream." },
    "FAULT-PUTT-PRESSURE:visual-rush": { intent: "putting_read_aim", why: "Player rushes the read under pressure — start line goes with the misread.", do_not_assume: "Don't drill stroke if read process collapses under pressure.", gates_yellow: ["pressure_intolerance", "yips"] },
    "FAULT-PUTT-PRESSURE:threat-appraisal": { intent: "pressure_attention", why: "Threat response over short putts — body freezes / decelerates.", do_not_assume: "Don't drill stroke mechanics; defuse threat first.", gates_yellow: ["pressure_intolerance", "yips"] },
    "FAULT-PUTT-PRESSURE:routine-loss": { intent: "pressure_attention", why: "Pre-putt routine collapses under pressure — same stroke, different start.", do_not_assume: "Don't change stroke if routine is the lever.", gates_yellow: ["pressure_intolerance", "yips"] },
    "FAULT-REVERSE-PIVOT:trail-load-missing": { intent: "ground_force_pressure", why: "Player never loads trail side — leads from the top, opposite of correct pattern.", do_not_assume: "Don't add rotation cues without confirming the pressure trace." },
    "FAULT-REVERSE-PIVOT:turn-concept-error": { intent: "sequencing_kinematics", why: "Player's mental model of the turn is wrong — confused trail / lead loading.", do_not_assume: "Don't drill mechanics if the concept itself is mislabeled." },
    "FAULT-REVERSE-PIVOT:protective-tension": { intent: "pressure_attention", why: "Player avoids loading trail side because it 'feels off' — protection drives the reverse.", do_not_assume: "Don't drill mechanics if the protective pattern is the constraint." },
    "FAULT-RUSHED-TRANS:threat-response": { intent: "pressure_attention", why: "Transition rushes under perceived consequence — anxiety, not technique.", do_not_assume: "Don't drill tempo mechanically; de-load consequence first.", gates_yellow: ["pressure_intolerance"] },
    "FAULT-RUSHED-TRANS:tempo-shift-under-pressure": { intent: "pressure_attention", why: "Tempo collapses when score / screen is added — pattern survives blocked but not random/pressure.", do_not_assume: "Don't drill swing change; routine + pressure work is the lever.", gates_yellow: ["pressure_intolerance"] },
    "FAULT-SHORT-BACKSWING:mobility-restriction": { intent: "mobility_pain_readiness", why: "TPI screen indicates rotation deficit — backswing cannot complete physically.", do_not_assume: "Don't drill backswing length through a mobility ceiling." },
    "FAULT-SHORT-BACKSWING:protective-tension": { intent: "pressure_attention", why: "Player tenses to prevent error — backswing shortens by guard.", do_not_assume: "Don't drill length without de-loading the protective tension." },
    "FAULT-SHORT-BACKSWING:concept-of-turn-missing": { intent: "sequencing_kinematics", why: "Player has no concept of full turn — arms-only backswing.", do_not_assume: "Don't drill length if the concept of turn is absent." },
    "FAULT-SHORT-BACKSWING:equipment-load-fear": { intent: "equipment_fit", why: "Shaft profile feels uncontrollable — player shortens to keep club in front.", do_not_assume: "Don't rebuild swing if a shaft A/B unlocks the natural length." },
    "FAULT-SHORTGAME-DISTANCE:landing-spot-unclear": { intent: "short_game_landing_window", why: "Player has no clear landing spot — distance miss is process gap, not technique.", do_not_assume: "Don't drill stroke if the landing window is unassigned." },
    "FAULT-SHORTGAME-DISTANCE:carry-window-unowned": { intent: "short_game_landing_window", why: "Player has no carry vs roll system for chosen lie / club.", do_not_assume: "Don't drill stroke before the carry-window system is built." },
    "FAULT-SHORTGAME-DISTANCE:trajectory-distance-conflict": { intent: "course_decision", why: "Trajectory chosen doesn't match distance / lie — wrong shot was selected.", do_not_assume: "Don't drill distance if the trajectory call was wrong." },
    "FAULT-SHORTGAME-TRAJECTORY:wrong-window-choice": { intent: "course_decision", why: "Player chose the wrong landing window for the lie / pin — decision, not technique.", do_not_assume: "Don't change technique if shot selection was the cause." },
    "FAULT-SHORTGAME-TRAJECTORY:face-ballpos-mismatch": { intent: "short_game_entry", why: "Face / ball position combination doesn't produce the chosen trajectory.", do_not_assume: "Don't drill the stroke before setup A/B for the trajectory." },
    "FAULT-SHORTGAME-TRAJECTORY:one-shot-pattern": { intent: "short_game_entry", why: "Player has only one trajectory in their bag — wrong lies expose it.", do_not_assume: "Don't drill mechanics; expand the menu of shots." },
    "FAULT-SKYBALL:steep-attack-pop": { intent: "strike_lowpoint", why: "Steep attack with driver pops the ball off the crown — strike geometry, not swing fault.", do_not_assume: "Don't rebuild swing before tee height / ball position A/B." },
    "FAULT-SKYBALL:tee-height-ballpos": { intent: "aim_setup", why: "Tee too low or ball too far back — sky ball is a setup geometry consequence.", do_not_assume: "Don't drill swing if a setup A/B eliminates the skies.", proof_test_ids: ["PC-02", "PC-04", "PC-01"] },
    "FAULT-SKYBALL:fear-hit-up": { intent: "pressure_attention", why: "Player adds steepness from fear of topping driver — protection drives the skies.", do_not_assume: "Don't drill mechanics if the fear is the constraint." },
    "FAULT-SPIN-LOFT-LOSS:dynamic-loft-and-aoa-mismatch": { intent: "dynamic_loft_spinloft", why: "Dynamic loft and attack angle out of relationship — spin loft loss reduces control.", do_not_assume: "Don't isolate one metric; spin loft is the relationship." },
    "FAULT-SPIN-LOFT-LOSS:off-center-strike": { intent: "strike_lowpoint", why: "Off-centre contact reduces transferred spin — looks like loft loss but is strike.", do_not_assume: "Don't drill spin loft if impact tape shows off-centre contact." },
    "FAULT-SPIN-LOFT-LOSS:speed-leak": { intent: "speed_readiness", why: "Player loses club speed across session — spin loft drops with energy.", do_not_assume: "Don't drill spin loft if readiness / fatigue is the lever." },
    "FAULT-SPIN-LOFT-LOSS:equipment-mismatch": { intent: "equipment_fit", why: "Shaft / loft / ball combination produces unfavourable spin loft window.", do_not_assume: "Don't drill swing before Optimizer + equipment A/B." },
    "FAULT-SPIN-OUT:torque-too-early": { intent: "sequencing_kinematics", why: "Pelvis rotates before pressure shifts lead — confirmed on kinematic sequence.", do_not_assume: "Don't drill rotation; sequence is the cause." },
    "FAULT-SPIN-OUT:no-lateral-shift": { intent: "ground_force_pressure", why: "Pelvis spins without lateral pressure shift — lead leg never brakes.", do_not_assume: "Don't drill rotation if the pressure trace lacks lead-side brake." },
    "FAULT-SPIN-OUT:target-panic-spin": { intent: "pressure_attention", why: "Player spins out under target panic / fear of right miss.", do_not_assume: "Don't drill mechanics if spin-out is pressure-specific." },
    "FAULT-SWAY:trail-load-unmanaged": { intent: "ground_force_pressure", why: "Trail-side pressure shifts further than hip can return — confirmed on force plate.", do_not_assume: "Don't drill rotation through unmanaged sway; mobility + cue audit first." },
    "FAULT-SWAY:pivot-concept-missing": { intent: "sequencing_kinematics", why: "Player's concept of 'shift your weight' produced a sway not a pivot.", do_not_assume: "Don't drill mechanics without auditing the cue history." },
    "FAULT-SWAY:driver-upward-overdone": { intent: "aim_setup", why: "Player tilts back for driver upward AoA — excess tilt becomes sway.", do_not_assume: "Don't drill swing if the setup tilt over-magnifies." },
    "FAULT-TEMPO-RUSH:threat-response": { intent: "pressure_attention", why: "Threat appraisal collapses tempo — anxiety driver.", do_not_assume: "Don't drill tempo mechanics if the threat is the cause.", gates_yellow: ["pressure_intolerance"] },
    "FAULT-TEMPO-RUSH:speed-pressure": { intent: "speed_readiness", why: "Player chases speed — tempo collapses on the way down.", do_not_assume: "Don't add overspeed; readiness gate first." },
    "FAULT-TEMPO-RUSH:no-transition-trigger": { intent: "pressure_attention", why: "Player has no internal trigger between backswing and downswing — tempo varies.", do_not_assume: "Don't drill mechanics; build the transition trigger.", gates_yellow: ["pressure_intolerance"] },
    "FAULT-TEMPO-RUSH:outcome-anxiety": { intent: "pressure_attention", why: "Player rushing because outcome anxiety builds before downswing.", do_not_assume: "Don't add new swing change; routine + commit work is the lever.", gates_yellow: ["pressure_intolerance"] },
    "FAULT-THIN:lowpoint-forward-high": { intent: "strike_lowpoint", why: "Low point ahead of ball with rising face — classic thin pattern.", do_not_assume: "Don't change ball position before low-point line is drawn on mat." },
    "FAULT-THIN:handle-raise-space": { intent: "wrist_release_hackmotion", why: "Handle rises through impact — hands seek more space, club rises with them.", do_not_assume: "Don't drill 'press down'; HackMotion should confirm the wrist driver." },
    "FAULT-THIN:ballpos-thin": { intent: "aim_setup", why: "Ball position too far forward / stance off — static cause of thin.", do_not_assume: "Don't drill swing if a setup A/B fixes the strike.", proof_test_ids: ["PC-04", "PC-02", "PC-01"] },
    "FAULT-TOE-STRIKE:retract-inward": { intent: "path_delivery", why: "Hands retract toward the body through impact — club moves to the toe.", do_not_assume: "Don't drill contact pattern without measuring the hand path." },
    "FAULT-TOE-STRIKE:space-loss-toe": { intent: "ground_force_pressure", why: "Early extension reduces space — club ends up at toe.", do_not_assume: "Don't drill contact if early extension is upstream." },
    "FAULT-TOE-STRIKE:too-short-or-far": { intent: "equipment_fit", why: "Stance too far from ball OR club too short — systematic toe pattern.", do_not_assume: "Don't drill swing before length / lie A/B." },
    "FAULT-TOO-SHALLOW:stuck-behind": { intent: "path_delivery", why: "Club drops behind body — too shallow into impact, blocks and hooks follow.", do_not_assume: "Don't drill steepness; verify sequence and trail-side hang first." },
    "FAULT-TOO-SHALLOW:underplane-contact": { intent: "strike_lowpoint", why: "Shallow plane delivers heel/toe and thin contact — strike is variable.", do_not_assume: "Don't add steepness drills before mapping the strike pattern." },
    "FAULT-TOO-SHALLOW:draw-intent-overdone": { intent: "course_decision", why: "Player intending a heavy draw — shallow is the chosen pattern, not a fault.", do_not_assume: "Don't strip the shape if it's the intended shot shape." },
    "FAULT-TOO-STEEP:transition-pull": { intent: "sequencing_kinematics", why: "Upper body pulls down in transition — steepens the plane abruptly.", do_not_assume: "Don't drill plane without sequence proof." },
    "FAULT-TOO-STEEP:lead-crash": { intent: "ground_force_pressure", why: "Lead-side crashes down too early — vertical force spikes prior to impact.", do_not_assume: "Don't drill plane if the GRF trace shows the lead crash." },
    "FAULT-TOO-STEEP:face-open-save": { intent: "face_control", why: "Player steepens to square an open face — face is upstream.", do_not_assume: "Don't drill plane before the face is fixed." },
    "FAULT-TOP:lowpoint-miss": { intent: "strike_lowpoint", why: "Low point well above ball — club rising through impact zone.", do_not_assume: "Don't drill posture before low-point line is confirmed." },
    "FAULT-TOP:early-extend": { intent: "ground_force_pressure", why: "Early extension raises the club through impact — top is the consequence.", do_not_assume: "Don't drill 'stay down'; correct the GRF / pelvis trace upstream." },
    "FAULT-WEAK-SMASH:offcenter-smash": { intent: "strike_lowpoint", why: "Off-centre contact loses ~2% ball speed per 10mm — looks like speed loss but is strike.", do_not_assume: "Don't drill speed before impact-tape strike map." },
    "FAULT-WEAK-SMASH:spinloft-smash": { intent: "dynamic_loft_spinloft", why: "Spin loft above ideal window — smash factor drops without any speed loss.", do_not_assume: "Don't drill speed; correct spin loft first." },
    "FAULT-WEAK-SMASH:speed-without-contact": { intent: "speed_transfer", why: "Player has speed in air but not into ball — transfer block.", do_not_assume: "Don't keep adding speed stimulus if it isn't transferring through contact." },
  };

  // Conservative fallback resolver. ONLY runs when no explicit override hit.
  // Reads stable identifiers (branch.categories, branch.lanes) — NOT free text —
  // and maps known lane strings to an intent.
  const branchIntentFromSignals = (branch) => {
    const cats = (branch.categories || []).concat(branch.lanes || []);
    if (cats.includes("psychology"))     return "pressure_attention";
    if (cats.includes("equipment"))      return "equipment_fit";
    if (cats.includes("putting"))        return "putting_start_line";
    if (cats.includes("short_game"))     return "short_game_entry";
    if (cats.includes("course_transfer"))return "course_decision";
    if (cats.includes("warmup_prep"))    return "mobility_pain_readiness";
    if (cats.includes("speed"))          return "speed_transfer";
    if (cats.includes("ground_force"))   return "ground_force_pressure";
    if (cats.includes("contact_lowpoint"))return "strike_lowpoint";
    if (cats.includes("club_face_path")) return "face_control";
    return null;
  };

  // Resolve branch -> { intent, lane, override } in a single call.
  // Override map wins; then category signals; then parent fault id; then default.
  const branchLaneFromBranch = (branch, fault) => {
    const key = (fault?.id || "") + ":" + (branch?.id || "");
    const ov = BRANCH_LANE_OVERRIDES[key];
    if (ov && BRANCH_INTENTS[ov.intent]) {
      return { intent: ov.intent, lane: BRANCH_INTENTS[ov.intent].lane, override: ov };
    }
    const signalIntent = branchIntentFromSignals(branch);
    if (signalIntent) {
      return { intent: signalIntent, lane: BRANCH_INTENTS[signalIntent].lane, override: null };
    }
    const idLane = faultLaneFromId(fault?.id);
    if (idLane) return { intent: null, lane: idLane, override: null };
    return { intent: null, lane: "club_face_path", override: null };
  };

  const sessionImplKeyFor = (branch, fault) => {
    return branchLaneFromBranch(branch, fault).lane;
  };

  /* ---------------------------------------------------------------------------
     8. Technology-sign signature inference per branch.
        We pick the tools/modes most relevant to the branch's indicators+tests.
  --------------------------------------------------------------------------- */
  // Explicit per-family tech-sign allowlist. Capped at ≤4 most relevant tools.
  // Order = priority (cheapest / most relevant first).
  const FAMILY_TECH_MAP = {
    putting:          ["sam_puttlab", "trackman_putting", "video"],
    short_game:       ["video", "equipment_ab", "trackman_shot_analysis"],
    equipment:        ["equipment_ab", "trackman_shot_analysis", "trackman_optimizer"],
    warmup_prep:      ["video"],
    psychology:       ["video", "trackman_on_course"],
    course_transfer:  ["trackman_on_course", "video"],
    speed:            ["trackman_speed_training", "mach3_tools", "trackman_shot_analysis"],
    ground_force:     ["force_plate", "video", "trackman_3d"],
    club_face_path:   ["trackman_shot_analysis", "trackman_corridors", "video"],
    contact_lowpoint: ["trackman_shot_analysis", "video", "equipment_ab"]
  };

  const inferTechSigns = (branch, fault) => {
    const out = {};
    const tag = key => { if (window.FF_TECHNOLOGY_SIGNS[key]) out[key] = window.FF_TECHNOLOGY_SIGNS[key]; };

    const fid = (fault?.id || "").toUpperCase();
    const resolved = branchLaneFromBranch(branch, fault);
    const lane = resolved.lane;

    // 0) If an override declares an explicit tech-sign list, honor it verbatim.
    if (resolved.override?.technology_signs_keys?.length) {
      resolved.override.technology_signs_keys.forEach(tag);
      const ordered = Object.keys(out).slice(0, 4);
      const capped = {};
      ordered.forEach(k => { capped[k] = out[k]; });
      return capped;
    }
    const label = ((branch.label || "") + " " + (branch.question || "")).toLowerCase();
    const hay = (label + " " + (branch.indicators || []).join(" ") + " " + (branch.tests || []).join(" ") + " " + (branch.refs || []).join(" ")).toLowerCase();

    // 1) Seed from the family allowlist (max 3 from this list).
    (FAMILY_TECH_MAP[lane] || FAMILY_TECH_MAP.club_face_path).forEach(tag);

    // 2) Narrow, evidence-gated additions — each requires a STRONG signal AND
    //    must not conflict with the lane intent. No broad keyword catch-alls.
    //    HackMotion only for explicit wrist/release/cast/flip causes.
    if (/^FAULT-CAST|^FAULT-FLIP|^FAULT-CHICKEN|^FAULT-HANDLE-DRAG/.test(fid) ||
        (lane === "club_face_path" && /\b(hackmotion|wrist flexion|wrist extension|lead wrist)\b/.test(hay))) {
      tag("hackmotion");
    }
    //    GEARS/3D only for ground-force or explicit kinematic-sequence acquisition branches.
    if ((lane === "ground_force" && /\b(kinematic sequence|3d|gears)\b/.test(hay))) {
      tag("gears");
    }
    //    Force plate only when lane is ground_force (already seeded) OR explicit GRF mention
    //    in a club_face_path branch (rare — keep it gated).
    //    -> covered by family seed; no extra add to avoid leakage.

    //    Equipment A/B for face/path or contact branches when shaft/lie/grip is the cue.
    if ((lane === "club_face_path" || lane === "contact_lowpoint") &&
        /\b(lie angle|shaft|grip size|loft|fitting|equipment)\b/.test(label)) {
      tag("equipment_ab");
    }
    //    On-course tool for course-transfer / decision branches and pressure-routine psych.
    if (lane === "psychology" && /\b(routine|on.course|pressure)\b/.test(label)) {
      tag("trackman_on_course");
    }
    //    Bunker entry specifically — video already seeded, add equipment_ab if bounce-cue.
    if (/^FAULT-BUNKER/.test(fid) && /\b(bounce|wedge|sand)\b/.test(label)) {
      tag("equipment_ab");
    }

    // 3) Hard subtractions — strip anything that's logically incompatible with the lane.
    //    Putting branches must never carry full-swing or speed tools.
    if (lane === "putting") {
      ["trackman_speed_training", "mach3_tools", "force_plate", "gears", "trackman_3d", "hackmotion", "trackman_optimizer", "trackman_performance_center"].forEach(k => delete out[k]);
    }
    //    Short-game branches: no full-swing speed, no force plate, no 3D.
    if (lane === "short_game") {
      ["trackman_speed_training", "mach3_tools", "force_plate", "gears", "trackman_3d"].forEach(k => delete out[k]);
    }
    //    Equipment branches: no body-mechanic drills, no speed/Mach.
    if (lane === "equipment") {
      ["trackman_speed_training", "mach3_tools", "force_plate", "gears", "hackmotion", "sam_puttlab"].forEach(k => delete out[k]);
    }
    //    Psychology branches: no GEARS, no force plate, no Mach 3, no speed training.
    if (lane === "psychology") {
      ["gears", "trackman_3d", "force_plate", "trackman_speed_training", "mach3_tools", "sam_puttlab", "hackmotion"].forEach(k => delete out[k]);
    }
    //    Warmup/readiness branches stay minimal.
    if (lane === "warmup_prep") {
      ["gears", "trackman_3d", "force_plate", "trackman_speed_training", "mach3_tools", "sam_puttlab", "hackmotion", "trackman_corridors", "trackman_optimizer"].forEach(k => delete out[k]);
    }
    //    Course transfer branches: no GEARS / speed / 3D.
    if (lane === "course_transfer") {
      ["gears", "trackman_3d", "force_plate", "trackman_speed_training", "mach3_tools", "sam_puttlab"].forEach(k => delete out[k]);
    }
    //    sam_puttlab is putting-only — strip everywhere else.
    if (lane !== "putting") delete out["sam_puttlab"];
    //    trackman_speed_training and mach3 are speed-only.
    if (lane !== "speed") { delete out["trackman_speed_training"]; delete out["mach3_tools"]; }

    // 4) Safe default if everything got stripped.
    if (Object.keys(out).length === 0) tag("video");

    // 5) Cap at 4.
    const ordered = Object.keys(out).slice(0, 4);
    const capped = {};
    ordered.forEach(k => { capped[k] = out[k]; });
    return capped;
  };

  /* ---------------------------------------------------------------------------
     9. Proof-test id inference per branch.
  --------------------------------------------------------------------------- */
  // Per-family proof-test card ordering. Cheapest cards first.
  // Each list is the AUTHORITATIVE set; branch-level keywords can append at most
  // one tightly-scoped extra card, never override this list.
  const FAMILY_PROOF_MAP = {
    putting:          ["PC-10", "PC-11", "PC-07"],
    short_game:       ["PC-13", "PC-11", "PC-04", "PC-02"],
    equipment:        ["PC-08", "PC-02", "PC-04"],
    warmup_prep:      ["PC-09"],
    psychology:       ["PC-07", "PC-14"],
    course_transfer:  ["PC-14", "PC-07"],
    speed:            ["PC-09", "PC-04", "PC-05"],
    ground_force:     ["PC-01", "PC-06", "PC-04"],
    club_face_path:   ["PC-03", "PC-05", "PC-01"],
    contact_lowpoint: ["PC-04", "PC-05", "PC-01"]
  };

  const inferProofTestIds = (branch, fault) => {
    const fid = (fault?.id || "").toUpperCase();
    const resolved = branchLaneFromBranch(branch, fault);
    const lane = resolved.lane;

    // 0) If an override declares an explicit PC list, honor it verbatim.
    if (resolved.override?.proof_test_ids?.length) {
      return resolved.override.proof_test_ids.slice(0, 4);
    }
    const label = ((branch.label || "") + " " + (branch.question || "")).toLowerCase();
    const base = (FAMILY_PROOF_MAP[lane] || FAMILY_PROOF_MAP.club_face_path).slice();

    // Fault-id specific narrow overrides (small, safe set).
    if (/PUTT-STARTLINE/.test(fid)) { if (!base.includes("PC-10")) base.unshift("PC-10"); }
    if (/PUTT-SPEED/.test(fid))     { if (!base.includes("PC-11")) base.unshift("PC-11"); }
    if (/PUTT-PRESSURE/.test(fid))  { if (!base.includes("PC-07")) base.push("PC-07"); }
    if (/BUNKER/.test(fid))         { if (!base.includes("PC-12")) base.unshift("PC-12"); }
    if (/SHORTGAME-DISTANCE/.test(fid)) { if (!base.includes("PC-13")) base.unshift("PC-13"); }
    if (/COURSE/.test(fid))         { if (!base.includes("PC-14")) base.unshift("PC-14"); }
    if (/READINESS-RED.*PAIN|PAIN-GATE/.test(fid + " " + label)) {
      // Pain branch — no proof card, gate handles the stop.
      return [];
    }

    // Conservative branch-keyword add: one card max, only if not already present and lane-compatible.
    if (lane === "club_face_path" && /\bsetup|tee height|ball position|alignment station\b/.test(label) && !base.includes("PC-02")) base.push("PC-02");
    if (lane === "contact_lowpoint" && /\bequipment|lie|shaft\b/.test(label) && !base.includes("PC-08")) base.push("PC-08");

    // Hard exclusions per lane.
    let filtered = base;
    if (lane === "putting") filtered = filtered.filter(id => !["PC-09", "PC-05", "PC-06", "PC-08", "PC-12", "PC-13"].includes(id));
    if (lane === "short_game") filtered = filtered.filter(id => !["PC-09", "PC-06", "PC-10"].includes(id));
    if (lane === "equipment") filtered = filtered.filter(id => !["PC-09", "PC-10", "PC-11", "PC-13", "PC-06", "PC-07"].includes(id));
    if (lane === "warmup_prep") filtered = filtered.filter(id => !["PC-05", "PC-06", "PC-08", "PC-10", "PC-13"].includes(id));
    if (lane === "psychology") filtered = filtered.filter(id => !["PC-09", "PC-08", "PC-06", "PC-10", "PC-12", "PC-13"].includes(id));

    // Dedupe preserving order; cap at 4.
    const seen = new Set();
    const out = [];
    for (const id of filtered) { if (!seen.has(id)) { seen.add(id); out.push(id); } if (out.length >= 4) break; }
    return out.length ? out : [];
  };

  /* ---------------------------------------------------------------------------
    10. Evidence flag inference — review_required default.
  --------------------------------------------------------------------------- */
  const inferEvidenceFlag = (branch, fault) => {
    const tags = (branch.source_tags || []).map(t => String(t).toLowerCase());
    if (tags.some(t => t.includes("authored"))) return "expert_framework";
    if (tags.some(t => t.includes("ikb"))) return "ikb_supported";
    if (tags.some(t => t.includes("pubmed") || t.includes("trackman") || t.includes("hackmotion"))) return "evidence_supported";
    return "review_required";
  };

  /* ---------------------------------------------------------------------------
    11. Enrich existing FF_DIAGNOSTIC_BRANCHES (non-destructive merge).
  --------------------------------------------------------------------------- */
  const branches = window.FF_DIAGNOSTIC_BRANCHES || {};
  const faults = window.FF_FAULTS || [];
  const faultById = Object.fromEntries(faults.map(f => [f.id, f]));

  Object.keys(branches).forEach(fid => {
    const fault = faultById[fid];
    const arr = branches[fid] || [];
    arr.forEach(br => {
      // Branch-level override resolution. Runs FIRST so downstream inference
      // is lane-correct and override-supplied lists land in the branch.
      const resolved = branchLaneFromBranch(br, fault);
      const override = resolved.override;
      const implKey = resolved.lane;
      const intentId = resolved.intent;

      // Reviewer-facing labels (always set — overwrite if previously empty).
      if (intentId && BRANCH_INTENTS[intentId]) {
        br.branch_intent = {
          id: intentId,
          label: BRANCH_INTENTS[intentId].label,
          lane: BRANCH_INTENTS[intentId].lane,
          override: !!override
        };
      }
      if (override?.why && !br.why_this_branch) br.why_this_branch = override.why;
      if (override?.do_not_assume && !br.do_not_assume) br.do_not_assume = override.do_not_assume;

      // Preserve original keys; only set if missing.
      const techSigns = inferTechSigns(br, fault);
      const proofIds = inferProofTestIds(br, fault);
      const implSrc = window.FF_SESSION_IMPLICATIONS[implKey];

      if (!br.technology_signs) br.technology_signs = techSigns;
      if (!br.proof_test_ids) br.proof_test_ids = proofIds;
      if (override?.false_positives?.length) {
        br.false_positives = override.false_positives.slice(0, 3);
      } else if (!br.false_positives) {
        br.false_positives = (window.FF_FALSE_POSITIVES[fid] || []).slice(0, 2);
      }
      if (!br.session_implication) {
        br.session_implication = {
          lane_key: implKey,
          lane_label: implSrc?.lane_label,
          motor_learning_phase: implSrc?.motor_learning_phase,
          sleep_required: implSrc?.sleep_required,
          contamination_window_hours: implSrc?.contamination_window_hours,
          cue_type: implSrc?.cue_type,
          max_rlu_per_day: implSrc?.max_rlu_per_day,
          feedback_schedule: implSrc?.feedback_schedule,
          block_order: implSrc?.block_order,
          pressure_unlock_rule: implSrc?.pressure_unlock_rule,
          session_note: implSrc?.session_note,
          source_tags: implSrc?.source_tags
        };
      }
      // Branch-specific session implication patch (only override can do this).
      if (override?.session_implication_patch && br.session_implication) {
        Object.assign(br.session_implication, override.session_implication_patch);
      }
      if (!br.evidence_flag) br.evidence_flag = inferEvidenceFlag(br, fault);
      if (br.coach_review_required === undefined) {
        br.coach_review_required = (br.source_tags || []).some(t => /review|REVIEW/i.test(String(t)));
      }
      // Gate checks — tight, lane- and fault-id-driven. No broad fallbacks.
      const branchLabel = ((br.label || "") + " " + (br.question || "")).toLowerCase();
      if (!br.red_gate_checks) {
        if (override?.gates_red?.length) {
          br.red_gate_checks = override.gates_red.slice();
        } else {
          const checks = ["no_baseline"];
          if (implKey === "equipment") checks.push("equipment_mismatch");
          if (implKey === "speed") checks.push("speed_unsafe");
          if (intentId === "mobility_pain_readiness" && /pain/.test(branchLabel)) checks.push("pain");
          else if (intentId === "mobility_pain_readiness") checks.push("poor_readiness");
          else if (/READINESS/.test(fid) && /pain/.test(branchLabel)) checks.push("pain");
          else if (/READINESS/.test(fid)) checks.push("poor_readiness");
          br.red_gate_checks = checks;
        }
      }
      if (!br.yellow_gate_checks) {
        if (override?.gates_yellow?.length) {
          br.yellow_gate_checks = override.gates_yellow.slice();
        } else {
          const checks = [];
        // contact_chaos applies to lanes where contact stability matters
        if (["club_face_path", "contact_lowpoint", "ground_force", "short_game"].includes(implKey)) checks.push("contact_chaos");
        // mobility_limit only for ground-force / body branches
        if (implKey === "ground_force" || /EARLY-EXT|SWAY|SLIDE|POSTURE|LOSS-POSTURE/.test(fid)) checks.push("mobility_limit");
        // pressure_intolerance for psych branches AND pressure sub-branches of putting/chip
        if (implKey === "psychology" || /PRESSURE|FREEZE|TEMPO-RUSH|NUMBER-CHASE|PSR|COURSE/.test(fid)) checks.push("pressure_intolerance");
        // yips ONLY for putt/chip yips-prone families
        if (/PUTT-PRESSURE|CHIP|YIPS|FREEZE-BALL/.test(fid)) checks.push("yips");
        // speed_request_no_transfer only for speed lane
        if (implKey === "speed") checks.push("speed_request_no_transfer");
        br.yellow_gate_checks = checks;
        }
      }
      // Sleep / contamination required ONLY for true acquisition lanes.
      // Equipment, warmup_prep, course_transfer, speed (stimulus) do not require sleep.
      if (br.session_implication && ["equipment", "warmup_prep", "course_transfer", "speed", "psychology"].includes(implKey)) {
        br.session_implication.sleep_required = false;
      }
    });
  });

  /* ---------------------------------------------------------------------------
    12. Diagnostic-layer registry — for the renderer / handoff outputs.
  --------------------------------------------------------------------------- */
  // Expose for renderer, audit tooling, and downstream debugging.
  window.FF_BRANCH_INTENTS = BRANCH_INTENTS;
  window.FF_BRANCH_LANE_OVERRIDES = BRANCH_LANE_OVERRIDES;

  window.FF_DIAGNOSTIC_LAYER_META = {
    version: "2026-05-22",
    branch_authoring_pass: true,
    branch_overrides_count: Object.keys(BRANCH_LANE_OVERRIDES).length,
    branch_intents: Object.keys(BRANCH_INTENTS),
    review_default: true,
    pipeline: ["visible_flaw", "cause_branch_shortlist", "proof_test", "confirmed_cause", "drill_candidate"],
    duplicate_prevention_rule: "FF_SESSION_LINK_RULES owns blocked→serial→random→transfer carryover. Diagnostic layer NEVER directly prescribes drills; it confirms cause.",
    proof_before_drill_standard: true,
    evidence_flags: ["evidence_supported", "expert_framework", "ikb_supported", "db_confirmed", "review_required"],
    source_tags_legend: {
      "GOLF-KB": "Forefront golf knowledge base",
      "IKB": "Internal knowledge base (Supabase tables)",
      "ML": "Motor learning literature",
      "TPI": "Titleist Performance Institute",
      "REVIEW": "Open item — Brendan validation required"
    }
  };
})();
