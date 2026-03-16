'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function FactoryMachine() {
  const containerRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const ctx = containerRef.current
    if (!ctx) return

    // Gears rotate with tooth count ratios: large=20, medium=14, small=8
    gsap.to(ctx.querySelector('#gear-large'), {
      rotation: 360, duration: 10, ease: 'none', repeat: -1, transformOrigin: 'center'
    })
    gsap.to(ctx.querySelector('#gear-medium'), {
      rotation: -(360 * 20 / 14), duration: 10, ease: 'none', repeat: -1, transformOrigin: 'center'
    })
    gsap.to(ctx.querySelector('#gear-small'), {
      rotation: 360 * 20 / 8, duration: 10, ease: 'none', repeat: -1, transformOrigin: 'center'
    })

    // Saw blades spin FAST
    ctx.querySelectorAll('.saw-blade').forEach(el => {
      gsap.to(el, { rotation: 360, duration: 0.6, ease: 'none', repeat: -1, transformOrigin: 'center' })
    })

    // Conveyor belt scrolls
    gsap.to(ctx.querySelector('#conveyor-belt'), {
      strokeDashoffset: -40, duration: 1.2, ease: 'none', repeat: -1
    })

    // Sparks — random, violent, brief
    for (let i = 1; i <= 8; i++) {
      const el = ctx.querySelector(`#spark-${i}`)
      if (!el) continue
      const tl = gsap.timeline({ repeat: -1, repeatDelay: gsap.utils.random(0.5, 3) })
      tl.fromTo(el,
        { scale: 0, opacity: 1 },
        { scale: gsap.utils.random(2, 4), opacity: 0,
          duration: 0.15, ease: 'power4.out', transformOrigin: 'center' }
      )
    }

    // Gear glow pulse
    gsap.to(ctx.querySelector('#gear-large'), {
      filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.4))',
      duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut'
    })
  }, { scope: containerRef })

  return (
    <svg ref={containerRef} viewBox="0 0 260 180" className="w-full h-full" fill="none">
      {/* Large Gear — glowing outline */}
      <g id="gear-large" transform="translate(80, 85)">
        <circle r="28" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1.5" />
        <circle r="22" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1.5" strokeDasharray="8 4" />
        <circle r="8" fill="none" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" />
        {/* Gear teeth as bright marks */}
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x="-2" y="-30" width="4" height="5" rx="1" fill="rgba(34, 211, 238, 0.25)"
            transform={`rotate(${i * 18})`} />
        ))}
      </g>

      {/* Medium Gear — glowing outline */}
      <g id="gear-medium" transform="translate(140, 70)">
        <circle r="20" fill="none" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1.5" />
        <circle r="15" fill="none" stroke="rgba(20, 184, 166, 0.2)" strokeWidth="1" strokeDasharray="6 3" />
        <circle r="5" fill="none" stroke="rgba(20, 184, 166, 0.4)" strokeWidth="1" />
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x="-2" y="-22" width="4" height="4" rx="1" fill="rgba(20, 184, 166, 0.25)"
            transform={`rotate(${i * (360 / 14)})`} />
        ))}
      </g>

      {/* Small Gear — glowing outline */}
      <g id="gear-small" transform="translate(180, 95)">
        <circle r="12" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" />
        <circle r="8" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" strokeDasharray="4 2" />
        <circle r="3" fill="none" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x="-1.5" y="-14" width="3" height="3" rx="0.5" fill="rgba(34, 211, 238, 0.25)"
            transform={`rotate(${i * 45})`} />
        ))}
      </g>

      {/* Saw blades — bright spinning rings */}
      <g className="saw-blade" transform="translate(45, 110)">
        <circle r="10" fill="none" stroke="rgba(251, 107, 53, 0.4)" strokeWidth="1" />
        <circle r="6" fill="none" stroke="rgba(251, 107, 53, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
      </g>
      <g className="saw-blade" transform="translate(210, 110)">
        <circle r="10" fill="none" stroke="rgba(251, 107, 53, 0.4)" strokeWidth="1" />
        <circle r="6" fill="none" stroke="rgba(251, 107, 53, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
      </g>

      {/* Conveyor belt — bright dashed line */}
      <line id="conveyor-belt" x1="30" y1="148" x2="230" y2="148"
        stroke="rgba(34, 211, 238, 0.5)" strokeWidth="2" strokeDasharray="8 4" />

      {/* Sparks at gear contact points — bright amber */}
      <circle id="spark-1" cx="110" cy="78" r="2.5" fill="#FBBF24" opacity="0" />
      <circle id="spark-2" cx="160" cy="82" r="2.5" fill="#FBBF24" opacity="0" />
      <circle id="spark-3" cx="108" cy="85" r="2" fill="#FF6B35" opacity="0" />
      <circle id="spark-4" cx="158" cy="70" r="2" fill="#FBBF24" opacity="0" />
      <circle id="spark-5" cx="115" cy="75" r="2.5" fill="#FF6B35" opacity="0" />
      <circle id="spark-6" cx="170" cy="90" r="2" fill="#FBBF24" opacity="0" />
      <circle id="spark-7" cx="105" cy="90" r="2.5" fill="#FF6B35" opacity="0" />
      <circle id="spark-8" cx="165" cy="78" r="2" fill="#FBBF24" opacity="0" />
    </svg>
  )
}
