'use client'

import { useState, useEffect, useCallback } from 'react'
import { COLOR_OPTIONS, getStoredColor, setStoredColor } from '@/lib/colors'
import { Check, Database, Layers, Cpu, Cloud, Mic, BarChart3, ExternalLink, Globe, Zap, Settings } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/GlassCard'
import { Toggle } from '@/components/Toggle'

type TabName = 'Appearance' | 'Connections' | 'Data Feeds'
const TABS: TabName[] = ['Appearance', 'Connections', 'Data Feeds']

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
}

interface FeedResult {
  result?: string
  error?: string
  ok: boolean
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

const FEEDS = [
  { key: 'weather',        label: 'Weather',           source: 'Open-Meteo',        desc: 'Current conditions + 3-day forecast' },
  { key: 'air_quality',    label: 'Air Quality',       source: 'Open-Meteo AQ',     desc: 'AQI, PM2.5, PM10, ozone' },
  { key: 'forex',          label: 'Forex Rates',       source: 'ExchangeRate-API',  desc: '160+ currencies, daily update' },
  { key: 'crypto',         label: 'Crypto Prices',     source: 'CoinGecko',         desc: 'Price + 24h change, ~30 req/min' },
  { key: 'commodities',    label: 'Commodities',       source: 'Yahoo Finance',     desc: 'Gold, silver, oil, gas, copper — spot prices' },
  { key: 'stocks',         label: 'Stock Markets',     source: 'Yahoo Finance',     desc: 'S&P 500, Nasdaq, Dow + configurable tickers' },
  { key: 'earthquakes',    label: 'Earthquakes',       source: 'USGS',              desc: 'Real-time global seismic activity' },
  { key: 'natural_events', label: 'Natural Events',    source: 'NASA EONET',        desc: 'Active wildfires, hurricanes, floods' },
  { key: 'recalls',        label: 'FDA Recalls',       source: 'OpenFDA',           desc: 'Recent food enforcement actions' },
  { key: 'news',           label: 'Tech News',         source: 'HackerNews',        desc: 'Top 5 stories, real-time' },
  { key: 'iss',            label: 'ISS Location',      source: 'wheretheiss.at',    desc: 'International Space Station position' },
  { key: 'sunrise',        label: 'Sunrise / Sunset',  source: 'SunriseSunset.io',  desc: 'Sunrise, sunset, golden hour' },
  { key: 'moon_phase',     label: 'Moon Phase',        source: 'Math (no API)',     desc: 'Current phase + illumination %' },
  { key: 'spacex',         label: 'Space Launches',    source: 'Space Devs LL2',    desc: 'Next upcoming + last completed launch (all agencies)' },
  { key: 'sports',         label: 'Sports Scores',     source: 'ESPN (unofficial)', desc: 'Live scores + schedules for configured leagues' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabName>('Appearance')
  const [currentColor, setCurrentColor] = useState('#22D3EE')
  const [health, setHealth] = useState<HealthData | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // Data Feeds state
  const [defaultLocation, setDefaultLocation] = useState('')
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [cryptoAssets, setCryptoAssets] = useState('bitcoin,ethereum,solana')
  const [minEarthquakeMag, setMinEarthquakeMag] = useState(4.0)
  const [stockSymbols, setStockSymbols] = useState('')
  const [sportsLeagues, setSportsLeagues] = useState('nfl,nba')
  const [feedResults, setFeedResults] = useState<Record<string, FeedResult>>({})
  const [feedTesting, setFeedTesting] = useState<Record<string, boolean>>({})
  const [feedEnabled, setFeedEnabled] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    FEEDS.forEach(f => { initial[f.key] = true })
    return initial
  })

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config')
      if (res.ok) {
        const data = await res.json() as SiteConfig & { dataFeeds?: { defaultLocation?: string; baseCurrency?: string; cryptoAssets?: string[]; earthquakeMinMagnitude?: number; stockSymbols?: string[]; sportsLeagues?: string[] } }
        setConfig(data)
        if (data.dataFeeds) {
          setDefaultLocation(data.dataFeeds.defaultLocation ?? '')
          setBaseCurrency(data.dataFeeds.baseCurrency ?? 'USD')
          setCryptoAssets(data.dataFeeds.cryptoAssets?.join(',') ?? 'bitcoin,ethereum,solana')
          setMinEarthquakeMag(data.dataFeeds.earthquakeMinMagnitude ?? 4.0)
          setStockSymbols(data.dataFeeds.stockSymbols?.join(',') ?? '')
          setSportsLeagues(data.dataFeeds.sportsLeagues?.join(',') ?? 'nfl,nba')
        }
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

  const testFeed = useCallback(async (feedKey: string) => {
    setFeedTesting(prev => ({ ...prev, [feedKey]: true }))
    try {
      const params = new URLSearchParams({ source: feedKey })
      if (defaultLocation) params.set('location', defaultLocation)
      if (baseCurrency) params.set('base', baseCurrency)
      if (cryptoAssets) params.set('assets', cryptoAssets)
      if (feedKey === 'earthquakes') params.set('min_mag', String(minEarthquakeMag))
      if (feedKey === 'stocks' && stockSymbols) params.set('symbols', stockSymbols)
      if (feedKey === 'sports') params.set('leagues', sportsLeagues || 'nfl,nba')
      const res = await fetch(`/api/admin/data-feeds?${params}`)
      const data = await res.json() as FeedResult
      setFeedResults(prev => ({ ...prev, [feedKey]: data }))
    } catch (e) {
      setFeedResults(prev => ({ ...prev, [feedKey]: { ok: false, error: String(e) } }))
    }
    setFeedTesting(prev => ({ ...prev, [feedKey]: false }))
  }, [defaultLocation, baseCurrency, cryptoAssets, minEarthquakeMag, stockSymbols, sportsLeagues])

  const saveFeedConfig = useCallback(async () => {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataFeeds: {
          defaultLocation,
          baseCurrency,
          cryptoAssets: cryptoAssets.split(',').map(s => s.trim()).filter(Boolean),
          earthquakeMinMagnitude: minEarthquakeMag,
          stockSymbols: stockSymbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
          sportsLeagues: sportsLeagues.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
        }
      })
    })
    if (res.ok) showToast('Feed config saved')
    else showToast('Error saving', false)
  }, [defaultLocation, baseCurrency, cryptoAssets, minEarthquakeMag, stockSymbols, sportsLeagues, showToast])

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

  const toggleFeed = (key: string, value: boolean) => {
    setFeedEnabled(prev => ({ ...prev, [key]: value }))
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

      <PageHeader title="Settings" icon={Settings} />

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
          <GlassCard className="p-6">
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
          </GlassCard>

          <GlassCard className="p-6">
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
          </GlassCard>
        </div>
      )}

      {/* CONNECTIONS TAB */}
      {activeTab === 'Connections' && (
        <div className="space-y-4">
          <GlassCard className="p-6">
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
          </GlassCard>
        </div>
      )}

      {/* DATA FEEDS TAB */}
      {activeTab === 'Data Feeds' && (
        <div className="space-y-5">
          {/* Feed Config */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Feed Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Default Location</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="e.g. Manila, New York"
                  value={defaultLocation}
                  onChange={e => setDefaultLocation(e.target.value)}
                />
                <p className="text-[10px] text-zinc-600 mt-1">Used for weather, air quality, sunrise/sunset</p>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Base Currency</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="USD"
                  value={baseCurrency}
                  onChange={e => setBaseCurrency(e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Crypto Assets</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="bitcoin,ethereum,solana"
                  value={cryptoAssets}
                  onChange={e => setCryptoAssets(e.target.value)}
                />
                <p className="text-[10px] text-zinc-600 mt-1">CoinGecko IDs, comma-separated</p>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Min Earthquake Magnitude</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="9"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                  value={minEarthquakeMag}
                  onChange={e => setMinEarthquakeMag(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Stock Symbols</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="AAPL,TSLA,NVDA"
                  value={stockSymbols}
                  onChange={e => setStockSymbols(e.target.value.toUpperCase())}
                />
                <p className="text-[10px] text-zinc-600 mt-1">Extra tickers beyond S&P/Nasdaq/Dow indices</p>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Sports Leagues</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="nfl,nba,nhl,mlb"
                  value={sportsLeagues}
                  onChange={e => setSportsLeagues(e.target.value.toLowerCase())}
                />
                <p className="text-[10px] text-zinc-600 mt-1">nfl · nba · nhl · mlb · mls</p>
              </div>
            </div>
            <button
              onClick={saveFeedConfig}
              className="mt-4 px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-primary)] text-black hover:opacity-90 transition-opacity"
            >
              Save Feed Config
            </button>
          </GlassCard>

          {/* Feed Cards */}
          <div className="grid grid-cols-3 gap-3">
            {FEEDS.map(feed => {
              const res = feedResults[feed.key]
              const testing = feedTesting[feed.key]
              const enabled = feedEnabled[feed.key] ?? true
              return (
                <GlassCard key={feed.key} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-zinc-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{feed.label}</p>
                        <p className="text-[10px] text-zinc-500">{feed.source}</p>
                      </div>
                    </div>
                    <Toggle enabled={enabled} onChange={(val) => toggleFeed(feed.key, val)} />
                  </div>
                  <p className="text-xs text-zinc-500 mb-3">{feed.desc}</p>
                  <button
                    onClick={() => testFeed(feed.key)}
                    disabled={testing || !enabled}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border border-zinc-700 text-zinc-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-40"
                  >
                    <Zap size={10} />
                    {testing ? 'Testing...' : 'Test'}
                  </button>
                  {res && (
                    <div className={`mt-2 rounded-md p-2 text-[10px] font-mono break-all ${res.ok ? 'bg-zinc-800/60 text-zinc-300' : 'bg-red-950/40 text-red-400'}`}>
                      {res.ok ? res.result || '(no data returned)' : res.error}
                    </div>
                  )}
                </GlassCard>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
