import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { DishListItem } from '../DishListItem'

var TOP_DISHES_COUNT = 5

// Restaurant dishes component - Job #2: "What should I order?"
export function RestaurantDishes({ dishes, loading, error, onVote, onLoginRequired, isFavorite, onToggleFavorite, user, searchQuery = '', friendsVotesByDish = {}, restaurantName, restaurantTown, onAddDish }) {
  var [showAllDishes, setShowAllDishes] = useState(false)

  // Filter and sort dishes
  var sortedDishes = useMemo(function () {
    if (!dishes || !dishes.length) return { top: [], rest: [], filtered: false }

    var query = searchQuery.toLowerCase().trim()
    var filteredDishes = dishes
    if (query) {
      filteredDishes = dishes.filter(function (d) {
        return (d.dish_name || '').toLowerCase().indexOf(query) !== -1 ||
          (d.category || '').toLowerCase().indexOf(query) !== -1
      })
    }

    var sorted = filteredDishes.slice().sort(function (a, b) {
      var aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      var bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      if (aRanked && !bRanked) return -1
      if (!aRanked && bRanked) return 1
      var aRating = a.avg_rating || 0
      var bRating = b.avg_rating || 0
      if (bRating !== aRating) return bRating - aRating
      var aPct = a.percent_worth_it || 0
      var bPct = b.percent_worth_it || 0
      if (bPct !== aPct) return bPct - aPct
      var voteDiff = (b.total_votes || 0) - (a.total_votes || 0)
      if (voteDiff !== 0) return voteDiff
      return (a.dish_name || '').localeCompare(b.dish_name || '')
    })

    return {
      top: sorted.slice(0, TOP_DISHES_COUNT),
      rest: sorted.slice(TOP_DISHES_COUNT),
      filtered: query.length > 0,
      totalMatches: filteredDishes.length,
    }
  }, [dishes, searchQuery])

  var rankedCount = dishes ? dishes.filter(function (d) { return (d.total_votes || 0) >= MIN_VOTES_FOR_RANKING }).length : 0

  // Count unique friends who rated dishes here
  var uniqueFriends = useMemo(function () {
    var friendIds = new Set()
    Object.values(friendsVotesByDish).forEach(function (votes) {
      votes.forEach(function (v) { friendIds.add(v.user_id) })
    })
    return friendIds.size
  }, [friendsVotesByDish])

  if (loading) {
    return (
      <div className="px-4 py-6" role="status" aria-label="Loading dishes">
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map(function (i) {
            return (
              <div
                key={i}
                className="h-16 rounded-xl"
                style={{ background: 'var(--color-surface)', border: '2px solid var(--color-card-border)' }}
              />
            )
          })}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error && error.message ? error.message : error}</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-5">
      {/* Section Header */}
      <div className="mb-4">
        <h3
          className="font-bold"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '18px',
            letterSpacing: '-0.01em',
          }}
        >
          {sortedDishes.filtered
            ? 'Results for "' + searchQuery + '"'
            : rankedCount > 0
              ? "What's Good Here"
              : 'Help decide what to order here'
          }
        </h3>
        <p className="mt-1 font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
          {sortedDishes.filtered
            ? sortedDishes.totalMatches + ' ' + (sortedDishes.totalMatches === 1 ? 'dish' : 'dishes') + ' found'
            : rankedCount > 0
              ? 'Top picks based on ' + rankedCount + ' rated ' + (rankedCount === 1 ? 'dish' : 'dishes')
              : 'Vote on dishes to shape the rankings'
          }
        </p>
      </div>

      {/* Friends banner */}
      {uniqueFriends > 0 && (
        <div
          className="mb-4 px-3.5 py-3 rounded-xl flex items-center gap-3"
          style={{
            background: 'var(--color-card)',
            border: '1.5px solid var(--color-primary)',
          }}
        >
          <div className="flex -space-x-2 flex-shrink-0">
            {(function () {
              var seen = new Set()
              var friendList = []
              Object.values(friendsVotesByDish).forEach(function (votes) {
                votes.forEach(function (v) {
                  if (!seen.has(v.user_id)) {
                    seen.add(v.user_id)
                    friendList.push(v)
                  }
                })
              })
              return friendList.slice(0, 3).map(function (friend, i) {
                return (
                  <Link
                    key={friend.user_id}
                    to={'/user/' + friend.user_id}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-2"
                    style={{
                      background: 'var(--color-primary)',
                      color: 'var(--color-text-on-primary)',
                      ringColor: 'var(--color-card)',
                      zIndex: 3 - i,
                    }}
                  >
                    {friend.display_name ? friend.display_name.charAt(0).toUpperCase() : '?'}
                  </Link>
                )
              })
            })()}
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {uniqueFriends} {uniqueFriends === 1 ? 'friend has' : 'friends have'} been here
          </p>
        </div>
      )}

      {/* Dish List */}
      {sortedDishes.top.length > 0 ? (
        <div className="flex flex-col" style={{ gap: '2px' }}>
          {sortedDishes.top.map(function (dish, index) {
            return (
              <DishListItem
                key={dish.dish_id}
                dish={dish}
                rank={index + 1}
                variant="restaurant"
                className="stagger-item"
              />
            )
          })}
        </div>
      ) : (
        <div
          className="py-10 text-center rounded-xl"
          style={{
            background: 'var(--color-card)',
            border: '2px solid var(--color-card-border)',
          }}
        >
          <p className="font-bold" style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
            {sortedDishes.filtered
              ? 'No dishes matching "' + searchQuery + '"'
              : 'No dishes at this restaurant yet'
            }
          </p>
          {sortedDishes.filtered ? (
            <p className="mt-1.5 font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
              Try a different search term
            </p>
          ) : (
            <>
              <p className="mt-1 font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                Be the first to add one and help others decide what to order
              </p>
              {onAddDish && (
                <button
                  onClick={onAddDish}
                  className="mt-4 px-5 py-2.5 rounded-full font-semibold text-sm card-press"
                  style={{
                    background: 'var(--color-primary)',
                    color: 'var(--color-text-on-primary)',
                  }}
                >
                  + Add a dish
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* More Dishes */}
      {sortedDishes.rest.length > 0 && (
        <div className="mt-4">
          <button
            onClick={function () { setShowAllDishes(!showAllDishes) }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold card-press"
            style={{
              background: 'var(--color-card)',
              color: 'var(--color-primary)',
              border: '2px solid var(--color-card-border)',
              fontSize: '13px',
            }}
          >
            {showAllDishes ? 'Show less' : 'See ' + sortedDishes.rest.length + ' more dishes'}
            <svg
              className={'w-4 h-4 transition-transform' + (showAllDishes ? ' rotate-180' : '')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAllDishes && (
            <div className="mt-3 flex flex-col" style={{ gap: '2px' }}>
              {sortedDishes.rest.map(function (dish, index) {
                return (
                  <DishListItem
                    key={dish.dish_id}
                    dish={dish}
                    rank={TOP_DISHES_COUNT + index + 1}
                    variant="restaurant"
                  />
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
