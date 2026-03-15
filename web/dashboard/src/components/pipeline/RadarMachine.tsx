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
    for (let i = 1; i <= 4; i++) {
      const el = ctx.querySelector(`#wave-${i}`)
      if (!el) continue
      gsap.fromTo(el,
        { scale: 0.3, opacity: 0.8, strokeWidth: 2 },
        {
          scale: 2.5, opacity: 0, strokeWidth: 0.5,
          duration: 2.5, repeat: -1, delay: i * 0.6,
          ease: 'power1.out', transformOrigin: '80 80'
        }
      )
    }

    // Data orbs — first 3 are matches, rest dim
    for (let i = 1; i <= 10; i++) {
      const el = ctx.querySelector(`#orb-${i}`)
      if (!el) continue
      const isMatch = i <= 3
      if (isMatch) {
        gsap.fromTo(el,
          { opacity: 0.1, scale: 0.8 },
          {
            opacity: 1, scale: 1.3,
            filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))',
            duration: 1.2, yoyo: true, repeat: -1,
            delay: gsap.utils.random(0, 2), ease: 'power2.inOut',
            transformOrigin: 'center'
          }
        )
      } else {
        gsap.to(el, {
          opacity: gsap.utils.random(0.05, 0.25),
          duration: gsap.utils.random(2, 5), yoyo: true, repeat: -1
        })
      }
    }

    // Monitor glow
    gsap.to(ctx.querySelector('#monitor'), {
      filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.5))',
      duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut'
    })
  }, { scope: containerRef })

  return (
    <svg ref={containerRef} viewBox="0 0 220 180" className="w-full h-full" fill="none">
      {/* Dish body */}
      <g id="dish-body">
        <path d="M60 80 Q100 30 140 80" fill="none" stroke="#444" strokeWidth="3" />
        <path d="M65 80 Q100 35 135 80" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
        <line x1="100" y1="60" x2="100" y2="80" stroke="#555" strokeWidth="2" />
        {/* Dish tip emitter */}
        <circle cx="100" cy="55" r="4" fill="#22D3EE" opacity="0.6" />
      </g>

      {/* Dish mount / base */}
      <rect x="90" y="120" width="20" height="40" rx="2" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
      <line x1="100" y1="80" x2="100" y2="120" stroke="#444" strokeWidth="3" />
      <rect x="80" y="155" width="40" height="10" rx="3" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />

      {/* Signal waves */}
      <path id="wave-1" d="M60 80 Q100 50 140 80" fill="none" stroke="#22D3EE" strokeWidth="1.5" opacity="0.6" />
      <path id="wave-2" d="M55 80 Q100 40 145 80" fill="none" stroke="#22D3EE" strokeWidth="1.5" opacity="0.5" />
      <path id="wave-3" d="M50 80 Q100 30 150 80" fill="none" stroke="#22D3EE" strokeWidth="1.5" opacity="0.4" />
      <path id="wave-4" d="M45 80 Q100 20 155 80" fill="none" stroke="#22D3EE" strokeWidth="1.5" opacity="0.3" />

      {/* Data orbs */}
      <circle id="orb-1" cx="50" cy="50" r="3" fill="#22D3EE" opacity="0.1" />
      <circle id="orb-2" cx="150" cy="45" r="3" fill="#22D3EE" opacity="0.1" />
      <circle id="orb-3" cx="170" cy="70" r="3" fill="#22D3EE" opacity="0.1" />
      <circle id="orb-4" cx="30" cy="70" r="2" fill="#22D3EE" opacity="0.1" />
      <circle id="orb-5" cx="180" cy="55" r="2" fill="#22D3EE" opacity="0.1" />
      <circle id="orb-6" cx="40" cy="40" r="2" fill="#22D3EE" opacity="0.1" />
      <circle id="orb-7" cx="160" cy="35" r="2" fill="#22D3EE" opacity="0.1" />
      <circle id="orb-8" cx="55" cy="65" r="2" fill="#22D3EE" opacity="0.1" />
      <circle id="orb-9" cx="145" cy="60" r="2" fill="#22D3EE" opacity="0.1" />
      <circle id="orb-10" cx="75" cy="45" r="2" fill="#22D3EE" opacity="0.1" />

      {/* Monitor */}
      <rect id="monitor" x="85" y="130" width="30" height="20" rx="3" fill="#111" stroke="#22D3EE" strokeWidth="0.5" />
      <line x1="90" y1="136" x2="110" y2="136" stroke="#22D3EE" strokeWidth="0.5" opacity="0.5" />
      <line x1="90" y1="140" x2="105" y2="140" stroke="#14B8A6" strokeWidth="0.3" opacity="0.4" />
      <line x1="90" y1="144" x2="108" y2="144" stroke="#22D3EE" strokeWidth="0.3" opacity="0.3" />
    </svg>
  )
}
