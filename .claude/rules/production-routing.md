# Production Routing Rules

## Core Principle
Opus selects the best AI engine for each production task.
No single engine handles everything. Route based on task requirements.

## Capability Matrix

| Task Type | Best Engine | Why | Fallback |
|---|---|---|---|
| Source-grounded slides | NotebookLM | Citation tracing, Nano Banana Pro visuals, Presenter mode | Opus outline → manual pptxgenjs |
| Infographics | NotebookLM | Visual generation from source data, multiple formats | Claude Code D3/Recharts → image export |
| Audio overview | NotebookLM | Only tool with conversational audio generation | None |
| Mind maps | NotebookLM | Visual mind maps from source documents | Opus text-based concept map |
| Cited company research | Perplexity Deep Research | Hundreds of sources, citation trails, finance vertical | Claude.ai Deep Research |
| Strategic analysis | Claude Opus | Deepest reasoning, non-obvious implications | Gemini 2.5 Pro |
| Large document processing | Gemini | Largest context window for massive PDFs | Claude Opus 200k |
| Technical image interpretation | Gemini | Strongest multimodal for maps, legends, visual data | Claude Opus |
| Long-form narrative writing | Claude Opus | Best narrative voice, consistent tone, deep synthesis | Gemini |
| Web development | Claude Code | Only tool that builds and deploys | N/A |
| Cross-model verification | Gemini or Grok | Different training data catches blind spots | Any model different from generator |

## Routing Decision Process
For each production task, evaluate:
1. What output type? (visual / written / interactive / audio)
2. Needs source grounding? (every claim traceable to uploaded docs)
3. Needs real-time info? (current market data, recent news)
4. Needs deep reasoning? (strategic analysis, narrative synthesis)
5. Needs multimodal? (images, maps, mixed media)
6. Quality bar? (internal prep vs. boardroom deliverable)
7. Needs cross-model verification? (critical claims, financial figures)

## Engine-Specific Prompting
Each engine has different optimal prompting patterns:

**NotebookLM:** Select specific sources per generation. Use Studio panel.
Presenter Slides vs Detailed Deck are different modes. Custom style prompts
improve output. Iterate: generate → evaluate → refine → regenerate.

**Perplexity:** Detailed multi-part queries outperform simple questions.
Specify output format. Use follow-ups in same thread. Save thread URLs.
Run same query twice and compare.

**Claude Opus:** Full context in prompt. Specify tone, audience, length.
Use ultrathink for highest-stakes content. Ask Opus to self-critique.

**Gemini:** Be specific about data types for image interpretation.
Request structured output (JSON/markdown). "Translate to business language."

## Iteration Protocol
If engine underperforms after 2 iterations:
1. Is it the prompt? → Significantly different approach, same engine
2. Is it the source documents? → Improve inputs, retry same engine
3. Is it the engine? → Switch to fallback listed above
4. Log all decisions in production/iteration-log.md
