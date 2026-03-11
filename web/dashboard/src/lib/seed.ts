import { createServerClient } from './supabase'

const PHASE_NAMES = [
  'Research & Intelligence',
  'Document Collection',
  'Document Processing',
  'Intelligence Synthesis',
  'Context Engineering',
  'Production',
  'Verification',
  'Presentation Build',
  'Final Review',
  'Meeting Ready'
]

export async function seedDatabase() {
  const supabase = createServerClient()

  // Check if deal already exists
  const { data: existing } = await supabase
    .from('deals')
    .select('id')
    .eq('name', 'GMC × Aboitiz Construction')
    .limit(1)

  if (existing && existing.length > 0) {
    return existing[0].id
  }

  // Create the deal
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .insert({
      name: 'GMC × Aboitiz Construction',
      source_entity: 'Genluiching Mining Corporation',
      target_entity: 'Aboitiz Construction',
      target_person: 'Sabina Aboitiz',
      status: 'active',
      deal_config: {
        type: 'strategic_partnership',
        scale: 'multi_billion',
        meeting_format: 'physical',
        location: 'Southern Philippines'
      }
    })
    .select('id')
    .single()

  if (dealError) throw dealError

  // Create 10 phases
  const phases = PHASE_NAMES.map((name, i) => ({
    deal_id: deal.id,
    phase_number: i + 1,
    phase_name: name,
    status: i === 0 ? 'in_progress' : 'not_started',
    started_at: i === 0 ? new Date().toISOString() : null,
  }))

  const { error: phaseError } = await supabase
    .from('phase_progress')
    .insert(phases)

  if (phaseError) throw phaseError

  // Log initial activity
  await supabase.from('activity_log').insert({
    deal_id: deal.id,
    event_type: 'system',
    title: 'KOP Dashboard initialized',
    detail: 'Deal record created. Phase 1: Research & Intelligence started.',
    source: 'system',
    severity: 'success'
  })

  return deal.id
}
