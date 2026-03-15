# Perplexity Deep Research Prompt — 2D Industrial Illustration to Live Animated Dashboard

## Research Objective

I have a high-quality 2D illustrated base plate image (dark-mode industrial steampunk style, ~1920px wide) showing 7 interconnected machines arranged in an S-curve layout. Each machine represents a stage in a data processing pipeline. I need to turn these static illustrated machines into fully animated, looping sequences where the mechanical elements actually move — gears rotating, chains pulling, conveyor belts running, documents falling into funnels, radar dishes sweeping, printing presses stamping.

The final output will be embedded in a React/Next.js web dashboard as the home page.

## What I Need You to Research Exhaustively

### 1. Rive (rive.app) — 2D Interactive Animation
- Can Rive take a 2D illustrated image and turn its elements into interactive, state-driven animations?
- What is the current workflow for importing illustrated assets into Rive and adding bone/skeletal animation or mesh deformation?
- Does Rive have AI-assisted features as of 2025-2026 that accelerate converting static illustrations into animated ones?
- How does Rive's React runtime (`@rive-app/react-canvas`) work? Can animations be triggered by external state (e.g., React state changes)?
- What is the performance profile of Rive animations in a web browser? Can 7 simultaneous Rive canvases run smoothly?
- Pricing and subscription model?

### 2. Kling AI (klingai.com) — AI Video Generation from Image
- Can Kling take a static illustrated image and generate a short looping video where mechanical elements animate?
- What is the quality level for illustrated/artistic content (not photorealistic)?
- Can it do image-to-video with specific motion prompts ("make the gears rotate, make the conveyor belt move")?
- Maximum resolution and duration per generation?
- Can it produce seamless loops suitable for web embedding?
- Pricing?

### 3. Runway Gen-3 / Gen-4 — AI Video from Image
- Same questions as Kling: can it animate specific elements within an illustration?
- How does "Motion Brush" or element-specific motion control work? Can I paint which parts of the image should move and how?
- Quality for illustrated/non-photorealistic content?
- Loop generation capability?
- Pricing?

### 4. Google Veo 2 / Veo 3 — AI Video Generation
- Can Veo take a 2D illustration and animate it with mechanical motion?
- Is it available via API for programmatic generation?
- Quality and control level for illustrated content?
- Availability and pricing as of March 2026?

### 5. Pika Labs — AI Video/Animation
- Image-to-video capabilities for illustrated content?
- Motion control specificity?
- Loop generation?
- Pricing?

### 6. Luma Dream Machine / Ray2
- Same questions: image-to-video from illustration, motion control, loops, pricing?

### 7. Spline (spline.design) — 3D Web Animation
- Can Spline take a 2D illustration and create a 3D parallax/animated version?
- Does it have AI-assisted 3D generation from 2D assets?
- React integration (`@splinetool/react-three-fiber`)?
- Performance for web embedding?
- Can animations be state-driven (triggered by React state)?

### 8. Jitter.video — Motion Design
- Can it animate illustrated assets?
- Export formats (Lottie, video, GIF)?
- Workflow speed for 7 machine animations?

### 9. Haiper AI — Video Generation
- Image-to-video capabilities?
- Quality for non-photorealistic content?
- Pricing?

### 10. PixVerse — AI Video
- Image-to-video from illustrations?
- Motion control?
- Pricing?

### 11. Any Other Emerging Tools (2025-2026)
- Are there ANY new tools, platforms, or techniques released in 2025-2026 specifically designed for converting 2D illustrations into animated sequences for web use?
- Any tools that specifically handle mechanical/industrial animation (gears, conveyors, machinery)?
- Any AI tools that can decompose a flat illustration into layers and auto-rig them for animation?

## The Specific Animation Requirements

For each of the 7 machines in my illustration, I need:

1. **Knowledge Drop (Intake Funnel):** Document icons floating down and being sucked into the funnel. Funnel vibrates slightly. Steam/particles from the intake.

2. **The Factory (Gears & Saws):** Multiple interlocking gears rotating. Saw blades spinning. Conveyor belt moving. Sparks at gear contact points. The most mechanically complex animation.

3. **The Question (Radar/Satellite Dish):** Dish rotating or sweeping. Signal waves emanating. Small data orbs lighting up in the surrounding space.

4. **Confidence Gate (Traffic Light & Gears):** Traffic light switching between green and red. Gauge needle moving. Mechanical gate arm raising/lowering. Gears turning.

5. **Live Data Feeds (Satellite Array):** Multiple satellite dishes with subtle movement. Signal lines pulsing. Small indicator lights blinking on the control panel.

6. **Assembly Line (Conveyor & Processor):** Conveyor belt moving. Components sliding along it. Central processor unit with pulsing lights/energy. Robotic arm movement.

7. **The Delivery (Printing Press):** Press stamping down and up rhythmically. Paper/output emerging. Filing cabinet drawer sliding. Indicator lights.

Plus: **A glowing data particle traveling the S-curve pipes** connecting all 7 machines in sequence.

## Output Format Requirements

The final animations must be embeddable in a React/Next.js web application as:
- Individual looping components (one per machine) OR
- A single full-scene animation
- Must support transparent or matching dark backgrounds (#0a0a0a)
- Must be triggerable/controllable via JavaScript/React state (ideal but not required)
- Must perform well in a browser (no 500MB video files)
- Acceptable formats: Lottie JSON, Rive (.riv), WebM video (with alpha), MP4 (looping), animated SVG, Spline scene, WebGL

## What I Want From This Research

1. **A ranked recommendation** of the best tool/workflow to achieve this, considering:
   - Quality of the animation output
   - Speed of production (I want this done in days, not weeks)
   - Cost
   - Web embedding capability
   - State-driven interactivity (can React control the animation?)

2. **Step-by-step workflow** for the top-recommended approach

3. **Specific prompts or techniques** for getting the best results from AI video/animation tools when working with illustrated (non-photorealistic) mechanical imagery

4. **Any limitations or gotchas** I should know about before starting

5. **Examples or case studies** of similar projects (2D illustration → animated web dashboard) if any exist
