'use client'

import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'

type TabName = 'Persona' | 'Behavior'

interface SiteConfig {
  company: {
    name: string
    short_name: string
    tagline: string
    domain: string
  }
  agent: {
    name: string
    role: string
    personality: string
    systemPromptPath: string
  }
  voice: {
    provider: string
    voiceId: string
    model: string
    enabled?: boolean
  }
  rag: {
    matchCount: number
    similarityThreshold: number
    researchThreshold: number
    chunkMaxChars: number
    embeddingModel: string
    embeddingDimensions: number
    pinecone: { indexName: string }
  }
  market_data: {
    enabled: boolean
    weather_location: { name: string; latitude: number; longitude: number }
  }
}

const TABS: TabName[] = ['Persona', 'Behavior']

export default function AgentConfigPage() {
  const [activeTab, setActiveTab] = useState<TabName>('Persona')
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [systemPromptContent, setSystemPromptContent] = useState('')
  const [systemPromptLoaded, setSystemPromptLoaded] = useState(false)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [promptModalContent, setPromptModalContent] = useState('')

  // Field states - Identity
  const [agentName, setAgentName] = useState('')
  const [agentRole, setAgentRole] = useState('')
  const [agentPersonality, setAgentPersonality] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyShortName, setCompanyShortName] = useState('')
  const [companyTagline, setCompanyTagline] = useState('')
  const [domain, setDomain] = useState('')

  // Voice
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [voiceId, setVoiceId] = useState('')
  const [voiceModel, setVoiceModel] = useState('')

  // Response
  const [matchCount, setMatchCount] = useState(15)
  const [similarityThreshold, setSimilarityThreshold] = useState(0.3)
  const [researchThreshold, setResearchThreshold] = useState(0.7)
  const [chunkMaxChars, setChunkMaxChars] = useState(3200)
  const [autoResearch, setAutoResearch] = useState(false)
  const [marketEnabled, setMarketEnabled] = useState(false)
  const [weatherName, setWeatherName] = useState('')
  const [weatherLat, setWeatherLat] = useState(0)
  const [weatherLng, setWeatherLng] = useState(0)

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
        setAgentName(data.agent?.name ?? '')
        setAgentRole(data.agent?.role ?? '')
        setAgentPersonality(data.agent?.personality ?? '')
        setCompanyName(data.company?.name ?? '')
        setCompanyShortName(data.company?.short_name ?? '')
        setCompanyTagline(data.company?.tagline ?? '')
        setDomain(data.company?.domain ?? '')
        setVoiceEnabled(data.voice?.enabled !== false)
        setVoiceId(data.voice?.voiceId ?? '')
        setVoiceModel(data.voice?.model ?? '')
        setMatchCount(data.rag?.matchCount ?? 15)
        setSimilarityThreshold(data.rag?.similarityThreshold ?? 0.3)
        setResearchThreshold(data.rag?.researchThreshold ?? 0.7)
        setChunkMaxChars(data.rag?.chunkMaxChars ?? 3200)
        setMarketEnabled(data.market_data?.enabled ?? false)
        setWeatherName(data.market_data?.weather_location?.name ?? '')
        setWeatherLat(data.market_data?.weather_location?.latitude ?? 0)
        setWeatherLng(data.market_data?.weather_location?.longitude ?? 0)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const loadSystemPrompt = useCallback(async () => {
    if (systemPromptLoaded) return
    try {
      const res = await fetch('/api/admin/config?section=systemPrompt')
      if (res.ok) {
        const data = await res.json() as { content: string }
        setSystemPromptContent(data.content)
        setPromptModalContent(data.content)
        setSystemPromptLoaded(true)
      }
    } catch { /* ignore */ }
  }, [systemPromptLoaded])

  useEffect(() => { loadConfig() }, [loadConfig])

  useEffect(() => {
    if (activeTab === 'Persona') loadSystemPrompt()
  }, [activeTab, loadSystemPrompt])

  const saveConfig = async (partial: Record<string, unknown>) => {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    })
    if (res.ok) {
      showToast('Saved')
      await loadConfig()
    } else {
      showToast('Error saving', false)
    }
  }

  const saveSystemPrompt = async () => {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPromptContent: promptModalContent }),
    })
    if (res.ok) {
      setSystemPromptContent(promptModalContent)
      showToast('System prompt saved')
      setShowPromptModal(false)
    } else {
      showToast('Error saving system prompt', false)
    }
  }

  const testVoice = async () => {
    const text = `Hello, I'm ${agentName}. How can I help you today?`
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.play()
        audio.onended = () => URL.revokeObjectURL(url)
      } else {
        showToast('TTS test failed', false)
      }
    } catch {
      showToast('TTS test failed', false)
    }
  }

  if (loading) {
    return (
      <div className="page-enter flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Loading config...</p>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${toast.ok ? 'bg-emerald-900 text-emerald-200 border border-emerald-700' : 'bg-red-900 text-red-200 border border-red-700'}`}>
          {toast.msg}
        </div>
      )}

      <h1 className="text-2xl font-semibold">Agent</h1>

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

      {/* PERSONA TAB — Identity + Soul merged */}
      {activeTab === 'Persona' && (
        <div className="space-y-5">
          {/* Identity section */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-5">
            <h3 className="text-sm font-semibold text-zinc-200">Identity</h3>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Agent Name</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[var(--color-primary)]"
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Agent Role</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[var(--color-primary)]"
                  value={agentRole}
                  onChange={e => setAgentRole(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1.5">Personality / Tagline</label>
                <textarea
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  rows={3}
                  value={agentPersonality}
                  onChange={e => setAgentPersonality(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Company Name</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[var(--color-primary)]"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Company Short Name</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[var(--color-primary)]"
                  value={companyShortName}
                  onChange={e => setCompanyShortName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Company Tagline</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[var(--color-primary)]"
                  value={companyTagline}
                  onChange={e => setCompanyTagline(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Domain</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[var(--color-primary)]"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => saveConfig({
                agent: { name: agentName, role: agentRole, personality: agentPersonality },
                company: { name: companyName, short_name: companyShortName, tagline: companyTagline, domain },
              })}
              className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-primary)] text-black hover:opacity-90 transition-opacity"
            >
              Save Identity
            </button>
          </div>

          {/* Soul section */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-5">
            <h3 className="text-sm font-semibold text-zinc-200">System Prompt</h3>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">System Prompt File Path</label>
              <input
                className="w-full bg-zinc-800/50 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-400 font-mono cursor-not-allowed"
                value={config?.agent?.systemPromptPath ?? ''}
                readOnly
              />
              <p className="text-[10px] text-zinc-600 mt-1">Relative to repo root. Change in config.json if needed.</p>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">System Prompt Preview</label>
              <div className="bg-zinc-950 border border-zinc-800 rounded-md p-3 h-32 overflow-y-auto font-mono text-xs text-zinc-400">
                {systemPromptContent ? systemPromptContent.slice(0, 400) + (systemPromptContent.length > 400 ? '...' : '') : <span className="text-zinc-600 italic">No system prompt file found at configured path.</span>}
              </div>
            </div>
            {systemPromptContent && (
              <button
                onClick={() => { setPromptModalContent(systemPromptContent); setShowPromptModal(true) }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 transition-colors"
              >
                Edit System Prompt
              </button>
            )}
          </div>
        </div>
      )}

      {/* BEHAVIOR TAB — Voice + Response merged */}
      {activeTab === 'Behavior' && (
        <div className="space-y-5">
          {/* Voice section */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-5">
            <h3 className="text-sm font-semibold text-zinc-200">Voice</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-200">Enable Voice</p>
                <p className="text-xs text-zinc-500">Allow text-to-speech responses</p>
              </div>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${voiceEnabled ? 'bg-[var(--color-primary)]' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${voiceEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Voice ID</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                  value={voiceId}
                  onChange={e => setVoiceId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Voice Model</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                  value={voiceModel}
                  onChange={e => setVoiceModel(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => saveConfig({ voice: { enabled: voiceEnabled, voiceId, model: voiceModel } })}
                className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-primary)] text-black hover:opacity-90 transition-opacity"
              >
                Save Voice
              </button>
              <button
                onClick={testVoice}
                className="px-4 py-2 rounded-md text-sm font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 transition-colors"
              >
                Test Voice
              </button>
            </div>
          </div>

          {/* Response tuning section */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-5">
            <h3 className="text-sm font-semibold text-zinc-200">Retrieval Tuning</h3>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Match Count</label>
                <input
                  type="number" min={1} max={50}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                  value={matchCount}
                  onChange={e => setMatchCount(Number(e.target.value))}
                />
                <p className="text-[10px] text-zinc-600 mt-1">Vectors retrieved per query. Higher = more context, slower.</p>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Chunk Max Chars</label>
                <input
                  type="number" min={500} max={10000}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                  value={chunkMaxChars}
                  onChange={e => setChunkMaxChars(Number(e.target.value))}
                />
                <p className="text-[10px] text-zinc-600 mt-1">Parent chunk size during embed. Affects context window use.</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-500">Similarity Threshold</label>
                  <span className="text-zinc-300 font-mono text-sm">{similarityThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.01}
                  className="w-full accent-[var(--color-primary)]"
                  value={similarityThreshold}
                  onChange={e => setSimilarityThreshold(Number(e.target.value))}
                />
                <p className="text-[10px] text-zinc-600 mt-1">Min score to include a chunk. Lower = more results, less precise.</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-500">Research Threshold</label>
                  <span className="text-zinc-300 font-mono text-sm">{researchThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.01}
                  className="w-full accent-[var(--color-primary)]"
                  value={researchThreshold}
                  onChange={e => setResearchThreshold(Number(e.target.value))}
                />
                <p className="text-[10px] text-zinc-600 mt-1">Score below this triggers auto-research. Higher = triggers more often.</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-zinc-800">
              <div>
                <p className="text-sm font-medium text-zinc-200">Auto-Research</p>
                <p className="text-xs text-zinc-500">Automatically research knowledge gaps when RAG confidence is low</p>
              </div>
              <button
                onClick={() => setAutoResearch(!autoResearch)}
                className={`relative h-6 w-11 rounded-full transition-colors ${autoResearch ? 'bg-[var(--color-primary)]' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${autoResearch ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-zinc-800">
              <div>
                <p className="text-sm font-medium text-zinc-200">Market Data</p>
                <p className="text-xs text-zinc-500">Include live market & weather data in context</p>
              </div>
              <button
                onClick={() => setMarketEnabled(!marketEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${marketEnabled ? 'bg-[var(--color-primary)]' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${marketEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {marketEnabled && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Weather Location</label>
                  <input
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[var(--color-primary)]"
                    value={weatherName}
                    onChange={e => setWeatherName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Latitude</label>
                  <input
                    type="number" step="0.0001"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                    value={weatherLat}
                    onChange={e => setWeatherLat(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Longitude</label>
                  <input
                    type="number" step="0.0001"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                    value={weatherLng}
                    onChange={e => setWeatherLng(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => saveConfig({
                rag: { matchCount, similarityThreshold, researchThreshold, chunkMaxChars },
                market_data: {
                  enabled: marketEnabled,
                  weather_location: { name: weatherName, latitude: weatherLat, longitude: weatherLng },
                },
              })}
              className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-primary)] text-black hover:opacity-90 transition-opacity"
            >
              Save Behavior
            </button>
          </div>
        </div>
      )}

      {/* System Prompt Edit Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-[800px] max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <p className="text-sm font-medium text-zinc-200">Edit System Prompt</p>
              <button onClick={() => setShowPromptModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <textarea
                className="w-full h-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-3 text-xs text-zinc-300 font-mono focus:outline-none focus:border-[var(--color-primary)] resize-none"
                value={promptModalContent}
                onChange={e => setPromptModalContent(e.target.value)}
                style={{ minHeight: '400px' }}
              />
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-zinc-800">
              <button onClick={() => setShowPromptModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">
                Cancel
              </button>
              <button
                onClick={saveSystemPrompt}
                className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-primary)] text-black hover:opacity-90 transition-opacity"
              >
                Save System Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
