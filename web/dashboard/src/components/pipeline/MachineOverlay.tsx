'use client'

import Link from 'next/link'
import { type ReactNode } from 'react'

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
  position,
  href,
  label,
  children,
}: MachineOverlayProps) {
  return (
    <Link
      href={href}
      className="absolute machine-zone block"
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
        zIndex: 10,
      }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 75%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 75%, transparent 100%)',
        }}
      >
        {children}
      </div>
    </Link>
  )
}
