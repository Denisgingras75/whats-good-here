# What's Good Here - Remaining Issues

**Current Rating: 8/10** (Launchable)

## High Priority (Fix in Week 1)

### 1. No Pagination on Followers/Following
- **Location:** `src/api/followsApi.js` (getFollowers, getFollowing)
- **Issue:** Fetches up to 50 at once, no "load more"
- **Impact:** Memory issues with popular users, browser hangs
- **Fix:** Implement cursor-based pagination (limit 20, hasMore flag)

### 2. Client-Side Only Rate Limiting
- **Location:** `src/lib/rateLimiter.js`
- **Issue:** Rate limits only enforced in browser memory
- **Impact:** Easily bypassed via DevTools or multiple tabs
- **Fix:** Add server-side rate limiting in Supabase RLS or Edge Functions

## Medium Priority (Fix in Month 1)

### 3. Ranking Algorithm Improvements
- **Issue:** Raw % doesn't account for vote count confidence
- **Fix:** Implement Bayesian scoring or Wilson score interval

### 4. No Recency Weighting
- **Issue:** Old votes weighted same as new votes
- **Fix:** Add time decay to ranking formula

### 5. Email in sessionStorage
- **Location:** `src/pages/Profile.jsx`
- **Issue:** PII stored client-side
- **Fix:** Remove or encrypt

### 6. Photo Quality Scoring
- **Issue:** No blur/contrast detection
- **Fix:** Add perceptual quality checks

## Low Priority (Backlog)

- Add comprehensive test coverage (currently 2/10)
- Badge system fraud detection
- Cache friend votes data
- TypeScript migration

---

## Completed Fixes ✓

- [x] Double-vote prevention (useVote.js)
- [x] Auth session handling (AuthContext.jsx)
- [x] Spatial index for distance queries (add-spatial-index.sql)
- [x] RLS policies validated
- [x] SQL injection prevention (sanitize.js)
- [x] Path traversal fix (dishPhotosApi.js)
- [x] N+1 queries in getUserProfile (followsApi.js) - now uses Promise.all
- [x] Console logs silenced in production (main.jsx)
- [x] Standardized error handling - all APIs now throw on error
- [x] Consistent loading states - ProfileSkeleton added
