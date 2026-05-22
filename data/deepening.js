/* =============================================================================
   Forefront Golf — Drill Library Deepening Pass
   -----------------------------------------------------------------------------
   Adds whole-library coverage across motor-learning stages, practice blocks,
   tool families, common flaws, and transfer/pressure workflows. This file keeps
   the original seed library intact and appends reviewable POC cards.
   ============================================================================= */

(function () {
  const ensure = (arr, key, values) => {
    const seen = new Set(arr.map(x => x[key]));
    values.forEach(v => { if (!seen.has(v[key])) arr.push(v); });
  };

  ensure(window.FF_FAULTS, "id", [
    /* Full-swing visible flaws — choose these first; causes remain hypotheses. */
    { id: "FAULT-SLICE", name: "Slice / Excess Curve Right", layer: "ball", family: "full_swing", causes: ["face open to path", "out-to-in path", "heel strike", "weak grip or aim compensation"] },
    { id: "FAULT-HOOK", name: "Hook / Excess Curve Left", layer: "ball", family: "full_swing", causes: ["face closed to path", "path too far right", "toe strike", "release timing over-corrected"] },
    { id: "FAULT-PUSH", name: "Push / Starts Right", layer: "ball", family: "full_swing", causes: ["face right at impact", "path too far right", "late closure", "alignment mismatch"] },
    { id: "FAULT-PULL", name: "Pull / Starts Left", layer: "ball", family: "full_swing", causes: ["face left at impact", "path left", "upper-body dominance", "alignment mismatch"] },
    { id: "FAULT-PUSH-SLICE", name: "Push-Slice", layer: "ball", family: "full_swing", causes: ["face open", "path right or stalled rotation", "heel strike", "late face closure"] },
    { id: "FAULT-PULL-HOOK", name: "Pull-Hook", layer: "ball", family: "full_swing", causes: ["face closed", "path left or flip", "toe strike", "release dumped early"] },
    { id: "FAULT-BLOCK", name: "Blocked Driver / Right Miss", layer: "ball", family: "full_swing", causes: ["face remains open", "body outraces club", "trail-side hang back", "late release"] },
    { id: "FAULT-DOUBLE-CROSS", name: "Double Cross", layer: "ball", family: "full_swing", causes: ["face/path relationship unstable", "target fear", "over-correction", "routine breakdown"] },
    { id: "FAULT-BALLOON", name: "Ballooning / Spinny Flight", layer: "ball", family: "full_swing", causes: ["dynamic loft high", "spin loft excessive", "strike low face", "shaft/loft mismatch"] },
    { id: "FAULT-LOW-BULLET", name: "Low Bullet / No Carry", layer: "ball", family: "full_swing", causes: ["dynamic loft too low", "thin strike", "low launch setup", "equipment loft mismatch"] },
    { id: "FAULT-SKYBALL", name: "Sky Ball / Pop-Up Driver", layer: "ball", family: "full_swing", causes: ["attack angle too steep", "contact high face/crown", "tee/ball position mismatch"] },
    { id: "FAULT-TOP", name: "Top", layer: "ball", family: "full_swing", causes: ["low point too far back/forward", "early extension", "loss of posture", "fear of turf"] },
    { id: "FAULT-CHUNK", name: "Chunk / Heavy Strike", layer: "ball", family: "full_swing", causes: ["low point behind ball", "pressure stays trail side", "cast/early release", "poor ground interaction"] },
    { id: "FAULT-THIN", name: "Thin Strike", layer: "ball", family: "full_swing", causes: ["low point too high/late", "handle raise", "early extension", "ball position mismatch"] },
    { id: "FAULT-SHANK", name: "Shank / Hosel Contact", layer: "club", family: "full_swing", causes: ["handle/club moves outward", "face open with heel delivery", "setup distance", "panic steering"] },
    { id: "FAULT-TOE-STRIKE", name: "Toe Strike Pattern", layer: "club", family: "full_swing", causes: ["club retracts inward", "setup distance", "early extension compensation", "too-short club"] },
    { id: "FAULT-HEEL-STRIKE", name: "Heel Strike Pattern", layer: "club", family: "full_swing", causes: ["handle moves out", "too close/long club", "late posture loss", "shaft/lie fit"] },
    { id: "FAULT-CENTER-CONTACT-CHAOS", name: "Contact Location Chaos", layer: "club", family: "full_swing", causes: ["setup variability", "tempo variability", "low-point instability", "feedback overload"] },
    { id: "FAULT-CAST", name: "Cast / Early Release", layer: "club", family: "full_swing", causes: ["club thrown from top", "pressure sequence early", "fear of open face", "speed intent misapplied"] },
    { id: "FAULT-CHICKEN-WING", name: "Chicken Wing / Exit Collapse", layer: "club", family: "full_swing", causes: ["face control compensation", "body stalls", "release fear", "path/target mismatch"] },
    { id: "FAULT-TOO-STEEP", name: "Too Steep Into Ball", layer: "club", family: "full_swing", causes: ["shaft steepens in transition", "upper-body pull", "lead-side crash", "OTT pattern"] },
    { id: "FAULT-TOO-SHALLOW", name: "Too Shallow / Stuck", layer: "club", family: "full_swing", causes: ["club behind body", "rotation stalls", "path too far right", "late face closure"] },
    { id: "FAULT-PATH-LEFT", name: "Path Too Far Left", layer: "club", family: "full_swing", causes: ["open shoulders", "upper-body dominance", "early lead-side pull", "swing direction left"] },
    { id: "FAULT-PATH-RIGHT", name: "Path Too Far Right", layer: "club", family: "full_swing", causes: ["body stalls", "club stuck behind", "trail-side hang back", "overdraw intent"] },
    { id: "FAULT-FACE-CLOSED", name: "Face Closed at Impact", layer: "club", family: "full_swing", causes: ["strong grip", "early roll", "toe strike", "release compensation"] },
    { id: "FAULT-SPIN-LOFT-LOSS", name: "Spin-Loft / Smash Inefficiency", layer: "club", family: "full_swing", causes: ["dynamic loft and AoA mismatch", "off-center strike", "speed leak", "equipment mismatch"] },
    { id: "FAULT-LOSS-POSTURE", name: "Loss of Posture", layer: "body", family: "full_swing", causes: ["pelvis moves toward ball", "mobility/stability limit", "space compensation", "poor hip depth"] },
    { id: "FAULT-SWAY", name: "Sway Off Ball", layer: "body", family: "full_swing", causes: ["trail hip load unmanaged", "pressure shift too lateral", "poor pivot concept"] },
    { id: "FAULT-HANG-BACK", name: "Hang Back / Trail-Side Finish", layer: "body", family: "full_swing", causes: ["pressure never recenters", "fear of turf", "driver upward intent overdone", "lead-side brake absent"] },
    { id: "FAULT-SPIN-OUT", name: "Spin Out / Open Early", layer: "body", family: "full_swing", causes: ["torque too early", "arms/club left behind", "no lateral shift", "target panic"] },
    { id: "FAULT-ARM-LIFT", name: "Arm Lift / Disconnected Backswing", layer: "body", family: "full_swing", causes: ["turn depth missing", "width concept missing", "mobility compensation"] },
    { id: "FAULT-OVER-SWING", name: "Overswing / Overrun", layer: "body", family: "full_swing", causes: ["arm-body timing leak", "mobility/stability mismatch", "tempo too long", "speed seeking"] },
    { id: "FAULT-SHORT-BACKSWING", name: "Short / Restricted Backswing", layer: "body", family: "full_swing", causes: ["mobility restriction", "protective tension", "concept of turn missing", "equipment load fear"] },
    { id: "FAULT-TEMPO-RUSH", name: "Rushed Tempo", layer: "psych", family: "full_swing", causes: ["threat response", "speed pressure", "no transition trigger", "outcome anxiety"] },
    { id: "FAULT-FREEZE-BALL", name: "Ball-Bound Freeze", layer: "psych", family: "full_swing", causes: ["internal focus overload", "fear of miss", "too many swing thoughts", "low autonomy"] },
    { id: "FAULT-NUMBER-CHASE", name: "Launch-Monitor Number Chasing", layer: "psych", family: "full_swing", causes: ["continuous feedback dependency", "unclear task score", "coach over-metrics", "performance anxiety"] },
    { id: "FAULT-AIM-MISMATCH", name: "Aim / Alignment Mismatch", layer: "strategy", family: "full_swing", causes: ["body aimed away from target", "face/body mismatch", "visual perception error", "compensatory curve habit"] },
    { id: "FAULT-CLUB-SELECTION-MISMATCH", name: "Wrong Club / Shot Choice", layer: "strategy", family: "full_swing", causes: ["carry window unknown", "dispersion ignored", "pin chasing", "ego distance"] },
    { id: "FAULT-DRIVER-SETUP-MISMATCH", name: "Driver Setup Mismatch", layer: "equipment", family: "full_swing", causes: ["tee height", "ball position", "loft sleeve", "shaft length/weight"] },
    { id: "FAULT-IRON-SPEC-MISMATCH", name: "Iron Spec Mismatch", layer: "equipment", family: "full_swing", causes: ["lie angle", "length", "shaft weight", "loft gapping"] },
    { id: "FAULT-SHORTGAME-DISTANCE", name: "Short-Game Distance Chaos", layer: "ball", causes: ["landing spot unclear", "carry window unowned", "trajectory mismatch"] },
    { id: "FAULT-SHORTGAME-TRAJECTORY", name: "Short-Game Trajectory Mismatch", layer: "club", causes: ["wrong window", "face/ball-position mismatch", "one-shot-only pattern"] },
    { id: "FAULT-BUNKER-ENTRY", name: "Bunker Entry Inconsistency", layer: "ball", causes: ["entry point unknown", "sand fear", "bounce misuse"] },
    { id: "FAULT-PUTT-STARTLINE", name: "Putting Start-Line Error", layer: "club", causes: ["face aim", "impact location", "stroke path"] },
    { id: "FAULT-PUTT-SPEED", name: "Putting Speed-Control Error", layer: "ball", causes: ["distance calibration", "visual mapping", "tempo"] },
    { id: "FAULT-PUTT-PRESSURE", name: "Putting Pressure Breakdown", layer: "psych", causes: ["visual rush", "threat appraisal", "routine loss"] },
    { id: "FAULT-COURSE-TRANSFER", name: "Range-to-Course Transfer Gap", layer: "strategy", causes: ["blocked dependency", "no routine", "decision pressure"] },
    { id: "FAULT-POOR-PSR", name: "Poor Pre-Shot Routine", layer: "psych", causes: ["commitment gap", "attention drift", "tempo variability"] },
    { id: "FAULT-EQUIP-LIE-LOFT", name: "Equipment Distorting Delivery", layer: "equipment", causes: ["lie angle", "shaft fit", "loft/spin mismatch"] },
    { id: "FAULT-READINESS-RED", name: "Readiness Red / Sleep Risk", layer: "body", causes: ["poor sleep", "fatigue", "pain gate"] }
  ]);

  window.FF_PRACTICE_BLOCKS = [
    { id: "warmup_prep", label: "Warmup / Prep", gpl: [1, 2, 3, 4, 5], intent: "Prepare body, attention, safety, and first baseline." },
    { id: "blocked_acquisition", label: "Blocked Acquisition", gpl: [1, 2], intent: "Stable reps, high feedback, one constraint, no pressure." },
    { id: "serial_variability", label: "Serial Variability", gpl: [2, 3], intent: "Small planned variation while preserving one pattern." },
    { id: "random_variability", label: "Random Variability", gpl: [3, 4], intent: "Club/target/lie changes; feedback fades to clusters." },
    { id: "representative_transfer", label: "Representative Transfer", gpl: [4, 5], intent: "Course-like decisions, one-ball rules, full routine." },
    { id: "pressure_scoring", label: "Pressure / Scoring", gpl: [4, 5], intent: "Consequences only after random practice survives." },
    { id: "maintenance_retest", label: "Maintenance / Retest", gpl: [5], intent: "Low-volume checks, prediction, assessment-only tech." },
    { id: "reflection", label: "Reflection / Reset", gpl: [1, 2, 3, 4, 5], intent: "Capture cue, confidence, no-contamination, and homework." }
  ];

  window.FF_FIELD_MANUAL_BACKEND = {
    version: "field-manual-integrated-poc-v0.2",
    source_spine: [
      { id: "FM-100", label: "GP level map", role: "Maps GP-L1–L5 to practice permissions and progression gates." },
      { id: "FM-256", label: "Fault-to-force map", role: "Connects visible flaws to force, club, ball, psychology, strategy, or equipment cause lanes." },
      { id: "FM-300", label: "Diagnostic ladder", role: "Keeps one dominant layer per session so symptoms do not become the prescription." },
      { id: "FM-355", label: "Psychology-to-session rules", role: "Controls pressure, cue load, confidence protection, and client-facing language." },
      { id: "FM-410", label: "TrackMan 3D / TPS map", role: "Routes TPS modes to acquisition, transfer, benchmark, or equipment triage." },
      { id: "FM-500", label: "Practice assembly grammar", role: "Converts selected cards into coached sessions, solo practice, weekly dose, and monthly review." }
    ],
    block_order: ["warmup_prep", "blocked_acquisition", "serial_variability", "random_variability", "representative_transfer", "pressure_scoring", "maintenance_retest", "reflection"],
    motor_learning_rules: [
      "Sleep and no-contamination instructions are mandatory after brand-new swing-change acquisition.",
      "Blocked practice installs; serial and random practice test ownership; representative practice proves transfer.",
      "65–70% success is the target challenge point once the player leaves pure acquisition.",
      "Tech starts as calibration, then fades to cluster reveal, prediction, and assessment-only.",
      "Pressure is not added until the pattern survives random variability."
    ]
  };

  window.FF_SESSION_LINK_RULES = {
    version: "session-linking-v0.1",
    intent: "Keep each drill in one primary block, then show logical carryover links into transfer, scoring, retest, and homework blocks.",
    practice_block_defaults: {
      blocked_acquisition: [
        {
          to: "block2",
          label: "Carry the constraint into transfer",
          relationship: "install → variability",
          task: "Keep the same external task or constraint, remove one support, then change target/club/lie in small clusters.",
          gate: "Use only if the install block holds roughly 6/10 acceptable contacts or start lines.",
          companion_drill_ids: ["DR-XFR-003", "DR-XFR-004"]
        },
        {
          to: "retest",
          label: "Retest without coaching",
          relationship: "install → proof",
          task: "Run the proof metric with feedback hidden until the set is complete.",
          gate: "Do not add a second cue during the proof set.",
          companion_drill_ids: []
        },
        {
          to: "reflection",
          label: "Homework compression",
          relationship: "install → solo assignment",
          task: "Turn the drill into a small no-ball or half-speed rehearsal and log the one cue that survived.",
          gate: "Avoid casual ball beating for the post-change window.",
          companion_drill_ids: []
        }
      ],
      serial_variability: [
        {
          to: "block2",
          label: "Widen the serial ladder",
          relationship: "serial → random",
          task: "Keep the same pattern but stop announcing the next variation; let the player predict the shot window first.",
          gate: "Advance when the player can self-correct without a new technical explanation.",
          companion_drill_ids: ["DR-XFR-003"]
        }
      ],
      random_variability: [
        {
          to: "scoring",
          label: "Score the random task",
          relationship: "random → pressure",
          task: "Use one-ball scoring with full routine and no mid-set video unless the player loses the pattern.",
          gate: "Only stage-legal at GP-L4+ or after random practice is stable.",
          companion_drill_ids: ["DR-XFR-005"]
        }
      ],
      representative_transfer: [
        {
          to: "reflection",
          label: "Course carryover note",
          relationship: "representative → homework",
          task: "Capture the decision rule, target picture, and one situation where the swing thought must disappear.",
          gate: "Keep client-facing language task/target based.",
          companion_drill_ids: []
        }
      ],
      pressure_scoring: [
        {
          to: "reflection",
          label: "Pressure debrief",
          relationship: "pressure → regulation",
          task: "Record what changed under consequence: target commitment, tempo, breath, or start-line control.",
          gate: "If panic or technique hunting appears, regress next session to random without consequence.",
          companion_drill_ids: []
        }
      ],
      maintenance_retest: [
        {
          to: "reflection",
          label: "Retest decision",
          relationship: "proof → next prescription",
          task: "Use the retest result to choose advance, repeat, regress, or maintain. Do not add a new fix inside the retest block.",
          gate: "If the player cannot predict the result before reveal, keep feedback bandwidth wide next session.",
          companion_drill_ids: []
        }
      ],
      warmup_prep: [
        {
          to: "block1",
          label: "Warmup gate into install",
          relationship: "readiness → first constraint",
          task: "Choose the first drill intensity from the warmup result. Green can proceed; yellow reduces speed, volume, or range; red changes the session.",
          gate: "Pain, balance, or readiness changes override the planned drill.",
          companion_drill_ids: []
        }
      ],
      reflection: [
        {
          to: "retest",
          label: "Question for next proof",
          relationship: "log → retest design",
          task: "Turn the client note into the next proof question instead of adding a new swing thought immediately.",
          gate: "One question only; keep the next session diagnostic-first.",
          companion_drill_ids: []
        }
      ]
    },
    category_defaults: {
      speed: [
        {
          to: "block2",
          label: "Speed-to-ball transfer",
          relationship: "intent → playable strike",
          task: "After the speed tool, hit balls at controlled intent and score carry window, contact, and start line before chasing another speed number.",
          gate: "No transfer if pain, balance loss, or strike quality drops below the session floor.",
          companion_drill_ids: ["DR-SPD-007", "TM-SPD-001", "DR-CON-008"]
        },
        {
          to: "retest",
          label: "Speed proof set",
          relationship: "speed exposure → benchmark",
          task: "Use a short radar or TrackMan proof set with prediction first, reveal second, and stop before fatigue changes mechanics.",
          gate: "Retest only after a full speed warmup and no red readiness flags.",
          companion_drill_ids: ["DR-SPD-008", "TM-SPD-001"]
        },
        {
          to: "reflection",
          label: "Speed dosage note",
          relationship: "high intent → recovery",
          task: "Log intent level, best speed, playable-speed number, fatigue, and the next deload or repeat decision.",
          gate: "Do not stack high-intent speed with brand-new technical acquisition when readiness is yellow.",
          companion_drill_ids: []
        }
      ],
      ground_force: [
        {
          to: "block2",
          label: "Force-to-flight bridge",
          relationship: "force concept → shot window",
          task: "Keep the ground-force feel but score ball flight, contact, and balance finish; the player should not describe body parts during the swing.",
          gate: "Advance only if balance finish and strike remain acceptable under a changed target or club.",
          companion_drill_ids: ["DR-GRF-008", "DR-XFR-003"]
        },
        {
          to: "retest",
          label: "Force proof",
          relationship: "constraint → normal swing",
          task: "Remove the exaggeration and test whether the same force pattern appears in a normal routine swing.",
          gate: "If normal speed collapses, regress to slower reps or the original constraint next session.",
          companion_drill_ids: ["DR-CON-014"]
        },
        {
          to: "reflection",
          label: "Force conflict check",
          relationship: "force work → safety",
          task: "Record balance, hip/back response, and whether force language helped or made the player more internal.",
          gate: "Pain, instability, or excessive internal focus means reduce intent and simplify cueing.",
          companion_drill_ids: []
        }
      ],
      club_face_path: [
        {
          to: "block2",
          label: "Face/path randomization",
          relationship: "start line → curve control",
          task: "Move from a gate or corridor into random targets. Score start line first, curve second, and technique last.",
          gate: "Randomize only after start line is predictable enough to keep challenge near 65–70%.",
          companion_drill_ids: ["DR-CFP-005", "DR-CFP-007", "TM-COR-001"]
        },
        {
          to: "retest",
          label: "Ball-flight prediction proof",
          relationship: "club delivery → prediction",
          task: "Player predicts start line and curve before reveal; coach reviews TrackMan or ball flight after the cluster.",
          gate: "No continuous numbers if the player starts chasing metrics mid-swing.",
          companion_drill_ids: ["DR-CFP-007", "TM-SA-001"]
        },
        {
          to: "reflection",
          label: "One flight rule",
          relationship: "mechanic → client language",
          task: "Translate the club fix into one target/flight rule the player can remember under pressure.",
          gate: "Avoid multiple face/path explanations in the client homework.",
          companion_drill_ids: []
        }
      ],
      contact_lowpoint: [
        {
          to: "block2",
          label: "Contact-to-turf transfer",
          relationship: "strike constraint → varied lie",
          task: "Keep the strike task but vary lie, ball position, or target window. Score contact location and low point before technical explanation.",
          gate: "Advance when centered or ball-first contact survives the first variation.",
          companion_drill_ids: ["DR-CON-012", "DR-CON-014", "DR-XFR-003"]
        },
        {
          to: "retest",
          label: "Strike cluster proof",
          relationship: "contact task → objective pattern",
          task: "Run a short cluster with face spray, divot line, smash, or contact prediction; reveal after the set.",
          gate: "If contact scatter widens, regress to the simplest external strike constraint.",
          companion_drill_ids: ["DR-CON-005", "DR-CON-008", "DR-CON-014"]
        },
        {
          to: "reflection",
          label: "Strike homework",
          relationship: "low point → simple solo task",
          task: "Assign a low-risk brush, towel, or strike-prediction task; no new swing diagnosis during solo reps.",
          gate: "Use turf/mat context notes because mat success may not transfer automatically.",
          companion_drill_ids: []
        }
      ],
      putting: [
        {
          to: "block2",
          label: "Putt skill blend",
          relationship: "start line or speed → random putts",
          task: "Blend the putting skill into random distances or breaks. The player predicts roll, pace, or entry before feedback.",
          gate: "Do not add pressure until start line or speed control survives randomization.",
          companion_drill_ids: ["DR-PUT-006", "DR-PUT-008"]
        },
        {
          to: "scoring",
          label: "Putting pressure bridge",
          relationship: "random putts → consequence",
          task: "Use par-2, move-back, or one-ball putting only after the player can run the routine without technical searching.",
          gate: "Pressure is GP-L4+ or coach-approved after stable random practice.",
          companion_drill_ids: ["DR-PUT-009", "DR-PSY-001"]
        },
        {
          to: "retest",
          label: "Putting proof",
          relationship: "putting task → retest",
          task: "Retest start line, speed ladder, or read/roll prediction with feedback delayed until the end of the set.",
          gate: "One metric only: start line, speed, read, or make-rate.",
          companion_drill_ids: ["DR-PUT-003", "TM-PUT-001"]
        }
      ],
      short_game: [
        {
          to: "block2",
          label: "Landing-to-lie transfer",
          relationship: "landing window → shot selection",
          task: "Move from the landing or entry constraint into varied lies, trajectories, or one-ball shot selection.",
          gate: "Advance when the landing window survives at least one changed lie or trajectory.",
          companion_drill_ids: ["DR-SG-004", "DR-SG-006"]
        },
        {
          to: "scoring",
          label: "Up-and-down bridge",
          relationship: "short-game skill → scoring",
          task: "Convert the task to a one-ball up-and-down score or short-game solo match after contact and landing are stable.",
          gate: "Do not pressure-test a brand-new bunker or wedge entry pattern on day one.",
          companion_drill_ids: ["DR-SG-008", "DR-PSY-001"]
        },
        {
          to: "retest",
          label: "Short-game proof",
          relationship: "shot family → window test",
          task: "Retest carry window, landing window, entry point, or proximity with the same ball and lie rules recorded.",
          gate: "If lie adaptation fails, return to selector logic before adding more technique.",
          companion_drill_ids: ["DR-SG-005", "DR-SG-006"]
        }
      ],
      course_transfer: [
        {
          to: "scoring",
          label: "Representative-to-pressure bridge",
          relationship: "course task → consequence",
          task: "Add consequence only to the decision/routine/target task, not to a brand-new technical change.",
          gate: "Pressure must preserve routine quality and target commitment.",
          companion_drill_ids: ["DR-XFR-005", "DR-PSY-001"]
        },
        {
          to: "retest",
          label: "Transfer audit",
          relationship: "range transfer → scorecard proof",
          task: "Audit decision quality, start-line commitment, and acceptable miss pattern across a simulated or actual hole sequence.",
          gate: "If the pattern works on the range but fails in sequence, keep the next session representative rather than adding a new drill.",
          companion_drill_ids: ["TM-PC-003", "TM-COM-001"]
        },
        {
          to: "reflection",
          label: "On-course decision note",
          relationship: "transfer → next play rule",
          task: "Write one play rule: target, no-go miss, club choice, or routine checkpoint.",
          gate: "The play rule must be usable without TrackMan or coach feedback.",
          companion_drill_ids: []
        }
      ],
      warmup_prep: [
        {
          to: "block1",
          label: "Prep-to-drill match",
          relationship: "warmup finding → drill intensity",
          task: "Use the warmup to choose range of motion, speed cap, and whether the first drill is normal, regressed, or replaced.",
          gate: "Warmup findings beat the prewritten plan.",
          companion_drill_ids: ["DR-WAR-003"]
        }
      ],
      psychology: [
        {
          to: "block2",
          label: "Routine into variability",
          relationship: "attention skill → random task",
          task: "Run the same routine through changing targets so attention stays external and decision-led.",
          gate: "If the player starts technique hunting, reduce variability and return to cue-word reset.",
          companion_drill_ids: ["DR-XFR-001", "DR-XFR-003"]
        },
        {
          to: "scoring",
          label: "Pressure readiness",
          relationship: "regulation → consequence",
          task: "Add consequence only if the reset routine works without coach rescue.",
          gate: "No pressure if confidence, anxiety, or technical search is the dominant limiter.",
          companion_drill_ids: ["DR-PSY-001"]
        },
        {
          to: "reflection",
          label: "Client psychology note",
          relationship: "state → language",
          task: "Capture the words that improved attention and the words that made the player more internal.",
          gate: "Keep next-session cue language external, task-based, and emotionally neutral.",
          companion_drill_ids: ["DR-PSY-002", "DR-PSY-003"]
        }
      ]
    },
    drill_overrides: {
      "DR-GRF-004": [
        {
          to: "block2",
          label: "Pump Drill transfer link",
          relationship: "pump rehearsal → random shot window",
          task: "Do not repeat the pump as a second drill. Remove the pump, keep the trail-load feel, then change target or club every 2–3 balls.",
          gate: "Use after Step-and-Pump produces stable contact on about 6/10 balls without balance loss.",
          companion_drill_ids: ["DR-GRF-005", "DR-GRF-008", "DR-XFR-003"]
        },
        {
          to: "retest",
          label: "Pump Drill proof",
          relationship: "constraint → proof",
          task: "Retest with normal motion only. Player predicts contact and start window before the reveal.",
          gate: "No extra pump, no new body-part cue, no live technical correction during the proof set.",
          companion_drill_ids: []
        },
        {
          to: "reflection",
          label: "Pump Drill homework",
          relationship: "session → solo microdose",
          task: "Assign no-ball step-and-pump rehearsals or 50% swings only; the solo goal is preserving the feel, not chasing speed.",
          gate: "Do not pair with high-intent speed work on the same day if balance, hip, back, or readiness gates are yellow/red.",
          companion_drill_ids: []
        }
      ]
    }
  };

  window.FF_SESSION_CONTEXTS = [
    {
      id: "coached",
      label: "Coached session",
      badge: "coach-led",
      intent: "Diagnosis, constraint selection, feedback calibration, and proof-test setup.",
      feedback_rule: "Coach can give higher feedback early, but fades to cluster feedback and prediction inside the same session.",
      tech_rule: "Coach controls TrackMan/Mach 3 visibility; one metric or one mode is the primary question.",
      pressure_rule: "Coach may add pressure only at GP-L4+ or when selected pressure card is stage-legal.",
      homework_rule: "End with a small solo assignment and exact proof metric.",
      block_bias: { warmup_prep: 1.0, blocked_acquisition: 1.18, serial_variability: 1.10, random_variability: 0.95, representative_transfer: 0.92, pressure_scoring: 0.85, maintenance_retest: 1.05, reflection: 1.15 },
      default_week_role: "anchor"
    },
    {
      id: "solo",
      label: "Solo practice",
      badge: "self-led",
      intent: "Execution, ownership, repetition, transfer, and self-scoring without creating new coaching noise.",
      feedback_rule: "No new technical diagnosis. Use external task feedback, self-score first, and review numbers after clusters.",
      tech_rule: "Use no-tech or delayed TrackMan reveal unless the assigned protocol explicitly says otherwise.",
      pressure_rule: "Solo pressure only after GP-L3 random practice is stable; use simple scorecards, not swing thoughts.",
      homework_rule: "Keep one cue, one constraint, one proof number, and a stop rule.",
      block_bias: { warmup_prep: 1.0, blocked_acquisition: 0.78, serial_variability: 0.95, random_variability: 1.12, representative_transfer: 1.18, pressure_scoring: 1.10, maintenance_retest: 0.90, reflection: 1.25 },
      default_week_role: "support"
    }
  ];

  window.FF_ASSEMBLY_HORIZONS = [
    { id: "day", label: "Single session", weeks: 0, sessions: 1, description: "Build today's coached or solo plan." },
    { id: "week", label: "Weekly microcycle", weeks: 1, sessions: 3, description: "One anchor session plus solo supports by default." },
    { id: "month", label: "Monthly block", weeks: 4, sessions: 3, description: "Four-week progression with install, consolidate, transfer, and retest." }
  ];

  window.FF_FAULT_DRILL_MAP = {
    "FAULT-SLICE": { refs: ["FAULT-FACE-OPEN", "FAULT-OTT", "start-line variance", "path left", "heel strike"], categories: ["club_face_path", "contact_lowpoint", "course_transfer"], lanes: ["club", "strategy"] },
    "FAULT-HOOK": { refs: ["FAULT-FACE-CLOSED", "path right", "toe strike", "release timing", "start-line variance"], categories: ["club_face_path", "contact_lowpoint", "course_transfer"], lanes: ["club", "strategy"] },
    "FAULT-PUSH": { refs: ["FAULT-FACE-OPEN", "path right", "start-line variance", "alignment"], categories: ["club_face_path", "course_transfer"], lanes: ["club", "strategy"] },
    "FAULT-PULL": { refs: ["path left", "FAULT-OTT", "start-line variance", "alignment"], categories: ["club_face_path", "ground_force", "course_transfer"], lanes: ["club", "body", "strategy"] },
    "FAULT-PUSH-SLICE": { refs: ["FAULT-FACE-OPEN", "heel strike", "start-line variance", "late face"], categories: ["club_face_path", "contact_lowpoint"], lanes: ["club"] },
    "FAULT-PULL-HOOK": { refs: ["FAULT-FACE-CLOSED", "release timing", "toe strike", "path left"], categories: ["club_face_path", "contact_lowpoint"], lanes: ["club"] },
    "FAULT-BLOCK": { refs: ["FAULT-FACE-OPEN", "FAULT-ALL-TURN-NO-SHIFT", "lateral recenter", "release timing"], categories: ["club_face_path", "ground_force"], lanes: ["club", "body"] },
    "FAULT-DOUBLE-CROSS": { refs: ["start-line variance", "FAULT-FACE-OPEN", "FAULT-FACE-CLOSED", "routine", "pressure"], categories: ["club_face_path", "course_transfer", "psychology"], lanes: ["club", "psych", "strategy"] },
    "FAULT-BALLOON": { refs: ["FAULT-DYNAMIC-LOFT-HIGH", "spin loft", "low face", "FAULT-WEAK-SMASH"], categories: ["club_face_path", "contact_lowpoint", "speed"], lanes: ["club", "equipment"] },
    "FAULT-LOW-BULLET": { refs: ["thin strike", "low point", "dynamic loft", "launch"], categories: ["contact_lowpoint", "club_face_path"], lanes: ["club", "equipment"] },
    "FAULT-SKYBALL": { refs: ["attack angle", "high face", "tee height", "driver setup"], categories: ["contact_lowpoint", "club_face_path"], lanes: ["club", "equipment"] },
    "FAULT-TOP": { refs: ["FAULT-LOWPOINT", "thin strike", "early extension", "contact chaos"], categories: ["contact_lowpoint", "ground_force"], lanes: ["club", "body"] },
    "FAULT-CHUNK": { refs: ["FAULT-LOWPOINT", "low point behind", "FAULT-SLIDE", "cast", "early release"], categories: ["contact_lowpoint", "ground_force", "club_face_path"], lanes: ["club", "body"] },
    "FAULT-THIN": { refs: ["FAULT-LOWPOINT", "thin strike", "early extension", "handle raise"], categories: ["contact_lowpoint", "ground_force"], lanes: ["club", "body"] },
    "FAULT-SHANK": { refs: ["heel strike", "handle out", "FAULT-FACE-OPEN", "start-line variance"], categories: ["contact_lowpoint", "club_face_path"], lanes: ["club", "psych"] },
    "FAULT-TOE-STRIKE": { refs: ["toe strike", "contact location", "early extension"], categories: ["contact_lowpoint", "ground_force"], lanes: ["club", "body", "equipment"] },
    "FAULT-HEEL-STRIKE": { refs: ["heel strike", "handle out", "FAULT-FACE-OPEN", "lie angle"], categories: ["contact_lowpoint", "club_face_path"], lanes: ["club", "equipment"] },
    "FAULT-CENTER-CONTACT-CHAOS": { refs: ["contact chaos", "contact location", "tempo", "low point"], categories: ["contact_lowpoint", "psychology"], lanes: ["club", "psych"] },
    "FAULT-CAST": { refs: ["cast", "early release", "release timing", "FAULT-DYNAMIC-LOFT-HIGH"], categories: ["club_face_path", "speed"], lanes: ["club", "body"] },
    "FAULT-CHICKEN-WING": { refs: ["release timing", "body stalls", "FAULT-FACE-OPEN", "path left"], categories: ["club_face_path", "ground_force"], lanes: ["club", "body"] },
    "FAULT-TOO-STEEP": { refs: ["FAULT-OTT", "steep", "path left", "low point", "upper-body pull"], categories: ["club_face_path", "ground_force", "contact_lowpoint"], lanes: ["club", "body"] },
    "FAULT-TOO-SHALLOW": { refs: ["path right", "stuck", "body stalls", "release timing"], categories: ["club_face_path", "ground_force"], lanes: ["club", "body"] },
    "FAULT-PATH-LEFT": { refs: ["FAULT-OTT", "path left", "swing direction left", "alignment"], categories: ["club_face_path", "ground_force"], lanes: ["club", "body", "strategy"] },
    "FAULT-PATH-RIGHT": { refs: ["path right", "stuck", "FAULT-ALL-TURN-NO-SHIFT", "lateral recenter"], categories: ["club_face_path", "ground_force"], lanes: ["club", "body"] },
    "FAULT-FACE-CLOSED": { refs: ["FAULT-FACE-CLOSED", "start-line variance", "toe strike", "release timing"], categories: ["club_face_path", "contact_lowpoint"], lanes: ["club"] },
    "FAULT-SPIN-LOFT-LOSS": { refs: ["FAULT-WEAK-SMASH", "spin loft", "dynamic loft", "off-center strike"], categories: ["speed", "club_face_path", "contact_lowpoint"], lanes: ["club", "equipment"] },
    "FAULT-LOSS-POSTURE": { refs: ["FAULT-EARLY-EXT", "early extension", "hip depth", "space"], categories: ["ground_force", "contact_lowpoint"], lanes: ["body"] },
    "FAULT-SWAY": { refs: ["FAULT-SLIDE", "lateral load timing", "trail hip load", "pressure shift"], categories: ["ground_force"], lanes: ["body"] },
    "FAULT-HANG-BACK": { refs: ["FAULT-ALL-TURN-NO-SHIFT", "lateral recenter", "trail-side", "low point"], categories: ["ground_force", "contact_lowpoint"], lanes: ["body"] },
    "FAULT-SPIN-OUT": { refs: ["FAULT-ALL-TURN-NO-SHIFT", "torque too early", "arms left behind", "path left"], categories: ["ground_force", "club_face_path"], lanes: ["body"] },
    "FAULT-ARM-LIFT": { refs: ["width", "turn depth", "disconnected", "backswing"], categories: ["ground_force", "club_face_path"], lanes: ["body"] },
    "FAULT-OVER-SWING": { refs: ["tempo", "transition tempo", "overrun", "speed intent"], categories: ["speed", "psychology"], lanes: ["body", "psych"] },
    "FAULT-SHORT-BACKSWING": { refs: ["restricted", "mobility", "turn", "warmup"], categories: ["warmup_prep", "ground_force"], lanes: ["body"] },
    "FAULT-TEMPO-RUSH": { refs: ["transition tempo", "rhythm under speed", "tempo", "pressure"], categories: ["psychology", "speed"], lanes: ["psych", "body"] },
    "FAULT-FREEZE-BALL": { refs: ["internal focus", "routine", "pressure", "target focus"], categories: ["psychology", "course_transfer"], lanes: ["psych"] },
    "FAULT-NUMBER-CHASE": { refs: ["feedback dependency", "numbers", "TrackMan", "bandwidth"], categories: ["psychology", "course_transfer"], lanes: ["psych"] },
    "FAULT-AIM-MISMATCH": { refs: ["alignment", "routine", "target", "start-line variance"], categories: ["course_transfer", "club_face_path"], lanes: ["strategy"] },
    "FAULT-CLUB-SELECTION-MISMATCH": { refs: ["distance band", "carry window", "course management", "wedge matrix"], categories: ["course_transfer", "short_game"], lanes: ["strategy"] },
    "FAULT-DRIVER-SETUP-MISMATCH": { refs: ["tee height", "driver setup", "launch", "Optimizer", "FAULT-EQUIP-LIE-LOFT"], categories: ["club_face_path", "contact_lowpoint"], lanes: ["equipment", "club"] },
    "FAULT-IRON-SPEC-MISMATCH": { refs: ["lie angle", "length", "shaft", "FAULT-EQUIP-LIE-LOFT", "heel strike", "toe strike"], categories: ["club_face_path", "contact_lowpoint"], lanes: ["equipment", "club"] }
  };

  const branch = (suffix, label, question, indicators, tests, refs, categories, lanes, next, avoid) => ({
    id: suffix,
    label,
    question,
    indicators,
    tests,
    refs,
    categories,
    lanes,
    next,
    avoid,
    source_tags: ["FM-300 Diagnostic ladder", "FM-256 Fault-to-force map", "Coach review required"]
  });

  window.FF_DIAGNOSTIC_BRANCHES = {
    "FAULT-SLICE": [
      branch("face-start", "Face-start slice", "Does the ball start right of target before curving more right?", ["Start line right", "Face open at impact", "Player often aims left to survive"], ["Start-line gate", "TrackMan face angle / face-to-path cluster", "Face tape for heel strike"], ["FAULT-FACE-OPEN", "start-line variance", "heel strike"], ["club_face_path", "contact_lowpoint"], ["club"], "Start with face/start-line ownership before path rebuild.", "Do not prescribe path change first if start line is already right."),
      branch("pull-cut", "Pull-cut / over-the-top slice", "Does it start left then curve right?", ["Start line left", "Path/swing direction left", "Steep or upper-body transition"], ["TrackMan club path + face-to-path", "Step drill screen", "Ball-flight start/curve chart"], ["FAULT-OTT", "path left", "steep", "upper-body pull"], ["club_face_path", "ground_force"], ["club", "body"], "Use path/transition constraint after face is safe enough.", "Do not chase a draw if contact is unstable."),
      branch("heel-gear", "Heel-strike gear slice", "Is curvature mostly coming from heel contact?", ["Heel pattern", "Driver worse than irons", "Smash/ball speed leak"], ["Face spray cluster", "Length/setup A-B test", "Optimizer if driver-only"], ["heel strike", "FAULT-WEAK-SMASH", "length", "driver setup"], ["contact_lowpoint", "club_face_path"], ["club", "equipment"], "Solve strike/fit before face-path coaching.", "Do not rebuild swing around an equipment/strike artifact.")
    ],
    "FAULT-HOOK": [
      branch("closed-face", "Closed-face hook", "Does the ball start left or shut down immediately?", ["Start line left", "Face closed", "Toe/roll pattern possible"], ["Start-line gate", "TrackMan face angle", "Grip/face check"], ["FAULT-FACE-CLOSED", "start-line variance", "toe strike"], ["club_face_path", "contact_lowpoint"], ["club"], "Own face/start line before adding path variability.", "Do not use more release drills."),
      branch("push-hook", "Path-right push hook", "Does it start right then over-curve left?", ["Path too far right", "Body stalls", "Club stuck behind"], ["TrackMan path / face-to-path", "Random target curve ladder", "Step/recenter screen"], ["path right", "stuck", "body stalls", "release timing"], ["club_face_path", "ground_force"], ["club", "body"], "Reduce excessive in-to-out path and improve rotation/exit.", "Do not add more inside-out intent."),
      branch("toe-gear", "Toe-strike gear hook", "Is the hook strongest on toe strikes?", ["Toe marks", "Smash leak", "Driver fairway miss left"], ["Face spray", "Setup distance ladder", "Length A-B test"], ["toe strike", "contact location", "FAULT-WEAK-SMASH"], ["contact_lowpoint"], ["club", "equipment"], "Center strike before face-path prescription.", "Do not label as release issue from one curved shot.")
    ],
    "FAULT-CHUNK": [
      branch("lowpoint-back", "Low point behind ball", "Is turf contact consistently behind the ball?", ["Divot starts behind ball", "Fat wedges/irons", "Ground fear"], ["Line-in-front brush", "Towel-behind-ball", "TrackMan low-point / AoA cluster"], ["FAULT-LOWPOINT", "low point behind", "ball-first contact"], ["contact_lowpoint"], ["club", "ball"], "Use low-point constraints and short swings first.", "Do not add speed or pressure."),
      branch("trail-hang", "Trail-side hang-back chunk", "Does pressure fail to recenter before impact?", ["Trail-side finish", "High handle or heavy contact", "Driver upward intent bleeds into irons"], ["Step drill", "Wall-post brake", "Pressure/recenter observation"], ["FAULT-ALL-TURN-NO-SHIFT", "lateral recenter", "trail-side", "FAULT-SLIDE"], ["ground_force", "contact_lowpoint"], ["body"], "Recenter and brake before contact ladder.", "Do not cue vertical/jump first."),
      branch("cast-dump", "Cast / early-release chunk", "Does the club dump early and add dynamic loft?", ["Early release", "Handle stalls", "Balloon + fat pattern"], ["Impact bag handle-forward press", "Dynamic loft window", "9-to-3 contact window"], ["cast", "early release", "FAULT-DYNAMIC-LOFT-HIGH"], ["club_face_path", "contact_lowpoint"], ["club"], "Use delivery/impact window after low-speed contact is safe.", "Do not overuse internal wrist cues.")
    ],
    "FAULT-TOP": [
      branch("lowpoint-miss", "Low-point / brush miss", "Is the club missing the ground or bottoming too late?", ["No divot/brush", "Thin/top mix", "Player afraid of turf"], ["Line-in-front brush", "Ball-position ladder", "9-to-3 contact window"], ["FAULT-LOWPOINT", "thin strike", "ball-first contact"], ["contact_lowpoint"], ["club", "ball"], "Build brush ownership at low speed.", "Do not jump to full-swing speed work."),
      branch("early-extend", "Space-loss top", "Does the pelvis/handle move toward the ball?", ["Stand-up pattern", "Toe/heel chaos", "Posture loss"], ["Chair/wall space check", "Heel-toe setup ladder", "TrackMan pelvis/3D review"], ["FAULT-EARLY-EXT", "early extension", "hip depth", "space"], ["ground_force", "contact_lowpoint"], ["body"], "Use space/ground constraint, then contact retest.", "Do not cue keep-your-head-down."),
      branch("setup-ballpos", "Setup / ball-position top", "Does contact improve immediately when setup changes?", ["Ball too far forward/back", "Inconsistent distance from ball", "Club length suspicion"], ["Ball-position ladder", "Setup distance ladder", "Static equipment screen"], ["ball position", "setup distance", "length"], ["contact_lowpoint", "club_face_path"], ["equipment", "club"], "Confirm setup variable before motor-change block.", "Do not prescribe swing rebuild if setup fixes cluster.")
    ],
    "FAULT-TOO-STEEP": [
      branch("transition-pull", "Upper-body transition pull", "Does the steepness appear immediately from the top?", ["Shoulders open early", "Path left", "Pull/fade or pull"], ["Step drill", "Heel stamp", "TrackMan path / swing direction"], ["FAULT-OTT", "upper-body pull", "path left"], ["ground_force", "club_face_path"], ["body", "club"], "Use recenter/transition constraint before face/path fine-tuning.", "Do not tell player simply to shallow the club."),
      branch("lead-crash", "Lead-side crash / no brake", "Does the player slide or crash into lead side?", ["Heavy contact", "Low point behind/variable", "Lead hip keeps drifting"], ["Wall-post brake", "Carpet drag A-P brake", "Downhill-lie brake-and-turn"], ["FAULT-SLIDE", "low point", "lead-side braking"], ["ground_force", "contact_lowpoint"], ["body"], "Train brake/turn and retest strike.", "Avoid high-speed vertical-force drills first."),
      branch("face-open-save", "Steepness as face-open save", "Is steep/left move protecting an open face?", ["Slice/pull-cut", "Face open", "Player hates right miss"], ["Face-angle corridor", "Start-line gate", "Face-to-path cluster"], ["FAULT-FACE-OPEN", "start-line variance", "FAULT-OTT"], ["club_face_path"], ["club"], "Stabilize face before path change.", "Do not remove steepness while face is still open.")
    ],
    "FAULT-TOO-SHALLOW": [
      branch("stuck-behind", "Stuck behind body", "Does the club get trapped behind with blocks/hooks?", ["Push or push-hook", "Late face closure", "Body stalls"], ["Face-to-path corridor", "Curve-control ladder", "Step/recenter screen"], ["path right", "stuck", "body stalls"], ["club_face_path", "ground_force"], ["club", "body"], "Add exit/rotation task and start-line proof.", "Do not add more depth or drop cues."),
      branch("underplane-contact", "Under-plane contact chaos", "Is shallow delivery causing fat/thin or toe strikes?", ["Low-point chaos", "Toe pattern", "Handle raises"], ["Face spray", "Low-point brush", "Setup-distance ladder"], ["toe strike", "FAULT-LOWPOINT", "contact location"], ["contact_lowpoint"], ["club", "body"], "Own strike before shaping work.", "Do not use random transfer yet."),
      branch("draw-intent-overdone", "Overdraw intent / strategy distortion", "Is the player trying to hit too much draw?", ["Aim right", "Miss left/right both ways", "Target fear"], ["No-go miss game", "Start-line gate", "Curve-control ladder"], ["target", "alignment", "curve chaos"], ["course_transfer", "club_face_path"], ["strategy", "club"], "Reframe target window and acceptable curve.", "Do not make mechanical changes without decision audit.")
    ],
    "FAULT-BALLOON": [
      branch("dynamic-loft", "Dynamic loft too high", "Is launch/spin high with center-ish contact?", ["High launch", "High spin", "Weak flight"], ["Dynamic loft window", "Impact bag press", "TrackMan launch/spin cluster"], ["FAULT-DYNAMIC-LOFT-HIGH", "spin loft", "dynamic loft"], ["contact_lowpoint", "club_face_path"], ["club"], "Reduce spin-loft through delivery task.", "Do not chase lower flight by steering."),
      branch("strike-low-face", "Low-face strike spin", "Is spin high because strike is low on the face?", ["Low-face spray marks", "Driver spins", "Smash leak"], ["Face-spray cluster", "Tee-height test", "Optimizer"], ["low face", "FAULT-WEAK-SMASH", "tee height"], ["contact_lowpoint", "club_face_path"], ["club", "equipment"], "Solve strike/tee before swing rebuild.", "Do not change shaft/loft from one cluster."),
      branch("equipment-spin", "Equipment loft/spin mismatch", "Do launch conditions change with setup or club setting?", ["One club only", "Loft sleeve changes matter", "Shaft/loft suspicion"], ["Optimizer", "Driver loft-spin window check", "5-ball A-B clusters"], ["Optimizer", "FAULT-EQUIP-LIE-LOFT", "launch"], ["club_face_path"], ["equipment"], "Treat as equipment triage, not daily drill.", "Do not fit around a temporary swing pattern.")
    ],
    "FAULT-SHANK": [
      branch("heel-handle-out", "Handle-out heel delivery", "Does the handle/club move outward into impact?", ["Hosel/heel marks", "Open face", "Panic steering"], ["Face spray", "Heel-toe setup ladder", "Start-line gate"], ["heel strike", "handle out", "FAULT-FACE-OPEN"], ["contact_lowpoint", "club_face_path"], ["club"], "Use strike-location constraints and widen confidence.", "Do not over-cue hands."),
      branch("setup-distance", "Setup distance / posture trigger", "Does changing distance from ball reduce hosel contact?", ["Too close/far", "Posture loss", "Club length suspicion"], ["Setup distance ladder", "Static equipment screen", "Face tape cluster"], ["setup distance", "length", "contact location"], ["contact_lowpoint"], ["equipment", "club"], "Rule out setup/equipment first.", "Do not diagnose swing path from one panic shank."),
      branch("threat-response", "Shank as threat response", "Does it appear under pressure or after one bad one?", ["Fear spiral", "Ball-bound freeze", "Steering"], ["Box breath reset", "Jargon-free constraint", "No-score rebuild set"], ["pressure", "panic steering", "internal focus"], ["psychology", "contact_lowpoint"], ["psych"], "Stabilize state and task simplicity.", "Do not add more technical details mid-spiral.")
    ],
    "FAULT-NUMBER-CHASE": [
      branch("continuous-feedback", "Continuous-feedback dependency", "Does performance collapse when the screen is hidden?", ["Looks at every number", "Cannot predict feel", "Metric chasing"], ["Ball-flight prediction card", "Radar prediction game", "Covered-screen clusters"], ["feedback dependency", "bandwidth", "prediction"], ["psychology", "course_transfer"], ["psych"], "Use delayed reveal and prediction first.", "Do not add more live metrics."),
      branch("wrong-score", "Wrong success score", "Is the player optimizing the wrong number for the task?", ["CHS up but ball worse", "Path number good but score worse", "No task metric"], ["Define proof metric", "Performance Center task", "Acceptable-shot score"], ["TrackMan", "acceptable-shot", "Performance Center"], ["course_transfer", "psychology"], ["strategy", "psych"], "Change the scoreboard to task success.", "Do not reward pretty numbers that fail transfer."),
      branch("threat-metric", "Metric creates threat", "Does screen visibility increase tension or rush?", ["Tempo rush", "Freeze", "Avoids misses"], ["No-screen set", "Box breath reset", "Process/outcome split"], ["pressure", "tempo", "internal focus"], ["psychology"], ["psych"], "Reduce threat and rebuild autonomy.", "Do not use public leaderboards early.")
    ],
    "FAULT-DRIVER-SETUP-MISMATCH": [
      branch("tee-ballpos", "Tee height / ball-position mismatch", "Does launch/strike change immediately with tee or ball position?", ["Skyball/low-face", "Attack mismatch", "Driver-only issue"], ["Tee-height ladder", "Ball-position ladder", "Optimizer cluster"], ["tee height", "ball position", "attack angle", "launch"], ["contact_lowpoint", "club_face_path"], ["equipment", "club"], "Fix setup before delivery block.", "Do not change swing to solve bad setup."),
      branch("loft-spin", "Loft / sleeve / spin mismatch", "Do loft setting changes improve launch-spin without worse strike?", ["High/low spin", "Carry loss", "Driver fitting uncertainty"], ["Driver loft-spin window", "Optimizer", "5-ball setting A-B"], ["Optimizer", "loft", "spin", "launch"], ["club_face_path"], ["equipment"], "Use equipment triage with cluster averages.", "Do not react to one shot."),
      branch("length-strike", "Length / shaft affects strike", "Does choke-down or test length improve center contact?", ["Heel/toe pattern", "Smash leak", "Long driver control issue"], ["Length / strike A-B", "Face spray", "Smash factor retest"], ["length", "center strike", "FAULT-WEAK-SMASH"], ["contact_lowpoint"], ["equipment", "club"], "Recommend fitting review if repeatable.", "Do not fit during fatigue or new swing install.")
    ]
  };

  const slugify = s => String(s || "branch").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "branch";
  const titleCase = s => String(s || "Pattern branch").replace(/\b\w/g, ch => ch.toUpperCase());
  const uniq = xs => [...new Set((xs || []).filter(Boolean))];
  const classifyCause = cause => {
    const c = String(cause || "").toLowerCase();
    if (/aim|alignment|target|routine|decision|club selection|carry|dispersion|pin|course|visual/.test(c)) return "strategy";
    if (/fear|panic|threat|anxiety|tempo|rush|freeze|thought|confidence|pressure|over-correction|internal/.test(c)) return "psych";
    if (/lie|loft|shaft|length|weight|grip|equipment|sleeve|club|tee|ball position|too-short|setup distance|too close to ball|too far from ball/.test(c)) return "equipment";
    if (/mobility|stability|posture|pelvis|hip|turn|body|pivot|sway|slide|hang|stall|rotation|pressure|force|brake|load|lateral|upper-body|arms/.test(c)) return "body";
    if (/low point|strike|heel|toe|contact|thin|fat|turf|ground|smash|face|path|release|dynamic loft|attack|spin|launch|handle|shaft/.test(c)) return "club";
    return "ball";
  };
  const branchPreset = (cause, fault, map) => {
    const type = classifyCause(cause);
    const common = {
      strategy: {
        indicators: ["Decision or target choice changes the miss", "Pattern appears with certain holes/targets", "Static technique may test cleaner than play"],
        tests: ["Target-line audit", "No-go miss decision card", "One-ball routine score"],
        categories: ["course_transfer", "club_face_path"],
        lanes: ["strategy"],
        next: "Prove the decision layer before changing mechanics.",
        avoid: "Do not rebuild a swing when the target/routine is creating the miss."
      },
      psych: {
        indicators: ["Pattern worsens under score, screen, or consequence", "Tempo or steering changes after a miss", "Player reports too many thoughts"],
        tests: ["No-screen / no-score cluster", "Box-breath reset set", "Prediction-before-reveal game"],
        categories: ["psychology", "course_transfer"],
        lanes: ["psych"],
        next: "Reduce threat, simplify the task, then retest the ball pattern.",
        avoid: "Do not add more technical detail while the nervous system is guarding."
      },
      equipment: {
        indicators: ["Pattern is club-specific", "Static setup changes the miss quickly", "Strike/launch shifts with simple A-B equipment changes"],
        tests: ["Static equipment screen", "5-ball A-B cluster", "Optimizer or face-spray confirmation"],
        categories: ["club_face_path", "contact_lowpoint"],
        lanes: ["equipment", "club"],
        next: "Run equipment/setup triage before assigning a motor-change block.",
        avoid: "Do not fit or rebuild from a single shot or fatigue-red session."
      },
      body: {
        indicators: ["Movement pattern changes delivery", "Balance, pressure, posture, or sequencing clue is visible", "No-ball rehearsal differs from ball swing"],
        tests: ["No-ball movement screen", "Slow-to-ball transfer cluster", "TrackMan 3D / video checkpoint"],
        categories: ["ground_force", "contact_lowpoint", "club_face_path"],
        lanes: ["body", "club"],
        next: "Use one external movement constraint, then prove ball-flight change.",
        avoid: "Do not stack internal body-part cues during the swing."
      },
      club: {
        indicators: ["Club, face, path, strike, or low point explains ball flight", "Metric or strike evidence clusters consistently", "Pattern is repeatable with one club/shot"],
        tests: ["3-shot TrackMan cluster", "Face-spray or low-point line", "Start/curve/contact proof set"],
        categories: ["club_face_path", "contact_lowpoint"],
        lanes: ["club"],
        next: "Assign the smallest club/ball constraint that changes the proof metric.",
        avoid: "Do not move to pressure before the club/strike proof is stable."
      },
      ball: {
        indicators: ["Ball flight is the clearest symptom", "Start, curve, launch, height, or contact window clusters", "Cause is not yet separable"],
        tests: ["Baseline ball-flight map", "Start-line / curve chart", "3-club comparison cluster"],
        categories: map?.categories || ["club_face_path", "contact_lowpoint"],
        lanes: map?.lanes || [fault?.layer || "ball"],
        next: "Map the ball pattern, then choose the narrowest cause test.",
        avoid: "Do not guess the cause from one ball flight."
      }
    };
    return common[type] || common.ball;
  };
  const makeBranchFromCause = (fault, cause, index) => {
    const map = window.FF_FAULT_DRILL_MAP?.[fault.id] || {};
    const preset = branchPreset(cause, fault, map);
    const refs = uniq([cause, ...(map.refs || []).slice(0, 3)]);
    return branch(
      slugify(cause),
      titleCase(cause),
      "Is this version mainly driven by " + cause + "?",
      uniq([cause, ...(preset.indicators || [])]).slice(0, 4),
      uniq(preset.tests || ["3-shot cluster", "Coach observation", "Retest"]).slice(0, 4),
      refs,
      uniq([...(preset.categories || []), ...(map.categories || []).slice(0, 2)]),
      uniq([...(preset.lanes || []), ...(map.lanes || []).slice(0, 2)]),
      preset.next,
      preset.avoid
    );
  };

  (window.FF_FAULTS || []).forEach(fault => {
    if (window.FF_DIAGNOSTIC_BRANCHES[fault.id]?.length) return;
    const causes = (fault.causes || ["dominant pattern"]).slice(0, 4);
    window.FF_DIAGNOSTIC_BRANCHES[fault.id] = causes.map((cause, i) => makeBranchFromCause(fault, cause, i));
  });

  /* -------------------------------------------------------------------------
     Curated diagnostic overrides
     -------------------------------------------------------------------------
     The generator above guarantees coverage. These authored cards replace the
     highest-frequency full-swing patterns where a coach needs sharper "which
     version is this?" logic before prescribing drills.
  ------------------------------------------------------------------------- */
  const curated = {
    "FAULT-PUSH": [
      branch("face-right", "Face-right push", "Does the ball start right and stay mostly straight?", ["Start line right", "Face angle right of target", "Curve is small or neutral"], ["Start-line gate", "TrackMan face-angle cluster", "Covered-screen prediction set"], ["FAULT-FACE-OPEN", "start-line variance", "face angle"], ["club_face_path"], ["club"], "Own face/start-line first with a gate or corridor before changing path.", "Do not add path-left work if the face is the dominant start-line error."),
      branch("path-right-face-matches", "Path-right with matching face", "Is path too far right and face roughly traveling with it?", ["Starts right", "Face-to-path near neutral", "Player may aim left or overdraw intent"], ["Club-path / face-to-path cluster", "Alignment audit", "Neutral-start corridor"], ["path right", "alignment", "overdraw intent"], ["club_face_path", "course_transfer"], ["club", "strategy"], "Reduce excessive in-to-out delivery and retest neutral start windows.", "Do not close the face more; that turns this into a hook pattern."),
      branch("alignment-right", "Body/target alignment push", "Does the shot match where the player is actually aimed?", ["Feet/shoulders aimed right", "Face may match body line", "Looks like a push only relative to target"], ["Laser alignment audit", "Face/body mismatch card", "One-ball target routine"], ["alignment", "target", "routine"], ["course_transfer"], ["strategy"], "Solve the aim/routine layer before changing mechanics.", "Do not rebuild a functional pattern aimed at the wrong target.")
    ],
    "FAULT-PULL": [
      branch("face-left", "Face-left pull", "Does the ball start left and fly mostly straight?", ["Start line left", "Face angle left of target", "Curve is small"], ["Start-line gate", "TrackMan face-angle cluster", "Face-to-target prediction"], ["FAULT-FACE-CLOSED", "start-line variance", "face angle"], ["club_face_path"], ["club"], "Own face/start-line before changing path or body motion.", "Do not add more path-right unless face control is safe."),
      branch("path-left-pull", "Path-left pull", "Is the swing direction/path left enough to launch the ball left?", ["Path left", "Shoulders may open early", "Divot/swing direction left"], ["TrackMan path/swing-direction cluster", "Path gate", "Step-and-exit screen"], ["path left", "FAULT-OTT", "upper-body pull"], ["club_face_path", "ground_force"], ["club", "body"], "Use an external path/transition constraint, then retest start line.", "Do not tell the player to swing to right field if contact collapses."),
      branch("target-panic-pull", "Target-panic pull", "Does the pull appear when the player fears the right miss?", ["Pull appears on right-trouble targets", "Tempo quickens", "Face/path both shift left"], ["No-go miss decision card", "No-screen routine set", "Pressure contrast cluster"], ["target panic", "pressure", "routine"], ["psychology", "course_transfer"], ["psych", "strategy"], "Stabilize target commitment and acceptable miss before mechanics.", "Do not add technical instructions during a threat-response set.")
    ],
    "FAULT-PUSH-SLICE": [
      branch("open-face-first", "Open-face first", "Is the ball starting right because the face is open before curve even matters?", ["Start line right", "Face open", "Curve increases with speed"], ["Start-line gate", "Face-angle corridor", "Grip/face awareness check"], ["FAULT-FACE-OPEN", "start-line variance"], ["club_face_path"], ["club"], "Stabilize face/start before any path rebuild.", "Do not chase shallowing or draw path until start line is playable."),
      branch("heel-open-combo", "Heel plus open-face combo", "Is heel strike adding gear-effect curve on top of an open face?", ["Heel marks", "Driver worse than irons", "Smash factor leak"], ["Face-spray cluster", "Tee/setup A-B", "Face-to-path plus strike map"], ["heel strike", "FAULT-WEAK-SMASH", "driver setup"], ["contact_lowpoint", "club_face_path"], ["club", "equipment"], "Move strike toward center, then retest face-to-path.", "Do not solve this with face roll drills alone."),
      branch("stall-late-face", "Stall with late face closure", "Does the body stall while the clubface never catches up?", ["Blocks and push-slices together", "Trail-side finish", "Late release"], ["Step/recenter screen", "Exit corridor", "Face-to-path cluster"], ["FAULT-ALL-TURN-NO-SHIFT", "late face", "release timing"], ["ground_force", "club_face_path"], ["body", "club"], "Use recenter/exit constraint with one face-proof metric.", "Do not stack body, wrist, and path cues in one block.")
    ],
    "FAULT-PULL-HOOK": [
      branch("shut-face-start", "Shut-face start", "Does the shot start left before curvature appears?", ["Start line left", "Face closed", "Low-left flight possible"], ["Start-line gate", "Face-angle cluster", "Grip/face checkpoint"], ["FAULT-FACE-CLOSED", "strong grip", "start-line variance"], ["club_face_path"], ["club"], "Open the start window through external face tasks before adding path work.", "Do not add more release or roll intent."),
      branch("flip-left", "Flip/roll pull-hook", "Does the club overtake early and send face/path left?", ["Early roll", "Toe closure", "Dynamic loft may change"], ["Slow-motion release audit", "Face-to-path cluster", "9-to-3 start-line proof"], ["release timing", "toe strike", "FAULT-DYNAMIC-LOFT-HIGH"], ["club_face_path", "contact_lowpoint"], ["club"], "Use release-timing constraints and proof with small swings first.", "Do not speed train this version until face is stable."),
      branch("path-left-face-left", "Everything left", "Are both face and path traveling left as a pattern?", ["Start left", "Divot/path left", "Over-rotated or spin-out look"], ["Path/face cluster", "Alignment audit", "Exit corridor"], ["path left", "spin out", "alignment"], ["club_face_path", "ground_force"], ["club", "body"], "Separate alignment from delivery, then test neutral exit windows.", "Do not assume this is only a hand-release problem.")
    ],
    "FAULT-BLOCK": [
      branch("body-outraces-club", "Body outraces club", "Does rotation get open while the clubface stays behind?", ["Right start", "Late face", "Open chest/hips early"], ["Face-to-path cluster", "Exit/finish audit", "Slow-to-normal speed ladder"], ["body outraces club", "late release", "FAULT-FACE-OPEN"], ["club_face_path", "ground_force"], ["body", "club"], "Re-time exit and face delivery without adding internal hand cues.", "Do not simply slow the body down unless speed/strike proof improves."),
      branch("trail-hang-block", "Trail-side hang-back block", "Does pressure fail to get forward enough for the club to release?", ["Trail-side finish", "High right miss", "Low point back or high handle"], ["Step drill screen", "Lead-side finish gate", "TrackMan low-point/AoA cluster"], ["trail-side hang back", "lateral recenter", "low point"], ["ground_force", "contact_lowpoint"], ["body"], "Use recenter and finish constraints, then retest start line.", "Do not add face-closure drills before pressure order is tested."),
      branch("driver-fit-block", "Driver setup/fit block", "Is the block driver-specific and sensitive to length, loft, or tee height?", ["Driver-only right miss", "Contact drifts heel/toe", "Launch window unstable"], ["Face-spray with driver", "Tee-height / ball-position ladder", "Length/choke-down A-B"], ["driver setup", "length", "tee height"], ["contact_lowpoint", "club_face_path"], ["equipment", "club"], "Rule out setup/fit before prescribing a swing-change block.", "Do not fit around a one-day fear pattern.")
    ],
    "FAULT-DOUBLE-CROSS": [
      branch("face-variance", "Face variance", "Are left and right misses mostly start-line/face errors?", ["Starts both sides", "Face SD high", "Curve may be small"], ["10-shot start-line map", "Face-angle SD cluster", "Covered-screen prediction"], ["start-line variance", "FAULT-FACE-OPEN", "FAULT-FACE-CLOSED"], ["club_face_path"], ["club"], "Shrink face/start-line variance before shot-shape tasks.", "Do not let the player choose two swing thoughts for two misses."),
      branch("path-face-crossover", "Path/face crossover", "Does face-to-path flip signs across shots?", ["One shot push/slice, next pull/hook", "Timing-dependent", "Pattern worse at speed"], ["Face-to-path sign map", "Speed-stepdown test", "One-shape-only corridor"], ["face/path relationship unstable", "release timing", "tempo"], ["club_face_path", "psychology"], ["club", "psych"], "Reduce speed and own one curve window before random practice.", "Do not add pressure until face-to-path sign is predictable."),
      branch("fear-compensation", "Fear compensation", "Does the miss flip based on what the player is avoiding?", ["Trouble changes intention", "Aim/commitment varies", "Tempo changes under consequence"], ["No-go miss card", "Routine commitment score", "Pressure/no-pressure contrast"], ["target fear", "over-correction", "routine breakdown"], ["course_transfer", "psychology"], ["strategy", "psych"], "Solve decision/routine and acceptable miss before technical layering.", "Do not call this a swing flaw until the target layer is clean.")
    ],
    "FAULT-THIN": [
      branch("lowpoint-forward-high", "Low point too high or late", "Is the club bottoming out too high or after the ball?", ["Thin contact", "Minimal turf", "Launch low or weak"], ["Line-in-front brush", "Low-point ladder", "3-shot contact proof"], ["thin strike", "low point", "ball-first contact"], ["contact_lowpoint"], ["club", "ball"], "Rebuild brush depth with short swings and external turf targets.", "Do not say keep your head down."),
      branch("handle-raise-space", "Handle raise / space loss", "Does the handle move up or out through impact?", ["Toe/heel chaos", "Early extension look", "Posture rises"], ["Chair/wall space check", "Face-spray cluster", "Setup-distance ladder"], ["handle raise", "early extension", "space"], ["ground_force", "contact_lowpoint"], ["body", "club"], "Use a space/handle-height constraint, then retest contact.", "Do not add wrist-lag cues if the body is creating the space problem."),
      branch("ballpos-thin", "Ball-position thin", "Does contact normalize when ball position changes?", ["Thin with certain clubs", "Setup varies by shot", "Immediate improvement with station"], ["Ball-position ladder", "Club-by-club setup audit", "Low-point cluster"], ["ball position", "setup variability", "length"], ["contact_lowpoint"], ["equipment", "club"], "Fix the station first; only prescribe motor change if thin pattern remains.", "Do not overinterpret a setup artifact.")
    ],
    "FAULT-TOE-STRIKE": [
      branch("retract-inward", "Club retracts inward", "Is the clubhead moving inward away from the ball into impact?", ["Toe marks", "Hooks from gear effect", "Handle may raise"], ["Face-spray cluster", "Toe/heel strike map", "Path plus strike cluster"], ["toe strike", "club retracts inward", "contact location"], ["contact_lowpoint", "club_face_path"], ["club"], "Use strike-location constraints before face/path interpretation.", "Do not diagnose closed face from toe-gear hook alone."),
      branch("space-loss-toe", "Early-extension toe strike", "Does standing up pull the club away from the ball?", ["Pelvis moves toward ball", "Arms retract", "Toe/low-face combo"], ["Chair/wall space check", "Slow-ball space proof", "TrackMan 3D pelvis review"], ["early extension", "space", "hip depth"], ["ground_force", "contact_lowpoint"], ["body"], "Solve space and ground-force order, then retest strike.", "Do not tell the player to reach for the ball."),
      branch("too-short-or-far", "Too short / too far setup", "Does equipment or address distance create toe contact?", ["Toe marks across clubs", "Standing far from ball", "Choke/length sensitivity"], ["Setup-distance ladder", "Choke-up/down A-B", "Static length/lie screen"], ["too-short club", "setup distance", "length"], ["contact_lowpoint"], ["equipment", "club"], "Recommend fitting/setup review if A-B clusters repeat.", "Do not rebuild delivery around poor length or station.")
    ],
    "FAULT-HEEL-STRIKE": [
      branch("handle-out", "Handle-out heel strike", "Does the handle/club travel outward into impact?", ["Heel marks", "Shank risk", "Path may move left"], ["Face-spray cluster", "Handle-path visual gate", "Start/strike proof"], ["heel strike", "handle out", "path left"], ["contact_lowpoint", "club_face_path"], ["club"], "Use strike gate and external handle/clubhead task before curve coaching.", "Do not add more out-to-in path work."),
      branch("crowded-or-long", "Crowded / too-long setup", "Does moving slightly farther or choking down improve strike?", ["Too close to ball", "Upright handle", "Long club suspicion"], ["Setup-distance ladder", "Choke-down A-B", "Lie/length screen"], ["too close to ball", "length", "shaft/lie fit"], ["contact_lowpoint"], ["equipment", "club"], "Correct address/equipment variable before motor-learning block.", "Do not make a posture diagnosis from an overlength club."),
      branch("open-face-heel", "Open face plus heel delivery", "Is heel strike paired with an open face/right curve?", ["Heel contact", "Slice/push-slice", "Face stays open"], ["Face-to-path plus strike map", "Start-line gate", "Face-spray cluster"], ["FAULT-FACE-OPEN", "heel strike", "start-line variance"], ["club_face_path", "contact_lowpoint"], ["club"], "Center strike and face together with one task metric.", "Do not fix curve without measuring strike.")
    ],
    "FAULT-CENTER-CONTACT-CHAOS": [
      branch("setup-variability", "Setup variability", "Does contact location change with inconsistent station?", ["Ball distance varies", "Posture changes", "Club-by-club setup unclear"], ["Static station audit", "Setup-distance ladder", "5-shot same-station retest"], ["setup variability", "setup distance", "ball position"], ["contact_lowpoint"], ["equipment", "club"], "Standardize the station before labeling movement faults.", "Do not prescribe multiple drills for a station problem."),
      branch("tempo-chaos", "Tempo-driven contact chaos", "Does contact scatter when tempo or speed changes?", ["Good slow, poor fast", "Rushed transition", "Contact worsens under radar"], ["Tempo contrast cluster", "Metronome/no-metronome A-B", "Speed-stepdown strike map"], ["tempo variability", "rushed transition", "speed intent"], ["psychology", "contact_lowpoint"], ["psych", "club"], "Use rhythm constraints and bandwidth feedback before technical detail.", "Do not chase every strike mark with a new cue."),
      branch("feedback-overload", "Feedback-overload contact chaos", "Does too much information make strike worse?", ["Looks at every metric", "Many swing thoughts", "Cannot self-predict"], ["No-screen cluster", "One-cue-only set", "Prediction-before-reveal"], ["feedback overload", "internal focus", "prediction"], ["psychology", "course_transfer"], ["psych"], "Reduce feedback frequency and restore self-detection.", "Do not add another tool or metric.")
    ],
    "FAULT-LOSS-POSTURE": [
      branch("pelvis-toward-ball", "Pelvis moves toward ball", "Is hip depth lost as the player approaches impact?", ["Belt line moves toward ball", "Handle raises", "Toe/heel chaos"], ["Chair/wall space check", "Slow-ball space proof", "TrackMan 3D pelvis trace"], ["FAULT-EARLY-EXT", "hip depth", "space"], ["ground_force", "contact_lowpoint"], ["body"], "Use external space constraints and prove strike change.", "Do not cue spine angle or keep-head-down live."),
      branch("mobility-stability-limit", "Mobility/stability limiter", "Can the player access the shape without a ball?", ["Cannot hinge/rotate comfortably", "Pain or restriction", "Rehearsal also fails"], ["No-ball movement screen", "Pain/readiness gate", "Range-of-motion prep retest"], ["mobility/stability limit", "pain gate", "warmup"], ["warmup_prep", "ground_force"], ["body"], "Route to prep/regression before swing-change volume.", "Do not force range or speed through a red gate."),
      branch("space-compensation", "Space compensation for face/path", "Is posture loss helping the player find face or avoid a miss?", ["Posture loss changes with target", "Face/path improves when standing up", "Player fears one side"], ["Face/path with and without space constraint", "Target/no-go miss card", "Slow-to-normal proof"], ["face control compensation", "target fear", "path/target mismatch"], ["club_face_path", "psychology"], ["club", "psych"], "Solve the protected miss while preserving enough space.", "Do not remove compensation before the protected variable is safe.")
    ],
    "FAULT-SWAY": [
      branch("trail-load-unmanaged", "Trail-load unmanaged", "Does the player drift off the ball instead of loading into the trail side?", ["Head/torso sway", "Pressure too lateral", "Low point inconsistent"], ["Trail-foot pressure audit", "Step-back/step-through contrast", "Low-point retest"], ["trail hip load", "pressure shift", "low point"], ["ground_force", "contact_lowpoint"], ["body"], "Constrain trail load, then retest low point.", "Do not freeze the body; load has to stay athletic."),
      branch("pivot-concept-missing", "Pivot concept missing", "Does the player misunderstand turn versus sway?", ["Can perform when shown station", "No pain barrier", "Pattern improves with external object"], ["Wall/foam trail-hip station", "No-ball turn proof", "Half-swing transfer"], ["poor pivot concept", "turn depth", "width"], ["ground_force"], ["body"], "Teach with objects and constraints, not anatomical lecture.", "Do not use multiple internal rotation cues."),
      branch("driver-upward-overdone", "Driver upward intent overdone", "Does the sway appear mostly with driver or upward-AoA intent?", ["Driver-specific", "Ball too far forward possible", "Hang-back finish"], ["Driver setup audit", "AoA/low-point cluster", "Ball-position ladder"], ["driver upward intent", "ball position", "attack angle"], ["contact_lowpoint", "club_face_path"], ["club", "equipment"], "Separate driver setup from pressure motion before prescribing.", "Do not transfer driver feel into iron contact blocks.")
    ],
    "FAULT-HANG-BACK": [
      branch("no-recenter", "No recenter", "Does the player stay trail-side into the downswing?", ["Trail-side finish", "Thin/fat mix", "Push/block pattern"], ["Step drill screen", "Lead-foot finish gate", "Low-point / start-line cluster"], ["pressure never recenters", "lateral recenter", "FAULT-ALL-TURN-NO-SHIFT"], ["ground_force", "contact_lowpoint"], ["body"], "Use recenter constraints and retest contact/start line.", "Do not cue jump or rotate first."),
      branch("turf-fear", "Turf-fear hang-back", "Does the player avoid the ground and back out?", ["Thin/top under turf", "Rehearsal better than ball", "Fear language"], ["No-ball brush set", "Line-in-front success ladder", "No-score contact set"], ["fear of turf", "thin strike", "confidence"], ["psychology", "contact_lowpoint"], ["psych", "club"], "Build contact confidence with low-threat brush tasks.", "Do not add speed or pressure until contact confidence returns."),
      branch("driver-pattern-bleed", "Driver pattern bleeds into irons", "Is upward driver intent contaminating iron swings?", ["Irons launched high/thin", "Low point back", "Driver swing thought used with irons"], ["Iron-vs-driver contrast", "Low-point cluster", "Ball-position audit"], ["driver upward intent", "low point", "dynamic loft"], ["contact_lowpoint", "club_face_path"], ["club", "strategy"], "Clarify club-specific task windows and separate practice blocks.", "Do not use one universal swing cue across all clubs.")
    ],
    "FAULT-SPIN-OUT": [
      branch("torque-too-early", "Torque too early", "Does rotation fire before pressure and club are ready?", ["Open early", "Arms/club left behind", "Pull/block pairing"], ["Step-then-turn contrast", "Pause-to-go set", "Path/start-line cluster"], ["torque too early", "arms left behind", "path left"], ["ground_force", "club_face_path"], ["body", "club"], "Sequence lateral-to-rotational task, then prove path/start line.", "Do not tell the player to rotate harder."),
      branch("no-lateral-shift", "No lateral shift", "Is spin-out compensating for missing recenter?", ["All turn", "No pressure targetward", "Low point variable"], ["Step drill screen", "Pressure trace if available", "Line-in-front retest"], ["no lateral shift", "lateral recenter", "low point"], ["ground_force", "contact_lowpoint"], ["body"], "Install a small recenter before speed/rotation work.", "Do not add vertical force first."),
      branch("target-panic-spin", "Target panic spin-out", "Does the body open early under trouble/pressure?", ["Fast transition on tight targets", "Face/path shifts left", "Routine shortens"], ["No-go miss card", "Routine timer", "Pressure contrast cluster"], ["target panic", "pressure", "routine"], ["psychology", "course_transfer"], ["psych", "strategy"], "Use commitment/routine and external target focus before mechanics.", "Do not layer technical cues under threat.")
    ],
    "FAULT-LOW-BULLET": [
      branch("dynamic-loft-too-low", "Dynamic loft too low", "Is launch low despite centered contact?", ["Low launch", "Contact acceptable", "Carry loss"], ["Dynamic-loft window", "Launch corridor", "Carry-window retest"], ["dynamic loft", "launch", "carry"], ["club_face_path"], ["club"], "Use launch-window tasks without adding scoop cues.", "Do not chase height by flipping wrists."),
      branch("thin-low-launch", "Thin strike low launch", "Is low flight mostly a contact issue?", ["Thin/low-face marks", "Smash may leak", "Low carry"], ["Face-spray cluster", "Line-in-front brush", "Tee/ball-position ladder"], ["thin strike", "low face", "low point"], ["contact_lowpoint"], ["club", "ball"], "Solve strike and low point before launch mechanics.", "Do not change loft or shaft from thin strikes."),
      branch("equipment-loft-gap", "Loft/gapping mismatch", "Does club spec create the low carry window?", ["Strong loft or poor gapping", "One club worse", "Setup/strike not enough"], ["Loft/gap audit", "Carry-window test", "A-B club comparison"], ["equipment loft mismatch", "loft gapping", "carry window"], ["course_transfer", "club_face_path"], ["equipment", "strategy"], "Flag fitting/gapping review if clusters confirm it.", "Do not prescribe more speed for a loft/gap issue.")
    ],
    "FAULT-SKYBALL": [
      branch("steep-attack-pop", "Steep-attack pop-up", "Is the club traveling too steeply under the ball?", ["High-face/crown contact", "Driver pop-up", "AoA steep/down"], ["Face/crown spray", "AoA cluster", "Tee-height ladder"], ["attack angle", "high face", "driver setup"], ["contact_lowpoint", "club_face_path"], ["club"], "Use driver setup and shallow-entry tasks, then retest contact height.", "Do not tell the player to stay down."),
      branch("tee-height-ballpos", "Tee/ball-position pop-up", "Does a setup adjustment immediately remove the pop-up?", ["Tee too high/low for delivery", "Ball too forward", "Immediate A-B response"], ["Tee-height ladder", "Ball-position ladder", "5-ball A-B cluster"], ["tee height", "ball position", "setup"], ["contact_lowpoint"], ["equipment", "club"], "Fix setup before motor change.", "Do not change the swing if the station solves the cluster."),
      branch("fear-hit-up", "Fearful hit-up pattern", "Is the player trying to help the ball up or avoid a low shot?", ["Backs out", "High launch intent", "Tension after low miss"], ["No-screen driver set", "External carry-window task", "Pressure/no-pressure contrast"], ["fear", "driver upward intent", "launch"], ["psychology", "club_face_path"], ["psych", "club"], "Reframe driver task as strike/carry window, not helping it up.", "Do not add technical overload to a fear response.")
    ]
  };
  Object.keys(curated).forEach(fid => {
    window.FF_DIAGNOSTIC_BRANCHES[fid] = curated[fid].map(card => ({
      ...card,
      diagnostic_tier: "authored_high_frequency",
      source_tags: uniq([...(card.source_tags || []), "authored_high_frequency_override", "review_required"])
    }));
  });

  const systemCurated = {
    "FAULT-EARLY-EXT": [
      branch("pelvis-space-loss", "Pelvis space-loss", "Does the pelvis move toward the ball and crowd the handle?", ["Belt line moves ballward", "Handle raises", "Toe/heel contact gets noisy"], ["Chair/wall space check", "Slow-ball space proof", "TrackMan 3D pelvis trace"], ["hip depth", "space", "FAULT-LOSS-POSTURE"], ["ground_force", "contact_lowpoint"], ["body"], "Use one external space constraint, then prove strike improvement.", "Do not cue spine angle or head position during reps."),
      branch("vertical-mistimed", "Vertical force mistimed", "Does the player extend before pressure and club delivery are ready?", ["Stand-up look before impact", "Thin/top tendency", "Early push from toes"], ["Lead-foot pressure timing screen", "Slow-to-normal speed ladder", "TrackMan 3D pelvis lift timing"], ["vertical force timing", "early extension", "low point"], ["ground_force", "contact_lowpoint"], ["body"], "Regress speed and train push timing after contact is safe.", "Do not add jump or speed intent first."),
      branch("face-path-save", "Face/path compensation", "Is early extension helping the player avoid a face/path miss?", ["Pattern worsens when space is constrained", "Right/left miss fear present", "Face/path changes with space task"], ["Space constraint plus face/path cluster", "No-go miss card", "Start-line retest"], ["face control compensation", "path/target mismatch", "target fear"], ["club_face_path", "psychology"], ["club", "psych"], "Protect start-line confidence while reducing the compensation.", "Do not remove the compensation before the protected miss is handled.")
    ],
    "FAULT-OTT": [
      branch("upper-body-start", "Upper-body starts downswing", "Do shoulders/arms pull the club out before the lower body recenters?", ["Path left", "Pull-cut", "Steep transition"], ["Step drill screen", "Path/swing-direction cluster", "Lead-arm delivery gate"], ["upper-body pull", "path left", "steep"], ["ground_force", "club_face_path"], ["body", "club"], "Use recenter/transition constraint before path fine-tuning.", "Do not simply say swing from the inside."),
      branch("open-face-protection", "Open-face protection", "Is the over-the-top move protecting against a face left open?", ["Right miss fear", "Face open", "Steep/left move appears under speed"], ["Face-angle cluster", "Start-line gate", "Face-safe path experiment"], ["FAULT-FACE-OPEN", "start-line variance", "fear of right"], ["club_face_path", "psychology"], ["club", "psych"], "Stabilize face first, then reduce the protective path.", "Do not remove the left path while face is still unsafe."),
      branch("alignment-left", "Alignment-led left path", "Is the player aimed left and swinging along that body line?", ["Feet/shoulders left", "Shot matches body line", "Club path looks worse relative to target"], ["Laser alignment audit", "Face/body mismatch card", "One-ball target routine"], ["alignment", "target", "swing direction left"], ["course_transfer"], ["strategy"], "Correct aim/routine before mechanical path work.", "Do not rebuild a delivery pattern caused by bad stationing.")
    ],
    "FAULT-SLIDE": [
      branch("no-lead-brake", "No lead-side brake", "Does the player keep drifting targetward through impact?", ["Lead hip slides", "Low point variable", "Contact heavy or blocked"], ["Wall-post brake", "Downhill-lie brake-and-turn", "Low-point cluster"], ["lead-side braking", "FAULT-LOWPOINT-BACK", "lateral overrun"], ["ground_force", "contact_lowpoint"], ["body"], "Train brake-and-turn before speed or pressure.", "Do not add vertical push until braking exists."),
      branch("target-lunge", "Target lunge", "Is slide an attempt to reach the target or force direction?", ["Upper body follows target", "Path/face unstable", "Player feels late/rushed"], ["Step-to-balance finish", "Tempo contrast cluster", "Start-line retest"], ["lateral overrun", "tempo", "path left"], ["ground_force", "psychology"], ["body", "psych"], "Use balance/finish constraints and reduce urgency.", "Do not add more targetward shift cueing."),
      branch("mobility-avoidance", "Mobility avoidance", "Is slide substituting for missing rotation or hip access?", ["Turn limited", "No-ball rotation fails", "Restriction or pain language"], ["No-ball turn screen", "Mobility prep retest", "Half-swing strike check"], ["mobility restriction", "turn depth", "pain gate"], ["warmup_prep", "ground_force"], ["body"], "Route to prep/regression before swing-change volume.", "Do not force rotational positions through pain.")
    ],
    "FAULT-FLIP-SCOOP": [
      branch("face-save-flip", "Face-save flip", "Is the player throwing the clubhead to close an open face?", ["High dynamic loft", "Right miss fear", "Face late then shuts"], ["Face-to-path cluster", "9-to-3 start-line proof", "Impact-window gate"], ["FAULT-FACE-OPEN", "release timing", "dynamic loft"], ["club_face_path"], ["club"], "Solve face/start earlier so flip is no longer needed.", "Do not cue hold angles without a face solution."),
      branch("body-stall-flip", "Body stall flip", "Does rotation stop and the hands rescue impact?", ["Stall through impact", "High launch/weak smash", "Arms pass body"], ["Exit corridor", "Smash/dynamic-loft cluster", "Slow-to-normal transfer"], ["body stalls", "FAULT-WEAK-SMASH", "dynamic loft"], ["ground_force", "club_face_path"], ["body", "club"], "Use exit/rotation task with one launch or smash proof.", "Do not add isolated wrist drills first."),
      branch("help-it-up", "Help-it-up concept", "Is the player trying to lift the ball instead of deliver through it?", ["Scoopy language", "Thin/fat high flight", "Works better after task reframing"], ["Carry-window task", "Line-in-front brush", "No-screen contact set"], ["trajectory mismatch", "fear of turf", "low point"], ["contact_lowpoint", "psychology"], ["club", "psych"], "Reframe task around carry and brush location.", "Do not overload with shaft-lean terminology.")
    ],
    "FAULT-HANDLE-DRAG": [
      branch("delayed-release", "Release delayed too long", "Is the handle leading so long that the face/loft never releases?", ["Low bullet or block", "Open face", "Low dynamic loft"], ["Dynamic-loft window", "Start-line gate", "Release-timing ladder"], ["release timing", "dynamic loft", "FAULT-FACE-OPEN"], ["club_face_path"], ["club"], "Train release timing with external window, not hand manipulation.", "Do not praise shaft lean if ball flight fails."),
      branch("body-outrace", "Body outraces handle/club", "Does the body pull the handle away from the clubhead?", ["Open chest early", "Weak smash", "Block/fade tendency"], ["Face-to-path cluster", "Smash retest", "Exit-speed stepdown"], ["sequence leak", "body outraces club", "FAULT-WEAK-SMASH"], ["ground_force", "club_face_path"], ["body", "club"], "Re-sync delivery and prove smash/start-line improvement.", "Do not add more rotation speed."),
      branch("anti-flip-overcorrect", "Anti-flip overcorrection", "Is handle drag a response to being told not to flip?", ["Stiff/steered motion", "Low flight", "Player reports holding angles"], ["Jargon-free task set", "Carry-window ladder", "Prediction-before-reveal"], ["internal focus", "over-correction", "trajectory mismatch"], ["psychology", "club_face_path"], ["psych", "club"], "Remove the negative cue and give an external ball-flight task.", "Do not use don't-flip language.")
    ],
    "FAULT-REVERSE-PIVOT": [
      branch("trail-load-missing", "Trail load missing", "Does the player load lead side at the top instead of trail side?", ["Lead side loaded at top", "Chunk/thin mix", "Low speed"], ["Trail-foot load station", "No-ball turn proof", "Low-point retest"], ["trail-load missing", "pressure timing", "low point"], ["ground_force", "contact_lowpoint"], ["body"], "Build a safe trail-load task and prove contact.", "Do not cue a big sway."),
      branch("turn-concept-error", "Turn concept error", "Does the player misunderstand centered turn versus reverse load?", ["Can improve with object station", "No mobility barrier", "Arms lift or torso tilts"], ["Wall/foam turn station", "Mirror-free rehearsal", "Half-swing transfer"], ["concept of turn missing", "arm lift", "pivot"], ["ground_force"], ["body"], "Use object constraints and external targets.", "Do not give multi-body-part rotation instructions."),
      branch("protective-tension", "Protective tension", "Is reverse pivot tied to guarding, pain, or fear of loading?", ["Tension/pain language", "Restricted backswing", "Speed drops"], ["Pain/readiness gate", "Mobility prep retest", "No-ball comfort screen"], ["protective tension", "pain gate", "mobility restriction"], ["warmup_prep", "psychology"], ["body", "psych"], "Modify session and avoid new swing-change load if red.", "Do not force range or speed on a guarded pattern.")
    ],
    "FAULT-ALL-TURN-NO-SHIFT": [
      branch("no-lateral-load", "No lateral load", "Does the player rotate in place without useful pressure shift?", ["No recenter", "Path/low point variable", "Low CHS"], ["Step drill screen", "Pressure/recenter observation", "Low-point retest"], ["lateral force absent", "lateral recenter", "low point"], ["ground_force", "contact_lowpoint"], ["body"], "Install a small recenter before rotation/speed tasks.", "Do not tell the player to spin faster."),
      branch("torque-too-early", "Torque too early", "Does rotation happen before the player has loaded the floor?", ["Open early", "Arms behind", "Pull/block pattern"], ["Step-then-turn contrast", "Pause-to-go set", "Start-line/path cluster"], ["torque too early", "spin out", "path left"], ["ground_force", "club_face_path"], ["body", "club"], "Sequence lateral then rotational using constraints.", "Do not add vertical push first."),
      branch("fear-of-sway", "Fear of sway", "Is the player avoiding shift because they were told not to sway?", ["Stuck centered", "Stiff motion", "Reports stay-centered cue"], ["Jargon-free step task", "Contact confidence set", "Slow-to-normal ladder"], ["internal focus", "over-correction", "pivot concept"], ["psychology", "ground_force"], ["psych", "body"], "Replace negative anti-sway cue with an athletic step task.", "Do not use body-position policing.")
    ],
    "FAULT-SPEED-CEILING": [
      branch("force-amplitude-low", "Force amplitude low", "Does the player lack output even with good contact?", ["CHS low", "Smash acceptable", "Low intent"], ["CHS baseline", "Mach 3 contrast set", "Ball-transfer proof"], ["force amplitude low", "Mach 3", "speed ceiling"], ["speed", "ground_force"], ["body"], "Use gated speed exposure paired with ball-transfer proof.", "Do not speed train through pain/readiness red."),
      branch("contact-limits-speed", "Contact limits speed", "Does speed drop because center contact is not owned?", ["Smash leak", "Off-center strike", "Player slows down to find contact"], ["Face-spray cluster", "Smash factor retest", "Speed-step ladder"], ["off-center strike", "FAULT-WEAK-SMASH", "contact ownership"], ["contact_lowpoint", "speed"], ["club", "body"], "Own strike first, then reintroduce speed.", "Do not reward CHS gains with smash collapse."),
      branch("intent-or-threat", "Intent/threat ceiling", "Does radar, pressure, or self-protection cap intent?", ["Rushed or frozen with radar", "Better speed without screen", "Fear of miss/injury"], ["No-screen speed set", "Prediction-before-reveal", "Readiness/pain check"], ["performance anxiety", "threat response", "readiness"], ["psychology", "speed"], ["psych", "body"], "Reduce threat and use self-prediction before reveal.", "Do not public-score speed early.")
    ],
    "FAULT-FAT-THIN-ALT": [
      branch("lowpoint-chaos", "Low-point chaos", "Is the bottom of the arc moving unpredictably?", ["Fat and thin alternate", "Brush point varies", "Mat better than turf"], ["Line-in-front brush", "Divot board cluster", "Grass transfer retest"], ["low-point instability", "ball-first contact", "mat-to-turf transfer"], ["contact_lowpoint"], ["club", "ball"], "Stabilize low point with visible ground feedback.", "Do not add speed, pressure, or complex face work."),
      branch("force-timing-chaos", "Force-timing chaos", "Does contact change with tempo or pressure timing?", ["Good slow, poor fast", "Vertical/slide timing varies", "Rushed transition"], ["Tempo contrast cluster", "Stepdown speed ladder", "TrackMan 3D timing if available"], ["force timing", "tempo", "vertical timing"], ["ground_force", "psychology"], ["body", "psych"], "Regress speed and fade feedback after contact stabilizes.", "Do not chase every miss with a new drill."),
      branch("setup-variable", "Setup variable", "Is the alternation mostly ball position, stance, or station inconsistency?", ["Ball position drifts", "Distance from ball varies", "One club worse"], ["Ball-position ladder", "Station audit", "Club-by-club contact map"], ["ball position", "setup variability", "equipment length"], ["contact_lowpoint"], ["equipment", "club"], "Standardize setup before motor-learning work.", "Do not label a setup problem as a swing flaw.")
    ],
    "FAULT-LOWPOINT-BACK": [
      branch("pressure-trail", "Pressure stays trail side", "Is low point back because pressure never recenters?", ["Trail finish", "Fat contact", "Push/block tendency"], ["Step drill screen", "Lead-finish gate", "Line-in-front retest"], ["pressure timing", "trail-side", "lateral recenter"], ["ground_force", "contact_lowpoint"], ["body"], "Use recenter constraint and prove brush forward.", "Do not add wrist or shaft-lean cue first."),
      branch("early-release-lowpoint", "Early release moves low point back", "Does casting make the club bottom early?", ["Cast look", "High dynamic loft", "Fat or weak contact"], ["9-to-3 impact window", "Dynamic-loft cluster", "Brush-line proof"], ["cast/early release", "dynamic loft", "low point behind"], ["club_face_path", "contact_lowpoint"], ["club"], "Train delivery window at low speed.", "Do not speed up the pattern before brush proof."),
      branch("ballpos-station", "Ball-position/station low point", "Does low point normalize when station is corrected?", ["Ball too far forward", "Setup varies", "Immediate A-B improvement"], ["Ball-position ladder", "Static station audit", "3-club low-point test"], ["ball position", "setup distance", "low point"], ["contact_lowpoint"], ["equipment", "club"], "Fix station first and retest.", "Do not prescribe swing change from a station artifact.")
    ],
    "FAULT-HEEL-TOE-STRIKE": [
      branch("setup-distance", "Setup distance bias", "Does strike location change immediately with distance from ball?", ["Heel/toe pattern responds to station", "Posture/distance variable", "One club worse"], ["Setup-distance ladder", "Face-spray cluster", "Choke-up/down A-B"], ["setup distance", "equipment length/lie", "contact location"], ["contact_lowpoint"], ["equipment", "club"], "Standardize station and flag fitting if repeatable.", "Do not rebuild delivery until station is clean."),
      branch("delivery-drift", "Delivery drift", "Does the clubhead drift in/out through impact?", ["Consistent heel or toe side", "Path/handle pattern repeatable", "Setup stable"], ["Face-spray plus path cluster", "Strike gate", "Slow-to-normal transfer"], ["delivery drift", "handle path", "strike location"], ["contact_lowpoint", "club_face_path"], ["club"], "Use strike-location constraint with one path proof.", "Do not infer face angle from gear effect alone."),
      branch("space-change", "Body-space change", "Does posture/space loss move strike heel or toe?", ["Early extension/loss of posture", "Handle raises/out", "Strike changes with space task"], ["Chair/wall space check", "TrackMan 3D pelvis review", "Face-spray retest"], ["FAULT-EARLY-EXT", "FAULT-LOSS-POSTURE", "space"], ["ground_force", "contact_lowpoint"], ["body"], "Solve space with external constraint and retest strike.", "Do not cue reach or squat without proof.")
    ],
    "FAULT-WEAK-SMASH": [
      branch("offcenter-smash", "Off-center smash leak", "Is smash down because strike is off-center?", ["Face marks off center", "Ball speed leak", "Gear-effect curve"], ["Face-spray cluster", "Smash retest", "Strike-location ladder"], ["off-center strike", "strike location", "smash factor"], ["contact_lowpoint", "speed"], ["club"], "Center strike before chasing CHS or spin loft.", "Do not call it a power problem if contact is poor."),
      branch("spinloft-smash", "Spin-loft efficiency leak", "Is speed leaking through excessive dynamic loft or AoA mismatch?", ["Centered-ish strike", "High spin/dynamic loft", "Weak flight"], ["Dynamic loft / AoA cluster", "Launch-spin window", "Carry-smash proof"], ["spin loft", "dynamic loft", "FAULT-DYNAMIC-LOFT-HIGH"], ["club_face_path", "speed"], ["club"], "Use one delivery-window task and retest efficiency.", "Do not lower flight by steering."),
      branch("speed-without-contact", "Speed without contact", "Does added speed lower smash?", ["CHS up, ball speed not up", "Strike scatters with intent", "Radar chasing"], ["Speed-step ladder", "Face-spray at each speed", "Ball-speed not CHS score"], ["speed without contact", "number chasing", "contact ownership"], ["speed", "psychology"], ["body", "psych"], "Score ball speed/acceptable shot, not just CHS.", "Do not reward reckless speed exposure.")
    ],
    "FAULT-DYNAMIC-LOFT-HIGH": [
      branch("flip-scoop-loft", "Flip/scoop loft", "Is dynamic loft high because the clubhead overtakes?", ["High launch", "Weak smash", "Handle stalls"], ["Dynamic-loft cluster", "Impact-window gate", "9-to-3 carry window"], ["flip/scoop", "release timing", "dynamic loft"], ["club_face_path"], ["club"], "Use external launch/carry window and face proof.", "Do not say hold lag or keep hands ahead live."),
      branch("shaft-lean-leak", "Shaft-lean leak from body stall", "Does body stall remove forward delivery?", ["Body stops", "High loft", "Contact may be fat/thin"], ["Exit corridor", "Smash/dynamic-loft retest", "Low-speed transfer"], ["shaft lean leak", "body stalls", "contact_lowpoint"], ["ground_force", "club_face_path"], ["body", "club"], "Train exit/rotation constraint with one loft proof.", "Do not isolate wrists if pivot is the limiter."),
      branch("trajectory-mismatch", "Trajectory concept mismatch", "Is the player choosing a high-loft delivery for the wrong shot?", ["One window for every shot", "High flight when lower needed", "Poor carry control"], ["Trajectory ladder", "Carry-window task", "Club/ball-position audit"], ["trajectory mismatch", "carry window", "course_transfer"], ["course_transfer", "club_face_path"], ["strategy", "club"], "Clarify shot window and club choice before mechanics.", "Do not rebuild a swing for a decision problem.")
    ],
    "FAULT-FACE-OPEN": [
      branch("grip-face-start", "Grip/face-start issue", "Is the face open before the downswing problem?", ["Face open at setup/top", "Start line right", "Weak hold pattern"], ["Static face/grip check", "Start-line gate", "Face-angle cluster"], ["grip pressure pattern", "start-line variance", "face angle"], ["club_face_path"], ["club"], "Own face orientation with external start-line task.", "Do not start with path or body work."),
      branch("late-closure", "Late closure", "Does face arrive open because closure timing is late?", ["Blocks/fades", "Face-to-path open", "Body may outrun club"], ["Face-to-path cluster", "Slow-to-normal ladder", "Release-timing corridor"], ["late face", "release timing", "body outraces club"], ["club_face_path", "ground_force"], ["club", "body"], "Re-time closure while preserving start-line confidence.", "Do not use hand-roll cues as the primary instruction."),
      branch("fear-left-hold", "Fear-left hold-off", "Is the player holding the face open to avoid left?", ["Left miss fear", "Steered finish", "Face changes under target pressure"], ["No-go miss card", "Pressure/no-pressure contrast", "Start-line prediction"], ["target fear", "pressure", "routine"], ["psychology", "course_transfer"], ["psych", "strategy"], "Rebuild acceptable miss and routine before technical closure.", "Do not force face closure under threat.")
    ],
    "FAULT-WEDGE-CONTACT": [
      branch("entry-point", "Entry point unknown", "Is the club entering too early or too late?", ["Chunks/blades alternate", "No landing-window ownership", "Mat-to-grass problem"], ["Towel/line entry gate", "Landing-spot ladder", "Grass retest"], ["entry point", "low-point control", "landing spot"], ["short_game", "contact_lowpoint"], ["club", "ball"], "Own entry point before trajectory variety.", "Do not jump to flop/high-loft options."),
      branch("bounce-misuse", "Bounce misuse", "Is the player using leading edge or bounce incorrectly for the lie?", ["Digs or blades", "Fear of turf/sand", "Lie-sensitive contact"], ["Bounce brush test", "Lie ladder", "Low/medium/high bounce comparison"], ["bounce misuse", "lie mismatch", "wedge contact"], ["short_game", "equipment"], ["club", "equipment"], "Match entry and bounce to lie, then retest landing window.", "Do not prescribe one wedge technique for all lies."),
      branch("trajectory-lie-mismatch", "Trajectory/lie mismatch", "Is the shot choice wrong for the lie or landing window?", ["Wrong height for green/lie", "Carry window unclear", "One-shot-only pattern"], ["Shot-window decision card", "Landing zone game", "Club selection A-B"], ["trajectory mismatch", "carry window", "lie adaptation"], ["short_game", "course_transfer"], ["strategy", "club"], "Solve shot selection and landing spot before mechanics.", "Do not call a poor decision a contact flaw.")
    ],
    "FAULT-SHORTGAME-DISTANCE": [
      branch("landing-spot-unclear", "Landing spot unclear", "Does the player lack a precise first-bounce target?", ["Looks at hole only", "Carry varies", "Rollout surprise"], ["Landing towel ladder", "Call-your-landing game", "3-zone carry test"], ["landing spot", "carry window", "distance calibration"], ["short_game", "course_transfer"], ["strategy", "ball"], "Define landing spot first, then calibrate carry.", "Do not prescribe technique before the task is specific."),
      branch("carry-window-unowned", "Carry window unowned", "Can the player not produce repeatable carry distances?", ["Same swing, different carry", "No stock wedge map", "Poor partial-distance feel"], ["Wedge carry ladder", "Clock/window map", "Random carry retest"], ["carry window", "wedge matrix", "distance ladder"], ["short_game"], ["club"], "Build a carry ladder with faded feedback.", "Do not add pressure until carry windows exist."),
      branch("trajectory-distance-conflict", "Trajectory-distance conflict", "Does changing height destroy distance control?", ["High shot short/long", "Low shot runs out", "One trajectory only"], ["Low/medium/high window ladder", "Landing+rollout score", "Club/ball-position audit"], ["trajectory mismatch", "one-shot-only pattern", "rollout"], ["short_game", "course_transfer"], ["club", "strategy"], "Separate trajectory windows and score total proximity.", "Do not let aesthetics override proximity.")
    ],
    "FAULT-SHORTGAME-TRAJECTORY": [
      branch("wrong-window-choice", "Wrong window choice", "Is the player choosing the wrong height for the lie/green?", ["Shot window mismatches landing area", "Too much loft or too little", "Decision changes outcome"], ["Window decision card", "Three-trajectory ladder", "Lie-to-window map"], ["wrong window", "trajectory mismatch", "lie adaptation"], ["short_game", "course_transfer"], ["strategy"], "Coach decision tree before technique.", "Do not teach specialty shots as the default."),
      branch("face-ballpos-mismatch", "Face/ball-position mismatch", "Does setup create the wrong launch window?", ["Launch too high/low", "Face/ball position inconsistent", "Contact changes with setup"], ["Setup ladder", "Launch-window gate", "Landing-zone retest"], ["face/ball-position mismatch", "launch", "contact"], ["short_game", "club_face_path"], ["club"], "Standardize setup for the intended window.", "Do not give body cues for setup-created trajectory."),
      branch("one-shot-pattern", "One-shot-only pattern", "Can the player only hit one trajectory regardless of task?", ["Same motion for all shots", "Avoids certain lies", "Poor adaptability"], ["Low/medium/high randomizer", "Lie randomizer", "One-ball up/down game"], ["one-shot-only pattern", "random variability", "representative_transfer"], ["short_game", "course_transfer"], ["club", "strategy"], "Progress from serial window ladder to random lies.", "Do not add pressure before two windows are stable.")
    ],
    "FAULT-BUNKER-ENTRY": [
      branch("entry-point-unknown", "Entry point unknown", "Does the player not know where the club should enter sand?", ["Hits ball first or too much sand", "No splash point", "Variable distance"], ["Sand line entry gate", "Splash-zone ladder", "Landing-zone retest"], ["entry point", "sand", "bunker"], ["short_game", "contact_lowpoint"], ["club", "ball"], "Own splash point before face/trajectory complexity.", "Do not add pressure until entry is visible."),
      branch("sand-fear", "Sand fear", "Does threat/fear change tempo and contact?", ["Deceleration", "Tension", "Better practice swings than ball"], ["No-ball splash set", "No-score bunker ladder", "Routine reset"], ["sand fear", "threat response", "confidence"], ["psychology", "short_game"], ["psych"], "Lower threat and build simple splash success.", "Do not add technical details during fear spiral."),
      branch("bounce-lie-mismatch", "Bounce/lie mismatch", "Is the club/face setup wrong for sand texture or lie?", ["Digs in soft sand", "Skulls from firm sand", "One setup for all lies"], ["Soft/firm lie ladder", "Face/bounce A-B", "Entry+carry retest"], ["bounce misuse", "lie mismatch", "equipment"], ["short_game", "equipment"], ["equipment", "club"], "Match bounce/face choice to lie before motor change.", "Do not use one bunker prescription for all sand.")
    ],
    "FAULT-PUTT-STARTLINE": [
      branch("face-aim", "Face aim error", "Is the putter face aimed off-line before stroke?", ["Start miss matches face aim", "Gate fails immediately", "Read may be fine"], ["Start gate", "Mirror/laser face aim", "3-foot chalk-line test"], ["face aim", "start-line", "putting"], ["putting", "club_face_path"], ["club"], "Own face aim and start gate before stroke mechanics.", "Do not change path if face aim is the miss."),
      branch("impact-location", "Impact-location error", "Is start line affected by heel/toe putter contact?", ["Strike marks vary", "Speed/start both vary", "Mishits under pressure"], ["Putter face tape", "Centered-strike gate", "Speed/start retest"], ["impact location", "strike", "speed control"], ["putting", "contact_lowpoint"], ["club"], "Center strike with simple gate feedback.", "Do not overcorrect stroke path from mishits."),
      branch("stroke-path", "Stroke path bias", "Is face aim okay but path sends start line off?", ["Gate fail with square aim", "Pull/push pattern", "Path feedback repeatable"], ["Path gate", "Start-line gate with hidden result", "Random short-putt retest"], ["stroke path", "start-line", "face/path"], ["putting"], ["club"], "Use path/start gate and fade feedback.", "Do not let the player stare at mechanics during the stroke.")
    ],
    "FAULT-PUTT-SPEED": [
      branch("distance-calibration", "Distance calibration", "Does the player lack a feel map for distance?", ["Leaves putts same distance short/long", "Poor lag proximity", "No prediction accuracy"], ["Ladder lag test", "Call-your-distance game", "Random distance retest"], ["distance calibration", "speed control", "prediction"], ["putting"], ["ball"], "Build prediction-based speed ladder.", "Do not start with stroke mechanics."),
      branch("visual-mapping", "Visual mapping error", "Is speed poor because read/slope perception is wrong?", ["Misreads uphill/downhill", "Speed changes with slope perception", "Line/speed mismatch"], ["Slope read card", "Uphill/downhill ladder", "Capture-speed task"], ["visual mapping", "green reading", "speed"], ["putting", "course_transfer"], ["strategy"], "Train read-to-speed mapping with external targets.", "Do not isolate tempo if visual map is wrong."),
      branch("tempo-variance", "Tempo variance", "Does stroke tempo change with distance or pressure?", ["Rushed long putts", "Decel short putts", "Pressure speed miss"], ["Metronome/no-metronome contrast", "No-score speed set", "Pressure ladder"], ["tempo", "threat appraisal", "routine"], ["putting", "psychology"], ["psych", "club"], "Stabilize routine/tempo and fade aids.", "Do not make tempo a rigid internal cue under pressure.")
    ],
    "FAULT-PUTT-PRESSURE": [
      branch("visual-rush", "Visual rush", "Does the player skip read/target under pressure?", ["Looks quickly", "Routine shortens", "Miss speed/line together"], ["Routine timer", "Quiet-eye target check", "Pressure/no-pressure contrast"], ["visual rush", "routine loss", "pressure"], ["putting", "psychology"], ["psych", "strategy"], "Protect routine length and target lock before stroke work.", "Do not add mechanical cues before the stroke."),
      branch("threat-appraisal", "Threat appraisal", "Does consequence change stroke or decision quality?", ["Freezes or jerks", "Better in no-score set", "Avoids comeback putt"], ["No-score vs consequence ladder", "Breath reset", "Prediction-before-putt"], ["threat appraisal", "confidence", "pressure"], ["psychology", "putting"], ["psych"], "Lower threat, build successful pressure doses gradually.", "Do not use punishment games too early."),
      branch("routine-loss", "Routine loss", "Is the miss tied to inconsistent routine execution?", ["No consistent order", "Forgets aim/speed step", "Outcome focus takes over"], ["Routine checklist", "One-ball scorecard", "Post-putt reflection"], ["routine loss", "commitment gap", "attention drift"], ["course_transfer", "psychology"], ["strategy", "psych"], "Use a short routine card and score process first.", "Do not let outcome-only score define success.")
    ],
    "FAULT-COURSE-TRANSFER": [
      branch("blocked-dependency", "Blocked-practice dependency", "Does the pattern work only after repeated same-shot reps?", ["Range better than course", "Needs many rehearsal reps", "Random targets fail"], ["Random target test", "One-ball rule", "Performance Center random mode"], ["blocked dependency", "random variability", "representative_transfer"], ["course_transfer"], ["strategy"], "Move to random/representative blocks with faded feedback.", "Do not keep rewarding blocked success."),
      branch("routine-gap", "Routine gap", "Does transfer fail because routine is absent or inconsistent?", ["No pre-shot sequence", "Decision changes late", "Tempo varies on course"], ["Routine checklist", "One-ball routine score", "9-hole pattern audit"], ["no routine", "poor PSR", "decision pressure"], ["course_transfer", "psychology"], ["strategy", "psych"], "Build routine as the bridge from range to course.", "Do not add more swing thoughts."),
      branch("decision-pressure", "Decision pressure", "Does shot choice collapse under real course constraints?", ["Pin chasing", "No-go miss ignored", "Club choice emotional"], ["No-go miss card", "Dispersion decision game", "9-hole scored practice"], ["decision pressure", "club selection", "dispersion"], ["course_transfer"], ["strategy"], "Score decision quality before outcome.", "Do not treat bad strategy as failed mechanics.")
    ],
    "FAULT-POOR-PSR": [
      branch("commitment-gap", "Commitment gap", "Does the player start without a clear target/shot?", ["Late indecision", "No verbal commitment", "Aims after setup"], ["Commitment card", "Target-call requirement", "Routine process score"], ["commitment gap", "target", "routine"], ["course_transfer", "psychology"], ["strategy"], "Require clear target and shot before stepping in.", "Do not allow ball beating as practice."),
      branch("attention-drift", "Attention drift", "Does attention move from target to body mechanics at the ball?", ["Many swing thoughts", "Freezes over ball", "Looks away from target too long"], ["One-cue-only audit", "External focus routine", "Time-over-ball check"], ["attention drift", "internal focus", "too many swing thoughts"], ["psychology", "course_transfer"], ["psych"], "Move attention back to target/task cue.", "Do not add another technical cue."),
      branch("tempo-variability", "Routine tempo variability", "Does setup time or rhythm vary with pressure?", ["Rushed on hard shots", "Slow/frozen on consequences", "Tempo changes outcome"], ["Routine timer", "Pressure contrast", "Breath-trigger card"], ["tempo variability", "pressure", "routine"], ["psychology"], ["psych"], "Install one stable tempo trigger and retest.", "Do not public-score early routine attempts.")
    ],
    "FAULT-EQUIP-LIE-LOFT": [
      branch("lie-angle-startline", "Lie angle distorts start line", "Does lie angle create consistent start-direction or strike bias?", ["Toe/heel turf marks", "Start line biased", "One iron family worse"], ["Lie board/dynamic lie review", "Face-spray cluster", "A-B test club"], ["lie angle", "start-line", "heel strike", "toe strike"], ["equipment", "club_face_path"], ["equipment"], "Flag fitting review if repeatable across clusters.", "Do not coach around a confirmed lie-angle issue."),
      branch("shaft-fit-delivery", "Shaft fit distorts delivery", "Does weight/flex/length change timing, contact, or speed?", ["Timing changes by club", "Strike improves with choke/alternate shaft", "Speed/contact tradeoff"], ["Choke-up/down A-B", "5-ball shaft/length cluster", "Smash and dispersion retest"], ["shaft fit", "length", "weight"], ["equipment", "speed"], ["equipment"], "Treat as fitting triage after movement baseline.", "Do not fit during fatigue or new-pattern acquisition."),
      branch("loft-spin-window", "Loft/spin mismatch", "Does equipment create inefficient launch/spin even with playable delivery?", ["Carry loss", "Spin too high/low", "Gapping problem"], ["Optimizer", "Launch-spin window", "Carry/gapping audit"], ["loft/spin mismatch", "Optimizer", "loft gapping"], ["equipment", "course_transfer"], ["equipment", "strategy"], "Send to equipment/fitting review with cluster averages.", "Do not adjust specs from one shot.")
    ],
    "FAULT-READINESS-RED": [
      branch("poor-sleep", "Poor sleep consolidation risk", "Is today a poor day for new motor acquisition?", ["<5h sleep or red readiness", "Low focus", "New swing change planned"], ["Readiness check", "Session intent downgrade", "Maintenance-only proof"], ["poor sleep", "sleep consolidation", "readiness"], ["warmup_prep", "psychology"], ["body", "psych"], "Switch to maintenance, review, or low-threat transfer.", "Do not install a brand-new swing change today."),
      branch("fatigue", "Fatigue / CNS red", "Is output or coordination depressed before practice starts?", ["Warmup speed down", "Coordination poor", "High perceived effort"], ["Warmup CHS/strike check", "RPE/readiness gate", "Reduced-volume retest"], ["fatigue", "speed ceiling", "contact chaos"], ["speed", "warmup_prep"], ["body"], "Reduce dose and avoid high-intent speed.", "Do not chase lost speed under fatigue."),
      branch("pain-gate", "Pain gate", "Does pain require stop or modified work?", ["Pain >2/10 or worsening", "Protective movement", "Neuro/red-flag symptoms"], ["Pain stoplight", "No-ball movement screen", "Modified warmup retest"], ["pain gate", "mobility restriction", "protective tension"], ["warmup_prep"], ["body"], "Stop, modify, or refer based on gate status.", "Do not use diagnostic drills as treatment.")
    ]
  };
  Object.keys(systemCurated).forEach(fid => {
    window.FF_DIAGNOSTIC_BRANCHES[fid] = systemCurated[fid].map(card => ({
      ...card,
      diagnostic_tier: "authored_system",
      source_tags: uniq([...(card.source_tags || []), "authored_system_diagnostic", "review_required"])
    }));
  });

  const profileForTest = (branch, testName = "", index = 0) => {
    const lanes = branch.lanes || [];
    const cats = branch.categories || [];
    const name = String(testName || "").toLowerCase();
    const baseFail = "If this proof does not move the pattern, do not prescribe the related drill yet; test the next most likely branch.";
    if (/wall|post|chair|space|brake/.test(name) && !/downhill|lie/.test(name)) return {
      objective: "Check whether the player can create the missing body/force relationship in a constrained station before asking for it in a full swing.",
      setup: "Use the wall, post, chair, or visual station as the constraint. Start no-ball; the cue stays external, such as finish against the wall or leave space for the chair.",
      protocol: "Run 3 no-ball rehearsals, 3 slow balls, then 3 normal-routine balls after removing or reducing the station. Watch whether the station effect survives the ball.",
      pass: "Pass if the station changes the visible pattern and the ball proof improves without adding a second cue.",
      fail: "Fail means the station changed rehearsal only. Regress speed, simplify the constraint, or test club/strike before adding more body language.",
      use: "If passed, use the station as the acquisition drill and link it to a normal-motion transfer proof."
    };
    if (/downhill|uphill|lie|slope/.test(name)) return {
      objective: "Test whether the flaw is a force/brake/turn problem by changing the environment instead of explaining body positions.",
      setup: "Use a real slope when possible or a safe lie simulation. Define the intended flight, contact, and balance finish before the shot.",
      protocol: "Hit 2 baseline balls on normal lie, 4–6 balls from the changed lie, then 2 normal-lie balls. Compare balance, strike, start line, and finish.",
      pass: "Pass if the environmental constraint immediately improves brake/turn behavior or contact and the improvement partially transfers back to normal lie.",
      fail: "If the lie changes contact but not the flaw, this is not the primary fix today; test low point, face/path, or setup instead.",
      use: "If passed, use lie-based tasks as the transfer bridge, not as endless blocked reps."
    };
    if (/low.?point|divot|turf|brush|face.?spray|strike|contact|smash|entry/.test(name)) return {
      objective: "Decide whether the visible flaw is actually a strike, low-point, or contact-location problem before prescribing a movement drill.",
      setup: "Mark the ground, clubface, or strike area. Pick one proof metric: ball-first contact, divot location, face mark, smash, or start/contact window.",
      protocol: "Run a 3-shot baseline cluster, add the simplest strike constraint, then run a 3-shot proof cluster with feedback delayed until the cluster ends.",
      pass: "Pass if contact/low point clusters improve and ball flight changes in the predicted direction without a new swing thought.",
      fail: "If contact stays noisy, stay in strike/low-point work. If contact improves but ball flight does not, test face/path next.",
      use: "If passed, prescribe a contact/low-point block before higher-speed or pressure work."
    };
    if (/start|curve|face|path|corridor|flight|launch|spin|angle|trackman|3d|video|metric/.test(name)) return {
      objective: "Separate ball-flight evidence from coach opinion by proving which metric or flight window actually changes.",
      setup: "Choose one metric or flight window only. Hide nonessential numbers and ask the player to predict the result before reveal.",
      protocol: "Capture 3 baseline shots, apply one external constraint or setup change, then capture 3 proof shots. Review cluster direction, not one outlier.",
      pass: "Pass if the selected metric or flight window moves in the predicted direction while strike and dispersion remain playable.",
      fail: "If the metric does not move, abandon that branch for today or test strike/setup before adding another cue.",
      use: "If passed, use the metric as the proof target, not as the active swing cue."
    };
    if (/target|no-go|decision|routine|one-ball|commitment|alignment|aim|9-hole|course|dispersion/.test(name)) return {
      objective: "Find out whether the miss is being created by target, decision, alignment, or routine quality instead of technique.",
      setup: "Player must call target, no-go miss, club, start window, and routine checkpoint before each ball.",
      protocol: "Run 6–9 one-ball reps. Coach scores decision/routine quality before judging outcome, then checks whether the visible flaw follows poor decisions.",
      pass: "Pass if better decisions or routine quality reduce the miss without a mechanical intervention.",
      fail: "If decision quality is high and the miss remains, move downstream to club, strike, body, or equipment proof.",
      use: "If passed, prescribe a course-transfer or routine block before changing mechanics."
    };
    if (/screen|score|breath|pressure|threat|reset|prediction|quiet|tempo|process|outcome/.test(name)) return {
      objective: "Test whether threat, screen visibility, outcome focus, or attention state is changing the swing or stroke pattern.",
      setup: "Create two conditions: low-threat and light-consequence. Give one reset option and one external task cue.",
      protocol: "Run a no-score/no-screen cluster, then a light-pressure or reveal-after-prediction cluster. Compare routine, tempo, prediction accuracy, and ball pattern.",
      pass: "Pass if the pattern improves when threat is reduced or worsens predictably when consequence/visibility is added.",
      fail: "If threat level does not change the pattern, avoid psychology labeling and return to club/strike/body testing.",
      use: "If passed, prescribe regulation, routine, or feedback-fading work before pressure games."
    };
    if (/static|equipment|optimizer|a-b|shaft|length|lie angle|loft|sleeve|tee|ball-position|choke|fit|gapping/.test(name)) return {
      objective: "Rule in or rule out an equipment/setup variable before coaching around a tool-created ball flight.",
      setup: "Keep ball, target, intent, and warmup constant. Change only one variable: length, lie, loft, tee height, ball position, sleeve, or club option.",
      protocol: "Run 5-shot baseline, 5-shot A condition, and if needed a short return-to-baseline. Judge cluster averages and strike pattern, not one shot.",
      pass: "Pass if strike, launch, start line, carry, or efficiency improves in the predicted direction without a new swing cue.",
      fail: "If the A-B change does not move the pattern, return to club/body/strike branch testing before equipment conclusions.",
      use: "If passed, flag setup/fitting review or equipment-aware practice before motor-change volume."
    };
    if (/speed|radar|chs|fatigue|readiness|pain|warmup|rpe/.test(name)) return {
      objective: "Decide whether today can support the planned intensity or whether the session must be downgraded.",
      setup: "Use a short readiness, pain, warmup speed, or strike-quality check before any high-intent or new-pattern work.",
      protocol: "Run the readiness check, 3 controlled swings, and 3 intended-task reps. Compare speed, contact, coordination, pain, and confidence.",
      pass: "Pass if readiness is green/yellow-stable and the task does not degrade contact, pain, balance, or coordination.",
      fail: "If readiness or pain is red, switch to maintenance, review, modified warmup, or stop/refer based on the gate.",
      use: "If passed, proceed with the planned dose; if yellow, cap volume, speed, and novelty."
    };
    if (lanes.includes("equipment")) return {
      objective: "Check whether equipment or setup is the active version before prescribing a motor change.",
      setup: "Same ball, same target, same warm-up. Compare current setup/club variable against one clean alternative in 5-ball clusters.",
      protocol: "Run baseline cluster, make one setup/equipment change, run second cluster, then return to baseline if needed. Review averages, not outliers.",
      pass: "Branch is supported if strike, launch, start line, or efficiency improves in the predicted direction without a dispersion penalty.",
      fail: "If the A-B change does not move the pattern, return to club/body branch testing before equipment conclusions.",
      use: branch.next
    };
    if (lanes.includes("psych")) return {
      objective: "Check whether state, attention, or threat response is the active version before prescribing a mechanical drill.",
      setup: "Remove score or screen threat first. Player gets one external task, one breath/reset option, and a prediction before reveal.",
      protocol: "Run a no-screen/no-score cluster, then a light-pressure cluster. Compare tempo, routine, prediction accuracy, and ball pattern.",
      pass: "Branch is supported if the pattern improves when threat is reduced or worsens predictably when consequence/visibility is added.",
      fail: "If pattern does not change with threat level, return to club/strike/body testing rather than adding psychology labels.",
      use: branch.next
    };
    if (lanes.includes("strategy")) return {
      objective: "Check whether decision, target, or routine is the active version before changing technique.",
      setup: "Define target, no-go miss, intended start window, and acceptable-shot score before the ball is hit.",
      protocol: "Run 6–9 one-ball decisions. Coach scores decision quality before outcome and notes whether the visible flaw follows poor choices.",
      pass: "Branch is supported if better target/routine decisions reduce the miss without a technical intervention.",
      fail: "If decision quality is high and miss persists, move downstream to club/body/equipment proof.",
      use: branch.next
    };
    if (lanes.includes("body") || cats.includes("ground_force")) return {
      objective: "Check whether the movement or ground-force version changes ball proof before prescribing body-oriented drills.",
      setup: "Start with no-ball or slow-ball constraint. Keep cue external and prove whether movement change survives a ball.",
      protocol: "Run 3 rehearsals, 3 slow balls, and 3 normal-intent balls. Capture video/3D if available and compare ball-flight proof.",
      pass: "Branch is supported if the movement constraint changes delivery and the ball/strike proof improves at low-to-moderate speed.",
      fail: "If rehearsal changes but ball does not, regress speed or test club/face/strike branch before adding more body cues.",
      use: branch.next
    };
    return {
      objective: "Check whether this is the active club/ball-flight version before assigning the drill block.",
      setup: "Use one club, one target, and one proof metric. Hide extra metrics unless they are part of the branch test.",
      protocol: "Run a 3-shot baseline cluster, apply one external club/ball constraint, then run a 3-shot proof cluster.",
      pass: "Branch is supported if start line, curve, strike, low point, launch, or the selected proof metric moves in the predicted direction.",
      fail: baseFail,
      use: branch.next
    };
  };
  const makeTestCard = (fid, branchObj, testName, index) => {
    const profile = profileForTest(branchObj, testName, index);
    return {
      test_id: fid + ":" + branchObj.id + ":T" + (index + 1),
      title: testName,
      objective: profile.objective || ("Confirm whether " + branchObj.label + " is the active version before drill prescription."),
      setup: profile.setup,
      protocol: profile.protocol,
      pass_criteria: profile.pass,
      fail_action: profile.fail,
      use_result: profile.use || branchObj.next,
      do_not_overinterpret: branchObj.avoid,
      source_tags: uniq([...(branchObj.source_tags || []), "FM-300 diagnostic proof", "review_required"])
    };
  };
  window.FF_DIAGNOSTIC_TEST_CARDS = {};
  Object.entries(window.FF_DIAGNOSTIC_BRANCHES || {}).forEach(([fid, branches]) => {
    branches.forEach(branchObj => {
      window.FF_DIAGNOSTIC_TEST_CARDS[fid + ":" + branchObj.id] = (branchObj.tests || ["3-shot proof cluster"]).slice(0, 3).map((testName, index) => makeTestCard(fid, branchObj, testName, index));
    });
  });

  window.FF_TRACKMAN_MODES = [
    { id: "tm_shot_analysis", label: "Shot Analysis", gpl: [1, 2, 3], blocks: ["blocked_acquisition", "serial_variability", "maintenance_retest"], counts_as: "install / proof / cluster retest", protocol: "SA-01", notes: "One metric only; high early feedback, then cluster reveal." },
    { id: "tm_corridors", label: "Corridors", gpl: [1, 2, 3], blocks: ["blocked_acquisition", "serial_variability"], counts_as: "constraint-based acquisition", protocol: "COR-01", notes: "Metric min/max becomes a pass/fail constraint, not the swing cue." },
    { id: "tm_performance_center_quick", label: "Performance Center · Quick Play", gpl: [3, 4, 5], blocks: ["random_variability", "representative_transfer"], counts_as: "transfer practice", protocol: "PC-01", notes: "Coach-led situational reps with distance/green changes on the fly." },
    { id: "tm_performance_center_custom", label: "Performance Center · Custom Test", gpl: [3, 4, 5], blocks: ["maintenance_retest", "pressure_scoring"], counts_as: "saved protocol / retest", protocol: "PC-03", notes: "Best for named Forefront tests and monthly/block-end comparison." },
    { id: "tm_performance_center_random", label: "Performance Center · Random Mode", gpl: [3, 4, 5], blocks: ["random_variability", "representative_transfer"], counts_as: "contextual interference", protocol: "PC-01", notes: "Random distance interval; pause when reflection is needed." },
    { id: "tm_speed_training", label: "Speed Training", gpl: [3, 4, 5], blocks: ["warmup_prep", "maintenance_retest"], counts_as: "speed exposure until ball-transfer proof", protocol: "SPD-01", notes: "Ball-free speed must be paired with ball-transfer proof." },
    { id: "tm_test_center", label: "Test Center", gpl: [2, 3, 4, 5], blocks: ["serial_variability", "random_variability", "maintenance_retest"], counts_as: "custom skill test", protocol: "COM-01", notes: "Use shorter band tests before full Combine." },
    { id: "tm_combine", label: "Combine", gpl: [3, 4, 5], blocks: ["maintenance_retest"], counts_as: "benchmark / retest only", protocol: "COM-01", notes: "Not weekly dose; too fatiguing and score-heavy for acquisition." },
    { id: "tm_putting_analysis", label: "Putting Analysis", gpl: [1, 2, 3, 4, 5], blocks: ["blocked_acquisition", "serial_variability", "maintenance_retest"], counts_as: "putting start-line / roll / speed proof", protocol: "PUT-TRACKMAN", notes: "Pair lab proof with on-green random and pressure tasks." },
    { id: "tm_on_course_practice", label: "On Course Practice", gpl: [4, 5], blocks: ["representative_transfer", "pressure_scoring"], counts_as: "course-like transfer", protocol: "OC-01", notes: "Drop-ball course scenarios; routine and decision quality first." },
    { id: "tm_virtual_golf", label: "Virtual Golf / Tournament", gpl: [4, 5], blocks: ["representative_transfer", "pressure_scoring"], counts_as: "practice only if structured", protocol: "OC-01", notes: "Counts only with one-ball routine, target decision, and coach-defined scoring." },
    { id: "tm_optimizer", label: "Optimizer", gpl: [3, 4, 5], blocks: ["maintenance_retest"], counts_as: "equipment / launch efficiency triage", protocol: "EQ-TRACKMAN", notes: "Question generator, not a daily cue." }
  ];

  ensure(window.FF_TOOLS, "id", [
    { id: "trackman_performance_center", label: "TrackMan Performance Center", notes: "Situational shot execution; SG/points; random/custom tests; transfer bridge." },
    { id: "trackman_test_center", label: "TrackMan Test Center / Combine", notes: "Custom skill tests, Combine, benchmark/retest protocols." },
    { id: "trackman_speed_training", label: "TrackMan Speed Training", notes: "Ball-free peak speed; pair with ball-transfer proof." },
    { id: "trackman_putting", label: "TrackMan Putting", notes: "Start line, speed, roll, read, tempo, putt retests." }
  ]);

  const base = {
    description_note: "Explain mechanics between reps only. During the rep, keep one external/task cue active.",
    cue_proximity: "distal",
    conflict: "Respect pain, readiness, sleep, and stage gates.",
    source_tags: ["Forefront Golf Manual", "Wulf external focus", "Winkelman cueing"]
  };
  const c = o => ({ ...base, ...o });

  const cards = [
    /* Speed / Mach 3 */
    c({ drill_id: "DR-SPD-004", name: "Mamba Load-Unload Rhythm Map", category: "speed", solves: ["FAULT-SPEED-CEILING", "FAULT-RUSHED-TRANS"], cause_lane: "body", gpl_fit: [1, 2, 3], practice_block: "blocked_acquisition", learning_stage: "acquisition", description: "Mamba swings at 50–75% speed to exaggerate load, unload, and rhythm before returning to a normal club.", when_why: "Use when speed effort destroys order or the player rushes transition.", active_cue: "Let the rope pull you through", constraint_alternative: "The rope tells the player when rhythm collapses.", representativeness: "Low", feedback_schedule: "High rhythm feedback early; fade to 1 cue per 3 reps.", progression: "Alternate 3 Mamba swings with 3 ball swings.", regression: "Use waist-high Mamba swings only.", proof_metric: "Normal-club contact stays stable while transition tempo improves.", source_tags: ["Mach 3 Appendix", "Wulf external focus"] }),
    c({ drill_id: "DR-SPD-005", name: "Koch Krusher Trail-Side Burst", category: "speed", solves: ["FAULT-SPEED-CEILING", "FAULT-REVERSE-PIVOT"], cause_lane: "body", gpl_fit: [2, 3], practice_block: "serial_variability", learning_stage: "guided_variability", description: "Koch Krusher swings to feel trail-side load and burst, followed by ball-transfer reps.", when_why: "Use when the player lacks athletic load or only swings with arms.", active_cue: "Load the ground, launch the handle", constraint_alternative: "Trail-load cone and forward-finish cone define the task.", representativeness: "Medium", feedback_schedule: "Coach feedback every 2–3 reps; radar only at block end.", conflict: "Avoid if contact is chaotic or readiness is red.", progression: "Pair 2 tool swings with 1 driver ball and randomize target.", regression: "Half-speed load-launch without ball.", proof_metric: "CHS rises without smash factor dropping more than 0.03.", source_tags: ["Mach 3 Appendix", "Josh Koch tool family"] }),
    c({ drill_id: "DR-SPD-006", name: "Velociraptor Rope Throw to Target", category: "speed", solves: ["FAULT-RUSHED-TRANS", "FAULT-HANDLE-DRAG"], cause_lane: "body", gpl_fit: [2, 3, 4], practice_block: "serial_variability", learning_stage: "guided_variability", description: "Rope-tool throws toward a target line to teach flowing release timing before ball transfer.", when_why: "Use when rehearsed positions do not become a flowing swing.", active_cue: "Throw the rope to the flag", constraint_alternative: "Target line and rope lag create the task.", representativeness: "Medium", feedback_schedule: "Self-controlled timing call before coach feedback.", progression: "Alternate left and right target windows.", regression: "No-ball hip-high rope throws.", proof_metric: "Player predicts release timing and keeps start line inside a 10-yard window.", source_tags: ["Mach 3 Appendix", "Self-controlled feedback"] }),
    c({ drill_id: "DR-SPD-007", name: "Mach 3 Ball-Transfer Ladder", category: "speed", solves: ["FAULT-SPEED-CEILING", "FAULT-WEAK-SMASH", "FAULT-COURSE-TRANSFER"], cause_lane: "body", gpl_fit: [3, 4, 5], practice_block: "random_variability", learning_stage: "contextual_interference", description: "Cycle 2 tool swings, 1 stock ball swing, 1 speed-intent ball swing, then change target or club.", when_why: "Use after tool speed exists but ball speed does not transfer.", active_cue: "Send speed to the window", constraint_alternative: "Set only counts if speed intent and launch window both pass.", representativeness: "High", feedback_schedule: "Radar/TrackMan after each set, not every swing.", conflict: "Do not use for GP-L1, pain gate, contact chaos, or pre-event taper.", progression: "Randomize club and target before every set.", regression: "Fixed club and fixed target at 70% intent.", proof_metric: "Speed gain holds while dispersion and smash remain in corridor.", source_tags: ["Mach 3 Appendix", "Guidance hypothesis", "Transfer bridge"] }),
    c({ drill_id: "DR-SPD-008", name: "Radar Prediction Speed Game", category: "speed", solves: ["FAULT-SPEED-CEILING", "feedback dependency"], cause_lane: "psych", gpl_fit: [3, 4, 5], practice_block: "maintenance_retest", learning_stage: "autonomous_maintenance", description: "Player predicts clubhead speed before radar reveal, then scores prediction accuracy and contact quality.", when_why: "Use when speed practice has become number chasing.", active_cue: "Call it, then confirm it", constraint_alternative: "Cover the screen until prediction is made.", representativeness: "Medium", feedback_schedule: "Bandwidth reveal only if prediction misses by more than 2 mph or contact fails.", conflict: "Too early for GP-L1 without a feel map.", progression: "Predict CHS, start line, and strike quality.", regression: "Predict fast, medium, or slow only.", proof_metric: "Prediction error ≤2 mph on 7/10 swings with stable contact.", source_tags: ["Guidance hypothesis", "Forefront tech fading"] }),

    /* Ground force */
    c({ drill_id: "DR-GRF-004", name: "Step-and-Pump Trail Load", category: "ground_force", solves: ["FAULT-REVERSE-PIVOT"], cause_lane: "body", gpl_fit: [1, 2], practice_block: "blocked_acquisition", learning_stage: "acquisition", description: "Step trail foot into backswing, pump twice, then swing at 50–70% to feel trail-side loading.", when_why: "Use when pressure loads the lead side too early.", active_cue: "Step back into the ground", constraint_alternative: "Trail-foot marker on the mat.", representativeness: "Low", feedback_schedule: "Coach confirms load quality every rep early, then every 3 reps.", conflict: "Balance red gate or acute hip/back pain.", progression: "Remove the step and keep the pressure feel.", regression: "No-ball step-and-pump rehearsals.", proof_metric: "Player maintains centered contact on 6/10 balls.", source_tags: ["Ground Force Appendix", "Dr. Kwon"] }),
    c({ drill_id: "DR-GRF-005", name: "Heel Stamp Transition", category: "ground_force", solves: ["FAULT-OTT", "FAULT-RUSHED-TRANS"], cause_lane: "body", gpl_fit: [2, 3], practice_block: "serial_variability", learning_stage: "guided_variability", description: "Stamp the lead heel as transition trigger, then turn through to a target window.", when_why: "Use when upper body fires first or transition rush creates path chaos.", active_cue: "Stamp, then send it", constraint_alternative: "Lead-heel marker gives a physical target.", representativeness: "Medium", feedback_schedule: "One feedback point per 3-ball cluster.", conflict: "Lead foot/ankle pain or balance red gate.", progression: "Alternate fixed and new target windows.", regression: "Heel-stamp rehearsals without ball.", proof_metric: "OTT path signature reduces while start line stays in corridor.", source_tags: ["Ground Force Appendix", "Dr. Scott Lynn"] }),
    c({ drill_id: "DR-GRF-006", name: "Wall-Post Brake", category: "ground_force", solves: ["FAULT-SLIDE", "FAULT-EARLY-EXT"], cause_lane: "body", gpl_fit: [1, 2, 3], practice_block: "blocked_acquisition", learning_stage: "acquisition", description: "Lead hip finishes near a wall or pad without crashing through it; slow swings teach braking and turn.", when_why: "Use for slide/no-brake patterns before speed or pressure.", active_cue: "Catch the wall, then turn", constraint_alternative: "Foam pad or chair creates an external boundary.", representativeness: "Low", feedback_schedule: "High early feedback on boundary control.", conflict: "Hip pain or fear response near boundary.", progression: "Slow rehearsal to half-speed ball, then random target.", regression: "No-club pelvis-to-wall rehearsal.", proof_metric: "Slide reduces while contact and finish balance hold.", source_tags: ["Ground Force Appendix", "Mike Adams"] }),
    c({ drill_id: "DR-GRF-007", name: "Carpet Drag A-P Brake", category: "ground_force", solves: ["FAULT-SLIDE", "FAULT-HANDLE-DRAG"], cause_lane: "body", gpl_fit: [2, 3], practice_block: "serial_variability", learning_stage: "guided_variability", description: "Lead foot drags a towel subtly toward target, then brakes and turns through.", when_why: "Use when horizontal force and braking are missing, but vertical/jump cues would be wrong.", active_cue: "Drag it, brake it, turn", constraint_alternative: "Towel under lead foot gives tactile feedback.", representativeness: "Medium", feedback_schedule: "Cluster feedback after 3 reps.", conflict: "Lead knee pain or unstable flooring.", progression: "Remove towel and retain same finish window.", regression: "Slow-motion rehearsals only.", proof_metric: "Balanced finish with improved low point and less handle drag.", source_tags: ["Ground Force Appendix", "Phil Cheetham"] }),
    c({ drill_id: "DR-GRF-008", name: "Lateral Med-Ball Throw to Shot Window", category: "ground_force", solves: ["FAULT-ALL-TURN-NO-SHIFT", "FAULT-OTT"], cause_lane: "body", gpl_fit: [3, 4], practice_block: "random_variability", learning_stage: "contextual_interference", description: "Lateral med-ball throw to a wall/target, then ball swing to the same start-line window.", when_why: "Use when force sequence exists in rehearsal but fails with a club.", active_cue: "Throw through the window", constraint_alternative: "Target window on wall creates direction and force intent.", representativeness: "Medium", feedback_schedule: "Feedback after ball-transfer set only.", conflict: "Shoulder, rib, lumbar pain, or GP-L1.", progression: "Randomize club and target after each pair.", regression: "Use lighter ball or step-through only.", proof_metric: "Ball starts closer to target window after throw pairing.", source_tags: ["Ground Force Appendix", "Dana Dahlquist"] }),
    c({ drill_id: "DR-GRF-009", name: "Quiet Feet Scoring Base", category: "ground_force", solves: ["FAULT-WEDGE-CONTACT", "FAULT-PUTT-SPEED"], cause_lane: "body", gpl_fit: [1, 2, 3, 4, 5], practice_block: "blocked_acquisition", learning_stage: "acquisition", description: "Wedge or putting reps with intentionally quiet feet and stable base to reduce excess force.", when_why: "Use when full-swing force intent bleeds into scoring shots.", active_cue: "Keep the ground quiet", constraint_alternative: "Towel under both feet tells the player if the base twists or slides.", representativeness: "Medium", feedback_schedule: "Self-rated ground quietness before coach feedback.", progression: "Randomize landing spots while keeping quiet ground.", regression: "No-ball brush swings.", proof_metric: "Carry-distance spread narrows and contact improves.", source_tags: ["Ground Force Appendix", "Short Game Appendix"] }),

    /* Club / TrackMan */
    c({ drill_id: "DR-CFP-003", name: "TrackMan Face-to-Path Corridor", category: "club_face_path", solves: ["FAULT-FACE-OPEN", "FAULT-OTT"], cause_lane: "club", gpl_fit: [2, 3], practice_block: "serial_variability", learning_stage: "guided_variability", description: "Set a face-to-path corridor for the intended shot shape and reveal results after a 3-ball cluster.", when_why: "Use when curve is the symptom and club delivery is the fix target.", active_cue: "Start it in the window", constraint_alternative: "Two alignment sticks or cones define the start window without tech.", representativeness: "Medium", feedback_schedule: "Reveal Face-to-Path after 3 balls, not every ball.", conflict: "Do not use if contact is too unstable to interpret data.", progression: "Narrow corridor or alternate draw/fade windows.", regression: "Use start-line gate only.", proof_metric: "7/10 balls finish inside curve corridor.", source_tags: ["TrackMan University", "TrackMan 3D Appendix"] }),
    c({ drill_id: "DR-CFP-004", name: "Start-Line Gate", category: "club_face_path", solves: ["FAULT-FACE-OPEN", "FAULT-PUTT-STARTLINE"], cause_lane: "club", gpl_fit: [1, 2, 3], practice_block: "blocked_acquisition", learning_stage: "acquisition", description: "Set a gate 3–6 feet in front of the ball; the ball must launch through the gate before curve is judged.", when_why: "Use when face/start-line ownership is first limiter.", active_cue: "Launch it through the gate", constraint_alternative: "Gate itself is the external task.", representativeness: "Medium", feedback_schedule: "Immediate KR early, then 3-ball clusters.", conflict: "Gate too narrow for novice can create steering.", progression: "Move gate farther away or randomize target.", regression: "Widen gate and reduce swing length.", proof_metric: "Start-line pass rate ≥70% before pressure.", source_tags: ["TrackMan University", "Putting Appendix"] }),
    c({ drill_id: "DR-CFP-005", name: "Curve-Control Ladder", category: "club_face_path", solves: ["FAULT-FACE-OPEN", "curve chaos"], cause_lane: "club", gpl_fit: [3, 4, 5], practice_block: "random_variability", learning_stage: "contextual_interference", description: "Player calls straight, small draw, or small fade before each shot and scores start line plus finish window.", when_why: "Use after basic face/path ownership to build adaptable ball-flight control.", active_cue: "Curve it to the window", constraint_alternative: "Three finish windows on the range.", representativeness: "High", feedback_schedule: "Self-score first; TrackMan reveal only after set.", conflict: "GP-L1 or major contact chaos.", progression: "Randomize club and target every ball.", regression: "Two shapes only, same club.", proof_metric: "Intended curve executed on ≥6/10 balls.", source_tags: ["TrackMan University", "Forefront transfer bridge"] }),
    c({ drill_id: "DR-CFP-006", name: "Attack-Angle Window", category: "club_face_path", solves: ["FAULT-DYNAMIC-LOFT-HIGH", "attack angle mismatch"], cause_lane: "club", gpl_fit: [2, 3], practice_block: "serial_variability", learning_stage: "guided_variability", description: "Coach sets an attack-angle intent window for driver or iron and pairs it with a ball-flight task.", when_why: "Use when delivery direction is the cause after setup/equipment checks.", active_cue: "Brush the correct side", constraint_alternative: "Tee or towel sets the brush side without numbers.", representativeness: "Medium", feedback_schedule: "TrackMan reveal after each 3-ball cluster.", conflict: "Do not chase attack angle if face/contact are unowned.", progression: "Narrow window and randomize targets.", regression: "No-ball brush rehearsal.", proof_metric: "Attack angle moves toward target while ball flight improves.", source_tags: ["TrackMan University", "Equipment-Technique Engine"] }),
    c({ drill_id: "DR-CFP-007", name: "Ball-Flight Prediction Card", category: "club_face_path", solves: ["feedback dependency", "curve chaos"], cause_lane: "club", gpl_fit: [3, 4, 5], practice_block: "maintenance_retest", learning_stage: "autonomous_maintenance", description: "Before looking at TrackMan, player predicts start line, curve, strike, and likely face/path relationship.", when_why: "Use to convert tech from continuous guidance into assessment and self-calibration.", active_cue: "Predict before you peek", constraint_alternative: "Monitor is covered until prediction is spoken.", representativeness: "High", feedback_schedule: "Delayed reveal after prediction.", conflict: "Too early for GP-L1 unless choices are simple.", progression: "Predict metric ranges.", regression: "Predict start line and strike only.", proof_metric: "Prediction accuracy improves across 3 sets.", source_tags: ["Guidance hypothesis", "TrackMan University"] }),

    /* Short game / wedge / bunker */
    c({ drill_id: "DR-SG-003", name: "Landing Window Ladder", category: "short_game", solves: ["FAULT-SHORTGAME-DISTANCE"], cause_lane: "ball", gpl_fit: [1, 2, 3], practice_block: "blocked_acquisition", learning_stage: "acquisition", description: "Three landing windows at short, medium, and long carries; progress only after hitting current window.", when_why: "Use when distance control is missing and the player needs external landing feedback.", active_cue: "Land it on the towel", constraint_alternative: "Towels, hoops, or chalk boxes define landing zones.", representativeness: "Medium", feedback_schedule: "Immediate landing KR early; fade to clusters.", conflict: "Avoid tiny windows for anxious novices.", progression: "Randomize landing-window order.", regression: "One window and one club.", proof_metric: "≥7/10 balls land inside chosen window.", source_tags: ["Short Game Appendix", "James Sieckmann"] }),
    c({ drill_id: "DR-SG-004", name: "Four-Trajectory Shot Map", category: "short_game", solves: ["FAULT-SHORTGAME-TRAJECTORY"], cause_lane: "club", gpl_fit: [2, 3, 4], practice_block: "serial_variability", learning_stage: "guided_variability", description: "Build low, mid, high, and soft shot windows using club, face, ball position, and speed constraints.", when_why: "Use when the player has one short-game shot and cannot adapt to pin/lie demands.", active_cue: "Pick the window first", constraint_alternative: "Four apex/landing windows force the decision.", representativeness: "High", feedback_schedule: "Feedback after each shot choice, then after 3-shot ladder.", conflict: "Do not add four options before contact ownership.", progression: "Random lie and random window.", regression: "Two trajectories only.", proof_metric: "Correct window selected and executed in 6/8 scenarios.", source_tags: ["Short Game Appendix", "Short Game Chef", "Joseph Mayo"] }),
    c({ drill_id: "DR-SG-005", name: "Clock-System Carry Ladder", category: "short_game", solves: ["FAULT-SHORTGAME-DISTANCE", "wedge distance control"], cause_lane: "club", gpl_fit: [1, 2, 3], practice_block: "serial_variability", learning_stage: "guided_variability", description: "Use clock-length swings to map wedge carry windows, then fade clock language toward landing targets.", when_why: "Use for wedge matrix building without making every shot a mechanical checkpoint.", active_cue: "Carry it to the number", constraint_alternative: "Yardage signs or towels become the target.", representativeness: "Medium", feedback_schedule: "Carry feedback every rep during mapping, then cluster feedback.", conflict: "Avoid if clock language makes player rigid.", progression: "Randomize wedge and carry after mapping.", regression: "One wedge, two carry windows.", proof_metric: "Carry dispersion inside coach-defined window.", source_tags: ["Short Game Appendix", "TrackMan wedge"] }),
    c({ drill_id: "DR-SG-006", name: "Lie Adaptation Three-Ball Selector", category: "short_game", solves: ["FAULT-WEDGE-CONTACT", "FAULT-SHORTGAME-TRAJECTORY"], cause_lane: "strategy", gpl_fit: [3, 4, 5], practice_block: "random_variability", learning_stage: "contextual_interference", description: "Three different lies; player chooses club, trajectory, and landing spot before each shot.", when_why: "Use when technique works from perfect lies but fails in grass/slope variation.", active_cue: "Read the lie, choose the window", constraint_alternative: "Coach controls lie variability; player controls solution.", representativeness: "High", feedback_schedule: "Decision review after each 3-ball set.", conflict: "Too early if flat-lie contact is unowned.", progression: "Add score consequence for wrong decision.", regression: "Two lie types only.", proof_metric: "Correct decision and acceptable result on ≥6/9 lies.", source_tags: ["Short Game Appendix", "Representative design"] }),
    c({ drill_id: "DR-SG-007", name: "Bunker Entry-Point Ruler", category: "short_game", solves: ["FAULT-BUNKER-ENTRY"], cause_lane: "ball", gpl_fit: [1, 2, 3], practice_block: "blocked_acquisition", learning_stage: "acquisition", description: "Mark 2, 3, and 4 inches behind the ball; player learns predictable sand entry before trajectory changes.", when_why: "Use for bunker players who hit ball first, take too much sand, or fear the sand.", active_cue: "Splash the line", constraint_alternative: "Draw line in sand and remove the ball first.", representativeness: "Medium", feedback_schedule: "Immediate sand-entry feedback; fade once stable.", conflict: "Do not add pressure before safe entry and exit.", progression: "Randomize entry line and landing window.", regression: "Line-only splashes.", proof_metric: "Entry point inside selected zone on 7/10 reps.", source_tags: ["Short Game Appendix", "Bunker training"] }),
    c({ drill_id: "DR-SG-008", name: "Short Game Solo Match", category: "short_game", solves: ["FAULT-COURSE-TRANSFER", "pressure short game"], cause_lane: "strategy", gpl_fit: [4, 5], practice_block: "pressure_scoring", learning_stage: "representative_transfer", description: "Play 9 short-game holes against par-2. Full routine, one ball, score every outcome.", when_why: "Use when practice contact exists but scoring does not transfer.", active_cue: "Play the lie, finish the hole", constraint_alternative: "Scorecard and one-ball rule create pressure.", representativeness: "High", feedback_schedule: "After-hole review only.", conflict: "Do not use for GP-L1 or fragile confidence after a new change.", progression: "Add opponent or consequence ladder.", regression: "Three-ball best-score format.", proof_metric: "Par-2 score or decision quality improves.", source_tags: ["Short Game Appendix", "Pressure inoculation"] }),

    /* Putting */
    c({ drill_id: "DR-PUT-004", name: "Face Alignment Mirror", category: "putting", solves: ["FAULT-PUTT-STARTLINE"], cause_lane: "club", gpl_fit: [1, 2], practice_block: "blocked_acquisition", learning_stage: "acquisition", description: "Use mirror feedback to align eyes, face, and start line, then roll short putts through a gate.", when_why: "Use when start line is poor and aim/setup may be the cause.", active_cue: "Aim the face through the gate", constraint_alternative: "Mirror and gate define task boundaries.", representativeness: "Low", feedback_schedule: "High feedback in calibration, then remove mirror.", conflict: "Do not overuse if player becomes setup-obsessed.", progression: "Remove mirror and keep gate.", regression: "Static face aim only.", proof_metric: "Start-line gate pass ≥8/10 from 4 feet.", source_tags: ["Putting Appendix", "TrackMan Putting Protocol"] }),
    c({ drill_id: "DR-PUT-005", name: "Double-Ball Impact Roll", category: "putting", solves: ["FAULT-PUTT-STARTLINE"], cause_lane: "club", gpl_fit: [1, 2, 3], practice_block: "blocked_acquisition", learning_stage: "acquisition", description: "Roll two balls touching each other so impact instability immediately changes the roll.", when_why: "Use when start-line errors come from impact rather than aim.", active_cue: "Roll both balls together", constraint_alternative: "The two-ball task magnifies impact error.", representativeness: "Low", feedback_schedule: "Immediate KR each rep, then fade to normal ball.", conflict: "Too frustrating if gate is also too tight.", progression: "Normal ball through narrow gate.", regression: "Shorter putt and wider gate.", proof_metric: "Normal-ball start line improves after 10 reps.", source_tags: ["Putting Appendix", "Wulf external focus"] }),
    c({ drill_id: "DR-PUT-006", name: "Leapfrog Distance Ladder", category: "putting", solves: ["FAULT-PUTT-SPEED"], cause_lane: "ball", gpl_fit: [1, 2, 3], practice_block: "serial_variability", learning_stage: "guided_variability", description: "Each putt must finish past the previous ball but short of a back boundary.", when_why: "Use for lag-speed calibration without stroke mechanics.", active_cue: "Roll it past the last ball", constraint_alternative: "Previous ball and back boundary define success.", representativeness: "Medium", feedback_schedule: "Outcome every rep; coach feedback after set.", conflict: "None.", progression: "Change slope or distance after each ladder.", regression: "Flat surface and shorter ladder.", proof_metric: "Complete ladder with no balls past back boundary.", source_tags: ["Putting Appendix", "Speed control"] }),
    c({ drill_id: "DR-PUT-007", name: "Quiet Eye Gaze-Hold", category: "putting", solves: ["FAULT-PUTT-PRESSURE", "FAULT-POOR-PSR"], cause_lane: "psych", gpl_fit: [2, 3, 4], practice_block: "representative_transfer", learning_stage: "representative_transfer", description: "Hold final gaze on start spot/target, roll the putt, and keep eyes quiet through impact.", when_why: "Use when pressure creates scanning, deceleration, or steering.", active_cue: "See it, roll it, hold it", constraint_alternative: "Coin or mark becomes final fixation point.", representativeness: "High", feedback_schedule: "Self-report gaze quality before result feedback.", conflict: "Not first-line if basic aim is unknown.", progression: "Add one-ball make-or-move-on rule.", regression: "No-score gaze reps from 3 feet.", proof_metric: "Gaze hold and routine present on ≥8/10 pressure putts.", source_tags: ["Putting Appendix", "Psychology Appendix"] }),
    c({ drill_id: "DR-PUT-008", name: "Random Distance Game", category: "putting", solves: ["FAULT-PUTT-SPEED", "blocked-practice dependency"], cause_lane: "ball", gpl_fit: [3, 4, 5], practice_block: "random_variability", learning_stage: "contextual_interference", description: "Every putt changes distance, slope, or target. Score finish zone and first-putt quality.", when_why: "Use after speed ladder success to force transfer.", active_cue: "Match speed to the hole", constraint_alternative: "Coach calls next distance only after previous putt.", representativeness: "High", feedback_schedule: "Summary after 6–10 putts.", conflict: "Too early if flat-surface speed is unowned.", progression: "Add consequence scoring.", regression: "Serial near-mid-far ladder.", proof_metric: "Finish-zone pass rate improves.", source_tags: ["Putting Appendix", "Contextual interference"] }),
    c({ drill_id: "DR-PUT-009", name: "Par-2 Pressure Putting", category: "putting", solves: ["FAULT-PUTT-PRESSURE", "FAULT-POOR-PSR"], cause_lane: "psych", gpl_fit: [4, 5], practice_block: "pressure_scoring", learning_stage: "representative_transfer", description: "Play 9 putting holes as par-2, one ball only, full routine, every putt holed or scored.", when_why: "Use after start-line and speed skills survive random practice.", active_cue: "Read it, roll it, score it", constraint_alternative: "Scorecard and one-ball rule create representative pressure.", representativeness: "High", feedback_schedule: "After-hole or after-round review only.", conflict: "Not after a brand-new technical change or red readiness.", progression: "Add opponent or must-make constraint.", regression: "Two-ball scramble version.", proof_metric: "Score improves and routine remains stable on ≥8/9 holes.", source_tags: ["Putting Appendix", "Pressure inoculation"] }),

    /* Transfer, warmup, psychology */
    c({ drill_id: "DR-XFR-003", name: "54-Shot Random Challenge", category: "course_transfer", solves: ["FAULT-COURSE-TRANSFER"], cause_lane: "strategy", gpl_fit: [3, 4, 5], practice_block: "random_variability", learning_stage: "contextual_interference", description: "54 shots with new club, target, and shot shape every ball. One ball, full decision, no groove reps.", when_why: "Use when the pattern works in blocks but disappears when the task changes.", active_cue: "One ball, one decision", constraint_alternative: "Deck of cards or randomized list controls next shot.", representativeness: "High", feedback_schedule: "Summary feedback every 9 shots.", conflict: "Not for GP-L1 or immediately after new-pattern lesson.", progression: "Add pressure score and target penalties.", regression: "18-shot random challenge.", proof_metric: "Acceptable-shot percentage improves across 3 blocks.", source_tags: ["TPI Maximize On-Course Performance", "Contextual interference"] }),
    c({ drill_id: "DR-XFR-004", name: "Practice Round Pattern Thought", category: "course_transfer", solves: ["FAULT-COURSE-TRANSFER", "old pattern return"], cause_lane: "strategy", gpl_fit: [4], practice_block: "representative_transfer", learning_stage: "representative_transfer", description: "9-hole practice round with one approved pattern thought during rehearsal, then target focus over the ball.", when_why: "Use after random range work succeeds and the player needs a bridge to the course.", active_cue: "Rehearse pattern, play target", constraint_alternative: "Scorecard checkbox tracks rehearsal cue and target focus.", representativeness: "High", feedback_schedule: "Post-hole reflection only.", conflict: "Competition round or 0–6 hour no-contamination window after brand-new change.", progression: "Remove pattern thought for target-only round.", regression: "Pattern thought only on tee shots.", proof_metric: "Pattern rehearsal and target focus present on ≥70% of shots.", source_tags: ["Transfer bridge", "Sleep/no-contamination protocol"] }),
    c({ drill_id: "DR-XFR-005", name: "No-Go Miss Decision Game", category: "course_transfer", solves: ["poor target selection", "FAULT-COURSE-TRANSFER"], cause_lane: "strategy", gpl_fit: [3, 4, 5], practice_block: "representative_transfer", learning_stage: "representative_transfer", description: "Before each shot, identify no-go miss, pick target away from it, then commit through PSR.", when_why: "Use when execution is acceptable but scoring suffers from target decisions.", active_cue: "Aim away from trouble", constraint_alternative: "Cones mark no-go zone and safe start window.", representativeness: "High", feedback_schedule: "Decision quality reviewed after set or hole.", conflict: "Avoid if basic contact is still being acquired.", progression: "Run on course with real hazards.", regression: "Static range targets with one club.", proof_metric: "Fewer penalty-zone decisions and better acceptable-shot rate.", source_tags: ["Course Management Appendix", "Strategy layer"] }),
    c({ drill_id: "DR-WAR-002", name: "20-Min Quick Bay Warmup", category: "warmup_prep", solves: ["cold start", "FAULT-READINESS-RED"], cause_lane: "body", gpl_fit: [1, 2, 3, 4, 5], practice_block: "warmup_prep", learning_stage: "acquisition", description: "2 min intention, 5 min activation, 5 min wedge-to-7i ramp, 5 min goal-specific rehearsal, 3 min baseline.", when_why: "Use before short TrackMan practice so readiness and first baseline are not skipped.", active_cue: "Warm up the task first", constraint_alternative: "Timer controls each segment.", representativeness: "Medium", feedback_schedule: "No technical feedback until baseline unless safety issue appears.", conflict: "Pain red gate changes to restricted warmup.", progression: "Add faster intent set if readiness is green.", regression: "Mobility and wedge ramp only.", proof_metric: "Readiness ≥7/10 and baseline is not a cold-start outlier.", source_tags: ["Warmup KB", "TPI warmup"] }),
    c({ drill_id: "DR-WAR-003", name: "Pain / Mobility Restricted Warmup", category: "warmup_prep", solves: ["FAULT-READINESS-RED", "pain gate"], cause_lane: "body", gpl_fit: [1, 2], practice_block: "warmup_prep", learning_stage: "acquisition", description: "Breathing, pain-free ROM, low-speed rehearsal, wedge-only contact, and no high-intent speed or pressure.", when_why: "Use when pain, sleep, readiness, or movement screen fails.", active_cue: "Find the safe window", constraint_alternative: "Pain-free ROM and low-speed contact define allowed task.", representativeness: "Low", feedback_schedule: "Frequent safety check-ins; no performance pressure.", conflict: "Sharp pain, neuro symptoms, or worsening trend means stop/refer.", progression: "Return to normal warmup after green gate.", regression: "No-ball mobility and referral.", proof_metric: "Pain remains stable or lower and symptoms do not worsen.", source_tags: ["Bridge Gates Appendix", "Safety gates"] }),
    c({ drill_id: "DR-PSY-002", name: "Box Breath + Cue Word Reset", category: "psychology", solves: ["FAULT-RUSHED-TRANS", "FAULT-POOR-PSR"], cause_lane: "psych", gpl_fit: [2, 3, 4, 5], practice_block: "reflection", learning_stage: "guided_variability", description: "After a miss or before pressure reps, complete one box breath and use one approved cue word.", when_why: "Use when tempo and attention collapse under threat or frustration.", active_cue: "Breathe, choose, commit", constraint_alternative: "Coach withholds next ball until reset routine is complete.", representativeness: "Medium", feedback_schedule: "Self-report stress before coach feedback.", conflict: "Do not let reset become avoidance or excessive delay.", progression: "Use inside scored pressure game.", regression: "Use only before set.", proof_metric: "Routine completed and next-shot tempo stabilizes after misses.", source_tags: ["Psychology Appendix", "Golf State of Mind"] }),
    c({ drill_id: "DR-PSY-003", name: "Ugly-Practice Normalizer", category: "psychology", solves: ["blocked-to-random anxiety", "confidence drop"], cause_lane: "psych", gpl_fit: [3, 4], practice_block: "reflection", learning_stage: "contextual_interference", description: "Coach frames random practice as a transfer test, then player scores decision quality and commitment before outcome.", when_why: "Use at the GP-L2 to GP-L3 bridge when practice looks worse but learning demand is higher.", active_cue: "Test ownership, not perfection", constraint_alternative: "Scorecard separates process, decision, and outcome.", representativeness: "High", feedback_schedule: "Summary feedback only after the set.", conflict: "Not a replacement for regression when pattern collapses.", progression: "Add one-ball and consequence rules after process stabilizes.", regression: "Return to serial variability, not full blocked.", proof_metric: "Process score holds despite higher contextual interference.", source_tags: ["Psychology Appendix", "Contextual interference"] }),

    /* Equipment / clubfitting triage */
    c({ drill_id: "DR-EQ-001", name: "Lie Board + Start-Line Triage", category: "club_face_path", solves: ["FAULT-EQUIP-LIE-LOFT", "FAULT-FACE-OPEN", "FAULT-HEEL-TOE-STRIKE"], cause_lane: "equipment", gpl_fit: [2, 3], practice_block: "serial_variability", learning_stage: "guided_variability", description: "Compare lie-board/tape marks with start line, strike location, and face delivery before prescribing a swing fix.", when_why: "Use when directional miss may be influenced by lie angle or sole interaction.", active_cue: "Test the tool, then choose", constraint_alternative: "Alternate current club and test club in 3-ball clusters.", representativeness: "Medium", feedback_schedule: "Cluster feedback only; do not chase one strike mark.", conflict: "Do not treat one outlier as a fitting conclusion.", progression: "Confirm outdoors with start line and turf interaction.", regression: "Use face tape and static lie check only.", proof_metric: "Directional bias changes predictably when equipment variable changes.", source_tags: ["Equipment-Technique Engine", "Clubfitting section"] }),
    c({ drill_id: "DR-EQ-002", name: "Driver Loft-Spin Window Check", category: "club_face_path", solves: ["FAULT-EQUIP-LIE-LOFT", "FAULT-WEAK-SMASH", "loss of power"], cause_lane: "equipment", gpl_fit: [3, 4, 5], practice_block: "maintenance_retest", learning_stage: "autonomous_maintenance", description: "Use TrackMan to compare launch, spin, dynamic loft, attack angle, strike, and smash across current and adjusted loft settings.", when_why: "Use when power loss may be launch/spin/equipment rather than only speed production.", active_cue: "Launch it through the window", constraint_alternative: "Same tee height, same target, 5-ball clusters per setting.", representativeness: "Medium", feedback_schedule: "Reveal averages after each cluster, not every shot.", conflict: "Do not fit around a temporary swing-change pattern.", progression: "Confirm best setting under random target and one-ball routine.", regression: "Static strike and tee-height test before hosel changes.", proof_metric: "Ball speed/launch/spin window improves without dispersion penalty.", source_tags: ["TrackMan University", "Equipment-Technique Engine"] }),
    c({ drill_id: "DR-EQ-003", name: "Length / Strike Pattern A-B Test", category: "contact_lowpoint", solves: ["FAULT-EQUIP-LIE-LOFT", "FAULT-HEEL-TOE-STRIKE", "FAULT-WEAK-SMASH"], cause_lane: "equipment", gpl_fit: [2, 3, 4], practice_block: "serial_variability", learning_stage: "guided_variability", description: "A-B test choke-down, standard length, and test club length while tracking strike location and smash.", when_why: "Use when heel/toe pattern persists despite setup and delivery work.", active_cue: "Find the center more often", constraint_alternative: "Face tape makes center-strike the task.", representativeness: "Medium", feedback_schedule: "Show face tape after 3-ball cluster; TrackMan average after 6 balls.", conflict: "Do not recommend equipment change without repeatable pattern evidence.", progression: "Move best length into random target set.", regression: "Static setup-distance check first.", proof_metric: "Center-strike rate and smash improve across repeated clusters.", source_tags: ["Equipment-Technique Engine", "Forefront clubfitting matrix"] }),
    c({ drill_id: "DR-EQ-004", name: "Static Equipment Red-Flag Screen", category: "club_face_path", solves: ["FAULT-EQUIP-LIE-LOFT", "setup-equipment mismatch"], cause_lane: "equipment", gpl_fit: [1], practice_block: "blocked_acquisition", learning_stage: "acquisition", description: "Check grip size, club length, obvious lie/loft mismatch, worn grip, and setup distortion before blaming the motor pattern.", when_why: "Use in GP-L1 when equipment may be creating noise before the player has enough pattern stability for dynamic testing.", active_cue: "Fit the tool to the task", constraint_alternative: "Compare current club to coach reference club in static setup only.", representativeness: "Low", feedback_schedule: "Coach-led screen; no performance feedback needed.", conflict: "Do not make fitting conclusions from static check alone.", progression: "Move to dynamic lie/strike triage at GP-L2.", regression: "Flag for clubfitting review only.", proof_metric: "Coach can rule in/out obvious equipment distortion before motor-learning block.", source_tags: ["Equipment-Technique Engine", "Clubfitting section"] }),

    /* TrackMan Performance Studio protocol cards */
    c({ drill_id: "TM-PC-001", name: "Performance Center Quick Transfer Block", category: "course_transfer", solves: ["FAULT-COURSE-TRANSFER", "blocked-practice dependency"], cause_lane: "strategy", gpl_fit: [3, 4, 5], practice_block: "random_variability", learning_stage: "contextual_interference", trackman_modes: ["tm_performance_center_quick", "tm_performance_center_random"], description: "12–24 Performance Center shots using distance range, green/pin selection, and Random or Quick Play to bridge range work to target execution.", when_why: "Use after pattern stability in serial practice when the next question is whether the player can execute varied shots.", active_cue: "One ball, one decision", constraint_alternative: "Random distance and pin replace repeated groove reps.", representativeness: "High", feedback_schedule: "Review Strokes Gained/Points after 6-shot clusters; avoid every-shot club-data coaching.", conflict: "Do not use for GP-L1 new-change installation or red readiness.", progression: "Narrow distance interval, tougher pin, or lower HCP benchmark.", regression: "Custom mode with two distances and no score threshold.", proof_metric: "Acceptable-shot percentage or SG/points improves across clusters.", source_tags: ["TrackMan Performance Center", "Forefront TPS Appendix"] }),
    c({ drill_id: "TM-PC-002", name: "Performance Center Pin-Sheet Simulation", category: "course_transfer", solves: ["FAULT-COURSE-TRANSFER", "poor target selection", "tournament prep"], cause_lane: "strategy", gpl_fit: [4, 5], practice_block: "representative_transfer", learning_stage: "representative_transfer", trackman_modes: ["tm_performance_center_quick", "tm_performance_center_custom"], description: "Build upcoming-course pin and distance scenarios, then require club, target, no-go miss, trajectory, and routine before each shot.", when_why: "Use for tournament prep and course-management transfer when the player needs strategic rehearsal, not more mechanics.", active_cue: "Pick the safe window", constraint_alternative: "Pin location and no-go miss create the task.", representativeness: "High", feedback_schedule: "Decision-quality review after each 3-hole or 6-shot set.", conflict: "Do not introduce new swing mechanics under this score pressure.", progression: "Add opponent benchmark or consequence scoring.", regression: "Remove score and rehearse target selection only.", proof_metric: "Decision quality and SG/points hold under one-ball conditions.", source_tags: ["TrackMan Performance Center", "Course Management Appendix", "Forefront TPS Appendix"] }),
    c({ drill_id: "TM-PC-003", name: "Performance Center Custom Retest", category: "course_transfer", solves: ["FAULT-COURSE-TRANSFER", "retest needed"], cause_lane: "strategy", gpl_fit: [3, 4, 5], practice_block: "maintenance_retest", learning_stage: "autonomous_maintenance", trackman_modes: ["tm_performance_center_custom"], description: "Saved Custom Performance Test with same warmup, benchmark, distance bands, green/pin setup, and scoring criteria every retest.", when_why: "Use monthly or block-end to prove whether practice changed scoring skill.", active_cue: "Test, do not tinker", constraint_alternative: "No coaching during scored test except safety/setup correction.", representativeness: "High", feedback_schedule: "Debrief after the test; export or capture summary if available.", conflict: "Too much for fragile GP-L1/2 clients or fatigue-red days.", progression: "Compare to lower HCP group or harder pin set.", regression: "Shorter 12-shot band test.", proof_metric: "Score, dispersion, and weakest band improve versus prior retest.", source_tags: ["TrackMan Performance Center", "Forefront TPS Appendix"] }),
    c({ drill_id: "TM-SA-001", name: "Shot Analysis Metric Install", category: "club_face_path", solves: ["FAULT-FACE-OPEN", "FAULT-DYNAMIC-LOFT-HIGH", "FAULT-LOWPOINT-BACK", "FAULT-WEAK-SMASH"], cause_lane: "club", gpl_fit: [1, 2, 3], practice_block: "blocked_acquisition", learning_stage: "acquisition", trackman_modes: ["tm_shot_analysis"], description: "One TrackMan metric only: face, path, low point, attack angle, dynamic loft, or smash. Use baseline, constraint, and proof cluster.", when_why: "Use when installing a new pattern and the coach needs clean club/ball evidence.", active_cue: "Match the window", constraint_alternative: "Metric target becomes pass/fail with one external ball-flight window.", representativeness: "Low", feedback_schedule: "High early feedback, then reveal after 3-ball clusters.", conflict: "Do not stack multiple metrics or let AI tips become a second coach.", progression: "Move to Corridors or Test Center.", regression: "No-ball or video-only constraint.", proof_metric: "Target metric moves and ball flight improves in a 3-shot proof cluster.", source_tags: ["TrackMan Shot Analysis", "Forefront TPS Appendix"] }),
    c({ drill_id: "TM-COR-001", name: "Corridor Constraint Block", category: "club_face_path", solves: ["FAULT-FACE-OPEN", "FAULT-OTT", "FAULT-DYNAMIC-LOFT-HIGH", "feedback dependency"], cause_lane: "club", gpl_fit: [1, 2, 3], practice_block: "serial_variability", learning_stage: "guided_variability", trackman_modes: ["tm_corridors"], description: "Set one min/max corridor for a key TrackMan metric and pair it with an external target window.", when_why: "Use when the player has an early metric change but needs pass/fail repetition without over-coaching.", active_cue: "Send it through the corridor", constraint_alternative: "Corridor is the task; coach does not add extra body cues.", representativeness: "Medium", feedback_schedule: "Immediate for first 3 reps, then cluster reveal and prediction.", conflict: "Do not use narrow corridors with anxious GP-L1 clients.", progression: "Narrow corridor or randomize target.", regression: "Widen corridor and shorten swing.", proof_metric: "≥70% corridor pass rate with stable ball flight.", source_tags: ["TrackMan Corridors", "Guidance hypothesis", "Forefront TPS Appendix"] }),
    c({ drill_id: "TM-SPD-001", name: "TrackMan Speed Training with Ball Transfer", category: "speed", solves: ["FAULT-SPEED-CEILING", "speed does not transfer", "FAULT-WEAK-SMASH"], cause_lane: "body", gpl_fit: [3, 4, 5], practice_block: "maintenance_retest", learning_stage: "autonomous_maintenance", trackman_modes: ["tm_speed_training"], description: "Ball-free TrackMan Speed Training set followed immediately by ball-transfer shots to prove launch, strike, and speed carryover.", when_why: "Use after readiness gates for speed days, Mach 3 integration, or speed maintenance.", active_cue: "Speed to the window", constraint_alternative: "Speed number only counts if the transfer ball passes strike and launch criteria.", representativeness: "Medium", feedback_schedule: "Show speed after set; reveal ball metrics after transfer cluster.", conflict: "No red pain/readiness, no contact chaos, no new swing-change day.", progression: "Randomize target after each speed set.", regression: "Reduce intent or use rhythm tool instead.", proof_metric: "Peak speed improves while ball speed/smash and launch window hold.", source_tags: ["TrackMan Speed Training", "Mach 3 Appendix", "Forefront TPS Appendix"] }),
    c({ drill_id: "TM-COM-001", name: "Combine / Whole-Bag Benchmark", category: "course_transfer", solves: ["retest needed", "whole-bag gap", "FAULT-COURSE-TRANSFER"], cause_lane: "strategy", gpl_fit: [3, 4, 5], practice_block: "maintenance_retest", learning_stage: "autonomous_maintenance", trackman_modes: ["tm_combine", "tm_test_center"], description: "Standardized Combine or shorter Forefront Test Center benchmark to identify weak distance bands and whole-bag patterns.", when_why: "Use for onboarding audits, block-end retests, or when practice priorities are unclear.", active_cue: "Benchmark, then build", constraint_alternative: "No coaching during scoring; weak bands become future practice blocks.", representativeness: "High", feedback_schedule: "Debrief after full test only.", conflict: "Not weekly practice, not GP-L1 acquisition, and not fatigue-red days.", progression: "Retest every 4–8 weeks or compare to stronger benchmark.", regression: "Shorter 12–18 shot distance-band test.", proof_metric: "Score and weak distance bands improve from prior benchmark.", source_tags: ["TrackMan Combine", "Test Center", "Forefront TPS Appendix"] }),
    c({ drill_id: "TM-OC-001", name: "On Course Practice / Virtual Golf Transfer", category: "course_transfer", solves: ["FAULT-COURSE-TRANSFER", "FAULT-POOR-PSR", "pressure transfer"], cause_lane: "strategy", gpl_fit: [4, 5], practice_block: "representative_transfer", learning_stage: "representative_transfer", trackman_modes: ["tm_on_course_practice", "tm_virtual_golf"], description: "Drop ball into exact virtual-course scenarios or play selected holes with one-ball routine, target decision, and score rules.", when_why: "Use when technical skill exists but decision/routine/pressure transfer is the limiter.", active_cue: "Play the shot first", constraint_alternative: "Course situation replaces technical repetition.", representativeness: "High", feedback_schedule: "After hole or set; decision and routine before club metrics.", conflict: "Does not count as practice if it becomes casual simulator entertainment.", progression: "Add match play, tournament mode, or benchmark target.", regression: "Remove score and rehearse target selection.", proof_metric: "Routine completion, decision quality, and score improve across scenarios.", source_tags: ["TrackMan On Course Practice", "Virtual Golf", "Forefront TPS Appendix"] }),
    c({ drill_id: "TM-PUT-001", name: "TrackMan Putting Analysis Retest", category: "putting", solves: ["FAULT-PUTT-STARTLINE", "FAULT-PUTT-SPEED", "FAULT-PUTT-PRESSURE"], cause_lane: "club", gpl_fit: [1, 2, 3, 4, 5], practice_block: "maintenance_retest", learning_stage: "autonomous_maintenance", trackman_modes: ["tm_putting_analysis"], description: "Putting Analysis block for start line, speed, roll, read, and tempo proof, followed by no-screen random or pressure putting.", when_why: "Use to separate start-line, speed, read, and roll problems before assigning putting homework.", active_cue: "Roll it on line", constraint_alternative: "Gate, distance ladder, or one-ball pressure set must follow the lab read.", representativeness: "Medium", feedback_schedule: "Metric feedback during calibration; no-screen transfer after.", conflict: "Do not let lab metrics replace make/miss, speed, and green-reading tasks.", progression: "Random distance game or Par-2 pressure putting.", regression: "Start-line gate only.", proof_metric: "Metric improves and no-screen transfer set also improves.", source_tags: ["TrackMan Putting", "Putting Appendix", "Forefront TPS Appendix"] }),
    c({ drill_id: "TM-OPT-001", name: "Optimizer / Launch Efficiency Triage", category: "club_face_path", solves: ["FAULT-EQUIP-LIE-LOFT", "FAULT-WEAK-SMASH", "loss of power", "launch-spin mismatch"], cause_lane: "equipment", gpl_fit: [3, 4, 5], practice_block: "maintenance_retest", learning_stage: "autonomous_maintenance", trackman_modes: ["tm_optimizer"], description: "Use Optimizer to compare actual launch, spin, ball speed, attack angle, and dynamic loft against an efficiency window before deciding whether the limiter is delivery, strike, speed, or equipment.", when_why: "Use when the player is losing distance despite adequate speed, when driver settings are uncertain, or when a swing fix may be masking a launch-condition problem.", active_cue: "Find the efficient window", constraint_alternative: "Averages from same-tee, same-target 5-ball clusters decide the next branch.", representativeness: "Medium", feedback_schedule: "Review cluster averages only; no every-shot optimization chasing.", conflict: "Do not fit or rebuild technique around a temporary swing-change pattern, fatigue-red day, or one-shot outlier.", progression: "Confirm best window under random target or one-ball Performance Center task.", regression: "Return to strike-pattern and tee-height checks before equipment changes.", proof_metric: "Carry, ball speed, launch/spin window, and dispersion improve without contact penalty.", source_tags: ["TrackMan Optimizer", "Equipment-Technique Engine", "Forefront TPS Appendix"] })
  ];

  const existing = new Set(window.FF_DRILLS.map(d => d.drill_id));
  cards.forEach(d => { if (!existing.has(d.drill_id)) window.FF_DRILLS.push(d); });

  const inferStage = d => {
    const blockMap = {
      warmup_prep: "acquisition",
      blocked_acquisition: "acquisition",
      serial_variability: "guided_variability",
      random_variability: "contextual_interference",
      representative_transfer: "representative_transfer",
      pressure_scoring: "representative_transfer",
      maintenance_retest: "autonomous_maintenance",
      reflection: d.gpl_fit && Math.max(...d.gpl_fit) >= 3 ? "contextual_interference" : "guided_variability"
    };
    if (d.learning_stage) return d.learning_stage;
    if (d.practice_block && blockMap[d.practice_block]) return blockMap[d.practice_block];
    const maxGpl = Math.max(...d.gpl_fit);
    return maxGpl >= 5 ? "autonomous_maintenance" : maxGpl >= 4 ? "representative_transfer" : maxGpl >= 3 ? "contextual_interference" : maxGpl >= 2 ? "guided_variability" : "acquisition";
  };

  const inferBlock = d => {
    if (d.practice_block) return d.practice_block;
    const maxGpl = Math.max(...d.gpl_fit);
    if (d.category === "warmup_prep") return "warmup_prep";
    if (d.category === "psychology" && maxGpl >= 4) return "pressure_scoring";
    if (d.drill_id === "DR-CFP-002") return "serial_variability";
    if (d.drill_id === "DR-PUT-003") return "maintenance_retest";
    if (d.representativeness === "High" && maxGpl >= 4) return "representative_transfer";
    if (d.representativeness === "High") return "random_variability";
    if (d.representativeness === "Medium" && maxGpl >= 5) return "maintenance_retest";
    if (d.representativeness === "Medium" && maxGpl >= 4) return "representative_transfer";
    if (d.representativeness === "Medium" && maxGpl >= 3) return "serial_variability";
    if (maxGpl >= 3) return "serial_variability";
    return "blocked_acquisition";
  };

  window.FF_DRILLS = window.FF_DRILLS.map(d => ({
    practice_block: inferBlock(d),
    learning_stage: inferStage(d),
    trackman_modes: d.trackman_modes || [],
    ...d
  }));
})();
