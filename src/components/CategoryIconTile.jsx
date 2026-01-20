/**
 * CategoryIconTile - Premium category selector with line icons
 *
 * Design: Modern, minimal icon-first tiles for filtering
 * - 64-72px square rounded tiles
 * - Consistent line-style icons
 * - Single selection with warm accent highlight
 */

// Line icons for each category - warm orange style matching inspiration
// Consistent 24x24 viewBox, strokeWidth 1.5, rounded caps/joins
const CATEGORY_ICONS = {
  pizza: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Pizza slice - angled with crust and pepperoni */}
      <path d="M5 5c5-2 10-1 14 3L8 19c-4-4-5-9-3-14z" />
      <path d="M5 5c1.5 0.5 3 1.5 4 3" />
      <circle cx="11" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="8" cy="14" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="13" cy="14" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  burger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Stacked burger */}
      <path d="M5 8c0-2.5 3-5 7-5s7 2.5 7 5" />
      <path d="M5 8h14" />
      <path d="M4 11h16" />
      <path d="M5 11c0 0 1 1.5 3 1.5s3-1.5 4-1.5 2 1.5 4 1.5 3-1.5 3-1.5" />
      <path d="M4 14h16" />
      <path d="M5 17h14c0 0 0 2-7 2s-7-2-7-2z" />
      <path d="M5 14v3" />
      <path d="M19 14v3" />
    </svg>
  ),
  taco: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Taco with filling */}
      <path d="M3 14c0 5 4 7 9 7s9-2 9-7" />
      <path d="M3 14c0-6 4-10 9-10s9 4 9 10" />
      <path d="M6 12c1 0 2 1 3 1s2-1 3-1 2 1 3 1 2-1 3-1" />
      <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  wings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Chicken drumstick */}
      <ellipse cx="10" cy="8" rx="6" ry="5" />
      <path d="M14 12c2 2 3 5 3 8" />
      <path d="M17 20h-2" />
      <path d="M6 10c-1 1-2 3-1 5" />
      <circle cx="8" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="9" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  sushi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Two sushi rolls */}
      <ellipse cx="8" cy="12" rx="5" ry="6" />
      <ellipse cx="8" cy="12" rx="2" ry="3" />
      <ellipse cx="17" cy="12" rx="4" ry="5" />
      <ellipse cx="17" cy="12" rx="1.5" ry="2.5" />
    </svg>
  ),
  breakfast: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Eggs and bacon */}
      <ellipse cx="9" cy="10" rx="5" ry="4" />
      <ellipse cx="9" cy="10" rx="2" ry="1.5" fill="currentColor" stroke="none" />
      <ellipse cx="16" cy="9" rx="3" ry="2.5" />
      <ellipse cx="16" cy="9" rx="1" ry="0.8" fill="currentColor" stroke="none" />
      <path d="M5 17c2 1 4 1.5 6 0" />
      <path d="M13 18c2 1 4 0.5 6-1" />
      <path d="M6 19c2 1 4 1 5 0" />
    </svg>
  ),
  'lobster roll': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Hot dog style roll with lobster chunks */}
      <path d="M4 13c0-3 3-5 8-5s8 2 8 5" />
      <path d="M4 13c0 3 3 5 8 5s8-2 8-5" />
      <path d="M4 13h16" />
      <path d="M7 10c1-1 2-1 3 0" />
      <path d="M14 10c1-1 2-1 3 0" />
      <circle cx="8" cy="15" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="15" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  seafood: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Shrimp */}
      <path d="M6 8c-2 0-3 2-2 4s3 4 6 5c3 1 7 0 9-2s2-5 0-7" />
      <path d="M17 8c-2-2-5-2-7 0s-3 5-2 7" />
      <path d="M6 8c0-2 1-3 2-4" />
      <path d="M6 8c-1-1-1-3 0-4" />
      <circle cx="8" cy="9" r="1" fill="currentColor" stroke="none" />
      <path d="M19 15l2 1" />
      <path d="M19 17l2 0" />
      <path d="M18 19l1 1" />
    </svg>
  ),
  chowder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Steaming bowl */}
      <path d="M4 12h16" />
      <path d="M5 12c0 5 3 8 7 8s7-3 7-8" />
      <path d="M8 6c0-1 1-2 1-2s1 1 0 2 1 2 1 2" />
      <path d="M12 5c0-1 1-2 1-2s1 1 0 2 1 2 1 2" />
      <path d="M16 6c0-1 1-2 1-2s1 1 0 2 1 2 1 2" />
    </svg>
  ),
  pasta: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Fork with spaghetti twirl */}
      <path d="M12 3v5" />
      <path d="M9 3v4" />
      <path d="M15 3v4" />
      <path d="M9 7c0 2 1 3 3 3s3-1 3-3" />
      <ellipse cx="12" cy="14" rx="6" ry="4" />
      <path d="M8 13c1 1 2 2 4 2s3-1 4-2" />
      <path d="M12 10v8" />
      <path d="M12 18v3" />
    </svg>
  ),
  steak: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* T-bone steak */}
      <path d="M4 10c0-3 3-6 8-6s8 3 8 6c0 4-3 8-8 10-5-2-8-6-8-10z" />
      <path d="M12 4v16" />
      <path d="M8 10h8" />
      <ellipse cx="8" cy="13" rx="2" ry="1.5" />
      <ellipse cx="16" cy="12" rx="2" ry="1.5" />
    </svg>
  ),
  sandwich: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Layered sub sandwich */}
      <path d="M3 10c0-3 4-6 9-6s9 3 9 6" />
      <path d="M3 10h18" />
      <path d="M4 13h16" />
      <path d="M3 13c0 0 1 2 2 2h14c1 0 2-2 2-2" />
      <path d="M5 15c0 2 3 4 7 4s7-2 7-4" />
      <path d="M6 10v3" />
      <path d="M10 10v3" />
      <path d="M14 10v3" />
      <path d="M18 10v3" />
    </svg>
  ),
  salad: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Bowl with leafy greens */}
      <path d="M4 11h16" />
      <path d="M5 11c0 5 3 8 7 8s7-3 7-8" />
      <path d="M8 8c-1-2 0-4 2-4 1 0 2 1 2 2" />
      <path d="M12 6c0-2 2-3 3-3 2 0 2 2 1 4" />
      <path d="M15 8c1-1 3-1 4 1" />
      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tendys: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Chicken tenders */}
      <path d="M5 7c0-1 1-2 2-2h2c2 0 3 2 2 4l-2 8c0 1-1 2-2 2H6c-1 0-2-1-1-2l1-8c0-1 0-2-1-2z" />
      <path d="M11 6c0-1 1-2 2-2h2c2 0 3 2 2 4l-2 9c0 1-1 2-2 2h-1c-1 0-2-1-1-2l1-9c0-1 0-2-1-2z" />
      <path d="M17 5c0-1 1-1 2-1s2 1 2 2c0 2-1 4-2 6l-1 6c0 1-1 1-1 1s-1 0-1-1l1-6c0-2 0-4 0-5 0-1 0-2 0-2z" />
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

  return (
    <button
      onClick={onClick}
      className="
        flex flex-col items-center justify-center gap-2
        w-full py-4
        rounded-xl
        transition-all duration-200
        active:scale-[0.97]
      "
      style={{
        background: isActive ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
        border: isActive ? 'none' : '1px solid var(--color-divider)',
      }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8"
        style={{
          color: isActive ? '#1A1A1A' : 'var(--color-text-tertiary)'
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        className="text-xs font-medium"
        style={{
          color: isActive ? '#1A1A1A' : 'var(--color-text-secondary)'
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
