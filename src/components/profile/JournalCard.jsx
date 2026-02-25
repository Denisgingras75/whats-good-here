import { Link } from 'react-router-dom'
import { getRatingColor, formatScore10 } from '../../utils/ranking'
import { CategoryIcon } from '../home/CategoryIcons'

/**
 * JournalCard — a single entry in the food journal feed.
 *
 * Props:
 *   dish     - dish data object
 *   variant  - 'good-here' | 'not-good-here' | 'heard'
 *   onTriedIt - callback for heard variant CTA
 */
export function JournalCard({ dish, variant = 'good-here', onTriedIt }) {
  var dishName = dish.dish_name || dish.name
  var restaurantName = dish.restaurant_name
  var town = dish.restaurant_town
  var dishId = dish.dish_id || dish.id
  var categoryId = dish.category
  var photoUrl = dish.photo_url

  // Timestamp formatting
  var timestamp = dish.voted_at || dish.saved_at
  var timeLabel = ''
  if (timestamp) {
    var date = new Date(timestamp)
    var now = new Date()
    var diffMs = now - date
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) {
      timeLabel = 'Today'
    } else if (diffDays === 1) {
      timeLabel = 'Yesterday'
    } else if (diffDays < 7) {
      timeLabel = diffDays + ' days ago'
    } else {
      timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  // Heard variant — no link wrapper, CTA is primary action
  if (variant === 'heard') {
    return (
      <div
        data-testid="journal-card"
        className="flex items-start gap-3 p-3 rounded-xl"
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-divider)',
        }}
      >
        {/* Thumbnail */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--color-category-strip)' }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <CategoryIcon categoryId={categoryId} dishName={dishName} size={28} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div
            className="font-bold truncate"
            style={{ color: 'var(--color-text-primary)', fontSize: '15px' }}
          >
            {dishName}
          </div>
          <div
            className="truncate"
            style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}
          >
            {restaurantName} · {town}
          </div>
          {timeLabel && (
            <div style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }} className="mt-0.5">
              {timeLabel}
            </div>
          )}
          <button
            onClick={function (e) {
              e.stopPropagation()
              if (onTriedIt) onTriedIt(dish)
            }}
            className="mt-2 px-4 py-1.5 rounded-full font-semibold text-sm"
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-text-on-primary)',
              fontSize: '13px',
            }}
          >
            Tried it?
          </button>
        </div>
      </div>
    )
  }

  // Good Here / Not Good Here variants
  var isMuted = variant === 'not-good-here'
  var rating = dish.rating_10
  var communityAvg = dish.community_avg
  var reviewText = dish.review_text

  return (
    <Link
      to={'/dish/' + dishId}
      data-testid="journal-card"
      className="flex items-start gap-3 p-3 rounded-xl no-underline"
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-divider)',
        opacity: isMuted ? '0.75' : '1',
        display: 'flex',
        textDecoration: 'none',
      }}
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--color-category-strip)' }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <CategoryIcon categoryId={categoryId} dishName={dishName} size={28} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div
            className="font-bold truncate"
            style={{ color: 'var(--color-text-primary)', fontSize: '15px' }}
          >
            {dishName}
          </div>
          {rating != null && (
            <div className="flex items-baseline gap-1.5 flex-shrink-0">
              <span
                className="font-bold"
                style={{ color: getRatingColor(rating), fontSize: '18px' }}
              >
                {formatScore10(rating)}
              </span>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>/10</span>
            </div>
          )}
        </div>
        <div
          className="truncate"
          style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}
        >
          {restaurantName} · {town}
        </div>
        {communityAvg != null && (
          <div style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }} className="mt-0.5">
            Crowd: {formatScore10(communityAvg)}
          </div>
        )}
        {reviewText && (
          <div
            className="mt-1"
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {reviewText}
          </div>
        )}
        {timeLabel && (
          <div style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }} className="mt-1">
            {timeLabel}
          </div>
        )}
      </div>
    </Link>
  )
}
