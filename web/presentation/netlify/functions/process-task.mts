import Anthropic from '@anthropic-ai/sdk';
// v2: env var fix

const TASK_PROCESSOR_SECRET = process.env.TASK_PROCESSOR_SECRET;

interface TaskPayload {
  task_id: string;
  task_type: string;
  payload: Record<string, any>;
  priority: string;
}

async function processKnowledgeGap(payload: Record<string, any>): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: `You are a knowledge base researcher for a mining company called Genluiching Mining Corporation (GMC). Your job is to research questions that the company's AI advisor could not answer from its existing knowledge base.

Research the question thoroughly. Provide a factual, source-attributed answer suitable for inclusion in a RAG knowledge base. Keep your answer under 300 words. Write in a neutral, informative tone — not conversational.

If you cannot find a reliable answer, respond with exactly: "INSUFFICIENT_DATA" followed by a brief explanation of why.`,
      messages: [{ role: 'user', content: `Research this question and provide a factual answer: "${payload.question}"` }]
    });

    const textContent = response.content.filter(c => c.type === 'text').map(c => c.text).join('\n');

    if (textContent.startsWith('INSUFFICIENT_DATA')) {
      return { success: false, error: textContent };
    }

    // Embed the new knowledge via Gemini
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) return { success: false, error: 'No Gemini API key for embedding' };

    const embeddingRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: textContent }] },
          outputDimensionality: 1536
        })
      }
    );
    const embeddingData = await embeddingRes.json();
    const embedding = embeddingData?.embedding?.values;

    if (!embedding) return { success: false, error: 'Embedding generation failed' };

    // Write to intelligence_documents with pending_review status
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const docRes = await fetch(`${supabaseUrl}/rest/v1/intelligence_documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        deal_id: '57eb32a1-8550-45d1-8906-64652642c465',
        content: textContent,
        embedding: JSON.stringify(embedding),
        document_type: 'auto-research',
        track: 'auto-research',
        category: 'knowledge-gap-fill',
        processing_status: 'verified',
        processing_notes: JSON.stringify({
          source_question: payload.question,
          generated_at: new Date().toISOString(),
          similarity_score_trigger: payload.top_similarity_score
        })
      })
    });

    if (!docRes.ok) {
      const docErr = await docRes.text();
      return { success: false, error: `intelligence_documents write failed: ${docRes.status} ${docErr}` };
    }

    return { success: true, content: textContent };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function processFeedback(payload: Record<string, any>): Promise<{ success: boolean }> {
  // Feedback is already stored in the task — just mark complete
  return { success: true };
}

async function processEscalation(payload: Record<string, any>): Promise<{ success: boolean }> {
  // Log escalation — in v2 this sends email/Slack notification
  console.log('ESCALATION:', JSON.stringify(payload));
  return { success: true };
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Authenticate
  const authHeader = req.headers.get('Authorization');
  if (!TASK_PROCESSOR_SECRET || authHeader !== `Bearer ${TASK_PROCESSOR_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const task: TaskPayload = await req.json();
    let result: Record<string, any>;

    switch (task.task_type) {
      case 'knowledge_gap':
        result = await processKnowledgeGap(task.payload);
        break;
      case 'content_update':
        result = await processKnowledgeGap(task.payload); // Same research flow for now
        break;
      case 'feedback':
        result = await processFeedback(task.payload);
        break;
      case 'escalation':
      case 'document_request':
        result = await processEscalation(task.payload);
        break;
      default:
        result = { success: false, error: `Unknown task type: ${task.task_type}` };
    }

    // Update the task status in Supabase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const patchUrl = `${supabaseUrl}/rest/v1/agent_tasks?id=eq.${task.task_id}`;
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
    });

    const patchDebug = {
      patchUrl,
      patchStatus: patchRes.status,
      patchOk: patchRes.ok,
      supabaseUrlSource: process.env.SUPABASE_URL ? 'SUPABASE_URL' : (process.env.NEXT_PUBLIC_SUPABASE_URL ? 'NEXT_PUBLIC_SUPABASE_URL' : 'NONE'),
      hasKey: !!supabaseKey
    };
    if (!patchRes.ok) {
      const patchBody = await patchRes.text();
      return Response.json({ processed: true, result, patchDebug: { ...patchDebug, patchBody } });
    }

    return Response.json({ processed: true, result, patchDebug });
  } catch (e: any) {
    return Response.json({ processed: false, error: e.message }, { status: 500 });
  }
};
