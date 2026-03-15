export const runtime = 'nodejs'
export const maxDuration = 60

import Anthropic from '@anthropic-ai/sdk'
import config from '../../../../config.json'

const TASK_PROCESSOR_SECRET = process.env.TASK_PROCESSOR_SECRET

interface TaskPayload {
  task_id: string
  task_type: string
  payload: Record<string, any>
  priority: string
}

async function processKnowledgeGap(
  payload: Record<string, any>,
  earlyComplete?: (result: { success: boolean; content?: string }) => Promise<void>
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: `You are a knowledge base researcher for ${config.company.name} (${config.company.short_name}). Your job is to research questions that the company's AI advisor could not answer from its existing knowledge base.

Research the question thoroughly. Provide a factual, source-attributed answer suitable for inclusion in a RAG knowledge base. Keep your answer under 200 words. Write in a neutral, informative tone — not conversational.

If you cannot find a reliable answer, respond with exactly: "INSUFFICIENT_DATA" followed by a brief explanation of why.`,
      messages: [{ role: 'user', content: `Research this question and provide a factual answer: "${payload.question}"` }]
    })

    const textContent = response.content.filter(c => c.type === 'text').map(c => c.text).join('\n')

    if (textContent.startsWith('INSUFFICIENT_DATA')) {
      return { success: false, error: textContent }
    }

    if (earlyComplete) {
      await earlyComplete({ success: true, content: textContent })
    }

    try {
      const geminiApiKey = process.env.GEMINI_API_KEY
      const pineconeApiKey = process.env.PINECONE_API_KEY
      const pineconeHost = process.env.PINECONE_INDEX_HOST

      if (geminiApiKey && pineconeApiKey && pineconeHost) {
        const embeddingRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: { parts: [{ text: textContent }] } })
          }
        )
        const embeddingData = await embeddingRes.json()
        const embedding = embeddingData?.embedding?.values

        if (embedding) {
          const vectorId = `${config.supabase.project_id}::auto-research::${Date.now()}`
          await fetch(`https://${pineconeHost}/vectors/upsert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Api-Key': pineconeApiKey },
            body: JSON.stringify({
              namespace: config.supabase.project_id,
              vectors: [{
                id: vectorId,
                values: embedding,
                metadata: {
                  modality: 'text',
                  content: textContent.slice(0, 400),
                  parent_content: textContent.slice(0, 2000),
                  parent_id: vectorId,
                  source_file: 'auto-research',
                  source_title: 'Live Research',
                  section_heading: payload.question ? payload.question.slice(0, 100) : '',
                  page_number: null,
                  chunk_index: 0,
                  child_index: 0,
                  is_parent: false,
                  deal_id: config.supabase.project_id,
                  track: 'auto-research',
                  source_type: 'knowledge-gap-fill',
                  created_at: new Date().toISOString(),
                  source_question: payload.question,
                  similarity_score_trigger: payload.top_similarity_score,
                }
              }]
            })
          })
        }
      }
    } catch {
      // Embedding failure is non-fatal
    }

    return { success: true, content: textContent }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!TASK_PROCESSOR_SECRET || authHeader !== `Bearer ${TASK_PROCESSOR_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const task: TaskPayload = await request.json()
    let result: Record<string, any>

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const earlyComplete = async (earlyResult: { success: boolean; content?: string }) => {
      if (!supabaseUrl || !supabaseKey) return
      await fetch(`${supabaseUrl}/rest/v1/agent_tasks?id=eq.${task.task_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status: 'complete',
          result: earlyResult,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }).catch(() => {})
    }

    switch (task.task_type) {
      case 'knowledge_gap':
      case 'content_update':
        result = await processKnowledgeGap(task.payload, earlyComplete)
        break
      case 'feedback':
        result = { success: true }
        break
      case 'escalation':
      case 'document_request':
        console.log('ESCALATION:', JSON.stringify(task.payload))
        result = { success: true }
        break
      default:
        result = { success: false, error: `Unknown task type: ${task.task_type}` }
    }

    const patchUrl = `${supabaseUrl}/rest/v1/agent_tasks?id=eq.${task.task_id}`
    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        status: result.success ? 'complete' : 'failed',
        result: result,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    })

    const patchDebug = {
      patchUrl,
      patchStatus: patchRes.status,
      patchOk: patchRes.ok,
      supabaseUrlSource: process.env.SUPABASE_URL ? 'SUPABASE_URL' : (process.env.NEXT_PUBLIC_SUPABASE_URL ? 'NEXT_PUBLIC_SUPABASE_URL' : 'NONE'),
      hasKey: !!supabaseKey
    }

    if (!patchRes.ok) {
      const patchBody = await patchRes.text()
      return Response.json({ processed: true, result, patchDebug: { ...patchDebug, patchBody } })
    }

    return Response.json({ processed: true, result, patchDebug })
  } catch (e: any) {
    return Response.json({ processed: false, error: e.message }, { status: 500 })
  }
}
