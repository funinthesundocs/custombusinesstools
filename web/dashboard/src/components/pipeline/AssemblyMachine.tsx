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
              gsap.set(el, { opacity: 1 })
            }
          }
        }
      )
    }

    // Processor glow: cyan → gold → cyan
    const procTl = gsap.timeline({ repeat: -1, yoyo: true })
    procTl.to(ctx.querySelector('#processor-glow'), {
      fill: '#22D3EE',
      filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.8))',
      duration: 2, ease: 'sine.inOut'
    })
    procTl.to(ctx.querySelector('#processor-glow'), {
      fill: '#FBBF24',
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

    // Screens glow
    ctx.querySelectorAll('.screen-el').forEach((el, idx) => {
      gsap.to(el, {
        opacity: 0.3, duration: 1.5 + idx * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut'
      })
    })
  }, { scope: containerRef })

  return (
    <svg ref={containerRef} viewBox="0 0 260 180" className="w-full h-full" fill="none">
      {/* Machine body */}
      <rect x="15" y="45" width="230" height="95" rx="4" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5" />
      <rect x="20" y="50" width="220" height="4" fill="#2a2a2a" />

      {/* Conveyor belt */}
      <line id="assembly-belt" x1="20" y1="130" x2="240" y2="130"
        stroke="#22D3EE" strokeWidth="2" strokeDasharray="8 4" opacity="0.5" />

      {/* Components on belt */}
      <rect id="component-1" x="30" y="120" width="10" height="8" rx="1" fill="#2a3a4a" stroke="#22D3EE" strokeWidth="0.5" opacity="0" />
      <rect id="component-2" x="30" y="120" width="8" height="8" rx="1" fill="#2a3a4a" stroke="#14B8A6" strokeWidth="0.5" opacity="0" />
      <rect id="component-3" x="30" y="120" width="12" height="8" rx="1" fill="#2a3a4a" stroke="#22D3EE" strokeWidth="0.5" opacity="0" />
      <rect id="component-4" x="30" y="120" width="9" height="8" rx="1" fill="#2a3a4a" stroke="#FBBF24" strokeWidth="0.5" opacity="0" />

      {/* Processor core with glow */}
      <rect x="100" y="65" width="60" height="50" rx="5" fill="#111" stroke="#333" strokeWidth="1" />
      <rect id="processor-glow" x="110" y="72" width="40" height="36" rx="3" fill="#22D3EE" opacity="0.3" />
      <text x="130" y="94" textAnchor="middle" fill="#111" fontSize="8" fontFamily="monospace" fontWeight="bold">CPU</text>
      {/* Processor pins */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1={108 + i * 9} y1="115" x2={108 + i * 9} y2="122" stroke="#444" strokeWidth="1" />
      ))}

      {/* Robot arm */}
      <g id="robot-arm" transform="translate(190, 60)">
        <rect x="-4" y="0" width="8" height="55" rx="2" fill="#333" stroke="#444" strokeWidth="1" />
        <circle cx="0" cy="0" r="6" fill="#2a2a2a" stroke="#22D3EE" strokeWidth="0.5" />
        <rect x="-8" y="50" width="16" height="8" rx="2" fill="#444" stroke="#14B8A6" strokeWidth="0.5" />
      </g>

      {/* Screens */}
      <rect className="screen-el" x="30" y="60" width="40" height="28" rx="3" fill="#111" stroke="#22D3EE" strokeWidth="0.5" opacity="0.8" />
      <line x1="35" y1="67" x2="65" y2="67" stroke="#22D3EE" strokeWidth="0.3" opacity="0.4" />
      <line x1="35" y1="72" x2="58" y2="72" stroke="#14B8A6" strokeWidth="0.3" opacity="0.3" />
      <line x1="35" y1="77" x2="62" y2="77" stroke="#22D3EE" strokeWidth="0.3" opacity="0.3" />

      <rect className="screen-el" x="30" y="95" width="40" height="20" rx="3" fill="#111" stroke="#14B8A6" strokeWidth="0.5" opacity="0.8" />
      <line x1="35" y1="102" x2="60" y2="102" stroke="#14B8A6" strokeWidth="0.3" opacity="0.4" />
      <line x1="35" y1="107" x2="55" y2="107" stroke="#22D3EE" strokeWidth="0.3" opacity="0.3" />

      {/* Base */}
      <rect x="15" y="145" width="230" height="10" rx="3" fill="#151515" stroke="#2a2a2a" strokeWidth="1" />
      <line x1="25" y1="150" x2="235" y2="150" stroke="#22D3EE" strokeWidth="0.3" opacity="0.3" />
    </svg>
  )
}
