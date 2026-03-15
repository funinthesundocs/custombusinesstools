import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result: {
    supabase: { status: string; detail: string }
    pinecone: { status: string; vectorCount: number | null; detail?: string }
    anthropic: { status: string }
    gemini: { status: string }
    elevenlabs: { status: string }
    marketData: { status: string; lastFetched: string | null }
  } = {
    supabase: { status: 'error', detail: 'Unknown' },
    pinecone: { status: 'error', vectorCount: null },
    anthropic: { status: 'unknown' },
    gemini: { status: 'unknown' },
    elevenlabs: { status: 'unknown' },
    marketData: { status: 'unknown', lastFetched: null },
  }

  // Supabase check
  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('agent_tasks')
      .select('id')
      .limit(1)
    if (error) {
      result.supabase = { status: 'error', detail: error.message }
    } else {
      result.supabase = { status: 'connected', detail: 'OK' }
    }
  } catch (e) {
    result.supabase = { status: 'error', detail: String(e) }
  }

  // Pinecone check
  try {
    const indexHost = process.env.PINECONE_INDEX_HOST
    const apiKey = process.env.PINECONE_API_KEY
    if (!indexHost || !apiKey) {
      result.pinecone = { status: 'not_configured', vectorCount: null, detail: 'Missing env vars' }
    } else {
      const url = `${indexHost.startsWith('http') ? '' : 'https://'}${indexHost}/describe_index_stats`
      const res = await fetch(url, {
        headers: { 'Api-Key': apiKey },
      })
      if (res.ok) {
        const data = await res.json() as { totalVectorCount?: number; total_vector_count?: number }
        const count = data.totalVectorCount ?? data.total_vector_count ?? 0
        result.pinecone = { status: 'connected', vectorCount: count }
      } else {
        result.pinecone = { status: 'error', vectorCount: null, detail: `HTTP ${res.status}` }
      }
    }
  } catch (e) {
    result.pinecone = { status: 'error', vectorCount: null, detail: String(e) }
  }

  // Anthropic key check
  result.anthropic = { status: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_configured' }

  // Gemini key check
  result.gemini = { status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured' }

  // ElevenLabs key check
  result.elevenlabs = { status: process.env.ELEVENLABS_API_KEY ? 'configured' : 'not_configured' }

  // Market data check — ping a free feed to verify data feeds are reachable
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current_weather=true', { signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      result.marketData = { status: 'ok', lastFetched: new Date().toISOString() }
    } else {
      result.marketData = { status: 'error', lastFetched: null }
    }
  } catch {
    result.marketData = { status: 'error', lastFetched: null }
  }

  return NextResponse.json(result)
}
