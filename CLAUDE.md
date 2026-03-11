# Knowledge Operations Platform (KOP)

## What This Is
A system that gathers intelligence, processes documents, engineers context,
and routes production tasks to the optimal AI model — producing meeting-ready
materials for high-stakes business engagements.

## Architecture
- **Opus** = Brain (context engineer, production router, agent coordinator)
- **Production Engines** = Model-agnostic routing (see .claude/rules/production-routing.md)
- **Dashboard** = Next.js command center at localhost:8888
- **Supabase** = Knowledge store (structured data + pgvector embeddings)
- **Presentation Site** = Client-facing deliverable (separate Next.js build)

## Current Deal
See `deal.md` for all deal-specific context (target entity, source entity, narrative arc).

## Tech Stack
- Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + pgvector + Realtime)
- OpenAI text-embedding-3-small for embeddings
- GitHub for version control

## Document Processing
Each document type has a specific pipeline. See `.claude/rules/document-processing.md`.
- PowerPoints → analyze content + communication style
- Word Docs → pandoc extract → Opus synthesis
- Spreadsheets → parse → financial narrative
- Technical Images (maps, diagrams) → Gemini multimodal interpretation
- Legal/Corporate → Opus credibility extraction
- LOIs/MOUs → Opus deal momentum extraction
- OCR-required → Tesseract → re-route to correct pipeline
- Websites → scrape → classify → route by topic

## Production Routing
Opus selects the best AI engine for each deliverable. See `.claude/rules/production-routing.md`.
NEVER assume one engine handles everything. Route per task:
- Source-grounded slides/infographics/audio → NotebookLM
- Deep narrative writing → Opus
- Cited company research → Perplexity Deep Research
- Multimodal image interpretation → Gemini
- Cross-model verification → different model than generator

## Dashboard Design
- Dark theme: Black (#000000) viewport, Zinc 900 sidebar, Zinc 800 top bar
- User-selectable primary color (default Cyan #22D3EE) for accents
- White breadcrumb trail on top bar
- Collapsible sidebar (260px expanded / 64px collapsed)
- Fixed command bar at bottom with / command autocomplete
- Real-time updates via Supabase Realtime subscriptions
- Pages: Dashboard, Intelligence, Documents, Agent Teams, Production, Deliverables, Presentation Site, Verification, Settings
- See `docs/dashboard-design.md` for full design specification

## Quality Standards
- Every claim traces to a source document
- Every number verified against original data
- Cross-model verification on critical assertions
- Three-layer verification: source tracing → cross-model → adversarial review

## Commands
- `/research-target` — Run audience intelligence gathering
- `/process-documents` — Run all document processing pipelines
- `/engineer-context` — Create production source documents and prompts
- `/route-production` — Generate deliverables via optimal engines
- `/build-web` — Build/update presentation site
- `/verify-claims` — Cross-model verification pass

## Key Directories
- `intelligence/raw/` — Unprocessed source materials by category
- `intelligence/processed/` — Opus-synthesized intelligence files
- `production/source-documents/` — 9 curated documents for production engines
- `production/prompts/` — Engine-specific prompts per deliverable
- `production/outputs/` — Versioned deliverable outputs (v1/v2/v3/final)
- `web/dashboard/` — KOP Dashboard (localhost:8888)
- `web/presentation/` — Client-facing deliverable site
- `docs/` — Narrative arc, meeting prep, design specs

## Supabase
- Migration in `supabase/migrations/001_initial_schema.sql`
- RLS disabled for development (single-user local tool)
- Realtime enabled on: activity_log, phase_progress, document_inventory, deliverable_versions
- Embeddings via OpenAI text-embedding-3-small (key in .env)

## Environment Variables
All keys in `.env` — see `.env.example` for required variables.
NEVER commit .env to git.
