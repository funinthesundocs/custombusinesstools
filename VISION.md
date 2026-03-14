# RAG Factory — Vision & Governing Intent

> READ THIS BEFORE TOUCHING ANY CODE. This document exists because Claude consistently
> loses the macro perspective when deep in implementation. It is the antidote to that pattern.

---

## What We Are Building

A **universal AI agent template** that any business, individual, or developer can deploy
with minimal configuration and immediately have a genuinely intelligent, fast, cheap, and
capable conversational agent backed by their own knowledge base.

This is NOT a one-off tool for a specific client or deal. It is a product — a reusable
system that the 1,000th deployer benefits from just as much as the first.

The template ships with:
- A capable RAG agent (chat.mts, Pinecone, Supabase) that reasons over the user's documents
- A dashboard (Next.js) to manage everything without touching code
- A universal data layer that makes the agent intelligent by default
- A presentation/client-facing site that the agent's owner can deploy externally

---

## Who This Is For

**Everyone.** That is not hyperbole — it is the design constraint.

- A solo consultant who wants an agent that knows their documents and the current news
- A small business that wants a customer-facing agent trained on their products
- A corporate team that wants an internal knowledge assistant
- A developer building a client project who needs a foundation

Every architectural decision must work for all of these users. If a feature only serves
one narrow use case, it does not belong in the base template — it belongs in a plugin
or configuration option.

**The test:** Would the 1,000th user deploying this template benefit from this feature?

---

## What Winning Looks Like

A non-technical user can:
1. Clone the repo
2. Add their documents to the knowledge base via dashboard
3. Configure their agent's name, personality, and company via dashboard
4. Deploy — and immediately have an agent that answers questions intelligently,
   cites their documents, knows the current date/weather/market context,
   and researches gaps automatically

They never need to:
- Touch a `.ts` or `.py` file
- Understand embeddings, vector databases, or RAG pipelines
- Configure data feeds manually
- Pay for expensive real-time research on questions a $0 API could answer

---

## The Five Governing Principles

Every decision — architectural, UI, data, cost — must pass these filters.

### 1. Template-First
"Does this work for any deployment, or just the current one?"
Strip every feature of its specific context. If it only makes sense for one industry,
one user type, or one use case, it is not a template feature — it is a configuration.

### 2. Agent as Reasoner, Scripts as Collectors
The agent's job is synthesis, conversation, and judgment.
The infrastructure's job is getting data to the agent cheaply and fast.
Never make the agent do work that a script or database query can do better.
web_search is the last resort — not the default.

### 3. On-Demand Over Pre-Loaded
Data costs tokens on every turn if pre-loaded in the system prompt.
If the agent can retrieve data in <500ms via a tool call, pre-loading it wastes money.
Pre-load ONLY what shapes every single response (identity, date, core rules).
Everything else: fetch on demand when the topic arises.

### 4. Simplicity Over Cleverness
The correct solution is the simplest one that fully solves the problem.
A 15-line Python script that hits a free public API beats a complex pipeline.
A Supabase read that takes 100ms beats a cache that took 3 days to build.
Never add abstraction for hypothetical future requirements.

### 5. User Never Sees the Machinery
The dashboard is the control surface. The agent is the product.
A user should never need to understand RAG, embeddings, vectors, or tool routing.
If a configuration requires technical knowledge to operate, redesign it.

---

## The Eagle View Test — Run This Before Building Anything

Before writing a single line of code or designing any architecture, answer:

1. **Who benefits?** — Is this for the template (universal) or for one specific deployment?
2. **What problem does it solve?** — Can I state the user-facing problem in one plain sentence?
3. **Is this the right layer?** — Agent tool? Script? Database? Dashboard control? Pre-loaded context?
4. **What does it cost per conversation?** — In tokens, latency, and dollars at scale.
5. **Could a script replace this?** — If structured data is available via a free API, the agent should not be researching it.
6. **Does this break anything sacred?** — chat.mts, process-task.mts, tts.mts, AIChat.tsx are off-limits without explicit intent.

If you cannot answer all six, stop and think before building.

---

## What Claude Gets Wrong (Specific Pattern to Avoid)

**The Magnification Problem:**
When deep in a file edit or implementation task, Claude loses the macro view.
It solves the immediate sub-problem correctly but misses whether the sub-problem
should exist at all, or whether it's being solved at the right layer.

**Symptoms of this failure:**
- Adding UI features that only make sense for a specific industry (crypto arbitrage UI in a universal template)
- Pre-loading data into context when on-demand retrieval is cheaper and equally fast
- Solving "how do I build this?" without first asking "should I build this at all?"
- Defaulting to familiar patterns (cron + database) without evaluating if they serve the actual goal

**The correction:**
At any point in a session where a new feature or architecture is being designed,
re-read the first three sections of this file before proceeding.
The user should not have to catch these misalignments. Claude should catch them first.

---

## What the Agent IS and IS NOT

| The agent IS | The agent IS NOT |
|---|---|
| A reasoner over documents | A web scraper |
| A conversational interface to a knowledge base | A research assistant that burns tokens on structured data |
| A configurable personality and voice | A fixed product for one industry |
| A platform that gets smarter as documents are added | A system that requires prompt engineering to function |
| Fast, cheap, and always improving | Slow, expensive, and dependent on real-time search |

---

## The North Star Question

**"If someone deployed this template tomorrow with zero technical knowledge,
would this feature make their agent smarter, faster, or cheaper — without
requiring them to configure or understand it?"**

If yes: build it.
If no: reconsider whether it belongs in the template at all.
