import { forwardRef } from 'react'

// Autocomplete dropdown for search suggestions
export const SearchAutocomplete = forwardRef(function SearchAutocomplete({
  suggestions,
  isOpen,
  activeIndex,
  onSelect,
}, ref) {
  if (!isOpen || suggestions.length === 0) return null

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 right-0 mb-1 rounded-lg shadow-lg border overflow-hidden z-50"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-divider)' }}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.type}-${suggestion.id}`}
          onClick={() => onSelect(suggestion)}
          className="w-full px-3 py-2.5 text-left flex items-center gap-2 transition-colors"
          style={{
            background: index === activeIndex ? 'var(--color-primary-muted)' : 'transparent'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
          onMouseLeave={(e) => e.currentTarget.style.background = index === activeIndex ? 'var(--color-primary-muted)' : 'transparent'}
        >
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
              {suggestion.name}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
              {suggestion.type === 'dish' ? `at ${suggestion.subtitle}` : suggestion.subtitle}
            </p>
          </div>

          {/* Type badge */}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: suggestion.type === 'dish' ? 'var(--color-primary-muted)' : 'rgba(59, 130, 246, 0.15)',
              color: suggestion.type === 'dish' ? 'var(--color-primary)' : 'var(--color-blue-light)'
            }}
          >
            {suggestion.type === 'dish' ? 'Dish' : 'Spot'}
          </span>
        </button>
      ))}
    </div>
  )
})
