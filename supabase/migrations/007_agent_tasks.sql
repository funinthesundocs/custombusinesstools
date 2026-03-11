CREATE TABLE agent_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID,
  conversation_id UUID,
  source TEXT NOT NULL CHECK (source IN ('nugget', 'dashboard', 'system')),
  task_type TEXT NOT NULL CHECK (task_type IN ('knowledge_gap', 'content_update', 'document_request', 'escalation', 'feedback')),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'complete', 'failed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  result JSONB
);

CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_priority ON agent_tasks(priority);
CREATE INDEX idx_agent_tasks_created ON agent_tasks(created_at DESC);
CREATE INDEX idx_agent_tasks_type ON agent_tasks(task_type);
