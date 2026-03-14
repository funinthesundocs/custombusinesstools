'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  FolderOpen, Plus, Upload, Trash2, Eye, MoreHorizontal, X, File,
  Cpu, ChevronDown, CheckCircle,
} from 'lucide-react'

interface FolderInfo { name: string; fileCount: number; path: string }
interface FileInfo { name: string; size: number; ext: string; path: string }
interface AgentTask { id: string; task_type: string; status: string; payload: Record<string, unknown>; result: Record<string, unknown> | null; created_at: string }
interface HealthData { pinecone: { status: string; vectorCount: number | null; detail?: string } }
interface OutputLine { ts: string; text: string }

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

export default function KnowledgePage() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // KB state
  const [folders, setFolders] = useState<FolderInfo[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, string>>({})
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [menuFolder, setMenuFolder] = useState<string | null>(null)
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [viewFile, setViewFile] = useState<{ name: string; content: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Embed state
  const [embedFolder, setEmbedFolder] = useState<string>('')
  const [running, setRunning] = useState(false)
  const [outputLines, setOutputLines] = useState<OutputLine[]>([])
  const [health, setHealth] = useState<HealthData | null>(null)
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [dismissedTasks, setDismissedTasks] = useState<Set<string>>(new Set())
  const [clearConfirm, setClearConfirm] = useState(false)
  const [clearInput, setClearInput] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const loadFolders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/folders')
      if (res.ok) {
        const data = await res.json() as FolderInfo[]
        setFolders(data)
        if (data.length && !embedFolder) setEmbedFolder(data[0].name)
      }
    } catch { /* ignore */ }
  }, [embedFolder])

  const loadFiles = useCallback(async (folder: string) => {
    try {
      const res = await fetch(`/api/admin/files?folder=${encodeURIComponent(folder)}`)
      if (res.ok) setFiles(await res.json() as FileInfo[])
    } catch { /* ignore */ }
  }, [])

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
    if (selectedFolder) loadFiles(selectedFolder)
    else setFiles([])
  }, [selectedFolder, loadFiles])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [outputLines])

  // KB actions
  const createFolder = async () => {
    if (!newFolderName.trim()) return
    const res = await fetch('/api/admin/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFolderName.trim() }),
    })
    if (res.ok) {
      showToast('Folder created')
      setNewFolderName('')
      setShowNewFolder(false)
      await loadFolders()
    } else {
      const err = await res.json() as { error: string }
      showToast(err.error || 'Error creating folder', false)
    }
  }

  const deleteFolder = async (name: string) => {
    if (!confirm(`Delete folder "${name}" and all its files?`)) return
    const res = await fetch(`/api/admin/folders?name=${encodeURIComponent(name)}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('Folder deleted')
      if (selectedFolder === name) { setSelectedFolder(null); setFiles([]) }
      await loadFolders()
    } else {
      showToast('Error deleting folder', false)
    }
    setMenuFolder(null)
  }

  const startRename = (name: string) => {
    setRenamingFolder(name)
    setRenameValue(name)
    setMenuFolder(null)
  }

  const saveRename = async () => {
    if (!renamingFolder || !renameValue.trim()) return
    const res = await fetch('/api/admin/folders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName: renamingFolder, newName: renameValue.trim() }),
    })
    if (res.ok) {
      showToast('Folder renamed')
      if (selectedFolder === renamingFolder) setSelectedFolder(renameValue.trim())
      setRenamingFolder(null)
      await loadFolders()
    } else {
      showToast('Error renaming folder', false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files ?? [])
    if (!fileList.length || !selectedFolder) return
    setUploading(true)
    const progress: Record<string, string> = {}
    for (const file of fileList) {
      progress[file.name] = 'uploading'
      setUploadProgress({ ...progress })
      const formData = new FormData()
      formData.append('folder', selectedFolder)
      formData.append('file', file)
      const res = await fetch('/api/admin/files', { method: 'POST', body: formData })
      progress[file.name] = res.ok ? 'done' : 'error'
      setUploadProgress({ ...progress })
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    await loadFiles(selectedFolder)
    await loadFolders()
    showToast(`${fileList.length} file(s) uploaded`)
  }

  const deleteFile = async (filePath: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"?`)) return
    const res = await fetch(`/api/admin/files?path=${encodeURIComponent(filePath)}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('File deleted')
      if (selectedFolder) await loadFiles(selectedFolder)
      await loadFolders()
    } else {
      showToast('Error deleting file', false)
    }
  }

  const viewFileContent = async (filePath: string, fileName: string) => {
    try {
      const res = await fetch(`/api/admin/files?content=true&path=${encodeURIComponent(filePath)}`)
      if (res.ok) {
        const data = await res.json() as { content: string }
        setViewFile({ name: fileName, content: data.content })
      } else {
        setViewFile({ name: fileName, content: 'Unable to load file content.' })
      }
    } catch {
      setViewFile({ name: fileName, content: 'Unable to load file content.' })
    }
  }

  // Embed actions
  const runEmbed = async (mode: 'new' | 'all' | 'folder') => {
    if (running) { abortRef.current?.abort(); return }
    setRunning(true)
    setOutputLines([])
    const controller = new AbortController()
    abortRef.current = controller
    const body: Record<string, unknown> = { mode }
    if (mode === 'folder' && embedFolder) body.folder = embedFolder
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
    formData.append('file', new Blob([fileContent], { type: 'text/plain' }), filename)
    const res = await fetch('/api/admin/files', { method: 'POST', body: formData })
    if (res.ok) showToast('File saved — run Sync to index it')
    else showToast('Error saving file', false)
  }

  const visibleTasks = tasks.filter(t => !dismissedTasks.has(t.id))
  const totalFiles = folders.reduce((sum, f) => sum + f.fileCount, 0)

  return (
    <div className="page-enter space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${toast.ok ? 'bg-emerald-900 text-emerald-200 border border-emerald-700' : 'bg-red-900 text-red-200 border border-red-700'}`}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-2xl font-semibold">Knowledge</h1>

      {/* Two-column: KB left, Embed right */}
      <div className="grid grid-cols-[1fr_380px] gap-5" style={{ minHeight: '520px' }}>

        {/* LEFT: Folder list + file panel */}
        <div className="flex gap-4 min-h-[520px]">
          {/* Folder list */}
          <div className="w-52 shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-zinc-800">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Folders</p>
              <button
                onClick={() => setShowNewFolder(true)}
                className="text-[var(--color-primary)] hover:opacity-80 transition-opacity"
                title="New folder"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {folders.map(folder => (
                <div key={folder.name} className="relative">
                  {renamingFolder === folder.name ? (
                    <div className="flex gap-1 p-1">
                      <input
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-[var(--color-primary)]"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setRenamingFolder(null) }}
                        autoFocus
                      />
                      <button onClick={saveRename} className="text-emerald-400 text-xs px-1">OK</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedFolder(folder.name)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-all group ${
                        selectedFolder === folder.name
                          ? 'bg-[var(--color-primary-muted)] border border-[var(--color-primary)] text-white'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-transparent'
                      }`}
                    >
                      <FolderOpen size={14} className={selectedFolder === folder.name ? 'text-[var(--color-primary)]' : ''} />
                      <span className="flex-1 text-left truncate text-xs">{folder.name}</span>
                      <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">{folder.fileCount}</span>
                      <button
                        onClick={e => { e.stopPropagation(); setMenuFolder(menuFolder === folder.name ? null : folder.name) }}
                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-300"
                      >
                        <MoreHorizontal size={12} />
                      </button>
                    </button>
                  )}
                  {menuFolder === folder.name && (
                    <div className="absolute right-0 top-8 z-10 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[120px]">
                      <button onClick={() => startRename(folder.name)} className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700">Rename</button>
                      <button onClick={() => deleteFolder(folder.name)} className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-zinc-700">Delete</button>
                    </div>
                  )}
                </div>
              ))}
              {showNewFolder && (
                <div className="flex gap-1 p-1">
                  <input
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-[var(--color-primary)]"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName('') } }}
                    placeholder="Folder name"
                    autoFocus
                  />
                  <button onClick={createFolder} className="text-emerald-400 text-xs px-1">OK</button>
                </div>
              )}
              {folders.length === 0 && !showNewFolder && (
                <p className="text-xs text-zinc-600 italic p-2">No folders yet. Click + to create one.</p>
              )}
            </div>
            <div className="p-3 border-t border-zinc-800">
              <p className="text-[10px] text-zinc-500">{folders.length} folders · {totalFiles} files</p>
            </div>
          </div>

          {/* File panel */}
          <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col">
            {!selectedFolder ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FolderOpen size={36} className="text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">Select a folder to view files</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                  <h2 className="text-sm font-semibold text-zinc-200">{selectedFolder}</h2>
                  <div className="flex items-center gap-2">
                    {Object.keys(uploadProgress).length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        {Object.entries(uploadProgress).map(([name, status]) => (
                          <span key={name} className={`font-mono ${status === 'done' ? 'text-emerald-400' : status === 'error' ? 'text-red-400' : 'text-amber-400'}`}>
                            {name.slice(0, 15)}: {status}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--color-primary)] text-black hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Upload size={12} />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <input ref={fileInputRef} type="file" multiple accept=".md,.txt,.pdf,.jpg,.jpeg,.png,.webp,.gif" onChange={handleUpload} className="hidden" />
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <File size={32} className="text-zinc-700 mb-2" />
                      <p className="text-sm text-zinc-500">No files in this folder.</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800">
                          <th className="text-left py-2 px-2 text-xs text-zinc-500 font-medium">Name</th>
                          <th className="text-left py-2 px-2 text-xs text-zinc-500 font-medium">Type</th>
                          <th className="text-left py-2 px-2 text-xs text-zinc-500 font-medium">Size</th>
                          <th className="text-right py-2 px-2 text-xs text-zinc-500 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.map(file => (
                          <tr key={file.name} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                            <td className="py-2 px-2 text-zinc-200 font-mono text-xs truncate max-w-[160px]">{file.name}</td>
                            <td className="py-2 px-2"><span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-mono">{file.ext || '—'}</span></td>
                            <td className="py-2 px-2 text-zinc-500 text-xs">{formatSize(file.size)}</td>
                            <td className="py-2 px-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {['md', 'txt'].includes(file.ext) && (
                                  <button onClick={() => viewFileContent(file.path, file.name)} className="text-zinc-500 hover:text-zinc-300 transition-colors" title="View"><Eye size={14} /></button>
                                )}
                                <button onClick={() => deleteFile(file.path, file.name)} className="text-zinc-500 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Embed panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Cpu size={15} className="text-[var(--color-primary)]" />
              Embed
            </h3>

            <button
              onClick={() => runEmbed('new')}
              disabled={running}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-semibold bg-[var(--color-primary)] text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {running ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  Embedding...
                </>
              ) : 'Sync Knowledge Base'}
            </button>
            <p className="text-[10px] text-zinc-600 -mt-2">Embeds new and changed files only.</p>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-left flex items-center gap-1"
            >
              <ChevronDown size={12} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              Advanced
            </button>

            {showAdvanced && (
              <div className="space-y-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <button
                  onClick={() => runEmbed('all')}
                  disabled={running}
                  className="w-full px-3 py-2 rounded-md text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                  Full Re-embed (All Files)
                </button>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={embedFolder}
                      onChange={e => setEmbedFolder(e.target.value)}
                      disabled={running}
                      className="w-full appearance-none bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-md px-3 py-2 pr-7 focus:outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="">Select folder...</option>
                      {folders.map(f => <option key={f.name} value={f.name}>{f.name} ({f.fileCount})</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => runEmbed('folder')}
                    disabled={running || !embedFolder}
                    className="px-3 py-2 rounded-md text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    Re-embed Folder
                  </button>
                </div>
              </div>
            )}

            {running && (
              <button
                onClick={() => abortRef.current?.abort()}
                className="w-full px-3 py-2 rounded-md text-xs font-medium bg-red-900/50 text-red-400 border border-red-800 hover:bg-red-900 transition-colors"
              >
                Stop
              </button>
            )}

            <div ref={terminalRef} className="h-[200px] overflow-y-auto bg-zinc-950 rounded-lg border border-zinc-800 p-3 font-mono text-xs">
              {outputLines.length === 0 ? (
                <p className="text-zinc-600">Output will appear here...</p>
              ) : (
                outputLines.map((line, i) => (
                  <div key={i} className="flex gap-2 leading-relaxed">
                    <span className="text-zinc-600 shrink-0">[{line.ts}]</span>
                    <span className={line.text.includes('[error]') || line.text.includes('Error') ? 'text-red-400' : line.text.includes('[done]') ? 'text-emerald-400' : line.text.includes('[stderr]') ? 'text-amber-400' : 'text-zinc-300'}>
                      {line.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pinecone status */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Pinecone</p>
                  <p className={`text-sm font-medium ${health?.pinecone.status === 'connected' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {health?.pinecone.status ?? 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Vectors</p>
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
        </div>
      </div>

      {/* Auto-Research Results — full width, shown only when there are results */}
      {visibleTasks.length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Auto-Research Results</h3>
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
        </div>
      )}

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
              <button onClick={() => { setClearConfirm(false); setClearInput('') }} className="px-4 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
              <button
                disabled={clearInput !== 'CONFIRM'}
                onClick={() => {
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

      {/* View File Modal */}
      {viewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-[700px] max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <p className="text-sm font-medium text-zinc-200 font-mono">{viewFile.name}</p>
              <button onClick={() => setViewFile(null)} className="text-zinc-500 hover:text-zinc-300"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">{viewFile.content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
