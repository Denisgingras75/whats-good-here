import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logger } from '../utils/logger'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useUserVotes } from '../hooks/useUserVotes'
import { useDishSearch } from '../hooks/useDishSearch'
import { useFavorites } from '../hooks/useFavorites'
import { useTrendingDishes } from '../hooks/useTrendingDishes'
import { restaurantsApi } from '../api/restaurantsApi'
import { dishesApi } from '../api/dishesApi'
import { getStorageItem, setStorageItem } from '../lib/storage'
import { BROWSE_CATEGORIES, CATEGORY_INFO } from '../constants/categories'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRelatedSuggestions } from '../constants/searchSuggestions'
import { DishListItem } from '../components/DishListItem'
import { ScorePill } from '../components/ScorePill'
import { ConsensusBar } from '../components/ConsensusBar'
import { getPendingVoteFromStorage } from '../lib/storage'
import { LoginModal } from '../components/Auth/LoginModal'
import { ImpactFeedback, getImpactMessage } from '../components/ImpactFeedback'
import { SortDropdown } from '../components/browse'
import { RadiusSheet } from '../components/LocationPicker'
import { LocationBanner } from '../components/LocationBanner'
import { useRestaurantSearch } from '../hooks/useRestaurantSearch'
import { AddRestaurantModal } from '../components/AddRestaurantModal'

// Use centralized browse categories
const CATEGORIES = BROWSE_CATEGORIES

// Cuisine types that should have "food" appended for natural language
const CUISINE_TYPES = new Set([
  'mexican', 'chinese', 'thai', 'japanese', 'italian', 'indian', 'vietnamese',
  'korean', 'greek', 'french', 'spanish', 'mediterranean', 'american', 'brazilian',
  'cuban', 'caribbean', 'jamaican', 'ethiopian', 'moroccan', 'turkish', 'lebanese', 'persian',
  'german', 'british', 'irish', 'polish', 'russian', 'african', 'asian', 'european',
  'latin', 'southern', 'cajun', 'creole', 'hawaiian', 'filipino', 'indonesian',
  'malaysian', 'singaporean', 'taiwanese', 'cantonese', 'szechuan', 'hunan',
])

// Format search query for display - adds "food" for cuisine types
function formatSearchQuery(query) {
  const lower = query.toLowerCase().trim()
  if (CUISINE_TYPES.has(lower)) {
    return `${query} food`
  }
  return query
}

export function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [impactFeedback, setImpactFeedback] = useState(null)
  const [pendingVoteData, setPendingVoteData] = useState(null)
  const [sortBy, setSortBy] = useState('top_rated')
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)

  // Autocomplete state
  const [autocompleteOpen, setAutocompleteOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [autocompleteIndex, setAutocompleteIndex] = useState(-1)
  const [dishSuggestions, setDishSuggestions] = useState([])
  const [restaurantSuggestions, setRestaurantSuggestions] = useState([])

  const { location, radius, setRadius, town, permissionState, requestLocation, isUsingDefault } = useLocationContext()
  const [showRadiusSheet, setShowRadiusSheet] = useState(false)
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false)
  const [addRestaurantQuery, setAddRestaurantQuery] = useState('')
  const { stats: userStats } = useUserVotes(user?.id)

  // Trending dishes
  const { trending } = useTrendingDishes(5, town)

  // Search results from API using React Query hook
  const { results: searchResults, loading: searchLoading } = useDishSearch(debouncedSearchQuery, 50, town)

  // Google Places restaurant search
  const placesLat = isUsingDefault ? null : location?.lat
  const placesLng = isUsingDefault ? null : location?.lng
  const { externalResults: placesResults } = useRestaurantSearch(
    searchQuery, placesLat, placesLng, searchQuery.trim().length >= 2, null
  )

  const beforeVoteRef = useRef(null)
  const searchInputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const votingDishId = new URLSearchParams(window.location.search).get('votingDish')

  // Handle category and search query from URL params
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    const queryFromUrl = searchParams.get('q')

    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
      setSearchQuery('')
      setDebouncedSearchQuery('')
    } else if (queryFromUrl) {
      setSearchQuery(queryFromUrl)
      setDebouncedSearchQuery(queryFromUrl)
      setSelectedCategory(null)
    } else {
      setSelectedCategory(null)
      setSearchQuery('')
      setDebouncedSearchQuery('')
    }
  }, [searchParams, navigate])

  // Debounce search query by 300ms
  useEffect(() => {
    if (!selectedCategory && !debouncedSearchQuery) {
      return
    }
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategory, debouncedSearchQuery])

  const handleSortChange = (sortId) => {
    setSortBy(sortId)
    setStorageItem('browse_sort', sortId)
    setSortDropdownOpen(false)
  }

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setDishSuggestions([])
      setRestaurantSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      try {
        const [dishResults, restaurantResults] = await Promise.all([
          dishesApi.search(searchQuery, 5, town),
          restaurantsApi.search(searchQuery, 3),
        ])
        setDishSuggestions(dishResults)
        setRestaurantSuggestions(restaurantResults)
      } catch (error) {
        logger.error('Search suggestions failed:', error)
        setDishSuggestions([])
        setRestaurantSuggestions([])
      }
    }

    const timer = setTimeout(fetchSuggestions, 150)
    return () => clearTimeout(timer)
  }, [searchQuery, town])

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target) &&
        !searchInputRef.current?.contains(e.target)
      ) {
        setAutocompleteOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside, { passive: true })
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Only fetch from useDishes when browsing by category
  const shouldFetchFromUseDishes = selectedCategory && !debouncedSearchQuery.trim()

  const { dishes, loading, error, refetch } = useDishes(
    shouldFetchFromUseDishes ? location : null,
    radius,
    selectedCategory,
    null,
    town
  )
  const { isFavorite, toggleFavorite } = useFavorites(user?.id)

  const getDishRank = useCallback((dishId, dishList) => {
    const ranked = dishList?.filter(d => (d.total_votes || 0) >= MIN_VOTES_FOR_RANKING) || []
    const index = ranked.findIndex(d => d.dish_id === dishId)
    return index === -1 ? 999 : index + 1
  }, [])

  const openDishPage = useCallback((dish) => {
    navigate(`/dish/${dish.dish_id}`)
  }, [navigate])

  // Auto-navigate after OAuth login if pending vote
  useEffect(() => {
    if (!user || !dishes?.length) return
    const pending = getPendingVoteFromStorage()
    const dishIdToOpen = votingDishId || pending?.dishId
    if (!dishIdToOpen) return
    const dish = dishes.find(d => d.dish_id === dishIdToOpen)
    if (!dish) return
    if (votingDishId) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('votingDish')
      window.history.replaceState({}, '', newUrl.pathname + newUrl.search)
    }
    openDishPage(dish)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dishes, openDishPage])

  // Calculate impact when dishes update after voting
  useEffect(() => {
    if (!pendingVoteData || !dishes?.length) return
    const after = dishes.find(d => d.dish_id === pendingVoteData.dish_id)
    if (!after) return
    if (after.total_votes > pendingVoteData.total_votes) {
      const afterRank = getDishRank(pendingVoteData.dish_id, dishes)
      const impact = getImpactMessage(
        pendingVoteData, after, pendingVoteData.rank, afterRank
      )
      setImpactFeedback(impact)
      setPendingVoteData(null)
    }
  }, [dishes, pendingVoteData, setImpactFeedback, getDishRank])

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  const handleToggleFavorite = async (dishId) => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    try {
      await toggleFavorite(dishId)
    } catch (error) {
      logger.error('Failed to toggle favorite:', error)
    }
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setSearchQuery('')
    setDebouncedSearchQuery('')
    if (categoryId) {
      setSearchParams({ category: categoryId })
    } else {
      setSearchParams({})
    }
  }

  const handleBackToCategories = () => {
    navigate('/')
  }

  // Filter and sort dishes
  const filteredDishes = useMemo(() => {
    const source = debouncedSearchQuery.trim() ? searchResults : dishes
    let result = (Array.isArray(source) ? source : []).filter(d => d && d.dish_id)

    switch (sortBy) {
      case 'best_value':
        result = result.slice().sort((a, b) => {
          const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
          const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
          if (aRanked && !bRanked) return -1
          if (!aRanked && bRanked) return 1
          const aVal = a.value_percentile != null ? Number(a.value_percentile) : -1
          const bVal = b.value_percentile != null ? Number(b.value_percentile) : -1
          if (bVal !== aVal) return bVal - aVal
          return (b.avg_rating || 0) - (a.avg_rating || 0)
        })
        break
      case 'most_voted':
        result = result.slice().sort((a, b) => {
          return (b.total_votes || 0) - (a.total_votes || 0)
        })
        break
      case 'closest':
        result = result.slice().sort((a, b) => {
          const aDist = a.distance_miles != null ? Number(a.distance_miles) : 9999
          const bDist = b.distance_miles != null ? Number(b.distance_miles) : 9999
          if (aDist !== bDist) return aDist - bDist
          return (b.avg_rating || 0) - (a.avg_rating || 0)
        })
        break
      case 'top_rated':
      default:
        result = result.slice().sort((a, b) => {
          const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
          const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
          if (aRanked && !bRanked) return -1
          if (!aRanked && bRanked) return 1
          return (b.avg_rating || 0) - (a.avg_rating || 0)
        })
        break
    }

    return result
  }, [dishes, debouncedSearchQuery, sortBy, searchResults])

  const clearSearch = () => {
    setSearchQuery('')
    setAutocompleteOpen(false)
  }

  // Autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return []

    const dishMatches = (Array.isArray(dishSuggestions) ? dishSuggestions : [])
      .filter(d => d && d.dish_id && d.dish_name)
      .map(d => ({
        type: 'dish',
        id: d.dish_id,
        name: d.dish_name,
        subtitle: d.restaurant_name || '',
        data: d,
      }))

    const restaurantMatches = (Array.isArray(restaurantSuggestions) ? restaurantSuggestions : [])
      .filter(r => r && r.id && r.name)
      .map(r => ({
        type: 'restaurant',
        id: r.id,
        name: r.name,
        subtitle: r.address || '',
        data: r,
      }))

    const placeMatches = (Array.isArray(placesResults) ? placesResults : [])
      .slice(0, 4)
      .map(p => ({
        type: 'place',
        id: p.placeId,
        name: p.name,
        subtitle: p.address || '',
        data: p,
      }))

    return [...dishMatches, ...restaurantMatches, ...placeMatches]
  }, [searchQuery, dishSuggestions, restaurantSuggestions, placesResults])

  const handleAutocompleteSelect = useCallback((suggestion) => {
    setAutocompleteOpen(false)
    setAutocompleteIndex(-1)

    if (suggestion.type === 'dish') {
      openDishPage(suggestion.data)
      setSearchQuery('')
    } else if (suggestion.type === 'restaurant') {
      navigate(`/restaurants/${suggestion.id}`)
    } else if (suggestion.type === 'place') {
      setAddRestaurantQuery(suggestion.name)
      setAddRestaurantOpen(true)
      setSearchQuery('')
    }
  }, [navigate, openDishPage])

  const handleSearchKeyDown = useCallback((e) => {
    if (!autocompleteOpen || autocompleteSuggestions.length === 0) {
      if (e.key === 'ArrowDown' && searchQuery.trim().length >= 2) {
        setAutocompleteOpen(true)
        setAutocompleteIndex(0)
        e.preventDefault()
      } else if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
        e.preventDefault()
        setSelectedCategory(null)
        setDebouncedSearchQuery(searchQuery.trim())
        setSearchParams({ q: searchQuery.trim() })
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setAutocompleteIndex(prev =>
          prev < autocompleteSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setAutocompleteIndex(prev =>
          prev > 0 ? prev - 1 : autocompleteSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (autocompleteIndex >= 0 && autocompleteSuggestions[autocompleteIndex]) {
          handleAutocompleteSelect(autocompleteSuggestions[autocompleteIndex])
        } else if (searchQuery.trim().length >= 2) {
          setAutocompleteOpen(false)
          setAutocompleteIndex(-1)
          setSelectedCategory(null)
          setDebouncedSearchQuery(searchQuery.trim())
          setSearchParams({ q: searchQuery.trim() })
        }
        break
      case 'Escape':
        setAutocompleteOpen(false)
        setAutocompleteIndex(-1)
        break
    }
  }, [autocompleteOpen, autocompleteSuggestions, autocompleteIndex, handleAutocompleteSelect, searchQuery, setSearchParams])

  const showingDishes = selectedCategory || debouncedSearchQuery.trim()

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>

      {/* ─── Search bar — always at top ─────────────────────────── */}
      <div className="px-4 pt-4 pb-2 relative" style={{ zIndex: 20 }}>
        <div className="relative">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
            style={{
              background: 'var(--color-surface)',
              border: searchFocused ? '2px solid var(--color-accent-gold)' : '2px solid var(--color-divider)',
            }}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              style={{ color: 'var(--color-text-tertiary)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              id="browse-search"
              name="browse-search"
              type="text"
              autoComplete="off"
              placeholder="Find the best ___ near you"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (e.target.value.length >= 2) {
                  setAutocompleteOpen(true)
                } else {
                  setAutocompleteOpen(false)
                }
                setAutocompleteIndex(-1)
              }}
              onFocus={() => {
                setSearchFocused(true)
                if (searchQuery.length >= 2 && autocompleteSuggestions.length > 0) {
                  setAutocompleteOpen(true)
                }
              }}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={handleSearchKeyDown}
              className="flex-1 bg-transparent outline-none border-none text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  clearSearch()
                  searchInputRef.current?.focus()
                }}
                className="p-1 rounded-full"
              >
                <svg className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {autocompleteOpen && autocompleteSuggestions.length > 0 && (
            <div
              ref={autocompleteRef}
              className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border overflow-hidden z-50"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-divider)' }}
            >
              {autocompleteSuggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  onClick={() => handleAutocompleteSelect(suggestion)}
                  className="w-full px-3 py-2.5 text-left flex items-center gap-2 transition-colors"
                  style={{
                    background: index === autocompleteIndex ? 'var(--color-primary-muted)' : 'transparent'
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {suggestion.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                      {suggestion.type === 'dish' ? `at ${suggestion.subtitle}` : suggestion.subtitle}
                    </p>
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: suggestion.type === 'dish'
                        ? 'var(--color-primary-muted)'
                        : suggestion.type === 'place'
                        ? 'rgba(217, 167, 101, 0.15)'
                        : 'rgba(59, 130, 246, 0.15)',
                      color: suggestion.type === 'dish'
                        ? 'var(--color-primary)'
                        : suggestion.type === 'place'
                        ? 'var(--color-accent-gold)'
                        : 'var(--color-blue-light)',
                    }}
                  >
                    {suggestion.type === 'dish' ? 'Dish' : suggestion.type === 'place' ? '+ Add' : 'Spot'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!showingDishes ? (
        /* ─── Discovery view — trending + categories ────────────── */
        <div className="pb-24">

          {/* Trending Now — horizontal scroll */}
          {trending.length > 0 && (
            <div className="pt-2 pb-4">
              <div className="px-4 pb-2">
                <span className="section-label">Trending Now</span>
              </div>
              <div
                className="flex gap-3 px-4 overflow-x-auto scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {trending.slice(0, 5).map(function (dish) {
                  return (
                    <button
                      key={dish.dish_id}
                      onClick={function () { navigate('/dish/' + dish.dish_id) }}
                      className="flex-shrink-0 card-standard card-press overflow-hidden"
                      style={{ width: '140px' }}
                    >
                      {/* Photo thumbnail */}
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '4 / 3',
                          background: 'var(--color-surface)',
                          overflow: 'hidden',
                        }}
                      >
                        {dish.photo_url ? (
                          <img
                            src={dish.photo_url}
                            alt={dish.dish_name}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: 'var(--color-category-strip)' }}
                          >
                            <span style={{ fontSize: '28px' }}>{dish.category_emoji || '🍽️'}</span>
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-2">
                        <p
                          className="font-bold truncate"
                          style={{ fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.2 }}
                        >
                          {dish.dish_name}
                        </p>
                        <p
                          className="truncate"
                          style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '1px' }}
                        >
                          {dish.restaurant_name}
                        </p>
                        <div style={{ marginTop: '4px' }}>
                          <ScorePill score={dish.avg_rating} size="sm" />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Category grid — 2 columns */}
          <div className="px-4 pt-2">
            <div className="pb-3">
              <span className="section-label">Categories</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(function (category) {
                return (
                  <button
                    key={category.id}
                    onClick={function () { handleCategoryChange(category.id) }}
                    className="flex items-center gap-3 px-4 py-4 rounded-xl card-press text-left"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-divider)',
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>{category.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-bold truncate"
                        style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}
                      >
                        {category.label}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ─── Dish list view ─────────────────────────────────────── */
        <>
          {/* Category/Search header */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-divider)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setDebouncedSearchQuery('')
                    setSearchQuery('')
                    setSearchParams({})
                  }}
                  className="p-1 -ml-1 rounded-lg"
                  aria-label="Back"
                >
                  <svg className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="font-bold" style={{ fontSize: '16px', color: 'var(--color-text-primary)' }}>
                  {debouncedSearchQuery
                    ? `Best ${formatSearchQuery(debouncedSearchQuery)} ${town ? `in ${town}` : 'near you'}`
                    : `${CATEGORIES.find(c => c.id === selectedCategory)?.emoji || ''} ${CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Dishes'}${town ? ` in ${town}` : ''}`
                  }
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRadiusSheet(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-divider)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {radius} mi
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-text-tertiary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <SortDropdown
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                  isOpen={sortDropdownOpen}
                  onToggle={setSortDropdownOpen}
                />
              </div>
            </div>
          </div>

          {/* Dish list */}
          <div className="px-4 py-4 pb-24">
            <LocationBanner
              permissionState={permissionState}
              requestLocation={requestLocation}
            />
            {(loading || searchLoading) ? (
              <div className="space-y-2 animate-pulse">
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
            ) : error ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary-muted)' }}>
                  <span className="text-2xl">⚠️</span>
                </div>
                <p role="alert" className="text-sm mb-4" style={{ color: 'var(--color-danger)' }}>{error?.message || 'Something went wrong'}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
                >
                  Retry
                </button>
              </div>
            ) : filteredDishes.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {debouncedSearchQuery
                    ? `No dishes found for "${debouncedSearchQuery}"`
                    : 'No dishes in this category yet'
                  }
                </p>
                {debouncedSearchQuery && (
                  <>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                      Explore similar:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {getRelatedSuggestions(debouncedSearchQuery).map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setSearchQuery(suggestion)
                            setDebouncedSearchQuery(suggestion)
                            setSearchParams({ q: suggestion })
                          }}
                          className="px-4 py-2 rounded-full text-sm font-medium card-press"
                          style={{
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid var(--color-divider)',
                          }}
                        >
                          {suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <button
                  onClick={handleBackToCategories}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold card-press"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
                >
                  Browse Categories
                </button>
              </div>
            ) : (
              /* Ranked list — DishListItem rows */
              <div className="flex flex-col" style={{ gap: '2px' }}>
                {filteredDishes.slice(0, 10).map(function (dish, index) {
                  return (
                    <DishListItem
                      key={dish.dish_id}
                      dish={dish}
                      rank={index + 1}
                      showDistance
                      className="stagger-item"
                    />
                  )
                })}

                {/* Show more */}
                {filteredDishes.length > 10 && (
                  <details className="mt-3">
                    <summary
                      className="cursor-pointer py-3 text-center text-sm font-medium rounded-xl"
                      style={{
                        background: 'var(--color-surface)',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-divider)',
                      }}
                    >
                      Show {filteredDishes.length - 10} more dishes
                    </summary>
                    <div className="flex flex-col mt-2" style={{ gap: '2px' }}>
                      {filteredDishes.slice(10).map(function (dish, index) {
                        return (
                          <DishListItem
                            key={dish.dish_id}
                            dish={dish}
                            rank={index + 11}
                            showDistance
                          />
                        )
                      })}
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* Footer */}
            {!loading && filteredDishes.length > 0 && (
              <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid var(--color-divider)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {filteredDishes.length} {filteredDishes.length === 1 ? 'dish' : 'dishes'} found
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <RadiusSheet
        isOpen={showRadiusSheet}
        onClose={() => setShowRadiusSheet(false)}
        radius={radius}
        onRadiusChange={setRadius}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <AddRestaurantModal
        isOpen={addRestaurantOpen}
        onClose={() => setAddRestaurantOpen(false)}
        initialQuery={addRestaurantQuery}
      />

      <ImpactFeedback
        impact={impactFeedback}
        onClose={() => setImpactFeedback(null)}
      />
    </div>
  )
}
