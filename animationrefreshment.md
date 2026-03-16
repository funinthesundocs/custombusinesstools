# Dashboard Animation Refreshment — Read This Before Doing ANYTHING

> **Purpose:** This file brings a new Claude agent completely up to speed on the steampunk dashboard animation project. Read every word before taking any action.

---

## What We Are Building

The RAG Factory dashboard (`web/dashboard`, localhost:3002) has a steampunk baseplate image showing 7 machines connected by pipes. The goal is to **animate the actual machines** — gears rotating, conveyors scrolling, dishes sweeping, press arms stamping. The machines in the baseplate art itself must come alive.

**The baseplate image:** `web/dashboard/public/rag-factory-baseplate.jpg` (2752x1536)
**Original backup:** `RAG Factory Baseplate.jpg` (root directory — NEVER modify this)

---

## HARD RULES — Violate These and You Will Be Fired

1. **NO OVERLAYS.** No SVG effects on top. No cyan glowing outlines. No GSAP particle effects. No badges, labels, or tooltips. No black boxes. NOTHING sitting on top of the baseplate art. The user has screamed about this repeatedly.

2. **NO TEXT on the baseplate.** The user wants ZERO text — no titles, no subtitles, no descriptions. The new baseplate will be regenerated without text. Do NOT attempt pixel-level text removal from the JPEG — multiple attempts failed and damaged the machine art.

3. **SCOPED FIXES ONLY.** When the user reports a problem with ONE machine, fix ONLY that machine. NEVER delete or disable other working machines. This mistake was made (deleted all 7 animations when only 1 was broken) and the user was furious.

4. **The animation engine is Kling AI via PiAPI** (`https://api.piapi.ai/api/v1/task`). Image-to-video. You crop the machine from the baseplate, upload to fal.ai CDN, submit the hosted URL to PiAPI with a motion prompt. Kling animates the ACTUAL art.

5. **Gemini Nano Banana Pro** is available for generating NEW machine illustrations if needed. It is NOT the animation engine — Kling is.

---

## Animation Behavior Rules (User's Explicit Instructions)

These rules govern HOW the machines should animate:

1. **Knowledge Drop (Stage 1):** Papers/documents fly INTO the hopper from above (NOT out of it)
2. **Smaller document fragments** come OUT of Knowledge Drop and flow INTO the Factory
3. **A little robot** comes OUT of the Factory after processing, rides the conveyor belt
4. **The robot rides** under The Question satellite dish, continues along the belt to the Confidence Gate
5. **At the Confidence Gate**, the robot fades out
6. **Robot reappears** coming out of the Factory again (seamless loop)
7. **Conveyor belt:** Constant speed, ALWAYS moving, the ENTIRE loop. No sections stopping while others move. It is one continuous moving loop.
8. **Conveyor direction:** Left to right, with serpentine bends following the pipe network

---

## Current Technical State

### What Exists and Works
- **6 animated MP4 videos** in `web/dashboard/public/animations/`:
  - `knowledge-drop-animated.mp4` (3.1MB)
  - `factory-animated.mp4` (5.4MB)
  - `question-animated.mp4` (4.4MB, crossfaded for smooth loop)
  - `live-data-feeds-animated.mp4` (5.4MB)
  - `confidence-gate-animated.mp4` (3.9MB)
  - `assembly-line-animated.mp4` (4.8MB)
- **Dashboard page** (`web/dashboard/src/app/page.tsx`) renders videos in positioned zones over the baseplate
- **AnimatedMachine component** (`web/dashboard/src/components/pipeline/AnimatedMachine.tsx`) — simple video player
- **MachineOverlay component** (`web/dashboard/src/components/pipeline/MachineOverlay.tsx`) — positioned Link wrapper with CSS mask-image edge feathering
- **No overlays, no badges, no hover boxes** — all stripped

### What Does NOT Work
- **The Delivery (Stage 7):** Kling consistently returns "500 Service busy" for this machine. No video exists yet. Needs retry.
- **Alignment:** Video positions don't perfectly match the baseplate — Kling recomposes scenes when animating, shifting elements. Some videos show displaced machines.
- **Loop smoothness:** Some videos have jerky loop restarts (The Question was fixed with ffmpeg crossfade, others may need it too)
- **Text on baseplate:** The baseplate image has title and subtitle text baked in. Multiple Python attempts to remove it failed and damaged machine art. **The user will provide a new text-free baseplate.**
- **Baseplate currently:** Has been restored to the original (with text). The user plans to regenerate new machines without text.

### What Was Tried and Failed
| Approach | Why It Failed |
|----------|--------------|
| GSAP SVG overlays with cyan outlines | User: "candyland bullshit" — not real animation |
| Nano Banana Pro JPEG gears overlaid | Teal background doesn't match baseplate gradient, visible oval |
| mix-blend-mode: screen on SVGs | Made dark shapes invisible but also made animated gears invisible |
| Rotating JPEG gear images | Wrong size, wrong position, background mismatch |
| Python pixel-level text removal | Keeps damaging machine art, can't distinguish text from art |
| gemini-generate-video | Text-to-video only, no image input parameter |
| Direct Kling API | Account has no balance, must use PiAPI |
| fal.ai layer decomposition | Queued indefinitely on free tier |

---

## API Keys (all in `.env`)

| Key | Service | Status |
|-----|---------|--------|
| `PIAPI_KEY` | PiAPI.ai — unified API for Kling video generation | Working |
| `FAL_KEY` | fal.ai — file upload CDN + Qwen-Image-Layered | Working (CDN), slow queue (GPU) |
| `KLING_ACCESS_KEY` / `KLING_SECRET_KEY` | Direct Kling API | No balance — use PiAPI instead |
| Gemini MCP | 37 tools via `@rlabs-inc/gemini-mcp` | Working — image gen, editing, video |

---

## How to Generate a Machine Animation

```python
# 1. Crop machine from baseplate
from PIL import Image
img = Image.open('web/dashboard/public/rag-factory-baseplate.jpg')
crop = img.crop((left, top, right, bottom)).convert('RGB')
crop.save('machine-crop.jpg', 'JPEG', quality=92)

# 2. Upload to fal.ai CDN
import fal_client, os
os.environ['FAL_KEY'] = '...'  # from .env
url = fal_client.upload_file('machine-crop.jpg')

# 3. Submit to PiAPI (Kling)
import httpx
resp = httpx.post('https://api.piapi.ai/api/v1/task',
    headers={'x-api-key': PIAPI_KEY, 'Content-Type': 'application/json'},
    json={
        'model': 'kling',
        'task_type': 'video_generation',
        'input': {
            'prompt': 'steampunk machine description, flat 2D illustration, locked camera',
            'image_url': url,
            'duration': 5,
        },
    })
task_id = resp.json()['data']['task_id']

# 4. Poll for completion
# GET https://api.piapi.ai/api/v1/task/{task_id}
# When status='completed', download from output.video_url

# 5. Optional: ffmpeg crossfade for smooth loop
# ffmpeg -i input.mp4 -filter_complex "..." -c:v libx264 output.mp4
```

**CRITICAL PiAPI format rules:**
- Use `https://api.piapi.ai/api/v1/task` (unified API)
- Do NOT include `cfg_scale`, `mode`, or `version` params — they cause 500 errors
- `image_url` must be a hosted URL (not base64 data URL) — upload to fal.ai CDN first
- Image must be at least 300px in both dimensions
- Auth header: `x-api-key: {PIAPI_KEY}`

---

## Machine Crop Coordinates (from 2752x1536 baseplate)

| Machine | Crop (left, top, right, bottom) | CSS Position |
|---------|--------------------------------|-------------|
| Knowledge Drop | (50, 30, 550, 480) | left: 1.8%, top: 2.0%, width: 18.2%, height: 29.3% |
| Factory | (700, 20, 1400, 500) | left: 25.4%, top: 1.3%, width: 25.4%, height: 31.2% |
| Question | (1650, 10, 2300, 500) | left: 60.0%, top: 0.7%, width: 23.6%, height: 31.9% |
| Live Data Feeds | (200, 550, 1050, 930) | left: 7.3%, top: 35.8%, width: 30.9%, height: 24.7% |
| Confidence Gate | (1300, 480, 2100, 950) | left: 47.2%, top: 31.2%, width: 29.1%, height: 30.6% |
| Assembly Line | (100, 1000, 1150, 1430) | left: 3.6%, top: 65.1%, width: 38.2%, height: 28.0% |
| Delivery | (1250, 1000, 2450, 1430) | left: 45.4%, top: 65.1%, width: 43.6%, height: 28.0% |

**NOTE:** These coordinates will need to be recalculated if the user provides a new baseplate with different dimensions or layout.

---

## Key Files to Read

1. **This file** — you're reading it
2. `CLAUDE.md` — project-wide instructions, slash commands
3. `VISION.md` — governing intent, 5 principles, eagle view test
4. `.agent/alignment/pearls.md` — hard-won lessons (24 pearls)
5. `web/dashboard/src/app/page.tsx` — the dashboard page with video zones
6. `web/dashboard/src/components/pipeline/MachineOverlay.tsx` — video positioning wrapper
7. `web/dashboard/src/components/pipeline/AnimatedMachine.tsx` — video player component
8. `scripts/animate-all-machines.py` — batch crop + submit script

---

## Next Steps (When User Returns)

1. **User will provide a new text-free baseplate** — new machines without any title/subtitle text
2. **Re-crop all 7 machines** from the new baseplate (coordinates will likely change)
3. **Write new Kling prompts** following the Animation Behavior Rules above (papers INTO hopper, robot riding conveyor, etc.)
4. **Submit all 7 to PiAPI/Kling** for animation
5. **Fix alignment** — ensure video positions match crop coordinates exactly
6. **Fix loops** — ffmpeg crossfade on any video that doesn't loop smoothly
7. **Generate The Delivery** — has failed repeatedly, may need different timing or approach
8. **Iterate visually** — user will send screenshots, fix issues one at a time (SCOPED FIXES ONLY)

---

## Communication Rules (Learned the Hard Way)

- The user is non-technical but extremely visually precise
- They use color-coded screenshots (Red=alignment, Orange=timing, Blue=remove, Green=formatting, Purple=not animated)
- When they say "fix this" with a screenshot of ONE thing, fix ONLY that thing
- Don't plan endlessly — build, show, iterate
- Don't add cyan overlays, GSAP effects, or any decorative layers — they want REAL animation
- Don't try to edit the baseplate JPEG to remove text — it doesn't work
- Don't use base64 data URLs with PiAPI — they cause 500 errors
- Save screenshots they provide — they're the ground truth for what needs fixing
