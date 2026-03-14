import { NextRequest, NextResponse } from 'next/server'
import {
  fetchWeather,
  fetchAirQuality,
  fetchForex,
  fetchCrypto,
  fetchEarthquakes,
  fetchNaturalEvents,
  fetchRecalls,
  fetchNews,
  fetchIss,
  fetchSunrise,
  geocodeLocation,
} from '../../../../../../../config/live-data'

export const dynamic = 'force-dynamic'

const FEED_MAP: Record<string, (params: Record<string, string>) => Promise<string>> = {
  weather:        p => fetchWeather(p.location || ''),
  air_quality:    p => fetchAirQuality(p.location || ''),
  forex:          p => fetchForex(p.base || 'USD'),
  crypto:         p => fetchCrypto(p.assets ? p.assets.split(',') : undefined),
  earthquakes:    p => fetchEarthquakes(p.min_mag ? parseFloat(p.min_mag) : undefined),
  natural_events: () => fetchNaturalEvents(),
  recalls:        () => fetchRecalls(),
  news:           () => fetchNews(),
  iss:            () => fetchIss(),
  sunrise:        p => fetchSunrise(p.location || ''),
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')

  if (!source) {
    // Also expose geocode as a utility
    const geocode = searchParams.get('geocode')
    if (geocode) {
      const result = await geocodeLocation(geocode)
      return NextResponse.json({ geocode, result })
    }
    return NextResponse.json({ feeds: Object.keys(FEED_MAP) })
  }

  const handler = FEED_MAP[source]
  if (!handler) {
    return NextResponse.json({ error: `Unknown feed: ${source}` }, { status: 400 })
  }

  const params: Record<string, string> = {}
  searchParams.forEach((v, k) => { if (k !== 'source') params[k] = v })

  try {
    const result = await handler(params)
    return NextResponse.json({ source, result, ok: !!result })
  } catch (err) {
    return NextResponse.json({ source, error: String(err), ok: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Trigger a full refresh: fetch all feeds and write to market_data via update-market-data pattern
  const body = await request.json().catch(() => ({})) as {
    location?: string
    base?: string
    assets?: string | string[]
    min_mag?: number | string
  }
  const { location, base, assets, min_mag } = body

  try {
    const results: Record<string, string> = {}
    const tasks = Object.entries(FEED_MAP).map(async ([key, handler]) => {
      const params: Record<string, string> = {}
      if (location) params.location = location
      if (base) params.base = base
      if (assets) params.assets = Array.isArray(assets) ? assets.join(',') : assets
      if (min_mag !== undefined) params.min_mag = String(min_mag)
      const result = await handler(params).catch(() => '')
      results[key] = result
    })
    await Promise.allSettled(tasks)
    return NextResponse.json({ results, ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err), ok: false }, { status: 500 })
  }
}
