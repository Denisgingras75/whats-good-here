import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useSavedDishes } from '../hooks/useSavedDishes'
import { BrowseCard } from '../components/BrowseCard'
import { DishModal } from '../components/DishModal'
import { getPendingVoteFromStorage } from '../components/ReviewFlow'
import { LoginModal } from '../components/Auth/LoginModal'
import { DishCardSkeleton } from '../components/Skeleton'
import { ImpactFeedback, getImpactMessage } from '../components/ImpactFeedback'

const MIN_VOTES_FOR_RANKING = 5

const SORT_OPTIONS = [
  { id: 'top_rated', label: 'Top Rated', icon: '⭐' },
  { id: 'most_voted', label: 'Most Voted', icon: '🔥' },
  { id: 'closest', label: 'Closest', icon: '📍' },
]

const CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burgers', emoji: '🍔' },
  { id: 'taco', label: 'Tacos', emoji: '🌮' },
  { id: 'wings', label: 'Wings', emoji: '🍗' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'sandwich', label: 'Sandwiches', emoji: '🥪' },
  { id: 'breakfast sandwich', label: 'Bfast Sandwich', emoji: '🥯' },
  { id: 'pasta', label: 'Pasta', emoji: '🍝' },
  { id: 'pokebowl', label: 'Poke', emoji: '🥗' },
  { id: 'lobster roll', label: 'Lobster Rolls', emoji: '🦞' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
  { id: 'chowder', label: 'Chowder', emoji: '🍲' },
  { id: 'soup', label: 'Soups', emoji: '🍜' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'salad', label: 'Salads', emoji: '🥗' },
  { id: 'fries', label: 'Fries', emoji: '🍟' },
  { id: 'tendys', label: 'Tendys', emoji: '🍗' },
  { id: 'fried chicken', label: 'Fried Chicken', emoji: '🍗' },
  { id: 'apps', label: 'Apps', emoji: '🧆' },
  { id: 'entree', label: 'Entrees', emoji: '🥩' },
]

export function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const [impactFeedback, setImpactFeedback] = useState(null)
  const [pendingVoteData, setPendingVoteData] = useState(null)
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem('browse_sort') || 'top_rated'
  })
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const beforeVoteRef = useRef(null)
  const sortDropdownRef = useRef(null)

  // Handle category from URL params (when coming from home page)
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [searchParams])

  // Debounce search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle sort change
  const handleSortChange = (sortId) => {
    setSortBy(sortId)
    localStorage.setItem('browse_sort', sortId)
    setSortDropdownOpen(false)
  }

  const { location, radius } = useLocationContext()

  // Only fetch dishes when we have a category selected OR when searching
  const shouldFetchDishes = selectedCategory || debouncedSearchQuery.trim()

  const { dishes, loading, error, refetch } = useDishes(
    shouldFetchDishes ? location : null, // Pass null location to skip fetch
    radius,
    debouncedSearchQuery.trim() ? null : selectedCategory, // Search across all categories
    null
  )
  const { isSaved, toggleSave } = useSavedDishes(user?.id)

  // Helper to find dish rank in current list
  const getDishRank = (dishId, dishList) => {
    const ranked = dishList?.filter(d => (d.total_votes || 0) >= MIN_VOTES_FOR_RANKING) || []
    const index = ranked.findIndex(d => d.dish_id === dishId)
    return index === -1 ? 999 : index + 1
  }

  // Open dish modal and capture before state for impact calculation
  const openDishModal = (dish) => {
    beforeVoteRef.current = {
      dish_id: dish.dish_id,
      total_votes: dish.total_votes || 0,
      percent_worth_it: dish.percent_worth_it || 0,
      rank: getDishRank(dish.dish_id, dishes)
    }
    setSelectedDish(dish)
  }

  // Auto-reopen modal after OAuth/magic link login if there's a pending vote
  useEffect(() => {
    if (!user || !dishes?.length || selectedDish) return

    // Check URL for votingDish param (from magic link redirect)
    const params = new URLSearchParams(window.location.search)
    const votingDishId = params.get('votingDish')

    // Also check localStorage as fallback
    const pending = getPendingVoteFromStorage()
    const dishIdToOpen = votingDishId || pending?.dishId

    if (!dishIdToOpen) return

    // Find the dish in current list
    const dish = dishes.find(d => d.dish_id === dishIdToOpen)
    if (!dish) return

    // Clean up the URL param first
    if (votingDishId) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('votingDish')
      window.history.replaceState({}, '', newUrl.pathname + newUrl.search)
    }

    // Open modal immediately - dishes are guaranteed ready now
    openDishModal(dish)
  }, [user, dishes])

  // Calculate impact when dishes update after voting
  useEffect(() => {
    if (!pendingVoteData || !dishes?.length) return

    const after = dishes.find(d => d.dish_id === pendingVoteData.dish_id)
    if (!after) return

    // Check if votes actually increased (data refreshed)
    if (after.total_votes > pendingVoteData.total_votes) {
      const afterRank = getDishRank(pendingVoteData.dish_id, dishes)
      const impact = getImpactMessage(pendingVoteData, after, pendingVoteData.rank, afterRank)
      setImpactFeedback(impact)
      setPendingVoteData(null)
    }
  }, [dishes, pendingVoteData])

  const handleVote = () => {
    // Store before data and mark as pending
    if (beforeVoteRef.current) {
      setPendingVoteData(beforeVoteRef.current)
      beforeVoteRef.current = null
    }
    // Close the modal first, then refetch so toast appears on clean screen
    setSelectedDish(null)
    refetch()
  }

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  const handleToggleSave = async (dishId) => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    await toggleSave(dishId)
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setSearchQuery('') // Clear search when selecting category
    setDebouncedSearchQuery('')
    // Update URL params
    if (categoryId) {
      setSearchParams({ category: categoryId })
    } else {
      setSearchParams({})
    }
  }

  // Go back to category grid
  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSearchParams({})
  }

  // Filter and sort dishes
  const filteredDishes = useMemo(() => {
    // First filter by search query
    let result = dishes.filter(dish => {
      if (!debouncedSearchQuery.trim()) return true
      const query = debouncedSearchQuery.toLowerCase()
      return (
        dish.dish_name?.toLowerCase().includes(query) ||
        dish.restaurant_name?.toLowerCase().includes(query)
      )
    })

    // Then sort based on selected option
    switch (sortBy) {
      case 'most_voted':
        result = [...result].sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0))
        break
      case 'closest':
        result = [...result].sort((a, b) => (a.distance_miles || 999) - (b.distance_miles || 999))
        break
      case 'top_rated':
      default:
        // Sort by percent_worth_it, with min votes as tiebreaker
        result = [...result].sort((a, b) => {
          const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
          const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
          // Ranked dishes first
          if (aRanked && !bRanked) return -1
          if (!aRanked && bRanked) return 1
          // Then by percent_worth_it
          return (b.percent_worth_it || 0) - (a.percent_worth_it || 0)
        })
        break
    }

    return result
  }, [dishes, debouncedSearchQuery, sortBy])

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
  }

  // Are we showing dishes or the category grid?
  const showingDishes = selectedCategory || debouncedSearchQuery.trim()

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="flex flex-col items-center py-3">
          <img src="/logo.png" alt="What's Good Here" className="h-20 w-auto" />
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search dishes or restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-neutral-100 rounded-xl border-0 focus:ring-2 focus:bg-white transition-all"
              style={{ '--tw-ring-color': 'var(--color-primary)' }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center hover:bg-neutral-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-neutral-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Back button and category indicator when viewing dishes */}
        {showingDishes && selectedCategory && !debouncedSearchQuery.trim() && (
          <div className="px-4 pb-3 flex items-center gap-3">
            <button
              onClick={handleBackToCategories}
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Categories
            </button>
            <span className="text-neutral-300">|</span>
            <span className="text-sm font-medium text-neutral-700">
              {CATEGORIES.find(c => c.id === selectedCategory)?.emoji}{' '}
              {CATEGORIES.find(c => c.id === selectedCategory)?.label}
            </span>
          </div>
        )}
      </header>

      {/* Main Content */}
      {!showingDishes ? (
        /* Category Grid - Default View */
        <div className="px-4 py-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-md active:scale-[0.98] transition-all"
              >
                <span className="text-3xl mb-2">{category.emoji}</span>
                <span className="text-sm font-medium text-neutral-700">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Dish List View */
        <>
          {/* Results count and sort */}
          <div className="px-4 py-2 bg-stone-50 border-b border-neutral-100 flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              {loading ? (
                'Loading...'
              ) : (
                <>
                  <span className="font-medium text-neutral-700">{filteredDishes.length}</span>
                  {' '}
                  {filteredDishes.length === 1 ? 'dish' : 'dishes'}
                  {debouncedSearchQuery && (
                    <span> matching "{debouncedSearchQuery}"</span>
                  )}
                </>
              )}
            </p>

            {/* Sort dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-neutral-100 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span>{SORT_OPTIONS.find(o => o.id === sortBy)?.icon}</span>
                <span>{SORT_OPTIONS.find(o => o.id === sortBy)?.label}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {sortDropdownOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-50">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSortChange(option.id)}
                      className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-neutral-50 transition-colors ${
                        sortBy === option.id ? 'font-medium' : ''
                      }`}
                      style={{ color: sortBy === option.id ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                      {sortBy === option.id && (
                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dish Grid */}
          <div className="px-4 py-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <DishCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            ) : filteredDishes.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {debouncedSearchQuery
                    ? `No dishes found for "${debouncedSearchQuery}"`
                    : 'No dishes in this category yet'
                  }
                </p>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
                  {debouncedSearchQuery
                    ? 'Try a different search or browse by category'
                    : 'Be the first to add one!'
                  }
                </p>

                {/* Suggested categories */}
                <div className="mb-6">
                  <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                    Popular categories
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {CATEGORIES.slice(0, 6).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className="px-3 py-2 bg-white rounded-full border border-neutral-200 text-sm font-medium hover:border-neutral-300 hover:shadow-sm active:scale-[0.98] transition-all flex items-center gap-1.5"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        <span>{category.emoji}</span>
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Browse all categories button */}
                <button
                  onClick={handleBackToCategories}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Browse All Categories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDishes.map((dish) => (
                  <BrowseCard
                    key={dish.dish_id}
                    dish={dish}
                    onClick={() => openDishModal(dish)}
                    isFavorite={isSaved ? isSaved(dish.dish_id) : false}
                    onToggleFavorite={handleToggleSave}
                  />
                ))}
              </div>
            )}

            {/* Footer */}
            {!loading && filteredDishes.length > 0 && (
              <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--color-divider)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {filteredDishes.length} {filteredDishes.length === 1 ? 'dish' : 'dishes'} found
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dish Detail Modal */}
      <DishModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onVote={handleVote}
        onLoginRequired={handleLoginRequired}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* Impact feedback toast */}
      <ImpactFeedback
        impact={impactFeedback}
        onClose={() => setImpactFeedback(null)}
      />
    </div>
  )
}
