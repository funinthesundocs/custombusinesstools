interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <div className={`rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md transition-colors ${hover ? 'hover:border-[var(--color-primary)]/30' : ''} ${className}`}>
      {children}
    </div>
  )
}
