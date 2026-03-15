'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/GlassCard'
import {
  FolderOpen,
  Cog,
  Radar,
  ShieldCheck,
  Satellite,
  Layers,
  Send,
} from 'lucide-react'

const stageIcons = [FolderOpen, Cog, Radar, ShieldCheck, Satellite, Layers, Send]

const stageColors = [
  'text-blue-400',
  'text-amber-400',
  'text-purple-400',
  'text-emerald-400',
  'text-cyan-400',
  'text-yellow-400',
  'text-emerald-400',
]

interface MobileStageCardProps {
  stage: number
  label: string
  description: string
  href: string
  metric?: { label: string; value: string | number }
}

export function MobileStageCard({
  stage,
  label,
  description,
  href,
  metric,
}: MobileStageCardProps) {
  const Icon = stageIcons[stage - 1] || FolderOpen
  const colorClass = stageColors[stage - 1] || 'text-cyan-400'

  return (
    <Link href={href}>
      <GlassCard className="p-4 flex items-center gap-4">
        <div className={`shrink-0 p-2.5 rounded-lg bg-white/5 ${colorClass}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono text-zinc-500">S{stage}</span>
            <h3 className="text-sm font-semibold text-zinc-100 truncate">{label}</h3>
          </div>
          <p className="text-xs text-zinc-500 truncate">{description}</p>
        </div>
        {metric && (
          <div className="shrink-0 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] font-mono text-cyan-300 border border-cyan-500/20">
            {metric.value}
          </div>
        )}
      </GlassCard>
    </Link>
  )
}
