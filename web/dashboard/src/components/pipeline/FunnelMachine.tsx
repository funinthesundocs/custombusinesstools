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

    // Funnel glow pulse
    gsap.to(ctx.querySelector('#funnel-outline'), {
      filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))',
      opacity: 0.5,
      duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut'
    })

    // Steam with turbulence
    for (let i = 1; i <= 8; i++) {
      const el = ctx.querySelector(`#steam-${i}`)
      if (!el) continue
      gsap.fromTo(el,
        { y: 0, x: 0, opacity: 0.6, scale: 0.5 },
        {
          y: gsap.utils.random(-50, -80), x: gsap.utils.random(-20, 20),
          opacity: 0, scale: gsap.utils.random(1.5, 3),
          duration: gsap.utils.random(1.8, 3), repeat: -1,
          delay: i * 0.3, ease: 'power1.out'
        }
      )
    }

    // Funnel mouth glow pulse
    gsap.to(ctx.querySelector('#funnel-mouth'), {
      filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.8))',
      opacity: 0.8,
      duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
    })

    // Intake port pulses
    for (let i = 1; i <= 3; i++) {
      const el = ctx.querySelector(`#intake-${i}`)
      if (!el) continue
      gsap.to(el, {
        opacity: 0.7,
        filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.5))',
        duration: 1.2, yoyo: true, repeat: -1, delay: i * 0.4, ease: 'sine.inOut'
      })
    }
  }, { scope: containerRef })

  return (
    <svg ref={containerRef} viewBox="0 0 200 180" className="w-full h-full" fill="none">
      {/* Funnel outline — translucent glow only */}
      <path id="funnel-outline" d="M50 60 L90 120 L110 120 L150 60"
        fill="none" stroke="rgba(34, 211, 238, 0.25)" strokeWidth="1.5" opacity="0.3" />
      <path d="M90 120 L95 145 L105 145 L110 120"
        fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" opacity="0.3" />

      {/* Intake port glow dots */}
      <circle id="intake-1" cx="58" cy="63" r="3" fill="rgba(34, 211, 238, 0.4)" opacity="0.2" />
      <circle id="intake-2" cx="142" cy="63" r="3" fill="rgba(34, 211, 238, 0.4)" opacity="0.2" />
      <circle id="intake-3" cx="100" cy="55" r="3" fill="rgba(20, 184, 166, 0.4)" opacity="0.2" />

      {/* Funnel mouth glow zone */}
      <ellipse id="funnel-mouth" cx="100" cy="145" rx="14" ry="5" fill="rgba(34, 211, 238, 0.4)" opacity="0.4" />

      {/* Documents — glowing rectangles tumbling in */}
      <rect id="doc-1" x="70" y="20" width="12" height="15" rx="1" fill="rgba(34, 211, 238, 0.3)" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="0.5" opacity="0" />
      <rect id="doc-2" x="90" y="15" width="12" height="15" rx="1" fill="rgba(34, 211, 238, 0.3)" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="0.5" opacity="0" />
      <rect id="doc-3" x="110" y="22" width="12" height="15" rx="1" fill="rgba(20, 184, 166, 0.3)" stroke="rgba(20, 184, 166, 0.6)" strokeWidth="0.5" opacity="0" />
      <rect id="doc-4" x="80" y="10" width="12" height="15" rx="1" fill="rgba(34, 211, 238, 0.3)" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="0.5" opacity="0" />
      <rect id="doc-5" x="100" y="18" width="12" height="15" rx="1" fill="rgba(20, 184, 166, 0.3)" stroke="rgba(20, 184, 166, 0.6)" strokeWidth="0.5" opacity="0" />

      {/* Steam particles — bright cyan wisps */}
      <circle id="steam-1" cx="85" cy="52" r="5" fill="rgba(34, 211, 238, 0.2)" />
      <circle id="steam-2" cx="100" cy="48" r="6" fill="rgba(34, 211, 238, 0.18)" />
      <circle id="steam-3" cx="115" cy="50" r="4.5" fill="rgba(34, 211, 238, 0.2)" />
      <circle id="steam-4" cx="90" cy="45" r="4" fill="rgba(20, 184, 166, 0.15)" />
      <circle id="steam-5" cx="108" cy="43" r="5.5" fill="rgba(34, 211, 238, 0.18)" />
      <circle id="steam-6" cx="95" cy="50" r="3.5" fill="rgba(20, 184, 166, 0.15)" />
      <circle id="steam-7" cx="78" cy="48" r="4" fill="rgba(34, 211, 238, 0.12)" />
      <circle id="steam-8" cx="120" cy="46" r="3" fill="rgba(34, 211, 238, 0.12)" />
    </svg>
  )
}
