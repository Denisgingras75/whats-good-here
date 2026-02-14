# Light Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Flip the entire app from dark "Island Depths" theme to a light food-psychology theme with orange-red + yellow accents on warm stone backgrounds.

**Architecture:** All colors flow through CSS variables in `src/index.css`. Step 1 rewrites the variables, then subsequent steps fix ~40 files with hardcoded dark-theme rgba values, inline `color: 'white'` assumptions, and component-class overrides.

**Tech Stack:** CSS custom properties, React inline styles, Tailwind utility classes

---

### Task 1: Rewrite CSS variables in index.css

**Files:**
- Modify: `src/index.css` — `:root` block (lines 35-110)

**Step 1: Replace all CSS variable values in `:root`**

Reference: `docs/plans/2026-02-14-light-theme-food-psychology-design.md`

Replace the full `:root` block with these values:

```css
:root {
  /* Primary: Orange-Red - appetite trigger, energy, action */
  --color-primary: #E8663C;
  --color-primary-muted: rgba(232, 102, 60, 0.10);
  --color-primary-glow: rgba(232, 102, 60, 0.20);

  /* Rating: Bright green for light backgrounds */
  --color-rating: #16A34A;

  /* Secondary: Warm Yellow - happiness, warmth, appetite */
  --color-accent-gold: #E9A115;
  --color-accent-gold-muted: rgba(233, 161, 21, 0.12);
  --color-link-secondary: #E9A115;

  /* New: Bright yellow for badges, stars, highlights */
  --color-accent-yellow: #F5B731;

  /* Tertiary: Warm Orange - hover states, accent borders */
  --color-accent-orange: #E07856;

  /* Text hierarchy - dark text on light backgrounds */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;

  /* Surfaces - warm stone, light and inviting */
  --color-bg: #F0ECE8;
  --color-surface: #F7F4F1;
  --color-surface-elevated: #FFFFFF;
  --color-divider: rgba(0, 0, 0, 0.08);

  /* Cards - white on warm stone */
  --color-card: #FFFFFF;
  --color-card-hover: #FFF8F4;

  /* Medal ranks - darkened for light bg readability */
  --color-medal-gold: #B8860B;
  --color-medal-silver: #6B7280;
  --color-medal-bronze: #A0522D;

  /* Feedback states */
  --color-danger: #DC2626;
  --color-success: #16A34A;

  /* Muted action */
  --color-muted: #9CA3AF;

  /* Text on primary-colored backgrounds (buttons, banners) */
  --color-text-on-primary: #FFFFFF;

  /* Semantic status colors */
  --color-emerald: #10B981;
  --color-emerald-light: #22C55E;
  --color-red: #EF4444;
  --color-red-light: #F87171;
  --color-amber: #F59E0B;
  --color-amber-light: #FBBF24;
  --color-amber-dark: #92400E;
  --color-orange: #F97316;
  --color-lime: #84CC16;
  --color-yellow: #EAB308;
  --color-green-deep: #16A34A;
  --color-green-dark: #059669;
  --color-blue: #3B82F6;
  --color-blue-light: #60A5FA;
  --color-purple: #9333EA;

  /* Photo tier badges */
  --color-tier-featured: #F59E0B;
  --color-tier-community: #3B82F6;
  --color-tier-hidden: #6B7280;

  /* Glow effects - softer for light theme */
  --glow-primary: 0 0 20px rgba(232, 102, 60, 0.15), 0 0 40px rgba(232, 102, 60, 0.05);
  --glow-gold: 0 0 15px rgba(233, 161, 21, 0.15);

  /* Focus ring */
  --focus-ring: 0 0 0 3px rgba(232, 102, 60, 0.25);
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: passes

**Step 3: Commit**

```
git add src/index.css
git commit -m "feat: rewrite CSS variables for light food-psychology theme"
```

---

### Task 2: Fix index.css component classes

**Files:**
- Modify: `src/index.css` — glass-header, welcome-splash, card-elevated, top-bar, shimmer

**Step 1: Update `.glass-header`**

Change background from `rgba(17, 17, 17, 0.95)` to `rgba(247, 244, 241, 0.95)`.

**Step 2: Update `.welcome-splash`**

Change gradient from `linear-gradient(145deg, #1E1A19 0%, #111111 50%, #0A0A0A 100%)` to `linear-gradient(145deg, #FFFFFF 0%, #F7F4F1 50%, #F0ECE8 100%)`.

**Step 3: Update `.top-bar`**

Change `color-mix` base from `var(--color-bg)` to `#FFFFFF`:
```css
background: color-mix(in srgb, var(--color-primary) 6%, #FFFFFF);
```

**Step 4: Update `.card-elevated`**

Change border from `rgba(217, 167, 101, 0.1)` to `rgba(0, 0, 0, 0.06)`.
Change shadow from `0 4px 12px -2px rgba(0, 0, 0, 0.4)` to `0 4px 12px -2px rgba(0, 0, 0, 0.08)`.

**Step 5: Update `.card-elevated:hover`**

Change border-color from `rgba(224, 120, 86, 0.25)` to `rgba(232, 102, 60, 0.3)`.
Change shadow from `0 12px 24px -8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(217, 167, 101, 0.1)` to `0 12px 24px -8px rgba(0, 0, 0, 0.12), 0 0 20px rgba(232, 102, 60, 0.08)`.

**Step 6: Update `.animate-shimmer`**

Change from `rgba(255, 255, 255, 0.08)` to `rgba(0, 0, 0, 0.04)` (shimmer on light bg).

**Step 7: Update `.see-all-photos-btn`**

Change border from `rgba(217, 167, 101, 0.2)` to `rgba(0, 0, 0, 0.1)`.
Change hover border from `rgba(217, 167, 101, 0.4)` to `rgba(232, 102, 60, 0.3)`.

**Step 8: Update `.top-bar` border-bottom**

Change from `rgba(217, 167, 101, 0.12)` to `rgba(0, 0, 0, 0.06)`.

**Step 9: Verify build + commit**

```
npm run build
git add src/index.css
git commit -m "feat: update CSS component classes for light theme"
```

---

### Task 3: Fix hardcoded dark-theme colors in major pages

These pages have inline `rgba(0,0,0,...)` overlays, `color: 'white'` assumptions, or `bg-black` that need flipping.

**Files to modify:**
- `src/pages/Home.jsx`
- `src/pages/Browse.jsx`
- `src/pages/Dish.jsx`
- `src/pages/Restaurants.jsx`
- `src/pages/Profile.jsx`
- `src/pages/UserProfile.jsx`
- `src/pages/Login.jsx`
- `src/pages/ResetPassword.jsx`
- `src/pages/Admin.jsx`
- `src/pages/Terms.jsx`
- `src/pages/Privacy.jsx`
- `src/pages/NotFound.jsx`
- `src/pages/ManageRestaurant.jsx`
- `src/pages/AcceptInvite.jsx`
- `src/pages/Discover.jsx`

**Approach for each file:**

1. Read the file
2. Find hardcoded dark-theme patterns:
   - `rgba(13, 27, 34, ...)` — old navy bg → replace with `rgba(247, 244, 241, ...)`
   - `color: 'white'` on backgrounds that are now light → change to `var(--color-text-primary)`
   - `bg-black/50` overlays → keep for modals/lightboxes (still need dark overlay)
   - `text-white` on dark backgrounds → review case-by-case
   - `color-mix(in srgb, ... var(--color-bg))` → replace `var(--color-bg)` base as needed
3. Replace and verify

**Key patterns to search and fix:**
- `rgba(13, 27, 34` → old navy, replace with light equivalent
- `'white'` used as text color on dark bg → use `var(--color-text-on-primary)` or `var(--color-text-primary)` depending on context
- `background: 'var(--color-bg)'` — these are fine, they reference the variable
- Photo overlays (`bg-black/50`, gradient overlays on images) — KEEP AS-IS, photos still need dark gradient for text readability

**Step 1: Fix each page file** (read → identify → edit)

**Step 2: Verify build + commit**

```
npm run build
git add src/pages/
git commit -m "feat: fix hardcoded dark-theme colors in page components"
```

---

### Task 4: Fix hardcoded dark-theme colors in shared components

**Files to modify:**
- `src/components/home/Top10Compact.jsx` — podium glow `textShadow`, `PODIUM_STYLE` glow colors
- `src/components/home/RankedDishRow.jsx` — `rgba(244, 122, 31, 0.04)` top-3 bg tint
- `src/components/home/SearchHero.jsx`
- `src/components/BottomNav.jsx`
- `src/components/Layout.jsx`
- `src/components/DishSearch.jsx`
- `src/components/BrowseCard.jsx`
- `src/components/DishCard.jsx`
- `src/components/DishPlaceholder.jsx`
- `src/components/ReviewFlow.jsx`
- `src/components/FollowListModal.jsx`
- `src/components/DishModal.jsx`
- `src/components/WelcomeSplash.jsx`
- `src/components/EarIconTooltip.jsx`
- `src/components/PlateIcon.jsx`
- `src/components/Skeleton.jsx`
- `src/components/TownPicker.jsx`
- `src/components/OfflineIndicator.jsx`
- `src/components/SimilarTasteUsers.jsx`
- `src/components/CategoryImageCard.jsx`
- `src/components/UserSearch.jsx`
- `src/components/NotificationBell.jsx`
- `src/components/VariantPicker.jsx`
- `src/components/ErrorBoundary.jsx`
- `src/components/Auth/LoginModal.jsx`
- `src/components/Auth/WelcomeModal.jsx`

**Key component-specific fixes:**

**Top10Compact.jsx — PODIUM_STYLE:**
- Medal colors are now `--color-medal-*` variables which are darker for light bg
- `textShadow` glow: replace dark glows `${podium.glow}30` with lighter glows or remove (glows look bad on light bg)
- `borderLeft` glow colors: use medal color directly

**RankedDishRow.jsx:**
- Top-3 background `rgba(244, 122, 31, 0.04)` → increase to `rgba(232, 102, 60, 0.06)` for visibility on light bg
- `borderLeft: '3px solid var(--color-primary)'` — fine as-is

**BottomNav.jsx:**
- Likely has dark bg assumption — flip to light

**WelcomeSplash.jsx:**
- Uses `rgba(255, 255, 255, ...)` for text (was light-on-dark) — flip to dark-on-light
- Background gradient — flip to light

**Skeleton.jsx:**
- Skeleton pulse colors need lighter gray tones

**Approach:** Same as Task 3 — read each file, find dark-theme patterns, fix.

**Step 1: Fix each component file** (read → identify → edit)

**Step 2: Verify build + commit**

```
npm run build
git add src/components/
git commit -m "feat: fix hardcoded dark-theme colors in components"
```

---

### Task 5: Fix subdirectory components

**Files to modify:**
- `src/components/browse/CategoryGrid.jsx`
- `src/components/browse/ValueBadge.jsx` (check)
- `src/components/profile/ReviewCard.jsx`
- `src/components/profile/VotedDishCard.jsx`
- `src/components/profile/ReviewDetailModal.jsx`
- `src/components/profile/EmptyState.jsx`
- `src/components/profile/FoodMap.jsx`
- `src/components/profile/HeroIdentityCard.jsx`
- `src/components/profile/EditFavoritesSection.jsx`
- `src/components/restaurants/TopDishCard.jsx`
- `src/components/restaurants/RestaurantDishes.jsx`
- `src/components/restaurants/RestaurantMenu.jsx`
- `src/components/restaurant-admin/DishesManager.jsx`
- `src/components/restaurant-admin/SpecialsManager.jsx`
- `src/components/LocationPicker.jsx`
- `src/components/RestaurantAvatar.jsx` — town color backgrounds may need darkening for light theme

**Step 1: Fix each component** (read → identify → edit)

**Step 2: Verify build + commit**

```
npm run build
git add src/components/
git commit -m "feat: fix dark-theme colors in browse, profile, restaurant components"
```

---

### Task 6: Fix utility files and remaining references

**Files to check:**
- `src/utils/ranking.js` — `color-mix` expressions for rating colors
- `src/lib/analytics.js` (unlikely but check)
- `src/constants/categories.js` (check for any color refs)

**Step 1: Check and fix**

**Step 2: Update CLAUDE.md and NOTES.md**

- Update design tokens table in CLAUDE.md
- Update theme description from "Island Depths" dark to "Appetite" light
- Remove "Dark theme is the only theme" line

**Step 3: Final build verification**

```
npm run build
npm run test
```

**Step 4: Commit**

```
git add -A
git commit -m "feat: update docs and utilities for light theme"
```

---

### Task 7: Visual spot-check and polish

After all mechanical changes, run `npm run dev` and check:

1. Homepage — warm stone bg, white cards, orange-red accents, yellow headlines
2. Browse page — category grid, search, ranked list
3. Dish page — photo overlays still readable, rating colors pop
4. Profile — cards, stats, review history
5. Restaurant page — menu, dishes, specials
6. Welcome splash — light gradient
7. Bottom nav — appropriate for light theme
8. Modals — LoginModal, ReviewFlow, FollowListModal

Fix any visual issues found.

**Commit:**
```
git commit -m "fix: visual polish for light theme edge cases"
```
