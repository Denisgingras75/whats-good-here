# Restaurant Avatar Fallback — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace generic category stock photos with full-bleed RestaurantAvatar (town-colored initials) on all dish cards that lack a user-uploaded photo.

**Architecture:** Three commits in sequence — (1) data layer adds `restaurant_town` to all API responses, (2) component swap replaces `getCategoryImage` fallback with `RestaurantAvatar fill` mode + photo CTA on hero cards, (3) cleanup deletes `categoryImages.js` and dead imports.

**Tech Stack:** React 19, Supabase PostgREST, existing `RestaurantAvatar` component.

---

## Task 1: Add `restaurant_town` to vote history API

The `getDetailedVotesForUser` query joins `restaurants (name)` but doesn't include `town`. Components downstream (`VotedDishCard`) need it.

**Files:**
- Modify: `src/api/votesApi.js:160` — add `town` to restaurants select

**Step 1: Update the select join**

In `votesApi.getDetailedVotesForUser`, change line 160:

```js
// OLD
restaurants (name)

// NEW
restaurants (name, town)
```

**Step 2: Verify no transform needed**

The data flows through as `vote.dishes.restaurants.town` — components access it via `dish.restaurants?.town`. No mapping change needed.

**Step 3: Do the same for `getReviewsForUser`**

In `votesApi.getReviewsForUser`, change line 385:

```js
// OLD
restaurants (name)

// NEW
restaurants (name, town)
```

---

## Task 2: Add `restaurant_town` to `getDishById`

The Dish detail page (`Dish.jsx`) calls `getDishById` which joins restaurants but doesn't include `town`. The `transformDish` function also needs to pass it through.

**Files:**
- Modify: `src/api/dishesApi.js:362-369` — add `town` to restaurants select
- Modify: `src/pages/Dish.jsx:33-49` — add `restaurant_town` to `transformDish`

**Step 1: Update dishesApi.getDishById select**

In the restaurants join at line 362-369, add `town`:

```js
restaurants (
  id,
  name,
  address,
  lat,
  lng,
  cuisine,
  town
)
```

**Step 2: Update transformDish in Dish.jsx**

Add `restaurant_town` to the transform at line 33-49:

```js
restaurant_town: data.restaurants?.town,
```

Place it after the `restaurant_name` line.

---

## Task 3: Verify `dishesApi.search()` already has `restaurant_town`

**Check only — no code change expected.**

Look at `dishesApi.search()` lines 116-133 and 208-223. The select already includes `town` in the restaurants join, and the mapping at line 222 already has `restaurant_town: dish.restaurants?.town`. Confirmed — no change needed.

---

## Task 4: Note on `get_restaurant_dishes` RPC

The restaurant page (`Restaurants.jsx`) already knows the restaurant's town from the restaurant object. When it passes dishes to `TopDishCard`, it can pass `town` as a prop. No RPC change needed — just prop threading in Task 8.

---

## Task 5: Add `fill` mode to RestaurantAvatar

The avatar currently renders as a fixed-size square. Add a `fill` prop that makes it expand to fill its parent container with scaled initials.

**Files:**
- Modify: `src/components/RestaurantAvatar.jsx`

**Step 1: Add `fill` prop and update styles**

```jsx
export const RestaurantAvatar = memo(function RestaurantAvatar({
  name,
  town,
  size = 48,
  fill = false,
  className = ''
}) {
  const initials = getInitials(name)
  const townStyle = getTownStyle(town)

  // In fill mode, avatar expands to fill parent container
  const fillStyles = fill ? {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    fontSize: 'clamp(24px, 8vw, 64px)',
  } : {
    width: size,
    height: size,
    fontSize: `${size < 40 ? size * 0.4 : size * 0.35}px`,
  }

  return (
    <div
      className={`rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        ...fillStyles,
        background: townStyle.bg,
        color: townStyle.text,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        textShadow: townStyle.isGradient ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
      }}
      aria-label={`${name} logo`}
      title={town || 'Restaurant'}
    >
      {initials}
    </div>
  )
})
```

**Key:** In fill mode, `rounded-lg` should become no rounding (the parent container handles shape). Override with `className` if needed, or conditionally apply: `${fill ? '' : 'rounded-lg'}`.

---

## Task 6: Create `DishPlaceholder` helper component

Rather than duplicating the avatar + CTA logic in every card, create a small shared component that wraps RestaurantAvatar in fill mode with an optional photo CTA.

**Files:**
- Create: `src/components/DishPlaceholder.jsx`

```jsx
import { RestaurantAvatar } from './RestaurantAvatar'

/**
 * Placeholder for dish cards without a user photo.
 * Shows full-bleed RestaurantAvatar with optional "snap this dish" CTA.
 *
 * Props:
 * - restaurantName: Restaurant name for initials
 * - restaurantTown: Town for color theming
 * - showCTA: Whether to show the photo prompt (hero cards only)
 */
export function DishPlaceholder({ restaurantName, restaurantTown, showCTA = false }) {
  return (
    <>
      <RestaurantAvatar
        name={restaurantName}
        town={restaurantTown}
        fill
        className="rounded-none"
      />
      {showCTA && (
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
          <span className="text-xs font-medium text-white/90 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.04l-.821 1.315z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            Be first to snap this dish
          </span>
        </div>
      )}
    </>
  )
}
```

---

## Task 7: Swap fallback in `DishCard` (hero, with CTA)

**Files:**
- Modify: `src/components/DishCard.jsx`

**Step 1: Replace import**

```js
// REMOVE
import { getCategoryImage } from '../constants/categoryImages'

// ADD
import { DishPlaceholder } from './DishPlaceholder'
```

**Step 2: Add `restaurant_town` to destructured props**

At line 17, add to the destructured `dish` object:

```js
restaurant_town,
```

**Step 3: Replace image logic**

Remove line 50:
```js
const imageUrl = photo_url || getCategoryImage(category)
```

Remove line 53 (responsive image props for fallback):
```js
const imageProps = getResponsiveImageProps(imageUrl, [400, 600, 800])
```

Replace the image section (lines 58-65) with conditional rendering:

```jsx
<div className="relative w-full aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden group">
  {photo_url ? (
    <img
      {...getResponsiveImageProps(photo_url, [400, 600, 800])}
      alt={dish_name}
      className="w-full h-full object-cover image-zoom"
      loading="lazy"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
    />
  ) : (
    <DishPlaceholder
      restaurantName={restaurant_name}
      restaurantTown={restaurant_town}
      showCTA
    />
  )}

  {/* Keep existing gradient overlay, rating badge, top badges row unchanged */}
```

**Note:** The gradient overlay and badges remain — they render on top of either the photo or the placeholder.

---

## Task 8: Swap fallback in `BrowseCard` (hero, with CTA)

**Files:**
- Modify: `src/components/BrowseCard.jsx`

**Step 1: Replace import**

```js
// REMOVE
import { getCategoryImage } from '../constants/categoryImages'

// ADD
import { DishPlaceholder } from './DishPlaceholder'
```

**Step 2: Add `restaurant_town` to destructured props**

At line 20, add:
```js
restaurant_town,
```

**Step 3: Replace image rendering**

Remove line 48:
```js
const imgSrc = photo_url || getCategoryImage(category)
```

Replace the image section (lines 77-95) — the `<div className="relative aspect-[16/10]">` contents:

```jsx
<div className="relative aspect-[16/10] overflow-hidden image-placeholder">
  {photo_url ? (
    <img
      {...(getResponsiveImageProps(photo_url, [300, 400, 600]) || { src: '' })}
      alt={dish_name}
      loading="lazy"
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
      className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
        imageLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImageLoaded(true)}
    />
  ) : (
    <DishPlaceholder
      restaurantName={restaurant_name}
      restaurantTown={restaurant_town}
      showCTA
    />
  )}

  {/* Keep gradient overlay, rating badge, distance, favorite button unchanged */}
```

Remove the `onError` fallback to `getCategoryImage` — no longer needed.

---

## Task 9: Swap fallback in `TopDishCard` (thumbnail, no CTA)

**Files:**
- Modify: `src/components/restaurants/TopDishCard.jsx`

**Step 1: Replace import**

```js
// REMOVE
import { getCategoryImage } from '../../constants/categoryImages'

// ADD
import { RestaurantAvatar } from '../RestaurantAvatar'
```

**Step 2: Accept `restaurantName` and `restaurantTown` props**

The restaurant page already has this data. Add to the function signature:

```jsx
export function TopDishCard({ dish, rank, onVote, onLoginRequired, isFavorite, onToggleFavorite, friendVotes, restaurantName, restaurantTown }) {
```

**Step 3: Replace image logic**

Remove line 29:
```js
const imgSrc = photo_url || getCategoryImage(category)
```

Replace the photo `<div>` (lines 98-108):

```jsx
{/* Photo */}
<div
  className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative"
  style={{ background: 'var(--color-surface)', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)' }}
>
  {photo_url ? (
    <img
      src={photo_url}
      alt={dish_name}
      loading="lazy"
      className="w-full h-full object-cover"
    />
  ) : (
    <RestaurantAvatar
      name={restaurantName || 'Restaurant'}
      town={restaurantTown}
      fill
      className="rounded-none"
    />
  )}
</div>
```

**Step 4: Thread props from parent**

In `src/components/restaurants/RestaurantDishes.jsx` (or wherever `TopDishCard` is rendered), pass `restaurantName={restaurant.name}` and `restaurantTown={restaurant.town}` to each `TopDishCard`.

---

## Task 10: Swap fallback in `VotedDishCard` (thumbnail, no CTA)

**Files:**
- Modify: `src/components/profile/VotedDishCard.jsx`

**Step 1: Replace import**

```js
// REMOVE
import { getCategoryImage } from '../../constants/categoryImages'

// ADD
import { RestaurantAvatar } from '../RestaurantAvatar'
```

**Step 2: Replace image logic**

Remove line 35:
```js
const imageUrl = dish.photo_url || getCategoryImage(dish.category)
```

Add restaurant town extraction:
```js
const restaurantTown = dish.restaurant_town || dish.restaurants?.town
```

Replace the image `<div>` (lines 73-83):

```jsx
<div
  className="w-24 h-24 rounded-l-xl flex-shrink-0 overflow-hidden relative"
  style={{ background: 'var(--color-surface-elevated)' }}
>
  {dish.photo_url ? (
    <img
      src={dish.photo_url}
      alt={dishName}
      loading="lazy"
      className="w-full h-full object-cover"
    />
  ) : (
    <RestaurantAvatar
      name={restaurantName || 'Restaurant'}
      town={restaurantTown}
      fill
      className="rounded-none"
    />
  )}
</div>
```

---

## Task 11: Swap fallback in `UnratedDishCard` (thumbnail, no CTA)

**Files:**
- Modify: `src/components/profile/UnratedDishCard.jsx`

**Step 1: Replace import**

```js
// REMOVE
import { getCategoryImage } from '../../constants/categoryImages'

// ADD
import { RestaurantAvatar } from '../RestaurantAvatar'
```

**Step 2: Replace image logic**

Remove line 14:
```js
const imageUrl = dish.user_photo_url || dish.photo_url || getCategoryImage(dish.category)
```

Replace with:
```js
const imageUrl = dish.user_photo_url || dish.photo_url
```

Replace the `<img>` in the button (lines 37-48) with conditional:

```jsx
{imageUrl ? (
  <img
    src={imageUrl}
    alt={dish.dish_name}
    loading="lazy"
    className="w-full h-full object-cover"
  />
) : (
  <RestaurantAvatar
    name={dish.restaurant_name || 'Restaurant'}
    town={dish.restaurant_town || dish.restaurants?.town}
    fill
    className="rounded-none"
  />
)}
```

Keep the "Your photo" badge overlay — it only shows when `dish.user_photo_url` exists, so it won't appear on the avatar.

---

## Task 12: Swap fallback in `ReviewCard` (thumbnail, no CTA)

**Files:**
- Modify: `src/components/profile/ReviewCard.jsx`

**Step 1: Replace import**

```js
// REMOVE
import { getCategoryImage } from '../../constants/categoryImages'

// ADD
import { RestaurantAvatar } from '../RestaurantAvatar'
```

**Step 2: Replace image logic**

Remove line 15:
```js
const imageUrl = dish?.photo_url || getCategoryImage(dish?.category)
```

Add:
```js
const restaurantTown = dish?.restaurants?.town
```

Replace the image `<div>` (lines 28-38):

```jsx
<div
  className={`${onClick ? 'w-14 h-14 rounded-lg m-3' : 'w-20 h-20'} flex-shrink-0 overflow-hidden relative`}
  style={{ background: 'var(--color-surface-elevated)' }}
>
  {dish?.photo_url ? (
    <img
      src={dish.photo_url}
      alt={dishName}
      loading="lazy"
      className="w-full h-full object-cover"
    />
  ) : (
    <RestaurantAvatar
      name={restaurantName || 'Restaurant'}
      town={restaurantTown}
      fill
      className="rounded-none"
    />
  )}
</div>
```

---

## Task 13: Swap fallback in `ReviewDetailModal` (hero, with CTA)

**Files:**
- Modify: `src/components/profile/ReviewDetailModal.jsx`

**Step 1: Replace import**

```js
// REMOVE
import { getCategoryImage } from '../../constants/categoryImages'

// ADD
import { DishPlaceholder } from '../DishPlaceholder'
```

**Step 2: Replace image logic**

Remove line 24:
```js
const imgSrc = dish.photo_url || getCategoryImage(dish.category)
```

Replace wherever the hero image `<img>` renders with conditional rendering:

```jsx
{dish.photo_url ? (
  <img src={dish.photo_url} alt={dish.name} className="w-full h-full object-cover" />
) : (
  <DishPlaceholder
    restaurantName={dish.restaurants?.name || 'Restaurant'}
    restaurantTown={dish.restaurants?.town}
    showCTA
  />
)}
```

---

## Task 14: Swap fallback in `DishSearch` (thumbnail, no CTA)

**Files:**
- Modify: `src/components/DishSearch.jsx`

**Step 1: Replace import**

```js
// REMOVE
import { getCategoryImage } from '../constants/categoryImages'

// ADD
import { getCategoryNeonImage } from '../constants/categories'
```

(RestaurantAvatar is already imported in DishSearch.)

**Step 2: In `DishResult` component (line 327)**

Remove:
```js
const imgSrc = photo_url || getCategoryImage(category)
```

The DishResult already renders a `RestaurantAvatar` at line 338. The stock photo `<img>` that was at the old line using `imgSrc` should be removed if it exists, or if the only image usage is the RestaurantAvatar, no change needed. Verify the component only uses the already-present RestaurantAvatar for the dish result row.

**Step 3: In `CategoryResult` component (line 416)**

Replace `getCategoryImage(category.id)` with `getCategoryNeonImage(category.id)`:

```js
src={getCategoryNeonImage(category.id)}
```

This uses the stylized neon category icons (already exist in `/public/categories/`) instead of stock food photos. Add a fallback for categories without a neon image — use a colored circle with the category emoji from `CATEGORY_INFO`.

---

## Task 15: Swap fallback in `Dish.jsx` (hero, with CTA)

**Files:**
- Modify: `src/pages/Dish.jsx`

**Step 1: Replace import**

```js
// REMOVE
import { getCategoryImage } from '../constants/categoryImages'

// ADD
import { DishPlaceholder } from '../components/DishPlaceholder'
```

**Step 2: Update transformDish**

(Already done in Task 2 — `restaurant_town` is now available.)

**Step 3: Replace hero image logic**

Change line 342:
```js
// OLD
const heroImage = featuredPhoto?.photo_url || dish?.photo_url || getCategoryImage(dish?.category)

// NEW
const heroImage = featuredPhoto?.photo_url || dish?.photo_url
```

Replace the hero `<img>` (lines 456-468) with conditional:

```jsx
<div className="relative aspect-[4/3] overflow-hidden">
  {heroImage ? (
    <img
      src={heroImage}
      alt={dish.dish_name}
      loading="lazy"
      className="w-full h-full object-cover"
    />
  ) : (
    <DishPlaceholder
      restaurantName={dish.restaurant_name}
      restaurantTown={dish.restaurant_town}
      showCTA
    />
  )}

  {/* Keep gradient overlay and rating badge unchanged */}
```

Remove the `onError` handler that falls back to `getCategoryImage`.

---

## Task 16: Remove `preloadCategoryImages` from App.jsx

**Files:**
- Modify: `src/App.jsx:12,95`

**Step 1: Remove import**

```js
// REMOVE
import { preloadCategoryImages } from './constants/categories'
```

**Step 2: Remove call**

Remove line 95:
```js
preloadCategoryImages()
```

---

## Task 17: Commit — data layer + component swap

```bash
git add src/api/votesApi.js src/api/dishesApi.js src/pages/Dish.jsx \
  src/components/RestaurantAvatar.jsx src/components/DishPlaceholder.jsx \
  src/components/DishCard.jsx src/components/BrowseCard.jsx \
  src/components/restaurants/TopDishCard.jsx \
  src/components/profile/VotedDishCard.jsx \
  src/components/profile/UnratedDishCard.jsx \
  src/components/profile/ReviewCard.jsx \
  src/components/profile/ReviewDetailModal.jsx \
  src/components/DishSearch.jsx \
  src/App.jsx
git commit -m "Replace stock photo fallbacks with RestaurantAvatar

Dish cards without user photos now show town-colored restaurant
initials instead of generic category stock images. Hero cards
include a 'Be first to snap this dish' CTA.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 18: Delete `categoryImages.js` + cleanup

**Files:**
- Delete: `src/constants/categoryImages.js`
- Modify: `src/constants/categories.js` — remove `preloadCategoryImages` function

**Step 1: Delete the file**

```bash
rm src/constants/categoryImages.js
```

**Step 2: Remove `preloadCategoryImages` from categories.js**

Delete lines 148-154 (the `preloadCategoryImages` function). The `CATEGORY_NEON_IMAGES` and `getCategoryNeonImage` stay — they're used by `CategoryIcon` for navigation.

**Step 3: Verify no remaining imports**

```bash
grep -r "categoryImages" src/
grep -r "getCategoryImage" src/
```

Both should return zero results.

**Step 4: Build check**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add -u
git commit -m "Delete categoryImages.js — stock photos removed

Separate commit for clean rollback. All dish card fallbacks
now use RestaurantAvatar.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 19: Verify

**Run:**
```bash
npm run build
npm run test
```

**Manual checks:**
- Browse page: cards without photos show colored initials, not stock images
- Dish detail page: hero shows avatar with "Be first to snap this dish"
- Restaurant page: TopDishCard thumbnails show restaurant initials
- Profile: vote history and review cards show initials
- Search: dish results show RestaurantAvatar, category suggestions show neon icons
- Dishes WITH user photos: still show the user photo (unchanged)

**Grep checks:**
```bash
grep -r "getCategoryImage" src/    # should return 0 results
grep -r "categoryImages" src/      # should return 0 results
grep -r "burger.jpg\|taco.jpg\|pizza.jpg" src/  # should return 0 results
```
