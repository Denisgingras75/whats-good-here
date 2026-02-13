# Inline Category Filtering on Homepage

## Problem

Tapping a category pill navigates to a separate Browse page. This adds a click and a screen transition for something that could happen inline. The homepage already has all ranked dishes loaded.

## Design

### Behavior

- **Default:** Top 10 overall (no change)
- **Tap category pill:** Pill highlights (rust bg, white text). Top 10 section replaced with up to 10 ranked dishes from that category, filtered client-side. A "See all {Category}" link appears below the list, linking to `/browse?category=X`.
- **Tap same pill again:** Deselects, returns to overall Top 10.
- **Tap different pill:** Switches to that category instantly.

### UI Changes

1. **CategoryPill** gets `isActive` prop — active: `var(--color-primary)` bg + white text
2. **Top10Compact headline** adapts:
   - No category: "The best dishes on the Vineyard right now"
   - With category: "The best Pizza on the Vineyard right now"
   - With town + category: "The best Pizza in Oak Bluffs right now"
3. **Top10Compact header** adapts: "Top 10 on the Island" → "Top Pizza on the Island"
4. **Personal toggle** hides when category is selected
5. **Empty state** if no dishes match: "No {category} ranked yet"
6. **"See all {Category}" link** below the list navigates to Browse page

### Data Flow

- `Home.jsx` adds `selectedCategory` state
- New `categoryDishes` useMemo filters `dishes` by `dish.category === selectedCategory`
- Top10Compact receives either `top10Dishes` or `categoryDishes` depending on selection
- No API/hooks changes — client-side filtering only

### Approach

Client-side filter (Approach A). The `useDishes` hook already fetches all ranked dishes for the location/town. Filtering is instant with no loading spinner.

### Files

- `src/pages/Home.jsx` — selectedCategory state, categoryDishes memo, active pill styling, "See all" link
- `src/components/home/Top10Compact.jsx` — categoryLabel prop for headline/header customization

No new files. No API changes.
