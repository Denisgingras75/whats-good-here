import { useNavigate } from 'react-router-dom'
import { CategoryIcon } from '../CategoryIcon'

/**
 * Compact Identity Snapshot - category tiers without progress bars
 * Shows up to 3 category tiers or progress items
 *
 * Props:
 * - categoryTiers: Array of achieved tiers
 * - categoryProgress: Array of categories progressing toward next tier
 */
export function IdentitySnapshot({ categoryTiers, categoryProgress }) {
  const navigate = useNavigate()

  // Combine current tiers with "near" tiers from progress
  const getDisplayRows = () => {
    const rows = []

    // Add current tiers first (up to 3)
    categoryTiers.slice(0, 3).forEach(tier => {
      rows.push({
        categoryId: tier.category,
        categoryLabel: tier.label,
        tier: tier.title,
        tierIcon: tier.icon,
        isNear: false,
      })
    })

    // If we have room, add "near" tiers from progress
    if (rows.length < 3 && categoryProgress.length > 0) {
      categoryProgress.slice(0, 3 - rows.length).forEach(prog => {
        // Only add if not already in rows
        if (!rows.find(r => r.categoryLabel === prog.label)) {
          rows.push({
            categoryId: prog.category,
            categoryLabel: prog.label,
            tier: `Near ${prog.nextTier.title}`,
            tierIcon: prog.nextTier.icon,
            isNear: true,
          })
        }
      })
    }

    return rows.slice(0, 3)
  }

  const displayRows = getDisplayRows()

  if (displayRows.length === 0) return null

  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
      <div className="space-y-2">
        {displayRows.map((row, idx) => (
          <button
            key={idx}
            onClick={() => navigate('/badges')}
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-colors hover:bg-[color:var(--color-surface-elevated)]"
          >
            <div className="flex items-center gap-3">
              <CategoryIcon category={row.categoryId} size={24} />
              <span className="font-medium text-[color:var(--color-text-primary)]">{row.categoryLabel}</span>
              <span className="text-[color:var(--color-text-tertiary)]">\u00B7</span>
              <span
                className={`font-semibold ${row.isNear ? 'text-[color:var(--color-text-secondary)]' : ''}`}
                style={!row.isNear ? { color: 'var(--color-primary)' } : undefined}
              >
                {row.tierIcon} {row.tier}
              </span>
            </div>
            <svg className="w-4 h-4 text-[color:var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

export default IdentitySnapshot
