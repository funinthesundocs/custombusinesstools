# RAG Factory — Visual Flowchart Source Document for NotebookLM

> This document describes the complete data pipeline of a production RAG (Retrieval-Augmented Generation) system called the RAG Factory. Use this to create a detailed visual flowchart showing every stage of the pipeline, from raw documents entering the system through to a fully-formed AI agent response reaching the user.

---

## THE PIPELINE — 7 STAGES

The RAG Factory pipeline has 7 distinct stages. Each stage transforms data and passes it to the next. The visual flowchart should show these as a connected flow, left-to-right or top-to-bottom, with clear icons and labels for each stage.

---

### STAGE 1: KNOWLEDGE DROP (The Intake)

**Visual concept:** File folders with documents flowing into a hopper/intake funnel

**What happens:**
- The user drops files into organized subfolders inside a `knowledge/` directory
- Supported file types: Markdown (.md), Text (.txt), PDF (.pdf), Images (.jpg, .png, .webp, .gif)
- Each subfolder name becomes a metadata "track" label — for example, files in `knowledge/target/` get tagged as track "target", files in `knowledge/regulatory/` get tagged as track "regulatory"
- This track label travels with the data through every stage and is used later during retrieval to label where information came from

**Inputs:** Raw documents (any format above)
**Outputs:** Classified files ready for processing, each tagged with a track name
**User control:** Add folders, upload files, delete files, rename folders — all from the dashboard Knowledge page

**Key metric to display:** Total file count, folder count

---

### STAGE 2: THE FACTORY (Chunking + Embedding)

**Visual concept:** A factory building with gears/conveyor belts — documents enter one side, vectors come out the other. Inside the factory, two visible processes: a SPLITTER (chunking) and a TRANSFORMER (embedding).

**What happens — Part A: Chunking (The Splitter)**
- Each document is split into PARENT CHUNKS of approximately 1,600 characters
- Splits happen on heading boundaries (## headings, then ### subheadings if still too large)
- Each parent chunk is then split into CHILD CHUNKS of approximately 400 characters
- Child splits happen on sentence boundaries (period + space)
- Each child chunk carries a `parent_id` that points back to its full parent text
- PDFs are special: they first go through Google Gemini's multimodal API which extracts text with page markers, THEN they enter the chunking pipeline
- Images are stored as-is in cloud storage (Supabase) and their metadata is embedded

**Why parent-child?** Search precision vs. context richness. Small children are precise for matching (like a search index). Large parents provide rich context for the LLM (like reading the full paragraph, not just the matching sentence). "Search with a scalpel, inject with a shovel."

**What happens — Part B: Embedding (The Transformer)**
- Only CHILD chunks get embedded (not parents)
- The embedding model is Google Gemini Embedding (3,072-dimensional vectors)
- Texts are batched (20 per request) and rate-limited (200ms between batches)
- Each resulting vector is stored in Pinecone (a vector database) with rich metadata:
  - `content`: the child chunk text
  - `parent_content`: the full parent chunk text
  - `parent_id`: pointer to the parent
  - `source_file`: which file this came from
  - `track`: the folder/track label from Stage 1
  - `section_heading`: the heading this chunk fell under
  - `page_number`: for PDFs, which page
  - `chunk_index` and `child_index`: position identifiers

**Inputs:** Classified files from Stage 1
**Outputs:** Vectors in Pinecone (the vector database), organized by project namespace
**User control:** "Sync Knowledge Base" button (new files only), "Full Re-embed" button (everything), folder-specific re-embed — all from the dashboard Knowledge page

**Key metrics to display:** Total vector count, processing status (idle/running), last sync time

---

### STAGE 3: THE QUESTION (User Query + Retrieval)

**Visual concept:** A search beam or radar pulse emanating from a question mark, hitting the vector database and pulling back matching chunks. Show the question being transformed into a vector (same shape as the stored vectors) and then finding its nearest neighbors.

**What happens:**
1. User types a question in the chat interface
2. The question text is embedded using the SAME Gemini model (3,072-dimensional vector)
3. This question vector is sent to Pinecone with a request: "Find the 15 most similar vectors"
4. Pinecone returns the top 15 child vectors, ranked by cosine similarity score (0.0 to 1.0)
5. The system DEDUPLICATES by parent_id — if 3 children from the same parent matched, only the highest-scoring one is kept (this prevents repeating the same passage)
6. The top 8 unique parent chunks are selected
7. Each chunk is formatted with its metadata: `[track | source_file | score]` followed by the parent_content text
8. Citations are extracted: any match with score >= 0.4 becomes a citation (source title, file, page number, section heading)

**The confidence score:** The highest similarity score among all matches is the "top score." This number determines whether the system is confident or needs to research.

**Inputs:** User question (text)
**Outputs:** Formatted RAG context (text blocks with labels), citation list, confidence score
**User control:** None at query time — retrieval parameters are set in Workshop (matchCount, similarityThreshold)

**Key metrics to display:** Top similarity score, number of chunks retrieved, retrieval latency

---

### STAGE 4: THE CONFIDENCE GATE (Research Trigger)

**Visual concept:** A quality control checkpoint / gate with a gauge or traffic light. GREEN = confident (score >= 0.7), RED = low confidence (score < 0.7). When RED, a side conveyor belt activates leading to the Research Lab.

**What happens:**
- The system checks: Is the top similarity score >= 0.7?
- If YES (GREEN): Proceed directly to prompt assembly. The knowledge base has a confident answer.
- If NO (RED): Two things happen simultaneously:
  1. The main response still generates (but includes guidance like "Let me research that for you")
  2. A background AUTO-RESEARCH task fires

**Auto-Research (The Research Lab — shown as a branching side path):**
1. A task record is created in the Supabase database (status: "pending", priority: "urgent")
2. Claude is called with web search capability to research the question
3. The research results are embedded using the same Gemini model
4. The new vector is stored in Pinecone with track "auto-research" and a 24-hour expiration
5. The task status is updated to "complete" in Supabase
6. The client detects completion and makes a follow-up request
7. A second response is generated starting with "I just got some updated information —"
8. After 24 hours, the auto-research vector expires (preventing stale research from accumulating)

**Inputs:** Confidence score from Stage 3
**Outputs:** Either direct pass-through (confident) or research task + follow-up response (low confidence)

**Key metrics to display:** Confidence level (gauge), research tasks pending, research tasks completed

---

### STAGE 5: LIVE DATA FEEDS (Real-Time Intelligence)

**Visual concept:** A satellite dish or antenna array receiving signals from multiple sources. Show 15 small feed icons (weather symbol, stock chart, globe, etc.) with data streams flowing into a MIXER that combines only the relevant ones.

**What happens — running in parallel with Stage 3 and 4:**
1. The system scans the user's question for keywords
2. It matches keywords against 15 free data feeds:
   - Weather (Open-Meteo) | Air Quality (Open-Meteo) | Forex Rates (ExchangeRate-API)
   - Crypto Prices (CoinGecko) | Commodities (Yahoo Finance) | Stock Markets (Yahoo Finance)
   - Earthquakes (USGS) | Natural Events (NASA) | FDA Recalls (OpenFDA)
   - Tech News (HackerNews) | ISS Location (Open Notify) | Sunrise/Sunset (SunriseSunset.io)
   - Moon Phase (calculated) | Space Launches (Space Devs) | Sports Scores (ESPN)
3. ONLY feeds matching the question's topic are included (zero tokens wasted on irrelevant data)
4. Example: Question about "weather in Tokyo" → only weather feed is injected
5. Example: Question about "company strategy" → NO feeds injected (pure RAG)
6. Data is cached for up to 4 hours to minimize API calls

**Inputs:** User question (for keyword matching), cached or fresh feed data
**Outputs:** Formatted live data string (only relevant feeds)
**User control:** Enable/disable individual feeds, configure location, currency, stock symbols — from dashboard Settings > Data Feeds

**Key metrics to display:** Number of active feeds, feeds matched to current query, cache freshness

---

### STAGE 6: THE ASSEMBLY LINE (Prompt Construction + LLM)

**Visual concept:** An assembly line where multiple components converge onto a single conveyor belt leading to the AI brain (LLM). Show the components being assembled in order: Identity Card + RAG Context Blocks + Live Data Strips + Confidence Signal → all feeding into a glowing brain/processor labeled "Claude."

**What happens:**
1. The SYSTEM PROMPT is assembled dynamically from components:
   - **Identity layer:** Agent name, role, personality, company info (from config.json)
   - **RAG context:** The formatted chunks from Stage 3 (with [track|source|score] labels)
   - **Live data:** The matched feed data from Stage 5 (if any)
   - **Confidence guidance:** Instructions based on the confidence gate:
     - If confident: normal response behavior
     - If low confidence + follow-up: "Start with: I just got updated information"
     - If low confidence + first response: "Acknowledge you're researching"
   - **Voice guidance:** If voice mode is on, response is constrained to 60 words
   - **Data hierarchy:** Hard rule — check knowledge base FIRST, live data SECOND, web search LAST

2. The assembled prompt + user conversation history is sent to **Anthropic Claude** (Sonnet model)
3. The response streams back in real-time via Server-Sent Events (SSE)
4. During streaming, the system watches for "uncertainty phrases" (e.g., "I don't have information about...") — if detected, another research task fires

**Inputs:** System prompt components, user conversation history
**Outputs:** Streaming text response, citations, media results
**User control:** Edit system prompt, change agent name/personality — from dashboard Agent > Configure

**Key metrics to display:** Prompt token count, response token count, model used, streaming status

---

### STAGE 7: THE DELIVERY (Response + Storage)

**Visual concept:** The final product — a polished response with citations — being delivered to the user. Show a chat bubble forming with citation badges attached. Below it, a filing cabinet storing the conversation and a dashboard monitor receiving the activity update.

**What happens:**
1. The streaming response is displayed to the user in real-time (words appearing as they're generated)
2. If voice mode is enabled, sentences are converted to speech via ElevenLabs TTS and played as audio
3. Citations are displayed below the response (source title, file, page number, relevance score)
4. Media results (images/diagrams from the knowledge base) are displayed if matched
5. The conversation is stored in Supabase:
   - `agent_conversations` table: user message + assistant response with timestamps
   - `activity_log` table: event logged for dashboard feed
   - `agent_tasks` table: if research was triggered, task status tracked here
6. If auto-research was fired in Stage 4, the follow-up response arrives 15-30 seconds later

**Inputs:** Streaming LLM response, citations, media
**Outputs:** Rendered chat message, stored conversation record, activity log entry
**User control:** Voice on/off toggle, view conversation history — from dashboard Agent > Test

**Key metrics to display:** Total conversations, messages today, average response time

---

## VISUAL DESIGN NOTES FOR THE FLOWCHART

### Overall Layout
- Flow direction: LEFT to RIGHT or TOP to BOTTOM
- Each stage is a distinct visual zone with its own color or icon theme
- Connecting arrows/pipes show data flowing between stages
- The Confidence Gate (Stage 4) has a branching path (research lab) that loops back

### Color Coding Suggestion
- Stage 1 (Knowledge Drop): Blue — folders, files, organization
- Stage 2 (Factory): Orange/Amber — industrial, processing, transformation
- Stage 3 (Question/Retrieval): Purple — search, discovery, matching
- Stage 4 (Confidence Gate): Green/Red — pass/fail, quality control
- Stage 5 (Live Data): Cyan — real-time, signals, streams
- Stage 6 (Assembly): Gold — construction, combination, intelligence
- Stage 7 (Delivery): Emerald — completion, output, satisfaction

### Key Visual Metaphors
- Documents → Physical papers/files with folder tabs
- Chunking → A paper shredder or saw cutting documents into pieces
- Embedding → A transformer/machine converting paper into glowing orbs (vectors)
- Vector search → A magnet pulling matching orbs toward the question
- Confidence gate → A traffic light or quality inspection station
- Auto-research → A detective/scientist in a lab with a magnifying glass
- Live data feeds → Satellite dishes or antenna arrays receiving signals
- Prompt assembly → A conveyor belt where components are placed onto a tray
- LLM → A glowing brain or sophisticated processor
- Response → A polished document emerging from a printer with a quality seal

### Animation Concepts (for the live dashboard version)
- Stage 1: Files gently floating into folders, count badge incrementing
- Stage 2: Conveyor belt moving, gears spinning when embedding is active, progress bar
- Stage 3: Radar pulse when a query fires, vectors lighting up as they're matched
- Stage 4: Traffic light cycling, gauge needle moving, research lab lights flickering when active
- Stage 5: Feed icons pulsing when data is fresh, dimmed when cached/stale
- Stage 6: Components sliding together on assembly line, brain glowing during generation
- Stage 7: Chat bubble inflating, citation badges popping in, filing cabinet drawer opening

### Interactive Elements (for dashboard conversion)
Each stage should be clickable and link to the relevant dashboard page:
- Stage 1 (Knowledge Drop) → links to `/knowledge` (folder/file management)
- Stage 2 (Factory) → links to `/knowledge` embed panel (sync/re-embed controls)
- Stage 3 (Question/Retrieval) → links to `/agents?tab=test` (test the agent)
- Stage 4 (Confidence Gate) → links to `/workshop` → RAG Tuning (thresholds)
- Stage 5 (Live Data) → links to `/settings` Data Feeds tab
- Stage 6 (Assembly) → links to `/agents` Configure tab (system prompt, identity)
- Stage 7 (Delivery) → links to `/agents?tab=test` (conversation history)
