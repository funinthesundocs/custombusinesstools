"""
Crop all 7 machines from the baseplate and submit each to PiAPI (Kling)
for image-to-video animation. The ACTUAL baseplate art comes alive.
"""
import os, sys, json, time, base64, io
import httpx
from PIL import Image
from pathlib import Path

# Load keys
env = {}
env_path = Path(__file__).parent.parent / ".env"
for line in env_path.read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, v = line.strip().split("=", 1)
        env[k] = v

PIAPI_KEY = env.get("PIAPI_KEY", "")
if not PIAPI_KEY:
    print("ERROR: PIAPI_KEY not found")
    sys.exit(1)

BASEPLATE = Path(__file__).parent.parent / "web" / "dashboard" / "public" / "rag-factory-baseplate.jpg"
OUTPUT_DIR = Path(__file__).parent.parent / "docs" / "animation-assets" / "machine-videos"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

img = Image.open(BASEPLATE)
w, h = img.size
print(f"Baseplate: {w}x{h}")

# All 7 machines - tight crops of just the machine art, no labels
machines = [
    {
        "name": "knowledge-drop",
        "crop": (50, 30, 550, 480),
        "prompt": "steampunk funnel hopper machine, documents and papers gently falling into the wide funnel opening from above, the funnel body vibrates subtly with mechanical hum, faint steam wisps rising from the funnel top, flat 2D illustration style, completely static locked camera, dark teal background, mechanical motion only",
    },
    {
        "name": "factory",
        "crop": (700, 20, 1400, 500),
        "prompt": "steampunk factory machine with large interlocking brass gears slowly rotating clockwise, smaller copper gears spinning counterclockwise meshing together, chain drive belt scrolling continuously, tiny orange sparks at gear contact points, flat 2D illustration style, completely static locked camera, dark teal background, smooth continuous mechanical motion",
    },
    {
        "name": "question",
        "crop": (1650, 10, 2300, 500),
        "prompt": "steampunk satellite radar dish slowly sweeping back and forth on articulated mount arm, faint cyan signal waves pulsing outward from the dish tip, small indicator lights blinking on base unit, flat 2D illustration style, completely static locked camera, dark teal background, smooth mechanical sweep motion",
    },
    {
        "name": "live-data-feeds",
        "crop": (200, 550, 1050, 930),
        "prompt": "steampunk data monitoring console, multiple small screens displaying scrolling data streams and waveforms, indicator LEDs blinking in patterns, small mechanical dials and gauges moving, energy flowing through connected pipes, flat 2D illustration style, completely static locked camera, dark teal background",
    },
    {
        "name": "confidence-gate",
        "crop": (1300, 480, 2100, 950),
        "prompt": "steampunk quality gate machine with traffic light cycling between red and green, a gauge needle slowly sweeping across an arc, small gears turning on the sides of the housing, a mechanical gate arm raising and lowering, flat 2D illustration style, completely static locked camera, dark teal background, smooth mechanical motion",
    },
    {
        "name": "assembly-line",
        "crop": (100, 1000, 1150, 1430),
        "prompt": "steampunk assembly line processing machine, conveyor belt scrolling rightward carrying small metal components, mechanical robot arm pivoting smoothly to pick and place items, central processor unit glowing with pulsing cyan light, flat 2D illustration style, completely static locked camera, dark teal background, continuous industrial motion",
    },
    {
        "name": "delivery",
        "crop": (1250, 1000, 2450, 1430),
        "prompt": "steampunk printing press delivery machine, the heavy press arm stamping down with weight then rising back up with hydraulic motion, finished printed documents sliding out to the right, filing cabinet drawer sliding open then closed, flat 2D illustration style, completely static locked camera, dark teal background, rhythmic mechanical motion",
    },
]

NEG_PROMPT = "3D render, photorealistic, camera movement, zoom, pan, tilt, depth of field, blur, text, watermark, humans, animals, modern, futuristic"

# Step 1: Crop all machines
print("\n=== CROPPING ALL 7 MACHINES ===")
for m in machines:
    crop = img.crop(m["crop"]).convert("RGB")
    crop_path = OUTPUT_DIR / f"{m['name']}-crop.jpg"
    crop.save(crop_path, "JPEG", quality=92)
    print(f"  {m['name']}: {crop.size} -> {crop_path}")

# Step 2: Upload crops and get URLs (PiAPI needs URLs, not base64 for image_url)
# We'll use base64 data URLs since we don't have a CDN
print("\n=== SUBMITTING ALL 7 TO PIAPI (KLING v2.6) ===")

ENDPOINT = "https://api.piapi.ai/api/v1/task"
task_ids = {}

for m in machines:
    crop_path = OUTPUT_DIR / f"{m['name']}-crop.jpg"
    with open(crop_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()

    data_url = f"data:image/jpeg;base64,{img_b64}"
    print(f"\n  Submitting {m['name']}...")

    resp = httpx.post(
        ENDPOINT,
        headers={
            "x-api-key": PIAPI_KEY,
            "Content-Type": "application/json",
        },
        json={
            "model": "kling",
            "task_type": "video_generation",
            "input": {
                "prompt": m["prompt"],
                "negative_prompt": NEG_PROMPT,
                "image_url": data_url,
                "duration": 5,
                "aspect_ratio": "16:9",
                "mode": "std",
                "version": "2.6",
                "cfg_scale": "0.5",
            },
        },
        timeout=60.0,
    )

    print(f"    HTTP {resp.status_code}")
    result = resp.json()

    task_id = result.get("data", {}).get("task_id", "")
    if not task_id:
        task_id = result.get("task_id", result.get("id", ""))

    if task_id:
        task_ids[m["name"]] = task_id
        print(f"    Task ID: {task_id}")
    else:
        print(f"    Response: {json.dumps(result, indent=2)[:400]}")
        task_ids[m["name"]] = None

# Save task IDs
task_file = OUTPUT_DIR / "task-ids.json"
task_file.write_text(json.dumps(task_ids, indent=2))
print(f"\nTask IDs saved to: {task_file}")

# Step 3: Poll for completion
print("\n=== POLLING FOR COMPLETION ===")
completed = set()
failed = set()
active = {k for k, v in task_ids.items() if v}

for attempt in range(180):  # 30 minutes max
    if not active - completed - failed:
        break

    time.sleep(10)

    for name in list(active - completed - failed):
        task_id = task_ids[name]
        try:
            check = httpx.get(
                f"https://api.piapi.ai/api/v1/task/{task_id}",
                headers={"x-api-key": PIAPI_KEY},
                timeout=15.0,
            )
            data = check.json()
            status = data.get("data", {}).get("status",
                     data.get("status", "unknown"))

            if status.lower() in ("completed", "succeed"):
                completed.add(name)
                output = data.get("data", {}).get("output", {})
                video_url = output.get("video_url", output.get("works", [{}])[0].get("video", {}).get("url", "") if output.get("works") else "")

                if not video_url:
                    # Try deeper nesting
                    works = output.get("works", [])
                    if works:
                        video_url = works[0].get("video", {}).get("resource", {}).get("resource", "")

                if video_url:
                    vid_data = httpx.get(video_url, timeout=120.0).content
                    out_path = OUTPUT_DIR / f"{name}-animated.mp4"
                    out_path.write_bytes(vid_data)
                    print(f"  [{attempt*10}s] {name}: DONE! -> {out_path} ({len(vid_data)//1024}KB)")
                else:
                    print(f"  [{attempt*10}s] {name}: completed but no video URL found")
                    print(f"    Output: {json.dumps(output, indent=2)[:300]}")

            elif status.lower() in ("failed", "error"):
                failed.add(name)
                error = data.get("data", {}).get("error", {})
                print(f"  [{attempt*10}s] {name}: FAILED - {error}")

            elif attempt % 6 == 0:  # Log every 60s
                print(f"  [{attempt*10}s] {name}: {status}")

        except Exception as e:
            if attempt % 12 == 0:
                print(f"  [{attempt*10}s] {name}: check error - {e}")

print(f"\n=== FINAL RESULTS ===")
print(f"Completed: {sorted(completed)}")
print(f"Failed: {sorted(failed)}")
pending = active - completed - failed
if pending:
    print(f"Still pending: {sorted(pending)}")
print(f"\nVideos saved to: {OUTPUT_DIR}")
