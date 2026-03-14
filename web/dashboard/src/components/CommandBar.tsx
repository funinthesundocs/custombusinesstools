'use client'

import { useState, useRef, useEffect } from 'react'

const COMMANDS = [
  { cmd: '/research-target', desc: 'Run audience intelligence gathering', phase: 1 },
  { cmd: '/process-documents', desc: 'Run all document processing pipelines', phase: 3 },
  { cmd: '/sync-knowledge', desc: 'Embed new and changed knowledge files', phase: 3 },
  { cmd: '/engineer-context', desc: 'Create production source documents and prompts', phase: 5 },
  { cmd: '/route-production', desc: 'Generate deliverables via optimal engines', phase: 6 },
  { cmd: '/build-web', desc: 'Build/update presentation site', phase: 8 },
  { cmd: '/verify-claims', desc: 'Cross-model verification pass', phase: 7 },
]

export function CommandBar() {
  const [input, setInput] = useState('')
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = input.startsWith('/')
    ? COMMANDS.filter(c => c.cmd.includes(input.toLowerCase()))
    : []

  useEffect(() => {
    setShowAutocomplete(input.startsWith('/') && filtered.length > 0)
  }, [input, filtered.length])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900">
      {showAutocomplete && (
        <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-2">
          {filtered.map(cmd => (
            <button
              key={cmd.cmd}
              onClick={() => { setInput(cmd.cmd); setShowAutocomplete(false) }}
              className="flex w-full items-center gap-3 rounded px-3 py-1.5 text-left hover:bg-zinc-800 transition-colors"
            >
              <span className="font-mono text-sm text-[var(--color-primary)]">{cmd.cmd}</span>
              <span className="text-xs text-zinc-500">{cmd.desc}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-zinc-500 text-sm font-mono">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type / for commands..."
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none font-mono"
          onKeyDown={e => {
            if (e.key === 'Enter' && input) {
              setInput('')
              setShowAutocomplete(false)
            }
          }}
        />
      </div>
    </div>
  )
}
