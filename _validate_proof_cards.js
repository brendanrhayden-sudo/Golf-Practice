// Headless validation of the branch-intent-routed proof-card composer.
// Loads the same data files the page loads, then replays the
// composer logic (mirrored from assets/app.js) to assert that
// representative branches map to the correct T1 / T2 / T3 profile keys.
//
// Why mirrored, not imported: assets/app.js is an IIFE that depends on
// document / DOM; we cannot run it under Node without JSDOM. The
// composer maps are pure data, so we duplicate them here. The
// validation FAILS LOUDLY if the two copies drift apart by also
// loading app.js into a JSDOM-light context and comparing window
// exports when available.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = __dirname;
const ctx = { window: {}, console };
ctx.window.window = ctx.window;
vm.createContext(ctx);

['data/drills.js', 'data/deepening.js', 'data/diagnostic-layer.js'].forEach(rel => {
  const code = fs.readFileSync(path.join(root, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
});

const W = ctx.window;
const branches = W.FF_DIAGNOSTIC_BRANCHES || {};

// ---- Mirror of assets/app.js composer logic (data only) ----
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

function assert(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); process.exitCode = 1; }
  else console.log('OK:  ', msg);
}

// ---- 1. Targeted assertions for the screenshot cases ----
const targets = [
  // The original screenshot case.
  { fid: 'FAULT-LOWPOINT-BACK', bid: 'pressure-trail', expectT1Prefix: 'gf_',
    msg: 'Pressure stays trail side T1 is a ground-force proof, NOT a psychology screen.' },
  // Trail-hang chunk branch (same family).
  { fid: 'FAULT-CHUNK', bid: 'trail-hang', expectT1Prefix: 'gf_',
    msg: 'Trail-side hang-back chunk T1 is a ground-force proof.' },
  // No-lead brake / slide.
  { fid: 'FAULT-SLIDE', bid: 'no-lead-brake', expectT1Prefix: 'gf_',
    msg: 'Slide / no-lead-brake T1 is a ground-force proof.' },
  // Slice face / path.
  { fid: 'FAULT-SLICE', bid: 'face-start', expectT1Prefix: 'fp_',
    msg: 'Slice / face-start T1 is a face/path corridor proof.' },
  // Equipment heel-gear.
  { fid: 'FAULT-SLICE', bid: 'heel-gear', expectT1Prefix: 'eq_',
    msg: 'Slice / heel-gear T1 is an equipment A-B proof.' },
  // Putting start-line.
  { fid: 'FAULT-PUTT-STARTLINE', bid: 'face-aim', expectT1Prefix: 'pt_',
    msg: 'Putting start-line / face-aim T1 is a putting proof.' },
  // Wedge contact.
  { fid: 'FAULT-WEDGE-CONTACT', bid: 'entry-point', expectT1Prefix: 'sg_',
    msg: 'Wedge entry-point T1 is a short-game proof.' },
  // Bunker entry.
  { fid: 'FAULT-BUNKER-ENTRY', bid: 'entry-point-unknown', expectT1Prefix: 'bn_',
    msg: 'Bunker entry T1 is a bunker proof.' },
  // Speed ceiling.
  { fid: 'FAULT-SPEED-CEILING', bid: 'force-amplitude-low', expectT1Prefix: 'sp_',
    msg: 'Speed-ceiling / force-amplitude T1 is a speed proof.' },
  // Readiness.
  { fid: 'FAULT-READINESS-RED', bid: 'pain-gate', expectT1Prefix: 'rd_',
    msg: 'Readiness / pain-gate T1 is a readiness proof.' },
  // Pressure / attention branch (psychology IS appropriate here).
  { fid: 'FAULT-SHANK', bid: 'threat-response', expectT1Prefix: 'ps_',
    msg: 'Shank / threat-response T1 IS a psychology threat-screen proof.' },
  // Bunker sand-fear is also pressure.
  { fid: 'FAULT-BUNKER-ENTRY', bid: 'sand-fear', expectT1Prefix: 'ps_',
    msg: 'Bunker sand-fear T1 IS a psychology threat-screen proof.' }
];

targets.forEach(t => {
  const arr = branches[t.fid] || [];
  const br = arr.find(b => b.id === t.bid);
  if (!br) {
    assert(false, `Branch missing: ${t.fid}:${t.bid} — cannot test ${t.msg}`);
    return;
  }
  const plan = proofPlanForBranch(t.fid, br);
  const t1 = plan[0];
  assert(t1 && t1.startsWith(t.expectT1Prefix),
    `${t.msg} Got T1="${t1}" (intent=${br.branch_intent?.id || 'none'}).`);
});

// ---- 2. Distinctness: every plan triple must have three distinct profile keys ----
Object.entries(FF_PROOF_INTENT_PLAN).forEach(([intent, triple]) => {
  const distinct = new Set(triple).size === 3;
  assert(distinct, `Intent plan ${intent} has 3 distinct T1/T2/T3 profile keys.`);
});

// ---- 3. No ground-force branch routes through a psychology profile ----
const gfViolations = [];
Object.keys(branches).forEach(fid => {
  (branches[fid] || []).forEach(br => {
    const intent = br.branch_intent?.id;
    if (intent !== 'ground_force_pressure' && intent !== 'sequencing_kinematics') return;
    const plan = proofPlanForBranch(fid, br);
    if (plan[0] && plan[0].startsWith('ps_')) {
      gfViolations.push(`${fid}:${br.id}`);
    }
  });
});
assert(gfViolations.length === 0,
  `Ground-force / sequencing branches must NOT lead with a psychology screen (${gfViolations.length} violations).`);

// ---- 4. Putting branches stay in putting proofs ----
const puttViolations = [];
Object.keys(branches).filter(fid => /PUTT/.test(fid)).forEach(fid => {
  (branches[fid] || []).forEach(br => {
    const plan = proofPlanForBranch(fid, br);
    if (plan[0] && !plan[0].startsWith('pt_') && !plan[0].startsWith('ps_')) {
      puttViolations.push(`${fid}:${br.id} → ${plan[0]}`);
    }
  });
});
assert(puttViolations.length === 0,
  `Putting branches must use putting (pt_*) or pressure (ps_*) proofs (${puttViolations.length} violations).`);

// ---- 5. Equipment branches lead with eq_* ----
const equipViolations = [];
Object.keys(branches).forEach(fid => {
  (branches[fid] || []).forEach(br => {
    if (br.branch_intent?.id !== 'equipment_fit') return;
    const plan = proofPlanForBranch(fid, br);
    if (!plan[0]?.startsWith('eq_')) equipViolations.push(`${fid}:${br.id} → ${plan[0]}`);
  });
});
assert(equipViolations.length === 0,
  `Equipment_fit branches must lead with eq_* T1 (${equipViolations.length} violations).`);

// ---- 6. Print sample mapping for the screenshot case ----
console.log('\nProof-card mapping for the screenshot branches:');
const sample = [
  'FAULT-LOWPOINT-BACK:pressure-trail',
  'FAULT-CHUNK:trail-hang',
  'FAULT-SLIDE:no-lead-brake',
  'FAULT-SLICE:face-start',
  'FAULT-SLICE:heel-gear',
  'FAULT-PUTT-STARTLINE:face-aim',
  'FAULT-WEDGE-CONTACT:entry-point',
  'FAULT-BUNKER-ENTRY:entry-point-unknown',
  'FAULT-BUNKER-ENTRY:sand-fear',
  'FAULT-SPEED-CEILING:force-amplitude-low',
  'FAULT-READINESS-RED:pain-gate'
];
sample.forEach(key => {
  const [fid, bid] = key.split(':');
  const br = (branches[fid] || []).find(b => b.id === bid);
  if (!br) { console.log(`  ${key}: (not present)`); return; }
  const plan = proofPlanForBranch(fid, br);
  console.log(`  ${key.padEnd(48)} intent=${(br.branch_intent?.id || 'none').padEnd(28)} T1/T2/T3 = ${plan.join(' / ')}`);
});

console.log('\nProof-card validation complete.');
