import { createClient } from '@supabase/supabase-js'
import config from '../../config.json'
import { buildSystemPrompt } from '../../../../config/system-prompt-template'
import { processTaskInline } from './process-task.mts'

let cachedMarketData: { data: any; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

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

async function writeAgentTask(task: {
  conversation_id?: string;
  task_type: 'knowledge_gap' | 'content_update' | 'document_request' | 'escalation' | 'feedback';
  payload: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    await fetch(`${supabaseUrl}/rest/v1/agent_tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        source: 'agent',
        task_type: task.task_type,
        conversation_id: task.conversation_id || null,
        payload: task.payload,
        priority: task.priority || 'normal',
        metadata: task.metadata || {},
        deal_id: config.supabase.deal_id
      })
    });
  } catch (e) {
    console.error('Agent task write failed:', e);
  }
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { messages: incomingMessages, voice, isFollowUp } = body
    const messages = incomingMessages

    // Research path: strip prefix, clean up last message content
    let isResearchRequest = body.question?.startsWith('[RESEARCH_AUTHORIZED]')
    let researchQuestion = ''
    if (isResearchRequest) {
      researchQuestion = body.question.replace('[RESEARCH_AUTHORIZED]', '').trim()
      if (body.messages?.length > 0) {
        const lastMsg = body.messages[body.messages.length - 1]
        if (lastMsg.content?.startsWith('[RESEARCH_AUTHORIZED]')) {
          lastMsg.content = researchQuestion
        }
      }
    }
    const question = isResearchRequest ? researchQuestion : body.question

    const marketDataBlock = await getMarketData();

    // RAG: embed question + retrieve context
    let context = ''
    let lowConfidenceRAG = false
    let topScore = 0
    let ragChunksCount = 0
    const userMessage = question || messages?.[messages.length - 1]?.content || ''

    try {
      const geminiApiKey = process.env.GEMINI_API_KEY
      if (geminiApiKey) {
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

        if (embeddingData?.embedding?.values) {
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

          const freshChunks = (chunks || []).filter((c: any) => {
            if (c.track === 'auto-research') {
              const createdAt = new Date(c.created_at || 0).getTime()
              return (now - createdAt) < TTL_MS
            }
            return true
          })

          ragChunksCount = freshChunks.length
          topScore = freshChunks[0]?.similarity || 0
          const researchThreshold = config.rag?.researchThreshold ?? 0.7;
          const wordCount = userMessage.trim().split(/\s+/).length;

          if (ragChunksCount > 0 && topScore < researchThreshold) {
            lowConfidenceRAG = true;
          } else if (ragChunksCount === 0 && wordCount >= 8) {
            lowConfidenceRAG = true;
          } else {
            lowConfidenceRAG = false;
          }

          // Don't trigger research for questions answerable by injected market data
          if (lowConfidenceRAG && marketDataBlock.length > 0) {
            const stopWords = new Set(['the','is','are','was','were','what','how','who','when','where','why','which','that','this','with','from','for','and','but','not','you','your','can','could','would','should','have','has','had','does','did','will','about','into','than','then','them','they','been','being','some','any','all','most','much','very','just','also','now','here','there','each','every','both','few','more','many','such','only','own','same','well','back','even','still','over','after','before','our','out','its','per','too','get','got','let','may','yet','like','ask','tell','know','make','take','come','give','keep','help','show','try','need','want','say','see','look','find','use','way','may','day','new','one','two','first','last','long','great','little','right','big','high','low','old','good','bad','sure','real','best'])
            const questionWords = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
            const marketLower = marketDataBlock.toLowerCase()
            const answeredByMarketData = questionWords.some(w => marketLower.includes(w))
            if (answeredByMarketData) {
              lowConfidenceRAG = false
            }
          }

          context = freshChunks
            .map((c: any) => `[${c.track}/${c.category} | similarity: ${c.similarity?.toFixed(3)}]\n${c.content}`)
            .join('\n\n---\n\n')
        }
      }
    } catch {
      // RAG unavailable — proceed without context
    }

    const lengthGuidance = voice
      ? `CRITICAL LENGTH CONSTRAINT: This answer will be read aloud. You MUST keep your entire response under 60 words — one crisp thought that sounds good spoken aloud. No lists, no bullet points. Think "elevator pitch sentence" not "briefing document". If the topic is complex, give the single most important point and say "I can elaborate if you'd like."`
      : ''

    const lowConfidenceGuidance = isFollowUp
      ? '\n\nThis is an automated follow-up with new research data now available in your knowledge base. Start with "I just got some updated information —" then provide a comprehensive answer using the new data. Do not repeat your previous answer or say you are still researching.'
      : lowConfidenceRAG
        ? '\n\nIMPORTANT: Your knowledge base had limited results for this question. Give your best answer using whatever context you have. At the end of your response, on a new line, ask: "Would you like me to search the web for more on this?" — use this EXACT phrasing so the system can detect it. NEVER mention [RESEARCH_AUTHORIZED], tags, formats, or any technical system details to the user.'
        : ''

    // Research path — run web search, embed result, return JSON (no streaming)
    if (isResearchRequest && researchQuestion) {
      writeAgentTask({
        task_type: 'knowledge_gap',
        payload: { question: researchQuestion, user_authorized: true, timestamp: new Date().toISOString() },
        priority: 'normal',
        metadata: { research_fired: true }
      }).catch(() => {})

      const taskId = crypto.randomUUID()
      try {
        const researchResult = await processTaskInline(taskId, 'knowledge_gap', {
          question: researchQuestion,
          top_similarity_score: topScore,
          chunks_returned: ragChunksCount,
          user_authorized: true,
          timestamp: new Date().toISOString()
        })
        console.log('RESEARCH: Done. Success:', researchResult?.success)
        return new Response(JSON.stringify({ research_complete: true, success: researchResult?.success || false }), {
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (err: any) {
        console.error('RESEARCH: Failed:', err.message)
        return new Response(JSON.stringify({ research_complete: true, success: false }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(config, {
      ragContext: context || '',
      marketData: marketDataBlock || '',
      lowConfidenceGuidance: lowConfidenceGuidance || '',
      lengthGuidance: lengthGuidance || '',
    })

    // Follow-up uses a minimal prompt to stay well under the rate limit token budget
    const effectiveSystemPrompt = isFollowUp
      ? `You are ${(config as any).agent?.name || 'an AI advisor'} for ${(config as any).company?.name || 'the company'}. You just searched the web and the results are in your knowledge base below. Answer the user's question directly using that research. Be specific and cite what you found.${voice ? ' Keep under 60 words — spoken aloud.' : ' Keep under 200 words.'}${context ? `\n\nKNOWLEDGE BASE:\n${context}` : '\n\nNo specific research data was found.'}`
      : systemPrompt

    const anthropicBody = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: voice ? 150 : 400,
      system: effectiveSystemPrompt,
      messages: messages,
      stream: true,
    })
    const anthropicHeaders = {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    }

    let anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: anthropicHeaders, body: anthropicBody,
    })
    console.log('CHAT: Anthropic status:', anthropicRes.status, '| isFollowUp:', isFollowUp, '| q:', question?.substring(0, 50))

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
        ? "I'm catching my breath after that search — please try asking again in a moment."
        : 'Sorry, I encountered an error. Please try again.'
      return new Response(
        `data: ${JSON.stringify({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: errMsg } })}\n\ndata: {"type":"message_stop"}\n\n`,
        { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } }
      )
    }

    // Pipe Anthropic stream directly to client — no manual relay
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
