'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRealtimeSubscription } from '@/lib/realtime'
import type { ActivityLog } from '@/lib/types'
import {
  Database, Cpu, Key, Cloud, Mic, BarChart3,
  Layers, MessageSquare, FolderOpen, ClipboardList,
  CheckCircle2, XCircle, Clock
} from 'lucide-react'
import Link from 'next/link'

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

function StatusDot({ status }: { status: string }) {
  if (status === 'connected' || status === 'configured' || status === 'ok') {
    return <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0" />
  }
  if (status === 'checking') {
    return <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />
  }
  if (status === 'not_configured' || status === 'no_data') {
    return <span className="h-2.5 w-2.5 rounded-full bg-zinc-500 shrink-0" />
  }
  return <span className="h-2.5 w-2.5 rounded-full bg-red-400 shrink-0" />
}

function statusColor(status: string) {
  if (status === 'connected' || status === 'configured' || status === 'ok') return 'text-emerald-400'
  if (status === 'not_configured' || status === 'no_data') return 'text-zinc-500'
  if (status === 'checking') return 'text-amber-400'
  return 'text-red-400'
}

function TaskStatusBadge({ status }: { status: string }) {
  const cls =
    status === 'complete' ? 'bg-emerald-900/60 text-emerald-400 border-emerald-800' :
    status === 'pending' ? 'bg-amber-900/60 text-amber-400 border-amber-800' :
    status === 'in_progress' ? 'bg-blue-900/60 text-blue-400 border-blue-800' :
    status === 'failed' ? 'bg-red-900/60 text-red-400 border-red-800' :
    'bg-zinc-800 text-zinc-400 border-zinc-700'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${cls}`}>
      {status}
    </span>
  )
}

function TaskTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
      {type}
    </span>
  )
}

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [healthLoading, setHealthLoading] = useState(true)
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [convCount, setConvCount] = useState<number | null>(null)
  const [fileCount, setFileCount] = useState<number | null>(null)
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/health')
      if (res.ok) setHealth(await res.json() as HealthData)
    } catch { /* ignore */ }
    setHealthLoading(false)
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

  const loadActivity = useCallback(async () => {
    const dealId = localStorage.getItem('kop-deal-id')
    if (!dealId) return
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setActivities(data as ActivityLog[])
  }, [])

  useEffect(() => {
    fetchHealth()
    fetchTasks()
    fetchConversations()
    fetchFolders()
    loadActivity()

    intervalRef.current = setInterval(fetchHealth, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchHealth, fetchTasks, fetchConversations, fetchFolders, loadActivity])

  useRealtimeSubscription('activity_log', loadActivity)

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
  const completeTasks = tasks.filter(t => t.status === 'complete').length

  const services = health ? [
    {
      name: 'Supabase',
      icon: Database,
      status: healthLoading ? 'checking' : health.supabase.status,
      detail: healthLoading ? 'Checking...' : health.supabase.detail,
    },
    {
      name: 'Pinecone',
      icon: Layers,
      status: healthLoading ? 'checking' : health.pinecone.status,
      detail: healthLoading ? 'Checking...' : health.pinecone.vectorCount !== null ? `${health.pinecone.vectorCount.toLocaleString()} vectors` : (health.pinecone.detail ?? 'Error'),
    },
    {
      name: 'Anthropic',
      icon: Cpu,
      status: healthLoading ? 'checking' : health.anthropic.status,
      detail: healthLoading ? 'Checking...' : health.anthropic.status,
    },
    {
      name: 'Gemini',
      icon: Cloud,
      status: healthLoading ? 'checking' : health.gemini.status,
      detail: healthLoading ? 'Checking...' : health.gemini.status,
    },
    {
      name: 'ElevenLabs',
      icon: Mic,
      status: healthLoading ? 'checking' : health.elevenlabs.status,
      detail: healthLoading ? 'Checking...' : health.elevenlabs.status,
    },
    {
      name: 'Market Data',
      icon: BarChart3,
      status: healthLoading ? 'checking' : health.marketData.status,
      detail: healthLoading ? 'Checking...' : health.marketData.lastFetched ? new Date(health.marketData.lastFetched).toLocaleDateString() : 'No data',
    },
  ] : Array(6).fill(null).map((_, i) => ({
    name: ['Supabase', 'Pinecone', 'Anthropic', 'Gemini', 'ElevenLabs', 'Market Data'][i],
    icon: [Database, Layers, Cpu, Cloud, Mic, BarChart3][i],
    status: 'checking',
    detail: 'Checking...',
  }))

  const metrics = [
    {
      label: 'Total Vectors',
      value: health?.pinecone.vectorCount != null ? health.pinecone.vectorCount.toLocaleString() : '—',
      icon: Layers,
      color: 'text-violet-400',
    },
    {
      label: 'Research Tasks',
      value: tasks.length > 0 ? `${pendingTasks} pending / ${completeTasks} done` : '—',
      icon: ClipboardList,
      color: 'text-amber-400',
    },
    {
      label: 'Conversations',
      value: convCount != null ? convCount.toLocaleString() : '—',
      icon: MessageSquare,
      color: 'text-blue-400',
    },
    {
      label: 'Knowledge Files',
      value: fileCount != null ? fileCount.toLocaleString() : '—',
      icon: FolderOpen,
      color: 'text-emerald-400',
    },
  ]

  const recentTasks = tasks.slice(0, 5)

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-semibold">System Health</h1>

      {/* Service Health Strip */}
      <div className="grid grid-cols-6 gap-3">
        {services.map((svc) => {
          const Icon = svc.icon
          return (
            <div key={svc.name} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={statusColor(svc.status)} />
                <StatusDot status={svc.status} />
              </div>
              <p className="text-xs font-medium text-zinc-200 mb-0.5">{svc.name}</p>
              <p className={`text-[10px] truncate ${statusColor(svc.status)}`}>{svc.detail}</p>
            </div>
          )
        })}
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map(m => {
          const Icon = m.icon
          return (
            <div key={m.label} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={m.color} />
                <span className="text-xs text-zinc-500">{m.label}</span>
              </div>
              <p className="text-xl font-semibold text-zinc-100 font-mono">{m.value}</p>
            </div>
          )
        })}
      </div>

      {/* Research Queue Preview */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-200">Research Queue</h3>
          <Link href="/documents" className="text-xs text-[var(--color-primary)] hover:underline">View all →</Link>
        </div>
        {recentTasks.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No tasks yet.</p>
        ) : (
          <div className="space-y-2">
            {recentTasks.map(task => {
              const question = (task.payload?.question as string) || (task.payload?.query as string) || JSON.stringify(task.payload).slice(0, 60)
              return (
                <div key={task.id} className="flex items-center gap-3 py-2 border-b border-zinc-800/50 last:border-0">
                  <TaskTypeBadge type={task.task_type} />
                  <TaskStatusBadge status={task.status} />
                  <p className="flex-1 text-xs text-zinc-400 truncate">{question}</p>
                  <span className="text-[10px] text-zinc-600 font-mono shrink-0">
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Recent Activity</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No activity yet.</p>
          ) : (
            activities.map(a => (
              <div key={a.id} className="flex items-start gap-3 rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
                <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                  a.severity === 'success' ? 'bg-emerald-400' :
                  a.severity === 'warning' ? 'bg-amber-400' :
                  a.severity === 'error' ? 'bg-red-400' : 'bg-zinc-500'
                }`} />
                <div className="min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{a.title}</p>
                  {a.detail && <p className="text-xs text-zinc-500 truncate">{a.detail}</p>}
                  <p className="text-[10px] text-zinc-600 font-mono mt-1">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
