# DEFINITIVE BUILD PROMPT v3 — Paste into Opus in the Antigravity IDE

---

## WHAT THE RESEARCH TELLS US

Gemini's image models generate IMAGES of websites, not functional code. The proven 2025-2026 workflow is:

1. **Language model PLANS** (you — Opus)
2. **Image model DESIGNS** (Nano Banana Pro — generates visual references)
3. **Coding agent IMPLEMENTS** (Claude Code — builds from those visual references)

We already completed steps 1 and 2. We have 12 mockup images at 4K. They scored 7-10. Now we execute step 3 — but with a twist. Where Claude Code needs more visual guidance for a specific component (the evidence grid, the timeline, a hover state), you send Gemini a quick section-level image generation to create an additional design reference. Gemini stays in its zone of genius (images), Claude Code stays in its zone (code).

---

## YOUR ROLES

**As the Conductor:** You orchestrate the entire build. You read the source documents, prepare the content, write the prompts for Claude Code, and quality-check every page against its mockup.

**As the Gemini Whisperer:** When Claude Code needs more visual guidance for a specific component, you generate an additional reference image from Gemini using the same approach that produced the 12 mockups. Section-level, 100-150 word prompt, creative latitude, mockup as style reference. Feed it to Claude Code as an additional visual target.

**As the Quality Gate:** After Claude Code builds each page, you visually compare it to the mockup. If a section doesn't match, you either iterate with Claude Code directly OR generate a more detailed Gemini reference image for that specific section and feed it back.

---

## READ FIRST

Internalize every data point from these files:

1. `production/source-documents/01-opportunity-brief.md`
2. `production/source-documents/02-strategic-alignment.md`
3. `production/source-documents/04-risk-mitigation.md`
4. `production/source-documents/05-vision-and-impact.md`
5. `production/source-documents/09-technical-assets.md`
6. `docs/narrative-arc.md`
7. `web/presentation/public/images/site-photos/catalog.md`
8. `web/presentation/REDESIGN.md`

---

## PHASE 1: FRAMEWORK SETUP (You build this directly in Claude Code)

```
Set up the Next.js skeleton at web/presentation/:

1. Clean or reinitialize as Next.js 14+ App Router
2. npm install lenis gsap framer-motion lucide-react
3. Configure Tailwind with brand colors:
   --navy: #1B365D; --gold: #C5922E; --copper: #B87333; --dark: #0C1926;
   --surface: #F7F8FA; --success: #34D399; --amber: #F59E0B;
4. next/font loading Playfair Display, DM Sans, JetBrains Mono LOCALLY (no CDN — must work offline)
5. App layout with Lenis smooth scroll:
   const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
   Connect to GSAP ticker in a useEffect.
6. Shared NavBar: fixed, transparent over hero → white+shadow on scroll. GMC logo (public/images/GMC_LOGO.png). Links: About, Assets, Presentation, Team, CSR, Contact.
7. Shared Footer: bg #0C1926, four columns, real GMC contact info from genluiching.com, white logo, © 2026.
8. Route stubs: /, /presentation, /assets, /about, /csr, /team, /contact, /advisor
9. .env.local with Supabase + Anthropic keys from web/dashboard/.env.local
10. Create lib/content.ts — extract key content blocks from each source document into typed exports. Every page component imports real content from here. NO hardcoded strings scattered across components. NO placeholder text.
```

Report when the skeleton is ready. Test `npm run dev`.

---

## PHASE 2: PRESENTATION PAGE (Priority One — goes on projector Thursday)

This is the most important page. Give Claude Code the following prompt. The key difference from v1: Claude Code now has 8 mockup images showing EXACTLY what each section should look like.

```
CRITICAL: Before building, VIEW every mockup image in web/presentation/public/images/mockups/:
- mockup-02-pres-opening.png (Section 1)
- mockup-03-pres-opportunity.png (Section 2)
- mockup-04-pres-alignment.png (Section 3)
- mockup-05-pres-proof.png (Section 4)
- mockup-06-pres-plan.png (Section 5)
- mockup-07-pres-protection.png (Section 6)
- mockup-08-pres-vision.png (Section 7)
- mockup-09-pres-ask.png (Section 8)

These are your VISUAL TARGETS. Each one is a 4K image showing exactly what that section should look like. Match them as closely as possible.

Build the presentation page at /presentation with these specifications:

TECHNICAL:
- 8 full-viewport sections with CSS scroll-snap-type: y mandatory
- Each section: min-height: 100vh, scroll-snap-align: start
- GSAP ScrollTrigger pins each section during scroll
- Gold progress bar fixed at top: 4px height, width = currentSection/8 * 100%
- Section counter fixed bottom-right: "3 / 8" format
- Keyboard: ArrowDown/Space = next section, ArrowUp = previous
- NO footer on this page
- Disable scroll-snap on mobile < 768px
- MUST WORK FULLY OFFLINE — zero API calls, all content hardcoded, all images local

SECTION 1 — Opening (match mockup-02):
Dark background #0C1926 with topo-texture-dark.png as subtle bg.
"A Partnership Built for This Moment" — Playfair Display 72px white, centered.
"Genluiching Mining Corporation" — DM Sans 24px gold #C5922E.
Four metric cards: 5,906 ha | 9 | 8 | 493m with JetBrains Mono numbers.
Numbers animate counting up with Framer Motion whileInView.
Scroll chevron at bottom.

SECTION 2 — Opportunity (match mockup-03):
Light background. Three mineral cards filling the viewport.
Each card uses the generated mineral image as background:
  /images/generated/iron-hero-data.png — overlay "67.31%" massive JetBrains Mono white, "Fe — POSCO CONFIRMED" gold
  /images/generated/copper-hero-data.png — overlay "39.5%" massive white, "Cu — NEAR-CONCENTRATE" copper
  /images/generated/gold-hero-data.png — overlay "20.35 g/t Au" massive white, "HIGHEST FIRE ASSAY" gold
Below: "21.6 million metric tons. From less than 9% explored."
Cards stagger-reveal: initial={{ opacity: 0, y: 30 }}, whileInView={{ opacity: 1, y: 0 }}, delay index * 0.15

SECTION 3 — Alignment (match mockup-04, but NO Aboitiz logo):
Dark background. Two-column partnership diagram.
Left (green): GMC assets — MPSA 5,906 ha, 9-Lab Deposit, Community Trust 60% Lumad, MGB Approved, 15+ Years
Right (gold): Partner assets — AAAA Construction, THPAL Precedent 13 Years, Energy, Data Science, Financial Capacity
SVG connecting lines between columns, animated on scroll using GSAP.
Bottom: "From mining services to mining partnership — the natural next step."

SECTION 4 — Proof (match mockup-05):
Dark background. cross-section-infographic.png fills 80% viewport.
Fade-in on scroll. The image already contains all labels and SGECS attribution.
Keep it simple — let the geology speak.

SECTION 5 — Plan (match mockup-06):
Light background. Horizontal timeline: 5 phases left to right.
Phase 1: Exploration Partnership | Phase 2: Feasibility Study | Phase 3: Permitting | Phase 4: Plant Construction | Phase 5: Production
Gold diamond decision gates between phases: "EVALUATE → COMMIT"
Build as interactive React component with icons for each phase.
Bottom: "Phase 1 commitment only. Decision gates at every stage."

SECTION 6 — Protection (match mockup-07):
Dark background #0C1926 with topo texture.
"We've Already Thought About Everything You're About to Ask" — Playfair Display white.
5 status rows with generous spacing:
  GREEN glow: FPIC Approval — Approved by indigenous communities
  GREEN glow: MGB Operator — Director ORDER confirming GMC
  GREEN glow: Legal Standing — Final court ruling. Cannot be refiled.
  AMBER: Copper at Depth — Sulfide at 60-65m. Phase 1 drilling priority.
  AMBER: Mercury Trace — Identified proactively. Minamata compliance.
Green #34D399, Amber #F59E0B. Green dots get CSS animation: subtle pulse glow.

SECTION 7 — Vision (match mockup-08):
hero-landscape-enhanced.png full-bleed background.
Dark gradient overlay from bottom (80% opacity).
"Building for Business to Prosper and Communities to Thrive" — Playfair Display white, centered.
"32 years remaining. A multi-generational partnership." — DM Sans white/70%.
NOTHING ELSE. Maximum breathing room. GSAP parallax on background image.

SECTION 8 — Ask (match mockup-09):
Clean white. Extreme negative space.
"The Next Step" — Playfair Display 48px navy.
Three items with gold Lucide icons: Phase 1 exploration partnership | Technical team introduction | Joint site assessment
Two buttons: "Download Executive Summary" (hidden until PDF exists) | "Ask Our AI Advisor" (→ /advisor, hidden if !navigator.onLine)
GMC logo small at bottom center.

QUALITY STANDARD: This page goes on a projector in front of the son of a billionaire and a Spanish megaproject engineer. Every pixel matters. Match the mockup images. Use the animations to enhance, not distract. When in doubt, more white space and bigger numbers.
```

After Claude Code builds it, view it in the browser. Compare each section to its mockup image. Score each section 1-10. For any section below 7, iterate with Claude Code directly — describe what's wrong and what the mockup shows.

**If a section needs more visual guidance:** Generate an additional reference image from Gemini at the component level. Use the same API pattern as the mockup generation:

```python
# Example: generating a more detailed reference for just the timeline component
generate_mockup(
    "detail-timeline-component",
    'Close-up view of a horizontal phased timeline UI component on light background. '
    'Five connected phases with gold diamond decision gates between each...',
    [load_gen('timeline-infographic.png'), load_ref('aboitiz')],
)
```

Feed the new detail image to Claude Code: "Here's a closer reference for the timeline component. Match this."

---

## PHASE 3: HOMEPAGE + ASSETS + ABOUT

Same approach. Give Claude Code the mockup references and content from source documents.

```
Build three pages. For each one, VIEW the mockup image first and match it.

HOMEPAGE / (match mockup-01-homepage.png):
[Include specific content extracted from source documents]
[Include the image map — which generated image goes where]
[Include animation specs — counter animations, scroll reveals]
The mockup has garbled body text — replace ALL text with real content from lib/content.ts.
The mineral cards section should use the generated hero images as card backgrounds.

ASSETS /assets (match mockup-10-assets.png):
[Include all 9 lab details from Doc 09]
[Include volume estimates]
Cross-section: use cross-section-infographic.png as primary visual.
Evidence grid: 3x3 expandable cards. Match the grid design from evidence-portfolio.png.
Make it data-rich. Sebastian the engineer spends 20 minutes here.

ABOUT /about (match mockup-11-about.png):
[Include timeline milestones]
[Include values text from genluiching.com]
[Include governance credentials]
The mockup has garbled descriptions — replace with real content.
Build the timeline as an interactive React component, not a static image.
```

Fill in the bracketed sections with ACTUAL content from the source documents before sending to Claude Code.

---

## PHASE 4: CSR + TEAM + CONTACT

```
Build three more pages.

CSR /csr (match mockup-12-csr.png):
[Content from Doc 05 — vision and impact]
"60% Lumad Indigenous Workforce" as bold metric.
FPIC approved status.
Environmental stewardship narrative.
DO NOT include the "Antonio Peñalver" text from the mockup — that was a prompt artifact.

TEAM /team:
Jett Tupas card — name, "President & CEO", styled placeholder silhouette.
Use conference/event photos from site-photos catalog.

CONTACT /contact:
Contact form → Supabase contact_submissions table.
Offline fallback: show email instead of form.
Makati office address. Static map card (no Google Maps API dependency).
```

---

## PHASE 5: AI ADVISOR

```
Build the external-facing AI Advisor at /advisor.
Copy the chat interface from web/dashboard/src/app/agent/page.tsx.
Adapt:
- LIGHT THEME matching the presentation site design system
- External system prompt: "You represent Genluiching Mining Corporation. You answer questions about GMC's mining assets, geological data, and partnership opportunity with confidence and accuracy. You do NOT speculate about deal terms or internal matters. If asked something outside your knowledge, say 'That's a great question — I'll make sure our team follows up with you directly.'"
- ElevenLabs Titan voice (voice_id: T1PAJSQMHL7OFVB1KTOQ)
- Store in external_agent_conversations table
- NOT in main nav — direct URL only
- navigator.onLine check — hide voice, show "Voice requires internet" if offline
```

---

## PHASE 6: FINAL CHECKS + DEPLOY

```
1. npm run build — fix ALL errors
2. Test offline: disconnect network, load /presentation — must render fully with all images and content
3. Test every link — no 404s, no dead buttons
4. Test keyboard navigation on /presentation — arrows advance sections
5. Test scroll animations — counter animations, stagger reveals, parallax
6. Deploy to Netlify: netlify deploy --prod
7. Report the live URL
```

---

## THE GEMINI FEEDBACK LOOP (Use throughout all phases)

At any point during the build, if a section doesn't match its mockup and Claude Code can't get it right through text iteration alone, generate a MORE SPECIFIC reference image from Gemini:

1. Take a screenshot of what Claude Code built
2. Take the mockup image of what it SHOULD look like
3. Send both to Gemini: "The first image is the current implementation. The second is the design target. Generate a new detailed reference image of just [the specific component] that bridges the gap — showing the exact visual treatment needed."
4. Feed the new reference to Claude Code: "Match this more closely."

This feedback loop is the safety net. Gemini's visual intelligence fills gaps that text descriptions can't. Use it as often as needed.

---

## WHAT MAKES THIS v3 DIFFERENT

- **v1 failed** because Claude Code interpreted a TEXT spec and produced flat output
- **v2 (abandoned)** tried to make Gemini write React code — outside its proven strength
- **v3 uses the PROVEN workflow:** Opus plans → Gemini designs (IMAGES) → Claude Code implements from visual references → Gemini generates additional design images when Claude Code needs more guidance
- **The mockup images are the design brief.** Not words describing a design. Actual images of the design.
- **Gemini stays in its lane** (generating images) and Claude Code stays in its lane (writing code)
- **The feedback loop** means visual quality can be iteratively tightened — Gemini generates more detail, Claude Code matches it more closely

Start Phase 1. Report when the skeleton is ready.
