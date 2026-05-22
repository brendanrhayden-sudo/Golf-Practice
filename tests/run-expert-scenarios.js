#!/usr/bin/env node
/* =============================================================================
   FOREFRONT — Expert-scenario QA runner
   =============================================================================

   USAGE
     node tests/run-expert-scenarios.js
     node tests/run-expert-scenarios.js --skip-validators
     node tests/run-expert-scenarios.js --playwright   # opt-in DOM drive

   What it does
   ------------
   1. Runs the three existing validators first (proof-cards, branch-layer,
      drill/session alignment). If --skip-validators is passed, prints a note.
      The existing validators set process.exitCode if they fail — we capture
      their exit codes by re-running them in a child process and report.

   2. Loads tests/scenarios/expert-scenarios.json.

   3. For each scenario, uses tests/lib/harness.js to:
        - load the same data files the page loads (via vm sandbox)
        - resolve branch + branch_intent + proof T1/T2/T3
        - run the alignment layer to compute allowed/blocked/primary categories
        - place selected drills into session blocks
        - resolve session mode (normal / modified_only / stop_refer)
        - run deterministic checks
        - emit a judge packet per scenario

   4. Writes:
        tests/reports/latest-expert-qa-report.md
        tests/reports/judge-packets/<scenario_id>.json

   5. Optional Playwright drive: if --playwright is set AND `playwright` is
      installed, opens index.html in a headless browser, runs a single
      smoke-test extraction of `window.FF.state` and `window.FF_ALIGNMENT`
      to confirm the static app boots cleanly. Drilling actual scenarios via
      DOM is intentionally NOT the default path because the app's UI is form-
      heavy and the deterministic VM path is more stable for routing checks.

   Exit code
   ---------
   - 0 if all scenarios pass deterministic checks (and validators if run)
   - 1 otherwise
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const harness = require("./lib/harness.js");

const ROOT = path.resolve(__dirname, "..");
const SCENARIOS_PATH = path.join(__dirname, "scenarios", "expert-scenarios.json");
const RUBRIC_PATH = path.join(__dirname, "rubrics", "expert-rubric.md");
const REPORTS_DIR = path.join(__dirname, "reports");
const PACKETS_DIR = path.join(REPORTS_DIR, "judge-packets");
const REPORT_PATH = path.join(REPORTS_DIR, "latest-expert-qa-report.md");

const argv = process.argv.slice(2);
const SKIP_VALIDATORS = argv.includes("--skip-validators");
const USE_PLAYWRIGHT = argv.includes("--playwright");

function ensureDirs() {
  [REPORTS_DIR, PACKETS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
}

function runValidators() {
  if (SKIP_VALIDATORS) {
    return [{ name: "_skipped_", ok: true, output: "validators skipped via --skip-validators" }];
  }
  const targets = [
    "_validate_proof_cards.js",
    "_validate_branch_layer.js",
    "_validate_drill_session_alignment.js"
  ];
  return targets.map(rel => {
    const r = spawnSync(process.execPath, [path.join(ROOT, rel)], { encoding: "utf8" });
    return {
      name: rel,
      ok: r.status === 0,
      status: r.status,
      output_tail: (r.stdout || "").split("\n").slice(-12).join("\n"),
      stderr_tail: (r.stderr || "").split("\n").slice(-6).join("\n")
    };
  });
}

function fmtChecks(checks) {
  return checks.map(c => `    - ${c.ok ? "PASS" : "FAIL"}  ${c.name}` + (c.ok ? "" : `\n        detail: ${JSON.stringify(c.detail)}`)).join("\n");
}

function buildJudgePacket(scenario, output, checks) {
  return {
    schema_version: "ff-expert-judge-packet/0.1",
    scenario_id: scenario.id,
    scenario_title: scenario.title,
    rubric_path: path.relative(ROOT, RUBRIC_PATH).split(path.sep).join("/"),
    rubric_summary: "See tests/rubrics/expert-rubric.md. Score each scenario against 10 lenses; return a single JSON object matching the rubric output schema.",
    judge_question: "How close is the Forefront Coach Builder output for this scenario to what the listed expert-pattern lenses would broadly recommend? Treat lenses as comparison axes, not verbatim citations. Pain / readiness red gates are absolute.",
    scenario_fixture: scenario,
    extracted_output: output,
    deterministic_checks: checks,
    deterministic_pass: checks.every(c => c.ok)
  };
}

function buildReport({ validators, scenarioResults, playwrightSmoke }) {
  const lines = [];
  const now = new Date().toISOString();
  const totalScenarios = scenarioResults.length;
  const passing = scenarioResults.filter(s => s.deterministic_pass).length;
  const failing = totalScenarios - passing;

  lines.push(`# Forefront Coach Builder — Expert QA Report`);
  lines.push("");
  lines.push(`- Generated: ${now}`);
  lines.push(`- Scenarios: ${totalScenarios} (pass: ${passing}, fail: ${failing})`);
  lines.push(`- Rubric: \`tests/rubrics/expert-rubric.md\``);
  lines.push("");

  lines.push(`## 1. Existing validators`);
  lines.push("");
  validators.forEach(v => {
    lines.push(`- **${v.name}** — ${v.ok ? "PASS" : "FAIL"}` + (v.status != null ? ` (exit=${v.status})` : ""));
    if (!v.ok && v.stderr_tail) lines.push("    stderr (tail):\n    ```\n" + v.stderr_tail.trim() + "\n    ```");
  });
  lines.push("");

  if (playwrightSmoke) {
    lines.push(`## 1b. Playwright smoke`);
    lines.push("");
    lines.push("- " + (playwrightSmoke.ok ? "PASS" : "FAIL") + " — " + playwrightSmoke.detail);
    lines.push("");
  }

  lines.push(`## 2. Scenario-by-scenario findings`);
  lines.push("");
  scenarioResults.forEach(sr => {
    const head = `### ${sr.scenario.id} — ${sr.scenario.title}`;
    lines.push(head);
    lines.push("");
    lines.push(`- Deterministic: **${sr.deterministic_pass ? "PASS" : "FAIL"}** (${sr.checks.filter(c => c.ok).length}/${sr.checks.length} checks)`);
    lines.push(`- Dominant intent: \`${sr.output.dominant_intent}\``);
    lines.push(`- Session mode: \`${sr.output.session_mode}\``);
    lines.push(`- T1 proof: \`${sr.output.proof_cards.map(p => p.t1).join(", ")}\``);
    lines.push(`- Primary categories: \`${JSON.stringify(sr.output.primary_categories)}\``);
    lines.push(`- Filtered-out drills: ${sr.output.filtered_out.length}`);
    lines.push("");
    lines.push("    Checks:");
    lines.push(fmtChecks(sr.checks));
    lines.push("");
    lines.push(`- Judge packet: \`tests/reports/judge-packets/${sr.scenario.id}.json\``);
    lines.push("");
  });

  // Recurring issue patterns
  const failureByCheck = {};
  scenarioResults.forEach(sr => {
    sr.checks.filter(c => !c.ok).forEach(c => {
      failureByCheck[c.name] = (failureByCheck[c.name] || 0) + 1;
    });
  });
  lines.push(`## 3. Recurring issue patterns`);
  lines.push("");
  if (!Object.keys(failureByCheck).length) {
    lines.push("- None — all deterministic checks green.");
  } else {
    Object.entries(failureByCheck).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => {
      lines.push(`- ${k}: ${n} scenario(s) failed`);
    });
  }
  lines.push("");

  lines.push(`## 4. LLM judge packet status`);
  lines.push("");
  lines.push("- One JSON packet per scenario was written to `tests/reports/judge-packets/`.");
  lines.push("- Run `node tests/judge-with-llm.js --dry-run` to produce Claude-ready markdown bundles without needing credentials.");
  lines.push("- Set `ANTHROPIC_API_KEY` and run `node tests/judge-with-llm.js` to grade live (optional; not required).");
  lines.push("");

  lines.push(`## 5. Recommended next config edits (deterministic)`);
  lines.push("");
  const edits = [];
  scenarioResults.forEach(sr => {
    sr.checks.filter(c => !c.ok).forEach(c => {
      if (c.name === "t1_profile_prefix_match") {
        edits.push(`- \`data/diagnostic-layer.js\` — review branch \`${sr.scenario.fault_ids.join(",")} :: ${Object.values(sr.scenario.branch_ids).join(",")}\` branch_intent override; T1 prefix wrong for scenario \`${sr.scenario.id}\`.`);
      } else if (c.name === "expected_branch_intents_present") {
        edits.push(`- \`data/diagnostic-layer.js\` — scenario \`${sr.scenario.id}\` expects intents ${JSON.stringify(c.detail.expected)} but got ${JSON.stringify(c.detail.got)}.`);
      } else if (c.name === "forbidden_categories_absent_primary") {
        edits.push(`- \`data/alignment-layer.js\` — scenario \`${sr.scenario.id}\` placed forbidden category as primary: ${JSON.stringify(c.detail.hits)}.`);
      } else if (c.name === "expected_session_mode") {
        edits.push(`- \`data/alignment-layer.js\` — scenario \`${sr.scenario.id}\` expected session_mode \`${c.detail.expected}\`, got \`${c.detail.got}\`. Verify intent's session_mode and gate handling.`);
      } else if (c.name === "pump_drill_primary_once") {
        edits.push(`- \`assets/app.js\` — Pump Drill (DR-GRF-004) appearing primary >1× in scenario \`${sr.scenario.id}\`. Review allocateSessionDrills.`);
      }
    });
  });
  if (!edits.length) lines.push("- None — deterministic layer clean.");
  edits.forEach(e => lines.push(e));
  lines.push("");
  lines.push("> LLM-judge layer may add qualitative recommendations (cueing language, expert-pattern coverage). See judge-packets.");
  lines.push("");

  return lines.join("\n");
}

async function maybePlaywrightSmoke() {
  if (!USE_PLAYWRIGHT) return null;
  let playwright;
  try { playwright = require("playwright"); }
  catch { return { ok: false, detail: "Playwright not installed; skipping smoke test." }; }
  try {
    const browser = await playwright.chromium.launch();
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const url = "file://" + path.join(ROOT, "index.html");
    await page.goto(url);
    await page.waitForFunction(() => !!window.FF && !!window.FF_ALIGNMENT, null, { timeout: 5000 });
    const stateShape = await page.evaluate(() => ({
      hasFFstate: !!window.FF?.state,
      hasFFAlignment: typeof window.FF_ALIGNMENT?.evaluateDrillForIntent === "function",
      hasBranches: !!window.FF_DIAGNOSTIC_BRANCHES,
      drillCount: (window.FF_DRILLS || []).length
    }));
    await browser.close();
    const ok = stateShape.hasFFstate && stateShape.hasFFAlignment && stateShape.hasBranches && stateShape.drillCount > 0;
    return { ok, detail: `boot snapshot: ${JSON.stringify(stateShape)}` };
  } catch (e) {
    return { ok: false, detail: "Playwright run failed: " + e.message };
  }
}

async function main() {
  ensureDirs();
  console.log("[expert-qa] running existing validators...");
  const validators = runValidators();
  validators.forEach(v => console.log(`  ${v.ok ? "PASS" : "FAIL"}  ${v.name}`));

  const playwrightSmoke = await maybePlaywrightSmoke();
  if (playwrightSmoke) console.log(`[expert-qa] playwright smoke: ${playwrightSmoke.ok ? "PASS" : "FAIL"} — ${playwrightSmoke.detail}`);

  console.log("[expert-qa] loading app data into VM context...");
  const ctx = harness.loadAppContext(ROOT);

  console.log("[expert-qa] loading scenarios...");
  const fixture = JSON.parse(fs.readFileSync(SCENARIOS_PATH, "utf8"));
  const scenarios = fixture.scenarios || [];
  console.log(`[expert-qa] ${scenarios.length} scenarios loaded.`);

  const scenarioResults = [];
  for (const scenario of scenarios) {
    const output = harness.extractScenarioOutput(ctx, scenario);
    const checks = harness.runDeterministicChecks(scenario, output);
    const deterministic_pass = checks.every(c => c.ok);
    const packet = buildJudgePacket(scenario, output, checks);
    const packetPath = path.join(PACKETS_DIR, scenario.id + ".json");
    fs.writeFileSync(packetPath, JSON.stringify(packet, null, 2));
    scenarioResults.push({ scenario, output, checks, deterministic_pass });
    console.log(`  ${deterministic_pass ? "PASS" : "FAIL"}  ${scenario.id}  (${checks.filter(c => c.ok).length}/${checks.length})`);
  }

  const report = buildReport({ validators, scenarioResults, playwrightSmoke });
  fs.writeFileSync(REPORT_PATH, report);
  console.log("[expert-qa] report written: " + path.relative(ROOT, REPORT_PATH));

  const allOk = validators.every(v => v.ok) && scenarioResults.every(s => s.deterministic_pass) && (!playwrightSmoke || playwrightSmoke.ok);
  process.exit(allOk ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(2); });
