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
  const armRef = useRef<SVGRectElement>(null)

  useGSAP(() => {
    const ctx = containerRef.current
    if (!ctx) return

    // Gate gears spin slowly
    gsap.to(ctx.querySelector('#gate-gear-1'), {
      rotation: 360, duration: 8, ease: 'none', repeat: -1, transformOrigin: 'center'
    })
    gsap.to(ctx.querySelector('#gate-gear-2'), {
      rotation: -360, duration: 6, ease: 'none', repeat: -1, transformOrigin: 'center'
    })
  }, { scope: containerRef })

  // Reactive: gauge needle and gate arm respond to confidence
  useEffect(() => {
    if (needleRef.current) {
      const angle = -90 + (confidence / 100) * 180  // -90 to +90
      gsap.to(needleRef.current, {
        rotation: angle, duration: 1.5, ease: 'elastic.out(1, 0.3)',
        transformOrigin: '100% 100%'
      })
    }
    if (armRef.current) {
      gsap.to(armRef.current, {
        rotation: isResearching ? 0 : -80,
        duration: 1.2,
        ease: isResearching ? 'power4.in' : 'elastic.out(1, 0.4)',
        transformOrigin: '0% 50%'
      })
    }
  }, [confidence, isResearching])

  return (
    <svg ref={containerRef} viewBox="0 0 200 180" className="w-full h-full" fill="none">
      {/* Gate body */}
      <rect x="30" y="50" width="140" height="90" rx="4" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5" />
      <rect x="35" y="55" width="130" height="4" fill="#2a2a2a" />

      {/* Traffic light */}
      <rect x="85" y="60" width="30" height="55" rx="6" fill="#111" stroke="#444" strokeWidth="1" />
      <circle id="lens-red" cx="100" cy="72" r="7"
        fill={isResearching ? '#EF4444' : '#551111'}
        stroke="#333" strokeWidth="0.5"
        style={{ filter: isResearching ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))' : 'none' }} />
      <circle id="lens-green" cx="100" cy="100" r="7"
        fill={isResearching ? '#114411' : '#22C55E'}
        stroke="#333" strokeWidth="0.5"
        style={{ filter: !isResearching ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))' : 'none' }} />

      {/* Gauge */}
      <g transform="translate(55, 120)">
        <path d="M0 0 A30 30 0 0 1 60 0" fill="none" stroke="#333" strokeWidth="2" />
        <path d="M0 0 A30 30 0 0 1 60 0" fill="none" stroke="#22D3EE" strokeWidth="1" strokeDasharray="2 4" />
        <text x="30" y="12" textAnchor="middle" fill="#22D3EE" fontSize="7" fontFamily="monospace">{confidence}%</text>
      </g>
      {/* Gauge needle springs to position */}
      <line ref={needleRef} x1="85" y1="120" x2="85" y2="96" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />

      {/* Gate arm */}
      <rect ref={armRef} x="140" y="80" width="50" height="5" rx="1" fill="#444" stroke="#FBBF24" strokeWidth="0.5" />
      <circle cx="140" cy="82" r="4" fill="#333" stroke="#22D3EE" strokeWidth="0.5" />

      {/* Gate gears */}
      <g id="gate-gear-1" transform="translate(45, 90)">
        <circle r="10" fill="#2a2a2a" stroke="#444" strokeWidth="0.5" />
        <circle r="6" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="3 2" />
        <circle r="2" fill="#1a1a1a" />
      </g>
      <g id="gate-gear-2" transform="translate(155, 90)">
        <circle r="10" fill="#2a2a2a" stroke="#444" strokeWidth="0.5" />
        <circle r="6" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="3 2" />
        <circle r="2" fill="#1a1a1a" />
      </g>

      {/* Base */}
      <rect x="25" y="145" width="150" height="10" rx="3" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
      <line x1="35" y1="150" x2="165" y2="150" stroke="#22D3EE" strokeWidth="0.3" opacity="0.3" />
    </svg>
  )
}
