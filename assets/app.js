/* =============================================================================
   Forefront Golf — Coach Builder
   No framework. No build step. State lives on a single global FF.state object.
   No localStorage / sessionStorage / cookies / indexedDB anywhere — per sandbox
   rules and Forefront PII policy. Refresh = clean slate.
   ============================================================================= */

(function () {
  "use strict";

  /* ------------- shorthands ------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const h = (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    for (const k in attrs) {
      if (k === "class") el.className = attrs[k];
      else if (k === "html") el.innerHTML = attrs[k];
      else if (k === "data") for (const dk in attrs.data) el.dataset[dk] = attrs.data[dk];
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] === true) el.setAttribute(k, "");
      else if (attrs[k] !== false && attrs[k] != null) el.setAttribute(k, attrs[k]);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null || c === false) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  };
  const txt = s => document.createTextNode(s);

  const toast = (msg) => {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("on"), 1600);
  };

  /* ------------- App state ------------- */
  const FF = window.FF = {
    state: {
      // Wizard
      gates: {}, // { pain: "green", ... }
      layer: null,
      faults: [], // fault ids
      diagnosticBranches: {}, // { fault_id: branch_id }
      causeNote: "",
      gpl: null,
      tools: [], // tool ids
      trackmanModes: [], // TrackMan Performance Studio mode ids
      selectedDrills: [], // drill ids
      goal: null,
      duration: 60,
      sessionContext: "coached", // coached | solo
      assemblyHorizon: "day", // day | week | month
      sessionsPerWeek: 3,
      clientLevel: "intermediate", // novice | intermediate | advanced
      readinessFlags: "",
      linkSelections: {}, // { link_id: true|false } coach-selected carryover paths for current generated plan
      sessionPlan: null,
      view: "wizard"
    }
  };

  /* ------------- View routing ------------- */
  function switchView(view) {
    FF.state.view = view;
    $$(".view").forEach(v => v.hidden = (v.id !== "view-" + view));
    $$("#nav-views button, .nav-list button").forEach(b => b.classList.toggle("active", b.dataset.view === view));
    // close mobile menu
    $("#sidebar").classList.remove("open");
    window.scrollTo({ top: 0, behavior: "instant" });
    // Render the view
    if (view === "wizard")   renderWizard();
    if (view === "session")  renderSession();
    if (view === "library")  renderLibrary();
    if (view === "output")   renderOutput();
  }

  /* =============================================================================
     WIZARD VIEW
     ============================================================================= */
  function renderWizard() {
    const root = $("#wizard-root");
    root.innerHTML = "";
    root.appendChild(renderStepRail());

    // Each step is its own panel; all visible at once on desktop so coach can
    // backtrack — the field-manual aesthetic favors density over modal flow.
    root.appendChild(stepGate());
    root.appendChild(stepLayer());
    root.appendChild(stepFault());
    root.appendChild(stepDiagnostics());
    root.appendChild(stepGPL());
    root.appendChild(stepTools());
    root.appendChild(stepDrills());
    root.appendChild(stepFinalize());
  }

  function renderStepRail() {
    const s = FF.state;
    const stepDone = (n) => {
      if (n === 1) return Object.keys(s.gates).length === FF_GATES.length;
      if (n === 2) return !!s.layer;
      if (n === 3) return s.faults.length > 0;
      if (n === 4) return s.faults.length > 0 && s.faults.every(fid => selectedBranchForFault(fid));
      if (n === 5) return !!s.gpl;
      if (n === 6) return s.tools.length > 0 || s.trackmanModes.length > 0;
      if (n === 7) return s.selectedDrills.length > 0;
      if (n === 8) return !!s.sessionPlan;
      return false;
    };
    const stepsDef = [
      ["Gate", 1], ["Layer", 2], ["Flaw", 3], ["Diagnose", 4],
      ["GP-L", 5], ["Tools", 6], ["Drills", 7], ["Build", 8]
    ];
    const rail = h("div", { class: "steps" });
    stepsDef.forEach(([name, n], i) => {
      const cls = stepDone(n) ? "step done" : "step";
      rail.appendChild(h("div", { class: cls }, [
        h("span", { class: "n" }, String(n)),
        h("span", {}, name)
      ]));
      if (i < stepsDef.length - 1) rail.appendChild(h("span", { class: "step", style: "background:transparent;border:none;padding:.2rem .25rem;color:var(--ink-4);" }, "→"));
    });
    return rail;
  }

  function stepGate() {
    const s = FF.state;
    const panel = h("div", { class: "panel" });
    panel.appendChild(panelHead("1 · Gate — safe for today?", "CB-1.1"));
    panel.appendChild(h("p", { style: "margin-bottom: .9rem; font-size: 13.5px;" },
      "Pick a stoplight color for each gate. Any red = stop or modify task. Per FM-259 ground-force safety gates and FM-355 psychology-to-session rules."));

    FF_GATES.forEach(g => {
      const row = h("div", { class: "gate-row" });
      row.appendChild(h("div", { class: "gname" }, g.label));
      const grid = h("div", { class: "gate-grid" });
      [["red", "Stop / modify", g.red], ["amber", "Modify", g.yellow], ["green", "Go", g.green]].forEach(([color, lab, desc]) => {
        const cell = h("button", {
          class: "gate-cell " + color + (s.gates[g.id] === color ? " selected" : ""),
          onclick: () => { s.gates[g.id] = color; renderWizard(); }
        }, [
          h("span", { class: "lbl" }, lab),
          h("span", {}, desc)
        ]);
        grid.appendChild(cell);
      });
      row.appendChild(grid);
      panel.appendChild(row);
    });

    // Summary line
    const reds = Object.entries(s.gates).filter(([k, v]) => v === "red").map(([k]) => k);
    const ambers = Object.entries(s.gates).filter(([k, v]) => v === "amber").map(([k]) => k);
    if (reds.length || ambers.length) {
      const banner = h("div", {
        class: "panel compact",
        style: "margin: 1rem 0 0; border-color:" + (reds.length ? "var(--crimson)" : "var(--amber)") + ";" +
               "background:" + (reds.length ? "var(--crimson-soft)" : "var(--amber-soft)") + ";"
      });
      banner.appendChild(h("div", { style: "font-size:12.5px; color: var(--ink);" }, [
        h("b", {}, reds.length ? "STOP / MODIFY: " : "MODIFY: "),
        txt(reds.length ? (reds.join(", ") + " — task must be regressed or skipped.")
                        : (ambers.join(", ") + " — pick a lower-load constraint or smaller GP-L step."))
      ]));
      panel.appendChild(banner);
    }
    return panel;
  }

  function stepLayer() {
    const s = FF.state;
    const panel = h("div", { class: "panel" });
    panel.appendChild(panelHead("2 · Layer — where is the limiter?", "CB-1.2"));
    panel.appendChild(h("p", { style: "margin-bottom: .9rem; font-size: 13.5px;" },
      "Pick the dominant cause lane. Per FM-301 six-layer diagnostic hierarchy and FM-330 symptom-vs-cause rule, only one layer is the first-cause layer per session."));
    const grid = h("div", { class: "choice-grid" });
    FF_LAYERS.forEach(layer => {
      const isOn = s.layer === layer.id;
      grid.appendChild(h("button", {
        class: "choice" + (isOn ? " on" : ""),
        onclick: () => { s.layer = isOn ? null : layer.id; renderWizard(); }
      }, [
        h("span", { class: "pill" }, layer.id.toUpperCase()),
        h("span", { class: "title" }, layer.label),
        h("span", { class: "desc" }, layer.hint)
      ]));
    });
    panel.appendChild(grid);
    return panel;
  }

  function stepFault() {
    const s = FF.state;
    const panel = h("div", { class: "panel" });
    panel.appendChild(panelHead("3 · Visible flaw — pick the pattern before the cause", "CB-1.3"));
    panel.appendChild(h("p", { style: "margin-bottom: .9rem; font-size: 13.5px;" },
      "Tap the visible ball-flight, strike, club, body, equipment, strategy, or psychology flaw first. The cause hypotheses shown on each card are secondary — they guide the next diagnostic question, not the initial selection."));

    const faults = FF_FAULTS.filter(f => !s.layer || f.layer === s.layer);
    if (!faults.length) {
      panel.appendChild(h("div", { class: "empty" }, "No catalogued faults for this layer. Add a free-text cause note below or pick a different layer."));
    } else {
      const grid = h("div", { class: "choice-grid" });
      faults.forEach(f => {
        const isOn = s.faults.includes(f.id);
        grid.appendChild(h("button", {
          class: "choice" + (isOn ? " on" : ""),
          onclick: () => {
            if (isOn) {
              s.faults = s.faults.filter(x => x !== f.id);
              delete s.diagnosticBranches[f.id];
            } else {
              s.faults = [...s.faults, f.id];
            }
            renderWizard();
          }
        }, [
          h("span", { class: "pill" }, (f.family === "full_swing" ? "FULL SWING · " : "") + f.id),
          h("span", { class: "title" }, f.name),
          h("span", { class: "desc" }, f.causes.join(" · "))
        ]));
      });
      panel.appendChild(grid);
    }

    const note = h("div", { class: "field", style: "margin-top: 1rem;" });
    note.appendChild(h("label", {}, "Cause note (optional)"));
    note.appendChild(h("textarea", {
      placeholder: "e.g. Slide returns only under driver speed intent. Wedge contact stable.",
      onchange: (e) => { s.causeNote = e.target.value; },
      oninput: (e) => { s.causeNote = e.target.value; }
    }, s.causeNote));
    panel.appendChild(note);
    return panel;
  }

  function stepDiagnostics() {
    const s = FF.state;
    const panel = h("div", { class: "panel" });
    panel.appendChild(panelHead("4 · Diagnostic branch — which version is it?", "CB-1.4"));
    panel.appendChild(h("p", { style: "margin-bottom: .9rem; font-size: 13.5px;" },
      "For each visible flaw, choose the most likely branch based on ball flight, strike pattern, TrackMan/3D evidence, setup/equipment check, and coach observation. This branch changes drill ranking and appears in the coach plan."));

    if (!s.faults.length) {
      panel.appendChild(h("div", { class: "empty" }, "Pick a visible flaw first. The diagnostic layer will show branch cards here."));
      return panel;
    }

    s.faults.forEach(fid => {
      const fault = FF_FAULTS.find(f => f.id === fid);
      const branches = diagnosticBranchesForFault(fid);
      const group = h("div", { class: "diagnostic-group" });
      group.appendChild(h("div", { class: "diagnostic-head" }, [
        h("span", { class: "pill" }, fid),
        h("h3", {}, fault?.name || fid),
        h("span", { class: "small-note" }, branches.length + " branches")
      ]));
      const grid = h("div", { class: "diagnostic-grid" });
      branches.forEach(br => {
        const isOn = s.diagnosticBranches[fid] === br.id;
        const tierLabel = String(br.diagnostic_tier || "").startsWith("authored") ? "authored branch" : "coverage fallback";
        const wrap = h("div", { class: "diagnostic-card-wrap" + (isOn ? " on" : "") });
        wrap.appendChild(h("button", {
          class: "diagnostic-card" + (isOn ? " on" : ""),
          onclick: () => {
            if (isOn) delete s.diagnosticBranches[fid];
            else s.diagnosticBranches[fid] = br.id;
            renderWizard();
          }
        }, [
          h("span", { class: "diag-meta" }, tierLabel + diagBranchEvidenceBadge(br) + (br.branch_intent ? " · " + br.branch_intent.label + (br.branch_intent.override ? " (authored)" : " (inferred)") : "")),
          h("span", { class: "diag-title" }, br.label),
          h("span", { class: "diag-question" }, br.question),
          h("span", { class: "diag-line" }, "Look for: " + br.indicators.join(" · ")),
          h("span", { class: "diag-line" }, "Test: " + br.tests.join(" · ")),
          h("span", { class: "diag-next" }, br.next),
          h("span", { class: "x" }, isOn ? "✓ selected" : "+ choose branch")
        ]));
        const deep = renderDiagBranchDeepening(br, fid);
        if (deep) wrap.appendChild(deep);
        grid.appendChild(wrap);
      });
      group.appendChild(grid);
      const selected = selectedBranchForFault(fid);
      if (selected) group.appendChild(renderDiagnosticTestDeck(fid, selected));
      panel.appendChild(group);
    });
    return panel;
  }

  function stepGPL() {
    const s = FF.state;
    const panel = h("div", { class: "panel" });
    panel.appendChild(panelHead("5 · GP-L stage — what kind of practice is allowed?", "CB-1.5"));
    panel.appendChild(h("p", { style: "margin-bottom: .9rem; font-size: 13.5px;" },
      "Per FM-103 GP-L vs MN-mode. Practice type is bounded by the client's current rung — not by what the coach wants to do."));
    const grid = h("div", { class: "choice-grid" });
    FF_GPL.forEach(stage => {
      const isOn = s.gpl === stage.id;
      grid.appendChild(h("button", {
        class: "choice" + (isOn ? " on" : ""),
        onclick: () => { s.gpl = isOn ? null : stage.id; renderWizard(); }
      }, [
        h("span", { class: "pill" }, "GP-L" + stage.id),
        h("span", { class: "title" }, stage.label),
        h("span", { class: "desc" }, stage.desc)
      ]));
    });
    panel.appendChild(grid);
    return panel;
  }

  function stepTools() {
    const s = FF.state;
    const panel = h("div", { class: "panel" });
    panel.appendChild(panelHead("6 · Tools — what's available today?", "CB-1.6"));
    panel.appendChild(h("p", { style: "margin-bottom: .9rem; font-size: 13.5px;" },
      "Pick all tools available for this session. Drill filtering uses this. Default rule: use the smallest useful feedback tool."));
    const wrap = h("div", { class: "tag-toggles" });
    FF_TOOLS.forEach(t => {
      const isOn = s.tools.includes(t.id);
      wrap.appendChild(h("button", {
        class: "tag-toggle" + (isOn ? " on" : ""),
        onclick: () => {
          if (isOn) s.tools = s.tools.filter(x => x !== t.id);
          else s.tools = [...s.tools, t.id];
          renderWizard();
        }
      }, [txt(t.label), h("span", { class: "x" }, isOn ? "✓" : "+")]));
    });
    panel.appendChild(wrap);

    const noteWrap = h("div", { style: "margin-top: .8rem; font-size: 12.5px; color: var(--ink-3);" });
    s.tools.forEach(tid => {
      const t = FF_TOOLS.find(x => x.id === tid);
      if (t) noteWrap.appendChild(h("div", { style: "margin: 2px 0;" }, [h("b", {}, t.label + " — "), txt(t.notes)]));
    });
    panel.appendChild(noteWrap);

    const tmModes = window.FF_TRACKMAN_MODES || [];
    if (tmModes.length) {
      panel.appendChild(h("div", { class: "subhead-row" }, [
        h("h3", {}, "TrackMan Performance Studio modes"),
        h("span", { class: "small-note" }, "mode determines practice block")
      ]));
      panel.appendChild(h("p", { style: "margin: .25rem 0 .7rem; font-size: 12.8px; color: var(--ink-3);" },
        "Pick the exact TrackMan environment. The wizard routes protocol cards by GP-L, feedback timing, and practice block."));
      const modeWrap = h("div", { class: "mode-grid" });
      tmModes.forEach(m => {
        const blocked = s.gpl && !m.gpl.includes(s.gpl);
        const isOn = s.trackmanModes.includes(m.id);
        modeWrap.appendChild(h("button", {
          class: "mode-card" + (isOn ? " on" : "") + (blocked ? " blocked" : ""),
          onclick: () => {
            if (blocked) {
              toast(m.label + " is not a clean GP-L" + s.gpl + " fit.");
              return;
            }
            if (isOn) s.trackmanModes = s.trackmanModes.filter(x => x !== m.id);
            else s.trackmanModes = [...s.trackmanModes, m.id];
            if (!s.tools.includes("trackman_3d")) s.tools = [...s.tools, "trackman_3d"];
            renderWizard();
          }
        }, [
          h("span", { class: "mode-title" }, m.label),
          h("span", { class: "mode-counts" }, m.counts_as),
          h("span", { class: "mode-meta" }, "GP-L " + m.gpl.join("/") + " · " + m.blocks.map(x => x.replace(/_/g, " ")).join(" / ")),
          h("span", { class: "mode-notes" }, m.notes),
          h("span", { class: "x" }, isOn ? "✓" : (blocked ? "locked" : "+"))
        ]));
      });
      panel.appendChild(modeWrap);
    }
    return panel;
  }

  function stepDrills() {
    const s = FF.state;
    const panel = h("div", { class: "panel" });
    panel.appendChild(panelHead("7 · Drill candidates — referenced by flaw + diagnostic branch", "CB-1.7"));

    // Filter logic:
    // - visible flaws are bridged to likely old drill tags / categories / cause lanes
    // - exact solves wins, bridge refs rank second, lane/category are support signals
    const selectedRefs = selectedFaultRefs();
    const scoreDrill = d => {
      let score = 0;
      if (s.gpl && d.gpl_fit.includes(s.gpl)) score += 12;
      if (s.layer && d.cause_lane === s.layer) score += 10;
      if (s.faults.length) {
        s.faults.forEach(fid => {
          if (d.solves.includes(fid)) score += 40;
          if (d.solves.some(sol => sol.toLowerCase().includes(fid.replace("FAULT-", "").toLowerCase()))) score += 18;
        });
        if (selectedRefs.refs.some(ref => drillHaystack(d).includes(ref))) score += 30;
        if (selectedRefs.branchRefs.some(ref => drillHaystack(d).includes(ref))) score += 38;
        if (selectedRefs.categories.includes(d.category)) score += 14;
        if (selectedRefs.branchCategories.includes(d.category)) score += 18;
        if (selectedRefs.lanes.includes(d.cause_lane)) score += 10;
        if (selectedRefs.branchLanes.includes(d.cause_lane)) score += 12;
      }
      const blockByGpl = {
        1: ["warmup_prep", "blocked_acquisition", "reflection"],
        2: ["blocked_acquisition", "serial_variability", "reflection"],
        3: ["serial_variability", "random_variability", "reflection"],
        4: ["random_variability", "representative_transfer", "pressure_scoring", "reflection"],
        5: ["representative_transfer", "pressure_scoring", "maintenance_retest", "reflection"]
      };
      if (s.gpl && blockByGpl[s.gpl]?.includes(d.practice_block)) score += 16;
      if (s.trackmanModes.length && d.trackman_modes?.some(m => s.trackmanModes.includes(m))) score += 45;
      if (s.trackmanModes.length && d.source_tags?.some(t => /TrackMan|TPS|Performance Center|Combine|Corridors/i.test(t))) score += 10;
      if (d.representativeness === "High" && s.gpl >= 4) score += 6;
      if (d.representativeness === "Low" && s.gpl <= 2) score += 4;
      return score;
    };

    const candidates = FF_DRILLS.filter(d => {
      if (s.gpl && !d.gpl_fit.includes(s.gpl)) return false;
      if (s.layer && d.cause_lane !== s.layer && s.faults.length === 0) {
        // If they only picked a layer with no faults, allow other cause_lanes
        // but down-rank later. Keep here.
      }
      if (s.faults.length) {
        const hit = s.faults.some(fid => d.solves.includes(fid));
        const looseHit = s.faults.some(fid => d.solves.some(sol => sol.toLowerCase().includes(fid.replace("FAULT-", "").toLowerCase())));
        const bridgeHit = drillBridgeMatch(d, selectedRefs);
        if (!hit && !looseHit && !bridgeHit && d.cause_lane !== s.layer) return false;
      }
      if (s.trackmanModes.length && d.trackman_modes?.length && !d.trackman_modes.some(m => s.trackmanModes.includes(m))) return false;
      // === ALIGNMENT LAYER (branch_intent → category) ===========================
      // Hard-filter drills that are blocked by every active branch_intent.
      // Drills that are merely "do not use if <gate>" stay visible — the card
      // surfaces the warning instead of hiding the drill.
      const align = evaluateDrillAlignment(d);
      if (!align.allowed && align.reasons_blocked.some(r => /is blocked for intent/.test(r))) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      // Boost primary-allowed drills above carryover-only ones.
      const aa = evaluateDrillAlignment(a);
      const ab = evaluateDrillAlignment(b);
      const aBoost = aa.primary_allowed ? 25 : (aa.carryover_allowed ? 10 : 0);
      const bBoost = ab.primary_allowed ? 25 : (ab.carryover_allowed ? 10 : 0);
      return (scoreDrill(b) + bBoost) - (scoreDrill(a) + aBoost) || a.name.localeCompare(b.name);
    });

    if (!candidates.length) {
      panel.appendChild(h("div", { class: "empty" }, "No drills match these constraints. Widen the GP-L stage or pick fewer faults."));
    } else {
      panel.appendChild(h("p", { style: "font-size: 13px; margin-bottom: .6rem;" },
        candidates.length + " candidate drill" + (candidates.length === 1 ? "" : "s") + ". Tap to add to session."));
      const wrap = h("div", { class: "drill-list scroll-cap" });
      candidates.forEach(d => wrap.appendChild(drillCard(d, true)));
      panel.appendChild(wrap);
    }
    return panel;
  }

  function stepFinalize() {
    const s = FF.state;
    const panel = h("div", { class: "panel" });
    panel.appendChild(panelHead("8 · Build session / practice block", "CB-1.8"));
    panel.appendChild(h("p", { style: "font-size: 13.5px; margin-bottom: .9rem;" },
      "Set context, horizon, duration, goal, and any readiness flags. The Session Builder will lay out today's plan plus week/month assembly using field-manual practice grammar."));

    const grid = h("div", { class: "row-grid three" });
    const fctx = h("div", { class: "field" });
    fctx.appendChild(h("label", {}, "Session context"));
    const csel = h("select", { onchange: e => { s.sessionContext = e.target.value; renderWizard(); } },
      (window.FF_SESSION_CONTEXTS || []).map(c => {
        const opt = h("option", { value: c.id }, c.label);
        if (s.sessionContext === c.id) opt.selected = true;
        return opt;
      })
    );
    fctx.appendChild(csel);
    fctx.appendChild(h("div", { class: "hint" }, sessionContext().intent));
    grid.appendChild(fctx);

    const fhorizon = h("div", { class: "field" });
    fhorizon.appendChild(h("label", {}, "Assembly horizon"));
    const hsel = h("select", { onchange: e => { s.assemblyHorizon = e.target.value; renderWizard(); } },
      (window.FF_ASSEMBLY_HORIZONS || []).map(a => {
        const opt = h("option", { value: a.id }, a.label);
        if (s.assemblyHorizon === a.id) opt.selected = true;
        return opt;
      })
    );
    fhorizon.appendChild(hsel);
    fhorizon.appendChild(h("div", { class: "hint" }, assemblyHorizon().description));
    grid.appendChild(fhorizon);

    const fcount = h("div", { class: "field" });
    fcount.appendChild(h("label", {}, "Sessions / week"));
    const countSel = h("select", { onchange: e => { s.sessionsPerWeek = +e.target.value; renderWizard(); } },
      [1, 2, 3, 4, 5].map(n => {
        const opt = h("option", { value: n }, n + " session" + (n === 1 ? "" : "s"));
        if (s.sessionsPerWeek === n) opt.selected = true;
        return opt;
      })
    );
    fcount.appendChild(countSel);
    fcount.appendChild(h("div", { class: "hint" }, s.assemblyHorizon === "day" ? "Used for week/month preview only." : "Dose scaffold; exact minutes remain coach-reviewable."));
    grid.appendChild(fcount);
    panel.appendChild(grid);

    const grid2 = h("div", { class: "row-grid three" });
    // Duration
    const fdur = h("div", { class: "field" });
    fdur.appendChild(h("label", {}, "Session duration (min)"));
    const dsel = h("select", { onchange: e => { s.duration = +e.target.value; renderWizard(); } },
      FF_DURATIONS.map(d => {
        const opt = h("option", { value: d }, d + " min");
        if (s.duration === d) opt.selected = true;
        return opt;
      })
    );
    fdur.appendChild(dsel);
    grid2.appendChild(fdur);

    // Goal
    const fgoal = h("div", { class: "field" });
    fgoal.appendChild(h("label", {}, "Primary GP goal"));
    const gsel = h("select", { onchange: e => { s.goal = e.target.value || null; renderWizard(); } });
    gsel.appendChild(h("option", { value: "" }, "—"));
    FF_GOALS.forEach(g => {
      const opt = h("option", { value: g.id }, g.id + " · " + g.label);
      if (s.goal === g.id) opt.selected = true;
      gsel.appendChild(opt);
    });
    fgoal.appendChild(gsel);
    grid2.appendChild(fgoal);

    // Client level
    const flvl = h("div", { class: "field" });
    flvl.appendChild(h("label", {}, "Client phase"));
    const lsel = h("select", { onchange: e => { s.clientLevel = e.target.value; renderWizard(); } },
      [["novice", "Novice"], ["intermediate", "Intermediate"], ["advanced", "Advanced"]].map(([v, lab]) => {
        const opt = h("option", { value: v }, lab);
        if (s.clientLevel === v) opt.selected = true;
        return opt;
      }));
    flvl.appendChild(lsel);
    grid2.appendChild(flvl);
    panel.appendChild(grid2);

    panel.appendChild(renderContextRuleCard());

    // Readiness flags
    const ff = h("div", { class: "field" });
    ff.appendChild(h("label", {}, "Readiness / gate flags (free text)"));
    ff.appendChild(h("textarea", {
      placeholder: "e.g. Sleep 6h; mild lumbar AM stiffness 1/10; high motivation.",
      oninput: e => { s.readinessFlags = e.target.value; }
    }, s.readinessFlags));
    panel.appendChild(ff);

    // Selected drills summary
    const selected = s.selectedDrills.map(id => FF_DRILLS.find(d => d.drill_id === id)).filter(Boolean);
    if (selected.length) {
      panel.appendChild(h("h3", { style: "margin-top: .6rem;" }, "Selected drills (" + selected.length + ")"));
      const ul = h("ul", { style: "margin:.2rem 0 .8rem 1.1rem; padding:0; font-size: 13px;" });
      selected.forEach(d => ul.appendChild(h("li", { style: "margin: 2px 0;" }, [
        h("b", {}, d.name),
        txt(" · "), h("code", {}, d.drill_id),
        txt(" · GP-L " + d.gpl_fit.join("/"))
      ])));
      panel.appendChild(ul);
    } else {
      panel.appendChild(h("div", { class: "empty", style: "margin-top: .5rem;" }, "No drills selected yet. Tap a candidate drill above."));
    }

    // Build CTA
    const reds = Object.values(s.gates).filter(v => v === "red").length;
    const gateOk = Object.keys(s.gates).length === FF_GATES.length && reds === 0;
    const canBuild = gateOk && s.layer && s.gpl && selected.length > 0;
    const row = h("div", { class: "button-row" });
    row.appendChild(h("button", {
      class: "btn", disabled: !canBuild,
      onclick: () => { s.linkSelections = {}; s.sessionPlan = buildSessionPlan(); switchView("session"); }
    }, "Build session →"));
    row.appendChild(h("button", { class: "btn secondary", onclick: () => resetWizard() }, "Reset wizard"));
    if (!gateOk) row.appendChild(h("div", { style: "font-size: 12px; color: var(--crimson); align-self: center;" }, "Resolve gate reds before building."));
    panel.appendChild(row);
    return panel;
  }

  function resetWizard() {
    const s = FF.state;
    s.gates = {}; s.layer = null; s.faults = []; s.diagnosticBranches = {}; s.causeNote = "";
    s.gpl = null; s.tools = []; s.trackmanModes = []; s.selectedDrills = [];
    s.goal = null; s.sessionContext = "coached"; s.assemblyHorizon = "day"; s.sessionsPerWeek = 3; s.linkSelections = {};
    s.readinessFlags = ""; s.sessionPlan = null;
    renderWizard();
  }

  /* =============================================================================
     DRILL CARD COMPONENT (shared)
     ============================================================================= */
  function drillCard(d, withSelect = false) {
    const s = FF.state;
    const isSel = s.selectedDrills.includes(d.drill_id);
    const card = h("div", { class: "drill-card " + d.category });
    const head = h("div", { class: "head" });
    head.appendChild(h("h3", {}, d.name));
    head.appendChild(h("span", { class: "id" }, d.drill_id));
    card.appendChild(head);

    const chips = h("div", { class: "chips" });
    chips.appendChild(h("span", { class: "chip cat" }, d.category.replace(/_/g, " ")));
    d.gpl_fit.forEach(g => chips.appendChild(h("span", { class: "chip gpl" }, "GP-L" + g)));
    chips.appendChild(h("span", { class: "chip cause" }, d.cause_lane));
    chips.appendChild(h("span", { class: "chip rep " + d.representativeness }, "Rep: " + d.representativeness));
    chips.appendChild(h("span", { class: "chip" }, d.cue_proximity));
    if (d.practice_block) chips.appendChild(h("span", { class: "chip" }, d.practice_block.replace(/_/g, " ")));
    if (d.learning_stage) chips.appendChild(h("span", { class: "chip" }, d.learning_stage.replace(/_/g, " ")));
    if (d.trackman_modes?.length) chips.appendChild(h("span", { class: "chip trackman" }, "TrackMan mode"));
    card.appendChild(chips);

    card.appendChild(h("div", { class: "cue" }, d.active_cue));
    card.appendChild(h("p", { style: "font-size: 13px; margin: .4rem 0 .35rem; color: var(--ink-2);" }, d.description));

    const dl = h("dl", { class: "grid2" });
    const addRow = (label, val) => {
      if (!val) return;
      dl.appendChild(h("dt", {}, label));
      dl.appendChild(h("dd", {}, val));
    };
    addRow("When / why", d.when_why);
    addRow("Practice block", d.practice_block?.replace(/_/g, " "));
    addRow("Motor-learning stage", d.learning_stage?.replace(/_/g, " "));
    if (d.trackman_modes?.length) addRow("TrackMan mode fit", d.trackman_modes.map(modeLabel).join(" · "));
    addRow("Constraint alternative", d.constraint_alternative);
    addRow("Feedback schedule", d.feedback_schedule);
    addRow("Proof / retest metric", d.proof_metric);
    card.appendChild(dl);

    if (withSelect) {
      card.appendChild(h("div", { class: "reference-reason" }, [
        h("strong", {}, "Why referenced"),
        h("span", {}, drillReferenceReason(d))
      ]));
      // Alignment-layer badges — surface "Allowed because" + "Do not use if"
      const align = evaluateDrillAlignment(d);
      if (align.intents?.length) {
        const wrap = h("div", { class: "reference-reason", style: "border-color: rgba(0,128,90,0.35);" });
        const tag = align.primary_allowed ? "✓ Primary OK"
                  : (align.carryover_allowed ? "→ Carryover only"
                  : (align.allowed ? "⚠ Conditional" : "✕ Blocked"));
        wrap.appendChild(h("strong", {}, "Alignment: " + tag));
        const why = (align.reasons_allowed || []).slice(0, 3).join(" · ");
        if (why) wrap.appendChild(h("span", {}, why));
        card.appendChild(wrap);
        if (align.reasons_blocked?.length) {
          const blockWrap = h("div", { class: "reference-reason", style: "border-color: rgba(190,40,40,0.45); background: rgba(190,40,40,0.06);" });
          blockWrap.appendChild(h("strong", {}, "Do not use if"));
          blockWrap.appendChild(h("span", {}, align.reasons_blocked.slice(0, 4).join(" · ")));
          card.appendChild(blockWrap);
        } else if (align.do_not_use_if?.length) {
          const blockWrap = h("div", { class: "reference-reason", style: "border-color: rgba(190,140,40,0.45); background: rgba(190,140,40,0.05);" });
          blockWrap.appendChild(h("strong", {}, "Do not use if"));
          blockWrap.appendChild(h("span", {}, align.do_not_use_if.join(" · ").replace(/_/g, " ")));
          card.appendChild(blockWrap);
        }
      }
    }

    const det = h("details");
    det.appendChild(h("summary", {}, "Full card · progression · regression · conflicts"));
    const detDl = h("dl", { class: "grid2" });
    const addRow2 = (label, val) => {
      if (!val) return;
      detDl.appendChild(h("dt", {}, label));
      detDl.appendChild(h("dd", {}, val));
    };
    addRow2("Solves", d.solves.join(" · "));
    if (withSelect) addRow2("Why referenced", drillReferenceReason(d));
    addRow2("Description note", d.description_note);
    addRow2("Conflict / do-not-use-if", d.conflict);
    addRow2("Progression", d.progression);
    addRow2("Regression", d.regression);
    det.appendChild(detDl);
    card.appendChild(det);

    card.appendChild(h("div", { class: "sources" }, "Sources: " + d.source_tags.join(" · ")));

    if (withSelect) {
      const row = h("div", { class: "button-row", style: "margin-top: .55rem;" });
      row.appendChild(h("button", {
        class: "btn " + (isSel ? "secondary" : ""),
        onclick: () => {
          if (isSel) s.selectedDrills = s.selectedDrills.filter(x => x !== d.drill_id);
          else s.selectedDrills = [...s.selectedDrills, d.drill_id];
          renderWizard();
        }
      }, isSel ? "✓ In session — remove" : "Add to session"));
      card.appendChild(row);
    }
    return card;
  }

  /* =============================================================================
     SESSION PLAN BUILDER
     ============================================================================= */
  function sessionContext(id = FF.state.sessionContext) {
    return (window.FF_SESSION_CONTEXTS || []).find(c => c.id === id) || (window.FF_SESSION_CONTEXTS || [])[0] || {
      id: "coached", label: "Coached session", badge: "coach-led", block_bias: {}, feedback_rule: "", tech_rule: "", pressure_rule: "", homework_rule: ""
    };
  }

  function assemblyHorizon(id = FF.state.assemblyHorizon) {
    return (window.FF_ASSEMBLY_HORIZONS || []).find(a => a.id === id) || { id: "day", label: "Single session", sessions: 1, weeks: 0, description: "" };
  }

  function renderContextRuleCard() {
    const ctx = sessionContext();
    const spine = window.FF_FIELD_MANUAL_BACKEND?.source_spine || [];
    const card = h("div", { class: "assembly-rule-card" });
    card.appendChild(h("div", { class: "rule-head" }, [
      h("span", { class: "context-badge" }, ctx.badge),
      h("b", {}, ctx.label + " rules"),
      h("span", { class: "small-note" }, "FM-500 assembly")
    ]));
    const grid = h("div", { class: "rule-grid" });
    [
      ["Feedback", ctx.feedback_rule],
      ["Technology", ctx.tech_rule],
      ["Pressure", ctx.pressure_rule],
      ["Homework", ctx.homework_rule]
    ].forEach(([k, v]) => grid.appendChild(h("div", {}, [h("dt", {}, k), h("dd", {}, v)])));
    card.appendChild(grid);
    card.appendChild(h("div", { class: "field-spine" }, spine.map(s => s.id).join(" · ") + " stays attached to generated plans."));
    return card;
  }

  function timeAllocation(dur, gpl, ctxId) {
    const ctx = sessionContext(ctxId);
    const splitByGpl = { 1: [0.85, 0.15], 2: [0.70, 0.30], 3: [0.50, 0.50], 4: [0.30, 0.70], 5: [0.20, 0.80] };
    const [acqShare, xfrShare] = splitByGpl[gpl || 3];
    const scale = (block, mins) => Math.max(block === "pressure_scoring" ? 0 : 4, Math.round(mins * (ctx.block_bias?.[block] || 1)));
    const warmup = scale("warmup_prep", Math.max(5, Math.round(dur * 0.15)));
    const retest = scale("maintenance_retest", Math.max(5, Math.round(dur * (ctxId === "solo" ? 0.08 : 0.10))));
    const scoring = dur >= 45 && gpl >= 4 ? scale("pressure_scoring", Math.max(5, Math.round(dur * 0.08))) : 0;
    const reflection = Math.max(3, Math.round(dur * (ctxId === "solo" ? 0.08 : 0.05)));
    const blockTotal = Math.max(10, dur - warmup - retest - scoring - reflection);
    const acq = scale("blocked_acquisition", Math.round(blockTotal * acqShare));
    const xfr = Math.max(5, dur - warmup - retest - scoring - reflection - acq);
    return { warmup, acq, xfr, scoring, retest, reflection, xfrShare };
  }

  function blockInstruction(kind, ctxId, gpl) {
    const solo = ctxId === "solo";
    const map = {
      warmup: solo ? "Self-check gates first. If pain/readiness changes, downgrade the task before starting." : "Coach confirms today's gates, baseline, and allowed constraint before technical feedback.",
      block1: solo ? "Do not invent a new fix. Run the assigned constraint and stop if the pattern gets noisier." : "Coach installs or calibrates the constraint. One cue, one metric, one dominant cause lane.",
      block2: solo ? "Switch target/club/lie as written. Score task success before looking for swing answers." : "Coach fades feedback and tests ownership through serial/random changes.",
      scoring: solo ? "One-ball scoring only if GP-L and confidence are ready. Stop pressure if technique panic appears." : "Coach controls consequence size and protects the learning state.",
      retest: solo ? "Cover numbers until the set ends. Write the proof result and one observation." : "Coach runs the proof test; debrief after the set, not during every rep.",
      reflection: solo ? "Log one win, one miss pattern, one question. Follow no-contamination rule after new changes." : "Assign homework, sleep/no-contamination instruction, and next-session question."
    };
    if (gpl <= 2 && kind === "scoring") return "Not stage-legal yet. Replace with reflection or easy transfer.";
    return map[kind] || "";
  }

  function sessionLinkRules() {
    return window.FF_SESSION_LINK_RULES || { practice_block_defaults: {}, drill_overrides: {} };
  }

  function drillById(id) {
    return FF_DRILLS.find(d => d.drill_id === id);
  }

  function linkRulesForDrill(d) {
    const rules = sessionLinkRules();
    const overrides = rules.drill_overrides?.[d.drill_id] || [];
    const blockDefaults = rules.practice_block_defaults?.[d.practice_block] || [];
    const categoryDefaults = rules.category_defaults?.[d.category] || [];
    const categoryTargets = new Set(categoryDefaults.map(r => r.to));
    const general = [
      ...categoryDefaults,
      ...blockDefaults.filter(r => !categoryTargets.has(r.to))
    ];
    if (!overrides.length) return general;
    const overrideTargets = new Set(overrides.map(r => r.to));
    return [
      ...overrides,
      ...general.filter(r => !overrideTargets.has(r.to))
    ];
  }

  function linkId(kind, drill, rule) {
    const label = (rule.label || "Linked carryover").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return [kind, drill.drill_id, label].join("__");
  }

  function isLinkActive(id) {
    return FF.state.linkSelections?.[id] !== false;
  }

  function activeBlockLinks(links = []) {
    return links.filter(link => link.active !== false);
  }

  function applyLinkSelectionsToPlan(plan) {
    if (!plan?.blocks) return;
    plan.blocks.forEach(b => (b.links || []).forEach(link => {
      link.active = isLinkActive(link.link_id);
    }));
    plan.assembly = buildAssembly(plan, [], []);
  }

  function toggleLink(linkId, active) {
    FF.state.linkSelections = FF.state.linkSelections || {};
    FF.state.linkSelections[linkId] = !!active;
    applyLinkSelectionsToPlan(FF.state.sessionPlan);
    renderSession();
  }

  function buildBlockLinks(kind, blocks) {
    const assigned = [];
    const order = ["warmup", "block1", "block2", "scoring", "retest", "reflection"];
    const targetIndex = order.indexOf(kind);
    blocks.forEach(b => {
      const sourceIndex = order.indexOf(b.kind);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex >= targetIndex) return;
      (b.drills || []).forEach(d => assigned.push({ block: b, drill: d }));
    });
    return assigned.flatMap(({ block, drill }) => {
      if (block.kind === kind) return [];
      return linkRulesForDrill(drill)
        .filter(rule => rule.to === kind)
        .map(rule => {
          const id = linkId(kind, drill, rule);
          return {
            link_id: id,
            active: isLinkActive(id),
            from_kind: block.kind,
            from_label: block.label,
            from_drill_id: drill.drill_id,
            from_drill_name: drill.name,
            label: rule.label || "Linked carryover",
            relationship: rule.relationship || "carryover",
            task: rule.task || "Carry the same constraint into this block without adding a second swing thought.",
            gate: rule.gate || "",
            companions: (rule.companion_drill_ids || []).map(drillById).filter(Boolean)
          };
        });
    }).filter((link, i, arr) => arr.findIndex(x => x.label === link.label && x.task === link.task) === i).slice(0, 4);
  }

  function allocateSessionDrills(selected, fallbackSorted) {
    const used = new Set();
    const selectedUnique = [];
    selected.forEach(d => {
      if (!d || used.has(d.drill_id)) return;
      selectedUnique.push(d);
      used.add(d.drill_id);
    });

    // === ALIGNMENT LAYER — collect primary-once + dominant intent context ===
    const intents = currentBranchIntents();
    const dominant = currentDominantIntent();
    const align = (window.FF_ALIGNMENT && dominant) ? window.FF_ALIGNMENT.getAlignment(dominant) : null;
    const primaryOnce = new Set();
    intents.forEach(id => {
      const a = window.FF_ALIGNMENT?.getAlignment(id);
      (a?.primary_once_drills || []).forEach(did => primaryOnce.add(did));
    });
    const primaryOnceUsed = new Set();

    const placementUsed = new Set();
    const isPrimaryBlock = (b) => b === "blocked_acquisition" || b === "serial_variability";
    const takeSelected = (...blocks) => {
      const out = [];
      selectedUnique.forEach(d => {
        if (placementUsed.has(d.drill_id)) return;
        if (!blocks.includes(d.practice_block)) return;
        // primary-once rule: if drill is in primary_once_drills and we have
        // already used it in a primary block, refuse to place it in another
        // primary block. It is still allowed in carryover/retest variants.
        if (primaryOnce.has(d.drill_id) && primaryOnceUsed.has(d.drill_id) && isPrimaryBlock(d.practice_block)) {
          return;
        }
        out.push(d);
        placementUsed.add(d.drill_id);
        if (primaryOnce.has(d.drill_id) && isPrimaryBlock(d.practice_block)) {
          primaryOnceUsed.add(d.drill_id);
        }
      });
      return out;
    };
    const takeFallback = (...blocks) => {
      const d = fallbackSorted.find(x => !placementUsed.has(x.drill_id) && (!blocks.length || blocks.includes(x.practice_block)));
      if (!d) return [];
      placementUsed.add(d.drill_id);
      return [d];
    };

    const warmup = takeSelected("warmup_prep");
    const block1 = takeSelected("blocked_acquisition", "serial_variability");
    const block2 = takeSelected("random_variability", "representative_transfer");
    const scoring = takeSelected("pressure_scoring");
    const retest = takeSelected("maintenance_retest");
    const reflection = takeSelected("reflection");

    // Carryover variants: if a primary_once drill was placed primary, surface
    // it again in carryover/retest blocks WITHOUT consuming a fresh selection.
    // We mark it as a "carryover variant" so the UI labels it correctly.
    primaryOnceUsed.forEach(did => {
      const d = selectedUnique.find(x => x.drill_id === did);
      if (!d) return;
      const variant = Object.assign({}, d, { __carryover_variant: true });
      // Prefer landing in block2; if block2 already has work, push to retest.
      if (block2.length < 2) block2.push(variant);
      else if (retest.length < 2) retest.push(variant);
      else reflection.push(variant);
    });

    return {
      warmup,
      block1: block1.length ? block1 : takeFallback("blocked_acquisition", "serial_variability"),
      block2: block2.length ? block2 : takeFallback("random_variability", "representative_transfer"),
      scoring,
      retest,
      reflection,
      _alignment: {
        intents,
        dominant,
        session_mode: window.FF_ALIGNMENT ? window.FF_ALIGNMENT.sessionModeFor(intents, FF.state.gates) : "normal",
        primary_once_used: [...primaryOnceUsed],
        preferred_primary_block: align?.preferred_primary_block || null
      }
    };
  }

  function buildSessionPlan() {
    const s = FF.state;
    const sel = s.selectedDrills.map(id => FF_DRILLS.find(d => d.drill_id === id)).filter(Boolean);
    const dur = s.duration;
    const ctx = sessionContext(s.sessionContext);
    const horizon = assemblyHorizon(s.assemblyHorizon);
    const alloc = timeAllocation(dur, s.gpl, ctx.id);

    const ladder = sel.filter(d => d.category !== "warmup_prep");
    const fallbackSorted = [...ladder].sort((a, b) => Math.min(...a.gpl_fit) - Math.min(...b.gpl_fit));
    const placed = allocateSessionDrills(sel, fallbackSorted);
    const trackmanModes = (s.trackmanModes || []).map(id => (window.FF_TRACKMAN_MODES || []).find(m => m.id === id)).filter(Boolean);
    const blocks = [
      { kind: "warmup", label: "Warm-up & prep", mins: alloc.warmup, drills: placed.warmup.length ? placed.warmup : [DEFAULT_WARMUP] },
      { kind: "block1", label: ctx.id === "solo" ? "Assigned constraint / ownership block" : "Acquisition / install block", mins: alloc.acq, drills: placed.block1 },
      { kind: "block2", label: "Variability / transfer", mins: alloc.xfr, drills: placed.block2 },
      alloc.scoring > 0 ? { kind: "scoring", label: "Scoring / pressure", mins: alloc.scoring, drills: placed.scoring } : null,
      { kind: "retest", label: ctx.id === "solo" ? "Self-check / proof capture" : "Retest & note capture", mins: alloc.retest, drills: placed.retest },
      { kind: "reflection", label: ctx.id === "solo" ? "Practice log & stop rule" : "Homework handoff", mins: alloc.reflection, drills: placed.reflection }
    ].filter(Boolean).map(b => ({
      ...b,
      context_instruction: blockInstruction(b.kind, ctx.id, s.gpl),
      field_manual_tags: fieldManualTagsForBlock(b.kind)
    }));
    blocks.forEach(b => {
      b.links = buildBlockLinks(b.kind, blocks);
    });
    const plan = {
      blocks,
      trackmanModes,
      duration: dur,
      gpl: s.gpl,
      goal: s.goal,
      layer: s.layer,
      faults: s.faults,
      diagnosticBranches: { ...s.diagnosticBranches },
      diagnosticTestCards: selectedDiagnosticTestCards(s.faults),
      tools: s.tools,
      trackmanModeIds: s.trackmanModes,
      causeNote: s.causeNote,
      readinessFlags: s.readinessFlags,
      clientLevel: s.clientLevel,
      sessionContext: ctx,
      sessionContextId: ctx.id,
      assemblyHorizon: horizon,
      assemblyHorizonId: horizon.id,
      sessionsPerWeek: s.sessionsPerWeek,
      fieldManualBackend: window.FF_FIELD_MANUAL_BACKEND,
      gates: { ...s.gates },
      alignment: placed._alignment || null
    };
    // === ALIGNMENT — modified/stop session override ===========================
    // mobility_pain_readiness OR pain_red gate → modified warm-up only, with
    // explicit stop/refer language. Other blocks get coach guidance, no drills.
    const mode = plan.alignment?.session_mode || "normal";
    if (mode === "stop_refer" || mode === "modified_only") {
      plan.session_mode = mode;
      plan.session_mode_reason = (mode === "stop_refer")
        ? "Pain gate RED — stop / refer. No normal practice. Document, refer to medical, log readiness."
        : "Readiness / mobility constraint — modified warm-up only. No high-intent acquisition, no speed primary.";
      // Strip primary mechanical work from all non-warmup blocks; replace with
      // a coach-instruction breadcrumb the UI can render.
      plan.blocks.forEach(b => {
        if (b.kind === "warmup") return;
        if (b.kind === "reflection") return;
        b.drills = [];
        b.modified_notice = (mode === "stop_refer")
          ? "STOP / REFER — do not run this block today."
          : "Modified only — skip high-intent work. Coach-led mobility re-check, low-intent putting or short-game contact may continue.";
      });
    } else {
      plan.session_mode = "normal";
    }
    plan.assembly = buildAssembly(plan, sel, fallbackSorted);
    return plan;
  }

  function fieldManualTagsForBlock(kind) {
    const map = {
      warmup: ["FM-100", "FM-355"],
      block1: ["FM-300", "FM-500"],
      block2: ["FM-100", "FM-500"],
      scoring: ["FM-355", "FM-500"],
      retest: ["FM-410", "FM-500"],
      reflection: ["FM-355", "FM-500"]
    };
    return map[kind] || ["FM-500"];
  }

  function buildAssembly(plan, selected, fallbackSorted) {
    const horizon = plan.assemblyHorizonId;
    const count = Math.max(1, Math.min(5, plan.sessionsPerWeek || 3));
    const primary = (kind) => plan.blocks.find(b => b.kind === kind)?.drills?.[0] || null;
    const linksFor = (kinds) => plan.blocks
      .filter(b => kinds.includes(b.kind))
      .flatMap(b => activeBlockLinks(b.links || []))
      .filter((link, i, arr) => arr.findIndex(x => x.label === link.label && x.from_drill_id === link.from_drill_id) === i);
    const shortDur = Math.max(20, Math.min(45, plan.duration <= 30 ? plan.duration : 30));
    const makeSession = (index, contextId, focus, blockKinds, minutes, note) => {
      const ctx = sessionContext(contextId);
      const drills = [];
      blockKinds.forEach(k => {
        const d = primary(k);
        if (d && !drills.some(x => x.drill_id === d.drill_id)) drills.push(d);
      });
      const carryovers = linksFor(blockKinds);
      return {
        index,
        contextId,
        contextLabel: ctx.label,
        badge: ctx.badge,
        focus,
        minutes,
        blockKinds,
        drills,
        carryovers,
        feedback: ctx.feedback_rule,
        tech: ctx.tech_rule,
        proof: drills[0]?.proof_metric || carryovers[0]?.gate || "Coach-defined acceptable-shot score.",
        note
      };
    };
    const day = [makeSession(1, plan.sessionContextId, "Today's " + plan.sessionContext.label.toLowerCase(), plan.blocks.map(b => b.kind), plan.duration, "Use the full block plan below.")];
    if (horizon === "day") return { horizon, sessions: day, weeks: [], summary: "Single-session assembly only." };

    const weekly = [];
    const firstContext = plan.sessionContextId === "coached" ? "coached" : "solo";
    weekly.push(makeSession(1, firstContext, firstContext === "coached" ? "Coach anchor: diagnose, install, proof" : "Solo anchor: execute assigned constraint", ["warmup", "block1", "block2", "retest", "reflection"], plan.duration, "Anchor the week with the selected cards and proof metric."));
    if (count >= 2) weekly.push(makeSession(2, "solo", "Solo support: ownership reps", ["warmup", "block1", "reflection"], shortDur, "No new fixes; repeat the assigned constraint and stop on red flags."));
    if (count >= 3) weekly.push(makeSession(3, "solo", "Solo transfer: random / target work", ["warmup", "block2", "retest", "reflection"], shortDur, "Change target or club; score acceptable shots before checking numbers."));
    if (count >= 4) weekly.push(makeSession(4, plan.gpl >= 4 ? "solo" : "coached", plan.gpl >= 4 ? "Solo scoring exposure" : "Coach check-in / regression guard", ["warmup", plan.gpl >= 4 ? "scoring" : "block1", "reflection"], shortDur, "Only add pressure if the stage gate is green."));
    if (count >= 5) weekly.push(makeSession(5, "solo", "Maintenance microdose", ["warmup", "retest", "reflection"], 20, "Short proof set; leave fresh."));
    if (horizon === "week") return { horizon, sessions: weekly, weeks: [], summary: `${weekly.length}-session week: anchor plus solo support.` };

    const weekThemes = [
      { week: 1, theme: "Install / calibrate", instruction: "Coach sets the dominant constraint; solo practice repeats without extra diagnosis.", emphasis: ["block1", "reflection"] },
      { week: 2, theme: "Consolidate / serial variation", instruction: "Small planned changes. Feedback fades to clusters and predictions.", emphasis: ["block1", "block2", "reflection"] },
      { week: 3, theme: "Random / representative transfer", instruction: "Target, club, lie, or TPS mode changes. Outcome and routine become the score.", emphasis: ["block2", "scoring", "reflection"] },
      { week: 4, theme: "Retest / maintain", instruction: "Run saved proof test. Decide progress, regression, or maintenance dose.", emphasis: ["retest", "reflection"] }
    ];
    const weeks = weekThemes.map(w => ({
      ...w,
      sessions: weekly.map((sess, i) => ({
        ...sess,
        index: i + 1,
        focus: `${sess.contextLabel}: ${w.theme}`,
        blockKinds: w.emphasis,
        drills: w.emphasis.map(k => primary(k)).filter(Boolean).filter((d, j, arr) => arr.findIndex(x => x.drill_id === d.drill_id) === j),
        carryovers: linksFor(w.emphasis),
        note: w.instruction
      }))
    }));
    return { horizon, sessions: weekly, weeks, summary: "4-week block: install, consolidate, transfer, retest." };
  }
  const DEFAULT_WARMUP = FF_DRILLS.find(d => d.drill_id === "DR-WAR-001");

  function modeLabel(id) {
    return (window.FF_TRACKMAN_MODES || []).find(m => m.id === id)?.label || id;
  }

  function faultLabel(id) {
    return FF_FAULTS.find(f => f.id === id)?.name || id;
  }

  function diagnosticBranchesForFault(fid) {
    const explicit = window.FF_DIAGNOSTIC_BRANCHES?.[fid];
    if (explicit?.length) return explicit;
    const fault = FF_FAULTS.find(f => f.id === fid);
    const map = window.FF_FAULT_DRILL_MAP?.[fid] || {};
    const causes = (fault?.causes || ["dominant pattern"]).slice(0, 4);
    return causes.map((cause, i) => ({
      id: "cause-" + (i + 1),
      label: cause.replace(/\b\w/g, ch => ch.toUpperCase()),
      question: "Is this flaw mainly explained by " + cause + "?",
      indicators: [cause, fault?.layer ? "Layer: " + fault.layer : "Coach observation", "Repeatable cluster"],
      tests: ["3–5 ball cluster", "Coach observation", "Compare against baseline"],
      refs: [cause, ...(map.refs || []).slice(0, 2)],
      categories: map.categories || [],
      lanes: map.lanes || (fault?.layer ? [fault.layer] : []),
      next: "Choose one diagnostic test, then one matching constraint.",
      avoid: "Do not treat this as final cause without proof.",
      source_tags: ["FM-300 Diagnostic ladder", "fallback branch"]
    }));
  }

  function selectedBranchForFault(fid) {
    const bid = FF.state.diagnosticBranches?.[fid];
    return diagnosticBranchesForFault(fid).find(b => b.id === bid);
  }

  function selectedDiagnosticBranches(ids = FF.state.faults) {
    return ids.map(fid => ({ fault_id: fid, fault: faultLabel(fid), branch: selectedBranchForFault(fid) })).filter(x => x.branch);
  }

  /* -----------------------------------------------------------------
     Branch- and drill-aware proof-card composer.

     Background: the legacy FF_DIAGNOSTIC_TEST_CARDS map in deepening.js
     keys card copy off the test-name string and lane fallback only.
     That generates wrong T1 cards whenever a test name happens to
     contain a keyword from a different lane — e.g. "Step drill screen"
     for the ground-force "Pressure stays trail side" branch matched
     the psychology /screen/ regex and rendered as a threat-screen
     proof. The composer below ignores the legacy keyword map and
     instead routes off branch.branch_intent.id (authoritative lane
     intent set by data/diagnostic-layer.js), fault id family, and
     branch.proof_test_ids. T1 = cheapest relevant proof for the
     branch. T2 = ball-flight / strike transfer at low-to-moderate
     speed. T3 = retest under variation or transfer proof.
     Falls back to the legacy map only when no intent is present.
  ----------------------------------------------------------------- */
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

  /* Intent + family → ordered triple of profile keys (T1, T2, T3).
     Profile keys resolve through FF_PROOF_PROFILES below. T1 must be
     the lowest-cost relevant proof for the branch (no-ball / rehearsal /
     pressure trace / strike map / equipment A-B / putt gate / bunker
     entry / readiness baseline). T2/T3 add a transfer-to-ball-flight
     proof and a variation/retest proof, distinct from T1. */
  const FF_PROOF_INTENT_PLAN = {
    // Ground-force / pressure / sequencing — T1 is a pressure recenter
    // station or lead-side finish gate, NEVER a threat / screen test.
    ground_force_pressure:    ["gf_recenter_station", "gf_lead_finish_strike", "gf_variation_retest"],
    sequencing_kinematics:    ["gf_recenter_station", "gf_lead_finish_strike", "gf_variation_retest"],
    // Face / path / wrist — T1 is start-line / curve corridor proof.
    face_control:             ["fp_corridor", "fp_trackman_face", "fp_curve_variation"],
    path_delivery:            ["fp_corridor", "fp_trackman_face", "fp_curve_variation"],
    wrist_release_hackmotion: ["fp_corridor", "fp_hackmotion_release", "fp_curve_variation"],
    // Strike / low point — T1 is strike map / low-point line.
    strike_lowpoint:          ["cl_strike_map", "cl_lowpoint_line", "cl_strike_transfer"],
    dynamic_loft_spinloft:    ["cl_strike_map", "cl_lowpoint_line", "cl_strike_transfer"],
    // Setup / aim — single setup variable A-B, then transfer.
    aim_setup:                ["setup_ab", "setup_transfer", "setup_variation"],
    // Equipment — A-B test first, never a swing correction.
    equipment_fit:            ["eq_ab", "eq_strike_compare", "eq_transfer"],
    // Putting — start-line / face proof first.
    putting_start_line:       ["pt_gate", "pt_face_aim", "pt_distance_retest"],
    putting_speed_control:    ["pt_distance_ladder", "pt_tempo_map", "pt_pressure_retest"],
    putting_read_aim:         ["pt_aim_check", "pt_gate", "pt_break_read"],
    // Short game — landing / entry / bounce.
    short_game_entry:         ["sg_entry_line", "sg_landing_window", "sg_lie_variation"],
    short_game_landing_window:["sg_landing_window", "sg_entry_line", "sg_lie_variation"],
    bunker_entry:             ["bn_entry_line", "bn_landing_window", "bn_lie_variation"],
    // Speed — readiness baseline first.
    speed_transfer:           ["sp_readiness_baseline", "sp_ball_transfer", "sp_variation_retest"],
    speed_readiness:          ["sp_readiness_baseline", "rd_modified_warmup", "rd_low_intent_retest"],
    // Mobility / pain / readiness — gate first, no high-intent.
    mobility_pain_readiness:  ["rd_pain_gate", "rd_modified_warmup", "rd_low_intent_retest"],
    // Course — decision audit then routine, then transfer.
    course_decision:          ["cd_decision_audit", "cd_routine_proof", "cd_random_transfer"],
    // Psychology / pressure — threat / screen proof is appropriate HERE only.
    pressure_attention:       ["ps_threat_screen", "ps_routine_reset", "ps_consequence_retest"]
  };

  /* Per-family fallbacks when intent is missing or unrecognised. */
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

  /* Each profile contributes title-suggestion + concrete body. The
     branch.tests[index] (when present) is preferred as the displayed
     title; the title field below is the fallback. The objective /
     setup / protocol / pass / fail / use_result are always distinct
     per profile so T1/T2/T3 never read as duplicates of each other. */
  const FF_PROOF_PROFILES = {
    // ---- ground-force / pressure ----
    gf_recenter_station: {
      title: "Pressure recenter station",
      objective: "Confirm the player can shift pressure toward the lead side before contact at low cost — no full-speed swing required.",
      setup: "No ball. Place a lead-side finish marker (alignment stick under lead foot, headcover at lead hip) or a force plate / pressure mat if available.",
      protocol: "10 slow rehearsals into the lead-side finish, then 5 half-speed rehearsals. Capture pressure trace if a mat is present; otherwise coach scores lead-side finish 0/1 per rep.",
      pass: "≥ 7/10 reps land in a balanced lead-side finish with pressure visibly off the trail foot; pressure trace (if available) crosses centreline before impact.",
      fail: "Trail-side finish persists, or balance breaks toward the trail foot — do not prescribe the recenter drill yet; check mobility / readiness gate first.",
      use_result: "Pass → recenter is achievable; prescribe the low-cost recenter drill and pair with a strike retest. Fail → mobility or readiness is upstream; do not add lead-side body cues."
    },
    gf_lead_finish_strike: {
      title: "Lead-side finish gate + strike transfer",
      objective: "Prove the pressure recenter survives a ball at low-to-moderate speed and that strike / low point moves with it.",
      setup: "7-iron or 9-iron, half-speed. Lead-foot finish gate (stick / chalk line), face spray or impact tape on the club, divot board if available.",
      protocol: "3 baseline balls, then 6 balls aiming to finish through the gate. Score finish position 0/1 per rep and capture strike location each ball.",
      pass: "≥ 4/6 balls finish through the gate AND strike or divot moves forward of the baseline cluster (low point ahead of the ball).",
      fail: "Pressure stays trail-side under the ball, or strike does not move forward — regress to no-ball station, do not add a face / path cue.",
      use_result: "Pass → recenter drill is the right install; build the session around it. Fail → branch is not active; test contact / low-point or face / path next."
    },
    gf_variation_retest: {
      title: "Recenter retest under mild variation",
      objective: "Check that the recenter pattern holds when the constraint is reduced, not just inside the station.",
      setup: "Same club, normal lie. Remove the finish gate but keep the lead-finish cue and one external marker (line in front of ball or downhill lie if available).",
      protocol: "6 balls full-routine, normal intent. Coach scores finish 0/1 and strike location without telling player the score until the cluster ends.",
      pass: "≥ 4/6 lead-side finishes AND strike cluster stays within 1 ball-width of the baseline target line.",
      fail: "Pattern collapses without the gate, or strike scatters — return to constrained station for one more block before adding speed.",
      use_result: "Pass → transfer the recenter drill to representative practice. Fail → install dose is not complete; another constrained block before retest."
    },

    // ---- face / path ----
    fp_corridor: {
      title: "Start-line / curve corridor",
      objective: "Separate face- and path-driven misses with cheap ball-flight evidence before drilling either.",
      setup: "Two alignment sticks creating a corridor (e.g. 10 yd wide at 50 yd). One club, one target. Hide TrackMan numbers if visible.",
      protocol: "10 balls with the intent to start the ball through the corridor. Note start side and curve direction on each.",
      pass: "≥ 7/10 start inside the corridor with a consistent curve shape.",
      fail: "Random exits or both-side exits — face / path is not the dominant cause today; test strike / low point or setup next.",
      use_result: "Pass → map the dominant exit to face or path and prescribe the matching corridor drill. Fail → no swing drill yet; rerun a strike map."
    },
    fp_trackman_face: {
      title: "TrackMan face / path cluster",
      objective: "Confirm a sustained face / path delivery deviation before prescribing a release or path drill.",
      setup: "TrackMan active, single club, no coaching cue. Player hits 10 balls full routine.",
      protocol: "Record face angle, club path, F2P, dynamic loft, impact location. Note SD per metric and the dominant outlier.",
      pass: "Face angle or F2P outside threshold on ≥ 7/10 balls in the same direction.",
      fail: "Metrics inside threshold or scattered — readiness or strike is upstream; do not prescribe a face / path drill yet.",
      use_result: "Pass → branch confirmed; prescribe the matching face- or path-control drill. Fail → rerun strike map or readiness check first."
    },
    fp_hackmotion_release: {
      title: "HackMotion release window",
      objective: "Confirm wrist / release timing is the cause of the face delivery deviation before prescribing release work.",
      setup: "HackMotion on lead wrist; one club, half-speed.",
      protocol: "5 baseline balls, then 5 balls with intent-cue (no swing change). Compare extension / flexion trace at P5 → P7.",
      pass: "Lead-wrist trace shows the predicted release pattern on ≥ 4/5 balls with matching ball-flight change.",
      fail: "Trace inconsistent or unchanged — release is not the lever today; test setup or face / path corridor instead.",
      use_result: "Pass → prescribe the lead-wrist release drill paired with the corridor proof. Fail → return to corridor or setup."
    },
    fp_curve_variation: {
      title: "Curve-control retest",
      objective: "Check that the face / path correction survives a curve-on-demand task, not just a corridor.",
      setup: "Same club. Call shape (straight, +5 yd, –5 yd) before each ball. No metrics on screen.",
      protocol: "9 balls, 3 each of straight / fade / draw, in random order called by coach.",
      pass: "≥ 6/9 match the called shape direction with playable contact.",
      fail: "Shape control collapses under random call — drill is not yet transferred; stay in corridor / cluster work.",
      use_result: "Pass → transfer drill to representative practice with random shape calls. Fail → return to corridor proof for one more block."
    },

    // ---- strike / low-point ----
    cl_strike_map: {
      title: "Strike map",
      objective: "Locate the contact pattern on the face before any directional or distance diagnosis.",
      setup: "Impact tape or face spray on the club; consistent setup, one club, one target.",
      protocol: "10 balls full routine. Mark contact location after every ball, then read the cluster.",
      pass: "≥ 7/10 within 10 mm of centre face.",
      fail: "Consistent off-centre cluster (heel / toe / high / low) OR random scatter across the face.",
      use_result: "Heel → length / lie / standing-too-close check. Toe → standing too far / lie. Low → AoA or tee height. High → upswing / tee high. Scatter → readiness gate."
    },
    cl_lowpoint_line: {
      title: "Low-point line",
      objective: "Confirm low point relative to the ball before prescribing a strike or low-point drill.",
      setup: "Chalk / spray line on the mat or turf at the front of the ball; one club, normal stance.",
      protocol: "10 balls. Mark the divot / brush location relative to the line each shot.",
      pass: "≥ 7/10 divots / brushes start at or ahead of the line.",
      fail: "Divots / brushes consistently behind the line, or scattered.",
      use_result: "Behind line → low-point-back; prescribe forward shaft-lean or recenter drill. Ahead-and-scattered → strike chaos; rerun strike map."
    },
    cl_strike_transfer: {
      title: "Strike transfer at moderate speed",
      objective: "Check whether the improved strike pattern holds when speed rises.",
      setup: "Same club, impact tape refreshed. Bump intent from 75 % to 90 %.",
      protocol: "6 balls at the higher intent, normal routine.",
      pass: "≥ 4/6 within 10 mm of centre face at the higher intent.",
      fail: "Strike scatters back to baseline — speed is past the current ceiling; stay at lower intent.",
      use_result: "Pass → progress dose at moderate speed. Fail → cap speed; another block of constrained work before higher intent."
    },

    // ---- setup ----
    setup_ab: {
      title: "Setup A-B",
      objective: "Rule out a single setup variable (ball position / stance width / tee height / posture) before drilling motion.",
      setup: "Same shot, same lie, same target. Change exactly one setup variable.",
      protocol: "5 baseline balls, 5 balls with the change. Compare strike, start line, and contact.",
      pass: "Ball flight or strike pattern meaningfully improves with the single change.",
      fail: "No meaningful change — setup is not the cause.",
      use_result: "Pass → fix the setup variable; do not drill the swing. Fail → swing or equipment cause more likely."
    },
    setup_transfer: {
      title: "Setup transfer to routine",
      objective: "Confirm the corrected setup variable survives a normal pre-shot routine, not just a static check.",
      setup: "Same club, same target. Player runs full routine each ball.",
      protocol: "6 balls full routine with the corrected setup. Coach scores setup quality 0/1 before swing starts.",
      pass: "≥ 5/6 routines arrive at the correct setup AND ball flight matches the A-B result.",
      fail: "Setup drifts under routine — drill the setup check inside the routine before any swing work.",
      use_result: "Pass → setup is the install; build the session around the routine. Fail → routine is the bottleneck, not motion."
    },
    setup_variation: {
      title: "Setup retest under variation",
      objective: "Check that the setup correction holds across clubs / lies / targets, not just the baseline shot.",
      setup: "Switch club or lie or target. Keep the setup correction.",
      protocol: "6 balls across the varied condition.",
      pass: "≥ 4/6 hold the corrected setup AND ball-flight pattern.",
      fail: "Pattern collapses under variation — stay in the baseline condition for one more block.",
      use_result: "Pass → transfer to representative practice. Fail → more dose at baseline before transfer."
    },

    // ---- equipment ----
    eq_ab: {
      title: "Equipment A-B",
      objective: "Confirm equipment is the cause before any swing prescription.",
      setup: "Current club vs adjusted / alternative (lie / shaft / loft / length / bounce). Same ball, same target, same intent.",
      protocol: "10 balls current, 10 balls changed. Compare strike location and ball flight cluster.",
      pass: "Strike or flight meaningfully improves with the equipment change alone.",
      fail: "No meaningful change — equipment is not the cause.",
      use_result: "Pass → flag for fitting referral; do not prescribe swing drills until equipment is corrected. Fail → proceed with swing diagnostic."
    },
    eq_strike_compare: {
      title: "Strike-pattern compare",
      objective: "Verify the equipment change moves the strike cluster, not just one shot.",
      setup: "Impact tape on both clubs / configurations.",
      protocol: "5 balls each, same routine. Photograph or transcribe the tape cluster.",
      pass: "Cluster centre shifts in the predicted direction on the changed equipment.",
      fail: "Cluster centre unchanged or scattered.",
      use_result: "Pass → equipment lever confirmed; fitting referral. Fail → run swing strike map next."
    },
    eq_transfer: {
      title: "Equipment transfer to target",
      objective: "Check the equipment-derived improvement transfers to a normal target / routine, not just a fitting bay.",
      setup: "Same target as the player's normal practice, full routine.",
      protocol: "6 balls with the changed equipment.",
      pass: "≥ 4/6 hold the improved strike / flight pattern.",
      fail: "Pattern degrades under routine — fitting variable insufficient or another cause is active.",
      use_result: "Pass → fitting referral and routine practice. Fail → rerun branch diagnosis."
    },

    // ---- putting ----
    pt_gate: {
      title: "Start-line gate",
      objective: "Isolate face vs path vs aim as the start-line driver before any other putting work.",
      setup: "Two tee gates two inches in front of the ball, slightly wider than the putter head. 6-foot flat putt.",
      protocol: "20 putts. Count clean exits.",
      pass: "≥ 16/20 exit cleanly.",
      fail: "Consistent miss to one side OR alternating misses.",
      use_result: "Consistent left → face open; consistent right → face closed; alternating → aim / path. Confirm before green-reading work."
    },
    pt_face_aim: {
      title: "Face-aim alignment check",
      objective: "Separate aim error from stroke error before any stroke change.",
      setup: "Aim mirror or laser; same 6-foot putt. Player addresses ball, then steps back.",
      protocol: "10 addresses. Coach records putter-face aim vs intended line each time.",
      pass: "Aim within ±1° of intended line on ≥ 8/10 addresses.",
      fail: "Aim drifts consistently to one side or scatters.",
      use_result: "Pass → aim is reliable; stroke / face delivery is the lever. Fail → aim training before any stroke change."
    },
    pt_distance_ladder: {
      title: "Distance ladder",
      objective: "Confirm whether distance chaos is system absence or stroke fault.",
      setup: "Markers at 10 / 20 / 30 / 40 ft on flat green.",
      protocol: "5 putts to each distance. Record carry average and SD.",
      pass: "SD < 2 ft per station.",
      fail: "SD ≥ 3 ft OR missing a distance category consistently.",
      use_result: "Distance gap → no distance system; install one before stroke work. Tight SD with bias → tempo / contact retest."
    },
    pt_distance_retest: {
      title: "Distance retest after start-line proof",
      objective: "Check that distance control holds once start-line is reliable.",
      setup: "Same green. 10 / 20 / 30 ft markers.",
      protocol: "3 putts to each distance with the corrected face / aim.",
      pass: "All 9 putts finish within 3 ft of the hole regardless of make / miss.",
      fail: "Distance scatters once start-line is repaired — distance system is the next lever.",
      use_result: "Pass → start-line was the dominant cause. Fail → add a distance-ladder install next."
    },
    pt_tempo_map: {
      title: "Tempo / stroke-length map",
      objective: "Confirm tempo or stroke length is the distance-control variable before stroke rebuild.",
      setup: "Metronome or stroke-length reference (tee at backstroke length).",
      protocol: "10 putts at each of two stroke lengths. Compare carry SD.",
      pass: "SD < 2 ft at each stroke length AND mean carry separates cleanly between the two.",
      fail: "SD high at either length OR means overlap.",
      use_result: "Pass → tempo / length is reliable; speed control sits on top. Fail → stroke variance is the cause; install before pressure work."
    },
    pt_pressure_retest: {
      title: "Pressure retest",
      objective: "Check whether the distance pattern holds under light consequence.",
      setup: "Same green, but coach scores out loud or peer present.",
      protocol: "9 putts with consequence on, distances called at random.",
      pass: "≥ 6/9 finish within 3 ft of hole.",
      fail: "Pattern collapses under consequence — pressure is the cause, not stroke.",
      use_result: "Pass → distance system survives pressure. Fail → routine / pressure protocol before more stroke work."
    },
    pt_aim_check: {
      title: "Aim check",
      objective: "Confirm read / aim quality before stroke or speed work.",
      setup: "String line on a 6-foot breaking putt. Player picks aim, then string is dropped.",
      protocol: "10 reads. Coach records error in inches per read.",
      pass: "Average aim error < 2 inches over 10 reads.",
      fail: "Aim error ≥ 3 inches or inconsistent.",
      use_result: "Pass → aim is reliable; stroke is the lever. Fail → aim training before stroke change."
    },
    pt_break_read: {
      title: "Break-read transfer",
      objective: "Test read quality on multiple breaks before drilling stroke or speed.",
      setup: "Three different break putts (R-to-L, L-to-R, straight uphill).",
      protocol: "3 reads per putt. Compare to coach-marked optimal line.",
      pass: "≥ 7/9 reads within one cup of optimal line.",
      fail: "Reads scatter or consistently miss one direction.",
      use_result: "Pass → read is reliable; speed is the next lever. Fail → green-reading work before stroke or speed change."
    },

    // ---- short game / bunker ----
    sg_entry_line: {
      title: "Entry-point line",
      objective: "Confirm club entry relative to the ball before any contact prescription.",
      setup: "Chalk line at the ball, normal chip / pitch lie.",
      protocol: "10 chips. Mark each entry relative to the line.",
      pass: "≥ 7/10 entries within 1 inch ahead of the line (ball-first contact).",
      fail: "Entries behind the line (heavy) or scattered.",
      use_result: "Behind line → entry is the cause; install entry drill. Scattered → contact chaos; readiness or setup gate."
    },
    sg_landing_window: {
      title: "Landing window",
      objective: "Validate distance / trajectory system before stroke change.",
      setup: "Mark a landing window on the green at the correct zone for run-out.",
      protocol: "20 chips to the window.",
      pass: "≥ 14/20 land inside the window.",
      fail: "Consistent short / long / scatter.",
      use_result: "Pass → distance system is in place; refine entry. Fail → install a landing-window system before stroke work."
    },
    sg_lie_variation: {
      title: "Lie / variation retest",
      objective: "Confirm the chip / pitch pattern holds across lies, not just the baseline lie.",
      setup: "Three lies (fairway, fringe, light rough).",
      protocol: "5 chips per lie to the landing window.",
      pass: "≥ 10/15 land inside the window across the three lies.",
      fail: "Pattern collapses on one lie.",
      use_result: "Pass → transfer to representative practice. Fail → install lie-specific dose before transfer."
    },
    bn_entry_line: {
      title: "Bunker entry-point line",
      objective: "Confirm sand entry pattern before bunker technique prescription.",
      setup: "Greenside bunker, normal sand depth. Player marks a spot 2 inches behind the ball.",
      protocol: "10 bunker shots; coach notes entry relative to the mark.",
      pass: "Entry within 1 inch of the mark on ≥ 7/10.",
      fail: "Consistent dig (too steep), blade (too shallow), OR inconsistent entry.",
      use_result: "Dig → steeper angle / face less open. Blade → too shallow / face needs opening. Inconsistent → no system; install entry before face / bounce work."
    },
    bn_landing_window: {
      title: "Bunker landing window",
      objective: "Validate distance / trajectory once entry is reliable.",
      setup: "Mark a landing window on the green from the bunker.",
      protocol: "15 bunker shots to the window.",
      pass: "≥ 10/15 land in the window.",
      fail: "Consistent short / long / scatter.",
      use_result: "Pass → bunker system is in place. Fail → install distance / landing system before face or bounce change."
    },
    bn_lie_variation: {
      title: "Sand-lie variation retest",
      objective: "Confirm the entry / landing pattern holds across wet / dry / firmness.",
      setup: "Two different sand conditions (e.g. raked vs footprint, wet vs dry).",
      protocol: "5 shots per condition to the landing window.",
      pass: "≥ 7/10 land in the window across conditions.",
      fail: "Pattern collapses on one condition.",
      use_result: "Pass → transfer to course bunkers. Fail → install condition-specific dose."
    },

    // ---- speed / readiness ----
    sp_readiness_baseline: {
      title: "Speed-readiness baseline",
      objective: "Confirm the player is recovered enough to absorb a speed stimulus today.",
      setup: "Player's baseline club speed known. Standard warm-up only.",
      protocol: "5 swings at max effort; compare to baseline.",
      pass: "Within 3 % of baseline.",
      fail: "More than 5 % below baseline — yellow / red gate.",
      use_result: "Pass → speed work can proceed. Fail → no overspeed or max-intent; redirect to maintenance or short game."
    },
    sp_ball_transfer: {
      title: "Ball-transfer speed proof",
      objective: "Confirm speed-stick / Mach 3 work transfers to ball, not just air swings.",
      setup: "Same club, ball on tee.",
      protocol: "5 ball swings after a short overspeed block. Capture club-head speed and smash factor.",
      pass: "Club-head speed within 2 mph of overspeed block AND smash factor ≥ 1.42 (driver) / ≥ 1.30 (iron).",
      fail: "Speed drops with ball or smash factor unsafe.",
      use_result: "Pass → overspeed dose is transferring. Fail → cut dose or extend acquisition phase."
    },
    sp_variation_retest: {
      title: "Speed retest at target",
      objective: "Check that the added speed survives a normal routine to a real target.",
      setup: "Same club, real target.",
      protocol: "6 balls full routine.",
      pass: "≥ 4/6 within 2 mph of the speed block AND in playable dispersion.",
      fail: "Speed drops or dispersion blows out.",
      use_result: "Pass → transfer the speed gain to representative practice. Fail → another acquisition block before transfer."
    },
    rd_pain_gate: {
      title: "Pain / readiness gate",
      objective: "Decide whether today supports new motor work, modified work, or rest.",
      setup: "Self-report pain 0-10; warm-up speed vs baseline; coordination cue.",
      protocol: "Standard warm-up, then 3 controlled swings. Compare speed, contact, pain.",
      pass: "Pain ≤ 2/10 stable, warm-up speed within 3 % of baseline, coordination green.",
      fail: "Pain > 2/10 or worsening, OR warm-up speed > 5 % below baseline.",
      use_result: "Pass → planned dose is safe. Fail → modify or stop; do not run a new acquisition block."
    },
    rd_modified_warmup: {
      title: "Modified-warmup retest",
      objective: "Check whether a modified warm-up clears the readiness gate to maintenance-only work.",
      setup: "Modified warm-up (range of motion, lighter band, slower tempo).",
      protocol: "3 controlled swings, half speed.",
      pass: "Pain ≤ 2/10 stable AND coordination green.",
      fail: "Pain returns or coordination breaks.",
      use_result: "Pass → maintenance-only session can run. Fail → stop / refer; no swing work today."
    },
    rd_low_intent_retest: {
      title: "Low-intent retest",
      objective: "Confirm a low-intent / putting / short-game session is safe today.",
      setup: "Putter or wedge only, no full swings.",
      protocol: "6 low-intent reps; coach checks pain and coordination after each.",
      pass: "Pain ≤ 2/10 stable across all 6.",
      fail: "Pain rises across reps.",
      use_result: "Pass → low-intent practice can proceed. Fail → stop / refer."
    },

    // ---- course / strategy ----
    cd_decision_audit: {
      title: "Course decision audit",
      objective: "Separate decision errors from execution errors before assigning swing work.",
      setup: "Scorecard + shot notes from a recent round (9 or 18 holes).",
      protocol: "Score each tee shot / approach 1-5 (5 = optimal miss-management).",
      pass: "Average decision score ≥ 3.5; no penalty strokes from aggressive / ego decisions.",
      fail: "Average < 3 OR ≥ 2 penalty strokes from decision errors.",
      use_result: "Pass → execution is the lever; proceed with swing diagnosis. Fail → course-management work, not swing work, is the priority."
    },
    cd_routine_proof: {
      title: "Routine quality proof",
      objective: "Check whether routine quality on course matches range routine.",
      setup: "On-course or simulated 3-hole stretch.",
      protocol: "Coach scores routine 0/1 per shot.",
      pass: "≥ 8/10 shots with full routine.",
      fail: "Routine breaks under consequence.",
      use_result: "Pass → routine survives consequence. Fail → routine install before more mechanics."
    },
    cd_random_transfer: {
      title: "Random-target transfer",
      objective: "Confirm the swing improvement transfers to random targets, not just block practice.",
      setup: "Range, random targets and clubs called by coach.",
      protocol: "9 balls, different club / target each ball.",
      pass: "≥ 6/9 land in playable dispersion at the called target.",
      fail: "Dispersion blows out under random call.",
      use_result: "Pass → transfer to representative practice. Fail → more random-block work before course test."
    },

    // ---- pressure / attention (only when intent is pressure_attention) ----
    ps_threat_screen: {
      title: "Threat / outcome-focus screen",
      objective: "Decide whether threat, screen visibility, or outcome focus is the active cause before any mechanical prescription.",
      setup: "Two conditions: low-threat (no score, no screen) and light-consequence (score called, or peer present).",
      protocol: "5 balls each condition. Compare tempo, routine, and pattern.",
      pass: "Pattern worsens predictably in the light-consequence condition AND improves in the low-threat condition.",
      fail: "Pattern similar in both conditions — threat is not the variable.",
      use_result: "Pass → routine / pressure protocol; do not add a new swing cue. Fail → fault is technical; cross-check strike or face / path."
    },
    ps_routine_reset: {
      title: "Routine + reset proof",
      objective: "Check whether a single external task / reset cue stabilises the pattern under threat.",
      setup: "One external task cue + one reset (breath / target glance). Light-consequence condition stays on.",
      protocol: "5 balls with the routine + reset, full procedure.",
      pass: "Pattern returns to baseline under light consequence.",
      fail: "Pattern still degrades.",
      use_result: "Pass → routine + reset is the install. Fail → progress to a graded pressure protocol; do not add mechanics."
    },
    ps_consequence_retest: {
      title: "Light-consequence retest",
      objective: "Verify the routine survives slightly heavier consequence before exposing to real play.",
      setup: "Score game / putt for cash / peer present.",
      protocol: "6 balls or 6 putts with consequence at the next graded level.",
      pass: "Pattern holds within baseline dispersion.",
      fail: "Pattern collapses.",
      use_result: "Pass → ready for representative practice. Fail → return to lower consequence for one more block."
    }
  };

  function _buildProofCard(profileKey, fid, branch, index, title) {
    const p = FF_PROOF_PROFILES[profileKey];
    if (!p) return null;
    const displayTitle = title && title.trim() ? title : p.title;
    return {
      test_id: fid + ":" + branch.id + ":T" + (index + 1),
      title: displayTitle,
      profile_key: profileKey,
      objective: p.objective,
      setup: p.setup,
      protocol: p.protocol,
      pass_criteria: p.pass,
      fail_action: p.fail,
      use_result: p.use_result,
      do_not_overinterpret: branch.avoid,
      source_tags: Array.from(new Set([
        ...((branch.source_tags) || []),
        "FM-300 diagnostic proof",
        "branch_intent_routed",
        "review_required"
      ]))
    };
  }

  function _proofPlanForBranch(fid, branch) {
    const intentId = branch?.branch_intent?.id;
    if (intentId && FF_PROOF_INTENT_PLAN[intentId]) return FF_PROOF_INTENT_PLAN[intentId];
    const fam = FF_PROOF_FAMILY_FROM_FID(fid);
    if (FF_PROOF_FAMILY_PLAN[fam]) return FF_PROOF_FAMILY_PLAN[fam];
    return FF_PROOF_FAMILY_PLAN.full_swing;
  }

  function diagnosticTestCardsForBranch(fid, branch) {
    if (!branch) return [];
    const plan = _proofPlanForBranch(fid, branch);
    const titles = (branch.tests || []).slice(0, 3);
    const cards = plan.slice(0, 3).map((profileKey, i) =>
      _buildProofCard(profileKey, fid, branch, i, titles[i])
    ).filter(Boolean);
    if (cards.length) return cards;
    // Last-resort fallback to the legacy keyword-matched cards.
    const key = fid + ":" + branch.id;
    return window.FF_DIAGNOSTIC_TEST_CARDS?.[key] || [];
  }

  // Expose for headless validation.
  window.FF_PROOF_INTENT_PLAN = FF_PROOF_INTENT_PLAN;
  window.FF_PROOF_FAMILY_PLAN = FF_PROOF_FAMILY_PLAN;
  window.FF_PROOF_PROFILES = FF_PROOF_PROFILES;
  window.diagnosticTestCardsForBranch = diagnosticTestCardsForBranch;

  function selectedDiagnosticTestCards(ids = FF.state.faults) {
    return selectedDiagnosticBranches(ids).flatMap(x =>
      diagnosticTestCardsForBranch(x.fault_id, x.branch).map(card => ({
        ...card,
        fault_id: x.fault_id,
        fault: x.fault,
        branch_id: x.branch.id,
        branch_label: x.branch.label
      }))
    );
  }

  /* -----------------------------------------------------------------
     Diagnostic-branch deepening helpers (technology signs, false-positives,
     session implication, gate copy). Surfaced via collapsible <details>
     blocks so the existing diagnostic card stays compact.
  ----------------------------------------------------------------- */
  function diagBranchEvidenceBadge(br) {
    if (!br) return "";
    const flag = br.evidence_flag;
    if (!flag) return "";
    const label = ({
      evidence_supported: " · evidence",
      expert_framework: " · expert",
      ikb_supported: " · IKB",
      db_confirmed: " · DB",
      review_required: " · review"
    })[flag] || "";
    return label;
  }

  function techSignTitle(key) {
    const sign = window.FF_TECHNOLOGY_SIGNS?.[key];
    return sign?.label || key;
  }

  function renderDiagBranchDeepening(br, fid) {
    if (!br) return null;
    const techKeys = Object.keys(br.technology_signs || {});
    const proofIds = br.proof_test_ids || [];
    const fps = br.false_positives || [];
    const impl = br.session_implication;
    const reds = br.red_gate_checks || [];
    const yellows = br.yellow_gate_checks || [];
    if (!techKeys.length && !proofIds.length && !fps.length && !impl && !reds.length && !yellows.length && !br.why_this_branch && !br.do_not_assume) return null;

    const wrap = h("div", { class: "diag-deepening" });

    // Branch-intent reviewer block — surfaced above the existing summary row.
    if (br.branch_intent || br.why_this_branch || br.do_not_assume) {
      const intentBlock = h("div", { class: "diag-intent-block" });
      if (br.branch_intent) {
        intentBlock.appendChild(h("div", { class: "diag-intent-row" }, [
          h("span", { class: "diag-intent-label" }, "Branch intent"),
          h("span", { class: "diag-intent-value" }, br.branch_intent.label + " · lane: " + br.branch_intent.lane + (br.branch_intent.override ? " · authored override" : " · inferred"))
        ]));
      }
      if (br.why_this_branch) {
        intentBlock.appendChild(h("div", { class: "diag-intent-row" }, [
          h("span", { class: "diag-intent-label" }, "Why this branch"),
          h("span", { class: "diag-intent-value" }, br.why_this_branch)
        ]));
      }
      if (br.do_not_assume) {
        intentBlock.appendChild(h("div", { class: "diag-intent-row warn" }, [
          h("span", { class: "diag-intent-label" }, "Do not assume"),
          h("span", { class: "diag-intent-value" }, br.do_not_assume)
        ]));
      }
      wrap.appendChild(intentBlock);
    }

    // Single compact summary row (always visible) — small, low-clutter.
    const summary = [];
    if (proofIds.length) summary.push(proofIds.join(" → "));
    if (techKeys.length) summary.push(techKeys.length + " tech sign" + (techKeys.length === 1 ? "" : "s"));
    if (fps.length) summary.push(fps.length + " false-pos risk" + (fps.length === 1 ? "" : "s"));
    if (summary.length) wrap.appendChild(h("div", { class: "diag-deep-summary" }, summary.join(" · ")));

    // Collapsible details (closed by default).
    if (techKeys.length) {
      const det = h("details", { class: "diag-det" });
      det.appendChild(h("summary", {}, "Technology signs (" + techKeys.length + ")"));
      const list = h("div", { class: "diag-det-body" });
      techKeys.forEach(k => {
        const sign = br.technology_signs[k];
        if (!sign) return;
        const row = h("div", { class: "diag-tech-row" });
        row.appendChild(h("strong", {}, sign.label || k));
        if (sign.can_prove) row.appendChild(h("div", { class: "tech-line" }, [h("em", {}, "can prove: "), txt(sign.can_prove)]));
        if (sign.cannot_prove) row.appendChild(h("div", { class: "tech-line" }, [h("em", {}, "cannot prove: "), txt(sign.cannot_prove)]));
        if (sign.misuse_risk) row.appendChild(h("div", { class: "tech-line muted" }, [h("em", {}, "misuse risk: "), txt(sign.misuse_risk)]));
        list.appendChild(row);
      });
      det.appendChild(list);
      wrap.appendChild(det);
    }

    if (fps.length) {
      const det = h("details", { class: "diag-det" });
      det.appendChild(h("summary", {}, "False-positive risks (" + fps.length + ")"));
      const list = h("ul", { class: "diag-det-list" });
      fps.forEach(fp => {
        list.appendChild(h("li", {}, [
          h("strong", {}, "Masquerades as: "),
          txt(fp.masquerades_as || ""),
          h("br", {}),
          h("em", {}, "Rule out first: "),
          txt(fp.rule_out_first || "")
        ]));
      });
      det.appendChild(list);
      wrap.appendChild(det);
    }

    if (impl) {
      const det = h("details", { class: "diag-det" });
      det.appendChild(h("summary", {}, "Session implication · " + (impl.lane_label || impl.lane_key || "lane")));
      const body = h("div", { class: "diag-det-body" });
      if (impl.session_note) body.appendChild(h("div", { class: "tech-line" }, impl.session_note));
      const facts = [];
      if (impl.motor_learning_phase) facts.push("phase: " + impl.motor_learning_phase);
      if (impl.cue_type) facts.push("cue: " + impl.cue_type);
      if (impl.max_rlu_per_day != null) facts.push("RLU/day: " + impl.max_rlu_per_day);
      if (impl.feedback_schedule) facts.push("feedback: " + impl.feedback_schedule);
      if (impl.sleep_required) facts.push("sleep before next session: required");
      if (impl.contamination_window_hours) facts.push("contamination window: " + impl.contamination_window_hours + "h");
      if (facts.length) body.appendChild(h("div", { class: "tech-line muted" }, facts.join(" · ")));
      if (impl.pressure_unlock_rule) body.appendChild(h("div", { class: "tech-line" }, [h("em", {}, "pressure unlock: "), txt(impl.pressure_unlock_rule)]));
      if (impl.block_order?.length) body.appendChild(h("div", { class: "tech-line muted" }, "block order: " + impl.block_order.join(" → ")));
      det.appendChild(body);
      wrap.appendChild(det);
    }

    if (reds.length || yellows.length) {
      const det = h("details", { class: "diag-det" });
      det.appendChild(h("summary", {}, "Gate checks (" + (reds.length + yellows.length) + ")"));
      const body = h("div", { class: "diag-det-body" });
      const gates = window.FF_GATES_RICH || {};
      const renderGate = (key, severity) => {
        const g = gates[key];
        if (!g) return null;
        return h("div", { class: "gate-row gate-" + severity }, [
          h("strong", {}, (severity === "red" ? "🔴 " : "🟡 ") + g.label),
          h("div", { class: "tech-line" }, g.gate_copy_short || ""),
          h("div", { class: "tech-line muted" }, g.session_implication || "")
        ]);
      };
      reds.forEach(k => { const r = renderGate(k, "red"); if (r) body.appendChild(r); });
      yellows.forEach(k => { const r = renderGate(k, "yellow"); if (r) body.appendChild(r); });
      det.appendChild(body);
      wrap.appendChild(det);
    }

    return wrap;
  }

  function renderDiagnosticTestDeck(fid, branch) {
    const cards = diagnosticTestCardsForBranch(fid, branch);
    const deck = h("div", { class: "diagnostic-test-deck" });
    deck.appendChild(h("div", { class: "test-deck-head" }, [
      h("span", { class: "section-tag" }, "proof layer"),
      h("strong", {}, "Diagnostic test cards for " + branch.label),
      h("span", { class: "small-note" }, "Run one before drill prescription")
    ]));

    // Proof-test archetype chips (PC-IDs) — collapsible details with full Setup/Protocol/Pass/Fail/Use.
    const pcIds = branch.proof_test_ids || [];
    const archetypes = window.FF_PROOF_TEST_ARCHETYPES || {};
    if (pcIds.length) {
      const det = h("details", { class: "diag-det pc-archetypes" });
      det.appendChild(h("summary", {}, "Proof-test archetypes · " + pcIds.join(" → ") + " (cheapest first)"));
      const body = h("div", { class: "diag-det-body" });
      pcIds.forEach(id => {
        const pc = archetypes[id];
        if (!pc) return;
        const card = h("div", { class: "pc-archetype-row" });
        card.appendChild(h("div", { class: "pc-row-head" }, [
          h("span", { class: "pill" }, id),
          h("strong", {}, pc.title)
        ]));
        if (pc.objective) card.appendChild(h("div", { class: "tech-line" }, pc.objective));
        card.appendChild(h("dl", { class: "pc-dl" }, [
          h("dt", {}, "Setup"), h("dd", {}, pc.setup || ""),
          h("dt", {}, "Protocol"), h("dd", {}, pc.protocol || ""),
          h("dt", {}, "Pass"), h("dd", {}, pc.pass_criteria || ""),
          h("dt", {}, "Fail"), h("dd", {}, pc.fail_action || ""),
          h("dt", {}, "Use"), h("dd", {}, pc.use_result || "")
        ]));
        body.appendChild(card);
      });
      det.appendChild(body);
      deck.appendChild(det);
    }

    const grid = h("div", { class: "test-card-grid" });
    cards.forEach(card => {
      grid.appendChild(h("article", { class: "test-card" }, [
        h("div", { class: "test-card-top" }, [
          h("span", { class: "pill" }, card.test_id.split(":").pop()),
          h("h4", {}, card.title)
        ]),
        h("p", {}, card.objective),
        h("dl", {}, [
          h("dt", {}, "Setup"),
          h("dd", {}, card.setup),
          h("dt", {}, "Protocol"),
          h("dd", {}, card.protocol),
          h("dt", {}, "Pass"),
          h("dd", {}, card.pass_criteria),
          h("dt", {}, "If failed"),
          h("dd", {}, card.fail_action)
        ]),
        h("div", { class: "test-foot" }, card.use_result)
      ]));
    });
    deck.appendChild(grid);
    return deck;
  }

  function selectedFaultRefs(ids = FF.state.faults) {
    const refs = new Set();
    const branchRefs = new Set();
    const categories = new Set();
    const branchCategories = new Set();
    const lanes = new Set();
    const branchLanes = new Set();
    ids.forEach(fid => {
      refs.add(fid.toLowerCase());
      const stripped = fid.replace("FAULT-", "").toLowerCase();
      if (stripped.length >= 5) refs.add(stripped);
      const fault = FF_FAULTS.find(f => f.id === fid);
      (fault?.causes || []).forEach(c => refs.add(String(c).toLowerCase()));
      const map = window.FF_FAULT_DRILL_MAP?.[fid];
      (map?.refs || []).forEach(r => refs.add(String(r).toLowerCase()));
      (map?.categories || []).forEach(c => categories.add(c));
      (map?.lanes || []).forEach(l => lanes.add(l));
      const branch = selectedBranchForFault(fid);
      (branch?.refs || []).forEach(r => branchRefs.add(String(r).toLowerCase()));
      (branch?.categories || []).forEach(c => branchCategories.add(c));
      (branch?.lanes || []).forEach(l => branchLanes.add(l));
    });
    return {
      refs: [...refs].filter(Boolean),
      branchRefs: [...branchRefs].filter(Boolean),
      categories: [...categories],
      branchCategories: [...branchCategories],
      lanes: [...lanes],
      branchLanes: [...branchLanes]
    };
  }

  /* -----------------------------------------------------------------
     ALIGNMENT HELPERS — wraps window.FF_ALIGNMENT for the wizard.
     ----------------------------------------------------------------- */
  function currentBranchIntents() {
    const ids = FF.state.faults || [];
    const out = [];
    ids.forEach(fid => {
      const br = selectedBranchForFault(fid);
      const id = br?.branch_intent?.id;
      if (id && !out.includes(id)) out.push(id);
    });
    return out;
  }
  function currentDominantIntent() {
    if (!window.FF_ALIGNMENT) return null;
    return window.FF_ALIGNMENT.dominantIntent(currentBranchIntents());
  }
  function evaluateDrillAlignment(d) {
    if (!window.FF_ALIGNMENT) {
      return { allowed: true, primary_allowed: true, carryover_allowed: true,
               reasons_allowed: [], reasons_blocked: [], do_not_use_if: [] };
    }
    const intents = currentBranchIntents();
    if (!intents.length) {
      return { allowed: true, primary_allowed: true, carryover_allowed: true,
               reasons_allowed: [], reasons_blocked: [], do_not_use_if: [] };
    }
    // Drill must be allowed under AT LEAST ONE active intent.
    // Conversely, if ANY active intent hard-blocks it, block.
    const evals = intents.map(id =>
      window.FF_ALIGNMENT.evaluateDrillForIntent(d, id, FF.state.gates)
    );
    const anyAllowed = evals.some(e => e.allowed);
    const anyPrimary = evals.some(e => e.primary_allowed);
    const anyCarry   = evals.some(e => e.carryover_allowed);
    const reasons_allowed = [];
    const reasons_blocked = [];
    const do_not_use_if = [];
    evals.forEach((e, idx) => {
      const id = intents[idx];
      e.reasons_allowed.forEach(r => reasons_allowed.push("[" + id + "] " + r));
      e.reasons_blocked.forEach(r => reasons_blocked.push("[" + id + "] " + r));
      e.do_not_use_if.forEach(r => { if (!do_not_use_if.includes(r)) do_not_use_if.push(r); });
    });
    return {
      allowed: anyAllowed,
      primary_allowed: anyPrimary,
      carryover_allowed: anyCarry && !anyPrimary,
      reasons_allowed,
      reasons_blocked,
      do_not_use_if,
      intents
    };
  }
  window.FF_currentBranchIntents = currentBranchIntents;
  window.FF_evaluateDrillAlignment = evaluateDrillAlignment;
  window.FF_currentDominantIntent  = currentDominantIntent;

  function drillHaystack(d) {
    return [
      d.drill_id, d.name, d.category, d.cause_lane, d.practice_block, d.learning_stage,
      d.description, d.when_why, d.active_cue, d.constraint_alternative, d.feedback_schedule,
      d.proof_metric, ...(d.solves || []), ...(d.source_tags || []), ...(d.trackman_modes || [])
    ].join(" ").toLowerCase();
  }

  function drillBridgeMatch(d, refs = selectedFaultRefs()) {
    const hay = drillHaystack(d);
    return refs.refs.some(ref => hay.includes(ref)) ||
      refs.branchRefs.some(ref => hay.includes(ref)) ||
      refs.categories.includes(d.category) ||
      refs.branchCategories.includes(d.category) ||
      refs.lanes.includes(d.cause_lane) ||
      refs.branchLanes.includes(d.cause_lane);
  }

  function drillReferenceReason(d) {
    const ids = FF.state.faults || [];
    if (!ids.length) return "";
    const parts = [];
    ids.forEach(fid => {
      const direct = d.solves?.includes(fid);
      const map = window.FF_FAULT_DRILL_MAP?.[fid] || {};
      const branch = selectedBranchForFault(fid);
      const hay = drillHaystack(d);
      const refHits = (map.refs || []).filter(r => hay.includes(String(r).toLowerCase())).slice(0, 4);
      const branchHits = (branch?.refs || []).filter(r => hay.includes(String(r).toLowerCase())).slice(0, 4);
      const catHit = (map.categories || []).includes(d.category);
      const branchCatHit = (branch?.categories || []).includes(d.category);
      const laneHit = (map.lanes || []).includes(d.cause_lane);
      const branchLaneHit = (branch?.lanes || []).includes(d.cause_lane);
      if (direct || refHits.length || branchHits.length || catHit || branchCatHit || laneHit || branchLaneHit) {
        const why = [];
        if (direct) why.push("exact fault tag");
        if (branch) why.push("branch: " + branch.label);
        if (branchHits.length) why.push("branch refs: " + branchHits.join(", "));
        if (refHits.length) why.push("bridge refs: " + refHits.join(", "));
        if (branchCatHit || catHit) why.push("family: " + d.category.replace(/_/g, " "));
        if (branchLaneHit || laneHit) why.push("lane: " + d.cause_lane);
        parts.push(faultLabel(fid) + " → " + why.join("; "));
      }
    });
    return parts.join(" | ");
  }

  /* =============================================================================
     SESSION VIEW
     ============================================================================= */
  function renderSession() {
    const root = $("#session-root");
    root.innerHTML = "";
    const s = FF.state;
    if (!s.sessionPlan) {
      root.appendChild(h("div", { class: "panel" }, [
        h("h2", {}, "No session built yet"),
        h("p", {}, "Open the Coach Wizard, walk through the eight steps, and tap 'Build session →' to land here."),
        h("button", { class: "btn", onclick: () => switchView("wizard") }, "Open Coach Wizard")
      ]));
      return;
    }
    const plan = s.sessionPlan;

    // Quick edit panel
    const editPanel = h("div", { class: "panel" });
    editPanel.appendChild(panelHead("Session Builder · quick edit", "CB-2"));
    editPanel.appendChild(h("p", { style: "font-size: 13px;" },
      "Adjust duration, context, horizon, or goal. The plan re-balances by GP-L stage and separates coach-led diagnosis from solo ownership work."));
    const grid = h("div", { class: "row-grid three" });

    const fdur = h("div", { class: "field" });
    fdur.appendChild(h("label", {}, "Duration"));
    const dsel = h("select", { onchange: e => { s.duration = +e.target.value; s.sessionPlan = buildSessionPlan(); renderSession(); } },
      FF_DURATIONS.map(d => {
        const opt = h("option", { value: d }, d + " min");
        if (s.duration === d) opt.selected = true;
        return opt;
      }));
    fdur.appendChild(dsel);
    grid.appendChild(fdur);

    const fgpl = h("div", { class: "field" });
    fgpl.appendChild(h("label", {}, "GP-L stage"));
    const gsel = h("select", { onchange: e => { s.gpl = +e.target.value; s.sessionPlan = buildSessionPlan(); renderSession(); } },
      FF_GPL.map(g => {
        const opt = h("option", { value: g.id }, "GP-L" + g.id);
        if (s.gpl === g.id) opt.selected = true;
        return opt;
      }));
    fgpl.appendChild(gsel);
    grid.appendChild(fgpl);

    const fgoal = h("div", { class: "field" });
    fgoal.appendChild(h("label", {}, "Goal"));
    const golsel = h("select", { onchange: e => { s.goal = e.target.value || null; s.sessionPlan = buildSessionPlan(); renderSession(); } });
    golsel.appendChild(h("option", { value: "" }, "—"));
    FF_GOALS.forEach(g => {
      const opt = h("option", { value: g.id }, g.id);
      if (s.goal === g.id) opt.selected = true;
      golsel.appendChild(opt);
    });
    fgoal.appendChild(golsel);
    grid.appendChild(fgoal);

    editPanel.appendChild(grid);

    const grid2 = h("div", { class: "row-grid three" });
    const fctx = h("div", { class: "field" });
    fctx.appendChild(h("label", {}, "Context"));
    fctx.appendChild(h("select", { onchange: e => { s.sessionContext = e.target.value; s.sessionPlan = buildSessionPlan(); renderSession(); } },
      (window.FF_SESSION_CONTEXTS || []).map(c => {
        const opt = h("option", { value: c.id }, c.label);
        if (s.sessionContext === c.id) opt.selected = true;
        return opt;
      })
    ));
    grid2.appendChild(fctx);
    const fh = h("div", { class: "field" });
    fh.appendChild(h("label", {}, "Horizon"));
    fh.appendChild(h("select", { onchange: e => { s.assemblyHorizon = e.target.value; s.sessionPlan = buildSessionPlan(); renderSession(); } },
      (window.FF_ASSEMBLY_HORIZONS || []).map(a => {
        const opt = h("option", { value: a.id }, a.label);
        if (s.assemblyHorizon === a.id) opt.selected = true;
        return opt;
      })
    ));
    grid2.appendChild(fh);
    const fs = h("div", { class: "field" });
    fs.appendChild(h("label", {}, "Sessions / week"));
    fs.appendChild(h("select", { onchange: e => { s.sessionsPerWeek = +e.target.value; s.sessionPlan = buildSessionPlan(); renderSession(); } },
      [1, 2, 3, 4, 5].map(n => {
        const opt = h("option", { value: n }, String(n));
        if (s.sessionsPerWeek === n) opt.selected = true;
        return opt;
      })
    ));
    grid2.appendChild(fs);
    editPanel.appendChild(grid2);
    editPanel.appendChild(renderContextRuleCard());
    root.appendChild(editPanel);

    // Time blocks
    const blockPanel = h("div", { class: "panel" });
    blockPanel.appendChild(panelHead("Session plan · " + plan.duration + " minutes · GP-L" + plan.gpl, "CB-2 · plan"));
    if (plan.trackmanModes?.length) {
      const modeBox = h("div", { class: "mode-summary" });
      modeBox.appendChild(h("h3", {}, "TrackMan mode routing"));
      const ul = h("ul", {});
      plan.trackmanModes.forEach(m => {
        ul.appendChild(h("li", {}, [
          h("b", {}, m.label),
          txt(" — counts as " + m.counts_as + ". "),
          h("span", {}, "Protocol: " + m.protocol + ". " + m.notes)
        ]));
      });
      modeBox.appendChild(ul);
      blockPanel.appendChild(modeBox);
    }
    blockPanel.appendChild(renderFieldManualSpine(plan));
    plan.blocks.forEach(b => blockPanel.appendChild(renderBlock(b)));
    blockPanel.appendChild(renderAssembly(plan));
    blockPanel.appendChild(h("div", { class: "button-row" }, [
      h("button", { class: "btn", onclick: () => switchView("output") }, "Generate outputs →"),
      h("button", { class: "btn secondary", onclick: () => switchView("wizard") }, "Back to wizard")
    ]));
    root.appendChild(blockPanel);
  }

  function renderBlock(b) {
    const wrap = h("div", { class: "session-block " + b.kind });
    wrap.appendChild(h("div", { class: "dur" }, [
      h("strong", {}, String(b.mins)),
      txt("MIN")
    ]));
    const body = h("div", { class: "body" });
    body.appendChild(h("h4", {}, b.label));
    if (b.context_instruction) {
      body.appendChild(h("p", { class: "context-note" }, b.context_instruction));
    }
    if (b.modified_notice) {
      body.appendChild(h("p", { class: "context-note", style: "border-left: 3px solid #b22; padding-left: .55rem; color: #b22; font-weight: 600;" }, b.modified_notice));
    }
    if (b.kind === "warmup") {
      body.appendChild(h("p", {}, "Open with TPI band protocol or IronWhip band stretches. Putting calibration if putting tools available."));
    } else if (b.kind === "scoring") {
      body.appendChild(h("p", {}, "End with a scoring element. Pressure putting move-back, simulated hole sequence, or up-and-down score. PSR every shot."));
    } else if (b.kind === "retest") {
      body.appendChild(h("p", {}, "Drop feedback. One ball, full PSR. Capture proof metric per drill."));
    }
    if (b.drills && b.drills.length) {
      const ul = h("ul", { style: "margin: .35rem 0 0 1.1rem; padding: 0; font-size: 13px; line-height: 1.55;" });
      b.drills.forEach(d => {
        const nameNode = h("b", {}, d.name);
        const li = h("li", { style: "margin-bottom: 2px;" }, [
          nameNode,
          d.__carryover_variant ? h("span", { style: "margin-left: .35rem; font-size: 11px; padding: 1px 6px; border-radius: 4px; background: rgba(0,128,90,0.12); color: #066; font-weight: 600;" }, "carryover variant") : null,
          txt(" — "),
          h("span", { style: "font-family: var(--font-serif); font-style: italic; color: var(--teal);" }, "“" + d.active_cue + "”"),
          h("div", { style: "font-size: 12px; color: var(--ink-3); margin-top: 1px;" },
            (b.kind === "retest" ? "Retest: " + (d.proof_metric || "—") : (d.feedback_schedule)))
        ].filter(Boolean));
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }
    if (b.links && b.links.length) {
      const linkBox = h("div", { class: "linked-carryovers" });
      linkBox.appendChild(h("div", { class: "link-head" }, [
        h("div", { class: "link-title" }, "Selectable carryover paths"),
        h("div", { class: "link-count" }, activeBlockLinks(b.links).length + "/" + b.links.length + " included")
      ]));
      const ul = h("ul");
      b.links.forEach(link => {
        const companion = link.companions?.length ? " Companion options: " + link.companions.map(d => d.name).join(" / ") + "." : "";
        ul.appendChild(h("li", { class: "link-option " + (link.active === false ? "off" : "on") }, [
          h("label", {}, [
            h("input", {
              type: "checkbox",
              checked: link.active !== false,
              onchange: e => toggleLink(link.link_id, e.target.checked)
            }),
            h("span", { class: "link-copy" }, [
              h("b", {}, link.label + ": "),
              txt(link.task + " "),
              h("span", {}, "From " + link.from_drill_name + "."),
              companion ? h("span", {}, companion) : txt(""),
              link.gate ? h("div", { class: "link-gate" }, "Gate: " + link.gate) : txt("")
            ])
          ])
        ]));
      });
      linkBox.appendChild(ul);
      body.appendChild(linkBox);
    }
    if (b.field_manual_tags?.length) {
      body.appendChild(h("div", { class: "block-tags" }, b.field_manual_tags.map(t => h("span", {}, t))));
    }
    wrap.appendChild(body);
    return wrap;
  }

  function renderFieldManualSpine(plan) {
    const spine = plan.fieldManualBackend?.source_spine || [];
    const wrap = h("div", { class: "field-spine-panel" });
    wrap.appendChild(h("div", { class: "spine-title" }, [
      h("b", {}, "Field Manual backend integration"),
      h("span", { class: "small-note" }, plan.fieldManualBackend?.version || "poc")
    ]));
    const grid = h("div", { class: "spine-grid" });
    spine.forEach(s => grid.appendChild(h("div", { class: "spine-card" }, [
      h("span", { class: "spine-id" }, s.id),
      h("b", {}, s.label),
      h("p", {}, s.role)
    ])));
    wrap.appendChild(grid);
    return wrap;
  }

  function renderAssembly(plan) {
    const assembly = plan.assembly;
    const wrap = h("div", { class: "assembly-panel" });
    wrap.appendChild(h("div", { class: "spine-title" }, [
      h("b", {}, "Assembly layer · " + plan.assemblyHorizon.label),
      h("span", { class: "small-note" }, assembly.summary)
    ]));
    if (assembly.horizon === "month") {
      assembly.weeks.forEach(w => {
        const week = h("div", { class: "week-card" });
        week.appendChild(h("div", { class: "week-head" }, [
          h("span", { class: "spine-id" }, "Week " + w.week),
          h("b", {}, w.theme),
          h("span", {}, w.instruction)
        ]));
        week.appendChild(renderAssemblySessions(w.sessions));
        wrap.appendChild(week);
      });
    } else {
      wrap.appendChild(renderAssemblySessions(assembly.sessions));
    }
    return wrap;
  }

  function renderAssemblySessions(sessions) {
    const grid = h("div", { class: "assembly-grid" });
    sessions.forEach(sess => {
      grid.appendChild(h("div", { class: "assembly-card " + sess.contextId }, [
        h("div", { class: "assembly-top" }, [
          h("span", { class: "context-badge" }, sess.badge),
          h("span", { class: "spine-id" }, sess.minutes + " min")
        ]),
        h("h4", {}, sess.focus),
        h("p", {}, sess.note),
        h("dl", {}, [
          h("dt", {}, "Drill emphasis"),
          h("dd", {}, (sess.drills || []).map(d => d.name).join(" · ") || "Coach-selected from current block"),
          h("dt", {}, "Carryover links"),
          h("dd", {}, (sess.carryovers || []).map(l => l.label + " from " + l.from_drill_name).join(" · ") || "—"),
          h("dt", {}, "Feedback"),
          h("dd", {}, sess.feedback),
          h("dt", {}, "Proof"),
          h("dd", {}, sess.proof)
        ])
      ]));
    });
    return grid;
  }

  /* =============================================================================
     LIBRARY VIEW
     ============================================================================= */
  const libState = { q: "", category: "all", gpl: "all", cause: "all", representativeness: "all" };

  function renderLibrary() {
    const root = $("#library-root");
    root.innerHTML = "";
    const panel = h("div", { class: "panel" });
    panel.appendChild(panelHead("Drill Library · " + FF_DRILLS.length + " cards", "CB-3"));
    panel.appendChild(h("p", { style: "font-size: 13.5px;" },
      "Searchable, filterable. Every card carries: cue (one external), constraint alternative, feedback schedule, representativeness, conflict, progression, regression, proof metric, sources. Edit data in <code>data/drills.js</code>."));

    // Toolbar
    const tb = h("div", { class: "drill-toolbar" });
    const search = h("input", { type: "search", placeholder: "Search name, cue, fault, source…", oninput: (e) => { libState.q = e.target.value.toLowerCase(); applyLibFilter(); } });
    search.value = libState.q;
    tb.appendChild(search);

    const catSel = h("select", { onchange: e => { libState.category = e.target.value; applyLibFilter(); } });
    catSel.appendChild(h("option", { value: "all" }, "All categories"));
    ["full_swing", "speed", "ground_force", "club_face_path", "contact_lowpoint", "short_game", "putting", "course_transfer", "warmup_prep", "psychology"].forEach(c => {
      const opt = h("option", { value: c }, c.replace(/_/g, " "));
      if (libState.category === c) opt.selected = true;
      catSel.appendChild(opt);
    });
    tb.appendChild(catSel);

    const gplSel = h("select", { onchange: e => { libState.gpl = e.target.value; applyLibFilter(); } });
    gplSel.appendChild(h("option", { value: "all" }, "All GP-L"));
    [1, 2, 3, 4, 5].forEach(g => {
      const opt = h("option", { value: g }, "GP-L" + g);
      if (libState.gpl === String(g)) opt.selected = true;
      gplSel.appendChild(opt);
    });
    tb.appendChild(gplSel);

    const causeSel = h("select", { onchange: e => { libState.cause = e.target.value; applyLibFilter(); } });
    causeSel.appendChild(h("option", { value: "all" }, "All cause lanes"));
    ["ball", "club", "body", "equipment", "psych", "strategy"].forEach(c => {
      const opt = h("option", { value: c }, c);
      if (libState.cause === c) opt.selected = true;
      causeSel.appendChild(opt);
    });
    tb.appendChild(causeSel);

    const repSel = h("select", { onchange: e => { libState.representativeness = e.target.value; applyLibFilter(); } });
    repSel.appendChild(h("option", { value: "all" }, "All representativeness"));
    ["Low", "Medium", "High"].forEach(r => {
      const opt = h("option", { value: r }, "Rep: " + r);
      if (libState.representativeness === r) opt.selected = true;
      repSel.appendChild(opt);
    });
    tb.appendChild(repSel);

    const cnt = h("div", { class: "count", id: "lib-count" }, "");
    tb.appendChild(cnt);
    panel.appendChild(tb);

    const list = h("div", { class: "drill-list", id: "lib-list" });
    panel.appendChild(list);

    root.appendChild(panel);
    applyLibFilter();
  }

  function applyLibFilter() {
    const list = $("#lib-list");
    if (!list) return;
    list.innerHTML = "";
    const filtered = FF_DRILLS.filter(d => {
      if (libState.category !== "all" && d.category !== libState.category) return false;
      if (libState.gpl !== "all" && !d.gpl_fit.includes(+libState.gpl)) return false;
      if (libState.cause !== "all" && d.cause_lane !== libState.cause) return false;
      if (libState.representativeness !== "all" && d.representativeness !== libState.representativeness) return false;
      if (libState.q) {
        const haystack = [d.name, d.active_cue, d.description, d.when_why, d.solves.join(" "), d.source_tags.join(" "), d.drill_id, d.category].join(" ").toLowerCase();
        if (!haystack.includes(libState.q)) return false;
      }
      return true;
    });
    $("#lib-count").textContent = filtered.length + "/" + FF_DRILLS.length;
    if (!filtered.length) {
      list.appendChild(h("div", { class: "empty" }, "No drills match these filters. Loosen one."));
      return;
    }
    filtered.forEach(d => list.appendChild(drillCard(d, false)));
  }

  /* =============================================================================
     OUTPUT VIEW
     ============================================================================= */
  let activeOutputTab = "coach";

  function renderOutput() {
    const root = $("#output-root");
    root.innerHTML = "";
    const s = FF.state;
    if (!s.sessionPlan) {
      root.appendChild(h("div", { class: "panel" }, [
        h("h2", {}, "No outputs yet"),
        h("p", {}, "Build a session in the Coach Wizard first.")
      ]));
      return;
    }
    const panel = h("div", { class: "panel" });
    panel.appendChild(panelHead("Outputs · three views from the same selection", "CB-4"));
    panel.appendChild(h("p", { style: "font-size: 13.5px;" },
      "Coach plan is the working doc. Client assignment is the trimmed-down task list, no jargon. Printable card is the at-the-tee version."));

    // Tabs
    const tabs = h("div", { class: "output-tabs" });
    [["coach", "Coach plan"], ["client", "Client assignment"], ["card", "Printable card"]].forEach(([k, lab]) => {
      tabs.appendChild(h("button", {
        class: "output-tab" + (activeOutputTab === k ? " on" : ""),
        onclick: () => { activeOutputTab = k; renderOutput(); }
      }, lab));
    });
    panel.appendChild(tabs);

    if (activeOutputTab === "coach") panel.appendChild(renderCoachOutput());
    if (activeOutputTab === "client") panel.appendChild(renderClientOutput());
    if (activeOutputTab === "card") panel.appendChild(renderCoachCard());

    root.appendChild(panel);
  }

  function renderCoachOutput() {
    const view = h("div", { class: "output-view on" });
    const text = formatCoachPlan(FF.state);
    const row = h("div", { class: "copy-row" });
    row.appendChild(h("span", { class: "label" }, "Plain-text coach plan · copy + paste anywhere"));
    row.appendChild(h("button", { class: "btn ghost", onclick: () => copyText(text, "Coach plan copied") }, "Copy"));
    view.appendChild(row);
    view.appendChild(h("textarea", { class: "output-textarea", readonly: true }, text));
    return view;
  }
  function renderClientOutput() {
    const view = h("div", { class: "output-view on" });
    const text = formatClientPlan(FF.state);
    const row = h("div", { class: "copy-row" });
    row.appendChild(h("span", { class: "label" }, "Client assignment · jargon-free · paste in DM / email"));
    row.appendChild(h("button", { class: "btn ghost", onclick: () => copyText(text, "Client assignment copied") }, "Copy"));
    view.appendChild(row);
    view.appendChild(h("textarea", { class: "output-textarea", readonly: true }, text));
    return view;
  }
  function renderCoachCard() {
    const view = h("div", { class: "output-view on" });
    view.appendChild(h("div", { class: "copy-row" }, [
      h("span", { class: "label" }, "Printable card · use browser Print (⌘P) for one-page PDF"),
      h("button", { class: "btn ghost", onclick: () => window.print() }, "Print")
    ]));
    view.appendChild(buildCoachCard(FF.state));
    return view;
  }

  /* ---------- Output formatters ---------- */
  function planSummary(s) {
    const layerName = FF_LAYERS.find(l => l.id === s.layer)?.label || "—";
    const faultNames = s.faults.map(fid => FF_FAULTS.find(f => f.id === fid)?.name).filter(Boolean).join(", ");
    const diagnostics = selectedDiagnosticBranches(s.faults).map(x => `${x.fault}: ${x.branch.label}`).join(" | ");
    const tools = s.tools.map(tid => FF_TOOLS.find(t => t.id === tid)?.label).filter(Boolean).join(", ");
    const trackmanModes = (s.trackmanModes || []).map(modeLabel).join(", ");
    const goal = FF_GOALS.find(g => g.id === s.goal)?.label || "—";
    const gates = Object.entries(s.gates).map(([k, v]) => `${k}:${v}`).join("  ");
    const context = sessionContext(s.sessionContext).label;
    const horizon = assemblyHorizon(s.assemblyHorizon).label;
    return { layerName, faultNames, diagnostics, tools, trackmanModes, goal, gates, context, horizon };
  }

  function formatCoachPlan(s) {
    const p = s.sessionPlan;
    const sum = planSummary(s);
    const lines = [];
    lines.push("FOREFRONT GOLF — COACH SESSION PLAN");
    lines.push("=".repeat(64));
    lines.push("");
    lines.push(`Duration:       ${p.duration} min`);
    lines.push(`Context:        ${sum.context}`);
    lines.push(`Assembly:       ${sum.horizon} · ${p.sessionsPerWeek || 1}/week`);
    lines.push(`Goal:           ${sum.goal} (${s.goal || "n/a"})`);
    lines.push(`GP-L stage:     GP-L${p.gpl}`);
    lines.push(`Layer:          ${sum.layerName}`);
    lines.push(`Faults:         ${sum.faultNames || "—"}`);
    lines.push(`Diagnostics:    ${sum.diagnostics || "—"}`);
    lines.push(`Cause note:     ${s.causeNote || "—"}`);
    lines.push(`Client phase:   ${s.clientLevel}`);
    lines.push(`Tools today:    ${sum.tools || "—"}`);
    lines.push(`TrackMan modes: ${sum.trackmanModes || "—"}`);
    lines.push(`Readiness:      ${s.readinessFlags || "—"}`);
    lines.push(`Gates:          ${sum.gates}`);
    lines.push(`Field manual:   ${(p.fieldManualBackend?.source_spine || []).map(x => x.id).join(", ")}`);
    lines.push("");
    const tests = selectedDiagnosticTestCards(s.faults);
    if (tests.length) {
      lines.push("─".repeat(64));
      lines.push("DIAGNOSTIC TEST CARDS — RUN BEFORE DRILL PRESCRIPTION");
      lines.push("─".repeat(64));
      tests.forEach(t => {
        lines.push("");
        lines.push(`▌ ${t.fault} → ${t.branch_label} · ${t.title}`);
        lines.push(`   Objective: ${t.objective}`);
        lines.push(`   Setup:     ${t.setup}`);
        lines.push(`   Protocol:  ${t.protocol}`);
        lines.push(`   Pass:      ${t.pass_criteria}`);
        lines.push(`   If failed: ${t.fail_action}`);
        lines.push(`   Use result: ${t.use_result}`);
      });
      lines.push("");
    }
    lines.push("─".repeat(64));
    lines.push("SESSION BLOCKS");
    lines.push("─".repeat(64));
    p.blocks.forEach((b, i) => {
      lines.push("");
      lines.push(`▌ Block ${i + 1} · ${b.label} · ${b.mins} min`);
      if (b.context_instruction) lines.push(`   Context: ${b.context_instruction}`);
      if (b.field_manual_tags?.length) lines.push(`   FM tags: ${b.field_manual_tags.join(", ")}`);
      if (b.drills && b.drills.length) {
        b.drills.forEach(d => {
          lines.push(`   • ${d.name}  [${d.drill_id}]`);
          lines.push(`     Cue:        "${d.active_cue}"  (${d.cue_proximity})`);
          if (d.trackman_modes?.length) lines.push(`     TM mode:    ${d.trackman_modes.map(modeLabel).join(" / ")}`);
          if (d.constraint_alternative) lines.push(`     Constraint: ${d.constraint_alternative}`);
          lines.push(`     Feedback:   ${d.feedback_schedule}`);
          if (b.kind === "retest" && d.proof_metric) lines.push(`     Retest:     ${d.proof_metric}`);
          if (d.conflict) lines.push(`     Conflict:   ${d.conflict}`);
        });
      } else {
        if (b.kind === "scoring") lines.push("   • Pressure / scoring game (move-back putting, simulated hole, or up/down).");
        else lines.push("   • No duplicate drill card. Use linked carryover below.");
      }
      const selectedLinks = activeBlockLinks(b.links || []);
      if (selectedLinks.length) {
        lines.push("   Linked carryovers:");
        selectedLinks.forEach(link => {
          lines.push(`   ↳ ${link.label} from ${link.from_drill_name}`);
          lines.push(`     Task: ${link.task}`);
          if (link.companions?.length) lines.push(`     Companion options: ${link.companions.map(d => d.name).join(" / ")}`);
          if (link.gate) lines.push(`     Gate: ${link.gate}`);
        });
      }
    });
    lines.push("");
    lines.push("─".repeat(64));
    lines.push("OPERATING RULES (applied to every block)");
    lines.push("─".repeat(64));
    lines.push("• One external cue per rep (Winkelman; Wulf & Su 2007).");
    lines.push("• Body-part language stays in the description, NOT the cue.");
    lines.push("• Distal > proximal for full-swing / approach.");
    lines.push("• Feedback fades: novice 50%+, intermediate ~33%, advanced bandwidth.");
    lines.push("• Constraints first — verbal cue is the secondary intervention.");
    lines.push("• Low-representativeness drills carry a transfer note.");
    lines.push(`• Session context rule: ${p.sessionContext?.label || sum.context} — ${p.sessionContext?.feedback_rule || ""}`);
    lines.push("");
    lines.push("─".repeat(64));
    lines.push("ASSEMBLY LAYER");
    lines.push("─".repeat(64));
    lines.push(`• ${p.assembly?.summary || "Single session only."}`);
    if (p.assembly?.horizon === "month") {
      p.assembly.weeks.forEach(w => {
        lines.push(`• Week ${w.week}: ${w.theme} — ${w.instruction}`);
        w.sessions.forEach(sess => lines.push(`  - ${sess.contextLabel}: ${sess.focus} (${sess.minutes} min) · drills: ${(sess.drills || []).map(d => d.name).join(" / ") || "linked carryover"} · carryover: ${(sess.carryovers || []).map(l => l.label).join(" / ") || "—"} · proof: ${sess.proof}`));
      });
    } else {
      (p.assembly?.sessions || []).forEach(sess => lines.push(`• ${sess.contextLabel}: ${sess.focus} (${sess.minutes} min) · drills: ${(sess.drills || []).map(d => d.name).join(" / ") || "linked carryover"} · carryover: ${(sess.carryovers || []).map(l => l.label).join(" / ") || "—"} · ${sess.note}`));
    }
    lines.push("");
    lines.push("─".repeat(64));
    lines.push("HOMEWORK / BETWEEN-SESSION");
    lines.push("─".repeat(64));
    const acqCue = p.blocks.find(b => b.kind === "block1")?.drills?.[0];
    if (acqCue) lines.push(`• Rehearse "${acqCue.active_cue}" — 3×6 reps, no ball, twice this week.`);
    lines.push(`• Capture: ball-flight notes, contact location, any pain or pattern change.`);
    lines.push(`• Bring next session: 3 questions, 1 win, 1 confusion.`);
    lines.push("");
    lines.push("Generated by Forefront Golf Coach Builder · v0.1 PoC · no client PII stored.");
    return lines.join("\n");
  }

  function formatClientPlan(s) {
    const p = s.sessionPlan;
    const sum = planSummary(s);
    const lines = [];
    lines.push("YOUR PRACTICE — THIS WEEK");
    lines.push("=".repeat(48));
    lines.push("");
    lines.push(`Focus:       ${sum.goal}`);
    lines.push(`Time block:  ${p.duration} minutes`);
    lines.push(`One thing:   ${p.blocks.find(b => b.kind === "block1")?.drills?.[0]?.active_cue || "—"}`);
    lines.push("");
    lines.push("WHAT TO DO");
    lines.push("-".repeat(48));
    p.blocks.forEach((b, i) => {
      if (b.kind === "retest" || b.kind === "scoring") return;
      lines.push("");
      lines.push(`${i + 1}. ${b.label}  (${b.mins} min)`);
      (b.drills || []).slice(0, 2).forEach(d => {
        lines.push(`   • ${d.name}`);
        lines.push(`     “${d.active_cue}”`);
      });
      activeBlockLinks(b.links || []).slice(0, 1).forEach(link => {
        lines.push(`   • Carryover: ${link.task}`);
      });
    });
    lines.push("");
    lines.push("BEFORE YOU FINISH");
    lines.push("-".repeat(48));
    lines.push("• Hit 5 shots to one target. One ball each. Full routine.");
    lines.push("• Note: did the ball flight change? What did contact feel like?");
    lines.push("");
    lines.push("THINGS TO IGNORE");
    lines.push("-".repeat(48));
    lines.push("• Mid-rep technique fiddling.");
    lines.push("• Body-part thinking inside the swing.");
    lines.push("• Numbers chasing if the flight looks right.");
    lines.push("");
    lines.push("Bring questions and one win to our next session.");
    return lines.join("\n");
  }

  function buildCoachCard(s) {
    const p = s.sessionPlan;
    const sum = planSummary(s);
    const card = h("div", { class: "coach-card" });
    // Head
    const head = h("div", { class: "cc-head" });
    head.appendChild(h("div", { class: "ttl" }, "Forefront Golf · Coach Card"));
    const meta = h("div", { class: "meta" });
    meta.appendChild(h("div", {}, p.duration + " min · GP-L" + p.gpl));
    meta.appendChild(h("div", {}, "Goal " + (s.goal || "—")));
    meta.appendChild(h("div", {}, "Layer " + (sum.layerName || "—")));
    head.appendChild(meta);
    card.appendChild(head);

    // Focus cue (the dominant cue from acquisition block)
    const acqBlock = p.blocks.find(b => b.kind === "block1");
    const focusCue = acqBlock?.drills?.[0]?.active_cue;
    if (focusCue) {
      const sec = h("section");
      sec.appendChild(h("h4", {}, "Today's cue"));
      sec.appendChild(h("div", { class: "cue" }, focusCue));
      card.appendChild(sec);
    }

    // Faults + cause
    if (sum.faultNames || sum.diagnostics || s.causeNote) {
      const sec = h("section");
      sec.appendChild(h("h4", {}, "Diagnosis"));
      const ul = h("ul");
      if (sum.faultNames) ul.appendChild(h("li", {}, sum.faultNames));
      if (sum.diagnostics) ul.appendChild(h("li", {}, "Branch: " + sum.diagnostics));
      if (s.causeNote) ul.appendChild(h("li", {}, s.causeNote));
      sec.appendChild(ul);
      card.appendChild(sec);
    }

    const diagTests = selectedDiagnosticTestCards(s.faults).slice(0, 3);
    if (diagTests.length) {
      const sec = h("section");
      sec.appendChild(h("h4", {}, "Proof tests before drills"));
      const ul = h("ul");
      diagTests.forEach(t => {
        ul.appendChild(h("li", {}, t.branch_label + ": " + t.title + " — " + t.pass_criteria));
      });
      sec.appendChild(ul);
      card.appendChild(sec);
    }

    // Blocks
    const blocksSec = h("section");
    blocksSec.appendChild(h("h4", {}, "Session blocks"));
    const ul = h("ul");
    p.blocks.forEach(b => {
      const li = h("li");
      li.appendChild(h("b", {}, b.label + " — " + b.mins + " min"));
      if (b.drills && b.drills.length) {
        const inner = h("ul");
        b.drills.slice(0, 3).forEach(d => {
          inner.appendChild(h("li", {}, d.name + " · " + d.drill_id));
        });
        li.appendChild(inner);
      }
      const selectedLinks = activeBlockLinks(b.links || []);
      if (selectedLinks.length) {
        const links = h("ul");
        selectedLinks.slice(0, 2).forEach(link => {
          links.appendChild(h("li", {}, "↳ " + link.label + ": " + link.task));
        });
        li.appendChild(links);
      }
      ul.appendChild(li);
    });
    blocksSec.appendChild(ul);
    card.appendChild(blocksSec);

    // Retest
    const retestSec = h("section");
    retestSec.appendChild(h("h4", {}, "Retest"));
    const rul = h("ul");
    let cnt = 0;
    p.blocks.forEach(b => (b.drills || []).forEach(d => {
      if (cnt < 3 && d.proof_metric) {
        rul.appendChild(h("li", {}, d.name + ": " + d.proof_metric));
        cnt++;
      }
    }));
    if (!rul.children.length) rul.appendChild(h("li", {}, "Capture ball flight and contact notes."));
    retestSec.appendChild(rul);
    card.appendChild(retestSec);

    // Rules reminder
    const rulesSec = h("section");
    rulesSec.appendChild(h("h4", {}, "Operating rules"));
    rulesSec.appendChild(h("ul", {}, [
      h("li", {}, "One external cue per rep."),
      h("li", {}, "Constraint first; cue second."),
      h("li", {}, "Feedback fades as it gets cleaner."),
      h("li", {}, "Don't say body parts inside the swing.")
    ]));
    card.appendChild(rulesSec);

    // Footer
    const foot = h("section", { style: "border-top: 1px dashed var(--rule); padding-top: .4rem; font-size: 10.5px; color: var(--ink-3); font-family: var(--font-mono);" });
    foot.appendChild(h("div", {}, "Forefront Golf · Coach Builder v0.1 · no PII"));
    foot.appendChild(h("div", {}, "Sources: Wulf · Winkelman · Gray · TrackMan · Mach 3"));
    card.appendChild(foot);
    return card;
  }

  /* =============================================================================
     Helpers
     ============================================================================= */
  function panelHead(title, tag) {
    return h("div", { class: "panel-head" }, [
      h("div", {}, h("h2", {}, title)),
      h("span", { class: "section-tag" }, tag)
    ]);
  }

  function copyText(text, msg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast(msg || "Copied")).catch(() => fallbackCopy(text, msg));
    } else {
      fallbackCopy(text, msg);
    }
  }
  function fallbackCopy(text, msg) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast(msg || "Copied"); }
    catch (e) { toast("Copy failed — select manually"); }
    document.body.removeChild(ta);
  }

  /* =============================================================================
     Boot
     ============================================================================= */
  function boot() {
    // sidebar nav
    $$("#nav-views button, .nav-list button").forEach(b => {
      if (b.dataset.view) {
        b.addEventListener("click", () => switchView(b.dataset.view));
      }
    });
    // mobile menu
    $("#menu-toggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
    // global keyboard: "/" focuses library search if on that view
    document.addEventListener("keydown", e => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        const view = FF.state.view;
        if (view === "library") {
          e.preventDefault();
          $('#library-root input[type="search"]')?.focus();
        }
      }
    });
    // Hash routing (very light) — # = wizard, #library, etc.
    const hash = (location.hash || "").replace("#", "");
    if (["wizard", "session", "library", "output", "reference", "handoff"].includes(hash)) {
      switchView(hash);
    } else {
      switchView("wizard");
    }
    window.addEventListener("hashchange", () => {
      const h = (location.hash || "").replace("#", "");
      if (["wizard", "session", "library", "output", "reference", "handoff"].includes(h)) switchView(h);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
