# What's Good Here

Mobile-first dish discovery, Martha's Vineyard. React 19 + Vite + Tailwind | Supabase | Vercel | PostHog + Sentry

## Role

Senior PM + design partner. Push back on bad ideas. Honest disagreement > fast compliance.

## Startup

Read SPEC.md + TASKS.md before work.

## Commands

dev:`npm run dev`(5173) build:`npm run build` test:`npm run test` lint:`npm run lint`

## Docs

SPEC.md(system spec) TASKS.md(backlog) NOTES.md(tokens/arch) BACKLOG.md(future) DEVLOG.md(history)

## Rules

!es2023 !toSorted !Array.at !findLast !Object.groupBy → use [...arr].sort(), arr[arr.length-1]
!hex-in-jsx → all colors via var(--color-*), defined in src/index.css
!console.* → use logger from src/utils/logger.js (logger.error→Sentry in prod)
!direct-supabase-in-UI → all data through src/api/, !supabase.* in pages|components
!direct-localStorage → use src/lib/storage.js (exception: lib/supabase.js for SDK)
!raw-useEffect-fetch → React Query useQuery|useMutation for all server state
!render-error-objects → always {error?.message || error}
!unused-code !dead-code !speculative-features
!skip-npm-run-build before "done"

@schema-change → read schema.sql first, trace 4 layers: schema→triggers→RPCs→src/api/
@rpc-call → verify exact param names in schema.sql (p_ prefix inconsistent: geo=bare, entity=p_)
@jsx → className=layout|spacing only, style={{}}=color|bg|border
@modal → ALL hooks before any early return null (useFocusTrap, useCallback, useEffect)
@new-component → named export + export default. Placement: page→components/<page>/, shared→components/, page→pages/
@new-supabase-field → add in selectFields string AND .map() transform
@.single() → use .maybeSingle() for lookups that might return 0 rows
@optimistic-update → must have rollback on error
@ROUND() → needs ::NUMERIC cast on float expressions
@new-rpc → run in SQL Editor (schema.sql doesn't auto-deploy), test call after
@plpgsql → always qualify column refs (tablename.column), RETURNS TABLE cols become variables
@auth-gate → voting|favorites|photos require login, check useAuth(), show LoginModal if null
@csp → new external domains → add to both img-src AND connect-src in vercel.json
@barrel-export → import from '../components/home' not individual files
@file-too-long → extract components at ~400 lines

## Workflow

1. Read SPEC.md 2. Check TASKS.md 3. Update schema.sql first (if DB) 4. Small focused diffs
5. Run in SQL Editor (if RPC/schema) 6. Verify: build + test + edge cases (null, 0 votes, missing price)
7. Update SPEC.md (if features changed) 8. Update TASKS.md

## API Pattern

`try { const {data,error} = await supabase.rpc('name', params); if (error) throw createClassifiedError(error); return data||[] } catch(e) { logger.error('ctx:',e); throw e.type ? e : createClassifiedError(e) }`
Imports: createClassifiedError←../utils/errorHandler logger←../utils/logger supabase←../lib/supabase
Table queries: selectFields string + .map() transform (see dishesApi.search)

## Hook Pattern

useQuery({queryKey:[...], queryFn:()=>api.method(params), enabled:!!params}) → return {data:data||[], loading:isLoading, error:error?{message:getUserMessage(error,'ctx')}:null, refetch}

## Structure

src/api/(one per domain, barrel index.js) components/(Auth/ browse/ home/ profile/ restaurants/ restaurant-admin/ foods/)
constants/(app.js categories.js towns.js tags.js) context/(AuthContext LocationContext) hooks/ lib/(supabase analytics storage sounds)
pages/(one per route) utils/(errorHandler ranking distance sanitize) test/setup.js
supabase/schema.sql migrations/ seed/(data/ test/) tests/

## CSS Tokens

Use var(--color-*) only. Defined in src/index.css. Light "Appetite" default, dark "Island Depths" via [data-theme="dark"].
--color-primary --color-accent-gold|-muted --color-accent-orange --color-rating
--color-text-primary|-secondary|-tertiary --color-bg --color-surface|-elevated --color-card
--glow-gold|primary --color-medal-gold|-silver|-bronze --color-category-strip

## Constants

MIN_VOTES_FOR_RANKING=5(below="Early") MAX_REVIEW_LENGTH=200(client+DB) MIN_VOTES_FOR_VALUE=8
Categories: BROWSE_CATEGORIES(19 shortcuts) MAIN_CATEGORIES ALL_CATEGORIES — shortcuts NOT containers, search covers all

## Domain Routing

dishes→dishesApi votes→votesApi specials→specialsApi restaurants→restaurantsApi auth→authApi favorites→favoritesApi diary→diaryApi
Display: DishListItem(variant:ranked|voted|compact) SpecialCard RestaurantCard

## Core Tables

restaurants dishes(parent_dish_id for variants) votes(source=user|ai_estimated, 0.5x weight)
profiles(auto-created trigger) favorites(private, !public read) specials(restaurant_id deal_name is_active expires_at) events restaurant_managers
dish_logs(personal diary: user_id dish_id note occasion dining_with rating_5) shelves(user collections: tried|want_to_try|top_10|custom) shelf_items(shelf_id dish_id)

## Routes

/ Home /browse Browse /restaurant/:id RestaurantDetail /dish/:id DishDetail /profile Profile /manage ManageRestaurant /discover Discover

## Pages

Home=SearchHero+Top10Compact[barrel:components/home/] Browse=CategoryBar+DishList(ranked)
Discover=mixed(specials+events+trending) ManageRestaurant=tabbed(Specials default)

## Hooks

useDishes useDish useDishSearch useDishPhotos useSpecials useRestaurantSpecials useVote useUserVotes
useAuth(context) useFavorites useTrendingDishes(limit) useProfile useRestaurantManager useUnratedDishes
useFocusTrap useEvents useNearbyPlaces useNearbyRestaurant useNearbyRestaurants usePurityTracker useRestaurants useRestaurantSearch

## RPCs

get_ranked_dishes(user_lat user_lng radius_miles filter_category filter_town) get_restaurant_dishes get_dish_variants
get_smart_snippet check_vote_rate_limit check_photo_upload_rate_limit get_taste_compatibility get_similar_taste_users
get_user_rating_identity get_friends_votes_for_dish|restaurant evaluate_user_badges get_invite_details accept_restaurant_invite
find_nearby_restaurants get_restaurants_within_radius(SET search_path=public) check_restaurant|dish_create_rate_limit
get_diary_feed(p_user_id p_limit p_offset) get_user_shelves(p_user_id) get_shelf_items(p_shelf_id) get_friends_feed(p_user_id p_limit p_offset) get_taste_stats(p_user_id)
