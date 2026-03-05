# Jitter Brand Identity — Waveform Badge Design

> **For Claude:** This is the finalized design doc. Implementation is complete.

**Goal:** Establish Jitter as a standalone verification brand using a waveform visual identity that communicates human vs bot typing rhythm at a glance.

**Status:** Shipped (Mar 4, 2026)

---

## Brand Concept

The waveform IS the logo. Irregular peaks = human typing rhythm. Flatline = bot. The visual tells the story before reading any text.

Jitter is its own brand, not a WGH sub-feature. Think reCAPTCHA or "Verified by Visa" — a trust mark that can appear on any platform.

## Visual States

| State | WAR Range | Color | Waveform | Line Style |
|-------|-----------|-------|----------|------------|
| Verified | >= 0.80 | Green (`--color-rating`) | Lively irregular peaks | Solid |
| Suspicious | 0.50-0.79 | Amber (`--color-amber`) | Flattening peaks | Solid |
| Bot | < 0.50 | Red (`--color-danger`) | Flatline | Solid |
| AI Estimated | No data | Blue (`--color-blue`) | Synthetic sine wave | Dashed |

## Badge Anatomy

```
┌─────────────────────────────┐
│  ～∿∾∿～  jitter  0.92      │  ← md/lg size: waveform + wordmark + score
│  ～∿∾∿～  0.92              │  ← sm size: waveform + score only
└─────────────────────────────┘
```

### Sizes
- **sm** — inline next to reviewer name (28x12 wave, score only)
- **md** — card context (36x14 wave, "jitter" wordmark + score)
- **lg** — profile hero (48x18 wave, wordmark + score)

### Interactions
- **Hover** — popover with Reviews, Consistency, WAR, Classification
- **Click** — fires `onProfileClick` callback (navigate to full profile)
- **Animation** — subtle 3s pulse on verified waveform (breathing effect)

## Typography

Wordmark: `"jitter"` in lowercase monospace (`SF Mono` / `Fira Code` / `Cascadia Code`). The monospaced letters look like keystrokes — reinforcing the typing identity concept.

## Color System

All colors reference WGH CSS variables with fallbacks for standalone use:
- Verified: `var(--color-rating, #16a34a)`
- Suspicious: `var(--color-amber, #d97706)`
- Bot: `var(--color-danger, #dc2626)`
- AI Estimated: `var(--color-blue, #2563eb)`
- Backgrounds: translucent rgba for dark/light theme compatibility

## Component Architecture

```
JitterBadge.jsx (standalone brand component)
  ├── Waveform (SVG — state-driven point arrays)
  ├── JitterPopover (hover stats)
  └── CSS injection (pulse animation keyframes)

TrustBadge.jsx (WGH integration wrapper)
  ├── warScore != null → delegates to JitterBadge
  └── type-based → renders original icon badges
```

## Files

| File | Purpose |
|------|---------|
| `src/components/jitter/JitterBadge.jsx` | Brand component |
| `src/components/jitter/__tests__/JitterBadge.test.jsx` | 28 tests |
| `src/components/TrustBadge.jsx` | Integration (delegates WAR to JitterBadge) |

## Design Decisions

1. **Waveform over fingerprint** — more distinctive, harder to confuse with Touch ID or other biometric UIs
2. **Monospace wordmark over logo** — reinforces typing/keystroke concept, no custom font needed
3. **Full transparency for bad scores** — showing "Bot 0.12" builds trust; hiding it destroys it
4. **Per-review scoring** — each review gets its own WAR, not a cumulative user score
5. **CSS variable colors** — adapts to any host theme automatically

## Psychology

Trust badges work through three mechanisms:
- **Social proof** — "other humans verified this" (the waveform shows biological rhythm)
- **Loss aversion** — bots/AI lose the badge (red flatline is viscerally wrong)
- **Transparency** — showing the math (hover for WAR score) builds credibility that opaque badges don't
