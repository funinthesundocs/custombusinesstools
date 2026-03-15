'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function PressMachine() {
  const containerRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const ctx = containerRef.current
    if (!ctx) return

    // Press arm: asymmetric slam — 0.2s gravity down, 1.2s hydraulic rise
    const pressTl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
    pressTl.to(ctx.querySelector('#press-arm'), {
      y: 45, duration: 0.2, ease: 'power4.in'
    })
    // Impact shake on body
    pressTl.to(ctx.querySelector('#press-body'), {
      x: '+=2', duration: 0.03, yoyo: true, repeat: 5
    }, '<')
    // Hydraulic rise: SLOW
    pressTl.to(ctx.querySelector('#press-arm'), {
      y: 0, duration: 1.2, ease: 'power1.out'
    })

    // Paper output slides out after press
    for (let i = 1; i <= 3; i++) {
      const el = ctx.querySelector(`#output-${i}`)
      if (!el) continue
      const tl = gsap.timeline({ repeat: -1, repeatDelay: gsap.utils.random(3, 6) })
      tl.fromTo(el,
        { x: 0, opacity: 0 },
        { x: 40, opacity: 1, duration: 0.6, ease: 'power2.out', delay: i * 0.3 }
      )
      tl.to(el, { x: 60, opacity: 0, duration: 0.4, delay: 1 })
    }

    // Badge spring pop
    for (let i = 1; i <= 3; i++) {
      const el = ctx.querySelector(`#badge-${i}`)
      if (!el) continue
      gsap.fromTo(el,
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.5,
          ease: 'elastic.out(1, 0.3)',
          repeat: -1, repeatDelay: gsap.utils.random(4, 8),
          transformOrigin: 'center'
        }
      )
    }

    // Cabinet amber glow
    gsap.to(ctx.querySelector('#cabinet'), {
      filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))',
      duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut'
    })

    // Cabinet drawer slides
    gsap.to(ctx.querySelector('#cabinet-drawer'), {
      x: 8, duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
    })
  }, { scope: containerRef })

  return (
    <svg ref={containerRef} viewBox="0 0 240 180" className="w-full h-full" fill="none">
      <g id="press-body">
        {/* Press frame */}
        <rect x="30" y="25" width="100" height="120" rx="4" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5" />
        {/* Press columns */}
        <rect x="35" y="30" width="12" height="110" fill="#2a2a2a" />
        <rect x="113" y="30" width="12" height="110" fill="#2a2a2a" />
        {/* Press bed */}
        <rect x="45" y="110" width="70" height="10" rx="2" fill="#333" stroke="#444" strokeWidth="0.5" />
        {/* Accent */}
        <line x1="40" y1="35" x2="120" y2="35" stroke="#22D3EE" strokeWidth="0.3" opacity="0.3" />
      </g>

      {/* Press arm (moves down) */}
      <g id="press-arm">
        <rect x="47" y="45" width="66" height="20" rx="3" fill="#444" stroke="#555" strokeWidth="1" />
        <rect x="55" y="60" width="50" height="10" rx="1" fill="#555" stroke="#FBBF24" strokeWidth="0.5" />
        {/* Hydraulic pistons */}
        <rect x="50" y="30" width="8" height="15" fill="#555" />
        <rect x="102" y="30" width="8" height="15" fill="#555" />
      </g>

      {/* Paper output */}
      <rect id="output-1" x="130" y="100" width="18" height="12" rx="1" fill="#2a3a4a" stroke="#22D3EE" strokeWidth="0.5" opacity="0" />
      <rect id="output-2" x="130" y="108" width="18" height="12" rx="1" fill="#2a3a4a" stroke="#14B8A6" strokeWidth="0.5" opacity="0" />
      <rect id="output-3" x="130" y="116" width="18" height="12" rx="1" fill="#2a3a4a" stroke="#22D3EE" strokeWidth="0.5" opacity="0" />

      {/* Badges pop up */}
      <circle id="badge-1" cx="150" cy="60" r="6" fill="none" stroke="#FBBF24" strokeWidth="1" opacity="0" />
      <circle id="badge-2" cx="165" cy="50" r="5" fill="none" stroke="#22D3EE" strokeWidth="1" opacity="0" />
      <circle id="badge-3" cx="155" cy="75" r="4" fill="none" stroke="#14B8A6" strokeWidth="1" opacity="0" />

      {/* Filing cabinet */}
      <rect id="cabinet" x="160" y="85" width="65" height="55" rx="4" fill="#1a1a1a" stroke="#FBBF24" strokeWidth="0.8" />
      {/* Drawer slots */}
      <line x1="165" y1="100" x2="220" y2="100" stroke="#333" strokeWidth="0.5" />
      <line x1="165" y1="115" x2="220" y2="115" stroke="#333" strokeWidth="0.5" />
      <line x1="165" y1="130" x2="220" y2="130" stroke="#333" strokeWidth="0.5" />
      {/* Active drawer */}
      <rect id="cabinet-drawer" x="167" y="103" width="48" height="10" rx="2" fill="#222" stroke="#FBBF24" strokeWidth="0.3" />
      <circle cx="191" cy="108" r="2" fill="#FBBF24" opacity="0.5" />
      {/* Cabinet label */}
      <text x="192" y="95" textAnchor="middle" fill="#FBBF24" fontSize="6" fontFamily="monospace">FILES</text>

      {/* Base */}
      <rect x="25" y="150" width="205" height="10" rx="3" fill="#151515" stroke="#2a2a2a" strokeWidth="1" />
      <line x1="35" y1="155" x2="220" y2="155" stroke="#FBBF24" strokeWidth="0.3" opacity="0.3" />
    </svg>
  )
}
