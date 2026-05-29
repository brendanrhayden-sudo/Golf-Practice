# Forefront Golf Practice Session Builder: Scientific Review, Dataset Architecture & Seed

**Version:** 1.0 — Research & Dataset Architecture Only (No Code / No DB Writes)
**Date:** May 28, 2026
**Author:** Forefront Knowledge Synthesis
**Status:** Pre-production review document

---

## 1. Executive Summary

### 1.1 Verdict on Current Design Direction

The Forefront Practice Session Builder concept — visible flaw → diagnostic branch → proof test → confirmed cause → drill candidate → session assembly — is scientifically sound at its core logic and practically defensible for a coaching platform. The diagnostic-first philosophy aligns with best practices from TrackMan Performance Studio, Athletic Motion Golf (AMG), and TPI, and the GTR audit confirms strong backend infrastructure (swing_fault_protocols, golf_drill_fault_priority, amg_checkpoints, gip_practice_allocation, gip_session_templates).

However, **six structural corrections are required before the builder is scientifically correct:**

1. **Block order needs surgery.** The current implicit model places blocked acquisition too early and delays variability/transfer too long. Motor learning science is unambiguous: acquisition blocks must gate-exit into serial/random practice before any session calls itself "complete for learning." A session that is 100% blocked is a performance session, not a learning session.

2. **Motor learning stage must gate the drill menu.** A drill appropriate for acquisition (blocked, high feedback, external cues, simple environment) is often contraindicated for retention or transfer stages. The dropdown must be stage-aware, not just diagnostic-aware.

3. **Physiology and readiness must pre-screen block allowances.** Pain score >3/10, fatigue state, sleep debt, and session timing relative to a round must suppress or reorder blocks before the coach or client ever sees options.

4. **Transfer bridge is currently absent.** The builder has no explicit "Representative Transfer" or on-course simulation block. Without it, practice never closes the practice-to-performance gap — the most common reason golfers improve on the range and not on the course.

5. **Feedback/technology rules must be block-specific.** TrackMan, Sportsbox, and SAM PuttLab are powerful but their overuse in transfer/pressure blocks degrades learning and creates measurement dependency. Explicit fading rules are required.

6. **Client customization logic is missing from the dataset layer.** GP level, MN mode, pain/readiness gates, tools available, coach presence, junior/senior/post-rehab adaptation, round schedule, and session duration must each modify the dropdown menu dynamically, not just narratively.

### 1.2 Dataset Strategy

Produce 17 JSON/CSV tables (specified in Section 11) that power a fully gated, dropdown-driven builder. The tables form a relational dataset where: `branch_intents` → filter `drill_families` → filter `drill_cards` → validated against `block_options` → gated by `contraindication_gates` → modified by `client_adaptation_rules` → scored via `scoring_tests`. Every choice in the dropdown resolves to evidence-tagged rows, making the builder scientifically auditable.

**Recommended phased implementation:**
- **Phase 1 (MVP):** session_blocks, drill_families, drill_cards (~60 cards), scoring_tests (~25 tests), branch_intents (15 intents), contraindication_gates
- **Phase 2:** feedback_rules, cue_rules, progression_rules, regression_rules, technology_modes, client_adaptation_rules
- **Phase 3:** weekly_progressions, session_templates, expert_lenses, quality_checks

---

## 2. Source Spine

### 2.1 Internal KB Sources

| Source | Contribution | Confidence | Tag |
|--------|-------------|------------|-----|
| TrackMan-Fingerprint-Recommendation-Engine.md | Full TPS metric schema, D-Plane physics, Combine protocol, Optimizer windows, fingerprint detection rules | Very High | `forefront_kb` |
| Sportsbox-Fingerprint-Based-Drill-System.md | 6DOF metric definitions, kinematic sequence, 11 multi-datapoint fingerprints, drill priorities by fingerprint | Very High | `forefront_kb` |
| Biomechanics-Golf-Coaching-Deep-Dive.md | GRF mechanisms (Kwon), kinematic sequence (TPI/Cheetham), pressure shift tables, kinetic sequence (Como), speed development (SuperSpeed/Mach3), AMG 3D tour commonalities | Very High | `forefront_kb` |
| putting-short-game-1.md | Ball direction physics (SAM PuttLab), ball roll phases, SAM PuttLab assessment protocol, Sweeney method, Sieckmann finesse wedge, AimPoint Express, green reading physics, wedge spin physics | High | `forefront_kb` |
| Warmup-Mobility-Core-Rehab-Complete-Guide-1.md | TPI 16-point screen, FMS/SFMA, DNS progression, FRC/CARs/PAILs/RAILs, warmup structure (Francis rules), joint-by-joint model | Very High | `forefront_kb` |
| Power-Plyometric-Speed-Complete-Guide-1.md | Force-velocity curve, SSC, Verkhoshansky shock method, Cal Dietz triphasic, French contrast, overspeed protocol details | High | `forefront_kb` |
| Forefront-Practical-Operations-Manual-1.md | TrackMan analysis decision trees, Combine scoring, Optimizer windows, fitting/equipment A/B, bag mapping protocols | Very High | `forefront_kb` |
| golf_gtr_audit.md | GP-01..GP-08 GTR coverage, min_fields rows, aspiration_components, congruence matrix, phase_goal_sequence, motor learning stage logic | Very High | `forefront_kb` |
| gtr_authoring_pack.md | Canonical schema verification, active_volume handoff, target_bands JSONB, resolver chains | Very High | `forefront_kb` |
| momentum_human_engine_research_v1.pplx.md | SDT/autonomy, intervention ladders by goal family, golf skill stall diagnostics, minimum-necessary tracking model | High | `forefront_kb` |
| Assessment-Periodization-Deep-Dive-1.md | RIPA framework, TPI screen → warmup insert table, FMS/SFMA breakout logic | High | `forefront_kb` |
| Forefront-Golf-Fitness-Knowledge-Base-1.md | Physical correlations to swing characteristics, TPI physical screen golf links | High | `forefront_kb` |
| Client-report-engine-1.md | Client profile variables, GP level definitions, adaptation logic | Medium | `forefront_kb` |

### 2.2 External Research Sources

| Source | Contribution | Confidence | Tag | URL |
|--------|-------------|------------|-----|-----|
| Barzyk & Gruber 2024 Motor Learning in Golf SR | Practice scheduling (CI, distributed, blocked/random), augmented feedback, implicit/explicit, focus of attention — systematic review of 65 studies | Very High | `evidence_supported` | [PMC10899359](https://pmc.ncbi.nlm.nih.gov/articles/PMC10899359/) |
| Walker 2005 Sleep & Motor Consolidation | Sleep-dependent motor consolidation, NREM stage-2, 24-hour window, nap benefits | Very High | `evidence_supported` | [Walker 2005 PDF](https://walkerlab.berkeley.edu/reprints/Walker_ClinSportsMed_05.pdf) |
| Wulf & Su 2007 / Wulf 2013 External Focus | External focus superiority for motor learning across skill levels, golf chip/swing evidence | Very High | `evidence_supported` | [Sciencedirect](https://www.sciencedirect.com/science/article/abs/pii/S1469029223001875) |
| Winkelman — Language of Coaching | Cueing hierarchy, external vs internal focus, 1-in/1-out rule, feedback fading (33-50% optimal), prescriptive vs descriptive | High | `expert_framework` | [OTP Books](https://www.otpbooks.com/coaching-movements-and-skills-with-nick-winkelman/) |
| PaR Golf (Golf Science Journal) | Plan-Act-Review model, planning emphasis over blocked repetition, quiet-eye research | High | `evidence_supported` | [GSJ PDF](https://www.golfsciencejournal.org/article/5013-par-plan-act-review-golf-motor-learning-research-and-improving-golf-skills.pdf) |
| Practice Conditions Review (Uni-Konstanz) | Blocked vs random for novice vs expert golfers, distributed vs massed, errorless learning advantages | High | `evidence_supported` | [PDF](https://ojs.ub.uni-konstanz.de/cpa/article/view/5306/4878) |
| Guadagnoli Challenge Point (Golf Science Lab) | Challenge point framework for novice vs expert, diminishing returns of same-difficulty practice | High | `evidence_supported` | [Golf Science Lab](https://golfwell.co/challenge-point/) |
| Ecological Dynamics / Representative Learning Design | Constraints-led approach, perception-action coupling, RLD principles, game context preservation | High | `evidence_supported` | [Sportsmith](https://www.sportsmith.co/articles/ecological-dynamics/) |
| TrackMan Combine benchmarks (FSGA) | 60-shot protocol, 10 targets, scoring formula, HCP equivalents by score band | Very High | `evidence_supported` | [FSGA](https://www.fsga.org/sections/content/TrackMan-Combines---Junior-Golf-Assessment/1004) |
| TrackMan Performance Center guide | TPS modes, Strokes Gained benchmarks, Performance Center protocols | Very High | `evidence_supported` | [TrackMan Support](https://support.trackmangolf.com/hc/en-us/articles/37847865938971-Practice-Guide-to-the-Performance-Center) |
| Sieckmann (Your Short Game Solution) | Finesse wedge system, motion capture verified, practice session guides | High | `expert_framework` | [JSGA](https://jsegolfacademy.com/your-short-game-solution-now-available/) |
| SAM PuttLab 2018 data (Marquardt) | Tour face angle stats, stroke type classification, yips/rotation research | Very High | `evidence_supported` | Via KB putting-short-game files |
| Magill & Hall 1990 Contextual Interference | Foundational CI research, blocked vs random, generalization across tasks | Very High | `evidence_supported` | [PubMed](https://pubmed.ncbi.nlm.nih.gov/12529226/) |
| Lam/Maxwell errorless learning research | Errorless blocked practice superiority for novices, robustness under dual-task | High | `evidence_supported` | Via Barzyk 2024 SR |
| Silbernagel 2007 pain monitor RCT | Pain monitoring model 0-5/10, load management for rehab/pain | Very High | `evidence_supported` | [PubMed](https://pubmed.ncbi.nlm.nih.gov/17307888/) |
| Broadie Strokes Gained (Columbia) | SG decomposition by category, handicap delta relationships | Very High | `evidence_supported` | [Columbia SG paper](https://columbia.edu/~mnb2/broadie/Assets/strokes_gained_pga_broadie_20110408.pdf) |
| Teixeira 2012 SDT/Autonomy SR | Autonomous motivation for long-term adherence, autonomy-supportive coaching | Very High | `evidence_supported` | [PubMed 22726453](https://pubmed.ncbi.nlm.nih.gov/22726453/) |

**Evidence-tag definitions used throughout this document:**
- `evidence_supported` — peer-reviewed RCT, meta-analysis, or systematic review
- `expert_framework` — world-class instructor framework, validated by practice but not RCT
- `forefront_kb` — Forefront internal KB, consistent with source hierarchy A→D
- `review_required` — Forefront design decision needing Brendan validation before production

---

## 3. Scientific Review of Session Block Order

### 3.1 Block Architecture — Required vs Optional

The following block sequence is scientifically grounded in motor learning, physiology, and golf skill transfer. Blocks marked **R** are required for a complete learning session; **O** = optional by duration or stage.

| # | Block Name | Duration | Status | Scientific Basis |
|---|------------|----------|--------|-----------------|
| 1 | Arrival & Intention Setting | 3–5 min | R | Pre-task commitment improves goal-action coupling; Vision54/Playsight; PaR planning phase |
| 2 | Physical Warm-Up (Physiology) | 8–15 min | R | Charlie Francis CNS ramp, TPI screen inserts, DNS/FRC — mandatory for injury prevention and performance readiness |
| 3 | Golf-Specific Activation & Pattern Rehearsal | 5–10 min | R | Bridges warm-up to acquisition; blocked slow-motion rehearsal acceptable here; primes motor program |
| 4 | Proof Test / Baseline Shot Cluster | 5–8 min | R | Confirms diagnostic branch intent; provides session anchor; prevents placebo improvement bias |
| 5 | Blocked Acquisition (Core Drill Work) | 15–25 min | R (early stage) / O (maintenance) | Blocked practice for novice/acquisition; errorless learning advantage for new skill; Barzyk 2024 |
| 6 | Serial Variability | 10–15 min | R (consolidation+) | Serial schedule bridges blocked→random; Porter & Magill 2010 increasing CI model; |
| 7 | Random / Contextual Variability | 10–20 min | R (retention/transfer) | Random practice for retention/transfer; Magill & Hall 1990; Guadagnoli CI |
| 8 | Representative Transfer / Simulation | 10–20 min | R (retention/transfer) / O (acquisition) | Ecological dynamics/RLD; practice-to-course transfer; DECADE decision-making |
| 9 | Pressure / Scoring Block | 8–15 min | O (consolidation+) | Choking/reinvestment theory; pressure inoculation; Competition practice |
| 10 | Retest / Post-Session Probe | 5–8 min | R | Confirms learning occurred (not just performance); required for dataset scoring |
| 11 | Reflection & Homework Assignment | 3–5 min | R | PaR Review phase; home practice clarity; sleep consolidation priming (no contamination instruction) |

### 3.2 Block Sequence Rationale — Deep Scientific Review

#### Block 1: Arrival & Intention Setting
The Plan-Act-Review (PaR) framework from the Golf Science Journal identifies pre-shot planning as a critical component that is systematically undervalued in driving-range practice ([PaR Golf](https://www.golfsciencejournal.org/article/5013-par-plan-act-review-golf-motor-learning-research-and-improving-golf-skills.pdf)). Motor learning research confirms that planning before action is critical for learning: blocked practice minimizes planning (the same motor program is re-executed with minimal elaborative rehearsal), while random practice forces full re-planning on every attempt — which is the actual mechanism for the contextual interference benefit. Therefore, making intention explicit at the start of session creates the cognitive framework for learning to occur throughout. **Forefront application:** 3 questions at session start — what are we working on, what does success look like today, how do I know the session was worth the time?

**Block interdependency:** Intention must reference the diagnostic branch (Section 6) and the motor learning stage. An acquisition session has different "success" criteria than a transfer session.

#### Block 2: Physical Warm-Up
The TPI screen and Forefront warmup KB establish a clear hierarchy: TPI fails insert targeted correctives before any loaded or speed-demanding movement. Charlie Francis's rule — mild forehead sweat = ready — provides the physiological benchmark. The warmup is not optional; it is the injury-prevention and performance-prerequisite gate. Joint-by-joint model (Boyle/Cook) ensures mobility (ankle, hip, t-spine, shoulder) and stability (foot, knee, lumbar, scapula) are both addressed.

**Golf-specific rule:** Players with active TPI fails at hip IR, thoracic rotation, or overhead deep squat require 3–5 minutes of targeted correctives embedded in the warmup before any acquisition work. These correctives are not separate from the session — they ARE the physiological gate for the drill blocks.

**Duration scaling:**
- 45-min session → warmup 8 min, all other blocks compressed
- 60-min session → warmup 10 min, standard allocation
- 90-min session → warmup 12–15 min, full block menu available

#### Block 3: Pattern Rehearsal / Bridge
After physical warmup, a short bridge block fires the motor programs being trained before test or acquisition begins. This is NOT acquisition — it is activation of the target motor pattern at slow/light intensity. Slow-motion reps, half-speed rehearsal, feet-together practice swings. This block keeps feedback minimal and is explicitly blocked in schedule (same motion, no variation). The key scientific point: the warmup raised core temperature and activated muscles; this block activates the specific neural pathways being trained.

#### Block 4: Proof Test / Baseline Shot Cluster
**This block is critical and currently absent from most golf practice frameworks.** The diagnostic-first model (visible flaw → diagnostic branch → proof test) requires an anchored baseline before the session's drills begin. Without it, the session has no measurement of where the player started, and therefore no way to confirm that improvement occurred in the session (vs. just warming up).

Protocol: 5–10 shots with the relevant club/situation, scored on the specific metric being trained (e.g., Face-to-Path for a path drill, Low Point for a strike drill, Start Line for a putting drill). Score is recorded as the session anchor. The post-session retest (Block 10) uses the same protocol.

**Evidence basis:** The distinction between acquisition performance (what happens during practice) and learning (what persists after practice) is the central finding of motor learning science ([Barzyk 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC10899359/)). A proof test before and after gives the coach evidence that learning (not just warm-up performance) occurred.

#### Block 5: Blocked Acquisition
For a new skill or a swing change in the AMG acquisition phase (weeks 1–4), blocked practice is scientifically appropriate. The evidence from Barzyk 2024 (and the underlying Lam, Maxwell, Zhu errorless learning studies) is that errorless blocked practice produces better retention and transfer for *novices* compared to variable or error-rich practice. The challenge point framework ([Guadagnoli](https://golfwell.co/challenge-point/)) adds nuance: once the drill becomes easy/automatic (error rate drops below ~20%), it is time to add variability.

**Critical constraint:** The AMG/Forefront motor learning model (acquisition → consolidation → retention → transfer → maintenance) restricts blocked acquisition to a maximum of 18 RLU/day with a new pattern. Exceeding this volume during acquisition degrades the quality of motor encoding. Blocked acquisition should exit toward serial variability when the player can execute the target checkpoint score ≥6/10 on the AMG scale.

**When blocked acquisition is contraindicated:** Maintenance stage, transfer stage, pre-tournament (T-4wk), in-season period without a specific diagnostic need. In these contexts, the dropdown should suppress this block entirely.

#### Block 6: Serial Variability
The serial schedule (ABCABCABC) is the bridge between blocked (AAABBBCCC) and random (CBABACBCA) practice. Research by Porter and Magill (2010) — referenced in the Barzyk SR — shows that gradually increasing contextual interference (blocked → serial → random) outperforms jumping directly from blocked to random, particularly for intermediate players. Forefront's session design should use serial variability as the transition block for consolidation-stage players.

**Practical form:** Hit 3 shots with drill A (blocked acquisition target), then 2 shots with normal swing to the same target, then 2 shots with drill A from a different lie, then 1 shot to a different target. The interleaving disrupts the repeat-execution pattern without fully removing the practice of the target skill.

#### Block 7: Random / Contextual Variability
For retention and transfer-stage players, random practice is the scientifically superior format. Switching clubs, targets, lies, and trajectories every shot forces re-planning on each attempt — which is exactly the cognitive load that produces durable learning. The practical form for this block is a TrackMan Performance Center session (random target selection) or a coach-directed random sequence.

**Key finding from Barzyk 2024:** The better the player, the more contextual interference is beneficial. For novice players, random practice may be counterproductive because the task difficulty exceeds the challenge point — the player spends time failing, not learning. The adaptation rule: novice (HCP 20+) → serial; intermediate (HCP 10–20) → serial-to-random; skilled (HCP 0–10) → random.

#### Block 8: Representative Transfer / Simulation
This block is the most underutilized in structured golf practice and the most critical for course transfer. The ecological dynamics / representative learning design framework ([Sportsmith](https://www.sportsmith.co/articles/ecological-dynamics/)) requires that practice environments preserve the perceptual-informational structure of performance environments. On a golf course, every shot is unique: different lie, target, wind, distance, stakes, and pre-shot routine. Hitting 50 identical 7-iron shots from a perfect mat to a static target is maximally non-representative.

**Forefront Representative Transfer blocks:**
- PlayBox simulation (Vision54 Think Box / Play Box — commit to a target, full pre-shot routine before every ball)
- DECADE/shot-selection scenarios ("from here, what is the best shot you CAN hit, not the best shot")
- On-course reporting (no TrackMan; rely on ball flight and feel)
- Alternate between full-shot situations and short-game situations mirroring real scoring holes
- Use TPS Performance Center random mode or TrackMan Combine as a structured representative test

#### Block 9: Pressure / Scoring Block
Pressure blocks inoculate against choking. The reinvestment/choking literature (Masters 1992; Beilock 2004) establishes that choking occurs when explicit attention is reinvested in automated movements — which is exactly what an overly analytical, feedback-saturated practice environment produces. Pressure drills should be used in consolidation and later stages, never in acquisition.

**Methods:** Competition (vs. coach, vs. self-PB, vs. TM Combine score), countdown games (last 5-of-5 must be in landing zone), penalty/reward systems (miss = pushup or compliment depending on personality), audience simulation (social pressure exposure).

**Contraindication:** Never use pressure blocks when a player is anxiety-prone and the diagnostic branch is a technique acquisition. The anxiety amplifies the skill deficit instead of inoculating against it.

#### Block 10: Retest / Post-Session Probe
The same test used in Block 4, repeated. This gives the session a learning verdict: if the metric improved vs. the baseline cluster, learning likely occurred. If it did not improve or is worse — common in early acquisition when performance temporarily declines — the coach uses this as a "transfer-appropriate" indicator (the player is in a normal dip).

**Coaching script:** "The numbers right now don't tell us what you'll do in a week. The dip is normal. Here's what we're looking for: [metric] to settle into a better average by session 3–4."

#### Block 11: Reflection & Homework
PaR Review phase. Three closing questions: what improved, what still needs work, what is the one thing to practice before next session. The no-contamination instruction is critical for sleep consolidation: Walker 2005 demonstrates that sleep within 24 hours of learning is essential — and that learning a different, conflicting motor skill in the same session can interfere with consolidation. Therefore, homework should reinforce the session's target pattern, not introduce new patterns.

**Sleep gate rule:** If the session is within 2 hours of sleep, practice quality tasks only (stroke fundamentals, chipping, touch shots) — nothing neurologically demanding (speed training, radical new pattern). Schedule demanding acquisition sessions for morning or afternoon, not late evening.

---

## 4. Motor Learning Rules by Block

### 4.1 Stage Definitions

| Stage | Description | Timeline | Practice Schedule | Feedback Rate | Tech Use | Cue Type |
|-------|-------------|----------|------------------|---------------|----------|----------|
| Acquisition | Learning new movement; high error rate | Weeks 1–4 | Blocked (errorless preferred for novices) | High (50–75%) | Full TM/3D — data to coach, not always player | Internal OK; External preferred |
| Consolidation | Pattern stabilizing; errors decreasing | Weeks 4–8 | Blocked→Serial | Moderate (33–50%) | Moderate — fading TM use | External focus; avoid internal |
| Retention | Pattern durable; can self-correct | Weeks 8–12 | Serial→Random | Low (20–33%) | Limited — ball flight only | External/analogical |
| Transfer | Pattern works on course under pressure | Weeks 12–16+ | Random→Representative | Very Low (10–20%) | None during transfer block | Process cue pre-shot; no mechanics during shot |
| Maintenance | Pattern automated; preserve, not rebuild | Ongoing | Random+Pressure | Minimal | Checkup only | Course-based feedback |

### 4.2 Feedback Rules by Block

| Block | KR (Outcome) | KP (Mechanics) | Video | TrackMan | Bandwidth Rule |
|-------|-------------|----------------|-------|----------|----------------|
| Arrival/Intention | None | None | None | None | — |
| Physical Warmup | Proprioceptive only | Corrective cues for TPI fails | None | None | 100% (corrective) |
| Pattern Rehearsal | None | Minimal | Optional slow-mo review | None | 20–33% |
| Proof Test | Ball flight + TrackMan | None | None | Every shot | 100% (baseline only) |
| Blocked Acquisition | Every 3–5 shots | 1 cue maximum | Every 5 shots if coach present | Every shot (data to coach) | 33–50% player-facing |
| Serial Variability | Every shot (ball flight) | Every 5 shots | Every 10 shots | Spot check | 20–33% |
| Random Variability | Ball flight only | Avoid | Avoid during block | Random mode only | 10–20% |
| Representative Transfer | Ball flight + feel | None | None | None (on-course sim) | <10% |
| Pressure/Scoring | Score only | None | None | Score display | None |
| Retest | Full TM + ball flight | None | Optional | Every shot | 100% (diagnostic) |
| Reflection | Verbal summary | None | Optional review | None | — |

**Evidence basis:** Winkelman coaching framework (33–50% feedback superior to 100% for internal focus; 33% and 100% equivalent for external focus); Butki & Hoffman 1998 KR-deprived groups outperform continuous KR at retention ([Barzyk 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC10899359/)); guidance hypothesis — guidance aids performance but hurts retention.

### 4.3 Cueing Rules by Stage

| Stage | Primary Cue Type | Cue Focus | Max Cues | Example (Path Drill) | Evidence |
|-------|-----------------|-----------|----------|---------------------|----------|
| Acquisition | Internal + External | Technique checkpoint | 1 internal + 1 external | "Feel the club tracking inside the gate" (external) | Carson & Collins 2011 — internal needed to initiate change |
| Consolidation | Primarily External | Movement effect | 1 external only | "Swing into the right side of the net" | Wulf 2013; Winkelman |
| Retention | Distal External | Target/outcome | 1 outcome cue | "Hit it to the flag" | Bell & Hardy — distal external > proximal external |
| Transfer | Process External | Pre-shot only; no mid-swing | 0 during swing | "Pick your landing spot" (pre-shot only) | OPTIMAL theory; Vision54 |
| Maintenance | Outcome/Game | Course language | 0 technique | "Play the shot you'd play on 18 with a 2-stroke lead" | Expert-pattern |

**Winkelman's 1-in/1-out rule:** Never layer two coaching cues simultaneously. When adding a new cue, remove the previous one. Maximum cognitive load principle — adding attentional capacity takes focus away from actual movement execution.

### 4.4 Technology Use Rules by Block

| Technology | Acquisition | Consolidation | Retention | Transfer | Pressure | Notes |
|-----------|-------------|--------------|-----------|----------|----------|-------|
| TrackMan (full data display) | ✅ Coach-facing | 🟡 Selective metrics | ❌ Suppress display | ❌ | ❌ | Feedback dependency risk if overused |
| TrackMan (ball flight only) | 🟡 | ✅ | ✅ | 🟡 | ❌ | Ball flight is representative of course |
| TrackMan Combine | ❌ | 🟡 Baseline | ✅ Monthly | ✅ Scoring | ✅ Pressure test | Best for retention/transfer measurement |
| TrackMan Performance Center | ❌ | 🟡 | ✅ | ✅ | ✅ | Random mode for transfer; scoring for pressure |
| Sportsbox 3D | ✅ Diagnosis | 🟡 | ❌ | ❌ | ❌ | Diagnosis only; never during transfer |
| SAM PuttLab | ✅ | 🟡 | ❌ | ❌ | ❌ | Stroke mechanics diagnosis; suppress during feel work |
| HackMotion | ✅ | 🟡 | ❌ | ❌ | ❌ | Wrist angle acquisition only |
| Force plate / Swing Catalyst | ✅ | 🟡 | ❌ | ❌ | ❌ | GRF diagnosis; not during transfer |
| Video (slow-mo) | ✅ | 🟡 | ❌ | ❌ | ❌ | Post-shot review in acquisition; none in transfer |
| Blast Motion (putting) | ✅ | 🟡 | ❌ | ❌ | ❌ | Stroke mechanics only |

### 4.5 Variability and Transfer Rules

The ecological dynamics framework ([Sportsmith 2022](https://www.sportsmith.co/articles/ecological-dynamics/)) establishes that skill is perception-action coupled — it cannot exist outside game context. Practice must preserve the information structure of the game. Key rules:

1. **No two consecutive shots to the same target in transfer block** (representative of on-course reality)
2. **Trajectory variation is mandatory in contextual variability** (high, low, draw, fade — not just one ball flight)
3. **Lie variation** is required for short game transfer blocks (fairway, rough, tight, fluffy, hardpan)
4. **Pre-shot routine** is mandatory in transfer and pressure blocks; optional in acquisition
5. **Distance variation** is required for wedge transfer (10-yard windows, not single distances)

---

## 5. Physiology and Readiness Integration

### 5.1 Warmup Architecture by Session Type

| Session Type | Warmup Duration | Key Components | Exit Criterion |
|-------------|----------------|----------------|----------------|
| Full Swing Change (Acquisition) | 12–15 min | TPI correctives for active fails + FRC CARs + pattern activation swings | Mild forehead sweat; no joint pain |
| Speed Training (Overspeed) | 12–15 min | Full CNS activation; progressive swing speeds; band resistance | Club speed within 5% of session PR baseline |
| Putting/Short Game | 8–10 min | Joint CARs; putting routine 5 practice strokes; grip/feel check | Consistent putting stroke tempo |
| On-Course Simulation | 10 min | TPI correctives if needed; 3 half-speed swings + 3 full swings; chipping touch | Full mobility and rhythm achieved |
| Post-Rehab/Pain Monitor | 15–20 min | Pain score check; targeted corrective for affected area; gradual progression | Pain score ≤3/10 throughout warmup |

### 5.2 Readiness Gate System

Forefront uses a 4-variable readiness composite before session planning occurs. If ANY gate fails, the session plan downgrades.

| Gate | Assessment | Pass | Caution | Fail |
|------|-----------|------|---------|------|
| Pain | Silbernagel 0–10 VAS, movement-specific | ≤2/10 | 3–4/10 | ≥5/10 |
| Sleep | Self-report hours last night | ≥7 hrs | 6–7 hrs | <6 hrs |
| Fatigue | RPE resting (Borg scale) | ≤3/10 | 4–5/10 | ≥6/10 |
| Round Proximity | Days since last round / days to next round | ≥3 days; ≥4 days | 2 days | Same day / next day |

**Gate failure consequences:**

| Combination | Session Modification |
|-------------|---------------------|
| Pain ≥5/10 | Cancel or restrict to pain-free movements only; no acquisition; no speed |
| Sleep <6 hrs | No new pattern acquisition (Walker 2005: sleep on first night is critical); maintenance or feel work only |
| Fatigue ≥6/10 | No speed training; no maximum-intent drills; reduce blocked acquisition volume by 50% |
| Round tomorrow | No new technique introduction; 80% game-based; confidence-building only |
| Round today | Warmup only; putting touch; course management mental rehearsal |
| Post-round (same day) | Low-intensity only; no TrackMan data review unless routine; reflection/reflection only |

**Evidence basis:** Silbernagel pain monitor ([PubMed 17307888](https://pubmed.ncbi.nlm.nih.gov/17307888/)); Walker 2005 sleep and motor consolidation; ACWR framework for load management.

### 5.3 Speed Gate System (Overspeed / Club Head Speed Sessions)

Before any overspeed session begins, three physiological gates must be passed:

| Gate | Requirement | Source |
|------|-------------|--------|
| Strength foundation | FMS ≥14; TPI screen pass for hip IR and t-spine rotation | TPI / Cressey |
| Mobility adequacy | Hip IR bilateral ≥25°; t-spine rotation ≥40° per side | TPI screen |
| Pain clear | Pain 0/10 at full swing | Silbernagel model |

Speed training is NEVER appropriate during:
- AMG acquisition phase (Weeks 1–4 of swing change) — GP-06 × GP-02 conflict (-0.30 congruence)
- T-4 weeks pre-tournament (maintenance dose only)
- Post-injury or pain >2/10

### 5.4 Junior Adaptation Rules

| Variable | Standard | Junior Adaptation | Evidence |
|----------|----------|------------------|----------|
| Session volume | 60–90 min | 30–45 min (attention window) | LTAD model |
| Blocked acquisition reps | ≤18 RLU/day | ≤10 RLU/day | LTAD + attention research |
| Feedback frequency | 33–50% | 50–75% (more encouragement, less correction density) | Expert-pattern |
| Pressure blocks | Consolidation+ | Maintenance+ only (confidence preservation) | SDT / developmental |
| Speed training age | Any | 12+ with strength base; 16+ for full protocol | LTAD / Cressey |
| Pre-shot routine complexity | Full | Simplified (2-step: look, swing) | Expert-pattern |
| Session block sequence | Full 11 blocks | 5 blocks max (warmup, acquisition, variability, game, reflection) | Attention window |

### 5.5 Senior Adaptation Rules

| Variable | Standard | Senior (55+) | Evidence |
|----------|----------|-------------|----------|
| Warmup duration | 10–12 min | 15–20 min (more tissue prep time) | Francis; joint-by-joint |
| Pain gate | ≤2/10 | ≤2/10 strictly (pink elephant priority) | Weingroff |
| Acquisition volume | ≤18 RLU/day | ≤12 RLU/day | Recovery rate decline |
| Speed training | Standard protocol | Modified (no eccentric emphasis; heel stomp may be contraindicated) | Review required |
| Flexibility focus | Standard | Prioritize hip IR and t-spine rotation (biggest age-related losses) | TPI + FRC |
| Session frequency | 3–4/week | 3/week with rest day between sessions | Recovery window |
| Sleep recovery | 7–8 hrs | 7–9 hrs; nap endorsed | Walker 2005 |

### 5.6 Post-Rehab Adaptation Rules

| Variable | Post-Rehab Requirement | Gate System |
|----------|----------------------|------------|
| Pain monitor | Silbernagel 0–5/10 during session | Abort if >5/10 at any point |
| Load progression | ACWR ≤1.3 (training load increase ≤30%/week) | Gabbett 2016 |
| Medical clearance | Required before full-swing acquisition | Hard gate |
| Feedback density | High (monitor symptoms) | Coach must be present |
| Speed training | 6+ weeks after full pain-free swing | Hard gate |
| TPI re-screen | After medical clearance | Confirms which fails were injury-related vs. structural |

---

## 6. Diagnostic Branch Intent → Practice Design Matrix

### 6.1 Branch Intents Defined

Forefront uses 15 primary branch intents, derived from the TrackMan Fingerprint Engine and GTR audit. Each intent drives a specific subset of blocks, drills, tests, and technology.

| ID | Branch Intent | TrackMan Trigger | 3D/Sportsbox Trigger | Priority Action |
|----|--------------|-----------------|---------------------|-----------------|
| BI-01 | Face Angle Control | FAC_ANG SD >2°; two-way miss pattern | Chest Turn @ IMP <+15° or >+40° | Reduce F2P differential |
| BI-02 | Club Path Shape | CLB_PTH consistently OTI or ITI; CRV bias | Pelvis Turn @ IMP <25° open | Match path to intended ball shape |
| BI-03 | Attack Angle / Low Point | ATK_ANG <-5° irons; LOW_PT after ball (fat); LOW_PT before ball (thin) | Pelvis Thrust @ IMP >+2" (early ext); Sway Gap negative @ IMP | Forward contact consistency |
| BI-04 | Strike Quality / Smash | SMSH <1.43 driver or <1.28 irons consistently | Impact height/offset derived from gear effect analysis | Center-face impact |
| BI-05 | Speed / Distance | CLB_SPD <target for HCP level; Ball Speed deficit | Kinematic Sequence order errors; Gain Factor deficits | Increase CHS via sequencing or overspeed |
| BI-06 | Launch Conditions (Driver) | Launch outside Optimizer window; spin loft >16° | Pelvis Lift @ DCH negative = no squat; positive at IMP = no lift | Optimize spin loft for distance |
| BI-07 | Distance Control (Wedge) | CARRY SD >5 yds at target distances; SIDE bias | Not applicable (TrackMan primary) | Wedge landing window consistency |
| BI-08 | Putting Direction | Face Angle @ IMP SD >1°; Two-way miss pattern (SAM PuttLab) | Not applicable | Face consistency at impact |
| BI-09 | Putting Speed Control | Entry Speed variability; STIMP_FL mismatch; ROLL_PCT inconsistency | Not applicable | Speed/distance control |
| BI-10 | Kinematic Sequence | Kinematic sequence order errors; Gain Factor <1.3 Core | Chest Turn Speed Max before Pelvis Turn Speed Max | Correct segment sequence |
| BI-11 | GRF / Pressure Shift | Force plate: late lead-side shift; no braking force | Pelvis Sway @ IMP <+2" or >+6"; Lift deficit at DCH | Pressure timing and lead braking |
| BI-12 | Short Game (Chipping) | Low_point inconsistency from short distances; Carry SD at 20-40 yds | Not applicable | Low-point control, loft/face |
| BI-13 | Short Game (Bunker) | Bunker splash zone inconsistency; fat/thin pattern from sand | Not applicable | Entry point and sand interaction |
| BI-14 | Course Management | DECADE decision audit; penalty_strokes_per_round >1.5 | Not applicable | Shot selection and game planning |
| BI-15 | Wrist/Shaft Control | F2P inconsistency without path or face structural cause; Spin Axis bias | Lead Wrist Angle @ arm parallel (HackMotion) | Wrist sequencing control |

### 6.2 Branch Intent → Block/Drill/Test Matrix

| Branch Intent | Required Blocks | Forbidden Blocks | Primary Drill Families | Test Protocol | Technology |
|--------------|----------------|-----------------|----------------------|---------------|-----------|
| BI-01 Face Angle | 4,5,6,7,8,10 | — | Face Awareness, Impact Tape, Gate Drills, Grip Check | Face corridor test (5 shots: F2P ≤±2°) | TM full; HackMotion optional |
| BI-02 Club Path | 4,5,6,7,8,10 | — | Alignment rod path, Inside approach gate, Towel drill | Path corridor test (5 shots: CLB_PTH within ±2° of target) | TM full |
| BI-03 Attack Angle | 4,5,6,7,8,10 | — | Tee progression, Ball-position ladders, Downhill slope | Low-point test (5 shots: LOW_PT at or after ball for irons) | TM + video; Sportsbox optional |
| BI-04 Strike Quality | 4,5,6,7,8,10 | — | Impact tape, Dr. Scott Lynn strike brush, Foot powder spray | Smash factor cluster (SMSH SD <0.02 over 5 shots) | TM full; Sportsbox |
| BI-05 Speed | 2,3,4,5,9,10 | 7,8 (during speed protocol) | SuperSpeed/Mach3 protocol, Med ball rotational, Force plate activation | CHS baseline; Speed session PR tracking | TM no-ball mode; PRGR |
| BI-06 Launch Conditions | 4,5,7,10 | — | Attack angle drill (positive AoA driver), Tee height ladder | Optimizer green zone test (5 shots within launch/spin window) | TM Optimizer |
| BI-07 Distance Control | 4,5,6,7,8,10 | — | Wedge matrix (50/75/100% shots), Landing window targets | Wedge landing window test: 3 distances, 5 shots each, SD <5yds | TM Combine (wedge distances) |
| BI-08 Putting Direction | 4,5,6,7,8,10 | 9 (early stage) | Gate putting drills, Mirror feedback, Aim alignment | Start-line gate test (10 putts from 6ft, <1° face angle deviation) | SAM PuttLab; Blast Motion |
| BI-09 Putting Speed | 4,5,6,7,8,9,10 | — | Clock drill, Ladder drill, Stimp-adjusted distance targets | Speed corridor test (10 putts from 20ft: ball stop 1–2ft past) | SAM PuttLab entry speed |
| BI-10 Kinematic Sequence | 4,5,6,8,10 | 9 | Pelvis lead drill, Separation drills, Pump drill, Step-through | Kinematic sequence audit (Sportsbox: Pelvis peaks first, CGF ≥1.3) | Sportsbox 3D required |
| BI-11 GRF / Pressure | 4,5,6,8,10 | 9 | Lead hip shift drill, Heel stomp, Lead-side post-up | Pressure shift test (Swing Catalyst: lead foot >75% at impact) | Force plate required |
| BI-12 Short Game Chipping | 4,5,6,7,8,9,10 | — | Sieckmann finesse wedge, Bump-and-run, Low-point tape | Proximity test: 10 chips from 20yd, avg <5ft | None required; TM optional |
| BI-13 Bunker | 4,5,7,8,10 | — | Splash point circle, Line-in-sand drill, Club face open training | Bunker test: 5 shots, exit rate ≥80%, avg proximity <10ft | Video; TM optional |
| BI-14 Course Management | 1,8,11 | 4,5,6,7 | DECADE decision tree, PlayBox simulation, On-course audit | DECADE decision quality score; penalty stroke rate | None (cognitive) |
| BI-15 Wrist/Shaft | 4,5,6,7,10 | — | HackMotion wrist training, Alignment rod shaft plane, Split-hand drill | HackMotion wrist angle at arm parallel (target window) | HackMotion required |

---

## 7. Drill Library Architecture

### 7.1 Drill Family Taxonomy

Drill families are parent categories. Each family contains 3–8 specific drill cards. The family defines the motor learning intent; the cards define the specific implementation.

| Family ID | Family Name | Motor Learning Intent | Block Placement | Stage Range | Expert Lens |
|-----------|------------|----------------------|-----------------|-------------|-------------|
| DF-01 | Impact Tape / Strike Pattern | Proprioceptive feedback, self-correction of strike | 5 (blocked), 6 | Acquisition, Consolidation | Dr. Scott Lynn, AMG |
| DF-02 | Alignment Rod Path | External path guidance; visual feedback | 5, 6 | Acquisition, Consolidation | Various instructors |
| DF-03 | Gate / Corridor Drills | Constraints-led external reference | 5, 6, 7 | Acquisition, Consolidation | Constraints-led approach |
| DF-04 | Tee Progression | Attack angle and low point control | 5, 6 | Acquisition, Consolidation | AMG / TPI |
| DF-05 | D-Plane Awareness | Face/path understanding and control | 5, 6 | Acquisition | TrackMan University |
| DF-06 | Separation / X-Factor | Pelvis-chest separation drills | 5, 6 | Acquisition | AMG, Sportsbox |
| DF-07 | Pressure Shift / Ground Force | Lead-side braking and sequencing | 5, 6 | Acquisition | Dr. Kwon, Dahlquist, Como |
| DF-08 | Kinematic Sequence | Proximal-to-distal sequencing drills | 5, 6 | Acquisition, Consolidation | TPI/Cheetham, AMG |
| DF-09 | Speed Drills (Overspeed) | Neurological speed ceiling elevation | 5 | Any (not during GP-06 acq.) | SuperSpeed, Mach3, Koch |
| DF-10 | Med Ball Rotational | Power expression in golf pattern | 5 | Consolidation+ | TPI, Cal Dietz |
| DF-11 | Wedge Matrix | Distance control across effort levels | 5, 6, 7, 8 | Any | Sieckmann, Pelz |
| DF-12 | Putting Gate / Mirror | Face control and path alignment | 5, 6 | Acquisition, Consolidation | SAM PuttLab, Sweeney |
| DF-13 | Putting Distance Control | Speed and length calibration | 5, 6, 7 | Acquisition, Consolidation | Sweeney, Pelz, Faxon |
| DF-14 | Green Reading | Break recognition and AimPoint | 8 | Retention, Transfer | AimPoint/Sweeney, Joseph Mayo |
| DF-15 | Finesse Wedge / Short Game | Trajectory variety and lie adaptation | 5, 6, 7, 8 | Any | Sieckmann, Short Game Chef |
| DF-16 | Bunker Technique | Sand interaction and splash zone | 5, 6, 7 | Acquisition, Consolidation | Short Game Chef, Sieckmann |
| DF-17 | Mobility / Corrective | Physical limitation correction integrated | 2, 3 | Any (pre-drill gate) | TPI, FRC, DNS |
| DF-18 | Pressure / Competition | Stress inoculation under scoring | 9 | Consolidation, Retention, Transfer | Vision54, DECADE |
| DF-19 | On-Course Simulation | Transfer with full game context | 8 | Retention, Transfer | DECADE, Vision54, RLD |
| DF-20 | Wrist / Shaft Control | Club face and shaft plane management | 5, 6 | Acquisition, Consolidation | HackMotion, AMG |

### 7.2 Drill Cards — 60 High-Value Drill Cards (Seed Dataset)

**Format:** Each card includes ID, name, family, intent, stage, level, blocks, cueing, feedback rule, success metric, progression trigger, regression trigger, contraindications, tech, expert lens, evidence tag.

---

#### FULL SWING — FACE/PATH/STRIKE

**DC-001: Impact Tape Cluster Drill**
- Family: DF-01 | Branch: BI-04 | Stage: Acquisition | Level: L1–L4
- Blocks: 5 | Tools: Impact tape or foot powder spray
- Description: Apply impact tape to clubface. Hit 5-shot clusters with a specific strike location target (center cluster ≤15mm radius). Review tape after every 3–5 shots.
- Cue: "Swing through the center of the gate" (external)
- Feedback Rule: Review tape after every 3 shots; no feedback within shots
- Success Metric: 5 consecutive shots within 15mm of center
- Progression: Reduce tape window to 10mm; advance to 7-iron then longer clubs
- Regression: Use shorter club; slow-motion swings first
- Contraindications: None
- Tech: TM Smash Factor + Spin Axis correlation confirms strike location
- Expert Lens: Dr. Scott Lynn (strike-first principle); AMG impact position
- Evidence Tag: `expert_framework`

**DC-002: Alignment Rod Path Gate**
- Family: DF-02 | Branch: BI-02 | Stage: Acquisition, Consolidation | Level: L2–L4
- Blocks: 5, 6 | Tools: 2 alignment rods
- Description: Place rods to define a path corridor (e.g., 4° inside-out). Ball must exit through corridor without touching rods.
- Cue: "Swing the club through the window" (external)
- Feedback Rule: Rod contact = intrinsic immediate feedback; verbal coach feedback every 5 shots only
- Success Metric: 8/10 shots exit corridor without rod contact
- Progression: Narrow the corridor by 1°; add serial block (vary target direction)
- Regression: Widen corridor; use slower swing speed; practice swings only
- Contraindications: Not for BI-01 (face angle) — path gate doesn't address face
- Tech: TM Club Path confirms; Sportsbox chest sway gap
- Expert Lens: Various; AMG checkpoint cp3–cp5
- Evidence Tag: `expert_framework`

**DC-003: Towel Under Lead Arm (Connection)**
- Family: DF-08 | Branch: BI-10, BI-02 | Stage: Acquisition | Level: L1–L3
- Blocks: 5 | Tools: Towel
- Description: Place towel under lead arm against body. Hit shots (7-iron, 80% speed) keeping towel in place through impact. Towel falling = disconnection = compensatory flip.
- Cue: "Hug the towel until after impact" (external-body contact point)
- Feedback Rule: Towel drop = intrinsic immediate feedback
- Success Metric: 8/10 shots, towel stays through impact
- Progression: Full speed; progress to longer clubs
- Regression: Slow motion swings only; shorter club
- Contraindications: Not for speed training (constrains arm speed)
- Tech: Sportsbox Core Gain Factor; video arm tracking
- Expert Lens: AMG connection principle; TPI
- Evidence Tag: `expert_framework`

**DC-004: Tee Height Ladder (Attack Angle)**
- Family: DF-04 | Branch: BI-03, BI-06 | Stage: Acquisition | Level: L1–L4
- Blocks: 5, 6 | Tools: Tees at 3 heights (flush, ½ inch, 1 inch driver)
- Description: Irons: hit 3 shots from ball-on-tee (½ inch) confirming positive strike, then 3 from ground. Driver: progressively raise tee to find maximum upward AoA. Each height cluster logged on TrackMan.
- Cue: Irons: "Brush the ground after the ball" (external); Driver: "Sweep it off the top of the tee" (external)
- Feedback Rule: TM Attack Angle every shot during acquisition; ball flight only during consolidation
- Success Metric: ATK_ANG ≥+2° driver; ATK_ANG -2° to -4° irons; LOW_PT after ball irons
- Progression: Remove tee; replicate feel from ground
- Regression: Add second tee behind ball as low-point marker
- Contraindications: None
- Tech: TM required (ATK_ANG measurement)
- Expert Lens: TrackMan University; AMG cp4 (impact position)
- Evidence Tag: `evidence_supported` (D-Plane physics: ATK_ANG relationship to spin loft is mathematically validated)

**DC-005: Downhill Slope Slide Correction**
- Family: DF-07 | Branch: BI-02, BI-11, BI-04 (slide) | Stage: Acquisition | Level: L2–L4
- Blocks: 5 | Tools: Slope board or downhill lie; alignment rod optional
- Description: Place ball on or simulate a downhill lie (trail foot higher than lead foot by 2–4 inches). Hit half-speed 7-irons. Downhill slope naturally promotes lead-side braking and rotation conversion; prevents lateral slide.
- Cue: "Post up into the hill" (external/Dr. Lynn framework)
- Feedback Rule: Visual observation; TM Low Point; ball flight
- Success Metric: Reduction in Pelvis Sway @ IMP from >+6" to +3–5" range (Sportsbox) over 5-session block
- Progression: Return to flat lie and replicate feel
- Regression: Slower speed; wider stance for stability
- Contraindications: Hip or knee pain (slope creates lateral load); senior clients with balance issues
- Tech: Sportsbox 3D (Pelvis Sway @ IMP); force plate optional
- Expert Lens: Dr. Scott Lynn (lateral slide → braking conversion)
- Evidence Tag: `expert_framework`

**DC-006: Pump Drill (Sequence)**
- Family: DF-08 | Branch: BI-10 | Stage: Acquisition | Level: L2–L4
- Blocks: 5 | Tools: Club
- Description: Take club to top of backswing. Without hitting, initiate lower body first (pelvis shift → rotation), pausing at hip-high position (DCH / P5). Confirm pelvis opens before chest. Repeat 3×, then full swing.
- Cue: "Let your hips beat your hands to the ball" (external/outcome)
- Feedback Rule: Visual coach observation; Sportsbox timing if available; verbal every 3 pumps
- Success Metric: Pelvis Turn Speed Max occurs before Chest Turn Speed Max in Sportsbox
- Progression: Add full swing after 3 pumps; increase speed
- Regression: Half-speed pumps; wall-based drill for tactile feedback
- Contraindications: Not for senior clients with hip restrictions until hip IR is addressed
- Tech: Sportsbox (kinematic sequence visualization)
- Expert Lens: AMG; TPI Greg Rose; Dahlquist
- Evidence Tag: `expert_framework`

**DC-007: Chest-Over-Pelvis Lead (AMG)**
- Family: DF-06 | Branch: BI-10, BI-02 | Stage: Acquisition, Consolidation | Level: L2–L4
- Blocks: 5, 6 | Tools: Club
- Description: From top of backswing, feel the chest staying stacked over (or slightly ahead of) the pelvis as a unit through early downswing before the release. The "lead arm depth" concept — hands in at mid-foot depth at top produces inside path naturally.
- Cue: "Stack chest over belt buckle on the way down" (external-body)
- Feedback Rule: Video (face-on) confirmation of arm depth at top; verbal every 5 shots
- Success Metric: Lead arm hands at or behind mid-foot line at top on face-on video
- Progression: Add to serial block with path gate
- Regression: Mirror feedback; practice swings only
- Contraindications: Not for speed training sessions (constrains)
- Tech: Sportsbox Chest Sway / Sway Gap; video face-on
- Expert Lens: AMG (lead arm depth); Dahlquist
- Evidence Tag: `expert_framework` (AMG GEARS data)

**DC-008: Sway Gap Drill (Chest-Pelvis Separation)**
- Family: DF-06 | Branch: BI-10 | Stage: Acquisition | Level: L3–L4
- Blocks: 5 | Tools: Club; chair/resistance band optional
- Description: Stand with pelvis braced against a surface (chair back or band). Make backswing while keeping pelvis minimally mobile. Focus on chest coiling around the stable pelvis. This creates X-factor separation (target >35°).
- Cue: "Wind up your shoulders around a post" (external)
- Feedback Rule: Sportsbox X-Factor metric; visual coil confirmation
- Success Metric: X-Factor at top ≥35° (Sportsbox); Pelvis Turn @ TOP <-40°, Chest Turn <-85°
- Progression: Remove external feedback; replicate feel at speed
- Regression: Exaggerated slow coil without hitting
- Contraindications: Thoracic mobility restriction (must address first in warmup)
- Tech: Sportsbox 3D (X-Factor calculation)
- Expert Lens: AMG; TPI
- Evidence Tag: `expert_framework`

**DC-009: Step-Through Drill (Lead Side Braking)**
- Family: DF-07 | Branch: BI-11, BI-10 | Stage: Acquisition, Consolidation | Level: L2–L4
- Blocks: 5, 6 | Tools: Club; TM optional
- Description: From normal setup, feel the downswing initiation as a lead-foot stomp → braking → rotation conversion. Like a pitcher's landing mechanic. Hit half-speed shots with exaggerated lead-heel stomp before rotation initiates.
- Cue: "Stomp the ground and spin" (external/action)
- Feedback Rule: Auditory feedback from stomp; TM Club Speed; visual observation
- Success Metric: Club Speed maintained or increased; reduction in Pelvis Sway @ IMP toward +3–5" range
- Progression: SuperSpeed heel stomp position (Level 2 protocol); full speed
- Regression: Stationary stomp drill without club; slow motion
- Contraindications: Knee pain (lead knee braking force); ankle instability
- Tech: TM (speed confirmation); Swing Catalyst/force plate ideal but optional
- Expert Lens: Dr. Kwon (lead-side braking); TPI Greg Rose; Como
- Evidence Tag: `evidence_supported` (Kwon frontal plane torque research)

**DC-010: Single-Plane Face Awareness (HackMotion)**
- Family: DF-20 | Branch: BI-01, BI-15 | Stage: Acquisition | Level: L2–L4
- Blocks: 5 | Tools: HackMotion device
- Description: Use HackMotion to provide real-time wrist angle feedback at lead-arm parallel. Target: lead wrist flat (0°) to slightly bowed (-5°) at P5 (arm parallel downswing). Hit shots with auditory cue from HackMotion when out of window.
- Cue: "Bow the wrist like you're throwing a frisbee" (external if needed) or "Watch the green light" (external device feedback)
- Feedback Rule: HackMotion every-rep feedback during acquisition; remove device in consolidation
- Success Metric: 8/10 shots within ±5° of target wrist angle at P5 (HackMotion)
- Progression: Remove HackMotion; replicate feel; test with TM Face Angle
- Regression: Slow motion with HackMotion only; no ball
- Contraindications: Wrist injury (contraindicated entirely)
- Tech: HackMotion required; TM Face Angle confirms
- Expert Lens: AMG; TrackMan University (face angle = wrist angle relationship)
- Evidence Tag: `expert_framework`

---

#### SPEED / POWER DRILLS

**DC-011: SuperSpeed Level 1 Protocol (Both Sides)**
- Family: DF-09 | Branch: BI-05 | Stage: Any (not GP-06 acq.) | Level: L2–L5
- Blocks: 5 | Tools: SuperSpeed golf sticks (light/medium/heavy)
- Description: Normal stance, both sides. 3×3 each side per weight. Maximum intent every swing. 60–90 seconds rest between sets. Monitor speed with PRGR or TM no-ball mode.
- Cue: "Swing as fast as you possibly can — feel like the stick might fly out of your hands" (external/outcome)
- Feedback Rule: Speed feedback every swing required; verbal from coach every set
- Success Metric: 3–5% CHS increase over 4–6 week protocol vs. baseline
- Progression: Level 2 (add heel stomp); Level 3 (add double-step)
- Regression: Single side only; reduce reps; check mobility gates
- Contraindications: Active GP-06 acquisition (conflict); elbow/wrist tendinopathy; T-4wk tournament
- Tech: PRGR speed radar required; TM no-ball mode ideal
- Expert Lens: SuperSpeed Golf; Mach 3 (Koch)
- Evidence Tag: `evidence_supported` (SuperSpeed 5–8% avg gain; Mach3 avg 11.5 mph)

**DC-012: Rotational Med Ball Wall Slam (Hip Speed)**
- Family: DF-10 | Branch: BI-05, BI-10 | Stage: Consolidation, Retention | Level: L2–L5
- Blocks: 5 | Tools: Med ball (3–6 kg); solid wall
- Description: Trail-foot pivot → hip drive → slam med ball into wall at waist height. Mimic golf swing sequence. 3×8 each side. Maximum intent. Rest 90s between sets.
- Cue: "Drive off your back foot like kicking a door open" (external)
- Feedback Rule: Speed/power expression per rep; verbal every set
- Success Metric: Consistent pelvis-first initiation visible on slow-motion video; maintain or increase throwing distance
- Progression: Increase ball weight; add step-change (step and throw)
- Regression: Reduce ball weight; slower rotational speed; sit-and-throw (seated)
- Contraindications: Low back pain; hip flexor strain; no bench available
- Tech: None required; Sportsbox optional for sequence confirmation
- Expert Lens: TPI (SA-04 med ball rotational throw benchmark); Cal Dietz power block
- Evidence Tag: `evidence_supported` (SA-04 r=0.89 correlation to CHS in golf_physical_performance_correlations)

**DC-013: Countermovement Jump (Power Baseline)**
- Family: DF-10 | Branch: BI-05 | Stage: Any (assessment) | Level: L2–L5
- Blocks: 2 (warmup activation), assessment context | Tools: Jump mat or force plate
- Description: Standard CMJ protocol. Arms free. 3 attempts. Peak height recorded. Correlates to GRF production and CHS potential.
- Cue: "Jump as high as you can" (external/outcome)
- Feedback Rule: Height readout after each jump
- Success Metric: Establish baseline; correlate to CHS via golf_physical_performance_correlations table
- Progression: Weighted CMJ; depth jump
- Regression: Squat jump (no eccentric)
- Contraindications: Knee pain; ankle instability
- Tech: Force plate (ideal); jump mat (practical)
- Expert Lens: TPI (CMJ/IMTP as speed correlates); Cressey
- Evidence Tag: `evidence_supported` (CMJ-CHS correlation via TPI research)

---

#### WEDGE & SHORT GAME DRILLS

**DC-014: Wedge Matrix — Three-Effort System**
- Family: DF-11 | Branch: BI-07 | Stage: Any | Level: L1–L5
- Blocks: 5, 6, 7 | Tools: 3 wedges; TM; landing zone markers
- Description: Hit each wedge (PW, GW, SW) at 50%, 75%, and 100% effort. Record carry and SD for each cell (9 combinations). This is the "Three Wedge System" (Pelz pattern). Establishes the distance matrix for all wedge yardages.
- Cue: "Feel your 50% swing — smooth and easy. 75% adds a little hip. 100% is just a full swing." (external effort scale)
- Feedback Rule: TM Carry per shot; SD calculation after each set of 5
- Success Metric: SD <5 yds within each effort level; full gap coverage 50–130 yds
- Progression: Add trajectory variation (high/low) at each effort; vary lie
- Regression: Single club at one distance; larger landing zone
- Contraindications: None
- Tech: TM Carry required; landing zones helpful but not required
- Expert Lens: Pelz Three Wedge System; Sieckmann finesse wedge
- Evidence Tag: `expert_framework`

**DC-015: Landing Window Target Practice**
- Family: DF-11 | Branch: BI-07 | Stage: Consolidation, Retention | Level: L2–L5
- Blocks: 6, 7, 8 | Tools: Hula hoops or landing zone markers (3m diameter); TM or visual
- Description: Hit to a specific landing zone (not just a distance) at a 10-yard interval. 5 shots per zone. Score: hits in zone / 5. Zones progressively narrowed over weeks (3m → 2m → 1.5m).
- Cue: "Land it in the circle — where it bounces to is bonus" (external/outcome)
- Feedback Rule: Visual outcome per shot; TM Carry confirmation
- Success Metric: 3/5 shots in target zone at each distance
- Progression: Narrow zone; add trajectory constraint (must carry <20ft apex); add lie variation
- Regression: Wider zone; closer distance
- Contraindications: None
- Tech: TM Carry optional
- Expert Lens: DECADE distance control; Sieckmann precision wedge
- Evidence Tag: `expert_framework`

**DC-016: Sieckmann Finesse Wedge — Face Open Sequence**
- Family: DF-15 | Branch: BI-12, BI-13 | Stage: Acquisition | Level: L3–L5
- Blocks: 5 | Tools: Lob wedge (58–64°); TM optional
- Description: Open stance, open face (30–60° depending on shot), soft arms, lead-side stability. Swing left of target with open face — the ball will start right of swing direction due to face dominance. Practice high, soft lobs from tight lies.
- Cue: "Swing left, face points right, ball lands soft" (external/outcome description)
- Feedback Rule: Ball landing angle (soft vs. running); coach visual observation
- Success Metric: Ball landing angle >50° (high/soft trajectory); consistent face-open position at impact
- Progression: Add tight lie variation; add rough lie; increase distance (30→50 yds)
- Regression: Slow-motion swings without ball; chipping mat
- Contraindications: Wrist injury (open face requires maintained supination); beginners (pattern complexity too high)
- Tech: TM Landing Angle; video slow-motion helpful
- Expert Lens: James Sieckmann (finesse wedge — motion-capture verified); Short Game Chef
- Evidence Tag: `expert_framework`

**DC-017: Low-Point Tape Drill (Chipping)**
- Family: DF-12, DF-15 | Branch: BI-12 | Stage: Acquisition | Level: L1–L4
- Blocks: 5 | Tools: Tape line on mat or chalk on grass
- Description: Draw a 6-inch line at the back of the ball. Chip shots should NOT disturb the tape/chalk before the ball. If they do, the strike was behind (fat). After the ball, the low point is correct.
- Cue: "Brush after the ball, not before it" (external/action)
- Feedback Rule: Intrinsic (tape contact gives immediate visual feedback)
- Success Metric: 8/10 chips with no pre-ball tape contact; consistent divot after ball
- Progression: Move to grass; add lie variation; add distance variation
- Regression: Use longer club; practice slow-motion chips only
- Contraindications: None
- Tech: Video to confirm low point; TM Low Point
- Expert Lens: AMG (low point control); TPI
- Evidence Tag: `expert_framework`

**DC-018: Bunker Splash Zone Circle**
- Family: DF-16 | Branch: BI-13 | Stage: Acquisition | Level: L2–L5
- Blocks: 5 | Tools: Rake or chalk; bunker
- Description: Draw a circle 2 inches behind the ball. Trace where the club enters sand — must hit inside the circle. Practice entering sand at the front edge of the circle. 5-shot clusters with immediate sand inspection.
- Cue: "Enter the sand at the line, not at the ball" (external)
- Feedback Rule: Sand disturbance pattern = intrinsic feedback; coach verbal every 5 shots
- Success Metric: 8/10 shots entering sand within 2" of ball (circle front edge)
- Progression: Narrow circle to 1"; add varying sand depths; add distance targets
- Regression: No ball; swing through sand only; draw bigger circle
- Contraindications: Hip/low back pain (aggressive bunker stance)
- Tech: Video to confirm entry point; TM optional
- Expert Lens: Short Game Chef; Sieckmann
- Evidence Tag: `expert_framework`

---

#### PUTTING DRILLS

**DC-019: Gate Putting Drill (Face Control)**
- Family: DF-12 | Branch: BI-08 | Stage: Acquisition, Consolidation | Level: L1–L5
- Blocks: 5, 6 | Tools: Two tees or Pelz Putting Tutor
- Description: Set two tees (or gate device) just wider than the putter head at address. Putt 10 balls from 6 feet. Gate contact = immediate intrinsic feedback of off-path or face-rotation error.
- Cue: "Let the putter swing through without touching the gate" (external)
- Feedback Rule: Gate contact = intrinsic; SAM PuttLab face angle confirmation once every 5 shots if available
- Success Metric: 8/10 putts through gate without contact; SAM face angle SD <1°
- Progression: Add distance (8ft, 10ft); add slope; remove gate and replicate feel
- Regression: Wider gate; slower stroke; putting stroke drills with no ball first
- Contraindications: None
- Tech: SAM PuttLab (confirmation); Blast Motion optional
- Expert Lens: SAM PuttLab (Marquardt); Phil Kenyon
- Evidence Tag: `evidence_supported` (face = 82-90% of start direction; SAM PuttLab data)

**DC-020: Clock Drill (Distance Control)**
- Family: DF-13 | Branch: BI-09 | Stage: Acquisition, Consolidation | Level: L1–L5
- Blocks: 5, 6 | Tools: Hole or marker; 6 tees at clock positions (3ft, 6ft, 9ft, 12ft, 15ft, 18ft = 2ft, 4ft, 6ft, 8ft, 10ft, 12ft from hole in pairs)
- Description: Start at 3-foot position (12 o'clock). Make putt. Move to 6-foot, 9-foot positions. Adjust backstroke length to maintain 2.2:1 tempo ratio. SAM PuttLab verifies timing consistency.
- Cue: "Same pace of swing, just a bigger pendulum for longer putts" (external)
- Feedback Rule: Make/miss + distance past hole (pass 1–2 feet); stroke timing (Sweeney 2.2 ratio)
- Success Metric: 8/10 makes from 3ft; 6/10 from 6ft; all putts 1–2 ft past if missed
- Progression: Uphill to downhill transition; random distance selection
- Regression: Single distance; focus on rhythm only; no ball
- Contraindications: None
- Tech: SAM PuttLab (timing); Blast Motion (tempo ratio)
- Expert Lens: Stephen Sweeney (2.2:1 ratio); Pelz (distance control); Faxon (feel)
- Evidence Tag: `evidence_supported` (SAM PuttLab 2.2:1 timing data; Sweeney Tour data)

**DC-021: Ladder Drill (Speed Control)**
- Family: DF-13 | Branch: BI-09 | Stage: Consolidation, Retention | Level: L2–L5
- Blocks: 6, 7 | Tools: 4 tees at 10, 20, 30, 40 feet from hole
- Description: Hit putts to each tee marker in order (10ft first, then 20, 30, 40). Must reach each marker and not pass the next. Develops variable-distance feel without mechanical manipulation.
- Cue: "Roll it to the tee, not past it" (external/target)
- Feedback Rule: Visual outcome (reached/not reached/overshot); no stroke feedback
- Success Metric: 4/4 putts reach target marker without overshooting next marker
- Progression: Random order (coach calls distance before each putt); add slope
- Regression: Start at 10ft and 20ft only; reduce speed requirement
- Contraindications: None
- Tech: None required
- Expert Lens: Brad Faxon (feel training); DECADE (speed control = #1 scoring variable)
- Evidence Tag: `expert_framework`

**DC-022: AimPoint Express — Green Reading**
- Family: DF-14 | Branch: BI-08, BI-09 | Stage: Retention, Transfer | Level: L3–L5
- Blocks: 8 | Tools: Slope calibration; practice green with varied slopes
- Description: Stand on slope, feel slope % under feet (1–3%). Use finger-width system at arm's length to determine aim point. Account for stimpmeter. Practice on known slopes first, then blind readings.
- Cue: "Feel the slope under your feet — how many percent? Now use that many fingers." (external process)
- Feedback Rule: Putt result (correct/incorrect break); coach confirms slope calculation
- Success Metric: Correct slope assessment ≥80% at 1–2% slopes; correct aim point selection ≥70% from 15ft
- Progression: Double-breaker; increasing distance; compete on reads vs. coach
- Regression: Known slopes only; pure calibration without putting
- Contraindications: Ankle/balance issues for slope standing assessment
- Tech: Stimpmeter for accurate green speed input; optional
- Expert Lens: Mark Sweeney (AimPoint Express); Joseph Mayo (green reading)
- Evidence Tag: `expert_framework`

---

#### TRANSFER & PRESSURE DRILLS

**DC-023: PlayBox Simulation (Vision54)**
- Family: DF-19 | Branch: BI-14, all | Stage: Retention, Transfer | Level: L2–L5
- Blocks: 8 | Tools: Range or practice area; targets; pre-shot routine cue
- Description: Use Think Box / Play Box protocol (Joan Vickers / Vision54). Before each shot (Think Box): full pre-shot routine, club selection, target selection, commit fully. Enter Play Box: no mechanics, only target. 10-shot sequence simulating a full hole or routing.
- Cue: In Think Box: "Where is it going, how is it getting there?" In Play Box: "See the shot, feel the shot, trust it." (process cues only)
- Feedback Rule: Ball flight and result only; NO TrackMan data display; NO stroke mechanics review
- Success Metric: Commit rate ≥80% (self-reported or coach-observed); make it to Play Box with clear target
- Progression: Add pressure (must-make shots); add variety (different lies, clubs, targets)
- Regression: Single shot with full routine; remove scoring; pure visualization
- Contraindications: Acquisition stage (too early for pure transfer)
- Tech: None during this block
- Expert Lens: Vision54 (Pia Nilsson / Lynn Marriott Think Box / Play Box); DECADE
- Evidence Tag: `expert_framework`

**DC-024: DECADE Shot-Selection Audit**
- Family: DF-19 | Branch: BI-14 | Stage: Transfer, Maintenance | Level: L2–L5
- Blocks: 8 | Tools: Scorecard or app; on-course context or simulation
- Description: For each shot situation, before selecting club/shot shape, identify: (1) what the smart play is for this situation, (2) what you can execute with >70% success, (3) your realistic miss. Use "Decision Quality Score" = was the decision correct given what you know? (separate from execution quality).
- Cue: "What shot can you hit successfully 7 out of 10 times from here? Play that one." (external decision)
- Feedback Rule: Decision quality score (1-5) logged after each hole; execution score separate
- Success Metric: Decision Quality Score ≥3.5/5.0 across 18 holes; reduction in penalty strokes/round
- Progression: Live round application; post-round audit with coach
- Regression: Simulator use; coach-guided scenario practice
- Contraindications: None
- Tech: None during execution; post-round app or scorecard
- Expert Lens: DECADE (Fawcett); Vision54
- Evidence Tag: `expert_framework`

**DC-025: Par-3 Scoring Game (Pressure Inoculation)**
- Family: DF-18 | Branch: BI-14, all | Stage: Consolidation, Retention | Level: L2–L5
- Blocks: 9 | Tools: Range targets at par-3 distances; scorecard
- Description: Choose 6 "par-3 holes" at varied distances (100–180 yds). Each hole = 3 attempts; score vs. par. Total score tracked session-to-session. Self-competition pressure without external judgment (early stage) → vs. coach/partner (later stage).
- Cue: "Play the hole, not the technical thing. Trust your swing." (process/external)
- Feedback Rule: Score only; no stroke review during block
- Success Metric: Score at or below "personal par" (baseline established session 1)
- Progression: Add par-4/5 complexity; add partners; TM Combine
- Regression: Single-target game; shorter distances; remove scoring entirely
- Contraindications: High anxiety/reinvestment tendency in acquisition stage
- Tech: TM Performance Center (scoring mode) optional
- Expert Lens: Various; DECADE game pressure
- Evidence Tag: `expert_framework` (pressure inoculation framework; reinvestment theory)

**DC-026: Last Ball Drill (Clutch)**
- Family: DF-18 | Branch: all (transfer/pressure) | Stage: Transfer, Maintenance | Level: L3–L5
- Blocks: 9 | Tools: 5 balls; any club; defined success target
- Description: Hit 4 balls with practice swing routine. Ball 5 is the "last ball" — it matters. Score only the last ball. Accumulated score vs. session PR. Mimics tournament pressure on a specific shot.
- Cue: "Treat this one like the 18th green to win the club championship." (external/social pressure)
- Feedback Rule: Result only; no analysis after
- Success Metric: Last-ball success rate ≥70% over 20 consecutive sessions
- Progression: Make it the first ball (cold-start clutch); add crowd noise/distraction
- Regression: Remove pressure framing; just hit the 5th ball normally
- Contraindications: Performance anxiety/yips (may increase reinvestment); acquisition stage
- Tech: None during drill; TM optional for result confirmation
- Expert Lens: Expert pattern from competitive golf preparation
- Evidence Tag: `review_required` (supported by pressure inoculation theory but no direct RCT)

---

#### MOBILITY / CORRECTIVE DRILLS (Warmup Inserts)

**DC-027: 90/90 Hip Switch with PAILs/RAILs**
- Family: DF-17 | Branch: BI-03, BI-10, BI-11 (hip IR restriction causes sway, slide, sequence problems) | Stage: Any (warmup gate) | Level: L1–L5
- Blocks: 2 | Tools: Mat
- Description: Sit in 90/90 position. Passive hold 2 minutes. PAILs (push lead knee into ground, hip ER in stretch position, ramp 30–100% effort, 30s). RAILs (lift trail knee, hip IR in shortened position, ramp 30–100%, 30s). Switch sides. 2 rounds per side.
- Cue: "Push your knee into the ground like you're trying to leave an impression." (external)
- Feedback Rule: Range increase per round (visible); pain = stop immediately
- Success Metric: Hip IR ≥25° bilateral (TPI minimum); improvement of 5–10° in 4 weeks
- Progression: Hip CARs; loaded hip IR under resistance
- Regression: Supine hip IR stretch (less load); passive only
- Contraindications: Active hip labral tear; hip replacement (consult physio)
- Tech: Goniometer (ROM measurement); TPI screen score
- Expert Lens: FRC (Andreo Spina); TPI (hip IR → sway/slide fault)
- Evidence Tag: `evidence_supported` (FRC PAILs/RAILs neurological ROM model; TPI hip IR correlation)

**DC-028: Open Book / Quadruped T-Spine Rotation**
- Family: DF-17 | Branch: BI-10, BI-06, BI-02 (t-spine limits backswing → compensations) | Stage: Any (warmup) | Level: L1–L5
- Blocks: 2 | Tools: Mat; foam roller optional
- Description: Lie on side, knees stacked at 90°, arms stacked. Top arm reaches forward → opens to ceiling, following with eyes. Hold 2s at end range. 10 reps per side. Foam roller under bottom knee for extra hip separation.
- Cue: "Let your chest chase your hand toward the ceiling." (external)
- Feedback Rule: ROM at endpoint each rep; 3-second hold at end range
- Success Metric: ≥40° thoracic rotation per side (TPI screen pass)
- Progression: Quadruped rotation (hands/knees); thread-the-needle; loaded rotation
- Regression: Seated rotation against wall for reference
- Contraindications: Acute thoracic pain; disc herniation (modify range)
- Tech: Goniometer; Sportsbox chest turn can confirm improvement
- Expert Lens: TPI (thoracic rotation → backswing restriction); FRC
- Evidence Tag: `evidence_supported` (joint-by-joint Boyle/Cook model; TPI correlation research)

**DC-029: Ankle Dorsiflexion Wall Rock**
- Family: DF-17 | Branch: BI-03, BI-11 (ankle DF limits squat → early extension; limits weight shift) | Stage: Any (warmup) | Level: L1–L5
- Blocks: 2 | Tools: Wall; band for distraction (optional)
- Description: Half-kneeling position at wall. Drive lead knee over pinky toe while keeping heel down. 3 sets × 10 reps per side. Measure distance from wall to toe at which heel lifts (benchmark: ≥4.5 inches / 12cm = pass).
- Cue: "Drive your knee over your pinky toe without lifting your heel." (external)
- Feedback Rule: Heel lift = fail (immediate intrinsic); distance measurement
- Success Metric: ≥12cm knee-to-wall distance, heel down (TPI half-kneeling dorsiflexion pass)
- Progression: Add band distraction (joint mobilization); calf stretch superset
- Regression: Reduce distance; seated heel rise
- Contraindications: Achilles tendinopathy (adjust range); foot/ankle surgery
- Tech: Tape measure for distance; TPI pass/fail
- Expert Lens: TPI (ankle DF → overhead deep squat fail → early extension chain)
- Evidence Tag: `evidence_supported` (TPI screen data; joint-by-joint ankle mobility → knee/hip chain)

**DC-030: Lead Wrist DNS 3-Month Prone (IAP)**
- Family: DF-17 | Branch: All (IAP is a prerequisite for any loaded pattern) | Stage: Any | Level: L1–L5
- Blocks: 2 | Tools: Mat
- Description: Lie prone, forearms under shoulders. Breathe into 360° ribcage expansion (lateral + posterior). Gently lift chest while maintaining IAP. 5 breaths. This is the Forefront DNS foundation before any loaded golf fitness pattern.
- Cue: "Breathe into all sides of your ribcage — front, back, sides — before lifting." (internal + external)
- Feedback Rule: Coach hand placement to confirm posterior rib expansion
- Success Metric: 360° breath with no excessive lumbar extension; rib cage moves visibly
- Progression: Level 2 (prone forearm); Level 3 (quadruped); Level 4 (bear crawl)
- Regression: Supine 3-month position (easier breathing position)
- Contraindications: Acute lumbar pain (modify to supine)
- Tech: None
- Expert Lens: DNS (Pavel Kolar); Weingroff (training = rehab continuum)
- Evidence Tag: `evidence_supported` (DNS developmental progression; diaphragmatic breathing as IAP foundation)

---

#### CONTEXTUAL VARIABILITY & TRANSFER DRILLS

**DC-031: TrackMan Combine Practice Run**
- Family: DF-19 | Branch: BI-07, BI-03, BI-04 | Stage: Retention, Transfer | Level: L2–L5
- Blocks: 8, 10 | Tools: TrackMan; Combine mode
- Description: 20-shot mini-Combine (2 shots to each of 5 targets: 80, 100, 120, 140, 160 yds). Score and compare to baseline. Used as a transfer/retention test — not an acquisition tool.
- Cue: "Play each shot like it's a real course situation — full routine." (external/representative)
- Feedback Rule: Score display after completion (not per shot during)
- Success Metric: Score improvement vs. baseline or maintenance at previous level
- Progression: Full 60-shot Combine; add driver
- Regression: Single distance; larger scoring window
- Contraindications: Not during acquisition block (score pressure counterproductive for new patterns)
- Tech: TrackMan Combine mode required
- Expert Lens: TrackMan University
- Evidence Tag: `evidence_supported` (standardized test; benchmarks validated across HCP levels)

**DC-032: Random Club / Target Switch (Contextual Interference)**
- Family: DF-19 | Branch: All | Stage: Retention, Transfer | Level: L2–L5
- Blocks: 7 | Tools: Range; multiple clubs; TrackMan optional
- Description: Before each shot, coach or player randomly selects: (1) club, (2) target distance, (3) trajectory shape (high/low/draw/fade). No two consecutive shots are the same. 20-shot session.
- Cue: "React to the target — whatever club gets it there most reliably." (external/decision-making)
- Feedback Rule: Ball flight and result only; no stroke mechanics feedback
- Success Metric: 15/20 shots in acceptable target window (no specific technique metric)
- Progression: Add lie variation; add wind/conditions; add scoring against self
- Regression: Limit to 2 variables (club + target only); slow tempo
- Contraindications: Acquisition stage; pain/fatigue > caution level
- Tech: TM Performance Center random mode ideal
- Expert Lens: Ecological dynamics / RLD; Winkelman (contextual interference)
- Evidence Tag: `evidence_supported` (Magill & Hall 1990; Barzyk 2024 SR: random > blocked for retention/transfer in skilled players)

**DC-033: On-Course Reporting Walk (Transfer Protocol)**
- Family: DF-19 | Branch: BI-14, all | Stage: Transfer, Maintenance | Level: L2–L5
- Blocks: 8 | Tools: Scorecard; no TrackMan
- Description: 9-hole walk with specific reporting task: after each shot, verbally rate (1) commitment level, (2) execution feel, (3) one positive, (4) one adjustment for next shot. Debrief with coach after round. No technique analysis during round.
- Cue: "Commit before you swing. Report after." (process only)
- Feedback Rule: Self-report only during round; coach debrief post-round
- Success Metric: Commitment rating ≥4/5 on ≥70% of shots; score vs. handicap
- Progression: Live competitive round; full 18; add stats tracking
- Regression: Simulator; 3-hole course management scenario
- Contraindications: Acquisition stage; technique still unstable
- Tech: None during round; post-round stats via DECADE app or scorecard
- Expert Lens: Vision54; DECADE; Brad Faxon (feel/trust)
- Evidence Tag: `expert_framework`

**DC-034: Sleep Protocol Assignment (No-Contamination Rule)**
- Family: DF-17 (recovery insert) | Branch: All | Stage: All | Level: All
- Blocks: 11 | Tools: None
- Description: Homework instruction for night of learning session: (1) Do not practice a different motor pattern tonight. (2) If you hit balls again today, replicate session's target feel — do not introduce a new skill. (3) Aim for 7–9 hours sleep. (4) No late-night alcohol (impairs NREM stage-2 consolidation).
- Cue: "The gains happen tonight while you sleep, not during the next session." (educational)
- Feedback Rule: Check-in next session: subjective sleep quality; any home practice done?
- Success Metric: Sleep ≥7 hours; no contaminating motor practice in 4-hour post-session window
- Contraindications: None (applies to all clients)
- Tech: Sleep tracker optional (HRV device)
- Expert Lens: Walker 2005 sleep-dependent motor consolidation; Forefront KB consolidation rule
- Evidence Tag: `evidence_supported` ([Walker 2005](https://walkerlab.berkeley.edu/reprints/Walker_ClinSportsMed_05.pdf): sleep within first 24h is critical; sleep deprivation blocks consolidation)

**DC-035: Three-Hole Short Game Challenge**
- Family: DF-18 | Branch: BI-12, BI-13, BI-07, BI-14 | Stage: Retention, Transfer | Level: L2–L5
- Blocks: 9 | Tools: Short game area; varied lies; scoring
- Description: Design 3 "holes" combining chip + putt. Each hole scores: chip proximity (5 points for <3ft), putt result (4 points for make, 2 for 1-putt). Total possible 27 points. Track over 6 sessions. Simulates real short-game decision-making under slight pressure.
- Cue: "Play the shot, not the technique." (process/external)
- Feedback Rule: Score only per hole; no stroke feedback during block
- Success Metric: Score improvement over 6 sessions; consistent >18/27 at 6-week mark
- Contraindications: Acquisition stage for any individual component (chip or putt must be at consolidation+ before combining)
- Tech: None
- Expert Lens: Sieckmann; Short Game Chef; DECADE
- Evidence Tag: `expert_framework`

---

#### 25 Additional Drill Card Stubs (Dataset Ready)

| ID | Name | Family | Branch | Stage | Block | Expert Lens | Evidence Tag |
|----|------|--------|--------|-------|-------|-------------|-------------|
| DC-036 | Superspeed Heel Stomp (Level 2) | DF-09 | BI-05 | Consolidation+ | 5 | SuperSpeed / Koch | `evidence_supported` |
| DC-037 | Mach 3 Rotational Max Effort | DF-09 | BI-05 | Consolidation+ | 5 | Josh Koch / Mach 3 | `expert_framework` |
| DC-038 | Lead Hip Post-Up Drill | DF-07 | BI-11 | Acquisition | 5 | Dr. Kwon / TPI | `expert_framework` |
| DC-039 | Mirror Face Awareness | DF-05 | BI-01 | Acquisition | 5 | TrackMan University | `expert_framework` |
| DC-040 | D-Plane Education Shot Matrix | DF-05 | BI-01, BI-02 | Acquisition | 5 | TrackMan University | `evidence_supported` |
| DC-041 | Pressure-Shift Visualization (Swing Catalyst) | DF-07 | BI-11 | Acquisition | 5 | Dahlquist / Como | `expert_framework` |
| DC-042 | X-Factor Stretch Drill (Resistance Band) | DF-06 | BI-10 | Acquisition | 5 | TPI | `expert_framework` |
| DC-043 | Ball-Behind-Right-Elbow (Flat Shoulder Plane) | DF-08 | BI-10 | Acquisition | 5 | Mike Adams | `expert_framework` |
| DC-044 | Quiet Eye Training (Putting) | DF-12 | BI-08 | Acquisition | 5 | Vine et al. / SAM PuttLab | `evidence_supported` |
| DC-045 | 3-2-1 Putting Countdown Game | DF-18 | BI-08, BI-09 | Pressure | 9 | Faxon / DECADE | `expert_framework` |
| DC-046 | Par-Putt Distance Challenge | DF-13 | BI-09 | Retention | 7,8 | Sweeney / Pelz | `expert_framework` |
| DC-047 | Stimpmeter Calibration Drill | DF-14 | BI-09 | Acquisition | 5 | AimPoint / SAM PuttLab | `evidence_supported` |
| DC-048 | Blast Motion Rhythm Trainer | DF-12 | BI-08 | Acquisition | 5 | Sweeney / Blast | `expert_framework` |
| DC-049 | Pelvis Tilt Anterior/Posterior Reset | DF-17 | All | Any (warmup) | 2 | TPI DNS | `evidence_supported` |
| DC-050 | Hip CARs Golf-Specific | DF-17 | BI-10, BI-11 | Any (warmup) | 2 | FRC / Spina | `evidence_supported` |
| DC-051 | Shoulder CARs (Lead Side) | DF-17 | All | Any (warmup) | 2 | FRC / Cressey | `evidence_supported` |
| DC-052 | Wrist CARs + Forearm Rotation | DF-17 | BI-15 | Any (warmup) | 2 | FRC / TPI | `evidence_supported` |
| DC-053 | Lob Wedge High-Low Trajectory | DF-15 | BI-12, BI-07 | Consolidation | 6,7 | Sieckmann / Short Game Chef | `expert_framework` |
| DC-054 | Chip Shot Lie Rotation (5 Lie Types) | DF-15 | BI-12 | Retention | 7 | Short Game Chef | `expert_framework` |
| DC-055 | Bunker Shot Distance Ladder (30/40/50ft) | DF-16 | BI-13 | Retention | 7 | Short Game Chef | `expert_framework` |
| DC-056 | Flop Shot from Tight Lie | DF-16 | BI-13 | Retention | 7 | Sieckmann | `expert_framework` |
| DC-057 | Iron Play - 3 Trajectory Challenge | DF-03 | BI-04, BI-07 | Retention | 7 | DECADE / TrackMan | `expert_framework` |
| DC-058 | Random Green Reading Simulation | DF-14 | BI-08 | Transfer | 8 | AimPoint / Mayo | `expert_framework` |
| DC-059 | SAM PuttLab Calibration Session | DF-12 | BI-08 | Acquisition (diagnosis) | 4,10 | SAM PuttLab / Marquardt | `evidence_supported` |
| DC-060 | Full Round Simulation (9-Hole) | DF-19 | BI-14 | Transfer, Maintenance | 8 | Vision54 / DECADE | `expert_framework` |

---

## 8. Scoring / Test Menu

### 8.1 Test Protocols — 28 Canonical Tests

| ID | Test Name | Diagnostic Purpose | Protocol | Pass Criteria | Fail Action | Retest Frequency | Technology |
|----|-----------|-------------------|----------|---------------|-------------|-----------------|-----------|
| ST-01 | TrackMan Combine (60-shot) | Overall ball striking benchmark | 3 shots × 10 targets × 2 rounds; 30–40 min warmup | Score improvement vs. baseline or >65 for mid-HCP | Investigate weakest distance window; assign DF-11/DF-03 | Monthly | TM required |
| ST-02 | TrackMan Combine (Mini / 20-shot) | Session-level retention check | 2 shots × 5 targets (no driver); 10–15 min | Maintain or improve vs. previous mini-combine | Diagnose: acquisition or transfer failure | Weekly in retention stage | TM required |
| ST-03 | Face Angle Corridor (10-shot) | Face-to-Path consistency (BI-01) | 10 shots 7-iron; record F2P per shot; goal ≤±2° | F2P SD <1.5°; mean F2P within ±1° of target | Escalate to DC-010 or DC-039; check grip | Per session (blocks 4, 10) | TM required |
| ST-04 | Club Path Corridor (10-shot) | Path consistency (BI-02) | 10 shots 7-iron; record CLB_PTH; goal within ±2° of intent | CLB_PTH SD <2°; mean within ±2° of intent | DC-002 path gate; Sportsbox pelvis review | Per session (blocks 4, 10) | TM required |
| ST-05 | Low Point Test (5-shot iron) | Strike geometry / attack angle (BI-03) | 5 shots 7-iron from mat with tape behind ball; record LOW_PT | LOW_PT after ball; ATK_ANG -2° to -4° | DC-004 tee ladder; address ball-position check | Per session (acquisition) | TM + video |
| ST-06 | Smash Factor Cluster (10-shot) | Strike quality / center contact (BI-04) | 10 shots 7-iron; record SMSH per shot | SMSH mean ≥1.33; SMSH SD <0.015 | DC-001 impact tape; DC-040 D-Plane education | Per session (acquisition) | TM required |
| ST-07 | Driver Optimizer Window Test | Driver launch condition optimization (BI-06) | 5 shots driver; record Launch Angle, Spin Rate vs. Optimizer | Launch/spin within green zone for player's CHS | DC-004 AoA drill; equipment A/B flag | Per session (acquisition) | TM Optimizer required |
| ST-08 | Club Head Speed Baseline | Speed training progress (BI-05) | 5 maximum-effort no-ball swings with driver; record peak CHS | Improvement of ≥3–5% from baseline over 4-week protocol | Check protocol compliance; check mobility gates | Weekly (GP-02 goal) | TM no-ball mode or PRGR |
| ST-09 | Wedge Landing Window (3 distances) | Distance control (BI-07) | 5 shots each at 50, 75, 100% effort; 3-meter window | ≥3/5 shots in 3m window per effort level | Widen window; DC-014 wedge matrix | Weekly | TM Carry; landing markers |
| ST-10 | Proximity Test (10 iron shots 150yd) | Approach shot quality (BI-03, BI-04) | 10 shots 150yd; record distance from pin | Mean proximity ≤20 yds (HCP 10–15 benchmark) | Investigate strike, path, or distance control | Monthly | TM required |
| ST-11 | Dispersion Ellipse (20-shot driver) | Driver consistency check | 20 shots driver; record SIDE, CARRY SD | SIDE SD <15 yds; two-way miss pattern absent | Two-way miss: BI-01 priority; bias miss: BI-02 | Monthly | TM required |
| ST-12 | SAM PuttLab Assessment (10 putts) | Putting stroke mechanics baseline | 10 putts × 4m straight putt; record face, path, timing | Face angle @ IMP SD <1°; tempo ratio 2.0–2.4:1 | DC-019 gate drill if face; DC-048 rhythm if tempo | Monthly | SAM PuttLab required |
| ST-13 | Make % Test (3ft, 6ft, 10ft) | Putting performance benchmark (BI-08, BI-09) | 10 putts each from 3ft, 6ft, 10ft (straight, level putt) | 3ft: ≥9/10; 6ft: ≥6/10; 10ft: ≥3/10 | Identify breakdown distance; assign DC-019 or DC-020 | Monthly | None required |
| ST-14 | Speed / Distance Putting Test | Speed control (BI-09) | 10 putts from 30ft; count: stop 1–2ft past | ≥8/10 stop within target zone | DC-020 clock drill; DC-021 ladder | Weekly | None required |
| ST-15 | Sportsbox Kinematic Audit | Kinematic sequence confirmation (BI-10) | 5 swings on Sportsbox; record peak timing order + Gain Factors | Pelvis peaks before Chest; CGF ≥1.3; SGF ≥1.2 | DC-006 pump drill; DC-007 chest-over drill | Monthly | Sportsbox 3D required |
| ST-16 | Force Plate Pressure Shift | GRF timing (BI-11) | 5 swings on Swing Catalyst; record lead foot % @ IMP | Lead foot % @ IMP ≥75%; pressure shift pre-transition | DC-009 step-through; DC-038 lead hip post-up | Monthly | Force plate required |
| ST-17 | HackMotion Wrist Window | Lead wrist angle at arm-parallel (BI-15) | 5 shots 7-iron with HackMotion device | Lead wrist -5° to +5° (flat to slightly bowed) at P5 | DC-010 HackMotion drill; grip check | Per session (acquisition) | HackMotion required |
| ST-18 | TPI 16-Point Screen | Physical limitation mapping | Full 16-test TPI screen; score pass/fail per test | All pass; address "pink elephant" priority fail | Targeted corrective from TPI-Warmup table; DC-027/028/029 | Quarterly | None; goniometer helpful |
| ST-19 | AMG Checkpoint Score | Motor learning progress (GP-06) | 10-checkpoint AMG scoring (1–10 per checkpoint) | ≥6/10 acquisition; ≥7/10 consolidation; ≥7/10 retention with random | Add blocked drill reps; revisit physical gates | Monthly (GP-06) | Video (face-on + DTL) |
| ST-20 | Short Game Proximity Test | Short game performance (BI-12) | 10 chips from 20yd varied lies; measure proximity to hole | Average proximity <5 ft; ≥7/10 within 6ft | DC-017 low-point tape; DC-016 Sieckmann finesse | Monthly | None required |
| ST-21 | Bunker Exit Rate Test | Bunker performance (BI-13) | 5 bunker shots; count exits | ≥4/5 exit bunker; average proximity <12ft | DC-018 splash zone drill; face-open instruction | Monthly | Video |
| ST-22 | DECADE Decision Audit | Course management quality (BI-14) | 9-hole DECADE decision quality scoring (1–5 scale) | Mean DQ score ≥3.5; penalty strokes/round trend | Strategic rethink; DC-024 decision simulation | Monthly (on-course) | DECADE app or scorecard |
| ST-23 | Pressure Putt Countdown | Pressure performance (BI-08, BI-09) | 10 putts from 6ft; must make 5 in a row to "pass" | Complete the sequence without breaking the run of 5 | Identify anxiety pattern; DC-026 last ball; breathing protocol | Monthly | None required |
| ST-24 | TrackMan Speed Session PR | Speed training peak (BI-05) | Record peak no-ball CHS in each session; track PR | Session PR at or above previous PR (no plateau) | Check protocol compliance; add mobility; rest day | Per speed session | TM no-ball / PRGR |
| ST-25 | Sleep/Readiness Gate Check | Readiness assessment | Daily self-report: sleep hours, pain VAS, fatigue RPE | All gates pass (≥7hr sleep, pain ≤2/10, RPE ≤3/10) | Modify session per Section 5.2 gate rules | Each session start | App or manual |
| ST-26 | Wrist/Ankle ROM (TPI Fails) | Physical gate (BI-03, BI-11) | Half-kneeling DF test; 90/90 hip test | Ankle: ≥12cm wall distance; Hip IR: ≥25° bilateral | DC-027 90/90 PAILs; DC-029 ankle DF wall rock | Quarterly | Tape measure; goniometer |
| ST-27 | Putting Tempo Ratio | Stroke rhythm (BI-09) | 5 putts × 4m; Blast Motion or SAM timing | Backswing:impact timing = 2.0–2.4:1 | DC-048 Blast Motion rhythm; DC-020 clock drill | Monthly | Blast Motion / SAM PuttLab |
| ST-28 | Dispersion Cone Iron (7-Iron) | Iron consistency (BI-01, BI-02, BI-03) | 20 shots 7-iron; record SIDE and CARRY distribution | SIDE SD <8 yds; CARRY SD <5 yds | Identify bias and root cause (face, path, or strike) | Monthly | TM required |

---

## 9. Client Customization Logic

### 9.1 GP Level Adaptation Rules

| Variable | L1 (Beginner, HCP 30+) | L2 (High, HCP 20–29) | L3 (Mid, HCP 10–19) | L4 (Low, HCP 5–9) | L5 (Elite, HCP 0–4) |
|----------|----------------------|--------------------|-------------------|-----------------|-----------------|
| Primary practice schedule | Blocked (errorless preferred) | Blocked→Serial | Serial→Random | Random | Random+Representative |
| Feedback rate | 50–75% | 33–50% | 33% | 20–33% | 10–20% |
| Technology display | Selective (ball speed + carry) | Full TM | TM → fading | Ball flight primary | Course feel primary |
| Session duration | 45–60 min (attention) | 60 min | 60–75 min | 75–90 min | 90 min+ |
| Drill complexity | Simple, single-cue | 1–2 variable | Multi-variable | Full constraint manipulation | Autonomous exploration |
| Pressure blocks | Not recommended | Consolidation only | Consolidation+ | Retention+ | All stages |
| Representative transfer | Optional (too complex) | Monthly | Weekly | Every session | Every session |
| Speed training | Not until L2 | After physical gate | Standard protocol | Full protocol | Full + competitive |
| Short game allocation | 30% | 35% | 40% | 45% | 40% + decisions |
| Putting allocation | 20% | 25% | 25% | 20% | 15% (tour caliber) |

### 9.2 MN Mode Adaptation

| MN Mode | Practice Focus | Block Restriction | Volume Cap |
|---------|---------------|-----------------|------------|
| MN1 (GPP / Foundation) | Physical fitness; swing fault awareness; basic technique | Blocks 1–6 only; no pressure | ≤45 min golf-specific |
| MN2 (SPP / Development) | Skill acquisition and consolidation | All blocks; variability increasing | ≤75 min |
| MN3 (Peaking / Maintenance) | Transfer; pressure; performance; maintenance | Random + Representative primary; no new acquisition | ≤60 min (quality) |

### 9.3 In-Season vs. Off-Season Adaptation

| Phase | Practice Philosophy | Blocks Active | Technique Work | Volume |
|-------|-------------------|--------------|----------------|--------|
| Off-Season | Acquisition and consolidation | All 11 blocks | YES — new patterns allowed | High (4–5 sessions/week) |
| Pre-Season | Consolidation and retention | Blocks 1–8 | YES but no new patterns — refine existing | Moderate (3–4/week) |
| In-Season | Retention, transfer, and confidence | Blocks 1–4, 7–11 | NO new technique — maintenance only | Low (2–3 short sessions) |
| Pre-Tournament (T-4wk) | Transfer, confidence, scoring | Blocks 1, 3, 8, 9, 11 | Technical freeze | Minimal (2/week, 45 min) |
| Tournament Week | Feel, routine, confidence | Blocks 1, 3, 11 | None | 2 × 30 min max |

### 9.4 Solo vs. Coached Session Adaptation

| Variable | Coached Session | Solo Session |
|----------|----------------|-------------|
| Feedback source | Coach verbal + technology | Self-assessment + ball flight only |
| Drill complexity | Advanced constraints OK | Simple 1-variable drills recommended |
| Block sequence | Full 11 blocks | 5 core blocks (1, 2, 5, 8, 11) |
| Technology use | Full TM/Sportsbox access | TrackMan if available; ball flight if not |
| New pattern introduction | Yes (coach can monitor) | No — maintenance only recommended |
| Pressure block | Yes if stage-appropriate | Only if well-established routine |

### 9.5 Equipment Uncertainty Adaptation

When equipment fit is unconfirmed (driver loft, shaft flex, wedge gap, putter fit), the builder must flag:
- **BI-06 (Launch Conditions):** Cannot distinguish between technique issue and equipment issue if Smash Factor ≥1.46 AND launch outside window. Flag for equipment A/B test.
- **Putting fit:** Cannot distinguish technique from putter fitting mismatch if SAM face rotation inconsistency appears before stroke mechanics are confirmed. Flag for putter fitting.
- **Wedge gap:** If wedge matrix (ST-09) reveals gaps >20 yards between wedges, equipment gap flag before adding technique drills.

Equipment A/B flags suppress drill assignment until testing occurs. This is a dataset validation rule (see Section 13).

---

## 10. Weekly / Monthly Progression Templates

### 10.1 Swing Change (GP-06) — 16-Week Template

| Week | Phase | Session Type | Primary Blocks | Drill Families | Test |
|------|-------|-------------|---------------|----------------|------|
| 1–4 | Acquisition | Coached acquisition | 1,2,3,4,5,10,11 | DF-17 (warmup correctives); primary fault DF (e.g., DF-07 or DF-08) | ST-19 AMG checkpoint (wk 1 baseline, wk 4 check) |
| 5–8 | Consolidation | Coached + 1 solo | 1,2,3,4,5,6,7,10,11 | Serial variability; add DF-03 gates | ST-19 (wk 8); ST-02 mini-Combine |
| 9–12 | Retention | Solo primary + coached biweekly | 1,2,3,4,6,7,8,10,11 | Random block; PlayBox (DF-19) | ST-19; ST-01 Combine (wk 12) |
| 13–16 | Transfer | On-course primarily | 1,3,8,9,11 | DF-18 pressure; DF-19 on-course | ST-22 DECADE audit; scoring avg |

### 10.2 Speed Training (GP-02) — 8-Week Template

| Week | Phase | Session Type | Protocol | Test |
|------|-------|-------------|----------|------|
| 1–2 | Baseline + Intro | 2×/week | SuperSpeed Level 1 | ST-08 CHS baseline (wk 1) |
| 3–5 | Accumulation | 3×/week | Level 1 full + med ball | ST-08 (wk 5) |
| 6–7 | Level 2 | 3×/week | Level 2 heel stomp | ST-08 (wk 7) |
| 8 | Test + Application | 2×/week | Reduced volume; ball application | ST-08 final; ST-07 driver optimizer |

### 10.3 Putting (GP-05) — 6-Week Template

| Week | Focus | Session Plan | Tests |
|------|-------|-------------|-------|
| 1 | Baseline + Stroke mechanics | SAM PuttLab assessment; DC-019 gate drill | ST-12 (wk 1); ST-13 (wk 1) |
| 2–3 | Distance control + Direction | DC-020 clock; DC-019 gate; DC-021 ladder | — |
| 4 | Variability | DC-021 ladder random; DC-022 AimPoint | ST-13 (wk 4) |
| 5 | Transfer + Feel | Faxon feel practice; DC-060 on-course sim | ST-14 (wk 5) |
| 6 | Pressure | DC-045 countdown; DC-023 PlayBox | ST-13 (wk 6); ST-23 pressure countdown |

### 10.4 Short Game (GP-04) — 8-Week Template

| Week | Focus | Primary Drills | Tests |
|------|-------|---------------|-------|
| 1 | Baseline + Low Point | DC-017 tape; ST-20 baseline | ST-20 (wk 1) |
| 2–3 | Distance control + Wedge matrix | DC-014 wedge matrix; DC-015 landing window | ST-09 (wk 3) |
| 4–5 | Trajectory variety | DC-053 high/low; DC-016 finesse wedge | — |
| 6 | Bunker introduction | DC-018 splash zone | ST-21 (wk 6) |
| 7 | Variability + lies | DC-054 lie rotation; DC-055 bunker ladder | ST-20 (wk 7) |
| 8 | Transfer + scoring | DC-035 3-hole challenge; DC-025 par-3 game | ST-22 (wk 8) |

---

## 11. Dataset Design

### 11.1 Recommended Table Architecture

The following 17 tables form the relational dataset. All IDs use `prefix-NNN` format for human-readability and CSV compatibility.

| Table | Filename | Primary Key | Record Count (Seed) | Purpose |
|-------|---------|-------------|--------------------|---------| 
| session_blocks | `session_blocks.json` | `block_id` | 11 | Defines each session block with rules |
| block_options | `block_options.json` | `option_id` | ~50 | Specific content options per block |
| branch_intents | `branch_intents.json` | `intent_id` | 15 | Diagnostic branch definitions |
| drill_families | `drill_families.json` | `family_id` | 20 | Drill parent categories |
| drill_cards | `drill_cards.json` | `drill_id` | 60 (seed) | Individual drill specifications |
| proof_tests | `proof_tests.json` | `test_id` | 28 | Pre/post session test protocols |
| scoring_tests | `scoring_tests.json` | `test_id` | 28 | Assessment/benchmark protocols |
| technology_modes | `technology_modes.json` | `mode_id` | ~20 | Tech use rules per block/stage |
| feedback_rules | `feedback_rules.json` | `rule_id` | ~30 | Feedback rate/type rules |
| cue_rules | `cue_rules.json` | `rule_id` | ~30 | Cueing rules by stage/block |
| progression_rules | `progression_rules.json` | `rule_id` | ~25 | Drill advancement criteria |
| regression_rules | `regression_rules.json` | `rule_id` | ~25 | Drill regression criteria |
| contraindication_gates | `contraindication_gates.json` | `gate_id` | ~30 | Hard/soft safety gates |
| client_adaptation_rules | `client_adaptation_rules.json` | `rule_id` | ~40 | Client variable → menu modification |
| session_templates | `session_templates.json` | `template_id` | ~20 | Pre-built session configurations |
| weekly_progressions | `weekly_progressions.json` | `prog_id` | 6 | Week-by-week templates (GP-02..GP-08) |
| expert_lenses | `expert_lenses.json` | `lens_id` | ~15 | Expert source definitions |

### 11.2 Core Table Schemas

#### `session_blocks.json`
```json
{
  "block_id": "BLK-01",
  "name": "Arrival & Intention Setting",
  "order": 1,
  "duration_min": {"default": 4, "min": 3, "max": 5},
  "status": "required",
  "status_exceptions": [],
  "motor_learning_purpose": "Planning; goal-action coupling; session framing",
  "physiology_purpose": "Cognitive preparation",
  "feedback_allowed": false,
  "technology_allowed": false,
  "stages_applicable": ["acquisition", "consolidation", "retention", "transfer", "maintenance"],
  "suppressed_by_gates": [],
  "suppressed_by_client_vars": [],
  "evidence_tag": "evidence_supported",
  "source_notes": "PaR Golf Journal; Vision54 Think Box"
}
```

#### `branch_intents.json`
```json
{
  "intent_id": "BI-01",
  "name": "Face Angle Control",
  "description": "Player shows inconsistent or biased face angle resulting in two-way miss or directional error",
  "trackman_triggers": [
    {"metric": "FAC_ANG", "condition": "SD > 2.0", "comparison": "degrees"},
    {"metric": "F2P", "condition": "SD > 3.0", "comparison": "degrees"},
    {"metric": "two_way_miss", "condition": "present", "comparison": "boolean"}
  ],
  "sportsbox_triggers": [
    {"metric": "chest_turn_imp", "condition": "< 15 OR > 40", "unit": "degrees"}
  ],
  "proof_test_id": "ST-03",
  "drill_families_primary": ["DF-01", "DF-03", "DF-05", "DF-20"],
  "drill_families_secondary": ["DF-08"],
  "blocks_required": [4, 5, 6, 7, 8, 10],
  "blocks_forbidden": [],
  "technology_required": ["trackman"],
  "technology_optional": ["hackmotion", "sportsbox"],
  "priority_over": ["BI-02"],
  "subordinate_to": [],
  "evidence_tag": "evidence_supported",
  "source_notes": "D-Plane physics; face = 75-85% start direction (Trackman)"
}
```

#### `drill_cards.json`
```json
{
  "drill_id": "DC-001",
  "name": "Impact Tape Cluster Drill",
  "family_id": "DF-01",
  "branch_intents": ["BI-04"],
  "levels": ["L1", "L2", "L3", "L4"],
  "stages": ["acquisition", "consolidation"],
  "blocks_allowed": [5],
  "blocks_forbidden": [7, 8, 9],
  "session_context": ["coached", "solo"],
  "duration_min": 8,
  "tools_required": ["impact_tape"],
  "tools_optional": ["trackman"],
  "cues": {
    "external": "Swing through the center of the gate",
    "internal": null,
    "analogy": null,
    "process": null
  },
  "feedback_rule_id": "FR-05",
  "success_metric": "5 consecutive shots within 15mm of center on tape",
  "success_metric_quantified": {"threshold_mm": 15, "consecutive_shots": 5},
  "progression_trigger": "5/5 shots within 15mm for 2 consecutive sessions",
  "progression_to": "DC-001 with 10mm window; advance to 7-iron",
  "regression_trigger": "Less than 3/5 shots on target",
  "regression_to": "Shorter club; slow-motion swings only",
  "contraindications": [],
  "technology_pairing": ["trackman_smash_factor", "sportsbox_impact_position"],
  "expert_lens": ["Dr. Scott Lynn", "AMG impact position"],
  "evidence_level": "expert_framework",
  "source_notes": "Strike-first principle; Forefront KB Biomechanics guide"
}
```

#### `contraindication_gates.json`
```json
{
  "gate_id": "CIG-01",
  "name": "Active Pain Gate",
  "gate_type": "hard",
  "trigger": {"variable": "pain_vas", "operator": ">=", "value": 5},
  "action": "block_session",
  "message": "Pain ≥5/10: Session cancelled or restricted to pain-free movements only. No acquisition, no speed training.",
  "blocks_suppressed": [5, 6, 7, 8, 9],
  "drills_suppressed": ["all_except_mobility"],
  "override_allowed": false,
  "evidence_tag": "evidence_supported",
  "source_notes": "Silbernagel pain monitor RCT 2007; Weingroff training=rehab"
}
```

#### `client_adaptation_rules.json`
```json
{
  "rule_id": "CAR-01",
  "name": "Junior Acquisition Volume Cap",
  "client_variable": "age_category",
  "trigger_value": "junior",
  "action_type": "modify_volume",
  "action": {"rlu_per_day_max": 10, "session_duration_max": 45, "blocks_max": 5},
  "rationale": "LTAD attention window; developmental load management",
  "evidence_tag": "expert_framework",
  "source_notes": "LTAD model; TPI junior programming"
}
```

---

## 12. Dataset Seed Summary

### 12.1 Drill Cards Summary (60 Cards)

| Category | Count | Families Covered | Stage Range |
|----------|-------|-----------------|------------|
| Full Swing (Face/Path/Strike) | 10 (DC-001–010) | DF-01–08, DF-20 | Acquisition–Consolidation |
| Speed/Power | 3 (DC-011–013) | DF-09, DF-10 | Any |
| Wedge/Short Game | 7 (DC-014–018, 053–056) | DF-11, DF-15, DF-16 | Any |
| Putting | 6 (DC-019–022, 044–048) | DF-12, DF-13, DF-14 | Acquisition–Transfer |
| Transfer/Pressure | 8 (DC-023–026, 031–035, 060) | DF-18, DF-19 | Retention–Transfer |
| Mobility/Corrective | 8 (DC-027–030, 049–052) | DF-17 | Any (warmup gate) |
| Additional Stubs (dataset ready) | 18 (DC-036–060) | All families | All stages |

### 12.2 Test Protocols Summary (28 Tests)

| Category | Count | Technology Required | Retest Frequency |
|----------|-------|--------------------|--------------------|
| Full Swing (TM) | 8 (ST-01–08, 10–11, 28) | TrackMan | Monthly/Session |
| Speed | 2 (ST-08, ST-24) | TM no-ball / PRGR | Per session / Weekly |
| Putting | 5 (ST-12–14, ST-23, ST-27) | SAM PuttLab / Blast | Monthly |
| Short Game | 3 (ST-09, ST-20–21) | Landing markers | Monthly |
| 3D/Physical | 4 (ST-15–16, ST-18, ST-26) | Sportsbox / Force plate / TPI | Quarterly / Monthly |
| Motor Learning | 2 (ST-19, ST-22) | Video / DECADE | Monthly |
| Assessment/Gates | 4 (ST-17, ST-25, ST-26) | HackMotion / App | Session/Quarterly |

---

## 13. Quality and Validation Rules

### 13.1 Automated Validator Checks

The following checks should be implemented in the Claude Code integration prompt:

| Check ID | Validator | Trigger | Action |
|----------|---------|---------|--------|
| QC-01 | Stage-Drill Mismatch | drill.stage does not include session.stage | Remove drill from dropdown; warn coach |
| QC-02 | Block-Drill Mismatch | drill.blocks_allowed does not include selected block | Remove from that block's dropdown |
| QC-03 | Contraindication Gate Fail | pain_vas ≥5 AND drill.contraindications includes "pain_active" | Suppress drill and block |
| QC-04 | Speed Training + GP-06 Acq Conflict | GP-02 session AND GP-06 stage=acquisition active | Block DC-011, DC-012, DC-037; warn |
| QC-05 | Pressure Too Early | block=9 AND stage=acquisition | Remove Block 9 from session menu |
| QC-06 | Feedback Overload | feedback_count > 2 per shot | Flag to coach; recommend reduction |
| QC-07 | Technology Overuse in Transfer | technology_in_block_8 == true AND stage IN (retention, transfer) | Suppress full TM data display; allow ball flight only |
| QC-08 | Missing Proof Test | block_4 not in session AND session_type = acquisition | Require Block 4 before Block 5 |
| QC-09 | Missing Retest | block_10 not in session | Warn: no learning verdict possible |
| QC-10 | Missing Transfer Bridge | block_8 not in session AND stage = retention | Warn: practice-to-course gap not closed |
| QC-11 | Duplicate Drill Family Same Session | same family_id appears >2× in session | Warn: drill variety too low |
| QC-12 | Equipment Uncertainty Flag | BI-06 triggered AND smash_factor >= 1.46 | Flag equipment A/B test before technique drill |
| QC-13 | Pre-Tournament Technique Gate | round_proximity <= 3 days AND new_pattern_introduction = true | Block acquisition; allow maintenance only |
| QC-14 | Cue Overload | cue_count > 2 in single block | Warn: 1-in/1-out rule; reduce to 1 cue |
| QC-15 | Junior Volume Cap | client.age_category = junior AND rlu_count > 10 | Cap and warn |
| QC-16 | Senior Warmup Time | client.age_category = senior AND warmup_duration < 15 | Extend warmup to 15 min minimum |
| QC-17 | Sleep Gate | sleep_hours < 6 AND block_in (5,7,8) AND stage = acquisition | Block acquisition blocks; reroute to maintenance |
| QC-18 | Post-Rehab Speed Gate | client.rehab_status = active AND drill.family = DF-09 | Block all speed drills until clearance |
| QC-19 | Blocked-Only Session (No Variability) | blocks_included = [5] only AND stage != acquisition | Require Block 6 or 7 |
| QC-20 | No Warmup | block_2 not in session | Hard gate: cannot proceed without warmup |

---

## 14. Review Queue for Brendan

### 14.1 Decisions Required Before Production

| # | Decision | Options | Scientific Default | Priority |
|---|----------|---------|-------------------|----------|
| 1 | **GP Level definition** — How do GP-L1..L5 map to handicap? Does the builder use HCP or a Forefront-specific metric? | HCP-based (L1=30+, L5=0–4) vs. skill-level self-report vs. Combine score | HCP-based (measurable, validated) | HIGH |
| 2 | **MN Mode → Practice Session binding** — Which MN modes restrict which blocks? Current audit shows MN1/MN2/MN3 map to phase_goal_sequence but no explicit practice block restriction. | Strict binding vs. soft recommendation | Strict binding (motor learning stage must match MN mode) | HIGH |
| 3 | **Readiness gates: hard vs. soft** — Should pain ≥5/10 be a hard block (session cancelled) or soft (plan modified)? Same for sleep <6hrs. | Hard gate (cancel) vs. soft gate (modify) | Pain ≥5/10 = hard cancel; sleep <6 = soft modify | HIGH |
| 4 | **Technology availability logic** — If client has no TrackMan, which tests/drills are blocked? Should the builder have a "tools available" checklist that filters the menu? | Tools checklist pre-session vs. always show but mark as unavailable | Tools checklist (UX clarity) | HIGH |
| 5 | **Coach presence gate** — For new pattern introduction (acquisition), is coach required? Or can solo acquisition occur with specific guardrails? | Require coach for acquisition | Require coach for first 3 sessions of any new pattern | MEDIUM |
| 6 | **Junior age definition** — What are the age bands? TPI and LTAD have different definitions. | LTAD: <12 child, 12–15 early adolescent, 16–18 late adolescent | Use LTAD bands with Forefront-specific modifications | MEDIUM |
| 7 | **Senior adaptation threshold** — Is "senior" age-based (55+) or function-based (TPI fail pattern)? | Age + function combined | Start at 55+ but use TPI screen to trigger senior protocol | MEDIUM |
| 8 | **Drill seed validation** — 60 drill cards need individual Brendan review before production. Which cards require expert consultation (e.g., Sieckmann finesse wedge specifics) vs. are ready? | Internal review list | Produce review checklist in separate document | HIGH |
| 9 | **Weekly progression template customization** — Current templates are goal-specific (GP-02, GP-04, GP-05, GP-06). How does the builder handle multi-goal sessions (e.g., GP-01 + GP-05 simultaneously)? | Separate sessions by goal vs. hybrid session | Separate sessions (motor interference); allow cross-session planning | MEDIUM |
| 10 | **Expert lens attribution** — Several expert patterns are referenced (Dr. Scott Lynn, Dana Dahlquist, James Sieckmann, Mike Adams, etc.) without direct RCT backing. Does Forefront need permission/liability review before naming experts in the production dataset? | Retain expert names | Use "expert-pattern lens" framing; recommend legal review for any direct quotes | HIGH |
| 11 | **Pressure block timing rule** — The report states "consolidation+" for pressure blocks. Is this sufficient or should there be a minimum AMG checkpoint score (e.g., ≥6/10) required before pressure is enabled? | Stage-based vs. score-based gate | Score-based gate (≥6/10 AMG) is more precise | MEDIUM |
| 12 | **Dataset format** — JSON or CSV? JSON allows nested objects (cues, triggers, adaptation_rules arrays) but requires JSON parser in builder. CSV is simpler but flat. | JSON (nested) vs. CSV (flat) | JSON for drill_cards, branch_intents; CSV for simple tables | MEDIUM |
| 13 | **Test retest session rule** — Currently Block 10 (Retest) uses same test as Block 4 (Proof Test). Should there be a minimum rest period between tests (e.g., 20+ minutes of practice) before retest is valid? | Minimum time vs. minimum reps | Minimum 15 reps or 15 minutes between proof test and retest | LOW |
| 14 | **Representative transfer minimum** — The transfer bridge (Block 8) is marked required for retention/transfer stages. What is the minimum viable version for a 45-min session? | 5 shots with pre-shot routine vs. full PlayBox | 5-shot PlayBox sequence (minimum viable) | MEDIUM |
| 15 | **Dataset hosting** — Should these JSON/CSV files live in Supabase tables (extending existing golf_* table family) or as standalone seed files for the builder? | Supabase (relational, queryable) vs. JSON seed files | Supabase integration preferred (consistent with GTR architecture) — but outside this document's scope | HIGH |

---

*Document prepared for Forefront internal review. All external citations verified at time of research. Expert-framework citations represent Forefront's interpretation of publicly available instructor frameworks — not direct quotes or endorsements. Review-required items must be validated by Brendan Hayden before production implementation.*

---

**Sources referenced in this report:**
- [Motor Learning in Golf SR — Barzyk & Gruber 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC10899359/)
- [Walker Sleep & Motor Consolidation 2005](https://walkerlab.berkeley.edu/reprints/Walker_ClinSportsMed_05.pdf)
- [External Focus Golf — Wulf & Su 2007 / Sciencedirect](https://www.sciencedirect.com/science/article/abs/pii/S1469029223001875)
- [PaR Golf Journal](https://www.golfsciencejournal.org/article/5013-par-plan-act-review-golf-motor-learning-research-and-improving-golf-skills.pdf)
- [Practice Conditions Review — Uni-Konstanz](https://ojs.ub.uni-konstanz.de/cpa/article/view/5306/4878)
- [Challenge Point Framework — Golf Science Lab](https://golfwell.co/challenge-point/)
- [Ecological Dynamics / RLD — Sportsmith](https://www.sportsmith.co/articles/ecological-dynamics/)
- [TrackMan Combine Benchmarks — FSGA](https://www.fsga.org/sections/content/TrackMan-Combines---Junior-Golf-Assessment/1004)
- [TrackMan Performance Center Guide](https://support.trackmangolf.com/hc/en-us/articles/37847865938971-Practice-Guide-to-the-Performance-Center)
- [Winkelman Language of Coaching — OTP Books](https://www.otpbooks.com/coaching-movements-and-skills-with-nick-winkelman/)
- [Sieckmann Short Game Academy](https://jsegolfacademy.com/your-short-game-solution-now-available/)
- [Magill & Hall 1990 Contextual Interference — PubMed](https://pubmed.ncbi.nlm.nih.gov/12529226/)
- [Silbernagel Pain Monitor RCT 2007 — PubMed](https://pubmed.ncbi.nlm.nih.gov/17307888/)
- [Teixeira 2012 SDT SR — PubMed](https://pubmed.ncbi.nlm.nih.gov/22726453/)
- [Broadie Strokes Gained — Columbia](https://columbia.edu/~mnb2/broadie/Assets/strokes_gained_pga_broadie_20110408.pdf)
- Forefront KB: TrackMan-Fingerprint-Recommendation-Engine.md, Sportsbox-Fingerprint-Based-Drill-System.md, Biomechanics-Golf-Coaching-Deep-Dive.md, putting-short-game-1.md, Warmup-Mobility-Core-Rehab-Complete-Guide-1.md, Power-Plyometric-Speed-Complete-Guide-1.md, golf_gtr_audit.md, gtr_authoring_pack.md
