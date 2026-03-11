# KOP Launch Prompt

## Pre-Launch Checklist (Matt does these BEFORE pasting the launch prompt)

### 1. Copy the project folder
Copy the `kop-launch/` folder to your desired project location and rename it:
```bash
cp -r kop-launch/ ~/projects/kop
cd ~/projects/kop
```

### 2. Create .env
```bash
cp .env.example .env
# Edit .env with your actual keys:
# - NEXT_PUBLIC_SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - OPENAI_API_KEY
```

### 3. Initialize git
```bash
git init
git add .
git commit -m "Initial KOP project scaffold"
```

### 4. Connect to GitHub (optional but recommended)
```bash
gh repo create kop-gmc-aboitiz --private --source=. --push
```

### 5. Run Supabase migration
Go to your Supabase dashboard → SQL Editor → paste contents of
`supabase/migrations/001_initial_schema.sql` → Run.

Or if using Supabase CLI:
```bash
supabase db push
```

### 6. Launch Claude Code in the project
```bash
cd ~/projects/kop
claude
```

### 7. Paste the launch prompt below

---

## THE LAUNCH PROMPT
(Copy everything below this line and paste into Claude Code)

---

Read CLAUDE.md, deal.md, and all files in .claude/rules/ and docs/ to understand this project fully. This is a Knowledge Operations Platform for a multi-billion dollar mining partnership deal. You are the brain of this system.

Your first task is Phase 1: Build the KOP Dashboard.

Build a Next.js 14 application in web/dashboard/ that runs on localhost:8888. Read docs/dashboard-design.md for the complete design specification. Here are the critical requirements:

**Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase client (@supabase/supabase-js), Recharts for charts, JetBrains Mono + Inter from Google Fonts.

**Environment:** Read .env for Supabase URL and service role key. Use the service role key in server-side operations (API routes / server actions). Use the anon-equivalent for client-side Supabase Realtime subscriptions.

**Layout (app/layout.tsx):**
- Collapsible sidebar: Zinc 900 (#18181B), 260px expanded / 64px collapsed
- Fixed top bar: Zinc 800 (#27272A), 48px height, white breadcrumb trail
- Black viewport: #000000
- Fixed command bar at bottom: Zinc 900, monospace input, / command autocomplete
- User-selectable primary color via CSS custom properties (default Cyan #22D3EE)
- Color options: Cyan, Blue, Violet, Emerald, Amber, Rose, Sky, Lime, Orange, Fuchsia
- Primary color stored in localStorage, applied as --color-primary CSS variable

**Sidebar Navigation:**
Operations section: Dashboard, Intelligence, Documents, Agent Teams, Production, Deliverables, Presentation Site, Verification
System section: Settings, Activity Log
Active item: primary color left-border + glow + white text

**Pages to build:**

1. **Dashboard (/)** — Phase progress bar (10 phases from deal.md), 4 metric cards (docs processed, intelligence coverage, production status, verification), active agents panel, recent activity feed from Supabase activity_log, deliverable status grid

2. **Intelligence (/intelligence)** — Tab bar for research tracks, research query tracker, processed intelligence file cards with expandable preview, entity profile cards from Supabase entity_profiles

3. **Documents (/documents)** — Document inventory table from Supabase document_inventory, pipeline status visualization, OCR queue section

4. **Agent Teams (/agents)** — Round indicator, agent status cards (Profiler/Translator/Scout/Red Team + Lead), cross-pollination log, objection map table from Supabase objection_register

5. **Production (/production)** — Tabs: Source Documents (with narrative arc visualization at top showing 8 sections and which docs feed which), Prompts, Routing matrix, Outputs with version tracking

6. **Deliverables (/deliverables)** — Large deliverable cards with status, version, engine badge, verification layers (○○○ → ◉◉◉), export center

7. **Verification (/verification)** — Quality gate cards (3 gates with checklists), verification log table, adversarial review panel

8. **Settings (/settings)** — Primary color selector with live preview, deal config editor, Supabase connection status

**On first load, seed the database:**
Insert a deal record for "GMC × Aboitiz Construction" and 10 phase_progress records (one per phase, all starting as 'not_started'). Mark Phase 1 as 'in_progress'.

**Supabase Realtime:** Subscribe to activity_log, phase_progress, document_inventory, deliverable_versions for live dashboard updates.

**Component library to create:**
- StatusBadge (variants: not_started, queued, processing, review, approved, error, verified)
- EngineBadge (opus, notebooklm, perplexity, gemini, grok — each with unique color)
- ProgressRing (48px SVG, primary color fill on zinc track)
- PhaseProgress (10 dots horizontal, click-navigable)
- AgentCard (name, status with pulse animation when active, task, findings)

After building, verify it runs on localhost:8888, connects to Supabase, and all pages render with the design system. Commit when working.
