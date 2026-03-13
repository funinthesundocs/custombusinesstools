# Template Configuration

This directory contains all non-sensitive project configuration for the KOP template.

## Files

| File | Purpose |
|---|---|
| `project.ts` | All project identity and settings — edit this for each new deployment |
| `system-prompt.md` | The AI agent's complete system prompt — created in Step 2 of setup |
| `README.md` | This file |

## Separation of concerns

**`config/project.ts`** — Non-sensitive settings: brand identity, agent name, voice ID, RAG parameters, content paths, deal metadata. Safe to commit. Edit this file to customize the template.

**`.env`** — Secrets only: API keys, Supabase URL, service role key, deal UUID. Never committed. Copy `.env.example` to `.env` and fill in your values.

## Quick Start (new deployment)

1. Edit every `REPLACE_` value in `project.ts`
2. Copy `.env.example` to `.env` and fill in API keys and Supabase credentials
3. Write your `config/system-prompt.md` (use `system-prompt-template.md` as a guide once Step 2 is complete)
4. Drop source documents into `production/source-documents/`
5. Run `npm run embed` to chunk and embed documents into Supabase
6. Run `npm run build` in `web/presentation` and `web/dashboard`
7. Deploy

## What each config section drives

| Section | Controls |
|---|---|
| `projectName` / `companyName` / `tagline` | Dashboard title, presentation site hero, metadata |
| `agent.name` / `agent.role` | Chat UI display name, TTS greeting, system prompt identity section |
| `agent.systemPromptPath` | Which file `chat.mts` reads to build the system prompt at build time |
| `voice.voiceId` / `voice.model` | ElevenLabs TTS in `tts.mts` and `api/tts/route.ts` |
| `rag.*` | `embed-documents.ts` chunking + `chat.mts` retrieval parameters |
| `brand.colors` | Tailwind CSS variables and inline styles across presentation site |
| `brand.fonts` | Google Fonts imports in `layout.tsx` files |
| `deal.dealId` | Supabase `deal_id` filter in all queries (falls back to `DEAL_ID` in `.env`) |
| `deal.targetName` | Dashboard agent page descriptions, prompt templates |
