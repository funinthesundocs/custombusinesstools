'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRealtimeSubscription } from '@/lib/realtime'
import { StatusBadge } from '@/components/StatusBadge'
import { EngineBadge } from '@/components/EngineBadge'
import type { DeliverableVersion } from '@/lib/types'
import { Download, Eye, Check } from 'lucide-react'

const DELIVERABLE_TYPES = [
  { type: 'Projector Slides', engine: 'notebooklm', icon: '📊' },
  { type: 'Printed Leave-Behind', engine: 'opus', icon: '📄' },
  { type: 'Website', engine: 'opus', icon: '🌐' },
  { type: 'Infographics', engine: 'notebooklm', icon: '📈' },
  { type: 'Briefing Synopsis', engine: 'opus', icon: '📋' },
  { type: 'Audio Overview', engine: 'notebooklm', icon: '🎙️' },
  { type: 'Mind Map', engine: 'notebooklm', icon: '🧠' },
  { type: 'Pre-Meeting Brief', engine: 'opus', icon: '📝' },
]

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<DeliverableVersion[]>([])

  const loadData = useCallback(async () => {
    const dealId = localStorage.getItem('kop-deal-id')
    if (!dealId) return
    const { data } = await supabase.from('deliverable_versions').select('*').eq('deal_id', dealId).order('created_at', { ascending: false })
    if (data) setDeliverables(data)
  }, [])

  useEffect(() => { loadData() }, [loadData])
  useRealtimeSubscription('deliverable_versions', loadData)

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-semibold">Deliverables</h1>

      <div className="grid grid-cols-2 gap-4">
        {DELIVERABLE_TYPES.map(dt => {
          const versions = deliverables.filter(d => d.deliverable_type === dt.type)
          const latest = versions[0]
          const verificationLayers = latest ? [
            latest.status === 'approved',
            latest.status === 'approved',
            latest.status === 'approved'
          ] : [false, false, false]

          return (
            <div key={dt.type} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{dt.icon}</span>
                  <div>
                    <p className="text-base font-semibold text-zinc-100">{dt.type}</p>
                    <EngineBadge engine={dt.engine} />
                  </div>
                </div>
                <StatusBadge status={latest?.status || 'not_started'} size="md" />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Version:</span>
                  <span className="text-sm font-mono text-zinc-300">{latest ? `v${latest.version_number}` : '—'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-500 mr-1">Verification:</span>
                  {verificationLayers.map((passed, i) => (
                    <span key={i} className={`h-3 w-3 rounded-full border ${passed ? 'bg-emerald-400 border-emerald-400' : 'border-zinc-600'}`} />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded border border-zinc-700 hover:border-zinc-600 transition-colors">
                  <Eye size={12} /> Preview
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded border border-zinc-700 hover:border-zinc-600 transition-colors">
                  <Download size={12} /> Download
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-400 hover:text-emerald-300 rounded border border-emerald-800 hover:border-emerald-700 transition-colors ml-auto">
                  <Check size={12} /> Approve
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
