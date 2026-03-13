# New Project Setup — 7 Steps

This repo is a template. Duplicate it once per client/project.
Each copy is completely independent — its own agent, its own knowledge base, its own Pinecone namespace.

---

## Before You Start

You need accounts and API keys for:
- **Pinecone** (vector store) — create one index, shared across all projects
- **Supabase** (conversations + storage) — create one project per deployment
- **Google AI / Gemini** (embeddings + PDF extraction)
- **Anthropic** (agent responses)
- **ElevenLabs** (voice — optional)
- **Netlify** (hosting)

---

## Step 1 — Duplicate the Repo

```bash
git clone https://github.com/your-org/rag-factory my-new-agent
cd my-new-agent
git remote set-url origin https://github.com/your-org/my-new-agent
```

---

## Step 2 — Generate a Project ID

Every deployment needs a unique UUID as its namespace in Pinecone.

```bash
# macOS / Linux
uuidgen | tr '[:upper:]' '[:lower:]'

# Windows PowerShell
[guid]::NewGuid().ToString()

# Node
node -e "console.log(require('crypto').randomUUID())"
```

Keep this UUID — you'll use it in Steps 3 and 4.

---

## Step 3 — Copy and Fill .env

```bash
cp .env.example .env
```

Fill in every value. Critical ones:

| Variable | Where to find it |
|----------|-----------------|
| `PROJECT_ID` | UUID you generated in Step 2 |
| `PINECONE_API_KEY` | Pinecone console → API Keys |
| `PINECONE_INDEX_HOST` | Pinecone console → your index → Host |
| `GEMINI_API_KEY` | Google AI Studio |
| `ANTHROPIC_API_KEY` | Anthropic console |
| `SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `ELEVENLABS_API_KEY` | ElevenLabs console (optional) |
| `TASK_PROCESSOR_SECRET` | Generate: `openssl rand -hex 32` |
| `PROCESS_TASK_URL` | Your Netlify URL + `/.netlify/functions/process-task` |

---

## Step 4 — Configure the Agent

Edit `config.json` (root). Replace every `REPLACE_WITH_` value:

```json
{
  "company": {
    "name": "Acme Corp",
    "short_name": "Acme"
    // ...fill all fields
  },
  "agent": {
    "name": "Max",
    "role": "Sales advisor for Acme's enterprise product line"
  },
  "voice": {
    "voiceId": "your-elevenlabs-voice-id"
  },
  "supabase": {
    "project_id": "paste-your-uuid-from-step-2"
  }
}
```

**Important:** There are three copies of config.json (root, web/presentation, web/dashboard).
Always edit root `config.json` only, then sync:

```bash
npm run sync-config
```

Also update `nav_links` in config.json if you want custom navigation links on the presentation site.
The defaults (About, Services, Presentation, Team, Contact) are just placeholders.

---

## Step 5 — Write the System Prompt

Edit `web/presentation/system-prompt.md`. This is the agent's persona, scope, and rules.

Keep it under 2,000 words. Cover:
- Who the agent is and what it represents
- What it should and shouldn't answer
- Tone and communication style
- Any hard rules (never discuss competitors, always escalate billing questions, etc.)

---

## Step 6 — Add Knowledge Base Files

Drop files into `knowledge/`:

```
knowledge/
├── legal/        ← contracts, terms
├── technical/    ← product docs, specs
├── marketing/    ← brochures, FAQs
└── general/      ← everything else
```

Then embed:

```bash
npm install
npm run embed
```

Watch the output. You should see each file processed, chunks counted, and vectors upserted.
When done, verify in the Pinecone console that vectors appear under your project's namespace.

---

## Step 7 — Test Locally First

```bash
cd web/presentation
npm install
npm run start:local
```

Agent runs at `http://localhost:9999`. The "Ask Agent" button in the nav opens the chat panel.
Confirm the agent responds before deploying.

## Step 8 — Deploy

```bash
# Install Netlify CLI if needed (also installs netlify dev command)
npm install -g netlify-cli

# Link to your Netlify site
netlify link

# Set env vars in Netlify (mirrors your .env)
netlify env:import .env

# Deploy
netlify deploy --prod
```

Your agent is live.

---

## Ongoing Operations

| Task | Command |
|------|---------|
| Add new files to knowledge base | Drop files → `npm run embed` |
| Remove a file's vectors | Delete by ID prefix in Pinecone console |
| Wipe entire knowledge base | Delete namespace `PROJECT_ID` in Pinecone console |
| Update agent persona | Edit `web/presentation/system-prompt.md` + redeploy |
| Update config | Edit `config.json` + copy to `web/presentation/` + `web/dashboard/` + redeploy |
