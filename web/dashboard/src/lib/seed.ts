import { createServerClient } from './supabase'
import config from './siteConfig'

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
    .eq('name', config.company.name)
    .limit(1)

  if (existing && existing.length > 0) {
    return existing[0].id
  }

  // Create the deal
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .insert({
      name: config.company.name,
      source_entity: config.company.name,
      target_entity: '[Configure target entity in deal.md]',
      target_person: '[Configure target person in deal.md]',
      status: 'active',
      deal_config: {
        type: 'strategic_partnership',
        scale: '[Configure in deal.md]',
        meeting_format: 'physical',
        location: '[Configure in deal.md]'
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
    title: 'RAG Factory Dashboard initialized',
    detail: 'Deal record created. Phase 1: Research & Intelligence started.',
    source: 'system',
    severity: 'success'
  })

  return deal.id
}
