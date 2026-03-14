/**
 * RAG Factory — Live Data Update Function
 *
 * Scheduled Netlify function. Fetches all live data feeds and stores
 * them in the Supabase market_data table. The chat function reads from
 * this table, applying keyword matching to inject only relevant feeds.
 *
 * Schedule: configure in netlify.toml (recommended: every 30 minutes)
 * All data sources are FREE — no API keys required for any feed.
 */

import config from '../../config.json'
import { fetchAllFeeds, type DataFeedsConfig } from '../../../../config/live-data'

export default async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization')
    const taskSecret = process.env.TASK_PROCESSOR_SECRET
    const isScheduled = req.headers.get('X-NF-Event') === 'schedule'

    if (!isScheduled && authHeader !== `Bearer ${taskSecret}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    const feedsConfig: DataFeedsConfig = {
      defaultLocation: (config as any).dataFeeds?.defaultLocation || '',
      baseCurrency: (config as any).dataFeeds?.baseCurrency || 'USD',
      cryptoAssets: (config as any).dataFeeds?.cryptoAssets || ['bitcoin', 'ethereum', 'solana'],
      earthquakeMinMagnitude: (config as any).dataFeeds?.earthquakeMinMagnitude || 4.0,
      stockSymbols: (config as any).dataFeeds?.stockSymbols || [],
      sportsLeagues: (config as any).dataFeeds?.sportsLeagues || ['nfl', 'nba'],
    }

    const feeds = await fetchAllFeeds(feedsConfig)

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Missing Supabase config' }, { status: 500 })
    }

    const writeRes = await fetch(`${supabaseUrl}/rest/v1/market_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        prices: { feeds },
        weather: null,
        fetched_at: new Date().toISOString()
      })
    })

    if (!writeRes.ok) {
      const err = await writeRes.text()
      return Response.json({ error: 'DB write failed', details: err }, { status: 500 })
    }

    const activeFeeds = Object.entries(feeds).filter(([, v]) => v).map(([k]) => k)
    return Response.json({
      success: true,
      active_feeds: activeFeeds,
      fetched_at: new Date().toISOString()
    })
  } catch (error: unknown) {
    const err = error as Error
    return Response.json({ error: err.message, stack: err.stack }, { status: 500 })
  }
}
