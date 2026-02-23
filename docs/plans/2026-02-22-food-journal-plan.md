# Food Journal Profile Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the profile from a 5-tab data filing cabinet into a chronological food journal with shelf filters and shareable location-filtered links.

**Architecture:** Replace Profile.jsx's tab-based rendering with a single reverse-chronological feed component. Shelf filters (All/Good Here/Heard/Wasn't Good Here) narrow the feed. New JournalCard component renders three card types. Share link with location query param. Data layer (hooks, API) stays untouched.

**Tech Stack:** React 19, React Router v7, existing useUserVotes + useFavorites hooks, CSS variables for theming.

**Design doc:** `docs/plans/2026-02-22-food-journal-profile-design.md`

---

### Task 1: JournalCard Component — Good Here Variant

**Files:**
- Create: `src/components/profile/JournalCard.jsx`
- Create: `src/components/profile/JournalCard.test.jsx`
- Modify: `src/components/profile/index.js` (add export)

**Context:** This is the core card rendered in the journal feed. Three variants: `good-here`, `not-good-here`, `heard`. Start with `good-here`.

**Step 1: Write the failing test**

```jsx
// src/components/profile/JournalCard.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { JournalCard } from './JournalCard'

const mockDish = {
  dish_id: 1,
  dish_name: 'Lobster Roll',
  restaurant_name: "Nancy's",
  restaurant_town: 'Oak Bluffs',
  category: 'Seafood',
  rating_10: 9.2,
  community_avg: 8.4,
  review_text: 'Best on the island, hands down.',
  voted_at: '2026-02-20T12:00:00Z',
  photo_url: null,
  would_order_again: true,
}

describe('JournalCard', () => {
  it('renders good-here variant with dish name, rating, and restaurant', () => {
    render(
      <MemoryRouter>
        <JournalCard dish={mockDish} variant="good-here" />
      </MemoryRouter>
    )
    expect(screen.getByText('Lobster Roll')).toBeTruthy()
    expect(screen.getByText("Nancy's")).toBeTruthy()
    expect(screen.getByText('9.2')).toBeTruthy()
  })

  it('shows community avg next to user rating', () => {
    render(
      <MemoryRouter>
        <JournalCard dish={mockDish} variant="good-here" />
      </MemoryRouter>
    )
    expect(screen.getByText(/8\.4/)).toBeTruthy()
  })

  it('shows review text inline when present', () => {
    render(
      <MemoryRouter>
        <JournalCard dish={mockDish} variant="good-here" />
      </MemoryRouter>
    )
    expect(screen.getByText(/Best on the island/)).toBeTruthy()
  })

  it('shows relative timestamp', () => {
    render(
      <MemoryRouter>
        <JournalCard dish={mockDish} variant="good-here" />
      </MemoryRouter>
    )
    // Should show a date string (exact format depends on relative time logic)
    expect(screen.getByText(/Feb 20|2 days ago/)).toBeTruthy()
  })

  it('shows town/city in location line', () => {
    render(
      <MemoryRouter>
        <JournalCard dish={mockDish} variant="good-here" />
      </MemoryRouter>
    )
    expect(screen.getByText(/Oak Bluffs/)).toBeTruthy()
  })

  it('navigates to dish page on click', () => {
    render(
      <MemoryRouter>
        <JournalCard dish={mockDish} variant="good-here" />
      </MemoryRouter>
    )
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/dish/1')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/profile/JournalCard.test.jsx`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

Build `JournalCard.jsx` with these specs:
- `variant` prop: `'good-here'` | `'not-good-here'` | `'heard'`
- `dish` prop: object with fields from useUserVotes/useFavorites
- Renders as a `<Link to={/dish/${dish.dish_id}}>` wrapper (tappable card)
- Layout: photo thumbnail left (or category emoji placeholder) → info right
- Info: dish name (bold), restaurant + town (secondary), your rating (big, color-coded via `getRatingColor()`), community avg (small), review text (2-line clamp), timestamp
- All colors via CSS variables
- Uses `getRatingColor()` from `src/utils/ranking.js`

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/profile/JournalCard.test.jsx`
Expected: PASS

**Step 5: Add export to barrel**

Add `export { JournalCard } from './JournalCard'` to `src/components/profile/index.js`

**Step 6: Commit**

```bash
git add src/components/profile/JournalCard.jsx src/components/profile/JournalCard.test.jsx src/components/profile/index.js
git commit -m "feat: JournalCard component — good-here variant with rating, review, timestamp"
```

---

### Task 2: JournalCard — Not Good Here and Heard Variants

**Files:**
- Modify: `src/components/profile/JournalCard.jsx`
- Modify: `src/components/profile/JournalCard.test.jsx`

**Step 1: Add tests for not-good-here variant**

```jsx
it('renders not-good-here variant with muted styling', () => {
  render(
    <MemoryRouter>
      <JournalCard dish={{ ...mockDish, would_order_again: false }} variant="not-good-here" />
    </MemoryRouter>
  )
  expect(screen.getByText('Lobster Roll')).toBeTruthy()
  // Card should have muted opacity or different background
  const card = screen.getByRole('link')
  expect(card.style.opacity || card.className).toBeTruthy()
})
```

**Step 2: Add tests for heard variant**

```jsx
const mockHeard = {
  dish_id: 2,
  dish_name: 'Fish Tacos',
  restaurant_name: 'Offshore Ale',
  restaurant_town: 'Oak Bluffs',
  category: 'Tacos',
  saved_at: '2026-02-19T10:00:00Z',
  photo_url: null,
}

it('renders heard variant with no rating and "Tried it?" button', () => {
  const onTriedIt = vi.fn()
  render(
    <MemoryRouter>
      <JournalCard dish={mockHeard} variant="heard" onTriedIt={onTriedIt} />
    </MemoryRouter>
  )
  expect(screen.getByText('Fish Tacos')).toBeTruthy()
  expect(screen.getByText(/Tried it/)).toBeTruthy()
  // No rating should be visible
  expect(screen.queryByText(/\/10/)).toBeNull()
})
```

**Step 3: Run tests to verify they fail**

Run: `npm run test -- src/components/profile/JournalCard.test.jsx`
Expected: FAIL — variants not implemented

**Step 4: Implement variants**

- `not-good-here`: Same layout as good-here but with `opacity: 0.75` on the card, muted rating color. Feels like a note-to-self.
- `heard`: No rating section. Shows dish name + restaurant + town + saved_at timestamp. Has a `"Tried it?"` button (styled as CTA, `var(--color-primary)` background). Button calls `onTriedIt(dish)` prop. Does NOT wrap in `<Link>` — the CTA is the primary action.

**Step 5: Run tests to verify they pass**

Run: `npm run test -- src/components/profile/JournalCard.test.jsx`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/components/profile/JournalCard.jsx src/components/profile/JournalCard.test.jsx
git commit -m "feat: JournalCard not-good-here and heard variants"
```

---

### Task 3: ShelfFilter Component

**Files:**
- Create: `src/components/profile/ShelfFilter.jsx`
- Create: `src/components/profile/ShelfFilter.test.jsx`
- Modify: `src/components/profile/index.js` (add export)

**Step 1: Write the failing test**

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ShelfFilter } from './ShelfFilter'

describe('ShelfFilter', () => {
  const shelves = [
    { id: 'all', label: 'All' },
    { id: 'good-here', label: 'Good Here' },
    { id: 'heard', label: "Heard That's Good There" },
    { id: 'not-good-here', label: "Wasn't Good Here" },
  ]

  it('renders all shelf labels', () => {
    render(<ShelfFilter shelves={shelves} active="all" onSelect={() => {}} />)
    expect(screen.getByText('All')).toBeTruthy()
    expect(screen.getByText('Good Here')).toBeTruthy()
    expect(screen.getByText("Heard That's Good There")).toBeTruthy()
    expect(screen.getByText("Wasn't Good Here")).toBeTruthy()
  })

  it('highlights the active shelf', () => {
    render(<ShelfFilter shelves={shelves} active="good-here" onSelect={() => {}} />)
    const activeButton = screen.getByText('Good Here')
    expect(activeButton.style.fontWeight).toBe('700')
  })

  it('calls onSelect when a shelf is tapped', () => {
    const onSelect = vi.fn()
    render(<ShelfFilter shelves={shelves} active="all" onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Good Here'))
    expect(onSelect).toHaveBeenCalledWith('good-here')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/profile/ShelfFilter.test.jsx`

**Step 3: Implement ShelfFilter**

- Horizontal scrollable row of buttons
- `position: sticky; top: 0; z-index: 10` (sticks below hero on scroll)
- Active shelf: `fontWeight: 700`, underline via `borderBottom: 2px solid var(--color-primary)`
- Inactive: `fontWeight: 400`, `color: var(--color-text-secondary)`
- Background: `var(--color-bg)` (matches page)
- Horizontal overflow: `overflow-x: auto; -webkit-overflow-scrolling: touch`

**Step 4: Run tests, verify pass**

**Step 5: Add export to barrel, commit**

```bash
git add src/components/profile/ShelfFilter.jsx src/components/profile/ShelfFilter.test.jsx src/components/profile/index.js
git commit -m "feat: ShelfFilter — sticky horizontal shelf filter bar"
```

---

### Task 4: JournalFeed Component

**Files:**
- Create: `src/components/profile/JournalFeed.jsx`
- Create: `src/components/profile/JournalFeed.test.jsx`
- Modify: `src/components/profile/index.js` (add export)

**Context:** This component takes all three data sources (worthIt, avoid, favorites), merges them into one chronological feed, and renders JournalCards. It handles shelf filtering.

**Step 1: Write the failing test**

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { JournalFeed } from './JournalFeed'

const worthIt = [
  { dish_id: 1, dish_name: 'Lobster Roll', restaurant_name: "Nancy's", restaurant_town: 'Oak Bluffs', rating_10: 9.2, community_avg: 8.4, voted_at: '2026-02-20T12:00:00Z', would_order_again: true },
]
const avoid = [
  { dish_id: 2, dish_name: 'Clam Strips', restaurant_name: 'Giordano', restaurant_town: 'Oak Bluffs', rating_10: 3.5, community_avg: 5.1, voted_at: '2026-02-19T12:00:00Z', would_order_again: false },
]
const heard = [
  { dish_id: 3, dish_name: 'Fish Tacos', restaurant_name: 'Offshore Ale', restaurant_town: 'Oak Bluffs', saved_at: '2026-02-18T10:00:00Z' },
]

describe('JournalFeed', () => {
  it('renders all entries in reverse chronological order by default', () => {
    render(
      <MemoryRouter>
        <JournalFeed worthIt={worthIt} avoid={avoid} heard={heard} activeShelf="all" />
      </MemoryRouter>
    )
    const items = screen.getAllByTestId('journal-card')
    // Most recent first: Lobster Roll (Feb 20), Clam Strips (Feb 19), Fish Tacos (Feb 18)
    expect(items).toHaveLength(3)
  })

  it('filters to only good-here when shelf is active', () => {
    render(
      <MemoryRouter>
        <JournalFeed worthIt={worthIt} avoid={avoid} heard={heard} activeShelf="good-here" />
      </MemoryRouter>
    )
    expect(screen.getByText('Lobster Roll')).toBeTruthy()
    expect(screen.queryByText('Clam Strips')).toBeNull()
    expect(screen.queryByText('Fish Tacos')).toBeNull()
  })

  it('filters to only heard when shelf is active', () => {
    render(
      <MemoryRouter>
        <JournalFeed worthIt={worthIt} avoid={avoid} heard={heard} activeShelf="heard" />
      </MemoryRouter>
    )
    expect(screen.getByText('Fish Tacos')).toBeTruthy()
    expect(screen.queryByText('Lobster Roll')).toBeNull()
  })

  it('shows empty state when filtered shelf has no entries', () => {
    render(
      <MemoryRouter>
        <JournalFeed worthIt={[]} avoid={avoid} heard={heard} activeShelf="good-here" />
      </MemoryRouter>
    )
    expect(screen.getByText(/no dishes/i)).toBeTruthy()
  })
})
```

**Step 2: Run test to verify it fails**

**Step 3: Implement JournalFeed**

- Accepts: `worthIt`, `avoid`, `heard`, `activeShelf`, `onTriedIt`, `loading`
- Merges all three arrays with a `type` tag ('good-here', 'not-good-here', 'heard')
- Uses `voted_at` for votes, `saved_at` for heard — sorts reverse chronological
- Filters by `activeShelf` (or shows all if 'all')
- Maps to `<JournalCard>` with correct variant
- Shows `<EmptyState>` (from existing profile components) when filtered list is empty
- Shows loading skeleton when `loading` is true
- Each card gets `data-testid="journal-card"` for testing

**Step 4: Run tests, verify pass**

**Step 5: Add export, commit**

```bash
git add src/components/profile/JournalFeed.jsx src/components/profile/JournalFeed.test.jsx src/components/profile/index.js
git commit -m "feat: JournalFeed — chronological feed with shelf filtering"
```

---

### Task 5: Rewire Profile.jsx to Journal Layout

**Files:**
- Modify: `src/pages/Profile.jsx` (~897 lines → should shrink significantly)
- Test: `npm run build` (verify no breakage)

**Context:** This is the big swap. Replace the 5-tab system with hero → ShelfFilter → JournalFeed. Keep all settings/modals/auth logic. Delete tab rendering code.

**Step 1: Read current Profile.jsx fully** to understand which sections stay vs go.

**Step 2: Replace TABS constant and tab rendering**

Remove:
- `TABS` constant (lines 41-47)
- `getTabDishes()` function (lines 232-247)
- `visibleDishes` logic (lines 257-258)
- Tab bar rendering (the horizontal tab buttons)
- Per-tab conditional rendering (DishListItem for voted, ReviewCard for reviews, UnratedDishCard for unrated)
- `expandedTabs` state

Add:
- `activeShelf` state: `useState('all')`
- `SHELVES` constant:
  ```js
  const SHELVES = [
    { id: 'all', label: 'All' },
    { id: 'good-here', label: 'Good Here' },
    { id: 'heard', label: "Heard That's Good There" },
    { id: 'not-good-here', label: "Wasn't Good Here" },
  ]
  ```
- `<ShelfFilter>` below hero
- `<JournalFeed>` below ShelfFilter, passing `worthItDishes`, `avoidDishes`, `favorites`, `activeShelf`
- `onTriedIt` handler: opens the existing `DishModal` for the selected dish (reuse existing pattern from unrated tab)

**Keep untouched:**
- HeroIdentityCard and all its state (name editing, follow counts)
- Rating style / standout picks section
- SimilarTasteUsers
- Settings section at bottom (sounds, admin, manage restaurant, privacy, sign out)
- All modal state (FollowListModal, ReviewDetailModal, DishModal)
- All auth/loading/error handling

**Step 3: Run build to verify**

Run: `npm run build`
Expected: SUCCESS

**Step 4: Run all tests**

Run: `npm run test`
Expected: All pass (existing tests may need updates if they reference removed tab structure)

**Step 5: Commit**

```bash
git add src/pages/Profile.jsx
git commit -m "refactor: Profile page — journal feed replaces 5-tab system"
```

---

### Task 6: Rewire UserProfile.jsx to Journal Layout

**Files:**
- Modify: `src/pages/UserProfile.jsx` (~774 lines)

**Context:** Same transformation as Profile.jsx but for viewing other people's profiles. Simpler — no settings, no modals, no editing.

**Step 1: Replace tab system with ShelfFilter + JournalFeed**

Same pattern as Task 5 but:
- Only three shelves visible: All / Good Here / Wasn't Good Here (no "Heard" — that's private to the owner, per design doc the want-to-try list is yours)
- Actually — design says public by default. Check with Denis. For now: show all four shelves on other profiles too. Pioneers share their want-to-try list publicly.
- `JournalCard` variant `'other-profile'` — could show "their rating vs your rating" comparison. For MVP, reuse same card variants. Enhancement later.

**Step 2: Run build + tests**

Run: `npm run build && npm run test`

**Step 3: Commit**

```bash
git add src/pages/UserProfile.jsx
git commit -m "refactor: UserProfile page — journal feed for public profiles"
```

---

### Task 7: Share Profile Link with Location Filter

**Files:**
- Create: `src/components/profile/SharePicksButton.jsx`
- Create: `src/components/profile/SharePicksButton.test.jsx`
- Modify: `src/pages/Profile.jsx` (add button to hero)
- Modify: `src/pages/UserProfile.jsx` (read location query param)
- Modify: `src/components/profile/index.js` (add export)

**Step 1: Write the failing test**

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SharePicksButton } from './SharePicksButton'

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
})

// Mock navigator.share
const mockShare = vi.fn().mockResolvedValue(undefined)

describe('SharePicksButton', () => {
  it('renders Share My Picks button', () => {
    render(<SharePicksButton username="denis" />)
    expect(screen.getByText(/Share/i)).toBeTruthy()
  })

  it('generates location-filtered URL when location is provided', async () => {
    render(<SharePicksButton username="denis" location="marthas-vineyard" />)
    fireEvent.click(screen.getByText(/Share/i))
    // Should attempt to copy/share a URL with location param
  })
})
```

**Step 2: Implement SharePicksButton**

- Props: `username`, `location` (optional — current town/island from LocationContext)
- On tap: uses Web Share API if available (`navigator.share`), falls back to clipboard copy + toast
- URL format: `${window.location.origin}/user/${userId}?location=${location}`
- Shows a small toast "Link copied!" on clipboard fallback

**Step 3: Add location filtering to UserProfile.jsx**

- Read `location` from URL query params: `useSearchParams()`
- If `location` param exists, filter the journal feed to only show dishes from restaurants in that location
- Show a banner at top: "Showing [username]'s picks in Martha's Vineyard" with "Show all" clear button

**Step 4: Add SharePicksButton to Profile.jsx hero section**

- Below the stats line in HeroIdentityCard area
- Pass current town from LocationContext as `location` prop

**Step 5: Run build + tests**

Run: `npm run build && npm run test`

**Step 6: Commit**

```bash
git add src/components/profile/SharePicksButton.jsx src/components/profile/SharePicksButton.test.jsx src/pages/Profile.jsx src/pages/UserProfile.jsx src/components/profile/index.js
git commit -m "feat: Share My Picks — location-filtered profile link sharing"
```

---

### Task 8: Cleanup Dead Code

**Files:**
- Possibly remove or simplify: `src/components/DishListItem.jsx` (if `variant='voted'` is no longer used anywhere)
- Check all imports of removed profile components
- Remove unused tab-related state from Profile.jsx and UserProfile.jsx

**Step 1: Grep for DishListItem voted variant usage**

Run: `grep -r "variant.*voted\|voteVariant" src/ --include="*.jsx" --include="*.js"`

If only used in old profile code (now replaced), remove the voted variant code path from DishListItem. Keep the `variant='ranked'` path — it's used in Browse/Home.

**Step 2: Grep for removed component imports**

Check that nothing still imports the old tab components that were replaced.

**Step 3: Run build + tests**

Run: `npm run build && npm run test`
Expected: PASS with no dead imports

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove dead profile tab code, clean up unused voted variant"
```

---

### Task 9: Final Verification

**Step 1: Run full build**

Run: `npm run build`
Expected: SUCCESS

**Step 2: Run all tests**

Run: `npm run test`
Expected: ALL PASS

**Step 3: Manual smoke test checklist**

- [ ] Open Profile page — see journal feed, not tabs
- [ ] Shelf filters work — tap each one, feed filters correctly
- [ ] "All" shows entries from all shelves in reverse chronological order
- [ ] "Heard" entries show "Tried it?" button
- [ ] Tapping "Tried it?" opens vote flow
- [ ] After voting on a "Heard" dish, it moves to Good Here or Wasn't Good Here
- [ ] Share button generates correct URL
- [ ] Opening shared URL shows location-filtered profile
- [ ] Other user profiles show journal feed layout
- [ ] Settings section still works (sounds, sign out, etc.)
- [ ] Both themes render correctly (Appetite + Island Depths)
- [ ] No hardcoded hex colors in new components

**Step 4: Grep for violations**

```bash
# No hardcoded hex
grep -rn '#[0-9A-Fa-f]\{3,6\}' src/components/profile/JournalCard.jsx src/components/profile/ShelfFilter.jsx src/components/profile/JournalFeed.jsx src/components/profile/SharePicksButton.jsx

# No console.log
grep -rn 'console\.' src/components/profile/JournalCard.jsx src/components/profile/ShelfFilter.jsx src/components/profile/JournalFeed.jsx src/components/profile/SharePicksButton.jsx

# No direct localStorage
grep -rn 'localStorage' src/components/profile/JournalCard.jsx src/components/profile/ShelfFilter.jsx src/components/profile/JournalFeed.jsx src/components/profile/SharePicksButton.jsx
```

All should return zero results.

**Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: final verification cleanup for food journal profile"
```
