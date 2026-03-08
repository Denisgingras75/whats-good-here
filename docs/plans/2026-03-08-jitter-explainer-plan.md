# Jitter Consumer Explainer — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build consumer-facing Jitter trust explainer (WGH bottom sheet + badge tiers) and a standalone landing page with waitlist.

**Architecture:** Two deliverables: (1) A `<JitterExplainer />` bottom sheet component inside WGH, triggered by a "?" icon next to trust badges on reviews. (2) A standalone static page (separate Vite project or route) with layered scroll — consumer hook → explainer → protocol deep-dive → waitlist email capture.

**Tech Stack:** React 19 + Vite, Tailwind, existing WGH BottomSheet component, CSS variables from WGH theme, Supabase for waitlist table.

---

## Task 1: Add Consumer Tier Mapping Constants

**Files:**
- Create: `src/constants/jitter.js`

**Step 1: Create the tier mapping file**

```javascript
/**
 * Consumer-facing Jitter trust tiers.
 * Maps internal WAR scores to user-visible labels.
 * WAR is 0-1 internally (JitterBadge) but displayed as 0-10 in explainer.
 */

export var JITTER_TIERS = {
  trusted: {
    label: 'Trusted Reviewer',
    minWar: 0.80,
    color: 'var(--color-accent-gold)',
    bg: 'rgba(196, 138, 18, 0.12)',
    description: 'Months of consistent, verified human typing patterns.',
  },
  verified: {
    label: 'Verified',
    minWar: 0.40,
    color: 'var(--color-rating)',
    bg: 'rgba(22, 163, 74, 0.10)',
    description: 'Typing patterns confirmed as authentically human.',
  },
  new_reviewer: {
    label: 'New',
    minWar: 0,
    color: 'var(--color-text-tertiary)',
    bg: 'rgba(156, 163, 175, 0.12)',
    description: 'New reviewer — building verification over time.',
  },
}

/**
 * Resolve WAR score (0-1) to consumer tier key.
 * Returns null for suspicious scores (WAR < 0.20) — no badge shown.
 */
export function getConsumerTier(warScore) {
  if (warScore == null || warScore < 0.20) return null
  if (warScore >= 0.80) return 'trusted'
  if (warScore >= 0.40) return 'verified'
  return 'new_reviewer'
}
```

**Step 2: Commit**

```bash
git add src/constants/jitter.js
git commit -m "feat: add Jitter consumer tier mapping constants"
```

---

## Task 2: Build JitterExplainer Bottom Sheet Component

**Files:**
- Create: `src/components/jitter/JitterExplainer.jsx`
- Modify: `src/components/jitter/index.js` (add export)

**Dependencies:** Task 1 (needs JITTER_TIERS)

**Step 1: Create the explainer component**

This uses the existing `BottomSheet` component with `DETENTS.half` as initial detent.

```jsx
import { useState, useRef } from 'react'
import { BottomSheet, DETENTS } from '../BottomSheet'
import { JITTER_TIERS } from '../../constants/jitter'

/**
 * JitterExplainer — Bottom sheet explaining what Jitter trust badges mean.
 * Triggered by "?" icon next to trust badges on reviews.
 *
 * Props:
 *   open     — boolean, controls visibility
 *   onClose  — callback when sheet is dismissed
 *   warScore — optional, show this reviewer's specific score in detail
 *   stats    — optional { reviews, consistency, days_active }
 */
export function JitterExplainer({ open, onClose, warScore, stats }) {
  var [showScore, setShowScore] = useState(false)
  var sheetRef = useRef(null)

  if (!open) return null

  var warDisplay = warScore != null ? (Number(warScore) * 10).toFixed(1) : null

  return (
    <div
      className="fixed inset-0 z-[10000]"
      onClick={onClose}
      role="presentation"
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} aria-hidden="true" />
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl overflow-hidden"
        onClick={function (e) { e.stopPropagation() }}
        style={{
          background: 'var(--color-surface-elevated)',
          maxHeight: '80vh',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-divider)' }} />
        </div>

        <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          {/* Header */}
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            What's this badge?
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Jitter measures <strong>how</strong> you type — not what you type — to prove reviews come from real people.
            Your typing rhythm builds a unique pattern over time that bots can't fake.
          </p>

          {/* Tier list */}
          <div className="flex flex-col gap-3 mb-4">
            {Object.keys(JITTER_TIERS).map(function (key) {
              var tier = JITTER_TIERS[key]
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: tier.bg }}
                >
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: tier.color }}
                  >
                    {key === 'trusted' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {key === 'verified' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {key === 'new_reviewer' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" strokeDasharray="4 3" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {tier.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {tier.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Score detail (tap to expand) */}
          {warScore != null && (
            <button
              className="w-full text-left rounded-xl p-3 mb-4"
              style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-divider)' }}
              onClick={function () { setShowScore(!showScore) }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  This reviewer's score
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {showScore ? 'Hide' : 'Show details'}
                </span>
              </div>
              {showScore && (
                <div className="mt-3 flex flex-col gap-2">
                  <ScoreRow label="Trust Score" value={warDisplay + ' / 10'} />
                  {stats && stats.reviews != null && (
                    <ScoreRow label="Verified sessions" value={String(stats.reviews)} />
                  )}
                  {stats && stats.days_active != null && (
                    <ScoreRow label="Days active" value={String(stats.days_active)} />
                  )}
                </div>
              )}
            </button>
          )}

          {/* Privacy note */}
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
            Jitter never sees your words. Only typing rhythm metadata (timing between keys) is measured — everything stays on your device.
          </p>

          {/* Learn more link */}
          <a
            href="https://jitter.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm font-semibold py-2"
            style={{ color: 'var(--color-primary)' }}
          >
            Learn more about how Jitter works &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}

function ScoreRow({ label, value }) {
  return (
    <div className="flex justify-between" style={{ fontSize: '13px' }}>
      <span style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
    </div>
  )
}
```

**Step 2: Add export to barrel**

Add to `src/components/jitter/index.js`:
```javascript
export { JitterExplainer } from './JitterExplainer'
```

**Step 3: Commit**

```bash
git add src/components/jitter/JitterExplainer.jsx src/components/jitter/index.js
git commit -m "feat: add JitterExplainer bottom sheet component"
```

---

## Task 3: Add "?" Trigger to Trust Badge on Reviews

**Files:**
- Modify: `src/pages/Dish.jsx` (~line 896-901, review header area)

**Dependencies:** Task 2

**Step 1: Wire the explainer into the review section**

In `Dish.jsx`, the review header currently renders:
```jsx
<TrustBadge type={review.trust_badge} profileData={review.jitter_profile} />
```

Add state + explainer at the component level (near other state declarations):
```javascript
var [explainerOpen, setExplainerOpen] = useState(false)
var [explainerData, setExplainerData] = useState(null)
```

Replace the TrustBadge line (~line 900) with:
```jsx
<TrustBadge type={review.trust_badge} profileData={review.jitter_profile} />
{review.trust_badge && review.trust_badge !== 'building' && (
  <button
    onClick={function (e) {
      e.preventDefault()
      e.stopPropagation()
      setExplainerData({ warScore: review.war_score, stats: review.jitter_profile })
      setExplainerOpen(true)
    }}
    className="flex-shrink-0"
    style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', lineHeight: 1 }}
    aria-label="What is this badge?"
  >
    ?
  </button>
)}
```

Add the JitterExplainer component at the bottom of the page JSX (before closing fragment):
```jsx
<JitterExplainer
  open={explainerOpen}
  onClose={function () { setExplainerOpen(false) }}
  warScore={explainerData && explainerData.warScore}
  stats={explainerData && explainerData.stats}
/>
```

Add import at top:
```javascript
import { JitterExplainer } from '../components/jitter'
```

**Step 2: Commit**

```bash
git add src/pages/Dish.jsx
git commit -m "feat: add ? trigger for Jitter explainer on review badges"
```

---

## Task 4: Create Standalone Jitter Landing Page (scaffold)

**Files:**
- Create: `src/pages/JitterLanding.jsx`
- Modify: `src/App.jsx` (add route)

**Dependencies:** Task 1 (needs JITTER_TIERS)

This is a single-page scroll within WGH at `/jitter` (simpler than a separate project, shares theme tokens, can move to separate domain later).

**Step 1: Create the landing page**

```jsx
import { useState } from 'react'
import { JITTER_TIERS } from '../constants/jitter'
import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'

/**
 * JitterLanding — standalone explainer page.
 * Three layers: Hook → Explainer → Protocol.
 * Route: /jitter
 */
export default function JitterLanding() {
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <HookSection />
      <ExplainerSection />
      <ProtocolSection />
      <WaitlistSection position="bottom" />
      <Footer />
    </div>
  )
}

// ── Layer 1: The Hook ──────────────────────────────────────────────

function HookSection() {
  return (
    <section className="px-6 pt-16 pb-12 text-center" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="mb-6">
        <JitterWordmark />
      </div>
      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: 'var(--color-text-primary)', lineHeight: 1.2, letterSpacing: '-0.02em' }}
      >
        Every review is verified human.
      </h1>
      <p className="text-base mb-8" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
        Jitter proves reviews are written by real people using typing patterns — not what you type, just how.
        No surveillance. No tracking. Just proof.
      </p>
      <WaitlistSection position="top" />
    </section>
  )
}

// ── Layer 2: The Explainer ─────────────────────────────────────────

function ExplainerSection() {
  return (
    <section className="px-6 py-12" style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* How it works */}
      <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        How it works
      </h2>
      <div className="flex flex-col gap-4 mb-10">
        <StepCard number="1" title="You type" description="Write your review naturally. Jitter runs silently in the background." />
        <StepCard number="2" title="Jitter reads rhythm" description="Timing between keystrokes creates a unique pattern — like a fingerprint, but for typing." />
        <StepCard number="3" title="Badge earned over time" description="One session isn't enough. Trust builds across multiple reviews over weeks and months." />
      </div>

      {/* What the tiers mean */}
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        What the badges mean
      </h2>
      <div className="flex flex-col gap-3 mb-10">
        {Object.keys(JITTER_TIERS).map(function (key) {
          var tier = JITTER_TIERS[key]
          return (
            <div key={key} className="rounded-xl p-4" style={{ background: tier.bg }}>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {tier.label}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {tier.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* What we don't do */}
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        What we don't do
      </h2>
      <div className="flex flex-col gap-3 mb-10">
        <PrivacyPoint text="We never see your words. Only timing metadata." />
        <PrivacyPoint text="We never track you across sites." />
        <PrivacyPoint text="Everything stays on your device by default." />
        <PrivacyPoint text="No account required. No personal data collected." />
      </div>

      {/* Why time matters */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-divider)' }}
      >
        <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Why time is the defense
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          A bot can fake one typing session. It cannot economically maintain consistent human-like patterns
          across months of reviews. The longer you use Jitter, the more your trust compounds — and the more
          expensive it becomes for anyone to fake it.
        </p>
      </div>
    </section>
  )
}

// ── Layer 3: The Protocol ──────────────────────────────────────────

function ProtocolSection() {
  return (
    <section className="px-6 py-12" style={{ maxWidth: '640px', margin: '0 auto', borderTop: '1.5px solid var(--color-divider)' }}>
      <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        The protocol
      </h2>

      {/* WAR Score */}
      <h3 className="font-bold text-sm mb-2 mt-6" style={{ color: 'var(--color-text-primary)' }}>
        The WAR Score (0–10)
      </h3>
      <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
        Weighted Authenticity Rating. Nine signals, each measuring a different dimension of human typing:
      </p>
      <div className="flex flex-col gap-1.5 mb-6">
        <SignalRow name="Rhythm consistency" weight="18%" description="How stable is your bigram timing across a session?" />
        <SignalRow name="Per-key uniqueness" weight="15%" description="Does each key have its own dwell signature?" />
        <SignalRow name="Cross-signal correlation" weight="15%" description="Do your signals move independently or in lockstep?" />
        <SignalRow name="Distribution shape" weight="12%" description="Does your timing follow natural human distributions?" />
        <SignalRow name="Inter-key variance" weight="10%" description="How much does your speed vary between different key pairs?" />
        <SignalRow name="Dwell consistency" weight="10%" description="How long you hold each key — and how consistent that is." />
        <SignalRow name="Average dwell" weight="8%" description="Baseline hold time across all keys." />
        <SignalRow name="Editing behavior" weight="7%" description="Backspaces, corrections, rewrites — the mess of real writing." />
        <SignalRow name="Typing purity" weight="5%" description="Ratio of original typing to pasted content." />
      </div>

      {/* Cryptographic proof */}
      <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Cryptographic proof
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
        Every session generates an ECDSA P-256 signature over your typing metrics. These signatures chain
        together into a hash chain — a tamper-evident ledger of your typing history. No one can insert or
        remove sessions without breaking the chain.
      </p>

      {/* Sequential gating */}
      <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Sequential trust gating
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
        Defenses run in series, not parallel. Fail any gate and you restart from day one. Each gate multiplies
        the cost of faking it. Phone verification alone costs $0.01. But phone + aged account + time dilation +
        biometric scoring + dish-level granularity pushes the cost of 50 fake reviews past $2,000.
      </p>

      {/* For developers */}
      <div
        className="rounded-xl p-5 mt-6"
        style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-divider)' }}
      >
        <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
          For developers
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          Jitter is becoming an embeddable widget — drop a script tag, get human verification on any text input.
          Like reCAPTCHA, but for content authenticity instead of form submission.
        </p>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          Join the waitlist for early access.
        </p>
      </div>

      {/* Patent */}
      <p className="text-xs mt-6" style={{ color: 'var(--color-text-tertiary)' }}>
        Patent pending. US Provisional Applications #63/994,858 and #63/997,498.
      </p>
    </section>
  )
}

// ── Waitlist ───────────────────────────────────────────────────────

function WaitlistSection({ position }) {
  var [email, setEmail] = useState('')
  var [status, setStatus] = useState(null) // null | 'sending' | 'done' | 'error'

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || status === 'sending') return
    setStatus('sending')

    supabase
      .from('jitter_waitlist')
      .insert({ email: email, source: position === 'bottom' ? 'developer' : 'general' })
      .then(function (result) {
        if (result.error) {
          logger.error('Waitlist insert failed:', result.error)
          setStatus('error')
        } else {
          setStatus('done')
          setEmail('')
        }
      })
  }

  if (status === 'done') {
    return (
      <p className="text-sm text-center py-3" style={{ color: 'var(--color-rating)' }}>
        You're on the list. We'll be in touch.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
      <input
        type="email"
        value={email}
        onChange={function (e) { setEmail(e.target.value) }}
        placeholder="your@email.com"
        required
        className="flex-1 rounded-xl px-4 py-2.5 text-sm"
        style={{
          background: 'var(--color-surface)',
          border: '1.5px solid var(--color-divider)',
          color: 'var(--color-text-primary)',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-xl px-5 py-2.5 text-sm font-semibold"
        style={{
          background: 'var(--color-primary)',
          color: 'white',
          opacity: status === 'sending' ? 0.6 : 1,
        }}
      >
        {status === 'sending' ? '...' : 'Join'}
      </button>
    </form>
  )
}

// ── Shared small components ────────────────────────────────────────

function JitterWordmark() {
  return (
    <span
      style={{
        fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontWeight: 700,
        fontSize: '14px',
        letterSpacing: '0.08em',
        color: 'var(--color-rating)',
        textTransform: 'lowercase',
      }}
    >
      jitter
    </span>
  )
}

function StepCard({ number, title, description }) {
  return (
    <div className="flex gap-4 items-start">
      <span
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ background: 'var(--color-primary)', color: 'white' }}
      >
        {number}
      </span>
      <div>
        <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{title}</p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{description}</p>
      </div>
    </div>
  )
}

function PrivacyPoint({ text }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-rating)' }}>&#10003;</span>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{text}</p>
    </div>
  )
}

function SignalRow({ name, weight, description }) {
  return (
    <div className="rounded-lg p-2.5" style={{ background: 'var(--color-surface)' }}>
      <div className="flex justify-between mb-0.5">
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{name}</span>
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{weight}</span>
      </div>
      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
    </div>
  )
}

function Footer() {
  return (
    <footer className="px-6 py-8 text-center" style={{ borderTop: '1.5px solid var(--color-divider)' }}>
      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
        Jitter Integrity Tracking &amp; Typing Entropy Recognition<br />
        Patent pending &middot; Built on Martha's Vineyard
      </p>
    </footer>
  )
}
```

**Step 2: Add route to App.jsx**

Add import and route:
```jsx
// Lazy load — not part of main WGH bundle
var JitterLanding = lazy(function () { return import('./pages/JitterLanding') })

// Inside routes:
<Route path="/jitter" element={<Suspense fallback={null}><JitterLanding /></Suspense>} />
```

**Step 3: Commit**

```bash
git add src/pages/JitterLanding.jsx src/App.jsx
git commit -m "feat: add Jitter landing page with layered explainer + waitlist"
```

---

## Task 5: Create Supabase Waitlist Table

**Files:**
- Modify: `supabase/schema.sql` (add table definition)

**Step 1: Add table to schema.sql**

```sql
-- Jitter waitlist (email capture from landing page)
CREATE TABLE IF NOT EXISTS jitter_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow anonymous inserts (public landing page)
ALTER TABLE jitter_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join waitlist" ON jitter_waitlist FOR INSERT WITH CHECK (true);
-- Only service role can read
CREATE POLICY "Service role reads waitlist" ON jitter_waitlist FOR SELECT USING (auth.role() = 'service_role');
```

**Step 2: Run in Supabase SQL Editor**

Copy the SQL above and run it in the Supabase dashboard SQL Editor.

**Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add jitter_waitlist table with RLS"
```

---

## Task 6: Build and Verify

**Step 1: Run build**

```bash
cd ~/whats-good-here && npm run build
```

Expected: clean build, no errors.

**Step 2: Run dev server and test**

```bash
lsof -i :5173  # check port free
npm run dev
```

Test manually:
- Navigate to `/jitter` — verify all 3 layers render, waitlist form works
- Navigate to any dish with reviews — verify "?" icon appears next to trust badges
- Tap "?" — verify bottom sheet opens with tier explanation
- Tap "Show details" — verify score expands (if warScore present)
- Verify dark theme works (toggle theme, check all CSS vars)

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: Jitter consumer explainer — bottom sheet + landing page + waitlist"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Tier constants | `src/constants/jitter.js` (new) |
| 2 | Bottom sheet explainer | `src/components/jitter/JitterExplainer.jsx` (new) |
| 3 | "?" trigger on reviews | `src/pages/Dish.jsx` (modify) |
| 4 | Standalone landing page | `src/pages/JitterLanding.jsx` (new), `src/App.jsx` (modify) |
| 5 | Waitlist table | `supabase/schema.sql` (modify) |
| 6 | Build + verify | No new files |

**Total new files:** 3
**Total modified files:** 3
