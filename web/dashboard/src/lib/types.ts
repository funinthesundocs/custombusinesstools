export interface Deal {
  id: string
  name: string
  source_entity: string
  target_entity: string
  target_person: string | null
  status: 'active' | 'closed' | 'paused'
  deal_config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface PhaseProgress {
  id: string
  deal_id: string
  phase_number: number
  phase_name: string
  status: 'not_started' | 'in_progress' | 'blocked' | 'complete'
  started_at: string | null
  completed_at: string | null
  notes: string | null
}

export interface ActivityLog {
  id: string
  deal_id: string
  event_type: string
  title: string
  detail: string | null
  source: string | null
  severity: 'info' | 'warning' | 'error' | 'success'
  created_at: string
}

export interface DocumentInventory {
  id: string
  deal_id: string
  filename: string
  file_type: string
  file_path: string
  pipeline: string | null
  processing_status: 'queued' | 'processing' | 'processed' | 'verified' | 'flagged' | 'error'
  processing_engine: string | null
  confidence_score: number | null
  error_message: string | null
  created_at: string
  processed_at: string | null
}

export interface DeliverableVersion {
  id: string
  deal_id: string
  deliverable_type: string
  version_number: number
  production_engine: string
  prompt_used: string | null
  file_path: string | null
  evaluation_notes: string | null
  status: 'draft' | 'review' | 'approved' | 'superseded'
  created_at: string
}

export interface EntityProfile {
  id: string
  deal_id: string
  entity_name: string
  entity_type: 'person' | 'company' | 'organization' | 'government_body'
  profile_data: Record<string, unknown>
  relationship_to_deal: string | null
  intelligence_track: string
  created_at: string
  updated_at: string
}

export interface Objection {
  id: string
  deal_id: string
  objection: string
  severity: 'critical' | 'significant' | 'minor'
  category: 'financial' | 'regulatory' | 'operational' | 'reputational' | 'trust' | 'technical'
  likely_source: string | null
  response: string
  supporting_evidence: string[]
  addressed_in_presentation: boolean
  narrative_position: string | null
  created_at: string
}

export interface IntelligenceDocument {
  id: string
  deal_id: string
  content: string
  track: 'target' | 'source' | 'regulatory' | 'competitive' | 'cultural'
  category: string
  document_type: string
  source_file: string | null
  narrative_position: string | null
  deliverable_relevance: string[]
  confidence_level: 'high' | 'medium' | 'low' | 'unverified'
  verified: boolean
  processing_status: 'raw' | 'processed' | 'verified' | 'flagged'
  created_at: string
}
