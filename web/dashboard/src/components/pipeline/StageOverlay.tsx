'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface StageOverlayProps {
  stage: number
  label: string
  description: string
  position: { left: string; top: string; width: string; height: string }
  href: string
  tooltip: string
  animationSrc: string
  metric?: { label: string; value: string | number }
  active?: boolean
  variant?: 'green' | 'red' | 'default'
}

export function StageOverlay({
  stage,
  label,
  position,
  href,
  tooltip,
  animationSrc,
  metric,
  active = false,
  variant = 'default',
}: StageOverlayProps) {
  const [hovered, setHovered] = useState(false)

  const variantClass = variant === 'red' ? 'stage-zone-research' : ''

  return (
    <Link
      href={href}
      className={`stage-zone absolute flex flex-col items-center justify-center ${active ? 'active' : ''} ${variantClass}`}
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
        zIndex: 10,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animation overlay image */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl">
        <Image
          src={animationSrc}
          alt={`Stage ${stage}: ${label}`}
          fill
          className={`object-contain overlay-float ${hovered ? 'opacity-90' : 'opacity-50'} transition-opacity duration-300`}
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized
        />
      </div>

      {/* Metric badge */}
      {metric && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[10px] font-mono text-cyan-300 whitespace-nowrap border border-cyan-500/20">
            <span className="text-zinc-500 mr-1">{metric.label}:</span>
            <span className="text-cyan-300 font-semibold">{metric.value}</span>
          </div>
        </div>
      )}

      {/* Stage number badge */}
      <div className="absolute top-1 left-1 z-20">
        <div className="bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[9px] font-mono text-cyan-400 border border-cyan-500/20">
          S{stage}
        </div>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-zinc-900/95 backdrop-blur-md border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-zinc-200 whitespace-nowrap shadow-lg shadow-cyan-500/10">
            {tooltip}
          </div>
        </div>
      )}
    </Link>
  )
}
