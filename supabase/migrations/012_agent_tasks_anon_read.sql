ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_completed_research" ON agent_tasks
  FOR SELECT TO anon
  USING (task_type = 'knowledge_gap' AND status = 'complete');

CREATE POLICY "service_role_full_access" ON agent_tasks
  FOR ALL TO service_role
  USING (true);
