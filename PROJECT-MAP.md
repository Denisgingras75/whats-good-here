# WGH Project Map — Plain English Edition

**Last updated:** 2026-02-24
**Total files that matter:** ~120 source files
**Database:** 2,345 lines of SQL (that's big — 50+ tables/functions)

---

## How The App Is Built (Layer Cake)

```
WHAT THE USER SEES         → Pages (19 screens)
  ↓ built from
THE LEGO PIECES            → Components (70+ reusable parts)
  ↓ which talk to
THE DATA FETCHERS          → Hooks (22 data pipelines)
  ↓ which call
THE SUPABASE TRANSLATORS   → API files (18 connectors)
  ↓ which hit
THE DATABASE               → schema.sql (the source of truth)
```

**Why this matters:** When you say "fix the restaurant page," I'm touching
the Page + maybe 5 Components + 2 Hooks + 2 APIs. That's ~10 files.
When you say "change how ratings work," I'm touching the Schema + APIs +
Hooks + Components. That's ~15-20 files.

---

## The 19 Screens (what users actually see)

| Screen | File | What It Does |
|--------|------|-------------|
| **Home** | `pages/Home.jsx` | Landing page, first impression, trending dishes |
| **Browse** | `pages/Browse.jsx` | Search/filter dishes by category |
| **Discover** | `pages/Discover.jsx` | Explore new dishes |
| **Restaurants** | `pages/Restaurants.jsx` | Restaurant list with map |
| **Restaurant Detail** | `pages/RestaurantDetail.jsx` | One restaurant — its dishes, menu, info |
| **Dish** | `pages/Dish.jsx` | One dish — ratings, photos, reviews |
| **Hub** | `pages/Hub.jsx` | Content hub / guides |
| **Profile** | `pages/Profile.jsx` | Your profile (logged in) |
| **User Profile** | `pages/UserProfile.jsx` | Someone else's public profile |
| **Login** | `pages/Login.jsx` | Login page |
| **Manage Restaurant** | `pages/ManageRestaurant.jsx` | Restaurant owner dashboard |
| **Admin** | `pages/Admin.jsx` | Denis's admin panel |
| **For Restaurants** | `pages/ForRestaurants.jsx` | Marketing page for restaurant owners |
| **How Reviews Work** | `pages/HowReviewsWork.jsx` | Explains the rating system |
| **Accept Invite** | `pages/AcceptInvite.jsx` | Restaurant owner invitation flow |
| **Privacy** | `pages/Privacy.jsx` | Privacy policy |
| **Terms** | `pages/Terms.jsx` | Terms of service |
| **Reset Password** | `pages/ResetPassword.jsx` | Password reset |
| **Not Found** | `pages/NotFound.jsx` | 404 page |

---

## The Big Pieces (components that do heavy lifting)

### Rating & Reviews
- **ReviewFlow.jsx** — The whole "rate this dish" experience (the slider, submit, celebration)
- **FoodRatingSlider.jsx** — The 1-10 Bite Slider itself
- **DishModal.jsx** — Popup with full dish details + rating
- **DishListItem.jsx** — One dish in a list (name, score, restaurant)

### Restaurant Stuff
- **RestaurantCard.jsx** — One restaurant in a list
- **RestaurantDishes.jsx** — Dishes at a restaurant
- **RestaurantMap.jsx** — Map view of restaurants
- **RestaurantMenu.jsx** — Full menu display
- **TopDishesNearYou.jsx** — Nearby top-rated dishes

### Restaurant Owner Portal (6 files)
- **DishesManager.jsx** — Owner manages their dishes
- **EventsManager.jsx** — Owner manages events
- **SpecialsManager.jsx** — Owner manages daily specials
- **MenuImportWizard.jsx** — Bulk import menu from URL
- **RestaurantInfoEditor.jsx** — Edit restaurant details

### User Profile (8 files)
- **HeroIdentityCard.jsx** — Profile header with avatar, stats
- **JournalFeed.jsx** — Your rating history
- **FoodMap.jsx** — Map of places you've rated
- **SharePicksButton.jsx** — Share your top picks
- **ShelfFilter.jsx** — Filter your rated dishes

### Navigation & Layout
- **Layout.jsx** — App shell (wraps every page)
- **TopBar.jsx** — Header bar
- **BottomNav.jsx** — Bottom tab bar (Home, Browse, etc.)
- **WelcomeSplash.jsx** — First-time splash screen
- **LocationBanner.jsx** — "You're in Martha's Vineyard" bar
- **LocationPicker.jsx** — Change your town
- **TownPicker.jsx** — Pick specific MV town

### Auth
- **LoginModal.jsx** — Login/signup popup (has Google OAuth button)
- **WelcomeModal.jsx** — Post-signup welcome

---

## The 18 API Connectors (how the app talks to the database)

| API File | What It Handles | Touches |
|----------|----------------|---------|
| **dishesApi** | Fetch/search dishes, rankings | Core — everything uses this |
| **restaurantsApi** | Fetch restaurants, nearby search | Restaurant pages |
| **votesApi** | Submit/update ratings | The rating flow |
| **authApi** | Login, signup, Google OAuth | Auth system |
| **profileApi** | User profiles, preferences | Profile pages |
| **favoritesApi** | Save/unsave dishes | Heart button |
| **restaurantManagerApi** | Owner portal operations | Business persona |
| **dishPhotosApi** | Upload/fetch dish photos | Photo features |
| **placesApi** | Google Places integration | Map, location |
| **eventsApi** | Restaurant events | Events feature |
| **specialsApi** | Daily specials | Specials feature |
| **followsApi** | Follow other users | Social features |
| **tasteApi** | Taste profile/preferences | Recommendations |
| **notificationsApi** | Push notifications | Alerts |
| **menuScrapingApi** | Import menus from URLs | Menu import wizard |
| **jitterApi** | Gamification system | Pioneer features |
| **adminApi** | Admin operations | Denis's dashboard |
| **ratingIdentityApi** | Rating credibility tracking | Trust system |

---

## The Database (schema.sql — 2,345 lines)

This is the brain. Everything above just displays what's in here.

**Main tables (the nouns):**
- `restaurants` — 69 MV restaurants
- `dishes` — Every dish at every restaurant
- `votes` — Every rating anyone has given
- `profiles` — User accounts
- `favorites` — Saved dishes
- `dish_photos` — Uploaded photos
- `events` — Restaurant events
- `specials` — Daily specials
- `follows` — User-follows-user
- `restaurant_managers` — Owner access control

**Key functions (the verbs):**
- `get_restaurants_within_radius()` — Find nearby restaurants
- `get_ranked_dishes()` — The main ranking query
- `update_dish_avg_rating()` — Recalculates scores when votes come in
- `handle_new_user()` — Auto-creates profile on signup

---

## Quick Reference: "If I want to change X..."

| You want to change... | Files involved | Rough size |
|-----------------------|---------------|-----------|
| How the home page looks | 1 page + 3-4 components | Small (~5 files) |
| How ratings work | Schema + votesApi + hooks + ReviewFlow + DishModal | Medium (~10 files) |
| Restaurant page layout | 1 page + 5 components | Small (~6 files) |
| Add a new database field | schema.sql + API + hook + component | Medium (~4-8 files) |
| How login works | authApi + LoginModal + context | Small (~4 files) |
| Restaurant owner features | 6 admin components + managerApi | Medium (~8 files) |
| Colors / dark mode | index.css (CSS variables) | Tiny (1 file) |
| Navigation / what pages exist | App.jsx + Layout + BottomNav | Small (~3 files) |
| The ranking algorithm | schema.sql (SQL function) | Tiny (1 file, but critical) |
| Add a whole new feature | New page + components + API + hook + schema | Large (10-20 files) |

---

## The Food SVGs (24 hand-drawn dish icons)

In `components/foods/` — burger, lobster roll, pizza, taco, sushi, etc.
These are the category icons throughout the app. All SVG, all custom.

---

## Files You Should Know Exist

| File | Why It Matters |
|------|---------------|
| `supabase/schema.sql` | THE source of truth for all data |
| `src/index.css` | All colors and themes live here |
| `src/App.jsx` | All page routes defined here |
| `src/context/AuthContext.jsx` | Login state management |
| `SPEC.md` | Full system specification |
| `TASKS.md` | Prioritized work backlog |
| `NOTES.md` | Design tokens, architecture notes |
