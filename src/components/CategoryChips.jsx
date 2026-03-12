import { useRef, useEffect } from 'react'
import { BROWSE_CATEGORIES } from '../constants/categories'

/**
 * CategoryChips — horizontal scrollable category filter.
 * Uses emoji icons for clean, universal rendering on any theme.
 */
export function CategoryChips({
  categories = BROWSE_CATEGORIES,
  selected = null,
  onSelect,
  showAll = true,
  sticky = false,
  maxVisible = 12,
  townPicker = null,
  townPickerOpen = false,
}) {
  var visibleCategories = categories.slice(0, maxVisible)
  var scrollRef = useRef(null)

  useEffect(function () {
    if (!townPickerOpen && scrollRef.current) {
      scrollRef.current.scrollLeft = 0
    }
  }, [townPickerOpen])

  return (
    <div
      className={sticky ? 'sticky top-0 z-10' : ''}
      style={sticky ? { background: 'var(--color-bg)' } : undefined}
    >
      <div
        ref={scrollRef}
        className="flex px-4 overflow-x-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          minHeight: '68px',
          touchAction: 'pan-x pan-y',
          gap: '0',
        }}
      >
        {townPicker && (
          <div className="flex-shrink-0 self-center">
            {townPicker}
          </div>
        )}
        {!townPickerOpen && visibleCategories.map(function (cat) {
          var isActive = selected === cat.id
          return (
            <button
              key={cat.id}
              onClick={function () { onSelect(isActive ? null : cat.id) }}
              className="flex-shrink-0 flex flex-col items-center justify-center"
              style={{
                padding: '6px 10px',
                minWidth: '56px',
                background: 'transparent',
                transition: 'opacity 0.15s ease',
                opacity: selected && !isActive ? 0.4 : 1,
              }}
            >
              {/* Emoji icon */}
              <span style={{
                fontSize: '28px',
                lineHeight: 1,
                display: 'block',
              }}>
                {cat.emoji || '🍽️'}
              </span>
              {/* Label */}
              <span style={{
                marginTop: '4px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.02em',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}>{cat.label}</span>
              {/* Active indicator dot */}
              {isActive && (
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  marginTop: '3px',
                }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryChips
