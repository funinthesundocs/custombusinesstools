"""Vectorize all layer PNGs to SVGs using vectorizer.ai REST API or Pillow SVG trace fallback."""
import os
import sys
import json
from pathlib import Path

layers_dir = Path("docs/animation-assets/layers")
svg_dir = Path("docs/animation-assets/svg")
svg_dir.mkdir(parents=True, exist_ok=True)


def trace_with_pillow(src_path, dst_path):
    """Simple SVG trace using edge detection — creates path outlines from image alpha."""
    from PIL import Image
    import struct

    img = Image.open(src_path).convert("RGBA")
    w, h = img.size
    pixels = list(img.getdata())

    # Group non-transparent pixels by color (quantized to reduce path count)
    color_groups = {}
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[y * w + x]
            if a < 30:
                continue
            # Quantize color to reduce SVG size
            qr = (r // 32) * 32
            qg = (g // 32) * 32
            qb = (b // 32) * 32
            key = (qr, qg, qb)
            if key not in color_groups:
                color_groups[key] = []
            color_groups[key].append((x, y))

    # Build SVG with rectangles (pixel-level, then let SVGO optimize)
    svg_parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">']

    for (r, g, b), coords in color_groups.items():
        # Create runs of horizontal pixels for efficiency
        runs = []
        coords.sort(key=lambda c: (c[1], c[0]))
        i = 0
        while i < len(coords):
            x0, y0 = coords[i]
            x1 = x0
            while i + 1 < len(coords) and coords[i + 1] == (x1 + 1, y0):
                x1 += 1
                i += 1
            runs.append((x0, y0, x1 - x0 + 1))
            i += 1

        color_hex = f"#{r:02x}{g:02x}{b:02x}"
        for x, y, run_w in runs:
            svg_parts.append(f'<rect x="{x}" y="{y}" width="{run_w}" height="1" fill="{color_hex}"/>')

    svg_parts.append("</svg>")
    dst_path.write_text("\n".join(svg_parts), encoding="utf-8")


for f in sorted(layers_dir.glob("layer-*.png")):
    name = f.stem.replace("layer-", "machine-") + ".svg"
    dst = svg_dir / name

    if dst.exists():
        print(f"  {name} exists, skipping")
        continue

    print(f"  Tracing {f.name} -> {name}...")
    try:
        trace_with_pillow(f, dst)
        size = dst.stat().st_size // 1024
        print(f"  OK: {name} ({size} KB)")
    except Exception as e:
        print(f"  ERROR: {name} - {e}")

print("Done.")
