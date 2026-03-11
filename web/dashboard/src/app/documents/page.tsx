'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRealtimeSubscription } from '@/lib/realtime'
import { StatusBadge } from '@/components/StatusBadge'
import { EngineBadge } from '@/components/EngineBadge'
import type { DocumentInventory } from '@/lib/types'
import { Upload } from 'lucide-react'

const PIPELINES = [
  { name: 'OCR', engine: 'Tesseract', types: ['scanned', 'photographed'] },
  { name: 'Technical Images', engine: 'Gemini', types: ['map', 'diagram', 'image'] },
  { name: 'Financial', engine: 'Opus', types: ['spreadsheet', 'xlsx', 'csv'] },
  { name: 'Legal/Corporate', engine: 'Opus', types: ['bylaws', 'registration', 'loi', 'mou'] },
  { name: 'PowerPoints', engine: 'Opus', types: ['pptx', 'ppt'] },
  { name: 'Word Docs', engine: 'Opus', types: ['docx', 'doc'] },
  { name: 'Websites', engine: 'Claude Code', types: ['url', 'website'] },
]

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentInventory[]>([])

  const loadData = useCallback(async () => {
    const dealId = localStorage.getItem('kop-deal-id')
    if (!dealId) return
    const { data } = await supabase.from('document_inventory').select('*').eq('deal_id', dealId).order('created_at', { ascending: false })
    if (data) setDocs(data)
  }, [])

  useEffect(() => { loadData() }, [loadData])
  useRealtimeSubscription('document_inventory', loadData)

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-semibold">Documents</h1>

      {/* Document Inventory Table */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Document Inventory</h3>
        {docs.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No documents uploaded yet. Use /process-documents to begin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Filename</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Type</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Pipeline</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Engine</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-2 px-3 text-zinc-200 font-mono text-xs">{doc.filename}</td>
                    <td className="py-2 px-3 text-zinc-400 text-xs">{doc.file_type}</td>
                    <td className="py-2 px-3 text-zinc-400 text-xs">{doc.pipeline || '—'}</td>
                    <td className="py-2 px-3"><StatusBadge status={doc.processing_status} /></td>
                    <td className="py-2 px-3">{doc.processing_engine ? <EngineBadge engine={doc.processing_engine} /> : <span className="text-zinc-600">—</span>}</td>
                    <td className="py-2 px-3 text-zinc-400 font-mono text-xs">{doc.confidence_score !== null ? `${Math.round(doc.confidence_score * 100)}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pipeline Status */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Processing Pipelines</h3>
        <div className="grid grid-cols-4 gap-3">
          {PIPELINES.map(p => {
            const pipelineDocs = docs.filter(d => p.types.some(t => d.file_type.toLowerCase().includes(t)))
            const processed = pipelineDocs.filter(d => ['processed', 'verified'].includes(d.processing_status)).length
            return (
              <div key={p.name} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-zinc-200">{p.name}</p>
                  <EngineBadge engine={p.engine} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                      style={{ width: pipelineDocs.length > 0 ? `${(processed / pipelineDocs.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">{processed}/{pipelineDocs.length}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* OCR Upload Zone */}
      <div className="rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer">
        <Upload size={32} className="mx-auto text-zinc-500 mb-3" />
        <p className="text-sm text-zinc-400">Drop files here for OCR processing</p>
        <p className="text-xs text-zinc-600 mt-1">Scanned documents, photographs of documents</p>
      </div>
    </div>
  )
}
