# /iterate — Recursive Optimization to 96

Score any deliverable brutally honestly, apply improvements recursively, stop at 96/100.
Works on anything: code, prompts, plans, specs, designs, workflows.

---

## The Brutality Oath

State this before EVERY scoring pass:

> I am scoring the current state as a senior reviewer with no prior relationship to it.
> My job is to find what is wrong before I say what is right. The number reflects what
> this deliverable IS right now — not what it will become.

**Prohibited phrases** (any = inflated score):
"Overall solid" · "Good foundation" · "Well done" · "Mostly works" · "Minor issues only"

---

## Scoring Rubric — Build Up From 0

| Dimension | Max | Full points | Loses points |
|-----------|-----|-------------|-------------|
| Completeness | 25 | Every requirement addressed | Missing requirements, gaps |
| Correctness | 25 | Technically accurate, works | Bugs, wrong logic, false assumptions |
| Robustness | 20 | Edge cases handled, clear errors | Silent failures, single-path thinking |
| Clarity | 15 | Immediately understandable | Confusing, ambiguous, assumed context |
| Economy | 15 | No waste, every element earns its place | Redundancy, padding, dead code |

If you give 18/25, name what the missing 7 points represent.

---

## Two-Gate Rule

| Gate | Subject | Meaning of 96 |
|------|---------|---------------|
| Gate 1 — Plan | Design/spec document | Code-ready: every component, query, and data source named |
| Gate 2 — Code | Built source files | Working: passes build, all states render, data audit passes |

Gate 1 must pass before building. Gate 2 must pass before shipping.

---

## The Loop

```
IDENTIFY subject + gate
│
└── LOOP (max 5 iterations, or N if specified)
    ├── 1. SCORE — Brutality Oath first, earn every point from 0
    ├── 2. TEST — run all applicable tests (build, lint, logic trace)
    ├── 3. CHECK — score >= 96? → VICTORY. Limit reached? → GAP REPORT.
    ├── 4. PLAN — exactly 3 improvements, each with dimension + estimated points
    ├── 5. ASK? — only if blocked (two valid approaches, missing info, etc.)
    └── 6. IMPROVE — apply changes to actual deliverable, then loop to 1
```

---

## Output Format (every pass)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITERATION [N] / [MAX]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORE: [XX] / 100   Goal: 96

DIMENSION BREAKDOWN:
  Completeness  [XX]/25  [Δ+X or —]
  Correctness   [XX]/25  [Δ+X or —]
  Robustness    [XX]/20  [Δ+X or —]
  Clarity       [XX]/15  [Δ+X or —]
  Economy       [XX]/15  [Δ+X or —]

WHY NOT HIGHER (3 weaknesses minimum, before any strengths):
1. [weakness + evidence + dimension it costs]
2. ...
3. ...

WHAT'S WORKING:
1. [strength]
2. [strength]

TESTS:
  [Test]: PASS/FAIL/PARTIAL — [evidence]

PLAN:
1. [change] → [dimension] +~[X] pts
2. [change] → [dimension] +~[X] pts
3. [change] → [dimension] +~[X] pts

Applying...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Victory Report (score >= 96)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ TARGET REACHED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Final score:  [XX] / 100
Iterations:   [N] of [MAX]

REMAINING GAP — the honest [100-XX]%:
[What would need to change to reach 100. "No gaps" is always a lie.]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Variants

| Command | Behavior |
|---------|----------|
| `/iterate` | Fresh start, 5 iterations max |
| `/iterate [N]` | Fresh start, N iterations max |
| `/iterate continue` | Resume, 3 more iterations |
| `/iterate redesign` | Abandon approach, start over |

---

## Critical Rules

1. Score the CURRENT state. Never mentally apply planned improvements before scoring.
2. Lead with weaknesses. Minimum 3 before any strengths.
3. Execute tests when possible. Real failures > code review guesses.
4. Apply improvements — don't describe them. Edit the actual files.
5. The Δ column is a lie detector. Deltas must sum to total score change.
6. Stop at 96. Chasing 98+ produces diminishing returns.
7. Document the remaining gap honestly. Every deliverable has unknown failure modes.
