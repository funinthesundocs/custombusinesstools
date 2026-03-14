'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  FolderOpen, Plus, Upload, Trash2, Eye, MoreHorizontal, X, File
} from 'lucide-react'

interface FolderInfo {
  name: string
  fileCount: number
  path: string
}

interface FileInfo {
  name: string
  size: number
  ext: string
  path: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function KnowledgeBasePage() {
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
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadFolders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/folders')
      if (res.ok) setFolders(await res.json() as FolderInfo[])
    } catch { /* ignore */ }
  }, [])

  const loadFiles = useCallback(async (folder: string) => {
    try {
      const res = await fetch(`/api/admin/files?folder=${encodeURIComponent(folder)}`)
      if (res.ok) setFiles(await res.json() as FileInfo[])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadFolders() }, [loadFolders])

  useEffect(() => {
    if (selectedFolder) loadFiles(selectedFolder)
    else setFiles([])
  }, [selectedFolder, loadFiles])

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

  const totalFiles = folders.reduce((sum, f) => sum + f.fileCount, 0)

  return (
    <div className="page-enter space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all ${toast.ok ? 'bg-emerald-900 text-emerald-200 border border-emerald-700' : 'bg-red-900 text-red-200 border border-red-700'}`}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-2xl font-semibold">Knowledge Base</h1>

      {/* Main two-panel layout */}
      <div className="flex gap-4 min-h-[500px]">
        {/* Left Panel */}
        <div className="w-64 shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col">
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
                    <button
                      onClick={() => startRename(folder.name)}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => deleteFolder(folder.name)}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-zinc-700"
                    >
                      Delete
                    </button>
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
        </div>

        {/* Right Panel */}
        <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col">
          {!selectedFolder ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FolderOpen size={40} className="text-zinc-700 mx-auto mb-3" />
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
                          {name.slice(0, 20)}: {status}
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
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".md,.txt,.pdf,.jpg,.jpeg,.png,.webp,.gif"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <File size={36} className="text-zinc-700 mb-3" />
                    <p className="text-sm text-zinc-500">No files in this folder.</p>
                    <p className="text-xs text-zinc-600 mt-1">Upload files to get started.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Name</th>
                        <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Type</th>
                        <th className="text-left py-2 px-3 text-xs text-zinc-500 font-medium">Size</th>
                        <th className="text-right py-2 px-3 text-xs text-zinc-500 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map(file => (
                        <tr key={file.name} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="py-2 px-3 text-zinc-200 font-mono text-xs">{file.name}</td>
                          <td className="py-2 px-3">
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-mono">{file.ext || '—'}</span>
                          </td>
                          <td className="py-2 px-3 text-zinc-500 text-xs">{formatSize(file.size)}</td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {['md', 'txt'].includes(file.ext) && (
                                <button
                                  onClick={() => viewFileContent(file.path, file.name)}
                                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                  title="View"
                                >
                                  <Eye size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteFile(file.path, file.name)}
                                className="text-zinc-500 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
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

      {/* Knowledge Health Bar */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400">
              <span className="text-zinc-200 font-medium">{folders.length}</span> folders
            </span>
            <span className="text-xs text-zinc-400">
              <span className="text-zinc-200 font-medium">{totalFiles}</span> total files
            </span>
          </div>
          <p className="text-xs text-zinc-500">Run Embed Control to embed files into the vector store.</p>
        </div>
      </div>

      {/* View File Modal */}
      {viewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-[700px] max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <p className="text-sm font-medium text-zinc-200 font-mono">{viewFile.name}</p>
              <button onClick={() => setViewFile(null)} className="text-zinc-500 hover:text-zinc-300">
                <X size={16} />
              </button>
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
