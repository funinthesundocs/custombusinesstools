'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { AgentCard } from '@/components/AgentCard'
import { StatusBadge } from '@/components/StatusBadge'
import type { Objection } from '@/lib/types'

const AGENTS = [
  { name: 'Lead Agent', emoji: '🎯', role: 'Coordinator', description: 'Orchestrates all agent activities, manages rounds, synthesizes cross-pollination insights' },
  { name: 'Profiler', emoji: '🔍', role: 'Target Intelligence', description: 'Deep analysis of Sabina Aboitiz and Aboitiz Construction' },
  { name: 'Translator', emoji: '🌐', role: 'Cultural Bridge', description: 'Philippine business culture, communication protocols, relationship dynamics' },
  { name: 'Scout', emoji: '🏕️', role: 'Competitive Intelligence', description: 'Market landscape, regulatory environment, competitive positioning' },
  { name: 'Red Team', emoji: '👹', role: 'Adversarial Review', description: 'Identify weaknesses, anticipate objections, stress-test claims' },
]

export default function AgentsPage() {
  const [round, setRound] = useState(1)
  const [objections, setObjections] = useState<Objection[]>([])

  const loadData = useCallback(async () => {
    const dealId = localStorage.getItem('kop-deal-id')
    if (!dealId) return
    const { data } = await supabase.from('objection_register').select('*').eq('deal_id', dealId).order('created_at', { ascending: false })
    if (data) setObjections(data)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const lead = AGENTS[0]
  const team = AGENTS.slice(1)

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agent Teams</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(r => (
              <button
                key={r}
                onClick={() => setRound(r)}
                className={`h-8 w-8 rounded-full text-xs font-bold transition-all ${
                  r === round
                    ? 'bg-[var(--color-primary)] text-black'
                    : r < round
                    ? 'bg-zinc-700 text-zinc-300'
                    : 'bg-zinc-800 text-zinc-600'
                }`}
              >
                R{r}
              </button>
            ))}
          </div>
          <span className="text-xs text-zinc-500">Round {round}</span>
        </div>
      </div>

      {/* Lead Agent - Full Width */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{lead.emoji}</span>
          <div>
            <p className="text-base font-semibold text-zinc-100">{lead.name}</p>
            <p className="text-xs text-zinc-500">{lead.role}</p>
          </div>
          <span className="ml-auto h-3 w-3 rounded-full bg-zinc-600" />
        </div>
        <p className="text-sm text-zinc-400">{lead.description}</p>
      </div>

      {/* 4 Agent Cards in 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4">
        {team.map(agent => (
          <AgentCard
            key={agent.name}
            name={agent.name}
            emoji={agent.emoji}
            status="idle"
            currentTask={agent.description}
          />
        ))}
      </div>

      {/* Cross-Pollination Log */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Cross-Pollination Log</h3>
        <p className="text-sm text-zinc-500 italic">No cross-pollination events yet. Insights will appear here as agents share findings.</p>
      </div>

      {/* Objection Map */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Objection Map</h3>
        {objections.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No objections registered yet. Red Team will populate during analysis.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Objection</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Severity</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Category</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Source</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">In Pres.</th>
                </tr>
              </thead>
              <tbody>
                {objections.map(obj => (
                  <tr key={obj.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-2 px-3 text-zinc-200 max-w-xs truncate">{obj.objection}</td>
                    <td className="py-2 px-3"><StatusBadge status={obj.severity} /></td>
                    <td className="py-2 px-3"><StatusBadge status={obj.category} /></td>
                    <td className="py-2 px-3 text-zinc-400 text-xs">{obj.likely_source || '—'}</td>
                    <td className="py-2 px-3">{obj.addressed_in_presentation ? <span className="text-emerald-400">✓</span> : <span className="text-zinc-600">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
