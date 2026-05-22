// Headless validation of the branch override layer.
// Loads data files in order and inspects FF_DIAGNOSTIC_BRANCHES after enrichment.
// 2026-05-22b: extended for full-authored-coverage assertion + lane safety rules.
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
const overrides = W.FF_BRANCH_LANE_OVERRIDES || {};
const intents = W.FF_BRANCH_INTENTS || {};

console.log('Meta:', W.FF_DIAGNOSTIC_LAYER_META);
console.log('Intents:', Object.keys(intents).length);
console.log('Overrides:', Object.keys(overrides).length);

// ---- 1. Coverage assertion ----
let total = 0, authored = 0;
const inferredKeys = [];
Object.keys(branches).forEach(fid => {
  (branches[fid] || []).forEach(br => {
    total++;
    const key = fid + ':' + br.id;
    if (overrides[key]) authored++;
    else inferredKeys.push(key);
  });
});
console.log(`Coverage: ${authored}/${total} branches authored (${(100 * authored / total).toFixed(1)}%).`);

function assert(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); process.exitCode = 1; }
  else console.log('OK:  ', msg);
}

// Document acceptable inferred exceptions (intentionally empty by default).
const ACCEPTED_INFERRED = new Set([]);
const unexpectedInferred = inferredKeys.filter(k => !ACCEPTED_INFERRED.has(k));
assert(unexpectedInferred.length === 0,
  `All current branches must be authored. Unexpected inferred: ${unexpectedInferred.length}`);
if (unexpectedInferred.length) {
  console.error('  Inferred:', unexpectedInferred.slice(0, 10));
}

// ---- 2. Lane safety rules ----
// Helper: walk all branches, collect (fid, br) pairs.
const allPairs = [];
Object.keys(branches).forEach(fid => (branches[fid] || []).forEach(br => allPairs.push({ fid, br })));

const SWING_3D_TOOLS = ['trackman_3d', 'gears'];
const SPEED_TOOLS = ['trackman_speed_training', 'mach3_tools'];
const FORCE_TOOLS = ['force_plate'];

function hasTech(br, key) { return br.technology_signs && br.technology_signs[key]; }
function lane(br) { return br.session_implication?.lane_key || br.branch_intent?.lane; }

// Rule A: no putting branch carries force / mach3 / full-swing 3D / speed training / hackmotion.
const FORBIDDEN_PUTTING = ['force_plate', 'mach3_tools', 'trackman_speed_training', 'trackman_3d', 'gears', 'hackmotion', 'trackman_optimizer'];
const puttingViolations = allPairs.filter(({ br }) => lane(br) === 'putting' &&
  FORBIDDEN_PUTTING.some(k => hasTech(br, k)));
assert(puttingViolations.length === 0,
  `Putting branches must not carry full-swing / force / Mach3 / speed tools (${puttingViolations.length} violations).`);

// Rule B: no equipment branch carries sleep_required=true or swing-acquisition lane.
const equipmentViolations = allPairs.filter(({ br }) => lane(br) === 'equipment' &&
  br.session_implication?.sleep_required === true);
assert(equipmentViolations.length === 0,
  `Equipment branches must not require sleep / contamination window (${equipmentViolations.length} violations).`);

// Rule C: no pain/readiness branch recommends high-intent speed.
const painReadinessViolations = allPairs.filter(({ br }) => {
  const intent = br.branch_intent?.id;
  if (intent !== 'mobility_pain_readiness' && intent !== 'speed_readiness') return false;
  return SPEED_TOOLS.some(k => hasTech(br, k));
});
assert(painReadinessViolations.length === 0,
  `Pain / readiness branches must not carry speed-training / Mach3 tools (${painReadinessViolations.length} violations).`);

// Rule D: no pressure branch presents mechanics-first as primary proof.
// Heuristic: pressure_attention branches should include at least one of PC-07 / PC-14 in proof IDs
// and not lead with a mechanical PC-01/PC-05/PC-06 card.
const pressureViolations = allPairs.filter(({ br }) => {
  if (br.branch_intent?.id !== 'pressure_attention') return false;
  const pcs = br.proof_test_ids || [];
  if (!pcs.length) return false;
  const first = pcs[0];
  return ['PC-01', 'PC-05', 'PC-06', 'PC-08'].includes(first);
});
assert(pressureViolations.length === 0,
  `Pressure / attention branches must not present mechanics-first proof cards (${pressureViolations.length} violations).`);

// Rule E: every authored branch carries why_this_branch + do_not_assume + branch_intent override flag true.
const missingCopy = allPairs.filter(({ fid, br }) => {
  if (!overrides[fid + ':' + br.id]) return false;
  return !br.why_this_branch || !br.do_not_assume || br.branch_intent?.override !== true;
});
assert(missingCopy.length === 0,
  `Every authored branch must carry why/do_not_assume + override=true (${missingCopy.length} violations).`);

// Rule F: target faults all have authored branch copy.
const targetFaults = [
  'FAULT-SLICE', 'FAULT-HOOK', 'FAULT-CHUNK', 'FAULT-TOP', 'FAULT-THIN',
  'FAULT-SHANK', 'FAULT-TOE-STRIKE', 'FAULT-HEEL-STRIKE', 'FAULT-CENTER-CONTACT-CHAOS',
  'FAULT-SLIDE', 'FAULT-SWAY', 'FAULT-HANG-BACK', 'FAULT-SPIN-OUT',
  'FAULT-SPEED-CEILING', 'FAULT-READINESS-RED',
  'FAULT-PUTT-STARTLINE', 'FAULT-PUTT-SPEED', 'FAULT-PUTT-PRESSURE',
  'FAULT-WEDGE-CONTACT', 'FAULT-SHORTGAME-DISTANCE',
  'FAULT-BUNKER-ENTRY', 'FAULT-COURSE-TRANSFER', 'FAULT-CLUB-SELECTION-MISMATCH'
];
const targetMissing = [];
targetFaults.forEach(fid => {
  (branches[fid] || []).forEach(br => {
    if (!overrides[fid + ':' + br.id]) targetMissing.push(fid + ':' + br.id);
  });
});
assert(targetMissing.length === 0,
  `Target fault families must all be authored (${targetMissing.length} missing).`);

// ---- 3. Print per-fault coverage summary ----
console.log('\nPer-fault coverage:');
Object.keys(branches).sort().forEach(fid => {
  const arr = branches[fid] || [];
  const a = arr.filter(br => overrides[fid + ':' + br.id]).length;
  const tag = a === arr.length ? 'OK' : '  ';
  console.log(`  ${tag} ${fid}: ${a}/${arr.length}`);
});

// ---- 4. Sample authored branches for inspection ----
console.log('\nSample authored branches (8 scenario groups):');
const samples = [
  'FAULT-SLICE:heel-gear', 'FAULT-HOOK:closed-face', 'FAULT-CHUNK:trail-hang',
  'FAULT-PUTT-STARTLINE:face-aim', 'FAULT-WEDGE-CONTACT:entry-point',
  'FAULT-SPEED-CEILING:force-amplitude-low', 'FAULT-READINESS-RED:pain-gate',
  'FAULT-BUNKER-ENTRY:entry-point-unknown'
];
samples.forEach(key => {
  const [fid, bid] = key.split(':');
  const br = (branches[fid] || []).find(b => b.id === bid);
  if (!br) { console.log(`  ${key}: (not present)`); return; }
  console.log(`  ${key}`);
  console.log(`    intent: ${br.branch_intent?.label} (lane:${br.branch_intent?.lane}, ${br.branch_intent?.override ? 'authored' : 'inferred'})`);
  console.log(`    why:    ${br.why_this_branch}`);
  console.log(`    do_not: ${br.do_not_assume}`);
  console.log(`    proof:  ${(br.proof_test_ids || []).join(' → ')}`);
  console.log(`    tech:   ${Object.keys(br.technology_signs || {}).join(', ')}`);
});

console.log('\nValidation complete.');
