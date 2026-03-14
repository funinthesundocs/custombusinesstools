'use client'

import { useState, useEffect, useCallback } from 'react'
import { COLOR_OPTIONS, getStoredColor, setStoredColor } from '@/lib/colors'
import { Check, Database, Layers, Cpu, Cloud, Mic, BarChart3, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type TabName = 'Appearance' | 'Connections' | 'RAG Config'
const TABS: TabName[] = ['Appearance', 'Connections', 'RAG Config']

interface HealthData {
  supabase: { status: string; detail: string }
  pinecone: { status: string; vectorCount: number | null; detail?: string }
  anthropic: { status: string }
  gemini: { status: string }
  elevenlabs: { status: string }
  marketData: { status: string; lastFetched: string | null }
}

interface SiteConfig {
  company: { name: string; short_name: string; domain: string }
  agent: { name: string }
  rag: {
    embeddingModel: string
    embeddingDimensions: number
    pinecone: { indexName: string }
  }
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'connected' || status === 'configured' || status === 'ok' ? 'bg-emerald-400' :
    status === 'not_configured' || status === 'no_data' ? 'bg-zinc-500' :
    status === 'checking' ? 'bg-amber-400 animate-pulse' :
    'bg-red-400'
  return <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${color}`} />
}

function statusLabel(status: string): string {
  if (status === 'connected') return 'Connected'
  if (status === 'configured') return 'API Key Set'
  if (status === 'not_configured') return 'Not Configured'
  if (status === 'ok') return 'OK'
  if (status === 'no_data') return 'No Data'
  if (status === 'checking') return 'Checking...'
  if (status === 'error') return 'Error'
  return status
}

function statusTextColor(status: string) {
  if (status === 'connected' || status === 'configured' || status === 'ok') return 'text-emerald-400'
  if (status === 'not_configured' || status === 'no_data') return 'text-zinc-500'
  if (status === 'checking') return 'text-amber-400'
  return 'text-red-400'
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabName>('Appearance')
  const [currentColor, setCurrentColor] = useState('#22D3EE')
  const [health, setHealth] = useState<HealthData | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // RAG fields
  const [embeddingModel, setEmbeddingModel] = useState('')
  const [embeddingDimensions, setEmbeddingDimensions] = useState(3072)
  const [pineconeIndexName, setPineconeIndexName] = useState('')

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config')
      if (res.ok) {
        const data = await res.json() as SiteConfig
        setConfig(data)
        setEmbeddingModel(data.rag?.embeddingModel ?? '')
        setEmbeddingDimensions(data.rag?.embeddingDimensions ?? 3072)
        setPineconeIndexName(data.rag?.pinecone?.indexName ?? '')
      }
    } catch { /* ignore */ }
  }, [])

  const loadHealth = useCallback(async () => {
    setHealthLoading(true)
    try {
      const res = await fetch('/api/admin/health')
      if (res.ok) setHealth(await res.json() as HealthData)
    } catch { /* ignore */ }
    setHealthLoading(false)
  }, [])

  useEffect(() => {
    setCurrentColor(getStoredColor())
    loadConfig()
  }, [loadConfig])

  useEffect(() => {
    if (activeTab === 'Connections') loadHealth()
  }, [activeTab, loadHealth])

  const handleColorChange = (color: string) => {
    setCurrentColor(color)
    setStoredColor(color)
  }

  const saveRAGConfig = async () => {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rag: {
          embeddingModel,
          embeddingDimensions,
          pinecone: { indexName: pineconeIndexName },
        },
      }),
    })
    if (res.ok) {
      showToast('RAG Config saved')
      await loadConfig()
    } else {
      showToast('Error saving', false)
    }
  }

  const services = [
    {
      name: 'Supabase',
      icon: Database,
      envVar: 'SUPABASE_SERVICE_ROLE_KEY',
      status: healthLoading ? 'checking' : health?.supabase.status ?? 'unknown',
      detail: health?.supabase.detail ?? '',
    },
    {
      name: 'Pinecone',
      icon: Layers,
      envVar: 'PINECONE_API_KEY + PINECONE_INDEX_HOST',
      status: healthLoading ? 'checking' : health?.pinecone.status ?? 'unknown',
      detail: health?.pinecone.vectorCount != null ? `${health.pinecone.vectorCount.toLocaleString()} vectors` : '',
    },
    {
      name: 'Anthropic',
      icon: Cpu,
      envVar: 'ANTHROPIC_API_KEY',
      status: healthLoading ? 'checking' : health?.anthropic.status ?? 'unknown',
      detail: '',
    },
    {
      name: 'Gemini',
      icon: Cloud,
      envVar: 'GEMINI_API_KEY',
      status: healthLoading ? 'checking' : health?.gemini.status ?? 'unknown',
      detail: '',
    },
    {
      name: 'ElevenLabs',
      icon: Mic,
      envVar: 'ELEVENLABS_API_KEY',
      status: healthLoading ? 'checking' : health?.elevenlabs.status ?? 'unknown',
      detail: '',
    },
    {
      name: 'Market Data',
      icon: BarChart3,
      envVar: 'N/A (Supabase table)',
      status: healthLoading ? 'checking' : health?.marketData.status ?? 'unknown',
      detail: health?.marketData.lastFetched ? `Last: ${new Date(health.marketData.lastFetched).toLocaleDateString()}` : '',
    },
  ]

  return (
    <div className="page-enter space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${toast.ok ? 'bg-emerald-900 text-emerald-200 border border-emerald-700' : 'bg-red-900 text-red-200 border border-red-700'}`}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* APPEARANCE TAB */}
      {activeTab === 'Appearance' && (
        <div className="space-y-6">
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
            <div className="flex gap-2 mt-4">
              <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: currentColor }} />
              <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: currentColor, opacity: 0.5 }} />
              <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: currentColor, opacity: 0.2 }} />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-200">Company Details</h3>
              <Link href="/agents" className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1">
                Edit in Agent Config <ExternalLink size={10} />
              </Link>
            </div>
            {config && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Company Name</p>
                  <p className="text-sm text-zinc-200">{config.company.name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Short Name</p>
                  <p className="text-sm text-zinc-200">{config.company.short_name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Agent Name</p>
                  <p className="text-sm text-zinc-200">{config.agent.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONNECTIONS TAB */}
      {activeTab === 'Connections' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-200">Service Status</h3>
              <button
                onClick={loadHealth}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-3">
              {services.map(svc => {
                const Icon = svc.icon
                return (
                  <div key={svc.name} className="flex items-center gap-4 p-3 rounded-lg border border-zinc-800 bg-zinc-800/30">
                    <Icon size={18} className={statusTextColor(svc.status)} />
                    <StatusDot status={svc.status} />
                    <div className="flex-1">
                      <p className="text-sm text-zinc-200">{svc.name}</p>
                      <p className="text-[10px] text-zinc-600 font-mono">{svc.envVar}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${statusTextColor(svc.status)}`}>{statusLabel(svc.status)}</p>
                      {svc.detail && <p className="text-[10px] text-zinc-500">{svc.detail}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-zinc-600 mt-4">API keys are set in your .env file. Restart the dev server after changes.</p>
          </div>
        </div>
      )}

      {/* RAG CONFIG TAB */}
      {activeTab === 'RAG Config' && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 mb-1.5">Embedding Model</label>
              <input
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                value={embeddingModel}
                onChange={e => setEmbeddingModel(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Embedding Dimensions</label>
              <input
                type="number"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                value={embeddingDimensions}
                onChange={e => setEmbeddingDimensions(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Pinecone Index Name</label>
              <input
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                value={pineconeIndexName}
                onChange={e => setPineconeIndexName(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={saveRAGConfig}
            className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-primary)] text-black hover:opacity-90 transition-opacity"
          >
            Save RAG Config
          </button>
        </div>
      )}
    </div>
  )
}
