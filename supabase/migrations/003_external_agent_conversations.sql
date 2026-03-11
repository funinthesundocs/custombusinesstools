-- External-facing AI chat conversations (public website)
CREATE TABLE IF NOT EXISTS external_agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sender_name TEXT DEFAULT 'Visitor',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE external_agent_conversations;

-- Allow anon access (public-facing chat)
ALTER TABLE external_agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon" ON external_agent_conversations
  FOR ALL USING (true) WITH CHECK (true);
