import { BROWSE_CATEGORIES } from '../constants/categories'

/**
 * CategoryChips — horizontal scrollable category filter.
 *
 * Props:
 *   categories   - array of { id, label, emoji } (default: BROWSE_CATEGORIES)
 *   selected     - currently selected category id (null = "All")
 *   onSelect     - callback(categoryId | null)
 *   showAll      - show "All" chip (default: true)
 *   sticky       - add sticky positioning (default: false)
 *   maxVisible   - max categories to show (default: 12)
 */
export function CategoryChips({
  categories = BROWSE_CATEGORIES,
  selected = null,
  onSelect,
  showAll = true,
  sticky = false,
  maxVisible = 12,
}) {
  var visibleCategories = categories.slice(0, maxVisible)

  return (
    <div
      className={sticky ? 'sticky top-0 z-10 pb-2' : 'pb-2'}
      style={sticky ? { background: 'var(--color-surface-elevated)' } : undefined}
    >
      <div
        className="flex gap-2 px-4 overflow-x-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* "All" chip */}
        {showAll && (
          <button
            onClick={function () { onSelect(null) }}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-full font-semibold"
            style={{
              padding: '10px 16px',
              minHeight: '44px',
              fontSize: '14px',
              background: selected === null ? 'var(--color-text-primary)' : 'var(--color-surface)',
              color: selected === null ? 'var(--color-surface-elevated)' : 'var(--color-text-secondary)',
              border: selected === null ? '1.5px solid var(--color-text-primary)' : '1.5px solid var(--color-divider)',
            }}
          >
            All
          </button>
        )}

        {visibleCategories.map(function (cat) {
          var isActive = selected === cat.id
          return (
            <button
              key={cat.id}
              onClick={function () { onSelect(isActive ? null : cat.id) }}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-full font-semibold"
              style={{
                padding: '10px 14px',
                minHeight: '44px',
                fontSize: '14px',
                background: isActive ? 'var(--color-text-primary)' : 'var(--color-surface)',
                color: isActive ? 'var(--color-surface-elevated)' : 'var(--color-text-secondary)',
                border: isActive ? '1.5px solid var(--color-text-primary)' : '1.5px solid var(--color-divider)',
              }}
            >
              <span style={{ fontSize: '16px' }}>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryChips
