import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useMapDishes } from '../hooks/useMapDishes'
import { useDishSearch } from '../hooks/useDishSearch'
import { BROWSE_CATEGORIES } from '../constants/categories'
import { BottomSheet } from '../components/BottomSheet'
import { DishSearch } from '../components/DishSearch'
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

export function Map() {
  var navigate = useNavigate()
  var { location, radius, setRadius, town, permissionState } = useLocationContext()

  var [selectedCategory, setSelectedCategory] = useState(null)
  var [radiusSheetOpen, setRadiusSheetOpen] = useState(false)
  var [searchQuery, setSearchQuery] = useState('')
  var [searchLimit, setSearchLimit] = useState(10)
  var [_sheetDetent, setSheetDetent] = useState('half')
  var [highlightedDishId, setHighlightedDishId] = useState(null)
  var [focusDishId, setFocusDishId] = useState(null)

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

  // Ranked dishes for the list (same algorithm as Home page)
  var rankedData = useDishes(location, radius, selectedCategory, null, town)
  var rankedDishes = rankedData.dishes

  // Map dishes with lat/lng for pins
  var mapData = useMapDishes({ location: location, radius: radius, town: town, category: selectedCategory })
  var mapDishes = mapData.dishes

  var selectedCategoryLabel = selectedCategory
    ? BROWSE_CATEGORIES.find(function (c) { return c.id === selectedCategory })
    : null

  // ─── List item tap: collapse sheet + fly to pin ─────────
  var handleListItemTap = useCallback(function (dishId) {
    // Collapse the sheet to peek so the map is visible
    if (sheetRef.current) {
      sheetRef.current.setDetent('peek')
    }
    // Tell the map to fly to this dish's restaurant
    setFocusDishId(null) // reset first so same dish can be re-tapped
    setTimeout(function () { setFocusDishId(dishId) }, 0)
    // Highlight the dish in the list
    setHighlightedDishId(dishId)
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current)
    }
    highlightTimerRef.current = setTimeout(function () {
      setHighlightedDishId(null)
    }, 2000)
  }, [])

  // ─── Map pin tap handler: scroll to dish + highlight ─────────
  var handlePinTap = useCallback(function (dishId) {
    logger.debug('Pin tapped, dishId:', dishId)

    if (sheetRef.current) {
      sheetRef.current.setDetent('half')
    }

    setHighlightedDishId(dishId)

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current)
    }

    highlightTimerRef.current = setTimeout(function () {
      setHighlightedDishId(null)
    }, 1500)

    setTimeout(function () {
      var contentEl = sheetRef.current && sheetRef.current.getContentEl()
      if (!contentEl) return
      var dishEl = contentEl.querySelector('[data-dish-id="' + dishId + '"]')
      if (dishEl) {
        dishEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 350)
  }, [])

  useEffect(function () {
    return function () {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  // Use ranked dishes (same ranking as Home page), limit to 20
  var sortedDishes = rankedDishes ? rankedDishes.slice(0, 20) : []

  // Show search results on map when searching, otherwise show category/default pins
  var displayedOnMap = (searchQuery && searchResults && searchResults.length > 0)
    ? searchResults
    : mapDishes

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--color-bg)' }}>
      <h1 className="sr-only">Dish Map</h1>

      {/* Full-screen map */}
      <div className="fixed inset-0" style={{ zIndex: 1 }}>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="w-full h-full" style={{ background: 'var(--color-bg)' }} />
          }>
            <RestaurantMap
              mode="dish"
              dishes={displayedOnMap}
              userLocation={location}
              town={town}
              onSelectDish={handlePinTap}
              radiusMi={radius}
              permissionGranted={permissionState === 'granted'}
              fullScreen
              focusDishId={focusDishId}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Bottom sheet */}
      <BottomSheet ref={sheetRef} initialDetent={0.35} onDetentChange={setSheetDetent}>
        {/* Search + radius */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <DishSearch
                loading={false}
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
                border: '1.5px solid var(--color-divider)',
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

        {/* Category chips */}
        <CategoryChips
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          sticky
          maxVisible={23}
        />

        {/* Section header */}
        <div className="px-4 pt-3 pb-2">
          <SectionHeader
            title={selectedCategoryLabel
              ? 'Best ' + selectedCategoryLabel.label + ' Nearby'
              : 'Top Rated Nearby'
            }
          />
        </div>

        {/* Dish list */}
        <div className="px-4 pb-4">
          {searchQuery ? (
            searchLoading ? (
              <MapListSkeleton />
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
                      onClick={function () { handleListItemTap(dish.dish_id) }}
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
          ) : sortedDishes.length > 0 ? (
            <div className="flex flex-col" style={{ gap: '2px' }}>
              {sortedDishes.map(function (dish, i) {
                return (
                  <DishListItem
                    key={dish.dish_id}
                    dish={dish}
                    rank={i + 1}
                    highlighted={highlightedDishId === dish.dish_id}
                    showDistance
                    onClick={function () { handleListItemTap(dish.dish_id) }}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              emoji="🍽️"
              title="No dishes found nearby"
            />
          )}
        </div>
      </BottomSheet>

      <RadiusSheet
        isOpen={radiusSheetOpen}
        onClose={function () { setRadiusSheetOpen(false) }}
        radius={radius}
        onRadiusChange={setRadius}
      />
    </div>
  )
}

function MapListSkeleton() {
  return (
    <div className="animate-pulse">
      {[0, 1, 2, 3].map(function (i) {
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
