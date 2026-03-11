-- Add 'auto-research' to intelligence_documents track constraint
ALTER TABLE intelligence_documents DROP CONSTRAINT intelligence_documents_track_check;
ALTER TABLE intelligence_documents ADD CONSTRAINT intelligence_documents_track_check
  CHECK (track IN ('target', 'source', 'regulatory', 'competitive', 'cultural', 'auto-research'));
