'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { StatusBadge } from '@/components/StatusBadge'
import type { IntelligenceDocument, EntityProfile } from '@/lib/types'

const TABS = ['All', 'Target Entity', 'Regulatory', 'Competitive', 'Cultural'] as const
const TRACK_MAP: Record<string, string> = {
  'Target Entity': 'target',
  'Regulatory': 'regulatory',
  'Competitive': 'competitive',
  'Cultural': 'cultural',
}

export default function IntelligencePage() {
  const [activeTab, setActiveTab] = useState<string>('All')
  const [docs, setDocs] = useState<IntelligenceDocument[]>([])
  const [entities, setEntities] = useState<EntityProfile[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const dealId = localStorage.getItem('kop-deal-id')
    if (!dealId) return

    const [docRes, entRes] = await Promise.all([
      supabase.from('intelligence_documents').select('*').eq('deal_id', dealId).order('created_at', { ascending: false }),
      supabase.from('entity_profiles').select('*').eq('deal_id', dealId),
    ])

    if (docRes.data) setDocs(docRes.data)
    if (entRes.data) setEntities(entRes.data)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = activeTab === 'All' ? docs : docs.filter(d => d.track === TRACK_MAP[activeTab])

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-semibold">Intelligence</h1>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-zinc-800">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Research Query Tracker */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Research Tracker</h3>
        {filtered.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No intelligence gathered yet. Run /research-target to begin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Category</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Type</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Track</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Confidence</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => (
                  <tr
                    key={doc.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                    onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
                  >
                    <td className="py-2 px-3 text-zinc-200">{doc.category}</td>
                    <td className="py-2 px-3 text-zinc-400 font-mono text-xs">{doc.document_type}</td>
                    <td className="py-2 px-3"><StatusBadge status={doc.track} /></td>
                    <td className="py-2 px-3"><StatusBadge status={doc.processing_status} /></td>
                    <td className="py-2 px-3"><StatusBadge status={doc.confidence_level} /></td>
                    <td className="py-2 px-3 text-zinc-500 text-xs font-mono">{new Date(doc.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Entity Profiles */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Entity Profiles</h3>
        {entities.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No entity profiles created yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {entities.map(entity => (
              <div key={entity.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{entity.entity_type === 'person' ? '👤' : entity.entity_type === 'company' ? '🏢' : '🏛️'}</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{entity.entity_name}</p>
                    <p className="text-xs text-zinc-500">{entity.entity_type}</p>
                  </div>
                </div>
                {entity.relationship_to_deal && (
                  <p className="text-xs text-zinc-400 mt-2">{entity.relationship_to_deal}</p>
                )}
                <StatusBadge status={entity.intelligence_track} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
