# Jitter Input Component — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract a standalone `<JitterInput>` component, upgrade biometric capture with 3 new signals (DD time, per-key dwell, mouse path), build display components (SessionBadge, SessionCard, TrustBadge popover, ProfileJitterCard), and wire everything into WGH's review flow and profile page.

**Architecture:** Self-contained `<JitterInput>` wraps textarea + upgraded `usePurityTracker`. Stats flow out via callback. Display components consume stats. DB trigger merges new metrics. Zero WGH-specific dependencies inside the component — ready for future npm extraction.

**Tech Stack:** React 19, Supabase (PostgreSQL triggers + RPCs), Tailwind (layout only), CSS variables (all colors).

**Design doc:** `docs/plans/2026-02-27-jitter-input-component-design.md`

---

## Task 1: Upgrade usePurityTracker — Add DD Time + Per-Key Dwell + Edit Ratio + Pause Frequency

**Files:**
- Modify: `src/hooks/usePurityTracker.js`

**Step 1: Add new tracking constants and data fields**

Add after line 25 (`FATIGUE_WINDOW_COUNT`):
```js
// Pause threshold (ms) — gaps longer than this count as cognitive pauses
const PAUSE_THRESHOLD_MS = 2000
// Top 10 English keys for per-key dwell tracking
const TRACKED_KEYS = ['e', 't', 'a', 'o', 'i', 'n', 's', 'r', 'h', 'l']
```

Update the `dataRef` initialization (line 47–59) to add new fields:
```js
const dataRef = useRef({
  humanChars: 0,
  alienChars: 0,
  flightTimes: [],
  dwellTimes: [],
  ddTimes: [],             // NEW: down-down intervals
  bigramTimings: {},
  fatigueWindows: [],
  lastKeyTime: 0,
  lastKeyChar: '',
  lastKeyDownTime: 0,      // NEW: for DD time calculation
  keyDownTimes: {},
  perKeyDwells: {},         // NEW: { e: [times], t: [times], ... }
  totalKeystrokes: 0,
  backspaceCount: 0,        // NEW: for edit ratio
  pauseCount: 0,            // NEW: pauses > 2s
  sessionStartTime: Date.now(),
})
```

**Step 2: Update handleKeydown to capture DD time, backspaces, and pauses**

In `handleKeydown` (line 143), add DD time tracking. Before the flight time check (line 162), add:
```js
// Track DD time (keydown to keydown) — different signal from flight time
if (data.lastKeyDownTime > 0) {
  const dd = now - data.lastKeyDownTime
  if (dd >= MIN_FLIGHT_MS && dd <= MAX_FLIGHT_MS) {
    data.ddTimes.push(dd)
    if (data.ddTimes.length > MAX_FLIGHT_TIMES) {
      data.ddTimes.shift()
    }
  }
}
data.lastKeyDownTime = now
```

Before the `humanChars++` line (153), add backspace counting by moving the EDITING_KEYS check:
```js
// Count backspaces for edit ratio (before filtering editing keys)
if (e.key === 'Backspace' || e.key === 'Delete') {
  data.backspaceCount++
  return // still skip for flight/dwell tracking
}
```

Note: The existing `EDITING_KEYS.has(e.key)` return at line 149 already catches Backspace — move the backspace count BEFORE that return. The flow becomes:
1. Skip modifier keys (ctrl/meta/alt)
2. Count backspaces, then return
3. Skip other editing keys
4. Skip non-printable

For pause frequency, add in the flight time section (after line 163):
```js
// Track cognitive pauses (> 2s gaps)
if (flight > PAUSE_THRESHOLD_MS) {
  data.pauseCount++
}
```

Wait — flight times are already filtered to `MAX_FLIGHT_MS` (2000ms). Pauses > 2s will be filtered OUT by the existing `flight <= MAX_FLIGHT_MS` check. So track pauses BEFORE the filter:
```js
// Record flight time — but first check for cognitive pause
if (data.lastKeyTime > 0) {
  const rawFlight = now - data.lastKeyTime
  // Track cognitive pauses (> 2s = thinking break)
  if (rawFlight > PAUSE_THRESHOLD_MS) {
    data.pauseCount++
  }
  // Only keep flights within bounds for biometric averaging
  if (rawFlight >= MIN_FLIGHT_MS && rawFlight <= MAX_FLIGHT_MS) {
    // ... existing flight time push logic
  }
}
```

**Step 3: Update handleKeyup to capture per-key dwell times**

After existing dwell tracking (line 211–218), add per-key tracking:
```js
// Track per-key dwell for fingerprint keys
if (TRACKED_KEYS.includes(keyLower)) {
  if (!data.perKeyDwells[keyLower]) {
    data.perKeyDwells[keyLower] = []
  }
  data.perKeyDwells[keyLower].push(dwell)
  // Keep last 50 per key
  if (data.perKeyDwells[keyLower].length > 50) {
    data.perKeyDwells[keyLower].shift()
  }
}
```

**Step 4: Update getJitterProfile to output new fields**

Replace the return object (lines 130–140) with:
```js
// DD time stats
const meanDdTime = data.ddTimes.length > 0 ? Math.round(calcMean(data.ddTimes) * 100) / 100 : null
const stdDdTime = data.ddTimes.length > 1 ? Math.round(calcStd(data.ddTimes) * 100) / 100 : null

// Per-key dwell averages
const perKeyDwell = {}
for (const key of TRACKED_KEYS) {
  const times = data.perKeyDwells[key]
  if (times && times.length >= 2) {
    perKeyDwell[key] = Math.round(calcMean(times) * 100) / 100
  }
}

// Edit ratio: backspaces / total keystrokes
const editRatio = data.totalKeystrokes > 0
  ? Math.round((data.backspaceCount / (data.totalKeystrokes + data.backspaceCount)) * 1000) / 1000
  : 0

// Pause frequency: pauses per 100 keystrokes
const pauseFreq = data.totalKeystrokes > 0
  ? Math.round((data.pauseCount / data.totalKeystrokes) * 100 * 100) / 100
  : 0

return {
  total_keystrokes: totalKeystrokes,
  mean_inter_key: meanInterKey,
  std_inter_key: stdInterKey,
  mean_dwell: meanDwell,
  std_dwell: stdDwell,
  mean_dd_time: meanDdTime,
  std_dd_time: stdDdTime,
  per_key_dwell: perKeyDwell,
  bigram_signatures: bigramSignatures,
  edit_ratio: editRatio,
  pause_freq: pauseFreq,
  sample_size: flightTimes.length,
}
```

Note: `fatigue_drift` and `hour_of_day` are removed from the output. The fatigue window tracking code (lines 181–191) can stay in the capture logic for now but won't be sent to the server.

**Step 5: Add a getSessionStats callback for live display**

Add a new export function that returns lightweight stats for the SessionBadge:
```js
const getSessionStats = useCallback(() => {
  const data = dataRef.current
  const total = data.humanChars + data.alienChars
  const purity = total >= MIN_CHARS_FOR_SCORE
    ? Math.round((data.humanChars / total) * 100)
    : null
  const duration = Math.round((Date.now() - data.sessionStartTime) / 1000)
  const minutes = duration / 60
  const wpm = minutes > 0 && data.totalKeystrokes > 0
    ? Math.round((data.totalKeystrokes / 5) / minutes)  // standard WPM: chars/5 / minutes
    : 0
  const editRatio = data.totalKeystrokes > 0
    ? Math.round((data.backspaceCount / (data.totalKeystrokes + data.backspaceCount)) * 100)
    : 0

  return {
    keystrokes: data.totalKeystrokes,
    purity,
    wpm,
    duration,
    editRatio,
    isCapturing: data.totalKeystrokes >= MIN_CHARS_FOR_SCORE,
  }
}, [])
```

Update the return statement (line 312):
```js
return { getPurity, getJitterProfile, getSessionStats, attachToTextarea, reset }
```

**Step 6: Update reset to clear new fields**

Update the `reset` callback (lines 281–295) to include:
```js
ddTimes: [],
lastKeyDownTime: 0,
perKeyDwells: {},
backspaceCount: 0,
pauseCount: 0,
```

**Step 7: Run build to verify**

Run: `cd /Users/denisgingras/whats-good-here && npm run build`
Expected: Build succeeds with no errors.

**Step 8: Commit**

```bash
git add src/hooks/usePurityTracker.js
git commit -m "feat(jitter): upgrade biometric capture — DD time, per-key dwell, edit ratio, pause freq

Drop fatigue_drift and hour_of_day from output. Add getSessionStats for live display."
```

---

## Task 2: Update Schema — New RPC + Trigger Upgrade

**Files:**
- Modify: `supabase/schema.sql`
- Run in: Supabase SQL Editor

**Step 1: Add created_at to jitter_profiles in schema.sql**

Find the `jitter_profiles` table definition (around line 278) and add:
```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
```
after the `flagged` line.

**Step 2: Add get_my_jitter_profile RPC to schema.sql**

Add after `get_jitter_badges` (after line 584):
```sql
-- Get authenticated user's full jitter profile (for profile page + post-submission card)
CREATE OR REPLACE FUNCTION get_my_jitter_profile()
RETURNS TABLE (
  confidence_level TEXT,
  consistency_score DECIMAL,
  review_count INT,
  profile_data JSONB,
  created_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ
) AS $$
  SELECT jp.confidence_level, jp.consistency_score, jp.review_count,
         jp.profile_data, jp.created_at, jp.last_updated
  FROM jitter_profiles jp
  WHERE jp.user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;
```

**Step 3: Update merge_jitter_sample trigger in schema.sql**

Replace the `profile_data` merge object in the UPDATE statement (lines 2096–2126) with:
```sql
      profile_data = jsonb_build_object(
        'mean_inter_key', ROUND((
          COALESCE((existing_profile->>'mean_inter_key')::DECIMAL, 0) * (sample_count - 1) +
          COALESCE((new_sample->>'mean_inter_key')::DECIMAL, 0)
        ) / sample_count, 2),
        'std_inter_key', ROUND((
          COALESCE((existing_profile->>'std_inter_key')::DECIMAL, 0) * (sample_count - 1) +
          COALESCE((new_sample->>'std_inter_key')::DECIMAL, 0)
        ) / sample_count, 2),
        'mean_dwell', CASE
          WHEN new_sample ? 'mean_dwell' AND new_sample->>'mean_dwell' IS NOT NULL
          THEN ROUND((
            COALESCE((existing_profile->>'mean_dwell')::DECIMAL, (new_sample->>'mean_dwell')::DECIMAL) * (sample_count - 1) +
            (new_sample->>'mean_dwell')::DECIMAL
          ) / sample_count, 2)
          ELSE existing_profile->'mean_dwell'
        END,
        'std_dwell', CASE
          WHEN new_sample ? 'std_dwell' AND new_sample->>'std_dwell' IS NOT NULL
          THEN ROUND((
            COALESCE((existing_profile->>'std_dwell')::DECIMAL, (new_sample->>'std_dwell')::DECIMAL) * (sample_count - 1) +
            (new_sample->>'std_dwell')::DECIMAL
          ) / sample_count, 2)
          ELSE existing_profile->'std_dwell'
        END,
        'mean_dd_time', CASE
          WHEN new_sample ? 'mean_dd_time' AND new_sample->>'mean_dd_time' IS NOT NULL
          THEN ROUND((
            COALESCE((existing_profile->>'mean_dd_time')::DECIMAL, (new_sample->>'mean_dd_time')::DECIMAL) * (sample_count - 1) +
            (new_sample->>'mean_dd_time')::DECIMAL
          ) / sample_count, 2)
          ELSE existing_profile->'mean_dd_time'
        END,
        'std_dd_time', CASE
          WHEN new_sample ? 'std_dd_time' AND new_sample->>'std_dd_time' IS NOT NULL
          THEN ROUND((
            COALESCE((existing_profile->>'std_dd_time')::DECIMAL, (new_sample->>'std_dd_time')::DECIMAL) * (sample_count - 1) +
            (new_sample->>'std_dd_time')::DECIMAL
          ) / sample_count, 2)
          ELSE existing_profile->'std_dd_time'
        END,
        'per_key_dwell', COALESCE(existing_profile->'per_key_dwell', '{}'::JSONB) ||
                         COALESCE(new_sample->'per_key_dwell', '{}'::JSONB),
        'bigram_signatures', COALESCE(existing_profile->'bigram_signatures', '{}'::JSONB) ||
                             COALESCE(new_sample->'bigram_signatures', '{}'::JSONB),
        'edit_ratio', CASE
          WHEN new_sample ? 'edit_ratio'
          THEN ROUND((
            COALESCE((existing_profile->>'edit_ratio')::DECIMAL, (new_sample->>'edit_ratio')::DECIMAL) * (sample_count - 1) +
            (new_sample->>'edit_ratio')::DECIMAL
          ) / sample_count, 3)
          ELSE existing_profile->'edit_ratio'
        END,
        'pause_freq', CASE
          WHEN new_sample ? 'pause_freq'
          THEN ROUND((
            COALESCE((existing_profile->>'pause_freq')::DECIMAL, (new_sample->>'pause_freq')::DECIMAL) * (sample_count - 1) +
            (new_sample->>'pause_freq')::DECIMAL
          ) / sample_count, 2)
          ELSE existing_profile->'pause_freq'
        END,
        'total_keystrokes', COALESCE((existing_profile->>'total_keystrokes')::INTEGER, 0) +
          COALESCE((new_sample->>'total_keystrokes')::INTEGER, 0)
      ),
```

Note: `fatigue_drift` and `hour_of_day` are removed from the merge. `per_key_dwell` uses JSONB `||` merge (same strategy as bigram_signatures — newest values win per key).

Also update the first-sample INSERT (line 2054) to include `created_at`:
```sql
INSERT INTO jitter_profiles (user_id, profile_data, review_count, confidence_level, consistency_score, created_at, last_updated)
VALUES (NEW.user_id, new_sample, 1, 'low', 0, NOW(), NOW());
```

**Step 4: Run the SQL in Supabase SQL Editor**

Run all three statements:
1. `ALTER TABLE jitter_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();`
2. The `CREATE OR REPLACE FUNCTION get_my_jitter_profile()` statement
3. The updated `CREATE OR REPLACE FUNCTION merge_jitter_sample()` + trigger

**Step 5: Test the new RPC**

In SQL Editor: `SELECT * FROM get_my_jitter_profile();` (while authenticated)
Expected: Returns profile row or empty set.

**Step 6: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat(jitter): add get_my_jitter_profile RPC, upgrade merge trigger with new metrics

Add created_at to jitter_profiles. Merge now handles DD time, per-key dwell,
edit ratio, pause freq. Drops fatigue_drift and hour_of_day."
```

---

## Task 3: Update jitterApi — Use New RPC

**Files:**
- Modify: `src/api/jitterApi.js`

**Step 1: Update getMyProfile to use new RPC and return full data**

Replace the existing `getMyProfile` method (lines 9–26) with:
```js
async getMyProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase.rpc('get_my_jitter_profile')

    if (error) throw createClassifiedError(error)
    // RPC returns an array (RETURNS TABLE) — take first row
    return data?.[0] || null
  } catch (error) {
    logger.error('Failed to get jitter profile:', error)
    throw error.type ? error : createClassifiedError(error)
  }
},
```

**Step 2: Run build to verify**

Run: `cd /Users/denisgingras/whats-good-here && npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/api/jitterApi.js
git commit -m "feat(jitter): update jitterApi to use get_my_jitter_profile RPC"
```

---

## Task 4: Build JitterInput Component + SessionBadge

**Files:**
- Create: `src/components/jitter/JitterInput.jsx`
- Create: `src/components/jitter/SessionBadge.jsx`
- Create: `src/components/jitter/index.js`

**Step 1: Create the barrel export**

Create `src/components/jitter/index.js`:
```js
export { JitterInput } from './JitterInput'
export { SessionBadge } from './SessionBadge'
export { SessionCard } from './SessionCard'
export { ProfileJitterCard } from './ProfileJitterCard'
export { TrustBadge, TrustSummary } from './TrustBadge'
```

Note: SessionCard, ProfileJitterCard, and TrustBadge don't exist yet — they'll be created in later tasks. The barrel is pre-wired.

**Step 2: Create SessionBadge**

Create `src/components/jitter/SessionBadge.jsx`:
```jsx
/**
 * Live session stats shown below the JitterInput textarea.
 * Appears after minChars threshold. Updates in real time.
 * Shows: keystrokes, purity %, WPM.
 */
export function SessionBadge({ stats }) {
  if (!stats || !stats.isCapturing) return null

  return (
    <div
      className="flex items-center gap-3 px-3 py-1.5 mt-1 rounded-lg"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-divider)',
        fontSize: '11px',
        color: 'var(--color-text-tertiary)',
      }}
    >
      <span>{stats.keystrokes} keystrokes</span>
      {stats.purity !== null && (
        <>
          <span style={{ color: 'var(--color-divider)' }}>·</span>
          <span>{stats.purity}% human</span>
        </>
      )}
      {stats.wpm > 0 && (
        <>
          <span style={{ color: 'var(--color-divider)' }}>·</span>
          <span>{stats.wpm} WPM</span>
        </>
      )}
    </div>
  )
}

export default SessionBadge
```

**Step 3: Create JitterInput**

Create `src/components/jitter/JitterInput.jsx`:
```jsx
import { useRef, useEffect, useCallback } from 'react'
import { usePurityTracker } from '../../hooks/usePurityTracker'
import { SessionBadge } from './SessionBadge'

/**
 * Self-contained typing biometrics input.
 * Wraps a textarea, captures keystroke dynamics, exposes session stats.
 * Zero WGH-specific dependencies — ready for standalone extraction.
 *
 * Props:
 *   value        — controlled text value
 *   onChange      — text change handler
 *   onStatsUpdate — called with session stats object on each keystroke batch
 *   showBadge     — show live SessionBadge below input (default true)
 *   placeholder   — textarea placeholder
 *   maxLength     — max character count
 *   rows          — initial textarea rows
 *   onFocus       — focus handler
 *   id            — textarea id
 *   className     — additional classes for the textarea
 *   style         — additional styles for the textarea
 *   ariaLabel     — accessibility label
 *   ariaDescribedby — accessibility description
 *   ariaInvalid   — accessibility invalid state
 */
export function JitterInput({
  value,
  onChange,
  onStatsUpdate,
  showBadge = true,
  placeholder,
  maxLength,
  rows = 1,
  onFocus,
  id,
  className = '',
  style = {},
  ariaLabel,
  ariaDescribedby,
  ariaInvalid,
}) {
  const { getPurity, getJitterProfile, getSessionStats, attachToTextarea, reset } = usePurityTracker()
  const statsIntervalRef = useRef(null)

  // Expose biometric getters via ref-stable functions
  const gettersRef = useRef({ getPurity, getJitterProfile, getSessionStats, reset })
  gettersRef.current = { getPurity, getJitterProfile, getSessionStats, reset }

  // Poll session stats for live display (every 500ms while typing)
  useEffect(() => {
    if (!onStatsUpdate && !showBadge) return

    statsIntervalRef.current = setInterval(() => {
      const stats = gettersRef.current.getSessionStats()
      onStatsUpdate?.(stats)
    }, 500)

    return () => {
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current)
    }
  }, [onStatsUpdate, showBadge])

  // Combined ref for textarea
  const textareaRef = useRef(null)
  const setRef = useCallback((el) => {
    textareaRef.current = el
    attachToTextarea(el)
  }, [attachToTextarea])

  // Expose getters to parent via a stable ref pattern
  // Parent accesses via: jitterRef.current.getPurity(), etc.
  const jitterRef = useRef({ getPurity, getJitterProfile, getSessionStats, reset })
  jitterRef.current = { getPurity, getJitterProfile, getSessionStats, reset }

  // Store latest stats for badge display
  const statsRef = useRef(null)
  useEffect(() => {
    const id = setInterval(() => {
      statsRef.current = gettersRef.current.getSessionStats()
    }, 500)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <textarea
        ref={setRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        maxLength={maxLength}
        rows={rows}
        className={`w-full p-4 rounded-xl text-sm resize-none focus:outline-none focus-ring ${className}`}
        style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-divider)',
          color: 'var(--color-text-primary)',
          ...style,
        }}
      />
      {showBadge && <SessionBadge stats={gettersRef.current.getSessionStats()} />}
    </div>
  )
}

// Expose biometric getters for parent components
JitterInput.useJitterRef = function useJitterRef() {
  const ref = useRef({ getPurity: null, getJitterProfile: null, getSessionStats: null, reset: null })
  return ref
}

export default JitterInput
```

Wait — this approach has a problem. The parent (ReviewFlow) needs to call `getPurity()` and `getJitterProfile()` at submit time, but those functions live inside JitterInput. We need to expose them.

Better approach: Use `React.forwardRef` + `useImperativeHandle` to expose the biometric getters:

```jsx
import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { usePurityTracker } from '../../hooks/usePurityTracker'
import { SessionBadge } from './SessionBadge'

/**
 * Self-contained typing biometrics input.
 * Wraps a textarea, captures keystroke dynamics, exposes session stats.
 * Zero WGH-specific dependencies — ready for standalone extraction.
 *
 * Ref methods:
 *   ref.current.getPurity()        — purity snapshot
 *   ref.current.getJitterProfile() — full biometric profile for submission
 *   ref.current.getSessionStats()  — lightweight live stats
 *   ref.current.reset()            — reset tracking data
 */
export const JitterInput = forwardRef(function JitterInput({
  value,
  onChange,
  onStatsUpdate,
  showBadge = true,
  placeholder,
  maxLength,
  rows = 1,
  onFocus,
  id,
  className = '',
  style = {},
  ariaLabel,
  ariaDescribedby,
  ariaInvalid,
}, ref) {
  const { getPurity, getJitterProfile, getSessionStats, attachToTextarea, reset } = usePurityTracker()
  const [liveStats, setLiveStats] = useState(null)

  // Expose biometric methods to parent via ref
  useImperativeHandle(ref, () => ({
    getPurity,
    getJitterProfile,
    getSessionStats,
    reset,
  }), [getPurity, getJitterProfile, getSessionStats, reset])

  // Poll session stats for live badge display
  useEffect(() => {
    if (!showBadge && !onStatsUpdate) return

    const interval = setInterval(() => {
      const stats = getSessionStats()
      setLiveStats(stats)
      onStatsUpdate?.(stats)
    }, 500)

    return () => clearInterval(interval)
  }, [showBadge, onStatsUpdate, getSessionStats])

  // Textarea ref callback
  const setTextareaRef = useCallback((el) => {
    attachToTextarea(el)
  }, [attachToTextarea])

  return (
    <div>
      <textarea
        ref={setTextareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        maxLength={maxLength}
        rows={rows}
        className={`w-full p-4 rounded-xl text-sm resize-none focus:outline-none focus-ring ${className}`}
        style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-divider)',
          color: 'var(--color-text-primary)',
          ...style,
        }}
      />
      {showBadge && <SessionBadge stats={liveStats} />}
    </div>
  )
})

export default JitterInput
```

**Step 4: Run build to verify**

Run: `cd /Users/denisgingras/whats-good-here && npm run build`
Expected: Build succeeds (unused barrel imports may warn — that's fine).

**Step 5: Commit**

```bash
git add src/components/jitter/
git commit -m "feat(jitter): create JitterInput component + SessionBadge

Self-contained textarea wrapper with biometric capture.
Exposes getPurity/getJitterProfile/reset via ref.
SessionBadge shows live keystroke/purity/WPM stats."
```

---

## Task 5: Wire JitterInput into ReviewFlow

**Files:**
- Modify: `src/components/ReviewFlow.jsx`

**Step 1: Replace textarea with JitterInput**

Update imports (line 5): Replace `usePurityTracker` import with JitterInput:
```js
import { JitterInput } from './jitter'
```

Remove line 5: `import { usePurityTracker } from '../hooks/usePurityTracker'`

Add a ref for the JitterInput (after line 49):
```js
const jitterRef = useRef(null)
```

Remove line 24: `const { getPurity, getJitterProfile, attachToTextarea, reset: resetPurity } = usePurityTracker()`

Remove the `combinedTextareaRef` callback (lines 51–54). Replace with:
```js
const combinedTextareaRef = (el) => {
  reviewTextareaRef.current = el
}
```

Update `doSubmit` (lines 197–199) — change from hook calls to ref calls:
```js
const purityData = reviewTextToSubmit && jitterRef.current ? jitterRef.current.getPurity() : null
const jitterData = reviewTextToSubmit && jitterRef.current ? jitterRef.current.getJitterProfile() : null
```

Update `resetPurity()` call (line 208) to:
```js
jitterRef.current?.reset()
```

**Step 2: Replace the textarea JSX with JitterInput**

Replace the textarea block (lines 406–442) with:
```jsx
<div className="relative">
  <label htmlFor="review-text" className="sr-only">Your review</label>
  <JitterInput
    ref={jitterRef}
    id="review-text"
    value={reviewText}
    onChange={(val) => {
      setReviewText(val)
      if (reviewError) setReviewError(null)
    }}
    onFocus={() => {
      // Expand rows handled by CSS or parent
    }}
    placeholder="What stood out?"
    ariaLabel="Write your review"
    ariaDescribedby={reviewError ? 'review-error' : 'review-char-count'}
    ariaInvalid={!!reviewError}
    maxLength={MAX_REVIEW_LENGTH + 50}
    rows={1}
    showBadge={true}
    style={reviewError ? { border: '2px solid var(--color-primary)' } : {}}
  />
  {reviewText.length > 0 && (
    <div id="review-char-count" className="absolute bottom-2 right-3 text-xs" style={{ color: reviewText.length > MAX_REVIEW_LENGTH ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
      {reviewText.length}/{MAX_REVIEW_LENGTH}
    </div>
  )}
  {reviewError && (
    <p id="review-error" role="alert" className="text-sm text-center mt-1" style={{ color: 'var(--color-primary)' }}>
      {reviewError}
    </p>
  )}
</div>
```

Note: The char count overlay positions `absolute bottom-2 right-3` which was relative to the old textarea's `<div className="relative">`. The JitterInput wraps textarea in its own div, so the char count needs to be inside JitterInput or positioned differently. Simplest fix: keep the char count outside and adjust the positioning to be relative to the outer div. The `<div className="relative">` wrapper already handles this.

**Step 3: Add `useRef` to imports if not already present**

Line 1 already imports `useRef`: `import { useState, useEffect, useRef } from 'react'`

**Step 4: Run build to verify**

Run: `cd /Users/denisgingras/whats-good-here && npm run build`
Expected: Build succeeds. No `usePurityTracker` import remaining in ReviewFlow.

**Step 5: Commit**

```bash
git add src/components/ReviewFlow.jsx
git commit -m "feat(jitter): wire JitterInput into ReviewFlow

Replace raw textarea + usePurityTracker with self-contained JitterInput.
Live SessionBadge shows stats as user types."
```

---

## Task 6: Build SessionCard (Post-Submission Baseball Card)

**Files:**
- Create: `src/components/jitter/SessionCard.jsx`
- Modify: `src/components/ReviewFlow.jsx`

**Step 1: Create SessionCard**

Create `src/components/jitter/SessionCard.jsx`:
```jsx
import { useState } from 'react'

/**
 * Post-submission baseball card showing session + cumulative stats.
 * Headline stats (PPG/APG/RPG equivalent), expandable deep stats.
 */
export function SessionCard({ sessionStats, profileStats, onDismiss }) {
  const [expanded, setExpanded] = useState(false)

  if (!sessionStats) return null

  const badgeType = profileStats
    ? getBadgeLabel(profileStats.confidence_level, profileStats.consistency_score)
    : 'Building...'

  return (
    <div
      className="p-4 rounded-xl space-y-3 animate-fadeIn"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-divider)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent-gold)' }}>
          Session Stats
        </span>
        {onDismiss && (
          <button onClick={onDismiss} className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            ✕
          </button>
        )}
      </div>

      {/* Headline stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <StatBox label="Purity" value={sessionStats.purity != null ? `${sessionStats.purity}%` : '—'} />
        <StatBox
          label="Consistency"
          value={profileStats?.consistency_score != null ? profileStats.consistency_score.toFixed(2) : '—'}
        />
        <StatBox label="Sessions" value={profileStats?.review_count || 1} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <StatBox label="WPM" value={sessionStats.wpm || '—'} />
        <StatBox label="Edit Ratio" value={`${sessionStats.editRatio || 0}%`} />
        <StatBox label="Trust" value={badgeType} highlight />
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-xs text-center py-1"
        style={{ color: 'var(--color-accent-gold)' }}
      >
        {expanded ? 'Hide details ▲' : 'Show details ▼'}
      </button>

      {/* Deep stats */}
      {expanded && (
        <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--color-divider)' }}>
          <DetailRow label="Keystrokes" value={sessionStats.keystrokes} />
          <DetailRow label="Duration" value={`${Math.round(sessionStats.duration / 60)}m ${sessionStats.duration % 60}s`} />
          {profileStats?.profile_data && (
            <>
              <DetailRow label="Avg inter-key" value={`${profileStats.profile_data.mean_inter_key || '—'}ms`} />
              <DetailRow label="Avg dwell" value={`${profileStats.profile_data.mean_dwell || '—'}ms`} />
              <DetailRow label="DD time" value={`${profileStats.profile_data.mean_dd_time || '—'}ms`} />
              <DetailRow label="Pause freq" value={`${profileStats.profile_data.pause_freq || '—'}/100ks`} />
              <DetailRow label="Lifetime keystrokes" value={profileStats.profile_data.total_keystrokes || '—'} />
              {profileStats.profile_data.per_key_dwell && (
                <div>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Key fingerprint</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(profileStats.profile_data.per_key_dwell).map(([key, ms]) => (
                      <span
                        key={key}
                        className="px-1.5 py-0.5 rounded text-xs font-mono"
                        style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)' }}
                      >
                        {key}:{Math.round(ms)}ms
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function StatBox({ label, value, highlight }) {
  return (
    <div className="py-1">
      <div
        className="text-base font-bold"
        style={{ color: highlight ? 'var(--color-rating)' : 'var(--color-text-primary)' }}
      >
        {value}
      </div>
      <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{label}</div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
      <span className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>{value}</span>
    </div>
  )
}

function getBadgeLabel(confidence, consistency) {
  if (confidence === 'high' && consistency >= 0.6) return 'Trusted'
  if (confidence === 'medium' && consistency >= 0.4) return 'Verified'
  return 'Building'
}

export default SessionCard
```

**Step 2: Wire SessionCard into ReviewFlow**

In ReviewFlow, add state for post-submission card display. After the existing state declarations (around line 48):
```js
const [sessionCardData, setSessionCardData] = useState(null)
```

In `doSubmit` (around line 198), capture session stats BEFORE resetting:
```js
// Capture session stats for the baseball card
const sessionStatsData = jitterRef.current?.getSessionStats() || null
```

After the `submitVote` call succeeds (inside the `.then` at line 222), fetch the updated profile and show the card:
```js
.then(async (result) => {
  if (result.success && sessionStatsData?.isCapturing) {
    // Fetch updated profile for the card
    try {
      const profile = await jitterApi.getMyProfile()
      setSessionCardData({ sessionStats: sessionStatsData, profileStats: profile })
    } catch (e) {
      // Non-critical — show card with session stats only
      setSessionCardData({ sessionStats: sessionStatsData, profileStats: null })
    }
  }
  if (!result.success) {
    logger.error('Vote submission failed:', result.error)
  }
})
```

Add the SessionCard import and render it in the "already voted" section (after line 258, inside the `userVote !== null` block):
```jsx
{sessionCardData && (
  <SessionCard
    sessionStats={sessionCardData.sessionStats}
    profileStats={sessionCardData.profileStats}
    onDismiss={() => setSessionCardData(null)}
  />
)}
```

Add import at top:
```js
import { JitterInput, SessionCard } from './jitter'
```
(Update the existing JitterInput import to include SessionCard.)

Also import jitterApi:
```js
import { jitterApi } from '../api/jitterApi'
```

**Step 3: Run build**

Run: `cd /Users/denisgingras/whats-good-here && npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/jitter/SessionCard.jsx src/components/ReviewFlow.jsx
git commit -m "feat(jitter): add SessionCard post-submission baseball card

Shows headline stats (purity, consistency, sessions, WPM, edit ratio, trust).
Expandable deep stats with per-key dwell fingerprint."
```

---

## Task 7: Upgrade TrustBadge with Hover Popover

**Files:**
- Modify: `src/components/TrustBadge.jsx` (keep in place, update barrel to re-export)
- Modify: `src/components/jitter/index.js`

**Step 1: Add popover to TrustBadge**

Update `src/components/TrustBadge.jsx`. Add state for popover:

```jsx
import { useState, useRef } from 'react'

export function TrustBadge({ type, size = 'sm', profileData }) {
  const [showPopover, setShowPopover] = useState(false)
  const badgeRef = useRef(null)

  if (!type) return null

  // ... existing configs object stays the same ...

  const config = configs[type]
  if (!config) return null

  const fontSize = size === 'sm' ? '11px' : '12px'
  const padding = size === 'sm' ? '2px 6px' : '3px 8px'

  return (
    <span
      ref={badgeRef}
      className="inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap relative cursor-pointer"
      style={{
        fontSize,
        padding,
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
      title={config.label}
      onClick={() => profileData && setShowPopover(!showPopover)}
      onMouseEnter={() => profileData && setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <span style={{ fontSize: size === 'sm' ? '10px' : '11px' }}>{config.icon}</span>
      {config.label}

      {/* Popover with cumulative stats */}
      {showPopover && profileData && (
        <div
          className="absolute left-0 top-full mt-1 p-3 rounded-lg shadow-lg z-50"
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-divider)',
            minWidth: '160px',
            fontSize: '11px',
          }}
        >
          <div className="space-y-1.5">
            {profileData.review_count != null && (
              <PopoverRow label="Verified sessions" value={profileData.review_count} />
            )}
            {profileData.consistency_score != null && (
              <PopoverRow label="Consistency" value={Number(profileData.consistency_score).toFixed(2)} />
            )}
            {profileData.created_at && (
              <PopoverRow label="Member since" value={formatMemberSince(profileData.created_at)} />
            )}
            <PopoverRow label="Trust level" value={config.label} />
          </div>
        </div>
      )}
    </span>
  )
}

function PopoverRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
    </div>
  )
}

function formatMemberSince(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
```

**Step 2: Update barrel export**

In `src/components/jitter/index.js`, update the TrustBadge export to re-export from the existing location:
```js
export { TrustBadge, TrustSummary } from '../TrustBadge'
```

**Step 3: Pass profile data to TrustBadge in votesApi.getReviewsForDish**

In `src/api/votesApi.js`, the jitter data is already fetched for reviews (line 298–309). The `jitterMap` already has `review_count`, `consistency_score`, `confidence_level`, and `flagged`. We need to also pass this data to the component.

Update the return mapping (lines 312–318) to include the full jitter data:
```js
return data.map(review => ({
  ...review,
  profiles: profileMap[review.user_id] || { id: review.user_id, display_name: null },
  trust_badge: review.source === 'ai_estimated'
    ? 'ai_estimated'
    : jitterApi.getTrustBadgeType(jitterMap[review.user_id] || null),
  jitter_profile: jitterMap[review.user_id] || null,
}))
```

Then wherever TrustBadge is rendered with reviews, pass `profileData={review.jitter_profile}`.

**Step 4: Run build**

Run: `cd /Users/denisgingras/whats-good-here && npm run build`

**Step 5: Commit**

```bash
git add src/components/TrustBadge.jsx src/components/jitter/index.js src/api/votesApi.js
git commit -m "feat(jitter): add hover popover to TrustBadge showing cumulative stats

Shows verified sessions, consistency, member since on hover/tap.
Pass jitter_profile through review data for popover display."
```

---

## Task 8: Build ProfileJitterCard

**Files:**
- Create: `src/components/jitter/ProfileJitterCard.jsx`
- Modify: `src/pages/Profile.jsx`

**Step 1: Create ProfileJitterCard**

Create `src/components/jitter/ProfileJitterCard.jsx`:
```jsx
import { useState } from 'react'

/**
 * Full Jitter identity card for the user's profile page.
 * Shows all cumulative stats, per-key fingerprint, badge progress.
 */
export function ProfileJitterCard({ profile }) {
  const [expanded, setExpanded] = useState(false)

  if (!profile) return null

  const data = profile.profile_data || {}
  const badgeLabel = getBadgeLabel(profile.confidence_level, profile.consistency_score)
  const badgeColor = getBadgeColor(profile.confidence_level, profile.consistency_score)
  const nextTier = getNextTier(profile.confidence_level, profile.review_count, profile.consistency_score)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-divider)',
      }}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent-gold)' }}>
            Typing Identity
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: badgeColor.bg, color: badgeColor.text }}
          >
            {badgeLabel}
          </span>
        </div>

        {/* Headline stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <StatCell label="Sessions" value={profile.review_count || 0} />
          <StatCell label="Consistency" value={profile.consistency_score != null ? Number(profile.consistency_score).toFixed(2) : '—'} />
          <StatCell label="Keystrokes" value={formatNumber(data.total_keystrokes || 0)} />
        </div>
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div className="px-4 py-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: 'var(--color-text-tertiary)' }}>{nextTier.label}</span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>{nextTier.current}/{nextTier.target}</span>
          </div>
          <div className="w-full overflow-hidden" style={{ height: '4px', borderRadius: '2px', background: 'var(--color-surface)' }}>
            <div style={{ width: `${Math.min(100, (nextTier.current / nextTier.target) * 100)}%`, height: '100%', borderRadius: '2px', background: 'var(--color-accent-gold)' }} />
          </div>
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-xs text-center py-2"
        style={{ color: 'var(--color-accent-gold)', borderTop: '1px solid var(--color-divider)' }}
      >
        {expanded ? 'Hide deep stats ▲' : 'Show deep stats ▼'}
      </button>

      {/* Deep stats */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid var(--color-divider)' }}>
          <div className="pt-3 space-y-2">
            <DetailRow label="Avg typing speed" value={`${data.mean_inter_key || '—'}ms between keys`} />
            <DetailRow label="Avg key hold" value={`${data.mean_dwell || '—'}ms`} />
            <DetailRow label="DD interval" value={`${data.mean_dd_time || '—'}ms`} />
            <DetailRow label="Edit ratio" value={data.edit_ratio != null ? `${Math.round(data.edit_ratio * 100)}%` : '—'} />
            <DetailRow label="Pause frequency" value={data.pause_freq != null ? `${data.pause_freq}/100ks` : '—'} />
            {profile.created_at && (
              <DetailRow label="Member since" value={new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
            )}
          </div>

          {/* Per-key fingerprint */}
          {data.per_key_dwell && Object.keys(data.per_key_dwell).length > 0 && (
            <div>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Key fingerprint</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(data.per_key_dwell)
                  .sort(([, a], [, b]) => a - b)
                  .map(([key, ms]) => (
                    <KeyBar key={key} letter={key} ms={ms} max={getMaxDwell(data.per_key_dwell)} />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCell({ label, value }) {
  return (
    <div>
      <div className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{label}</div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
      <span className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>{value}</span>
    </div>
  )
}

function KeyBar({ letter, ms, max }) {
  const width = max > 0 ? Math.max(20, (ms / max) * 100) : 50
  return (
    <div className="flex items-center gap-1" style={{ minWidth: '60px' }}>
      <span className="font-mono font-bold text-xs w-3 text-center" style={{ color: 'var(--color-text-primary)' }}>{letter}</span>
      <div className="flex-1 overflow-hidden" style={{ height: '6px', borderRadius: '3px', background: 'var(--color-surface)' }}>
        <div style={{ width: `${width}%`, height: '100%', borderRadius: '3px', background: 'var(--color-accent-gold)' }} />
      </div>
      <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)', minWidth: '32px', textAlign: 'right' }}>{Math.round(ms)}</span>
    </div>
  )
}

function getMaxDwell(perKeyDwell) {
  const values = Object.values(perKeyDwell)
  return values.length > 0 ? Math.max(...values) : 0
}

function getBadgeLabel(confidence, consistency) {
  if (confidence === 'high' && consistency >= 0.6) return 'Trusted Reviewer'
  if (confidence === 'medium' && consistency >= 0.4) return 'Verified Human'
  if (confidence === 'low') return 'Building Verification'
  return 'New'
}

function getBadgeColor(confidence, consistency) {
  if (confidence === 'high' && consistency >= 0.6) return { bg: 'rgba(34, 197, 94, 0.18)', text: 'var(--color-rating)' }
  if (confidence === 'medium' && consistency >= 0.4) return { bg: 'rgba(34, 197, 94, 0.12)', text: 'var(--color-rating)' }
  return { bg: 'rgba(156, 163, 175, 0.1)', text: 'var(--color-text-tertiary)' }
}

function getNextTier(confidence, reviewCount, consistency) {
  if (confidence === 'high' && consistency >= 0.6) return null // Already at top
  if (confidence === 'medium' || (confidence === 'low' && reviewCount >= 5)) {
    return { label: 'Next: Trusted Reviewer', current: reviewCount, target: 15 }
  }
  return { label: 'Next: Verified Human', current: reviewCount, target: 5 }
}

function formatNumber(n) {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default ProfileJitterCard
```

**Step 2: Wire into Profile page**

In `src/pages/Profile.jsx`, the jitter profile is already fetched (lines 107–118, `jitterProfile` state). Update the import and add the card.

Update import (line 10):
```js
import { jitterApi } from '../api/jitterApi'
```
This is already imported. Now update the `getMyProfile` call to use the new RPC (which returns `profile_data`, `created_at`, `last_updated` in addition to the existing fields).

Add import for ProfileJitterCard:
```js
import { ProfileJitterCard } from '../components/jitter'
```

Add the card in the profile page JSX — find an appropriate location in the rendered output (after the existing TrustBadge usage, before or after the mission section). Add:
```jsx
{jitterProfile && (
  <ProfileJitterCard profile={jitterProfile} />
)}
```

**Step 3: Run build**

Run: `cd /Users/denisgingras/whats-good-here && npm run build`

**Step 4: Commit**

```bash
git add src/components/jitter/ProfileJitterCard.jsx src/pages/Profile.jsx
git commit -m "feat(jitter): add ProfileJitterCard to profile page

Full typing identity card with headline stats, tier progress,
per-key dwell fingerprint visualization, expandable deep stats."
```

---

## Task 9: Add Mouse Path Tracking

**Files:**
- Modify: `src/hooks/usePurityTracker.js`

**Step 1: Add mouse path tracking to the hook**

Add new constants:
```js
// Mouse path sampling
const MOUSE_SAMPLE_INTERVAL = 50 // ms between samples
const MAX_MOUSE_SAMPLES = 50     // last N positions
```

Add mouse tracking fields to `dataRef`:
```js
mousePositions: [],       // NEW: [{x, y, t}, ...]
lastMouseSampleTime: 0,   // NEW
```

Add a `handleMouseMove` callback:
```js
const handleMouseMove = useCallback((e) => {
  const now = performance.now()
  const data = dataRef.current
  if (now - data.lastMouseSampleTime < MOUSE_SAMPLE_INTERVAL) return
  data.lastMouseSampleTime = now
  data.mousePositions.push({ x: e.clientX, y: e.clientY, t: now })
  if (data.mousePositions.length > MAX_MOUSE_SAMPLES) {
    data.mousePositions.shift()
  }
}, [])
```

In `attachToTextarea`, add the mousemove listener to the parent container (or document):
```js
// Mouse path tracking — listen on document for broader capture
document.addEventListener('mousemove', handleMouseMove)
```

In cleanup (both `attachToTextarea` cleanup and unmount effect):
```js
document.removeEventListener('mousemove', handleMouseMove)
```

Add a `getMousePath` function to compute linearity:
```js
const getMousePath = useCallback(() => {
  const positions = dataRef.current.mousePositions
  if (positions.length < 5) return null

  // Compute total path distance and straight-line distance
  let totalDist = 0
  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i].x - positions[i - 1].x
    const dy = positions[i].y - positions[i - 1].y
    totalDist += Math.sqrt(dx * dx + dy * dy)
  }

  const first = positions[0]
  const last = positions[positions.length - 1]
  const straightDist = Math.sqrt(
    (last.x - first.x) ** 2 + (last.y - first.y) ** 2
  )

  const linearity = totalDist > 0 ? Math.round((straightDist / totalDist) * 1000) / 1000 : 1

  // Speed stats
  const totalTime = (last.t - first.t) / 1000 // seconds
  const avgSpeed = totalTime > 0 ? Math.round(totalDist / totalTime) : 0

  return { linearity, avgSpeed }
}, [])
```

Include `mouse_path` in `getJitterProfile` output:
```js
const mousePath = getMousePath()
// ...
return {
  // ... existing fields ...
  mouse_path: mousePath,
}
```

Add `mousePositions` and `lastMouseSampleTime` to `reset()`.

**Step 2: Run build**

Run: `cd /Users/denisgingras/whats-good-here && npm run build`

**Step 3: Commit**

```bash
git add src/hooks/usePurityTracker.js
git commit -m "feat(jitter): add mouse path tracking for linearity analysis

Captures mouse movement, computes path linearity (humans curve, bots go straight)
and average speed. Included in jitter profile submission."
```

---

## Task 10: Final Integration + Build Verification

**Files:**
- Verify: All modified files
- Run: Full build + lint

**Step 1: Verify barrel export is complete**

Check `src/components/jitter/index.js` exports all components:
```js
export { JitterInput } from './JitterInput'
export { SessionBadge } from './SessionBadge'
export { SessionCard } from './SessionCard'
export { ProfileJitterCard } from './ProfileJitterCard'
export { TrustBadge, TrustSummary } from '../TrustBadge'
```

**Step 2: Run full build**

Run: `cd /Users/denisgingras/whats-good-here && npm run build`
Expected: Build succeeds with no errors.

**Step 3: Run lint**

Run: `cd /Users/denisgingras/whats-good-here && npm run lint`
Expected: No new lint errors.

**Step 4: Run tests**

Run: `cd /Users/denisgingras/whats-good-here && npm run test -- --run`
Expected: All existing tests pass.

**Step 5: Manual smoke test checklist**

- [ ] Navigate to a dish detail page
- [ ] Start typing a review — SessionBadge appears below textarea after 20+ chars
- [ ] SessionBadge shows keystrokes, purity %, WPM updating live
- [ ] Submit review — SessionCard baseball card appears with stats
- [ ] SessionCard shows headline row (purity, consistency, sessions, WPM, edit ratio, trust)
- [ ] Tap "Show details" on SessionCard — deep stats expand
- [ ] Navigate to profile page — ProfileJitterCard visible with typing identity
- [ ] Hover/tap a TrustBadge on a review — popover shows cumulative stats

**Step 6: Final commit**

```bash
git add -A
git commit -m "feat(jitter): complete JitterInput integration — all display surfaces wired

SessionBadge live during typing, SessionCard post-submission,
ProfileJitterCard on profile page, TrustBadge hover popover.
Build + lint + tests pass."
```

---

## Summary

| Task | What | Files |
|---|---|---|
| 1 | Upgrade usePurityTracker with DD time, per-key dwell, edit ratio, pause freq | `usePurityTracker.js` |
| 2 | Schema: new RPC + updated merge trigger | `schema.sql` + SQL Editor |
| 3 | Update jitterApi for new RPC | `jitterApi.js` |
| 4 | Create JitterInput + SessionBadge | `jitter/JitterInput.jsx`, `jitter/SessionBadge.jsx`, `jitter/index.js` |
| 5 | Wire JitterInput into ReviewFlow | `ReviewFlow.jsx` |
| 6 | Create SessionCard + wire into ReviewFlow | `jitter/SessionCard.jsx`, `ReviewFlow.jsx` |
| 7 | Upgrade TrustBadge with hover popover | `TrustBadge.jsx`, `votesApi.js` |
| 8 | Create ProfileJitterCard + wire into Profile | `jitter/ProfileJitterCard.jsx`, `Profile.jsx` |
| 9 | Add mouse path tracking | `usePurityTracker.js` |
| 10 | Final integration + build verification | All files |
