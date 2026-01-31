import { useNavigate } from 'react-router-dom'
import { RARITY_COLORS } from '../../constants/badgeDefinitions'

const CATEGORY_EXAMPLES = [
  { emoji: '🍕', label: 'Pizza' },
  { emoji: '🦞', label: 'Lobster Roll' },
  { emoji: '🍣', label: 'Sushi' },
  { emoji: '🍔', label: 'Burger' },
  { emoji: '🍗', label: 'Wings' },
  { emoji: '🍝', label: 'Pasta' },
]

// Badges info card for homepage — focused on category mastery
export function BadgesInfoCard() {
  const navigate = useNavigate()

  return (
    <section className="mt-8">
      <div
        className="rounded-2xl p-5 overflow-hidden border"
        style={{
          background: 'var(--color-surface-elevated)',
          borderColor: 'var(--color-divider)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-primary)' }}
          >
            <span className="text-xl">🏅</span>
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
              Become a Food Expert
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              41 badges across 4 families
            </p>
          </div>
        </div>

        {/* Category examples */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORY_EXAMPLES.map((cat) => (
            <div
              key={cat.label}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: 'var(--color-bg)' }}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {cat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tier explanation */}
        <div className="flex items-center gap-3 mb-4 px-3 py-2.5 rounded-lg" style={{ background: 'var(--color-bg)' }}>
          <div className="flex gap-1.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{ color: RARITY_COLORS.rare, background: `${RARITY_COLORS.rare}18`, border: `1px solid ${RARITY_COLORS.rare}30` }}
            >
              Specialist
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{ color: RARITY_COLORS.epic, background: `${RARITY_COLORS.epic}18`, border: `1px solid ${RARITY_COLORS.epic}30` }}
            >
              Authority
            </span>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
            Two tiers per category
          </span>
        </div>

        {/* Description */}
        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Category badges require both <strong>volume</strong> and <strong>accuracy</strong> — proving you truly know your stuff. Experts get featured on dish and category pages.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate('/profile')}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--color-primary)', color: 'white' }}
        >
          View Your Progress
        </button>
      </div>
    </section>
  )
}
