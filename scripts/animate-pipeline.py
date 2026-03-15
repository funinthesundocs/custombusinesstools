"""
RAG Factory — Automated Animation Pipeline
Decomposes base plate → vectorizes → labels SVG elements → generates reference clips
"""

import os
import sys
import json
import time
import requests
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / ".env")

FAL_KEY = os.getenv("FAL_KEY")
KLING_ACCESS_KEY = os.getenv("KLING_ACCESS_KEY")
KLING_SECRET_KEY = os.getenv("KLING_SECRET_KEY")

BASE_PLATE = PROJECT_ROOT / "web" / "dashboard" / "public" / "rag-factory-baseplate.jpg"
ASSETS_DIR = PROJECT_ROOT / "docs" / "animation-assets"
LAYERS_DIR = ASSETS_DIR / "layers"
SVG_DIR = ASSETS_DIR / "svg"
CLIPS_DIR = ASSETS_DIR / "reference-clips"

MACHINE_NAMES = [
    "funnel", "factory", "radar", "gate", "satellite", "assembly", "press"
]

KLING_PROMPTS = {
    "funnel": "Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. Small document papers float downward and are drawn into the funnel opening. The funnel vibrates subtly. Wisps of steam rise from the top vent. Cyan accent lighting pulses at the funnel mouth. Seamless loop. No camera movement.",
    "factory": "Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. Three interlocking brass gears rotate — the large gear turns slowly clockwise, the medium gear turns counterclockwise at matching speed, the small gear spins fast clockwise. Two circular saw blades spin rapidly. A conveyor belt moves from left to right carrying small metal components. Bright orange sparks flash briefly at gear contact points. Seamless loop. No camera movement.",
    "radar": "Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. A radar satellite dish slowly sweeps back and forth through a 90-degree arc. Cyan signal wave arcs pulse outward from the dish tip, expanding and fading. Small glowing cyan data orbs flicker on and off in the surrounding space, with 2-3 being pulled toward the dish by magnetic attraction. A small monitor screen on the base shows a waveform pulse. Seamless loop. No camera movement.",
    "gate": "Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. A traffic light switches from red to green — the green lens flares brightly with a soft glow. A mechanical gauge needle swings from the left red zone to the right green zone. A gate arm barrier raises slowly. Small gears at the base rotate. Seamless loop. No camera movement.",
    "satellite": "Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. Three satellite dishes make subtle oscillating movements. Thin cyan signal lines pulse downward from the dishes to a central receiver box. A panel of 15 small LED indicators blinks in a staggered pattern — some cyan, some dim. The central mixer box has a subtle energy glow. Seamless loop. No camera movement.",
    "assembly": "Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. A conveyor belt moves from left to right, carrying small rectangular components. The components slide along and converge at a central processor unit. The processor pulses with golden-cyan energy — a bright core glow that throbs rhythmically. A robotic arm makes a subtle repetitive motion. Two small screens display scrolling data. Seamless loop. No camera movement.",
    "press": "Dark steampunk industrial illustration, flat 2D vector art style, dark mode, locked static camera, no depth of field. A heavy industrial press arm stamps downward quickly, pauses at the bottom for a beat, then rises slowly. On each stamp, a sheet of paper with cyan text slides out from beneath the press into an output tray. Small cyan badge tags pop onto the paper. A filing cabinet drawer on the right glows amber briefly and slides shut. Seamless loop. No camera movement.",
}

# SVG element IDs per machine (for labeling step)
SVG_ID_MAP = {
    "funnel": {
        "circle": ["steam-{n}"],
        "large_shape": ["funnel-body", "funnel-mouth", "steam-vent"],
        "rect": ["doc-{n}"],
    },
    "factory": {
        "circle": ["gear-large", "gear-medium", "gear-small", "saw-1", "saw-2"],
        "path_long": ["conveyor-belt"],
        "small_shape": ["spark-{n}"],
    },
    "radar": {
        "large_shape": ["dish-body", "dish-mount", "monitor"],
        "arc": ["wave-{n}"],
        "small_circle": ["orb-{n}"],
    },
    "gate": {
        "circle": ["lens-red", "lens-yellow", "lens-green"],
        "narrow_shape": ["gauge-needle", "gate-arm"],
        "medium_circle": ["gate-gear-1", "gate-gear-2"],
        "large_shape": ["gauge-body"],
    },
    "satellite": {
        "large_shape": ["dish-a", "dish-b", "dish-c", "mixer"],
        "small_circle": ["led-{n}"],
        "path_line": ["signal-{n}"],
    },
    "assembly": {
        "path_long": ["assembly-belt"],
        "rect": ["component-{n}"],
        "large_shape": ["processor-body", "robot-arm"],
        "circle": ["processor-glow"],
        "medium_shape": ["screen-1", "screen-2"],
    },
    "press": {
        "large_shape": ["press-arm", "press-base", "cabinet"],
        "rect": ["output-{n}", "cabinet-drawer"],
        "small_shape": ["badge-{n}"],
    },
}


def ensure_dirs():
    for d in [LAYERS_DIR, SVG_DIR, CLIPS_DIR]:
        d.mkdir(parents=True, exist_ok=True)


# ─── STEP 1: Layer Decomposition via fal.ai ───────────────────────────────────

def step1_decompose():
    print("\n═══ STEP 1: Layer Decomposition (fal.ai + Qwen-Image-Layered) ═══")

    if not FAL_KEY:
        print("ERROR: FAL_KEY not found in .env")
        sys.exit(1)

    # Check if layers already exist
    existing = list(LAYERS_DIR.glob("*.png"))
    if len(existing) >= 7:
        print(f"  Layers already exist ({len(existing)} PNGs). Skipping decomposition.")
        return

    import fal_client

    # Upload the base plate image
    print("  Uploading base plate to fal.ai...")
    image_url = fal_client.upload_file(str(BASE_PLATE))
    print(f"  Uploaded: {image_url}")

    print("  Running Qwen-Image-Layered (8 layers)...")
    result = fal_client.subscribe(
        "fal-ai/qwen-image-layered",
        arguments={
            "image_url": image_url,
            "num_layers": 9,  # 7 machines + pipes + background
        },
        with_logs=True,
    )

    # Download layers
    layers = result.get("images", result.get("output", []))
    if not layers:
        print("  ERROR: No layers returned from fal.ai")
        print(f"  Raw result: {json.dumps(result, indent=2)[:500]}")
        sys.exit(1)

    print(f"  Got {len(layers)} layers. Downloading...")
    for i, layer in enumerate(layers):
        url = layer if isinstance(layer, str) else layer.get("url", "")
        if not url:
            continue
        resp = requests.get(url)
        name = f"layer-{i+1}.png"
        if i < len(MACHINE_NAMES):
            name = f"layer-{i+1}-{MACHINE_NAMES[i]}.png"
        elif i == len(MACHINE_NAMES):
            name = "layer-8-pipes.png"
        else:
            name = "layer-9-background.png"

        out_path = LAYERS_DIR / name
        out_path.write_bytes(resp.content)
        print(f"  Saved: {name} ({len(resp.content) // 1024} KB)")

    print("  Step 1 complete.")


# ─── STEP 2: SVG Vectorization via vtracer ─────────────────────────────────────

def step2_vectorize():
    print("\n═══ STEP 2: SVG Vectorization (vtracer) ═══")

    import vtracer

    layers = sorted(LAYERS_DIR.glob("layer-*-*.png"))
    if not layers:
        print("  ERROR: No layer PNGs found. Run Step 1 first.")
        sys.exit(1)

    for layer_path in layers:
        # Derive SVG name from layer name
        name = layer_path.stem  # e.g., "layer-1-funnel"
        parts = name.split("-")
        if len(parts) >= 3:
            machine = parts[2]
            svg_name = f"machine-{parts[1]}-{machine}.svg"
        else:
            svg_name = f"{name}.svg"

        svg_path = SVG_DIR / svg_name

        if svg_path.exists():
            print(f"  {svg_name} already exists. Skipping.")
            continue

        print(f"  Vectorizing {layer_path.name} → {svg_name}...")
        vtracer.convert_image_to_svg_py(
            str(layer_path),
            str(svg_path),
            colormode="color",
            hierarchical="stacked",
            mode="spline",
            filter_speckle=4,
            color_precision=8,
            corner_threshold=60,
            length_threshold=4.0,
        )
        size = svg_path.stat().st_size // 1024
        print(f"  Saved: {svg_name} ({size} KB)")

    print("  Step 2 complete.")


# ─── STEP 3: SVG Element ID Injection ──────────────────────────────────────────

def step3_label_svgs():
    print("\n═══ STEP 3: SVG Element ID Injection ═══")

    try:
        import lxml.etree as ET
    except ImportError:
        print("  Installing lxml...")
        subprocess.run([sys.executable, "-m", "pip", "install", "lxml"], check=True)
        import lxml.etree as ET

    from svgpathtools import parse_path

    svg_files = sorted(SVG_DIR.glob("machine-*.svg"))
    if not svg_files:
        print("  ERROR: No machine SVGs found. Run Step 2 first.")
        sys.exit(1)

    for svg_path in svg_files:
        # Identify which machine this is
        name = svg_path.stem  # e.g., "machine-1-funnel"
        parts = name.split("-")
        if len(parts) < 3:
            continue
        machine = parts[2]

        print(f"  Labeling {svg_path.name} ({machine})...")

        tree = ET.parse(str(svg_path))
        root = tree.getroot()
        ns = root.nsmap.get(None, "http://www.w3.org/2000/svg")

        # Count elements by type for ID assignment
        counters = {"circle": 0, "rect": 0, "path": 0, "ellipse": 0, "polygon": 0, "shape": 0}

        for el in root.iter():
            tag = el.tag.split("}")[-1] if "}" in el.tag else el.tag

            if tag in ("circle", "ellipse"):
                counters["circle"] += 1
                el.set("id", f"{machine}-circle-{counters['circle']}")
            elif tag == "rect":
                counters["rect"] += 1
                el.set("id", f"{machine}-rect-{counters['rect']}")
            elif tag == "path":
                counters["path"] += 1
                d = el.get("d", "")
                if d:
                    try:
                        path = parse_path(d)
                        bbox = path.bbox()
                        w = bbox[1] - bbox[0]
                        h = bbox[3] - bbox[2]
                        ratio = w / h if h > 0 else 0
                        if 0.8 < ratio < 1.2 and w > 30:
                            el.set("id", f"{machine}-disc-{counters['path']}")
                        elif ratio > 3:
                            el.set("id", f"{machine}-belt-{counters['path']}")
                        else:
                            el.set("id", f"{machine}-path-{counters['path']}")
                    except Exception:
                        el.set("id", f"{machine}-path-{counters['path']}")
                else:
                    el.set("id", f"{machine}-path-{counters['path']}")
            elif tag == "polygon":
                counters["polygon"] += 1
                el.set("id", f"{machine}-poly-{counters['polygon']}")

            # Add data-machine attribute for React targeting
            if tag in ("circle", "ellipse", "rect", "path", "polygon"):
                el.set("data-machine", machine)

        # Write labeled SVG
        labeled_path = SVG_DIR / f"{svg_path.stem}-labeled.svg"
        tree.write(str(labeled_path), xml_declaration=True, encoding="utf-8")
        total = sum(counters.values())
        print(f"  Labeled {total} elements → {labeled_path.name}")

    print("  Step 3 complete.")


# ─── STEP 4: Reference Video Generation via Kling API ──────────────────────────

def step4_generate_videos():
    print("\n═══ STEP 4: Reference Video Generation (Kling AI) ═══")

    if not KLING_ACCESS_KEY or not KLING_SECRET_KEY:
        print("  WARNING: KLING_ACCESS_KEY or KLING_SECRET_KEY not in .env")
        print("  Skipping video generation. Add keys and re-run.")
        return

    import jwt

    def get_kling_token():
        payload = {
            "iss": KLING_ACCESS_KEY,
            "exp": int(time.time()) + 1800,
            "nbf": int(time.time()) - 5,
        }
        return jwt.encode(payload, KLING_SECRET_KEY, algorithm="HS256")

    def submit_video(image_path, prompt, machine_name):
        clip_path = CLIPS_DIR / f"ref-{machine_name}.mp4"
        if clip_path.exists():
            print(f"  {clip_path.name} already exists. Skipping.")
            return None

        token = get_kling_token()

        # Upload image as base64 data URL
        import base64
        with open(image_path, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode()
        data_url = f"data:image/png;base64,{img_b64}"

        print(f"  Submitting {machine_name} to Kling API...")
        resp = requests.post(
            "https://api-singapore.klingai.com/v1/videos/image2video",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={
                "model_name": "kling-v2-master",
                "image": data_url,
                "prompt": prompt,
                "duration": "5",
                "aspect_ratio": "16:9",
                "cfg_scale": 0.5,
            },
        )

        if resp.status_code != 200:
            print(f"  ERROR: Kling API returned {resp.status_code}: {resp.text[:200]}")
            return None

        data = resp.json()
        task_id = data.get("data", {}).get("task_id")
        if not task_id:
            print(f"  ERROR: No task_id in response: {json.dumps(data)[:200]}")
            return None

        print(f"  Task submitted: {task_id}")
        return {"task_id": task_id, "machine": machine_name, "clip_path": clip_path}

    def poll_and_download(tasks):
        pending = [t for t in tasks if t is not None]
        if not pending:
            return

        print(f"\n  Polling {len(pending)} video tasks...")
        while pending:
            time.sleep(15)
            token = get_kling_token()
            still_pending = []

            for task in pending:
                resp = requests.get(
                    f"https://api-singapore.klingai.com/v1/videos/image2video/{task['task_id']}",
                    headers={"Authorization": f"Bearer {token}"},
                )
                data = resp.json().get("data", {})
                status = data.get("task_status", "unknown")

                if status == "succeed":
                    video_url = data.get("task_result", {}).get("videos", [{}])[0].get("url", "")
                    if video_url:
                        video_resp = requests.get(video_url)
                        task["clip_path"].write_bytes(video_resp.content)
                        print(f"  ✓ Downloaded: {task['clip_path'].name} ({len(video_resp.content) // 1024} KB)")
                    else:
                        print(f"  WARNING: No video URL for {task['machine']}")
                elif status == "failed":
                    print(f"  ✗ Failed: {task['machine']} — {data.get('task_status_msg', 'unknown error')}")
                else:
                    still_pending.append(task)
                    print(f"  ... {task['machine']}: {status}")

            pending = still_pending

    # Submit all 7 machines
    tasks = []
    for i, machine in enumerate(MACHINE_NAMES):
        layer_path = LAYERS_DIR / f"layer-{i+1}-{machine}.png"
        if not layer_path.exists():
            # Try the base plate as fallback
            layer_path = BASE_PLATE
        prompt = KLING_PROMPTS.get(machine, "")
        task = submit_video(layer_path, prompt, machine)
        tasks.append(task)
        time.sleep(2)  # Rate limit

    poll_and_download(tasks)
    print("  Step 4 complete.")


# ─── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

    print("=== RAG Factory - Automated Animation Pipeline ===")

    ensure_dirs()

    steps = sys.argv[1:] if len(sys.argv) > 1 else ["1", "2", "3", "4"]

    if "1" in steps:
        step1_decompose()
    if "2" in steps:
        step2_vectorize()
    if "3" in steps:
        step3_label_svgs()
    if "4" in steps:
        step4_generate_videos()

    print("\n═══ PIPELINE COMPLETE ═══")
    print(f"  Layers:     {LAYERS_DIR}")
    print(f"  SVGs:       {SVG_DIR}")
    print(f"  Ref clips:  {CLIPS_DIR}")
    print("\nNext: Give the other Opus the build prompt:")
    print("  Read C:\\Antigravity\\Custombusinesstools\\docs\\opus-animation-build-prompt.md and execute it.")


if __name__ == "__main__":
    main()
