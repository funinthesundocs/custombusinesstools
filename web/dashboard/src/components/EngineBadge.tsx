const ENGINE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  opus: { bg: 'bg-[#D2A8FF]/15', text: 'text-[#D2A8FF]', label: 'Opus' },
  notebooklm: { bg: 'bg-[#3FB950]/15', text: 'text-[#3FB950]', label: 'NotebookLM' },
  perplexity: { bg: 'bg-[#58A6FF]/15', text: 'text-[#58A6FF]', label: 'Perplexity' },
  gemini: { bg: 'bg-[#F0883E]/15', text: 'text-[#F0883E]', label: 'Gemini' },
  grok: { bg: 'bg-[#D29922]/15', text: 'text-[#D29922]', label: 'Grok' },
}

interface EngineBadgeProps {
  engine: string
}

export function EngineBadge({ engine }: EngineBadgeProps) {
  const key = engine.toLowerCase().replace(/[\s-]/g, '')
  const colors = ENGINE_COLORS[key] || { bg: 'bg-zinc-800', text: 'text-zinc-400', label: engine }

  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
      {colors.label}
    </span>
  )
}
