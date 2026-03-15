# /harvest-quick — Abbreviated Wisdom Extraction (11 Steps)

Same logic as the full harvest but with less ceremony. Use for shorter sessions.

---

## Step 1 — Find Harvest Boundary
Scan for prior harvest summary in this session. If found, only scan after it.

## Step 2 — Scan Invocation Logs
Find all `⚡ Pearl invoked:` lines. For each, increment `Uses` in pearls.md.

## Step 3 — Extract Candidates
Flag any `ATTEMPT → FAILURE → SOLUTION` sequences.

## Step 4 — Generalize
Strip project names. Rewrite as universal rules.

## Step 5 — 3-Gate Test
Non-obvious + Pain-tested + Transferable. Fail any = discard.

## Step 6 — Dedup Check
Read all of pearls.md. Similar exists → promote maturity, don't duplicate.

## Step 7 — Write or Promote
New pearls: add to both Guidance and Metrics tables. Promoted: update Maturity cell.

## Step 8 — Present Summary
| Action | Pearl Title | Category | Notes |

## Step 9 — Pre-Commit Check
`git status`. No changes = stop.

## Step 10 — Pruning Review
If > 40 pearls, list bottom 3 candidates for user approval.

## Step 11 — Git Sync
```
git add .agent/alignment/pearls.md
git commit -m "harvest: [N] new pearls — [description]"
git push
```
