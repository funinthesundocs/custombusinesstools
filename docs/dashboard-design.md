# Dashboard Design Specification

## Layout
- Dark theme: Black (#000000) viewport, Zinc 900 (#18181B) sidebar, Zinc 800 (#27272A) top bar
- Collapsible sidebar: 260px expanded / 64px collapsed
- Fixed top bar: 48px height, white breadcrumb trail
- Fixed command bar at bottom: 52px, expandable to 200px
- User-selectable primary accent color, default Cyan (#22D3EE)

## Color System
Primary color applied via CSS custom properties (--color-primary, --color-primary-muted, --color-primary-border).
User selects from: Cyan, Blue, Violet, Emerald, Amber, Rose, Sky, Lime, Orange, Fuchsia.
All accent elements reference the CSS variable, enabling instant re-theme.

Foundation: Black viewport, Zinc 900 cards/sidebar, Zinc 800 top bar/borders.
Text: Zinc 100 primary, Zinc 400 secondary, Zinc 500 muted.
Breadcrumbs: White on Zinc 800. Active segment in primary color.

## Typography
- Headers: Inter 600/700
- Body: Inter 400/500
- Monospace: JetBrains Mono 400/500 (file paths, commands, technical data)
- Scale: 24px page title, 18px section, 15px card title, 14px body, 12px caption, 11px badge

## Sidebar Navigation
Operations: Dashboard, Intelligence, Documents, Agent Teams, Production, Deliverables, Presentation Site, Verification
System: Settings, Activity Log
Active item: Primary color left-border + glow background + white text
Collapsed: Icons only with tooltips

## Top Bar
Left: Toggle + KOP + breadcrumb (Deal Name › Current Page)
Right: Color picker circle, Settings gear, Notification bell with count badge

## Command Bar
Fixed bottom. Monospace input. `/` triggers command autocomplete.
Phase-aware: current phase commands first, others dimmed below divider.
Commands: /research-target, /process-documents, /engineer-context, /route-production, /build-web, /verify-claims
Expandable output stream for command results.

## Pages

### Dashboard (Home)
- Phase progress bar (10 dots, completed=primary, current=pulse, future=zinc)
- 4 metric cards: Documents Processed, Intelligence Coverage, Production Status, Verification
- Two columns: Active Agents (left) + Recent Activity feed (right)
- Deliverable status grid at bottom

### Intelligence
- Tab bar: Target Entity, Regulatory, Competitive, Cultural, All
- Research tracker table (query, engine, status, sources, date)
- Processed intelligence cards with expandable preview
- Entity profile cards

### Documents
- Document inventory table (filename, type, pipeline, status, confidence)
- Pipeline status visual
- OCR queue with drag-drop upload
- Type badges color-coded by processing engine

### Agent Teams
- Team status header (current round, health dots, elapsed)
- Lead agent card full-width + 4 agent cards in 2x2 grid
- Each: name, status, current task, findings, outputs, dependencies
- Active agents: primary border pulse. Waiting: zinc border.
- Cross-pollination log timeline
- Objection map table (severity/source/category badges)

### Production
- Tabs: Source Documents, Prompts, Routing, Outputs
- Source Documents tab has NARRATIVE ARC VISUALIZATION at top:
  Horizontal flow of 8 presentation sections as nodes, with lines showing
  which source documents feed which sections. Critical visualization.
- 9 source document cards below with status and quality rings
- Prompts tab: engine-specific prompt cards with copy-to-clipboard
- Routing tab: visual matrix of deliverable → engine mapping
- Outputs tab: version-tracked outputs with side-by-side comparison

### Deliverables
- Large status cards per deliverable
- Status badges: Not Started / In Progress / Review / Approved
- Verification layers: ○○○ → ◉◉◉
- Actions: Preview, Download, Export, Approve
- Export center: batch ZIP, format-specific exports

### Presentation Site
- Preview iframe (desktop/tablet/phone toggle)
- Build and deploy controls
- deal-config.ts inline editor
- Content mapping visualization

### Verification
- Quality gate cards (Gate 1, 2, 3) with checklist items
- Gate status: LOCKED (red) / OPEN (amber) / PASSED (emerald)
- Verification log table (claim, source, layer, model, result)
- Adversarial review panel

### Settings
- Primary color selector (10 circles, checkmark on current)
- Deal configuration editor (inline deal.md fields)
- Connection status cards (Supabase, GitHub, Perplexity, Gemini)
- System info and export

## Component Library
- StatusBadge (not_started/queued/processing/review/approved/error/verified)
- EngineBadge (opus/notebooklm/perplexity/gemini/grok — color-coded)
- ProgressRing (48px, primary fill on zinc track)
- PhaseProgress (10 dots with labels, click-navigable)
- AgentCard (status, task, findings, outputs)
- CommandAutocomplete (/ triggered, phase-aware filtering)

## Animations
- Page transitions: 200ms ease-out opacity + 8px translateY
- Sidebar collapse: 200ms ease-in-out width
- Card hover: 150ms border brighten + translateY(-1px)
- Agent pulse: 2s ease-in-out infinite border glow (active agents)
- Status dot pulse: 1.5s opacity animation
- Loading: Zinc 800 skeleton screens with shimmer

## Real-Time
Supabase Realtime subscriptions on: activity_log, phase_progress, document_inventory, deliverable_versions.
Dashboard updates live without refresh. Activity feed prepends with fade-in.

## Agent Bridge
Agents write status to Supabase as they work. Dashboard subscribes.
scripts/agent-bridge.ts polls ~/.claude/teams/ state and syncs to Supabase.
