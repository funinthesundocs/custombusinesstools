'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRealtimeSubscription } from '@/lib/realtime'
import { PhaseProgress } from '@/components/PhaseProgress'
import { StatusBadge } from '@/components/StatusBadge'
import { EngineBadge } from '@/components/EngineBadge'
import { AgentCard } from '@/components/AgentCard'
import type { PhaseProgress as PhaseType, ActivityLog, DeliverableVersion } from '@/lib/types'
import { FileText, Search, Factory, ShieldCheck } from 'lucide-react'

export default function DashboardPage() {
  const [phases, setPhases] = useState<PhaseType[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [docCount, setDocCount] = useState(0)
  const [deliverables, setDeliverables] = useState<DeliverableVersion[]>([])

  const loadData = useCallback(async () => {
    const dealId = localStorage.getItem('kop-deal-id')
    if (!dealId) return

    const [phaseRes, actRes, docRes, delRes] = await Promise.all([
      supabase.from('phase_progress').select('*').eq('deal_id', dealId).order('phase_number'),
      supabase.from('activity_log').select('*').eq('deal_id', dealId).order('created_at', { ascending: false }).limit(20),
      supabase.from('document_inventory').select('id', { count: 'exact' }).eq('deal_id', dealId),
      supabase.from('deliverable_versions').select('*').eq('deal_id', dealId).order('created_at', { ascending: false }),
    ])

    if (phaseRes.data) setPhases(phaseRes.data)
    if (actRes.data) setActivities(actRes.data)
    if (docRes.count !== null) setDocCount(docRes.count)
    if (delRes.data) setDeliverables(delRes.data)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useRealtimeSubscription('phase_progress', loadData)
  useRealtimeSubscription('activity_log', loadData)

  const completedPhases = phases.filter(p => p.status === 'complete').length
  const currentPhase = phases.find(p => p.status === 'in_progress')

  const metrics = [
    { label: 'Documents Processed', value: docCount, icon: FileText, color: 'text-cyan-400' },
    { label: 'Intelligence Coverage', value: `${completedPhases > 1 ? Math.round((completedPhases / 4) * 100) : 0}%`, icon: Search, color: 'text-blue-400' },
    { label: 'Production Status', value: completedPhases >= 6 ? 'Active' : 'Pending', icon: Factory, color: 'text-violet-400' },
    { label: 'Verification', value: deliverables.filter(d => d.status === 'approved').length, icon: ShieldCheck, color: 'text-emerald-400' },
  ]

  const DELIVERABLE_TYPES = [
    'Projector Slides', 'Printed Leave-Behind', 'Website', 'Infographics',
    'Briefing Synopsis', 'Audio Overview', 'Mind Map', 'Pre-Meeting Brief'
  ]

  return (
    <div className="page-enter space-y-6">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-200">Phase Progress</h2>
          {currentPhase && (
            <span className="text-xs text-[var(--color-primary)] font-mono">
              Phase {currentPhase.phase_number}: {currentPhase.phase_name}
            </span>
          )}
        </div>
        <PhaseProgress phases={phases} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <m.icon size={16} className={m.color} />
              <span className="text-xs text-zinc-500">{m.label}</span>
            </div>
            <p className="text-2xl font-semibold text-zinc-100 font-mono">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Active Agents</h3>
          <div className="grid grid-cols-2 gap-3">
            <AgentCard name="Profiler" emoji="🔍" status="idle" currentTask="Awaiting target materials" />
            <AgentCard name="Translator" emoji="🌐" status="idle" currentTask="Standing by" />
            <AgentCard name="Scout" emoji="🏕️" status="idle" currentTask="Standing by" />
            <AgentCard name="Red Team" emoji="👹" status="idle" currentTask="Standing by" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Recent Activity</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No activity yet</p>
            ) : (
              activities.map(a => (
                <div key={a.id} className="flex items-start gap-3 rounded-md border border-zinc-800 bg-zinc-900/50 p-3 animate-[page-enter_200ms_ease-out]">
                  <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                    a.severity === 'success' ? 'bg-emerald-400' :
                    a.severity === 'warning' ? 'bg-amber-400' :
                    a.severity === 'error' ? 'bg-red-400' : 'bg-zinc-500'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{a.title}</p>
                    {a.detail && <p className="text-xs text-zinc-500 truncate">{a.detail}</p>}
                    <p className="text-[10px] text-zinc-600 font-mono mt-1">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Deliverable Status</h3>
        <div className="grid grid-cols-4 gap-3">
          {DELIVERABLE_TYPES.map(type => {
            const del = deliverables.find(d => d.deliverable_type === type)
            return (
              <div key={type} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-700 transition-all hover:-translate-y-px">
                <p className="text-sm text-zinc-200 mb-2">{type}</p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={del?.status || 'not_started'} />
                  {del?.production_engine && <EngineBadge engine={del.production_engine} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
