import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getCategoryEmoji } from '../constants/categories'
import { ScorePill } from './ScorePill'

/**
 * DishListItem — unified ranked dish row used across Home, Browse, Restaurant.
 *
 * Props:
 *   dish        - dish object (dish_id, dish_name, restaurant_name, avg_rating, total_votes, etc.)
 *   rank        - number (display rank)
 *   showDistance - boolean (show distance in subtitle)
 *   onClick     - optional override (defaults to navigate to /dish/:id)
 *   variant     - 'default' | 'restaurant' (future: restaurant context)
 *   className   - extra classes
 */
export var DishListItem = memo(function DishListItem({ dish, rank, showDistance, onClick, variant, className }) {
  var navigate = useNavigate()
  var isRanked = (dish.total_votes || 0) >= MIN_VOTES_FOR_RANKING
  var emoji = getCategoryEmoji(dish.category)
  var isTop3 = rank && rank <= 3

  var handleClick = onClick || function () {
    navigate('/dish/' + dish.dish_id)
  }

  return (
    <button
      data-dish-id={dish.dish_id}
      onClick={handleClick}
      className={'w-full flex items-center gap-3 py-3 px-3 rounded-xl card-press text-left' + (className ? ' ' + className : '')}
      style={{
        background: isTop3 ? 'var(--color-surface)' : 'transparent',
        minHeight: '48px',
        cursor: 'pointer',
      }}
    >
      {/* Rank badge */}
      {rank != null && (
        <span
          className="flex-shrink-0 font-bold"
          style={{
            width: '28px',
            textAlign: 'center',
            fontSize: isTop3 ? '18px' : '14px',
            color: rank === 1
              ? 'var(--color-accent-gold)'
              : isTop3
                ? 'var(--color-text-primary)'
                : 'var(--color-text-tertiary)',
            fontWeight: 800,
          }}
        >
          {rank}
        </span>
      )}

      {/* Category emoji */}
      <span className="flex-shrink-0" style={{ fontSize: '24px' }}>{emoji}</span>

      {/* Name + restaurant + distance */}
      <div className="flex-1 min-w-0">
        <p
          className="font-bold truncate"
          style={{
            fontSize: '15px',
            color: 'var(--color-text-primary)',
            lineHeight: 1.3,
          }}
        >
          {dish.dish_name}
        </p>
        <p
          className="truncate"
          style={{
            fontSize: '12px',
            color: 'var(--color-text-tertiary)',
            marginTop: '1px',
          }}
        >
          {dish.restaurant_name}
          {showDistance && dish.distance_miles != null
            ? ' \u00b7 ' + Number(dish.distance_miles).toFixed(1) + ' mi'
            : ''}
          {dish.price != null ? ' \u00b7 $' + Number(dish.price).toFixed(0) : ''}
        </p>
      </div>

      {/* Rating via ScorePill */}
      <div className="flex-shrink-0">
        {isRanked ? (
          <ScorePill score={dish.avg_rating} size="sm" />
        ) : (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              fontWeight: 500,
            }}
          >
            {dish.total_votes ? dish.total_votes + ' vote' + (dish.total_votes === 1 ? '' : 's') : 'New'}
          </span>
        )}
      </div>
    </button>
  )
})
