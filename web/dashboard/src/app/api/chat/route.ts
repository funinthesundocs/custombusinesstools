import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import config from '@/lib/siteConfig'

export async function POST(req: NextRequest) {
  try {
    const { messages, question } = await req.json()

    // 1. Embed the question using Gemini (must match embedding model used for documents)
    const geminiApiKey = process.env.GEMINI_API_KEY

    // Use Gemini embedding API (same model as document embeddings)
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
    const embedding = embeddingData.embedding.values

    // 2. Query Supabase match_intelligence RPC
    const supabase = createServerClient()
    const { data: chunks } = await supabase.rpc('match_intelligence', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 10,
    })

    // 3. Assemble context from retrieved chunks
    const context = (chunks || [])
      .map((c: any) => `[${c.track}/${c.category} | similarity: ${c.similarity?.toFixed(3)}]\n${c.content}`)
      .join('\n\n---\n\n')

    const systemPrompt = `You are a senior deal intelligence advisor for ${config.company.name} (${config.company.short_name}). You have deep knowledge of the company, its assets, the regulatory environment, and the engagement strategy. You answer questions with the same depth and contextual awareness as someone who has personally read every document, attended every meeting, and studied every data point. You are direct, specific, and cite data when available. You do not hedge unnecessarily but you flag genuine uncertainties honestly. The following context has been retrieved from the intelligence database based on relevance to the current question:\n\n${context}\n\nResponse style: Be concise and direct. When listing multiple items, give 2-3 sentences per item maximum, not exhaustive bullet lists. Prioritize the single strongest point for each topic rather than listing every possible point. Match the communication style of a senior advisor in a brief verbal exchange — sharp, specific, no filler. If the user wants more depth on any point, they will ask. Total response length should rarely exceed 800 words.`

    // 4. Call Anthropic API with streaming
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages,
        stream: true,
      }),
    })

    // 5. Stream the response back
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
