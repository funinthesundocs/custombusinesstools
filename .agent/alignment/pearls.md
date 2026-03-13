# RAG Factory Pearls of Wisdom
<!-- Format: one table per category. Columns: Pearl | Notes | Uses -->
<!-- Uses counter is incremented by /harvest when ⚡ invocation logs are found -->

---

## Category: Agent Pipeline (Auto-Research)

| Pearl | Notes | Uses |
|-------|-------|------|
| `PROCESS_TASK_URL must be localhost in dev` | If it points to prod URL in dev, research fires externally, Supabase Realtime never gets the completion signal, spinner never clears. Must be `http://localhost:9999/.netlify/functions/process-task` in `.env` and `.env.local`. | 0 |
| `config.supabase.project_id must be a real UUID` | If it's a placeholder string, Pinecone namespace query returns zero results, agent triggers research mode for EVERY question, system appears broken. | 0 |
| `sync-config after every config.json change` | Three config.json copies exist: root, web/presentation, web/dashboard. Stale copies cause silent Pinecone namespace mismatches. Always run `npm run sync-config` immediately after any config.json edit. | 0 |
| `Auto-research end-to-end test` | Ask "What is [topic NOT in knowledge base]?" → agent says "Let me research that" → spinner appears → within 30–60s a follow-up appears starting "I just got some updated information —". If follow-up never arrives, PROCESS_TASK_URL is wrong. | 0 |

---

## Category: Off-Limits Files

| Pearl | Notes | Uses |
|-------|-------|------|
| `Never touch the agent core files` | `chat.mts`, `process-task.mts`, `tts.mts`, `AIChat.tsx` — even trivial renames risk silent pipeline breaks. 8+ hours were spent getting this right. Any edit requires explicit user approval. | 0 |

---

## Category: Architecture

| Pearl | Notes | Uses |
|-------|-------|------|
| `One repo = one agent = one client` | This is a deployable template. To spin up a new client: duplicate the entire repo. Each instance is fully independent — own Pinecone namespace, own config, own persona. | 0 |
| `This is NOT a deal-prep system` | GMC/Aboitiz was the first use case only. The template is content-agnostic. Never hardcode business intelligence assumptions into the pipeline. | 0 |
| `Dashboard is backburner` | localhost:8888 dashboard is too GMC-specific. It is NOT the current focus. Don't refactor or extend it unless explicitly asked. | 0 |

---

## Category: Tooling

| Pearl | Notes | Uses |
|-------|-------|------|
| `Grep content does not satisfy Edit's read requirement` | Even if you have the exact line from a Grep result, the Edit tool will reject the call with "File has not been read yet." Always call Read explicitly on every file before any Edit, even in bulk rename operations. | 1 |

---

## Category: Knowledge Ingestion

| Pearl | Notes | Uses |
|-------|-------|------|
| `Subfolder name = Pinecone track metadata` | Files in `knowledge/documents/` get `track: documents` in Pinecone. The subfolder name is automatically used as the metadata track. This is load-bearing — don't flatten the folder structure. | 0 |
| `Manual drop path is the only complete path` | Client upload UI, API/MCP, and web scraper ingestion are NOT built. Only `knowledge/` drop + `embed-documents.ts` is production-ready. Don't imply otherwise to clients. | 0 |
