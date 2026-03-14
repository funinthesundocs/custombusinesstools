import { createClient } from '@supabase/supabase-js'
import config from '../../config.json'
import { buildSystemPrompt } from '../../../../config/system-prompt-template'
import { selectFeedsForQuestion, fetchWeather, fetchAirQuality, fetchSunrise } from '../../../../config/live-data'

let cachedLiveData: { feeds: Record<string, string>; fetchedAt: number } | null = null
const LIVE_DATA_TTL_MS = 10 * 60 * 1000 // 10 minutes

async function getLiveDataBlock(question: string): Promise<string> {
  const now = Date.now()
  if (cachedLiveData && (now - cachedLiveData.fetchedAt) < LIVE_DATA_TTL_MS) {
    return selectFeedsForQuestion(question, cachedLiveData.feeds)
  }
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) return ''
    const res = await fetch(
      `${supabaseUrl}/rest/v1/market_data?order=fetched_at.desc&limit=1`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    )
    const rows = await res.json()
    if (rows?.length > 0) {
      const feeds = rows[0].prices?.feeds || {}
      cachedLiveData = { feeds, fetchedAt: now }
      return selectFeedsForQuestion(question, feeds)
    }
  } catch {}
  return ''
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
        deal_id: config.supabase.project_id
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
    const { messages: incomingMessages, question, voice, isFollowUp } = await req.json()
    const messages = incomingMessages

    // Establish user message first so live data can keyword-match against it
    const userMessage = question || messages?.[messages.length - 1]?.content || ''

    // Include the last assistant message for context — so a reply like "Honolulu"
    // inherits weather intent from the prior turn that asked "Which city?"
    const lastAssistantMsg = messages?.slice().reverse()
      .find((m: any) => m.role === 'assistant')?.content || ''
    const matchingContext = userMessage + (lastAssistantMsg ? ' ' + lastAssistantMsg.slice(0, 300) : '')
    let marketDataBlock = await getLiveDataBlock(matchingContext)

    // On-demand location fetch: weather/air quality/sunrise require a user-supplied location.
    // The Supabase cache has no location data unless defaultLocation is configured.
    // Detect weather intent in context, extract location from userMessage, fetch live.
    const WEATHER_INTENT = /weather|temperature|temp|rain|forecast|hot|cold|humid|wind|celsius|fahrenheit|snow|sunrise|sunset|air quality|aqi/i
    const LOCATION_CONTEXT = /weather|city|location|temperature|forecast|air quality/i
    if (WEATHER_INTENT.test(matchingContext) || LOCATION_CONTEXT.test(lastAssistantMsg)) {
      // Extract location: prefer userMessage if short and looks like a place name,
      // otherwise scan full context for a quoted or capitalized location
      const trimmed = userMessage.trim()
      const looksLikeLocation = trimmed.length > 0 && trimmed.length < 60 &&
        !trimmed.includes('?') && /[A-Z]/.test(trimmed) &&
        !/\b(what|how|when|where|is|are|the|can|does|do|tell|give)\b/i.test(trimmed)

      const location = looksLikeLocation ? trimmed : null

      if (location) {
        const [liveWeather, liveAir, liveSunrise] = await Promise.allSettled([
          fetchWeather(location),
          fetchAirQuality(location),
          fetchSunrise(location),
        ])
        const live = [liveWeather, liveAir, liveSunrise]
          .filter(r => r.status === 'fulfilled' && r.value)
          .map(r => (r as PromiseFulfilledResult<string>).value)
          .join('\n')
        if (live) {
          marketDataBlock = live + (marketDataBlock ? '\n' + marketDataBlock : '')
        }
      }
    }

    // RAG: embed question with Gemini Embedding 2 + retrieve from Pinecone
    let context = ''
    let mediaResults: Array<{ modality: string; url: string; caption: string; score: number }> = []
    let lowConfidenceRAG = false
    let topScore = 0
    let ragChunksCount = 0

    try {
      const geminiApiKey = process.env.GEMINI_API_KEY
      const pineconeApiKey = process.env.PINECONE_API_KEY
      const pineconeHost = process.env.PINECONE_INDEX_HOST

      if (geminiApiKey && pineconeApiKey && pineconeHost) {
        // Embed query with Gemini Embedding 2 (3072 dims — matches index)
        const embeddingRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: { parts: [{ text: userMessage }] },
            }),
          }
        )
        const embeddingData = await embeddingRes.json()

        if (embeddingData?.embedding?.values) {
          // Query Pinecone via REST API (no SDK needed in edge function)
          const pineconeRes = await fetch(
            `https://${pineconeHost}/query`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Api-Key': pineconeApiKey,
              },
              body: JSON.stringify({
                namespace: config.supabase.project_id,
                vector: embeddingData.embedding.values,
                topK: 15,
                includeMetadata: true,
              }),
            }
          )
          const pineconeData = await pineconeRes.json()
          const matches = pineconeData.matches || []

          const now = Date.now()
          const TTL_MS = 24 * 60 * 60 * 1000
          const freshMatches = matches.filter((m: any) => {
            if (m.metadata?.track === 'auto-research') {
              const createdAt = new Date(m.metadata?.created_at || 0).getTime()
              return (now - createdAt) < TTL_MS
            }
            return true
          })

          ragChunksCount = freshMatches.length
          topScore = freshMatches[0]?.score || 0
          lowConfidenceRAG = ragChunksCount === 0 || topScore < 0.7

          // Don't trigger research for questions answerable by injected market data
          if (lowConfidenceRAG && marketDataBlock.length > 0) {
            const stopWords = new Set(['the','is','are','was','were','what','how','who','when','where','why','which','that','this','with','from','for','and','but','not','you','your','can','could','would','should','have','has','had','does','did','will','about','into','than','then','them','they','been','being','some','any','all','most','much','very','just','also','now','here','there','each','every','both','few','more','many','such','only','own','same','well','back','even','still','over','after','before','our','out','its','per','too','get','got','let','may','yet','like','ask','tell','know','make','take','come','give','keep','help','show','try','need','want','say','see','look','find','use','way','day','new','one','two','first','last','long','great','little','right','big','high','low','old','good','bad','sure','real','best'])
            const questionWords = userMessage.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2 && !stopWords.has(w))
            const marketLower = marketDataBlock.toLowerCase()
            if (questionWords.some((w: string) => marketLower.includes(w))) {
              lowConfidenceRAG = false
            }
          }

          // Split by modality: text → context, images/video → mediaResults
          const textMatches = freshMatches.filter((m: any) =>
            !m.metadata?.modality || m.metadata.modality === 'text'
          )
          const mediaMatches = freshMatches.filter((m: any) =>
            m.metadata?.modality === 'image' || m.metadata?.modality === 'video'
          )

          context = textMatches
            .map((m: any) => `[${m.metadata?.track || 'source'} | score: ${m.score?.toFixed(3)}]\n${m.metadata?.content || ''}`)
            .join('\n\n---\n\n')

          mediaResults = mediaMatches
            .filter((m: any) => m.metadata?.storage_url)
            .map((m: any) => ({
              modality: m.metadata.modality,
              url: m.metadata.storage_url,
              caption: m.metadata.content || '',
              score: m.score,
            }))
        }
      }
    } catch {
      // RAG unavailable — proceed without context
    }

    // Fire research in background — do NOT await
    if (lowConfidenceRAG && !isFollowUp) {
      const taskSecret = process.env.TASK_PROCESSOR_SECRET;
      const processUrl = process.env.PROCESS_TASK_URL;
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const realtimeTaskId = crypto.randomUUID();

      if (supabaseUrl && supabaseKey) {
        fetch(`${supabaseUrl}/rest/v1/agent_tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            id: realtimeTaskId,
            source: 'agent',
            task_type: 'knowledge_gap',
            payload: {
              question: userMessage,
              top_similarity_score: topScore,
              chunks_returned: ragChunksCount,
              realtime: true,
              timestamp: new Date().toISOString()
            },
            status: 'pending',
            priority: 'urgent',
            metadata: { research_fired: true },
            deal_id: config.supabase.project_id
          })
        }).then(() => {
          if (processUrl && taskSecret) {
            fetch(processUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${taskSecret}`
              },
              body: JSON.stringify({
                task_id: realtimeTaskId,
                task_type: 'knowledge_gap',
                payload: {
                  question: userMessage,
                  top_similarity_score: topScore,
                  chunks_returned: ragChunksCount,
                  realtime: true,
                  timestamp: new Date().toISOString()
                },
                priority: 'urgent'
              })
            }).catch(() => {});
          }
        }).catch(() => {});
      }
    }

    const realtimeResearchFired = lowConfidenceRAG && !isFollowUp;

    const lengthGuidance = voice
      ? `CRITICAL LENGTH CONSTRAINT: This answer will be read aloud. You MUST keep your entire response under 60 words — one crisp thought that sounds good spoken aloud. No lists, no bullet points. Think "elevator pitch sentence" not "briefing document". If the topic is complex, give the single most important point and say "I can elaborate if you'd like."`
      : ''

    const lowConfidenceGuidance = isFollowUp
      ? '\n\nThis is an automated follow-up with new research data now available in your knowledge base. Start with "I just got some updated information —" then provide a comprehensive answer using the new data. Do not repeat your previous answer or say you are still researching.'
      : lowConfidenceRAG
        ? `\n\nIMPORTANT OVERRIDE: Your knowledge base had limited results for this question but a background system is actively researching it right now. START your response by telling the user you are looking into it — say something like "Let me research that for you — I'm pulling some data on that right now." Then share whatever you DO know that is relevant. Do NOT say "check Bloomberg" or suggest external sources. Do NOT say you cannot help. End warmly — "I should have more details for you shortly."`
        : ''

    const systemPrompt = buildSystemPrompt(config, {
      ragContext: context || '',
      marketData: marketDataBlock || '',
      lowConfidenceGuidance: lowConfidenceGuidance || '',
      lengthGuidance: lengthGuidance || '',
    })

    const maxTokens = voice ? 80 : 120

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages,
        stream: true,
      }),
    })

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

    // Manual stream relay: forward chunks, emit research_pending at end
    const reader = anthropicRes.body!.getReader()
    let responseText = ''
    let uncertaintyResearchFired = false;

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read()

          if (done) {
            // Emit media results if any were retrieved
            if (mediaResults.length > 0) {
              const mediaSignal = `data: ${JSON.stringify({ type: 'media_results', results: mediaResults })}\n\n`;
              controller.enqueue(new TextEncoder().encode(mediaSignal));
            }

            // Emit research_pending signal before closing
            if (lowConfidenceRAG) {
              const signal = `data: ${JSON.stringify({ type: 'research_pending', question: userMessage })}\n\n`;
              controller.enqueue(new TextEncoder().encode(signal));
            }

            // Fire research for mid-stream uncertainty if not already fired
            if (uncertaintyResearchFired) {
              const taskSecret = process.env.TASK_PROCESSOR_SECRET;
              const processUrl = process.env.PROCESS_TASK_URL;
              const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
              const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
              const uncertaintyTaskId = crypto.randomUUID();

              if (supabaseUrl && supabaseKey && taskSecret && processUrl) {
                try {
                  await fetch(`${supabaseUrl}/rest/v1/agent_tasks`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'apikey': supabaseKey,
                      'Authorization': `Bearer ${supabaseKey}`,
                      'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                      id: uncertaintyTaskId,
                      source: 'agent',
                      task_type: 'knowledge_gap',
                      payload: { question: userMessage, detection_method: 'uncertainty_phrase', realtime: true, timestamp: new Date().toISOString() },
                      status: 'pending',
                      priority: 'urgent',
                      metadata: { research_fired: true },
                      deal_id: config.supabase.project_id
                    })
                  });
                  await fetch(processUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${taskSecret}` },
                    body: JSON.stringify({
                      task_id: uncertaintyTaskId,
                      task_type: 'knowledge_gap',
                      payload: { question: userMessage, detection_method: 'uncertainty_phrase', realtime: true, timestamp: new Date().toISOString() },
                      priority: 'urgent'
                    })
                  }).catch(() => {});
                } catch {}
              }
            }

            controller.close()

            // Post-stream tasks
            try {
              const taskPromises: Promise<void>[] = []
              if (lowConfidenceRAG && !realtimeResearchFired) {
                taskPromises.push(writeAgentTask({
                  task_type: 'knowledge_gap',
                  payload: { question: userMessage, top_similarity_score: topScore || 0, chunks_returned: ragChunksCount, timestamp: new Date().toISOString() },
                  priority: ragChunksCount === 0 ? 'high' : 'normal',
                  metadata: { research_fired: true }
                }))
              }
              const uncertaintyPhrases = ['don\'t have information', 'outside my knowledge', 'not sure about that', 'outside what I have', 'I don\'t know', 'don\'t have access to', 'don\'t have live', 'don\'t have real-time', 'don\'t have current', 'my knowledge is focused', 'beyond my knowledge', 'outside my expertise', 'can\'t provide current', 'not in my knowledge base', 'outside my knowledge base', 'i\'m not able to', 'beyond what i have', 'i don\'t have that', 'check bloomberg', 'check with', 'you\'d want to check']
              const admittedUncertainty = uncertaintyPhrases.some(phrase => responseText.toLowerCase().includes(phrase))
              if (admittedUncertainty && !uncertaintyResearchFired && !lowConfidenceRAG) {
                taskPromises.push(writeAgentTask({
                  task_type: 'knowledge_gap',
                  payload: { question: userMessage, response_snippet: responseText.substring(0, 200), detection_method: 'uncertainty_phrase', timestamp: new Date().toISOString() },
                  priority: 'normal'
                }))
              }
              if (taskPromises.length > 0) await Promise.all(taskPromises)
            } catch {}
            return
          }

          controller.enqueue(value)

          // Accumulate text + mid-stream uncertainty detection
          try {
            const text = new TextDecoder().decode(value)
            for (const line of text.split('\n')) {
              if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  responseText += data.delta.text
                }
              }
            }
            if (!uncertaintyResearchFired && !lowConfidenceRAG && !isFollowUp) {
              const lowerResponse = responseText.toLowerCase();
              const uncertaintyPhrases = ["outside what i have", "don't have information", "outside my knowledge", "that's outside", "you'd want to ask", "you'd want to check", "check with the", "i don't know", "don't have that on hand", "pulling it up for you", "i'm pulling it up", "don't have that"];
              if (uncertaintyPhrases.some(p => lowerResponse.includes(p))) {
                uncertaintyResearchFired = true;
                const signal = `data: ${JSON.stringify({ type: 'research_pending', question: userMessage })}\n\n`;
                controller.enqueue(new TextEncoder().encode(signal));
              }
            }
          } catch {}
        } catch {
          controller.close()
        }
      }
    })

    return new Response(stream, {
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
