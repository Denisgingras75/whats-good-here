# Agent Phone v3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate 3 overlapping agent communication systems into one Supabase-backed system with voicemail, phone calls, and self-registration.

**Architecture:** Everything goes through Supabase PostgREST. The MCP server (Node.js) gives Claude tools. The hotline-v2.sh gives shell/hook access. The browser UI gives human access. All hit the same tables.

**Tech Stack:** Supabase (PostgreSQL + Realtime), Node.js MCP server (@modelcontextprotocol/sdk + @supabase/supabase-js), bash scripts (curl to PostgREST), HTML/JS browser UI (Supabase JS client).

**Design doc:** `docs/plans/2026-02-27-agent-phone-v3-design.md`

---

## Current State

Three separate systems to consolidate:

1. **MCP server** (`~/.claude/mcp-servers/agent-chat/server.js`) — already Supabase, uses `agent_chat_threads` + `agent_chat_messages` tables. 5 tools: send_message, read_thread, list_threads, check_messages, search_messages.

2. **Hotline v2** (`~/.claude/scripts/hotline-v2.sh`) — Supabase, uses `hotline` table. Commands: say, read, check, rooms.

3. **GitHub Phone** (`check-phone.sh`, `hotline.sh`, `auto-broadcast.sh`) — GitHub Issues. Being killed.

**Supabase project:** `vpioftosgdkyiwvhxewy.supabase.co`
**Supabase key:** `sb_publishable_2Y0BXs8NAWNmRQk69qTqjQ_CBVVKQNt` (publishable, in existing scripts)

---

### Task 1: Create New Supabase Tables

**Files:**
- Create: `~/.claude/hotline/migration-v3.sql`

**Step 1: Write the migration SQL**

```sql
-- Agent Phone v3 — Unified Communication
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Agent registry with self-registration
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  label TEXT,
  type TEXT NOT NULL DEFAULT 'agent',
  status TEXT DEFAULT 'offline',
  last_seen TIMESTAMPTZ,
  session_context JSONB
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agents_read" ON agents FOR SELECT USING (true);
CREATE POLICY "agents_write" ON agents FOR INSERT WITH CHECK (true);
CREATE POLICY "agents_update" ON agents FOR UPDATE USING (true);

-- 2. Unified messages (replaces hotline + agent_chat_messages)
CREATE TABLE IF NOT EXISTS phone_messages (
  id BIGSERIAL PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'general',
  sender TEXT REFERENCES agents(id),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE phone_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "phone_messages_read" ON phone_messages FOR SELECT USING (true);
CREATE POLICY "phone_messages_write" ON phone_messages FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_phone_messages_channel ON phone_messages(channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_phone_messages_sender ON phone_messages(sender, created_at DESC);

-- 3. Voicemails (cold-start context dumps)
CREATE TABLE IF NOT EXISTS voicemails (
  id BIGSERIAL PRIMARY KEY,
  from_agent TEXT REFERENCES agents(id),
  to_agent TEXT,
  subject TEXT,
  context JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE voicemails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "voicemails_read" ON voicemails FOR SELECT USING (true);
CREATE POLICY "voicemails_write" ON voicemails FOR INSERT WITH CHECK (true);
CREATE POLICY "voicemails_update" ON voicemails FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_voicemails_to ON voicemails(to_agent, read, created_at DESC);

-- 4. Calls (active phone calls / meetings)
CREATE TABLE IF NOT EXISTS calls (
  id TEXT PRIMARY KEY,
  started_by TEXT REFERENCES agents(id),
  participants TEXT[],
  status TEXT DEFAULT 'active',
  channel TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calls_read" ON calls FOR SELECT USING (true);
CREATE POLICY "calls_write" ON calls FOR INSERT WITH CHECK (true);
CREATE POLICY "calls_update" ON calls FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status, started_at DESC);

-- 5. Enable Realtime on new tables
ALTER PUBLICATION supabase_realtime ADD TABLE phone_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE voicemails;
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE calls;

-- 6. Seed initial agents
INSERT INTO agents (id, label, type, status) VALUES
  ('MV-001', 'Denis''s Claude', 'agent', 'offline'),
  ('MV-002', 'Dan''s Claude', 'agent', 'offline'),
  ('denis', 'Denis', 'human', 'offline'),
  ('dan', 'Dan', 'human', 'offline')
ON CONFLICT (id) DO NOTHING;
```

**Step 2: Run in Supabase SQL Editor**

Go to https://supabase.com/dashboard → project `vpioftosgdkyiwvhxewy` → SQL Editor → New Query → paste and run.

**Step 3: Verify tables exist**

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('agents', 'phone_messages', 'voicemails', 'calls');
```

Expected: 4 rows returned.

**Step 4: Commit**

```bash
git add ~/.claude/hotline/migration-v3.sql
git commit -m "feat: add Agent Phone v3 migration SQL"
```

---

### Task 2: Upgrade hotline-v2.sh with New Commands

**Files:**
- Modify: `~/.claude/scripts/hotline-v2.sh`

This is the CLI backbone. Add `register`, `voicemail`, `call`, `presence` commands. Switch from `hotline` table to `phone_messages` table.

**Step 1: Rewrite hotline-v2.sh**

Replace the entire file. Key changes:
- All REST calls hit `phone_messages` instead of `hotline`
- `register` command: upserts into `agents` table, saves phone number locally
- `voicemail leave` / `voicemail check` / `voicemail history`: CRUD on `voicemails` table
- `call start` / `call end` / `call list`: CRUD on `calls` table
- `presence online` / `presence offline`: updates `agents` table
- `say` / `read` / `check` / `rooms`: same as before but hit `phone_messages`
- Phone number read from `~/.claude/scripts/.my-phone-number` instead of hardcoded `MV-001`

```bash
#!/bin/bash
# ============================================================
# AGENT PHONE v3 — Supabase Unified Communication
# ============================================================

SUPABASE_URL="https://vpioftosgdkyiwvhxewy.supabase.co"
SUPABASE_KEY="sb_publishable_2Y0BXs8NAWNmRQk69qTqjQ_CBVVKQNt"
STATE_DIR="$HOME/.claude/scripts/.hotline"
PHONE_FILE="$STATE_DIR/my-phone-number"
LABEL_FILE="$STATE_DIR/my-label"
LAST_ID_FILE="$STATE_DIR/last-msg-id"

mkdir -p "$STATE_DIR"

# Load identity (or use defaults for first run)
MY_NUMBER=$(cat "$PHONE_FILE" 2>/dev/null || echo "")
MY_LABEL=$(cat "$LABEL_FILE" 2>/dev/null || echo "")
ROOM="general"

# ---- Supabase Helpers ----

sb_post() {
  local table="$1"
  local payload="$2"
  curl -s -X POST "${SUPABASE_URL}/rest/v1/${table}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$payload"
}

sb_get() {
  local table="$1"
  local query="$2"
  curl -s "${SUPABASE_URL}/rest/v1/${table}?${query}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}"
}

sb_patch() {
  local table="$1"
  local query="$2"
  local payload="$3"
  curl -s -X PATCH "${SUPABASE_URL}/rest/v1/${table}?${query}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$payload"
}

require_identity() {
  if [ -z "$MY_NUMBER" ]; then
    echo "Error: No phone number registered. Run: hotline register <number> <label>"
    echo "Example: hotline register MV-001 \"Denis's Claude\""
    exit 1
  fi
}

# ---- Commands ----

cmd_register() {
  local number="$1"
  local label="$2"
  if [ -z "$number" ] || [ -z "$label" ]; then
    echo "Usage: hotline register <number> <label>"
    echo "Example: hotline register MV-001 \"Denis's Claude\""
    return 1
  fi

  export REG_ID="$number" REG_LABEL="$label"
  local payload=$(python3 << 'PYEOF'
import json, os
print(json.dumps({
    "id": os.environ["REG_ID"],
    "label": os.environ["REG_LABEL"],
    "type": "agent",
    "status": "online",
    "last_seen": __import__('datetime').datetime.utcnow().isoformat() + "Z"
}))
PYEOF
)

  # Upsert: insert or update on conflict
  local result=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/agents" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation,resolution=merge-duplicates" \
    -d "$payload")

  local registered_id=$(echo "$result" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null)
  if [ -n "$registered_id" ]; then
    echo "$number" > "$PHONE_FILE"
    echo "$label" > "$LABEL_FILE"
    MY_NUMBER="$number"
    MY_LABEL="$label"
    echo "Registered as $number ($label). Phone number saved."
  else
    echo "Error registering."
    echo "$result"
  fi
}

cmd_say() {
  require_identity
  local room="$ROOM"
  if [ "$1" = "-r" ]; then
    room="$2"
    shift 2
  fi
  local message="$*"
  [ -z "$message" ] && { echo "Usage: hotline say [-r room] <message>"; return 1; }

  export HL_ROOM="$room" HL_SENDER="$MY_NUMBER" HL_LABEL="$MY_LABEL" HL_MSG="$message"
  local payload=$(python3 << 'PYEOF'
import json, os
print(json.dumps({
    "channel": os.environ.get("HL_ROOM","general"),
    "sender": os.environ.get("HL_SENDER",""),
    "content": os.environ.get("HL_MSG",""),
    "metadata": {"type": "text", "sender_label": os.environ.get("HL_LABEL","")}
}))
PYEOF
)

  local result=$(sb_post "phone_messages" "$payload")
  local msg_id=$(echo "$result" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null)
  [ -n "$msg_id" ] && echo "[$room] Sent." || { echo "Error sending."; echo "$result"; }
}

cmd_read() {
  local limit="${1:-10}"
  local room="${2:-$ROOM}"
  local result=$(sb_get "phone_messages" "channel=eq.${room}&order=created_at.desc&limit=${limit}")
  echo "$result" | python3 -c "
import sys, json
msgs = json.load(sys.stdin)
msgs.reverse()
for m in msgs:
    t = m.get('created_at','')[:19].replace('T',' ')
    s = m.get('sender','?')
    label = (m.get('metadata') or {}).get('sender_label', s)
    msg = m.get('content','')
    ch = m.get('channel','general')
    print(f'{t}  [{s}]  {msg}')
" 2>/dev/null
}

cmd_check() {
  require_identity
  local last_id=$(cat "$LAST_ID_FILE" 2>/dev/null || echo "0")
  local result=$(sb_get "phone_messages" "id=gt.${last_id}&order=created_at.asc&limit=20")
  local new_msgs=$(echo "$result" | python3 -c "
import sys, json
msgs = json.load(sys.stdin)
others = [m for m in msgs if m.get('sender') != '$MY_NUMBER']
if not others:
    sys.exit(0)
if msgs:
    print(f'__LAST_ID__:{msgs[-1][\"id\"]}')
for m in others:
    s = m.get('sender','?')
    ch = m.get('channel','general')
    msg = m.get('content','')
    print(f'[{s} in #{ch}] {msg}')
" 2>/dev/null)

  [ -z "$new_msgs" ] && return 0
  local new_last_id=$(echo "$new_msgs" | grep "^__LAST_ID__:" | head -1 | cut -d: -f2)
  [ -n "$new_last_id" ] && echo "$new_last_id" > "$LAST_ID_FILE"
  echo "$new_msgs" | grep -v "^__LAST_ID__:"
}

cmd_presence() {
  require_identity
  local status="$1"
  [ -z "$status" ] && { echo "Usage: hotline presence online|offline"; return 1; }

  export PRES_STATUS="$status"
  local payload=$(python3 << 'PYEOF'
import json, os, datetime
print(json.dumps({
    "status": os.environ["PRES_STATUS"],
    "last_seen": datetime.datetime.utcnow().isoformat() + "Z"
}))
PYEOF
)

  sb_patch "agents" "id=eq.${MY_NUMBER}" "$payload" >/dev/null
  echo "$MY_NUMBER is now $status."
}

cmd_voicemail() {
  local subcmd="$1"
  shift
  case "$subcmd" in
    leave)
      require_identity
      local to_agent="$1"
      local subject="$2"
      local context="$3"
      [ -z "$subject" ] && { echo "Usage: hotline voicemail leave [to_agent|all] <subject> <context_json>"; return 1; }

      export VM_FROM="$MY_NUMBER" VM_TO="$to_agent" VM_SUBJECT="$subject" VM_CONTEXT="$context"
      local payload=$(python3 << 'PYEOF'
import json, os
to = os.environ.get("VM_TO","")
if to == "all" or to == "": to = None
ctx = os.environ.get("VM_CONTEXT","{}")
try:
    ctx_obj = json.loads(ctx)
except:
    ctx_obj = {"raw": ctx}
print(json.dumps({
    "from_agent": os.environ["VM_FROM"],
    "to_agent": to,
    "subject": os.environ["VM_SUBJECT"],
    "context": ctx_obj,
    "read": False
}))
PYEOF
)
      local result=$(sb_post "voicemails" "$payload")
      local vm_id=$(echo "$result" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null)
      [ -n "$vm_id" ] && echo "Voicemail #$vm_id left." || { echo "Error."; echo "$result"; }
      ;;
    check)
      require_identity
      local result=$(sb_get "voicemails" "or=(to_agent.eq.${MY_NUMBER},to_agent.is.null)&read=eq.false&order=created_at.desc&limit=10")
      local count=$(echo "$result" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
      if [ "$count" = "0" ] || [ -z "$count" ]; then
        echo "No new voicemails."
        return 0
      fi
      echo "$result" | python3 -c "
import sys, json
vms = json.load(sys.stdin)
print(f'{len(vms)} unread voicemail(s):')
print()
for v in vms:
    t = v.get('created_at','')[:19].replace('T',' ')
    f = v.get('from_agent','?')
    s = v.get('subject','(no subject)')
    ctx = v.get('context',{})
    print(f'--- Voicemail #{v[\"id\"]} from {f} ({t}) ---')
    print(f'Subject: {s}')
    if isinstance(ctx, dict):
        for k,val in ctx.items():
            if isinstance(val, list):
                val = ', '.join(str(x) for x in val)
            print(f'  {k}: {val}')
    print()
" 2>/dev/null
      ;;
    read-all)
      require_identity
      # Mark all as read
      sb_patch "voicemails" "or=(to_agent.eq.${MY_NUMBER},to_agent.is.null)&read=eq.false" '{"read": true}' >/dev/null
      echo "All voicemails marked as read."
      ;;
    history)
      local limit="${1:-20}"
      local result=$(sb_get "voicemails" "order=created_at.desc&limit=${limit}")
      echo "$result" | python3 -c "
import sys, json
vms = json.load(sys.stdin)
if not vms:
    print('No voicemails.')
    sys.exit(0)
for v in vms:
    t = v.get('created_at','')[:19].replace('T',' ')
    f = v.get('from_agent','?')
    to = v.get('to_agent','all')
    s = v.get('subject','(no subject)')
    read_status = 'read' if v.get('read') else 'UNREAD'
    print(f'#{v[\"id\"]}  {t}  {f}→{to or \"all\"}  [{read_status}]  {s}')
" 2>/dev/null
      ;;
    *)
      echo "Usage: hotline voicemail <leave|check|read-all|history>"
      ;;
  esac
}

cmd_call() {
  local subcmd="$1"
  shift
  case "$subcmd" in
    start)
      require_identity
      local participants=""
      if [ "$1" = "--with" ]; then
        shift
        participants="$1"
      fi
      [ -z "$participants" ] && { echo "Usage: hotline call start --with MV-002[,denis,dan]"; return 1; }

      export CALL_BY="$MY_NUMBER" CALL_PARTS="$participants"
      local payload=$(python3 << 'PYEOF'
import json, os, uuid
call_id = str(uuid.uuid4())[:8]
starter = os.environ["CALL_BY"]
parts = os.environ["CALL_PARTS"].split(",")
all_parts = [starter] + [p.strip() for p in parts]
channel = f"call:{call_id}"
print(json.dumps({
    "id": call_id,
    "started_by": starter,
    "participants": all_parts,
    "status": "active",
    "channel": channel
}))
PYEOF
)
      local result=$(sb_post "calls" "$payload")
      local call_id=$(echo "$result" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null)
      if [ -n "$call_id" ]; then
        echo "$call_id" > "$STATE_DIR/active-call"
        # Post system message to the call channel
        export SYS_CH="call:$call_id" SYS_SENDER="$MY_NUMBER" SYS_LABEL="$MY_LABEL" SYS_PARTS="$participants"
        local sys_payload=$(python3 << 'PYEOF'
import json, os
print(json.dumps({
    "channel": os.environ["SYS_CH"],
    "sender": os.environ["SYS_SENDER"],
    "content": f"{os.environ['SYS_SENDER']} started a call with {os.environ['SYS_PARTS']}",
    "metadata": {"type": "call-start", "sender_label": os.environ.get("SYS_LABEL","")}
}))
PYEOF
)
        sb_post "phone_messages" "$sys_payload" >/dev/null
        echo "Call $call_id started. Channel: call:$call_id"
        echo "Send messages: hotline say -r call:$call_id \"hello\""
      else
        echo "Error starting call."
        echo "$result"
      fi
      ;;
    end)
      require_identity
      local call_id=$(cat "$STATE_DIR/active-call" 2>/dev/null)
      [ -z "$call_id" ] && { echo "No active call."; return 1; }

      export END_SENDER="$MY_NUMBER" END_LABEL="$MY_LABEL" END_CH="call:$call_id"
      sb_patch "calls" "id=eq.${call_id}" "{\"status\":\"ended\",\"ended_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >/dev/null

      local sys_payload=$(python3 << 'PYEOF'
import json, os
print(json.dumps({
    "channel": os.environ["END_CH"],
    "sender": os.environ["END_SENDER"],
    "content": f"{os.environ['END_SENDER']} ended the call.",
    "metadata": {"type": "call-end", "sender_label": os.environ.get("END_LABEL","")}
}))
PYEOF
)
      sb_post "phone_messages" "$sys_payload" >/dev/null
      rm -f "$STATE_DIR/active-call"
      echo "Call $call_id ended."
      ;;
    list)
      local result=$(sb_get "calls" "order=started_at.desc&limit=10")
      echo "$result" | python3 -c "
import sys, json
calls = json.load(sys.stdin)
if not calls:
    print('No calls.')
    sys.exit(0)
for c in calls:
    t = c.get('started_at','')[:19].replace('T',' ')
    status = c.get('status','?')
    by = c.get('started_by','?')
    parts = ', '.join(c.get('participants',[]))
    ch = c.get('channel','')
    icon = 'ACTIVE' if status == 'active' else 'ended'
    print(f'[{icon}] {c[\"id\"]}  {t}  by {by}  participants: {parts}  channel: {ch}')
" 2>/dev/null
      ;;
    *)
      echo "Usage: hotline call <start|end|list>"
      ;;
  esac
}

cmd_rooms() {
  echo "Channels:"
  echo "  general  — Default channel"
  echo "  wgh      — WGH product discussion"
  echo "  schema   — Schema changes & deployments"
  echo "  design   — UI/UX discussion"
  echo "  call:*   — Active call channels"
  echo ""
  echo "Usage: hotline say -r wgh \"message here\""
}

# ---- Router ----

case "${1}" in
  register)  shift; cmd_register "$@" ;;
  say)       shift; cmd_say "$@" ;;
  read)      shift; cmd_read "$@" ;;
  check)     shift; cmd_check "$@" ;;
  presence)  shift; cmd_presence "$@" ;;
  voicemail) shift; cmd_voicemail "$@" ;;
  call)      shift; cmd_call "$@" ;;
  rooms)     cmd_rooms ;;
  *)
    echo "AGENT PHONE v3"
    echo ""
    if [ -n "$MY_NUMBER" ]; then
      echo "  You: $MY_NUMBER ($MY_LABEL)"
    else
      echo "  Not registered. Run: hotline register <number> <label>"
    fi
    echo ""
    echo "Commands:"
    echo "  hotline register <id> <label>     — register your phone number"
    echo "  hotline say [-r channel] <msg>     — send message"
    echo "  hotline read [N] [channel]         — last N messages"
    echo "  hotline check                      — new messages since last check"
    echo "  hotline presence online|offline    — update status"
    echo "  hotline voicemail leave|check|history  — voicemail system"
    echo "  hotline call start|end|list        — phone calls"
    echo "  hotline rooms                      — list channels"
    ;;
esac
```

**Step 2: Verify registration works**

```bash
bash ~/.claude/scripts/hotline-v2.sh register MV-001 "Denis's Claude"
```

Expected: `Registered as MV-001 (Denis's Claude). Phone number saved.`

**Step 3: Verify send/read works**

```bash
bash ~/.claude/scripts/hotline-v2.sh say "Test message from v3"
bash ~/.claude/scripts/hotline-v2.sh read 1
```

Expected: message appears in read output.

**Step 4: Commit**

```bash
git add ~/.claude/scripts/hotline-v2.sh
git commit -m "feat: upgrade hotline-v2.sh to Agent Phone v3 — unified commands"
```

---

### Task 3: Rewrite MCP Server for Unified Tables + New Tools

**Files:**
- Modify: `~/.claude/mcp-servers/agent-chat/server.js`

The MCP server currently uses `agent_chat_threads` and `agent_chat_messages`. Rewrite to use `phone_messages`, `voicemails`, `calls`, `agents`. Add 6 new tools.

**Step 1: Rewrite server.js**

Key changes:
- `send_message`: INSERT into `phone_messages` with channel-based routing (not thread-based)
- `read_thread`: GET from `phone_messages` filtered by channel
- `list_threads`: GET distinct channels from `phone_messages`
- `check_messages`: GET from `phone_messages` since timestamp
- `search_messages`: ilike search on `phone_messages`
- NEW `start_call`: INSERT into `calls`, POST system message
- NEW `join_call`: Update `calls` participants array
- NEW `end_call`: Update call status, POST system message
- NEW `leave_voicemail`: INSERT into `voicemails` with structured context
- NEW `check_voicemail`: GET unread voicemails, mark as read
- NEW `set_presence`: UPDATE `agents` status

```js
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const server = new McpServer({
  name: 'agent-chat',
  version: '3.0.0',
});

// --- Existing tools (rewritten for phone_messages) ---

server.tool(
  'send_message',
  'Send a message to a channel. Creates a new message in the unified phone system.',
  {
    sender: z.string().describe('Your agent ID (e.g. "MV-001")'),
    channel: z.string().optional().default('general').describe('Channel to send to (general, wgh, call:<id>, etc.)'),
    content: z.string().describe('Message content'),
  },
  async ({ sender, channel, content }) => {
    const { data, error } = await supabase
      .from('phone_messages')
      .insert({ channel, sender, content, metadata: { type: 'text' } })
      .select('id')
      .single();
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
    return { content: [{ type: 'text', text: `Sent to #${channel} (msg ${data.id})` }] };
  }
);

server.tool(
  'read_thread',
  'Read messages from a channel.',
  {
    channel: z.string().describe('Channel to read (general, wgh, call:<id>, etc.)'),
    limit: z.number().optional().default(50).describe('Max messages to return'),
  },
  async ({ channel, limit }) => {
    const { data: messages, error } = await supabase
      .from('phone_messages')
      .select('*')
      .eq('channel', channel)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
    if (!messages || messages.length === 0) {
      return { content: [{ type: 'text', text: `No messages in #${channel}` }] };
    }
    const formatted = messages.map(m => {
      const label = m.metadata?.sender_label || m.sender;
      return `[${m.created_at}] ${label} (${m.sender}): ${m.content}`;
    }).join('\n\n');
    return { content: [{ type: 'text', text: `## #${channel} (${messages.length} messages)\n\n${formatted}` }] };
  }
);

server.tool(
  'list_threads',
  'List active channels with recent messages.',
  {
    limit: z.number().optional().default(20).describe('Max channels to return'),
  },
  async ({ limit }) => {
    // Get recent messages grouped by channel
    const { data: messages, error } = await supabase
      .from('phone_messages')
      .select('channel, created_at, sender, content')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };

    const channels = {};
    for (const m of (messages || [])) {
      if (!channels[m.channel]) {
        channels[m.channel] = { count: 0, last: m.created_at, lastMsg: `${m.sender}: ${m.content?.substring(0, 80)}` };
      }
      channels[m.channel].count++;
    }

    const sorted = Object.entries(channels)
      .sort((a, b) => b[1].last.localeCompare(a[1].last))
      .slice(0, limit);

    const formatted = sorted.map(([ch, info]) =>
      `#${ch} | ${info.count} msgs | last: ${info.last} | ${info.lastMsg}`
    ).join('\n');

    return { content: [{ type: 'text', text: `## Channels\n\n${formatted}` }] };
  }
);

server.tool(
  'check_messages',
  'Check for new messages since a given time.',
  {
    since: z.string().optional().describe('ISO datetime. Defaults to last 1 hour.'),
    channel: z.string().optional().describe('Filter by channel. Omit for all channels.'),
  },
  async ({ since, channel }) => {
    const cutoff = since || new Date(Date.now() - 3600000).toISOString();
    let query = supabase
      .from('phone_messages')
      .select('*')
      .gt('created_at', cutoff)
      .order('created_at', { ascending: true });
    if (channel) query = query.eq('channel', channel);

    const { data: messages, error } = await query;
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
    if (!messages || messages.length === 0) {
      return { content: [{ type: 'text', text: `No new messages since ${cutoff}` }] };
    }
    const formatted = messages.map(m =>
      `[#${m.channel}] ${m.sender} (${m.created_at}): ${m.content}`
    ).join('\n\n');
    return { content: [{ type: 'text', text: `## ${messages.length} new message(s)\n\n${formatted}` }] };
  }
);

server.tool(
  'search_messages',
  'Search message content across all channels.',
  {
    query: z.string().describe('Search term'),
    limit: z.number().optional().default(20).describe('Max results'),
  },
  async ({ query, limit }) => {
    const { data: messages, error } = await supabase
      .from('phone_messages')
      .select('*')
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
    if (!messages || messages.length === 0) {
      return { content: [{ type: 'text', text: `No messages matching "${query}"` }] };
    }
    const formatted = messages.map(m =>
      `[#${m.channel}] ${m.sender} (${m.created_at}): ${m.content}`
    ).join('\n\n');
    return { content: [{ type: 'text', text: `## ${messages.length} result(s) for "${query}"\n\n${formatted}` }] };
  }
);

// --- New tools ---

server.tool(
  'start_call',
  'Start a phone call with other agents/humans.',
  {
    caller: z.string().describe('Your agent ID'),
    participants: z.array(z.string()).describe('IDs of who to call (e.g. ["MV-002", "denis"])'),
  },
  async ({ caller, participants }) => {
    const callId = Math.random().toString(36).substring(2, 10);
    const channel = `call:${callId}`;
    const allParts = [caller, ...participants];

    const { error: callErr } = await supabase.from('calls').insert({
      id: callId, started_by: caller, participants: allParts, status: 'active', channel,
    });
    if (callErr) return { content: [{ type: 'text', text: `Error: ${callErr.message}` }] };

    await supabase.from('phone_messages').insert({
      channel, sender: caller,
      content: `${caller} started a call with ${participants.join(', ')}`,
      metadata: { type: 'call-start' },
    });

    return { content: [{ type: 'text', text: `Call started! ID: ${callId}, Channel: ${channel}\nParticipants: ${allParts.join(', ')}\nSend messages to channel "${channel}"` }] };
  }
);

server.tool(
  'end_call',
  'End an active phone call.',
  {
    call_id: z.string().describe('The call ID to end'),
    sender: z.string().describe('Your agent ID'),
  },
  async ({ call_id, sender }) => {
    const { error } = await supabase
      .from('calls')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', call_id);
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };

    await supabase.from('phone_messages').insert({
      channel: `call:${call_id}`, sender,
      content: `${sender} ended the call.`,
      metadata: { type: 'call-end' },
    });

    return { content: [{ type: 'text', text: `Call ${call_id} ended.` }] };
  }
);

server.tool(
  'leave_voicemail',
  'Leave a structured voicemail (context dump for the next session).',
  {
    from_agent: z.string().describe('Your agent ID'),
    to_agent: z.string().optional().describe('Target agent ID, or omit for broadcast'),
    subject: z.string().describe('Short subject line'),
    context: z.object({
      working_on: z.string().optional(),
      decisions_made: z.array(z.string()).optional(),
      files_touched: z.array(z.string()).optional(),
      blockers: z.array(z.string()).optional(),
      next_steps: z.array(z.string()).optional(),
      open_questions: z.array(z.string()).optional(),
      emotional_context: z.string().optional(),
    }).describe('Structured session context'),
  },
  async ({ from_agent, to_agent, subject, context }) => {
    const { data, error } = await supabase
      .from('voicemails')
      .insert({ from_agent, to_agent: to_agent || null, subject, context })
      .select('id')
      .single();
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
    return { content: [{ type: 'text', text: `Voicemail #${data.id} left. Subject: ${subject}` }] };
  }
);

server.tool(
  'check_voicemail',
  'Check for unread voicemails and mark them as read.',
  {
    agent_id: z.string().describe('Your agent ID'),
    mark_read: z.boolean().optional().default(true).describe('Mark voicemails as read after checking'),
  },
  async ({ agent_id, mark_read }) => {
    const { data: vms, error } = await supabase
      .from('voicemails')
      .select('*')
      .or(`to_agent.eq.${agent_id},to_agent.is.null`)
      .eq('read', false)
      .order('created_at', { ascending: false });
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
    if (!vms || vms.length === 0) {
      return { content: [{ type: 'text', text: 'No new voicemails.' }] };
    }

    const formatted = vms.map(v => {
      const ctx = v.context || {};
      const parts = [`## Voicemail #${v.id} from ${v.from_agent}`, `**Subject:** ${v.subject}`, `**Time:** ${v.created_at}`];
      if (ctx.working_on) parts.push(`**Working on:** ${ctx.working_on}`);
      if (ctx.decisions_made?.length) parts.push(`**Decisions:** ${ctx.decisions_made.join(', ')}`);
      if (ctx.files_touched?.length) parts.push(`**Files:** ${ctx.files_touched.join(', ')}`);
      if (ctx.blockers?.length) parts.push(`**Blockers:** ${ctx.blockers.join(', ')}`);
      if (ctx.next_steps?.length) parts.push(`**Next steps:** ${ctx.next_steps.join(', ')}`);
      if (ctx.open_questions?.length) parts.push(`**Open questions:** ${ctx.open_questions.join(', ')}`);
      if (ctx.emotional_context) parts.push(`**Context:** ${ctx.emotional_context}`);
      return parts.join('\n');
    }).join('\n\n---\n\n');

    if (mark_read) {
      const ids = vms.map(v => v.id);
      await supabase.from('voicemails').update({ read: true }).in('id', ids);
    }

    return { content: [{ type: 'text', text: `${vms.length} voicemail(s):\n\n${formatted}` }] };
  }
);

server.tool(
  'set_presence',
  'Update your online/offline status.',
  {
    agent_id: z.string().describe('Your agent ID'),
    status: z.enum(['online', 'offline']).describe('New status'),
    session_context: z.string().optional().describe('What you are currently working on'),
  },
  async ({ agent_id, status, session_context }) => {
    const update = { status, last_seen: new Date().toISOString() };
    if (session_context) update.session_context = { current_task: session_context };

    const { error } = await supabase
      .from('agents')
      .upsert({ id: agent_id, ...update }, { onConflict: 'id' });
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
    return { content: [{ type: 'text', text: `${agent_id} is now ${status}` }] };
  }
);

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Agent Phone v3 MCP server running');
```

**Step 2: Restart MCP server**

The MCP server restarts automatically when Claude reconnects. Verify by checking tools are available.

**Step 3: Commit**

```bash
git add ~/.claude/mcp-servers/agent-chat/server.js
git commit -m "feat: rewrite MCP server for Agent Phone v3 — unified tables + calls + voicemail"
```

---

### Task 4: Rewire Hooks (Kill GitHub, Point to Supabase)

**Files:**
- Modify: `~/.claude/settings.json`
- Modify: `~/.claude/hooks/auto-broadcast.sh`
- Modify: `~/.claude/hooks/hotline-notify-v2.sh`
- Modify: `~/.claude/hooks/session-end.sh`

**Step 1: Update settings.json — SessionStart hook**

Replace the GitHub-based startup with Supabase registration + voicemail check:

```json
{
  "type": "command",
  "command": "bash ~/.claude/scripts/hotline-v2.sh register MV-001 \"Denis's Claude\" 2>/dev/null; VM=$(bash ~/.claude/scripts/hotline-v2.sh voicemail check 2>/dev/null); if [ -n \"$VM\" ] && [ \"$VM\" != \"No new voicemails.\" ]; then echo \"$VM\"; fi"
}
```

This replaces the old `check-phone.sh` + `hotline.sh online` + `cat phone-inbox.md` chain.

**Step 2: Update settings.json — SessionEnd hook**

Replace GitHub offline with Supabase presence:

```json
{
  "type": "command",
  "command": "bash ~/.claude/scripts/hotline-v2.sh presence offline 2>/dev/null; ~/.claude/hooks/session-end.sh"
}
```

**Step 3: Rewrite auto-broadcast.sh — digest model**

Instead of creating GitHub issues, append to a local queue. Flush to Supabase on timer or session end.

Replace the GitHub issue creation block with:

```bash
# Instead of GitHub issue, append to broadcast queue
QUEUE_FILE="$HOME/.claude/scripts/.broadcast-queue"
echo "$(date '+%H:%M') $CHANGE_TYPE: $FILENAME ($REL_PATH)" >> "$QUEUE_FILE"

# Flush queue if it has 5+ items or oldest entry is 10+ min old
QUEUE_COUNT=$(wc -l < "$QUEUE_FILE" 2>/dev/null || echo "0")
QUEUE_COUNT=$(echo "$QUEUE_COUNT" | tr -d ' ')

if [ "$QUEUE_COUNT" -ge 5 ]; then
  # Flush as digest
  DIGEST=$(cat "$QUEUE_FILE")
  export BD_SENDER="$MY_NUMBER" BD_LABEL="$MY_LABEL" BD_DIGEST="$DIGEST"
  PAYLOAD=$(python3 << 'PYEOF'
import json, os
print(json.dumps({
    "channel": "broadcasts",
    "sender": os.environ.get("BD_SENDER","MV-001"),
    "content": os.environ.get("BD_DIGEST",""),
    "metadata": {"type": "broadcast", "sender_label": os.environ.get("BD_LABEL","")}
}))
PYEOF
)
  curl -s -X POST "${SUPABASE_URL}/rest/v1/phone_messages" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" >/dev/null 2>&1
  rm -f "$QUEUE_FILE"
fi
```

For urgent (schema/migration) changes, bypass the queue and post immediately.

**Step 4: Update hotline-notify-v2.sh**

Already points to Supabase. Just change table from `hotline` to `phone_messages` and field from `message` to `content`:

- Line 24: `hotline` → `phone_messages`
- Line 50: `m.get('message','')` → `m.get('content','')`

Also add: check for active calls where MY_NUMBER is a participant, and incoming voicemails.

**Step 5: Upgrade session-end.sh — write voicemail fallback**

Instead of writing a breadcrumb file, write a minimal voicemail to Supabase:

```bash
#!/bin/bash
# SessionEnd fallback — writes minimal voicemail if /end-session didn't run

SUPABASE_URL="https://vpioftosgdkyiwvhxewy.supabase.co"
SUPABASE_KEY="sb_publishable_2Y0BXs8NAWNmRQk69qTqjQ_CBVVKQNt"
MY_NUMBER=$(cat "$HOME/.claude/scripts/.hotline/my-phone-number" 2>/dev/null || echo "MV-001")
BREADCRUMBS="$HOME/.claude/projects/-Users-denisgingras/memory/breadcrumbs.md"
NOW=$(date +%s)

# Check if breadcrumbs was updated in last 5 minutes (meaning /end-session ran)
if [ -f "$BREADCRUMBS" ]; then
  MODIFIED=$(stat -f %m "$BREADCRUMBS" 2>/dev/null || stat -c %Y "$BREADCRUMBS" 2>/dev/null)
  DIFF=$(( NOW - MODIFIED ))
  if [ "$DIFF" -lt 300 ]; then
    exit 0
  fi
fi

# Get recent git changes for context
RECENT_FILES=$(cd ~/whats-good-here 2>/dev/null && git diff --name-only HEAD~1 HEAD 2>/dev/null | head -5 | tr '\n' ', ' || echo "unknown")
BRANCH=$(cd ~/whats-good-here 2>/dev/null && git branch --show-current 2>/dev/null || echo "unknown")

# Write minimal voicemail to Supabase
export VM_FROM="$MY_NUMBER" VM_FILES="$RECENT_FILES" VM_BRANCH="$BRANCH"
PAYLOAD=$(python3 << 'PYEOF'
import json, os
print(json.dumps({
    "from_agent": os.environ.get("VM_FROM","MV-001"),
    "to_agent": None,
    "subject": "Minimal session handoff (auto-generated)",
    "context": {
        "working_on": "Session ended without /end-session — context is thin",
        "files_touched": [f.strip() for f in os.environ.get("VM_FILES","").split(",") if f.strip()],
        "next_steps": ["Ask Denis what was worked on"],
        "emotional_context": "Auto-generated fallback. Previous session didn't run /end-session."
    },
    "read": False
}))
PYEOF
)

curl -s -X POST "${SUPABASE_URL}/rest/v1/voicemails" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" >/dev/null 2>&1

# Also flush any pending broadcast queue
QUEUE_FILE="$HOME/.claude/scripts/.broadcast-queue"
if [ -f "$QUEUE_FILE" ] && [ -s "$QUEUE_FILE" ]; then
  DIGEST=$(cat "$QUEUE_FILE")
  export BD_DIGEST="$DIGEST"
  BD_PAYLOAD=$(python3 << 'PYEOF'
import json, os
print(json.dumps({
    "channel": "broadcasts",
    "sender": os.environ.get("VM_FROM","MV-001"),
    "content": os.environ.get("BD_DIGEST",""),
    "metadata": {"type": "broadcast"}
}))
PYEOF
)
  curl -s -X POST "${SUPABASE_URL}/rest/v1/phone_messages" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -d "$BD_PAYLOAD" >/dev/null 2>&1
  rm -f "$QUEUE_FILE"
fi
```

**Step 6: Commit**

```bash
git add ~/.claude/settings.json ~/.claude/hooks/auto-broadcast.sh ~/.claude/hooks/hotline-notify-v2.sh ~/.claude/hooks/session-end.sh
git commit -m "feat: rewire all hooks from GitHub to Supabase — kill GitHub transport"
```

---

### Task 5: Upgrade Browser UI

**Files:**
- Modify: `~/.claude/hotline/chat.html`

**Step 1: Update chat.html**

Key changes:
- Switch from `hotline` table to `phone_messages` table
- Field names: `message` → `content`, `room` → `channel`, add `metadata`
- Add "Calls" tab showing active calls with their channels
- Add "Voicemails" tab showing recent voicemails
- Add presence indicators (who's online)
- Keep the existing visual design (Island Depths theme)

The Realtime subscription changes:
```js
// Old
.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hotline' }, ...)
// New
.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'phone_messages' }, ...)
```

Add a second subscription for presence:
```js
.on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, (payload) => {
  updatePresenceIndicators(payload.new);
})
```

**Step 2: Verify browser UI works**

```bash
open ~/.claude/hotline/chat.html
```

Verify: messages load, real-time works, presence shows.

**Step 3: Commit**

```bash
git add ~/.claude/hotline/chat.html
git commit -m "feat: upgrade browser UI for Agent Phone v3 — calls, voicemails, presence"
```

---

### Task 6: Update Launchd Daemon

**Files:**
- Modify: `~/.claude/scripts/check-phone.sh`

**Step 1: Rewrite check-phone.sh for Supabase**

Instead of polling GitHub Issues, poll Supabase for:
- New messages in all channels
- Unread voicemails
- Active calls
- Who's online

Write a simplified `phone-inbox.md` showing:
- Unread voicemail count + summaries
- Active calls
- Recent messages from other agents
- Who's online

No more GitHub API calls. Just Supabase REST via curl.

The macOS notification still fires for new voicemails or active calls.

**Step 2: Verify daemon works**

```bash
bash ~/.claude/scripts/check-phone.sh
cat ~/.claude/memory/phone-inbox.md
```

**Step 3: Commit**

```bash
git add ~/.claude/scripts/check-phone.sh
git commit -m "feat: rewrite check-phone daemon for Supabase — no more GitHub polling"
```

---

### Task 7: Clean Up Deprecated Systems

**Files:**
- Delete: `~/.claude/scripts/hotline.sh` (v1 GitHub-based)
- Delete: `~/.claude/scripts/update-commons.sh` (GitHub commons push)
- Delete: `~/.claude/hooks/hotline-notify.sh` (v1 GitHub-based)
- Archive: `~/.claude/hooks/check-urgent.sh` (GitHub-based urgent check — replace with Supabase voicemail)

**Step 1: Close all auto-broadcast GitHub issues**

```bash
gh issue list --repo Denisgingras75/wgh-phone --label "auto-broadcast" --state open --json number --jq '.[].number' | while read num; do
  gh issue close "$num" --repo Denisgingras75/wgh-phone --comment "Migrated to Agent Phone v3 (Supabase)." &
done
wait
```

**Step 2: Remove deprecated files**

```bash
rm ~/.claude/scripts/hotline.sh
rm ~/.claude/scripts/update-commons.sh
rm ~/.claude/hooks/hotline-notify.sh
```

**Step 3: Commit**

```bash
git commit -m "chore: remove deprecated GitHub-based phone system files"
```

---

### Task 8: End-to-End Verification

**Step 1: Test self-registration**

```bash
bash ~/.claude/scripts/hotline-v2.sh register MV-001 "Denis's Claude"
```

Verify: `~/.claude/scripts/.hotline/my-phone-number` contains `MV-001`

**Step 2: Test messaging**

```bash
bash ~/.claude/scripts/hotline-v2.sh say "Hello from v3"
bash ~/.claude/scripts/hotline-v2.sh read 1
```

**Step 3: Test voicemail**

```bash
bash ~/.claude/scripts/hotline-v2.sh voicemail leave all "Test voicemail" '{"working_on":"testing v3","next_steps":["verify everything works"]}'
bash ~/.claude/scripts/hotline-v2.sh voicemail check
```

**Step 4: Test phone call**

```bash
bash ~/.claude/scripts/hotline-v2.sh call start --with MV-002
bash ~/.claude/scripts/hotline-v2.sh say -r call:$(cat ~/.claude/scripts/.hotline/active-call) "Hello?"
bash ~/.claude/scripts/hotline-v2.sh call end
bash ~/.claude/scripts/hotline-v2.sh call list
```

**Step 5: Test MCP tools**

In a Claude session, use:
- `mcp__agent-chat__send_message` with channel "general"
- `mcp__agent-chat__check_voicemail` with agent_id "MV-001"
- `mcp__agent-chat__set_presence` with agent_id "MV-001", status "online"

**Step 6: Test browser UI**

```bash
open ~/.claude/hotline/chat.html
```

Send a message from browser, verify it appears. Send from CLI, verify it appears in browser.

**Step 7: Test SessionStart hook**

Start a new Claude session. Verify:
- Registration happens (agent goes online)
- Voicemails are checked and displayed
- No GitHub-related errors

**Step 8: Test SessionEnd hook**

End a session. Verify:
- Agent goes offline in Supabase
- If /end-session didn't run, a minimal voicemail is created

**Step 9: Test auto-broadcast digest**

Edit a file in WGH. Verify:
- No GitHub issue created
- Entry added to `~/.claude/scripts/.broadcast-queue`
- After 5+ entries, digest is flushed to `phone_messages` table

**Step 10: Final commit**

```bash
git commit -m "feat: Agent Phone v3 complete — unified Supabase communication system"
```
