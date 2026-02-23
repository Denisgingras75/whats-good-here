import { useState, useMemo, useCallback, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useDishSearch } from '../hooks/useDishSearch'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { BROWSE_CATEGORIES } from '../constants/categories'
import { DishSearch } from '../components/DishSearch'
import { DishListItem } from '../components/DishListItem'
import { TownPicker } from '../components/TownPicker'
import { RadiusSheet } from '../components/LocationPicker'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ScorePill } from '../components/ScorePill'
import { ConsensusBar } from '../components/ConsensusBar'

var RestaurantMap = lazy(function () {
  return import('../components/restaurants/RestaurantMap').then(function (m) {
    return { default: m.RestaurantMap }
  })
})

export function Home() {
  var navigate = useNavigate()
  var { location, radius, setRadius, town, setTown, permissionState } = useLocationContext()

  var [selectedCategory, setSelectedCategory] = useState(null)
  var [townPickerOpen, setTownPickerOpen] = useState(false)
  var [radiusSheetOpen, setRadiusSheetOpen] = useState(false)
  var [searchQuery, setSearchQuery] = useState('')
  var [searchLimit, setSearchLimit] = useState(10)
  var [showMap, setShowMap] = useState(false)

  var handleSearchChange = useCallback(function (q) {
    setSearchQuery(q)
    setSearchLimit(10)
    if (q) setSelectedCategory(null)
  }, [])

  // Search results
  var searchData = useDishSearch(searchQuery, searchLimit, town)
  var searchResults = searchData.results
  var searchLoading = searchData.loading

  // Ranked dishes for the feed
  var dishData = useDishes(location, radius, null, null, town)
  var dishes = dishData.dishes
  var loading = dishData.loading
  var error = dishData.error

  // Rank-sort function
  var rankSort = function (a, b) {
    var aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
    var bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
    if (aRanked && !bRanked) return -1
    if (!aRanked && bRanked) return 1
    return (b.avg_rating || 0) - (a.avg_rating || 0)
  }

  // Filtered + sorted dishes
  var rankedDishes = useMemo(function () {
    if (!dishes || dishes.length === 0) return []
    var filtered = dishes
    if (selectedCategory) {
      filtered = dishes.filter(function (d) {
        return d.category && d.category.toLowerCase() === selectedCategory
      })
    }
    return filtered.slice().sort(rankSort).slice(0, 20)
  }, [dishes, selectedCategory])

  var selectedCategoryLabel = selectedCategory
    ? BROWSE_CATEGORIES.find(function (c) { return c.id === selectedCategory })
    : null

  // Map overlay mode
  if (showMap) {
    return (
      <div className="min-h-screen relative" style={{ background: 'var(--color-bg)' }}>
        <div className="fixed inset-0" style={{ zIndex: 1 }}>
          <ErrorBoundary>
            <Suspense fallback={
              <div className="w-full h-full" style={{ background: 'var(--color-bg)' }} />
            }>
              <RestaurantMap
                mode="dish"
                dishes={dishes || []}
                userLocation={location}
                town={town}
                onSelectDish={function (dishId) { navigate('/dish/' + dishId) }}
                radiusMi={radius}
                permissionGranted={permissionState === 'granted'}
                fullScreen
              />
            </Suspense>
          </ErrorBoundary>
        </div>
        {/* List toggle — return to feed */}
        <button
          onClick={function () { setShowMap(false) }}
          className="fixed z-50 flex items-center gap-2 px-4 py-3 rounded-full card-standard card-press"
          style={{
            bottom: '96px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-card)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            fontWeight: 700,
            fontSize: '14px',
            color: 'var(--color-text-primary)',
            minHeight: '48px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          List
        </button>
      </div>
    )
  }

  // Feed-first layout
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <h1 className="sr-only">What's Good Here</h1>

      {/* Search + radius row */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <DishSearch
              loading={loading}
              placeholder="What are you craving?"
              town={town}
              onSearchChange={handleSearchChange}
            />
          </div>
          <button
            onClick={function () { setRadiusSheetOpen(true) }}
            aria-label={'Search radius: ' + radius + ' miles'}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 rounded-xl font-bold"
            style={{
              fontSize: '13px',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              border: '2px solid var(--color-card-border)',
              minHeight: '44px',
            }}
          >
            {radius} mi
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Category chips — sticky */}
      <div
        className="sticky top-0 z-10 pb-2"
        style={{ background: 'var(--color-bg)' }}
      >
        <div
          className="flex gap-2 px-4 overflow-x-auto scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <button
            onClick={function () { setSelectedCategory(null) }}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-full font-bold"
            style={{
              padding: '10px 16px',
              minHeight: '44px',
              fontSize: '14px',
              background: selectedCategory === null ? 'var(--color-primary)' : 'transparent',
              color: selectedCategory === null ? 'var(--color-text-on-primary)' : 'var(--color-text-primary)',
              border: selectedCategory === null ? '2px solid var(--color-primary)' : '2px solid var(--color-card-border)',
            }}
          >
            All
          </button>
          {BROWSE_CATEGORIES.slice(0, 12).map(function (cat) {
            var isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={function () { setSelectedCategory(isActive ? null : cat.id) }}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-full font-bold"
                style={{
                  padding: '10px 14px',
                  minHeight: '44px',
                  fontSize: '14px',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? 'var(--color-text-on-primary)' : 'var(--color-text-primary)',
                  border: isActive ? '2px solid var(--color-primary)' : '2px solid var(--color-card-border)',
                }}
              >
                <span style={{ fontSize: '16px' }}>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Section header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div>
          <span className="section-label" style={{ color: 'var(--color-text-tertiary)' }}>
            {selectedCategoryLabel ? 'RANKINGS' : 'LEADERBOARD'}
          </span>
          <h2
            style={{
              fontSize: '20px',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              marginTop: '2px',
            }}
          >
            {selectedCategoryLabel
              ? (town ? 'Best ' + selectedCategoryLabel.label + ' in ' + town : 'Best ' + selectedCategoryLabel.label)
              : (town ? 'What\u2019s Good in ' + town : 'What\u2019s Good Here')
            }
          </h2>
        </div>
        <TownPicker
          town={town}
          onTownChange={setTown}
          isOpen={townPickerOpen}
          onToggle={setTownPickerOpen}
        />
      </div>

      {/* Feed content */}
      <div className="px-4 pb-24">
        {searchQuery ? (
          /* Search results mode */
          searchLoading ? (
            <FeedSkeleton />
          ) : searchResults.length > 0 ? (
            <div className="flex flex-col" style={{ gap: '2px' }}>
              {searchResults.map(function (dish, i) {
                return (
                  <DishListItem
                    key={dish.dish_id}
                    dish={dish}
                    rank={i + 1}
                    showDistance
                  />
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="font-medium" style={{ fontSize: '14px', color: 'var(--color-text-tertiary)' }}>
                No dishes found for &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )
        ) : loading ? (
          <FeedSkeleton />
        ) : error ? (
          <div className="py-8 text-center">
            <p role="alert" style={{ fontSize: '14px', color: 'var(--color-danger)' }}>
              {error.message || error}
            </p>
          </div>
        ) : rankedDishes.length > 0 ? (
          <>
            {/* Hero card for #1 dish — scoreboard treatment */}
            <HeroCard dish={rankedDishes[0]} town={town} />

            {/* Ranked list #2+ */}
            <div className="flex flex-col mt-2" style={{ gap: '2px' }}>
              {rankedDishes.slice(1).map(function (dish, i) {
                return (
                  <DishListItem
                    key={dish.dish_id}
                    dish={dish}
                    rank={i + 2}
                    showDistance
                    className="stagger-item"
                  />
                )
              })}
            </div>

            {/* View all link */}
            {rankedDishes.length >= 10 && (
              <button
                onClick={function () { navigate('/browse') }}
                className="w-full mt-4 py-3 rounded-xl font-semibold card-press"
                style={{
                  fontSize: '14px',
                  color: 'var(--color-primary)',
                  background: 'var(--color-primary-muted)',
                  border: 'none',
                }}
              >
                View all dishes
              </button>
            )}

            {/* Map card — bold menu-board style */}
            <div className="mt-4">
              <button
                onClick={function () { setShowMap(true) }}
                className="w-full card-press"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  background: 'var(--color-card)',
                  border: '3px solid var(--color-card-border)',
                  borderRadius: 'var(--card-radius-md)',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-on-primary)" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold" style={{ fontSize: '15px', color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                    View Map
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                    {(dishes || []).length} dishes nearby · {radius} mi radius
                  </p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="font-medium" style={{ fontSize: '14px', color: 'var(--color-text-tertiary)' }}>
              {selectedCategory ? 'No ' + (selectedCategoryLabel ? selectedCategoryLabel.label : '') + ' rated yet' : 'No dishes found'}
            </p>
          </div>
        )}
      </div>

      {/* Floating map toggle — fixed bottom-right above BottomNav */}
      <MapToggleButton onClick={function () { setShowMap(true) }} />

      {/* Radius Sheet */}
      <RadiusSheet
        isOpen={radiusSheetOpen}
        onClose={function () { setRadiusSheetOpen(false) }}
        radius={radius}
        onRadiusChange={setRadius}
      />
    </div>
  )
}

/* --- HeroCard — #1 dish gets typographic scoreboard treatment -------------- */
function HeroCard({ dish, town }) {
  var navigate = useNavigate()
  var isRanked = (dish.total_votes || 0) >= MIN_VOTES_FOR_RANKING

  var handleClick = function () {
    navigate('/dish/' + dish.dish_id)
  }

  var locationLabel = town ? 'IN ' + town.toUpperCase() : 'ON THE VINEYARD'

  return (
    <button
      onClick={handleClick}
      className="w-full card-hero card-press stagger-item"
      style={{
        textAlign: 'center',
        border: '3px solid var(--color-primary)',
      }}
    >
      <div className="px-5 pt-5 pb-5">
        {/* Section label */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="section-label"
            style={{ color: 'var(--color-accent-gold)' }}
          >
            TOP RATED {locationLabel}
          </span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--color-medal-gold)',
              letterSpacing: '-0.02em',
            }}
          >
            #1
          </span>
        </div>

        {/* Giant score — THE HERO */}
        <div className="flex justify-center mb-3">
          <ScorePill score={dish.avg_rating} size="xl" showMax />
        </div>

        {/* Dish name — serif, editorial weight */}
        <h3
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '24px',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
        >
          {dish.dish_name}
        </h3>

        {/* Restaurant + distance */}
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            marginTop: '6px',
          }}
        >
          {dish.restaurant_name}
          {dish.distance_miles != null
            ? ' \u00b7 ' + Number(dish.distance_miles).toFixed(1) + ' mi'
            : ''}
        </p>

        {/* Vote context */}
        {isRanked && (
          <div className="flex justify-center mt-3">
            <ConsensusBar
              avgRating={dish.avg_rating}
              totalVotes={dish.total_votes}
              percentWorthIt={dish.percent_worth_it}
              compact
            />
          </div>
        )}
      </div>
    </button>
  )
}

/* --- MapToggleButton — floating pill, bottom-right above BottomNav --------- */
function MapToggleButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Show map view"
      className="fixed z-40 flex items-center gap-2 px-4 py-3 rounded-full card-standard card-press"
      style={{
        bottom: '96px',
        right: '16px',
        background: 'var(--color-card)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        fontWeight: 700,
        fontSize: '14px',
        color: 'var(--color-text-primary)',
        minHeight: '48px',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      Map
    </button>
  )
}

/* --- Loading skeleton ------------------------------------------------------ */
function FeedSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--color-divider)', aspectRatio: '16 / 10' }} />
      {/* Row skeletons */}
      {[0, 1, 2, 3, 4].map(function (i) {
        return (
          <div key={i} className="flex items-center gap-3 py-3 px-3">
            <div className="w-7 h-5 rounded" style={{ background: 'var(--color-divider)' }} />
            <div className="w-6 h-6 rounded" style={{ background: 'var(--color-divider)' }} />
            <div className="flex-1">
              <div className="h-4 w-28 rounded mb-1" style={{ background: 'var(--color-divider)' }} />
              <div className="h-3 w-20 rounded" style={{ background: 'var(--color-divider)' }} />
            </div>
            <div className="h-5 w-8 rounded" style={{ background: 'var(--color-divider)' }} />
          </div>
        )
      })}
    </div>
  )
}
