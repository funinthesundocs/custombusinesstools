# /pearl-report — Generate Pearl System Dashboard

Read pearls.md, parse all data, generate a rich HTML report at
`.agent/alignment/pearl-report.html`. Open in any browser.

---

## Step 1 — Read pearls.md

Read `.agent/alignment/pearls.md` in full. If it doesn't exist, stop with:
> "No pearls.md found. Run boot and complete a session, then harvest to create pearls."

---

## Step 2 — Parse All Pearl Data

For each category, extract both tables (Guidance + Metrics) and join on Pearl title.

Compute summary stats:
- totalPearls, totalSavedAllPearls, avgHitRate
- mostValuable (highest Total Saved)
- needsValuation (count of Min/Use = ?)
- reviewDueCount (past Review By date)
- pruneCandidates (Seed + Total Saved < 15 + Age > 60 days)
- byMaturity, byType, byConfidence breakdowns

---

## Step 3 — Generate HTML

Write a self-contained HTML file with:
- Dark mode design (bg #030712, cyan accents #22D3EE)
- Stat cards grid at top (total pearls, total saved, hit rate, etc.)
- Alert boxes for prune candidates and review-due pearls
- Pearl cards grid with: title, badges (maturity/type/confidence), notes, trigger,
  metrics (Total Saved, Hit Rate, Min/Use, Uses/Opportunities), value bar, hit rate bar
- Filters: search, maturity, type, confidence
- Sort: total saved, hit rate, uses, maturity, date added
- Group by: category, maturity, type, or none

Use Inter + JetBrains Mono fonts. All data embedded as JSON in a script tag.

---

## Step 4 — Write

Save to `.agent/alignment/pearl-report.html`.

---

## Step 5 — Confirm

Output:
```
Pearl Report generated: .agent/alignment/pearl-report.html
[N] pearls · [N] categories · Total Saved: Xmin · [N] prune candidates · [N] review due
```
