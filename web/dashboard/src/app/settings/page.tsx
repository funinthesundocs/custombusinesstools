'use client'

import { useState, useEffect } from 'react'
import { COLOR_OPTIONS, getStoredColor, setStoredColor } from '@/lib/colors'
import { Check, Database, Github } from 'lucide-react'

export default function SettingsPage() {
  const [currentColor, setCurrentColor] = useState('#22D3EE')
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'error' | 'checking'>('checking')

  useEffect(() => {
    setCurrentColor(getStoredColor())
    // Check Supabase connection
    fetch('/api/seed', { method: 'POST' })
      .then(res => { setSupabaseStatus(res.ok ? 'connected' : 'error') })
      .catch(() => setSupabaseStatus('error'))
  }, [])

  const handleColorChange = (color: string) => {
    setCurrentColor(color)
    setStoredColor(color)
  }

  return (
    <div className="page-enter space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Primary Color Selector */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Primary Color</h3>
        <div className="flex items-center gap-3 mb-4">
          {COLOR_OPTIONS.map(c => (
            <button
              key={c.name}
              onClick={() => handleColorChange(c.value)}
              className="relative h-8 w-8 rounded-full transition-transform hover:scale-110"
              style={{ backgroundColor: c.value }}
              title={c.name}
            >
              {currentColor === c.value && (
                <Check size={14} className="absolute inset-0 m-auto text-black" />
              )}
            </button>
          ))}
        </div>
        {/* Preview strip */}
        <div className="flex gap-2 mt-4">
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: currentColor }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: currentColor, opacity: 0.5 }} />
          <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: currentColor, opacity: 0.2 }} />
        </div>
      </div>

      {/* Deal Configuration */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Deal Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Deal Name</p>
            <p className="text-sm text-zinc-200 font-medium">GMC × Aboitiz Construction</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Source Entity</p>
            <p className="text-sm text-zinc-200">Genluiching Mining Corporation</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Target Entity</p>
            <p className="text-sm text-zinc-200">Aboitiz Construction</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Target Person</p>
            <p className="text-sm text-zinc-200">Sabina Aboitiz</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Deal Type</p>
            <p className="text-sm text-zinc-200">Strategic Partnership</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Scale</p>
            <p className="text-sm text-zinc-200">Multi-Billion Dollar</p>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Connections</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded border border-zinc-800">
            <Database size={18} className={supabaseStatus === 'connected' ? 'text-emerald-400' : supabaseStatus === 'error' ? 'text-red-400' : 'text-zinc-500'} />
            <div>
              <p className="text-sm text-zinc-200">Supabase</p>
              <p className={`text-xs ${supabaseStatus === 'connected' ? 'text-emerald-400' : supabaseStatus === 'error' ? 'text-red-400' : 'text-zinc-500'}`}>
                {supabaseStatus === 'connected' ? 'Connected' : supabaseStatus === 'error' ? 'Error' : 'Checking...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded border border-zinc-800">
            <Github size={18} className="text-emerald-400" />
            <div>
              <p className="text-sm text-zinc-200">GitHub</p>
              <p className="text-xs text-emerald-400">Connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
