'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function AssemblyMachine() {
  const containerRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const ctx = containerRef.current
    if (!ctx) return

    // Conveyor belt scrolls continuously
    gsap.to(ctx.querySelector('#assembly-belt'), {
      strokeDashoffset: -40, duration: 1.5, ease: 'none', repeat: -1
    })

    // Components slide across on belt
    for (let i = 1; i <= 4; i++) {
      const el = ctx.querySelector(`#component-${i}`)
      if (!el) continue
      gsap.fromTo(el,
        { x: -30, opacity: 0 },
        {
          x: 200, opacity: 0, duration: 4, repeat: -1,
          delay: i * 1, ease: 'none',
          onUpdate: function () {
            const progress = this.progress()
            if (progress > 0.1 && progress < 0.8) {
              gsap.set(el, { opacity: 0.8 })
            }
          }
        }
      )
    }

    // Processor glow: cyan → gold → cyan
    const procTl = gsap.timeline({ repeat: -1, yoyo: true })
    procTl.to(ctx.querySelector('#processor-glow'), {
      fill: 'rgba(34, 211, 238, 0.5)',
      filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.8))',
      duration: 2, ease: 'sine.inOut'
    })
    procTl.to(ctx.querySelector('#processor-glow'), {
      fill: 'rgba(251, 191, 36, 0.5)',
      filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.8))',
      duration: 2, ease: 'sine.inOut'
    })

    // Robot arm pick-place cycle
    const armTl = gsap.timeline({ repeat: -1 })
    armTl.to(ctx.querySelector('#robot-arm'), {
      rotation: -30, duration: 0.8, ease: 'power2.inOut', transformOrigin: '0% 100%'
    })
    armTl.to(ctx.querySelector('#robot-arm'), {
      rotation: 0, duration: 1, ease: 'power2.inOut', delay: 0.3
    })
    armTl.to(ctx.querySelector('#robot-arm'), {
      rotation: 30, duration: 0.8, ease: 'power2.inOut'
    })
    armTl.to(ctx.querySelector('#robot-arm'), {
      rotation: 0, duration: 1, ease: 'power2.inOut', delay: 0.3
    })
  }, { scope: containerRef })

  return (
    <svg ref={containerRef} viewBox="0 0 260 180" className="w-full h-full" fill="none">
      {/* Conveyor belt — bright dashed line */}
      <line id="assembly-belt" x1="20" y1="130" x2="240" y2="130"
        stroke="rgba(34, 211, 238, 0.5)" strokeWidth="2" strokeDasharray="8 4" />

      {/* Components on belt — glowing blocks */}
      <rect id="component-1" x="30" y="120" width="10" height="8" rx="1" fill="rgba(34, 211, 238, 0.4)" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="0.5" opacity="0" />
      <rect id="component-2" x="30" y="120" width="8" height="8" rx="1" fill="rgba(20, 184, 166, 0.4)" stroke="rgba(20, 184, 166, 0.6)" strokeWidth="0.5" opacity="0" />
      <rect id="component-3" x="30" y="120" width="12" height="8" rx="1" fill="rgba(34, 211, 238, 0.4)" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="0.5" opacity="0" />
      <rect id="component-4" x="30" y="120" width="9" height="8" rx="1" fill="rgba(251, 191, 36, 0.4)" stroke="rgba(251, 191, 36, 0.6)" strokeWidth="0.5" opacity="0" />

      {/* Processor core glow */}
      <rect x="100" y="65" width="60" height="50" rx="5" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" />
      <rect id="processor-glow" x="110" y="72" width="40" height="36" rx="3" fill="rgba(34, 211, 238, 0.3)" opacity="0.4" />

      {/* Robot arm — bright outline */}
      <g id="robot-arm" transform="translate(190, 60)">
        <rect x="-3" y="0" width="6" height="55" rx="2" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" />
        <circle cx="0" cy="0" r="5" fill="none" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" />
        <rect x="-7" y="50" width="14" height="7" rx="2" fill="none" stroke="rgba(20, 184, 166, 0.4)" strokeWidth="1" />
        {/* Gripper glow */}
        <circle cx="0" cy="56" r="3" fill="rgba(20, 184, 166, 0.3)" />
      </g>
    </svg>
  )
}
