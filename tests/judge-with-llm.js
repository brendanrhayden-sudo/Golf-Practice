#!/usr/bin/env node
/* =============================================================================
   FOREFRONT — LLM judge adapter (optional)
   =============================================================================

   USAGE
     node tests/judge-with-llm.js --dry-run        # write Claude-ready bundles
     node tests/judge-with-llm.js                  # auto: dry-run if no key
     ANTHROPIC_API_KEY=... node tests/judge-with-llm.js --live
     node tests/judge-with-llm.js --packet <id>    # one scenario only
     node tests/judge-with-llm.js --model claude-3-5-sonnet-20241022

   Behavior
   --------
   1. Reads every packet from tests/reports/judge-packets/*.json.
   2. Reads the rubric tests/rubrics/expert-rubric.md.
   3. For each packet, builds a single judge prompt that contains:
        - the rubric
        - the packet JSON
        - explicit instruction: "Return ONLY a JSON object matching the schema."
   4. Mode selection:
        --dry-run         → write a Claude-ready markdown bundle per scenario
                            to tests/reports/judge-packets/<id>.judge.md
                            AND a single JSONL for batch use.
        --live            → require ANTHROPIC_API_KEY; call Anthropic Messages
                            API; write the LLM response back to
                            <id>.judge-response.json. Failure is non-fatal.
        (default)         → if ANTHROPIC_API_KEY set, behave as --live; else
                            --dry-run.

   Notes
   -----
   - This script intentionally does NOT require a network call to pass.
   - No secrets are hard-coded. We only read from env.
   - Safe to run repeatedly; outputs overwrite per scenario.
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PACKETS_DIR = path.join(__dirname, "reports", "judge-packets");
const RUBRIC_PATH = path.join(__dirname, "rubrics", "expert-rubric.md");
const JSONL_PATH = path.join(__dirname, "reports", "judge-packets", "_all-packets.jsonl");
const SUMMARY_PATH = path.join(__dirname, "reports", "judge-summary.md");

const argv = process.argv.slice(2);
function flag(name) { return argv.includes(name); }
function arg(name, dflt) {
  const i = argv.indexOf(name);
  if (i === -1) return dflt;
  return argv[i + 1];
}

const DRY = flag("--dry-run");
const LIVE = flag("--live");
const ONLY = arg("--packet", null);
const MODEL = arg("--model", "claude-sonnet-4-20250514");
const KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || null;

function mode() {
  if (DRY) return "dry";
  if (LIVE) return KEY ? "live" : "dry"; // can't go live without a key
  return KEY ? "live" : "dry";
}

function buildPrompt(packet, rubric) {
  return [
    "You are grading a single Forefront Coach Builder scenario against the rubric below.",
    "",
    "RUBRIC:",
    "----- BEGIN RUBRIC -----",
    rubric,
    "----- END RUBRIC -----",
    "",
    "SCENARIO PACKET (deterministic checks already executed; do NOT re-run them — use them as evidence):",
    "----- BEGIN PACKET -----",
    JSON.stringify(packet, null, 2),
    "----- END PACKET -----",
    "",
    "Return ONLY a JSON object matching the rubric output schema. No prose, no markdown, no fenced code block. Just the JSON object.",
    ""
  ].join("\n");
}

function loadAllPackets() {
  if (!fs.existsSync(PACKETS_DIR)) return [];
  return fs.readdirSync(PACKETS_DIR)
    .filter(f => f.endsWith(".json") && !f.startsWith("_") && !f.endsWith(".judge-response.json"))
    .filter(f => !ONLY || f === ONLY + ".json")
    .map(f => ({ file: f, path: path.join(PACKETS_DIR, f), packet: JSON.parse(fs.readFileSync(path.join(PACKETS_DIR, f), "utf8")) }));
}

async function callAnthropic(prompt) {
  // Use plain fetch (Node 20+). No extra deps.
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const txt = await res.text();
  if (!res.ok) throw new Error("Anthropic " + res.status + ": " + txt.slice(0, 400));
  let body;
  try { body = JSON.parse(txt); } catch { throw new Error("non-JSON response: " + txt.slice(0, 400)); }
  const out = body.content?.[0]?.text || "";
  return { raw: out, body };
}

async function main() {
  const RUNMODE = mode();
  console.log("[judge-with-llm] mode = " + RUNMODE + (RUNMODE === "live" ? "  (model=" + MODEL + ")" : "  (no API call)"));

  const rubric = fs.readFileSync(RUBRIC_PATH, "utf8");
  const packets = loadAllPackets();
  if (!packets.length) {
    console.error("[judge-with-llm] no packets found. Run `node tests/run-expert-scenarios.js` first.");
    process.exit(1);
  }
  console.log("[judge-with-llm] " + packets.length + " packets loaded.");

  // Always write a JSONL for batch tools (Claude Workbench, etc.)
  const jsonl = packets.map(({ packet }) => JSON.stringify({
    scenario_id: packet.scenario_id,
    rubric_summary: packet.rubric_summary,
    rubric_path: packet.rubric_path,
    judge_question: packet.judge_question,
    scenario_fixture: packet.scenario_fixture,
    extracted_output: packet.extracted_output,
    deterministic_checks: packet.deterministic_checks
  })).join("\n");
  fs.writeFileSync(JSONL_PATH, jsonl);
  console.log("[judge-with-llm] wrote " + path.relative(ROOT, JSONL_PATH));

  const responses = [];
  for (const { file, packet } of packets) {
    const prompt = buildPrompt(packet, rubric);
    const mdPath = path.join(PACKETS_DIR, packet.scenario_id + ".judge.md");
    const respPath = path.join(PACKETS_DIR, packet.scenario_id + ".judge-response.json");

    // Always write the markdown bundle the user can copy into Claude.
    fs.writeFileSync(mdPath, [
      "# Judge bundle — " + packet.scenario_id,
      "",
      "Paste the following into Claude (or another LLM) and ask for the JSON-only response described in the rubric.",
      "",
      "---",
      "",
      prompt
    ].join("\n"));
    console.log("  + " + path.relative(ROOT, mdPath));

    if (RUNMODE === "live") {
      try {
        const { raw, body } = await callAnthropic(prompt);
        let parsed = null;
        try { parsed = JSON.parse(raw); }
        catch {
          // Some models wrap JSON in fences; strip them.
          const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (m) { try { parsed = JSON.parse(m[1]); } catch { /* leave null */ } }
        }
        fs.writeFileSync(respPath, JSON.stringify({ raw, parsed, anthropic_meta: { id: body.id, usage: body.usage, model: body.model } }, null, 2));
        console.log("    live -> " + path.relative(ROOT, respPath));
        responses.push({ scenario_id: packet.scenario_id, parsed, ok: !!parsed });
      } catch (e) {
        console.error("    live FAIL — " + e.message);
        responses.push({ scenario_id: packet.scenario_id, error: e.message, ok: false });
      }
    }
  }

  // Summary
  const summary = [
    "# Judge summary",
    "",
    "- Mode: `" + RUNMODE + "`",
    "- Packets: " + packets.length,
    "- Rubric: `tests/rubrics/expert-rubric.md`",
    "- All-packets JSONL: `tests/reports/judge-packets/_all-packets.jsonl`",
    ""
  ];
  if (RUNMODE === "live") {
    summary.push("## Live responses");
    summary.push("");
    responses.forEach(r => {
      if (r.ok && r.parsed) {
        summary.push("- **" + r.scenario_id + "** — score=" + r.parsed.score_0_100 + " severity=" + r.parsed.severity + " pass=" + r.parsed.pass);
      } else {
        summary.push("- **" + r.scenario_id + "** — judge call failed: " + (r.error || "unparseable response"));
      }
    });
  } else {
    summary.push("## Dry-run");
    summary.push("");
    summary.push("Per-scenario judge bundles written to `tests/reports/judge-packets/*.judge.md`.");
    summary.push("Paste any one into Claude (or batch through the JSONL) to obtain the rubric-formatted JSON verdict.");
  }
  fs.writeFileSync(SUMMARY_PATH, summary.join("\n"));
  console.log("[judge-with-llm] " + path.relative(ROOT, SUMMARY_PATH));
}

main().catch(e => { console.error(e); process.exit(2); });
