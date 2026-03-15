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

**ANIMATION PHILOSOPHY:** Every animation must feel MECHANICAL and INDUSTRIAL — heavy metal with inertia, not weightless digital. Gears have mass. Presses have impact. Steam has turbulence. Nothing moves at constant speed unless it's a spinning blade. Use easing curves that convey weight: `power2.inOut` for heavy machinery, `elastic.out` for spring-loaded mechanisms, `power4.in` for gravity-assisted drops. All colors stay within the base plate palette: dark grays, cyan (#22D3EE) accents, teal (#14B8A6) secondaries, amber (#FBBF24) for warnings, emerald (#34D399) for success states.

### Machine 1 (Funnel — Knowledge Intake):
**Feel:** A gravity-fed hopper receiving documents. Gentle but purposeful.
```js
// Documents tumble in — not just slide. Each rotates slightly as it falls.
const docTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
for (let i = 1; i <= 5; i++) {
  docTl.fromTo(`#doc-${i}`,
    { y: -30, opacity: 0, rotation: gsap.utils.random(-15, 15), scale: 0.8 },
    { y: 180, opacity: 0, rotation: gsap.utils.random(-45, 45), scale: 0.4,
      duration: 2.5, ease: 'power2.in', delay: i * 0.6 }
  );
}

// Funnel hums — rapid micro-vibration, not a jarring shake
gsap.to('#funnel-body', { x: '+=1.5', duration: 0.06, yoyo: true, repeat: -1,
  ease: 'rough({ strength: 0.5, points: 20, clamp: true })' });

// Steam drifts with turbulence — not straight up. Each particle wanders horizontally.
for (let i = 1; i <= 6; i++) {
  gsap.fromTo(`#steam-${i}`,
    { y: 0, x: 0, opacity: 0.7, scale: 0.5 },
    { y: gsap.utils.random(-50, -80), x: gsap.utils.random(-15, 15),
      opacity: 0, scale: gsap.utils.random(1.2, 2),
      duration: gsap.utils.random(1.8, 3), repeat: -1,
      delay: i * 0.4, ease: 'power1.out' }
  );
}

// Cyan pulse at funnel mouth — breathing glow
gsap.to('#funnel-mouth', {
  filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.6))',
  duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
});
```

### Machine 2 (Factory — Chunking & Embedding):
**Feel:** Heavy industrial machinery under load. The big gear drives everything — it has WEIGHT. Smaller gears accelerate proportionally. Sparks are random and violent, not rhythmic.
```js
// Gears rotate with slight mechanical resistance (power1.inOut, not 'none')
// Tooth count ratios: large=20, medium=14, small=8
gsap.to('#gear-large', { rotation: 360, duration: 10, ease: 'none', repeat: -1,
  transformOrigin: 'center' });
gsap.to('#gear-medium', { rotation: -(360 * 20/14), duration: 10, ease: 'none',
  repeat: -1, transformOrigin: 'center' });
gsap.to('#gear-small', { rotation: 360 * 20/8, duration: 10, ease: 'none',
  repeat: -1, transformOrigin: 'center' });

// Saw blades spin FAST — these are cutting tools, not decorative
gsap.to('.saw-blade', { rotation: 360, duration: 0.6, ease: 'none', repeat: -1,
  transformOrigin: 'center' });

// Conveyor belt scrolls steadily
gsap.to('#conveyor-belt', { strokeDashoffset: -40, duration: 1.2, ease: 'none', repeat: -1 });

// Sparks — RANDOM, violent, brief. Not evenly spaced.
// Each spark: rapid scale-up, immediate fade, random delay before next
for (let i = 1; i <= 8; i++) {
  const sparkTl = gsap.timeline({ repeat: -1, repeatDelay: gsap.utils.random(0.5, 3) });
  sparkTl.fromTo(`#spark-${i}`,
    { scale: 0, opacity: 1, fill: '#FBBF24' },
    { scale: gsap.utils.random(1.5, 2.5), opacity: 0, fill: '#FF6B35',
      duration: 0.15, ease: 'power4.out' }
  );
}

// Ambient vibration on the whole machine body — it's running under load
gsap.to('#factory-body', { y: '+=0.5', duration: 0.04, yoyo: true, repeat: -1 });
```

### Machine 3 (Radar — Vector Search):
**Feel:** Precision scanning instrument. Smooth, deliberate sweep. Signal waves ripple outward like sonar. Data orbs materialize when "found."
```js
// Dish sweeps with realistic inertia — slows at the edges, fastest in the middle
gsap.to('#dish-body', { rotation: 40, duration: 2.5, yoyo: true,
  ease: 'sine.inOut', repeat: -1, transformOrigin: 'bottom center' });

// Signal waves expand outward from dish tip and fade
// Staggered so there's always one visible
for (let i = 1; i <= 4; i++) {
  gsap.fromTo(`#wave-${i}`,
    { scale: 0.3, opacity: 0.8, strokeWidth: 2 },
    { scale: 2.5, opacity: 0, strokeWidth: 0.5,
      duration: 2.5, repeat: -1, delay: i * 0.6,
      ease: 'power1.out', transformOrigin: 'left center' }
  );
}

// Data orbs — most stay dim. 2-3 "activate" (found matches) and pulse brightly.
for (let i = 1; i <= 10; i++) {
  const isMatch = i <= 3; // first 3 are "matches"
  if (isMatch) {
    gsap.fromTo(`#orb-${i}`,
      { opacity: 0.1, scale: 0.8, fill: '#22D3EE' },
      { opacity: 1, scale: 1.3, fill: '#67E8F9',
        filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))',
        duration: 1.2, yoyo: true, repeat: -1,
        delay: gsap.utils.random(0, 2), ease: 'power2.inOut' }
    );
  } else {
    gsap.to(`#orb-${i}`, {
      opacity: gsap.utils.random(0.05, 0.25),
      duration: gsap.utils.random(2, 5), yoyo: true, repeat: -1
    });
  }
}

// Monitor screen — waveform pulse (a horizontal line that oscillates)
gsap.to('#monitor', {
  filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.5))',
  duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut'
});
```

### Machine 4 (Confidence Gate) — STATE-DRIVEN:
**Feel:** A quality control checkpoint. When passing (green), everything feels smooth and approved. When failing (red), there's tension — gears grind, amber warning fires.
```js
// Accept React props: confidence (0-100), isResearching (boolean)

// Traffic light — the active lens FLARES with a glow halo, inactive dims to near-invisible
// Use gsap.to with overwrite to smoothly transition between states
function updateGate(confidence, isResearching) {
  const passing = confidence >= 70;

  gsap.to('#lens-green', {
    opacity: passing ? 1 : 0.08,
    filter: passing ? 'drop-shadow(0 0 16px rgba(52, 211, 153, 0.9))' : 'none',
    duration: 0.6, ease: 'power2.out'
  });
  gsap.to('#lens-red', {
    opacity: passing ? 0.08 : 1,
    filter: passing ? 'none' : 'drop-shadow(0 0 16px rgba(248, 113, 113, 0.9))',
    duration: 0.6, ease: 'power2.out'
  });

  // Gauge needle — swings with spring physics (overshoots slightly, settles)
  gsap.to('#gauge-needle', {
    rotation: (confidence / 100) * 180 - 90,
    duration: 1.2, ease: 'elastic.out(1, 0.5)',
    transformOrigin: 'bottom center'
  });

  // Gate arm — raises smoothly when passing, drops with gravity when failing
  gsap.to('#gate-arm', {
    rotation: passing ? -75 : 0,
    duration: passing ? 1.2 : 0.4,
    ease: passing ? 'power2.out' : 'power3.in',
    transformOrigin: 'right center'
  });

  // Gate gears only spin during active research
  if (isResearching) {
    gsap.to('#gate-gear-1', { rotation: '+=360', duration: 3, ease: 'none', repeat: -1 });
    gsap.to('#gate-gear-2', { rotation: '-=360', duration: 2, ease: 'none', repeat: -1 });
  } else {
    gsap.killTweensOf('#gate-gear-1');
    gsap.killTweensOf('#gate-gear-2');
  }
}
```

### Machine 5 (Satellite Array — Live Data Feeds):
**Feel:** An array of receivers listening to the cosmos. Subtle, ambient movement. LEDs blink like a server rack — staggered, never synchronized.
```js
// Dishes oscillate gently — each on its own frequency (no synchronization)
['a', 'b', 'c'].forEach((id, i) => {
  gsap.to(`#dish-${id}`, {
    rotation: gsap.utils.random(-6, 6),
    duration: gsap.utils.random(3, 5),
    yoyo: true, repeat: -1,
    ease: 'sine.inOut',
    delay: i * 0.7,
    transformOrigin: 'bottom center'
  });
});

// LEDs — staggered blink pattern like a server rack. Mix of fast and slow blinkers.
for (let i = 1; i <= 15; i++) {
  const speed = gsap.utils.random(0.3, 2);
  const brightness = gsap.utils.random(0.3, 1);
  gsap.to(`#led-${i}`, {
    opacity: brightness, fill: '#22D3EE',
    duration: speed, yoyo: true, repeat: -1,
    delay: gsap.utils.random(0, 3),
    ease: 'steps(1)' // digital snap, not smooth fade — these are LEDs
  });
}

// Signal lines — data streams flowing downward with varied speeds
for (let i = 1; i <= 6; i++) {
  gsap.to(`#signal-${i}`, {
    strokeDashoffset: -30,
    duration: gsap.utils.random(0.5, 1.2),
    ease: 'none', repeat: -1,
    delay: gsap.utils.random(0, 1)
  });
}

// Mixer glow — steady ambient energy pulse
gsap.to('#mixer', {
  filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.4))',
  duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut'
});
```

### Machine 6 (Assembly Line — Prompt Construction):
**Feel:** A precision assembly operation. Components slide in from the left, converge at the processor, and the processor intensifies as it works. The processor glow shifts from cool cyan to warm gold during "thinking."
```js
// Conveyor belt — same dash offset technique, steady pace
gsap.to('#assembly-belt', { strokeDashoffset: -40, duration: 1.5, ease: 'none', repeat: -1 });

// Components slide along the belt, fade in at left edge, absorbed at processor
const componentTl = gsap.timeline({ repeat: -1 });
for (let i = 1; i <= 4; i++) {
  componentTl.fromTo(`#component-${i}`,
    { x: -20, opacity: 0, scale: 0.9 },
    { x: 180, opacity: 0, scale: 0.7,
      duration: 4, ease: 'none' },
    i * 1.2 // stagger start
  );
  // Each component fades in at start, fades out as it reaches the processor
  componentTl.fromTo(`#component-${i}`,
    { opacity: 0 },
    { opacity: 1, duration: 0.5, ease: 'power1.in' },
    i * 1.2
  );
  componentTl.to(`#component-${i}`,
    { opacity: 0, duration: 0.5, ease: 'power1.out' },
    i * 1.2 + 3.5
  );
}

// Processor glow — DUAL COLOR breathing. Cyan base → gold surge → cyan settle.
const processorTl = gsap.timeline({ repeat: -1 });
processorTl
  .to('#processor-glow', {
    opacity: 0.6, scale: 1.15,
    fill: '#22D3EE',
    filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.7))',
    duration: 1.5, ease: 'sine.in'
  })
  .to('#processor-glow', {
    opacity: 0.9, scale: 1.3,
    fill: '#FBBF24',
    filter: 'drop-shadow(0 0 30px rgba(245, 158, 11, 0.8))',
    duration: 0.8, ease: 'power2.in'
  })
  .to('#processor-glow', {
    opacity: 0.3, scale: 1,
    fill: '#22D3EE',
    filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.3))',
    duration: 2, ease: 'power1.out'
  });

// Robotic arm — subtle repetitive pick-and-place motion
gsap.to('#robot-arm', {
  rotation: -15, duration: 0.8, yoyo: true, repeat: -1,
  ease: 'power2.inOut', transformOrigin: 'top center'
});

// Screens — gentle cyan glow pulse (data is flowing)
gsap.to('#screen-1, #screen-2', {
  filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.5))',
  duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 0.5
});
```

### Machine 7 (Printing Press — Delivery):
**Feel:** HEAVY. The press has real mass — it SLAMS down with gravity and rises slowly against it. Impact sends a shockwave. The output emerges with satisfaction.
```js
// Press stamp — asymmetric timing: FAST down (gravity), SLOW up (hydraulic)
// With a screen shake on impact
const pressTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
pressTl
  .to('#press-arm', { y: 45, duration: 0.2, ease: 'power4.in' })        // SLAM down
  .to('#press-body', { y: 1.5, duration: 0.05 }, '-=0.05')               // impact shake
  .to('#press-body', { y: 0, duration: 0.1, ease: 'elastic.out(1, 0.3)' }) // settle
  .to('#press-arm', { y: 0, duration: 1.2, ease: 'power1.out', delay: 0.3 }); // slow rise

// Paper output — slides out on each stamp with a satisfying emergence
const paperTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
for (let i = 1; i <= 3; i++) {
  paperTl.fromTo(`#output-${i}`,
    { x: -10, opacity: 0 },
    { x: 50, opacity: 1, duration: 0.6, ease: 'power2.out' },
    0.2 + i * 0.2 // stagger after stamp impact
  );
}

// Citation badges pop in with spring — they feel like achievements
paperTl.fromTo('#badge-1',
  { scale: 0, opacity: 0 },
  { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }, 0.8);
paperTl.fromTo('#badge-2',
  { scale: 0, opacity: 0 },
  { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }, 1.0);
paperTl.fromTo('#badge-3',
  { scale: 0, opacity: 0 },
  { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }, 1.2);

// Filing cabinet — amber glow on save, drawer slides
const cabinetTl = gsap.timeline({ repeat: -1, repeatDelay: 4 });
cabinetTl
  .to('#cabinet-drawer', { x: 8, duration: 0.4, ease: 'power2.out' })
  .to('#cabinet', {
    filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.6))',
    duration: 0.3, ease: 'power2.in'
  }, '-=0.2')
  .to('#cabinet', {
    filter: 'drop-shadow(0 0 0px rgba(251, 191, 36, 0))',
    duration: 0.8, ease: 'power1.out'
  })
  .to('#cabinet-drawer', { x: 0, duration: 0.5, ease: 'power2.inOut' }, '-=0.5');
```

### S-Curve Data Particle:
**Feel:** A glowing ember of data traveling through the pipes. Not a flat dot — it has a comet tail and leaves a brief afterglow on the pipe walls as it passes.
```js
// Main orb — travels the full S-curve path
gsap.to('#data-orb', {
  motionPath: {
    path: '#s-curve-path',
    align: '#s-curve-path',
    alignOrigin: [0.5, 0.5],
    autoRotate: true // orb rotates to face travel direction
  },
  duration: 10, ease: 'none', repeat: -1
});

// Orb glow — breathing pulse as it travels
gsap.to('#data-orb', {
  filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.9))',
  scale: 1.3,
  duration: 0.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
});

// Comet tail — a second element following slightly behind on the same path
gsap.to('#data-orb-tail', {
  motionPath: {
    path: '#s-curve-path',
    align: '#s-curve-path',
    alignOrigin: [0.5, 0.5],
    autoRotate: true
  },
  duration: 10, ease: 'none', repeat: -1,
  delay: 0.15 // slightly behind the main orb
});
gsap.set('#data-orb-tail', { opacity: 0.4, scale: 0.7 });
```
The `#s-curve-path` is an SVG bezier that traces the pipe route connecting all 7 machines in the S-curve layout. The `#data-orb` is a small circle (r=4) with fill #22D3EE. The `#data-orb-tail` is a slightly larger, dimmer version (r=6, opacity 0.4) that creates the comet trail effect.

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
