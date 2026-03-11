import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const TASK_PROCESSOR_SECRET = Deno.env.get('TASK_PROCESSOR_SECRET')!
const PROCESS_TASK_URL = Deno.env.get('PROCESS_TASK_URL')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const MAX_TASKS_PER_RUN = 3
const STALE_THRESHOLD_MINUTES = 5
const MAX_RETRIES = 3

Deno.serve(async (req) => {
  try {
    // 1. Reset stale in_progress tasks (stuck longer than 5 minutes)
    const staleTime = new Date(Date.now() - STALE_THRESHOLD_MINUTES * 60 * 1000).toISOString()

    const { data: staleTasks } = await supabase
      .from('agent_tasks')
      .select('id, metadata')
      .eq('status', 'in_progress')
      .lt('updated_at', staleTime)

    if (staleTasks && staleTasks.length > 0) {
      for (const task of staleTasks) {
        const retries = (task.metadata?.retries || 0) + 1
        if (retries >= MAX_RETRIES) {
          await supabase.from('agent_tasks').update({
            status: 'failed',
            result: { error: 'Max retries exceeded' },
            updated_at: new Date().toISOString()
          }).eq('id', task.id)
        } else {
          await supabase.from('agent_tasks').update({
            status: 'pending',
            metadata: { ...task.metadata, retries },
            updated_at: new Date().toISOString()
          }).eq('id', task.id)
        }
      }
    }

    // 2. Claim up to 3 pending tasks (priority order, oldest first)
    const { data: pendingTasks, error: fetchError } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(MAX_TASKS_PER_RUN)

    if (fetchError || !pendingTasks || pendingTasks.length === 0) {
      return new Response(JSON.stringify({
        message: 'No pending tasks',
        stale_reset: staleTasks?.length || 0
      }), { headers: { 'Content-Type': 'application/json' } })
    }

    const results = []

    for (const task of pendingTasks) {
      // Claim the task
      await supabase.from('agent_tasks').update({
        status: 'in_progress',
        updated_at: new Date().toISOString()
      }).eq('id', task.id)

      // Check for duplicates (same question already completed)
      if (task.task_type === 'knowledge_gap') {
        const { data: existing } = await supabase
          .from('agent_tasks')
          .select('id, result')
          .eq('task_type', 'knowledge_gap')
          .eq('status', 'complete')
          .limit(50)

        const isDuplicate = existing?.some(e => {
          const existingQ = e.result?.payload?.question || e.result?.content?.substring(0, 100)
          const currentQ = task.payload?.question
          return existingQ && currentQ && existingQ.toLowerCase() === currentQ.toLowerCase()
        })

        if (isDuplicate) {
          await supabase.from('agent_tasks').update({
            status: 'complete',
            result: { deduplicated: true, note: 'Similar question already processed' },
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }).eq('id', task.id)
          results.push({ id: task.id, status: 'deduplicated' })
          continue
        }
      }

      // Route to process-task.mts
      try {
        const response = await fetch(PROCESS_TASK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TASK_PROCESSOR_SECRET}`
          },
          body: JSON.stringify({
            task_id: task.id,
            task_type: task.task_type,
            payload: task.payload,
            priority: task.priority
          })
        })

        const result = await response.json()
        results.push({ id: task.id, status: result.processed ? 'complete' : 'failed', result })
      } catch (e) {
        // Process-task call failed — reset to pending for retry
        await supabase.from('agent_tasks').update({
          status: 'pending',
          metadata: { ...task.metadata, retries: (task.metadata?.retries || 0) + 1, last_error: e.message },
          updated_at: new Date().toISOString()
        }).eq('id', task.id)
        results.push({ id: task.id, status: 'retry', error: e.message })
      }
    }

    // 3. Write heartbeat
    await supabase.from('agent_tasks').insert({
      source: 'system',
      task_type: 'feedback',
      payload: {
        type: 'heartbeat',
        tasks_processed: results.length,
        pending_remaining: pendingTasks.length - results.length,
        timestamp: new Date().toISOString()
      },
      status: 'complete',
      priority: 'low',
      completed_at: new Date().toISOString()
    })

    return new Response(JSON.stringify({
      processed: results.length,
      results
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
