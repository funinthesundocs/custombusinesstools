# Knowledge Base

Drop files here. Run `npm run embed` (or `npx ts-node scripts/embed-documents.ts`). Done.

---

## How It Works

Every file in this directory gets embedded into Pinecone when you run the embed script.
The subfolder name becomes the `track` metadata field on every vector from that folder.

The embed script is **idempotent** — re-running it safely overwrites existing vectors
for any file. It will not create duplicates.

---

## Folder Strategy

Organize by **subject**, not by file type.

```
knowledge/
├── legal/          → contracts, bylaws, compliance docs
├── technical/      → specs, manuals, diagrams
├── marketing/      → brochures, campaigns, brand guidelines
├── financial/      → reports, projections, models
├── operations/     → SOPs, workflows, runbooks
└── general/        → anything that doesn't fit elsewhere
```

You can create any subfolder name. Whatever you name it becomes the track.
The agent can be asked to "focus on technical documents" and it will filter by track.

---

## Supported File Types

| Format | How It's Processed |
|--------|--------------------|
| `.pdf` | Gemini multimodal extraction — reads text, tables, diagrams, and charts |
| `.md`  | Plain text chunked by section headings |
| `.txt` | Plain text chunked by size |
| `.jpg` `.jpeg` `.png` `.gif` `.webp` | Multimodal image embedding — agent can retrieve by visual similarity |

> **Video support** — coming later. Drop `.mp4` files here when implemented.

---

## How to Add Files

1. Drop file into the appropriate subfolder (create one if needed)
2. Run: `npx ts-node scripts/embed-documents.ts`
3. Vectors upsert into Pinecone under namespace `PROJECT_ID`

---

## How to Remove Files

To remove a specific file's vectors from Pinecone:
```
# Delete by prefix in Pinecone console, or run:
npx ts-node scripts/delete-vectors.ts --file "knowledge/legal/contract.pdf"
```

To wipe the entire knowledge base for this project:
- Go to Pinecone console → your index → delete namespace `PROJECT_ID`
- Or run: `npx ts-node scripts/embed-documents.ts --clear`

---

## What Not to Put Here

- Source code (it will get embedded but won't help the agent answer questions)
- Files over ~200 pages without chunking — they'll be slow to process
- Duplicate versions of the same document (use the latest version only)
