-- Drop existing function first since return type is changing
DROP FUNCTION IF EXISTS match_intelligence(VECTOR(1536), FLOAT, INT, UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION match_intelligence(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  filter_deal_id UUID DEFAULT NULL,
  filter_track TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID, content TEXT, track TEXT, category TEXT,
  narrative_position TEXT, confidence_level TEXT, similarity FLOAT, created_at TIMESTAMPTZ
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.content, d.track, d.category,
    d.narrative_position, d.confidence_level,
    1 - (d.embedding <=> query_embedding) AS similarity,
    d.created_at
  FROM intelligence_documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
    AND (filter_deal_id IS NULL OR d.deal_id = filter_deal_id)
    AND (filter_track IS NULL OR d.track = filter_track)
    AND (filter_category IS NULL OR d.category = filter_category)
    AND (d.processing_status IS NULL OR d.processing_status != 'pending_review')
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END; $$;
