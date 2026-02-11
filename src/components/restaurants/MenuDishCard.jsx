import { useNavigate } from 'react-router-dom'
import { getCategoryImage } from '../../constants/categoryImages'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'

// Compact vertical card for horizontal-scrolling menu sections
export function MenuDishCard({ dish }) {
  const navigate = useNavigate()
  const {
    dish_id,
    dish_name,
    category,
    photo_url,
    price,
    total_votes,
    percent_worth_it,
    avg_rating,
    has_variants,
    best_variant_rating,
  } = dish

  const imgSrc = photo_url || getCategoryImage(category)
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING
  const votes = total_votes || 0
  const displayRating = (has_variants && best_variant_rating) ? best_variant_rating : avg_rating

  return (
    <button
      onClick={() => navigate(`/dish/${dish_id}`)}
      className="flex-shrink-0 rounded-xl text-left transition-all active:scale-[0.97]"
      style={{
        width: '152px',
        background: 'var(--color-bg)',
        border: '1px solid var(--color-divider)',
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
      }}
    >
      {/* Photo */}
      <div
        className="w-full overflow-hidden"
        style={{ height: '100px', background: 'var(--color-surface)' }}
      >
        <img
          src={imgSrc}
          alt={dish_name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h4
          className="font-bold truncate"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            letterSpacing: '-0.01em',
          }}
        >
          {dish_name}
        </h4>

        <div className="flex items-center justify-between mt-1.5">
          {price && (
            <span className="font-medium" style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
              ${Number(price).toFixed(0)}
            </span>
          )}
          {isRanked ? (
            <div className="flex items-center gap-1">
              <span
                className="font-bold"
                style={{ color: getRatingColor(displayRating), fontSize: '14px' }}
              >
                {displayRating}
              </span>
              <span className="font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>
                · {votes}
              </span>
            </div>
          ) : (
            <span className="font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>
              {votes > 0 ? `${votes} vote${votes === 1 ? '' : 's'}` : 'New'}
            </span>
          )}
        </div>

        {isRanked && (
          <div className="mt-1">
            <span className="font-semibold" style={{ color: 'var(--color-success)', fontSize: '11px' }}>
              {Math.round(percent_worth_it)}% would reorder
            </span>
          </div>
        )}
      </div>
    </button>
  )
}
