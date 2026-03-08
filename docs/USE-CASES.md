# What's Good Here — Complete Use Case Map

> Every user-facing action in the app, organized by persona and surface.
> Last updated: 2026-02-22

---

## BROWSING (No Login)

| # | Action | Where | Persona |
|---|--------|-------|---------|
| 1 | View nearby ranked dishes by location + radius | Home | Browser |
| 2 | Filter dishes by category (15 shortcuts) | Home | Browser |
| 3 | Search dishes by name (2+ chars, autocomplete) | Home | Browser |
| 4 | Change town filter | Home | Browser |
| 5 | Change search radius (1-20 mi) | Home | Browser |
| 6 | Tap restaurant pin on map | Home | Browser |
| 7 | View dish distance from current location | Home | Browser |
| 8 | Browse category grid (12 cards) | Browse | Browser |
| 9 | Select category → ranked dish list | Browse | Browser |
| 10 | Search by dish/cuisine/tag | Browse | Browser |
| 11 | Sort: Top Rated / Best Value / Most Voted / Closest | Browse | Browser |
| 12 | View restaurant list by distance | Restaurants | Browser |
| 13 | Filter restaurants by open/closed | Restaurants | Browser |
| 14 | Search restaurants by name | Restaurants | Browser |
| 15 | View dish verdict (score, %, votes, price) | Dish Detail | Browser |
| 16 | Get directions (→ Google Maps) | Dish Detail | Browser |
| 17 | Order online (→ restaurant website) | Dish Detail | Browser |
| 18 | View restaurant dishes (Top Rated + Menu tabs) | Restaurant Detail | Browser |
| 19 | View this week's events/specials | Hub | Browser |
| 20 | Filter events by type (Music, Trivia, Comedy...) | Hub | Browser |
| 21 | View 7 curated guides (Best Lobster Rolls, etc.) | Hub | Browser |
| 22 | View trending dishes | Discover | Browser |
| 23 | View recently added dishes + restaurants | Discover | Browser |
| 24 | View dish variants/flavors | Dish Detail | Browser |
| 25 | Share dish (native share or copy link) | Dish Detail | All |
| 26 | View public user profile + their votes | User Profile | Browser |
| 27 | View photo lightbox (full-screen) | Dish Detail | Browser |

---

## VOTING & REVIEWING (Login Required)

| # | Action | Where | Persona |
|---|--------|-------|---------|
| 28 | Submit "Would order again?" (Yes/No) | Dish Detail | Pioneer |
| 29 | Rate dish 1-10 (Bite Slider, 0.1 precision) | Dish Detail | Pioneer |
| 30 | Write review (max 200 chars) | Dish Detail | Pioneer |
| 31 | See impact feedback ("Helped X rise to #3") | Dish Detail | Pioneer |
| 32 | Duplicate vote → upsert (overwrites previous) | Dish Detail | Pioneer |
| 33 | Rate limit: 10 votes/min (server-enforced) | Dish Detail | Pioneer |

---

## PHOTOS (Login Required)

| # | Action | Where | Persona |
|---|--------|-------|---------|
| 34 | Upload dish photo (JPEG/PNG/WebP/HEIC, max 10MB) | Dish Detail | Pioneer |
| 35 | Photo quality analysis (brightness, focus) | Dish Detail | Pioneer |
| 36 | Photo confirmation modal (Rate Now / Later) | Dish Detail | Pioneer |
| 37 | Rate limit: 5 uploads/min (server-enforced) | Dish Detail | Pioneer |

---

## SOCIAL (Login Required)

| # | Action | Where | Persona |
|---|--------|-------|---------|
| 38 | Follow a user | User Profile | Pioneer |
| 39 | Unfollow a user | User Profile | Pioneer |
| 40 | View followers / following lists | Profile | Pioneer |
| 41 | See friends' votes on a dish | Dish Detail | Pioneer |
| 42 | See taste compatibility % with friend | Dish Detail | Pioneer |
| 43 | See category expertise badges (Authority/Specialist) | Dish Detail | Pioneer |
| 44 | Discover users with similar taste | Profile | Pioneer |

---

## FAVORITES (Login Required)

| # | Action | Where | Persona |
|---|--------|-------|---------|
| 45 | Mark dish as "Heard it was good" (ear icon) | Dish Detail | Pioneer |
| 46 | Remove from heard list | Dish Detail | Pioneer |
| 47 | First-time ear tooltip explanation | Dish Detail | Pioneer |

---

## PROFILE (Login Required)

| # | Action | Where | Persona |
|---|--------|-------|---------|
| 48 | View own profile (avatar, stats, rating style) | Profile | Pioneer |
| 49 | Edit display name (availability check) | Profile | Pioneer |
| 50 | Toggle sound on/off | Profile | Pioneer |
| 51 | View rating style badge (Tough Critic, etc.) | Profile | Pioneer |
| 52 | View vote stats (total, avg, standout picks) | Profile | Pioneer |
| 53 | Filter votes by shelf (All / Good / Heard / Skip) | Profile | Pioneer |
| 54 | View unrated nearby dishes | Profile | Pioneer |
| 55 | Edit favorite categories | Profile | Pioneer |
| 56 | View journal (written reviews) | Profile | Pioneer |
| 57 | Share picks (shareable link) | Profile | Pioneer |
| 58 | View food map of rated dishes | User Profile | Browser |
| 59 | Sign out | Profile | All |

---

## RESTAURANT MANAGEMENT (Login + Manager Role)

| # | Action | Where | Persona |
|---|--------|-------|---------|
| 60 | View/create/edit/deactivate specials | Manager Portal | Business |
| 61 | View/create/edit/delete dishes | Manager Portal | Business |
| 62 | Bulk add dishes (paste list) | Manager Portal | Business |
| 63 | View/create/edit/deactivate events | Manager Portal | Business |
| 64 | Edit restaurant info (name, address, hours, etc.) | Manager Portal | Business |
| 65 | Accept manager invite (magic link) | Accept Invite | Business |

---

## AUTHENTICATION

| # | Action | Where | Persona |
|---|--------|-------|---------|
| 66 | Google OAuth sign-in | Login / Modal | All |
| 67 | Magic link sign-in (email) | Login / Modal | All |
| 68 | Pending vote auto-submit after login | Dish Detail | Pioneer |
| 69 | Password reset | Login | All |

---

## RESTAURANT DISCOVERY (Login Required)

| # | Action | Where | Persona |
|---|--------|-------|---------|
| 70 | Discover nearby Google Places not in WGH | Restaurants | Pioneer |
| 71 | Add restaurant from Google Places | Restaurants | Pioneer |
| 72 | Add dish to restaurant | Restaurant Detail | Pioneer |

---

## STATIC / INFO

| # | Action | Where | Persona |
|---|--------|-------|---------|
| 73 | How Reviews Work explainer | /how-reviews-work | All |
| 74 | Privacy Policy | /privacy | All |
| 75 | Terms of Service | /terms | All |
| 76 | For Restaurants pitch page | /for-restaurants | Business |

---

## BEHIND THE SCENES (Invisible to User)

| Feature | Purpose |
|---------|---------|
| Jitter Protocol (behavioral biometrics) | Bot detection, trust badges |
| Purity score on votes | Anti-spam metric |
| Trust badges (human_verified / ai_estimated) | Review credibility |
| PostHog analytics events | dish_viewed, vote_submitted, etc. |
| Lazy-loaded evidence (IntersectionObserver) | Performance |
| Location permission persistence | UX continuity |
| Theme persistence (localStorage) | Dark/light preference |

---

## BY THE NUMBERS

- **76 user-facing use cases**
- **27 require no login** (Browser-first)
- **49 require login** (Pioneer + Business features)
- **11 pages/routes**
- **4 rate limits** (votes 10/min, photos 5/min, restaurants 5/hr, dishes 20/hr)
- **3 personas served** (Browser 80%, Pioneer 5%, Business ~93 restaurants)
- **2 themes** (Appetite light, Island Depths dark)
