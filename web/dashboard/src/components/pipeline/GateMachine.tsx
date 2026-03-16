'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

interface GateMachineProps {
  confidence?: number   // 0-100, drives gauge needle
  isResearching?: boolean  // drives red/green light, gate arm
}

export function GateMachine({ confidence = 85, isResearching = false }: GateMachineProps) {
  const containerRef = useRef<SVGSVGElement>(null)
  const needleRef = useRef<SVGLineElement>(null)

  useGSAP(() => {
    const ctx = containerRef.current
    if (!ctx) return

    // Gate gears spin — glowing outlines
    gsap.to(ctx.querySelector('#gate-gear-1'), {
      rotation: 360, duration: 8, ease: 'none', repeat: -1, transformOrigin: 'center'
    })
    gsap.to(ctx.querySelector('#gate-gear-2'), {
      rotation: -360, duration: 6, ease: 'none', repeat: -1, transformOrigin: 'center'
    })

    // Gauge arc glow pulse
    gsap.to(ctx.querySelector('#gauge-arc'), {
      filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.5))',
      duration: 2, yoyo: true, repeat: -1, ease: 'sine.inOut'
    })
  }, { scope: containerRef })

  // Reactive: gauge needle responds to confidence
  useEffect(() => {
    if (needleRef.current) {
      const angle = -90 + (confidence / 100) * 180
      gsap.to(needleRef.current, {
        rotation: angle, duration: 1.5, ease: 'elastic.out(1, 0.3)',
        transformOrigin: '100% 100%'
      })
    }
  }, [confidence, isResearching])

  return (
    <svg ref={containerRef} viewBox="0 0 200 180" className="w-full h-full" fill="none">
      {/* Traffic light — just the glowing lenses, no housing */}
      <circle cx="100" cy="72" r="8"
        fill={isResearching ? 'rgba(239, 68, 68, 0.6)' : 'rgba(239, 68, 68, 0.05)'}
        style={{ filter: isResearching ? 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.9))' : 'none' }} />
      <circle cx="100" cy="100" r="8"
        fill={isResearching ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.6)'}
        style={{ filter: !isResearching ? 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.9))' : 'none' }} />

      {/* Gauge arc — bright */}
      <g transform="translate(55, 125)">
        <path id="gauge-arc" d="M0 0 A30 30 0 0 1 60 0" fill="none" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="2" />
        <path d="M0 0 A30 30 0 0 1 60 0" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" strokeDasharray="2 4" />
        <text x="30" y="12" textAnchor="middle" fill="rgba(34, 211, 238, 0.8)" fontSize="7" fontFamily="monospace">{confidence}%</text>
      </g>
      {/* Gauge needle — bright amber */}
      <line ref={needleRef} x1="85" y1="125" x2="85" y2="100" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))' }} />

      {/* Gate gears — glowing outlines */}
      <g id="gate-gear-1" transform="translate(40, 90)">
        <circle r="12" fill="none" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" />
        <circle r="8" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" strokeDasharray="3 2" />
        <circle r="2.5" fill="rgba(34, 211, 238, 0.3)" />
      </g>
      <g id="gate-gear-2" transform="translate(160, 90)">
        <circle r="12" fill="none" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1" />
        <circle r="8" fill="none" stroke="rgba(20, 184, 166, 0.2)" strokeWidth="1" strokeDasharray="3 2" />
        <circle r="2.5" fill="rgba(20, 184, 166, 0.3)" />
      </g>
    </svg>
  )
}
