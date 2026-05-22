# Forefront Golf Coach Builder

A deployable, contained web app for **Brendan Hayden / Forefront** that turns the
Forefront Golf Manual drill-card library into a guided coach workflow.

This is a **full-system proof of concept** — every UI surface, every artifact,
every Supabase table is here so the design can be reviewed end-to-end before
any of it is wired into the live Forefront build.

---

## What this app does

1. **Coach Wizard** — an 8-step guided flow:
   *Gate → Layer (FM-300) → Visible Flaw → Diagnostic Branch / Flaw Version →
   GP-L (1–5) → Tool inventory → Drill picks → Session build / output.*
2. **Drill Library** — full searchable / filterable catalogue of 80 drill and protocol cards,
   each carrying its motor-learning rationale (Wulf, Winkelman, Gray/CLA,
   feedback fading, cue proximity, representativeness, practice block, and
   learning-stage fit, TrackMan Performance Studio mode routing, and an expanded
   visible-flaw taxonomy with 66 total visible flaws before cause selection,
   full-coverage diagnostic branch cards for every flaw, authored high-frequency
   branch overrides for the major start-line / curve / contact / posture /
   ground-force patterns, authored system branches for speed, low point, wedge,
   putting, course-transfer, equipment, and readiness faults, generated proof-test
   cards for every branch, plus a fault-to-drill bridge so new flaw IDs map into
   existing drill families and legacy solve tags).
3. **Session Builder** — pick duration, goal, GP-L, tools; the engine allocates
   warmup / acquisition / transfer / scoring / retest minutes against an
   evidence-based template.
4. **Three outputs from one selection**:
   - **Coach Plan** (internal, jargon allowed)
   - **Client Assignment** (jargon-free, external cues only, ≤120 words)
   - **Printable Coach Card** (single-page, `@media print` styled)
5. **Reference panel** — Wulf, Winkelman, Gray, OPTIMAL theory, feedback fading
   rules, representativeness rating, one-cue-per-rep doctrine.
6. **Handoff panel** — instructions for promoting this POC onto
   `forefrontops.tech` via Next.js + Vercel.

---

## Hard constraints honoured

- ❌ **No `localStorage` / `sessionStorage` / `indexedDB` / cookies.** All state
  lives in `window.FF.state` (plain JS object). State resets on reload — by
  design.
- ❌ **No live Supabase connection.** SQL is shipped in `/supabase/migration.sql`
  for manual review and execution.
- ❌ **No client PII, no phone numbers, no SMS / email / cron, no DB writes.**
- ❌ **No build step.** Plain `index.html` + vanilla ES6 + CSS. Deployable as a
  static bundle through `deploy_website` immediately.
- ✅ **Field-manual aesthetic** matching the existing
  `forefront-golf-field-manual` (warm paper, teal accent, dark ink, serif heads,
  sans body, mono labels).

---

## File map

```
forefront-golf-coach-builder/
├── index.html                  ← SPA shell (sidebar nav + view containers)
├── assets/
│   ├── style.css               ← design system + print styles
│   └── app.js                  ← all view logic, wizard, session engine, outputs
├── data/
│   ├── drills.js               ← seed FF_DRILLS array + lookup tables (gates,
│   │                              layers, faults, GP-L, tools, goals, durations)
│   └── deepening.js            ← expanded proof-of-concept cards, stage/block
│                                  metadata, TrackMan modes, diagnostic branches,
│                                  curated diagnostic overrides, diagnostic test
│                                  cards, equipment triage, and coverage fixes
├── supabase/
│   └── migration.sql           ← proposed schema (DO NOT auto-run; manual only)
├── docs/                       ← reserved for future PDFs / specs
└── README.md                   ← this file
```

---

## How to edit drill data

Seed drill cards live in **`data/drills.js`**. The current deepened proof-of-concept
library is appended in **`data/deepening.js`** so the original seed set stays
reviewable. To add or modify a drill:

1. Open `data/deepening.js` for new POC cards, or `data/drills.js` for seed-card
   corrections.
2. Append (or modify) an object matching this schema:

```js
{
  drill_id:               'speed_overspeed_v2',       // unique kebab/snake string
  name:                   'SuperSpeed Overspeed v2',
  category:               'speed',                     // see categories below
  solves:                 ['low_chs','speed_ceiling'], // fault IDs from FF_FAULTS
  cause_lane:             'physical',                  // skill | physical | psych | equipment
  gpl_fit:                ['L2','L3'],                 // any of L1–L5
  description:            'Three overspeed sticks, 3x6 reps...',
  when_why:               'Use when CHS has plateaued for 4+ weeks...',
  active_cue:             'Whip the tip past your hands', // EXTERNAL, ≤7 words
  description_note:       'Fade cue to summary by week 3',
  cue_proximity:          'distal',                    // distal | proximal-external | internal
  constraint_alternative: 'Lighter club + alignment stick if sticks unavailable',
  representativeness:     'Medium',                    // Low | Medium | High
  feedback_schedule:      'faded',                     // every_rep | faded | summary | self_assessed | none
  conflict:               'Avoid in-season for HCP > 15',
  progression:            'Add range-ball gates after wk 4',
  regression:             'Drop to 2x6',
  proof_metric:           'CHS ± 1 mph (TrackMan)',
  source_tags:            ['SuperSpeed','OPTIMAL','Wulf']
  practice_block:         'serial_variability',       // blocked_acquisition, random_variability, etc.
  learning_stage:         'guided_variability'        // acquisition, contextual_interference, etc.
}
```

3. Save. Reload `index.html` in the browser — the new drill appears in the
   library and becomes eligible for the wizard immediately.

### Categories currently supported
`speed`, `ground_force`, `club_face_path`, `contact_lowpoint`, `short_game`,
`putting`, `course_transfer`, `warmup_prep`, `psychology`.

To add a new category, also add a label entry to the relevant lookup at the top
of `data/drills.js` (e.g. extend `FF_GOALS` if it should appear in the wizard).

### Editing faults, GP-L, tools, gates, layers
All lookup tables live at the top of `data/drills.js`:

| Lookup       | Purpose                                       |
| ------------ | --------------------------------------------- |
| `FF_GATES`   | Wizard step 1 — assessment gates              |
| `FF_LAYERS`  | Wizard step 2 — FM-300 six-layer diagnostic   |
| `FF_FAULTS`  | Wizard step 3 — visible-flaw catalogue        |
| `FF_DIAGNOSTIC_BRANCHES` | Wizard step 4 — flaw-version cards and routing |
| `FF_DIAGNOSTIC_TEST_CARDS` | Wizard step 4 proof layer — setup, protocol, pass/fail, use-result |
| `FF_GPL`     | Wizard step 5 — GP-L 1–5 with acq/xfr ratios  |
| `FF_TOOLS`   | Wizard step 6 — tool inventory                |
| `FF_GOALS`   | Session Builder goal dropdown                 |

---

## Running locally

No build step. Just serve the folder:

```bash
cd forefront-golf-coach-builder
python3 -m http.server 8080
# open http://localhost:8080
```

Or simply open `index.html` directly in a browser (works because there is no
fetch-based loading — all data is inlined via `<script src="data/drills.js">`).

---

## Deployment

### A) Quick POC deploy (Perplexity)

The parent agent will run:

```text
deploy_website(
  project_path="forefront-golf-coach-builder",
  site_name="Forefront Golf Coach Builder"
)
```

This bundles the folder to S3 and returns a private URL only Brendan can reach.
Re-deploying the same `project_path` updates the existing site at the same URL.

### B) Promote to `forefrontops.tech` via Next.js + Vercel

When you're ready to move this off the POC URL onto a Forefront-owned subdomain
(e.g. `golf-coach.forefrontops.tech`):

1. **Wrap in Next.js 14 (App Router).**
   ```bash
   npx create-next-app@14 forefront-golf-coach --app --ts --no-tailwind
   ```
2. **Port the static files:**
   - `index.html` body → `app/page.tsx` (split views into client components)
   - `assets/style.css` → `app/globals.css`
   - `assets/app.js` → split into `components/Wizard.tsx`, `components/Library.tsx`,
     `components/SessionBuilder.tsx`, `components/Outputs.tsx`
   - `data/drills.js` → `lib/drills.ts` with explicit `Drill` interface
3. **Add server-side Supabase reads** (templates / outputs only) once the
   migration in `/supabase/migration.sql` has been reviewed and executed.
   Use `@supabase/ssr` with privileged database access in server actions only;
   never expose private credentials in client code.
4. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```
5. **DNS:** add a CNAME on `forefrontops.tech`:
   ```
   golf-coach   CNAME   cname.vercel-dns.com
   ```
   Add the custom domain in the Vercel project settings; SSL is auto-issued.

### C) Supabase rollout (when ready)

1. Open `supabase/migration.sql`.
2. Snapshot the existing project (Supabase dashboard → Database → Backups).
3. Paste the SQL into the SQL editor and run it **statement-by-statement**.
4. Generate seed INSERTs from `data/drills.js` (template at the bottom of
   `migration.sql`); execute those through a privileged server-side connection.
5. Tighten RLS policies before exposing any UI to authenticated users — the
   shipped policies are read-only stubs and assume permissive access.

---

## Design / content decisions

**Aesthetic.** Sibling to `forefront-golf-field-manual`. Warm paper background
(`#f5f1e8`), deep ink text (`#16201e`), teal accent (`#0f5e57`), warning amber,
crimson alarms, mono labels. Source Serif Pro for heads, Inter for body, JetBrains
Mono for tags. Dense but readable, never SaaS-generic.

**Information architecture.** Single SPA, six hash routes
(`#wizard`, `#session`, `#library`, `#output`, `#reference`, `#handoff`). The
wizard is rendered on one long page with a step rail at the top showing
done/active/pending so a coach can scrub back without losing context.

**Time-allocation engine.** Inside `buildSessionPlan()`:

- Warmup = 15% of duration (min 5 min)
- Retest = 10% (min 5 min)
- Scoring = 8% (only if duration ≥ 45 min)
- Remainder split acquisition / transfer by GP-L:
  - L1 → 85 / 15
  - L2 → 70 / 30
  - L3 → 50 / 50
  - L4 → 30 / 70
  - L5 → 20 / 80

**Motor-learning grounding.** Every drill carries `active_cue` (external,
verb-first, ≤7 words per Winkelman), `feedback_schedule` (faded by default per
Wulf & Su 2007), `cue_proximity`, `constraint_alternative` (CLA), and
`representativeness` (Low/Medium/High per Rob Gray). The Reference panel cites:

- Wulf & Su 2007 — https://pubmed.ncbi.nlm.nih.gov/17941543/
- An & Wulf 2024 — https://pubmed.ncbi.nlm.nih.gov/37952707/
- Wulf & Lewthwaite OPTIMAL 2016 — https://pubmed.ncbi.nlm.nih.gov/26833314/
- Winkelman / OTP — https://www.otpbooks.com/coaching-movements-and-skills-with-nick-winkelman/
- Rob Gray, *How We Learn to Move* — https://perceptionaction.com/book/
- Barzyk & Gruber 2024 — https://pmc.ncbi.nlm.nih.gov/articles/PMC10899359/
- Frontiers ecological dynamics 2023 — https://pmc.ncbi.nlm.nih.gov/articles/PMC10244639/

**Why vanilla JS, not React.** No persistence, no auth, no API calls in the POC.
Vanilla keeps the file count low, the deploy instant, and the visual debt zero.
The Next.js handoff path is documented above for the moment it makes sense to
upgrade.

---

## Known scope cuts (intentional)

- **No login.** The POC is read/preview-only.
- **No save/load of sessions.** State resets on reload — no storage permitted.
- **No real Supabase calls.** Migration is shipped but not executed.
- **No PDF export.** Use browser print → "Save as PDF" on the Coach Card view.
- **No analytics.** No tracking pixels, no telemetry.

---

## Handoff checklist (for whoever picks this up next)

- [ ] Review `supabase/migration.sql` line by line; snapshot DB before running.
- [ ] Generate drill INSERTs from `data/drills.js` and seed the table.
- [ ] Decide on coach-scoped RLS before any authenticated UI ships.
- [ ] Port to Next.js 14 (see section B above) when subdomain is ready.
- [ ] Add Supabase Auth (email magic link) for coaches only — never clients.
- [ ] Wire up a `/api/sessions` route once write permissions exist.
- [ ] Consider exporting Coach Cards as PDFs via Puppeteer once Next.js is live.

---

*Brendan Hayden / Forefront — Coach Builder POC v0.1.0*
