'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function SatelliteMachine() {
  const containerRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const ctx = containerRef.current
    if (!ctx) return

    // Dishes oscillate on independent frequencies
    const dishes = [
      { id: '#dish-a', dur: 3.2, range: 25 },
      { id: '#dish-b', dur: 4.0, range: 20 },
      { id: '#dish-c', dur: 2.8, range: 30 },
    ]
    dishes.forEach(({ id, dur, range }) => {
      gsap.to(ctx.querySelector(id), {
        rotation: range, duration: dur, yoyo: true,
        ease: 'sine.inOut', repeat: -1, transformOrigin: 'center bottom'
      })
    })

    // LEDs snap with steps(1) easing
    for (let i = 1; i <= 15; i++) {
      const el = ctx.querySelector(`#led-${i}`)
      if (!el) continue
      gsap.fromTo(el,
        { opacity: 0.1 },
        {
          opacity: 0.9, duration: 0.5, ease: 'steps(1)',
          repeat: -1, repeatDelay: gsap.utils.random(0.5, 3),
          yoyo: true
        }
      )
    }

    // Signal lines dash offset
    for (let i = 1; i <= 6; i++) {
      const el = ctx.querySelector(`#signal-${i}`)
      if (!el) continue
      gsap.to(el, {
        strokeDashoffset: -24, duration: gsap.utils.random(1, 2),
        ease: 'none', repeat: -1
      })
    }

    // Dish emitter glow pulses
    ctx.querySelectorAll('.dish-emitter').forEach((el, idx) => {
      gsap.to(el, {
        filter: `drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))`,
        opacity: 0.9,
        duration: 1.2 + idx * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut'
      })
    })

    // Mixer central glow
    gsap.to(ctx.querySelector('#mixer'), {
      filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.7))',
      opacity: 0.7,
      duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
    })
  }, { scope: containerRef })

  return (
    <svg ref={containerRef} viewBox="0 0 240 180" className="w-full h-full" fill="none">
      {/* Satellite dishes — translucent arcs */}
      <g id="dish-a" transform="translate(40, 60)">
        <path d="M-15 0 Q0 -20 15 0" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1.5" />
        <line x1="0" y1="-10" x2="0" y2="0" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" />
        <circle className="dish-emitter" cx="0" cy="-12" r="3" fill="rgba(34, 211, 238, 0.5)" />
        <line x1="0" y1="0" x2="0" y2="30" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1.5" />
      </g>
      <g id="dish-b" transform="translate(120, 50)">
        <path d="M-18 0 Q0 -25 18 0" fill="none" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1.5" />
        <line x1="0" y1="-12" x2="0" y2="0" stroke="rgba(20, 184, 166, 0.2)" strokeWidth="1" />
        <circle className="dish-emitter" cx="0" cy="-14" r="3.5" fill="rgba(20, 184, 166, 0.5)" />
        <line x1="0" y1="0" x2="0" y2="35" stroke="rgba(20, 184, 166, 0.15)" strokeWidth="1.5" />
      </g>
      <g id="dish-c" transform="translate(200, 55)">
        <path d="M-12 0 Q0 -18 12 0" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1.5" />
        <line x1="0" y1="-8" x2="0" y2="0" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" />
        <circle className="dish-emitter" cx="0" cy="-10" r="2.5" fill="rgba(34, 211, 238, 0.5)" />
        <line x1="0" y1="0" x2="0" y2="25" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1.5" />
      </g>

      {/* Mixer central unit — glowing outline */}
      <rect id="mixer" x="95" y="105" width="50" height="35" rx="5" fill="none" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" opacity="0.4" />

      {/* LED panel — bright dots */}
      {Array.from({ length: 15 }).map((_, i) => (
        <circle key={i} id={`led-${i + 1}`}
          cx={25 + (i % 5) * 12} cy={108 + Math.floor(i / 5) * 14}
          r="2.5" fill="rgba(34, 211, 238, 0.5)" opacity="0.1" />
      ))}

      {/* Signal lines — bright dashed connectors */}
      <line id="signal-1" x1="40" y1="90" x2="95" y2="115" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="0.8" strokeDasharray="4 4" />
      <line id="signal-2" x1="40" y1="90" x2="95" y2="125" stroke="rgba(20, 184, 166, 0.4)" strokeWidth="0.5" strokeDasharray="4 4" />
      <line id="signal-3" x1="120" y1="85" x2="120" y2="105" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="0.8" strokeDasharray="4 4" />
      <line id="signal-4" x1="120" y1="85" x2="120" y2="105" stroke="rgba(20, 184, 166, 0.4)" strokeWidth="0.5" strokeDasharray="4 4" />
      <line id="signal-5" x1="200" y1="80" x2="145" y2="115" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="0.8" strokeDasharray="4 4" />
      <line id="signal-6" x1="200" y1="80" x2="145" y2="125" stroke="rgba(20, 184, 166, 0.4)" strokeWidth="0.5" strokeDasharray="4 4" />
    </svg>
  )
}
