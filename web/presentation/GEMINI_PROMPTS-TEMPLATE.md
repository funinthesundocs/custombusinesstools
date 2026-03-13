# GEMINI_PROMPTS-TEMPLATE.md — Nano Banana Pro Image Generation
# Model: gemini-3-pro-image-preview (Nano Banana Pro)
# Resolution: 4K for hero images, 2K for infographics and section assets
# All outputs save to: web/presentation/public/images/generated/

## HOW TO USE THIS TEMPLATE

1. Duplicate this file as `GEMINI_PROMPTS.md` for your deal
2. Replace all `[REPLACE_*]` markers with your deal's actual content
3. Add reference images to `web/presentation/public/images/site-photos/`
4. Run the generated script as `scripts/generate-images.py`

---

## MASTER PROMPT FOR OPUS IN IDE

Give this entire file to Opus in the Antigravity IDE. Opus should execute a Python script that:
1. Reads the GEMINI_API_KEY from .env
2. Generates each image using gemini-3-pro-image-preview
3. Uses reference images where specified (loaded from web/presentation/public/images/site-photos/)
4. Saves each output to web/presentation/public/images/generated/{filename}
5. Reports success/failure for each generation

### Python Script Template

```python
import os
from google import genai
from google.genai import types
from PIL import Image

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
output_dir = 'web/presentation/public/images/generated'
os.makedirs(output_dir, exist_ok=True)
ref_dir = 'web/presentation/public/images/site-photos'

def generate(prompt, filename, refs=None, aspect='16:9', res='2K'):
    """Generate a single image with optional reference images."""
    contents = [prompt]
    if refs:
        for ref_path in refs:
            full_path = os.path.join(ref_dir, ref_path)
            if os.path.exists(full_path):
                contents.append(Image.open(full_path))
            else:
                print(f'  WARNING: Reference image not found: {full_path}')

    try:
        response = client.models.generate_content(
            model='gemini-3-pro-image-preview',
            contents=contents,
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                thinking_config=types.ThinkingConfig(thinking_level='high'),
                image_config=types.ImageConfig(
                    aspect_ratio=aspect,
                    image_size=res
                ),
            )
        )
        for part in response.parts:
            if hasattr(part, 'inline_data') and part.inline_data:
                image = part.as_image()
                save_path = os.path.join(output_dir, filename)
                image.save(save_path)
                print(f'  SUCCESS: {filename} saved ({image.size[0]}x{image.size[1]})')
                return True
            elif hasattr(part, 'text') and part.text:
                print(f'  Model note: {part.text[:200]}')
        print(f'  FAILED: No image in response for {filename}')
        return False
    except Exception as e:
        print(f'  ERROR generating {filename}: {e}')
        return False

# ============================================================
# GENERATION BATCH — Run all prompts
# ============================================================

print('=== Nano Banana Pro Image Generation ===')
print(f'Output: {output_dir}')
print()
```

---

## IMAGE 1: Hero Landscape
**Filename:** hero-landscape-enhanced.png
**Resolution:** 4K, 16:9
**Reference images:** [REPLACE_WITH_YOUR_LANDSCAPE_PHOTO.jpg]

```python
print('1/N: Enhanced hero landscape...')
generate(
    prompt=(
        "Using the landscape from the reference image as the base composition, "
        "create a cinematic wide-angle photograph of this scene "
        "enhanced with golden hour lighting from the left. The clouds should glow "
        "with warm amber and rose tones. [REPLACE_WITH_LANDSCAPE_DESCRIPTION: e.g., 'The green mountains should have rich, "
        "saturated color with depth created by atmospheric perspective'] "
        "The overall mood should feel like a National "
        "Geographic cover photograph — awe-inspiring, vast, and premium. "
        "Photorealistic, shot on a medium format Hasselblad, shallow atmospheric "
        "depth of field, cinematic color grading with teal shadows and golden highlights."
    ),
    filename='hero-landscape-enhanced.png',
    refs=['[REPLACE_WITH_YOUR_LANDSCAPE_PHOTO.jpg]'],
    aspect='16:9',
    res='4K'
)
```

---

## IMAGE 2: Technical Cross-Section Infographic
**Filename:** cross-section-infographic.png
**Resolution:** 2K, 16:9
**Reference images:** None (pure generation)

```python
print('2/N: Technical cross-section infographic...')
generate(
    prompt=(
        "Create a professional [REPLACE_WITH_DOMAIN: e.g., geological] cross-section infographic showing the "
        "structure of [REPLACE_WITH_ASSET_DESCRIPTION]. The image "
        "should be a clean, modern scientific illustration suitable for a corporate "
        "presentation on a projector screen. "
        # [REPLACE: Define the layers/zones from top to bottom with depths and colors]
        # [REPLACE: Define any labeled annotations, e.g., confirmed zones, target zones]
        # [REPLACE: Define any reference lines, drill holes, or measurement scales]
        "Text at bottom: '[REPLACE_WITH_SOURCE_ATTRIBUTION]' in small, clean sans-serif font. "
        "Style: dark navy background (#0C1926), clean lines, modern corporate infographic "
        "aesthetic with bold text labels. Colors should glow subtly against the dark background. "
        "Typography: bold sans-serif for labels, consistent sizing. "
        "No cartoonish elements — this must look like it came from a professional "
        "consulting firm's report."
    ),
    filename='cross-section-infographic.png',
    aspect='16:9',
    res='2K'
)
```

---

## IMAGE 3: Primary Asset Hero with Data Overlay
**Filename:** primary-asset-hero.png
**Resolution:** 2K, 16:9
**Reference images:** [REPLACE_WITH_ASSET_PHOTO.jpg]

```python
print('3/N: Primary asset hero with data overlay...')
generate(
    prompt=(
        "Using the [REPLACE_WITH_ASSET_TYPE] specimen from the reference image as the visual base, "
        "create a dramatic, cinematic product showcase image. "
        "The asset sits on a dark surface with dramatic side lighting creating "
        "metallic highlights and deep shadows. "
        "In the upper right area, render the text '[REPLACE_WITH_KEY_METRIC]' in very large, "
        "bold, white sans-serif font. Below it, smaller text "
        "reads '[REPLACE_WITH_METRIC_LABEL]' in a clean, thin sans-serif. "
        "Below that, even smaller: '[REPLACE_WITH_VALIDATION_STATEMENT]' in gold color (#C5922E). "
        "The text should feel naturally integrated into the composition, not pasted on — "
        "as if this were a luxury product advertisement in a high-end magazine. "
        "The overall mood is dark, premium, authoritative. Shallow depth of field with "
        "the asset in sharp focus and the background falling to smooth bokeh."
    ),
    filename='primary-asset-hero.png',
    refs=['[REPLACE_WITH_ASSET_PHOTO.jpg]'],
    aspect='16:9',
    res='2K'
)
```

---

## IMAGE 4: Secondary Asset Hero with Data Overlay
**Filename:** secondary-asset-hero.png
**Resolution:** 2K, 16:9
**Reference images:** [REPLACE_WITH_SECONDARY_ASSET_PHOTO.jpg]

```python
print('4/N: Secondary asset hero with data overlay...')
generate(
    prompt=(
        "Using the [REPLACE_WITH_ASSET_TYPE] specimen from the reference image as the visual base, "
        "create a dramatic showcase image. "
        # [REPLACE: Describe the visual qualities of the asset that should be enhanced]
        "In the lower left area, render the text '[REPLACE_WITH_KEY_METRIC]' in very large, bold, white "
        "sans-serif font. Below it: '[REPLACE_WITH_METRIC_LABEL]' in clean thin font. "
        "Below that: '[REPLACE_WITH_TAGLINE]' in copper color (#B87333). "
        "Style: macro photography, rich saturated color, slight vignette at edges."
    ),
    filename='secondary-asset-hero.png',
    refs=['[REPLACE_WITH_SECONDARY_ASSET_PHOTO.jpg]'],
    aspect='16:9',
    res='2K'
)
```

---

## IMAGE 5: Third Asset Hero with Data Overlay
**Filename:** tertiary-asset-hero.png
**Resolution:** 2K, 16:9
**Reference images:** [REPLACE_WITH_THIRD_ASSET_PHOTO.jpg]

```python
print('5/N: Third asset hero with data overlay...')
generate(
    prompt=(
        "Using the [REPLACE_WITH_ASSET_TYPE] specimen from the reference image as the base, "
        "create a premium showcase image. "
        # [REPLACE: Describe visual enhancement — lighting, color, mood]
        "In the upper right: '[REPLACE_WITH_METRIC_VALUE]' in very large bold white sans-serif, with "
        "'[REPLACE_WITH_UNIT]' next to it slightly smaller. Below: '[REPLACE_WITH_METRIC_LABEL]' in thin white font. "
        "Below that: '[REPLACE_WITH_CONTEXT_STATEMENT]' in gold color (#C5922E). "
        "Shot style: macro, shallow depth of field. Premium, luxurious feeling."
    ),
    filename='tertiary-asset-hero.png',
    refs=['[REPLACE_WITH_THIRD_ASSET_PHOTO.jpg]'],
    aspect='16:9',
    res='2K'
)
```

---

## IMAGE 6: Partnership Ecosystem Diagram
**Filename:** partnership-ecosystem.png
**Resolution:** 2K, 16:9

```python
print('6/N: Partnership ecosystem diagram...')
generate(
    prompt=(
        "Create a professional corporate infographic showing a strategic partnership "
        "ecosystem between two entities. Dark navy background (#0C1926). "
        "LEFT SIDE: A green hexagonal icon with '[REPLACE_WITH_SOURCE_ENTITY_ABBREV]' text, with 5 connected nodes below: "
        # [REPLACE: List 5 key capabilities/assets of the source entity]
        "'[REPLACE_CAPABILITY_1]', '[REPLACE_CAPABILITY_2]', '[REPLACE_CAPABILITY_3]', "
        "'[REPLACE_CAPABILITY_4]', '[REPLACE_CAPABILITY_5]'. Each node is a rounded rectangle "
        "with green (#2E7D32) left border. "
        "RIGHT SIDE: A gold hexagonal icon with 'PARTNER' text, with 5 connected nodes: "
        # [REPLACE: List 5 key capabilities/assets of the target entity]
        "'[REPLACE_PARTNER_CAPABILITY_1]', '[REPLACE_PARTNER_CAPABILITY_2]', '[REPLACE_PARTNER_CAPABILITY_3]', "
        "'[REPLACE_PARTNER_CAPABILITY_4]', '[REPLACE_PARTNER_CAPABILITY_5]'. Each node has gold (#C5922E) left border. "
        "CENTER: Flowing connection lines from each left node to its corresponding right node, "
        "creating a visual bridge. The lines are subtle gradients from green to gold. "
        "At the bottom center, a larger rounded rectangle contains: "
        "'[REPLACE_WITH_PARTNERSHIP_TAGLINE]' in white text. "
        "Style: modern corporate infographic, clean sans-serif typography. "
        "This should look like a slide from a McKinsey presentation."
    ),
    filename='partnership-ecosystem.png',
    aspect='16:9',
    res='2K'
)
```

---

## IMAGE 7: Evidence Portfolio Grid
**Filename:** evidence-portfolio.png
**Resolution:** 2K, 16:9

```python
print('7/N: Evidence portfolio grid...')
generate(
    prompt=(
        "Create a professional infographic showing a grid of [REPLACE_WITH_N] validation "
        "cards arranged in a [REPLACE_WITH_ROWS]x[REPLACE_WITH_COLS] grid. Dark navy background (#0C1926). "
        "Title at top: '[REPLACE_WITH_PORTFOLIO_HEADLINE]' in bold "
        "white sans-serif with gold (#C5922E) accent line below. "
        "Each card is a dark rounded rectangle with subtle border. Each contains: "
        # [REPLACE: List each validation source with its key metric, e.g.:]
        # "'1. [Lab/Validator Name]' with [country] flag emoji, '[KEY_METRIC]' in large gold text."
        "'1. [REPLACE_VALIDATOR_1]' with [REPLACE_FLAG_1] flag emoji, '[REPLACE_METRIC_1]' in large gold text. "
        "'2. [REPLACE_VALIDATOR_2]' with [REPLACE_FLAG_2] flag, '[REPLACE_METRIC_2]' in large text. "
        # [REPLACE: Continue for each validator card]
        "Style: dark theme, each card has a subtle gradient. Clean sans-serif typography throughout. "
        "Professional corporate infographic quality."
    ),
    filename='evidence-portfolio.png',
    aspect='16:9',
    res='2K'
)
```

---

## IMAGE 8: Development Timeline
**Filename:** timeline-infographic.png
**Resolution:** 2K, 21:9 (ultra-wide for horizontal display)

```python
print('8/N: Development timeline infographic...')
generate(
    prompt=(
        "Create a horizontal timeline infographic showing the development history of "
        "[REPLACE_WITH_PROJECT_DESCRIPTION] from [REPLACE_START_YEAR] to [REPLACE_END_YEAR]. Dark navy background (#0C1926). "
        "A horizontal golden line runs across the center of the image. "
        "Along this line, [REPLACE_N] milestone nodes are placed at intervals: "
        # [REPLACE: List each milestone as: YEAR — 'EVENT LABEL' (color/glow notes)]
        "[REPLACE_YEAR_1] — '[REPLACE_MILESTONE_1]' (white circle, green glow) "
        "[REPLACE_YEAR_2] — '[REPLACE_MILESTONE_2]' (white circle) "
        "[REPLACE_YEAR_3] — '[REPLACE_MILESTONE_3]' (white circle, gold glow, largest node) "
        "Each node has the year in bold JetBrains-style monospace font above the line, "
        "and the event description in clean sans-serif below the line. "
        "Style: sleek, modern, premium corporate presentation quality. "
        "The progression from left to right should feel like momentum building toward the present."
    ),
    filename='timeline-infographic.png',
    aspect='21:9',
    res='2K'
)
```

---

## IMAGE 9: Background Texture
**Filename:** background-texture.png
**Resolution:** 2K, 16:9

```python
print('9/N: Background texture...')
generate(
    prompt=(
        # [REPLACE: Describe the texture appropriate for your industry/theme, e.g.:]
        # Topographic contour lines for mining, circuit patterns for tech, etc.
        "Create a subtle [REPLACE_WITH_TEXTURE_TYPE] pattern on a dark navy background "
        "(#0C1926). The pattern lines should be very thin (1px equivalent) in muted "
        "gold (#C5922E at 15% opacity). The pattern should be subtle enough to use as a "
        "website section background where text will be placed over it. "
        "No text. No labels. Just the pure pattern. "
        "Style: minimalist, elegant."
    ),
    filename='background-texture.png',
    aspect='16:9',
    res='2K'
)
```

---

## IMAGE 10: Operations Cinematic
**Filename:** operations-cinematic.png
**Resolution:** 4K, 16:9
**Reference images:** [REPLACE_WITH_OPERATIONS_PHOTO.jpg]

```python
print('10/N: Operations cinematic...')
generate(
    prompt=(
        "Using the [REPLACE_WITH_OPERATIONS_DESCRIPTION] scene from the reference image as the base composition, "
        "create a cinematic enhanced version. Improve the lighting to golden hour with warm sunlight "
        "from the left side. Add atmospheric depth and richly saturated colors. "
        # [REPLACE: Add industry-specific atmospheric details]
        "The overall feeling should be: this is a serious operation happening in "
        "one of the most beautiful places on earth. Power and nature coexisting. "
        "Cinematic color grading: teal shadows, golden highlights, slightly elevated contrast. "
        "Shot style: wide angle, medium-format film look, rich detail."
    ),
    filename='operations-cinematic.png',
    refs=['[REPLACE_WITH_OPERATIONS_PHOTO.jpg]'],
    aspect='16:9',
    res='4K'
)
```

---

## EXECUTION

```python
print()
print('=== Generation Complete ===')
print(f'Check {output_dir} for all generated images.')
print('Review each image. If any need iteration, use multi-turn chat mode')
print('to refine with follow-up prompts.')
```

Save this complete script as `scripts/generate-images.py` and run it.
After generation, review each image. For any that need refinement,
open a chat session with the same model and iterate conversationally.
