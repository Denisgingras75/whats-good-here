import { useMemo } from 'react'
import { getCategoryEmoji } from '../../constants/categories'
import { calculateDistance } from '../../utils/distance'

export function TopDishesNearYou({ dishes, userLocation, onSelectDish }) {
  const topDishes = useMemo(() => {
    if (!dishes || dishes.length === 0) return []
    const seen = {}
    const result = []
    for (let i = 0; i < dishes.length && result.length < 8; i++) {
      const d = dishes[i]
      if (seen[d.restaurant_id]) continue
      seen[d.restaurant_id] = true

      let distance = null
      if (userLocation?.lat && userLocation?.lng && d.restaurant_lat && d.restaurant_lng) {
        distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          d.restaurant_lat, d.restaurant_lng
        ).toFixed(1)
      }

      result.push({ ...d, distance })
    }
    return result
  }, [dishes, userLocation])

  if (topDishes.length === 0) return null

  return (
    <section className="mb-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: 'linear-gradient(180deg, var(--color-accent-gold) 0%, var(--color-accent-orange) 100%)' }}
        />
        <h2
          className="font-bold"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '16px',
            letterSpacing: '-0.01em',
          }}
        >
          Top dishes near you
        </h2>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {topDishes.map(dish => (
          <button
            key={dish.dish_id}
            onClick={() => onSelectDish(dish.dish_id)}
            className="flex-shrink-0 rounded-xl p-3 transition-all active:scale-[0.97]"
            style={{
              width: '160px',
              scrollSnapAlign: 'start',
              background: 'var(--color-card)',
              border: '1px solid var(--color-divider)',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: '24px' }}>{getCategoryEmoji(dish.category)}</span>
              <span
                className="font-bold"
                style={{ fontSize: '15px', color: 'var(--color-rating)' }}
              >
                {dish.avg_rating != null ? Number(dish.avg_rating).toFixed(1) : '--'}
              </span>
            </div>
            <p
              className="font-semibold truncate"
              style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}
            >
              {dish.dish_name}
            </p>
            <p
              className="truncate mt-0.5"
              style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}
            >
              {dish.restaurant_name}
            </p>
            {dish.distance && (
              <p className="mt-1" style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                {dish.distance} mi away
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
