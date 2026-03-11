#!/usr/bin/env python3
"""
NUGGET CHARACTER EXPLORATION v3 — 20 Variations
Model: gemini-3-pro-image-preview (Nano Banana Pro)

STRATEGY: All 20 share the same base character DNA (gold nugget, bright yellow-gold,
cute face, hard hat). Each variation changes ONE or TWO elements to explore the design
space systematically. This ensures we can mix-and-match winning elements into a final design.

Output: web/presentation/public/images/nugget/exploration/
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
OUTPUT_DIR = os.path.join('web', 'presentation', 'public', 'images', 'nugget', 'exploration')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Track results
results = {}

def gen(prompt, filename, retries=2):
    """Generate a single exploration image."""
    out_path = os.path.join(OUTPUT_DIR, filename)
    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=[prompt],
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE'],
                    image_config=types.ImageConfig(
                        aspect_ratio='1:1',
                        image_size='1K'
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
                    print(f'  OK: {filename}')
                    results[filename] = 'SUCCESS'
                    return True
            print(f'  WARN: No image for {filename} (attempt {attempt+1})')
        except Exception as e:
            if '429' in str(e) or 'RESOURCE_EXHAUSTED' in str(e):
                print(f'  RATE LIMIT: Waiting 30s...')
                time.sleep(30)
            else:
                print(f'  ERR: {e}')
                time.sleep(5)
    print(f'  FAIL: {filename}')
    results[filename] = 'FAILED'
    return False


# ================================================================
# SHARED CHARACTER DNA — Every variation includes this core
# ================================================================
# This is NOT pasted into prompts directly — it's woven into each
# one naturally to avoid robotic repetition. But every prompt must
# hit these mandatory attributes:
#
# SHAPE:    A gold nugget — rounded, organic, friendly shape
# COLOR:    BRIGHT WARM YELLOW-GOLD like a gold Oscar statuette,
#           a polished gold trophy, a 24-karat gold coin fresh
#           from the mint. NOT brown. NOT amber. NOT tarnished.
# SURFACE:  Mirror-polished with bright white specular highlights
# FACE:     Cute expressive face with warm eyes and confident smile
# FRAMING:  Character centered, filling ~70% of canvas
# BG:       Solid dark navy (#0C1926)
# QUALITY:  Pixar/Disney character design quality
# SIZE:     1K resolution
# ================================================================

print('=' * 60)
print('NUGGET CHARACTER EXPLORATION v3 — 20 VARIATIONS')
print('Model: gemini-3-pro-image-preview')
print('=' * 60)
print()

# ================================================================
# BATCH 1 (1-5): BODY SHAPE VARIATIONS
# Same face, same accessories — only the body shape changes
# ================================================================
print('--- BATCH 1: BODY SHAPE (1-5) ---')

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "The body is a PERFECTLY ROUND smooth gold sphere — like a golden "
    "Christmas ornament or a gold ball trophy. The surface is mirror-polished "
    "bright YELLOW gold (like a gold Oscar statuette) with crisp white specular "
    "highlights showing the light source. Big round expressive Pixar-style eyes "
    "with amber-gold irises and bright catchlights. A warm confident smile. "
    "A tiny white hard hat sits on top, tilted slightly to one side. Small cute "
    "cartoon arms. Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). "
    "Style: Pixar movie character quality, 3D rendered look. 1K resolution.",
    '01-round-smooth.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "The body is a SOFTLY ROUNDED nugget shape — organic and slightly irregular "
    "like a river-polished stone, with gentle rounded bumps that catch light at "
    "different angles. NOT lumpy or rough — think smooth river stone made of gold. "
    "The surface is mirror-polished bright YELLOW gold (like a freshly minted gold "
    "coin) with multiple white specular highlights across the rounded surfaces. "
    "Big expressive Pixar-style eyes with amber-gold irises. Warm confident smile. "
    "Tiny white hard hat tilted to one side. Small cartoon arms. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). "
    "Style: Pixar movie character quality. 1K resolution.",
    '02-soft-organic.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "The body is a FACETED GEM shape — like a gold crystal with flat geometric "
    "faces that each catch light at different angles, creating a brilliant "
    "diamond-like sparkle effect. Each facet is bright YELLOW gold but reflects "
    "light differently, some almost white-gold, some deep rich gold. "
    "Like a jewel carved from pure gold. "
    "Big expressive Pixar-style eyes with amber-gold irises. Confident smile. "
    "Tiny white hard hat on top. Small cartoon arms. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). "
    "Style: Pixar quality with extra sparkle. 1K resolution.",
    '03-faceted-gem.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "The body is a CHUNKY TEARDROP shape — wider at the bottom, slightly "
    "narrower at the top where the hard hat sits, like a cute golden egg or "
    "a friendly drop shape. This gives the character a stable, grounded, "
    "trustworthy silhouette. Surface is mirror-polished bright YELLOW gold "
    "(like a gold trophy) with white specular highlights. "
    "Big expressive Pixar-style eyes. Warm smile. "
    "Tiny white hard hat on the narrow top. Small cartoon arms at the sides. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). "
    "Style: Pixar quality. 1K resolution.",
    '04-teardrop.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "The body is a SQUAT CUBE with heavily rounded corners — like a rounded "
    "golden dice or a gold marshmallow. Compact, solid, stable. Every surface "
    "is mirror-polished bright YELLOW gold with clean specular highlights. "
    "The rounded-cube shape feels modern, iconic, and instantly readable at any size. "
    "Big expressive Pixar-style eyes. Confident smile. "
    "Tiny white hard hat. Small cartoon arms. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). "
    "Style: Pixar quality, very clean and graphic. 1K resolution.",
    '05-rounded-cube.png'
)
time.sleep(15)  # Longer pause between batches

# ================================================================
# BATCH 2 (6-10): EYE & EXPRESSION VARIATIONS  
# Same soft-organic body shape — only the face changes
# ================================================================
print('--- BATCH 2: EYES & EXPRESSION (6-10) ---')

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded organic gold nugget body, mirror-polished bright YELLOW gold "
    "like a gold Oscar statuette. "
    "FACE: Very LARGE round Disney princess-style eyes taking up 40% of the face. "
    "Each eye has a big bright white catchlight, a golden-amber iris, and long "
    "subtle eyelashes. The eyes are the star — irresistibly cute and soulful. "
    "Small gentle smile. Rosy golden blush on cheeks. "
    "Tiny white hard hat. Small cartoon arms. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). Pixar quality. 1K resolution.",
    '06-huge-soulful-eyes.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded organic gold nugget body, mirror-polished bright YELLOW gold "
    "like a gold trophy. "
    "FACE: Confident SMART eyes — slightly narrower than round, with sharp "
    "intelligent golden irises that suggest this character KNOWS things. One "
    "eyebrow slightly raised. A knowing half-smile, almost a smirk. The expression "
    "of a brilliant advisor who enjoys being asked questions. "
    "Tiny white hard hat. Small cartoon arms, one raised to chin in a thoughtful pose. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). Pixar quality. 1K resolution.",
    '07-smart-confident.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded organic gold nugget body, mirror-polished bright YELLOW gold. "
    "FACE: JOYFUL and ENERGETIC — eyes squeezed into happy crescents from a huge "
    "beaming smile. Pure happiness radiating from the face. Tiny sparkle effects "
    "around the character suggesting excitement. This is the happiest gold nugget "
    "in the world and it's thrilled to meet you. "
    "Tiny white hard hat slightly bouncing from excitement. Arms raised in celebration. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). Pixar quality. 1K resolution.",
    '08-joyful-energy.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded organic gold nugget body, mirror-polished bright YELLOW gold. "
    "FACE: WARM and PATERNAL — kind eyes with slight crinkles suggesting wisdom "
    "and experience. A gentle, reassuring smile that says 'don't worry, I've got "
    "this.' This is the face of someone you trust immediately. Not young and cute — "
    "warm and reliable. Think: a beloved mentor. "
    "Tiny white hard hat. Small cartoon arms, one gesturing welcomingly. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). Pixar quality. 1K resolution.",
    '09-warm-mentor.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded organic gold nugget body, mirror-polished bright YELLOW gold. "
    "FACE: COOL and MODERN — clean minimal features. Perfectly round medium-sized "
    "eyes with a calm steady gaze. Subtle closed-mouth smile. The expression is "
    "composed and professional but still friendly. Think: a tech company mascot "
    "that's approachable but taken seriously. Sleek. "
    "Tiny white hard hat. Small cartoon arms at sides. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). Pixar quality. 1K resolution.",
    '10-cool-modern.png'
)
time.sleep(15)

# ================================================================
# BATCH 3 (11-15): ACCESSORY & IDENTITY VARIATIONS
# Same body and face — only accessories change
# ================================================================
print('--- BATCH 3: ACCESSORIES (11-15) ---')

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded bright YELLOW gold body, big friendly Pixar eyes, warm smile. "
    "ACCESSORY: White hard hat with a tiny HEADLAMP attached to the front. "
    "The headlamp emits a small cone of warm golden light. This says 'I explore "
    "deep underground places and bring light to dark data.' "
    "Small cartoon arms, one holding a tiny rolled-up geological map. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). Pixar quality. 1K resolution.",
    '11-headlamp-map.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded bright YELLOW gold body, big friendly Pixar eyes, warm smile. "
    "ACCESSORY: Instead of a hard hat, a tiny GOLD CROWN with small jewel "
    "accents — making Nugget look like the king of the mine. The crown is "
    "the same bright gold as the body but with tiny red and green gems. "
    "Royal but still cute and approachable. "
    "Small cartoon arms, one giving a wave. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). Pixar quality. 1K resolution.",
    '12-gold-crown.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded bright YELLOW gold body, big friendly Pixar eyes, warm smile. "
    "ACCESSORY: White hard hat with a tiny green hexagonal 'G' logo on it "
    "(the GMC brand mark). Around the body, subtle HOLOGRAPHIC RINGS orbit "
    "slowly — thin glowing cyan-white circles suggesting AI data processing. "
    "The rings are ethereal and tech-looking against the warm gold. "
    "Mining identity (hat + logo) meets AI identity (holographic rings). "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). Pixar quality. 1K resolution.",
    '13-holo-rings.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded bright YELLOW gold body, big friendly Pixar eyes, warm smile. "
    "ACCESSORY: White hard hat AND a tiny orange reflective safety vest wrapped "
    "around the nugget body. The vest has a small reflective stripe that catches "
    "light. This is the most adorable safety-compliant gold nugget mascot ever. "
    "The orange vest creates great color contrast against the yellow gold. "
    "Small cartoon arms poking through vest arm holes. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). Pixar quality. 1K resolution.",
    '14-safety-vest.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded bright YELLOW gold body, big friendly Pixar eyes, warm smile. "
    "ACCESSORY: White hard hat. Around Nugget's neck hangs a tiny magnifying "
    "glass on a thin gold chain — the tool of an investigator and analyst. "
    "In one hand, a tiny glowing holographic tablet showing a chart (suggesting "
    "data analysis). Mining tool (magnifying glass) meets tech tool (hologram). "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). Pixar quality. 1K resolution.",
    '15-magnifier-tablet.png'
)
time.sleep(15)

# ================================================================
# BATCH 4 (16-20): RENDERING STYLE VARIATIONS
# Same character — different artistic rendering approaches
# ================================================================
print('--- BATCH 4: RENDERING STYLE (16-20) ---')

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded bright YELLOW gold nugget with big Pixar eyes, warm smile, "
    "tiny white hard hat. "
    "STYLE: Full PIXAR 3D RENDER — subsurface scattering making the gold glow "
    "from within. Perfect three-point studio lighting: key light from upper right "
    "creating a bright specular highlight, fill light from left for warmth, rim "
    "light from behind separating the character from the dark background. "
    "Ray-traced reflections. Ambient occlusion in subtle crevices. "
    "The absolute highest quality 3D character rendering. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). 1K resolution.",
    '16-pixar-render.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "STYLE: CLEAN FLAT VECTOR illustration. Bold simple shapes, no gradients — "
    "the gold is represented by 3 flat colors: bright yellow-gold for the base, "
    "lighter gold for highlights, darker gold for shadows. Black outlines optional. "
    "Big simple round eyes, clean smile, white hard hat as flat shapes. "
    "This must read perfectly at 32x32 pixels as a favicon AND at full size. "
    "Ultra-clean, ultra-minimal, ultra-readable. Like a world-class app icon. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). 1K resolution.",
    '17-flat-vector.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded bright YELLOW gold nugget with big eyes, warm smile, "
    "tiny white hard hat. "
    "STYLE: WATERCOLOR / STORYBOOK illustration — soft painted edges, visible "
    "brush texture in the gold surface, warm organic feeling like a beloved "
    "children's book character. The gold shimmers with painted-on specular "
    "highlights. Charming, handmade, warm. This style makes you feel something. "
    "Character centered, filling 70% of canvas. "
    "Background: soft dark navy watercolor wash. 1K resolution.",
    '18-watercolor.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "Soft rounded bright YELLOW gold nugget, big eyes, warm smile, "
    "tiny white hard hat. "
    "STYLE: LUXURY PREMIUM — the gold surface looks like it was photographed "
    "for a Tiffany or Cartier advertisement. Perfect mirror reflections. "
    "Subtle warm caustic light patterns on the dark background cast by the "
    "gold surface. Floating golden particle dust in the air. The character is "
    "cute but EXPENSIVE-looking. Premium. Aspirational. Like a collectible "
    "golden figurine worth thousands. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy with subtle golden particles. 1K resolution.",
    '19-luxury-premium.png'
)
time.sleep(8)

gen(
    "Create a cartoon mascot character: a gold nugget named Nugget. "
    "This is THE SWEET SPOT design combining the best of everything: "
    "Soft rounded organic bright YELLOW gold body like a river-polished golden "
    "stone — smooth, brilliant, mirror-polished like a gold Oscar statuette. "
    "Big warm Pixar-quality eyes with golden irises and bright catchlights — "
    "intelligent but friendly, not childish. A natural confident smile. "
    "Tiny white hard hat with the smallest hint of a green accent, tilted "
    "slightly for personality. One small arm giving a casual friendly wave. "
    "A subtle warm golden glow behind the character suggesting inner light. "
    "The design must work on both a corporate mining website AND as a friendly "
    "AI assistant avatar. Professional yet personable. Trustworthy yet charming. "
    "Character centered, filling 70% of canvas. "
    "Background: solid dark navy (#0C1926). "
    "Pixar movie quality 3D rendering. 1K resolution.",
    '20-sweet-spot.png'
)

# ================================================================
# FINAL REPORT
# ================================================================
print()
print('=' * 60)
print('EXPLORATION COMPLETE')
print('=' * 60)
print()

successes = [k for k, v in results.items() if v == 'SUCCESS']
failures = [k for k, v in results.items() if v == 'FAILED']

if os.path.exists(OUTPUT_DIR):
    files = sorted(os.listdir(OUTPUT_DIR))
    for f in files:
        fp = os.path.join(OUTPUT_DIR, f)
        if os.path.isfile(fp):
            mb = os.path.getsize(fp) / (1024*1024)
            print(f'  {f:35s} {mb:5.1f} MB')

print(f'\n  Successes: {len(successes)}')
print(f'  Failures:  {len(failures)}')

if failures:
    print(f'\n  FAILED IMAGES:')
    for f in failures:
        print(f'    - {f}')
    print(f'\n  To retry failures, run this script again — it will')
    print(f'  overwrite existing files and only retry missing ones.')

print(f'\n  Output: {os.path.abspath(OUTPUT_DIR)}')
print()
print('NEXT STEPS:')
print('1. Open the exploration/ folder and review all images')
print('2. Pick your TOP 3 favorites (note the filenames)')
print('3. Tell the design lead which elements you like from each:')
print('   - Body shape from which number?')
print('   - Eyes/expression from which number?')
print('   - Accessories from which number?')
print('   - Rendering style from which number?')
print('4. Final Nugget will combine winning elements into high-res variants')
