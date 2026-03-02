import { Link } from 'react-router-dom'
import { CategoryIcon } from '../home/CategoryIcons'
import { getRatingColor, formatScore10 } from '../../utils/ranking'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  var date = new Date(dateStr)
  var now = new Date()
  var diffMs = now - date
  var diffMins = Math.floor(diffMs / (1000 * 60))
  if (diffMins < 60) return diffMins + 'm ago'
  var diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return diffHours + 'h ago'
  var diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return diffDays + 'd ago'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function FriendsFeed({ feed, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map(function (i) {
          return (
            <div
              key={i}
              className="h-20 rounded-xl animate-pulse"
              style={{ background: 'var(--color-surface-elevated)' }}
            />
          )
        })}
      </div>
    )
  }

  if (!feed || feed.length === 0) {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
      >
        <p
          className="font-semibold"
          style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}
        >
          No friend activity yet
        </p>
        <p className="mt-1" style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
          Follow people to see what they're eating
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {feed.map(function (entry) {
        return (
          <div
            key={entry.entry_id}
            className="rounded-xl border p-3"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
          >
            {/* User + time */}
            <div className="flex items-center justify-between mb-2">
              <Link
                to={'/user/' + entry.user_id}
                className="font-bold text-sm no-underline"
                style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
              >
                {entry.user_display_name || 'Someone'}
              </Link>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>
                {timeAgo(entry.logged_at)}
              </span>
            </div>

            {/* Dish info */}
            <Link
              to={'/dish/' + entry.dish_id}
              className="flex items-center gap-3 no-underline"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--color-category-strip)' }}
              >
                {entry.dish_photo_url ? (
                  <img src={entry.dish_photo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <CategoryIcon categoryId={entry.dish_category} dishName={entry.dish_name} size={22} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="font-bold truncate"
                    style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}
                  >
                    {entry.dish_name}
                  </span>
                  {entry.rating_10 != null && (
                    <span
                      className="font-bold flex-shrink-0"
                      style={{ color: getRatingColor(entry.rating_10), fontSize: '15px' }}
                    >
                      {formatScore10(entry.rating_10)}
                    </span>
                  )}
                </div>
                <span
                  className="truncate block"
                  style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}
                >
                  {entry.restaurant_name}
                  {entry.would_order_again === true && ' \u00b7 Would order again'}
                  {entry.would_order_again === false && ' \u00b7 Wouldn\'t order again'}
                </span>
              </div>
            </Link>

            {/* Review snippet */}
            {(entry.review_text || entry.note) && (
              <p
                className="mt-2 pl-13"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '13px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  paddingLeft: '52px',
                }}
              >
                {entry.review_text || entry.note}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default FriendsFeed
