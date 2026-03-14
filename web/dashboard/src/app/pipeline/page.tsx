'use client'

import { useState } from 'react'
import { EngineBadge } from '@/components/EngineBadge'

const GATES = [
  {
    num: 1,
    name: 'Intelligence Completeness',
    desc: 'Must pass before Context Engineering',
    items: [
      'Target decision-maker profile is substantive with cited sources',
      'Source entity thesis is clear and compelling in business language',
      'Financial narrative has specific numbers with stated assumptions',
      'Technical data is interpreted in non-technical language',
      'At least 10 objections identified with sourced responses',
      'Regulatory pathway is documented with current status',
      'Cultural protocol is documented with specific guidance',
    ]
  },
  {
    num: 2,
    name: 'Source Document Quality',
    desc: 'Must pass before Production',
    items: [
      'Each document readable by non-technical executive in 5 minutes',
      'Each document tells a story, not just presents facts',
      'All 9 documents are internally consistent',
      'No unverified claims (everything tagged with confidence level)',
      'Documents 1–5 + 8–9 are 3–5 pages each',
      'Document 6 captures decision-making style and priorities',
    ]
  },
  {
    num: 3,
    name: 'Deliverable Quality',
    desc: 'Must pass before declaring final',
    items: [
      'All three verification layers passed',
      'Slides readable on projector at 10+ feet',
      'Tone: confident not arrogant, grounded not timid',
      'Zero spelling/grammar errors',
      'Cultural sensitivity verified against protocol notes',
      'Website loads clean, no broken links',
      'Leave-behind prints clean',
    ]
  }
]

const ROUTING_MATRIX = [
  { deliverable: 'Projector Slides', engine: 'notebooklm', reason: 'Source-grounded with citation tracing' },
  { deliverable: 'Printed Leave-Behind', engine: 'opus', reason: 'Deep narrative writing' },
  { deliverable: 'Website', engine: 'opus', reason: 'Web development via Claude Code' },
  { deliverable: 'Infographics', engine: 'notebooklm', reason: 'Visual generation from source data' },
  { deliverable: 'Briefing Synopsis', engine: 'opus', reason: 'Strategic synthesis' },
  { deliverable: 'Audio Overview', engine: 'notebooklm', reason: 'Conversational audio generation' },
  { deliverable: 'Mind Map', engine: 'notebooklm', reason: 'Visual mind maps from sources' },
  { deliverable: 'Pre-Meeting Brief', engine: 'opus', reason: 'Deep reasoning and narrative' },
]

export default function PipelinePage() {
  // Interactive checklist state: gateIndex -> itemIndex -> checked
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggleItem = (gateNum: number, itemIdx: number) => {
    const key = `${gateNum}-${itemIdx}`
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const gateProgress = (gate: typeof GATES[0]) => {
    const done = gate.items.filter((_, i) => checked[`${gate.num}-${i}`]).length
    return { done, total: gate.items.length }
  }

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-semibold">Pipeline</h1>

      {/* Quality Gates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-200">Quality Gates</h2>
          <div className="flex items-center gap-3 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded border border-zinc-600 inline-block" /> Unchecked</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[var(--color-primary)] inline-block" /> Checked</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {GATES.map(gate => {
            const { done, total } = gateProgress(gate)
            const allDone = done === total
            return (
              <div
                key={gate.num}
                className={`rounded-lg border p-4 transition-colors ${
                  allDone ? 'border-emerald-700 bg-emerald-950/20' : 'border-zinc-800 bg-zinc-900'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Gate {gate.num}</p>
                    <p className="text-sm font-semibold text-zinc-200">{gate.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{gate.desc}</p>
                  </div>
                  <span className={`text-xs font-mono font-semibold ${allDone ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {done}/{total}
                  </span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full mb-4">
                  <div
                    className="h-1 rounded-full bg-[var(--color-primary)] transition-all"
                    style={{ width: `${(done / total) * 100}%` }}
                  />
                </div>
                <div className="space-y-2">
                  {gate.items.map((item, i) => {
                    const key = `${gate.num}-${i}`
                    const isChecked = !!checked[key]
                    return (
                      <button
                        key={i}
                        onClick={() => toggleItem(gate.num, i)}
                        className="w-full flex items-start gap-2.5 text-left group"
                      >
                        <span className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
                            : 'border-zinc-600 group-hover:border-zinc-400'
                        }`}>
                          {isChecked && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                        <span className={`text-xs leading-relaxed transition-colors ${isChecked ? 'text-zinc-500 line-through' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                          {item}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Verification Layers */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Three-Layer Verification Protocol</h3>
        <div className="flex gap-6">
          {[
            { label: 'Layer 1: Source Tracing', desc: 'Every claim traced to a source document' },
            { label: 'Layer 2: Cross-Model', desc: 'Critical claims verified by a different model' },
            { label: 'Layer 3: Adversarial', desc: 'Fresh session attacks final deliverables for weaknesses' },
          ].map(layer => (
            <div key={layer.label} className="flex items-start gap-2">
              <span className="h-3 w-3 rounded-full border border-zinc-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-zinc-300 font-medium">{layer.label}</p>
                <p className="text-[10px] text-zinc-600">{layer.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routing Matrix */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-200 mb-4">Engine Routing</h2>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Deliverable</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Engine</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {ROUTING_MATRIX.map(r => (
                  <tr key={r.deliverable} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-2 px-3 text-zinc-200 text-sm">{r.deliverable}</td>
                    <td className="py-2 px-3"><EngineBadge engine={r.engine} /></td>
                    <td className="py-2 px-3 text-zinc-400 text-xs">{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
