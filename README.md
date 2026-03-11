# RAG Factory

A production-ready Knowledge Operations Platform with bidirectional AI agents, RAG-powered intelligence, real-time research, voice interaction, and cinematic web presentation.

**What it does:** Your users talk to an AI agent that knows everything about your business. When the agent can't answer, it researches in real time — searches the web, synthesizes the answer, embeds it into the knowledge base, and delivers it back to the user within seconds. The system gets smarter with every question it can't answer.

## Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Netlify account (free tier works)
- API keys: Anthropic (chat), Gemini (embeddings), ElevenLabs (voice)

## Quick Start

1. Copy `.env.example` to `.env` and fill in your API keys and Supabase credentials
2. Fill in `config.json` with your company identity, brand colors, and agent personality
3. Write your domain context in `deal.md`
4. Drop your documents into `intelligence/raw/source/` folders (organized by: technical, financial, legal, corporate, competitive)
5. Drop your images into `web/presentation/public/images/` folders
6. Link Supabase: `npx supabase link --project-ref YOUR_PROJECT_REF`
7. Run migrations: `npx supabase db push`
8. Process and embed your documents into Supabase pgvector
9. Deploy: `cd web/presentation && npm run build && npx netlify deploy --prod`

## Architecture

- **Public Site** (`web/presentation/`): Next.js — your audience-facing website with AI chat
- **Dashboard** (`web/dashboard/`): Next.js — your operator control panel
- **AI Agent** (`netlify/functions/chat.mts`): RAG-powered chat with real-time research fallback
- **Research Pipeline** (`netlify/functions/process-task.mts`): Automated knowledge gap filling
- **Market Data** (`netlify/functions/update-market-data.mts`): Scheduled commodity and weather updates
- **Voice** (`netlify/functions/tts.mts`): ElevenLabs text-to-speech streaming
- **Database**: Supabase PostgreSQL + pgvector for semantic search

## Key Files

- `config.json` — Company identity, brand, agent personality, navigation
- `deal.md` — Domain context that shapes the agent's understanding
- `.env` — API keys and service credentials (never commit this)
