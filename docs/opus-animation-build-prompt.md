# Mission: Build the Animated Pipeline Dashboard with GSAP + SVG

Read and execute `.agent/alignment/protocols/boot.md` first.

Then read these files:
- `C:\Antigravity\Custombusinesstools\docs\animation-execution-plan.md` — Full execution plan. Read Phase 4 for your build instructions.
- `C:\Antigravity\Custombusinesstools\web\dashboard\src\app\page.tsx` — Current dashboard page. You will replace this.
- `C:\Antigravity\Custombusinesstools\web\dashboard\src\app\globals.css` — Add animation CSS here.

## Install GSAP

```
cd C:\Antigravity\Custombusinesstools\web\dashboard
npm install gsap @gsap/react
```

## Architecture

- The base plate image (`public/rag-factory-baseplate.jpg`) is the background
- 7 SVG machine components are positioned absolutely over each machine zone
- Each SVG component has GSAP timelines animating its elements (gears rotating, belts moving, etc.)
- The S-curve particle uses GSAP MotionPath on an SVG bezier path
- Live metrics from API endpoints overlay each zone
- Each zone is a clickable Next.js Link
- Mobile fallback: vertical card list below `lg:` breakpoint

## SVG Source Files

The SVG files are at `docs/animation-assets/svg/` (machine-1 through machine-7 plus pipes). They have named element IDs for every animated part. Inline them into your React components so GSAP can target elements by ID.

Reference video clips showing how each machine should move are at `docs/animation-assets/reference-clips/`. Watch them to match timing and feel in your GSAP code.

## Component Structure

```
src/app/page.tsx                    — PipelineDashboard (main page)
src/components/pipeline/
  ├── MachineOverlay.tsx            — Reusable positioned overlay wrapper
  ├── FunnelMachine.tsx             — Machine 1: intake funnel animation
  ├── FactoryMachine.tsx            — Machine 2: gears + saws + conveyor
  ├── RadarMachine.tsx              — Machine 3: dish sweep + signal waves
  ├── GateMachine.tsx               — Machine 4: traffic light + gauge (state-driven)
  ├── SatelliteMachine.tsx          — Machine 5: dishes + LED indicators
  ├── AssemblyMachine.tsx           — Machine 6: conveyor + processor glow
  ├── PressMachine.tsx              — Machine 7: stamp + output + filing
  ├── SCurveParticle.tsx            — Glowing orb on GSAP MotionPath
  └── MobileStageList.tsx           — Mobile fallback card list
```

## GSAP Animation Specs Per Machine

### Machine 1 (Funnel):
- 5 document icons: `gsap.to('#doc-N', { y: 200, opacity: 0, duration: 2.5, stagger: 0.5, repeat: -1 })`
- Funnel vibration: `gsap.to('#funnel-body', { x: '+=2', duration: 0.08, yoyo: true, repeat: -1 })`
- 6 steam particles: `gsap.to('#steam-N', { y: -60, opacity: 0, duration: 1.5, stagger: 0.25, repeat: -1 })`

### Machine 2 (Factory):
- Large gear: `gsap.to('#gear-large', { rotation: 360, duration: 8, ease: 'none', repeat: -1, transformOrigin: 'center' })`
- Medium gear: `gsap.to('#gear-medium', { rotation: -360 * (20/14), duration: 8, ease: 'none', repeat: -1, transformOrigin: 'center' })` (ratio matches tooth count)
- Small gear: `gsap.to('#gear-small', { rotation: 360 * (20/8), duration: 8, ease: 'none', repeat: -1, transformOrigin: 'center' })`
- Saw blades: `gsap.to('#saw-N', { rotation: 360, duration: 1, ease: 'none', repeat: -1, transformOrigin: 'center' })`
- Conveyor: `gsap.to('#conveyor-belt', { strokeDashoffset: -40, duration: 1, ease: 'none', repeat: -1 })`
- Sparks: `gsap.to('#spark-N', { scale: 1.5, opacity: 0, duration: 0.3, stagger: { each: 0.15, repeat: -1 } })`

### Machine 3 (Radar):
- Dish sweep: `gsap.to('#dish-body', { rotation: 45, duration: 2, yoyo: true, ease: 'power1.inOut', repeat: -1, transformOrigin: 'bottom center' })`
- Signal waves: `gsap.to('#wave-N', { scale: 2, opacity: 0, duration: 2, stagger: 0.5, repeat: -1, transformOrigin: 'left center' })`
- Data orbs: `gsap.to('#orb-N', { opacity: gsap.utils.random(0.3, 1), duration: gsap.utils.random(0.5, 1.5), repeat: -1, yoyo: true })`

### Machine 4 (Gate) — STATE-DRIVEN:
- Accept React props: `confidence: number` (0-100) and `isResearching: boolean`
- Green lens: `opacity: confidence >= 70 ? 1 : 0.1` with CSS transition
- Red lens: `opacity: confidence < 70 ? 1 : 0.1` with CSS transition
- Gauge needle: `gsap.to('#gauge-needle', { rotation: (confidence / 100) * 180 - 90, duration: 1, transformOrigin: 'bottom center' })`
- Gate arm: `gsap.to('#gate-arm', { rotation: confidence >= 70 ? -80 : 0, duration: 0.8, transformOrigin: 'right center' })`
- Gate gears: rotation pattern matching Factory gears, spin only when `isResearching` is true

### Machine 5 (Satellites):
- Dishes: `gsap.to('#dish-N', { rotation: gsap.utils.random(-8, 8), duration: 3, yoyo: true, ease: 'sine.inOut', repeat: -1, transformOrigin: 'bottom center' })`
- LEDs: `gsap.to('#led-N', { opacity: gsap.utils.random(0.2, 1), fill: '#22D3EE', duration: gsap.utils.random(0.3, 1), repeat: -1, yoyo: true, stagger: 0.1 })`
- Signal lines: `gsap.to('#signal-N', { strokeDashoffset: -20, duration: 0.8, ease: 'none', repeat: -1, stagger: 0.15 })`

### Machine 6 (Assembly):
- Belt: same strokeDashoffset technique as Factory
- Components: `gsap.to('#component-N', { x: 200, duration: 4, stagger: 1, repeat: -1 })` with opacity fade at end
- Processor glow: `gsap.to('#processor-glow', { opacity: 0.3, scale: 1.2, duration: 1.5, yoyo: true, repeat: -1 })`

### Machine 7 (Press):
- Press arm: `gsap.timeline({ repeat: -1 }).to('#press-arm', { y: 40, duration: 0.3, ease: 'power2.in' }).to('#press-arm', { y: 0, duration: 0.8, ease: 'power2.out' })`
- Output paper: `gsap.to('#output-N', { x: 60, opacity: 1, duration: 0.5, stagger: 0.3, repeat: -1 })`
- Cabinet glow: `gsap.to('#cabinet-drawer', { fill: '#FBBF24', opacity: 0.6, duration: 0.3, yoyo: true, repeat: -1, repeatDelay: 3 })`
- Badges: `gsap.to('#badge-N', { scale: 1, opacity: 1, duration: 0.2, stagger: 0.15 })` triggered after press stamp

### S-Curve Particle:
```
gsap.to('#data-orb', {
  motionPath: { path: '#s-curve-path', align: '#s-curve-path', alignOrigin: [0.5, 0.5] },
  duration: 8, ease: 'none', repeat: -1
})
```
The `#s-curve-path` is an SVG bezier that traces the pipe route connecting all 7 machines in the S-curve layout.

## API Data (poll every 15 seconds with Promise.all)

- `GET /api/admin/health` → vectorCount, service statuses, marketData status
- `GET /api/admin/folders` → file count (sum all folder.fileCount)
- `GET /api/admin/tasks` → filter for pending research tasks
- `GET /api/admin/conversations` → total conversation count

## Overlay Metrics Per Zone

- Machine 1: "{fileCount} files" badge
- Machine 2: "{vectorCount} vectors" badge
- Machine 4: Green/Red driven by pendingResearch.length (0 = green, >0 = red)
- Machine 5: "15 feeds" badge
- Machine 7: "{conversationCount} chats" badge

Badge styling: `bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-mono text-cyan-400`

## Clickable Zone Links

- Machine 1 → /knowledge
- Machine 2 → /knowledge
- Machine 3 → /agents?tab=test
- Machine 4 → /workshop
- Machine 5 → /settings
- Machine 6 → /agents
- Machine 7 → /agents?tab=test

## Hover Behavior

On hover over any machine zone: increase glow intensity via CSS class. Show tooltip: "{Stage Name} — Click to configure"

## Mobile Fallback (below lg: breakpoint)

Hide the base plate and all SVG machines. Show a vertical list of 7 glass cards using the existing GlassCard component from `src/components/GlassCard.tsx`. Each card shows:
- Stage icon (use lucide-react: Inbox, Cog, Radar, ShieldCheck, Satellite, Factory, Printer)
- Stage name and one-line description
- Live metric value
- Link to the config page

## CSS to Add to globals.css

```css
@keyframes idle-glow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.15)); }
  50% { filter: drop-shadow(0 0 16px rgba(34, 211, 238, 0.3)); }
}
@keyframes active-glow {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(34, 211, 238, 0.4)); }
  50% { filter: drop-shadow(0 0 28px rgba(34, 211, 238, 0.7)); }
}
@keyframes research-glow {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.3)); }
  50% { filter: drop-shadow(0 0 24px rgba(251, 191, 36, 0.6)); }
}
.machine-zone { animation: idle-glow 3s ease-in-out infinite; cursor: pointer; }
.machine-zone:hover { animation: active-glow 1s ease-in-out infinite; }
.machine-zone.researching { animation: research-glow 1.5s ease-in-out infinite; }
```

## Do NOT Touch

- Any files in `netlify/functions/`
- Any API routes in `web/dashboard/src/app/api/`
- `config.json`
- `chat.mts`, `process-task.mts`, `tts.mts`, `AIChat.tsx`

## Test

Run on localhost:3002. Verify all 7 zones are clickable, metrics update, animations play at 60fps, and mobile fallback works below 1024px width.
