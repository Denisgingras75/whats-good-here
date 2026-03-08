# Jitter Input Component — Design Doc

**Date:** 2026-02-27
**Goal:** Extract a standalone `<JitterInput>` component that captures typing biometrics, upgrade the capture engine with three research-backed signals, build display surfaces for session stats and cumulative identity, and lay the groundwork for Jitter as an embeddable widget other sites can use.

---

## 1. Component: `<JitterInput>`

Self-contained React component that replaces any `<textarea>`. Runs biometric capture internally. Exposes session stats via callback. Renders optional inline badge.

**API:**
```jsx
<JitterInput
  value={text}
  onChange={setText}
  onStatsUpdate={(sessionStats) => {}}
  placeholder="Write your review..."
  showBadge={true}
  minCharsForStats={20}
  userId={user?.id}
/>
```

**Internally:** Wraps `<textarea>`, attaches upgraded `usePurityTracker`, computes stats in real time, renders `<SessionBadge>` below the input when `showBadge` is true.

**Session stats object exposed:**
```js
{
  keystrokes: 247,
  purity: 97.2,
  wpm: 62,
  consistency: null,  // null until submitted & compared to profile
  duration: 184,      // seconds
  editRatio: 0.18,    // backspaces / total keystrokes
  isCapturing: true,
}
```

**Zero WGH-specific dependencies inside the component.** No WGH API calls, no WGH theme tokens. Stats flow out via callback — parent decides what to do with them. This is the path to standalone npm extraction.

---

## 2. Biometric Capture Upgrades

Three additions to `usePurityTracker`, based on keystroke dynamics research. Drops two weak signals.

### 2a. ADD: DD Time (Down-Down Interval)

Key1 keydown timestamp → Key2 keydown timestamp. Different signal from flight time (which is key1 up → key2 down). Research treats DD time as co-equal with flight and dwell.

**Implementation:** Already tracking keydown events. Store previous keydown timestamp, compute delta on next keydown. Track mean + std like existing flight/dwell.

**Output field:** `mean_dd_time`, `std_dd_time`

### 2b. ADD: Per-Key Dwell Times

Instead of one global `mean_dwell`, track dwell time for the 10 most common English keys: `e, t, a, o, i, n, s, r, h, l`.

Your 'e' hold time is YOUR 'e' hold time. This is the single biggest accuracy improvement we can make — research shows per-key dwell is significantly more discriminative than global averages.

**Implementation:** Object mapping key → { sum, count, mean } updated on each keyup. Computed into per-key averages in `getJitterProfile()`.

**Output field:** `per_key_dwell: { e: 98, t: 112, a: 105, ... }` (ms averages)

### 2c. ADD: Mouse Path to Submit

When user moves mouse toward the Submit button, capture the path shape. Humans curve. Bots go straight.

**Implementation:** On mouseenter of the submit area (or on submit click), sample the last N mouse positions (captured via mousemove listener on the component). Compute:
- Path linearity (straight line distance / actual path distance). Humans ≈ 0.6–0.8, bots ≈ 0.95–1.0.
- Average speed, speed variance.

**Output field:** `mouse_path: { linearity: 0.72, avgSpeed: 340, speedVariance: 0.45 }`

### 2d. DROP: Fatigue Drift

Noisy, hard to normalize across different session lengths, weak identity signal. Remove from profile accumulation. Can keep in raw samples for future analysis but don't use for scoring.

### 2e. DROP: Hour of Day

Fun fact, not a biometric signal. Remove from profile accumulation.

### 2f. KEEP + IMPROVE: Edit Ratio

Already tracking backspaces. Compute `backspaces / total_keystrokes` as a ratio. Heavy editors vs clean typists — behavioral pattern that's hard to fake consistently.

**Output field:** `edit_ratio: 0.18`

### 2g. KEEP + IMPROVE: Pause Frequency

Pauses > 2 seconds per 100 keystrokes. Cognitive rhythm signal.

**Output field:** `pause_freq: 3.2` (pauses per 100 keystrokes)

---

## 3. Display Components

### 3a. `<SessionBadge>` — Live stats below the type box

Appears after `minCharsForStats` (20 chars). Small, muted, bottom of textarea. Updates in real time as user types. Session stats only.

**Shows:**
| Stat | Example |
|---|---|
| Keystrokes | `247` |
| Purity | `97%` |
| Speed | `62 WPM` |

Not distracting. Feels like a fitness tracker quietly counting.

### 3b. `<SessionCard>` — Post-submission baseball card

Appears after review submission. The dopamine/gamification moment.

**Headline row (the PPG/APG/RPG):**
- **Purity: 97%** — how human this session was
- **Consistency: 0.82** — match to your typing signature
- **Sessions: 47** — total verified submissions
- **WPM: 62** — typing speed
- **Edit Ratio: 18%** — your editing style
- **Trust: Verified** — the verdict

**Expandable detail section (tap to reveal):**
- Per-key dwell times (your key fingerprint)
- DD time distribution
- Bigram signature highlights (fastest/slowest letter combos)
- Mouse path linearity score
- Pause frequency
- Session vs profile comparison (delta arrows ↑↓)
- Keystroke entropy

### 3c. `<TrustBadge>` — Upgraded (on reviews, next to reviewer name)

Current badge stays. Gains hover/tap popover showing reviewer's cumulative stats:

| Stat | Value |
|---|---|
| Verified sessions | 47 |
| Consistency | 0.82 |
| Avg purity | 96% |
| Member since | Jan 2026 |
| Trust level | Verified Human |

### 3d. `<ProfileJitterCard>` — Full card on /profile page

The permanent record. Everything.

- All headline stats (cumulative)
- Per-key dwell signature (visual — small bar chart of your key timings)
- Consistency trend over last 10 sessions
- Badge earned + progress to next tier
- Total lifetime keystrokes
- Avg session length
- Full deep stats expandable

---

## 4. Data Flow

```
User types in <JitterInput>
       ↓
Upgraded usePurityTracker captures:
  - Flight time, DD time, per-key dwell
  - Bigram signatures, edit ratio, pause frequency
  - Mouse path sampling
       ↓
<SessionBadge> updates live (keystrokes, purity, WPM)
       ↓
User submits review
       ↓
JitterInput fires onSubmit with full session profile
       ↓
ReviewFlow sends to votesApi.submitVote()
  - vote data + purity + upgraded jitter sample
       ↓
DB trigger (jitter_sample_merge) merges into jitter_profiles:
  - Weighted running averages for all metrics
  - Per-key dwell averages merged
  - DD time averages merged
  - Mouse linearity averaged
  - Confidence level updated (low/medium/high)
  - Consistency score recomputed
       ↓
Client fetches updated profile (get_my_jitter_profile RPC)
       ↓
<SessionCard> renders with session + cumulative stats
       ↓
On review display: <TrustBadge> shows cumulative with hover popover
```

---

## 5. Schema Changes

### 5a. Add `created_at` to `jitter_profiles`

Needed for "Member since" display on badges and profile.

```sql
ALTER TABLE jitter_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
```

### 5b. New RPC: `get_my_jitter_profile()`

Returns authenticated user's full profile. Used by profile page and post-submission card.

```sql
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

### 5c. Update merge trigger

Extend `jitter_sample_merge` to handle new fields:
- Merge `mean_dd_time` / `std_dd_time` via weighted running average
- Merge `per_key_dwell` object (per-key weighted averages)
- Merge `mouse_path.linearity` average
- Merge `edit_ratio` average
- Merge `pause_freq` average
- Drop `fatigue_drift` and `hour_of_day` from profile accumulation

---

## 6. File Structure

```
src/components/jitter/
  JitterInput.jsx          # Standalone type box component
  SessionBadge.jsx         # Live stats below textarea
  SessionCard.jsx          # Post-submission baseball card
  ProfileJitterCard.jsx    # Full profile page card
  TrustBadge.jsx           # Upgraded (moved from components/)
  index.js                 # Barrel export
```

Existing files modified:
- `src/hooks/usePurityTracker.js` — add DD time, per-key dwell, mouse path, edit ratio, pause freq; drop fatigue drift, hour of day
- `src/components/ReviewFlow.jsx` — swap textarea for `<JitterInput>`, add `<SessionCard>` post-submit
- `src/api/votesApi.js` — pass upgraded jitter data
- `src/api/jitterApi.js` — add `getMyProfile()` using new RPC
- `src/pages/Profile.jsx` — add `<ProfileJitterCard>`
- `supabase/schema.sql` — new RPC, updated trigger, `created_at` column

---

## 7. Verification Thresholds (unchanged)

| Level | Reviews | Consistency | Badge |
|---|---|---|---|
| Low | 0–4 | any | "Building verification" |
| Medium | 5–14 | >= 0.4 | "Verified Human" |
| High | 15+ | >= 0.6 | "Trusted Reviewer" |

---

## 8. Path to Standalone Widget

This design intentionally enables extraction:
- `<JitterInput>` has zero WGH dependencies
- The hook runs internally — no external wiring
- Stats flow out via callback — any site decides display
- Future: extract `jitter/` into npm package, swap Supabase for generic API adapter
- The component IS the product. WGH is dogfooding it.

---

## 9. What This Does NOT Include (future phases)

- Browser extension (Layer 3)
- Cross-site passport (requires auth system beyond WGH)
- Verification API for external consumers (Layer 4)
- Trigraph timing (add when user base validates it)
- Mobile sensor data (platform limitation)
- Deep learning matching (statistics-based approach is sufficient for v1)
- npm package extraction (architecture supports it, but not shipping externally yet)
