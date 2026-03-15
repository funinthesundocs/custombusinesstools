'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { MachineOverlay } from '@/components/pipeline/MachineOverlay'
import { MobileStageCard } from '@/components/pipeline/MobileStageCard'
import { SCurveParticle } from '@/components/pipeline/SCurveParticle'
import { ResearchIndicator } from '@/components/pipeline/ResearchIndicator'
import { FunnelMachine } from '@/components/pipeline/FunnelMachine'
import { FactoryMachine } from '@/components/pipeline/FactoryMachine'
import { RadarMachine } from '@/components/pipeline/RadarMachine'
import { GateMachine } from '@/components/pipeline/GateMachine'
import { SatelliteMachine } from '@/components/pipeline/SatelliteMachine'
import { AssemblyMachine } from '@/components/pipeline/AssemblyMachine'
import { PressMachine } from '@/components/pipeline/PressMachine'

/* ── Types ── */
interface HealthData {
  supabase: { status: string; detail: string }
  pinecone: { status: string; vectorCount: number | null; detail?: string }
  anthropic: { status: string }
  gemini: { status: string }
  elevenlabs: { status: string }
  marketData: { status: string; lastFetched: string | null }
}

interface AgentTask {
  id: string
  task_type: string
  status: string
  priority: number
  payload: Record<string, unknown>
  result: Record<string, unknown> | null
  created_at: string
}

interface FolderInfo {
  name: string
  fileCount: number
  path: string
}

/* ── Stage definitions ── */
const stages = [
  {
    stage: 1,
    label: 'Knowledge Drop',
    description: 'Ingesting raw documents and data into the system',
    href: '/knowledge',
    tooltip: 'Knowledge Base — manage files and folders',
    position: { left: '5%', top: '3%', width: '20%', height: '30%' },
    metricKey: 'files' as const,
  },
  {
    stage: 2,
    label: 'The Factory',
    description: 'Chunking documents and embedding vectors for search',
    href: '/knowledge',
    tooltip: 'Embedding Pipeline — sync and re-embed',
    position: { left: '33%', top: '1%', width: '25%', height: '30%' },
    metricKey: 'vectors' as const,
  },
  {
    stage: 3,
    label: 'The Question',
    description: 'Receiving user queries for information retrieval',
    href: '/agents?tab=test',
    tooltip: 'Test Agent — ask questions and see retrieval',
    position: { left: '66%', top: '1%', width: '24%', height: '32%' },
    metricKey: 'score' as const,
  },
  {
    stage: 4,
    label: 'Confidence Gate',
    description: 'Filtering responses based on relevance and quality',
    href: '/workshop',
    tooltip: 'Workshop — RAG tuning and thresholds',
    position: { left: '56%', top: '38%', width: '25%', height: '28%' },
    metricKey: 'confidence' as const,
  },
  {
    stage: 5,
    label: 'Live Data Feeds',
    description: 'Incorporating real-time external data for context',
    href: '/settings',
    tooltip: 'Settings — configure data feeds',
    position: { left: '17%', top: '36%', width: '30%', height: '30%' },
    metricKey: 'feeds' as const,
  },
  {
    stage: 6,
    label: 'Assembly Line',
    description: 'Generating final outputs by combining retrieved information',
    href: '/agents',
    tooltip: 'Agent Configure — system prompt and identity',
    position: { left: '10%', top: '72%', width: '35%', height: '26%' },
    metricKey: 'model' as const,
  },
  {
    stage: 7,
    label: 'The Delivery',
    description: 'Presenting the synthesized response to the user',
    href: '/agents?tab=test',
    tooltip: 'Agent Test — conversation history and responses',
    position: { left: '55%', top: '72%', width: '33%', height: '26%' },
    metricKey: 'conversations' as const,
  },
]

/* ── Machine components map ── */
const MachineComponents: Record<number, React.FC<{ confidence?: number; isResearching?: boolean }>> = {
  1: FunnelMachine,
  2: FactoryMachine,
  3: RadarMachine,
  4: GateMachine,
  5: SatelliteMachine,
  6: AssemblyMachine,
  7: PressMachine,
}

/* ── Component ── */
export default function DashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [convCount, setConvCount] = useState<number | null>(null)
  const [fileCount, setFileCount] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* ── Fetchers ── */
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/health')
      if (res.ok) setHealth(await res.json() as HealthData)
    } catch { /* ignore */ }
  }, [])

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tasks')
      if (res.ok) setTasks(await res.json() as AgentTask[])
    } catch { /* ignore */ }
  }, [])

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/conversations')
      if (res.ok) {
        const data = await res.json() as { total: number }
        setConvCount(data.total)
      }
    } catch { /* ignore */ }
  }, [])

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/folders')
      if (res.ok) {
        const data = await res.json() as FolderInfo[]
        setFileCount(data.reduce((sum, f) => sum + f.fileCount, 0))
      }
    } catch { /* ignore */ }
  }, [])

  const fetchAll = useCallback(() => {
    fetchHealth()
    fetchTasks()
    fetchConversations()
    fetchFolders()
  }, [fetchHealth, fetchTasks, fetchConversations, fetchFolders])

  useEffect(() => {
    fetchAll()
    intervalRef.current = setInterval(fetchAll, 15000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchAll])

  /* ── Derived metrics ── */
  const pendingResearch = tasks.filter(
    (t) => t.status === 'pending' || t.status === 'in_progress'
  ).length

  const vectorCount = health?.pinecone.vectorCount

  const getMetric = (key: string) => {
    switch (key) {
      case 'files':
        return { label: 'Files', value: fileCount != null ? fileCount.toLocaleString() : '—' }
      case 'vectors':
        return {
          label: 'Vectors',
          value: vectorCount != null ? vectorCount.toLocaleString() : '—',
        }
      case 'score':
        return { label: 'Score', value: '0.87' }
      case 'confidence':
        return {
          label: 'Status',
          value: pendingResearch > 0 ? '⚠ Researching' : '✓ Confident',
        }
      case 'feeds':
        return { label: 'Active', value: '12 feeds' }
      case 'model':
        return { label: 'Model', value: 'Claude Sonnet' }
      case 'conversations':
        return {
          label: 'Convos',
          value: convCount != null ? convCount.toLocaleString() : '—',
        }
      default:
        return undefined
    }
  }

  return (
    <div className="page-enter">
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
          Pipeline Dashboard
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          RAG Factory — 7-stage animated pipeline overview
        </p>
      </div>

      {/* ── Desktop: Base plate with animated SVG machine overlays ── */}
      <div className="hidden lg:block">
        <div
          className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-zinc-950"
          style={{ aspectRatio: '1568 / 862' }}
        >
          {/* Base plate background */}
          <img
            src="/rag-factory-baseplate.jpg"
            alt="RAG Factory Pipeline"
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* S-curve data particle (GSAP MotionPath) */}
          <SCurveParticle />

          {/* 7 Animated Machine Stage overlays */}
          {stages.map((s) => {
            const MachineComponent = MachineComponents[s.stage]
            return (
              <MachineOverlay
                key={s.stage}
                stage={s.stage}
                label={s.label}
                position={s.position}
                href={s.href}
                tooltip={s.tooltip}
                metric={getMetric(s.metricKey)}
                active={s.metricKey === 'confidence' && pendingResearch > 0}
                variant={
                  s.metricKey === 'confidence' && pendingResearch > 0
                    ? 'red'
                    : 'default'
                }
              >
                <MachineComponent
                  confidence={s.stage === 4 ? 85 : undefined}
                  isResearching={s.stage === 4 ? pendingResearch > 0 : undefined}
                />
              </MachineOverlay>
            )
          })}

          {/* Research indicator */}
          {pendingResearch > 0 && (
            <ResearchIndicator pendingCount={pendingResearch} />
          )}
        </div>
      </div>

      {/* ── Mobile: Vertical card list ── */}
      <div className="lg:hidden space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stages.map((s) => (
            <MobileStageCard
              key={s.stage}
              stage={s.stage}
              label={s.label}
              description={s.description}
              href={s.href}
              metric={getMetric(s.metricKey)}
            />
          ))}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="mt-4 flex items-center gap-4 text-[10px] font-mono text-zinc-600">
        <span>
          Vectors: {vectorCount != null ? vectorCount.toLocaleString() : '—'}
        </span>
        <span>·</span>
        <span>Files: {fileCount != null ? fileCount.toLocaleString() : '—'}</span>
        <span>·</span>
        <span>
          Conversations: {convCount != null ? convCount.toLocaleString() : '—'}
        </span>
        <span>·</span>
        <span>
          Research:{' '}
          {pendingResearch > 0 ? (
            <span className="text-amber-400">{pendingResearch} pending</span>
          ) : (
            'idle'
          )}
        </span>
        <span className="ml-auto">Auto-refresh: 15s</span>
      </div>
    </div>
  )
}
