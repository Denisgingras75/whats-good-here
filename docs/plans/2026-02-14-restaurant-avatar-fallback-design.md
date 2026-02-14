# Phase 1: Replace Stock Photo Fallbacks with RestaurantAvatar

> Approved 2026-02-14. Kill the 24 generic category stock images. When a dish has no user photo, show a full-bleed RestaurantAvatar (town-colored background + restaurant initials) instead.

---

## Problem

Every dish without a user-uploaded photo shows the same generic category stock image (burger.jpg, taco.jpg, etc.). 15 burgers across the island = 15 identical cards. Makes the app look like a template, not a real food discovery platform with real data.

## Solution

Replace the stock image fallback with the existing `RestaurantAvatar` component, which generates town-colored initials (Oak Bluffs = denim blue, Edgartown = lobster red, etc.). Each restaurant becomes visually distinct even without photos. User-uploaded photos are untouched.

## Design Decisions

### RestaurantAvatar `fill` mode

Add a `fill` boolean prop. When `fill={true}`:
- `width: 100%; height: 100%; position: absolute; inset: 0;`
- Font size scales with container height via `clamp()` — don't overthink the math
- Keeps existing small-square behavior as default

### Photo CTA

Hero-sized placeholders get a subtle "Be first to snap this dish" camera prompt overlay. Thumbnails (< 96px) do not — too small.

### Null town fallback

`RestaurantAvatar` already handles missing town with `DEFAULT_COLOR` (slate #5C6B73). No crash, no silent fallback to stock photos.

## Components Affected (9)

| Component | Image size | CTA? |
|---|---|---|
| `DishCard` | aspect-4/3 hero | Yes |
| `BrowseCard` | aspect-16/10 | Yes |
| `TopDishCard` | 64x64 thumbnail | No |
| `VotedDishCard` | 96x96 thumbnail | No |
| `UnratedDishCard` | 96x96 thumbnail | No |
| `ReviewCard` | 56-80px thumbnail | No |
| `ReviewDetailModal` | hero image | Yes |
| `DishSearch` | 48x48 inline | No |
| `Dish.jsx` | hero image | Yes |

## Data Layer Changes

Add `restaurant_town` to all API responses that feed dish cards:

- `dishesApi.search()` — add `town` to select fields + mapping
- `get_restaurant_dishes` RPC — already has restaurant context, pass town through
- Vote history / review queries — add `restaurants.town` to select joins
- `getDishById` — add town to response

## Deleted Code

- `src/constants/categoryImages.js` — entire file
- All `getCategoryImage` imports (9 files)
- `preloadCategoryImages` call in `App.jsx`
- Category image preload logic in `categories.js`

## Commit Strategy

1. Data layer: add `restaurant_town` to all API queries — verify in console
2. Component swap: RestaurantAvatar `fill` mode + replace fallbacks in all 9 components
3. Cleanup: delete `categoryImages.js` and all imports (separate commit for clean rollback)

## Sets Up Phase 2

When restaurant managers upload logos, `RestaurantAvatar` checks `logo_url` first, falls back to town initials. The component swap is already done — Phase 2 is just a data column + conditional image render.
