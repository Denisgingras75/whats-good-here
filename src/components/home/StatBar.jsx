import { usePlatformStats } from '../../hooks/usePlatformStats'

export function StatBar() {
  var { stats, loading } = usePlatformStats()

  if (loading || !stats) return null

  var items = [
    { value: stats.dish_count, label: 'dishes rated' },
    { value: stats.restaurant_count, label: 'restaurants' },
    { value: stats.vote_count, label: 'local votes' }
  ]

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2"
      style={{ gap: '6px' }}
    >
      {items.map(function (item, i) {
        return (
          <span key={item.label} className="flex items-center" style={{ gap: '6px' }}>
            {i > 0 && (
              <span
                style={{
                  color: 'var(--color-text-tertiary)',
                  fontSize: '10px',
                  opacity: 0.5
                }}
              >
                ·
              </span>
            )}
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <span
                style={{
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  fontSize: '14px'
                }}
              >
                {item.value}
              </span>
              {' '}{item.label}
            </span>
          </span>
        )
      })}
    </div>
  )
}

export default StatBar
