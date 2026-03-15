# /harvest — Full Wisdom Extraction Protocol (19 Steps)

Scan the current session for every problem-resolution cycle. Measure real time cost.
Distill into Pearls of Wisdom with measured value. Update all metrics. Commit.

---

## Step 1 — Read pearls.md and Verify Schema

Read `.agent/alignment/pearls.md`. Verify it uses the two-table format (Guidance + Metrics
per category). If it uses an older format, migrate first (see schema at top of pearls.md).

---

## Step 2 — Establish Harvest Window

Find the most recently added pearl by `Added` date. Only scan for NEW problem cycles
after that date. If no dated pearls exist, scan the entire session.

---

## Step 3 — Scan Invocation Logs and Update Metrics

Search the conversation for all `⚡ Pearl invoked:` lines.

For each unique pearl title:
1. Count ALL occurrences (N)
2. In Metrics table: `Uses += N`
3. In Metrics table: `Opportunities += 1` (session counts as one opportunity)
4. If `Min/Use` is numeric: recalculate `Total Saved = Uses × Min/Use`
5. If `Min/Use = ?`: add to Needs Valuation list
6. Recalculate `Hit Rate = Uses / Opportunities`

---

## Step 4 — Retrospective Opportunity Scan

For every pearl NOT invoked this session, check: did its Trigger condition arise?
- If trigger arose but no log exists: `Opportunities += 1`, flag as `UNLOGGED`
- If trigger did not arise: no change

---

## Step 5 — Handle Needs Valuation

For each pearl with `Min/Use = ?` that was invoked, ask the user:
> "Pearl '[Title]' was invoked but has no time value. How long does this type of problem
> typically cost when it goes wrong?"

Set `Min/Use` from response, recalculate `Total Saved`.

---

## Step 6 — Check Maturity Promotions

| Condition | Promotion |
|-----------|-----------|
| Seed + Total Saved >= 30 min | Seed → Confirmed |
| Confirmed + Total Saved >= 120 min | Confirmed → Established |

---

## Step 7 — Flag Pearls Past Review By Date

Present to user: "Pearl '[Title]' is past review. Still accurate?"
- Still valid → new Review By = today + 6 months
- Outdated → retire it (Step 14)
- Needs update → user provides revised Notes

---

## Step 8 — Extract Problem-Resolution Candidates

Scan chronologically for: `ATTEMPT → FAILURE → (repeat 1+) → SOLUTION FOUND`

Signals: error pastes, "still not working", same file edited multiple times,
user frustration then relief, fundamental assumption discovered wrong.

Record: symptom, attempt count, root cause, correct fix, elapsed time.

---

## Step 9 — Measure Elapsed Time

For each cycle, measure time from first failure to confirmed solution.
Priority: explicit timestamps > user-stated time > agent judgment (flag with ~).
This becomes `Min/Use`.

---

## Step 10 — Generalize

Strip ALL project names, client names, filenames, platform details.
Rewrite as universal rules applicable across domains.

---

## Step 11 — 3-Gate Quality Test

Every candidate must pass ALL three:

| Gate | Question | Fail if... |
|------|----------|------------|
| Non-obvious | Would a capable practitioner get this wrong? | Anyone already knows this |
| Pain-tested | Did violating this cost real time? | Fix took < 30 seconds |
| Transferable | Applies to 3+ different contexts? | Only one narrow domain |

Litmus: Find it on Stack Overflow in 10 seconds? Rock. Wish you knew it an hour ago? Pearl.

---

## Step 12 — Dedup Check

Read ALL of pearls.md. If similar pearl exists → promote its maturity instead of duplicating.

---

## Step 13 — Write New Pearls

Add rows to BOTH tables in the correct category:

**Guidance:** `| title | one actionable sentence | Type | Trigger | Confidence |`
**Metrics:** `| title | Seed | YYYY-MM-DD | +6 months | 0 | 0 | measured min | 0 | — |`

Rules: 3-6 word title, one-sentence notes, no project names, specific trigger condition.

---

## Step 14 — Retire Outdated Pearls

Move to `## Retired Pearls` section. Never delete — preserve history.

---

## Step 15 — Pattern Recognition

Do 3+ pearls share a root cause? Propose a meta-pearl. Run through 3-gate test.

---

## Step 16 — Flag Pruning Candidates

Conditions (ALL must be true): Seed + Total Saved < 15 min + Age > 60 days.
Pearls with `Min/Use = ?` are excluded from pruning.
Present to user. Never auto-delete.

---

## Step 17 — Session Trend Metrics

Calculate: cycles found, pearls created, pearls invoked, unlogged invocations,
total minutes saved this session.

---

## Step 18 — Present Summary

| Action | Pearl Title | Type | Min/Use | Total Saved | Hit Rate | Detail |
|--------|-------------|------|---------|-------------|----------|--------|
| NEW | ... | ... | Xmin | 0 | — | Born from ~Xmin cycle |
| PROMOTED | ... | ... | ... | ... | ... | Seed → Confirmed |
| USES+N | ... | ... | ... | ... | ... | invoked N times |
| DISCARDED | ... | ... | — | — | — | Failed: [gate] |

---

## Step 19 — Git Sync

Run each command separately:
```
git add .agent/alignment/pearls.md
git status
git commit -m "harvest: [N] new pearls — [brief description]"
git log --oneline -2
git push
```
