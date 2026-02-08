/**
 * StreakBadge - Small inline badge showing streak count
 * Used in headers, leaderboard rows, etc.
 */
export function StreakBadge({ streak, status = 'active', size = 'sm' }) {
  if (!streak || streak <= 0) return null

  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1',
  }

  const statusStyles = {
    active: {
      background: 'linear-gradient(135deg, var(--color-orange) 0%, #EA580C 100%)',
      boxShadow: '0 0 8px rgba(249, 115, 22, 0.4)',
    },
    at_risk: {
      background: 'linear-gradient(135deg, var(--color-amber-light) 0%, var(--color-amber) 100%)',
      boxShadow: '0 0 6px rgba(251, 191, 36, 0.3)',
    },
    broken: {
      background: 'var(--color-text-tertiary)',
      boxShadow: 'none',
    },
  }

  const style = statusStyles[status] || statusStyles.active

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-semibold text-white ${sizes[size]}`}
      style={style}
    >
      <span className={status === 'active' ? 'animate-pulse' : ''}>
        {status === 'at_risk' ? '⚠️' : '🔥'}
      </span>
      <span>{streak}</span>
    </span>
  )
}
