# Muscle Memory Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an error-driven learning system that calls Haiku API after each session to convert recurring mistakes into weighted rules, injected into every future session.

**Architecture:** Shell scripts + Claude API (Haiku) + JSONL file storage. `/end-session` fires `sleep-agent.sh` which calls Haiku to diff new mistakes against existing rules. Nightly `deep-sleep.sh` cron graduates/decays rules. `SessionStart` hook injects active rules into context.

**Tech Stack:** Bash, curl (Anthropic Messages API), Python3 (JSON processing), launchd (nightly cron)

---

### Task 1: Create directory structure and seed files

**Files:**
- Create: `~/.claude/sleep/rules.jsonl`
- Create: `~/.claude/sleep/last-processed`
- Create: `~/.claude/sleep/creation-threshold`
- Create: `~/.claude/sleep/naps/` (directory)

**Step 1: Create the directory and seed files**

```bash
mkdir -p ~/.claude/sleep/naps
echo '[]' > /dev/null  # rules.jsonl starts empty
touch ~/.claude/sleep/rules.jsonl
date -u '+%Y-%m-%dT%H:%M:%SZ' > ~/.claude/sleep/last-processed
echo "5" > ~/.claude/sleep/creation-threshold
```

**Step 2: Verify structure**

Run: `find ~/.claude/sleep -type f`
Expected:
```
~/.claude/sleep/rules.jsonl
~/.claude/sleep/last-processed
~/.claude/sleep/creation-threshold
```

**Step 3: Commit**

```bash
# No git commit needed — these are local config files outside the repo
```

---

### Task 2: Build sleep-agent.sh — the post-session processor

**Files:**
- Create: `~/.claude/scripts/sleep-agent.sh`

**Step 1: Write sleep-agent.sh**

This script:
1. Reads new CODEX.md entries since last processed timestamp
2. Reads current rules.jsonl
3. Reads current creation threshold
4. Calls Haiku API with a system prompt + the data
5. Writes updated rules.jsonl from Haiku's response
6. Appends to today's nap log
7. Updates last-processed timestamp

```bash
#!/bin/bash
# Muscle Memory — Post-session sleep agent
# Called by /end-session. Makes one Haiku API call.
# Diffs new mistakes against existing rules. Creates/bumps rules.

SLEEP_DIR="$HOME/.claude/sleep"
RULES_FILE="$SLEEP_DIR/rules.jsonl"
THRESHOLD_FILE="$SLEEP_DIR/creation-threshold"
LAST_PROCESSED="$SLEEP_DIR/last-processed"
NAP_DIR="$SLEEP_DIR/naps"
CODEX_FILE="$HOME/.claude/memory/CODEX.md"
MY_NUMBER=$(cat "$HOME/.claude/scripts/.hotline/my-phone-number" 2>/dev/null || echo "unknown")

# Source API key from zshrc
source "$HOME/.zshrc" 2>/dev/null
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "No ANTHROPIC_API_KEY found. Skipping sleep agent."
  exit 0
fi

mkdir -p "$NAP_DIR"
touch "$RULES_FILE"

# --- 1. Extract new CODEX entries since last run ---
LAST_TS=$(cat "$LAST_PROCESSED" 2>/dev/null || echo "1970-01-01")
CODEX_CONTENT=$(cat "$CODEX_FILE" 2>/dev/null || echo "")

# Extract Raw Log section
RAW_LOG=$(echo "$CODEX_CONTENT" | python3 -c "
import sys, re
content = sys.stdin.read()
match = re.search(r'^## Raw Log\s*\n(.*)', content, re.MULTILINE | re.DOTALL)
if match:
    print(match.group(1).strip())
else:
    print('')
" 2>/dev/null)

# Skip if no raw entries
if [ -z "$RAW_LOG" ] || [ "$RAW_LOG" = "" ]; then
  echo "No raw log entries. Skipping."
  date -u '+%Y-%m-%dT%H:%M:%SZ' > "$LAST_PROCESSED"
  exit 0
fi

# --- 2. Read current rules and threshold ---
CURRENT_RULES=$(cat "$RULES_FILE" 2>/dev/null || echo "")
THRESHOLD=$(cat "$THRESHOLD_FILE" 2>/dev/null || echo "5")
TODAY=$(date '+%Y-%m-%d')

# --- 3. Build API request ---
SYSTEM_PROMPT="You are Muscle Memory, an error-driven learning system. You learn ONLY from mistakes.

INPUT:
- Raw mistake log from recent sessions (from CODEX.md)
- Existing rules (JSONL format, may be empty)
- Current creation threshold (how many times a mistake must recur before becoming a rule)

YOUR JOB:
1. MATCH: Check if any new mistake matches an existing rule's trigger. If yes, bump that rule's weight by 1 and update last_mistake date. This means the mistake recurred despite the rule — the rule needs reinforcement.
2. CREATE: Look for mistakes that appear multiple times (across this log AND existing rules' mistake counts). If a mistake pattern has occurred >= threshold times total without an existing rule, create a new rule.
3. OUTPUT: Return the complete updated rules.jsonl (one JSON object per line). Also return a nap log entry (markdown) summarizing today's mistakes.

RULE FORMAT (one per line, valid JSON):
{\"id\": \"r001\", \"trigger\": \"short description of when this happens\", \"action\": \"what to do instead\", \"reason\": \"why in one line\", \"weight\": 1, \"mistakes\": 3, \"threshold_at_creation\": 5, \"created\": \"YYYY-MM-DD\", \"last_mistake\": \"YYYY-MM-DD\", \"status\": \"active\"}

RULES FOR RULES:
- trigger: describe the SITUATION (\"Using toSorted() in JSX\"), not the mistake
- action: describe the CORRECT behavior (\"Use [...arr].sort() instead\")
- reason: one line explaining WHY
- weight starts at 1 for new rules, increases when mistake recurs
- Be specific — \"don't use bad methods\" is useless, \"don't use Array.at() — Safari <16 crashes\" is useful
- If two rules overlap, merge them into one
- Maximum 30 rules total — if at limit, only create if more important than weakest existing rule

RESPOND WITH EXACTLY TWO SECTIONS:
===RULES===
(one JSON object per line, or empty if no rules yet)
===NAP===
(markdown: ## Session AGENT_ID (TIME)\n- mistake 1\n- mistake 2)

Current creation threshold: THRESHOLD_VALUE
Today's date: TODAY_DATE"

# Replace placeholders
SYSTEM_PROMPT=$(echo "$SYSTEM_PROMPT" | sed "s/THRESHOLD_VALUE/$THRESHOLD/g" | sed "s/TODAY_DATE/$TODAY/g" | sed "s/AGENT_ID/$MY_NUMBER/g" | sed "s/TIME/$(date '+%H:%M')/g")

USER_CONTENT="## Raw Mistake Log (from CODEX.md)

$RAW_LOG

## Existing Rules (rules.jsonl)

$CURRENT_RULES"

# --- 4. Call Haiku API ---
RESPONSE=$(python3 << 'PYEOF'
import json, os, sys
try:
    import urllib.request

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    system_prompt = os.environ.get("MM_SYSTEM", "")
    user_content = os.environ.get("MM_USER", "")

    if not api_key:
        print("NO_KEY", file=sys.stderr)
        sys.exit(1)

    payload = json.dumps({
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 4096,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_content}]
    })

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload.encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        }
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        text = result["content"][0]["text"]
        print(text)

except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1)
PYEOF
)

if [ $? -ne 0 ] || [ -z "$RESPONSE" ]; then
  echo "API call failed. Skipping."
  exit 1
fi

# --- 5. Parse response and write files ---
export MM_RESPONSE="$RESPONSE"
python3 << 'PYEOF'
import os, sys, re
from datetime import datetime

response = os.environ.get("MM_RESPONSE", "")
rules_file = os.path.expanduser("~/.claude/sleep/rules.jsonl")
nap_dir = os.path.expanduser("~/.claude/sleep/naps")
today = datetime.now().strftime("%Y-%m-%d")
nap_file = os.path.join(nap_dir, f"{today}.md")

# Parse sections
rules_match = re.search(r'===RULES===\s*\n(.*?)(?:===NAP===|$)', response, re.DOTALL)
nap_match = re.search(r'===NAP===\s*\n(.*)', response, re.DOTALL)

# Write rules
if rules_match:
    rules_text = rules_match.group(1).strip()
    if rules_text:
        with open(rules_file, 'w') as f:
            f.write(rules_text + '\n')
        # Count rules
        rule_count = len([l for l in rules_text.split('\n') if l.strip()])
        print(f"Rules updated: {rule_count} total")
    else:
        print("No rules yet (below threshold)")

# Append nap log
if nap_match:
    nap_text = nap_match.group(1).strip()
    if nap_text:
        header = ""
        if not os.path.exists(nap_file):
            header = f"# {today} Mistakes\n\n"
        with open(nap_file, 'a') as f:
            f.write(header + nap_text + '\n\n')
        print(f"Nap log appended to {today}.md")
PYEOF

# --- 6. Update timestamp ---
date -u '+%Y-%m-%dT%H:%M:%SZ' > "$LAST_PROCESSED"
echo "Sleep agent complete."
```

**Step 2: Make executable and test syntax**

Run: `chmod +x ~/.claude/scripts/sleep-agent.sh && bash -n ~/.claude/scripts/sleep-agent.sh`
Expected: No output (valid syntax)

**Step 3: Dry run (manual test)**

Run: `bash ~/.claude/scripts/sleep-agent.sh`
Expected: Either "No raw log entries. Skipping." (if CODEX is empty) or "Rules updated: N total" + "Nap log appended"

---

### Task 3: Build deep-sleep.sh — the nightly reviewer

**Files:**
- Create: `~/.claude/scripts/deep-sleep.sh`

**Step 1: Write deep-sleep.sh**

This script:
1. Reads today's nap log + rules.jsonl
2. Calls Haiku to graduate, reinforce, decay, and adjust threshold
3. Writes updated rules.jsonl and threshold

```bash
#!/bin/bash
# Muscle Memory — Nightly deep sleep review
# Runs at 1 AM via launchd. Graduates/decays rules, adjusts learning threshold.

SLEEP_DIR="$HOME/.claude/sleep"
RULES_FILE="$SLEEP_DIR/rules.jsonl"
THRESHOLD_FILE="$SLEEP_DIR/creation-threshold"
NAP_DIR="$SLEEP_DIR/naps"
YESTERDAY=$(date -v-1d '+%Y-%m-%d' 2>/dev/null || date -d 'yesterday' '+%Y-%m-%d' 2>/dev/null)

# Source API key
source "$HOME/.zshrc" 2>/dev/null
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "No ANTHROPIC_API_KEY. Skipping deep sleep."
  exit 0
fi

# Read inputs
CURRENT_RULES=$(cat "$RULES_FILE" 2>/dev/null || echo "")
THRESHOLD=$(cat "$THRESHOLD_FILE" 2>/dev/null || echo "5")
NAP_LOG=$(cat "$NAP_DIR/$YESTERDAY.md" 2>/dev/null || echo "")

# Skip if no rules and no nap log
if [ -z "$CURRENT_RULES" ] && [ -z "$NAP_LOG" ]; then
  echo "Nothing to review. Skipping."
  exit 0
fi

SYSTEM_PROMPT="You are Muscle Memory's nightly review. You maintain the rule system.

INPUT: Yesterday's mistake log + current rules.jsonl + creation threshold.

YOUR JOBS:
1. GRADUATE: Rules with weight >= 3 AND last_mistake older than 7 days → set status to \"permanent\". The mistake stopped recurring — the rule works.
2. REINFORCE: Rules where mistakes recurred yesterday → bump weight, consider rewording the trigger/action to be more specific.
3. DECAY: Rules with status \"active\" where last_mistake is older than 60 days → set status to \"decayed\". Remove decayed rules from output.
4. META-LEARN: If total rules > 10, decrease creation threshold by 1 (minimum 3). If total rules < 5, keep threshold as-is. Output the new threshold.
5. PRUNE: If total rules > 30, remove the lowest-weight active rules to get back to 30.

RESPOND WITH EXACTLY TWO SECTIONS:
===RULES===
(complete updated rules.jsonl, one JSON object per line)
===THRESHOLD===
(single number: the new creation threshold)

Today's date: $(date '+%Y-%m-%d')
Current threshold: $THRESHOLD"

USER_CONTENT="## Yesterday's Mistake Log

$NAP_LOG

## Current Rules

$CURRENT_RULES"

# Call API
export ANTHROPIC_API_KEY MM_SYSTEM="$SYSTEM_PROMPT" MM_USER="$USER_CONTENT"
RESPONSE=$(python3 << 'PYEOF'
import json, os, sys
try:
    import urllib.request

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    system_prompt = os.environ.get("MM_SYSTEM", "")
    user_content = os.environ.get("MM_USER", "")

    payload = json.dumps({
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 4096,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_content}]
    })

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload.encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01"
        }
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        print(result["content"][0]["text"])

except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1)
PYEOF
)

if [ $? -ne 0 ] || [ -z "$RESPONSE" ]; then
  echo "API call failed."
  exit 1
fi

# Parse and write
export MM_RESPONSE="$RESPONSE"
python3 << 'PYEOF'
import os, re

response = os.environ.get("MM_RESPONSE", "")
rules_file = os.path.expanduser("~/.claude/sleep/rules.jsonl")
threshold_file = os.path.expanduser("~/.claude/sleep/creation-threshold")

rules_match = re.search(r'===RULES===\s*\n(.*?)(?:===THRESHOLD===|$)', response, re.DOTALL)
threshold_match = re.search(r'===THRESHOLD===\s*\n(\d+)', response)

if rules_match:
    rules_text = rules_match.group(1).strip()
    with open(rules_file, 'w') as f:
        f.write(rules_text + '\n' if rules_text else '')
    count = len([l for l in rules_text.split('\n') if l.strip()]) if rules_text else 0
    print(f"Rules after review: {count}")

if threshold_match:
    new_threshold = threshold_match.group(1).strip()
    with open(threshold_file, 'w') as f:
        f.write(new_threshold)
    print(f"Creation threshold: {new_threshold}")
PYEOF

echo "Deep sleep complete."
```

**Step 2: Make executable and test syntax**

Run: `chmod +x ~/.claude/scripts/deep-sleep.sh && bash -n ~/.claude/scripts/deep-sleep.sh`
Expected: No output (valid syntax)

---

### Task 4: Build the SessionStart injection hook

**Files:**
- Create: `~/.claude/scripts/inject-rules.sh`
- Modify: `~/.claude/settings.json` (add to SessionStart hooks)

**Step 1: Write inject-rules.sh**

```bash
#!/bin/bash
# Muscle Memory — SessionStart rule injection
# Reads rules.jsonl, filters weight>=2, outputs as system context.

RULES_FILE="$HOME/.claude/sleep/rules.jsonl"

# Skip if no rules file or empty
[ ! -s "$RULES_FILE" ] && exit 0

OUTPUT=$(python3 << 'PYEOF'
import json, os

rules_file = os.path.expanduser("~/.claude/sleep/rules.jsonl")
rules = []

try:
    with open(rules_file, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rule = json.loads(line)
                if rule.get("weight", 0) >= 2 and rule.get("status") != "decayed":
                    rules.append(rule)
            except json.JSONDecodeError:
                continue
except FileNotFoundError:
    pass

if not rules:
    exit(0)

# Sort by weight descending
rules.sort(key=lambda r: r.get("weight", 0), reverse=True)

lines = ["## Learned Rules (auto-generated from past mistakes)"]
for r in rules[:20]:  # Cap at 20 rules in prompt
    w = r.get("weight", 1)
    trigger = r.get("trigger", "?")
    action = r.get("action", "?")
    reason = r.get("reason", "")
    status = r.get("status", "active")
    tag = "PERMANENT" if status == "permanent" else f"w:{w}"
    line = f"- **When:** {trigger} → **Do:** {action}"
    if reason:
        line += f" — {reason}"
    line += f" [{tag}]"
    lines.append(line)

print('\n'.join(lines))
PYEOF
)

[ -n "$OUTPUT" ] && echo "$OUTPUT"
```

**Step 2: Make executable**

Run: `chmod +x ~/.claude/scripts/inject-rules.sh`

**Step 3: Add to settings.json SessionStart hooks**

Add after the phone-register hook in settings.json:

```json
{
    "type": "command",
    "command": "bash ~/.claude/scripts/inject-rules.sh"
}
```

Insert this as a new hook entry in the `SessionStart` hooks array.

**Step 4: Test injection**

Run: `bash ~/.claude/scripts/inject-rules.sh`
Expected: No output (rules.jsonl is empty). Once rules exist, outputs formatted rules.

---

### Task 5: Wire sleep-agent.sh into /end-session

**Files:**
- Modify: `~/.claude/commands/end-session.md`

**Step 1: Add Step 5.7 to end-session.md**

After Step 5.5 (Update Shared Context), add:

```markdown
### Step 5.7: Fire Sleep Agent (Muscle Memory)

Run the post-session learning processor in the background:

\`\`\`bash
bash ~/.claude/scripts/sleep-agent.sh &>/dev/null &
\`\`\`

This calls Haiku API to diff new mistakes against existing rules. Costs ~$0.02. Runs silently — don't wait for it.
```

**Step 2: Verify the command file reads correctly**

Run: `grep -c "sleep-agent" ~/.claude/commands/end-session.md`
Expected: At least 1 match

---

### Task 6: Create launchd plist for nightly deep sleep

**Files:**
- Create: `~/Library/LaunchAgents/com.wgh.deep-sleep.plist`

**Step 1: Write the plist**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.wgh.deep-sleep</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/denisgingras/.claude/scripts/deep-sleep.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>1</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/wgh-deep-sleep.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/wgh-deep-sleep-err.log</string>
</dict>
</plist>
```

**Step 2: Load the plist**

Run: `launchctl load ~/Library/LaunchAgents/com.wgh.deep-sleep.plist`
Expected: No error output

**Step 3: Verify it's loaded**

Run: `launchctl list | grep deep-sleep`
Expected: A line containing `com.wgh.deep-sleep`

---

### Task 7: Seed rules.jsonl with known WGH rules (bootstrap)

**Files:**
- Modify: `~/.claude/sleep/rules.jsonl`

**Step 1: Seed with rules already proven in CLAUDE.md**

These rules exist in CLAUDE.md because they were manually discovered. Seeding them at weight 5 (permanent) bootstraps the system with known-good rules so the agent gets value immediately.

```jsonl
{"id": "r001", "trigger": "Using toSorted(), Array.at(), findLast(), or Object.groupBy()", "action": "Use [...arr].sort(), arr[arr.length-1], and manual alternatives", "reason": "Safari <16 crashes on ES2023+ methods", "weight": 5, "mistakes": 10, "threshold_at_creation": 5, "created": "2026-02-01", "last_mistake": "2026-02-20", "last_graduated": "2026-02-15", "status": "permanent"}
{"id": "r002", "trigger": "Using className for colors, backgrounds, or borders in JSX", "action": "className for layout/spacing only. style={{}} for all color/background/border", "reason": "Mixing breaks WGH dual theme system", "weight": 5, "mistakes": 8, "threshold_at_creation": 5, "created": "2026-02-01", "last_mistake": "2026-02-18", "last_graduated": "2026-02-15", "status": "permanent"}
{"id": "r003", "trigger": "Placing React hooks after an early return statement in a component", "action": "ALL hooks (useFocusTrap, useCallback, useEffect) BEFORE any early return null guard", "reason": "Hooks after early returns violate Rules of Hooks — React error", "weight": 5, "mistakes": 6, "threshold_at_creation": 5, "created": "2026-02-01", "last_mistake": "2026-02-22", "last_graduated": "2026-02-15", "status": "permanent"}
{"id": "r004", "trigger": "Making schema changes without reading schema.sql first", "action": "Read schema.sql first. Trace through all 4 layers: schema → triggers → RPCs → src/api/", "reason": "Skipping a layer causes bugs — FK violations, missing columns, stale RPCs", "weight": 5, "mistakes": 7, "threshold_at_creation": 5, "created": "2026-02-01", "last_mistake": "2026-02-25", "last_graduated": "2026-02-15", "status": "permanent"}
{"id": "r005", "trigger": "Using console.log or console.error directly in src/", "action": "Use logger from src/utils/logger.js instead", "reason": "console.* bypasses Sentry in prod and violates project convention", "weight": 4, "mistakes": 5, "threshold_at_creation": 5, "created": "2026-02-01", "last_mistake": "2026-02-24", "last_graduated": "2026-02-20", "status": "permanent"}
```

**Step 2: Verify rules load**

Run: `bash ~/.claude/scripts/inject-rules.sh`
Expected: Formatted rules output with all 5 seed rules

---

### Task 8: End-to-end test

**Step 1: Add a test entry to CODEX.md Raw Log**

Append to CODEX.md under `## Raw Log`:
```markdown
### 2026-02-28: Test mistake for muscle memory
Tried to use Array.at(-1) and it crashed Safari. Used arr[arr.length-1] instead. This is a known pattern — testing that sleep agent detects the match.
```

**Step 2: Run sleep-agent.sh manually**

Run: `bash ~/.claude/scripts/sleep-agent.sh`
Expected:
- "Rules updated: N total" (should bump r001's weight)
- "Nap log appended to 2026-02-28.md"

**Step 3: Verify rules were updated**

Run: `cat ~/.claude/sleep/rules.jsonl | python3 -c "import sys,json; [print(json.loads(l).get('id','?'), json.loads(l).get('weight',0)) for l in sys.stdin if l.strip()]"`
Expected: r001 should have weight 6 (bumped from 5)

**Step 4: Verify nap log**

Run: `cat ~/.claude/sleep/naps/2026-02-28.md`
Expected: Contains a session entry mentioning the Array.at() mistake

**Step 5: Verify injection works**

Run: `bash ~/.claude/scripts/inject-rules.sh`
Expected: All rules displayed with updated weights

**Step 6: Clean up test entry**

Remove the test entry from CODEX.md Raw Log.

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Directory structure + seed files | `~/.claude/sleep/*` |
| 2 | sleep-agent.sh (post-session) | `~/.claude/scripts/sleep-agent.sh` |
| 3 | deep-sleep.sh (nightly review) | `~/.claude/scripts/deep-sleep.sh` |
| 4 | inject-rules.sh + settings.json | `~/.claude/scripts/inject-rules.sh`, `settings.json` |
| 5 | Wire into /end-session | `~/.claude/commands/end-session.md` |
| 6 | Launchd nightly cron | `com.wgh.deep-sleep.plist` |
| 7 | Seed with known rules | `rules.jsonl` |
| 8 | End-to-end test | Manual verification |
