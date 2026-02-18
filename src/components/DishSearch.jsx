import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { capture } from '../lib/analytics'
import { dishesApi } from '../api/dishesApi'
import { getCategoryImage } from '../constants/categoryImages'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRatingColor } from '../utils/ranking'
import { logger } from '../utils/logger'
import { RestaurantAvatar } from './RestaurantAvatar'
import { useRestaurantSearch } from '../hooks/useRestaurantSearch'
import { useNearbyRestaurants } from '../hooks/useNearbyRestaurants'
import { useLocationContext } from '../context/LocationContext'
import { useAuth } from '../context/AuthContext'
import { AddRestaurantModal } from './AddRestaurantModal'
const MIN_SEARCH_LENGTH = 2
const MAX_DISH_RESULTS = 5
const MAX_CATEGORY_RESULTS = 2

// Browse shortcuts - curated high-frequency categories only
// Categories are shortcuts, NOT containers. All dishes are searchable regardless of category.
const BROWSE_CATEGORIES = [
  { id: 'pizza', label: 'Pizza' },
  { id: 'burger', label: 'Burgers' },
  { id: 'taco', label: 'Tacos' },
  { id: 'wings', label: 'Wings' },
  { id: 'sushi', label: 'Sushi' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lobster roll', label: 'Lobster Rolls' },
  { id: 'seafood', label: 'Seafood' },
  { id: 'chowder', label: 'Chowder' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'steak', label: 'Steak' },
  { id: 'sandwich', label: 'Sandwiches' },
  { id: 'salad', label: 'Salads' },
  { id: 'tendys', label: 'Tenders' },
]

export function DishSearch({ loading = false, placeholder = "Find What's Good near you", town = null }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { location, radius, permissionState } = useLocationContext()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const mountedRef = useRef(true)

  // Restaurant search (local + Google Places)
  const hasLocation = permissionState === 'granted'
  const { localResults: restaurantResults, externalResults: placesResults, loading: restaurantSearchLoading } = useRestaurantSearch(
    query, location?.lat, location?.lng, isFocused, radius
  )

  // Nearby restaurants (shown on focus before typing)
  const { nearby: nearbyRestaurants } = useNearbyRestaurants(
    location?.lat, location?.lng, 150, hasLocation
  )

  // Track mounted state for async operations
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch search results from API (respects town filter if set)
  useEffect(() => {
    if (query.length < MIN_SEARCH_LENGTH) {
      setSearchResults([])
      return
    }

    const fetchResults = async () => {
      setSearching(true)
      try {
        const results = await dishesApi.search(query, MAX_DISH_RESULTS, town)
        // Only update state if still mounted
        if (mountedRef.current) {
          setSearchResults(results)
        }
      } catch (error) {
        logger.error('Search error:', error)
        if (mountedRef.current) {
          setSearchResults([])
        }
      } finally {
        if (mountedRef.current) {
          setSearching(false)
        }
      }
    }

    // Debounce the search
    const timer = setTimeout(fetchResults, 150)
    return () => clearTimeout(timer)
  }, [query, town])

  // Find matching categories (client-side since it's a small constant array)
  const matchingCategories = useMemo(() => {
    if (query.length < MIN_SEARCH_LENGTH) return []
    const searchTerm = query.toLowerCase().trim()
    return BROWSE_CATEGORIES.filter(cat => {
      const catId = cat.id.toLowerCase()
      const catLabel = cat.label.toLowerCase()
      return catId.includes(searchTerm) || catLabel.includes(searchTerm)
    }).slice(0, MAX_CATEGORY_RESULTS)
  }, [query])

  const results = {
    dishes: searchResults,
    categories: matchingCategories,
    restaurants: restaurantResults,
    places: placesResults,
  }

  const hasResults = results.dishes.length > 0 || results.categories.length > 0 || results.restaurants.length > 0 || results.places.length > 0
  const showNearby = isFocused && query.length < MIN_SEARCH_LENGTH && nearbyRestaurants.length > 0
  const showDropdown = isFocused && (query.length >= MIN_SEARCH_LENGTH || showNearby)
  const isLoading = loading || searching || restaurantSearchLoading

  // Handle dish selection
  const handleDishSelect = (dish) => {
    // Track search -> dish selection
    capture('search_performed', {
      query: query,
      result_type: 'dish',
      selected_dish_id: dish.dish_id,
      selected_dish_name: dish.dish_name,
      selected_restaurant: dish.restaurant_name,
      results_count: results.dishes.length,
    })
    setQuery('')
    setIsFocused(false)
    // Navigate to dedicated dish page
    navigate(`/dish/${dish.dish_id}`)
  }

  // Handle category selection
  const handleCategorySelect = (category) => {
    // Track search -> category selection
    capture('search_performed', {
      query: query,
      result_type: 'category',
      selected_category: category.id,
      results_count: results.categories.length,
    })
    setQuery('')
    setIsFocused(false)
    navigate(`/browse?category=${encodeURIComponent(category.id)}`)
  }

  // Handle Enter key - go to full search results page
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim().length >= MIN_SEARCH_LENGTH) {
      // Track search submission
      capture('search_performed', {
        query: query.trim(),
        result_type: 'full_search',
        dish_results_count: results.dishes.length,
        category_results_count: results.categories.length,
      })
      setQuery('')
      setIsFocused(false)
      navigate(`/browse?q=${encodeURIComponent(query.trim())}`)
    }
  }

  // Handle restaurant selection (navigate to restaurant page)
  const handleRestaurantSelect = (restaurant) => {
    capture('search_performed', {
      query: query,
      result_type: 'restaurant',
      selected_restaurant_id: restaurant.id,
      selected_restaurant_name: restaurant.name,
    })
    setQuery('')
    setIsFocused(false)
    navigate(`/restaurants/${restaurant.id}`)
  }

  // Handle nearby restaurant selection
  const handleNearbySelect = (restaurant) => {
    capture('nearby_restaurant_suggested', {
      restaurant_id: restaurant.id,
      distance_meters: restaurant.distance_meters,
    })
    setQuery('')
    setIsFocused(false)
    navigate(`/restaurants/${restaurant.id}`)
  }

  // Handle "Add a restaurant" button
  const handleAddRestaurant = () => {
    setIsFocused(false)
    setAddRestaurantOpen(true)
  }

  return (
    <div className="relative w-full">
      {/* Search Input — Neo-Brutalist */}
      <div
        className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150"
        style={{
          background: '#FFFFFF',
          border: `3px solid #000000`,
          boxShadow: isFocused ? '4px 4px 0px 0px #000000' : '3px 3px 0px 0px #000000',
          minHeight: '48px',
        }}
      >
        <svg
          className="w-5 h-5 flex-shrink-0"
          style={{ color: '#000000' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          ref={inputRef}
          id="dish-search"
          name="dish-search"
          type="text"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search dishes by name"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="dish-search-dropdown"
          className="flex-1 bg-transparent outline-none border-none text-sm"
          style={{ color: '#000000', fontWeight: 600, outline: 'none', border: 'none', boxShadow: 'none' }}
        />

        {query && (
          <button
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
            className="p-1 rounded-lg transition-colors"
            style={{ border: '2px solid #000000' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F5F5' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: '#000000' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown — Neo-Brutalist */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id="dish-search-dropdown"
          role="listbox"
          aria-label="Search results"
          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{
            background: '#FFFFFF',
            border: '3px solid #000000',
            boxShadow: '6px 6px 0px 0px #000000',
          }}
        >
          {/* Nearby restaurants (shown on focus before typing) */}
          {showNearby && query.length < MIN_SEARCH_LENGTH && (
            <div className="max-h-80 overflow-y-auto">
              <div className="px-4 py-2" style={{ borderBottom: '2px solid #000000' }}>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: '#000000', fontWeight: 800 }}>
                  Nearby
                </span>
              </div>
              {nearbyRestaurants.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleNearbySelect(r)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF7ED' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#FFF7ED', border: '2px solid #000000' }}
                  >
                    <svg className="w-4 h-4" style={{ color: '#F97316' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate" style={{ color: '#000000', fontWeight: 700 }}>{r.name}</p>
                    <p className="text-xs truncate" style={{ color: '#666666' }}>
                      {(r.distance_meters / 1609).toFixed(1)} mi away
                    </p>
                  </div>
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#000000' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* Search results mode */}
          {query.length >= MIN_SEARCH_LENGTH && (
            <>
              {isLoading ? (
                <div className="px-4 py-6 text-center">
                  <div className="animate-spin w-5 h-5 border-2 rounded-full mx-auto" style={{ borderColor: '#F5F5F5', borderTopColor: '#F97316' }} />
                  <p className="text-xs mt-2" style={{ color: '#666666', fontWeight: 600 }}>
                    Searching...
                  </p>
                </div>
              ) : !hasResults ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm" style={{ color: '#000000', fontWeight: 700 }}>
                    No results for &quot;{query}&quot;
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#666666' }}>
                    {!user ? 'Sign in to search Google Places for more restaurants' : 'Try a different spelling'}
                  </p>
                  {user ? (
                    <button
                      onClick={handleAddRestaurant}
                      className="mt-3 px-4 py-2 rounded-xl text-xs transition-all duration-150"
                      style={{
                        background: '#F97316',
                        color: '#000000',
                        fontWeight: 700,
                        border: '3px solid #000000',
                        boxShadow: '3px 3px 0px 0px #000000',
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translate(2px, 2px)'
                        e.currentTarget.style.boxShadow = '1px 1px 0px 0px #000000'
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'translate(0, 0)'
                        e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translate(0, 0)'
                        e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000'
                      }}
                    >
                      Add a restaurant
                    </button>
                  ) : (
                    <button
                      onClick={() => { setIsFocused(false); navigate('/login') }}
                      className="mt-3 px-4 py-2 rounded-xl text-xs transition-all duration-150"
                      style={{
                        background: '#F97316',
                        color: '#000000',
                        fontWeight: 700,
                        border: '3px solid #000000',
                        boxShadow: '3px 3px 0px 0px #000000',
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translate(2px, 2px)'
                        e.currentTarget.style.boxShadow = '1px 1px 0px 0px #000000'
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'translate(0, 0)'
                        e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translate(0, 0)'
                        e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000'
                      }}
                    >
                      Sign in to search more
                    </button>
                  )}
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {/* Dish Results */}
                  {results.dishes.length > 0 && (
                    <div>
                      <div className="px-4 py-2" style={{ borderBottom: '2px solid #000000' }}>
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: '#000000', fontWeight: 800 }}>
                          {town ? `Best in ${town}` : 'Best Matches'}
                        </span>
                      </div>
                      {results.dishes.map((dish, index) => (
                        <DishResult
                          key={dish.dish_id}
                          dish={dish}
                          rank={index + 1}
                          onClick={() => handleDishSelect(dish)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Restaurant Results (local DB) */}
                  {results.restaurants.length > 0 && (
                    <div>
                      <div className="px-4 py-2" style={{ borderBottom: '2px solid #000000' }}>
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: '#000000', fontWeight: 800 }}>
                          Restaurants
                        </span>
                      </div>
                      {results.restaurants.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleRestaurantSelect(r)}
                          className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF7ED' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <RestaurantAvatar name={r.name} size={24} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm truncate" style={{ color: '#000000', fontWeight: 700 }}>{r.name}</p>
                            <p className="text-xs truncate" style={{ color: '#666666' }}>{r.address}</p>
                          </div>
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#000000' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Google Places Results */}
                  {results.places.length > 0 && (
                    <div>
                      <div className="px-4 py-2" style={{ borderBottom: '2px solid #000000' }}>
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: '#F97316', fontWeight: 800 }}>
                          From Google Places
                        </span>
                      </div>
                      {results.places.slice(0, 5).map((p) => (
                        <button
                          key={p.placeId}
                          onClick={() => {
                            setQuery(p.name)
                            setIsFocused(false)
                            setAddRestaurantOpen(true)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF7ED' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: '#F97316', border: '2px solid #000000' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#000000" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm truncate" style={{ color: '#000000', fontWeight: 700 }}>{p.name}</p>
                            <p className="text-xs truncate" style={{ color: '#666666' }}>{p.address}</p>
                          </div>
                          <span
                            className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-lg"
                            style={{
                              background: '#F97316',
                              color: '#000000',
                              fontWeight: 800,
                              border: '2px solid #000000',
                            }}
                          >
                            + Add
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Category Results */}
                  {results.categories.length > 0 && (
                    <div>
                      <div className="px-4 py-2" style={{ borderBottom: '2px solid #000000' }}>
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: '#000000', fontWeight: 800 }}>
                          Categories
                        </span>
                      </div>
                      {results.categories.map((category) => (
                        <CategoryResult
                          key={category.id}
                          category={category}
                          onClick={() => handleCategorySelect(category)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* "Add a restaurant" CTA - always shown when query has 2+ chars */}
              {user && (
                <button
                  onClick={handleAddRestaurant}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                  style={{ borderTop: '2px solid #000000' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF7ED' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#F97316', border: '2px solid #000000' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#000000" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm" style={{ color: '#F97316', fontWeight: 700 }}>
                    Don&apos;t see it? Add a restaurant
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Add Restaurant Modal */}
      <AddRestaurantModal
        isOpen={addRestaurantOpen}
        onClose={() => setAddRestaurantOpen(false)}
        initialQuery={query}
      />
    </div>
  )
}

// Individual dish result row — Neo-Brutalist
function DishResult({ dish, rank, onClick }) {
  const {
    dish_name,
    restaurant_name,
    restaurant_town,
    category,
    photo_url,
    avg_rating,
    total_votes,
  } = dish

  const imgSrc = photo_url || getCategoryImage(category)
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
      onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF7ED' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Restaurant avatar with town color */}
      <RestaurantAvatar name={restaurant_name} town={restaurant_town} size={24} />

      {/* Rank badge */}
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
        style={{
          background: rank === 1 ? '#F97316' : '#F5F5F5',
          color: rank === 1 ? '#000000' : '#666666',
          fontWeight: 800,
          border: '2px solid #000000',
        }}
      >
        {rank}
      </div>

      {/* Photo */}
      <div
        className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
        style={{ border: '2px solid #000000' }}
      >
        <img
          src={imgSrc}
          alt={dish_name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm truncate" style={{ color: '#000000', fontWeight: 700 }}>
          {dish_name}
        </h4>
        <p className="text-xs truncate" style={{ color: '#666666' }}>
          {restaurant_name}
        </p>
      </div>

      {/* Rating */}
      <div className="flex-shrink-0 text-right">
        {isRanked ? (
          <div className="flex flex-col items-end">
            <span
              className="text-xs px-1.5 py-0.5 rounded-lg"
              style={{
                background: '#F97316',
                color: '#000000',
                fontWeight: 800,
                border: '2px solid #000000',
                boxShadow: '2px 2px 0px 0px #000000',
              }}
            >
              {avg_rating || '—'}
            </span>
            <span className="text-[10px] mt-0.5" style={{ color: '#666666', fontWeight: 600 }}>
              {total_votes} votes
            </span>
          </div>
        ) : (
          <div
            className="text-[10px] px-2 py-1 rounded-lg"
            style={{
              background: '#F5F5F5',
              color: '#666666',
              fontWeight: 700,
              border: '2px solid #000000',
            }}
          >
            {total_votes ? `Early · ${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'Be first to vote'}
          </div>
        )}
      </div>
    </button>
  )
}

// Category result row — Neo-Brutalist
function CategoryResult({ category, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
      onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF7ED' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Category image */}
      <div
        className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
        style={{ border: '2px solid #000000' }}
      >
        <img
          src={getCategoryImage(category.id)}
          alt={category.label}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm" style={{ color: '#000000', fontWeight: 700 }}>
          {category.label}
        </h4>
        <p className="text-xs" style={{ color: '#666666' }}>
          View all ranked dishes
        </p>
      </div>

      {/* Arrow */}
      <svg
        className="w-4 h-4 flex-shrink-0"
        style={{ color: '#000000' }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
