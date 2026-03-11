-- Enable RLS on intelligence_documents if not already enabled
ALTER TABLE intelligence_documents ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads of auto-research content only
CREATE POLICY "anon_read_auto_research" ON intelligence_documents
  FOR SELECT
  TO anon
  USING (track = 'auto-research' AND processing_status = 'verified');

-- Ensure existing authenticated access still works
CREATE POLICY "authenticated_full_read" ON intelligence_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role bypasses RLS automatically, no policy needed
