-- Migration: rename 'nugget' to 'agent' in agent_tasks source constraint
-- The KOP template renamed the NuggetStatus component to AgentStatus and
-- updated all source values from 'nugget' to 'agent'.

-- Drop old constraint first (so UPDATE isn't blocked)
ALTER TABLE agent_tasks
  DROP CONSTRAINT IF EXISTS agent_tasks_source_check;

-- Migrate existing rows
UPDATE agent_tasks SET source = 'agent' WHERE source = 'nugget';

-- Add new constraint
ALTER TABLE agent_tasks
  ADD CONSTRAINT agent_tasks_source_check
  CHECK (source IN ('agent', 'dashboard', 'system'));
