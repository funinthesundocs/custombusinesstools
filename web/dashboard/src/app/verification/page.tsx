'use client'

const GATES = [
  {
    num: 1,
    name: 'Intelligence Completeness',
    status: 'locked' as const,
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
    status: 'locked' as const,
    items: [
      'Each document readable by non-technical executive in 5 minutes',
      'Each document tells a story, not just presents facts',
      'All 9 documents are internally consistent',
      'No unverified claims (everything tagged with confidence level)',
      'Documents 1-5 + 8-9 are 3-5 pages each',
      'Document 6 captures decision-making style and priorities',
    ]
  },
  {
    num: 3,
    name: 'Deliverable Quality',
    status: 'locked' as const,
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

const GATE_COLORS = {
  locked: { border: 'border-red-800', bg: 'bg-red-950/30', text: 'text-red-400', label: 'LOCKED' },
  open: { border: 'border-amber-700', bg: 'bg-amber-950/30', text: 'text-amber-400', label: 'IN PROGRESS' },
  passed: { border: 'border-emerald-700', bg: 'bg-emerald-950/30', text: 'text-emerald-400', label: 'PASSED' },
}

export default function VerificationPage() {
  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-semibold">Verification</h1>

      {/* Three-Layer Verification */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 mb-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">Three-Layer Verification Protocol</h3>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-zinc-600" />
            <span className="text-xs text-zinc-400">Layer 1: Source Tracing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-zinc-600" />
            <span className="text-xs text-zinc-400">Layer 2: Cross-Model</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-zinc-600" />
            <span className="text-xs text-zinc-400">Layer 3: Adversarial</span>
          </div>
        </div>
      </div>

      {/* Quality Gates */}
      <div className="grid grid-cols-3 gap-4">
        {GATES.map(gate => {
          const colors = GATE_COLORS[gate.status]
          return (
            <div key={gate.num} className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Gate {gate.num}</p>
                  <p className="text-xs text-zinc-400">{gate.name}</p>
                </div>
                <span className={`text-[10px] font-bold tracking-wider ${colors.text}`}>{colors.label}</span>
              </div>
              <div className="space-y-2">
                {gate.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="h-4 w-4 rounded border border-zinc-700 shrink-0 mt-0.5" />
                    <span className="text-xs text-zinc-400 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Verification Log */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Verification Log</h3>
        <p className="text-sm text-zinc-500 italic">No verification events yet. Run /verify-claims to begin.</p>
      </div>

      {/* Adversarial Review Panel */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Adversarial Review Panel</h3>
        <p className="text-sm text-zinc-500 italic">Adversarial reviews will appear here. A fresh model session critiques final deliverables.</p>
      </div>
    </div>
  )
}
