'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'

interface MachineOverlayProps {
  stage: number
  label: string
  position: { left: string; top: string; width: string; height: string }
  href: string
  tooltip: string
  metric?: { label: string; value: string | number }
  active?: boolean
  variant?: 'green' | 'red' | 'default'
  children: ReactNode
}

export function MachineOverlay({
  stage,
  label,
  position,
  href,
  tooltip,
  metric,
  active = false,
  variant = 'default',
  children,
}: MachineOverlayProps) {
  const [hovered, setHovered] = useState(false)

  const zoneClass =
    variant === 'red'
      ? 'machine-zone researching'
      : active
        ? 'machine-zone active'
        : 'machine-zone'

  return (
    <Link
      href={href}
      className={`absolute flex items-center justify-center ${zoneClass}`}
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
      {/* Machine SVG component */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl">
        {children}
      </div>

      {/* Metric badge */}
      {metric && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-mono text-cyan-400 whitespace-nowrap border border-cyan-500/20">
            {metric.value}
          </div>
        </div>
      )}

      {/* Stage label badge */}
      <div className="absolute top-1 left-1 z-20">
        <div className="bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-[9px] font-mono text-cyan-400 border border-cyan-500/20">
          S{stage} · {label}
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
