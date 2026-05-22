/* =============================================================================
   FOREFRONT — DRILL / SESSION ALIGNMENT VALIDATOR  (2026-05-22)
   =============================================================================

   Validates the alignment layer (data/alignment-layer.js) against the rules
   set out in the audit task. Each scenario asserts:

     1. The expected branch_intent allows the expected drill categories.
     2. The expected branch_intent blocks the categories it should block.
     3. Specific drills (e.g. Pump Drill DR-GRF-004) carry a primary-once flag.
     4. Readiness/pain gates trigger modified_only / stop_refer modes.
     5. Speed primary is blocked unless all required gates are green.

   Run:  node _validate_drill_session_alignment.js
   Exit: 0 = pass, 1 = fail
   ========================================================================== */

"use strict";

global.window = {};
require("./data/drills.js");
require("./data/alignment-layer.js");

const A    = window.FF_ALIGNMENT;
const MAP  = window.FF_INTENT_ALIGNMENT;
const FF_DRILLS = window.FF_DRILLS || [];

let failures = 0;
const log = (ok, msg) => {
  if (ok) console.log("  PASS  " + msg);
  else {
    console.log("  FAIL  " + msg);
    failures++;
  }
};
const section = t => console.log("\n=== " + t + " ===");

// ---- Helpers ---------------------------------------------------------------
function fakeDrill(category, drill_id) {
  return { drill_id: drill_id || "DR-FAKE-001", category: category, name: "fake " + category };
}
function evalFor(category, intentId, gates) {
  return A.evaluateDrillForIntent(fakeDrill(category), intentId, gates || {});
}
const GREEN = { pain: "green", readiness: "green", mobility: "green", contact: "green", stage: "green" };

// ---- 1. Basic shape ---------------------------------------------------------
section("1. Alignment map shape");
log(Object.keys(MAP).length === 20, "FF_INTENT_ALIGNMENT covers all 20 intents (got " + Object.keys(MAP).length + ")");
log(typeof A.evaluateDrillForIntent === "function", "evaluateDrillForIntent exposed");
log(typeof A.sessionModeFor === "function", "sessionModeFor exposed");
log(typeof A.dominantIntent === "function", "dominantIntent exposed");

// ---- 2. Pressure stays trail side — ground_force_pressure ------------------
section("2. Pressure stays trail / ground_force_pressure");
{
  const ok1 = evalFor("ground_force", "ground_force_pressure", GREEN);
  log(ok1.primary_allowed, "ground_force category allowed as primary");
  const blk1 = evalFor("club_face_path", "ground_force_pressure", GREEN);
  log(!blk1.allowed, "club_face_path BLOCKED for ground_force_pressure (no face-only as primary)");
  const blk2 = evalFor("speed", "ground_force_pressure", GREEN);
  log(!blk2.allowed, "speed BLOCKED for ground_force_pressure");
}

// ---- 3. Pump Drill primary-once --------------------------------------------
section("3. Pump Drill (DR-GRF-004) primary-once");
{
  const align = MAP.ground_force_pressure;
  log(align.primary_once_drills && align.primary_once_drills.includes("DR-GRF-004"),
      "ground_force_pressure.primary_once_drills includes DR-GRF-004");
}

// ---- 4. Slice face-start — face_control ------------------------------------
section("4. Slice face-start / face_control");
{
  const ok1 = evalFor("club_face_path", "face_control", GREEN);
  log(ok1.primary_allowed, "club_face_path allowed as primary");
  const blk = evalFor("ground_force", "face_control", GREEN);
  log(!blk.allowed, "ground_force BLOCKED for face_control");
}

// ---- 5. Slice heel-gear — equipment_fit ------------------------------------
section("5. Slice heel-gear / equipment_fit");
{
  const ok = evalFor("contact_lowpoint", "equipment_fit", GREEN);
  log(ok.primary_allowed, "contact_lowpoint allowed (strike comparison)");
  const blk1 = evalFor("speed", "equipment_fit", GREEN);
  log(!blk1.allowed, "speed BLOCKED for equipment_fit");
  const blk2 = evalFor("ground_force", "equipment_fit", GREEN);
  log(!blk2.allowed, "ground_force BLOCKED for equipment_fit");
  log(MAP.equipment_fit.must_pass_first === "eq_ab", "equipment_fit gates on eq_ab proof first");
}

// ---- 6. Chunk lowpoint-back — strike_lowpoint -------------------------------
section("6. Chunk lowpoint-back / strike_lowpoint");
{
  const ok = evalFor("contact_lowpoint", "strike_lowpoint", GREEN);
  log(ok.primary_allowed, "contact_lowpoint allowed as primary");
  const blkSpeed = evalFor("speed", "strike_lowpoint", GREEN);
  log(!blkSpeed.allowed, "speed BLOCKED for strike_lowpoint");
  const blkPsy = evalFor("psychology", "strike_lowpoint", GREEN);
  log(!blkPsy.allowed, "psychology BLOCKED for strike_lowpoint");
}

// ---- 7. Putting start-line — putting only ----------------------------------
section("7. Putting start-line / putting_start_line");
{
  const ok = evalFor("putting", "putting_start_line", GREEN);
  log(ok.primary_allowed, "putting allowed");
  const blk1 = evalFor("full_swing", "putting_start_line", GREEN);
  log(!blk1.allowed, "full_swing BLOCKED");
  const blk2 = evalFor("short_game", "putting_start_line", GREEN);
  log(!blk2.allowed, "short_game BLOCKED");
}

// ---- 8. Putting speed — distance ladder / tempo, not full swing ------------
section("8. Putting speed / putting_speed_control");
{
  const ok = evalFor("putting", "putting_speed_control", GREEN);
  log(ok.primary_allowed, "putting allowed");
  const blk = evalFor("full_swing", "putting_speed_control", GREEN);
  log(!blk.allowed, "full_swing BLOCKED");
}

// ---- 9. Wedge entry-point — short_game only --------------------------------
section("9. Wedge entry-point / short_game_entry");
{
  const ok = evalFor("short_game", "short_game_entry", GREEN);
  log(ok.primary_allowed, "short_game allowed");
  const blk1 = evalFor("full_swing", "short_game_entry", GREEN);
  log(!blk1.allowed, "full_swing BLOCKED");
  const blk2 = evalFor("putting", "short_game_entry", GREEN);
  log(!blk2.allowed, "putting BLOCKED");
}

// ---- 10. Bunker sand-fear — pressure_attention primary ---------------------
section("10. Bunker sand-fear / pressure_attention");
{
  const ok = evalFor("psychology", "pressure_attention", GREEN);
  log(ok.primary_allowed, "psychology allowed as primary (routine/regulation)");
  // Mechanical drills should land as carryover, not primary
  const carry = evalFor("full_swing", "pressure_attention", GREEN);
  log(carry.carryover_allowed && !carry.primary_allowed,
      "full_swing routed to CARRYOVER (mechanics secondary)");
}

// ---- 11. Speed ceiling readiness — readiness-red blocks high-intent --------
section("11. Speed ceiling readiness / speed_readiness gate");
{
  const redGates = Object.assign({}, GREEN, { readiness: "red" });
  const blk = evalFor("speed", "speed_readiness", redGates);
  log(!blk.allowed, "speed BLOCKED under speed_readiness intent (any gate)");
  log(MAP.speed_readiness.session_mode === "modified_only", "speed_readiness session_mode = modified_only");
}

// ---- 12. Speed transfer needs ALL green gates for primary ------------------
section("12. Speed transfer / requires green gates for primary");
{
  const okGreen = evalFor("speed", "speed_transfer", GREEN);
  log(okGreen.primary_allowed, "speed primary OK when all gates green");
  const redContact = Object.assign({}, GREEN, { contact: "red" });
  const blkContact = evalFor("speed", "speed_transfer", redContact);
  log(!blkContact.primary_allowed, "speed primary BLOCKED when contact red");
  const redReadiness = Object.assign({}, GREEN, { readiness: "red" });
  const blkRead = evalFor("speed", "speed_transfer", redReadiness);
  log(!blkRead.primary_allowed, "speed primary BLOCKED when readiness red");
}

// ---- 13. Mobility/pain/readiness — modified-only session -------------------
section("13. mobility_pain_readiness / modified_only session");
{
  const m = MAP.mobility_pain_readiness;
  log(m.session_mode === "modified_only", "session_mode = modified_only");
  log(m.stop_refer_language === true, "stop_refer_language flag set");
  ["speed", "ground_force", "full_swing", "club_face_path", "contact_lowpoint", "psychology"]
    .forEach(cat => {
      const r = evalFor(cat, "mobility_pain_readiness", GREEN);
      log(!r.allowed, "category '" + cat + "' BLOCKED for mobility_pain_readiness");
    });
  const w = evalFor("warmup_prep", "mobility_pain_readiness", GREEN);
  log(w.allowed, "warmup_prep allowed for mobility_pain_readiness");
}

// ---- 14. Session-mode resolution from gates --------------------------------
section("14. sessionModeFor — gate-driven overrides");
{
  log(A.sessionModeFor(["face_control"], GREEN) === "normal",
      "face_control + all green = normal");
  log(A.sessionModeFor(["face_control"], { pain: "red" }) === "stop_refer",
      "pain red \u2192 stop_refer regardless of intent");
  log(A.sessionModeFor(["mobility_pain_readiness"], GREEN) === "modified_only",
      "mobility_pain_readiness \u2192 modified_only");
  log(A.sessionModeFor(["speed_readiness"], { readiness: "red" }) === "modified_only",
      "speed_readiness + readiness red \u2192 modified_only");
}

// ---- 15. Dominant intent picker --------------------------------------------
section("15. dominantIntent priority");
{
  log(A.dominantIntent(["face_control", "mobility_pain_readiness"]) === "mobility_pain_readiness",
      "mobility_pain_readiness wins over face_control");
  log(A.dominantIntent(["face_control", "pressure_attention"]) === "pressure_attention",
      "pressure_attention wins over face_control");
  log(A.dominantIntent(["face_control", "equipment_fit"]) === "equipment_fit",
      "equipment_fit wins over face_control");
}

// ---- 16. All 20 intents have allowed + blocked categories ------------------
section("16. Per-intent completeness");
Object.keys(MAP).forEach(id => {
  const a = MAP[id];
  log(Array.isArray(a.allowed_categories) && a.allowed_categories.length > 0,
      "intent '" + id + "' has allowed_categories");
  log(Array.isArray(a.blocked_categories),
      "intent '" + id + "' has blocked_categories array");
  log(!!a.preferred_primary_block,
      "intent '" + id + "' has preferred_primary_block");
});

// ---- 17. Pump Drill (DR-GRF-004) exists in deepening session set -----------
section("17. Pump Drill DR-GRF-004 reachable");
{
  // It lives in deepening.js synthesized session drills; we just check that
  // the alignment map references it by id (validator can't load deepening.js
  // cleanly without a DOM, so we stop at the map check).
  log((MAP.ground_force_pressure.primary_once_drills || []).indexOf("DR-GRF-004") === 0,
      "DR-GRF-004 is the first primary_once entry for ground_force_pressure");
}

// ---- Summary ---------------------------------------------------------------
console.log("\n=== SUMMARY ===");
if (failures === 0) {
  console.log("ALL CHECKS PASS \u2014 drill/session alignment layer is consistent.");
  process.exit(0);
} else {
  console.log("FAILED CHECKS: " + failures);
  process.exit(1);
}
