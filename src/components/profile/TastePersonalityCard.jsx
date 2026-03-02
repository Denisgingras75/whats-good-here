var PERSONALITY_CONFIG = {
  newcomer: { color: 'var(--color-text-tertiary)', icon: '\uD83C\uDF31', bg: 'var(--color-surface-elevated)' },
  explorer: { color: 'var(--color-primary)', icon: '\uD83E\uDDED', bg: 'var(--color-primary-muted, rgba(59, 130, 246, 0.1))' },
  loyal_regular: { color: 'var(--color-accent-gold)', icon: '\uD83C\uDFE0', bg: 'var(--color-accent-gold-muted)' },
  selective_critic: { color: 'var(--color-red)', icon: '\uD83E\uDDD0', bg: 'var(--color-danger-muted, rgba(239, 68, 68, 0.1))' },
  comfort_seeker: { color: 'var(--color-orange)', icon: '\u2615', bg: 'var(--color-accent-orange-muted, rgba(249, 115, 22, 0.1))' },
  adventurous: { color: 'var(--color-emerald)', icon: '\uD83C\uDF36\uFE0F', bg: 'var(--color-success-muted, rgba(16, 185, 129, 0.1))' },
  balanced: { color: 'var(--color-accent-gold)', icon: '\u2696\uFE0F', bg: 'var(--color-accent-gold-muted)' },
}

export function TastePersonalityCard({ stats }) {
  if (!stats) return null

  var config = PERSONALITY_CONFIG[stats.personality_type] || PERSONALITY_CONFIG.balanced

  return (
    <div className="px-4 pt-3">
      <div
        className="rounded-2xl border p-4"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
      >
        {/* Personality header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: config.bg, fontSize: '24px' }}
          >
            {config.icon}
          </div>
          <div>
            <p
              className="font-bold"
              style={{ color: config.color, fontSize: '16px', letterSpacing: '-0.01em' }}
            >
              {stats.personality_label}
            </p>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
              Dining personality
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatPill label="Dishes" value={stats.total_dishes_tried} />
          <StatPill label="Spots" value={stats.total_restaurants} />
          <StatPill label="Categories" value={stats.unique_categories} />
        </div>

        {/* Secondary stats */}
        <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--color-divider)' }}>
          {stats.monthly_avg > 0 && (
            <div>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>
                {stats.monthly_avg}
              </span>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}> /mo</span>
            </div>
          )}
          {stats.streak_days > 0 && (
            <div>
              <span className="font-bold" style={{ color: 'var(--color-accent-gold)', fontSize: '14px' }}>
                {stats.streak_days}d
              </span>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}> streak</span>
            </div>
          )}
          {stats.worth_it_ratio > 0 && (
            <div>
              <span className="font-bold" style={{ color: 'var(--color-emerald)', fontSize: '14px' }}>
                {Math.round(stats.worth_it_ratio * 100)}%
              </span>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}> worth it</span>
            </div>
          )}
        </div>

        {/* Top picks */}
        {(stats.top_category || stats.top_restaurant) && (
          <div className="flex gap-4 mt-2">
            {stats.top_category && (
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                Fave: <span className="capitalize" style={{ color: 'var(--color-text-secondary)' }}>{stats.top_category}</span>
              </p>
            )}
            {stats.top_restaurant && (
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                Home base: <span style={{ color: 'var(--color-text-secondary)' }}>{stats.top_restaurant}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatPill({ label, value }) {
  return (
    <div
      className="rounded-xl py-2 px-3 text-center"
      style={{ background: 'var(--color-surface-elevated)' }}
    >
      <p className="font-bold" style={{ color: 'var(--color-text-primary)', fontSize: '16px' }}>
        {value || 0}
      </p>
      <p style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>{label}</p>
    </div>
  )
}

export default TastePersonalityCard
