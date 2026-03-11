# CLONE AND REBUILD — Paste into Claude Code

You have the fully rendered HTML and CSS from aboitiz.com saved in `web/presentation/reference/`. You also have the DOM structure analysis in `aboitiz-structure.txt`. Your job: clone their site structure and rebuild it with GMC content.

## WHAT TO READ FIRST

1. `web/presentation/reference/aboitiz-rendered.html` — their full rendered HTML
2. `web/presentation/reference/aboitiz-styles.css` — their full CSS (706KB)
3. `web/presentation/reference/aboitiz-structure.txt` — their DOM skeleton
4. `web/presentation/reference/aci-homepage.html` — ACI construction site (WordPress, simpler reference)
5. `production/source-documents/01-opportunity-brief.md` — GMC content
6. `production/source-documents/02-strategic-alignment.md` — partnership content
7. `production/source-documents/04-risk-mitigation.md` — risk data
8. `production/source-documents/05-vision-and-impact.md` — CSR content
9. `production/source-documents/09-technical-assets.md` — 9 labs, evidence portfolio, all numbers
10. `docs/narrative-arc.md` — presentation story arc
11. `web/presentation/public/images/site-photos/catalog.md` — photo inventory
12. `web/presentation/public/images/generated/` — view all 10 Gemini-generated images
13. `web/presentation/public/images/mockups/` — view all 12 page mockups for content reference

## WHAT WE'RE BUILDING

A Next.js site that mirrors aboitiz.com's layout patterns and visual sophistication, but with GMC's content, images, and brand colors. Same nav pattern. Same hero slideshow pattern. Same card grid pattern. Same section rhythm. Same scroll animations. GMC's story.

## TECH STACK

- Next.js 14+ App Router
- Tailwind CSS
- Swiper (for carousels — same library aboitiz.com uses): `npm install swiper`
- AOS (for scroll animations — same library aboitiz.com uses): `npm install aos`
- Framer Motion (for additional component animations): already installed
- Lenis (for smooth scroll): already installed
- next/font: Playfair Display, DM Sans, JetBrains Mono — loaded locally

## BRAND SYSTEM

```
Colors:
  --navy: #1B365D        (primary — replaces Aboitiz red)
  --gold: #C5922E        (accent — replaces Aboitiz gold #CBA65D)
  --copper: #B87333      (secondary accent)
  --dark: #0C1926        (dark backgrounds)
  --surface: #F7F8FA     (light section backgrounds)
  --white: #FFFFFF
  --text: #1A1F36
  --muted: #8492A6
  --success: #34D399
  --amber: #F59E0B

Typography:
  Headlines: Playfair Display 700
  Body: DM Sans 400/500/600
  Numbers/Metrics: JetBrains Mono 500/700
```

## THE BUILD — PAGE BY PAGE

### NAVBAR (clone aboitiz.com nav exactly)

Their nav: sticky top, dark/transparent background, logo left, 5 nav links with dropdown arrows, hamburger on mobile.

Our nav: same structure.
- Logo: GMC logo from `public/images/GMC_LOGO.png` (white version for dark/transparent state, dark version when nav goes solid white on scroll)
- Links: About, Assets, Presentation, Team, CSR, Contact
- Same sticky behavior — transparent over hero, solid white with shadow on scroll
- Same mobile hamburger pattern

### HOMEPAGE `/` (clone aboitiz.com homepage structure)

**HERO SLIDESHOW** — clone their `section#top_banner` pattern:
- Full-viewport Swiper carousel, auto-rotating every 5 seconds
- Slide 1: `hero-landscape-enhanced.png` — overlay text: "Bringing Precious Ores to the Light" + "A polymetallic deposit validated by nine independent laboratories across five countries"
- Slide 2: `operations-cinematic.png` — overlay text: "5,906 Hectares of Validated Mineral Assets" + "Iron, copper, and gold confirmed across eight drill holes"
- Slide 3: Use a strong site photo from catalog (team photo or mining operations) — overlay text: "Seeking a Strategic Partner" + "To develop one of the Philippines' most promising polymetallic deposits"
- Each slide has a dark gradient overlay for text readability
- Gold CTA button on each slide: "Explore the Opportunity" → /presentation
- Pagination dots at bottom, matching aboitiz.com's style

**ANNOUNCEMENTS STRIP** — clone their horizontal swiper below the hero:
- Instead of announcements, show KEY METRICS as scrolling cards:
- "5,906 ha Concession" | "9 Independent Labs" | "8 Drill Holes" | "67.31% Fe Iron Ore" | "39.5% Cu Copper" | "20.35 g/t Au Gold" | "21.6M MT Resource"
- Same horizontal swiper pattern, auto-scrolling

**OUR BUSINESSES SECTION → OUR MINERALS**
Clone their `section#build` business card swiper:
- Heading: "A Convergent Evidence Portfolio"
- Subheading: "Nine laboratories. Five countries. One deposit model."
- Swiper with mineral/evidence cards instead of business unit cards:
  - Iron card: `iron-hero-data.png` as background, "67.31% Fe" overlay, "POSCO Confirmed"
  - Copper card: `copper-hero-data.png`, "39.5% Cu", "Near-Concentrate Grade"
  - Gold card: `gold-hero-data.png`, "20.35 g/t Au", "Highest Fire Assay"
  - Evidence card: `evidence-portfolio.png`, "9 Laboratories", "Five Countries"
  - Cross-section card: `cross-section-infographic.png`, "8 Drill Holes", "493m Drilled"
  - Partnership card: `partnership-ecosystem.png`, "Strategic Partnership", "Natural Next Step"
- Same card hover effects as aboitiz.com

**VIDEO/CTA SECTION → PARTNERSHIP CTA**
Clone their `section#__banner` pattern:
- Background: `topo-texture-dark.png` or dark navy gradient
- Heading: "A Partnership Built for This Moment"
- Subtext: Brief partnership description from Doc 02
- CTA button: "View Presentation" → /presentation
- Secondary CTA: "Meet Our AI Advisor" → /advisor

**CTA GRID → QUICK LINKS**
Clone their 6-card CTA grid:
- "The Evidence" → /assets (icon: chart)
- "The Presentation" → /presentation (icon: play)
- "Our Story" → /about (icon: book)
- "Community Impact" → /csr (icon: heart)
- "Leadership" → /team (icon: users)
- "Contact Us" → /contact (icon: mail)
Same grid layout, same card styling with icons and hover effects.

**MEDIA CENTER → CREDENTIALS**
Clone their press release swiper:
- Instead of press releases, show credential/milestone cards:
- "MAEM 2025 Diamond Sponsor" with date
- "SGECS Geological Report Filed with MGB" with date
- "MGB Director ORDER Confirming Operator" with date
- "FPIC Approved by Indigenous Communities" with date
- "8 Drill Holes Completed — 493m Total Depth" with date
- "EM Survey Confirms Porphyry System" with date
Same horizontal swiper, same card format.

**GREAT TRANSFORMATION BANNER → VISION BANNER**
- Full-width `hero-landscape-enhanced.png` with overlay
- "Building for Business to Prosper and Communities to Thrive"
- Tagline: "To Prosper Lives"

**FOOTER**
Clone their footer structure. GMC logo, social links (if any), nav links, copyright 2026, Makati office address.

### PRESENTATION `/presentation`

This is the 8-section scroll experience. Build it using the 8 mockup images as visual references:
- Look at `mockup-02` through `mockup-09` in `public/images/mockups/`
- Each section is full-viewport with scroll-snap
- Use AOS for scroll-triggered animations (same as aboitiz.com)
- Progress bar at top (gold, 4px)
- Keyboard navigation (arrows)
- NO navbar, NO footer on this page
- MUST WORK OFFLINE — all content hardcoded, all images local

Content for each section — read from source documents:

**S1 Opening:** Dark bg + topo texture. "A Partnership Built for This Moment." Metrics: 5,906 ha | 9 Labs | 8 Drill Holes | 493m. Counter animation.

**S2 Opportunity:** Three mineral cards with generated image backgrounds. 67.31% Fe | 39.5% Cu | 20.35 g/t Au. "21.6 million metric tons. From less than 9% explored."

**S3 Alignment:** Two-column partnership diagram. GMC brings vs Partner brings. Connecting lines. "From mining services to mining partnership." NO Aboitiz branding — keep generic.

**S4 Proof:** `cross-section-infographic.png` filling 80% viewport. Dark bg. Fade-in.

**S5 Plan:** Horizontal timeline — 5 phases with diamond decision gates. "Phase 1 commitment only."

**S6 Protection:** Dark bg + topo. "We've Already Thought About Everything You're About to Ask." 3 green + 2 amber status indicators. Data from Doc 04.

**S7 Vision:** `hero-landscape-enhanced.png` full-bleed. "Building for Business to Prosper and Communities to Thrive." "32 years remaining."

**S8 Ask:** Clean white. "The Next Step." Three actions. Two buttons. GMC logo.

### ASSETS `/assets`

Evidence portfolio page for engineers. Use `mockup-10-assets.png` as layout reference.
- Hero: "The Evidence Portfolio"
- Cross-section: `cross-section-infographic.png` full-width
- 9 lab cards in a grid (use Swiper or CSS grid). Data from Doc 09.
- Mineral detail sections: Iron, Copper, Gold
- Volume estimates: 21.6M MT copper + 16.1M MT iron

### ABOUT `/about`

Use `mockup-11-about.png` as reference. Clone ACI's about page layout.
- Hero with operations photo
- Timeline: 2007 → 2012 → 2015 → 2019 → 2022 → 2024 → 2025-26
- Values: "Bringing Precious Ores to the Light," "Caring for Creation," "Work of Human Hands"
- Governance badges: SEC, MPSA, MGB, BOC, PHILEXPORT
- Office: Ayala Tower One, Makati City

### CSR `/csr`

Use `mockup-12-csr.png` as reference.
- Hero: landscape + "Caring for Creation"
- "60% Lumad Indigenous Workforce" metric
- FPIC approved
- Environmental stewardship from Doc 05
- Do NOT include "Antonio Peñalver" text

### TEAM `/team`

Simple. Jett Tupas card — name, President & CEO, styled placeholder. Conference photos from catalog.

### CONTACT `/contact`

Contact form → Supabase `contact_submissions` table.
Offline: show email instead.
Makati office address. No Google Maps dependency.

### ADVISOR `/advisor`

Copy from `web/dashboard/src/app/agent/page.tsx`. Adapt to light theme. External system prompt. Titan voice. Not in main nav. Offline detection.

## AOS ANIMATION PATTERN (same as aboitiz.com)

```jsx
// Initialize AOS in layout
import AOS from 'aos';
import 'aos/dist/aos.css';

useEffect(() => {
  AOS.init({ duration: 800, once: true, offset: 100 });
}, []);

// Use on elements
<div data-aos="fade-up">Content</div>
<div data-aos="fade-up" data-aos-delay="200">Delayed content</div>
```

## SWIPER PATTERN (same as aboitiz.com)

```jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

<Swiper
  modules={[Autoplay, Pagination, Navigation]}
  autoplay={{ delay: 5000, disableOnInteraction: false }}
  pagination={{ clickable: true }}
  loop={true}
  className="hero-swiper"
>
  <SwiperSlide>...</SwiperSlide>
</Swiper>
```

## CRITICAL RULES

1. **Every piece of text** comes from the source documents or lib/content.ts. No placeholder text. No lorem ipsum.
2. **Every image path** points to a real file in public/images/generated/ or public/images/site-photos/.
3. **Every link** goes to a real route. No dead links.
4. **The presentation page** works fully offline. Zero API calls.
5. **Match aboitiz.com's quality.** When in doubt, look at how they did it in the reference HTML/CSS files and do the same thing for our content.

## BUILD ORDER

1. Install Swiper + AOS: `npm install swiper aos @types/aos`
2. NavBar + Footer (clone aboitiz patterns)
3. Homepage (clone aboitiz structure, GMC content)
4. Presentation page (8 scroll sections with mockup references)
5. Assets page
6. About, CSR, Team, Contact
7. Advisor page
8. `npm run build` — fix all errors
9. Test offline on /presentation
10. Deploy to Netlify

Start building. Homepage first — the hero slideshow sets the tone for everything.
