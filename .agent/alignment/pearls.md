# RAG Factory — Pearls of Wisdom
<!--
  SCHEMA: Two tables per category.
  GUIDANCE table  — read at boot by the agent. Drives behavior during the session.
  METRICS table   — read and updated at harvest. Tracks value over time.
  Pearl title is the shared key between the two tables — must match exactly.

  Pearl Value  = Uses × Min/Use  (total minutes saved across all invocations)
  Hit Rate     = Uses / Opportunities  (how often the pearl fires when it should)
  Pruning rule = Maturity=Seed AND Total Saved < 15min AND Age > 60 days → flag for human review
-->

---

## Category: Agent Pipeline (Auto-Research)

**Guidance** *(loaded at boot — drives session behavior)*

| Pearl | Notes | Type | Trigger | Confidence |
|-------|-------|------|---------|------------|
| `PROCESS_TASK_URL must be localhost in dev` | If it points to the prod URL in dev, research fires externally, Supabase Realtime never gets the completion signal, and the spinner never clears. Must be `http://localhost:9999/.netlify/functions/process-task` in `.env` and `.env.local`. | Prevention | When setting up, testing, or debugging the auto-research pipeline; when editing any `.env` file | Hard Constraint |
| `config.supabase.project_id must be a real UUID` | If it is a placeholder string, the vector store namespace query returns zero results and the agent triggers research mode for every question — the system appears broken. | Prevention | When initializing a new deployment or debugging "agent always says it needs to research" behavior | Hard Constraint |
| `sync-config after every config.json change` | Three config.json copies exist: root, web/presentation, web/dashboard. Stale copies cause silent namespace mismatches. Always run `npm run sync-config` immediately after any config.json edit. | Prevention | Any time config.json is opened for editing | Hard Constraint |
| `Auto-research end-to-end test` | Ask "What is [topic NOT in knowledge base]?" → agent says "Let me research that" → spinner appears → within 30–60s a follow-up appears starting "I just got some updated information —". If the follow-up never arrives, PROCESS_TASK_URL is wrong. | Diagnostic | After any changes to the auto-research pipeline, before declaring it working | Strong Heuristic |

**Metrics** *(updated at harvest)*

| Pearl | Maturity | Added | Review By | Opportunities | Uses | Min/Use | Total Saved | Hit Rate |
|-------|----------|-------|-----------|---------------|------|---------|-------------|----------|
| `PROCESS_TASK_URL must be localhost in dev` | Established | (unknown) | 2026-09-14 | 0 | 0 | ? | ? | — |
| `config.supabase.project_id must be a real UUID` | Established | (unknown) | 2026-09-14 | 0 | 0 | ? | ? | — |
| `sync-config after every config.json change` | Established | (unknown) | 2026-09-14 | 0 | 0 | ? | ? | — |
| `Auto-research end-to-end test` | Established | (unknown) | 2026-09-14 | 0 | 0 | ? | ? | — |

---

## Category: Off-Limits Files

**Guidance** *(loaded at boot)*

| Pearl | Notes | Type | Trigger | Confidence |
|-------|-------|------|---------|------------|
| `Never touch the agent core files` | `chat.mts`, `process-task.mts`, `tts.mts`, `AIChat.tsx` — even trivial renames risk silent pipeline breaks that took 8+ hours to perfect. Any edit to these files requires explicit user approval before proceeding. | Prevention | Any time about to edit files in `netlify/functions/` or the chat UI component | Hard Constraint |

**Metrics** *(updated at harvest)*

| Pearl | Maturity | Added | Review By | Opportunities | Uses | Min/Use | Total Saved | Hit Rate |
|-------|----------|-------|-----------|---------------|------|---------|-------------|----------|
| `Never touch the agent core files` | Established | (unknown) | 2026-09-14 | 0 | 0 | 480 | 0 | — |

---

## Category: Architecture

**Guidance** *(loaded at boot)*

| Pearl | Notes | Type | Trigger | Confidence |
|-------|-------|------|---------|------------|
| `One repo = one agent = one client` | This is a deployable template. To spin up a new client: duplicate the entire repo. Each instance is fully independent — own vector store namespace, own config, own persona. Never try to serve multiple clients from one repo. | Orientation | When designing new features, considering adding a second client, or reusing any part of the repo | Hard Constraint |
| `Template is content-agnostic` | The first use case was one specific engagement. The template works for any knowledge domain. Never hardcode domain-specific assumptions into the pipeline architecture. | Orientation | When building new features, structuring knowledge folders, or designing ingestion pipelines | Hard Constraint |
| `Dashboard is backburner` | The localhost:8888 dashboard is use-case-specific and not the current focus. Do not refactor, extend, or improve it unless explicitly requested. | Orientation | Any time the dashboard comes up in conversation or a change to it seems logical | Strong Heuristic |
| `Coverage metrics need eligible-only denominators` | Completeness metrics must use only items that are eligible for the measured attribute in their denominator — items that correctly lack the attribute because they've had no opportunity to acquire it must be excluded, or they generate permanent false alarms that mask real gaps. | Prevention | When designing any completeness, coverage, or progress metric that aggregates items with heterogeneous states | Strong Heuristic |
| `RAG parent-child dedup by parent_id` | TopK vector retrieval returns multiple child vectors from the same parent section; injecting all of them causes the same passage to repeat in the LLM prompt and dilutes relevance — always dedup by `parent_id` keeping the highest-scoring child before assembling context. | Prevention | Whenever building or modifying a RAG retrieval pipeline that uses parent-child or hierarchical chunking | Hard Constraint |

**Metrics** *(updated at harvest)*

| Pearl | Maturity | Added | Review By | Opportunities | Uses | Min/Use | Total Saved | Hit Rate |
|-------|----------|-------|-----------|---------------|------|---------|-------------|----------|
| `One repo = one agent = one client` | Established | (unknown) | 2026-09-14 | 1 | 1 | ? | ? | 100% |
| `Template is content-agnostic` | Established | (unknown) | 2026-09-14 | 1 | 1 | ? | ? | 100% |
| `Dashboard is backburner` | Established | (unknown) | 2026-09-14 | 2 | 2 | ? | ? | 100% |
| `Coverage metrics need eligible-only denominators` | Seed | 2026-03-14 | 2026-09-14 | 1 | 1 | 20 | 20 | 100% |
| `RAG parent-child dedup by parent_id` | Seed | 2026-03-14 | 2026-09-14 | 1 | 1 | 45 | 45 | 100% |

---

## Category: Tooling

**Guidance** *(loaded at boot)*

| Pearl | Notes | Type | Trigger | Confidence |
|-------|-------|------|---------|------------|
| `Grep does not satisfy Edit's read requirement` | Even with the exact line from a Grep result, the Edit tool rejects the call with "File has not been read yet." Always call Read explicitly on every file before any Edit — even in bulk rename operations, even when you already have the content. | Prevention | Before calling Edit on any file, especially immediately after a Grep search | Hard Constraint |
| `Dev script may not be at repo root` | The dev server command and port may live in a subdirectory package.json (e.g., `web/dashboard`). Always search all package.json files for the dev script matching the detected port — never assume root has the dev script. | Prevention | When starting the dev server or running `npm run dev` during boot | Hard Constraint |
| `Windows paths in .env use forward slashes` | File paths set as environment variable values must use forward slashes even on Windows — backslashes cause silent parse failures (wrong value returned, no error thrown), producing zero results with no diagnostic clue. | Prevention | When setting any file system path as a value in a .env or .env.local file on a Windows machine | Hard Constraint |
| `Markdown tables: skip header AND separator` | When parsing markdown tables programmatically, skip both the separator row (`\|---\|`) AND the header row — separators match a clear regex pattern, but header rows are structurally identical to data rows and corrupt the first parsed record if not explicitly skipped. | Prevention | When writing any parser that extracts rows from markdown or similarly-formatted tables | Hard Constraint |
| `Suppression flag ≠ action flag` | Pre-setting a boolean to `true` to suppress a detection path reuses the same variable to mean "this action should fire" — causing the suppressed behavior to trigger instead; split into two explicitly named variables the moment a flag must serve both purposes. | Prevention | When writing boolean state for any async flow, feature flag, or event system where "skip detection" and "trigger action" share the same variable | Hard Constraint |
| `Report observed values, not documented defaults` | When producing status summaries, boot reports, or system state descriptions, use values directly observed from process output (actual port, actual version, actual URL) — never substitute values from documentation or config files, which may be stale or overridden at runtime. | Prevention | When generating any status report, boot summary, or system state description that includes ports, versions, endpoints, or other runtime values | Hard Constraint |
| `Import success does not mean library works` | When a native code binding (Rust/C extension) imports without error, it does NOT mean it functions correctly — the binding may segfault when processing actual data, especially on newer Python versions. Always test with real data processing before building a pipeline around it. | Prevention | When incorporating any native/compiled Python package (Rust bindings, C extensions) into an automated pipeline, especially on Python 3.13+ | Hard Constraint |

**Metrics** *(updated at harvest)*

| Pearl | Maturity | Added | Review By | Opportunities | Uses | Min/Use | Total Saved | Hit Rate |
|-------|----------|-------|-----------|---------------|------|---------|-------------|----------|
| `Grep does not satisfy Edit's read requirement` | Established | (unknown) | 2026-09-14 | 2 | 2 | ? | ? | 100% |
| `Dev script may not be at repo root` | Confirmed | 2026-03-14 | 2026-09-14 | 5 | 5 | 5 | 25 | 100% |
| `Windows paths in .env use forward slashes` | Seed | 2026-03-14 | 2026-09-14 | 1 | 1 | 20 | 20 | 100% |
| `Markdown tables: skip header AND separator` | Seed | 2026-03-14 | 2026-09-14 | 1 | 1 | 10 | 10 | 100% |
| `Suppression flag ≠ action flag` | Seed | 2026-03-14 | 2026-09-14 | 1 | 1 | 30 | 30 | 100% |
| `Report observed values, not documented defaults` | Seed | 2026-03-15 | 2026-09-15 | 2 | 2 | 3 | 6 | 100% |
| `Import success does not mean library works` | Seed | 2026-03-15 | 2026-09-15 | 1 | 1 | 15 | 15 | 100% |

---

## Category: Knowledge Ingestion

**Guidance** *(loaded at boot)*

| Pearl | Notes | Type | Trigger | Confidence |
|-------|-------|------|---------|------------|
| `Subfolder name is the metadata track` | Files in knowledge subfolders get the subfolder name as their metadata track in the vector store. This is load-bearing for retrieval filtering — do not flatten the folder structure. | Prevention | When organizing the knowledge folder, adding new content types, or restructuring ingestion | Hard Constraint |
| `Manual drop is the only complete path` | Client upload UI, API/MCP, and web scraper ingestion are not yet built. Only the manual drop + embed script is production-ready. Do not imply otherwise to any client or stakeholder. | Orientation | When discussing knowledge ingestion options or demo-ing the system to anyone | Hard Constraint |

**Metrics** *(updated at harvest)*

| Pearl | Maturity | Added | Review By | Opportunities | Uses | Min/Use | Total Saved | Hit Rate |
|-------|----------|-------|-----------|---------------|------|---------|-------------|----------|
| `Subfolder name is the metadata track` | Established | (unknown) | 2026-09-14 | 0 | 0 | ? | ? | — |
| `Manual drop is the only complete path` | Established | (unknown) | 2026-09-14 | 0 | 0 | ? | ? | — |

---

## Category: Alignment System (Meta)

*Pearls about the pearl system itself — how to use it, maintain it, and avoid its failure modes.*

**Guidance** *(loaded at boot)*

| Pearl | Notes | Type | Trigger | Confidence |
|-------|-------|------|---------|------------|
| `Pearl value is Uses times Min/Use` | Pearl value is total time saved (Uses × Min/Use), not frequency. A pearl invoked once that prevents an 8-hour mistake outvalues one invoked 100 times saving 2 minutes each. Never prune based on Uses count alone. | Orientation | When evaluating any pearl for pruning, or reviewing the health of the pearl library | Hard Constraint |
| `Min/Use is measured not estimated` | Min/Use comes from the actual elapsed time of the debugging cycle that produced the pearl — read from conversation timestamps or user-stated time. It is a measurement, not a guess. | Prevention | When writing a new pearl at harvest — before filling in the Min/Use field | Hard Constraint |
| `Every pearl needs an explicit Trigger` | Pearls without specific trigger conditions will be silently invoked (or never invoked) with no record either way. Vague triggers produce low Hit Rates. Be precise: name the exact observable moment that should force evaluation. | Prevention | When writing any new pearl — before finalizing the Trigger field | Hard Constraint |
| `Hit Rate exposes invisible failures` | Hit Rate = Uses / Opportunities. A pearl with low Hit Rate is failing most of the time it should fire — the knowledge exists, the situations are arising, but the pearl is not being applied. Low Hit Rate signals a trigger or wording problem, not a pearl quality problem. | Diagnostic | During harvest when reviewing pearl effectiveness, especially for Established pearls with declining performance | Strong Heuristic |
| `Copied skills carry project residue` | Any skill, prompt, or template copied from another project must be audited for project-specific names, paths, assumptions, and references before use in a new project. | Prevention | Whenever copying any file, skill, or template from another project's directory | Hard Constraint |

**Metrics** *(updated at harvest)*

| Pearl | Maturity | Added | Review By | Opportunities | Uses | Min/Use | Total Saved | Hit Rate |
|-------|----------|-------|-----------|---------------|------|---------|-------------|----------|
| `Pearl value is Uses times Min/Use` | Confirmed | 2026-03-14 | 2026-09-14 | 1 | 1 | 30 | 30 | 100% |
| `Min/Use is measured not estimated` | Seed | 2026-03-14 | 2026-09-14 | 1 | 1 | 20 | 20 | 100% |
| `Every pearl needs an explicit Trigger` | Confirmed | 2026-03-14 | 2026-09-14 | 1 | 1 | 60 | 60 | 100% |
| `Hit Rate exposes invisible failures` | Confirmed | 2026-03-14 | 2026-09-14 | 1 | 1 | 30 | 30 | 100% |
| `Copied skills carry project residue` | Seed | 2026-03-14 | 2026-09-14 | 1 | 1 | 15 | 15 | 100% |

---

## Retired Pearls

*Pearls that were once valid but no longer apply. Never loaded at boot. Preserved as institutional history.*

| Pearl | Original Notes | Retired | Originally Added | Date Retired | Reason |
|-------|---------------|---------|-----------------|--------------|--------|
| *(none yet)* | | | | | |
