'use client'

interface AgentCardProps {
  name: string
  emoji: string
  status: 'active' | 'idle' | 'waiting' | 'complete'
  currentTask?: string
  findings?: string[]
  outputs?: string[]
}

export function AgentCard({ name, emoji, status, currentTask, findings = [], outputs = [] }: AgentCardProps) {
  const isActive = status === 'active'

  return (
    <div className={`rounded-lg border p-4 transition-all ${
      isActive
        ? 'border-[var(--color-primary)] shadow-[0_0_12px_var(--color-primary-muted)] animate-[pulse-border_2s_ease-in-out_infinite]'
        : 'border-zinc-800 bg-zinc-900'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{emoji}</span>
        <span className="text-sm font-semibold text-zinc-100">{name}</span>
        <span className={`ml-auto h-2 w-2 rounded-full ${
          isActive ? 'bg-[var(--color-primary)] animate-pulse' : status === 'complete' ? 'bg-emerald-400' : 'bg-zinc-600'
        }`} />
      </div>
      {currentTask && (
        <p className="text-xs text-zinc-400 mb-2 font-mono">{currentTask}</p>
      )}
      {findings.length > 0 && (
        <div className="mt-2">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Findings</p>
          <ul className="space-y-0.5">
            {findings.slice(0, 3).map((f, i) => (
              <li key={i} className="text-xs text-zinc-300 truncate">• {f}</li>
            ))}
          </ul>
        </div>
      )}
      {outputs.length > 0 && (
        <div className="mt-2">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Outputs</p>
          <ul className="space-y-0.5">
            {outputs.map((o, i) => (
              <li key={i} className="text-xs text-[var(--color-primary)] truncate">→ {o}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
