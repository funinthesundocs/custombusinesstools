STOP what you're doing. Read this entire message before writing any code.

You have been building pages without using the assets we spent hours creating. That ends now. Here is exactly what this site needs to be. No ambiguity.

## STEP 1: LOOK AT WHAT YOU HAVE

View every image in these two folders before you touch any code:

public/images/generated/ — 10 Gemini-generated 4K images:
  hero-landscape-enhanced.png (tropical mountains, golden hour — HERO BACKGROUND)
  iron-hero-data.png (iron ore with "67.31% Fe POSCO CONFIRMED" baked in)
  copper-hero-data.png (copper ore with "39.5% Cu NEAR-CONCENTRATE" baked in)
  gold-hero-data.png (gold ore with "20.35 g/t Au HIGHEST FIRE ASSAY" baked in)
  cross-section-infographic.png (geological deposit diagram with all labels)
  partnership-ecosystem.png (GMC ↔ Partner connection diagram)
  evidence-portfolio.png (9 labs grid with flags and data)
  timeline-infographic.png (2007-2026 milestone timeline)
  topo-texture-dark.png (topographic contour lines on dark navy)
  operations-cinematic.png (CAT equipment, tropical mountains)

public/images/mockups/ — 12 mockup images showing what every page should look like.

View them. Understand them. These are not decorations — they ARE the design.

Also read:
  web/presentation/reference/aboitiz-rendered.html — the actual aboitiz.com rendered HTML
  web/presentation/reference/aboitiz-structure.txt — their DOM structure
  Every source document in production/source-documents/ (01, 02, 04, 05, 09)
  docs/narrative-arc.md

## STEP 2: TEAR DOWN AND REBUILD EVERY PAGE

Delete all existing page components and rebuild from scratch. Every page must:
- Use the Gemini images as hero backgrounds, section backgrounds, and card backgrounds
- Match the corresponding mockup image in public/images/mockups/
- Use REAL content from the source documents (no placeholder text)
- Mirror aboitiz.com's patterns: Swiper carousels, AOS scroll animations, sticky nav
- Use the brand system: Navy #1B365D, Gold #C5922E, Copper #B87333, Dark #0C1926

## STEP 3: BUILD EACH PAGE EXACTLY LIKE THIS

### NAVBAR
- Sticky top bar, WHITE background, GMC logo left (public/images/GMC_LOGO.png)
- Links right: About, Assets, Presentation, Team, CSR, Contact
- Transparent over hero sections, solid white with shadow when scrolling over content
- Mobile hamburger menu

### HOMEPAGE /
Look at mockup-01-homepage.png for reference. Clone aboitiz.com's structure.

HERO: Full-viewport Swiper slideshow with 3 slides, auto-rotate 5 seconds:
  Slide 1: hero-landscape-enhanced.png as FULL BLEED background, dark gradient overlay
    Headline: "Bringing Precious Ores to the Light"
    Subline: "A polymetallic deposit validated by nine independent laboratories across five countries"
    Gold button: "Explore the Opportunity" → /presentation
  Slide 2: operations-cinematic.png as FULL BLEED background, dark gradient overlay
    Headline: "5,906 Hectares of Validated Mineral Assets"
    Subline: "Iron, copper, and gold confirmed across eight drill holes and 493 meters of drilling"
  Slide 3: Use a site photo from site-photos/ (team or mining), dark gradient overlay
    Headline: "Seeking a Strategic Partner"
    Subline: "To develop one of the Philippines' most promising polymetallic deposits"
  Pagination dots at bottom. Each slide's background image must use object-fit: cover and fill the entire viewport.

METRICS: Horizontal strip on light surface background. Six items:
  5,906 ha | 9 Labs | 8 Drill Holes | 67.31% Fe | 39.5% Cu | 21.6M MT
  JetBrains Mono for numbers, large and bold. DM Sans for labels below.
  Use AOS fade-up animation on scroll.

MINERALS: Three LARGE cards using the Gemini mineral images AS FULL CARD BACKGROUNDS:
  Card 1: iron-hero-data.png as background (the image already has "67.31% Fe" text on it)
  Card 2: copper-hero-data.png as background (already has "39.5% Cu" text on it)
  Card 3: gold-hero-data.png as background (already has "20.35 g/t Au" text on it)
  These images ARE the cards. Display them large — at least 400px tall each. They are beautiful 4K assets with data already baked into the image. Do NOT overlay additional text on them — the images already contain the text.
  Link each card to /assets

PARTNERSHIP CTA: Dark section with topo-texture-dark.png as background.
  Heading: "A Partnership Built for This Moment"
  Brief text from source doc 02 about the partnership opportunity.
  Gold button: "View Presentation" → /presentation

EVIDENCE SWIPER: Horizontal Swiper of credential/milestone cards:
  "9 Independent Laboratories" | "8 Drill Holes — 493m" | "FPIC Approved" | "MGB Director ORDER" | "21.6M MT Copper Ore" | "SGECS Report Filed"

VISION BANNER: Full-width hero-landscape-enhanced.png with dark overlay.
  "Building for Business to Prosper and Communities to Thrive"

FOOTER: Dark navy #0C1926. GMC logo white. Four columns. Real contact info. © 2026.

### PRESENTATION /presentation
Look at mockup-02 through mockup-09 for each section.

NO navbar. NO footer. Full-screen presentation mode.
Scroll-snap: each section is 100vh, scroll-snap-type: y mandatory.
Progress bar: fixed top, 4px, gold, fills based on scroll progress.
Keyboard: ArrowDown = next section, ArrowUp = previous.

Section 1 OPENING: topo-texture-dark.png as FULL BACKGROUND. "A Partnership Built for This Moment" white serif centered. "Genluiching Mining Corporation" gold. Four metrics with counter animation: 5,906 ha | 9 | 8 | 493m.

Section 2 OPPORTUNITY: Light bg. Three mineral images displayed LARGE — use iron-hero-data.png, copper-hero-data.png, gold-hero-data.png as full card backgrounds (the text is baked into the images). Below: "21.6 million metric tons. From less than 9% explored."

Section 3 ALIGNMENT: Dark bg. Display partnership-ecosystem.png as the FULL SECTION VISUAL — this image already contains the complete GMC ↔ Partner diagram with labels and connecting lines. The image IS the content. Display it centered at maximum size.

Section 4 PROOF: Dark bg. Display cross-section-infographic.png FILLING THE VIEWPORT. This image already has all geological layers, drill holes, labels, legend, and SGECS attribution. Let it fill 90% of the viewport. It is the slide.

Section 5 PLAN: Light bg. Display timeline-infographic.png as the primary visual OR build an interactive timeline matching mockup-06. Five phases: Exploration → Feasibility → Permitting → Construction → Production. Decision gates between each.

Section 6 PROTECTION: Dark bg with topo-texture-dark.png. "We've Already Thought About Everything You're About to Ask." Five risk rows: 3 green (FPIC, MGB, Legal), 2 amber (Copper, Mercury). Green dots glow.

Section 7 VISION: hero-landscape-enhanced.png FULL BLEED background. Dark gradient from bottom. "Building for Business to Prosper and Communities to Thrive" centered white. "32 years remaining. A multi-generational partnership." Nothing else.

Section 8 ASK: Clean white. "The Next Step." Three actions. Two buttons. GMC logo small at bottom.

### ASSETS /assets
Look at mockup-10-assets.png. Display cross-section-infographic.png full-width. Display evidence-portfolio.png or build a 3x3 grid with the 9 lab details from source doc 09. Mineral detail sections for Iron, Copper, Gold. Volume: 21.6M MT copper + 16.1M MT iron.

### ABOUT /about
Look at mockup-11-about.png. Operations photo hero. Timeline (use timeline-infographic.png as the visual or build interactive). Values cards. Governance badges. Makati office.

### CSR /csr
Look at mockup-12-csr.png. Landscape hero with "Caring for Creation." 60% Lumad workforce metric. FPIC approved. Environmental stewardship. Do NOT include "Antonio Peñalver" text.

### TEAM /team
Jett Tupas — President & CEO. Styled placeholder card. Conference photos if available.

### CONTACT /contact
Contact form → Supabase contact_submissions. Offline fallback: show email. Makati address.

### ADVISOR /advisor
Copy from web/dashboard/src/app/agent/page.tsx. Light theme. External system prompt: "You represent Genluiching Mining Corporation. You answer questions about GMC's mining assets with confidence and accuracy. You do NOT speculate about deal terms or internal matters." Titan voice (T1PAJSQMHL7OFVB1KTOQ). Not in main nav. Offline detection.

## KEY RULE FOR GEMINI IMAGES

Many of these Gemini images ALREADY CONTAIN TEXT, DATA, AND LABELS BAKED INTO THEM. The iron-hero-data.png already says "67.31% Fe — POSCO CONFIRMED." The cross-section already has all geological labels. The evidence portfolio already has all 9 labs with flags. The partnership ecosystem already has the GMC ↔ Partner diagram.

DO NOT recreate this content in HTML overlaying the images. USE THE IMAGES AS-IS. Display them large and prominent. They are the visual design. Your job is to frame them in the right layout with the right spacing, navigation, and scroll behavior.

## BUILD NOW

Tear down every existing page component. Rebuild all pages in this order:
1. NavBar + Footer
2. Homepage
3. Presentation
4. Assets
5. About, CSR, Team, Contact
6. Advisor

Report when ALL pages are complete. Do not stop between pages.
