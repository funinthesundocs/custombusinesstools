'use client'

import { useState } from 'react'
import { Monitor, Tablet, Smartphone } from 'lucide-react'

export default function PresentationPage() {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'phone'>('desktop')

  const viewportWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px] mx-auto',
    phone: 'w-[375px] mx-auto',
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Presentation Site</h1>
        <div className="flex items-center gap-1 rounded border border-zinc-800 p-1">
          <button onClick={() => setViewport('desktop')} className={`p-1.5 rounded transition-colors ${viewport === 'desktop' ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Monitor size={16} />
          </button>
          <button onClick={() => setViewport('tablet')} className={`p-1.5 rounded transition-colors ${viewport === 'tablet' ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Tablet size={16} />
          </button>
          <button onClick={() => setViewport('phone')} className={`p-1.5 rounded transition-colors ${viewport === 'phone' ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Smartphone size={16} />
          </button>
        </div>
      </div>

      <div className={`rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden ${viewportWidths[viewport]} transition-all`}>
        <div className="h-8 bg-zinc-800 flex items-center px-3 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
          <span className="ml-4 text-xs text-zinc-500 font-mono">topqualityminerals.com</span>
        </div>
        <div className="h-[500px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-500 text-sm">Presentation site not yet built</p>
            <p className="text-zinc-600 text-xs mt-1">Run /build-web to generate</p>
          </div>
        </div>
      </div>

      {/* Build Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">Build & Deploy</h3>
          <p className="text-xs text-zinc-500 mb-3">Build the presentation site from finalized deliverables</p>
          <button className="px-4 py-2 text-sm rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700">
            Build Site
          </button>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">Content Mapping</h3>
          <p className="text-xs text-zinc-500">Maps deliverable outputs to presentation site sections</p>
        </div>
      </div>
    </div>
  )
}
