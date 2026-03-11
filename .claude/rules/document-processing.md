# Document Processing Rules

## Intake Router
Every document entering the system gets classified and routed:

```
DOCUMENT → Identify Type → Route to Pipeline → Process → Store in Supabase → Tag
```

## Pipeline A: OCR (Scanned/Photographed Documents)
- **Tool:** Tesseract OCR (local)
- **Fallback:** Google Cloud Vision API
- **Process:** Digitize → output text file → classify by type → re-route to correct pipeline
- **Error:** If confidence < 80%, flag for manual review. Tag uncertain passages [UNVERIFIED].
- **Output location:** Moves from `ocr-queue/` to correct category in `intelligence/raw/source/`

## Pipeline B: Technical Images (Maps, Diagrams)
- **Tool:** Gemini multimodal
- **Fallback:** Claude Opus image interpretation
- **Process:** Validate resolution → send to Gemini with interpretation prompt → store plain-language output
- **Prompt template:** "Interpret this technical image. Identify all data types, zones, quantitative data, and notable features. Translate ALL findings into plain business language suitable for a C-level executive."
- **Error:** If Gemini returns vague results, re-prompt with specifics. If still insufficient, flag for human expert.
- **Output:** `intelligence/processed/technical-interpretation.md`

## Pipeline C: Financial Spreadsheets
- **Tool:** Claude Code (Opus)
- **Process:** Parse structure → extract key metrics → generate financial NARRATIVE (story, not just numbers)
- **Error:** Flag cells with external references. Flag projections without stated assumptions.
- **Output:** `intelligence/processed/financial-narrative.md` + JSON data for charts

## Pipeline D: Legal/Corporate Documents (Bylaws, Registrations, LOIs, MOUs)
- **Tool:** Claude Code (Opus)
- **Process:** Classify sub-type → extract credibility signals → assess deal momentum → flag gaps
- **Key extractions:** Registration dates, officers, jurisdiction, LOI/MOU parties, dates, commitments, terms
- **Error:** Flag expired documents. Flag conditional LOIs. Share gaps with Red Team.
- **Output:** `intelligence/processed/credibility-brief.md`

## Pipeline E: PowerPoints
- **Tool:** Claude Code (markitdown + Opus analysis)
- **Process:** Extract text → generate thumbnails → analyze for CONTENT and STYLE
- **Style analysis (critical for target's materials):** Visual language, tone, priorities, self-presentation
- **Output:** Content → relevant processed/ file. Style → `intelligence/processed/target-profile.md`

## Pipeline F: Word Documents
- **Tool:** Claude Code (pandoc + Opus)
- **Process:** Extract text → classify by narrative arc position → synthesize key points
- **Output:** Relevant processed/ file based on content classification

## Pipeline G: Websites
- **Tool:** Claude Code scraper
- **Fallback:** Manual copy-paste for blocked sites
- **Process:** Scrape → extract content → classify by intelligence track → store
- **Error:** If blocked, log URL and provide manual extraction instructions.

## Processing Status Values
All documents tracked in Supabase `document_inventory` table:
`queued` → `processing` → `processed` → `verified` → OR `flagged` / `error`

## After Processing
Every processed document should be:
1. Stored in the correct `intelligence/processed/` file
2. Logged in Supabase `document_inventory` with status
3. Logged in Supabase `activity_log` for dashboard feed
4. Tagged with confidence level, source file, and narrative position
