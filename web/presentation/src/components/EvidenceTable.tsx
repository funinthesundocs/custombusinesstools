'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { evidencePortfolio } from '@/lib/content'

/* ------------------------------------------------------------------ */
/* EVIDENCE TABLE — Expandable rows from content.ts                    */
/* ------------------------------------------------------------------ */

export function EvidenceTable() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div id="evidence" className="overflow-x-auto">
      <table className="w-full text-left text-sm" role="table" aria-label="Evidence table">
        <thead>
          <tr className="border-b-2 border-brand-navy/20">
            <th className="py-4 px-3 font-semibold text-text-primary w-8">#</th>
            <th className="py-4 px-3 font-semibold text-text-primary">Source</th>
            <th className="py-4 px-3 font-semibold text-text-primary hidden md:table-cell">Country</th>
            <th className="py-4 px-3 font-semibold text-text-primary">Key Result</th>
            <th className="py-4 px-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {evidencePortfolio.map((item, i) => (
            <>
              <tr
                key={i}
                className={`border-b border-border hover:bg-bg-surface/50 cursor-pointer transition-colors ${expanded === i ? 'bg-bg-surface/50' : ''}`}
                onClick={() => setExpanded(expanded === i ? null : i)}
                role="button"
                aria-expanded={expanded === i}
              >
                <td className="py-4 px-3 font-mono font-bold text-brand-navy">{i + 1}</td>
                <td className="py-4 px-3 font-medium text-text-primary">{item.lab}</td>
                <td className="py-4 px-3 text-text-secondary hidden md:table-cell">{item.country}</td>
                <td className="py-4 px-3 text-text-secondary">{item.result}</td>
                <td className="py-4 px-3">
                  {expanded === i ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                </td>
              </tr>
              {expanded === i && (
                <tr key={`${i}-detail`}>
                  <td colSpan={5} className="px-3 pb-4">
                    <div className="bg-bg-surface rounded-lg p-4 ml-8 text-text-secondary text-sm leading-relaxed max-w-3xl">
                      {item.question}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
