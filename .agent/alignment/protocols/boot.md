# /boot — Session Alignment Protocol

Boot must complete in **2 tool rounds maximum**. Parallelism is mandatory.

---

## Round 1 — Everything parallel

Fire ALL of these simultaneously. They have zero dependencies on each other.

### 1a. Git pull + context detection + port check + harvest check (single Bash call)

Combine into ONE bash command:

```bash
git pull 2>&1; echo "===CONTEXT==="; grep '"name"' package.json 2>/dev/null | head -1; echo "===PORT==="; grep -i "localhost" CLAUDE.md 2>/dev/null | head -3; echo "===DEVDIR==="; grep -rl '"dev"' --include="package.json" --exclude-dir=node_modules . 2>/dev/null | head -5; echo "===NETSTAT==="; netstat -ano 2>/dev/null | grep ":${DEV_PORT:-3002}.*LISTENING" || echo "PORT_FREE"; echo "===HARVEST==="; git log --format="%ai %s" --grep="harvest" -1 2>/dev/null || echo "NEVER"
```

**NEVER use `cmd /c` for any command** — it spawns a full Windows shell and hangs for 10+ seconds. All commands here work natively in Git Bash.

From results, derive:
- **PROJECT_NAME** — from package.json name, or first heading in CLAUDE.md
- **DEV_PORT** — from `localhost:XXXX` in CLAUDE.md; fallback 3000
- **DEV_DIR** — directory of the package.json containing the dev script (may be a subdirectory)
- **PORT_STATUS** — occupied or free
- **HARVEST_DATE** — date of last harvest commit

### 1b. Read pearls (Read tool)

Read `.agent/alignment/pearls.md`. Read only the Guidance tables — skip Metrics.

- Group by Confidence level
- Count totals, unvalued (Min/Use = ?), and overdue (Review By in past)
- Internalize silently — do NOT list pearls back to the user

If file doesn't exist: "No pearls file found."

### 1c. Read VISION.md (Read tool)

Read `VISION.md` at repo root. Internalize the 5 principles and eagle view test.

### 1d. DO NOT re-read these — they are already in context

- **CLAUDE.md** — loaded automatically by the system as project instructions
- **MEMORY.md** — loaded automatically by the system as auto-memory
- Any `.claude/rules/` files — loaded automatically

Redundant reads waste an entire tool round. Skip them.

---

## Round 2 — Start dev server (if needed) + report

Only depends on Round 1 results.

### 2a. Start dev server (if port was free)

```bash
cd {DEV_DIR} && npm run dev
```

Run as background task. Do not wait for compilation.

If port was occupied in Round 1: skip, note "already running."

### 2b. Activate invocation tracking

Pearl invocation logging is now ACTIVE for this session.

**Format:**
```
⚡ Pearl invoked: "[Pearl Title]" — [what you were about to do and what you did instead]
```

- Before substantial operations, scan loaded pearls for relevance
- In sessions > 1 hour, re-state Hard Constraints before high-risk operations

### 2c. Fire boot canary

```
[BOOTED] {N} pearls loaded. Project: {PROJECT_NAME}. Last harvest: {N days ago / never}. Dev: {running on :{PORT} / starting / already running}.
```

### 2d. Report alignment status

```
Boot Complete.

PROJECT:  {PROJECT_NAME}
STACK:    {from CLAUDE.md}
PORT:     {DEV_PORT}
PEARLS:   {N} loaded ({N} categories) — {N} Hard · {N} Heuristic · {N} Pattern
UNVALUED: {N} pearls with Min/Use = ?
REVIEW:   {N} past Review By date
HARVEST:  {N days ago / never} {⚠ OVERDUE if > 7 / 🚨 CRITICAL if > 14}
DEV:      {status}
TRACKING: ⚡ Active
STATUS:   Ready. Awaiting orders.
```

---

## Harvest reminder (planted)

At session end, if significant problem-solving occurred, offer `/harvest`.

---

## Critical Rules

- **2 rounds. Not 3. Not 4.** If boot takes more than 2 tool rounds, the protocol is broken.
- **Read the files — do not summarize from memory.** Pearls and VISION.md must be re-read every session.
- **Do NOT re-read system-loaded files.** CLAUDE.md, MEMORY.md, and .claude/rules/ are already in context.
- **One bash call for all shell commands.** Never split independent shell commands across multiple tool calls.
- **Fire the canary.** Non-negotiable.
- **Log every pearl invocation.** Uses = 0 means pruning candidate.
- **Do not start building.** Boot ends at the report. Wait for task assignment.
- **Never hardcode project names or ports.** Derive from the actual repo.
