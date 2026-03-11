CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sender_name TEXT DEFAULT 'Team Member',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_conversations_deal ON agent_conversations(deal_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_created ON agent_conversations(created_at DESC);

ALTER TABLE agent_conversations DISABLE ROW LEVEL SECURITY;

ALTER PUBLICATION supabase_realtime ADD TABLE agent_conversations;
