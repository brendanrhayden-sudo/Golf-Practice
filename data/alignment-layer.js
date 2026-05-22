/* =============================================================================
   FOREFRONT — DRILL / SESSION ALIGNMENT LAYER  (2026-05-22)
   =============================================================================

   Purpose
   -------
   Adds an explicit `branch_intent → drill/session block alignment` map on top of
   the existing keyword/bridging logic. This layer is authoritative for:

   1. Which drill categories are ALLOWED for a branch_intent.
   2. Which drill categories are BLOCKED (with reason text).
   3. The preferred PRIMARY session block per intent.
   4. Which blocks are valid CARRYOVER landing zones.
   5. "Do not use if" flags that fire from gate state + intent.
   6. Drills that must appear PRIMARY ONCE only (e.g. Pump Drill DR-GRF-004).
   7. Whether the intent forces a MODIFIED / STOP session mode
      (mobility_pain_readiness, speed_readiness with red gate, etc.).

   This file is pure data + small pure helpers. No DOM. No storage. No network.
   Loaded BEFORE app.js. Exposed on window for app.js to consume.

   Drill categories in use (canonical):
     full_swing, speed, ground_force, club_face_path, contact_lowpoint,
     short_game, putting, course_transfer, warmup_prep, psychology

   Session block kinds (canonical):
     warmup_prep, blocked_acquisition, serial_variability, random_variability,
     representative_transfer, pressure_scoring, maintenance_retest, reflection

   The map below covers all 20 intents authored in BRANCH_INTENTS.
   ========================================================================== */

(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Canonical block aliases (UI block kind -> practice_block tag list)
  // Lets us speak in "primary" vs "carryover" while still mapping to existing
  // practice_block tags on individual drills.
  // ---------------------------------------------------------------------------
  const BLOCKS = {
    warmup:     ["warmup_prep"],
    primary:    ["blocked_acquisition", "serial_variability"],
    carryover:  ["random_variability", "representative_transfer"],
    scoring:    ["pressure_scoring"],
    retest:     ["maintenance_retest"],
    reflection: ["reflection"]
  };

  // ---------------------------------------------------------------------------
  // Master alignment map. Keys are BRANCH_INTENT ids (see diagnostic-layer.js).
  // ---------------------------------------------------------------------------
  // Schema (per intent):
  //   allowed_categories       — drills MUST be in one of these to be primary
  //   carryover_categories     — additionally allowed in block2/retest only
  //   blocked_categories       — drills in these are filtered out (with reason)
  //   preferred_primary_block  — UI block kind that should hold the primary drill
  //   allowed_carryover_blocks — UI block kinds that may hold carryover drills
  //   must_pass_first          — proof card / gate that must be green before
  //                              full-swing mechanical drills are unblocked
  //   do_not_use_if            — list of gate/state conditions that bar drills
  //   primary_once_drills      — drill_ids that may appear PRIMARY only once,
  //                              and only as carryover variants thereafter
  //   session_mode             — "normal" | "modified_only" | "stop_refer"
  //   notes                    — short coach-facing rationale
  // ---------------------------------------------------------------------------
  const FF_INTENT_ALIGNMENT = {

    // ---- SETUP / AIM ------------------------------------------------------
    aim_setup: {
      allowed_categories: ["warmup_prep", "club_face_path", "contact_lowpoint"],
      carryover_categories: ["full_swing"],
      blocked_categories: ["speed", "psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest", "reflection"],
      do_not_use_if: ["pain_red", "mobility_red"],
      session_mode: "normal",
      notes: "Confirm aim and setup BEFORE any path/face mechanics."
    },

    // ---- EQUIPMENT FIT ----------------------------------------------------
    // Per task: A/B test, fitting/setup confirmation, strike comparison.
    // No full-swing mechanical drills as primary until equipment proof passes.
    equipment_fit: {
      allowed_categories: ["warmup_prep", "contact_lowpoint", "club_face_path"],
      carryover_categories: ["short_game"],
      blocked_categories: ["speed", "ground_force", "psychology", "full_swing"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest"],
      must_pass_first: "eq_ab",
      do_not_use_if: ["pain_red", "mobility_red"],
      session_mode: "normal",
      notes: "Equipment A/B + strike comparison must clear before swing rebuild."
    },

    // ---- FACE / PATH ------------------------------------------------------
    // Per task: start-line, face/path corridor, external target/constraint,
    // face-to-path. No ground-force unless intent says sequencing.
    face_control: {
      allowed_categories: ["warmup_prep", "club_face_path", "contact_lowpoint"],
      carryover_categories: ["full_swing"],
      blocked_categories: ["ground_force", "speed", "psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest", "reflection"],
      do_not_use_if: ["pain_red", "mobility_red"],
      session_mode: "normal",
      notes: "Face/path work — external corridor cues. Ground-force is OUT."
    },
    path_delivery: {
      allowed_categories: ["warmup_prep", "club_face_path", "contact_lowpoint"],
      carryover_categories: ["full_swing"],
      blocked_categories: ["ground_force", "speed", "psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest", "reflection"],
      do_not_use_if: ["pain_red", "mobility_red"],
      session_mode: "normal",
      notes: "Path delivery — corridor + face-to-path. No GRF primary."
    },
    wrist_release_hackmotion: {
      allowed_categories: ["warmup_prep", "club_face_path", "contact_lowpoint"],
      carryover_categories: ["full_swing"],
      blocked_categories: ["ground_force", "speed", "psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest"],
      do_not_use_if: ["pain_red", "mobility_red"],
      session_mode: "normal",
      notes: "Wrist / release — face control family. Verify with HackMotion."
    },

    // ---- STRIKE / LOW POINT ----------------------------------------------
    // Per task: strike map, low-point line, brush/entry, contact windows.
    // No speed or pressure primary.
    strike_lowpoint: {
      allowed_categories: ["warmup_prep", "contact_lowpoint"],
      carryover_categories: ["club_face_path", "full_swing"],
      blocked_categories: ["speed", "psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest", "reflection"],
      do_not_use_if: ["pain_red", "mobility_red"],
      session_mode: "normal",
      notes: "Strike map + low-point line first. Speed/pressure OUT."
    },
    dynamic_loft_spinloft: {
      allowed_categories: ["warmup_prep", "contact_lowpoint", "club_face_path"],
      carryover_categories: ["full_swing"],
      blocked_categories: ["speed", "psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest"],
      do_not_use_if: ["pain_red", "mobility_red"],
      session_mode: "normal",
      notes: "Dynamic loft / spin loft — contact family."
    },

    // ---- GROUND FORCE / PRESSURE -----------------------------------------
    // Per task: recenter, lead-side finish, step/pump, pressure shift,
    // lead-post, low-speed ball proof. No face-only / wrist-only as primary.
    ground_force_pressure: {
      allowed_categories: ["warmup_prep", "ground_force", "contact_lowpoint"],
      carryover_categories: ["full_swing"],
      blocked_categories: ["club_face_path", "speed", "psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest", "reflection"],
      do_not_use_if: ["pain_red", "mobility_red"],
      // Pump Drill must appear PRIMARY once only; later blocks carryover only.
      primary_once_drills: ["DR-GRF-004"],
      session_mode: "normal",
      notes: "Pressure / GRF first. Face-only and wrist-only drills are OUT as primary."
    },
    sequencing_kinematics: {
      allowed_categories: ["warmup_prep", "ground_force", "contact_lowpoint"],
      carryover_categories: ["full_swing", "club_face_path"],
      blocked_categories: ["speed", "psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest"],
      do_not_use_if: ["pain_red", "mobility_red"],
      session_mode: "normal",
      notes: "Sequencing — pelvis-then-thorax. Pressure trace required."
    },

    // ---- SPEED ------------------------------------------------------------
    // Per task: readiness gate + ball-speed/contact transfer. High-intent
    // ONLY if green gates.
    speed_readiness: {
      // Readiness lane = warmup_prep. No high-intent speed work.
      allowed_categories: ["warmup_prep"],
      carryover_categories: [],
      blocked_categories: ["speed", "ground_force", "full_swing", "club_face_path",
                           "contact_lowpoint", "psychology"],
      preferred_primary_block: "warmup",
      allowed_carryover_blocks: ["retest", "reflection"],
      do_not_use_if: ["pain_red", "readiness_red", "mobility_red"],
      session_mode: "modified_only",
      notes: "Speed readiness FAILED — no speed primary. Maintenance only."
    },
    speed_transfer: {
      allowed_categories: ["warmup_prep", "speed", "contact_lowpoint"],
      carryover_categories: ["full_swing"],
      blocked_categories: ["psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest"],
      // Speed primary REQUIRES all gates green
      requires_green_gates: ["pain", "readiness", "mobility", "contact"],
      do_not_use_if: ["pain_red", "readiness_red", "mobility_red", "contact_red"],
      session_mode: "normal",
      notes: "Ball-speed / contact transfer. High-intent only if readiness + contact green."
    },

    // ---- PUTTING ---------------------------------------------------------
    // Per task: stay in own category.
    putting_start_line: {
      allowed_categories: ["putting"],
      carryover_categories: ["putting"],
      blocked_categories: ["full_swing", "speed", "ground_force", "club_face_path",
                           "contact_lowpoint", "short_game", "psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest", "reflection"],
      do_not_use_if: ["pain_red"],
      session_mode: "normal",
      notes: "Putting start-line — putting category only."
    },
    putting_speed_control: {
      allowed_categories: ["putting"],
      carryover_categories: ["putting"],
      blocked_categories: ["full_swing", "speed", "ground_force", "club_face_path",
                           "contact_lowpoint", "short_game", "psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest", "reflection"],
      do_not_use_if: ["pain_red"],
      session_mode: "normal",
      notes: "Putting speed control — distance ladder / tempo. Not full-swing."
    },
    putting_read_aim: {
      allowed_categories: ["putting"],
      carryover_categories: ["putting"],
      blocked_categories: ["full_swing", "speed", "ground_force", "club_face_path",
                           "contact_lowpoint", "short_game"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest", "reflection"],
      do_not_use_if: ["pain_red"],
      session_mode: "normal",
      notes: "Putting read / aim — putting category only."
    },

    // ---- SHORT GAME / BUNKER ---------------------------------------------
    short_game_entry: {
      allowed_categories: ["short_game", "warmup_prep"],
      carryover_categories: ["short_game"],
      blocked_categories: ["full_swing", "speed", "ground_force", "club_face_path",
                           "putting", "psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest", "reflection"],
      do_not_use_if: ["pain_red", "mobility_red"],
      session_mode: "normal",
      notes: "Short-game entry — short_game category only."
    },
    short_game_landing_window: {
      allowed_categories: ["short_game", "warmup_prep"],
      carryover_categories: ["short_game"],
      blocked_categories: ["full_swing", "speed", "ground_force", "club_face_path",
                           "putting", "psychology"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest", "reflection"],
      do_not_use_if: ["pain_red", "mobility_red"],
      session_mode: "normal",
      notes: "Short-game landing window — short_game category only."
    },
    bunker_entry: {
      allowed_categories: ["short_game", "warmup_prep"],
      carryover_categories: ["short_game"],
      blocked_categories: ["full_swing", "speed", "ground_force", "club_face_path",
                           "putting"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "retest", "reflection"],
      do_not_use_if: ["pain_red"],
      session_mode: "normal",
      notes: "Bunker entry — short_game category only. Pair with low-threat exposure if sand-fear is the constraint."
    },

    // ---- PRESSURE / ATTENTION --------------------------------------------
    // Per task: routine / regulation / attention proof first; mechanical
    // drills secondary.
    pressure_attention: {
      allowed_categories: ["warmup_prep", "psychology"],
      carryover_categories: ["full_swing", "short_game", "putting"],
      blocked_categories: ["speed", "ground_force"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "scoring", "retest", "reflection"],
      do_not_use_if: ["pain_red"],
      session_mode: "normal",
      notes: "Routine / regulation / attention proof FIRST. Mechanics are secondary."
    },

    // ---- COURSE TRANSFER -------------------------------------------------
    course_decision: {
      allowed_categories: ["warmup_prep", "course_transfer", "psychology"],
      carryover_categories: ["full_swing", "short_game"],
      blocked_categories: ["speed"],
      preferred_primary_block: "primary",
      allowed_carryover_blocks: ["carryover", "scoring", "retest", "reflection"],
      do_not_use_if: ["pain_red"],
      session_mode: "normal",
      notes: "Course / decision — strategy primary. Mechanics carryover only."
    },

    // ---- MOBILITY / PAIN / READINESS -------------------------------------
    // Per task: modified / warmup-only OR stop / refer. No normal practice.
    mobility_pain_readiness: {
      allowed_categories: ["warmup_prep"],
      carryover_categories: ["putting", "short_game"], // modified, low-intent only
      blocked_categories: ["speed", "ground_force", "full_swing", "club_face_path",
                           "contact_lowpoint", "psychology"],
      preferred_primary_block: "warmup",
      allowed_carryover_blocks: ["retest", "reflection"],
      do_not_use_if: ["pain_red", "mobility_red", "readiness_red"],
      session_mode: "modified_only",
      stop_refer_language: true,
      notes: "Modified warm-up only, OR stop / refer. No high-intent practice today."
    }
  };

  // ---------------------------------------------------------------------------
  // Pure helpers
  // ---------------------------------------------------------------------------

  /** Map a state.gates object to an array of condition flags this layer uses. */
  function alignmentGateFlags(gates) {
    const out = [];
    if (!gates || typeof gates !== "object") return out;
    if (gates.pain === "red")       out.push("pain_red");
    if (gates.readiness === "red")  out.push("readiness_red");
    if (gates.mobility === "red")   out.push("mobility_red");
    if (gates.contact === "red")    out.push("contact_red");
    if (gates.stage === "red")      out.push("stage_red");
    return out;
  }

  /** Resolve an intent id from a state-like object (selected branches first). */
  function resolveIntentId(branchOrIntent) {
    if (!branchOrIntent) return null;
    if (typeof branchOrIntent === "string") return branchOrIntent;
    if (branchOrIntent.branch_intent?.id) return branchOrIntent.branch_intent.id;
    if (branchOrIntent.id) return branchOrIntent.id;
    return null;
  }

  /** Get alignment record for an intent id (or null). */
  function getAlignment(intentId) {
    if (!intentId) return null;
    return FF_INTENT_ALIGNMENT[intentId] || null;
  }

  /**
   * Evaluate a drill against an intent + current gate state.
   * Returns:
   *   { allowed: bool,
   *     primary_allowed: bool,
   *     carryover_allowed: bool,
   *     reasons_allowed: [string],
   *     reasons_blocked: [string],
   *     do_not_use_if:   [string] }
   */
  function evaluateDrillForIntent(drill, intentId, gates) {
    const reasons_allowed = [];
    const reasons_blocked = [];
    const flagsArr = alignmentGateFlags(gates);
    const align = getAlignment(intentId);

    // No intent context — fall back to permissive (legacy behaviour).
    if (!align) {
      return {
        allowed: true,
        primary_allowed: true,
        carryover_allowed: true,
        reasons_allowed: ["no branch_intent context — keyword fallback only"],
        reasons_blocked: [],
        do_not_use_if: []
      };
    }

    const cat = drill?.category;

    // Hard block on category
    if (align.blocked_categories?.includes(cat)) {
      reasons_blocked.push("category '" + cat + "' is blocked for intent '" + intentId + "'");
    }

    // Allowed primary?
    const primary_allowed = !!(cat && align.allowed_categories?.includes(cat))
                            && !align.blocked_categories?.includes(cat);
    if (primary_allowed) {
      reasons_allowed.push("category '" + cat + "' allowed as primary for '" + intentId + "'");
    }

    // Allowed carryover?
    const carryoverCats = (align.carryover_categories || []).concat(align.allowed_categories || []);
    const carryover_allowed = !!(cat && carryoverCats.includes(cat))
                              && !align.blocked_categories?.includes(cat);
    if (!primary_allowed && carryover_allowed) {
      reasons_allowed.push("category '" + cat + "' allowed as carryover for '" + intentId + "'");
    }

    // Do-not-use-if gate flags
    const fired = (align.do_not_use_if || []).filter(c => flagsArr.includes(c));
    fired.forEach(f => reasons_blocked.push("do_not_use_if: " + f.replace("_", " ")));

    // Speed transfer needs green gates for primary
    if (intentId === "speed_transfer" && cat === "speed") {
      const req = align.requires_green_gates || [];
      const notGreen = req.filter(g => gates?.[g] !== "green");
      if (notGreen.length) {
        reasons_blocked.push("speed primary requires green gates — not green: " + notGreen.join(", "));
      }
    }

    const allowed = (primary_allowed || carryover_allowed) && reasons_blocked.length === 0;
    return {
      allowed,
      primary_allowed: primary_allowed && reasons_blocked.length === 0,
      carryover_allowed: carryover_allowed && reasons_blocked.length === 0,
      reasons_allowed,
      reasons_blocked,
      do_not_use_if: fired
    };
  }

  /**
   * Given the set of selected/branched intents (multiple faults → multiple
   * branches), return the dominant intent for session-level decisions.
   * Priority: stop_refer > modified_only > psychology > equipment_fit > others.
   */
  function dominantIntent(intentIds) {
    if (!intentIds || !intentIds.length) return null;
    const priority = [
      "mobility_pain_readiness",
      "speed_readiness",
      "pressure_attention",
      "equipment_fit"
    ];
    for (const p of priority) if (intentIds.includes(p)) return p;
    return intentIds[0];
  }

  /** Return session mode for a set of intents under current gates. */
  function sessionModeFor(intentIds, gates) {
    const flagsArr = alignmentGateFlags(gates);
    // Pain red ALWAYS forces stop/refer regardless of intent
    if (flagsArr.includes("pain_red")) return "stop_refer";
    const ids = intentIds || [];
    for (const id of ids) {
      const a = getAlignment(id);
      if (a?.session_mode === "modified_only") return "modified_only";
      if (a?.stop_refer_language && flagsArr.length) return "modified_only";
    }
    if (ids.includes("mobility_pain_readiness")) return "modified_only";
    if (ids.includes("speed_readiness") && flagsArr.includes("readiness_red")) return "modified_only";
    return "normal";
  }

  /** Pretty intent-block helper for UI: map block kind to its drill blocks. */
  function blocksForKind(kind) {
    return BLOCKS[kind] || [];
  }

  // ---------------------------------------------------------------------------
  // Expose
  // ---------------------------------------------------------------------------
  window.FF_INTENT_ALIGNMENT = FF_INTENT_ALIGNMENT;
  window.FF_ALIGNMENT_BLOCKS = BLOCKS;
  window.FF_ALIGNMENT = {
    evaluateDrillForIntent,
    alignmentGateFlags,
    getAlignment,
    resolveIntentId,
    dominantIntent,
    sessionModeFor,
    blocksForKind
  };

})();
