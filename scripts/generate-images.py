"""
Nano Banana Pro — Batch Image Generation for TopQualityMinerals.com
Model: gemini-3-pro-image-preview
"""
import os
import sys
import time
from dotenv import load_dotenv

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from google import genai
from google.genai import types
from PIL import Image

# --- Client ---
api_key = os.environ.get('GEMINI_IMAGE_API_KEY')
if not api_key:
    print('ERROR: GEMINI_IMAGE_API_KEY not found in .env')
    sys.exit(1)

client = genai.Client(api_key=api_key)

# --- Paths ---
output_dir = os.path.join(os.path.dirname(__file__), '..', 'web', 'presentation', 'public', 'images', 'generated')
ref_dir = os.path.join(os.path.dirname(__file__), '..', 'web', 'presentation', 'public', 'images', 'site-photos')
os.makedirs(output_dir, exist_ok=True)


def generate(prompt, filename, refs=None, aspect='16:9', res='2K'):
    """Generate a single image with optional reference images."""
    contents = [prompt]
    if refs:
        for ref_path in refs:
            full_path = os.path.join(ref_dir, ref_path)
            if os.path.exists(full_path):
                contents.append(Image.open(full_path))
                print(f'  Loaded reference: {ref_path}')
            else:
                print(f'  WARNING: Reference image not found: {full_path}')

    try:
        response = client.models.generate_content(
            model='gemini-3-pro-image-preview',
            contents=contents,
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect,
                    image_size=res
                ),
                safety_settings=[
                    types.SafetySetting(category='HARM_CATEGORY_DANGEROUS_CONTENT', threshold='BLOCK_ONLY_HIGH'),
                ],
            )
        )
        for part in response.parts:
            if hasattr(part, 'inline_data') and part.inline_data:
                save_path = os.path.join(output_dir, filename)
                # Save the raw image bytes directly
                image_data = part.inline_data.data
                with open(save_path, 'wb') as f:
                    f.write(image_data)
                size_kb = len(image_data) / 1024
                # Try to get dimensions via PIL
                try:
                    img = Image.open(save_path)
                    w, h = img.size
                    print(f'  SUCCESS: {filename} saved ({w}x{h}, {size_kb:.0f} KB)')
                except Exception:
                    print(f'  SUCCESS: {filename} saved ({size_kb:.0f} KB)')
                return True
            elif hasattr(part, 'text') and part.text:
                print(f'  Model note: {part.text[:200]}')
        print(f'  FAILED: No image in response for {filename}')
        return False
    except Exception as e:
        print(f'  ERROR generating {filename}: {e}')
        return False


# ============================================================
# GENERATION BATCH — Run all 10 prompts
# ============================================================

print('=== Nano Banana Pro Image Generation ===')
print(f'Model: gemini-3-pro-image-preview')
print(f'Output: {os.path.abspath(output_dir)}')
print()

results = {}

# --- IMAGE 1: Enhanced Hero Landscape ---
print('1/10: Enhanced hero landscape...')
results['hero-landscape-enhanced.png'] = generate(
    prompt=(
        "Using the landscape from the reference image as the base composition, "
        "create a cinematic wide-angle photograph of this tropical mountain scene "
        "enhanced with golden hour lighting from the left. The clouds should glow "
        "with warm amber and rose tones. The green mountains should have rich, "
        "saturated color with depth created by atmospheric perspective — mountains "
        "further away are hazier and bluer. The foreground earth should show subtle "
        "reddish mineral-rich soil. The overall mood should feel like a National "
        "Geographic cover photograph — awe-inspiring, vast, and premium. "
        "Photorealistic, shot on a medium format Hasselblad, shallow atmospheric "
        "depth of field, cinematic color grading with teal shadows and golden highlights. "
        "Generate this image at 4K resolution."
    ),
    filename='hero-landscape-enhanced.png',
    refs=['Mountains.jpg'],
    aspect='16:9',
    res='4K'
)

# --- IMAGE 2: Geological Cross-Section Infographic ---
print('2/10: Geological cross-section infographic...')
results['cross-section-infographic.png'] = generate(
    prompt=(
        "Create a professional geological cross-section infographic showing the "
        "layered structure of a polymetallic porphyry copper-gold deposit. The image "
        "should be a clean, modern scientific illustration suitable for a corporate "
        "mining presentation on a projector screen. "
        "The cross-section shows these layers from top to bottom: "
        "1. Surface topography with tropical vegetation silhouette along the top edge. "
        "2. Iron Oxide Cap zone (0-30m depth) in warm rust-red and brown tones. "
        "3. Transition Zone (30-60m) in gray tones. "
        "4. Sulfide Mineralization Zone (60-100m) in rich copper-teal and bronze tones "
        "with a label reading 'MASSIVE SULFIDIZATION CONFIRMED AT 60-65m'. "
        "5. Deep Porphyry Target Zone (100-200m) shown as a dashed outline in gold "
        "with the label 'GEOPHYSICAL TARGET — PORPHYRY Cu-Au SYSTEM'. "
        "Eight vertical drill holes are shown as thin white lines dropping from the surface "
        "to various depths. The deepest hole is labeled 'SBF-1C — 160m' and reaches "
        "into the sulfide zone. "
        "A depth scale on the right shows 0m, 50m, 100m, 150m, 200m. "
        "Color legend at the bottom left. "
        "Text at bottom: 'Schematic cross-section based on SGECS geological assessment, "
        "filed with MGB Region XI, June 2025' in small, clean sans-serif font. "
        "Style: dark navy background (#0C1926), clean lines, modern corporate infographic "
        "aesthetic with bold text labels. Colors should glow subtly against the dark background. "
        "Typography: bold sans-serif for labels, consistent sizing. "
        "No cartoonish elements — this must look like it came from a professional geological "
        "consulting firm's report."
    ),
    filename='cross-section-infographic.png',
    aspect='16:9',
    res='2K'
)

# --- IMAGE 3: Iron Ore Hero with Data Overlay ---
print('3/10: Iron ore hero with data overlay...')
results['iron-hero-data.png'] = generate(
    prompt=(
        "Using the iron ore specimen from the reference image as the visual base, "
        "create a dramatic, cinematic product showcase image for premium iron ore. "
        "The iron ore sits on a dark surface with dramatic side lighting creating "
        "metallic highlights and deep shadows. "
        "In the upper right area of the image, render the text '67.31%' in very large, "
        "bold, white sans-serif font (approximately 120pt equivalent). Below it, smaller text "
        "reads 'Fe — POSCO CONFIRMED' in a clean, thin sans-serif. "
        "Below that, even smaller: 'Production-Grade Premium Iron Ore' in gold color (#C5922E). "
        "The text should feel naturally integrated into the composition, not pasted on — "
        "as if this were a luxury product advertisement in a high-end magazine. "
        "The overall mood is dark, premium, authoritative. Like an advertisement for "
        "something rare and valuable. Shallow depth of field with the ore in sharp focus "
        "and the background falling to smooth bokeh. "
        "Color palette: blacks, dark grays, metallic silver highlights, with the gold "
        "accent text providing the only warm color. "
        "Generate this image at 2K resolution."
    ),
    filename='iron-hero-data.png',
    refs=['Iron Ore.jpg'],
    aspect='16:9',
    res='2K'
)

# --- IMAGE 4: Copper Ore Hero with Data Overlay ---
print('4/10: Copper ore hero with data overlay...')
results['copper-hero-data.png'] = generate(
    prompt=(
        "Using the copper ore specimen from the reference image as the visual base, "
        "create a dramatic showcase image for high-grade copper mineralization. "
        "The copper ore with its vivid turquoise, teal, indigo, and rust colors fills "
        "the frame with macro detail. Rich, saturated mineral colors should be enhanced "
        "to look stunning — the natural iridescence of chalcopyrite and malachite "
        "should shimmer. "
        "In the lower left area, render the text '39.5%' in very large, bold, white "
        "sans-serif font. Below it: 'Cu — NEAR-CONCENTRATE GRADE' in clean thin font. "
        "Below that: 'Four Laboratories. One Decade of Confirmation.' in copper color (#B87333). "
        "The text placement should leave the most visually striking part of the mineral "
        "visible and dominant. The text is secondary to the beauty of the mineral itself. "
        "Style: macro photography, rich saturated color, slight vignette at edges, "
        "the mineral specimen should look like a precious object worth millions. "
        "Generate this image at 2K resolution."
    ),
    filename='copper-hero-data.png',
    refs=['Complex Ore.jpg'],
    aspect='16:9',
    res='2K'
)

# --- IMAGE 5: Gold Ore Hero with Data Overlay ---
print('5/10: Gold ore hero with data overlay...')
results['gold-hero-data.png'] = generate(
    prompt=(
        "Using the gold-bearing ore specimen from the reference image as the base, "
        "create a premium showcase image. The visible gold veins in the dark ore "
        "should be enhanced with warm, glowing light that makes the gold appear to "
        "luminously shine from within the rock. "
        "In the upper right: '20.35' in very large bold white sans-serif, with 'g/t Au' "
        "next to it slightly smaller. Below: 'HIGHEST FIRE ASSAY RESULT' in thin white font. "
        "Below that: 'By-Product Revenue from Copper Processing' in gold color (#C5922E). "
        "The gold veins in the ore should be the visual hero — they should almost glow. "
        "Dark, moody lighting with the gold as the only warm light source. "
        "Shot style: macro, shallow depth of field, the gold catching light like jewelry "
        "in a display case. Premium, luxurious feeling. "
        "Generate this image at 2K resolution."
    ),
    filename='gold-hero-data.png',
    refs=['Gold Ore.jpg'],
    aspect='16:9',
    res='2K'
)

# --- IMAGE 6: Partnership Ecosystem Diagram ---
print('6/10: Partnership ecosystem diagram...')
results['partnership-ecosystem.png'] = generate(
    prompt=(
        "Create a professional corporate infographic showing a strategic partnership "
        "ecosystem between two companies. Dark navy background (#0C1926). "
        "LEFT SIDE: A green hexagonal icon with 'GMC' text, with 5 connected nodes below: "
        "'MPSA — 5,906 Hectares', '9-Lab Validated Deposit', 'Community Trust — 60% Lumad', "
        "'MGB Approved Operator', '15+ Years Site Knowledge'. Each node is a rounded rectangle "
        "with green (#2E7D32) left border. "
        "RIGHT SIDE: A gold hexagonal icon with 'PARTNER' text, with 5 connected nodes: "
        "'Construction Capability', 'Processing Expertise', 'Energy Infrastructure', "
        "'Technology & Data Science', 'Financial Capacity'. Each node has gold (#C5922E) left border. "
        "CENTER: Flowing connection lines from each left node to its corresponding right node, "
        "creating a visual bridge. The lines are subtle gradients from green to gold. "
        "At the bottom center, a larger rounded rectangle contains: "
        "'THE NATURAL NEXT STEP — From Mining Services to Mining Partnership' in white text. "
        "Style: modern corporate infographic, clean sans-serif typography, the layout should "
        "feel balanced and professional. Subtle glow effects on the connection lines. "
        "This should look like a slide from a McKinsey presentation."
    ),
    filename='partnership-ecosystem.png',
    aspect='16:9',
    res='2K'
)

# --- IMAGE 7: Evidence Portfolio Grid ---
print('7/10: Evidence portfolio grid...')
results['evidence-portfolio.png'] = generate(
    prompt=(
        "Create a professional infographic showing a grid of 9 laboratory validation "
        "cards arranged in a 3x3 grid. Dark navy background (#0C1926). "
        "Title at top: 'NINE LABORATORIES. FIVE COUNTRIES. ONE DEPOSIT MODEL.' in bold "
        "white sans-serif with gold (#C5922E) accent line below. "
        "Each card is a dark rounded rectangle with subtle border. Each contains: "
        "Row 1: '1. POSCO International' with South Korea flag emoji, '67.31% Fe' in large gold text. "
        "'2. Intertek Minerals' with Philippines flag, '136 Samples' in large text. "
        "'3. Beijing BGRIMM' with China flag, '20.72% Cu' in large text. "
        "Row 2: '4. Davao Analytical' with Philippines flag, '39.5% Cu' in large copper text. "
        "'5. HK Imperial' with Philippines flag, '120,000 WMT Processed' in large text. "
        "'6. Ostrea Mineral Labs' with Philippines flag, '20.35 g/t Au' in large gold text. "
        "Row 3: '7. CCIC Philippines' with Philippines flag, '59.34% Fe' in large text. "
        "'8. SGS Korea' with South Korea flag, 'Core Samples' in large text. "
        "'9. Lab Uji Kimia' with Indonesia flag, 'International Validation' in large text. "
        "Style: dark theme, each card has a subtle gradient background that shifts color "
        "based on the primary mineral (iron cards slightly reddish, copper cards slightly teal, "
        "gold cards slightly amber). Clean sans-serif typography throughout. "
        "Professional corporate infographic quality."
    ),
    filename='evidence-portfolio.png',
    aspect='16:9',
    res='2K'
)

# --- IMAGE 8: Development Timeline ---
print('8/10: Development timeline infographic...')
results['timeline-infographic.png'] = generate(
    prompt=(
        "Create a horizontal timeline infographic showing the development history of a "
        "mining project from 2007 to 2026. Dark navy background (#0C1926). "
        "A horizontal golden line runs across the center of the image. "
        "Along this line, 8 milestone nodes are placed at intervals: "
        "2007 — 'MPSA GRANTED' (white circle, green glow) "
        "2012 — 'FIRST ASSAYS' (white circle) "
        "2015 — 'IRON ORE EXPORT TO CHINA' (white circle, gold glow) "
        "2017 — 'DRILL PROGRAM LAUNCHED' (white circle) "
        "2019 — 'POSCO CONFIRMS 67.31% Fe' (white circle, gold glow, slightly larger) "
        "2022 — 'MGB DIRECTOR ORDER' (white circle, green glow) "
        "2024 — '8 DRILL HOLES — 493m TOTAL DEPTH' (white circle) "
        "2025-26 — 'SGECS REPORT — 37.7M MT RESOURCE' (white circle, gold glow, largest node) "
        "Each node has the year in bold JetBrains-style monospace font above the line, "
        "and the event description in clean sans-serif below the line. "
        "The golden line should have a subtle animated-feel glow, thicker at recent nodes. "
        "Style: sleek, modern, premium corporate presentation quality. "
        "The progression from left to right should feel like momentum building toward the present."
    ),
    filename='timeline-infographic.png',
    aspect='21:9',
    res='2K'
)

# --- IMAGE 9: Topographic Background Texture ---
print('9/10: Topographic background texture...')
results['topo-texture-dark.png'] = generate(
    prompt=(
        "Create a subtle topographic contour line pattern on a dark navy background "
        "(#0C1926). The contour lines should be very thin (1px equivalent) in muted "
        "gold (#C5922E at 15% opacity). The lines should create an elegant topographic "
        "map pattern — concentric elevation contours suggesting mountainous terrain. "
        "The pattern should be subtle enough to use as a website section background "
        "where text will be placed over it — the lines should NOT compete with overlaid "
        "content. Think of it as a watermark-level texture that adds visual depth without "
        "demanding attention. The center of the image should be slightly more dense with "
        "contour lines, fading to sparser lines at the edges. "
        "No text. No labels. Just the pure topographic pattern. "
        "Style: minimalist, elegant, cartographic."
    ),
    filename='topo-texture-dark.png',
    aspect='16:9',
    res='2K'
)

# --- IMAGE 10: Mining Operations Cinematic ---
print('10/10: Mining operations cinematic...')
results['operations-cinematic.png'] = generate(
    prompt=(
        "Using the mining operations scene from the reference image as the base composition "
        "(excavators and bulldozer working on a tropical mountainside), create a cinematic "
        "enhanced version. Improve the lighting to golden hour with warm sunlight hitting "
        "the equipment and earth from the left side. Add atmospheric depth — distant mountains "
        "should be hazier with blue atmospheric perspective. The green tropical forest should "
        "be richly saturated. The earth being moved should show mineral-rich red and brown tones. "
        "Add subtle volumetric light rays through any gaps in the clouds or canopy. "
        "The workers visible should remain as they are — this is a real operation, not a render. "
        "The overall feeling should be: this is a serious industrial operation happening in "
        "one of the most beautiful places on earth. Power and nature coexisting. "
        "Cinematic color grading: teal shadows, golden highlights, slightly elevated contrast. "
        "Shot style: wide angle, medium-format film look, rich detail. "
        "Generate this image at 4K resolution."
    ),
    filename='operations-cinematic.png',
    refs=['Mining 1.jpeg'],
    aspect='16:9',
    res='4K'
)

# ============================================================
# FINAL REPORT
# ============================================================
print()
print('=== Generation Complete ===')
print()

succeeded = [k for k, v in results.items() if v]
failed = [k for k, v in results.items() if not v]

print(f'Succeeded: {len(succeeded)}/10')
print(f'Failed:    {len(failed)}/10')
print()

# List all files in output directory with sizes
print('--- Files in generated/ ---')
if os.path.exists(output_dir):
    for f in sorted(os.listdir(output_dir)):
        fpath = os.path.join(output_dir, f)
        if os.path.isfile(fpath):
            size_mb = os.path.getsize(fpath) / (1024 * 1024)
            print(f'  {f:40s} {size_mb:.2f} MB')
else:
    print('  (directory does not exist)')

if failed:
    print()
    print('--- Failed Images ---')
    for f in failed:
        print(f'  {f}')

print()
print('Done.')
