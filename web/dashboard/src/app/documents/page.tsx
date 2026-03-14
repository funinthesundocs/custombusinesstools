'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Cpu, ChevronDown, Trash2, CheckCircle, X } from 'lucide-react'

interface FolderInfo {
  name: string
  fileCount: number
  path: string
}

interface AgentTask {
  id: string
  task_type: string
  status: string
  payload: Record<string, unknown>
  result: Record<string, unknown> | null
  created_at: string
}

interface HealthData {
  pinecone: { status: string; vectorCount: number | null; detail?: string }
}

interface OutputLine {
  ts: string
  text: string
}

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

export default function EmbedControlPage() {
  const [folders, setFolders] = useState<FolderInfo[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [running, setRunning] = useState(false)
  const [outputLines, setOutputLines] = useState<OutputLine[]>([])
  const [health, setHealth] = useState<HealthData | null>(null)
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [dismissedTasks, setDismissedTasks] = useState<Set<string>>(new Set())
  const [clearConfirm, setClearConfirm] = useState(false)
  const [clearInput, setClearInput] = useState('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadFolders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/folders')
      if (res.ok) {
        const data = await res.json() as FolderInfo[]
        setFolders(data)
        if (data.length && !selectedFolder) setSelectedFolder(data[0].name)
      }
    } catch { /* ignore */ }
  }, [selectedFolder])

  const loadHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/health')
      if (res.ok) setHealth(await res.json() as HealthData)
    } catch { /* ignore */ }
  }, [])

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tasks')
      if (res.ok) {
        const data = await res.json() as AgentTask[]
        setTasks(data.filter(t => t.task_type === 'knowledge_gap' && t.status === 'complete'))
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    loadFolders()
    loadHealth()
    loadTasks()
  }, [loadFolders, loadHealth, loadTasks])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [outputLines])

  const runEmbed = async (mode: 'all' | 'new' | 'folder') => {
    if (running) {
      abortRef.current?.abort()
      return
    }
    setRunning(true)
    setOutputLines([])
    const controller = new AbortController()
    abortRef.current = controller

    const body: Record<string, unknown> = { mode }
    if (mode === 'folder' && selectedFolder) body.folder = selectedFolder

    try {
      const res = await fetch('/api/admin/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        setOutputLines(prev => [...prev, { ts: formatTime(), text: `Error: HTTP ${res.status}` }])
        setRunning(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.trim())
        setOutputLines(prev => [...prev, ...lines.map(l => ({ ts: formatTime(), text: l }))])
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setOutputLines(prev => [...prev, { ts: formatTime(), text: `Error: ${String(e)}` }])
      }
    }

    setRunning(false)
    await loadHealth()
  }

  const promoteTask = async (task: AgentTask) => {
    const content = (task.result?.text as string) || JSON.stringify(task.result)
    const question = (task.payload?.question as string) || task.id
    const filename = `auto-research-${task.id.slice(0, 8)}.md`
    const fileContent = `# Auto-Research Result\n\n**Question:** ${question}\n\n**Answer:**\n\n${content}\n`

    const formData = new FormData()
    formData.append('folder', 'auto-research')
    formData.append('file', new File([fileContent], filename, { type: 'text/plain' }))

    const res = await fetch('/api/admin/files', { method: 'POST', body: formData })
    if (res.ok) {
      showToast('File saved — run Embed to index it')
    } else {
      showToast('Error saving file', false)
    }
  }

  const visibleTasks = tasks.filter(t => !dismissedTasks.has(t.id))

  return (
    <div className="page-enter space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${toast.ok ? 'bg-emerald-900 text-emerald-200 border border-emerald-700' : 'bg-red-900 text-red-200 border border-red-700'}`}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-2xl font-semibold">Embed Control</h1>

      {/* Embed Actions */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <Cpu size={16} className="text-[var(--color-primary)]" />
          Embed Actions
        </h3>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => runEmbed('all')}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-primary)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {running ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                Embedding...
              </>
            ) : 'Scan & Embed All'}
          </button>

          <button
            onClick={() => runEmbed('new')}
            disabled={running}
            className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            Embed New Only
          </button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedFolder}
                onChange={e => setSelectedFolder(e.target.value)}
                className="appearance-none bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-md px-3 py-2 pr-8 focus:outline-none focus:border-[var(--color-primary)]"
                disabled={running}
              >
                <option value="">Select folder...</option>
                {folders.map(f => (
                  <option key={f.name} value={f.name}>{f.name} ({f.fileCount})</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
            <button
              onClick={() => runEmbed('folder')}
              disabled={running || !selectedFolder}
              className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              Re-embed Folder
            </button>
          </div>

          {running && (
            <button
              onClick={() => abortRef.current?.abort()}
              className="px-3 py-2 rounded-md text-sm font-medium bg-red-900/50 text-red-400 border border-red-800 hover:bg-red-900 transition-colors"
            >
              Stop
            </button>
          )}
        </div>

        {/* Terminal Output */}
        <div
          ref={terminalRef}
          className="mt-4 h-[300px] overflow-y-auto bg-zinc-950 rounded-lg border border-zinc-800 p-3 font-mono text-xs"
        >
          {outputLines.length === 0 ? (
            <p className="text-zinc-600">Embed output will appear here...</p>
          ) : (
            outputLines.map((line, i) => (
              <div key={i} className="flex gap-2 leading-relaxed">
                <span className="text-zinc-600 shrink-0">[{line.ts}]</span>
                <span className={`${line.text.includes('[error]') || line.text.includes('Error') ? 'text-red-400' : line.text.includes('[done]') ? 'text-emerald-400' : line.text.includes('[stderr]') ? 'text-amber-400' : 'text-zinc-300'}`}>
                  {line.text}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pinecone Status */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Pinecone Status</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-zinc-500">Status</p>
              <p className={`text-sm font-medium ${health?.pinecone.status === 'connected' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {health?.pinecone.status ?? 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Vector Count</p>
              <p className="text-sm font-medium text-zinc-200 font-mono">
                {health?.pinecone.vectorCount != null ? health.pinecone.vectorCount.toLocaleString() : '—'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setClearConfirm(true)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50 transition-colors"
          >
            Clear All Vectors
          </button>
        </div>
      </div>

      {/* Auto-Research Tracker */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Auto-Research Results</h3>
        {visibleTasks.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No auto-research tasks completed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Question</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Answer Preview</th>
                  <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Date</th>
                  <th className="text-right py-2 px-3 text-xs text-zinc-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map(task => {
                  const question = (task.payload?.question as string) || '—'
                  const answer = (task.result?.text as string) || JSON.stringify(task.result) || ''
                  return (
                    <tr key={task.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-2 px-3 text-zinc-200 text-xs max-w-xs truncate">{question}</td>
                      <td className="py-2 px-3 text-zinc-500 text-xs max-w-sm truncate">{answer.slice(0, 80)}{answer.length > 80 ? '...' : ''}</td>
                      <td className="py-2 px-3 text-zinc-600 text-xs font-mono">{new Date(task.created_at).toLocaleDateString()}</td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => promoteTask(task)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-emerald-900/40 text-emerald-400 border border-emerald-800 hover:bg-emerald-900/70 transition-colors"
                          >
                            <CheckCircle size={10} />
                            Promote
                          </button>
                          <button
                            onClick={() => setDismissedTasks(prev => { const next = new Set(prev); next.add(task.id); return next })}
                            className="text-zinc-600 hover:text-zinc-400 transition-colors"
                            title="Dismiss"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clear Vectors Confirm Dialog */}
      {clearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-[400px] shadow-2xl">
            <h3 className="text-base font-semibold text-zinc-100 mb-2">Clear All Vectors?</h3>
            <p className="text-sm text-zinc-400 mb-4">This will delete all vectors from Pinecone. Type <span className="font-mono text-red-400">CONFIRM</span> to proceed.</p>
            <input
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-red-600 mb-4"
              value={clearInput}
              onChange={e => setClearInput(e.target.value)}
              placeholder="Type CONFIRM"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setClearConfirm(false); setClearInput('') }}
                className="px-4 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                disabled={clearInput !== 'CONFIRM'}
                onClick={() => {
                  // Clear vectors action would go here
                  showToast('Vector clear not yet implemented — use Pinecone console.', false)
                  setClearConfirm(false)
                  setClearInput('')
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-red-700 text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear All Vectors
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
