import { useState, useMemo, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useMapDishes } from '../hooks/useMapDishes'
import { useDishSearch } from '../hooks/useDishSearch'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { BROWSE_CATEGORIES } from '../constants/categories'
import { BottomSheet } from '../components/BottomSheet'
import { DishSearch } from '../components/DishSearch'
import { TownPicker } from '../components/TownPicker'
import { RadiusSheet } from '../components/LocationPicker'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { DishListItem } from '../components/DishListItem'
import { CategoryChips } from '../components/CategoryChips'
import { SectionHeader } from '../components/SectionHeader'
import { EmptyState } from '../components/EmptyState'
import { logger } from '../utils/logger'

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
  var [_sheetDetent, setSheetDetent] = useState('half')
  var [highlightedDishId, setHighlightedDishId] = useState(null)

  var sheetRef = useRef(null)
  var highlightTimerRef = useRef(null)

  var handleSearchChange = useCallback(function (q) {
    setSearchQuery(q)
    setSearchLimit(10)
    if (q) setSelectedCategory(null)
  }, [])

  // Search results
  var searchData = useDishSearch(searchQuery, searchLimit, town)
  var searchResults = searchData.results
  var searchLoading = searchData.loading

  // Ranked dishes for the list
  var dishData = useDishes(location, radius, null, null, town)
  var dishes = dishData.dishes
  var loading = dishData.loading
  var error = dishData.error

  // Map dishes — filtered by category
  var mapData = useMapDishes({ location: location, radius: radius, town: town, category: selectedCategory })
  var mapDishes = mapData.dishes

  // Rank-sort function
  var rankSort = function (a, b) {
    var aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
    var bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
    if (aRanked && !bRanked) return -1
    if (!aRanked && bRanked) return 1
    return (b.avg_rating || 0) - (a.avg_rating || 0)
  }

  // Filtered + sorted dishes for the list
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

  // ─── Map pin tap handler: scroll to dish + highlight ─────────
  var handlePinTap = useCallback(function (dishId) {
    logger.debug('Pin tapped, dishId:', dishId)

    // Open sheet to half if in peek
    if (sheetRef.current) {
      sheetRef.current.setDetent('half')
    }

    // Set highlighted dish (triggers gold flash)
    setHighlightedDishId(dishId)

    // Clear previous timer
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current)
    }

    // Clear highlight after 1.5s (the CSS transition handles the fade)
    highlightTimerRef.current = setTimeout(function () {
      setHighlightedDishId(null)
    }, 1500)

    // Scroll to the dish row after a brief delay (let sheet open first)
    setTimeout(function () {
      var contentEl = sheetRef.current && sheetRef.current.getContentEl()
      if (!contentEl) return
      var dishEl = contentEl.querySelector('[data-dish-id="' + dishId + '"]')
      if (dishEl) {
        dishEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 350)
  }, [])

  // Cleanup highlight timer on unmount
  useEffect(function () {
    return function () {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--color-bg)' }}>
      <h1 className="sr-only">What's Good Here - Food Discovery Map</h1>

      {/* Full-screen map — the background layer */}
      <div className="fixed inset-0" style={{ zIndex: 1 }}>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="w-full h-full" style={{ background: 'var(--color-bg)' }} />
          }>
            <RestaurantMap
              mode="dish"
              dishes={mapDishes}
              userLocation={location}
              town={town}
              onSelectDish={handlePinTap}
              radiusMi={radius}
              permissionGranted={permissionState === 'granted'}
              fullScreen
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Bottom sheet — the content layer */}
      <BottomSheet ref={sheetRef} initialDetent={0.50} onDetentChange={setSheetDetent}>
        {/* Search + controls row */}
        <div className="px-4 pb-3">
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
                border: '1px solid var(--color-divider)',
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
        <CategoryChips
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          sticky
        />

        {/* Section header */}
        <div className="px-4 pt-3 pb-2">
          <SectionHeader
            title={selectedCategoryLabel
              ? (town ? 'Best ' + selectedCategoryLabel.label + ' in ' + town : 'Best ' + selectedCategoryLabel.label)
              : (town ? 'Top Rated in ' + town : 'Top Rated Nearby')
            }
            action={
              <TownPicker
                town={town}
                onTownChange={setTown}
                isOpen={townPickerOpen}
                onToggle={setTownPickerOpen}
              />
            }
          />
        </div>

        {/* Ranked dish list */}
        <div className="px-4 pb-4">
          {searchQuery ? (
            /* Search results mode */
            searchLoading ? (
              <ListSkeleton />
            ) : searchResults.length > 0 ? (
              <div className="flex flex-col" style={{ gap: '2px' }}>
                {searchResults.map(function (dish, i) {
                  return (
                    <DishListItem
                      key={dish.dish_id}
                      dish={dish}
                      rank={i + 1}
                      highlighted={highlightedDishId === dish.dish_id}
                      showDistance
                      onClick={function () { navigate('/dish/' + dish.dish_id) }}
                    />
                  )
                })}
              </div>
            ) : (
              <EmptyState
                emoji="🔍"
                title={'No dishes found for \u201c' + searchQuery + '\u201d'}
              />
            )
          ) : loading ? (
            <ListSkeleton />
          ) : error ? (
            <div className="py-8 text-center">
              <p role="alert" style={{ fontSize: '14px', color: 'var(--color-danger)' }}>
                {error.message || error}
              </p>
            </div>
          ) : rankedDishes.length > 0 ? (
            <div className="flex flex-col" style={{ gap: '2px' }}>
              {rankedDishes.map(function (dish, i) {
                return (
                  <DishListItem
                    key={dish.dish_id}
                    dish={dish}
                    rank={i + 1}
                    highlighted={highlightedDishId === dish.dish_id}
                    showDistance
                    onClick={function () { navigate('/dish/' + dish.dish_id) }}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              emoji="🍽️"
              title={selectedCategory ? 'No ' + (selectedCategoryLabel ? selectedCategoryLabel.label : '') + ' rated yet' : 'No dishes found'}
            />
          )}
        </div>
      </BottomSheet>

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

/* --- Loading skeleton ----------------------------------------------------- */
function ListSkeleton() {
  return (
    <div className="animate-pulse">
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
