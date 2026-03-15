# /boot — Session Alignment Protocol

Execute every step in order. Do not skip steps. This protocol works for ANY agent
(CLI, IDE, API) working in this repo.

---

## Step 1 — Pull Latest Changes

Run `git pull`. If it fails, note it and continue.

---

## Step 2 — Detect Project Context

Determine:
- **PROJECT_NAME** — from `package.json` name field, or first heading in `CLAUDE.md`
- **DEV_PORT** — from `localhost:XXXX` found in `CLAUDE.md`; fallback to 3000
- **DEV_DIR** — search all `package.json` files for the dev script; it may be in a subdirectory (e.g., `web/dashboard`), not at root

---

## Step 3 — Start Dev Server

Check if the dev server is already running on DEV_PORT (e.g., `netstat` or equivalent).

- **If port is occupied:** note "Dev server already running on :{DEV_PORT}" — skip.
- **If port is free:** launch `npm run dev` from DEV_DIR as a background task.

---

## Step 4 — Load Project Pearls

Read `.agent/alignment/pearls.md` from the project root.

If the file uses the two-table format (Guidance + Metrics per category), **read only
the Guidance tables** at boot — the Metrics tables are for harvest only.

From the Guidance tables, internalize every pearl silently — do NOT list them back
to the user. Then:

- **Group by Confidence**: Hard Constraints are non-negotiable. Strong Heuristics inform judgment.
- **Flag Review Due**: note any pearl whose `Review By` date has passed.
- **Count unvalued pearls**: any pearl with `Min/Use = ?`.
- **Count total pearls** across all Guidance tables.

If the file does not exist, note "No pearls file found — harvest will create it."

---

## Step 5 — Activate Invocation Tracking

Pearl invocation logging is now **ACTIVE** for this session.

**Format — use this exactly whenever a pearl prevents a mistake or shapes a decision:**
```
⚡ Pearl invoked: "[Pearl Title]" — [what you were about to do and what you did instead]
```

**Trigger awareness**: each loaded pearl has a Trigger condition. When you detect that
condition in the current task, consciously evaluate whether the pearl applies. Log the
result either way — invocation or "considered, not applicable."

**Pre-task pearl scan**: before beginning any substantial operation, briefly state which
loaded pearls are relevant.

**Context decay re-injection**: in sessions exceeding ~1 hour, re-state Hard Constraint
pearls before high-risk operations.

---

## Step 6 — Load Project Context

Read these files in order:

1. `VISION.md` — governing intent, 5 principles, eagle view test
2. `CLAUDE.md` — architecture, tech stack, key directories, rules
3. Any context files explicitly referenced in `CLAUDE.md`

Identify:
- Current project state and active development phase
- Files flagged as off-limits or protected
- Model or tool routing rules

---

## Step 7 — Check Harvest Staleness

Search git log for the most recent harvest commit:
```
git log --oneline | grep -i "harvest" | head -1
```

- **≤ 7 days:** normal
- **8–14 days:** warn: `⚠ HARVEST OVERDUE`
- **> 14 days:** alert: `🚨 HARVEST CRITICAL`
- **No harvest found:** report "Never harvested."

---

## Step 8 — Fire Boot Canary

Emit this exact line (fill in actual values):
```
[BOOTED] {N} pearls loaded. Project: {PROJECT_NAME}. Last harvest: {N days ago / never}. Dev: {running on :{PORT} / starting / already running}.
```

---

## Step 9 — Report Alignment Status

```
Boot Complete.

PROJECT:  {PROJECT_NAME}
STACK:    {stack from CLAUDE.md}
PORT:     {DEV_PORT}
PEARLS:   {N} loaded ({N} categories) — {N} Hard Constraints · {N} Heuristics · {N} Patterns
UNVALUED: {N} pearls with Min/Use = ?
REVIEW:   {N} pearls past Review By date
HARVEST:  {N days ago / never}
DEV:      {running on localhost:{PORT} / starting / already running}
TRACKING: ⚡ Invocation logging ACTIVE
STATUS:   Ready. Awaiting orders.
```

---

## Step 10 — Harvest Reminder (planted)

At the end of this session, if significant problem-solving occurred, offer to run
the harvest protocol (`.agent/alignment/protocols/harvest.md`).

---

## Critical Rules

- **Read the files — do not summarize from memory.** Every session starts cold.
- **Fire the canary.** The one-liner in Step 8 proves alignment loaded.
- **Log every pearl invocation.** Uses = 0 means pruning candidate.
- **Do not start building.** This protocol ends at the alignment report. Wait for task assignment.
- **Never hardcode project names or ports.** Always derive from the actual repo.
