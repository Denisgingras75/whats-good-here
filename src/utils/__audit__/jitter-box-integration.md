# JitterBox Integration Guide for ReviewFlow

## Summary

Replace `JitterInput` component + `usePurityTracker` hook with the standalone `JitterBox.attach()` API. JitterBox is a vanilla JS widget — no React dependency, attaches to any textarea.

## Current Flow (JitterInput)

ReviewFlow currently uses `<JitterInput ref={jitterRef}>` which exposes:
- `jitterRef.current.getPurity()` → purity %
- `jitterRef.current.getJitterProfile()` → keystroke profile
- `jitterRef.current.getSessionStats()` → session metadata
- `jitterRef.current.reset()` → clear captured data

These feed into `scoreSession(jitterData)` on submit.

## New Flow (JitterBox)

JitterBox.attach() returns a handle with:
- `handle.score()` → `{ war, classification, flags, purity, profile, session }` (all-in-one)
- `handle.reset()` → clear captured data
- `handle.detach()` → remove listeners

The `score()` return replaces all three old calls (`getPurity`, `getJitterProfile`, `getSessionStats`) AND runs the scorer internally (replaces `scoreSession`).

---

## Code Changes

### 1. Imports

```diff
// ReviewFlow.jsx — top of file

- import { JitterInput, SessionCard } from './jitter'
+ import { SessionCard } from './jitter'
+ import JitterBox from '../utils/jitter-box'
- import { scoreSession } from '../utils/jitterScorer'
```

### 2. Refs

```diff
// Line ~26 — change jitterRef purpose from component ref to JitterBox handle

  const jitterRef = useRef(null)
+ const textareaRef = useRef(null)  // DOM ref for the raw textarea
```

### 3. Attach on mount / detach on unmount

Add a `useEffect` that attaches JitterBox when step 2 is shown (textarea exists):

```jsx
// After the existing useEffect blocks (~line 117)

useEffect(() => {
  if (step !== 2) return
  // Wait one tick for textarea to render
  const raf = requestAnimationFrame(() => {
    const el = textareaRef.current
    if (el && !jitterRef.current) {
      jitterRef.current = JitterBox.attach(el)
    }
  })
  return () => {
    cancelAnimationFrame(raf)
    if (jitterRef.current) {
      jitterRef.current.detach()
      jitterRef.current = null
    }
  }
}, [step])
```

### 4. Replace JitterInput with a plain textarea

```diff
// Line ~427-443 — swap JitterInput for a standard textarea

- <JitterInput
-   ref={jitterRef}
-   id="review-text"
-   value={reviewText}
-   onChange={(val) => {
-     setReviewText(val)
-     if (reviewError) setReviewError(null)
-   }}
-   placeholder="What stood out?"
-   ariaLabel="Write your review"
-   ariaDescribedby={reviewError ? 'review-error' : 'review-char-count'}
-   ariaInvalid={!!reviewError}
-   maxLength={MAX_REVIEW_LENGTH + 50}
-   rows={1}
-   showBadge={true}
-   style={reviewError ? { border: '2px solid var(--color-primary)' } : {}}
- />
+ <textarea
+   ref={textareaRef}
+   id="review-text"
+   value={reviewText}
+   onChange={(e) => {
+     setReviewText(e.target.value)
+     if (reviewError) setReviewError(null)
+   }}
+   placeholder="What stood out?"
+   aria-label="Write your review"
+   aria-describedby={reviewError ? 'review-error' : 'review-char-count'}
+   aria-invalid={!!reviewError}
+   maxLength={MAX_REVIEW_LENGTH + 50}
+   rows={1}
+   className="w-full p-3 rounded-xl resize-none"
+   style={{
+     background: 'var(--color-surface)',
+     color: 'var(--color-text-primary)',
+     border: reviewError ? '2px solid var(--color-primary)' : '1.5px solid var(--color-divider)',
+   }}
+ />
```

### 5. Score on submit

```diff
// Line ~196-201 in doSubmit() — replace three separate calls with one

-   const purityData = reviewTextToSubmit && jitterRef.current ? jitterRef.current.getPurity() : null
-   const jitterData = reviewTextToSubmit && jitterRef.current ? jitterRef.current.getJitterProfile() : null
-   const sessionStatsData = jitterRef.current?.getSessionStats() || null
-   const jitterScore = scoreSession(jitterData)
+   const badge = reviewTextToSubmit && jitterRef.current ? jitterRef.current.score() : null
+   const purityData = badge ? badge.purity : null
+   const jitterData = badge ? badge.profile : null
+   const jitterScore = badge ? { war: badge.war, classification: badge.classification, flags: badge.flags } : null
+   const sessionStatsData = badge ? { isCapturing: true, ...badge.session } : null
```

### 6. Reset stays the same

```jsx
// Line ~210 — no change needed
jitterRef.current?.reset()
```

---

## What You Lose

| Feature | JitterInput | JitterBox | Notes |
|---------|------------|-----------|-------|
| Purity badge UI | Built-in (`showBadge`) | Gone | Re-add if needed as separate component |
| Auto-resize textarea | Built-in | Manual | Add `onInput` handler for auto-grow |
| React-controlled biometrics | Hook-based | Vanilla listeners | Cleaner, no React overhead |

## What You Gain

- Zero React dependency for biometrics — works in any context (web components, vanilla forms)
- Single `score()` call replaces 3 separate calls + external scorer
- WAR (Whole Assessment Rating) scoring built-in — no separate `scoreSession` import
- Bigram signatures, mouse path analysis, fatigue windows all included
- Simpler mental model: attach → type → score → detach

## Migration Risk: Low

The JitterBox `profile` object has the same shape as `getJitterProfile()` output. The `purity` field matches `getPurity()`. The `session` object maps to `getSessionStats()`. The `submitVote` call signature doesn't change — just the data sources.
