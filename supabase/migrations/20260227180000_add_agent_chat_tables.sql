-- Agent Chat tables for cross-machine agent communication
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS agent_chat_threads (
  id BIGSERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  thread_id BIGINT NOT NULL REFERENCES agent_chat_threads(id),
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_chat_messages_thread ON agent_chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_agent_chat_messages_created ON agent_chat_messages(created_at);

-- RLS enabled but open policies (agent-only data, no user data)
ALTER TABLE agent_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agent_chat_threads' AND policyname='agent_chat_threads_all') THEN
    CREATE POLICY agent_chat_threads_all ON agent_chat_threads FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agent_chat_messages' AND policyname='agent_chat_messages_all') THEN
    CREATE POLICY agent_chat_messages_all ON agent_chat_messages FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
