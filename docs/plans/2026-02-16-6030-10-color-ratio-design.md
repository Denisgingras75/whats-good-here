# 60/30/10 Color Ratio — Food Psychology Application

> Applying the 60/30/10 color distribution principle to both themes, with food psychology driving the 30% layer.

## The Problem

Light mode's accent colors don't command attention. Pure white cards (`#FFFFFF`) and neutral gray text (`#6B7280`, `#9CA3AF`) create a cold, flat surface that absorbs the energy of the appetite-triggering orange-red and gold accents. The 60% and 30% layers aren't doing their job of building a warm runway for the 10%.

Dark mode is already well-balanced — the deep navy backgrounds recede, teal cards provide depth, and the rust/gold accents glow naturally.

## The Principle

The 60/30/10 ratio from interior/film design, applied through a food psychology lens:

- **60% — The Table.** Warm neutral backdrop. Cream, linen, warm stone. Sets the stage, stays quiet. This is your background and page chrome.
- **30% — The Appetite Atmosphere.** This is where food psychology does its work. Red/orange tones aren't crammed into tiny buttons — they're diffused across surfaces as atmospheric warmth. Rosy card undertones, terracotta-tinted borders, warm dividers. Like walking into a good restaurant: red tablecloths, terracotta walls, warm lighting.
- **10% — The Dish.** The deepest, most saturated version of the appetite color. CTAs, ratings, the thing you can't look away from. Pops because the 30% layer is already speaking the same warm language at low volume.

The key insight: `#E8663C` at 10% hits harder when the 30% layer is its muted cousin. Same color family, full saturation. Your eye goes straight to it.

## Dark Mode — Island Depths (No Changes)

Already hitting the ratio:

| Layer | Tokens | Values | Assessment |
|-------|--------|--------|------------|
| 60% | `--color-bg`, `--color-surface` | `#0D1B22`, `#0F1F2B` | Deep ocean navy, warm-biased, no pure black. Recedes properly. |
| 30% | `--color-card`, `--color-card-hover` | `#1A3A42`, `#243A43` | Teal-shifted cards sit between bg and accents. Good depth. |
| 10% | `--color-primary`, `--color-accent-gold` | `#C85A54`, `#D9A765` | Rust and gold glow like lantern light against the navy. Working. |

No changes needed.

## Light Mode — Appetite (Targeted Adjustments)

### 60% Layer — The Table

| Token | Before | After | Reasoning |
|-------|--------|-------|-----------|
| `--color-bg` | `#F0ECE8` | `#F0ECE8` | Already warm stone. Keep. |
| `--color-surface` | `#F7F4F1` | `#F2EDE6` | Warmer, slightly deeper. Better separation from bg without going cold. |

### 30% Layer — The Appetite Atmosphere

| Token | Before | After | Reasoning |
|-------|--------|-------|-----------|
| `--color-card` | `#FFFFFF` | `#FDF6F0` | Warm blush-cream. Rosy undertone like candlelight on linen. Kills cold white. |
| `--color-card-hover` | `#FFF8F4` | `#F9EDE3` | Hover deepens the warmth — terracotta glow, not orange shift. |
| `--color-surface-elevated` | `#FFFFFF` | `#FAF3EC` | Panels and modals carry the same warmth. No cold white anywhere. |
| `--color-divider` | `rgba(0,0,0,0.08)` | `rgba(200,100,60,0.12)` | Terracotta-tinted dividers. The "red accent wall" in architectural form. |
| `--color-primary-muted` | `rgba(232,102,60,0.10)` | `rgba(232,102,60,0.14)` | Background washes and tag fills slightly more present. |
| `--color-accent-gold-muted` | `rgba(233,161,21,0.12)` | `rgba(233,161,21,0.15)` | Gold wash more visible in badges and highlights. |

### Text — Warm, Recedes Into the Atmosphere

| Token | Before | After | Reasoning |
|-------|--------|-------|-----------|
| `--color-text-primary` | `#1A1A1A` | `#2A2218` | Warm near-black with brown lean. Not neutral. |
| `--color-text-secondary` | `#6B7280` | `#7A6E62` | Warm taupe. Doesn't fight the rosy surfaces. |
| `--color-text-tertiary` | `#9CA3AF` | `#A89888` | Warm sand. Disappears into the atmosphere. |

### 10% Layer — The Dish (No Changes)

| Token | Value | Reasoning |
|-------|-------|-----------|
| `--color-primary` | `#E8663C` | Most saturated thing on screen. Pops because 30% is its muted cousin. |
| `--color-accent-gold` | `#E9A115` | Gold highlight for stars, badges, links. |
| `--color-rating` | `#16A34A` | "Order again" green. Functional contrast against warm palette. |

### Supporting Tokens (Warm Alignment)

| Token | Before | After | Reasoning |
|-------|--------|-------|-----------|
| `--glow-primary` | `rgba(232,102,60,0.15)` / `0.05` | No change | Already warm. |
| `--color-muted` | `#9CA3AF` | `#A09488` | Warm muted to match tertiary text direction. |
| `--color-medal-gold` | `#B8860B` | No change | Already warm. |
| `--color-medal-silver` | `#6B7280` | `#8A8278` | Warm silver to match text secondary direction. |
| `--color-medal-bronze` | `#A0522D` | No change | Already warm. |

### Glass Header

| Token | Before | After |
|-------|--------|-------|
| `[data-theme="light"] .glass-header` bg | `rgba(247,244,241,0.95)` | `rgba(242,237,230,0.95)` — matches new `--color-surface` |

## What NOT to Change

- **Dark mode** — already working, leave it alone
- **Semantic status colors** (`--color-red`, `--color-emerald`, `--color-blue`, etc.) — these are functional, not atmospheric
- **Photo tier badges** — functional color coding
- **10% accent values** — these are the payoff of the ratio, not the problem

## Verification

After applying changes:
- Light mode cards should feel like warm linen, not cold paper
- Dividers should have a subtle terracotta warmth
- Text should recede into the warm atmosphere, not sit on top as cold gray
- The orange-red CTA buttons should be the most eye-catching element on any screen
- `npm run build` passes
- No visual regression in dark mode
