'use client'

import { useState } from 'react'

interface CoreSample {
  id: string
  x: number
  depth: number
  highlights: string[]
  color: string
  key: boolean
}

const coreSamples: CoreSample[] = [
  { id: 'DH-1', x: 200, depth: 28, highlights: ['36.58% Cu', '59.86% Fe'], color: '#B87333', key: false },
  { id: 'SBF-1A', x: 350, depth: 28, highlights: ['Iron mineralization'], color: '#5C6370', key: false },
  { id: 'SBF-1B', x: 400, depth: 55, highlights: ['Iron zone'], color: '#5C6370', key: false },
  { id: 'SBF-1C', x: 500, depth: 160, highlights: ['MASSIVE SULFIDIZATION at 60-65m'], color: '#B87333', key: true },
  { id: 'SBF-2', x: 600, depth: 40, highlights: ['Iron zone'], color: '#5C6370', key: false },
  { id: 'DH-10', x: 750, depth: 50, highlights: ['13.77 g/t Au at 16-21m'], color: '#C5922E', key: false },
  { id: 'MEGA-4', x: 850, depth: 60, highlights: ['Gold in core 16-21m', '6.33% Cu'], color: '#C5922E', key: false },
  { id: 'DH-5', x: 950, depth: 28, highlights: ['Iron, peak hematite 40% at 16-20m'], color: '#5C6370', key: false },
]

const depthToY = (d: number) => d * 3

export function DepositCrossSection() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 1200 650" className="w-full h-auto" role="img" aria-label="Deposit cross-section showing core samples and geological layers">
        {/* Background */}
        <rect x="0" y="0" width="1200" height="650" fill="#FAFBFC" />

        {/* Geological layers with undulation */}
        {/* Surface */}
        <path d="M0,0 L1200,0 L1200,12 Q1000,8 800,11 Q600,14 400,10 Q200,7 0,12 Z" fill="#8B9467" />

        {/* Iron Oxide Cap */}
        <path d="M0,12 Q200,7 400,10 Q600,14 800,11 Q1000,8 1200,12 L1200,92 Q1000,88 800,93 Q600,97 400,91 Q200,86 0,90 Z" fill="#5C6370" opacity="0.8" />
        <text x="60" y="55" fill="white" fontSize="12" fontFamily="var(--font-dm-sans)">Iron Oxide Cap</text>

        {/* Transition Zone */}
        <path d="M0,90 Q200,86 400,91 Q600,97 800,93 Q1000,88 1200,92 L1200,182 Q1000,178 800,184 Q600,188 400,181 Q200,176 0,180 Z" fill="#9CA3AF" opacity="0.6" />
        <text x="60" y="140" fill="white" fontSize="12" fontFamily="var(--font-dm-sans)">Transition Zone</text>

        {/* Sulfide Zone */}
        <path d="M0,180 Q200,176 400,181 Q600,188 800,184 Q1000,178 1200,182 L1200,300 Q1000,296 800,302 Q600,306 400,300 Q200,294 0,298 Z" fill="#B87333" opacity="0.5" />
        <text x="60" y="245" fill="white" fontSize="12" fontFamily="var(--font-dm-sans)">Sulfide Zone</text>

        {/* Porphyry Target — dashed outline */}
        <rect x="100" y="300" width="1000" height="300" fill="none" stroke="#C5922E" strokeWidth="2" strokeDasharray="8,4" rx="4" />
        <text x="500" y="460" fill="#C5922E" fontSize="14" fontFamily="var(--font-dm-sans)" textAnchor="middle" fontWeight="600">
          Geophysical Target — 80-200m
        </text>

        {/* Core samples */}
        {coreSamples.map(hole => {
          const endY = depthToY(hole.depth)
          const isHovered = hovered === hole.id
          return (
            <g
              key={hole.id}
              onMouseEnter={(e) => {
                setHovered(hole.id)
                const svgRect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect()
                if (svgRect) {
                  setTooltipPos({ x: hole.x, y: Math.min(endY + 20, 400) })
                }
              }}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              {/* Drill line */}
              <line
                x1={hole.x} y1={0} x2={hole.x} y2={endY}
                stroke={isHovered ? '#1B365D' : '#374151'}
                strokeWidth={hole.key ? 3 : isHovered ? 2.5 : 1.5}
              />
              {/* Mineralization highlight */}
              <line
                x1={hole.x} y1={Math.max(endY * 0.4, 10)} x2={hole.x} y2={endY}
                stroke={hole.color}
                strokeWidth={hole.key ? 6 : 4}
                opacity={isHovered ? 1 : 0.7}
              />
              {/* Bottom cap */}
              <circle cx={hole.x} cy={endY} r={hole.key ? 5 : 3} fill={hole.color} />
              {/* Key hole glow */}
              {hole.key && (
                <circle cx={hole.x} cy={endY} r={10} fill={hole.color} opacity={0.2}>
                  <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Label */}
              <text
                x={hole.x}
                y={endY + 18}
                textAnchor="middle"
                fill={isHovered ? '#1B365D' : '#4E5A6E'}
                fontSize="10"
                fontFamily="var(--font-jetbrains)"
                fontWeight={isHovered ? '700' : '500'}
              >
                {hole.id}
              </text>
            </g>
          )
        })}

        {/* Tooltip */}
        {hovered && (() => {
          const hole = coreSamples.find(h => h.id === hovered)
          if (!hole) return null
          const tw = 180
          const tx = Math.min(Math.max(hole.x - tw / 2, 10), 1200 - tw - 10)
          const ty = Math.min(depthToY(hole.depth) + 30, 500)
          return (
            <g>
              <rect x={tx} y={ty} width={tw} height={16 + hole.highlights.length * 16 + 20} rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
              <text x={tx + 10} y={ty + 18} fill="#1B365D" fontSize="12" fontFamily="var(--font-jetbrains)" fontWeight="700">{hole.id}</text>
              <text x={tx + tw - 10} y={ty + 18} fill="#8492A6" fontSize="10" fontFamily="var(--font-jetbrains)" textAnchor="end">{hole.depth}m depth</text>
              {hole.highlights.map((h, i) => (
                <text key={i} x={tx + 10} y={ty + 36 + i * 16} fill="#4E5A6E" fontSize="10" fontFamily="var(--font-dm-sans)">{h}</text>
              ))}
            </g>
          )
        })()}

        {/* Scale bar */}
        <g transform="translate(1020, 580)">
          {[0, 50, 100, 150, 200].map((d, i) => (
            <g key={d}>
              <line x1={0} y1={-depthToY(d) / 4} x2={5} y2={-depthToY(d) / 4} stroke="#8492A6" strokeWidth="1" />
              <text x={10} y={-depthToY(d) / 4 + 4} fill="#8492A6" fontSize="9" fontFamily="var(--font-jetbrains)">{d}m</text>
            </g>
          ))}
          <line x1={0} y1={0} x2={0} y2={-150} stroke="#8492A6" strokeWidth="1" />
        </g>

        {/* Legend */}
        <g transform="translate(30, 560)">
          <rect x="0" y="0" width="12" height="12" fill="#5C6370" opacity="0.8" rx="2" />
          <text x="18" y="10" fill="#4E5A6E" fontSize="9" fontFamily="var(--font-dm-sans)">Iron Oxide</text>
          <rect x="90" y="0" width="12" height="12" fill="#9CA3AF" opacity="0.6" rx="2" />
          <text x="108" y="10" fill="#4E5A6E" fontSize="9" fontFamily="var(--font-dm-sans)">Transition</text>
          <rect x="175" y="0" width="12" height="12" fill="#B87333" opacity="0.5" rx="2" />
          <text x="193" y="10" fill="#4E5A6E" fontSize="9" fontFamily="var(--font-dm-sans)">Sulfide</text>
          <rect x="250" y="0" width="12" height="12" fill="none" stroke="#C5922E" strokeWidth="1.5" strokeDasharray="3,2" rx="2" />
          <text x="268" y="10" fill="#4E5A6E" fontSize="9" fontFamily="var(--font-dm-sans)">Porphyry Target</text>
        </g>
      </svg>

      {/* Captions */}
      <div className="mt-4 space-y-1 text-center">
        <p className="text-text-muted text-xs italic">
          Schematic cross-section — core sample depths to scale, horizontal positions approximate
        </p>
        <p className="text-text-muted text-xs">
          Based on SGECS geological assessment filed with MGB Region XI, June 2025
        </p>
      </div>
    </div>
  )
}
