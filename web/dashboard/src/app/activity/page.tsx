'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRealtimeSubscription } from '@/lib/realtime'
import type { ActivityLog } from '@/lib/types'

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([])

  const loadData = useCallback(async () => {
    const dealId = localStorage.getItem('kop-deal-id')
    if (!dealId) return
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) setActivities(data)
  }, [])

  useEffect(() => { loadData() }, [loadData])
  useRealtimeSubscription('activity_log', loadData)

  const severityColors = {
    info: 'bg-zinc-500',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
  }

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-semibold">Activity Log</h1>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900">
        {activities.length === 0 ? (
          <p className="text-sm text-zinc-500 italic p-6">No activity recorded yet.</p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {activities.map(a => (
              <div key={a.id} className="flex items-start gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${severityColors[a.severity]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-zinc-200">{a.title}</p>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">{a.event_type}</span>
                  </div>
                  {a.detail && <p className="text-xs text-zinc-400 mt-0.5">{a.detail}</p>}
                  <div className="flex items-center gap-3 mt-1.5">
                    {a.source && <span className="text-[10px] text-zinc-600 font-mono">{a.source}</span>}
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
