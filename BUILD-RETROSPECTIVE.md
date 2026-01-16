# Build Retrospective: What's Good Here

A reverse-engineered analysis of how this app was built, what worked, what didn't, and a playbook for next time.

---

## Part 1: What We Actually Did (Reconstructed Timeline)

### Phase 1: Big Bang Initial Commit (Jan 6)
**What happened:** Shipped a working MVP in a single commit with schema, auth, UI, and seed data all at once.

**Files involved:**
- `supabase/schema.sql` - Full database schema with RLS policies
- `src/pages/Home.jsx` - Main feed page
- `src/components/` - LoginModal, DishCard, DishFeed, CategoryFilter, VoteButtons
- `src/hooks/` - useDishes, useLocation, useVote
- `supabase/seed.sql` - Initial restaurant/dish data

**Dependencies created:** Everything assumed everything else existed. No clear layering.

---

### Phase 2: Category Chaos (Jan 7)
**What happened:** Rapid iteration on food categories - adding wings, lobster, sushi, sandwiches, breakfast, fries, poke bowls. 14 commits in one day just tweaking categories.

**Files involved:** Mostly data updates, some filter UI changes

**Problem:** Categories weren't planned upfront. Each addition required a commit cycle.

---

### Phase 3: Image Hell (Jan 11)
**What happened:** 10+ commits trying to get category images working. Tried Unsplash URLs, emoji illustrations, cache busting, debug logging, "NUCLEAR TEST" hard-coding.

**Files involved:** `categoryImages.js`, DishCard components

**Problem:** No image strategy was defined before building. Resulted in thrashing.

---

### Phase 4: Fun Features Before Core (Jan 12)
**What happened:** Added animated pizza slider, bite sound effects, food crumb physics animations. Fun, but premature.

**Files involved:** `PizzaRatingSlider.jsx`, `FoodRatingSlider.jsx`, `sounds.js`

**Problem:** Polish before the core flow was stable. These features were later mostly unused.

---

### Phase 5: Navigation & Page Structure (Jan 12-13)
**What happened:** Added bottom navigation, created Browse/Spots/Profile pages, redesigned homepage multiple times.

**Files involved:** `BottomNav.jsx`, all page files, `App.jsx` routing

**Problem:** Page structure should have been decided in Phase 1.

---

### Phase 6: UI Redesign Marathon (Jan 13-14)
**What happened:** 20+ commits redesigning the same screens. Logo sizing (5 commits alone), card layouts, hero sections, CTAs.

**Files involved:** Every page file, most components

**Problem:** No design system or mockups existed. Design happened in code through trial and error.

---

### Phase 7: Design System (Finally) (Jan 14)
**What happened:** Added color tokens, unified typography to DM Sans, standardized card architecture.

**Files involved:** `index.css`, all pages

**Problem:** This should have been Phase 1. Would have prevented the redesign marathon.

---

### Phase 8: Auth Fixes (Jan 14)
**What happened:** Fixed session persistence, magic link redirects, modal scroll issues. Multiple commits fixing the same auth flow.

**Files involved:** `AuthContext.jsx`, `LoginModal.jsx`, `supabase.js`

**Problem:** Auth was in initial commit but not properly tested. Required 6+ fix commits.

---

### Phase 9: Refactoring (Jan 14-15)
**What happened:** Extracted `AuthContext`, `LocationContext`, shared `DishModal`. Added API layer abstraction.

**Files involved:** New `context/`, `api/` folders

**Problem:** This architectural cleanup was needed because Phase 1 didn't establish patterns.

---

### Phase 10: Analytics & Monitoring (Jan 15)
**What happened:** Added Sentry error tracking, PostHog analytics, after the app was mostly built.

**Files involved:** `main.jsx`, various components for tracking calls

**Problem:** Should have been earlier. Missed learning from early user behavior.

---

### Phase 11: Gamification & Polish (Jan 15-16)
**What happened:** Added impact feedback toasts, contribution badges, tier system, photo quality scoring.

**Files involved:** `ImpactFeedback.jsx`, `photoQuality.js`, `imageAnalysis.js`, Profile enhancements

**Good:** This was appropriate timing - polish after core was stable.

---

### Phase 12: Onboarding & Welcome (Jan 16)
**What happened:** Added welcome modal for name, welcome splash for first-time users.

**Files involved:** `WelcomeModal.jsx`, `WelcomeSplash.jsx`

**Problem:** Onboarding should have been designed earlier (but implemented later).

---

## Part 2: Build Order Comparison Chart

```
ACTUAL ORDER                          vs    IDEAL ORDER
─────────────────────────────────────────────────────────────────────────────
Week 1 (Jan 6-7)                            Week 1
├─ Schema + Auth + UI + Data (all at once)  ├─ Discovery & spec document
├─ Category additions (14 commits)          ├─ Define MVP scope + success metrics
└─ No design system                         ├─ Architecture decisions (stack, auth)
                                            └─ Design tokens & component patterns

Week 2 (Jan 11-14)                          Week 2
├─ Image debugging (10+ commits)            ├─ Schema design (with room to grow)
├─ Fun animations (premature)               ├─ API contracts (what data, what shape)
├─ Navigation added (should be Week 1)      ├─ Core auth flow (tested)
├─ 20+ UI redesign commits                  └─ Seed data strategy
└─ Design system added (too late)

Week 3 (Jan 14-15)                          Week 3
├─ Auth bug fixes                           ├─ Core screens (Home, Browse, Detail)
├─ Refactoring (AuthContext, API layer)     ├─ Primary user flow (view → vote)
├─ Analytics added                          ├─ Basic error handling
└─ Testing setup                            └─ Analytics instrumentation

Week 4 (Jan 15-16)                          Week 4
├─ Gamification & polish                    ├─ Secondary features (Profile, Save)
├─ Photo system                             ├─ Polish & animations
├─ Onboarding flows                         ├─ Onboarding flows
└─ Welcome splash                           └─ Testing & bug fixes
─────────────────────────────────────────────────────────────────────────────
```

---

## Part 3: What Worked vs. What Didn't

### What Worked Well

| Decision | Why It Worked |
|----------|---------------|
| Supabase for backend | Fast to set up, auth built-in, RLS for security |
| React + Vite | Quick dev server, fast builds |
| Starting with real data | MV restaurants made it feel real immediately |
| Iterating in production | Vercel deploys let you see real behavior fast |
| DEVLOG for tracking | Created accountability and memory |

### What Caused Problems

| Decision | Consequence | Debt Created |
|----------|-------------|--------------|
| No design system upfront | 20+ redesign commits | Had to retrofit color tokens |
| Auth in initial commit, untested | 6+ auth fix commits later | Users hit bugs in production |
| Categories not planned | 14 commits adding categories | Inconsistent naming, missing images |
| No image strategy | 10+ debugging commits | Cache busting hacks, unreliable URLs |
| Features before flow | Pizza animations unused | Wasted effort, dead code |
| No API layer initially | Direct Supabase calls everywhere | Required full refactor later |
| Analytics added late | Missed early user insights | Flying blind for first week |
| No component patterns | Duplicate code across pages | Required DishModal extraction |

---

## Part 4: The Ideal Build Order (Playbook)

### Stage 0: Discovery (Before Writing Code)
**Goal:** Know what you're building and why.

- [ ] Write a 1-paragraph product description
- [ ] Define the core user flow in words (e.g., "User opens app → sees dishes nearby → taps one → votes → sees updated ranking")
- [ ] List 3-5 MVP features (no more)
- [ ] Define success metrics (what does "working" mean?)
- [ ] Decide: who is this for? (even if just "me")

**Done when:** You can explain the app in 30 seconds without hesitation.

---

### Stage 1: Architecture Decisions
**Goal:** Choose your stack and establish patterns before coding.

- [ ] Choose frontend framework (React, Vue, etc.)
- [ ] Choose backend/database (Supabase, Firebase, etc.)
- [ ] Choose auth strategy (magic link, OAuth, passwords)
- [ ] Choose hosting (Vercel, Netlify, etc.)
- [ ] Decide on state management approach
- [ ] Set up project structure (folders, naming conventions)

**Done when:** You have a blank project with routing and auth skeleton working.

---

### Stage 2: Design Foundation
**Goal:** Establish visual language before building screens.

- [ ] Define color tokens (primary, secondary, text colors, surfaces)
- [ ] Choose typography (1-2 fonts max)
- [ ] Define spacing scale (4px, 8px, 16px, etc.)
- [ ] Sketch key screens (paper or Figma, doesn't need to be pretty)
- [ ] Define component patterns (cards, buttons, modals, inputs)

**Done when:** You have a `tokens.css` or theme file and know what a "card" looks like.

**Avoid:** Designing in code through trial and error.

---

### Stage 3: Data Model
**Goal:** Design your schema with room to grow.

- [ ] List all entities (users, restaurants, dishes, votes, etc.)
- [ ] Define relationships (one-to-many, many-to-many)
- [ ] Add fields you'll need later (created_at, updated_at always)
- [ ] Write RLS policies for security
- [ ] Create seed data script
- [ ] Test queries manually before writing code

**Done when:** You can query your data in the Supabase dashboard and get expected results.

**Avoid:** Adding columns one at a time as you realize you need them.

---

### Stage 4: API Layer
**Goal:** Create a clean interface between UI and database.

- [ ] Create API modules by domain (dishes, votes, auth, etc.)
- [ ] Define function signatures before implementing
- [ ] Add error handling wrapper
- [ ] Write at least one test per critical function

**Done when:** Components will never call Supabase directly.

**Avoid:** Putting database calls inside components.

---

### Stage 5: Core User Flow
**Goal:** Build the critical path end-to-end.

- [ ] Implement the primary screen (where users land)
- [ ] Implement the primary action (the main thing users do)
- [ ] Connect auth to the flow (gate actions appropriately)
- [ ] Add loading and error states
- [ ] Test the flow manually 10+ times

**Done when:** A new user can complete the core action without errors.

**Avoid:** Building secondary features before the core flow works perfectly.

---

### Stage 6: Instrumentation
**Goal:** See what's happening in production.

- [ ] Add error tracking (Sentry or similar)
- [ ] Add analytics (PostHog, Mixpanel, or similar)
- [ ] Track key events (page views, core actions, errors)
- [ ] Set up alerts for errors

**Done when:** You can see user behavior and errors in a dashboard.

**Avoid:** Waiting until "later" - you need this data from day one.

---

### Stage 7: Secondary Features
**Goal:** Build everything else.

- [ ] Profile/settings page
- [ ] Secondary flows (save, share, etc.)
- [ ] Admin tools (if needed)
- [ ] Additional pages

**Done when:** All MVP features are implemented.

---

### Stage 8: Polish & Onboarding
**Goal:** Make it feel good.

- [ ] Add micro-animations (tastefully)
- [ ] Implement onboarding flow
- [ ] Add empty states
- [ ] Add success feedback (toasts, confirmations)
- [ ] Refine copy and messaging

**Done when:** A new user can understand and use the app without explanation.

---

### Stage 9: Testing & Hardening
**Goal:** Make sure it doesn't break.

- [ ] Write tests for critical paths
- [ ] Test on multiple devices/browsers
- [ ] Fix edge cases
- [ ] Security review (auth, RLS, input validation)
- [ ] Performance check (load times, bundle size)

**Done when:** You're confident enough to share it publicly.

---

## Part 5: One-Page Checklist for Next Time

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    APP BUILD CHECKLIST                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  BEFORE YOU CODE                                                        │
│  □ Can I explain this app in 30 seconds?                                │
│  □ What's the ONE core action users take?                               │
│  □ What are my 3-5 MVP features? (Write them down, no more)             │
│  □ What does "done" look like?                                          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FOUNDATION (Do these FIRST, in order)                                  │
│  □ Stack chosen (frontend, backend, auth, hosting)                      │
│  □ Design tokens defined (colors, fonts, spacing)                       │
│  □ Database schema designed (with room to grow)                         │
│  □ API layer structure created                                          │
│  □ Project structure established (folders, naming)                      │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CORE BUILD (Do these BEFORE any secondary features)                    │
│  □ Auth flow working and tested                                         │
│  □ Primary screen implemented                                           │
│  □ Core user action working end-to-end                                  │
│  □ Error handling in place                                              │
│  □ Analytics instrumented                                               │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SECONDARY BUILD                                                        │
│  □ Additional screens                                                   │
│  □ Secondary features                                                   │
│  □ Admin tools (if needed)                                              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  POLISH (Do these LAST)                                                 │
│  □ Onboarding flow                                                      │
│  □ Animations and micro-interactions                                    │
│  □ Empty states and edge cases                                          │
│  □ Copy refinement                                                      │
│  □ Testing on multiple devices                                          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  RED FLAGS (Stop if you're doing these)                                 │
│  ✗ Adding "fun" features before core flow works                         │
│  ✗ Redesigning the same screen 5+ times                                 │
│  ✗ Adding database columns one at a time                                │
│  ✗ Putting database calls directly in components                        │
│  ✗ Skipping analytics "for now"                                         │
│  ✗ No design tokens (hardcoding colors everywhere)                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Lessons

1. **Design system first, not last.** Every hour spent on color tokens upfront saves 5 hours of redesign commits.

2. **Schema with room to grow.** Add `created_at`, `updated_at`, and fields you might need. Adding columns later means migrations.

3. **API layer from day one.** Never let components call the database directly. You'll thank yourself during refactoring.

4. **Analytics early, not late.** You need to see what users actually do, not what you think they do.

5. **Core flow before features.** A working login → view → vote flow matters more than pizza animations.

6. **Test auth thoroughly.** Auth bugs are the worst bugs. Users lose trust instantly.

7. **Categories/taxonomies upfront.** If your app has categories, define them all before building the filter UI.

8. **Images need a strategy.** Decide where images come from (CDN, user upload, placeholders) before you build.

---

*Generated from analysis of 100+ commits over 11 days of building What's Good Here.*
