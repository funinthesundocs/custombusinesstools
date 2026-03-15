'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(MotionPathPlugin, useGSAP)

export function SCurveParticle() {
  const containerRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const ctx = containerRef.current
    if (!ctx) return

    const orb = ctx.querySelector('#data-orb')
    const tail = ctx.querySelector('#comet-tail')
    const path = ctx.querySelector('#s-curve-path')
    if (!orb || !tail || !path) return

    // Main orb traverses the path
    gsap.to(orb, {
      motionPath: {
        path: path as SVGPathElement,
        align: path as SVGPathElement,
        alignOrigin: [0.5, 0.5],
        autoRotate: true
      },
      duration: 6,
      ease: 'none',
      repeat: -1
    })

    // Tail follows 0.15s behind
    gsap.to(tail, {
      motionPath: {
        path: path as SVGPathElement,
        align: path as SVGPathElement,
        alignOrigin: [0.5, 0.5],
        autoRotate: true
      },
      duration: 6,
      ease: 'none',
      repeat: -1,
      delay: 0.15
    })

    // Orb breathes
    gsap.to(orb, {
      scale: 1.3, duration: 0.8, yoyo: true, repeat: -1,
      ease: 'sine.inOut', transformOrigin: 'center'
    })
  }, { scope: containerRef })

  return (
    <svg ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-5" viewBox="0 0 1920 1080" preserveAspectRatio="none">
      {/* S-curve path between machines */}
      <path
        id="s-curve-path"
        d="M 200 540 C 400 300, 600 780, 900 540 C 1200 300, 1400 780, 1700 540"
        fill="none"
        stroke="none"
      />

      {/* Data orb — glowing cyan */}
      <circle id="data-orb" r="6" fill="#22D3EE" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="0.8s" repeatCount="indefinite" />
      </circle>

      {/* Comet tail */}
      <circle id="comet-tail" r="4" fill="#14B8A6" opacity="0.4" />
    </svg>
  )
}
