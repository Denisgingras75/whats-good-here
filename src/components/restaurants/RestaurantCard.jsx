import { getRatingColor } from '../../utils/ranking'

/**
 * RestaurantCard — reusable card for restaurant list items.
 * Shows name, cuisine, distance, dish count, open/closed, "known for" dish.
 */
export function RestaurantCard({ restaurant, onSelect }) {
  const dishCount = restaurant.dish_count ?? restaurant.dishCount ?? 0
  const distanceMiles = restaurant.distance_miles

  return (
    <button
      onClick={() => onSelect(restaurant)}
      className="w-full rounded-xl p-4 text-left transition-all active:scale-[0.99]"
      style={{
        background: 'var(--color-card)',
        border: '1.5px solid var(--color-divider)',
        borderLeft: '3px solid var(--color-accent-gold)',
        opacity: restaurant.is_open ? 1 : 0.6,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Restaurant info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className="font-bold truncate"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: '15px',
                letterSpacing: '-0.01em',
              }}
            >
              {restaurant.name}
            </h3>
            {/* Distance badge */}
            {distanceMiles != null && (
              <span
                className="flex-shrink-0 px-2 py-0.5 rounded-full font-semibold"
                style={{
                  fontSize: '10px',
                  background: 'var(--color-success-muted)',
                  color: 'var(--color-rating)',
                  border: '1px solid var(--color-success-border)',
                }}
              >
                {distanceMiles} mi
              </span>
            )}
          </div>
          {!restaurant.is_open && (
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-full font-semibold"
              style={{
                fontSize: '10px',
                background: 'var(--color-primary-muted)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-glow)',
              }}
            >
              Closed for Season
            </span>
          )}
          {/* Cuisine + dish count */}
          <p
            className="mt-1 font-medium"
            style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}
          >
            {restaurant.cuisine && (
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {restaurant.cuisine}
                {' · '}
              </span>
            )}
            {dishCount} {dishCount === 1 ? 'dish' : 'dishes'}
          </p>
          {restaurant.knownFor && (
            <p
              className="mt-0.5 font-medium"
              style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}
            >
              Known for{' '}
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {restaurant.knownFor.name}
              </span>
              {' · '}
              <span
                className="font-bold"
                style={{ color: getRatingColor(restaurant.knownFor.rating) }}
              >
                {restaurant.knownFor.rating}
              </span>
            </p>
          )}
        </div>

        {/* Chevron */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </button>
  )
}
