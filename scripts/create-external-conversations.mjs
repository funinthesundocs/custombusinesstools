import { config } from 'dotenv';
config();
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Create table using raw SQL via Supabase's pg_net or direct insert
// Since we can't run DDL through REST API, we'll check if agent_conversations exists
// and create external_agent_conversations with the same structure

const { data, error } = await supabase.rpc('match_intelligence', {
  query_embedding: Array(1536).fill(0),
  match_threshold: 0.99,
  match_count: 1,
})

if (error) {
  console.log('RPC test:', error.message)
} else {
  console.log('RPC works, got', data?.length, 'results')
}

console.log('\n⚠️  Cannot create tables via REST API.')
console.log('Please run this SQL in the Supabase SQL Editor:\n')
console.log(`
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
`)
