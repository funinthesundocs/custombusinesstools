'use client'

import type { PhaseProgress as PhaseProgressType } from '@/lib/types'

interface PhaseProgressProps {
  phases: PhaseProgressType[]
}

export function PhaseProgress({ phases }: PhaseProgressProps) {
  const sorted = [...phases].sort((a, b) => a.phase_number - b.phase_number)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-1">
        {sorted.map((phase, i) => {
          const isComplete = phase.status === 'complete'
          const isCurrent = phase.status === 'in_progress'
          const isBlocked = phase.status === 'blocked'

          return (
            <div key={phase.id || i} className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div className={`h-0.5 flex-1 ${isComplete || isCurrent ? 'bg-[var(--color-primary)]' : 'bg-zinc-700'} transition-colors`} />
                )}
                <div
                  className={`h-3 w-3 rounded-full shrink-0 transition-all ${
                    isComplete
                      ? 'bg-[var(--color-primary)]'
                      : isCurrent
                      ? 'bg-[var(--color-primary)] animate-pulse shadow-[0_0_8px_var(--color-primary)]'
                      : isBlocked
                      ? 'bg-red-500'
                      : 'bg-zinc-600'
                  }`}
                />
                {i < sorted.length - 1 && (
                  <div className={`h-0.5 flex-1 ${isComplete ? 'bg-[var(--color-primary)]' : 'bg-zinc-700'} transition-colors`} />
                )}
              </div>
              <span className={`text-[10px] text-center leading-tight truncate w-full ${
                isCurrent ? 'text-zinc-200 font-medium' : 'text-zinc-500'
              }`}>
                {phase.phase_name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
