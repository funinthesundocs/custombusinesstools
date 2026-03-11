-- Add 'pending_review' to intelligence_documents processing_status constraint
ALTER TABLE intelligence_documents DROP CONSTRAINT intelligence_documents_processing_status_check;
ALTER TABLE intelligence_documents ADD CONSTRAINT intelligence_documents_processing_status_check
  CHECK (processing_status IN ('raw', 'processed', 'verified', 'flagged', 'pending_review'));
