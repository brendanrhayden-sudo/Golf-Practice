/* =============================================================================
   FOREFRONT — Expert-scenario QA harness (shared library)
   =============================================================================

   - Loads the same data files the page loads, into a sandboxed VM context.
   - Re-implements the deterministic parts of assets/app.js that route a
     selected fault + branch through:
        proof-card composer  (FF_PROOF_INTENT_PLAN / family fallback)
        alignment layer      (FF_INTENT_ALIGNMENT)
        session mode         (FF_ALIGNMENT.sessionModeFor)
        primary-once drills  (e.g. Pump Drill DR-GRF-004)
        drill block placement (warmup / block1 / block2 / retest / reflection)
   - Produces a `result` object per scenario that the runner uses for both
     deterministic checks AND the LLM judge packet.

   This is intentionally pure data + pure logic, no DOM, no fs writes here.
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Mirror of assets/app.js proof-intent / proof-family routing (kept in sync
// with _validate_proof_cards.js).
const FF_PROOF_INTENT_PLAN = {
  ground_force_pressure:    ["gf_recenter_station", "gf_lead_finish_strike", "gf_variation_retest"],
  sequencing_kinematics:    ["gf_recenter_station", "gf_lead_finish_strike", "gf_variation_retest"],
  face_control:             ["fp_corridor", "fp_trackman_face", "fp_curve_variation"],
  path_delivery:            ["fp_corridor", "fp_trackman_face", "fp_curve_variation"],
  wrist_release_hackmotion: ["fp_corridor", "fp_hackmotion_release", "fp_curve_variation"],
  strike_lowpoint:          ["cl_strike_map", "cl_lowpoint_line", "cl_strike_transfer"],
  dynamic_loft_spinloft:    ["cl_strike_map", "cl_lowpoint_line", "cl_strike_transfer"],
  aim_setup:                ["setup_ab", "setup_transfer", "setup_variation"],
  equipment_fit:            ["eq_ab", "eq_strike_compare", "eq_transfer"],
  putting_start_line:       ["pt_gate", "pt_face_aim", "pt_distance_retest"],
  putting_speed_control:    ["pt_distance_ladder", "pt_tempo_map", "pt_pressure_retest"],
  putting_read_aim:         ["pt_aim_check", "pt_gate", "pt_break_read"],
  short_game_entry:         ["sg_entry_line", "sg_landing_window", "sg_lie_variation"],
  short_game_landing_window:["sg_landing_window", "sg_entry_line", "sg_lie_variation"],
  bunker_entry:             ["bn_entry_line", "bn_landing_window", "bn_lie_variation"],
  speed_transfer:           ["sp_readiness_baseline", "sp_ball_transfer", "sp_variation_retest"],
  speed_readiness:          ["sp_readiness_baseline", "rd_modified_warmup", "rd_low_intent_retest"],
  mobility_pain_readiness:  ["rd_pain_gate", "rd_modified_warmup", "rd_low_intent_retest"],
  course_decision:          ["cd_decision_audit", "cd_routine_proof", "cd_random_transfer"],
  pressure_attention:       ["ps_threat_screen", "ps_routine_reset", "ps_consequence_retest"]
};

const FF_PROOF_FAMILY_FROM_FID = (fid) => {
  const id = String(fid || "").toUpperCase();
  if (/PUTT/.test(id)) return "putting";
  if (/BUNKER/.test(id)) return "bunker";
  if (/WEDGE|CHIP|PITCH|SHORTGAME/.test(id)) return "short_game";
  if (/SPEED-CEILING/.test(id)) return "speed";
  if (/READINESS/.test(id)) return "readiness";
  if (/EQUIP|DRIVER-SETUP|CLUB-SELECTION/.test(id)) return "equipment";
  if (/COURSE-TRANSFER/.test(id)) return "course_transfer";
  return "full_swing";
};

const FF_PROOF_FAMILY_PLAN = {
  putting:        ["pt_gate", "pt_face_aim", "pt_distance_retest"],
  bunker:         ["bn_entry_line", "bn_landing_window", "bn_lie_variation"],
  short_game:     ["sg_entry_line", "sg_landing_window", "sg_lie_variation"],
  equipment:      ["eq_ab", "eq_strike_compare", "eq_transfer"],
  speed:          ["sp_readiness_baseline", "sp_ball_transfer", "sp_variation_retest"],
  readiness:      ["rd_pain_gate", "rd_modified_warmup", "rd_low_intent_retest"],
  course_transfer:["cd_decision_audit", "cd_routine_proof", "cd_random_transfer"],
  full_swing:     ["gf_recenter_station", "fp_corridor", "cl_strike_map"]
};

function proofPlanForBranch(fid, branch) {
  const intentId = branch?.branch_intent?.id;
  if (intentId && FF_PROOF_INTENT_PLAN[intentId]) return FF_PROOF_INTENT_PLAN[intentId];
  const fam = FF_PROOF_FAMILY_FROM_FID(fid);
  if (FF_PROOF_FAMILY_PLAN[fam]) return FF_PROOF_FAMILY_PLAN[fam];
  return FF_PROOF_FAMILY_PLAN.full_swing;
}

function loadAppContext(projectRoot) {
  const ctx = { window: {}, console };
  ctx.window.window = ctx.window;
  vm.createContext(ctx);
  ["data/drills.js", "data/deepening.js", "data/diagnostic-layer.js", "data/alignment-layer.js"].forEach(rel => {
    const code = fs.readFileSync(path.join(projectRoot, rel), "utf8");
    vm.runInContext(code, ctx, { filename: rel });
  });
  return ctx;
}

function pickBranch(ctx, fid, bid) {
  const branches = ctx.window.FF_DIAGNOSTIC_BRANCHES || {};
  const arr = branches[fid] || [];
  return arr.find(b => b.id === bid) || null;
}

function categoriesForDrillIds(ctx, ids) {
  const drills = ctx.window.FF_DRILLS || [];
  const byId = Object.fromEntries(drills.map(d => [d.drill_id, d]));
  return ids.map(id => ({ drill_id: id, drill: byId[id] || null, category: byId[id]?.category || null }));
}

// Minimal block placement that mirrors the spirit of allocateSessionDrills in
// assets/app.js but stays deterministic without DOM. Rules:
//   - First drill in each scenario's selected_drills list is the warmup if it
//     is in category warmup_prep; otherwise we use DR-WAR-001 as default.
//   - Drills whose category appears in the dominant intent's allowed_categories
//     can be primary (block1 / block2).
//   - Drills not allowed-as-primary but allowed-as-carryover land in block2 /
//     retest.
//   - Primary-once drills (e.g. DR-GRF-004 for ground_force_pressure) appear
//     PRIMARY in block1 only; if they show up again they land in carryover.
function placeDrills(ctx, scenario, dominantIntent, gates) {
  const A = ctx.window.FF_ALIGNMENT;
  const MAP = ctx.window.FF_INTENT_ALIGNMENT;
  const align = MAP[dominantIntent] || null;
  const enriched = categoriesForDrillIds(ctx, scenario.selected_drills);

  const blocks = {
    warmup:    [],
    block1:    [],
    block2:    [],
    retest:    [],
    reflection:[]
  };

  // Determine warmup
  const warmup = enriched.find(e => e.category === "warmup_prep");
  if (warmup) blocks.warmup.push(warmup);

  const primaryOnce = new Set((align && align.primary_once_drills) || []);
  const seenPrimaryOnce = new Set();

  for (const e of enriched) {
    if (e === warmup) continue;
    if (!e.drill) continue;
    const evalRes = A.evaluateDrillForIntent(e.drill, dominantIntent, gates);
    const isPrimaryOnce = primaryOnce.has(e.drill_id);
    if (evalRes.primary_allowed) {
      if (isPrimaryOnce) {
        if (seenPrimaryOnce.has(e.drill_id)) {
          blocks.block2.push({ ...e, _carryover: true, _note: "primary-once drill demoted" });
        } else {
          blocks.block1.push(e);
          seenPrimaryOnce.add(e.drill_id);
        }
      } else if (blocks.block1.length === 0) {
        blocks.block1.push(e);
      } else if (blocks.block2.length === 0) {
        blocks.block2.push(e);
      } else {
        blocks.retest.push(e);
      }
    } else if (evalRes.carryover_allowed) {
      blocks.block2.push({ ...e, _carryover: true });
    } else {
      // Blocked → does NOT make it to any block; harness records this as
      // a filtered_out entry.
      blocks._filtered_out = blocks._filtered_out || [];
      blocks._filtered_out.push({ ...e, _blocked: true, _reasons: evalRes.reasons_blocked });
    }
  }

  // session_mode override: stop_refer / modified_only → strip primary mechanical
  // work from non-warmup blocks, mirror app.js.
  const sessionMode = A.sessionModeFor([dominantIntent], gates);
  if (sessionMode === "stop_refer" || sessionMode === "modified_only") {
    blocks.block1 = [];
    blocks.block2 = [];
    blocks.retest = [];
  }
  blocks.session_mode = sessionMode;

  return blocks;
}

function extractScenarioOutput(ctx, scenario) {
  const A = ctx.window.FF_ALIGNMENT;
  const MAP = ctx.window.FF_INTENT_ALIGNMENT;
  const branches = scenario.fault_ids.map(fid => {
    const bid = scenario.branch_ids[fid];
    const br = pickBranch(ctx, fid, bid);
    return { fault_id: fid, branch_id: bid, branch: br };
  });

  // Collect intents from selected branches.
  const intents = branches.map(b => b.branch?.branch_intent?.id).filter(Boolean);
  const dominantIntent = A.dominantIntent(intents) || intents[0] || null;

  // Build the proof "card" per branch (T1/T2/T3 profile keys).
  const proofCards = branches.map(b => {
    const plan = b.branch ? proofPlanForBranch(b.fault_id, b.branch) : [];
    return {
      fault_id: b.fault_id,
      branch_id: b.branch_id,
      branch_intent: b.branch?.branch_intent?.id || null,
      proof_test_ids: b.branch?.proof_test_ids || [],
      t1: plan[0] || null,
      t2: plan[1] || null,
      t3: plan[2] || null,
      proof_family: FF_PROOF_FAMILY_FROM_FID(b.fault_id)
    };
  });

  const gates = scenario.gates || {};
  const sessionMode = A.sessionModeFor(intents, gates);
  const placed = placeDrills(ctx, scenario, dominantIntent, gates);

  const sessionBlocks = ["warmup", "block1", "block2", "retest", "reflection"].map(k => ({
    kind: k,
    drills: (placed[k] || []).map(e => ({
      drill_id: e.drill_id, category: e.category,
      carryover: !!e._carryover, note: e._note || null
    }))
  }));

  // Drill summaries
  const drillSummary = categoriesForDrillIds(ctx, scenario.selected_drills).map(e => ({
    drill_id: e.drill_id, category: e.category, found: !!e.drill,
    practice_block: e.drill?.practice_block || null,
    name: e.drill?.name || null
  }));

  // Primary categories present. We treat block1, block2 (non-carryover), and
  // retest (when the drill was primary-allowed) as the "primary slot" set.
  // The warmup block contributes warmup_prep but is always allowed.
  const primaryCategories = Array.from(new Set([
    ...sessionBlocks.find(b => b.kind === "block1").drills.map(d => d.category),
    ...sessionBlocks.find(b => b.kind === "block2").drills.filter(d => !d.carryover).map(d => d.category),
    ...sessionBlocks.find(b => b.kind === "retest").drills.filter(d => !d.carryover).map(d => d.category),
    ...sessionBlocks.find(b => b.kind === "warmup").drills.map(d => d.category)
  ])).filter(Boolean);

  // Primary drill ids across non-warmup, non-carryover blocks
  const primaryDrillIds = [
    ...sessionBlocks.find(b => b.kind === "block1").drills.map(d => d.drill_id),
    ...sessionBlocks.find(b => b.kind === "block2").drills.filter(d => !d.carryover).map(d => d.drill_id)
  ];

  return {
    scenario_id: scenario.id,
    fault_ids: scenario.fault_ids,
    branch_ids: scenario.branch_ids,
    intents,
    dominant_intent: dominantIntent,
    gates,
    session_mode: sessionMode,
    proof_cards: proofCards,
    drill_summary: drillSummary,
    primary_categories: primaryCategories,
    primary_drill_ids: primaryDrillIds,
    session_blocks: sessionBlocks,
    alignment_record: MAP[dominantIntent] || null,
    filtered_out: placed._filtered_out || []
  };
}

// ------------------- deterministic checks --------------------------------

function runDeterministicChecks(scenario, out) {
  const checks = [];
  const push = (name, ok, detail) => checks.push({ name, ok, detail });

  // expected branch intents present
  const expIntents = scenario.expected_branch_intents || [];
  push(
    "expected_branch_intents_present",
    expIntents.every(i => out.intents.includes(i)),
    { expected: expIntents, got: out.intents }
  );

  // T1 prefix
  const firstCard = out.proof_cards[0];
  const expPrefix = scenario.expected_t1_profile_prefix;
  const expPrefixAny = scenario.expected_t1_profile_prefix_any;
  if (expPrefix) {
    push(
      "t1_profile_prefix_match",
      firstCard && firstCard.t1 && firstCard.t1.startsWith(expPrefix),
      { expected_prefix: expPrefix, got: firstCard?.t1 }
    );
  }
  if (expPrefixAny) {
    push(
      "t1_profile_prefix_any_match",
      out.proof_cards.some(pc => expPrefixAny.some(p => pc.t1 && pc.t1.startsWith(p))),
      { expected_any: expPrefixAny, got: out.proof_cards.map(pc => pc.t1) }
    );
  }

  // expected primary categories include (subset)
  const expPrimaryCats = scenario.expected_primary_categories || [];
  push(
    "expected_primary_categories_present",
    expPrimaryCats.every(c => out.primary_categories.includes(c)) || out.session_mode !== "normal",
    { expected_subset: expPrimaryCats, got: out.primary_categories, session_mode: out.session_mode }
  );

  // forbidden categories absent from primary
  const forbiddenCats = scenario.forbidden_categories_primary || [];
  const forbiddenHits = out.primary_categories.filter(c => forbiddenCats.includes(c));
  push(
    "forbidden_categories_absent_primary",
    forbiddenHits.length === 0,
    { forbidden: forbiddenCats, hits: forbiddenHits }
  );

  // session mode match
  const expMode = scenario.expected_session_mode;
  push(
    "expected_session_mode",
    out.session_mode === expMode,
    { expected: expMode, got: out.session_mode }
  );

  // session blocks all present
  const expBlocks = scenario.expected_session_blocks || [];
  const gotBlocks = out.session_blocks.map(b => b.kind);
  push(
    "expected_session_blocks_present",
    expBlocks.every(b => gotBlocks.includes(b)),
    { expected: expBlocks, got: gotBlocks }
  );

  // no duplicate primary drill ids
  const dupSet = new Set();
  const dups = [];
  out.primary_drill_ids.forEach(id => {
    if (dupSet.has(id)) dups.push(id);
    dupSet.add(id);
  });
  push(
    "no_duplicate_primary_drills",
    dups.length === 0,
    { duplicates: dups }
  );

  // Pump Drill (DR-GRF-004) primary once + carryover only
  const pumpPrimaryCount = out.session_blocks
    .filter(b => b.kind === "block1" || b.kind === "block2")
    .flatMap(b => b.drills.filter(d => !d.carryover))
    .filter(d => d.drill_id === "DR-GRF-004").length;
  push(
    "pump_drill_primary_once",
    pumpPrimaryCount <= 1,
    { primary_count: pumpPrimaryCount }
  );

  // readiness / pain gates → enforce
  const gates = scenario.gates || {};
  if (gates.pain === "red") {
    push(
      "pain_red_forces_stop_refer",
      out.session_mode === "stop_refer",
      { gates, got: out.session_mode }
    );
  }
  if (gates.readiness === "red" && out.intents.includes("speed_transfer")) {
    push(
      "readiness_red_blocks_speed_primary",
      !out.primary_categories.includes("speed"),
      { gates, primary_categories: out.primary_categories }
    );
  }

  // equipment must_pass_first gate
  if (scenario.expected_must_pass_first) {
    const align = out.alignment_record;
    push(
      "equipment_must_pass_first_present",
      align && align.must_pass_first === scenario.expected_must_pass_first,
      { expected: scenario.expected_must_pass_first, got: align?.must_pass_first }
    );
  }

  return checks;
}

// ------------------- exports --------------------------------------------

module.exports = {
  loadAppContext,
  pickBranch,
  proofPlanForBranch,
  extractScenarioOutput,
  runDeterministicChecks,
  FF_PROOF_INTENT_PLAN,
  FF_PROOF_FAMILY_PLAN,
  FF_PROOF_FAMILY_FROM_FID
};
