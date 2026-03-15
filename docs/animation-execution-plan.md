# Animated Pipeline Dashboard — Complete Execution Plan

> Every prompt is pre-written. Every step is sequenced. Follow in order.

---

## Prerequisites (One-Time Setup)

### Create These Accounts Before Starting:

1. **KomikoAI** — https://komiko.ai — Free tier. AI layer decomposition.
2. **vectorizer.ai** — https://vectorizer.ai — Free tier. Raster-to-SVG conversion.
3. **Kling AI** — https://klingai.com — Subscribe ($10/month). Image-to-video for reference clips.
4. **GSAP** — Free, installed via npm. No account needed.

### You Already Have:
- Base plate image at `web/dashboard/public/rag-factory-baseplate.jpg`
- React/Next.js dashboard at `web/dashboard/`
- The other Opus in Antigravity IDE

---

## PHASE 1: Layer Decomposition (15 min)

### Step 1.1 — Upload to KomikoAI

1. Go to https://komiko.ai
2. Upload `C:\Antigravity\Custombusinesstools\web\dashboard\public\rag-factory-baseplate.jpg`
3. Request decomposition into these layers:
   - Layer 1: Knowledge Drop machine (top-left funnel/hopper)
   - Layer 2: The Factory machine (top-center gears/saws)
   - Layer 3: The Question machine (top-right radar dish)
   - Layer 4: Confidence Gate machine (middle-right traffic light/gears)
   - Layer 5: Live Data Feeds machine (middle-left satellite array)
   - Layer 6: Assembly Line machine (bottom-left conveyor/processor)
   - Layer 7: The Delivery machine (bottom-right printing press)
   - Layer 8: Pipe network (all connecting pipes/conveyor tracks)
   - Layer 9: Background (dark gradient, cyan glow, all text labels)
4. Download all layers as separate RGBA PNGs
5. Save them to `C:\Antigravity\Custombusinesstools\docs\animation-assets\layers\`

### Step 1.2 — If KomikoAI Can't Cleanly Separate the Machines

Give this to the other Opus:

> Look at the image at `C:\Antigravity\Custombusinesstools\web\dashboard\public\rag-factory-baseplate.jpg`. Identify the pixel bounding box (x, y, width, height) for each of the 7 machines and the pipe network. Output a JSON array with labels. Then use those coordinates to crop the image into 9 separate RGBA PNG files and save them to `C:\Antigravity\Custombusinesstools\docs\animation-assets\layers\`. Name them: `layer-1-funnel.png`, `layer-2-factory.png`, `layer-3-radar.png`, `layer-4-gate.png`, `layer-5-feeds.png`, `layer-6-assembly.png`, `layer-7-delivery.png`, `layer-8-pipes.png`, `layer-9-background.png`.

Continue to Phase 2 once you have 9 layer PNGs.

---

## PHASE 2: SVG Conversion (30 min)

### Step 2.1 — Convert Machine Layers to SVG

For each of the 7 machine layer PNGs:

1. Go to https://vectorizer.ai
2. Upload each machine layer PNG one at a time
3. Download as SVG
4. Save to `C:\Antigravity\Custombusinesstools\docs\animation-assets\svg\`

Name them: `machine-1-funnel.svg`, `machine-2-factory.svg`, `machine-3-radar.svg`, `machine-4-gate.svg`, `machine-5-feeds.svg`, `machine-6-assembly.svg`, `machine-7-delivery.svg`, `pipes.svg`

### Step 2.2 — Clean Up SVGs with Gemini

The auto-vectorized SVGs will not have named element IDs needed for GSAP animation. Give this prompt to the other Opus to have Gemini clean them up and add proper IDs:

> Read all SVG files in `C:\Antigravity\Custombusinesstools\docs\animation-assets\svg\`. For each one, add semantic `id` attributes to every element that will be animated. Use these exact IDs:
>
> **machine-1-funnel.svg:** `funnel-body`, `funnel-mouth`, `doc-1` through `doc-5` (document icons above funnel), `steam-vent`, `steam-1` through `steam-6` (particle circles for steam)
>
> **machine-2-factory.svg:** `gear-large` (set transform-origin="center"), `gear-medium` (transform-origin="center"), `gear-small` (transform-origin="center"), `saw-1`, `saw-2`, `conveyor-belt` (the horizontal belt path — make it a dashed stroke if not already), `spark-1` through `spark-8` (small shapes at gear contact points)
>
> **machine-3-radar.svg:** `dish-body` (transform-origin="bottom center"), `dish-mount`, `wave-1` through `wave-4` (concentric signal arcs), `orb-1` through `orb-10` (small data orb circles), `monitor`
>
> **machine-4-gate.svg:** `lens-red`, `lens-yellow`, `lens-green`, `gauge-body`, `gauge-needle` (transform-origin at base), `gate-arm` (transform-origin at hinge), `gate-gear-1`, `gate-gear-2`
>
> **machine-5-feeds.svg:** `dish-a`, `dish-b`, `dish-c` (transform-origin="bottom center"), `led-1` through `led-15`, `signal-1` through `signal-6`, `mixer`
>
> **machine-6-assembly.svg:** `assembly-belt` (dashed stroke), `component-1` through `component-4`, `processor-body`, `processor-glow`, `robot-arm`, `screen-1`, `screen-2`
>
> **machine-7-delivery.svg:** `press-arm` (transform-origin at top), `press-base`, `output-1` through `output-3`, `cabinet`, `cabinet-drawer`, `badge-1` through `badge-3`
>
> If any SVG is too messy from auto-vectorization (distorted paths, artifacts), regenerate it from scratch as a clean dark-mode steampunk mechanical illustration using these specs: fills in dark grays (#1a1a1a to #2a2a2a), accent strokes in cyan (#22D3EE) and teal (#14B8A6). Save all cleaned SVGs back to the same directory.

Continue to Phase 3 once all 7 SVGs have proper element IDs.

---

## PHASE 3: Animation Reference Clips (30 min)

### Step 3.1 — Generate Kling AI Reference Videos

Go to https://klingai.com. For each machine, upload the corresponding layer PNG and use the prompt below. Generate a 5-second clip for each. These clips are the motion reference that the other Opus will use to match timing and feel in the GSAP code.

Save all clips to `C:\Antigravity\Custombusinesstools\docs\animation-assets\reference-clips\`

**Machine 1 — Funnel:**
> Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. Small document papers float downward and are drawn into the funnel opening. The funnel vibrates subtly. Wisps of steam rise from the top vent. Cyan accent lighting pulses at the funnel mouth. Seamless loop. No camera movement.

**Machine 2 — Factory Gears:**
> Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. Three interlocking brass gears rotate — the large gear turns slowly clockwise, the medium gear turns counterclockwise at matching speed, the small gear spins fast clockwise. Two circular saw blades spin rapidly. A conveyor belt moves from left to right carrying small metal components. Bright orange sparks flash briefly at gear contact points. Seamless loop. No camera movement.

**Machine 3 — Radar Dish:**
> Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. A radar satellite dish slowly sweeps back and forth through a 90-degree arc. Cyan signal wave arcs pulse outward from the dish tip, expanding and fading. Small glowing cyan data orbs flicker on and off in the surrounding space, with 2-3 being pulled toward the dish by magnetic attraction. A small monitor screen on the base shows a waveform pulse. Seamless loop. No camera movement.

**Machine 4 — Traffic Light Gate:**
> Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. A traffic light switches from red to green — the green lens flares brightly with a soft glow. A mechanical gauge needle swings from the left red zone to the right green zone. A gate arm barrier raises slowly. Small gears at the base rotate. Seamless loop. No camera movement.

**Machine 5 — Satellite Array:**
> Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. Three satellite dishes make subtle oscillating movements. Thin cyan signal lines pulse downward from the dishes to a central receiver box. A panel of 15 small LED indicators blinks in a staggered pattern — some cyan, some dim. The central mixer box has a subtle energy glow. Seamless loop. No camera movement.

**Machine 6 — Assembly Line:**
> Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. A conveyor belt moves from left to right, carrying small rectangular components. The components slide along and converge at a central processor unit. The processor pulses with golden-cyan energy — a bright core glow that throbs rhythmically. A robotic arm makes a subtle repetitive motion. Two small screens display scrolling data. Seamless loop. No camera movement.

**Machine 7 — Printing Press:**
> Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. A heavy industrial press arm stamps downward quickly, pauses at the bottom for a beat, then rises slowly. On each stamp, a sheet of paper with cyan text slides out from beneath the press into an output tray. Small cyan badge tags pop onto the paper. A filing cabinet drawer on the right glows amber briefly and slides shut. Seamless loop. No camera movement.

Continue to Phase 4 once all 7 reference clips are saved.

---

## PHASE 4: Build the Animated Dashboard

### Step 4.1 — Give this to the other Opus in Antigravity IDE:

> Read and execute `.agent/alignment/protocols/boot.md` first.
>
> Then read `C:\Antigravity\Custombusinesstools\docs\opus-animation-build-prompt.md` and execute it.

That file contains the complete build spec: GSAP install, component architecture, exact animation specs for every machine element, API endpoints, overlay metrics, clickable links, hover behavior, mobile fallback, and CSS keyframes.

The reference video clips at `docs/animation-assets/reference-clips/` show how each machine should move. Match the timing and feel in your GSAP code.

The SVG files at `docs/animation-assets/svg/` are the source shapes. Inline them into the React components so GSAP can target elements by ID.

Let the other Opus work. It has everything it needs.

---

## PHASE 5: Review and Ship

### Step 5.1 — Review on localhost:3002

Open your browser to http://localhost:3002. Check every item:

- [ ] All 7 machines have visible animations (gears spinning, belt moving, documents falling, dish sweeping, press stamping)
- [ ] The S-curve particle orb travels the full pipe path continuously
- [ ] Clicking each machine navigates to the correct dashboard page
- [ ] Live metrics display on each zone (file count, vector count, conversations)
- [ ] Traffic light reflects actual research task status (green when no pending tasks, red when researching)
- [ ] Hover over any machine shows tooltip and brightens the glow
- [ ] Resize browser below 1024px width — card list fallback appears
- [ ] Animations run at 60fps with no stutter

### Step 5.2 — Report Issues

Come back to this Claude Code CLI session. Tell me what needs fixing. I will make targeted code fixes directly.

### Step 5.3 — Commit

Tell me to commit. I stage and push.

---

## Your Steps (In Order, No Decisions)

| Step | What You Do | Time |
|------|-------------|------|
| 1 | Create accounts: KomikoAI, vectorizer.ai, Kling AI | 10 min |
| 2 | Upload base plate to KomikoAI → download 9 layer PNGs → save to `docs/animation-assets/layers/` | 15 min |
| 3 | Upload each machine layer to vectorizer.ai → download 8 SVGs → save to `docs/animation-assets/svg/` | 30 min |
| 4 | Give the SVG cleanup prompt (Phase 2, Step 2.2) to the other Opus | 2 min |
| 5 | Upload each machine layer to Kling AI with the prompts above → download 7 reference clips → save to `docs/animation-assets/reference-clips/` | 30 min |
| 6 | Give the build prompt (Phase 4, Step 4.1) to the other Opus. Walk away. | 2 min |
| 7 | Review at localhost:3002. Report issues to me. I fix. You approve. I commit. | 15 min |

**Total your active time: ~1 hour 45 minutes.**
**Total elapsed including AI processing: ~3-4 hours.**
