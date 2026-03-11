# BUILDSPEC.md — TopQualityMinerals.com Master Build Specification

## THE MISSION

Build a public website for Genluiching Mining Corporation that serves as corporate presence, interactive presentation platform for a Thursday meeting with Aboitiz Construction executives, and implicit demonstration of AI-integrated business. The site must match the visual caliber of aboitizconstructioninc.com — institutional, professional, light theme, photography-driven.

## CRITICAL REQUIREMENTS

1. **OFFLINE PRESENTATION**: The /presentation page MUST work with ZERO internet. All content statically rendered. No API calls on load. No Supabase queries. No CDN fonts (use next/font). Images local. D3 renders from hardcoded data. Agent/voice features gracefully hidden when offline (check navigator.onLine).
2. **NO BROKEN ANYTHING**: Every link goes somewhere. Every button works. No placeholders. No 'coming soon.' No broken images — use CSS gradient fallback (linear-gradient(135deg, #0C1926, #1B365D)) if photo missing.
3. **PROJECTOR-OPTIMIZED**: Presentation page primary target is 16:9 at 1920x1080. Detect width >= 1920 → scale fonts 1.15x.
4. **ONE FOCUS PER SLIDE**: Presentation sections have ONE dominant visual, max 3 data points. Billboard, not data dump.

## DESIGN SYSTEM

### Aesthetic Direction
Refined institutional minimalism with mining-industry warmth. Think: a top-tier management consulting firm's presentation for a natural resources deal. Clean, spacious, data-rich without being dense. The design should feel like it belongs alongside aboitizconstructioninc.com — same league, same caliber.

NOT startup. NOT dashboard. NOT dark mode (except hero overlays and footer). NOT generic AI aesthetic.

### Colors (Tailwind config custom)
```
bg-primary:      '#FFFFFF'
bg-surface:      '#F7F8FA'
bg-dark:         '#0C1926'
text-primary:    '#1A1F36'
text-secondary:  '#4E5A6E'
text-muted:      '#8492A6'
brand-navy:      '#1B365D'
brand-gold:      '#C5922E'
brand-copper:    '#B87333'
brand-iron:      '#5C6370'
success:         '#2D8A4E'
amber:           '#D97706'
border:          '#E2E8F0'
```

### Typography (next/font/google — NO CDN links)
```typescript
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700'], variable: '--font-playfair' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-dm-sans' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['500','700'], variable: '--font-jetbrains' })
```

Usage rules:
- Playfair Display 700: ONLY hero headlines (max 1 per page)
- DM Sans: everything else — body, headings, navigation, labels
- JetBrains Mono: ALL numbers, metrics, percentages, data values

### Metric Callout Pattern (signature visual element)
```
Number: JetBrains Mono 700, 56px (desktop) / 40px (mobile), text brand-navy
Label:  DM Sans 400, 14px, text-muted, uppercase tracking-wide
```
Example: "67.31%" in huge JetBrains Mono, "Fe — Premium Iron Ore" in small DM Sans below.

### Component Specs

**NavBar**: Fixed top. Transparent with white text over hero → white bg with shadow-sm on scroll (use Intersection Observer on hero). GMC logo left (max-h 40px). Nav links right: About, Assets, Presentation, Team, CSR, Contact. DM Sans 500, 15px. Mobile: hamburger menu.

**Footer**: bg-dark (#0C1926). 4-column grid at desktop, stacked mobile. Columns: Company (About, Assets, CSR, Contact), The Opportunity (Presentation, Evidence, Partnership), Legal (Corporate Governance, MPSA Registration), Contact (address, email). GMC logo white. Copyright 2026 Genluiching Mining Corporation.

**SectionHero**: Full-width, specified height. Background image with gradient overlay OR CSS gradient if no photo. Centered text. Optional scroll indicator (animated chevron).

**Button Primary**: bg brand-navy, text white, px-8 py-3, rounded-lg, font DM Sans 600, hover:bg-opacity-90, transition.
**Button Secondary**: border-2 brand-navy, text brand-navy, same sizing, hover:bg brand-navy hover:text-white, transition.

**Cards**: bg-white, rounded-xl, shadow (0 2px 8px rgba(12,25,38,0.06)), p-8. Hover: shadow-md, translateY(-2px), transition 200ms.

### Spacing
- Section padding: py-24 (96px) desktop, py-16 (64px) mobile
- Content max-width: max-w-7xl mx-auto px-6
- Grid gap: gap-8 (32px)

### Responsive Breakpoints
- Mobile: < 768px — single column, scroll-snap disabled, hamburger nav
- Tablet: 768-1199px — 2-col grids collapse, metrics wrap to 2 rows
- Desktop: 1200px+ — full layouts as specified
- Projector: >= 1920px — scale factor 1.15x on key elements

---

## CONTENT BLOCKS (verbatim text for Claude Code to render)

### Homepage Hero
Headline: "Bringing Precious Ores to the Light"
Subheadline: "A polymetallic deposit validated by nine independent laboratories across five countries"

### Homepage Company Overview
"Genluiching Mining Corporation (GMC) is a Philippine mining company holding MPSA 251(A)-2007-XI, a 5,906-hectare mineral concession in Tarragona and Mati City, Davao Oriental. The concession hosts a polymetallic deposit — iron ore, copper, gold, and associated minerals — validated by nine independent laboratories across five countries and confirmed by three geophysical methods."

"Nine laboratories have tested material from across the concession using different methods and sample types. POSCO International confirmed production-grade iron ore at 67.31% Fe. Intertek Minerals' 136-sample systematic campaign proved deposit-scale mineralization. Beijing BGRIMM corroborated copper-gold grades through CNAS-accredited testing. The SGECS geological assessment, filed with MGB Region XI in June 2025, identified 21.6 million metric tons of copper ore and 16 million metric tons of iron ore within just 518 hectares explored — less than 9% of the total concession."

"GMC is seeking a strategic partner with the operational capacity, financial resources, and long-term vision to develop this asset at scale. The regulatory environment is the most favorable in fifteen years. The geology is validated. The opportunity is now."

### Homepage Metrics Strip
- "5,906" / "Hectares" / "Concession Area"
- "9" / "Labs" / "Independent Validation"
- "8" / "Drill Holes" / "Subsurface Confirmation"
- "67.31%" / "Fe" / "Premium Iron Ore"
- "21.6M" / "MT" / "Copper Ore Resource"

### Presentation Section 1 — Opening
Headline: "A Partnership Built for This Moment"
Metrics (animate count-up): 5,906 ha | 9 Labs | 8 Drill Holes | 493m Drilled

### Presentation Section 2 — The Opportunity
Three metric blocks:
- "67.31% Fe" / "Production-grade iron ore. POSCO International confirmed."
- "39.5% Cu" / "Near-concentrate copper. Four laboratories across a decade."
- "20.35 g/t Au" / "Highest gold from fire assay. By-product from copper processing."
Bottom line: "21.6 million metric tons of copper ore. 16 million metric tons of iron ore. From less than 9% of the concession explored."

### Presentation Section 3 — The Alignment
Left column heading: "What GMC Brings"
Items: MPSA — 5,906 hectares, active | 9-lab validated deposit | Community — 60% Lumad workforce | MGB-approved operator | 15+ years site knowledge

Right column heading: "What a Strategic Partner Brings"
Items: Construction capability | Processing plant expertise | Energy supply infrastructure | Technology and data science | Financial capacity for full development

Bottom callout: "Aboitiz Construction built and has maintained the $1.7 billion THPAL nickel processing plant in Surigao del Norte for thirteen years. GMC offers the natural next step — from mining services to mining partnership."

### Presentation Section 4 — The Proof
Just the deposit cross-section visualization. No text except the schematic label.

### Presentation Section 5 — The Plan
Timeline phases:
- Phase 1: "Exploration Partnership" / "Confirm copper at depth. Ship first vessel. Commercial permit."
- Phase 2: "Feasibility Study" / "JORC-compliant resource estimate. Bankable feasibility."
- Phase 3: "Permitting" / "ECC. Development permits. Full regulatory compliance."
- Phase 4: "Plant Construction" / "Processing facility. Infrastructure. AAAA capability deploys."
- Phase 5: "Production" / "Commercial operations. Maintenance model. Recurring revenue."

### Presentation Section 6 — The Protection
Headline: "We Have Already Thought About Everything You Are About to Ask"
Risk items:
- GREEN: "FPIC" / "Approved by indigenous communities"
- GREEN: "MGB Status" / "Director ORDER confirming GMC as operator"
- GREEN: "Legal Standing" / "Final court ruling in GMC favor"
- AMBER: "Copper at Depth" / "Sulfide confirmed at 60-65m. Targeted drilling is Phase 1."
- AMBER: "Mercury" / "Identified proactively. Minamata compliance from outset."

### Presentation Section 7 — The Vision
Headline: "Building for Business to Prosper and Communities to Thrive"
Subline: "32 years remaining on MPSA. A multi-generational partnership."

### Presentation Section 8 — The Ask
Headline: "The Next Step"
Three actions:
- "Phase 1 exploration partnership"
- "Technical team introduction"
- "Joint site assessment"
If navigator.onLine: show subtle link "Have questions? Ask our AI advisor →" to /advisor. Hidden if offline.

---

## DEPOSIT CROSS-SECTION VISUALIZATION

Build as SVG in React. This is the technical showcase — the single most important visual on the site.

SVG viewBox: 0 0 1200 600
Vertical axis: 0-200m depth (inverted — 0m at top, 200m at bottom)
Scale: 1m = 3px in y-axis

### Geological Layers (horizontal bands with slight undulation)
```
Surface:          y=0 to y=10, color: #8B9467 (green-brown, terrain)
Iron Oxide Cap:   y=10 to y=90, color: brand-iron #5C6370 with subtle pattern
Transition Zone:  y=90 to y=180, color: #9CA3AF (gray gradient)
Sulfide Zone:     y=180 to y=300, color: brand-copper #B87333 with 0.7 opacity
Porphyry Target:  y=300 to y=600, dashed outline only, color: brand-gold #C5922E, label "Geophysical Target — 80-200m"
```

### Drill Holes (vertical lines from surface)
Plot as vertical lines with colored segments for mineralization zones:
```
DH-1:     x=200,  depth=28m (84px),   highlight: 36.58% Cu zone, 59.86% Fe
SBF-1A:   x=350,  depth=28m (84px),   highlight: iron mineralization
SBF-1B:   x=400,  depth=55m (165px),  highlight: iron zone
SBF-1C:   x=500,  depth=160m (480px), highlight: MASSIVE SULFIDIZATION at 60-65m — KEY HOLE, make this visually prominent
SBF-2:    x=600,  depth=40m (120px),  highlight: iron zone
DH-10:    x=750,  depth=50m (150px),  highlight: 13.77 g/t Au at 16-21m
MEGA-4:   x=850,  depth=60m (180px),  highlight: gold in core at 16-21m, 6.33% Cu
DH-5:     x=950,  depth=28m (84px),   highlight: iron, peak hematite 40% at 16-20m
```

### Hover Interaction
On hover over any drill hole → tooltip showing: hole ID, total depth, key grades. Use React state, not D3 tooltips.

### Labels
- "Schematic cross-section — drill hole depths to scale, horizontal positions approximate"
- "Based on SGECS geological assessment filed with MGB Region XI, June 2025"
- Scale bar bottom-right: 0m, 50m, 100m, 150m, 200m
- Legend bottom-left: layer colors + mineralization symbols

### Fallback
If D3/interactive has rendering issues, build a clean static SVG with same layout and no hover. A polished static cross-section is better than a broken interactive one.

---

## EVIDENCE TABLE DATA (for /assets page)

9 rows, interactive. Click row → expand showing detail below the row in a bg-surface card, max 4 lines.

| # | Lab | Country | What It Tested | What It Proved | Expanded Detail |
|---|-----|---------|---------------|----------------|-----------------|
| 1 | POSCO International | South Korea 🇰🇷 | Production-representative lump ore | 67.31% Fe with very low impurities — shipping-grade premium | Year: 2019. Sample: stockpile lump ore. Method: standard steelmaker feedstock analysis. P: 0.012-0.021%, S: 0.002-0.013%. |
| 2 | Intertek Minerals | Philippines 🇵🇭 | 136 systematic samples across full MPSA | Deposit-scale mineralization confirmed, highest grades in mapped ore zones reaching 56.06% Fe | Year: 2024. PRC License 0011144. Full QC protocol (blanks, standards, duplicates). Area-wide exploration survey proving mineralization extent. |
| 3 | Beijing BGRIMM | China 🇨🇳 | Targeted samples from mineralized zones | 20.72% Cu, ~15 g/t Au — CNAS-accredited state laboratory corroboration | Years: 2015-2019. CNAS-accredited government lab. Arbitration-grade testing in commercial transaction context. |
| 4 | Davao Analytical (DALINC) | Philippines 🇵🇭 | Multiple campaigns across mineral zones | 39.5% Cu near-concentrate, 53.4% Fe, 4.4 g/t Au — grade consistency across a decade | Years: 2012-2025. PRC-registered analysts. Multiple campaigns confirming consistency over 13 years. |
| 5 | HK Imperial Processing | Philippines 🇵🇭 | Commercial-scale processing of 120,000 WMT | 18.02% Cu concentrate, 11.33 g/t Au, 383 g/t Ag — industrial processing viability | 12 production lots processed. Demonstrated that copper mineralogy is amenable to conventional processing at commercial scale. |
| 6 | Ostrea Mineral Labs | Philippines 🇵🇭 | Drill core samples from multiple holes | 36.58% Cu from DH-1, 59.86% Fe from DH-1-2, 20.35 g/t Au from fire assay | Est. 1976. Batch B-34805 (2024) and CAN 96885 (2017). 7-year grade consistency. Highest gold ever recorded at GMC. |
| 7 | CCIC Philippines | Philippines 🇵🇭 | Iron ore and copper from drill holes | 59.34% Fe iron ore, 6.33% Cu from MEGA DH-4. High sulfur confirms sulfide mineralization. | March 2025. International testing house. 4 copper samples from drill hole series. Sulfur 2.95-8.19% — porphyry indicator. |
| 8 | SGS Korea | South Korea 🇰🇷 | Core samples (details confidential) | Results favorable per GMC management — full report pending | Referenced in SGECS geological report. Independent international laboratory. |
| 9 | Laboratorium Uji Kimia Dan Mekanik | Indonesia 🇮🇩 | Referenced in SGECS report | Additional international validation | Referenced in SGECS geological assessment. Indonesian laboratory adds 5th country to validation portfolio. |

---

## PAGE BUILD INSTRUCTIONS

### All Pages Share:
- NavBar component (fixed, transparent→white on scroll)
- Footer component (bg-dark, 4 columns)
- Head metadata: page-specific title, description, og tags
- Consistent max-w-7xl mx-auto px-6 content wrapper
- Accessible: alt text on all images, ARIA labels on interactive elements, WCAG AA contrast

### Page: Homepage (/)
Read content blocks above. Build hero with site photo from catalog (choose the most dramatic landscape or aerial shot). If no suitable photo found, use CSS gradient. Metrics strip uses MetricCard component. Company overview is two-column (text + photo). Asset preview has 3 mineral cards with accent colors. Partnership section has simple contribution diagram. All CTAs link to real pages.

### Page: About (/about)
50vh hero. Timeline built as horizontal React component with nodes — NOT a static image. Each node is a circle on a horizontal line with year below and event above. Clicking expands detail. Vision/Mission/Values in elegant card grid. Corporate governance as clean list with checkmark icons.

### Page: Assets (/assets)
Hero, then deposit cross-section (the SVG visualization specified above). Then evidence table (interactive, 9 rows). Then mineral detail sections for Iron, Copper, Gold with MetricCards. Then volume estimates with SGECS qualifier. This is the deep-dive page — more content density is OK here since it's not the presentation.

### Page: Presentation (/presentation)
Scroll-snap container. 8 sections, each min-h-screen. Progress bar at top. Keyboard nav. Section counter bottom-right. Each section follows the emotional tone specified in the content blocks. CSS: scroll-snap-type: y mandatory. scroll-snap-stop: always on each section (prevents overshoot). Disable snap on mobile < 768px. All content hardcoded — zero API calls.

### Page: Team (/team)
Card layout. Jett Tupas card with: name, title "President & CEO, Genluiching Mining Corporation", silhouette icon placeholder (Lucide User icon in a circle with bg-surface). Style the placeholder so it looks intentional, not broken. Brief company structure note.

### Page: CSR (/csr)
"Caring for Creation" heading. Environmental stewardship section. 60% Lumad workforce highlight. FPIC approved status. Community development vision. Use site photography if catalog has suitable community/nature images.

### Page: Contact (/contact)
Contact form: name, email, company (optional), message. Submit to Supabase contact_submissions table. If offline (navigator.onLine === false): hide form, show "Please contact us directly" with email address. Makati office address. No Google Maps dependency — use a styled address card.

### Page: Advisor (/advisor)
DO NOT BUILD FROM SCRATCH. Copy these working files from the dashboard:
- web/dashboard/src/app/agent/page.tsx → adapt to light theme
- web/dashboard/src/app/api/chat/route.ts → change system prompt to external version
- web/dashboard/src/app/api/tts/route.ts → change voice_id to Titan (T1PAJSQMHL7OFVB1KTOQ)

Changes from dashboard version:
1. System prompt: use the external-facing prompt (see below)
2. Theme: light background, navy/gold accents instead of dark/cyan
3. Conversation table: external_agent_conversations (not agent_conversations)
4. Voice: Titan voice_id T1PAJSQMHL7OFVB1KTOQ
5. NOT linked from main navigation — accessible by direct URL only
6. If offline: show "The AI advisor requires an internet connection"

External agent system prompt:
"You are the AI advisor for Genluiching Mining Corporation. You answer questions about GMC mining assets, geological data, partnership opportunity, and corporate information with confidence and accuracy. You draw on verified data from nine independent laboratories, eight drill holes, geophysical surveys, and professionally filed geological reports. You do NOT speculate about deal terms, financial projections beyond what is in the presentation materials, or internal company matters. If asked about something outside your knowledge, say That is a great question — I will make sure our team follows up with you directly. You present geological evidence with the confidence of convergent data from independent sources. You never volunteer information about risks unless directly asked, and when asked, you frame them as engineering challenges with defined solutions. Keep responses concise — 2-3 sentences per point, maximum 800 words total."

---

## SUPABASE TABLES TO CREATE

```sql
CREATE TABLE IF NOT EXISTS external_agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sender_name TEXT DEFAULT 'Visitor',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE external_agent_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;
```

---

## ENVIRONMENT SETUP

Create web/presentation/.env.local with these variables (copy values from web/dashboard/.env.local):
```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=
GEMINI_API_KEY=
```

Dev server: `next dev -p 3000`

---

## GMC LOGO

Download from: https://genluiching.com/wp-content/uploads/2018/07/GMC_LOGO-1024x209.png
Save to: public/images/gmc-logo.png

If download fails (network restricted), create text-based logo: "GMC" in Playfair Display 700, brand-navy, with "Genluiching Mining Corporation" in DM Sans 400 below. This looks intentional and professional.

---

## NETLIFY DEPLOYMENT

Create netlify.toml in web/presentation/ root:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

next.config: output 'standalone'

---

## TESTING PROTOCOL

After complete build, execute:
1. Visit every page: /, /about, /assets, /presentation, /team, /csr, /contact, /advisor
2. Click every navigation link from every page — zero 404s
3. Click every CTA button — verify correct target
4. Test presentation: scroll-snap, keyboard arrows, progress bar update
5. Test responsive: resize to 375px, 768px, 1024px, 1440px, 1920px
6. Test contact form: submit test entry, verify in Supabase
7. Test agent: send message, verify RAG retrieval and response
8. Test agent voice: verify TTS plays
9. Verify all images load or gracefully fallback (no broken image icons)
10. Report PASS/FAIL for each test with details on any failures