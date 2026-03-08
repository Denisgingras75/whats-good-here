# Muscle Memory — Error-Driven Learning System

**Date:** 2026-02-28
**Status:** Approved
**Cost:** ~$4/month (Haiku API)

## Core Principle

Learning is only through mistakes. The system watches for errors, corrections, and friction. When the same mistake recurs, it becomes a rule. Rules prevent the mistake. Rules that work become permanent.

## Problem

Every Claude session starts cold. Context files (MEMORY.md, CLAUDE.md, CODEX.md) help, but they're manually curated and flat. The agent re-discovers the same things, makes the same mistakes, needs the same corrections. There's no mechanism that converts repeated mistakes into permanent behavioral changes.

## Solution

A two-phase "sleep cycle" that runs between sessions:

1. **Sleep Agent** — fires after every `/end-session`, calls Haiku API to process new mistakes against existing rules
2. **Nightly Review** — 1 AM cron that graduates, reinforces, and decays rules

The output is `rules.jsonl` — a weighted rulebook injected into every session via SessionStart hook. Rules earn their weight through mistake recurrence. Bad rules decay. Good rules become permanent muscle memory.

## Architecture

```
SESSION ENDS
  └→ /end-session captures error-fix pairs in CODEX.md
  └→ fires sleep-agent.sh
       └→ Haiku API: new mistakes + existing rules.jsonl
       └→ Match: mistake matches existing rule? bump weight
       └→ Create: mistake recurred N times without rule? create one
       └→ Write updated rules.jsonl

1 AM NIGHTLY
  └→ deep-sleep.sh
       └→ Haiku API: full day's mistakes + rules.jsonl
       └→ Graduate: weight>=3 + no recurrence 7 days → permanent
       └→ Reinforce: recurring despite rule → reword, bump weight
       └→ Decay threshold: 5→4→3 as library grows (meta-learning)

NEXT SESSION STARTS
  └→ SessionStart hook reads rules.jsonl
  └→ Filters weight>=2
  └→ Injects as "Learned Rules" in system context
  └→ Agent starts smarter
```

## Rule Lifecycle

```
Mistake happens (session 1)     → raw learning in CODEX.md
Same mistake (session 2)        → sleep agent notices, still below threshold
Same mistake (session 3+)       → creates rule (weight=1)
Mistake recurs despite rule     → weight increases, rule gets louder/more specific
Mistake STOPS happening         → weight stabilizes, rule proved itself
No recurrence for 7+ days       → graduated to permanent
No recurrence for 30+ days      → rule is deep muscle memory

Meta-learning:
  Early system: need 5 occurrences to create rule
  Mature system: need 3 (recognizes error shapes faster)
```

## Data Model

### rules.jsonl

One rule per line. Machine-readable, human-inspectable.

```json
{"id": "r001", "trigger": "Using toSorted() or Array.at()", "action": "Use [...arr].sort() and arr[arr.length-1]", "reason": "Safari compatibility", "weight": 4, "mistakes": 5, "threshold_at_creation": 5, "created": "2026-02-20", "last_mistake": "2026-02-26", "last_graduated": null, "status": "active"}
{"id": "r002", "trigger": "Writing JSX with color in className", "action": "className for layout/spacing only, style={{}} for colors", "reason": "Breaks WGH theme system", "weight": 3, "mistakes": 3, "threshold_at_creation": 4, "created": "2026-02-24", "last_mistake": "2026-02-27", "last_graduated": null, "status": "active"}
```

Fields:
- `id` — unique identifier (r001, r002, ...)
- `trigger` — when this situation is encountered
- `action` — what to do instead
- `reason` — why (one line)
- `weight` — current strength (1=tentative, 3=graduated, 5+=permanent)
- `mistakes` — total times this mistake was observed
- `threshold_at_creation` — how many mistakes it took to create this rule (tracks meta-learning)
- `created` — date rule was created
- `last_mistake` — date mistake last recurred
- `last_graduated` — date rule reached weight>=3
- `status` — active | permanent | decayed

### Nap Log (~/.claude/sleep/naps/YYYY-MM-DD.md)

Daily compressed mistake log. Written by sleep-agent.sh, read by deep-sleep.sh.

```markdown
# 2026-02-28 Mistakes

## Session G9 (22:30)
- Used `console.log` for debugging, left in code (3rd time)
- Tried to amend previous commit after hook failure (2nd time)
- Built modal with hooks after early return (1st time)

## Session G7 (19:15)
- Schema change without reading schema.sql first (2nd time)
```

## Components

### 1. sleep-agent.sh

Fired by `/end-session`. Makes one Haiku API call.

**Input to Haiku:**
- New CODEX.md entries since last run
- Current rules.jsonl
- System prompt: "You are a learning system. Compare new mistakes against existing rules. For matches: bump weight. For new recurring mistakes above threshold: create rules. Output updated rules as JSONL."

**Output:** Updated rules.jsonl + appended nap log entry

### 2. deep-sleep.sh

Nightly cron at 1 AM. Makes one Haiku API call.

**Input to Haiku:**
- Full day's nap log
- Current rules.jsonl
- System prompt: "Review today's mistakes. Graduate rules (weight>=3, no recurrence 7d). Reinforce failing rules (recurring despite rule). Calculate new creation threshold. Prune decayed rules (no relevance 60d)."

**Output:** Updated rules.jsonl with graduations, reinforcements, and pruning

### 3. SessionStart hook addition

Reads rules.jsonl, filters weight>=2, injects into session context:

```
## Learned Rules (auto-generated from past mistakes — do not edit)
- **When:** Using toSorted() or Array.at() → **Do:** Use [...arr].sort() instead — Safari compat [w:4]
- **When:** JSX with color in className → **Do:** style={{}} for colors — theme system [w:3]
```

### 4. Launchd plist (com.wgh.deep-sleep)

Runs deep-sleep.sh at 1 AM daily.

## File Layout

```
~/.claude/sleep/
  rules.jsonl              ← the muscle memory (THE artifact)
  last-processed           ← timestamp watermark
  creation-threshold       ← current N (starts at 5, decreases)
  naps/
    YYYY-MM-DD.md          ← daily compressed mistake logs

~/.claude/scripts/
  sleep-agent.sh           ← post-session processor
  deep-sleep.sh            ← nightly review

~/Library/LaunchAgents/
  com.wgh.deep-sleep.plist ← nightly cron
```

## Cost Model

- Per `/end-session`: ~15K input tokens, ~2K output → **$0.02** (Haiku)
- Nightly review: ~30K input, ~3K output → **$0.04** (Haiku)
- 5 sessions/day: $0.10 + $0.04 = **$0.14/day**
- **Monthly: ~$4**

## What This Produces Over Time

- **Week 1:** 2-3 tentative rules. System is observing.
- **Week 4:** 10-15 rules. Recurring ones graduated (weight 3+). Junk decayed.
- **Month 3:** A personalized rulebook representing every mistake made and learned from. The agent can't make those mistakes because they're in its DNA. Creation threshold has dropped from 5 to 3 — the system learns faster.

## Dependencies

- Anthropic API key (for Haiku calls)
- Existing `/end-session` command (already captures mistakes)
- Existing CODEX.md (already stores error-fix pairs)
- launchd (already used for phone daemon)

## What This Does NOT Do

- Track successes or "good patterns" (learning is only through mistakes)
- Replace CLAUDE.md manual rules (those are human-curated, these are auto-generated)
- Require any new infrastructure (files + cron + API, same pattern as phone system)
- Cost more than a coffee per month
