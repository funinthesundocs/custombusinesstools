'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/StatusBadge'
import { EngineBadge } from '@/components/EngineBadge'
import { ProgressRing } from '@/components/ProgressRing'

const TABS = ['Source Documents', 'Prompts', 'Routing', 'Outputs'] as const

const SECTIONS = [
  { num: 1, name: 'Opening', short: 'Open' },
  { num: 2, name: 'The Opportunity', short: 'Opp' },
  { num: 3, name: 'The Alignment', short: 'Align' },
  { num: 4, name: 'The Proof', short: 'Proof' },
  { num: 5, name: 'The Plan', short: 'Plan' },
  { num: 6, name: 'The Protection', short: 'Protect' },
  { num: 7, name: 'The Vision', short: 'Vision' },
  { num: 8, name: 'The Ask', short: 'Ask' },
]

const SOURCE_DOCS = [
  { num: 1, name: 'Opportunity Brief', sections: [2, 4], status: 'not_started' },
  { num: 2, name: 'Strategic Alignment', sections: [3], status: 'not_started' },
  { num: 3, name: 'Deal Framework', sections: [5], status: 'not_started' },
  { num: 4, name: 'Risk Mitigation', sections: [6], status: 'not_started' },
  { num: 5, name: 'Vision & Impact', sections: [7], status: 'not_started' },
  { num: 6, name: 'Target Analysis', sections: [1, 2, 3, 4, 5, 6, 7, 8], status: 'not_started' },
  { num: 7, name: 'Target Materials', sections: [1, 3], status: 'not_started' },
  { num: 8, name: 'Credibility & Momentum', sections: [1, 4], status: 'not_started' },
  { num: 9, name: 'Technical Assets', sections: [4], status: 'not_started' },
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

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState<string>('Source Documents')

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-semibold">Production</h1>

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

      {activeTab === 'Source Documents' && (
        <div className="space-y-6">
          {/* Narrative Arc Visualization */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-sm font-semibold text-zinc-200 mb-6">Narrative Arc — Source Document Flow</h3>
            <div className="relative">
              {/* Section nodes */}
              <div className="flex justify-between mb-8">
                {SECTIONS.map(s => (
                  <div key={s.num} className="flex flex-col items-center gap-1">
                    <div className="h-10 w-10 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                      S{s.num}
                    </div>
                    <span className="text-[10px] text-zinc-500 text-center max-w-[60px]">{s.short}</span>
                  </div>
                ))}
              </div>
              {/* Connection lines - SVG overlay */}
              <svg className="absolute top-0 left-0 w-full h-20 pointer-events-none opacity-30" preserveAspectRatio="none">
                {SOURCE_DOCS.map(doc =>
                  doc.sections.map(sec => {
                    const x1 = `${((doc.num - 1) / 8) * 100}%`
                    const x2 = `${((sec - 1) / 7) * 100}%`
                    return (
                      <line key={`${doc.num}-${sec}`} x1={x1} y1="100%" x2={x2} y2="0" stroke="var(--color-primary)" strokeWidth="1" />
                    )
                  })
                )}
              </svg>
              {/* Source doc nodes */}
              <div className="flex justify-between mt-4">
                {SOURCE_DOCS.map(doc => (
                  <div key={doc.num} className="flex flex-col items-center gap-1">
                    <div className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)]">
                      D{doc.num}
                    </div>
                    <span className="text-[9px] text-zinc-600 text-center max-w-[56px] leading-tight">{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Source Document Cards */}
          <div className="grid grid-cols-3 gap-4">
            {SOURCE_DOCS.map(doc => (
              <div key={doc.num} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-all hover:-translate-y-px">
                <div className="flex items-center gap-3 mb-3">
                  <ProgressRing progress={0} size={40} strokeWidth={3} />
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{`0${doc.num}-${doc.name.toLowerCase().replace(/\s+/g, '-')}.md`}</p>
                    <p className="text-xs text-zinc-500">→ Sections {doc.sections.join(', ')}</p>
                  </div>
                </div>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Prompts' && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500 italic">Engine-specific prompts will appear here after context engineering.</p>
          {['NotebookLM — Slides', 'Opus — Narrative', 'Gemini — Image Analysis', 'Perplexity — Research'].map(name => (
            <div key={name} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-zinc-200">{name}</p>
                <button className="text-xs text-[var(--color-primary)] hover:underline">Copy</button>
              </div>
              <pre className="text-xs text-zinc-500 font-mono bg-zinc-950 rounded p-3">Prompt not yet generated</pre>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Routing' && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Deliverable → Engine Routing</h3>
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
                  <tr key={r.deliverable} className="border-b border-zinc-800/50">
                    <td className="py-2 px-3 text-zinc-200">{r.deliverable}</td>
                    <td className="py-2 px-3"><EngineBadge engine={r.engine} /></td>
                    <td className="py-2 px-3 text-zinc-400 text-xs">{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Outputs' && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500 italic">Version-tracked outputs will appear here during production. Outputs go through v1 → v2 → v3 → final.</p>
        </div>
      )}
    </div>
  )
}
