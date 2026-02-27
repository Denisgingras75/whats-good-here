# Agent Phone v3 — Unified Communication System

**Date:** 2026-02-27
**Status:** Approved
**Approach:** Supabase-First Consolidation

## Problem

Three overlapping agent communication systems (GitHub Issues phone, local SQLite MCP, Supabase hotline v2) that don't talk to each other. Cold-start problem where new sessions lose context from previous sessions. Auto-broadcasts flooding GitHub with noise (30+ issues/day). Dan's Claude is connected but the systems aren't unified.

## Goals

1. **Real-time agent-to-agent messaging** — phone calls between any two agents or group calls with humans
2. **Cold-start fix** — voicemail system so every session starts with rich context from the last one
3. **Same-machine + cross-machine** — two local sessions or Denis + Dan's machines, same system
4. **Self-registration** — agents assign their own phone numbers, no manual config
5. **Kill the noise** — digest-based broadcasts instead of per-file GitHub issues
6. **One system** — everything through Supabase, nothing else

## What Gets Killed

- **Local SQLite chat.db** — replaced by Supabase `messages` table
- **GitHub Issues as messaging transport** — no more `auto-broadcast` issues. Repo becomes archival.
- **hotline.sh v1** (GitHub-based meetings/presence) — replaced by v2
- **check-phone.sh polling GitHub** — rewired to poll Supabase

## What Gets Kept & Upgraded

- **hotline-v2.sh** → add `call`, `voicemail`, `presence`, `register` commands
- **agent-chat MCP server** → rewrite from SQLite to Supabase REST. Same tools + new ones.
- **chat.html browser UI** → upgrade for calls, voicemails, presence
- **launchd daemon** → rewire to poll Supabase instead of GitHub
- **auto-broadcast.sh** → batch digests to Supabase instead of individual GitHub issues

## Schema

All tables in Denis's existing Supabase project (`vpioftosgdkyiwvhxewy`).

```sql
-- Agent/human registry with self-registration
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,              -- 'MV-001', 'MV-002', 'denis', 'dan'
  label TEXT,                       -- 'Denis''s Claude', 'Dan''s Claude'
  type TEXT NOT NULL,               -- 'agent' | 'human'
  status TEXT DEFAULT 'offline',    -- 'online' | 'offline'
  last_seen TIMESTAMPTZ,
  session_context JSONB             -- what this agent is currently working on
);

-- All communication: texts, broadcasts, call messages
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  channel TEXT NOT NULL,             -- 'general', 'wgh', 'call:<id>', 'voicemail:MV-001'
  sender TEXT REFERENCES agents(id),
  content TEXT,
  metadata JSONB,                    -- { type: 'text'|'broadcast'|'voicemail'|'call-start'|'call-end' }
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Structured context dumps from dying sessions
CREATE TABLE IF NOT EXISTS voicemails (
  id BIGSERIAL PRIMARY KEY,
  from_agent TEXT REFERENCES agents(id),
  to_agent TEXT REFERENCES agents(id),  -- NULL = broadcast to all
  subject TEXT,                          -- 'Session handoff: Agent phone redesign'
  context JSONB,                         -- { working_on, decisions_made, files_touched, blockers, next_steps, open_questions, emotional_context }
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Active calls (short-lived)
CREATE TABLE IF NOT EXISTS calls (
  id TEXT PRIMARY KEY,               -- random ID
  started_by TEXT REFERENCES agents(id),
  participants TEXT[],               -- ['MV-001', 'MV-002', 'denis']
  status TEXT DEFAULT 'active',      -- 'active' | 'ended'
  channel TEXT,                      -- 'call:<id>' — messages go here
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- RLS: wide open (internal team, 4 people)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voicemails ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agents_read" ON agents FOR SELECT USING (true);
CREATE POLICY "agents_write" ON agents FOR INSERT WITH CHECK (true);
CREATE POLICY "agents_update" ON agents FOR UPDATE USING (true);
CREATE POLICY "messages_read" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_write" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "voicemails_read" ON voicemails FOR SELECT USING (true);
CREATE POLICY "voicemails_write" ON voicemails FOR INSERT WITH CHECK (true);
CREATE POLICY "voicemails_update" ON voicemails FOR UPDATE USING (true);
CREATE POLICY "calls_read" ON calls FOR SELECT USING (true);
CREATE POLICY "calls_write" ON calls FOR INSERT WITH CHECK (true);
CREATE POLICY "calls_update" ON calls FOR UPDATE USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE voicemails;
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE calls;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voicemails_to ON voicemails(to_agent, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status, started_at DESC);
```

## Self-Registration

Agents assign their own phone numbers on first boot:

1. SessionStart hook checks for `~/.claude/scripts/.my-phone-number`
2. If missing, agent registers: `INSERT INTO agents ... ON CONFLICT DO UPDATE SET status = 'online'`
3. Saves phone number locally. All future sessions reuse it.
4. Multiple sessions on same machine share the phone number — each gets a session suffix internally (MV-001:abc, MV-001:def). Calls to MV-001 ring both.

Humans pick a name in the browser UI. No registration required.

## Voicemail System (Cold-Start Fix)

### Session Ending

`/end-session` skill writes a voicemail to Supabase:

```json
{
  "from_agent": "MV-001",
  "to_agent": null,
  "subject": "Session handoff: Agent phone redesign",
  "context": {
    "working_on": "Designing unified agent communication system",
    "decisions_made": ["Kill GitHub Issues transport", "Supabase is single transport"],
    "files_touched": ["schema.sql", "hotline-v2.sh", "server.js"],
    "blockers": [],
    "next_steps": ["Build migration SQL", "Rewire MCP server"],
    "open_questions": ["Broadcast digest interval?"],
    "emotional_context": "Denis energized, full plan approved"
  }
}
```

### Session Starting

1. SessionStart hook calls `hotline-v2.sh voicemail check`
2. Unread voicemails injected as `additionalContext`
3. Agent reads them, marks as read, starts with full context

### Fallback (Denis forgets /end-session)

`session-end.sh` hook writes a minimal voicemail:
- Last 5 files edited (from git diff)
- Current branch
- TODO.md contents
- Flagged as `minimal: true` so next session knows context is thin

### Session History

`hotline-v2.sh voicemail history` returns all past voicemails — like scrolling through a call log.

## Phone Calls

### Starting a Call

`hotline-v2.sh call start --with MV-002` or via browser UI:
1. Creates row in `calls` table (status: active, channel: `call:<random-id>`)
2. Posts system message to the channel
3. Other party notified via PreToolUse hook or Realtime in browser

### During a Call

Messages go to `messages` table with `channel = 'call:<id>'`:
- Agents: via PreToolUse hook polling (10-30s during active calls)
- Browser: via Supabase Realtime (instant)

### Group Calls

Same mechanic, more participants: `hotline-v2.sh call start --with MV-002,denis,dan`

### Ending a Call

`hotline-v2.sh call end` → marks call ended, posts system message. Channel persists as transcript.

### Limitation

Agent-side is polling (10-30s), not instant. Browser UI is truly real-time. This is a constraint of Claude Code's hook architecture — no way to interrupt a running agent.

## Auto-Broadcasts (Noise Fix)

### Digest Model

Instead of one GitHub issue per file edit:
1. `auto-broadcast.sh` on file edit → appends to `~/.claude/scripts/.broadcast-queue`
2. Every 10 minutes (or session end) → flushes queue as single digest message to Supabase
3. Duplicate files within window appear once
4. Schema/migration changes bypass digest — fire immediately (these matter for coordination)

### Example Digest

```
[MV-001 broadcast] Last 10 min: edited schema.sql, jitterApi.js,
usePurityTracker.js (3 files — schema, api, hook)
```

One row in `messages` with `metadata.type = 'broadcast'`, not 30 GitHub issues.

## MCP Server Rewrite

Same 5 existing tools, backend swapped from SQLite to Supabase REST:

| Tool | Change |
|------|--------|
| `send_message` | POST to Supabase REST instead of SQLite INSERT |
| `read_thread` | GET filtered by channel instead of SQLite SELECT |
| `list_threads` | GET distinct channels |
| `check_messages` | GET since timestamp |
| `search_messages` | `ilike` filter on Supabase REST |

New tools added:

| Tool | Purpose |
|------|---------|
| `start_call` | Create a call, notify participants |
| `join_call` | Join an active call |
| `end_call` | End a call |
| `leave_voicemail` | Write structured context to voicemails table |
| `check_voicemail` | Read unread voicemails, mark as read |
| `set_presence` | Update online/offline status |

Server uses `fetch()` instead of `better-sqlite3`. No new dependencies. Both machines point to same Supabase.

## Hook Changes

| Hook | Current | New |
|------|---------|-----|
| SessionStart | `check-phone.sh` (GitHub) + `hotline.sh online` | `hotline-v2.sh register` + `hotline-v2.sh voicemail check` |
| PreToolUse | `hotline-notify.sh` (GitHub polling) | `hotline-v2.sh check` (Supabase polling) |
| PostToolUse | `auto-broadcast.sh` → GitHub issue | `auto-broadcast.sh` → local queue, flush to Supabase |
| SessionEnd | `hotline.sh offline` + `session-end.sh` | `hotline-v2.sh offline` + voicemail write |

## Build Order

| # | Component | Effort | Impact |
|---|-----------|--------|--------|
| 1 | Supabase migration (new tables) | Small | Foundation |
| 2 | Voicemail system (end-session + SessionStart) | Medium | **Highest ROI** |
| 3 | MCP server rewrite (SQLite → Supabase) | Medium | Cross-machine + real-time |
| 4 | hotline-v2.sh upgrades (call, voicemail, presence, register) | Medium | CLI backbone |
| 5 | Hook rewiring (kill GitHub, point to Supabase) | Small | Eliminates noise |
| 6 | Browser UI upgrade | Small | Human access |
| 7 | Kill deprecated systems | Small | Reduces complexity |

## Cost

$0. All within Supabase free tier. The agent communication tables are tiny — a few thousand rows at most.

## Migration Path

1. Build new tables alongside existing `hotline` table (no breaking change)
2. Migrate existing hotline messages to new `messages` table
3. Rewire MCP + hooks one at a time
4. Once everything works on Supabase, stop creating GitHub issues
5. Close all open auto-broadcast issues on the GitHub repo
6. Keep GitHub repo as archive only
