import { useNavigate } from 'react-router-dom'

export function GuideCard({ guide, dishes }) {
  const navigate = useNavigate()
  const preview = (dishes || []).slice(0, 3)

  const handleTap = () => {
    if (guide.category) {
      navigate('/?category=' + encodeURIComponent(guide.category))
    } else {
      navigate('/')
    }
  }

  return (
    <button
      onClick={handleTap}
      className="w-full rounded-xl p-4 transition-all active:scale-[0.98]"
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-divider)',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span style={{ fontSize: '28px' }}>{guide.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            className="font-bold"
            style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}
          >
            {guide.title}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
            {guide.subtitle}
          </p>
        </div>
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {preview.length > 0 && (
        <div className="space-y-1" style={{ marginLeft: '40px' }}>
          {preview.map((dish, i) => (
            <div
              key={dish.dish_id || dish.dish_name || i}
              className="flex items-center justify-between"
              style={{ fontSize: '12px' }}
            >
              <span
                className="truncate"
                style={{ color: 'var(--color-text-secondary)', maxWidth: '70%' }}
              >
                {i + 1}. {dish.dish_name}
                <span style={{ color: 'var(--color-text-tertiary)' }}>{' \u2014 '}{dish.restaurant_name}</span>
              </span>
              <span
                className="font-semibold flex-shrink-0"
                style={{ color: 'var(--color-rating)' }}
              >
                {dish.avg_rating != null ? Number(dish.avg_rating).toFixed(1) : '--'}
              </span>
            </div>
          ))}
        </div>
      )}
    </button>
  )
}
