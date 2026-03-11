#!/usr/bin/env python3
"""
NUGGET FINAL — Faceted Gem Design, 6 Production Variants
Model: gemini-3-pro-image-preview (Nano Banana Pro)

Locked design: Faceted gold gem nugget — geometric crystal faces that catch
light brilliantly, bright yellow-gold like a cut jewel made of pure 24k gold.
Pixar-quality character with intelligent friendly face.

Output: web/presentation/public/images/nugget/
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

# Reference the exploration winner for style consistency
REF_DIR = os.path.join(OUTPUT_DIR, 'exploration')
REF_IMAGE = os.path.join(REF_DIR, '03-faceted-gem.png')
has_ref = os.path.exists(REF_IMAGE)

def gen(prompt, filename, aspect='1:1', res='2K', retries=3):
    """Generate a single production image, optionally with reference."""
    out_path = os.path.join(OUTPUT_DIR, filename)
    contents = [prompt]
    if has_ref:
        contents.append(Image.open(REF_IMAGE))
    
    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=contents,
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
                    img_data = part.inline_data.data
                    with open(out_path, 'wb') as f:
                        f.write(img_data)
                    mb = os.path.getsize(out_path) / (1024 * 1024)
                    try:
                        pil_img = Image.open(out_path)
                        w, h = pil_img.size
                        print(f'  SUCCESS: {filename} — {w}x{h} — {mb:.1f}MB')
                    except Exception:
                        print(f'  SUCCESS: {filename} — {mb:.1f}MB')
                    return True
            print(f'  WARN: No image for {filename} (attempt {attempt+1})')
        except Exception as e:
            if '429' in str(e) or 'RESOURCE_EXHAUSTED' in str(e):
                wait = 2 ** attempt * 15
                print(f'  RATE LIMIT: Waiting {wait}s (attempt {attempt+1})')
                time.sleep(wait)
            else:
                print(f'  ERR: {e}')
                if attempt < retries - 1:
                    time.sleep(8)
    print(f'  FAIL: {filename}')
    return False


# ================================================================
# THE LOCKED CHARACTER DESCRIPTION — Faceted Gem Nugget
# ================================================================
NUGGET = (
    "A cartoon mascot character named Nugget — a FACETED GOLD GEM character. "
    "The body is shaped like a brilliant-cut gemstone carved from pure 24-karat gold: "
    "multiple flat geometric facets at different angles, each catching light differently, "
    "creating dazzling reflections and sparkles across the surface. Some facets are "
    "bright white-gold where light hits directly, others are rich deep yellow-gold in "
    "shadow, and others shimmer with warm amber reflections. The overall effect is a "
    "jewel-like brilliance — this character SPARKLES like a diamond made of gold. "
    "The gold is bright YELLOW gold — like a gold Oscar statuette or a freshly minted "
    "24k coin. NOT brown, NOT amber, NOT tarnished. Pure, brilliant, luminous gold. "
    "The face sits naturally on the front-facing facet: big expressive Pixar-quality "
    "eyes with amber-gold irises and bright white catchlights that make the eyes look "
    "alive and sparkling. The eyes are intelligent and warm — friendly but sharp. "
    "A confident, slightly playful smile. "
    "A LARGE, prominently oversized white hard hat sits on the top facet, tilted slightly "
    "to one side for personality — the hard hat is big and chunky relative to the body, "
    "making it an iconic defining feature of the character. It has a green accent "
    "suggesting the GMC brand. "
    "Small cute cartoon arms extend from the sides."
)

print('=' * 60)
print('NUGGET FINAL — FACETED GEM, 6 PRODUCTION VARIANTS')
print(f'Reference image: {"FOUND" if has_ref else "NOT FOUND (generating without reference)"}')
print('=' * 60)
print()

# ──────────────────────────────────────────────
# 1. HERO — DARK BACKGROUND
# Advisor page header (dashboard), splash screens
# ──────────────────────────────────────────────
print('[1/6] Hero — dark background')
ref_note = "Use the attached reference image as the character design to match. " if has_ref else ""
gen(
    f"{ref_note}"
    f"Create a high-quality character illustration at 2K resolution. "
    f"{NUGGET} "
    f"The character is centered with generous space around it. "
    f"Background: clean dark navy gradient (#0C1926 to #142840). "
    f"Behind the character, a warm golden light bloom radiates outward — soft, "
    f"ethereal, suggesting inner radiance. Tiny golden particle motes float in "
    f"the air around the character, catching light like dust in a sunbeam. "
    f"Three-point Pixar studio lighting: bright key light from upper right, "
    f"warm fill from left, subtle rim light from behind creating a golden edge "
    f"glow that separates the character from the dark background. "
    f"The overall feeling: a premium character reveal. Like the moment a Pixar "
    f"character steps into the spotlight for the first time. Warm, impressive, "
    f"and impossible not to like. "
    f"Generate this image at 2K resolution.",
    'nugget-hero-dark.png',
    aspect='1:1',
    res='2K'
)
time.sleep(10)

# ──────────────────────────────────────────────
# 2. HERO — LIGHT BACKGROUND
# Public-facing advisor page header
# ──────────────────────────────────────────────
print('[2/6] Hero — light background')
gen(
    f"{ref_note}"
    f"Create a high-quality character illustration at 2K resolution. "
    f"{NUGGET} "
    f"The character is centered with generous white space around it. "
    f"Background: clean warm white (#FAFAF7). "
    f"A soft golden glow halos the character, creating warmth against the light "
    f"background. A very subtle shadow beneath grounds the character — it's not "
    f"floating, it has weight and presence. "
    f"The golden facets should still sparkle brilliantly even against the light "
    f"background — the specular highlights and facet reflections create enough "
    f"contrast to make the character pop. "
    f"Clean, bright, professional. This goes on a corporate website that needs "
    f"to impress executives from a multi-billion dollar company. "
    f"Generate this image at 2K resolution.",
    'nugget-hero-light.png',
    aspect='1:1',
    res='2K'
)
time.sleep(10)

# ──────────────────────────────────────────────
# 3. CHAT AVATAR — TIGHT FACE CROP
# Circle-crop ready, next to every chat message
# ──────────────────────────────────────────────
print('[3/6] Chat avatar — circle crop')
gen(
    f"{ref_note}"
    f"Create a CLOSE-UP portrait of the Nugget character at 1K resolution. "
    f"Show ONLY the face and the LARGE tilted hard hat — tightly cropped, "
    f"filling the entire frame. "
    f"The faceted gold gem surface fills the background of the frame. Big "
    f"expressive amber-gold eyes with bright catchlights — intelligent and warm. "
    f"Confident playful smile. The large white hard hat is prominent at the top edge. "
    f"The gold facets around the face catch light brilliantly — some facets "
    f"almost white, others deep rich gold. "
    f"Background: solid dark navy (#0C1926) visible only at the corners. "
    f"This image will be displayed as a CIRCULAR AVATAR at 32-80px — the "
    f"composition must work perfectly in a circle crop. Keep the face centered "
    f"with the eyes at roughly the center of the frame. "
    f"Pixar quality. Generate at 1K resolution.",
    'nugget-avatar-circle.png',
    aspect='1:1',
    res='1K'
)
time.sleep(10)

# ──────────────────────────────────────────────
# 4. BRANDED — CHARACTER WITH TEXT
# Splash screen, branding, marketing
# ──────────────────────────────────────────────
print('[4/6] Branded — with NUGGET text')
gen(
    f"{ref_note}"
    f"Create a branded character illustration at 2K resolution. "
    f"{NUGGET} "
    f"The character is positioned in the upper two-thirds of the image, centered. "
    f"Below the character, the text 'NUGGET' is rendered in bold, clean, modern "
    f"sans-serif font — white with a subtle golden metallic sheen on the letter "
    f"edges that catches light. The letters are large and commanding. "
    f"Below 'NUGGET' in much smaller, lighter text: "
    f"'AI Mining Intelligence Advisor' in thin white sans-serif. "
    f"Background: dark navy gradient (#0C1926). The golden glow behind the "
    f"character subtly illuminates the text from above. "
    f"Golden particle motes float in the space between character and text. "
    f"The overall composition feels like a premium product brand reveal — "
    f"the kind of title card that appears in a cinematic trailer. "
    f"Generate at 2K resolution.",
    'nugget-branded-dark.png',
    aspect='3:4',
    res='2K'
)
time.sleep(10)

# ──────────────────────────────────────────────
# 5. GREETING — WAVING, WELCOME STATE
# First thing users see when opening the advisor
# ──────────────────────────────────────────────
print('[5/6] Greeting — waving welcome')
gen(
    f"{ref_note}"
    f"Create a character illustration at 2K resolution. "
    f"The Nugget character — a faceted gold gem with Pixar-quality face, LARGE "
    f"prominently oversized tilted hard hat — in a FRIENDLY GREETING POSE. "
    f"One small cartoon arm is raised in a cheerful wave. The expression is "
    f"extra welcoming — eyes a bit wider, smile a bit broader, radiating warmth. "
    f"The gold facets sparkle with bright yellow-gold brilliance. "
    f"A speech bubble emerges naturally from the character. Inside the speech "
    f"bubble in clean bold dark sans-serif text: 'Ask me anything!' "
    f"The speech bubble is white with a subtle golden shadow. "
    f"Background: soft warm gradient from cream (#FAFAF7) to white. "
    f"Subtle golden glow behind the character. "
    f"This is the first thing a user sees when they open the AI advisor — "
    f"it must feel immediately inviting and approachable. "
    f"Generate at 2K resolution.",
    'nugget-greeting.png',
    aspect='4:3',
    res='2K'
)
time.sleep(10)

# ──────────────────────────────────────────────
# 6. THINKING — PROCESSING STATE
# Shown while agent generates a response
# ──────────────────────────────────────────────
print('[6/6] Thinking — processing state')
gen(
    f"{ref_note}"
    f"Create a character illustration at 1K resolution. "
    f"The Nugget character — a faceted gold gem with Pixar-quality face, LARGE "
    f"prominently oversized tilted hard hat — in a THINKING POSE. "
    f"One small cartoon arm raised to chin in the classic contemplation gesture. "
    f"Eyes looking slightly upward and to the side — deep in thought, processing "
    f"a question. Expression is focused and curious, not confused. "
    f"Around the character, small golden sparkle particles float and orbit — "
    f"suggesting active mental computation. The sparkles are tiny points of "
    f"bright gold light. "
    f"The facets on the character's body seem to glow slightly brighter than "
    f"normal, as if the thinking is generating extra golden energy. "
    f"Background: very light gray (#F5F5F5) for versatile placement. "
    f"This will be used as an animated-feeling loading indicator in the chat. "
    f"Generate at 1K resolution.",
    'nugget-thinking.png',
    aspect='1:1',
    res='1K'
)

# ================================================================
# REPORT
# ================================================================
print()
print('=' * 60)
print('NUGGET FINAL GENERATION COMPLETE')
print('=' * 60)
print()

if os.path.exists(OUTPUT_DIR):
    targets = [
        'nugget-hero-dark.png', 'nugget-hero-light.png',
        'nugget-avatar-circle.png', 'nugget-branded-dark.png',
        'nugget-greeting.png', 'nugget-thinking.png'
    ]
    total = 0
    for f in targets:
        fp = os.path.join(OUTPUT_DIR, f)
        if os.path.isfile(fp):
            mb = os.path.getsize(fp) / (1024 * 1024)
            total += mb
            print(f'  {f:35s} {mb:5.1f} MB')
        else:
            print(f'  {f:35s}  MISSING')
    print(f'\n  Total: {total:.1f} MB')

print()
print('INTEGRATION:')
print('  nugget-hero-dark.png      → Dashboard advisor page header')
print('  nugget-hero-light.png     → Public advisor page header')
print('  nugget-avatar-circle.png  → Chat message avatar (32-80px circle)')
print('  nugget-branded-dark.png   → Splash screen, branding')
print('  nugget-greeting.png       → Advisor welcome/empty state')
print('  nugget-thinking.png       → Loading/processing indicator')
