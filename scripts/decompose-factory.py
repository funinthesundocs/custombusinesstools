"""
Decompose the Factory machine from the baseplate into separate RGBA layers
using Qwen-Image-Layered via fal.ai API.
"""
import os
import sys
import json
import base64
import io
import httpx
from PIL import Image
from pathlib import Path

# Config
FAL_KEY = ""
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        if line.startswith("FAL_KEY="):
            FAL_KEY = line.split("=", 1)[1].strip()
            break

if not FAL_KEY:
    print("ERROR: FAL_KEY not found")
    sys.exit(1)

BASEPLATE = Path(__file__).parent.parent / "web" / "dashboard" / "public" / "rag-factory-baseplate.jpg"
OUTPUT_DIR = Path(__file__).parent.parent / "docs" / "animation-assets" / "factory-layers"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Step 1: Crop the Factory machine from the baseplate
print("Step 1: Cropping Factory machine from baseplate...")
img = Image.open(BASEPLATE)
w, h = img.size
print(f"  Baseplate size: {w}x{h}")

# Factory position: left ~30%, top ~0%, right ~60%, bottom ~38%
left = int(w * 0.30)
top = int(h * 0.0)
right = int(w * 0.60)
bottom = int(h * 0.38)

factory_crop = img.crop((left, top, right, bottom))
crop_path = OUTPUT_DIR / "factory-crop.png"
factory_crop.save(crop_path)
crop_w, crop_h = factory_crop.size
print(f"  Cropped to: {crop_w}x{crop_h} -> {crop_path}")

# Step 2: Upload image to fal.ai CDN first, then decompose
print("\nStep 2: Uploading image to fal.ai CDN...")

headers = {
    "Authorization": f"Key {FAL_KEY}",
}

# Upload file to fal storage
with open(crop_path, "rb") as f:
    upload_resp = httpx.post(
        "https://fal.run/fal-ai/any-llm/storage/upload",
        headers={
            "Authorization": f"Key {FAL_KEY}",
            "Content-Type": "image/png",
        },
        content=f.read(),
        timeout=60.0,
    )

if upload_resp.status_code == 200:
    file_url = upload_resp.json().get("url", "")
    print(f"  Uploaded: {file_url}")
else:
    # Fallback: use fal's file upload endpoint
    print(f"  CDN upload returned {upload_resp.status_code}, trying direct upload...")

    # Try the fal upload endpoint
    with open(crop_path, "rb") as f:
        upload_resp = httpx.put(
            "https://fal.run/fal-ai/upload",
            headers={
                "Authorization": f"Key {FAL_KEY}",
                "Content-Type": "image/png",
            },
            content=f.read(),
            timeout=60.0,
        )

    if upload_resp.status_code == 200:
        file_url = upload_resp.json().get("url", "")
        print(f"  Uploaded: {file_url}")
    else:
        # Last resort: use smaller image with data URL
        print(f"  Upload failed ({upload_resp.status_code}). Using resized data URL...")
        small = factory_crop.resize((400, int(400 * crop_h / crop_w)))
        buffer = io.BytesIO()
        small.save(buffer, format="PNG", optimize=True)
        img_b64 = base64.b64encode(buffer.getvalue()).decode()
        file_url = f"data:image/png;base64,{img_b64}"
        print(f"  Using data URL ({len(img_b64)} chars)")

# Step 3: Call Qwen-Image-Layered
print("\nStep 3: Decomposing into layers via Qwen-Image-Layered...")

# Try the queue-based approach for long-running tasks
resp = httpx.post(
    "https://queue.fal.run/fal-ai/qwen-image-layered",
    headers={
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "image_url": file_url,
        "num_layers": 6,
    },
    timeout=30.0,
)

print(f"  Queue response: {resp.status_code}")

if resp.status_code in (200, 201):
    queue_data = resp.json()
    request_id = queue_data.get("request_id", "")
    status_url = queue_data.get("status_url", "")
    response_url = queue_data.get("response_url", "")
    print(f"  Request ID: {request_id}")
    print(f"  Status URL: {status_url}")

    # Poll for completion
    import time
    for attempt in range(60):  # 5 minutes max
        time.sleep(5)
        status_resp = httpx.get(
            status_url or f"https://queue.fal.run/fal-ai/qwen-image-layered/requests/{request_id}/status",
            headers={"Authorization": f"Key {FAL_KEY}"},
            timeout=15.0,
        )
        status = status_resp.json()
        current = status.get("status", "unknown")
        print(f"  [{attempt*5}s] Status: {current}")

        if current == "COMPLETED":
            # Get result
            result_resp = httpx.get(
                response_url or f"https://queue.fal.run/fal-ai/qwen-image-layered/requests/{request_id}",
                headers={"Authorization": f"Key {FAL_KEY}"},
                timeout=30.0,
            )
            result = result_resp.json()
            break
        elif current in ("FAILED", "CANCELLED"):
            print(f"  FAILED: {status}")
            sys.exit(1)
    else:
        print("  TIMEOUT: Job did not complete in 5 minutes")
        sys.exit(1)
else:
    print(f"  ERROR: {resp.text[:500]}")
    sys.exit(1)

# Step 4: Download layers
print("\nStep 4: Downloading layers...")
layers = result.get("images", result.get("layers", result.get("output", {}).get("images", [])))
print(f"  Found {len(layers)} layers")

for i, layer_data in enumerate(layers):
    if isinstance(layer_data, dict):
        layer_url = layer_data.get("url", layer_data.get("image_url", layer_data.get("image", "")))
    elif isinstance(layer_data, str):
        layer_url = layer_data
    else:
        print(f"  Layer {i}: unexpected format: {type(layer_data)}")
        continue

    if layer_url.startswith("http"):
        print(f"  Downloading layer {i}...")
        layer_resp = httpx.get(layer_url, timeout=30.0)
        layer_path = OUTPUT_DIR / f"layer-{i:02d}.png"
        layer_path.write_bytes(layer_resp.content)
        layer_img = Image.open(layer_path)
        print(f"  Layer {i}: {layer_img.size}, mode={layer_img.mode} -> {layer_path}")
    else:
        print(f"  Layer {i}: saving metadata")
        layer_path = OUTPUT_DIR / f"layer-{i:02d}-meta.json"
        layer_path.write_text(json.dumps(layer_data, indent=2))

print(f"\nDone! Layers saved to: {OUTPUT_DIR}")
