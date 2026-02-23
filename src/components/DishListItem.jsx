import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRatingColor, formatScore10, getScoreBg } from '../utils/ranking'

/**
 * DishListItem — bold leaderboard row. Score is the visual hero.
 *
 * Layout: [Rank Circle] [Score Block] [Name + Restaurant + Context]
 * Top 3 get filled medal circles + left accent bar + surface bg.
 *
 * Props:
 *   dish        - dish object
 *   rank        - number (display rank)
 *   showDistance - boolean
 *   onClick     - optional override
 *   variant     - 'default' | 'restaurant'
 *   className   - extra classes
 */
export var DishListItem = memo(function DishListItem({ dish, rank, showDistance, onClick, variant, className }) {
  var navigate = useNavigate()
  var isRanked = (dish.total_votes || 0) >= MIN_VOTES_FOR_RANKING
  var isTop3 = rank && rank <= 3
  var votes = dish.total_votes || 0

  var handleClick = onClick || function () {
    navigate('/dish/' + dish.dish_id)
  }

  // Medal colors for top 3, subtle for rest
  var rankBg = rank === 1 ? 'var(--color-medal-gold)'
    : rank === 2 ? 'var(--color-medal-silver)'
    : rank === 3 ? 'var(--color-medal-bronze)'
    : 'transparent'

  var rankText = isTop3 ? 'var(--color-bg)' : 'var(--color-text-tertiary)'

  // Left accent bar color for top 3
  var accentColor = rank === 1 ? 'var(--color-medal-gold)'
    : rank === 2 ? 'var(--color-medal-silver)'
    : rank === 3 ? 'var(--color-medal-bronze)'
    : 'transparent'

  // Build subtitle parts
  var subtitleParts = [dish.restaurant_name]
  if (showDistance && dish.distance_miles != null) {
    subtitleParts.push(Number(dish.distance_miles).toFixed(1) + ' mi')
  }
  if (dish.price != null) {
    subtitleParts.push('$' + Number(dish.price).toFixed(0))
  }
  if (isRanked && votes > 0) {
    subtitleParts.push(votes + ' vote' + (votes === 1 ? '' : 's'))
  }

  return (
    <button
      data-dish-id={dish.dish_id}
      onClick={handleClick}
      className={'w-full flex items-center gap-3 py-3 text-left card-press' + (className ? ' ' + className : '')}
      style={{
        background: isTop3 ? 'var(--color-surface-elevated)' : 'transparent',
        minHeight: '56px',
        cursor: 'pointer',
        borderRadius: isTop3 ? '10px' : '0',
        borderTop: isTop3 ? '2px solid var(--color-card-border)' : 'none',
        borderRight: isTop3 ? '2px solid var(--color-card-border)' : 'none',
        borderBottom: '2px solid var(--color-card-border)',
        borderLeft: isTop3 ? '4px solid ' + accentColor : 'none',
        paddingLeft: '12px',
        paddingRight: '12px',
      }}
    >
      {/* Rank — filled circle for top 3, plain number for rest */}
      {rank != null && (
        <span
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: isTop3 ? '30px' : '28px',
            height: isTop3 ? '30px' : '28px',
            borderRadius: isTop3 ? '50%' : '0',
            background: rankBg,
            fontSize: isTop3 ? '14px' : '15px',
            color: rankText,
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          {rank}
        </span>
      )}

      {/* Score block — THE VISUAL HERO */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: '50px',
          height: '40px',
          borderRadius: '10px',
          background: isRanked ? getScoreBg(dish.avg_rating) : 'var(--color-surface)',
        }}
      >
        {isRanked ? (
          <span
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: getRatingColor(dish.avg_rating),
              letterSpacing: '-0.03em',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatScore10(dish.avg_rating)}
          </span>
        ) : (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-tertiary)',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {votes > 0 ? votes : 'NEW'}
          </span>
        )}
      </div>

      {/* Name + restaurant + context */}
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
          className="truncate font-medium"
          style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            marginTop: '3px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {subtitleParts.join(' \u00b7 ')}
        </p>
      </div>
    </button>
  )
})
