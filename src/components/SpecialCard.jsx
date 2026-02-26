import { memo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RestaurantAvatar } from './RestaurantAvatar'
import { specialsApi } from '../api/specialsApi'

// Deduplicate views per session — one view per special per page load
const viewedSpecials = new Set()

/**
 * Card displaying a restaurant special/deal
 */
export const SpecialCard = memo(function SpecialCard({ special, promoted }) {
  const navigate = useNavigate()
  const cardRef = useRef(null)
  const {
    id,
    deal_name,
    description,
    price,
    restaurants: restaurant
  } = special

  // Track view when card enters viewport
  useEffect(() => {
    if (!id || viewedSpecials.has(id)) return
    const el = cardRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          viewedSpecials.add(id)
          specialsApi.recordView(id)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [id])

  const handleClick = () => {
    if (restaurant?.id) {
      navigate(`/restaurants/${restaurant.id}`)
    }
  }

  return (
    <button
      ref={cardRef}
      onClick={handleClick}
      className="w-full rounded-xl p-4 text-left card-press"
      style={{
        background: 'var(--color-surface-elevated)',
        border: '2px solid var(--color-card-border)',
        boxShadow: '2px 2px 0px var(--color-card-border)',
      }}
    >
      <div className="flex gap-3">
        {/* Restaurant Avatar */}
        <RestaurantAvatar
          name={restaurant?.name}
          town={restaurant?.town}
          size={48}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Featured badge */}
          {promoted && (
            <span
              className="text-xs font-medium mb-1 inline-block"
              style={{ color: 'var(--color-accent-gold)' }}
            >
              Featured
            </span>
          )}

          {/* Deal Name */}
          <h3 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
            {deal_name}
          </h3>

          {/* Restaurant Name */}
          <p
            className="text-xs mt-0.5 font-medium"
            style={{
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {restaurant?.name}
            {restaurant?.town && ` \u00B7 ${restaurant.town}`}
          </p>

          {/* Description */}
          {description && (
            <p
              className="text-sm mt-2 line-clamp-2"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {description}
            </p>
          )}

          {/* Price */}
          {price && (
            <div className="mt-2">
              <span
                className="inline-block px-2 py-1 rounded-md text-sm font-bold"
                style={{
                  background: 'var(--color-primary-muted)',
                  color: 'var(--color-primary)',
                }}
              >
                ${Number(price).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
})

export default SpecialCard
