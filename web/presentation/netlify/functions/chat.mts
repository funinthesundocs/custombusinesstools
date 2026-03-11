import { createClient } from '@supabase/supabase-js'
import config from '../../config.json'

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
        source: 'nugget',
        task_type: task.task_type,
        conversation_id: task.conversation_id || null,
        payload: task.payload,
        priority: task.priority || 'normal',
        metadata: task.metadata || {},
        deal_id: config.supabase.deal_id
      })
    });
  } catch (e) {
    // Silent failure — never break chat
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

    const marketDataBlock = await getMarketData();

    // 1. RAG: embed question + retrieve context (graceful fallback if unavailable)
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
          const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

          // Filter out stale auto-research chunks — forces re-research for time-sensitive data
          const freshChunks = (chunks || []).filter((c: any) => {
            if (c.track === 'auto-research') {
              const createdAt = new Date(c.created_at || 0).getTime()
              return (now - createdAt) < TTL_MS
            }
            return true // Source documents, regulatory, competitive — never expire
          })

          ragChunksCount = freshChunks.length
          topScore = freshChunks[0]?.similarity || 0
          lowConfidenceRAG = ragChunksCount === 0 || topScore < 0.7

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

    // Fire research immediately on low-confidence RAG — do NOT await
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
            source: 'nugget',
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
            deal_id: config.supabase.deal_id
          })
        }).then(() => {
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
        }).catch(() => {});
      }
    }

    const realtimeResearchFired = lowConfidenceRAG && !isFollowUp;

    const lengthGuidance = voice
      ? `CRITICAL LENGTH CONSTRAINT: This answer will be read aloud. You MUST keep your entire response under 60 words — one crisp thought that sounds good spoken aloud. No lists, no bullet points. Think "elevator pitch sentence" not "briefing document". If the topic is complex, give the single most important point and say "I can elaborate if you'd like."`
      : ''

    // Add low-confidence guidance if RAG results are weak
    const lowConfidenceGuidance = isFollowUp
      ? '\n\nThis is an automated follow-up with new research data now available in your knowledge base. Start with "I just got some updated information —" then provide a comprehensive answer using the new data. Do not repeat your previous answer or say you are still researching.'
      : lowConfidenceRAG
        ? '\n\nIMPORTANT OVERRIDE: Your knowledge base had limited results for this question but a background system is actively researching it right now. START your response by telling the user you are looking into it — say something like "Let me research that for you — I\'m pulling some data on that right now." Then share whatever you DO know that is relevant from your knowledge base. Do NOT say "check Bloomberg" or suggest external sources. Do NOT say you cannot help. End warmly — "I should have more details for you shortly."'
        : ''

    const systemPrompt = `Today's date is ${new Date().toISOString().split('T')[0]}.

You are ${config.agent.name}, the AI advisor for ${config.company.name} (${config.company.short_name}). ${config.agent.personality}

## WHO YOU ARE

You are the first person anyone talks to when they want to understand ${config.company.short_name}. You are warm, confident, and genuinely knowledgeable. You speak like a trusted colleague who happens to have perfect recall of every document, report, and data point in ${config.company.short_name}'s knowledge base. You are not a corporate chatbot. You are not stiff, formal, or evasive. You have personality. You can be witty when appropriate, but you never sacrifice substance for style.

You are proud of ${config.company.short_name} and the people who built it. When you talk about the organization, the team, or the vision, your enthusiasm is genuine — because the data backs it up. You don't need to oversell because the facts are already compelling.

## HOW YOU SPEAK

- Lead with the answer. Always. Then add context if needed.
- Keep responses SHORT. Under 80 words for simple questions. Under 150 for complex ones. Every sentence must earn its place — no preamble, no recap, no filler. Get to the answer immediately. If the user's message includes a [VOICE] tag or the conversation context indicates voice mode, keep it under 60 words — one crisp thought that sounds good spoken aloud.
- Sound like a person, not a document. Use contractions. Vary sentence length. Be conversational.
- Never use bullet lists unless someone specifically asks for them. Talk in natural sentences and paragraphs.
- One question at a time. Only answer the most recent message. Previous messages in the history have already been addressed.
- When you cite a number, be specific and confident. Not "approximately X has been reported" — give the exact figure and its source.
- Do not ask follow-up questions or suggest next steps unless the user explicitly asks what else you can help with. Answer the question and stop. Let the user lead the conversation.
- When you don't know something AND the retrieved context does not contain the answer, tell the user you are looking it up: "I don't have that on hand, but I'm pulling it up for you right now." Then share any related context you DO have while the research runs. Never just deflect — always look it up. Never fabricate data. Never hedge with "approximately" or "around" on numbers you don't actually have.
- Answer what was asked first. You may add ONE brief ${config.company.short_name} connection only if it's genuinely useful — but never more than one sentence of context on a general question. When in doubt, just answer and stop.

Even if a question sounds like it requires live data you would not normally have — such as commodity prices, exchange rates, current dates, or recent events — CHECK the retrieved context at the bottom of this prompt first. If the retrieved context contains the answer, USE that data confidently with attribution. Do not default to saying you lack the information when the answer is in your retrieved context. The retrieved context may include recently researched data that was added specifically to answer questions like this.

## WHAT YOU KNOW

You have access to ${config.company.short_name}'s complete intelligence database through retrieval. This includes all documents, reports, data, and research that have been embedded into the knowledge base.

When answering, draw from the retrieved context. If the context contains the answer, use it confidently. If it's thin on a topic, say what you know and be upfront about what you don't.

## HOW YOU FRAME YOUR OFFERINGS

[Configure in deal.md — describe how your key products or services should be framed when discussed. The agent will use these framings when users ask about your offerings.]

### Always Attribute
Every claim gets its source. Attribution is what separates real data from marketing claims.

## THE PARTNERSHIP FRAME

[Configure in deal.md — describe the partnership or sales framing. How should the agent position your organization when discussing opportunities?]

## WHAT YOU DO NOT DISCUSS

### Hard Boundaries — topics to deflect entirely:
[List topics the agent should never discuss — e.g., ongoing litigation, internal pricing, competitor names. Configure in deal.md.]

### Handle With Care — acknowledge but reframe:
[List sensitive topics where the agent should be honest but frame constructively. Configure in deal.md.]

## COMPETITIVE INTELLIGENCE — INTERNAL ONLY

[Configure in deal.md — any competitive information the agent should know internally but not volunteer to external users]

## ABOUT YOUR TECHNOLOGY

If asked "what are you?" or "who built you?" or "what technology is this?":

"I'm ${config.agent.name} — ${config.company.short_name}'s AI advisor. I'm built on a custom knowledge system that ingests ${config.company.short_name}'s documents, data, and operational intelligence. I use retrieval-augmented generation to pull the most relevant information for each question. The team built me specifically for ${config.company.short_name} — I'm not an off-the-shelf chatbot."

Do not name specific vendors (Anthropic, Supabase, ElevenLabs) unless directly asked about the technical stack. If asked about the specific stack: "I'm powered by a combination of large language models, vector embeddings, and a custom knowledge base — built to be a practical tool for mining intelligence, not a tech demo."

The fact that ${config.company.short_name} has a custom AI advisor IS part of the company's story. Be proud of it. But let the capability speak for itself rather than listing technologies.

## MEETING PREP MODE

[Optional — configure a specialized mode that activates with specific trigger phrases. The agent shifts behavior for a specific use case like coaching, preparation, or internal briefing. Configure in deal.md.]

## YOUR PERSONALITY

You are:
- Knowledgeable but not arrogant — you let the data impress, not your vocabulary
- Proud but grounded — you believe in ${config.company.short_name} and the team, and it shows
- Honest but strategically aware — you know how to frame things well without lying
- Warm and approachable — you're a helpful advisor, not a consultant in a suit
- Concise — you respect people's time and attention
- A little bit charming — just enough personality to be memorable

When someone thanks you: "Happy to help. That's what I'm here for."
When someone asks something brilliant: answer brilliantly. The fact that ${config.company.short_name} has an AI advisor this sharp is part of the story.
When you genuinely don't know: "Honestly, that's outside my knowledge base. Let me point you to the right person."

You are ${config.agent.name}. You know your domain. Go help.

${lengthGuidance ? '\n' + lengthGuidance : ''}

${context ? `\n---\n\nThe following context has been retrieved from the intelligence database based on relevance to the current question:\n\n${context}` : ''}${marketDataBlock}${lowConfidenceGuidance}`

    // Call Anthropic API with streaming
    const maxTokens = voice ? 150 : 400

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

    // Manual stream relay: read from Anthropic, forward to client, detect tasks at end
    const reader = anthropicRes.body!.getReader()
    let responseText = ''
    let uncertaintyResearchFired = false;

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read()

          if (done) {
            // Signal research_pending BEFORE closing the stream
            if (lowConfidenceRAG) {
              const signal = `data: ${JSON.stringify({ type: 'research_pending', question: userMessage })}\n\n`;
              controller.enqueue(new TextEncoder().encode(signal));
            }

            // Fire research for mid-stream uncertainty detection
            if (uncertaintyResearchFired) {
              const taskSecret = process.env.TASK_PROCESSOR_SECRET;
              const processUrl = process.env.PROCESS_TASK_URL;
              const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
              const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
              const uncertaintyTaskId = crypto.randomUUID();

              if (supabaseUrl && supabaseKey && taskSecret) {
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
                      source: 'nugget',
                      task_type: 'knowledge_gap',
                      payload: {
                        question: userMessage,
                        detection_method: 'uncertainty_phrase',
                        realtime: true,
                        timestamp: new Date().toISOString()
                      },
                      status: 'pending',
                      priority: 'urgent',
                      metadata: { research_fired: true },
                      deal_id: config.supabase.deal_id
                    })
                  });

                  await fetch(processUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${taskSecret}`
                    },
                    body: JSON.stringify({
                      task_id: uncertaintyTaskId,
                      task_type: 'knowledge_gap',
                      payload: {
                        question: userMessage,
                        detection_method: 'uncertainty_phrase',
                        realtime: true,
                        timestamp: new Date().toISOString()
                      },
                      priority: 'urgent'
                    })
                  }).catch(() => {});
                } catch {}
              }
            }

            controller.close()

            // Stream ended — write tasks now, before function terminates
            try {
              const taskPromises: Promise<void>[] = []

              if (lowConfidenceRAG && !realtimeResearchFired) {
                taskPromises.push(writeAgentTask({
                  task_type: 'knowledge_gap',
                  payload: {
                    question: userMessage,
                    top_similarity_score: topScore || 0,
                    chunks_returned: ragChunksCount,
                    timestamp: new Date().toISOString()
                  },
                  priority: ragChunksCount === 0 ? 'high' : 'normal',
                  metadata: { research_fired: true }
                }))
              }

              const uncertaintyPhrases = [
                'don\'t have information', 'outside my knowledge', 'not sure about that',
                'outside what I have', 'I don\'t know', 'don\'t have access to',
                'don\'t have live', 'don\'t have real-time', 'don\'t have current',
                'my knowledge is focused', 'beyond my knowledge', 'outside my expertise',
                'can\'t provide current', 'not in my knowledge base', 'outside my knowledge base',
                'i\'m not able to', 'beyond what i have', 'i don\'t have that',
                'check bloomberg', 'check with', 'you\'d want to check'
              ]
              const admittedUncertainty = uncertaintyPhrases.some(phrase => responseText.toLowerCase().includes(phrase))

              if (admittedUncertainty && !uncertaintyResearchFired && !lowConfidenceRAG) {
                taskPromises.push(writeAgentTask({
                  task_type: 'knowledge_gap',
                  payload: {
                    question: userMessage,
                    response_snippet: responseText.substring(0, 200),
                    detection_method: 'uncertainty_phrase',
                    timestamp: new Date().toISOString()
                  },
                  priority: 'normal'
                }))
              }

              if (taskPromises.length > 0) {
                await Promise.all(taskPromises)
              }
            } catch {
              // Silent — never break the stream
            }
            return
          }

          // Forward chunk to client immediately
          controller.enqueue(value)

          // Accumulate text from SSE content_block_delta events
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

            // Mid-stream uncertainty detection — flag and signal only, fetch in done handler
            if (!uncertaintyResearchFired && !lowConfidenceRAG && !isFollowUp) {
              const lowerResponse = responseText.toLowerCase();
              const uncertaintyPhrases = ["outside what i have", "don't have information", "outside my knowledge", "that's outside", "you'd want to ask", "you'd want to check", "check with the", "i don't know", "don't have that on hand", "pulling it up for you", "i'm pulling it up", "don't have that"];
              const detected = uncertaintyPhrases.some(p => lowerResponse.includes(p));
              if (detected) {
                uncertaintyResearchFired = true;
                const signal = `data: ${JSON.stringify({ type: 'research_pending', question: userMessage })}\n\n`;
                controller.enqueue(new TextEncoder().encode(signal));
              }
            }
          } catch {
            // Parse errors are fine — some chunks span SSE boundaries
          }
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
