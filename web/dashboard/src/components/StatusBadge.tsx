interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  not_started: { bg: 'bg-zinc-800', text: 'text-zinc-400', dot: 'bg-zinc-500' },
  queued: { bg: 'bg-zinc-800', text: 'text-zinc-300', dot: 'bg-zinc-400' },
  processing: { bg: 'bg-amber-950', text: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  in_progress: { bg: 'bg-amber-950', text: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  review: { bg: 'bg-blue-950', text: 'text-blue-400', dot: 'bg-blue-400' },
  approved: { bg: 'bg-emerald-950', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  complete: { bg: 'bg-emerald-950', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  error: { bg: 'bg-red-950', text: 'text-red-400', dot: 'bg-red-400' },
  flagged: { bg: 'bg-red-950', text: 'text-red-400', dot: 'bg-red-400' },
  verified: { bg: 'bg-emerald-950', text: 'text-emerald-300', dot: 'bg-emerald-300' },
  blocked: { bg: 'bg-red-950', text: 'text-red-400', dot: 'bg-red-400' },
  processed: { bg: 'bg-cyan-950', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  draft: { bg: 'bg-zinc-800', text: 'text-zinc-300', dot: 'bg-zinc-400' },
  active: { bg: 'bg-emerald-950', text: 'text-emerald-400', dot: 'bg-emerald-400 animate-pulse' },
  paused: { bg: 'bg-amber-950', text: 'text-amber-400', dot: 'bg-amber-400' },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.not_started
  const label = status.replace(/_/g, ' ')
  const px = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium uppercase tracking-wider ${colors.bg} ${colors.text} ${px}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {label}
    </span>
  )
}
