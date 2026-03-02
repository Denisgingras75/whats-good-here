import { memo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RestaurantAvatar } from './RestaurantAvatar'
import { specialsApi } from '../api/specialsApi'

// Deduplicate views per session — one view per special per page load
const viewedSpecials = new Set()

/**
 * Card displaying a restaurant special/deal
 */
function getTimeRemaining(expiresAt) {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return null
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 24) return `${Math.floor(hours / 24)}d left`
  if (hours > 0) return `${hours}h ${mins}m left`
  return `${mins}m left`
}

export const SpecialCard = memo(function SpecialCard({ special, promoted }) {
  const navigate = useNavigate()
  const cardRef = useRef(null)
  const {
    id,
    deal_name,
    description,
    price,
    expires_at,
    restaurants: restaurant
  } = special
  const timeLeft = getTimeRemaining(expires_at)

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

          {/* Price + Countdown */}
          <div className="flex items-center gap-2 mt-2">
            {price && (
              <span
                className="inline-block px-2 py-1 rounded-md text-sm font-bold"
                style={{
                  background: 'var(--color-primary-muted)',
                  color: 'var(--color-primary)',
                }}
              >
                ${Number(price).toFixed(2)}
              </span>
            )}
            {timeLeft && (
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--color-accent-orange)' }}
              >
                {timeLeft}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
})

export default SpecialCard
