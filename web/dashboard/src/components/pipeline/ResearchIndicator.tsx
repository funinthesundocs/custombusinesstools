'use client'

import { FlaskConical } from 'lucide-react'

interface ResearchIndicatorProps {
  pendingCount: number
}

export function ResearchIndicator({ pendingCount }: ResearchIndicatorProps) {
  return (
    <div className="absolute top-3 right-3 z-30 research-indicator">
      <div className="flex items-center gap-2 bg-amber-950/80 backdrop-blur-sm border border-amber-500/40 rounded-lg px-3 py-1.5 shadow-lg shadow-amber-500/20">
        <FlaskConical size={14} className="text-amber-400 animate-pulse" />
        <span className="text-xs font-mono text-amber-300">
          {pendingCount} researching...
        </span>
      </div>
    </div>
  )
}
