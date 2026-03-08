# Jitter Consumer Explainer + Standalone Site — Design

Date: 2026-03-08

## Problem

Jitter has ~5,000 lines of working code, two patents filed, and zero consumer-facing explanation. WGH will show trust badges on reviews at launch — users need to understand what they mean. Developers and journalists need a deeper resource. Two audiences, two surfaces.

## Decisions Made

- WGH inline explainer: "?" icon → bottom sheet (no new route)
- Standalone site: layered scroll (consumer → technical → protocol)
- Consumer score: badge tier label visible, WAR number on tap (hide complexity, don't remove it)
- Standalone site includes waitlist email capture, NOT SDK docs or pricing
- Suspicious scores (WAR <2.0) show no badge — absence of proof, not scarlet letter

## Piece 1: WGH Bottom Sheet

Small "?" icon next to any Jitter trust badge on reviews. Tap opens bottom sheet:

- **Header:** "What's this badge?" + tier label (e.g., "Trusted Reviewer")
- **Body (3-4 sentences):** "This reviewer's typing patterns have been verified as authentically human over [X] sessions. Jitter measures how you type — not what you type — to prove reviews come from real people. Tap the badge to see the full score."
- **Score detail (tap to expand):** WAR number, session count, days active
- **Footer link:** "Learn more about how Jitter works" → standalone site

Reusable `<JitterExplainer />` bottom sheet component. No new route.

## Piece 2: Consumer Score Display (WGH)

Badge tier labels on reviews, mapped from internal WAR:

| WAR Range | Internal Tier | Consumer Label | Visual |
|-----------|--------------|----------------|--------|
| 8.0-10 | Hall of Fame | Trusted Reviewer | Gold shield |
| 6.0-7.9 | All-Star | Verified | Green shield |
| 4.0-5.9 | Solid | Verified | Green shield |
| 2.0-3.9 | Rookie | New | Gray shield |
| 0-1.9 | Suspicious | (hidden) | No badge shown |

- Solid + All-Star both show "Verified" — consumers don't need 5 tiers
- "Trusted" requires 8.0+ WAR = months of consistent human typing
- Tap badge → bottom sheet with full score

## Piece 3: Standalone Site — Layered Structure

Single scrollable page, three depth layers.

### Layer 1: The Hook (above the fold)
- Headline: "Every review on [WGH] is verified human."
- One sentence: Jitter proves reviews are written by real people using typing patterns — not what you type, just how.
- Visual: badge animation or trust tier example
- CTA: "Join the waitlist" email capture

### Layer 2: The Explainer (scroll down)
- **How it works:** 3-step visual — you type → Jitter reads rhythm → badge earned over time
- **What the tiers mean:** Verified Human / Trusted Reviewer / New with plain descriptions
- **What we DON'T do:** "We never see your words. We never track you across sites. Everything stays on your device."
- **Why time matters:** "A bot can fake one session. It can't fake six months of consistent human typing."

### Layer 3: The Protocol (keep scrolling)
- **The WAR Score:** 0-10 scale, 9 signals explained in human terms
- **Cryptographic proof:** ECDSA signatures, hash chains (one paragraph)
- **Sequential trust gating:** how the system gets harder to fake over time
- **For developers:** "Jitter is becoming an embeddable widget. Get early access." → waitlist CTA
- **Patent notice:** provisional filed, protocol in development

### Tech stack
- Static page (Vite + vanilla HTML/CSS or lightweight React)
- Email capture: Supabase `jitter_waitlist` table (email, source, created_at) or Formspree
- Hosted on Vercel (separate from WGH, or subdomain)

## Piece 4: Waitlist Capture
- Single email field at top and bottom of page
- Source tag: "developer" / "journalist" / "general" (inferred from CTA placement)
- No confirmation email at launch — just capture + thank you
- Supabase table: `jitter_waitlist` (email TEXT, source TEXT, created_at TIMESTAMPTZ DEFAULT now())

## NOT Building
- SDK docs or playground
- Dashboard / login
- Blog section
- Pricing page
- Jitter branding inside WGH beyond the "Learn more" link

## Effort Estimate

| Piece | Effort |
|-------|--------|
| WGH bottom sheet + "?" icon | Small |
| Badge tier display on reviews | Small |
| Standalone page (3 layers) | Medium |
| Waitlist email capture | Small |
