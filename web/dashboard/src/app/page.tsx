'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { MachineOverlay } from '@/components/pipeline/MachineOverlay'
import { MobileStageCard } from '@/components/pipeline/MobileStageCard'
import { ResearchIndicator } from '@/components/pipeline/ResearchIndicator'
import { AnimatedMachine } from '@/components/pipeline/AnimatedMachine'

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

/* ── Stage definitions with video animations ── */
const stages = [
  {
    stage: 1,
    label: 'Knowledge Drop',
    description: 'Ingesting raw documents and data into the system',
    href: '/knowledge',
    tooltip: 'Knowledge Base — manage files and folders',
    position: { left: '1.8%', top: '2.0%', width: '18.2%', height: '29.3%' },
    metricKey: 'files' as const,
    video: '/animations/knowledge-drop-animated.mp4',
  },
  {
    stage: 2,
    label: 'The Factory',
    description: 'Chunking documents and embedding vectors for search',
    href: '/knowledge',
    tooltip: 'Embedding Pipeline — sync and re-embed',
    position: { left: '25.4%', top: '1.3%', width: '25.4%', height: '31.2%' },
    metricKey: 'vectors' as const,
    video: '/animations/factory-animated.mp4',
  },
  {
    stage: 3,
    label: 'The Question',
    description: 'Receiving user queries for information retrieval',
    href: '/agents?tab=test',
    tooltip: 'Test Agent — ask questions and see retrieval',
    position: { left: '60.0%', top: '0.7%', width: '23.6%', height: '31.9%' },
    metricKey: 'score' as const,
    video: '/animations/question-animated.mp4',
  },
  {
    stage: 4,
    label: 'Confidence Gate',
    description: 'Filtering responses based on relevance and quality',
    href: '/workshop',
    tooltip: 'Workshop — RAG tuning and thresholds',
    position: { left: '47.2%', top: '31.2%', width: '29.1%', height: '30.6%' },
    metricKey: 'confidence' as const,
    video: '/animations/confidence-gate-animated.mp4',
  },
  {
    stage: 5,
    label: 'Live Data Feeds',
    description: 'Incorporating real-time external data for context',
    href: '/settings',
    tooltip: 'Settings — configure data feeds',
    position: { left: '7.3%', top: '35.8%', width: '30.9%', height: '24.7%' },
    metricKey: 'feeds' as const,
    video: '/animations/live-data-feeds-animated.mp4',
  },
  {
    stage: 6,
    label: 'Assembly Line',
    description: 'Generating final outputs by combining retrieved information',
    href: '/agents',
    tooltip: 'Agent Configure — system prompt and identity',
    position: { left: '3.6%', top: '65.1%', width: '38.2%', height: '28.0%' },
    metricKey: 'model' as const,
    video: '/animations/assembly-line-animated.mp4',
  },
  {
    stage: 7,
    label: 'The Delivery',
    description: 'Presenting the synthesized response to the user',
    href: '/agents?tab=test',
    tooltip: 'Agent Test — conversation history and responses',
    position: { left: '45.4%', top: '65.1%', width: '43.6%', height: '28.0%' },
    metricKey: 'conversations' as const,
    video: '/animations/delivery-animated.mp4',
  },
]

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

          {/* 7 Animated Machine Stages — real Kling-animated baseplate art */}
          {stages.map((s) => (
            <MachineOverlay
              key={s.stage}
              stage={s.stage}
              label={s.label}
              position={s.position}
              href={s.href}
              tooltip={s.tooltip}
              active={s.metricKey === 'confidence' && pendingResearch > 0}
              variant={
                s.metricKey === 'confidence' && pendingResearch > 0
                  ? 'red'
                  : 'default'
              }
            >
              {s.video ? (
                <AnimatedMachine src={s.video} />
              ) : (
                <div />
              )}
            </MachineOverlay>
          ))}

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
