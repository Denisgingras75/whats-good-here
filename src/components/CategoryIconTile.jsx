/**
 * CategoryIconTile - Premium category selector with line icons
 *
 * Design: Modern, minimal icon-first tiles for filtering
 * - 64-72px square rounded tiles
 * - Consistent line-style icons
 * - Single selection with warm accent highlight
 */

// Line icons for each category (consistent 24x24 viewBox, strokeWidth 1.5)
const CATEGORY_ICONS = {
  pizza: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 19h20L12 2z" />
      <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  burger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18h16a2 2 0 002-2v-1a2 2 0 00-2-2H4a2 2 0 00-2 2v1a2 2 0 002 2z" />
      <path d="M4 13h16" />
      <path d="M5 9h14a5 5 0 00-14 0z" />
      <path d="M6 13c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0" />
    </svg>
  ),
  taco: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12c0 4.5 3.5 8 8 8s8-3.5 8-8" />
      <path d="M4 12c0-4.5 3.5-8 8-8" />
      <path d="M6 11c1.5 0 2.5 1 4 1s2.5-1 4-1 2.5 1 4 1" />
      <circle cx="8" cy="14" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  wings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4c-3 0-6 2-7 5-1 3 0 6 2 8l3-2" />
      <path d="M12 4c3 0 6 2 7 5 1 3 0 6-2 8l-3-2" />
      <ellipse cx="12" cy="14" rx="3" ry="4" />
      <line x1="12" y1="18" x2="12" y2="21" />
    </svg>
  ),
  sushi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="8" ry="5" />
      <ellipse cx="12" cy="12" rx="5" ry="3" />
      <path d="M7 12h10" />
    </svg>
  ),
  breakfast: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="6" />
      <circle cx="12" cy="10" r="2" />
      <path d="M4 18h16" />
      <path d="M6 18v2h12v-2" />
    </svg>
  ),
  'lobster roll': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14h16a2 2 0 01-2 4H6a2 2 0 01-2-4z" />
      <path d="M5 14c1-3 3-4 7-4s6 1 7 4" />
      <path d="M8 12c.5-1 1.5-1.5 2-1.5" />
      <path d="M16 12c-.5-1-1.5-1.5-2-1.5" />
      <circle cx="10" cy="15" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="14" cy="15" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  seafood: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c2-3 5-5 10-5s8 2 10 5c-2 3-5 5-10 5s-8-2-10-5z" />
      <path d="M20 12l2-2m-2 2l2 2" />
      <circle cx="7" cy="12" r="1" />
      <path d="M12 9v6m-2-4l4 2m-4 0l4-2" />
    </svg>
  ),
  chowder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14a2 2 0 012 2v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2a2 2 0 012-2z" />
      <path d="M8 12V8a4 4 0 018 0v4" />
      <path d="M7 15c1 1 2 1 3 0s2-1 3 0 2 1 3 0" />
    </svg>
  ),
  pasta: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4c0 4 2 6 2 10" />
      <path d="M12 4c0 4 0 6 0 10" />
      <path d="M16 4c0 4-2 6-2 10" />
      <ellipse cx="12" cy="17" rx="6" ry="3" />
      <path d="M6 17v2a6 3 0 0012 0v-2" />
    </svg>
  ),
  steak: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="9" ry="6" />
      <path d="M7 10c1 2 3 3 5 3s4-1 5-3" />
      <ellipse cx="9" cy="12" rx="1.5" ry="1" fill="none" />
      <ellipse cx="15" cy="12" rx="1.5" ry="1" fill="none" />
    </svg>
  ),
  sandwich: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8l8-4 8 4" />
      <path d="M4 8v2l8 4 8-4V8" />
      <path d="M4 14l8 4 8-4" />
      <path d="M4 14v2l8 4 8-4v-2" />
    </svg>
  ),
  salad: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14c0 4 3.5 6 8 6s8-2 8-6" />
      <path d="M4 14h16" />
      <path d="M8 10c-1-2 0-4 2-5" />
      <path d="M12 10c0-2 1-4 3-4" />
      <path d="M16 10c1-2 0-4-2-5" />
      <circle cx="9" cy="16" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="16" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  tendys: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8c-1 3 0 6 2 8l2-1" />
      <path d="M10 7c-1 4 0 7 2 9l2-1" />
      <path d="M14 6c-1 4 0 8 2 10l2-1" />
      <path d="M6 8c1-2 3-3 4-3" />
      <path d="M10 7c1-2 2-3 4-3" />
      <path d="M14 6c1-2 2-2 4-2" />
    </svg>
  ),
}

// Default icon for unknown categories
const DEFAULT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4l2 2" />
  </svg>
)

export function CategoryIconTile({
  category,
  isActive = false,
  onClick,
  size = 'default' // 'default' | 'compact'
}) {
  const icon = CATEGORY_ICONS[category.id] || DEFAULT_ICON

  const sizeClasses = size === 'compact'
    ? 'w-14 h-14'
    : 'w-[68px] h-[68px]'

  const iconSize = size === 'compact' ? 'w-6 h-6' : 'w-7 h-7'

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1.5
        ${sizeClasses}
        rounded-[16px]
        transition-all duration-200
        active:scale-[0.96]
        flex-shrink-0
      `}
      style={{
        background: isActive ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
        border: isActive ? 'none' : '1px solid var(--color-divider)',
      }}
    >
      {/* Icon */}
      <div
        className={iconSize}
        style={{
          color: isActive ? '#1A1A1A' : 'var(--color-text-tertiary)'
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        className="text-[10px] font-medium leading-tight text-center px-1 truncate w-full"
        style={{
          color: isActive ? '#1A1A1A' : 'var(--color-text-tertiary)'
        }}
      >
        {category.label}
      </span>
    </button>
  )
}

/**
 * CategoryIconRow - Horizontal scrollable row of category tiles
 * Use this component for the main category filter UI
 */
export function CategoryIconRow({
  categories,
  selectedCategory,
  onSelect,
  className = ''
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="flex gap-2.5 overflow-x-auto pb-2 px-4 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {categories.map((category) => (
          <CategoryIconTile
            key={category.id}
            category={category}
            isActive={selectedCategory === category.id}
            onClick={() => onSelect(category.id === selectedCategory ? null : category.id)}
          />
        ))}
      </div>

      {/* Fade edges to indicate scrollability */}
      <div
        className="absolute right-0 top-0 bottom-2 w-8 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, transparent, var(--color-surface))'
        }}
      />
    </div>
  )
}

export default CategoryIconTile
