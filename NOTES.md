# Project Notes

A living reference document. Updated as the project evolves.

---

## Build Order Tracker

What we actually did (left) vs. ideal order (right). Left side updated as work continues.

```
WHAT WE DID                             IDEAL ORDER (for next time)
────────────────────────────────────    ────────────────────────────────────
Jan 6-7 (Week 1)                        Week 1: Foundation
├─ Schema + Auth + UI + Data            ├─ Discovery & spec document
│  (all in one commit)                  ├─ Define MVP scope + metrics
├─ Category additions (14 commits)      ├─ Architecture decisions
└─ No design system                     └─ Design tokens & patterns

Jan 11-14 (Week 2)                      Week 2: Data & Core
├─ Image debugging (10+ commits)        ├─ Schema (with room to grow)
├─ Pizza animations (premature)         ├─ API layer structure
├─ Navigation structure (late)          ├─ Auth flow (properly tested)
├─ 20+ redesign commits                 └─ Seed data strategy
└─ Design tokens (finally)

Jan 14-15 (Week 3)                      Week 3: Core Flow
├─ Auth bug fixes (6+ commits)          ├─ Core screens (Home, Browse)
├─ Refactor: AuthContext, API layer     ├─ Primary user flow
├─ Analytics added (late)               ├─ Analytics instrumentation
└─ Testing setup                        └─ Error handling

Jan 15-16 (Week 4)                      Week 4: Polish
├─ Gamification & impact feedback       ├─ Secondary features
├─ Photo quality system                 ├─ Polish & animations
├─ TopBar brand anchor                  ├─ Onboarding flows
├─ Welcome splash for first-timers      └─ Testing & QA
└─ Build retrospective
────────────────────────────────────    ────────────────────────────────────
```

### Recent Work (update this as you go)
| Date | What Changed | Category |
|------|--------------|----------|
| Jan 16 | Welcome splash (tap to dismiss) | Onboarding |
| Jan 16 | TopBar with brand tint | Polish |
| Jan 16 | Responsive logo scaling | Polish |
| Jan 16 | Photo quality + tiers | Feature |
| Jan 15 | Gamification phase 1 | Feature |
| Jan 15 | Sentry + PostHog | Infrastructure |
| Jan 15 | API layer refactor | Architecture |

---

## Design Tokens

Current design system values defined in `src/index.css`:

### Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#F47A1F` | CTAs, active nav, links, brand accents |
| `--color-rating` | `#E6B84C` | Star ratings, score badges |

### Text Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `#1F1F1F` | Headings, main text, dish names |
| `--color-text-secondary` | `#6B6B6B` | Descriptions, restaurant names, labels |
| `--color-text-tertiary` | `#9A9A9A` | Hints, metadata, vote counts, timestamps |

### Surface Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-surface` | `#FAFAFA` | Cards, elevated elements, input backgrounds |
| `--color-divider` | `#EDEDED` | Borders, separators, card outlines |

### Feedback Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-danger` | `#D64545` | Errors, destructive actions, warnings |

### Utility
| Token | Value | Usage |
|-------|-------|-------|
| `--focus-ring` | `0 0 0 3px color-mix(...)` | Focus states for accessibility |

---

## Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Body | DM Sans | 400 | 14-16px |
| Headings | DM Sans | 600-700 | 18-24px |
| Labels | DM Sans | 500 | 12-14px |
| Hints | DM Sans | 400 | 12px |

---

## Spacing Scale

Using Tailwind defaults:
- `1` = 4px
- `2` = 8px
- `3` = 12px
- `4` = 16px
- `6` = 24px
- `8` = 32px

---

## Key File Locations

| What | Where |
|------|-------|
| Design tokens | `src/index.css` (lines 1-30) |
| API layer | `src/api/*.js` |
| React hooks | `src/hooks/*.js` |
| Auth context | `src/context/AuthContext.jsx` |
| Location context | `src/context/LocationContext.jsx` |
| Page components | `src/pages/*.jsx` |
| Shared components | `src/components/*.jsx` |
| Supabase client | `src/lib/supabase.js` |
| Database schema | `supabase/schema.sql` |

---

## Food Categories

Current categories in the app:

| Category | Emoji | Image Source |
|----------|-------|--------------|
| Burger | 🍔 | `categoryImages.js` |
| Pizza | 🍕 | `categoryImages.js` |
| Sushi | 🍣 | `categoryImages.js` |
| Taco | 🌮 | `categoryImages.js` |
| Sandwich | 🥪 | `categoryImages.js` |
| Salad | 🥗 | `categoryImages.js` |
| Pasta | 🍝 | `categoryImages.js` |
| Fries | 🍟 | `categoryImages.js` |
| Wings | 🍗 | `categoryImages.js` |
| Lobster Roll | 🦞 | `categoryImages.js` |
| Breakfast | 🍳 | `categoryImages.js` |
| Breakfast Sandwich | 🥓 | `categoryImages.js` |
| Poke Bowl | 🥙 | `categoryImages.js` |
| Tendys | 🐔 | `categoryImages.js` |
| Seafood | 🦐 | `categoryImages.js` |
| Chowder | 🥣 | `categoryImages.js` |
| Soup | 🍜 | `categoryImages.js` |
| Entree | 🍽️ | `categoryImages.js` |
| Apps | 🧆 | `categoryImages.js` |

---

## Photo Quality Tiers

Defined in `src/constants/photoQuality.js`:

| Tier | Score Range | Placement |
|------|-------------|-----------|
| Featured | 90-100 | Hero image, top of gallery |
| Community | 70-89 | Standard gallery |
| Hidden | 0-69 | Only visible in "See all" |
| Rejected | N/A | Not uploaded (fails hard gates) |

### Hard Gates (instant reject)
- File size > 10MB
- Resolution < 800px (shortest side)
- Not JPEG/PNG/WebP
- Too dark (avg brightness < 30)
- Too bright (avg brightness > 240)

---

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `whats-good-here-auth` | Supabase auth session |
| `wgh_has_seen_splash` | Welcome splash shown flag |
| `wgh_has_onboarded` | Welcome modal (name entry) shown |
| `wgh_pending_vote` | Vote data saved before auth |
| `wgh_remembered_email` | Email for magic link convenience |

---

*Last updated: Jan 16, 2026*
