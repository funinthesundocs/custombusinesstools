'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Wrench,
  Factory,
  GitBranch,
  Package,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  Save,
  Loader2,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { GlassCard } from '@/components/GlassCard'
import type { LucideIcon } from 'lucide-react'

interface LinkCardProps {
  href: string
  icon: LucideIcon
  title: string
  description: string
}

function LinkCard({ href, icon: Icon, title, description }: LinkCardProps) {
  return (
    <Link href={href}>
      <GlassCard className="p-5 cursor-pointer group">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 group-hover:bg-[var(--color-primary)]/20 transition-colors">
            <Icon size={20} className="text-[var(--color-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-[var(--color-primary)] transition-colors">
              {title}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}

interface RagConfig {
  matchCount: number
  chunkMaxChars: number
  similarityThreshold: number
  researchThreshold: number
  embeddingModel: string
  embeddingDimensions: number
  pineconeIndexName: string
}

const DEFAULT_CONFIG: RagConfig = {
  matchCount: 8,
  chunkMaxChars: 1500,
  similarityThreshold: 0.7,
  researchThreshold: 0.5,
  embeddingModel: 'text-embedding-3-small',
  embeddingDimensions: 1536,
  pineconeIndexName: '',
}

const inputClass =
  'w-full bg-zinc-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[var(--color-primary)] transition-colors'

export default function WorkshopPage() {
  const [config, setConfig] = useState<RagConfig>(DEFAULT_CONFIG)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/admin/config')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setConfig({
          matchCount: data.matchCount ?? DEFAULT_CONFIG.matchCount,
          chunkMaxChars: data.chunkMaxChars ?? DEFAULT_CONFIG.chunkMaxChars,
          similarityThreshold: data.similarityThreshold ?? DEFAULT_CONFIG.similarityThreshold,
          researchThreshold: data.researchThreshold ?? DEFAULT_CONFIG.researchThreshold,
          embeddingModel: data.embeddingModel ?? DEFAULT_CONFIG.embeddingModel,
          embeddingDimensions: data.embeddingDimensions ?? DEFAULT_CONFIG.embeddingDimensions,
          pineconeIndexName: data.pineconeIndexName ?? DEFAULT_CONFIG.pineconeIndexName,
        })
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
    } finally {
      setSaving(false)
    }
  }

  const update = <K extends keyof RagConfig>(key: K, value: RagConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="page-enter space-y-8">
      <PageHeader
        title="Workshop"
        icon={Wrench}
        description="Preserved features and advanced controls"
      />

      {/* Section 1: Workflow Tools */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
          Workflow Tools
        </span>
        <div className="grid grid-cols-2 gap-4">
          <LinkCard
            href="/production"
            icon={Factory}
            title="Production"
            description="Source documents, prompts, engine routing, and output management"
          />
          <LinkCard
            href="/pipeline"
            icon={GitBranch}
            title="Pipeline"
            description="Quality gates, verification layers, and engine routing matrix"
          />
          <LinkCard
            href="/deliverables"
            icon={Package}
            title="Deliverables"
            description="Output tracking with version control and verification status"
          />
          <LinkCard
            href="/verification"
            icon={ShieldCheck}
            title="Verification"
            description="Three-layer verification protocol for quality assurance"
          />
        </div>
      </div>

      {/* Section 2: Advanced Controls */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
          Advanced Controls
        </span>
        <div className="grid grid-cols-2 gap-4">
          <LinkCard
            href="/presentation"
            icon={Globe}
            title="Presentation Site"
            description="Client-facing website preview with viewport switching"
          />

          {/* RAG Tuning — inline controls, not a link */}
          <GlassCard className="p-5">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-primary)]/10">
                <SlidersHorizontal size={20} className="text-[var(--color-primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-100">RAG Tuning</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Fine-tune retrieval parameters
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Match Count */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Match Count</label>
                <input
                  type="number"
                  className={inputClass}
                  value={config.matchCount}
                  onChange={(e) => update('matchCount', parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Chunk Max Chars */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Chunk Max Chars</label>
                <input
                  type="number"
                  className={inputClass}
                  value={config.chunkMaxChars}
                  onChange={(e) => update('chunkMaxChars', parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Similarity Threshold */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">
                  Similarity Threshold{' '}
                  <span className="text-zinc-600 ml-1">{config.similarityThreshold.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-full accent-[var(--color-primary)]"
                  value={config.similarityThreshold}
                  onChange={(e) => update('similarityThreshold', parseFloat(e.target.value))}
                />
              </div>

              {/* Research Threshold */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">
                  Research Threshold{' '}
                  <span className="text-zinc-600 ml-1">{config.researchThreshold.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-full accent-[var(--color-primary)]"
                  value={config.researchThreshold}
                  onChange={(e) => update('researchThreshold', parseFloat(e.target.value))}
                />
              </div>

              {/* Embedding Model */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Embedding Model</label>
                <input
                  type="text"
                  className={inputClass}
                  value={config.embeddingModel}
                  onChange={(e) => update('embeddingModel', e.target.value)}
                />
              </div>

              {/* Embedding Dimensions */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Embedding Dimensions</label>
                <input
                  type="number"
                  className={inputClass}
                  value={config.embeddingDimensions}
                  onChange={(e) => update('embeddingDimensions', parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Pinecone Index Name */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Pinecone Index Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={config.pineconeIndexName}
                  onChange={(e) => update('pineconeIndexName', e.target.value)}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving || !loaded}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm font-medium hover:bg-[var(--color-primary)]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
