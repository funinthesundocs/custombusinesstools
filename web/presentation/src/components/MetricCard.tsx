interface MetricCardProps {
  value: string
  unit: string
  label: string
}

export function MetricCard({ value, unit, label }: MetricCardProps) {
  return (
    <div className="text-center px-4 py-6">
      <div className="font-mono font-bold text-4xl md:text-[56px] leading-none text-brand-navy projector-scale">
        {value}
      </div>
      <div className="font-mono font-medium text-brand-copper text-lg mt-1">{unit}</div>
      <div className="font-sans text-sm text-text-muted uppercase tracking-widest mt-2">{label}</div>
    </div>
  )
}
