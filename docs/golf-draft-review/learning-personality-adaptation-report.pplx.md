# Forefront Golf Human Engine: Learning Style, Personality, and Behavioral Adaptation Research Report

**Prepared for:** Brendan Hayden / Forefront  
**Scope:** Evidence synthesis for the Practice Proposal Engine and Practice Session Builder — learner profiling, personalization architecture, intake design, rules matrix, and data contract  
**Version:** 1.0 | May 2026  
**Classification:** Internal Research / System Design Reference

---

## Executive Summary

Forefront's three-engine architecture — Science Engine (what the goal requires), Human Engine (how to deliver it), and Momentum Engine (is it working and what to change) — is structurally aligned with the strongest evidence in coaching personalization. This report answers ten research questions and produces actionable specifications for the Practice Proposal Engine.

**Six findings demand immediate action:**

1. **Drop VARK/VAK entirely.** The meshing hypothesis (teaching to preferred sensory modality improves learning) is a [confirmed neuromyth](https://pmc.ncbi.nlm.nih.gov/articles/PMC6113575/) with zero replicable effect sizes across 10+ controlled trials. Using it in Forefront would expose the platform to justified professional criticism and produce no learning benefit.

2. **The six dimensions that actually matter for session design** are: autonomy preference, feedback tolerance, anxiety/reinvestment risk, analytical orientation, attention capacity, and confidence/self-efficacy. These have genuine predictive validity for session structure, cue type, feedback frequency, and progression speed.

3. **External focus of attention is the single most robustly supported cuing principle in golf motor learning.** Per a 2024 systematic review of golf-specific RCTs ([Barzyk & Gruber, Frontiers in Sports and Active Living, 2024](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1324615/full)), external focus outperformed internal focus across putting, chipping, and swing tasks. Forefront cue language should default to external focus and escalate toward internal only for high-analytical clients who explicitly request mechanical detail — and even then, only outside of performance state.

4. **Autonomy support is not a soft preference — it is a structural outcome predictor.** SDT evidence across 66+ studies ([Teixeira et al., IJBNPA, 2012](https://pubmed.ncbi.nlm.nih.gov/22726453/)) and motor learning research ([OPTIMAL theory, Wulf & Lewthwaite, 2016](https://pubmed.ncbi.nlm.nih.gov/28056637/)) show that autonomy-supportive conditions improve both adherence and learning outcomes. Every Forefront output — plan, cue, check-in — must pass a three-question SDT screen (autonomy, competence, relatedness).

5. **Reinvestment/choking risk is real and measurable.** Clients who score high on trait anxiety + self-consciousness are quantifiably more likely to choke under pressure ([Masters, Reinvestment Theory](https://philarchive.org/archive/CHRPPO)). Forefront must identify these clients before exposing them to pressure tasks or competition simulations.

6. **Fatigue during skill practice is not benign.** Learning under muscle fatigue produces lasting impairments to motor memory formation — detrimental effects persist into subsequent unfatigued sessions ([Rotem-Galili et al., eLife, 2019](https://elifesciences.org/articles/40578)). Forefront RLU dose models must include a fatigue gate.

**MVP scope for V1 Practice Proposal Engine:**
- Implement the 10-question learner intake screen (§5)
- Apply the 8 profile modifiers (§6) as soft rules to proposal generation
- Default all cue language to external focus
- Flag high-anxiety / high-reinvestment clients with a coach review tag
- Do not implement pressure tasks for anxiety-flagged or novice clients without explicit coach sign-off

---

## §1 The Learning Styles Myth: What to Avoid and Why

### 1.1 The Evidence Against VARK/VAK

The meshing hypothesis — that matching instruction to a learner's preferred sensory modality (visual, auditory, kinesthetic) improves outcomes — has been subjected to rigorous meta-analytic review and found to have **no statistically significant effect** ([Rogowsky et al., 2020; Pashler et al., 2008, cited by University of Michigan](https://onlineteaching.umich.edu/articles/the-myth-of-learning-styles/)). The effect sizes across 10 controlled studies meeting adequate methodological criteria were not only non-significant but near-zero — visual matching effect size g = -0.09, auditory g = -0.27, both with 95% confidence intervals crossing zero ([Rogowsky mini-review, Frontiers in Psychology, 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC6113575/)).

Key reasons learning styles fail as a prescriptive system:
- Stated style preferences are **unstable across tasks, topics, and time** — a person may prefer different modalities for different skills ([Coffield et al., 2004, cited by Michigan](https://onlineteaching.umich.edu/articles/the-myth-of-learning-styles/))
- Self-identified learning style shows **no consistent correlation with objective test performance** ([Krätzig & Arbuthnott, 2006](https://onlineteaching.umich.edu/articles/the-myth-of-learning-styles/))
- The American Psychological Association ([APA, 2019](https://www.apa.org/news/press/releases/2019/05/learning-styles-myth)) classifies the belief in learning styles as a neuromyth with potential to cause harm
- Neuroscience demonstrates **cross-modal processing is universal** — all modalities are neurologically interlinked; learners cannot and do not learn through only one channel ([Chartered College of Teaching, 2018](https://my.chartered.college/impact_article/the-problem-with-learning-styles-debunking-the-meshing-hypothesis-in-english-language-teaching/))

### 1.2 What Forefront Should Say Instead

Do not use VARK or VAK in any client-facing copy, intake question, or internal data label. The correct framing is:

| Avoid | Use Instead |
|---|---|
| "What is your learning style?" | "How do you prefer to receive coaching feedback?" |
| "You are a visual learner" | "You tend to respond well to outcome-focused cues" |
| "Kinesthetic learner session" | "Feel-first practice block: lower verbal load, more guided feel reps" |
| "Auditory processing style" | "Prefers verbal rationale; needs explanation depth before drills" |

The marketing and product justification is simple: **Forefront personalizes to what actually predicts your outcomes** — not pop-psychology labels that were invented in the 1970s and never validated.

---

## §2 Evidence-Based Dimensions for Coaching Practice Design

The following 10 dimensions have genuine predictive validity for session structure, coach communication, RLU dose, and adherence. Each is tagged with evidence confidence.

| Dimension | What It Predicts | Evidence Confidence | Primary Sources |
|---|---|---|---|
| **Autonomy preference** | Engagement, intrinsic motivation, long-term adherence | `evidence_supported` — SR/MA level | [Teixeira 2012](https://pubmed.ncbi.nlm.nih.gov/22726453/); [Ng 2012](https://selfdeterminationtheory.org/SDT/documents/2012-NgNtoumanis_PPS.pdf); [OPTIMAL theory](https://pubmed.ncbi.nlm.nih.gov/28056637/) |
| **Feedback tolerance** | Optimal KR/KP frequency, risk of feedback dependency | `evidence_supported` — RCT/MA | [Fading KR, JPTS 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6698475/); [Reduced KR MA, Science Direct](https://www.sciencedirect.com/article/pii/S1469029222000334) |
| **Anxiety / reinvestment risk** | Choking susceptibility, pressure-task safety, implicit vs explicit learning balance | `evidence_supported` — RCT + validated scales | [Masters reinvestment theory](https://philarchive.org/archive/CHRPPO); [Mesagno choking protocol](https://www.frontiersin.org/articles/10.3389/fpsyg.2024.1414499/full) |
| **Analytical orientation** | Cue verbosity, how much technical explanation to provide, coach-script depth | `inferred_review_required` | [Novice-expert differences, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5738945/); Forefront coaching canon |
| **Confidence / self-efficacy** | Goal difficulty calibration, feedback framing, failure response | `evidence_supported` — MA level | [PMC self-efficacy in sport, 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10675036/); [Bandura 1977](https://ecommons.luc.edu/cgi/viewcontent.cgi?article=5318&context=luc_theses) |
| **Attention capacity / executive function** | Session length, drill complexity, cue count per block, feedback timing | `evidence_supported` — B-level sport science | [CHADD ADHD coaching](https://chadd.org/adhd-news/adhd-news-caregivers/attention-coaching-kids-with-adhd-in-sports/); [PCA executive function](https://positivecoach.org/resource-zone/supporting-an-athletes-attention-executive-functions-in-sports/) |
| **Novelty / competition preference** | Practice structure variety, gamification, pressure task progression pace | `inferred_review_required` | [Big Five openness-exercise, JobCannon](https://jobcannon.io/blog/exercise-and-personality-types); Forefront proposed |
| **Conscientiousness / adherence** | Homework compliance prediction, check-in cadence, structure need | `evidence_supported` — SR across 194 studies | [Bogg & Roberts 2004 via JobCannon](https://jobcannon.io/blog/exercise-and-personality-types) |
| **Readiness / current stress** | RLU volume cap, session tempo, recovery buffer requirement | `evidence_supported` — B-level | [Fatigue + motor learning, eLife 2019](https://elifesciences.org/articles/40578) |
| **Injury fear / guarded movement** | Progressive loading design, language safety, pressure exposure gating | `evidence_supported` — SR level | [Fear of reinjury, Sports Health PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5349388/); [Return to sport psych, AASP](https://appliedsportpsych.org/resources/injury-rehabilitation/mentally-preparing-athletes-to-return-to-play-following-injury/) |

### 2.1 Dimensions Forefront Should NOT Use as Prescriptions

| Dimension | Why Not |
|---|---|
| VARK/VAK modality preference | No evidence; meshing hypothesis disproven |
| Myers-Briggs type | Psychometrically unstable; poor test-retest reliability; not validated for sport coaching |
| IQ or "intelligence type" | Ethically risky; not relevant for skill prescription |
| Introversion/extraversion | Only weakly predictive for golf (solo sport); relevant only for social practice format preference |

Introversion/extraversion is **marginally relevant** for format preference only (solo vs. group practice, tournament socialization anxiety) and should not drive session design. Note it as an intake signal but apply only to format choice, never to cue language or volume prescription.

---

## §3 How Profile Dimensions Change Session Design

### 3.1 The Eight Session Design Variables Affected by Profile

For each of the eight session design variables, the table below shows how each learner dimension modifies the default Forefront prescription.

**Legend:** ↑ = increase/more, ↓ = decrease/less, ⚠ = flag/coach review, = = default, → = progress quickly to

| Session Design Variable | Default | High Autonomy | Low Autonomy | High Anxiety/Reinvestment | Low Confidence | Low Attention | High Analytical | Injury-Guarded | High Conscientiousness |
|---|---|---|---|---|---|---|---|---|---|
| **Cue language style** | External focus | External + choice | External + rationale | Analogy / outcome only | Mastery cues, success first | 1 cue max | External near + technical rationale OK | Non-threat language | External + data link |
| **Cues per block** | 1-2 | 1 (self-selected) | 2 (prescribed) | 1 (single outcome cue only) | 1 (success-framed) | 1 | 2-3 (with rationale) | 1 (non-movement) | 2 (explained) |
| **Feedback frequency** | Faded (50% → 25%) | Self-controlled | Scheduled | Bandwidth only (no-error zone) | Higher early, fade | Higher (shorter loops) | Richer KP OK | Neutral/outcome only | Detailed metrics |
| **Blocked → Variable progression** | 3-5 blocked → random | → quickly | Slower, structure-first | Very slow; no random until stable | Very slow; success-stack first | Medium | Medium | No random until pain-free | Normal speed |
| **Pressure tasks** | Stage 3+ only | Can offer choice | Avoid until intrinsically motivated | ⚠ Coach sign-off required | ⚠ Not until 4+ successful blocks | Simplified only | Data-cued stakes | ⚠ Gated; no until confidence milestone | Can gamify |
| **Technology exposure** | Moderate | Client-driven | Structured with interpretation | Less is more; no live number-watching | Limited; mastery evidence only | Minimal; one metric | Full TrackMan engagement | Minimal | Full with KPIs |
| **RLU volume** | Goal-stage default | +10-15% if engagement signals good | Default | ↓ 15-20% if stress/fatigue flags | Start low, earn | ↓ 25%; shorter sessions | Normal | ↓ Symptom-gated | Default; very consistent |
| **Homework format** | 1 drill, 1 task | Self-chosen from menu | Prescribed clearly | Feel-based journal only | 1 achievable success target | 1-step only | Written + rationale | Graduated movement journal | Checklist with metrics |
| **Check-in cadence** | Weekly | Less frequent, client-led | More frequent, brief | More frequent, low-stakes | More frequent, affirmative | Shorter, more frequent | Detailed async preferred | Gradual; progress-milestone based | Metric report + brief |
| **Coach explanation depth** | Moderate | Brief; reasoning on request | Full rationale | Minimal mechanical; rationale for safety | Brief; process praise | Ultra brief | Full scientific rationale | Full safety framing | Technical depth welcome |
| **Client-facing copy style** | Achievement + feel | Choice-language | Clear plan + outcomes | Safety + feel + low-stakes | Mastery + growth | Short + punchy | Data + why | Confidence + protection | Goals + tracking |

### 3.2 Motor Learning Evidence Applied to Session Design

The following motor learning principles each carry direct session-structure implications for Forefront:

#### External Focus of Attention (EFA)
External focus — directing attention to the outcome or effect of movement, not body parts — is the most consistently supported motor learning principle in golf ([Barzyk & Gruber 2024 systematic review](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1324615/full); [Wulf OPTIMAL theory review](https://golfwell.co/wp-content/uploads/2015/10/Wulf_AF_review_IRSEP_2013.pdf)). Studies across golf putting, chipping, and swing tasks consistently show EFA produces better retention, lower negative affect, and higher self-efficacy than internal focus.

**Forefront default:** All drill cues should use external focus language. Internal focus cues (body part references) are contraindicated unless the client is high-analytical AND in a non-performance/pure learning session.

Examples of EFA cues for golf:
- ❌ Internal: "Keep your left arm straight" → ✅ External: "Swing toward the flagstick" 
- ❌ Internal: "Rotate your hips" → ✅ External: "Drive the club toward the target"
- ❌ Internal: "Shift your weight" → ✅ External: "Let the ball compress toward the target"

#### Self-Controlled Feedback (SCF)
Allowing learners control over when they receive feedback — even on elements unrelated to performance (such as ball color choice) — improves motor learning through autonomy-need satisfaction and enhanced information processing ([Frontiers in Psychology, 2025](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1638827/full)). SCF produces higher intrinsic motivation and lower cognitive load than yoked-control conditions.

**Forefront implication:** Offer clients a feedback "request" model (especially for high-autonomy clients). Default to bandwidth/faded KR rather than 100% KR, which produces feedback dependency and inferior retention ([JPTS fading KR, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6698475/)).

#### Contextual Interference (CI) and Blocked vs. Random Practice
Random practice (high contextual interference) produces superior transfer compared to blocked practice in laboratory settings (SMD = 0.75), but the effect is smaller and non-significant in applied sport settings (SMD = 0.34) ([Frontiers in Psychology CI meta-analysis, 2024](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1377122/full)). The Challenge Point Framework ([Guadagnoli & Lee, 2004](https://pubmed.ncbi.nlm.nih.gov/15130871/)) provides the practical reconciliation: optimize task difficulty to the learner's current skill level. Beginners benefit from lower CI initially; advanced players from higher CI.

**Forefront implication:** Start new skills in blocked format (3-5 reps of same condition) → progress to serial → random as competence develops. High-anxiety or novice clients stay in blocked longer. Competitive/novelty-seeking clients can be challenged with random earlier.

#### Implicit vs. Explicit Learning and Reinvestment Theory
Explicit learning (detailed rules and instructions) builds declarative knowledge that can be verbally recalled — but also can be **reinvested** (consciously applied) under pressure, disrupting automated performance. Masters' Reinvestment Theory ([Masters, 1992, cited](https://philarchive.org/archive/CHRPPO)) proposes that high reinvesters apply explicit technical knowledge under pressure, causing choking.

Implicit learning strategies — analogy instruction, errorless learning, dual-task methods — reduce the accumulation of declarative knowledge, producing skills that are more pressure-resilient ([Perception & Action Podcast on implicit learning](https://perceptionaction.com/16-2/)). A 2024 systematic review of golf motor learning ([Frontiers 2024](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1324615/full)) found **errorless learning consistently outperformed errorful learning** in retention and transfer; analogy learning showed strong self-efficacy benefits.

**Forefront implication:**  
- High-anxiety / high-reinvestment clients: preference for analogy cues, errorless progressions (short distances → longer), minimal explicit rules  
- Low-anxiety / high-analytical clients: explicit instruction is appropriate early in learning but must be parked before competitive play  
- Use analogy cues as the primary implicit learning vehicle in client-facing copy

#### Quiet Eye (QE) Training
Quiet Eye — a sustained gaze fixation on a target immediately before and during movement initiation — predicts elite performance and is trainable. QE training helps golfers maintain performance under competitive pressure and reduces choking ([Frontiers in Psychology QE training, 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3111367/)). QE training is especially relevant for high-anxiety and high-reinvestment clients as a pre-shot routine anchor.

**Forefront implication:** For anxiety-flagged clients, include QE pre-shot routine instruction as a standard element of putting and short game sessions.

#### Sleep and Fatigue Gates
Sleep after motor skill practice improves performance 15-20% over equivalent waking periods, with REM sleep consolidating motor memories ([Dr Kumar Discovery](https://drkumardiscovery.com/posts/practice-sleep-makes-perfect/)). Critically, **learning under muscle fatigue produces lasting impairments to motor memory** that persist into subsequent unfatigued sessions ([Rotem-Galili et al., eLife 2019](https://elifesciences.org/articles/40578)). Fatigued states produce motor memories that do not generalize to non-fatigued performance.

**Forefront implication:**  
- RLU dose must include a fatigue flag: if client reports high fatigue (≥7/10 or equivalent), reduce skill learning volume by 30-50% and shift remaining reps to performance consolidation (already-learned patterns) rather than acquisition  
- Practice session planning should consider scheduling skill-acquisition practice before sleep when possible  
- High-stress / low-readiness clients flag this automatically; Momentum Engine should track

#### Representative Learning Design (RLD)
Skills developed in flat/blocked/range environments show limited transfer to on-course conditions. Representative Learning Design recreates the information landscape of performance — changing lies, slopes, targets, decisions, and consequences ([Sports Medicine Open RLD review, 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10232382/)). Trackman evidence confirms that data dependency (immediately looking at screen after every shot) builds an artificial feedback loop that doesn't exist on course ([TrackMan build practice that transfers, 2026](https://www.trackman.com/blog/golf/trackman-talks-build-practice-that-transfers)).

**Forefront implication:** Practice proposals for clients at Stage 3+ (transfer phase) must include representative constraints. Competitive-stage clients (tournaments approaching) should have their practice weighted toward representative + decision-based, not range-only.

---

## §4 OPTIMAL Theory Integration

Wulf & Lewthwaite's OPTIMAL theory ([PubMed, 2018](https://pubmed.ncbi.nlm.nih.gov/28056637/)) identifies three mutually reinforcing factors that optimize motor learning:

1. **Enhanced Expectancies (EE):** Positive beliefs about performance success → increased self-efficacy → better learning. Coaches build EE through success framing, positive comparative feedback, and appropriate challenge calibration.
2. **Autonomy Support (AS):** Giving learners meaningful choice over aspects of practice → intrinsic motivation → better retention. Even trivial choices (ball color, practice order) have documented effects.
3. **External Focus (EF):** Attention directed to movement outcomes, not body mechanics → more efficient neuromuscular coordination → greater automaticity.

These three factors are **additive and synergistic**. A Forefront session that maximizes all three outperforms one that optimizes only one. The evidence confidence for EF and AS is strong; the EE component has recent replication concerns ([Science Direct OPTIMAL limitations, 2024](https://www.sciencedirect.com/science/article/pii/S1469029224001018)) and should be treated as `inferred_review_required` for the magnitude of EE effects alone, though the directional recommendation (positive framing > negative framing) is well-supported by SDT evidence.

**Forefront implication:** Every Practice Proposal should embed all three OPTIMAL elements by default:
- EE: opening success-framing statement in client copy
- AS: client choice embedded in at least one drill variable
- EF: all cue language defaults to external focus

---

## §5 Intake Screen: 10-Question Learner Profile

The intake screen must be deliverable in under 4 minutes, avoid clinical-sounding or pathologizing language, and produce actionable profile signals without requiring a sport psychologist. All questions use 1-5 Likert scales or forced-choice options where possible.

### 5.1 Intake Questions (Client-Facing Version)

**Instructions for client:** *These questions help us build your practice plan around how you think and feel, not just your swing mechanics. There are no right answers.*

| Q# | Question | Scale / Options | Profile Signal |
|---|---|---|---|
| **Q1** | *How much do you want to understand WHY a drill works before you try it?* | 1 (just show me) → 5 (explain everything) | Analytical orientation |
| **Q2** | *When you're learning a new move, do you prefer to feel it out or follow step-by-step instructions?* | 1 (feel it out) → 5 (step-by-step) | Explicit vs. implicit preference |
| **Q3** | *How much does your game fall apart when the stakes feel high — a match, a tournament, playing with strangers?* | 1 (I thrive under pressure) → 5 (I notice a big drop-off) | Anxiety / reinvestment risk |
| **Q4** | *When you're practicing, how often do you want to know how you did after each rep?* | 1 (only occasionally) → 5 (every single rep) | Feedback frequency preference |
| **Q5** | *How important is it to you to choose which drills you do in a session?* | 1 (I trust the coach to decide) → 5 (I want meaningful input) | Autonomy preference |
| **Q6** | *If you make an error in practice, how long does it stay with you mentally?* | 1 (I move on immediately) → 5 (it affects the rest of the session) | Perfectionism / anxiety |
| **Q7** | *How confident are you right now in your ability to improve this specific area of your game?* | 1 (not at all confident) → 5 (very confident) | Self-efficacy |
| **Q8** | *How many different things can you comfortably focus on during a session before you feel overloaded?* | 1 (one thing only) → 5 (several at once, I like complexity) | Attention capacity |
| **Q9** | *Do you have any area where a previous injury makes you hesitant to practice certain movements?* | Yes / No + free text | Injury fear / guarded |
| **Q10** | *How closely do you usually stick to the practice plan your coach gives you?* | 1 (I often modify/skip things) → 5 (I follow it exactly as written) | Conscientiousness / adherence |

### 5.2 In-Session Observation Signals (Coach Notes Layer)

Beyond intake, coaches should note the following observable signals during sessions. These modify profile scores over time (observed > declared, per Human Engine hierarchy):

| Observable Signal | What It Suggests | Profile Field Updated |
|---|---|---|
| Client asks "but WHY does that work?" repeatedly | High analytical orientation | `analytical_orientation: high` |
| Client misses cues when given more than 2 simultaneously | Low attention capacity | `attention_capacity: low` |
| Client's quality degrades sharply in game/simulated scenarios vs. range | High reinvestment/anxiety risk | `anxiety_reinvestment_risk: high` |
| Client seeks coach reassurance after most reps | Low self-efficacy | `self_efficacy: low` |
| Client self-initiates drill variations without being asked | High autonomy preference | `autonomy_preference: high` |
| Client avoids certain movement patterns or clubs without explanation | Possible injury fear | `injury_fear: possible — flag for coach` |
| Client ignores homework but completes in-session drills | Low conscientiousness for self-directed tasks | `homework_adherence: low` |
| Client engages deeply with data/numbers on TrackMan | High data orientation | `tech_orientation: high` |
| Client seems energized or deflated by score vs. peers | High ego-orientation | `motivational_climate_sensitivity: ego` |
| Client's verbal self-criticism is frequent and intense after errors | High perfectionism | `perfectionism: high` — also check anxiety |

---

## §6 Forefront Learner Profile Taxonomy

These are **not rigid labels** — they are modifier bundles that can overlap, evolve, and be held with varying confidence. The system stores them as profile signals (confidence-weighted), not permanent identifiers. A client can be partially multiple profiles simultaneously.

![Forefront Learner Profile Dimensions](./forefront_learner_profile_matrix.png)

### Profile 1: Detail-Seeker (Analytical/Explicit Learner)
**Signal profile:** Q1 ≥ 4, Q2 ≥ 4, Q8 ≥ 4  
**Behavioral markers:** Asks mechanical questions, gravitates to launch monitor data, enjoys technical rationale, reads about swing mechanics independently, may over-analyze errors  
**Strengths:** High engagement, self-directed improvement between sessions  
**Risks:** Over-analysis under pressure → reinvestment; analytical paralysis during performance; internal focus trap

| Design Variable | Adaptation |
|---|---|
| Cue language | External focus + technical rationale available on request (never during performance) |
| Feedback | Rich KP (video + data) in acquisition phase; transition to outcome-only for transfer |
| Instruction depth | Full biomechanical rationale OK in pre-drill explanation |
| Pressure tasks | Must explicitly park analytical mode before pressure reps — add explicit "trust mode" framing |
| Homework | Written drill plan with metrics and why |
| Client copy | "Here's what this drill is doing and why it works" |
| Coach note | Monitor for reinvestment risk; ensure explicit knowledge is parked before competitive play |

**What NOT to do:** Withhold explanation (will reduce buy-in). Use only feel-based cues (will disengage). Give more than 2-3 rules simultaneously.

---

### Profile 2: Feel-First Learner (Implicit/Experiential Learner)
**Signal profile:** Q1 ≤ 2, Q2 ≤ 2, Q4 ≤ 2  
**Behavioral markers:** Learns by watching and doing, dislikes lengthy pre-drill explanation, frequently says "it just felt right," may resist technical feedback  
**Strengths:** Naturalizes skill quickly, less likely to reinvest, better pressure performance if skill was acquired implicitly  
**Risks:** May develop incorrect movement patterns without noticing; resists corrective feedback

| Design Variable | Adaptation |
|---|---|
| Cue language | Analogy cues, single metaphors, external far focus only |
| Instruction style | Demo first, minimal verbal explanation, then "go find it" |
| Feedback | Self-controlled; ask "how did that feel?" before giving KR |
| Drills | Errorless progressions (close targets → expand); constraint-led environments |
| Homework | Feel journal: "write one thing you noticed, not one thing you should change" |
| Client copy | "Your job is to feel the shape of that shot — the score is the feedback" |
| Coach note | Use analogy library. Prioritize QE protocol for pressure situations |

**What NOT to do:** Front-load technical rules. Give continuous verbal feedback during reps. Overload with data screens.

---

### Profile 3: Anxious Controller (High Reinvestment / Choking Risk)
**Signal profile:** Q3 ≥ 4, Q6 ≥ 4; or in-session: performance drops sharply in simulated/pressure conditions  
**Behavioral markers:** Verbally self-critical, reverts to mechanical thoughts under pressure, clutches during competitions, avoids competitive practice formats, reports "overthinking" during key shots  
**Strengths:** High motivation to improve, strong practice attendance, responsive to systematic desensitization  
**Risks:** Choking under pressure (clinically described: [Masters reinvestment, Frontiers 2024](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1414499/full)); explicit knowledge reinvestment disrupts automated performance

| Design Variable | Adaptation |
|---|---|
| Cue language | Single analogy cue only; NO body-part references in performance state |
| Feedback | Bandwidth only (no error zone); positive temporal-comparative ("better than your last 3") |
| Pressure tasks | ⚠ Coach sign-off required. Use systematic pressure desensitization (ASAP model: Ascending Stakes) |
| Practice structure | Errorless learning progressions; Quiet Eye training as pre-shot anchor |
| Instruction depth | Minimal explicit rules; process rationale for safety/confidence only |
| Homework | Pre-shot routine card; 1-sentence internal cue for distraction control |
| Client copy | "Your swing is ready — your job is to let it happen, not control it" |
| Coach note | Do not introduce random practice or competition simulations until blocked performance is stable. QE pre-shot protocol is priority. No live TrackMan number-watching during acquisition. |

**What NOT to do:** Give detailed mechanical feedback right before performance reps. Introduce pressure tasks prematurely. Use ego-comparative framing ("you should be doing better at this"). Allow self-monitoring loops (client should not stare at swing videos immediately after poor shots).

---

### Profile 4: Autonomous Experimenter
**Signal profile:** Q5 ≥ 4, Q1 ≤ 3, Q2 ≤ 3; in-session: self-modifies drills, generates own variations  
**Behavioral markers:** Intrinsically motivated, self-directed, often generates creative practice variations, may resist rigid plans, high intrinsic motivation  
**Strengths:** High autonomous motivation → long-term adherence; SDT-optimal engagement; transfers well when given representative problems  
**Risks:** May veer off-prescription; progress tracking requires outcome measures rather than compliance measures

| Design Variable | Adaptation |
|---|---|
| Plan structure | "Practice menu" with choice built in (2-3 drill options, client selects) |
| Feedback | Self-controlled; ask for feedback on request; fewer scheduled check-ins |
| Progression | Allow rapid advance to variable/random if outcomes support it |
| Homework | Open-ended challenge: "Find 3 ways to hit this shot differently this week" |
| Technology | Client-driven; offer TrackMan as an exploration tool |
| Client copy | "You choose the sequence. Here are the constraints. Here's what success looks like." |
| Coach note | Track outcomes, not compliance. Monitor for drift from evidence-based volume. Flag if self-directed experiments conflict with phase-stage goals. |

**What NOT to do:** Prescribe every detail of every session. Require report-back on exact plan compliance. Remove all choice to "ensure" proper execution.

---

### Profile 5: Low-Confidence Novice
**Signal profile:** Q7 ≤ 2; or intake narrative signals doubt about ability to improve; or new to golf with minimal prior success  
**Behavioral markers:** Minimizes own performance, deflects compliments, avoids attempting difficult shots, sets lower goals than capability warrants  
**Strengths:** High coachability, strong response to mastery experiences, quick self-efficacy gains from early successes  
**Risks:** May quit before competence develops; requires careful success-stack design; negative feedback (even accurate) can disproportionately harm motivation ([Bandura self-efficacy review](https://pmc.ncbi.nlm.nih.gov/articles/PMC10675036/))

| Design Variable | Adaptation |
|---|---|
| Drill design | Errorless: start close/easy, guarantee early success, expand distance/difficulty gradually |
| Feedback | Process praise ("the way you set up was excellent") before outcome feedback |
| Language | Mastery framing: "You're building capacity right now — the score doesn't count yet" |
| Pressure tasks | ⚠ Not until 4+ successive successful practice blocks at target task |
| Goals | Mastery milestones, not outcome comparisons |
| Client copy | "Every rep you complete is training your brain. You don't need to be good yet — you need to be consistent." |
| Coach note | Use Bandura's four self-efficacy sources intentionally: mastery experiences > vicarious > verbal persuasion > physiological states. Do not compare to other clients. Track smallest wins explicitly. |

**What NOT to do:** Introduce comparative feedback ("most clients at this stage can..."). Start at full-difficulty versions of drills. Give critical feedback without process praise first. Use ego-involving language.

---

### Profile 6: Data-Driven Optimizer
**Signal profile:** High Q1, Q4, Q8; in-session engagement with TrackMan metrics; asks about numbers proactively  
**Behavioral markers:** Brings launch monitor data to sessions, tracks personal bests, enjoys KPI dashboards, responds well to metrics-based progress evidence  
**Strengths:** High self-monitoring; strong adherence when outcomes are measurable; excellent for CHS / strokes-gained tracking goals  
**Risks:** May develop feedback dependency (100% KR → impaired retention per [JPTS 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6698475/)); may confuse range metrics with course performance; tech dependency can undermine feel development

| Design Variable | Adaptation |
|---|---|
| Technology | Full TrackMan engagement; provide KPIs; include trend charts |
| Feedback | Rich during acquisition; use TrackMan protocol: predict → feel → then check data (prevents live-screen dependency) |
| Session design | Include measurable benchmarks in every session plan |
| Homework | Metric target + structured logging |
| Client copy | "Your target this week: [metric]. Here's what the data says about where you are and what moves the needle." |
| Coach note | Teach the predict-then-check protocol early ([TrackMan build practice, 2026](https://www.trackman.com/blog/golf/trackman-talks-build-practice-that-transfers)). Build intentional "screen off" practice blocks to develop feel. Monitor for data dependency replacing course performance focus. |

**What NOT to do:** Remove all data (will disengage completely). Allow continuous live-screen monitoring during acquisition blocks. Ignore that range metrics ≠ course performance.

---

### Profile 7: Distracted / High-Context Client (Low Attention Capacity)
**Signal profile:** Q8 ≤ 2; in-session: misses cues, needs frequent repetition of instructions, gets distracted during long explanations  
**Behavioral markers:** Needs simple, short instructions; responds better to demonstration than verbal explanation; attention wanders during lengthy pre-drill briefings; may have ADHD or high life-context stress  
**Strengths:** Thrives with clear structure, kinesthetic engagement, and task variety  
**Risks:** Knowledge decay between sessions without homework anchor; multi-step drills cause confusion; verbal overload shuts down motor learning

| Design Variable | Adaptation |
|---|---|
| Cue design | 1 cue maximum per block; ultra-short (1-3 words) |
| Explanation | Demo + 1 sentence only before reps |
| Session length | Shorter sessions or micro-blocks with movement breaks |
| Drill variety | Higher variety (prevents disengagement); use novelty to re-engage |
| Homework | 1 step only, written or texted after session, not before |
| Review structure | Preview → brief teach → review (PCA coaching model: [Positive Coach Alliance](https://positivecoach.org/resource-zone/supporting-an-athletes-attention-executive-functions-in-sports/)) |
| Client copy | Ultra-short. Bullet points. "Today: 1 thing. Here it is:" |
| Coach note | Check for consistent misunderstanding vs. attentional issue. Reduce cognitive load before adjusting drill difficulty. Use visual anchors (alignment sticks, spot targets) to externalize focus physically. |

**What NOT to do:** Give 3+ step drill instructions verbally. Front-load long technical explanation. Expect complex homework compliance. Use text-heavy client materials.

---

### Profile 8: Injury-Guarded Client
**Signal profile:** Q9 = Yes; or in-session avoidance of specific movement patterns; or previous injury history noted in intake  
**Behavioral markers:** Hesitates or modifies movements in feared zones, mentions injury history unprompted, checks in about pain after any movement change  
**Strengths:** High awareness of body signals; careful performers  
**Risks:** Guarded movement patterns reduce learning quality and can perpetuate dysfunction; fear avoidance spiral ([Sports Health 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC5349388/)); technique changes can be emotionally difficult to trust

| Design Variable | Adaptation |
|---|---|
| Language | Non-threat: "explore" not "force," "notice" not "achieve" |
| Loading | Graduated exposure: identical to Silbernagel pain-monitor model (0-5/10 acceptable) |
| Pressure tasks | ⚠ Gated until movement confidence milestone achieved |
| Drill design | Start with non-threatening variations (short swings, reduced effort), expand gradually |
| Cue style | External outcome (ball flight) not body zone cues |
| Progress tracking | Functional milestone gates, not just ball-flight metrics |
| Client copy | "Your body is on your side. We're building from where you're comfortable — no surprises." |
| Coach note | ⚠ Flag for clinical assessment if avoidance is severe or expanding. Use positive visualization scripts. Do not pressure client to "push through" — gradual exposure with safety confirmation at each step. CBT-informed approaches (graded exposure) are first-line for significant FoR. |

**What NOT to do:** Dismiss injury concern as psychological only. Force full-range movements before confidence is established. Use language that implies the client should "just swing" normally.

---

## §7 Rules Matrix

The complete rules matrix connects profile signal to session adaptation, client copy style, coach note, risk if ignored, and evidence tag.

| Profile Signal | Session Adaptation | Client Copy Style | Coach Note | Risk If Ignored | Evidence Confidence |
|---|---|---|---|---|---|
| High anxiety (Q3 ≥ 4) | Analogy cues; errorless; no pressure tasks without sign-off; QE pre-shot | "Let it happen" language | ⚠ Reinvestment risk flag; ASAP desensitization protocol | Choking under competition pressure; program abandonment | `evidence_supported` — [Masters reinvestment](https://philarchive.org/archive/CHRPPO) |
| Low self-efficacy (Q7 ≤ 2) | Success-stack drills; errorless; process praise first | Mastery + "building" language | Intentional Bandura-source sequencing; no comparative feedback | Dropout; confirmation of "can't improve" belief | `evidence_supported` — [Bandura meta, PMC 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10675036/) |
| High analytical (Q1 ≥ 4) | Technical rationale available; richer KP; external focus with explanation | Data-forward; "here's why" | Monitor for reinvestment; park explicit knowledge before performance | Choking; analysis paralysis; internal focus during performance | `inferred_review_required` — [Novice-expert PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5738945/) |
| High autonomy (Q5 ≥ 4) | Practice menu with choice; self-controlled feedback | "You decide the sequence" | Track outcomes not compliance; respect choice | Disengagement; extrinsic motivation displacing intrinsic | `evidence_supported` — [SDT IJBNPA 2012](https://pubmed.ncbi.nlm.nih.gov/22726453/) |
| Low attention (Q8 ≤ 2) | 1 cue max; short sessions; micro-blocks; demo-first | Ultra-short; 1 thing per message | Reduce verbal load first; use visual anchors | Knowledge overload → no learning; session frustration | `evidence_supported` — [CHADD coaching](https://chadd.org/adhd-news/adhd-news-caregivers/attention-coaching-kids-with-adhd-in-sports/) |
| Injury-guarded (Q9 = Yes) | Graduated exposure; non-threat language; symptom-gated | Safety + confidence language | ⚠ Clinical assessment if severe; graded exposure protocol | Movement avoidance reinforcement; injury compensation | `evidence_supported` — [Sports Health PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5349388/) |
| High feedback demand (Q4 ≥ 4) | Faded KR after acquisition phase; predict-then-check protocol | Data + feel integration | Risk of feedback dependency; build screen-off blocks | Feedback dependency; poor range-to-course transfer | `evidence_supported` — [JPTS fading KR 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6698475/) |
| Low conscientiousness (Q10 ≤ 2) | In-session volume emphasis; minimal homework; check-in support | Achievable 1-step only | Plan for non-compliance; focus sessions on high-yield work | Dose delivered is lower than prescribed; outcomes stall | `evidence_supported` — [Bogg & Roberts 2004](https://jobcannon.io/blog/exercise-and-personality-types) |
| High fatigue / stress flag | ↓ RLU 30-50%; consolidation only; no new acquisition | "Today's session is about locking in what you have" | ⚠ Do not introduce new patterns when fatigued | Fatigued-state motor memory → wrong patterns; learning impairment | `evidence_supported` — [eLife 2019](https://elifesciences.org/articles/40578) |
| Competitive gamer / high novelty | Random practice earlier; gamified stakes; variety | Challenge-framing; competitive scoreboard language | Monitor volume drift; ensure foundational quality before ramping variability | Insufficient blocked foundation → poor consolidation | `inferred_review_required` — [Challenge Point Framework](https://pubmed.ncbi.nlm.nih.gov/15130871/) |

---

## §8 Data Contract: `client-learning-profile-rules.json`

This defines the data structure for storing and applying learner profile modifiers in the Forefront Practice Proposal Engine. Each profile modifier is stored as a rule object with the fields below.

### 8.1 Schema Definition

```json
{
  "profile_key": "string — unique ID e.g. 'anxious_controller', 'feel_first_learner'",
  "display_name": "string — human-readable name for coach UI",
  "description": "string — 1-2 sentence description for internal use",
  "version": "string — e.g. '1.0'",
  "signal_inputs": {
    "intake_questions": [
      {
        "question_id": "string — e.g. 'Q3'",
        "operator": "string — 'gte' | 'lte' | 'eq' | 'contains'",
        "threshold": "number or string"
      }
    ],
    "in_session_markers": ["string — observable behavior descriptions"],
    "confidence_level": "string — 'declared' | 'observed' | 'inferred'",
    "minimum_observations": "integer — observations needed before rule activates"
  },
  "behavioral_markers": ["string — what coach observes to confirm this profile"],
  "modifies_blocks": {
    "blocked_to_random_speed": "string — 'slow' | 'normal' | 'fast'",
    "pressure_task_gate": "string — 'locked' | 'coach_review_required' | 'standard' | 'early_ok'",
    "session_length_modifier": "number — multiplier e.g. 0.75 = 25% shorter",
    "rlu_volume_modifier": "number — multiplier e.g. 0.8 = 20% reduction"
  },
  "modifies_dose": {
    "acquisition_reps_modifier": "number",
    "consolidation_reps_modifier": "number",
    "fatigue_gate_threshold": "number — 0-10 scale; above this, shift to consolidation only"
  },
  "cueing_rule": {
    "default_focus": "string — 'external_far' | 'external_near' | 'analogy' | 'outcome_only'",
    "internal_focus_allowed": "boolean",
    "cues_per_block_max": "integer",
    "cue_length_max_words": "integer",
    "analogy_library_tag": "string — tag for preferred analogy type"
  },
  "feedback_rule": {
    "frequency": "string — 'self_controlled' | 'bandwidth' | 'faded' | 'scheduled' | 'high'",
    "kr_style": "string — 'outcome_only' | 'process_plus_outcome' | 'rich_kp'",
    "feedback_request_model": "boolean — true = client requests; false = coach schedules",
    "tech_feedback_protocol": "string — 'predict_then_check' | 'live_screen' | 'screen_off'",
    "error_response_style": "string — 'bandwidth_ignore' | 'neutral_acknowledge' | 'process_reframe'"
  },
  "tech_rule": {
    "trackman_engagement_level": "string — 'full' | 'moderate' | 'minimal' | 'screen_off_default'",
    "video_feedback_timing": "string — 'immediate' | 'end_of_block' | 'end_of_session' | 'none'",
    "kpi_dashboard_access": "boolean",
    "predict_before_check": "boolean"
  },
  "pressure_rule": {
    "min_stage_before_pressure": "integer — stage number (1-4)",
    "desensitization_protocol": "string — 'ASAP' | 'errorless_expansion' | 'standard' | 'none'",
    "pre_shot_routine_required": "boolean",
    "quiet_eye_protocol": "boolean",
    "competition_simulation_allowed": "boolean",
    "coach_sign_off_required": "boolean"
  },
  "homework_rule": {
    "format": "string — 'checklist' | 'open_challenge' | 'feel_journal' | '1_step_only' | 'metric_target'",
    "complexity_level": "integer — 1-3 where 1 = single step",
    "expected_compliance_rate": "number — 0.0-1.0, used for dose correction",
    "delivery_format": "string — 'written' | 'app' | 'text' | 'voice_note'"
  },
  "coach_script": {
    "opening_frame": "string — how to open session for this profile",
    "error_response": "string — how to respond to client error",
    "progress_celebration": "string — how to celebrate progress",
    "pressure_task_brief": "string — framing for pressure tasks if applicable",
    "contraindication_warning": "string — what to avoid saying"
  },
  "client_copy": {
    "session_intro_template": "string — template for practice plan intro text",
    "cue_card_style": "string — 'one_word' | 'short_phrase' | 'full_sentence' | 'metaphor'",
    "tone": "string — 'data_forward' | 'feel_first' | 'safety_framing' | 'achievement' | 'choice'",
    "max_copy_length_words": "integer"
  },
  "contraindications": [
    {
      "what_to_avoid": "string",
      "why": "string",
      "risk_level": "string — 'low' | 'medium' | 'high'"
    }
  ],
  "evidence_tag": "string — 'evidence_supported' | 'inferred_review_required' | 'Forefront_proposed'",
  "evidence_sources": ["string — citation URLs"],
  "review_required": "boolean — true = coach must review before applying to proposal",
  "coach_review_trigger": "string — condition under which coach must intervene",
  "created_at": "string — ISO datetime",
  "updated_at": "string — ISO datetime",
  "active": "boolean"
}
```

### 8.2 Example Rule Object: Anxious Controller

```json
{
  "profile_key": "anxious_controller",
  "display_name": "Anxious Controller",
  "description": "Client shows elevated performance anxiety, reinvestment tendency, or choking history. High risk for pressure-induced regression. Requires implicit learning prioritization and systematic pressure desensitization.",
  "version": "1.0",
  "signal_inputs": {
    "intake_questions": [
      { "question_id": "Q3", "operator": "gte", "threshold": 4 },
      { "question_id": "Q6", "operator": "gte", "threshold": 4 }
    ],
    "in_session_markers": [
      "performance drops ≥15% in simulated pressure vs. blocked range",
      "client verbalizes overthinking or mechanical focus during shots",
      "grip/setup disruption visible in pre-shot under observation",
      "requests mechanical reassurance immediately before performance reps"
    ],
    "confidence_level": "observed",
    "minimum_observations": 2
  },
  "behavioral_markers": [
    "Self-critical after errors for extended period",
    "Avoids competitive drill formats",
    "Verbalizes 'I'm in my head' or equivalent",
    "Performance worsens when watched"
  ],
  "modifies_blocks": {
    "blocked_to_random_speed": "slow",
    "pressure_task_gate": "coach_review_required",
    "session_length_modifier": 1.0,
    "rlu_volume_modifier": 0.85
  },
  "modifies_dose": {
    "acquisition_reps_modifier": 0.9,
    "consolidation_reps_modifier": 1.1,
    "fatigue_gate_threshold": 6
  },
  "cueing_rule": {
    "default_focus": "analogy",
    "internal_focus_allowed": false,
    "cues_per_block_max": 1,
    "cue_length_max_words": 5,
    "analogy_library_tag": "pendulum_swing_feel"
  },
  "feedback_rule": {
    "frequency": "bandwidth",
    "kr_style": "outcome_only",
    "feedback_request_model": false,
    "tech_feedback_protocol": "screen_off",
    "error_response_style": "bandwidth_ignore"
  },
  "tech_rule": {
    "trackman_engagement_level": "minimal",
    "video_feedback_timing": "end_of_session",
    "kpi_dashboard_access": false,
    "predict_before_check": true
  },
  "pressure_rule": {
    "min_stage_before_pressure": 3,
    "desensitization_protocol": "ASAP",
    "pre_shot_routine_required": true,
    "quiet_eye_protocol": true,
    "competition_simulation_allowed": false,
    "coach_sign_off_required": true
  },
  "homework_rule": {
    "format": "feel_journal",
    "complexity_level": 1,
    "expected_compliance_rate": 0.7,
    "delivery_format": "text"
  },
  "coach_script": {
    "opening_frame": "Today we're building feel reps — no scores, no pressure. The goal is just to execute the shape we've been working on.",
    "error_response": "Good — you found the boundary. Reset, one cue, next rep.",
    "progress_celebration": "Notice how that one felt? That's what we're building toward.",
    "pressure_task_brief": "We're going to add a tiny bit of stakes today. Remember — your swing doesn't care. Only your attention decides if it changes.",
    "contraindication_warning": "Avoid: 'You should be able to do this by now.' Avoid: any mechanical cue during or immediately before a rep."
  },
  "client_copy": {
    "session_intro_template": "Today's practice is about letting your swing do what it already knows how to do. One feel. One target. One shot at a time.",
    "cue_card_style": "metaphor",
    "tone": "feel_first",
    "max_copy_length_words": 80
  },
  "contraindications": [
    {
      "what_to_avoid": "Introducing pressure tasks before 4+ stable blocked-practice blocks",
      "why": "Premature pressure exposure can reinforce choke pattern and reduce practice quality",
      "risk_level": "high"
    },
    {
      "what_to_avoid": "Live TrackMan number monitoring during skill acquisition",
      "why": "Creates additional self-evaluation loop that increases reinvestment risk",
      "risk_level": "medium"
    },
    {
      "what_to_avoid": "Detailed mechanical instructions during or immediately before performance reps",
      "why": "Activates explicit knowledge → reinvestment → disrupted automaticity",
      "risk_level": "high"
    }
  ],
  "evidence_tag": "evidence_supported",
  "evidence_sources": [
    "https://philarchive.org/archive/CHRPPO",
    "https://www.frontiersin.org/articles/10.3389/fpsyg.2024.1414499/full",
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC3111367/",
    "https://perceptionaction.com/16-2/"
  ],
  "review_required": true,
  "coach_review_trigger": "Any pressure task or competition simulation requires explicit coach approval",
  "created_at": "2026-05-29T00:00:00Z",
  "updated_at": "2026-05-29T00:00:00Z",
  "active": true
}
```

---

## §9 Sample Practice Plan Adaptations: Same Fault, Four Profiles

**Shared clinical scenario:** All four golfers have the same technical fault — **early extension (hip thrust toward ball at impact)** — resulting in thin/fat contact and inconsistent ball-striking. All are intermediate-level amateur golfers at Stage 2 (pattern building). The Science Engine prescription is identical for all: glute activation and hip hinge stability drills + impact bag / wall drill + feedback rep sequence.

The **Human Engine** produces four different plans.

---

### Golfer A — Detail-Seeker (High Analytical, Moderate Anxiety, High Conscientiousness)

**Intake signals:** Q1=5, Q2=4, Q3=2, Q4=4, Q5=3, Q8=4, Q10=5

**Practice Proposal:**

> **Session Theme:** Understanding your impact geometry — and building it
>
> **Why early extension happens:** When your glutes don't fire at transition, your hips thrust forward to compensate, moving the low point of your arc. We're going to address this at the source, not the symptom.
>
> **Block 1 — Glute Activation (12 reps):** Banded hip hinge against wall. Feel the glutes load without the hips moving toward the wall. *External cue:* "Drive your hips back, not down." *(Coach note: Technical rationale fine here — this client wants the why.)*
>
> **Block 2 — Impact Bag Drill (15 reps):** Set up with bag 8" past impact position. Goal: arrive at bag without the hips bumping forward first. *Cue:* "Arrive at the bag with your chest, not your hips." TrackMan: run in predict-then-check mode for shaft lean at impact. *(Coach note: Full data access — client will engage with launch angle and dynamic loft relationship.)*
>
> **Block 3 — Transfer Reps (10 shots, 7-iron, variable targets):** Alternate targets every 2 reps. *Single cue only for these:* "Chest to target." No screen between shots.
>
> **Homework:** 5-min daily: wall drill × 10 reps. Log feel on a 1-5 scale. Review shaft lean data from session vs. baseline.

**Coach note:** Park technical knowledge explicitly before transfer block. "For these next 10 — just one thought: chest to target." Monitor for internal focus drift on video.

---

### Golfer B — Anxious Controller (High Anxiety, High Reinvestment, Moderate Conscientiousness)

**Intake signals:** Q3=5, Q6=5, Q7=3, Q1=2, Q5=2, Q10=4

**Practice Proposal:**

> **Session Theme:** Building a swing that trusts itself
>
> *(No technical explanation of early extension in intro copy — keep it feel-based)*
>
> **Block 1 — Glute Walk-In Drill (12 reps):** Step into setup, feel glutes loaded, swing only when you feel grounded. There's no timer. *Cue:* "Feel your seat behind you — then swing." *(Coach note: One cue. Analogy only. No mechanical language in this session.)*
>
> **Block 2 — Stick Drill — No Feedback Mode (15 reps):** Wall drill with alignment stick. Screen off. After each 5 reps: "How did that feel — grounded or not?" *(Coach note: Bandwidth feedback: only comment when they explicitly fall outside acceptable range.)*
>
> **Block 3 — Mastery Sequence (8 shots, same target, 7-iron):** Same club, same target every rep. *Single cue:* "Feel grounded at the bottom." No evaluation after each rep — just reset and go. *(No TrackMan screen visible.)*
>
> **Homework:** Pre-shot routine card (glute feel check → setup → one thought → go). Write one word for how each practice session felt.

**Coach note:** ⚠ Reinvestment risk flag active. QE training in next session. Do not introduce scoring or competitive format until at least 3 more stable sessions. If client asks about their data — share at end of session only, with reframing: "The number confirms what you already felt."

---

### Golfer C — Feel-First Learner (Low Analytical, Low Autonomy, Low Feedback Demand)

**Intake signals:** Q1=1, Q2=1, Q4=2, Q5=2, Q7=4, Q3=3, Q10=3

**Practice Proposal:**

> **Session Theme:** Finding your ground
>
> *(Demo first — 30 seconds. No explanation. Then go.)*
>
> **Block 1 — Glute Wall Feel Drill (10 reps):** Stand 6" from wall. Load your glutes back. Swing. "Feel your tailbone point at the wall the whole way through." *(Coach note: No explanation of why — demo and feel. Let the constraint do the teaching.)*
>
> **Block 2 — Impact Station (12 reps):** Ball on tee, foam noodle behind hips at hip height. Swing without touching noodle. *(Coach note: Environmental constraint as the instructor — no verbal cue needed beyond "don't touch it.")*
>
> **Block 3 — Free Practice (10 shots, mix of wedge and 7-iron):** No instruction during this block. Coach observes. If asked for feedback: "What did you feel on that one?" before responding.
>
> **Homework:** One drill: "Find your seat before every shot on the range. That's it."

**Coach note:** Constraint-led. Analogy for the one verbal cue. Client will internalize through feel — trust the process. Avoid over-coaching during Block 3.

---

### Golfer D — Autonomous Experimenter (High Autonomy, Moderate Analytical, High Novelty)

**Intake signals:** Q5=5, Q1=3, Q2=2, Q3=2, Q8=4, Q10=2

**Practice Proposal (Practice Menu Format):**

> **Session Theme:** Three ways to own your impact position — you pick the path
>
> **Your session has three stations. Choose the order:**
>
> - **Station A — Constraint Drill:** Foam noodle behind hips. Find 5 different ways to avoid touching it without thinking about your swing. Explore.
> - **Station B — Variation Challenge:** Hit 10 shots — low stingers, full shots, half swings. Same correction, different shapes. What holds? What changes?
> - **Station C — Transfer Test:** Play 5 shots to 5 different targets, one attempt each. No practice swings. Score yourself 1-5 on how grounded you felt.
>
> After you've done all three: pick the one that gave you the clearest feeling. That's your homework drill this week.

**Coach note:** Minimal direction — this client disengages with over-prescription. Track the outcomes of Station C as the primary evidence. If variance is high, can redirect to more structured approach in next session, but offer choice first. High risk of plan modification without follow-up — monitor via session outcomes, not compliance rate.

---

## §10 Client-Facing and Marketing Language

The following copy explains Forefront's personalization philosophy to clients and prospective clients without pop-psychology framing.

### 10.1 Core Value Proposition Statement

> *"Most golf programs adapt to your swing. Forefront adapts to how you learn, think, and compete — because the same drill, the same cue, and the same practice format produces completely different outcomes depending on who's holding the club. The science of skill development is clear: coaching that matches how you process feedback, how you respond under pressure, and what keeps you practicing actually produces better results than coaching that ignores you as a person. That's what Forefront is built to do."*

### 10.2 Short-Form Marketing Copy

> **Forefront adapts to you — not just your swing fault.**  
> Your practice plan is built from your technical assessment AND from how you think under pressure, how you prefer to receive feedback, and what keeps you motivated. Not pop-psychology labels — actual evidence about what produces learning and adherence for someone like you.

### 10.3 Client Email / In-App Onboarding Text

> *Before we build your first practice plan, we ask you 10 quick questions. Not about your handicap — about how you learn. How much does pressure affect your game? Do you want to know why a drill works, or just get into it? How quickly do you bounce back from a bad shot in practice?*
>
> *These questions directly change your plan. Not as a personality label — as a set of real design decisions. How many cues you get per block. Whether we start you in competitive practice or build your foundation first. Whether your homework is a structured checklist or an open challenge. Whether your coach explains everything or just demos and gets out of your way.*
>
> *The research on motor learning and coaching behavior is very clear: one-size-fits-all instruction doesn't produce one-size-fits-all results. Forefront is designed to know the difference.*

### 10.4 What to Avoid in Client Communication

| Avoid | Use Instead | Reason |
|---|---|---|
| "You're a visual learner" | "You respond well to target-focused cues" | VARK is invalidated |
| "Based on your personality type..." | "Based on how you've described your practice preferences..." | Avoids pseudoscientific framing |
| "This is designed for anxious golfers" | "This session is built around letting your game run on autopilot" | Avoids clinical labeling |
| "You have low self-efficacy" | "We're going to start with shots you can't miss and build from there" | Protects against identity threat |
| "Your learning style profile shows..." | "Your intake responses helped us adjust your plan in 3 specific ways..." | Grounds in declared preference, not type |

---

## §11 Implementation Recommendations

### 11.1 MVP (V1 Practice Proposal Engine) — Implement Now

| Item | Specification | Evidence Level |
|---|---|---|
| 10-question learner intake screen | Deliver at onboarding; store as structured profile fields | Forefront proposed (questions); evidence-supported dimensions |
| Default external focus cue language | All generated drill cues use external/outcome language unless analyst override | `evidence_supported` |
| Anxiety/reinvestment flag | Q3 ≥ 4 OR Q6 ≥ 4 → flag coach review required before any pressure task | `evidence_supported` |
| Feedback frequency default | Faded KR (not 100% KR) for all skill acquisition blocks | `evidence_supported` |
| Fatigue gate on RLU | Client readiness/stress input gates RLU volume | `evidence_supported` |
| SDT screen on all outputs | Every plan output checked for autonomy / competence / relatedness signals | `evidence_supported` |
| Analogy cue library | Build minimum 20 analogy cues for common golf movements | Forefront proposed |
| `client-learning-profile-rules.json` v1 | Implement 8 profile modifier rules as soft constraints on proposal generation | Forefront proposed schema; evidence-supported rules |
| Coach review tag system | Flag proposals requiring human review before delivery | V1 boundary — coach in loop |

### 11.2 Defer to V2+

| Item | Why Defer |
|---|---|
| Automated reinvestment/choking scale (MSRS) | Requires clinical validation context; too heavy for MVP intake |
| Real-time in-session observation capture | Requires session tech integration |
| Adaptive profile update from session outcomes | Requires session data logging pipeline |
| Full explicit/implicit learning stage tracking | Complex to implement in V1; coach judgment sufficient |
| Pressure desensitization automated protocol (ASAP) | Coach-driven in V1; candidate for V2 automation |
| Quiet Eye training module | Specialist protocol; defer to V2 with video integration |

### 11.3 What to Avoid in Any Version

| Avoid | Risk |
|---|---|
| Storing clinical psychological labels (anxious, avoidant, low-IQ) | Digital phenotyping ethics; professional liability |
| Using VARK or personality type as session prescriptions | No evidence; professional credibility risk |
| Automated pressure task introduction for flagged profiles | Safety and ethics risk; coach in loop required |
| 100% KR feedback as default | Creates feedback dependency; impairs retention |
| Ignoring fatigue signal in RLU dose | Produces impaired motor memory; learning loss |
| Internal focus cues as default language | Well-documented performance impairment |

---

## Appendix A: Evidence Sources Reference

All cited sources in this report with confidence classification:

| Source | Topic | Evidence Level | URL |
|---|---|---|---|
| Barzyk & Gruber, Frontiers 2024 | Golf motor learning systematic review | SR | [Link](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1324615/full) |
| Wulf & Lewthwaite 2016 / OPTIMAL theory | Motor learning: EFA, AS, EE | Theoretical + multiple RCTs | [PubMed](https://pubmed.ncbi.nlm.nih.gov/28056637/) |
| Teixeira et al. 2012 | SDT + exercise adherence SR (66 studies) | SR/MA | [IJBNPA](https://pubmed.ncbi.nlm.nih.gov/22726453/) |
| Ng et al. 2012 | SDT + health behavior adherence MA (184 datasets) | MA | [SDT.org](https://selfdeterminationtheory.org/SDT/documents/2012-NgNtoumanis_PPS.pdf) |
| Rotem-Galili et al. 2019 | Fatigue + motor skill learning impairment | RCT | [eLife](https://elifesciences.org/articles/40578) |
| Masters reinvestment theory | Choking under pressure; reinvestment | Theory + multiple RCTs | [Philarchive](https://philarchive.org/archive/CHRPPO) |
| Mesagno et al. 2024 | Mental toughness & choking susceptibility | RCT | [Frontiers](https://www.frontiersin.org/articles/10.3389/fpsyg.2024.1414499/full) |
| Rogowsky et al. / VARK meta | Learning styles meshing hypothesis refutation | MA | [Frontiers PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6113575/) |
| Fading KR, JPTS 2019 | Feedback frequency; faded KR superiority | RCT | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6698475/) |
| Guadagnoli & Lee 2004 | Challenge point framework | Theory + RCTs | [PubMed](https://pubmed.ncbi.nlm.nih.gov/15130871/) |
| CI meta-analysis, Frontiers 2024 | Contextual interference effect in motor learning | MA | [Frontiers](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1377122/full) |
| Frontiers SCF 2025 | Self-controlled feedback timing | RCT | [Frontiers](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1638827/full) |
| QE training golf, Frontiers 2011 | Quiet eye training; pressure resilience | RCT | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3111367/) |
| Bandura self-efficacy meta, PMC 2023 | Self-efficacy and sport performance | MA | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10675036/) |
| Sports Health fear of reinjury 2016 | Fear of reinjury; psychological intervention | SR | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5349388/) |
| AASP return to sport | Injury rehabilitation psychology | Expert consensus | [AASP](https://appliedsportpsych.org/resources/injury-rehabilitation/mentally-preparing-athletes-to-return-to-play-following-injury/) |
| Bogg & Roberts 2004 | Big Five conscientiousness + health behavior (194 studies) | MA | Cited in [JobCannon](https://jobcannon.io/blog/exercise-and-personality-types) |
| RLD, Sports Medicine Open 2023 | Representative learning design | SR | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10232382/) |
| TrackMan practice transfer 2026 | Tech dependency and feedback design | Applied practice | [TrackMan](https://www.trackman.com/blog/golf/trackman-talks-build-practice-that-transfers) |
| APA learning styles myth 2019 | VARK invalidation | Expert consensus | [APA](https://www.apa.org/news/press/releases/2019/05/learning-styles-myth) |
| Forefront Human Engine Research v1 | SDT, adherence, Momentum Engine architecture | Forefront internal SR | Space file |

---

*Report compiled May 29, 2026. All recommendations marked `evidence_supported` reflect consensus from peer-reviewed systematic reviews or meta-analyses. Recommendations marked `inferred_review_required` are directionally supported but require additional validation in golf coaching populations. Recommendations marked `Forefront_proposed` are original architectural proposals consistent with the evidence base but not directly validated in controlled trials.*
