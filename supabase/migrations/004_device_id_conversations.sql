-- Add device_id to isolate conversation history per device
ALTER TABLE external_agent_conversations
  ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Index for fast per-device queries
CREATE INDEX IF NOT EXISTS idx_ext_conv_device_id ON external_agent_conversations(device_id);
