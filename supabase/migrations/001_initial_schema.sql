-- KOP Initial Schema
-- Run this migration after connecting to your Supabase project

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ═══════════════════════════════════════
-- CORE TABLES
-- ═══════════════════════════════════════

-- Deal/project tracking (multi-deal support)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_entity TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_person TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'paused')),
  deal_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intelligence documents: chunked, embedded, tagged
CREATE TABLE intelligence_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  track TEXT NOT NULL CHECK (track IN ('target', 'source', 'regulatory', 'competitive', 'cultural')),
  category TEXT NOT NULL,
  document_type TEXT NOT NULL,
  source_file TEXT,
  narrative_position TEXT,
  deliverable_relevance TEXT[],
  confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('high', 'medium', 'low', 'unverified')),
  verified BOOLEAN DEFAULT FALSE,
  verification_source TEXT,
  verification_model TEXT,
  processing_pipeline TEXT,
  processing_status TEXT DEFAULT 'raw' CHECK (processing_status IN ('raw', 'processed', 'verified', 'flagged')),
  processing_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Entity profiles (people, companies, organizations)
CREATE TABLE entity_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'company', 'organization', 'government_body')),
  profile_data JSONB NOT NULL DEFAULT '{}',
  relationship_to_deal TEXT,
  intelligence_track TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Objection register (Red Team outputs)
CREATE TABLE objection_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  objection TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('critical', 'significant', 'minor')),
  category TEXT CHECK (category IN ('financial', 'regulatory', 'operational', 'reputational', 'trust', 'technical')),
  likely_source TEXT,
  response TEXT NOT NULL,
  supporting_evidence TEXT[],
  addressed_in_presentation BOOLEAN DEFAULT FALSE,
  narrative_position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- PRODUCTION TABLES
-- ═══════════════════════════════════════

-- Deliverable version tracking
CREATE TABLE deliverable_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  deliverable_type TEXT NOT NULL,
  version_number INT NOT NULL,
  production_engine TEXT NOT NULL,
  prompt_used TEXT,
  file_path TEXT,
  evaluation_notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'superseded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Production routing decision log
CREATE TABLE production_routing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  deliverable_type TEXT NOT NULL,
  selected_engine TEXT NOT NULL,
  routing_rationale TEXT NOT NULL,
  alternative_considered TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- DASHBOARD TABLES
-- ═══════════════════════════════════════

-- Activity log (dashboard feed)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  source TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase progress tracking
CREATE TABLE phase_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  phase_number INT NOT NULL CHECK (phase_number BETWEEN 1 AND 10),
  phase_name TEXT NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'blocked', 'complete')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- Document inventory
CREATE TABLE document_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  pipeline TEXT,
  processing_status TEXT DEFAULT 'queued' CHECK (processing_status IN ('queued', 'processing', 'processed', 'verified', 'flagged', 'error')),
  processing_engine TEXT,
  confidence_score FLOAT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════

CREATE INDEX idx_intelligence_deal ON intelligence_documents(deal_id);
CREATE INDEX idx_intelligence_track ON intelligence_documents(track);
CREATE INDEX idx_intelligence_status ON intelligence_documents(processing_status);
CREATE INDEX idx_activity_deal ON activity_log(deal_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);
CREATE INDEX idx_phase_deal ON phase_progress(deal_id);
CREATE INDEX idx_documents_deal ON document_inventory(deal_id);
CREATE INDEX idx_documents_status ON document_inventory(processing_status);
CREATE INDEX idx_deliverables_deal ON deliverable_versions(deal_id);
CREATE INDEX idx_objections_deal ON objection_register(deal_id);

-- Vector similarity search index (create after initial data load for better performance)
-- CREATE INDEX idx_intelligence_embedding ON intelligence_documents
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ═══════════════════════════════════════
-- VECTOR SEARCH FUNCTION
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION match_intelligence(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  filter_deal_id UUID DEFAULT NULL,
  filter_track TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  track TEXT,
  category TEXT,
  narrative_position TEXT,
  confidence_level TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id, d.content, d.track, d.category,
    d.narrative_position, d.confidence_level,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM intelligence_documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
    AND (filter_deal_id IS NULL OR d.deal_id = filter_deal_id)
    AND (filter_track IS NULL OR d.track = filter_track)
    AND (filter_category IS NULL OR d.category = filter_category)
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ═══════════════════════════════════════
-- RLS: DISABLED FOR DEVELOPMENT
-- (Single-user local tool — no auth needed)
-- ═══════════════════════════════════════

ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE entity_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE objection_register DISABLE ROW LEVEL SECURITY;
ALTER TABLE deliverable_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE production_routing_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE phase_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_inventory DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════
-- ENABLE REALTIME
-- ═══════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE phase_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE document_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE deliverable_versions;

-- ═══════════════════════════════════════
-- SEED: Initialize phases for current deal
-- ═══════════════════════════════════════

-- This will be populated by the dashboard on first launch
-- with a deal record and 10 phase records
