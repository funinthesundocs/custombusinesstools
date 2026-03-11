#!/usr/bin/env python3
"""
GMC Photo Enhancement Script — Nano Banana Pro (gemini-3-pro-image-preview)
Enhances the top 8 photos from each mining site to cinematic/corporate quality.
Run this in the Antigravity IDE with Opus. Fully automatic.

Model: gemini-3-pro-image-preview (Nano Banana Pro — HIGHEST QUALITY, mandatory thinking mode)
API Key: GEMINI_IMAGE_API_KEY from .env
Output: web/presentation/public/images/enhanced/
"""

import os
import time
import sys

# Install dependencies if needed
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

# Load environment
load_dotenv()
api_key = os.environ.get('GEMINI_IMAGE_API_KEY')
if not api_key:
    print('ERROR: GEMINI_IMAGE_API_KEY not found in .env')
    sys.exit(1)

client = genai.Client(api_key=api_key)

# Paths
SITE_PHOTOS = os.path.join('web', 'presentation', 'public', 'images', 'site-photos')
OUTPUT_DIR = os.path.join('web', 'presentation', 'public', 'images', 'enhanced')
os.makedirs(OUTPUT_DIR, exist_ok=True)

MODEL = 'gemini-3-pro-image-preview'

def enhance(prompt, ref_filename, output_filename, aspect='16:9', res='4K', retries=3):
    """Enhance a single photo using Nano Banana Pro with retry logic."""
    ref_path = os.path.join(SITE_PHOTOS, ref_filename)
    out_path = os.path.join(OUTPUT_DIR, output_filename)
    
    if not os.path.exists(ref_path):
        print(f'  SKIP: Reference image not found: {ref_path}')
        return False
    
    for attempt in range(retries):
        try:
            ref_image = Image.open(ref_path)
            response = client.models.generate_content(
                model=MODEL,
                contents=[prompt, ref_image],
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
                if hasattr(part, 'text') and part.text:
                    pass  # Thinking output, ignore
                if hasattr(part, 'inline_data') and part.inline_data:
                    image = part.as_image()
                    image.save(out_path)
                    w, h = image.size
                    size_mb = os.path.getsize(out_path) / (1024 * 1024)
                    print(f'  SUCCESS: {output_filename} — {w}x{h} — {size_mb:.1f}MB')
                    return True
            
            print(f'  WARNING: No image in response for {output_filename} (attempt {attempt+1})')
            
        except Exception as e:
            error_str = str(e)
            if '429' in error_str or 'RESOURCE_EXHAUSTED' in error_str:
                wait = 2 ** attempt * 15
                print(f'  RATE LIMITED: Waiting {wait}s before retry (attempt {attempt+1})')
                time.sleep(wait)
            else:
                print(f'  ERROR: {output_filename} — {e}')
                if attempt < retries - 1:
                    time.sleep(5)
    
    print(f'  FAILED: {output_filename} after {retries} attempts')
    return False


# ================================================================
# MATI CITY, DAVAO ORIENTAL — TOP 8
# ================================================================

print('=' * 60)
print('MATI CITY, DAVAO ORIENTAL — TOP 8 ENHANCEMENTS')
print('=' * 60)
print()

# MATI 1 — Operations Hero (HIGHEST PRIORITY)
print('[MATI 1/8] Mining operations — excavators on tropical mountainside')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to cinematic 4K quality. "
        "This shows heavy mining equipment — a yellow Hyundai excavator and bulldozer — "
        "working on a tropical mountainside carved into rich red-brown earth, with lush "
        "green forest-covered mountains stretching to the horizon. Workers in safety "
        "gear are visible. "
        "Enhancement: Add golden hour sunlight hitting the equipment from the left, "
        "creating warm highlights on the yellow metal and warm tones on the exposed earth. "
        "Make the distant mountains recede with blue atmospheric perspective — each range "
        "slightly hazier. Enrich the green forest to deep, saturated tropical greens. "
        "Add subtle volumetric light rays where sunlight breaks through clouds. "
        "The earth should show rich mineral reds, oranges, and browns. "
        "Color grade: teal shadows, golden highlights, elevated contrast. "
        "The feeling: industrial power operating at scale in paradise. "
        "Keep it photorealistic — enhance, do not fabricate. "
        "Generate this image at 4K resolution."
    ),
    ref_filename='Mining 1.jpeg',
    output_filename='mati-01-operations-hero.png',
    res='4K'
)
time.sleep(3)

# MATI 2 — Landscape Hero
print('[MATI 2/8] Mountain landscape above the clouds')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to cinematic 4K quality. "
        "This shows a breathtaking view from a mountain summit looking over lush green "
        "tropical mountains with clouds drifting through the valleys below. A single "
        "tree stands silhouetted against the sky. A distant mountain peak rises above "
        "the cloud layer on the horizon. "
        "Enhancement: Make this look like a National Geographic cover photograph. "
        "Enrich the clouds with warm amber and rose tones from golden hour light. "
        "The green mountains should have incredibly rich, deep saturation with "
        "multiple shades from emerald to forest green. Add atmospheric depth — "
        "near vegetation crisp and vivid, middle distance slightly hazy with clouds, "
        "far distance blue and ethereal. The foreground earth should show subtle "
        "mineral-rich reddish soil. The single tree should be a striking silhouette. "
        "Color grade: warm golden tones in the highlights, cool blue-teal in the "
        "shadows and distance. Cinematic depth of field feel. "
        "Keep it photorealistic — this is a real place. "
        "Generate this image at 4K resolution."
    ),
    ref_filename='Mountains.jpg',
    output_filename='mati-02-landscape-hero.png',
    res='4K'
)
time.sleep(3)

# MATI 3 — People Hero
print('[MATI 3/8] Team with ore samples and excavator')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to professional corporate "
        "photography quality at 4K resolution. This shows approximately 20 mining "
        "workers in yellow hard hats and orange-yellow safety vests, posing as a "
        "group in front of a massive dark ore stockpile with a Hitachi excavator "
        "behind them. They are holding ore samples and smiling proudly. Blue sky above. "
        "Enhancement: This is a team pride photograph. Make every face warm and "
        "naturally lit — improve the lighting to be soft and even across all faces "
        "while keeping it look natural, not studio-lit. Saturate the safety vest "
        "colors so they pop vibrantly against the dark ore behind. The blue sky "
        "should be rich with sculptural white clouds. The ore stockpile should look "
        "imposing and massive. Sharpen details on faces and safety equipment. "
        "The mood should communicate: this is a proud, capable, unified team. "
        "Keep it photorealistic — these are real people at their real workplace. "
        "Generate this image at 4K resolution."
    ),
    ref_filename='GMC Team.jpg',
    output_filename='mati-03-team-hero.png',
    res='4K'
)
time.sleep(3)

# MATI 4 — Helicopter
print('[MATI 4/8] Helicopter on mine site')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to cinematic 4K quality. "
        "A blue and red helicopter sits on a mountain-top mining site clearing. "
        "A worker in an orange safety vest and white hard hat walks toward the camera "
        "in the foreground. Green tropical mountains and dramatic cloud formations "
        "fill the background. "
        "Enhancement: Make the sky dramatic — larger, more sculptural cumulus clouds "
        "with golden-lit edges against deep blue sky. The mountains behind should have "
        "rich atmospheric depth with multiple layers. The helicopter should be sharp "
        "and detailed with vivid colors. The worker's safety vest should catch warm "
        "sidelight. The cleared ground should show rich earth tones. "
        "The mood: scale, investment, and seriousness — a company that accesses its "
        "operations by helicopter on a remote mountain summit. "
        "Keep photorealistic. Generate this image at 4K resolution."
    ),
    ref_filename='Mining 2.jpeg',
    output_filename='mati-04-helicopter.png',
    res='4K'
)
time.sleep(3)

# MATI 5 — Leadership
print('[MATI 5/8] CEO next to Caterpillar equipment')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to professional portrait "
        "quality at 4K resolution. A man in a white hard hat and blue work shirt "
        "stands confidently next to large Caterpillar mining equipment — a D6R "
        "bulldozer and 320D excavator — with lush tropical vegetation visible behind. "
        "Enhancement: This is a leadership portrait. Warm the skin tones naturally "
        "and improve facial lighting to be flattering but authentic. The yellow CAT "
        "equipment should be vivid and detailed — enhance the paint and metal textures "
        "to look powerful. The green tropical vegetation should be rich. Add subtle "
        "warm fill light. The man should look capable, confident, and in command of "
        "his environment. "
        "Keep photorealistic — this is the CEO at his operation. "
        "Generate this image at 4K resolution."
    ),
    ref_filename='Mining 3.jpeg',
    output_filename='mati-05-leadership.png',
    res='4K'
)
time.sleep(3)

# MATI 6 — Team with Mountains
print('[MATI 6/8] Team in orange with green mountain backdrop')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to cinematic quality at 4K "
        "resolution. A group of approximately 20 mining workers in orange safety "
        "shirts and yellow-green reflective vests pose together at a mountain site "
        "clearing. Behind them, lush green tropical mountains rise dramatically "
        "with clouds and mist. Vehicles and a green tent are visible. "
        "Enhancement: Make the green mountains behind the team absolutely stunning — "
        "deeply saturated, with atmospheric depth and mist creating layers of distance. "
        "The orange safety gear should glow warmly against the green. Faces should be "
        "naturally lit and warm. The overall composition should feel like: these people "
        "work in one of the most beautiful places on earth, and they are a tight-knit "
        "professional team. "
        "Keep photorealistic. Generate this image at 4K resolution."
    ),
    ref_filename='Mining 6.jpeg',
    output_filename='mati-06-team-mountains.png',
    res='4K'
)
time.sleep(3)

# MATI 7 — Copper Mineral Beauty
print('[MATI 7/8] Copper ore macro — turquoise, teal, rust')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to stunning macro product "
        "quality at 4K resolution. This is a close-up of copper ore showing vivid "
        "turquoise malachite, deep teal-blue azurite, rust-red iron oxide, and "
        "dark sulfide mineralization in an intricate natural pattern. "
        "Enhancement: Maximize the color richness and contrast. The turquoise should "
        "be electric. The teal-blue should be deep and jewel-like. The rust should "
        "be warm and metallic. Add subtle specular highlights on mineral crystal "
        "faces as if studio-lit with a single directional light source. Slight "
        "vignette at edges to draw focus to the most colorful center. "
        "This should look like a photograph of a precious museum specimen — something "
        "you would frame and hang on a wall. The mineral itself is the art. "
        "Keep photorealistic. Generate this image at 4K resolution."
    ),
    ref_filename='Complex Ore.jpg',
    output_filename='mati-07-copper-beauty.png',
    aspect='3:2',
    res='4K'
)
time.sleep(3)

# MATI 8 — Geologists in Field
print('[MATI 8/8] Geologists reviewing maps in the field')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to professional documentary "
        "quality at 2K resolution. A group of geologists in safety gear — hard hats "
        "with GMC logos, orange and beige safety shirts — review geological maps while "
        "standing on a vegetated hillside. Green mountains and blue sky behind them. "
        "Enhancement: Sharpen the detail on the maps they are reviewing. Warm and "
        "even out the facial lighting. The GMC logos on helmets should be subtly "
        "visible. The green hillside vegetation should be rich. Add warm sunlight "
        "from the upper right. The mood is serious professional geological work — "
        "scientists in the field doing rigorous exploration. "
        "Keep photorealistic. Generate this image at 2K resolution."
    ),
    ref_filename='WhatsApp Image 2026-03-07 at 10.02.48 PM.jpeg',
    output_filename='mati-08-geologists-field.png',
    res='2K'
)
time.sleep(3)

# ================================================================
# NEGROS ORIENTAL — TOP 8
# ================================================================

print()
print('=' * 60)
print('NEGROS ORIENTAL, SILICA SITE — TOP 8 ENHANCEMENTS')
print('=' * 60)
print()

# NEGROS 1 — Open Pit Hero (HIGHEST PRIORITY)
print('[NEGROS 1/8] Massive open pit with blue sky and mountains')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to cinematic 4K quality. "
        "This shows a massive open-pit silica mining operation carved into a tropical "
        "mountainside. The exposed earth shows rich orange, brown, and white layers. "
        "Lush green forest surrounds the pit on all sides. Blue sky with dramatic "
        "cumulus clouds above. Mining equipment is visible at various levels, tiny "
        "against the massive scale. "
        "Enhancement: Make this look like an aerial photograph from a world-class "
        "mining annual report. The geological layering in the exposed pit face should "
        "show vivid warm earth tones — oranges, reds, browns, whites — each layer "
        "distinct. The surrounding green forest should be deeply saturated. The sky "
        "should be expansive with sculptural clouds. Equipment should be just visible "
        "enough to communicate enormous scale. Add atmospheric depth to distant "
        "mountains. "
        "Color grade: rich, warm earth tones contrasting with cool green forest and "
        "blue sky. Cinematic contrast. "
        "Keep photorealistic. Generate this image at 4K resolution."
    ),
    ref_filename='Silica Site - Negros Oriental 2.jpeg',
    output_filename='negros-01-openpit-hero.png',
    res='4K'
)
time.sleep(3)

# NEGROS 2 — Misty Mountain Mine
print('[NEGROS 2/8] Open pit with mist rolling over mountain')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to cinematic 4K quality. "
        "An open-pit mining operation on a mountainside with mist and low clouds "
        "rolling across the upper portions of the mountain. Multiple excavators "
        "work at different levels of the pit. The exposed earth shows varied tones "
        "of orange, brown, and gray. Dense green tropical forest surrounds the operation. "
        "Enhancement: Make the mist ethereal and dreamlike — soft, luminous, "
        "partially obscuring the mountain summit. The contrast between the active "
        "industrial operation and the mystical mist should be dramatic. Equipment "
        "should be sharp in the foreground, fading into the mist at higher elevations. "
        "The forest should be emerald green fading into mist. "
        "The mood: mining above the clouds. Industrial operation in a place that "
        "feels almost mythical. "
        "Keep photorealistic. Generate this image at 4K resolution."
    ),
    ref_filename='Silica Site - Negros Oriental 6.jpeg',
    output_filename='negros-02-misty-mountain.png',
    res='4K'
)
time.sleep(3)

# NEGROS 3 — Summit Vista Team
print('[NEGROS 3/8] Team on mountain summit overlooking valleys and ocean')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to cinematic 4K quality. "
        "Four men in green safety gear and white hard hats stand on a mountain "
        "summit. Behind them, an expansive view stretches across green tropical "
        "valleys, rolling hills, and the ocean visible in the far distance under "
        "dramatic cloudy skies with patches of blue. "
        "Enhancement: Make this vista BREATHTAKING. The atmospheric perspective "
        "should create incredible depth — near vegetation sharp and vivid green, "
        "middle distance slightly hazy, far distance blue-gray with the ocean "
        "shimmering. Clouds should be dramatic with golden-lit edges. The men "
        "should look confident and proud — standing above their domain with the "
        "world spread out below them. Sharpen their faces and safety gear details. "
        "This should feel like the defining photograph of a mining company — "
        "leaders standing on the summit of their future. "
        "Keep photorealistic. Generate this image at 4K resolution."
    ),
    ref_filename='Silica Site - Negros Oriental 9.jpeg',
    output_filename='negros-03-summit-vista.png',
    res='4K'
)
time.sleep(3)

# NEGROS 4 — Tenement Boundary
print('[NEGROS 4/8] Team at Mining Tenement Boundary sign')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to professional 4K quality. "
        "Six workers in green safety gear and white hard hats stand next to a "
        "branded GMC Mining Tenement Boundary sign that reads: 'GENLUICHING MINING "
        "CORPORATION — EXPA-00074VII, EXPA-00075VII.' Tropical forest behind them. "
        "Enhancement: Make the sign crisp and clearly readable — the GMC logo and "
        "text should be sharp. The green safety gear should be vivid. The forest "
        "behind should be deeply green and lush. Faces should be warm, naturally lit, "
        "and the team should look professional and proud. Subtle warm light from the "
        "left. Clean up any distracting background elements. "
        "This communicates: a legitimate, professional mining operation with legal "
        "boundaries clearly marked. "
        "Keep photorealistic. Generate this image at 4K resolution."
    ),
    ref_filename='Silica Site - Negros Oriental 1.jpeg',
    output_filename='negros-04-tenement-boundary.png',
    res='4K'
)
time.sleep(3)

# NEGROS 5 — Active Loading
print('[NEGROS 5/8] Excavator loading dump truck — active operations')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to cinematic 2K quality. "
        "Workers in hard hats and safety gear supervise as a yellow excavator "
        "with a full bucket loads an Isuzu dump truck at an active mining site. "
        "Rich orange-red earth fills the frame. More equipment visible in the "
        "background on higher benches. "
        "Enhancement: Make the equipment vivid — the yellow excavator and white "
        "truck should pop against the earth tones. The red-orange earth should be "
        "rich and mineral-looking. Workers' safety gear should be visible and "
        "colorful. Add subtle warm sidelight. Atmosphere of active, productive work. "
        "Keep photorealistic. Generate this image at 2K resolution."
    ),
    ref_filename='Silica Site - Negros Oriental 8.jpeg',
    output_filename='negros-05-active-loading.png',
    res='2K'
)
time.sleep(3)

# NEGROS 6 — Team Portrait
print('[NEGROS 6/8] Team in orange by roadside with mountains')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to professional corporate "
        "quality at 2K resolution. Six team members in orange GMC polo shirts and "
        "hard hats standing along a concrete road barrier with lush green tropical "
        "mountains and palm trees behind them. "
        "Enhancement: Even out the lighting across all faces — everyone should be "
        "warmly and naturally lit. The orange polo shirts should be vivid. The green "
        "mountains behind should be richly saturated with atmospheric depth. Clean "
        "professional team photograph quality. "
        "Keep photorealistic. Generate this image at 2K resolution."
    ),
    ref_filename='Silica Site - Negros Oriental 9.4.jpeg',
    output_filename='negros-06-team-portrait.png',
    res='2K'
)
time.sleep(3)

# NEGROS 7 — Geological Fieldwork
print('[NEGROS 7/8] Geologists examining rock face with layering')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to cinematic 2K quality. "
        "Two geologists in safety gear examine a massive exposed rock face showing "
        "visible geological layering and mineralization. One wears yellow safety "
        "pants and a white hard hat, reaching toward the rock face. Green vegetation "
        "and mountains visible above the exposure. "
        "Enhancement: Make the geological layering in the rock face dramatic — "
        "enhance the color variation showing different mineral zones and strata. "
        "The rock textures should be sharp and detailed. The geologists should be "
        "naturally lit. The green vegetation above should contrast beautifully with "
        "the exposed rock below. "
        "This communicates: rigorous scientific geological investigation at the "
        "outcrop scale. "
        "Keep photorealistic. Generate this image at 2K resolution."
    ),
    ref_filename='Silica Site - Negros Oriental 9.8.jpeg',
    output_filename='negros-07-geology-fieldwork.png',
    res='2K'
)
time.sleep(3)

# NEGROS 8 — Geological Survey Team
print('[NEGROS 8/8] Workers examining silica rock face')
enhance(
    prompt=(
        "Using this photograph as the base, enhance it to professional quality at "
        "2K resolution. Four workers in blue safety shirts, white hard hats, and "
        "reflective vests examine a large exposed rock face of white-cream silica "
        "and tan overburden. Green tropical vegetation grows around the exposure. "
        "Enhancement: Make the contrast between the white silica rock and the green "
        "vegetation striking. The workers should be naturally lit and their safety "
        "gear vivid. The rock face texture should be detailed and geological. "
        "This communicates professional exploration at GMC's second mining site. "
        "Keep photorealistic. Generate this image at 2K resolution."
    ),
    ref_filename='Silica Site - Negros Oriental 9.2.jpeg',
    output_filename='negros-08-silica-survey.png',
    res='2K'
)

# ================================================================
# FINAL REPORT
# ================================================================

print()
print('=' * 60)
print('ENHANCEMENT COMPLETE — RESULTS')
print('=' * 60)
print()

enhanced_dir = OUTPUT_DIR
if os.path.exists(enhanced_dir):
    files = sorted(os.listdir(enhanced_dir))
    total_size = 0
    success_count = 0
    for f in files:
        fpath = os.path.join(enhanced_dir, f)
        if os.path.isfile(fpath):
            size_mb = os.path.getsize(fpath) / (1024 * 1024)
            total_size += size_mb
            success_count += 1
            print(f'  {f:45s} {size_mb:6.1f} MB')
    print()
    print(f'  Total: {success_count} images, {total_size:.1f} MB')
    print(f'  Output: {os.path.abspath(enhanced_dir)}')
else:
    print('  ERROR: Output directory not found')

print()
print('Review each image. For any that need refinement,')
print('open a conversational chat session with gemini-3-pro-image-preview')
print('and iterate with follow-up prompts referencing the output.')
