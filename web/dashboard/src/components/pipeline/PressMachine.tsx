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
    // Impact flash
    pressTl.fromTo(ctx.querySelector('#impact-flash'),
      { opacity: 0, scale: 0.5 },
      { opacity: 0.8, scale: 2, duration: 0.1, ease: 'power4.out', transformOrigin: 'center' },
      '<'
    )
    pressTl.to(ctx.querySelector('#impact-flash'), {
      opacity: 0, scale: 3, duration: 0.3
    })
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
        { x: 40, opacity: 0.8, duration: 0.6, ease: 'power2.out', delay: i * 0.3 }
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
          scale: 1, opacity: 0.8, duration: 0.5,
          ease: 'elastic.out(1, 0.3)',
          repeat: -1, repeatDelay: gsap.utils.random(4, 8),
          transformOrigin: 'center'
        }
      )
    }

    // Cabinet glow pulse
    gsap.to(ctx.querySelector('#cabinet'), {
      filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.6))',
      opacity: 0.6,
      duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut'
    })
  }, { scope: containerRef })

  return (
    <svg ref={containerRef} viewBox="0 0 240 180" className="w-full h-full" fill="none">
      {/* Press frame — subtle outline */}
      <rect x="35" y="30" width="8" height="110" fill="none" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="0.5" />
      <rect x="117" y="30" width="8" height="110" fill="none" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="0.5" />

      {/* Press arm (moves down) — glowing */}
      <g id="press-arm">
        <rect x="47" y="45" width="66" height="18" rx="3" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" />
        <rect x="55" y="58" width="50" height="8" rx="1" fill="none" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" />
        {/* Hydraulic pistons */}
        <rect x="52" y="32" width="6" height="13" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="0.5" />
        <rect x="104" y="32" width="6" height="13" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="0.5" />
      </g>

      {/* Impact flash — bright burst on slam */}
      <circle id="impact-flash" cx="80" cy="110" r="8" fill="rgba(251, 191, 36, 0.6)" opacity="0" />

      {/* Paper output — glowing sheets */}
      <rect id="output-1" x="130" y="100" width="18" height="12" rx="1" fill="rgba(34, 211, 238, 0.3)" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="0.5" opacity="0" />
      <rect id="output-2" x="130" y="108" width="18" height="12" rx="1" fill="rgba(20, 184, 166, 0.3)" stroke="rgba(20, 184, 166, 0.5)" strokeWidth="0.5" opacity="0" />
      <rect id="output-3" x="130" y="116" width="18" height="12" rx="1" fill="rgba(34, 211, 238, 0.3)" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="0.5" opacity="0" />

      {/* Badges pop up — bright rings */}
      <circle id="badge-1" cx="150" cy="60" r="6" fill="none" stroke="rgba(251, 191, 36, 0.6)" strokeWidth="1.5" opacity="0" />
      <circle id="badge-2" cx="165" cy="50" r="5" fill="none" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="1.5" opacity="0" />
      <circle id="badge-3" cx="155" cy="75" r="4" fill="none" stroke="rgba(20, 184, 166, 0.6)" strokeWidth="1.5" opacity="0" />

      {/* Filing cabinet — glowing outline */}
      <rect id="cabinet" x="160" y="85" width="65" height="55" rx="4" fill="none" stroke="rgba(251, 191, 36, 0.3)" strokeWidth="1" opacity="0.3" />
      {/* Drawer lines */}
      <line x1="165" y1="100" x2="220" y2="100" stroke="rgba(251, 191, 36, 0.15)" strokeWidth="0.5" />
      <line x1="165" y1="115" x2="220" y2="115" stroke="rgba(251, 191, 36, 0.15)" strokeWidth="0.5" />
      <line x1="165" y1="130" x2="220" y2="130" stroke="rgba(251, 191, 36, 0.15)" strokeWidth="0.5" />
    </svg>
  )
}
