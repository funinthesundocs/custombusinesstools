#!/usr/bin/env python3
"""
GMC Website Mockup Generator
Generates full-page website design mockups using Nano Banana Pro.
Reference images from Aboitiz sites define the visual target.
"""

import os
import sys
import time
import glob
from google import genai
from google.genai import types
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ.get('GEMINI_IMAGE_API_KEY')
if not API_KEY:
    print("ERROR: GEMINI_IMAGE_API_KEY not found in .env")
    sys.exit(1)

client = genai.Client(api_key=API_KEY)

# Directories
REF_DIR = 'web/presentation/public/images/reference'
GEN_DIR = 'web/presentation/public/images/generated'
OUT_DIR = 'web/presentation/public/images/mockups'
os.makedirs(OUT_DIR, exist_ok=True)


def load_ref(filename):
    """Load a reference image by partial filename match from the reference folder."""
    for ext in ['png', 'jpg', 'jpeg']:
        matches = glob.glob(os.path.join(REF_DIR, f'*{filename}*.{ext}'))
        if matches:
            img = Image.open(matches[0])
            print(f"  ref: {os.path.basename(matches[0])}")
            return img
    print(f"  WARNING: No reference found matching '{filename}'")
    return None


def load_gen(filename):
    """Load a generated asset by exact filename."""
    path = os.path.join(GEN_DIR, filename)
    if os.path.exists(path):
        return Image.open(path)
    print(f"  WARNING: Generated asset not found: {filename}")
    return None


def generate_mockup(name, prompt, refs, max_retries=2):
    """
    Generate a single mockup.
    refs: list of PIL Image objects (style refs + asset refs combined).
    Retries on failure. Sleeps between calls for rate limiting.
    """
    # Build contents: prompt first, then reference images (skip None)
    contents = [prompt]
    valid_refs = [r for r in refs if r is not None]

    if len(valid_refs) > 13:  # prompt takes 1 slot conceptually, 13 images max
        print(f"  WARNING: {len(valid_refs)} refs exceeds safe limit. Trimming to 13.")
        valid_refs = valid_refs[:13]

    contents.extend(valid_refs)
    print(f"\n{'='*60}")
    print(f"Generating: {name} ({len(valid_refs)} reference images)")
    print(f"{'='*60}")

    config = types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        image_config=types.ImageConfig(
            aspect_ratio="16:9",
            image_size="4K"
        ),
    )

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-3-pro-image-preview",
                contents=contents,
                config=config,
            )

            # Extract image from response
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    img_data = part.inline_data.data
                    filepath = os.path.join(OUT_DIR, f"{name}.png")
                    with open(filepath, 'wb') as f:
                        f.write(img_data)
                    size_kb = len(img_data) / 1024
                    # Get dimensions using PIL
                    try:
                        pil_img = Image.open(filepath)
                        w, h = pil_img.size
                        print(f"  SUCCESS: {name}.png ({w}x{h}, {size_kb:.0f} KB)")
                    except Exception:
                        print(f"  SUCCESS: {name}.png ({size_kb:.0f} KB)")
                    time.sleep(5)  # Rate limit: pause between generations
                    return True
                elif hasattr(part, 'text') and part.text:
                    print(f"  Thinking: {part.text[:150]}...")

            print(f"  No image in response (attempt {attempt + 1}/{max_retries})")

        except Exception as e:
            error_msg = str(e)
            print(f"  Error (attempt {attempt + 1}/{max_retries}): {error_msg[:200]}")
            if 'safety' in error_msg.lower() or 'blocked' in error_msg.lower():
                print("  Retrying with relaxed safety settings...")
                config = types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE'],
                    image_config=types.ImageConfig(
                        aspect_ratio="16:9",
                        image_size="4K"
                    ),
                    safety_settings=[
                        types.SafetySetting(
                            category='HARM_CATEGORY_DANGEROUS_CONTENT',
                            threshold='BLOCK_ONLY_HIGH'
                        ),
                    ],
                )

        time.sleep(10)  # Wait longer before retry

    print(f"  FAILED: {name} after {max_retries} attempts")
    return False


# ============================================================
# MOCKUP DEFINITIONS
# Each mockup specifies: name, prompt (<200 words), references
# ============================================================

results = {}

# --- MOCKUP 1: HOMEPAGE ---
refs_homepage = [
    load_ref('aboitiz-construction-homepage'),   # ACI homepage style
    load_ref('aboitiz-group-homepage'),           # Group homepage style
    load_ref('bhp-homepage'),                     # Mining industry standard
    load_gen('hero-landscape-enhanced.png'),
    load_gen('iron-hero-data.png'),
    load_gen('copper-hero-data.png'),
    load_gen('gold-hero-data.png'),
]

results['homepage'] = generate_mockup(
    "mockup-01-homepage",
    'Confident, institutional, photography-driven. Design a full-scroll mining company homepage '
    'matching the visual sophistication of the reference screenshots. '
    'HERO: Full-viewport tropical mountain landscape with dark overlay. Serif headline '
    '"Bringing Precious Ores to the Light" in white. Subline: "Validated by nine independent '
    'laboratories across five countries." Gold button "Explore the Opportunity." '
    'METRICS: Five bold monospace numbers on light strip — "5,906 ha" | "9 Labs" | '
    '"8 Drill Holes" | "67.31% Fe" | "21.6M MT". '
    'COMPANY: Two-column — text left, site photo right. Three cards: "SEC Registered" | '
    '"MPSA Active" | "MGB Approved." '
    'MINERALS: Three cards with ore textures — Iron 67.31% Fe, Copper 39.5% Cu, Gold 20.35 g/t Au. '
    'FOOTER: Dark navy, four columns, white logo. '
    'Colors: Navy #1B365D, Gold #C5922E, White, Surface #F7F8FA. '
    'Serif headlines, sans-serif body, monospace metrics. Light theme. '
    'Generate this image at 4K resolution, 16:9 aspect ratio.',
    refs_homepage
)

# --- MOCKUP 2: PRESENTATION S1 — OPENING ---
refs_pres_dark = [
    load_ref('aboitiz-group-homepage'),
    load_gen('topo-texture-dark.png'),
]

results['pres_s1'] = generate_mockup(
    "mockup-02-pres-opening",
    'Warm confidence. Elegant. Spacious. A handshake, not a sales pitch. '
    'Design a full-viewport dark presentation opening slide. '
    'Background: subtle topographic contour lines in gold on dark navy #0C1926. '
    'Center-aligned: large serif headline "A Partnership Built for This Moment" in white. '
    'Below: "Genluiching Mining Corporation" in gold #C5922E. '
    'Four metric cards in a row with bold monospace numbers: '
    '"5,906 ha" Concession | "9" Labs | "8" Drill Holes | "493m" Drilled. '
    'White numbers, muted labels beneath each. '
    'Subtle scroll arrow at bottom. Extreme negative space. Premium feel. '
    'Generate this image at 4K resolution, 16:9 aspect ratio.',
    refs_pres_dark
)

# --- MOCKUP 3: PRESENTATION S2 — THE OPPORTUNITY ---
refs_minerals = [
    load_ref('aboitiz-group-homepage'),
    load_gen('iron-hero-data.png'),
    load_gen('copper-hero-data.png'),
    load_gen('gold-hero-data.png'),
]

results['pres_s2'] = generate_mockup(
    "mockup-03-pres-opportunity",
    'Excitement and scale. Numbers that make an engineer stop breathing. '
    'Design a full-viewport slide with three massive mineral showcase cards on white. '
    'IRON card: dark metallic ore photo background, "67.31%" huge monospace white, '
    '"Fe — POSCO CONFIRMED" gold subtext. '
    'COPPER card: vivid blue-green ore photo background, "39.5%" huge white, '
    '"Cu — NEAR-CONCENTRATE" copper #B87333 subtext. '
    'GOLD card: gold-flecked quartz photo background, "20.35 g/t Au" huge white, '
    '"HIGHEST FIRE ASSAY" gold #C5922E subtext. '
    'Below cards centered: "21.6 million metric tons. From less than 9% explored." '
    'Generate this image at 4K resolution, 16:9 aspect ratio.',
    refs_minerals
)

# --- MOCKUP 4: PRESENTATION S3 — THE ALIGNMENT ---
refs_alignment = [
    load_ref('aboitiz-construction-homepage'),
    load_gen('partnership-ecosystem.png'),
]

results['pres_s3'] = generate_mockup(
    "mockup-04-pres-alignment",
    'Recognition and symmetry. Two columns = two partners. '
    'Design a full-viewport partnership alignment slide. '
    'LEFT column (navy tint): "What GMC Brings" — MPSA 5,906 ha, 9-Lab Deposit, '
    'Community Trust 60% Lumad, MGB Approved, 15 Years Site Knowledge. '
    'RIGHT column (gold tint): "What Partner Brings" — AAAA Construction, '
    'THPAL Precedent 13 Years, Energy, Data Science, Financial Capacity. '
    'CENTER: flowing connection lines pairing each item across columns. '
    'BOTTOM callout: "From mining services to mining partnership — the natural next step." '
    'Dark navy background. Clean, data-rich, professional. '
    'Generate this image at 4K resolution, 16:9 aspect ratio.',
    refs_alignment
)

# --- MOCKUP 5: PRESENTATION S4 — THE PROOF ---
refs_proof = [
    load_gen('cross-section-infographic.png'),
    load_gen('evidence-portfolio.png'),
]

results['pres_s4'] = generate_mockup(
    "mockup-05-pres-proof",
    'Technical authority. Let the geology speak. '
    'Design a full-viewport slide dominated by a geological cross-section diagram. '
    'Dark background. The cross-section fills 80% of viewport showing: '
    'Iron Oxide Cap 0-30m in red-brown, Transition Zone 30-60m gray, '
    'Sulfide Zone 60-100m teal, Porphyry Target 100-200m dashed outline. '
    '8 drill holes as vertical lines. SBF-1C labeled at 160m depth. '
    'Callout: "Massive sulfidization confirmed at 60-65m." '
    'Depth scale right side: 0m to 200m. Legend at bottom. '
    'Attribution: "Based on SGECS assessment, MGB Region XI, June 2025." '
    'Generate this image at 4K resolution, 16:9 aspect ratio.',
    refs_proof
)

# --- MOCKUP 6: PRESENTATION S5 — THE PLAN ---
refs_plan = [
    load_ref('aboitiz-construction-homepage'),
    load_gen('timeline-infographic.png'),
]

results['pres_s5'] = generate_mockup(
    "mockup-06-pres-plan",
    'Clarity and forward motion. Progress moves left to right. '
    'Design a full-viewport horizontal phased timeline on light background. '
    'Five phases flowing left to right: '
    'Phase 1 "Exploration Partnership" — drill, ship first vessel, confirm copper. '
    'Phase 2 "Feasibility Study" — JORC resource estimate. '
    'Phase 3 "Permitting" — ECC, development permits. '
    'Phase 4 "Plant Construction" — processing plant, AAAA capability deploys. '
    'Phase 5 "Production" — commercial mining, maintenance revenue, community programs. '
    'Between each phase: diamond decision gate markers "Evaluate → Commit." '
    'Below: "Phase 1 commitment only. Decision gates at every stage." '
    'Navy and gold color accents. Clean sans-serif labels. '
    'Generate this image at 4K resolution, 16:9 aspect ratio.',
    refs_plan
)

# --- MOCKUP 7: PRESENTATION S6 — THE PROTECTION ---
results['pres_s6'] = generate_mockup(
    "mockup-07-pres-protection",
    'Trust and transparency. Calm, confident, nothing hidden. '
    'Design a full-viewport risk status slide on dark navy #0C1926. '
    'Heading: "We\'ve Already Thought About Everything You\'re About to Ask" in white serif. '
    'Five status rows with generous spacing: '
    'GREEN glowing dot — "FPIC Approval" — "Approved by indigenous communities." '
    'GREEN dot — "MGB Operator" — "Director ORDER confirming GMC." '
    'GREEN dot — "Legal Standing" — "Final court ruling. Cannot be refiled." '
    'AMBER dot — "Copper at Depth" — "Sulfide at 60-65m. Phase 1 drilling priority." '
    'AMBER dot — "Mercury Trace" — "Identified proactively. Minamata compliance." '
    'Green #34D399, Amber #F59E0B. Muted sans-serif descriptions. '
    'Generate this image at 4K resolution, 16:9 aspect ratio.',
    refs_pres_dark
)

# --- MOCKUP 8: PRESENTATION S7 — THE VISION ---
refs_vision = [
    load_gen('hero-landscape-enhanced.png'),
    load_gen('operations-cinematic.png'),
]

results['pres_s7'] = generate_mockup(
    "mockup-08-pres-vision",
    'Inspiration. Shared purpose. Maximum breathing room. '
    'Design a full-viewport slide with a full-bleed Philippine sunrise photograph. '
    'Golden light over Davao Oriental mountains and Pacific coastline. '
    'Tropical mountains in silhouette. Hopeful, expansive, forward-looking. '
    'Dark gradient overlay from bottom 80% opacity fading to transparent at top. '
    'Centered text: "Building for Business to Prosper and Communities to Thrive" '
    'in large white serif. Below: "32 years remaining. A multi-generational partnership." '
    'in smaller white at 70% opacity. Nothing else. Let the image breathe. '
    'Generate this image at 4K resolution, 16:9 aspect ratio.',
    refs_vision
)

# --- MOCKUP 9: PRESENTATION S8 — THE ASK ---
results['pres_s8'] = generate_mockup(
    "mockup-09-pres-ask",
    'Simplicity and inevitability. The most natural next step. '
    'Design a full-viewport closing slide. Almost entirely white background. '
    'Extreme negative space. Center-aligned: '
    'Large serif heading "The Next Step" in navy #1B365D. '
    'Three action items with subtle gold icons: '
    '"Phase 1 exploration partnership" '
    '"Technical team introduction" '
    '"Joint site assessment" '
    'Two subtle buttons: "Download Executive Summary" | "Ask Our AI Advisor" '
    'Small GMC logo at bottom center. Not a transaction — an invitation. '
    'Generate this image at 4K resolution, 16:9 aspect ratio.',
    [load_ref('aboitiz-construction-homepage')]
)

# --- MOCKUP 10: ASSETS PAGE ---
refs_assets = [
    load_ref('aboitiz-construction-homepage'),
    load_ref('bhp-homepage'),
    load_gen('cross-section-infographic.png'),
    load_gen('evidence-portfolio.png'),
    load_gen('iron-hero-data.png'),
]

results['assets'] = generate_mockup(
    "mockup-10-assets",
    'Data-rich. Engineer-focused. 20 minutes of study material. '
    'Design a full-scroll evidence portfolio page. Light theme matching reference style. '
    'SHORT HERO: "The Evidence Portfolio" navy serif. Subline: "Nine laboratories. '
    'Five countries. One deposit model." '
    'CROSS-SECTION: Full-width geological diagram — surface to 200m, drill holes, '
    'mineralization zones, depth scale, legend. '
    'LAB GRID: 3x3 cards — POSCO 67.31% Fe, Intertek 136 Samples, BGRIMM 20.72% Cu, '
    'Davao 39.5% Cu, HK Imperial 120K WMT, Ostrea 20.35 g/t Au, CCIC 59.34% Fe, '
    'SGS Core Samples, Lab Uji Kimia Validation. Country flags on each. '
    'VOLUMES: "21.6M MT copper" + "16.1M MT iron" as bold metrics. '
    'Generate this image at 4K resolution, 16:9 aspect ratio.',
    refs_assets
)

# --- MOCKUP 11: ABOUT PAGE ---
refs_about = [
    load_ref('aboitiz-construction-homepage'),
    load_ref('aboitiz-group-homepage'),
    load_gen('timeline-infographic.png'),
    load_gen('operations-cinematic.png'),
]

results['about'] = generate_mockup(
    "mockup-11-about",
    'Institutional. Credible. Rooted in place and purpose. '
    'Design a full-scroll About page for Genluiching Mining Corporation. Light theme. '
    'HERO: Half-height, mining operations photo, heading "About GMC" navy serif. '
    'TIMELINE: Horizontal milestones — 2007 MPSA Granted, 2012 First Assays, '
    '2015 Export, 2019 POSCO 67.31%, 2022 MGB ORDER, 2024 Drilling, 2025-26 Partnership. '
    'VALUES: Three elegant cards — "Bringing Precious Ores to the Light," '
    '"Caring for Creation," "Work of Human Hands." '
    'GOVERNANCE: Credential badges — SEC Registered, MPSA Active, MGB Approved, '
    'BOC Exporter, PHILEXPORT Member. '
    'OFFICE: "Ayala Tower One, Makati City" with address card. '
    'Generate this image at 4K resolution, 16:9 aspect ratio.',
    refs_about
)

# --- MOCKUP 12: CSR PAGE ---
refs_csr = [
    load_ref('aboitiz-construction-homepage'),
    load_gen('hero-landscape-enhanced.png'),
]

results['csr'] = generate_mockup(
    "mockup-12-csr",
    'Purpose-driven. Community-first. Speaks to values, not metrics. '
    'Design a full-scroll CSR page. Light theme with warm photography. '
    'HERO: Lush tropical landscape, heading "Caring for Creation" white serif on dark overlay. '
    'COMMUNITY: "60% Lumad Indigenous Workforce" as bold metric. Photo of Philippine community. '
    'Text about partnership with indigenous peoples, FPIC approved status. '
    'ENVIRONMENT: "Environmental Stewardship" section with forest conservation narrative, '
    'seedling propagation, biodiversity protection. '
    'VISION: "Building for Communities to Thrive" — scaling impact through partnership. '
    'Warm, human, photographic. This page speaks directly to Antonio Peñalver. '
    'Generate this image at 4K resolution, 16:9 aspect ratio.',
    refs_csr
)


# ============================================================
# FINAL REPORT
# ============================================================
print("\n" + "=" * 60)
print("MOCKUP GENERATION COMPLETE")
print("=" * 60)

succeeded = sum(1 for v in results.values() if v)
failed = sum(1 for v in results.values() if not v)
print(f"\nSucceeded: {succeeded}/{len(results)}")
print(f"Failed: {failed}/{len(results)}")

print(f"\nAll outputs in: {OUT_DIR}/")
if os.path.exists(OUT_DIR):
    for f in sorted(os.listdir(OUT_DIR)):
        filepath = os.path.join(OUT_DIR, f)
        size_mb = os.path.getsize(filepath) / (1024 * 1024)
        print(f"  {f}: {size_mb:.1f} MB")

if failed > 0:
    print("\nFailed mockups need manual iteration. Use Gemini conversationally:")
    print('  "Regenerate with more prominent gold accents"')
    print('  "Move the headline higher and increase white space"')
    for name, success in results.items():
        if not success:
            print(f"  - {name}")
