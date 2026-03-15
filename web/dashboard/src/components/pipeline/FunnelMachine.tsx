'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function FunnelMachine() {
  const containerRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const ctx = containerRef.current
    if (!ctx) return

    // Documents tumble in with rotation
    for (let i = 1; i <= 5; i++) {
      const el = ctx.querySelector(`#doc-${i}`)
      if (!el) continue
      gsap.fromTo(el,
        { y: -30, opacity: 0, rotation: gsap.utils.random(-15, 15), scale: 0.8 },
        {
          y: 80, opacity: 0, rotation: gsap.utils.random(-45, 45), scale: 0.4,
          duration: 2.5, ease: 'power2.in', repeat: -1, repeatDelay: 0.5,
          delay: i * 0.6, transformOrigin: 'center center'
        }
      )
    }

    // Funnel micro-vibration
    gsap.to(ctx.querySelector('#funnel-body'), {
      x: '+=1.5', duration: 0.06, yoyo: true, repeat: -1
    })

    // Steam with turbulence
    for (let i = 1; i <= 6; i++) {
      const el = ctx.querySelector(`#steam-${i}`)
      if (!el) continue
      gsap.fromTo(el,
        { y: 0, x: 0, opacity: 0.7, scale: 0.5 },
        {
          y: gsap.utils.random(-40, -70), x: gsap.utils.random(-15, 15),
          opacity: 0, scale: gsap.utils.random(1.2, 2),
          duration: gsap.utils.random(1.8, 3), repeat: -1,
          delay: i * 0.4, ease: 'power1.out'
        }
      )
    }

    // Cyan pulse at funnel mouth
    gsap.to(ctx.querySelector('#funnel-mouth'), {
      filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.6))',
      duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
    })
  }, { scope: containerRef })

  return (
    <svg ref={containerRef} viewBox="0 0 200 180" className="w-full h-full" fill="none">
      {/* Funnel body */}
      <g id="funnel-body">
        {/* Main funnel shape */}
        <path d="M50 60 L90 120 L110 120 L150 60 Z" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5" />
        <path d="M90 120 L95 145 L105 145 L110 120 Z" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5" />
        {/* Funnel rim */}
        <path d="M45 58 L155 58 L150 63 L50 63 Z" fill="#2a2a2a" stroke="#14B8A6" strokeWidth="0.5" />
        {/* Interior glow */}
        <ellipse cx="100" cy="80" rx="30" ry="8" fill="rgba(34, 211, 238, 0.08)" />
        {/* Rivets */}
        <circle cx="60" cy="65" r="2" fill="#333" stroke="#444" strokeWidth="0.5" />
        <circle cx="140" cy="65" r="2" fill="#333" stroke="#444" strokeWidth="0.5" />
        <circle cx="95" cy="130" r="1.5" fill="#333" stroke="#444" strokeWidth="0.5" />
        <circle cx="105" cy="130" r="1.5" fill="#333" stroke="#444" strokeWidth="0.5" />
      </g>

      {/* Funnel mouth glow zone */}
      <ellipse id="funnel-mouth" cx="100" cy="145" rx="12" ry="4" fill="rgba(34, 211, 238, 0.3)" />

      {/* Documents */}
      <rect id="doc-1" x="70" y="20" width="12" height="15" rx="1" fill="#2a3a4a" stroke="#22D3EE" strokeWidth="0.5" opacity="0" />
      <rect id="doc-2" x="90" y="15" width="12" height="15" rx="1" fill="#2a3a4a" stroke="#22D3EE" strokeWidth="0.5" opacity="0" />
      <rect id="doc-3" x="110" y="22" width="12" height="15" rx="1" fill="#2a3a4a" stroke="#14B8A6" strokeWidth="0.5" opacity="0" />
      <rect id="doc-4" x="80" y="10" width="12" height="15" rx="1" fill="#2a3a4a" stroke="#22D3EE" strokeWidth="0.5" opacity="0" />
      <rect id="doc-5" x="100" y="18" width="12" height="15" rx="1" fill="#2a3a4a" stroke="#14B8A6" strokeWidth="0.5" opacity="0" />

      {/* Steam particles */}
      <circle id="steam-1" cx="85" cy="55" r="4" fill="rgba(34, 211, 238, 0.15)" />
      <circle id="steam-2" cx="100" cy="50" r="5" fill="rgba(34, 211, 238, 0.12)" />
      <circle id="steam-3" cx="115" cy="53" r="3.5" fill="rgba(34, 211, 238, 0.15)" />
      <circle id="steam-4" cx="90" cy="48" r="3" fill="rgba(34, 211, 238, 0.1)" />
      <circle id="steam-5" cx="108" cy="46" r="4.5" fill="rgba(34, 211, 238, 0.12)" />
      <circle id="steam-6" cx="95" cy="52" r="3" fill="rgba(34, 211, 238, 0.1)" />

      {/* Base platform */}
      <rect x="75" y="148" width="50" height="8" rx="2" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
      <line x1="80" y1="152" x2="120" y2="152" stroke="#22D3EE" strokeWidth="0.3" opacity="0.3" />
    </svg>
  )
}
