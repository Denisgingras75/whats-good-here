# Agent Phone — [Project Name]

**Last updated:** YYYY-MM-DD

---

## How This Works

This file is a shared coordination channel for AI agents working on this project. It solves two problems:

1. **Don't step on each other's work** — Multi-tab locking + collaborator sync
2. **Don't lose what we learned** — Knowledge that dies between sessions stays alive here

### Rules

- **Read this file on session startup.** Check Active Agents, Warnings, and recent Learnings/Gotchas before writing code.
- **Register yourself** in Active Agents when you start. Deregister when you're done.
- **Append, don't overwrite** Learnings, Gotchas, and Session Log. Newest entries go at the top.
- **Timestamp everything.** `YYYY-MM-DD` minimum.
- **Be specific.** "Auth is broken" is useless. "Magic link redirect loses the return URL when the session token expires mid-flow — see authApi.js handleRedirect()" is useful.

### Multi-Tab / Multi-Agent

All agents read/write this file. Active Agents is a lightweight lock:
- Check if another agent has claimed the files you need
- If claimed, work on something else or coordinate via Message Board
- Stale entries (>2 hours) can be reclaimed — assume the session ended

---

## Active Agents

| Agent ID | Owner | Working on | Don't touch | Since |
|----------|-------|------------|-------------|-------|

**Currently:** No agents registered.

---

## Warnings

> Breaking changes that will bite you if you don't know about them.

_None yet._

---

## Learnings

> Things we discovered that should persist across sessions. Not "what changed" but "what we now know."
>
> ```
> ### [Short title] — YYYY-MM-DD
> **Context:** What we were doing
> **Discovery:** The actual insight
> **Evidence:** File, test, or incident that proves it
> ```

_None yet. First session: add what you discover._

---

## Gotchas

> Mistakes made so the next agent doesn't repeat them.
>
> ```
> ### [What went wrong] — YYYY-MM-DD
> **Tried:** What seemed like it should work
> **Why it failed:** Root cause
> **Correct approach:** What to do instead
> ```

_None yet. First session: document your first mistake here._

---

## Session Log

> What each session accomplished. New sessions scan this to catch up.
>
> ```
> ### YYYY-MM-DD — [Owner] — [5-word summary]
> - What was done
> - What was learned
> - What's unfinished
> - **Handoff:** What the next session should know
> ```

_No sessions yet._

---

## Message Board

> Free-form messages between agents/owners. Newest first.

_No messages yet._

---

## What Goes Where

| I discovered something non-obvious | Learnings |
|---|---|
| I made a mistake worth documenting | Gotchas |
| I'm starting work and need to claim files | Active Agents |
| I finished a session | Session Log |
| I need to tell another agent something | Message Board |
| I made a breaking change | Warnings |
