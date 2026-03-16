'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function RadarMachine() {
  const containerRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const ctx = containerRef.current
    if (!ctx) return

    // Dish sweeps with inertia
    gsap.to(ctx.querySelector('#dish-body'), {
      rotation: 40, duration: 2.5, yoyo: true,
      ease: 'sine.inOut', repeat: -1, transformOrigin: '100 140'
    })

    // Signal waves expand outward
    for (let i = 1; i <= 5; i++) {
      const el = ctx.querySelector(`#wave-${i}`)
      if (!el) continue
      gsap.fromTo(el,
        { scale: 0.3, opacity: 0.7, strokeWidth: 2 },
        {
          scale: 2.5, opacity: 0, strokeWidth: 0.5,
          duration: 2.5, repeat: -1, delay: i * 0.5,
          ease: 'power1.out', transformOrigin: '80 80'
        }
      )
    }

    // Data orbs — first 3 are bright matches, rest dim
    for (let i = 1; i <= 10; i++) {
      const el = ctx.querySelector(`#orb-${i}`)
      if (!el) continue
      const isMatch = i <= 3
      if (isMatch) {
        gsap.fromTo(el,
          { opacity: 0.1, scale: 0.8 },
          {
            opacity: 0.9, scale: 1.5,
            filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.9))',
            duration: 1.2, yoyo: true, repeat: -1,
            delay: gsap.utils.random(0, 2), ease: 'power2.inOut',
            transformOrigin: 'center'
          }
        )
      } else {
        gsap.to(el, {
          opacity: gsap.utils.random(0.05, 0.3),
          duration: gsap.utils.random(2, 5), yoyo: true, repeat: -1
        })
      }
    }

    // Dish tip emitter pulse
    gsap.to(ctx.querySelector('#emitter'), {
      filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.9))',
      opacity: 0.9,
      duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut'
    })
  }, { scope: containerRef })

  return (
    <svg ref={containerRef} viewBox="0 0 220 180" className="w-full h-full" fill="none">
      {/* Dish body — translucent arc */}
      <g id="dish-body">
        <path d="M60 80 Q100 30 140 80" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="2" />
        <path d="M65 80 Q100 38 135 80" fill="none" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1" />
        <line x1="100" y1="60" x2="100" y2="80" stroke="rgba(34, 211, 238, 0.25)" strokeWidth="1.5" />
        {/* Dish tip emitter */}
        <circle id="emitter" cx="100" cy="55" r="4" fill="rgba(34, 211, 238, 0.6)" />
      </g>

      {/* Dish mount — subtle outline */}
      <line x1="100" y1="80" x2="100" y2="120" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1.5" />

      {/* Signal waves — bright expanding arcs */}
      <path id="wave-1" d="M60 80 Q100 50 140 80" fill="none" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="1.5" />
      <path id="wave-2" d="M55 80 Q100 40 145 80" fill="none" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="1.5" />
      <path id="wave-3" d="M50 80 Q100 30 150 80" fill="none" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1.5" />
      <path id="wave-4" d="M45 80 Q100 20 155 80" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1.5" />
      <path id="wave-5" d="M40 80 Q100 10 160 80" fill="none" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1.5" />

      {/* Data orbs — bright dots */}
      <circle id="orb-1" cx="50" cy="50" r="3.5" fill="rgba(34, 211, 238, 0.5)" />
      <circle id="orb-2" cx="150" cy="45" r="3.5" fill="rgba(34, 211, 238, 0.5)" />
      <circle id="orb-3" cx="170" cy="70" r="3.5" fill="rgba(34, 211, 238, 0.5)" />
      <circle id="orb-4" cx="30" cy="70" r="2.5" fill="rgba(20, 184, 166, 0.3)" />
      <circle id="orb-5" cx="180" cy="55" r="2.5" fill="rgba(20, 184, 166, 0.3)" />
      <circle id="orb-6" cx="40" cy="40" r="2" fill="rgba(34, 211, 238, 0.2)" />
      <circle id="orb-7" cx="160" cy="35" r="2" fill="rgba(34, 211, 238, 0.2)" />
      <circle id="orb-8" cx="55" cy="65" r="2" fill="rgba(20, 184, 166, 0.2)" />
      <circle id="orb-9" cx="145" cy="60" r="2" fill="rgba(20, 184, 166, 0.2)" />
      <circle id="orb-10" cx="75" cy="45" r="2" fill="rgba(34, 211, 238, 0.2)" />
    </svg>
  )
}
