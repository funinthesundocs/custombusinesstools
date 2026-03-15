# RAG Factory — Universal Alignment System

> **ANY agent working in this repo — CLI, IDE, API, or otherwise — MUST read this file
> and follow the protocols below.** This system is not optional. It is the institutional
> memory of this project and the mechanism by which agents avoid repeating mistakes.

---

## What This Is

A repo-native alignment system that gives every agent instance:
1. **Pearls of Wisdom** — hard-won lessons from past sessions, with measured value
2. **Boot Protocol** — session startup sequence that loads context and activates tracking
3. **Harvest Protocol** — end-of-session extraction of new lessons
4. **Iterate Protocol** — recursive self-grading to 96% perfection
5. **Pearl Report** — HTML dashboard of the pearl library's health

---

## File Structure

```
.agent/alignment/
├── README.md                  ← You are here. Start point for any agent.
├── pearls.md                  ← The pearl library. Read at boot, updated at harvest.
├── protocols/
│   ├── boot.md                ← Session startup protocol
│   ├── harvest.md             ← Full wisdom extraction (19 steps)
│   ├── harvest-quick.md       ← Abbreviated harvest (11 steps)
│   ├── iterate.md             ← Recursive optimization to 96
│   └── pearl-report.md        ← Generate HTML pearl dashboard
```

---

## How to Use

### Starting a Session
Read and execute `.agent/alignment/protocols/boot.md`. This loads pearls, project context,
and activates invocation tracking. Do not start building until boot completes.

### During a Session
When a pearl's trigger condition is met, log it:
```
⚡ Pearl invoked: "[Pearl Title]" — [what you were about to do and what you did instead]
```
This is non-negotiable. Unlogged invocations mean the pearl gets no credit and becomes
a pruning candidate.

### Ending a Session
If significant problem-solving occurred, run the harvest protocol
(`.agent/alignment/protocols/harvest.md`). This extracts new pearls from the session,
updates metrics on existing pearls, and commits the changes.

### Iterating on a Deliverable
When the user asks to iterate something to perfection, follow
`.agent/alignment/protocols/iterate.md`. Score brutally, improve concretely,
stop at 96.

---

## The Pearl System — Quick Reference

Pearls are universal lessons extracted from real debugging sessions.
Each pearl has measured value (`Uses × Min/Use = Total Saved`).

**Maturity levels:** Seed → Confirmed → Established
**Confidence levels:** Hard Constraint (always follow) → Strong Heuristic (usually follow) → Soft Pattern (be aware)
**Pruning rule:** Seed + Total Saved < 15 min + Age > 60 days → flag for human review

The full schema is documented at the top of `pearls.md`.

---

## Critical Rules for All Agents

1. **Read the files. Do not summarize from memory.** Every session starts cold.
2. **Log every pearl invocation.** Uses = 0 means pruning candidate.
3. **Never touch agent core files** without explicit user approval: `chat.mts`, `process-task.mts`, `tts.mts`, `AIChat.tsx`
4. **Read VISION.md** before designing any feature or architecture.
5. **The north star:** "Would the 1,000th non-technical deployer benefit from this?"
