import { createClient } from '@supabase/supabase-js'
import config from '../../config.json'
import { buildSystemPrompt } from '../../../../config/system-prompt-template'
import { processTaskInline } from './process-task.mts'

let cachedMarketData: { data: any; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

async function getMarketData(): Promise<string> {
  const now = Date.now();
  if (cachedMarketData && (now - cachedMarketData.fetchedAt) < CACHE_TTL_MS) {
    return formatMarketData(cachedMarketData.data);
  }
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return '';
    const res = await fetch(
      `${supabaseUrl}/rest/v1/market_data?order=fetched_at.desc&limit=1`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );
    const rows = await res.json();
    if (rows && rows.length > 0) {
      cachedMarketData = { data: rows[0], fetchedAt: now };
      return formatMarketData(rows[0]);
    }
  } catch {}
  return '';
}

function formatMarketData(row: any): string {
  let block = '';
  const p = row.prices;
  const w = row.weather;
  const fetchedAt = new Date(row.fetched_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
  if (p && Object.keys(p).length > 0) {
    block += `\n\n## CURRENT COMMODITY PRICES (updated ${fetchedAt} Manila time)`;
    if (p.iron_ore_mt?.price) block += `\nIron Ore (62% Fe CFR China): ${p.iron_ore_mt.price}/MT`;
    if (p.iron_concentrate?.price) block += `\nIron Concentrate (65% Fe): ${p.iron_concentrate.price}/MT`;
    if (p.hot_rolled_coils?.price) block += `\nHot-Rolled Steel Coils: ${p.hot_rolled_coils.price}/MT`;
    if (p.copper_ore_mt?.price) block += `\nCopper Ore: ${p.copper_ore_mt.price}/MT`;
    if (p.copper_concentrate?.price) block += `\nCopper Concentrate: ${p.copper_concentrate.price}/MT`;
    if (p.refined_copper?.price) block += `\nRefined Copper (LME): ${p.refined_copper.price}/MT`;
    if (p.gold_oz?.price) block += `\nGold (spot): ${p.gold_oz.price}/oz`;
    if (p.silver_oz?.price) block += `\nSilver (spot): ${p.silver_oz.price}/oz`;
    block += `\nThese are real, recently fetched prices. Give the number when asked.`;
  }
  if (w && w.current) {
    block += `\n\n## SITE WEATHER — ${w.location || config.market_data?.weather_location?.name || 'Site Location'}`;
    block += `\nCurrent: ${w.current.condition}, ${w.current.temperature_c}°C, humidity ${w.current.humidity_pct}%, wind ${w.current.wind_kmh} km/h`;
    if (w.current.precipitation_mm > 0) block += `, precipitation ${w.current.precipitation_mm}mm`;
    if (w.forecast && w.forecast.length > 0) {
      block += '\nForecast:';
      for (const day of w.forecast) {
        block += `\n  ${day.date}: ${day.condition}, ${day.low_c}-${day.high_c}°C, ${day.rain_probability_pct}% rain chance`;
      }
    }
    block += `\nGive weather directly when asked.`;
  }
  return block;
}

async function queryRAG(question: string): Promise<{ context: string; topScore: number; chunkCount: number }> {
  const geminiApiKey = process.env.GEMINI_API_KEY
  if (!geminiApiKey) return { context: '', topScore: 0, chunkCount: 0 }

  const embeddingRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text: question }] },
        outputDimensionality: 1536,
      }),
    }
  )
  const embeddingData = await embeddingRes.json()
  if (!embeddingData?.embedding?.values) return { context: '', topScore: 0, chunkCount: 0 }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: chunks } = await supabase.rpc('match_intelligence', {
    query_embedding: embeddingData.embedding.values,
    match_threshold: 0.3,
    match_count: 15,
  })

  const now = Date.now()
  const TTL_MS = 24 * 60 * 60 * 1000
  const fresh = (chunks || []).filter((c: any) => {
    if (c.track === 'auto-research') {
      return (now - new Date(c.created_at || 0).getTime()) < TTL_MS
    }
    return true
  })

  const context = fresh
    .map((c: any) => `[${c.track}/${c.category} | similarity: ${c.similarity?.toFixed(3)}]\n${c.content}`)
    .join('\n\n---\n\n')

  return {
    context,
    topScore: fresh[0]?.similarity || 0,
    chunkCount: fresh.length,
  }
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { messages, voice } = body
    const question = body.question || messages?.[messages.length - 1]?.content || ''

    const marketDataBlock = await getMarketData()

    // Initial RAG query
    let context = ''
    let topScore = 0
    let chunkCount = 0
    let researched = false

    try {
      const rag = await queryRAG(question)
      context = rag.context
      topScore = rag.topScore
      chunkCount = rag.chunkCount
    } catch {
      // RAG unavailable — proceed without context
    }

    // Determine if we need to research
    const researchThreshold = config.rag?.researchThreshold ?? 0.7
    const wordCount = question.trim().split(/\s+/).length
    let needsResearch = false

    if (chunkCount > 0 && topScore < researchThreshold) {
      needsResearch = true
    } else if (chunkCount === 0 && wordCount >= 8) {
      needsResearch = true
    }

    // Skip research if market data already covers the question
    if (needsResearch && marketDataBlock.length > 0) {
      const stopWords = new Set(['the','is','are','was','were','what','how','who','when','where','why','which','that','this','with','from','for','and','but','not','you','your','can','could','would','should','have','has','had','does','did','will','about','into','than','then','them','they','been','being','some','any','all','most','much','very','just','also','now','here','there','each','every','both','few','more','many','such','only','own','same','well','back','even','still','over','after','before','our','out','its','per','too','get','got','let','may','yet','like','ask','tell','know','make','take','come','give','keep','help','show','try','need','want','say','see','look','find','use','way','day','new','one','two','first','last','long','great','little','right','big','high','low','old','good','bad','sure','real','best'])
      const qWords = question.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2 && !stopWords.has(w))
      if (qWords.some((w: string) => marketDataBlock.toLowerCase().includes(w))) {
        needsResearch = false
      }
    }

    // Auto-research: run inline, then re-query RAG with fresh data
    if (needsResearch) {
      console.log('AUTO-RESEARCH: firing for question:', question.substring(0, 60))
      try {
        const taskId = crypto.randomUUID()
        const result = await processTaskInline(taskId, 'knowledge_gap', {
          question,
          top_similarity_score: topScore,
          chunks_returned: chunkCount,
          timestamp: new Date().toISOString()
        })
        console.log('AUTO-RESEARCH: complete, success:', result?.success)

        if (result?.success) {
          // Brief pause: let embedding settle + partial rate limit recovery
          await new Promise(r => setTimeout(r, 3000))

          // Re-query RAG to get freshly embedded research data
          const freshRag = await queryRAG(question)
          if (freshRag.chunkCount > 0) {
            context = freshRag.context
            researched = true
            console.log('AUTO-RESEARCH: fresh RAG returned', freshRag.chunkCount, 'chunks, top score:', freshRag.topScore)
          }
        }
      } catch (e: any) {
        console.error('AUTO-RESEARCH: failed:', e.message)
        // Continue with original context — answer with what we have
      }
    }

    const lengthGuidance = voice
      ? `CRITICAL LENGTH CONSTRAINT: This answer will be read aloud. You MUST keep your entire response under 60 words — one crisp thought that sounds good spoken aloud. No lists, no bullet points. If the topic is complex, give the single most important point and say "I can elaborate if you'd like."`
      : ''

    const researchGuidance = researched
      ? '\n\nYou just automatically searched the web and fresh results are now in your knowledge base below. Begin your response with "I just got some updated information —" then answer directly and comprehensively using the retrieved data.'
      : ''

    const systemPrompt = buildSystemPrompt(config, {
      ragContext: context || '',
      marketData: marketDataBlock || '',
      lowConfidenceGuidance: researchGuidance,
      lengthGuidance: lengthGuidance || '',
    })

    const anthropicHeaders = {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    }
    const anthropicBody = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: voice ? 150 : 400,
      system: systemPrompt,
      messages,
      stream: true,
    })

    let anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: anthropicHeaders, body: anthropicBody,
    })
    console.log('CHAT: Anthropic status:', anthropicRes.status, '| researched:', researched, '| q:', question.substring(0, 50))

    if (anthropicRes.status === 429) {
      console.log('CHAT: 429 — waiting 15s and retrying')
      await new Promise(r => setTimeout(r, 15000))
      anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: anthropicHeaders, body: anthropicBody,
      })
      console.log('CHAT: Anthropic retry status:', anthropicRes.status)
    }

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text().catch(() => 'unknown')
      console.error('CHAT: Anthropic error:', anthropicRes.status, errBody)
      const errMsg = anthropicRes.status === 429
        ? "I'm catching my breath — please try again in a moment."
        : 'Sorry, I encountered an error. Please try again.'
      return new Response(
        `data: ${JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: errMsg } })}\n\ndata: {"type":"message_stop"}\n\n`,
        { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } }
      )
    }

    // Pipe Anthropic stream directly to client
    return new Response(anthropicRes.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
