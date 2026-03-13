> **HISTORICAL REFERENCE — GMC / TopQualityMinerals.com Deal**
> This file is the original build specification for the Genluiching Mining Corporation (GMC)
> presentation site targeting Aboitiz Construction. It is preserved as a reference implementation
> showing how a completed deal's BUILDSPEC looks. For a new deal, create a new BUILDSPEC.md
> from scratch based on your deal's specific requirements, design direction, and content.

---

# BUILDSPEC.md — TopQualityMinerals.com Master Build Specification

## THE MISSION

Build a public website for Genluiching Mining Corporation that serves as corporate presence, interactive presentation platform for a Thursday meeting with Aboitiz Construction executives, and implicit demonstration of AI-integrated business. The site must match the visual caliber of aboitizconstructioninc.com — institutional, professional, light theme, photography-driven.

## CRITICAL REQUIREMENTS

1. **OFFLINE PRESENTATION**: The /presentation page MUST work with ZERO internet. All content statically rendered. No API calls on load. No Supabase queries. No CDN fonts (use next/font). Images local. D3 renders from hardcoded data. Agent/voice features gracefully hidden when offline (check navigator.onLine).
2. **NO BROKEN ANYTHING**: Every link goes somewhere. Every button works. No placeholders. No 'coming soon.' No broken images — use CSS gradient fallback (linear-gradient(135deg, #0C1926, #1B365D)) if photo missing.
3. **PROJECTOR-OPTIMIZED**: Presentation page primary target is 16:9 at 1920x1080. Detect width >= 1920 → scale fonts 1.15x.
4. **ONE FOCUS PER SLIDE**: Presentation sections have ONE dominant visual, max 3 data points. Billboard, not data dump.

## DESIGN SYSTEM

### Aesthetic Direction
Refined institutional minimalism with mining-industry warmth. Think: a top-tier management consulting firm's presentation for a natural resources deal. Clean, spacious, data-rich without being dense. The design should feel like it belongs alongside aboitizconstructioninc.com — same league, same caliber.

NOT startup. NOT dashboard. NOT dark mode (except hero overlays and footer). NOT generic AI aesthetic.

### Colors (Tailwind config custom)
```
bg-primary:      '#FFFFFF'
bg-surface:      '#F7F8FA'
bg-dark:         '#0C1926'
text-primary:    '#1A1F36'
text-secondary:  '#4E5A6E'
text-muted:      '#8492A6'
brand-navy:      '#1B365D'
brand-gold:      '#C5922E'
brand-copper:    '#B87333'
brand-iron:      '#5C6370'
success:         '#2D8A4E'
amber:           '#D97706'
border:          '#E2E8F0'
```

### Typography (next/font/google — NO CDN links)
```typescript
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700'], variable: '--font-playfair' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-dm-sans' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['500','700'], variable: '--font-jetbrains' })
```

Usage rules:
- Playfair Display 700: ONLY hero headlines (max 1 per page)
- DM Sans: everything else — body, headings, navigation, labels
- JetBrains Mono: ALL numbers, metrics, percentages, data values
