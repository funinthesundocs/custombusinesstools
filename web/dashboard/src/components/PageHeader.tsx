import { type LucideIcon } from 'lucide-react'

interface Stat {
  label: string
  value: string
  icon?: LucideIcon
  color?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  stats?: Stat[]
  action?: React.ReactNode
}

export function PageHeader({ title, description, icon: Icon, stats, action }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--color-primary)]/10">
              <Icon size={20} className="text-[var(--color-primary)]" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{title}</h1>
            {description && <p className="text-sm text-zinc-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {stats.map(stat => {
            const StatIcon = stat.icon
            return (
              <div key={stat.label} className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-4 hover:border-[var(--color-primary)]/30 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  {StatIcon && <StatIcon size={14} className={stat.color || 'text-zinc-400'} />}
                  <span className="text-xs font-semibold text-zinc-500 uppercase">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-zinc-100 font-mono">{stat.value}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
