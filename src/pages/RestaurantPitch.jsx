import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { restaurantsApi } from '../api/restaurantsApi'
import { dishesApi } from '../api/dishesApi'
import { logger } from '../utils/logger'

export function RestaurantPitch() {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!restaurantId) return
    let cancelled = false

    async function load() {
      try {
        const [rest, dishData] = await Promise.all([
          restaurantsApi.getById(restaurantId),
          dishesApi.getDishesForRestaurant({ restaurantId }),
        ])
        if (!cancelled) {
          setRestaurant(rest)
          // Sort by rating desc, take top dishes
          const sorted = [...dishData].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
          setDishes(sorted)
        }
      } catch (err) {
        if (!cancelled) {
          logger.error('Failed to load pitch data:', err)
          setError(err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [restaurantId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full" style={{ background: 'var(--color-divider)' }} />
          <div className="h-4 w-32 mx-auto rounded" style={{ background: 'var(--color-divider)' }} />
        </div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Restaurant not found
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
            This link may be outdated or the restaurant hasn't been added yet.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
          >
            Go to What's Good Here
          </button>
        </div>
      </div>
    )
  }

  const topDishes = dishes.slice(0, 5)
  const totalVotes = dishes.reduce((sum, d) => sum + (d.total_votes || 0), 0)
  const avgRating = dishes.length > 0
    ? (dishes.reduce((sum, d) => sum + (d.avg_rating || 0), 0) / dishes.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Hero */}
      <div className="px-6 pt-12 pb-8 text-center" style={{ background: 'var(--color-surface)' }}>
        {/* Logo mark */}
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl font-bold"
          style={{ background: 'var(--color-accent-gold-muted)', color: 'var(--color-accent-gold)' }}
        >
          {restaurant.name?.[0] || '?'}
        </div>

        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {restaurant.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {restaurant.address}
          {restaurant.town && ` · ${restaurant.town}`}
        </p>

        {/* Stats row */}
        <div className="flex justify-center gap-6 mt-6">
          {totalVotes > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                {totalVotes}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                ratings
              </div>
            </div>
          )}
          {avgRating && (
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                {avgRating}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                avg rating
              </div>
            </div>
          )}
          {dishes.length > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                {dishes.length}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                dishes rated
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Dishes */}
      {topDishes.length > 0 && (
        <div className="px-6 pt-8">
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Your top-rated dishes
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
            What people are saying about your food
          </p>

          <div className="space-y-3">
            {topDishes.map((dish, i) => (
              <div
                key={dish.dish_id || dish.id}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{
                  background: 'var(--color-card)',
                  border: i === 0 ? '2px solid var(--color-accent-gold)' : '1px solid var(--color-divider)',
                  boxShadow: i === 0 ? 'var(--glow-gold)' : 'none',
                }}
              >
                {/* Rank */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{
                    background: i === 0 ? 'var(--color-accent-gold-muted)' : 'var(--color-surface-elevated)',
                    color: i === 0 ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
                  }}
                >
                  {i + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {dish.dish_name || dish.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                    {dish.total_votes || 0} ratings
                    {dish.snippet && ` · "${dish.snippet}"`}
                  </p>
                </div>

                {/* Rating */}
                {dish.avg_rating && (
                  <div
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-base"
                    style={{
                      background: dish.avg_rating >= 8.5
                        ? 'var(--color-accent-gold-muted)'
                        : 'var(--color-surface-elevated)',
                      color: dish.avg_rating >= 8.5
                        ? 'var(--color-accent-gold)'
                        : 'var(--color-text-primary)',
                    }}
                  >
                    {Number(dish.avg_rating).toFixed(1)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Value prop */}
      <div className="px-6 pt-10 pb-4">
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-divider)',
          }}
        >
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            People are talking about your food
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
            Claim your restaurant on What's Good Here to post specials, respond to ratings, and reach tourists discovering the Vineyard's best dishes.
          </p>
          <button
            onClick={() => navigate('/manage')}
            className="w-full py-3.5 rounded-xl font-bold text-base"
            style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
          >
            Claim Your Restaurant
          </button>
          <p className="text-xs mt-3" style={{ color: 'var(--color-text-tertiary)' }}>
            Free to claim · Takes 30 seconds
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 text-center">
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          Powered by What's Good Here — dish-level food discovery for Martha's Vineyard
        </p>
      </div>
    </div>
  )
}

export default RestaurantPitch
