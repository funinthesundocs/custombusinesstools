'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface LabRow {
  num: number
  lab: string
  country: string
  flag: string
  tested: string
  proved: string
  detail: string
}

const labs: LabRow[] = [
  { num: 1, lab: 'POSCO International', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', tested: 'Production-representative lump ore', proved: 'Up to 67.31% Fe with very low impurities — shipping-grade premium', detail: 'Year: 2019. Sample: stockpile lump ore. Method: standard steelmaker feedstock analysis. P: 0.012-0.021%, S: 0.002-0.013%.' },
  { num: 2, lab: 'Intertek Minerals', country: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}', tested: '136 systematic samples across full MPSA', proved: 'Deposit-scale mineralization confirmed, highest grades in mapped ore zones reaching 56.06% Fe', detail: 'Year: 2024. PRC License 0011144. Full QC protocol (blanks, standards, duplicates). Area-wide exploration survey proving mineralization extent.' },
  { num: 3, lab: 'Beijing BGRIMM', country: 'China', flag: '\u{1F1E8}\u{1F1F3}', tested: 'Targeted samples from mineralized zones', proved: '20.72% Cu, ~15 g/t Au — CNAS-accredited state laboratory corroboration', detail: 'Years: 2015-2019. CNAS-accredited government lab. Arbitration-grade testing in commercial transaction context.' },
  { num: 4, lab: 'Davao Analytical (DALINC)', country: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}', tested: 'Multiple campaigns across mineral zones', proved: 'Up to 39.5% Cu near-concentrate, 53.4% Fe, 4.4 g/t Au — grade consistency across a decade', detail: 'Years: 2012-2025. PRC-registered analysts. Multiple campaigns confirming consistency over 13 years.' },
  { num: 5, lab: 'HK Imperial Processing', country: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}', tested: 'Commercial-scale processing of 120,000 WMT', proved: '18.02% Cu concentrate, 11.33 g/t Au, 383 g/t Ag — industrial processing viability', detail: '12 production lots processed. Demonstrated that copper mineralogy is amenable to conventional processing at commercial scale.' },
  { num: 6, lab: 'Ostrea Mineral Labs', country: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}', tested: 'Drill core samples from multiple holes', proved: '36.58% Cu from DH-1, 59.86% Fe from DH-1-2, 20.35 g/t Au from fire assay', detail: 'Est. 1976. Batch B-34805 (2024) and CAN 96885 (2017). 7-year grade consistency. Highest gold ever recorded at GMC.' },
  { num: 7, lab: 'CCIC Philippines', country: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}', tested: 'Iron ore and copper from core samples', proved: '59.34% Fe iron ore, 6.33% Cu from MEGA DH-4. High sulfur confirms sulfide mineralization.', detail: 'March 2025. International testing house. 4 copper samples from core sample series. Sulfur 2.95-8.19% — porphyry indicator.' },
  { num: 8, lab: 'SGS Korea', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', tested: 'Core samples (details confidential)', proved: 'Results favorable per GMC management — full report pending', detail: 'Referenced in SGECS geological report. Independent international laboratory.' },
  { num: 9, lab: 'Laboratorium Uji Kimia Dan Mekanik', country: 'Indonesia', flag: '\u{1F1EE}\u{1F1E9}', tested: 'Referenced in SGECS report', proved: 'Additional international validation', detail: 'Referenced in SGECS geological assessment. Indonesian laboratory adds 5th country to validation portfolio.' },
]

export function EvidenceTable() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div id="evidence" className="overflow-x-auto">
      <table className="w-full text-left text-sm" role="table" aria-label="Laboratory evidence table">
        <thead>
          <tr className="border-b-2 border-brand-navy/20">
            <th className="py-4 px-3 font-semibold text-text-primary w-8">#</th>
            <th className="py-4 px-3 font-semibold text-text-primary">Laboratory</th>
            <th className="py-4 px-3 font-semibold text-text-primary hidden md:table-cell">Country</th>
            <th className="py-4 px-3 font-semibold text-text-primary hidden lg:table-cell">What It Tested</th>
            <th className="py-4 px-3 font-semibold text-text-primary">What It Proved</th>
            <th className="py-4 px-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {labs.map(lab => (
            <>
              <tr
                key={lab.num}
                className={`border-b border-border hover:bg-bg-surface/50 cursor-pointer transition-colors ${expanded === lab.num ? 'bg-bg-surface/50' : ''}`}
                onClick={() => setExpanded(expanded === lab.num ? null : lab.num)}
                role="button"
                aria-expanded={expanded === lab.num}
              >
                <td className="py-4 px-3 font-mono font-bold text-brand-navy">{lab.num}</td>
                <td className="py-4 px-3 font-medium text-text-primary">
                  {lab.lab}
                  <span className="md:hidden text-text-muted text-xs ml-2">{lab.flag}</span>
                </td>
                <td className="py-4 px-3 text-text-secondary hidden md:table-cell">{lab.flag} {lab.country}</td>
                <td className="py-4 px-3 text-text-secondary hidden lg:table-cell">{lab.tested}</td>
                <td className="py-4 px-3 text-text-secondary">{lab.proved}</td>
                <td className="py-4 px-3">
                  {expanded === lab.num ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                </td>
              </tr>
              {expanded === lab.num && (
                <tr key={`${lab.num}-detail`}>
                  <td colSpan={6} className="px-3 pb-4">
                    <div className="bg-bg-surface rounded-lg p-4 ml-8 text-text-secondary text-sm leading-relaxed max-w-3xl">
                      {lab.detail}
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
