# 2D-to-Animated Pipeline Dashboard — Technical Briefing Document

> **For:** Another Claude instance integrating this tool into the Master Business Agency
> **Generated:** 2026-03-18 from live codebase analysis
> **Codebase:** `C:\Antigravity\Custombusinesstools` (same repo as RAG Factory)

---

## 1. PURPOSE

This is a **2D illustration-to-animated visualization system** that takes a static steampunk-themed baseplate image (a hand-crafted 2752×1536 JPEG of 7 interconnected industrial machines) and brings each machine to life using **Kling AI image-to-video generation**. The result is an animated operational dashboard for the RAG Factory — each machine represents a stage in the RAG pipeline (document ingestion → chunking → query → confidence gating → data feeds → assembly → delivery), and the animations show gears rotating, conveyors scrolling, dishes sweeping, and presses slamming in the actual art style of the illustration. This is NOT overlay effects or synthetic particles — it's the real 2D art animated into video. The system also includes hand-crafted GSAP/SVG fallback components for interactive state-driven elements and a particle connector system linking all machines.

**What problem it solves:** Transforms a static operations dashboard into an immersive, living visualization where operators can see the RAG pipeline "working" at a glance. Each machine's animation conveys pipeline stage activity. The approach eliminates the need for 3D modeling — instead, it uses AI video generation to animate 2D illustrated art directly.

---

## 2. ARCHITECTURE

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) + TypeScript | Dashboard web app at localhost:3002 |
| **Styling** | Tailwind CSS + custom CSS | Layout, positioning, edge feathering |
| **Animation (Primary)** | Kling AI via PiAPI REST API | Image-to-video: 2D crops → 5s animated MP4s |
| **Animation (Fallback)** | GSAP 3 + `@gsap/react` useGSAP hook | SVG gear rotation, conveyor scrolling, particle effects |
| **Particle Connector** | SVG `<animateMotion>` or GSAP MotionPathPlugin | S-curve orb paths linking machines |
| **Image Hosting** | fal.ai CDN | Upload cropped images for Kling API input |
| **Video Post-processing** | ffmpeg | Crossfade for seamless MP4 loops |
| **Image Processing** | Python PIL | Crop individual machines from baseplate |
| **State/Data** | React useState + Supabase polling (15s interval) | Health, tasks, conversations, file counts |
| **Charting** | Recharts | Data visualization (unused in pipeline view) |

### File/Folder Structure

```
Custombusinesstools/
├── web/dashboard/
│   ├── public/
│   │   ├── rag-factory-baseplate.jpg          # 2752×1536 steampunk baseplate (background)
│   │   └── animations/
│   │       ├── knowledge-drop-animated.mp4     # Stage 1: docs flowing into funnel (3.2MB)
│   │       ├── factory-animated.mp4            # Stage 2: gears + conveyor (5.3MB)
│   │       ├── question-animated.mp4           # Stage 3: radar sweep (1.3MB, crossfaded loop)
│   │       ├── live-data-feeds-animated.mp4    # Stage 4: console + LEDs (5.3MB)
│   │       ├── confidence-gate-animated.mp4    # Stage 5: gate + gauge (3.9MB)
│   │       ├── assembly-line-animated.mp4      # Stage 6: conveyor + robot arm (4.7MB)
│   │       └── (delivery-animated.mp4)         # Stage 7: MISSING — Kling API "500 Service busy"
│   │
│   └── src/
│       ├── app/page.tsx                        # Main dashboard: stage definitions, video paths, data fetch
│       └── components/pipeline/
│           ├── AnimatedMachine.tsx              # HTML5 <video> wrapper (autoplay, loop, muted)
│           ├── MachineOverlay.tsx               # CSS absolute positioning + mask-image edge feathering
│           ├── FactoryMachine.tsx               # SVG: 3 gears + saw blades + conveyor + sparks (GSAP)
│           ├── GateMachine.tsx                  # SVG: gauge needle + traffic light (REACTIVE to props)
│           ├── RadarMachine.tsx                 # SVG: dish sweep + signal waves + data orbs (GSAP)
│           ├── FunnelMachine.tsx                # SVG: document tumble + steam particles (GSAP)
│           ├── PressMachine.tsx                 # SVG: press arm slam/rise + paper output (GSAP)
│           ├── AssemblyMachine.tsx              # SVG: conveyor + robot arm pick-place (GSAP)
│           ├── SatelliteMachine.tsx             # SVG: 3 dishes + LED panel + signal lines (GSAP)
│           ├── SCurvePulse.tsx                  # SVG native <animateMotion> particle connector
│           ├── SCurveParticle.tsx               # GSAP MotionPath particle connector (alternative)
│           ├── RotatingGear.tsx                 # CSS-animated gear image overlay (deprecated)
│           ├── StageOverlay.tsx                 # Stage label/metric overlay
│           ├── MobileStageCard.tsx              # Mobile-responsive card layout
│           └── ResearchIndicator.tsx            # Status indicator
│
├── scripts/
│   └── animate-all-machines.py                 # Full pipeline: crop → fal.ai upload → PiAPI/Kling → poll → download
│
├── docs/
│   ├── animation-assets/
│   │   ├── svg/                                # 9 extracted SVG machine assets (for reference/fallback)
│   │   │   ├── machine-1-funnel.svg (684KB)
│   │   │   ├── machine-2-factory.svg (1.8MB)
│   │   │   ├── machine-3-radar.svg (304KB)
│   │   │   ├── machine-4-gate.svg (839KB)
│   │   │   ├── machine-5-satellite.svg (42KB)
│   │   │   ├── machine-6-assembly.svg (200KB)
│   │   │   ├── machine-7-press.svg (339KB)
│   │   │   ├── machine-8-pipes.svg (304KB)
│   │   │   └── machine-9-background.svg (86KB)
│   │   └── machine-videos/                     # Cropped source images for Kling input
│   ├── animation-execution-plan.md
│   ├── perplexity-animation-research-prompt.md
│   └── opus-animation-build-prompt.md
│
├── RAG Factory Baseplate.jpg                   # BACKUP — never modify
├── EpicDash Reference 1.jpg                    # Design mockup reference
├── EpicDash Reference 2.jpg                    # Design mockup reference
├── badanimation.jpg / badanimation2-4.jpg      # Failed approach screenshots (lessons learned)
├── animationrefreshment.md                     # CRITICAL: current state, rules, API workflow, next steps
├── "Animating a 2D Industrial Steampunk Dashboard...md"   # Tool comparison guide (38KB)
└── "Automating the Illustration-to-Animated-SVG Pipeline...md"  # Automation pipeline spec (34KB)
```

### Data Flow: 2D Static Image → Animated Dashboard

```
BASEPLATE IMAGE (2752×1536 steampunk JPEG)
    │
    ├── Python PIL crop (7 machines at documented pixel coordinates)
    │   └── Output: 7 individual machine JPEG crops
    │
    ├── fal.ai CDN upload (each crop → hosted URL)
    │
    ├── PiAPI/Kling submission (hosted URL + motion prompt → 5s video)
    │   ├── Model: kling
    │   ├── Task type: video_generation
    │   ├── Duration: 5 seconds
    │   ├── Aspect ratio: 16:9
    │   └── Prompt: hand-crafted per machine (e.g., "gears rotating clockwise,
    │               conveyor belt scrolling left, sparks at contact points")
    │
    ├── Poll PiAPI every 10s until status == "completed" (2–5 min typical)
    │
    ├── Download MP4 from output.video_url
    │
    ├── Optional: ffmpeg crossfade for seamless loop
    │
    └── Place in web/dashboard/public/animations/
        │
        └── Rendered in React:
            <MachineOverlay position={{left, top, width, height}}>
              <AnimatedMachine src="/animations/factory-animated.mp4" />
            </MachineOverlay>
            │
            └── Layered on baseplate via CSS absolute positioning
                with mask-image edge feathering for seamless blend
```

---

## 3. CAPABILITIES

### What Types of 2D Images It Can Process
- **Illustrated JPEG/PNG baseplate images** — any hand-crafted or AI-generated illustration
- **Individual machine crops** — extracted from baseplate at specific pixel coordinates
- **Any 2D art style** — Kling handles illustrated, photorealistic, painterly, etc.
- **Ideal input**: high-detail illustration with identifiable mechanical elements (gears, belts, dishes, gauges)

### What Kind of Animations It Generates

| Animation Type | Method | Example |
|---------------|--------|---------|
| **Mechanical motion** | Kling image-to-video | Gears rotating, press arms slamming, conveyor belts scrolling |
| **Sweeping/oscillating** | Kling image-to-video | Radar dishes sweeping, satellite dishes tracking |
| **Particle/flow effects** | Kling + GSAP fallback | Documents flowing into funnels, sparks, steam, data orbs |
| **State-driven gauges** | GSAP SVG (React props) | Confidence gauge needle reacting to pipeline score |
| **Status indicators** | GSAP SVG (React props) | Traffic light changing red/green based on research status |
| **Connective data flow** | SVG animateMotion / GSAP MotionPath | Glowing orbs traveling S-curve paths between machines |

### Output Formats
- **MP4 video** — 5-second clips, ~1–5MB each, HTML5 `<video>` playback
- **Looping video** — ffmpeg crossfade applied for seamless loops
- **React SVG components** — interactive GSAP-animated fallbacks
- **Composite dashboard** — all machines layered over baseplate in browser

### Customization Available
- **Per-machine motion prompts** — fully customizable text describing desired animation
- **Positioning** — CSS percentage coordinates map any crop to any baseplate
- **Edge feathering** — CSS mask-image gradient controls blend zone
- **GSAP parameters** — duration, easing, rotation speed, particle count all tunable
- **Reactive state** — GateMachine accepts `confidence` (0–100) and `isResearching` boolean props
- **Color scheme** — Cyan primary, teal secondary, amber accent (Tailwind classes)
- **Video duration** — Kling supports 5s or 10s clips

---

## 4. INTEGRATION POINTS

### How Another System Would Programmatically Trigger Animation Generation

The pipeline is scripted in `scripts/animate-all-machines.py`:

```python
# 1. Crop machine from baseplate
from PIL import Image
baseplate = Image.open("web/dashboard/public/rag-factory-baseplate.jpg")
crop = baseplate.crop((x1, y1, x2, y2))  # pixel coordinates per machine
crop.save("machine-crop.jpg")

# 2. Upload to fal.ai CDN
import requests
response = requests.post("https://fal.ai/upload", files={"file": open("machine-crop.jpg", "rb")},
                         headers={"Authorization": f"Key {FAL_KEY}"})
hosted_url = response.json()["url"]

# 3. Submit to PiAPI/Kling
task = requests.post("https://api.piapi.ai/api/v1/task", json={
    "model": "kling",
    "task_type": "video_generation",
    "input": {
        "image_url": hosted_url,
        "prompt": "gears rotating clockwise, conveyor belt scrolling left to right, sparks at contact points, mechanical industrial motion",
        "duration": 5,
        "aspect_ratio": "16:9"
    }
}, headers={"X-API-Key": PIAPI_KEY})
task_id = task.json()["task_id"]

# 4. Poll until complete
while True:
    status = requests.get(f"https://api.piapi.ai/api/v1/task/{task_id}",
                          headers={"X-API-Key": PIAPI_KEY}).json()
    if status["status"] == "completed":
        video_url = status["output"]["video_url"]
        break
    time.sleep(10)

# 5. Download and place
video = requests.get(video_url)
with open("web/dashboard/public/animations/machine-animated.mp4", "wb") as f:
    f.write(video.content)
```

**Cost per machine**: ~$0.14–$0.28 (Kling via PiAPI)
**Cost per full 7-machine batch**: ~$1–$2
**Processing time**: 2–5 minutes per machine

### Inputs and Outputs

| Input | Format | Source |
|-------|--------|--------|
| Baseplate image | JPEG/PNG (any resolution) | Illustration tool or AI generation |
| Crop coordinates | Pixel tuples (x1, y1, x2, y2) | Documented in animationrefreshment.md |
| Motion prompts | Natural language text | Hand-crafted per machine type |
| Pipeline state data | JSON from Supabase | Polled every 15s via /api/admin/* endpoints |

| Output | Format | Destination |
|--------|--------|-------------|
| Animated machine videos | MP4 (5s, looping) | web/dashboard/public/animations/ |
| Interactive SVG machines | React components (TSX) | web/dashboard/src/components/pipeline/ |
| Composite dashboard | Browser render | localhost:3002 |

### MCP Server Ecosystem (Documented, Not All Implemented)
- `krea-mcp` — unified Kling/Runway/Pika/Veo interface
- `@genwave/svgmaker-mcp` — SVG generation/editing
- `mcp-video-gen` — video generation wrapper
- Gemini MCP (`@rlabs-inc/gemini-mcp`) — 37 tools including `gemini-generate-image` for new illustrations

---

## 5. MARKETING APPLICATION

### What's Possible Today (Production-Ready)

**Static photos → animated social media content:**
- Take any static product/location photo
- Crop key elements (a building, a vehicle, a landscape feature)
- Submit to Kling via PiAPI with motion prompt ("camera slowly pans left, water ripples, clouds drift")
- Get 5-second animated video clip
- Cost: ~$0.14–$0.28 per clip, 2–5 minutes processing

**Static illustration → animated website hero:**
- Commission or generate a steampunk/illustrated scene
- Decompose into sections, animate each via Kling
- Layer animated MP4s over static baseplate in browser
- CSS mask-image for seamless edge blending
- Result: living, breathing hero section that's NOT a standard video embed

**Dashboard/infographic animation:**
- Any illustrated infographic or process diagram
- Crop each section → animate → reassemble in browser
- Add interactive GSAP elements (gauges, indicators) driven by live data
- Result: data visualization that responds to real metrics

### What Would Need to Be Built for Full Marketing Pipeline

1. **Batch automation** — the Python script exists but is manual; needs a queue system for processing multiple images/campaigns
2. **Prompt library** — motion prompt templates per content type (product showcase, destination preview, team/office, event highlight)
3. **Loop optimization** — ffmpeg crossfade is manual; needs automated detection of loop points
4. **Format export** — currently outputs MP4; would need GIF, WebP, vertical 9:16 for Stories/Reels
5. **Template system** — pre-built baseplate layouts for common use cases (product page hero, destination card, team showcase)

---

## 6. CURRENT STATE

### Production-Ready ✅
- **6 of 7 animated MP4 videos** generated, positioned, and looping on dashboard
  - Knowledge Drop (documents flowing into funnel)
  - Factory (gears rotating, conveyor scrolling)
  - Question (radar dish sweeping, signal waves — smooth crossfaded loop)
  - Live Data Feeds (console with scrolling data, LEDs blinking)
  - Confidence Gate (traffic light, gauge, gate mechanism)
  - Assembly Line (conveyor, robot arm, processor glow)
- **9 SVG machine components** with GSAP animations (fallback/interactive)
- **GateMachine** has reactive state driven by props (confidence gauge, research indicator)
- **S-curve particle connector** linking all machines
- **CSS mask-image edge feathering** for seamless video-to-baseplate blending
- **Dashboard data integration** — polling Supabase every 15s for health/task/conversation metrics
- **Full Python pipeline script** for crop → upload → generate → download

### Not Working ❌
- **Delivery machine (Stage 7) video** — Kling API consistently returns "500 Service busy"
- **Baseplate has baked-in text** — title/subtitle text needs removal (user will provide text-free regeneration)

### Known Limitations
- **Kling recomposes scenes slightly** — animated machines may shift elements from original crop; requires visual QA
- **Loop smoothness varies** — only Question video has ffmpeg crossfade; others may need it
- **No interactive state control beyond GateMachine** — other machines don't pause/play based on pipeline activity
- **Manual crop coordinates** — changing baseplates requires re-measuring pixel positions
- **fal.ai layer decomposition** (Qwen-Image-Layered) queues indefinitely on free tier — needs paid or local GPU
- **Direct Kling API** has no balance — must use PiAPI aggregator

### Processing Time & Resources
- **Per machine**: 2–5 minutes (Kling generation) + seconds (crop, upload, download)
- **Full 7-machine batch**: ~15–35 minutes
- **Cost**: $1–$2 per full batch via PiAPI
- **Storage**: ~25MB total for all 7 MP4 videos
- **Runtime**: Standard browser, no GPU needed for playback (HTML5 video)

---

## 7. THE 7 MACHINES (Pipeline Stages)

| # | Machine | Component | Animation | Status | Interactive |
|---|---------|-----------|-----------|--------|-------------|
| 1 | Knowledge Drop | FunnelMachine.tsx | Documents fly INTO hopper, steam rises | ✅ MP4 | No |
| 2 | The Factory | FactoryMachine.tsx | 3 gears rotate (tooth-count ratios), conveyor scrolls, sparks burst | ✅ MP4 | No |
| 3 | The Question | RadarMachine.tsx | Dish sweeps ±40°, signal waves expand, data orbs pulse | ✅ MP4 (crossfaded) | No |
| 4 | Live Data Feeds | SatelliteMachine.tsx | Console scrolls, LEDs blink, dishes oscillate | ✅ MP4 | No |
| 5 | Confidence Gate | GateMachine.tsx | Gate gears spin, gauge needle reacts to confidence score | ✅ MP4 | YES (confidence prop, isResearching prop) |
| 6 | Assembly Line | AssemblyMachine.tsx | Conveyor scrolls, components travel, robot arm picks/places | ✅ MP4 | No |
| 7 | The Delivery | PressMachine.tsx | Press arm slams (0.2s down, 1.2s up), paper output, badges pop | ❌ Missing | No |

### Animation Behavior Rules (User's Explicit Directives)
1. Papers/documents fly INTO the hopper (not out)
2. Smaller fragments come OUT of Knowledge Drop, flow INTO Factory
3. Little robot emerges from Factory, rides conveyor belt
4. Robot rides under Question satellite dish, continues to Confidence Gate
5. Robot fades out at Confidence Gate
6. Robot reappears coming out of Factory (seamless loop)
7. Conveyor belt: constant speed, always moving, entire loop — no sections stopping

---

## 8. FAILED APPROACHES (LESSONS LEARNED)

| Approach | Why It Failed | Lesson |
|----------|---------------|--------|
| GSAP SVG overlays with cyan outlines | User: "candyland bullshit" — decorative, not real animation | Real art animation > synthetic effects |
| JPEG gear images (Nano Banana Pro) | Teal background didn't match baseplate gradient; visible oval artifact | Style mismatch breaks immersion |
| `mix-blend-mode: screen` on SVGs | Made dark shapes AND animated elements invisible | Blend modes are unpredictable on complex art |
| Rotating JPEG gear images via CSS | Wrong size, wrong position, background mismatch | Raster rotation + manual positioning is fragile |
| Python pixel-level text removal | Repeatedly damaged machine art in JPEG | Text removal from complex illustrated art doesn't work |
| `gemini-generate-video` | Only supports text-to-video, no image input | Wrong tool — need image-to-video |
| Direct Kling API (non-PiAPI) | Account had no balance | Must use PiAPI aggregator |
| fal.ai Qwen-Image-Layered | Queued indefinitely on free tier | Need paid tier or local GPU |

### HARD RULES (Non-Negotiable)
1. **NO OVERLAYS** — nothing sits on top of baseplate art (no SVG effects, no badges, no labels)
2. **NO TEXT on baseplate** — zero text rendered on the illustration
3. **SCOPED FIXES ONLY** — when one machine is broken, fix ONLY that machine; never touch others
4. **Animation engine is Kling AI via PiAPI** — not GSAP overlays, not Nano Banana Pro
5. **Gemini Nano Banana Pro** is for generating NEW illustrations only, not animating existing ones

---

## 9. PROPOSED AUTOMATION PIPELINE (Documented, Not Yet Built)

The repo contains detailed specs for a fully automated 4-step pipeline:

### Step 1: Layer Decomposition
- **Tool**: Qwen-Image-Layered (via fal.ai API) — ~$0.02/megapixel
- **Input**: Full baseplate image
- **Output**: 8 RGBA layers (one per machine + pipes + background)

### Step 2: Vectorization
- **Tool**: VTracer CLI (free, local) or vectorizer.ai API ($0.14–$0.20/image)
- **Input**: RGBA layer PNGs
- **Output**: SVGs with `<path>` elements

### Step 3: AI Video Generation
- **Tool**: Kling via PiAPI ($0.14–$0.28 per 5s clip)
- **Input**: Cropped image + motion prompt
- **Output**: MP4 video

### Step 4: SVG ID Injection
- **Tool**: Custom Python + lxml
- **Input**: Raw SVG paths
- **Output**: Semantically labeled SVGs (`id="gear-1"`, `id="belt-main"`)
- **Enhancement**: LLM-augmented classification for ambiguous shapes

**Total cost per full run**: $1.14–$3.40
**Available MCP servers**: krea-mcp (unified video), @genwave/svgmaker-mcp (SVG editing), Rendervid

---

*This briefing was generated from live codebase analysis on 2026-03-18. All file paths, component names, and capabilities reflect the current state of the animation system within the RAG Factory dashboard.*
