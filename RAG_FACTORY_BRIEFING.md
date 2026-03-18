# RAG Factory — Technical Briefing Document

> **For:** Another Claude instance integrating this tool into the Master Business Agency
> **Generated:** 2026-03-18 from live codebase analysis
> **Codebase:** `C:\Antigravity\Custombusinesstools`

---

## 1. PURPOSE

RAG Factory is a **universal AI agent template** that any business can deploy to instantly have a conversational AI agent backed by their own knowledge base. Each deployment produces a fully self-contained agent with: RAG-powered chat (Pinecone vectors + Gemini embeddings), automatic knowledge gap research (Claude web_search), real-time market data feeds (weather, crypto, forex, commodities, earthquakes), voice synthesis (ElevenLabs TTS), and a dual-site deployment model (public-facing presentation site + private operator dashboard). The core design principle is **"one repo = one agent = one client"** — duplicate the repo, configure `config.json`, add documents, embed, deploy. The 1,000th deployment works identically to the first.

---

## 2. ARCHITECTURE

### Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Embedding** | Gemini `models/gemini-embedding-2-preview` | 3072 dimensions, batch API |
| **Vector DB** | Pinecone | Shared index, namespace isolation per PROJECT_ID |
| **LLM (Chat)** | Anthropic Claude Sonnet 4 | `claude-sonnet-4-20250514`, streaming SSE |
| **LLM (Research)** | Anthropic Claude + `web_search` tool | Background knowledge gap fill |
| **PDF Extraction** | Gemini 2.5 Flash | Multimodal file processing with page markers |
| **TTS** | ElevenLabs | `eleven_multilingual_v2`, configurable voice ID |
| **Database** | Supabase PostgreSQL + pgvector | Realtime subscriptions, RLS |
| **Presentation Site** | Next.js 14 (App Router) | Deployed to Vercel, serverless API routes |
| **Dashboard** | Next.js 14 | Internal control panel at localhost:3002 |
| **Cron Jobs** | Vercel Crons | Market data refresh every 30 minutes |

### File/Folder Structure

```
Custombusinesstools/
├── config.json                    # SINGLE SOURCE OF TRUTH — all deployment config
├── .env                           # API keys (gitignored)
├── VISION.md                      # Governing design principles
├── CLAUDE.md                      # Agent alignment protocol
│
├── config/
│   ├── system-prompt-template.ts  # Builds dynamic system prompt from config + runtime data
│   ├── live-data.ts               # Weather, forex, crypto, earthquake fetchers
│   └── project.ts                 # Typed config re-export
│
├── knowledge/                     # DROP DOCUMENTS HERE
│   ├── documents/                 # PDFs, images
│   ├── media/                     # Media files
│   └── text/                      # Markdown, TXT
│
├── scripts/
│   └── embed-documents.ts         # MAIN EMBEDDING PIPELINE — scans knowledge/, embeds to Pinecone
│
├── supabase/
│   └── migrations/                # 14+ migration files defining full schema
│
├── web/
│   ├── presentation/              # PUBLIC CLIENT SITE (deployed to Vercel)
│   │   └── src/app/api/
│   │       ├── chat/route.ts      # ⭐ AGENT CHAT ENDPOINT (streaming, RAG, citations)
│   │       ├── process-task/route.ts  # Knowledge gap research (Claude web_search)
│   │       ├── tts/route.ts       # Voice synthesis
│   │       └── update-market-data/route.ts  # Cron-triggered data refresh
│   │
│   └── dashboard/                 # OPERATOR CONTROL PANEL (localhost:3002)
│       └── src/app/api/admin/
│           ├── embed/route.ts     # Trigger document embedding from UI
│           ├── config/route.ts    # Read/write config.json
│           ├── conversations/     # View chat history
│           ├── tasks/             # Monitor background tasks
│           └── documents/         # Document inventory
```

### Data Flow: Document → Agent Response

```
1. INGEST:    Drop files into knowledge/ directory
2. EMBED:     npm run embed → scripts/embed-documents.ts
                ├─ .md/.txt → chunk into parent (1600 char) + children (400 char)
                ├─ .pdf → Gemini extraction → chunk
                └─ .jpg/.png → Supabase Storage + multimodal embed
3. VECTORIZE: Gemini batch embed (3072 dims) → Pinecone upsert (namespace = PROJECT_ID)
4. QUERY:     User asks question → embed question → Pinecone similarity search (top 15)
5. DEDUP:     Group by parent_id → keep highest-scoring child per parent → top 8 parents
6. INJECT:    Parent content injected into system prompt as RAG context
7. RESPOND:   Claude Sonnet 4 streams response with citations
8. RESEARCH:  If top similarity < 0.7 → fire background Claude web_search → embed result
9. FOLLOW-UP: Research result embedded → next query retrieves it → agent delivers update
```

---

## 3. CAPABILITIES

### What It Creates
- A fully operational RAG-powered conversational agent
- A public-facing website with embedded AI chat
- An operator dashboard for managing knowledge, conversations, and tasks
- Automatic knowledge gap research (agent self-improves)
- Voice-enabled responses (ElevenLabs TTS)
- Real-time market data integration (weather, crypto, forex, commodities)

### Inputs It Accepts
| Input Type | Method | Processing |
|-----------|--------|------------|
| Markdown/TXT | Drop in `knowledge/text/` | Parent-child chunking on headings |
| PDF | Drop in `knowledge/documents/` | Gemini multimodal extraction → chunking |
| Images | Drop in `knowledge/documents/` | Upload to Supabase Storage + multimodal embed |
| URLs | Not yet automated | Manual scrape → save as markdown |
| User questions | Real-time via chat | Auto-research for knowledge gaps |

### Chunking Strategy
| Parameter | Value |
|-----------|-------|
| Parent chunk | 1600 chars (~500 tokens) |
| Child chunk | 400 chars (~130 tokens) |
| Split points | `##` headings → `###` sub-headings → sentence boundaries |
| Overlap | None (parent-child strategy provides context) |
| Min child size | 20 chars |
| Embedding model | Gemini `models/gemini-embedding-2-preview` (3072 dims) |
| Batch size | 20 documents per API call |

### Retrieval Method
- **Similarity search** via Pinecone (cosine distance)
- Top 15 results → deduplicate by `parent_id` → top 8 unique parents
- Similarity threshold: 0.3 (retrieval), 0.7 (research trigger)
- Child vectors are searched; parent content is injected into LLM context
- Citations include source file, section heading, page number, confidence score

---

## 4. INTERFACE

### User-Facing
- **Chat modal** on the presentation website (AIChat.tsx component)
- Text input with streaming responses
- Voice mode (toggle for TTS responses)
- Citation links showing source documents and confidence
- Auto-research indicator when agent is filling knowledge gaps

### Operator-Facing (Dashboard at localhost:3002)
- Document management (upload, embed, monitor status)
- Conversation viewer (all chat history)
- Task monitor (background research jobs)
- Config editor (modify config.json via UI)
- Pipeline visualization (steampunk-themed animated SVG)

### Workflow: New Agent → Operational
1. Clone/duplicate the repo
2. Generate a new UUID for PROJECT_ID
3. Create Supabase project, run migrations
4. Create Pinecone namespace (or use shared index)
5. Fill `.env` with credentials
6. Edit `config.json` (company, agent persona, brand colors, data feeds)
7. Edit `web/presentation/system-prompt.md` (agent personality)
8. Drop documents into `knowledge/`
9. Run `npm run embed`
10. Deploy `web/presentation` to Vercel
11. Agent is live

---

## 5. INTEGRATION POINTS

### External APIs

| API | Purpose | Auth | Cost |
|-----|---------|------|------|
| Anthropic Claude | Chat responses + web_search research | API key | Pay-per-token |
| Gemini API | Embeddings (batch), PDF extraction | API key | Free tier available |
| Pinecone | Vector similarity search | API key | Free tier: 1 index |
| Supabase | Database + Realtime + Storage | Anon key + Service role key | Generous free tier |
| ElevenLabs | Text-to-speech | API key | 30K chars/month free |
| Open-Meteo | Weather, air quality, geocoding | None | Free, no key needed |
| CoinGecko | Crypto prices | None | Free tier |
| ExchangeRate-API | Forex rates | None | Free |
| USGS | Earthquake data | None | Free |

### Programmatic Integration Points

**To trigger a new RAG agent creation programmatically:**
1. Clone the repo template
2. Write `config.json` with new values
3. Write `.env` with credentials
4. Run `npm run embed` (spawns `scripts/embed-documents.ts`)
5. Deploy via `vercel --prod` or equivalent

**To add documents to an existing agent:**
1. Place files in `knowledge/` subdirectories
2. Run `npm run embed` — it scans the directory and processes new/changed files
3. Or POST to dashboard `/api/admin/embed` endpoint

**To query an agent's knowledge base directly:**
```typescript
// Embed a question
const embedding = await embedViaGemini(question, 3072);

// Query Pinecone
const results = await pineconeIndex.namespace(PROJECT_ID).query({
  vector: embedding,
  topK: 15,
  includeMetadata: true
});

// Deduplicate by parent_id, take top 8
const context = dedup(results.matches);
```

**Key environment variables for integration:**
- `PINECONE_INDEX_HOST` — the Pinecone endpoint for this deployment
- `PROJECT_ID` — the namespace isolating this agent's vectors
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — database access

---

## 6. SUPABASE SCHEMA

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `deals` | Project container | `id UUID PK, name, source_entity, target_entity, status, deal_config JSONB` |
| `intelligence_documents` | Embedded chunks (legacy pgvector) | `id, deal_id FK, content TEXT, embedding VECTOR(1536), track, category, confidence_level, verified` |
| `entity_profiles` | People/company profiles | `id, deal_id FK, entity_name, entity_type, profile_data JSONB` |
| `objection_register` | Red team objections | `id, deal_id FK, objection TEXT, severity, category, response TEXT` |
| `deliverable_versions` | Output tracking | `id, deal_id FK, deliverable_type, version_number, production_engine, status` |
| `activity_log` | Dashboard event feed | `id, deal_id FK, event_type, title, detail, severity` |
| `phase_progress` | Workflow stages | `id, deal_id FK, phase_number (1-10), status` |
| `document_inventory` | File tracker | `id, deal_id FK, filename, file_type, pipeline, processing_status` |

### Agent Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `external_agent_conversations` | Public chat history | `id, role, content, sender_name, created_at` (anon-readable RLS) |
| `agent_conversations` | Internal/dashboard chat | `id, deal_id FK, role, content, sender_name, created_at` |
| `agent_tasks` | Background research jobs | `id, conversation_id, task_type, payload JSONB, status, priority, result JSONB` |
| `market_data` | Cached live feeds | `id, prices JSONB, weather JSONB, fetched_at` |

### Key Database Function

```sql
match_intelligence(query_embedding, match_threshold, match_count, filter_deal_id, filter_track, filter_category)
-- Cosine similarity search: 1 - (embedding <=> query_embedding)
-- Returns top K matches with scores and metadata
```

### Realtime Subscriptions
Enabled on: `activity_log`, `phase_progress`, `document_inventory`, `deliverable_versions`, `agent_conversations`, `external_agent_conversations`

### RLS Policy
- Internal tables: RLS disabled (single-user local tool)
- `external_agent_conversations`: Anon-readable (public chat)
- `market_data`: Service-role only writes

---

## 7. CURRENT STATE

### Production-Ready ✅
- Chat endpoint (streaming SSE, RAG retrieval, citations, voice mode)
- Knowledge gap auto-research (Claude web_search → embed → follow-up)
- Document embedding pipeline (markdown, PDF via Gemini, images)
- Voice synthesis (ElevenLabs TTS)
- Real-time market data feeds (weather, crypto, forex, commodities, earthquakes)
- Conversation persistence (Supabase)
- Dashboard with realtime updates
- Config-driven deployment (one config.json controls everything)

### Known Limitations
- **No client-upload UI** — documents are added via file drop + CLI embed (dashboard embed endpoint exists but is operator-only)
- **No authentication layer** — assumes trusted single-user environment
- **No document versioning** — re-embedding overwrites previous vectors
- **PDF extraction** optimized for text-heavy PDFs; complex layouts may lose structure
- **Market data cache** is 4 hours (hardcoded in chat route)
- **No web scraper integration** — URLs must be manually converted to markdown

### What Would Need to Change for 10+ Specialist RAG Agents

The system is designed for exactly this via the **one repo = one agent** model:

1. **Each specialist gets its own repo clone** — completely isolated Pinecone namespace, Supabase project, and config
2. **An orchestration layer** would need to:
   - Maintain a registry of agent endpoints (URL + PROJECT_ID per specialist)
   - Route questions to the appropriate specialist based on domain
   - Trigger `npm run embed` across multiple repos when knowledge bases update
3. **Shared infrastructure** that already works:
   - Pinecone index can hold unlimited namespaces (one per agent)
   - Supabase projects are free to create
   - Vercel deployments scale independently
4. **What doesn't exist yet:**
   - No API for programmatic agent creation (currently manual clone + configure)
   - No central registry or routing layer
   - No cross-agent communication protocol

---

## 8. REUSE INSTRUCTIONS

### To Spin Up a "Content Marketing Specialist" Agent

**Step 1: Clone the template**
```bash
cp -r Custombusinesstools ContentMarketingAgent
cd ContentMarketingAgent
```

**Step 2: Generate unique identity**
```bash
node -e "console.log(require('crypto').randomUUID())"
# e.g., a3b4c5d6-e7f8-9012-3456-789abcdef012
```

**Step 3: Create Supabase project**
- New project at supabase.com
- Run all migrations: `npx supabase db push`
- Copy URL, anon key, service role key

**Step 4: Configure `.env`**
```env
SUPABASE_URL=https://new-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
PINECONE_API_KEY=...
PINECONE_INDEX_HOST=...
PROJECT_ID=a3b4c5d6-e7f8-9012-3456-789abcdef012
ELEVENLABS_API_KEY=...
PROCESS_TASK_URL=https://content-marketing-agent.vercel.app/api/process-task
TASK_PROCESSOR_SECRET=<generate-64-char-hex>
```

**Step 5: Configure `config.json`**
```json
{
  "company": { "name": "Content Marketing Division", ... },
  "agent": {
    "name": "ContentBot",
    "role": "Content Marketing Specialist",
    "personality": "An expert content strategist who understands SEO, social media, email marketing, and brand voice..."
  },
  "supabase": { "project_id": "a3b4c5d6-e7f8-9012-3456-789abcdef012" },
  "rag": { ... }
}
```

**Step 6: Write system prompt** (`web/presentation/system-prompt.md`)
```markdown
You are ContentBot, a Content Marketing Specialist AI...
```

**Step 7: Add domain knowledge**
```
knowledge/
├── text/
│   ├── content-strategy-playbook.md
│   ├── seo-best-practices.md
│   ├── social-media-guidelines.md
│   └── brand-voice-guide.md
├── documents/
│   ├── competitor-analysis.pdf
│   └── audience-research.pdf
```

**Step 8: Embed and deploy**
```bash
npm run sync-config
npm run embed
cd web/presentation && vercel --prod
```

**Result:** A fully operational Content Marketing Specialist agent with its own knowledge base, personality, and deployment — completely isolated from all other agents.

### Hardcoded Assumptions to Generalize
- `config.json` paths are relative to repo root — this works as-is for cloned repos
- Pinecone index name (`kop-intelligence`) is shared — all agents use the same index, isolated by namespace. This is fine for scale.
- The `deals` table schema has columns like `source_entity` and `target_entity` that are specific to the original business-deal use case. For a pure marketing agent, these would be unused but harmless.
- Dashboard steampunk theme is cosmetic — can be reskinned per deployment via config.json brand colors

---

## 9. CONFIGURATION REFERENCE

### config.json — Complete Field Reference

| Section | Key Fields | Purpose |
|---------|-----------|---------|
| `company` | name, short_name, tagline, description, domain, email, address, founded_year | Business identity |
| `agent` | name, role, personality, avatar_path, systemPromptPath | Agent persona |
| `voice` | provider, voiceId, model | TTS configuration |
| `brand` | primary, secondary, accent, dark, light, success, warning | UI theme colors |
| `fonts` | headline, body, mono | Typography |
| `supabase` | project_id | Pinecone namespace + database isolation |
| `dataFeeds` | defaultLocation, baseCurrency, cryptoAssets, earthquakeMinMagnitude, stockSymbols, sportsLeagues | Live data configuration |
| `rag` | embeddingModel, embeddingDimensions, matchCount, similarityThreshold, researchThreshold, chunkMaxChars, childChunkChars, pinecone.indexName | RAG pipeline tuning |
| `nav_links` | label, href pairs | Presentation site navigation |

### Key npm Scripts

| Script | What It Does |
|--------|-------------|
| `npm run embed` | Scan `knowledge/`, chunk, embed via Gemini, upsert to Pinecone |
| `npm run sync-config` | Copy root `config.json` to `web/presentation/` and `web/dashboard/` |

---

## 10. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION SITE                     │
│                  (Vercel / Next.js 14)                   │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Chat UI  │→ │ /api/chat    │→ │ Claude Sonnet 4  │  │
│  │(AIChat)  │  │ (streaming)  │  │ (with RAG ctx)   │  │
│  └──────────┘  └──────┬───────┘  └──────────────────┘  │
│                       │                                  │
│            ┌──────────┴──────────┐                       │
│            │                     │                       │
│     ┌──────▼──────┐    ┌────────▼────────┐              │
│     │  Pinecone   │    │ /api/process-   │              │
│     │  (vector    │    │ task (research) │              │
│     │  search)    │    │ Claude+web_srch │              │
│     └──────┬──────┘    └────────┬────────┘              │
│            │                    │                        │
│            │         ┌──────────▼──────────┐            │
│            │         │ Embed research →    │            │
│            │         │ Pinecone (auto-     │            │
│            │         │ research track)     │            │
│            │         └─────────────────────┘            │
│     ┌──────▼──────┐                                     │
│     │  Gemini     │    ┌──────────────────┐             │
│     │  Embedding  │    │ ElevenLabs TTS   │             │
│     │  API        │    │ /api/tts         │             │
│     └─────────────┘    └──────────────────┘             │
│                                                         │
│     ┌─────────────────────────────────────┐             │
│     │ Live Data Feeds (cron every 30min)  │             │
│     │ Weather · Crypto · Forex · Quakes   │             │
│     └─────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      SUPABASE                            │
│  conversations · tasks · market_data · activity_log      │
│  Realtime subscriptions · pgvector (legacy)              │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  OPERATOR DASHBOARD                       │
│                   (localhost:3002)                        │
│  Documents · Conversations · Tasks · Config · Pipeline   │
└─────────────────────────────────────────────────────────┘
```

---

*This briefing was generated from live codebase analysis on 2026-03-18. All file paths, schemas, and capabilities reflect the current production state of the RAG Factory.*
