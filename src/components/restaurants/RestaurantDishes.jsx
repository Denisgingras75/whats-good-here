import { useState, useMemo } from 'react'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { TopDishCard } from './TopDishCard'

const TOP_DISHES_COUNT = 5

// Restaurant dishes component - Job #2: "What should I order?"
export function RestaurantDishes({ dishes, loading, error, onVote, onLoginRequired, isFavorite, onToggleFavorite, user, searchQuery = '' }) {
  const [showAllDishes, setShowAllDishes] = useState(false)

  // Filter and sort dishes
  const sortedDishes = useMemo(() => {
    if (!dishes?.length) return { top: [], rest: [], filtered: false }

    // Filter by search query if provided
    let filteredDishes = dishes
    const query = searchQuery.toLowerCase().trim()
    if (query) {
      filteredDishes = dishes.filter(d =>
        (d.dish_name || '').toLowerCase().includes(query) ||
        (d.category || '').toLowerCase().includes(query)
      )
    }

    const sorted = [...filteredDishes].sort((a, b) => {
      const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      // Ranked dishes first
      if (aRanked && !bRanked) return -1
      if (!aRanked && bRanked) return 1
      // Then by percent_worth_it (order again %)
      const aPct = a.percent_worth_it || 0
      const bPct = b.percent_worth_it || 0
      if (bPct !== aPct) return bPct - aPct
      // Tie-breaker: avg_rating
      const aRating = a.avg_rating || 0
      const bRating = b.avg_rating || 0
      if (bRating !== aRating) return bRating - aRating
      // Final tie-breaker: vote count
      return (b.total_votes || 0) - (a.total_votes || 0)
    })

    return {
      top: sorted.slice(0, TOP_DISHES_COUNT),
      rest: sorted.slice(TOP_DISHES_COUNT),
      filtered: query.length > 0,
      totalMatches: filteredDishes.length,
    }
  }, [dishes, searchQuery])

  const rankedCount = dishes?.filter(d => (d.total_votes || 0) >= MIN_VOTES_FOR_RANKING).length || 0

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--color-divider)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error?.message || error}</p>
      </div>
    )
  }

  const handleToggleSave = async (dishId) => {
    if (!user) {
      onLoginRequired()
      return
    }
    await onToggleFavorite(dishId)
  }

  return (
    <div className="px-4 py-4">
      {/* Section Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {sortedDishes.filtered
            ? `Results for "${searchQuery}"`
            : rankedCount > 0
              ? 'What should I order?'
              : 'Help decide what to order here'
          }
        </h3>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
          {sortedDishes.filtered
            ? `${sortedDishes.totalMatches} ${sortedDishes.totalMatches === 1 ? 'dish' : 'dishes'} found`
            : rankedCount > 0
              ? `Top picks based on ${rankedCount} rated ${rankedCount === 1 ? 'dish' : 'dishes'}`
              : 'Vote on dishes to shape the rankings'
          }
        </p>
      </div>

      {/* Top Dishes */}
      {sortedDishes.top.length > 0 ? (
        <div className="space-y-3">
          {sortedDishes.top.map((dish, index) => (
            <TopDishCard
              key={dish.dish_id}
              dish={dish}
              rank={index + 1}
              onVote={onVote}
              onLoginRequired={onLoginRequired}
              isFavorite={isFavorite ? isFavorite(dish.dish_id) : false}
              onToggleFavorite={handleToggleSave}
            />
          ))}
        </div>
      ) : (
        <div
          className="py-8 text-center rounded-xl"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {sortedDishes.filtered
              ? `No dishes matching "${searchQuery}"`
              : 'No dishes at this restaurant yet'
            }
          </p>
          {sortedDishes.filtered && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Try a different search term
            </p>
          )}
        </div>
      )}

      {/* More Dishes */}
      {sortedDishes.rest.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowAllDishes(!showAllDishes)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-divider)'
            }}
          >
            {showAllDishes ? 'Show less' : `See ${sortedDishes.rest.length} more dishes`}
            <svg
              className={`w-4 h-4 transition-transform ${showAllDishes ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAllDishes && (
            <div className="mt-4 space-y-3">
              {sortedDishes.rest.map((dish, index) => (
                <TopDishCard
                  key={dish.dish_id}
                  dish={dish}
                  rank={TOP_DISHES_COUNT + index + 1}
                  onVote={onVote}
                  onLoginRequired={onLoginRequired}
                  isFavorite={isFavorite ? isFavorite(dish.dish_id) : false}
                  onToggleFavorite={handleToggleSave}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
