#!/usr/bin/env python3
"""
NUGGET — AI Agent Avatar Generator
Model: gemini-3-pro-image-preview (Nano Banana Pro)
Generates the Nugget character in multiple formats for website integration.
"""

import os
import sys
import time

try:
    from google import genai
    from google.genai import types
    from PIL import Image
    from dotenv import load_dotenv
except ImportError:
    os.system('pip install google-genai Pillow python-dotenv')
    from google import genai
    from google.genai import types
    from PIL import Image
    from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get('GEMINI_IMAGE_API_KEY')
if not api_key:
    print('ERROR: GEMINI_IMAGE_API_KEY not found in .env')
    sys.exit(1)

client = genai.Client(api_key=api_key)
MODEL = 'gemini-3-pro-image-preview'
OUTPUT_DIR = os.path.join('web', 'presentation', 'public', 'images', 'nugget')
os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate(prompt, filename, aspect='1:1', res='2K', retries=3):
    """Generate a single image."""
    out_path = os.path.join(OUTPUT_DIR, filename)
    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=[prompt],
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE'],
                    image_config=types.ImageConfig(
                        aspect_ratio=aspect,
                        image_size=res
                    ),
                    safety_settings=[
                        types.SafetySetting(
                            category='HARM_CATEGORY_DANGEROUS_CONTENT',
                            threshold='BLOCK_ONLY_HIGH'
                        ),
                    ]
                )
            )
            for part in response.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    image = part.as_image()
                    image.save(out_path)
                    w, h = image.size
                    print(f'  SUCCESS: {filename} — {w}x{h}')
                    return True
            print(f'  WARNING: No image returned for {filename} (attempt {attempt+1})')
        except Exception as e:
            if '429' in str(e) or 'RESOURCE_EXHAUSTED' in str(e):
                wait = 2 ** attempt * 15
                print(f'  RATE LIMITED: Waiting {wait}s (attempt {attempt+1})')
                time.sleep(wait)
            else:
                print(f'  ERROR: {e}')
                if attempt < retries - 1:
                    time.sleep(5)
    print(f'  FAILED: {filename}')
    return False


# The master character description used across all variants
NUGGET_CHARACTER = (
    "A charming cartoon character that is a chunky, irregular gold nugget — shaped like "
    "real native gold with organic lumpy form, visible crystalline faces, and natural "
    "texture. The gold surface is hyper-realistic — warm metallic luster with brilliant "
    "specular highlights on some facets and warm shadows on others, with subtle natural "
    "impurities that make it feel like genuine gold, not CGI. "
    "The nugget has a face: two warm, intelligent eyes with amber-gold irises and tiny "
    "bright specular highlights that make them look alive and golden. A confident, "
    "slightly mischievous smile that says 'ask me anything' — with a subtle golden glint "
    "as if even the teeth catch light. The expression communicates wisdom, friendliness, "
    "and quiet confidence. "
    "On top of the nugget sits a tiny white hard hat, tilted slightly to one side at a "
    "jaunty angle — giving personality and mining industry identity. On the hard hat is "
    "the tiniest green hexagonal 'G' icon, barely visible — a hidden detail. "
    "The nugget is about fist-sized — substantial, weighty, valuable. Not a tiny flake "
    "but a real nugget worth something. "
    "A warm golden luminescent glow emanates softly from behind and beneath the nugget — "
    "it could be the natural luster of gold catching ambient light, or it could suggest "
    "something more — an inner intelligence, an energy, an awareness. The glow is subtle, "
    "not overwhelming. "
    "The style bridges Pixar-quality character design with photorealistic gold material. "
    "The face and expression are warmly cartoon. The gold surface is physically accurate. "
    "This contrast makes the character unique and memorable."
)

print('=' * 60)
print('NUGGET — AI Agent Avatar Generation')
print('Model: gemini-3-pro-image-preview (Nano Banana Pro)')
print('=' * 60)
print()

# ──────────────────────────────────────────────
# VARIANT 1: Hero Avatar — Full Character
# Large, detailed, for the advisor page header
# ──────────────────────────────────────────────
print('[1/6] Hero avatar — full character, dark background')
generate(
    prompt=(
        f"Create a character illustration of a gold nugget AI assistant named Nugget. "
        f"{NUGGET_CHARACTER} "
        f"The background is a clean, dark gradient — deep navy (#0C1926) fading to "
        f"slightly lighter navy at the edges, with a subtle warm golden light bloom "
        f"behind the nugget. The nugget is centered in the frame with generous "
        f"breathing room around it. "
        f"The overall composition should feel like a premium character reveal — "
        f"like the moment a Pixar character is first introduced. Warm, inviting, "
        f"and impossible not to smile at. "
        f"Generate this image at 2K resolution."
    ),
    filename='nugget-hero-dark.png',
    aspect='1:1',
    res='2K'
)
time.sleep(5)

# ──────────────────────────────────────────────
# VARIANT 2: Hero Avatar — Light Background
# For the public-facing advisor on the light theme site
# ──────────────────────────────────────────────
print('[2/6] Hero avatar — full character, light background')
generate(
    prompt=(
        f"Create a character illustration of a gold nugget AI assistant named Nugget. "
        f"{NUGGET_CHARACTER} "
        f"The background is clean white with a very subtle warm cream tone (#FAFAF7). "
        f"A soft golden glow surrounds the nugget, creating a warm halo effect against "
        f"the light background. A very faint shadow beneath the nugget grounds it. "
        f"The composition is centered with generous white space — this will be used "
        f"as a header image on a light-themed website. "
        f"Generate this image at 2K resolution."
    ),
    filename='nugget-hero-light.png',
    aspect='1:1',
    res='2K'
)
time.sleep(5)

# ──────────────────────────────────────────────
# VARIANT 3: Chat Avatar — Small Icon
# Circular crop-friendly, appears next to every agent message
# ──────────────────────────────────────────────
print('[3/6] Chat avatar — tight crop for message bubble icon')
generate(
    prompt=(
        f"Create a close-up portrait of a gold nugget AI character named Nugget. "
        f"Show only the face and the tiny tilted hard hat — tightly cropped, filling "
        f"the frame. The gold nugget has warm intelligent amber-gold eyes with bright "
        f"specular highlights, a confident mischievous smile with a golden glint, and "
        f"a tiny white hard hat tilted jauntily. The gold surface is hyper-realistic "
        f"with warm metallic luster. "
        f"Background: solid dark navy circle (#0C1926) — this image will be used as "
        f"a circular avatar icon next to chat messages, so the composition must work "
        f"perfectly in a circle crop. Center the face. "
        f"Style: Pixar-quality character face with photorealistic gold material. "
        f"Warm, friendly, approachable, intelligent. "
        f"Generate this image at 1K resolution."
    ),
    filename='nugget-avatar-circle.png',
    aspect='1:1',
    res='1K'
)
time.sleep(5)

# ──────────────────────────────────────────────
# VARIANT 4: Branded — Character with "NUGGET" text
# For branding, headers, or splash screens
# ──────────────────────────────────────────────
print('[4/6] Branded — character with NUGGET text')
generate(
    prompt=(
        f"Create a branded illustration featuring a gold nugget AI character. "
        f"{NUGGET_CHARACTER} "
        f"Below the nugget character, render the text 'NUGGET' in bold, clean, "
        f"modern sans-serif font — white color with a subtle golden metallic sheen "
        f"on the letter edges. Below 'NUGGET' in much smaller text: "
        f"'AI Mining Intelligence Advisor' in thin white sans-serif. "
        f"Background: dark navy gradient (#0C1926). The golden glow behind the "
        f"nugget character illuminates the text slightly from above. "
        f"The overall composition should feel like a premium product logo reveal — "
        f"centered, balanced, with the character above and the text below. "
        f"Generate this image at 2K resolution."
    ),
    filename='nugget-branded-dark.png',
    aspect='3:4',
    res='2K'
)
time.sleep(5)

# ──────────────────────────────────────────────
# VARIANT 5: Waving/Greeting — For welcome state
# When user first opens the advisor, Nugget waves
# ──────────────────────────────────────────────
print('[5/6] Greeting pose — waving, for welcome screen')
generate(
    prompt=(
        f"Create an illustration of a gold nugget AI character named Nugget in a "
        f"friendly greeting pose. The character is a chunky, irregular gold nugget "
        f"with hyper-realistic metallic gold surface, warm intelligent amber eyes "
        f"with specular highlights, a big welcoming smile, and a tiny white hard hat "
        f"tilted to one side. "
        f"In this variant, the nugget has one small cartoon arm raised in a friendly "
        f"wave gesture — like greeting someone who just walked in. The other arm is "
        f"at its side. The expression is extra warm and welcoming — eyes slightly "
        f"wider, smile broader. "
        f"A speech bubble emerges from the nugget containing the text: "
        f"'Ask me anything!' in clean, bold, dark sans-serif font. "
        f"Background: soft warm gradient from cream (#FAFAF7) to white. "
        f"Golden glow behind the character. "
        f"This will be shown when a user first opens the AI advisor page. "
        f"Generate this image at 2K resolution."
    ),
    filename='nugget-greeting.png',
    aspect='4:3',
    res='2K'
)
time.sleep(5)

# ──────────────────────────────────────────────
# VARIANT 6: Thinking — For loading state
# While the agent processes a question, Nugget thinks
# ──────────────────────────────────────────────
print('[6/6] Thinking pose — for loading/processing state')
generate(
    prompt=(
        f"Create an illustration of a gold nugget AI character named Nugget in a "
        f"thoughtful, contemplating pose. The character is a chunky gold nugget with "
        f"hyper-realistic metallic surface, tiny tilted white hard hat, and expressive "
        f"cartoon features. "
        f"In this variant, the nugget has one small arm raised to its chin in a "
        f"classic 'thinking' pose. The eyes look slightly upward and to the side — "
        f"the expression of someone deep in thought, processing information. "
        f"Small, subtle golden sparkle particles float around the nugget, suggesting "
        f"active computation or mental energy. "
        f"Background: clean, transparent-friendly — very light gray (#F5F5F5) or "
        f"transparent. The character should work as an animated loading indicator. "
        f"Style: same Pixar-meets-photorealistic-gold as other variants. "
        f"Generate this image at 1K resolution."
    ),
    filename='nugget-thinking.png',
    aspect='1:1',
    res='1K'
)

# ──────────────────────────────────────────────
# REPORT
# ──────────────────────────────────────────────
print()
print('=' * 60)
print('NUGGET GENERATION COMPLETE')
print('=' * 60)
print()

if os.path.exists(OUTPUT_DIR):
    files = sorted(os.listdir(OUTPUT_DIR))
    total = 0
    for f in files:
        fp = os.path.join(OUTPUT_DIR, f)
        if os.path.isfile(fp):
            mb = os.path.getsize(fp) / (1024*1024)
            total += mb
            print(f'  {f:40s} {mb:6.1f} MB')
    print(f'\n  Total: {len(files)} images, {total:.1f} MB')
    print(f'  Output: {os.path.abspath(OUTPUT_DIR)}')

print()
print('VARIANTS GENERATED:')
print('  nugget-hero-dark.png      — Full character, dark bg (advisor page header, dashboard)')
print('  nugget-hero-light.png     — Full character, light bg (public site advisor)')
print('  nugget-avatar-circle.png  — Tight face crop (chat message avatar, circle-crop ready)')
print('  nugget-branded-dark.png   — Character + "NUGGET" text (splash, branding)')
print('  nugget-greeting.png       — Waving with "Ask me anything!" (welcome state)')
print('  nugget-thinking.png       — Thinking pose with sparkles (loading state)')
