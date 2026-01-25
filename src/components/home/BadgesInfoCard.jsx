import { useNavigate } from 'react-router-dom'

// Badges info card for homepage
export function BadgesInfoCard() {
  const navigate = useNavigate()

  const badges = [
    { icon: '🍽️', name: 'First Bite', desc: 'Rate your first dish' },
    { icon: '🧭', name: 'Food Explorer', desc: 'Rate 10 dishes' },
    { icon: '🏘️', name: 'Neighborhood Explorer', desc: 'Try 3 restaurants' },
    { icon: '🔍', name: 'Local Food Scout', desc: 'Try 10 restaurants', public: true },
    { icon: '👑', name: 'Top 1% Reviewer', desc: 'Rate 125 dishes', public: true },
  ]

  return (
    <section className="mt-8">
      <div
        className="rounded-2xl p-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          border: '1px solid #FED7AA',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-primary)' }}
          >
            <span className="text-xl">🏆</span>
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
              Earn Badges
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Rate dishes to unlock achievements
            </p>
          </div>
        </div>

        {/* Badge preview */}
        <div className="flex flex-wrap gap-2 mb-4">
          {badges.map((badge) => (
            <div
              key={badge.name}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
              style={{
                background: badge.public ? 'rgba(251, 146, 60, 0.2)' : 'white',
                border: badge.public ? '1px solid #FB923C' : '1px solid #E5E7EB',
              }}
              title={badge.desc}
            >
              <span>{badge.icon}</span>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {badge.name}
              </span>
            </div>
          ))}
          <div
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs"
            style={{ background: 'white', border: '1px solid #E5E7EB' }}
          >
            <span style={{ color: 'var(--color-text-tertiary)' }}>+5 more</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Every vote earns progress toward badges. Some badges are just for you,
          while <span className="font-medium" style={{ color: 'var(--color-primary)' }}>prestigious badges</span> show
          on your public profile.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate('/profile')}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--color-primary)', color: 'white' }}
        >
          View Your Achievements →
        </button>
      </div>
    </section>
  )
}
