import { DishSearch } from '../DishSearch'

/**
 * SearchHero - Massive editorial title + search + town filter
 * Staggered entrance for premium feel
 */
export function SearchHero({ town, loading, onSearchChange, townPicker }) {
  return (
    <section
      className="pt-10 pb-0"
      style={{ background: 'var(--color-surface-elevated)' }}
    >
      <div className="px-4 mb-4 stagger-item text-center">
        <h1
          style={{
            fontFamily: "'aglet-sans', sans-serif",
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            fontSize: '36px',
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
          }}
        >
          What's Good{' '}
          <span style={{ color: 'var(--color-primary)' }}>Here</span>
        </h1>
      </div>

      <div className="px-4 stagger-item">
        <DishSearch loading={loading} placeholder="What are you craving?" town={town} onSearchChange={onSearchChange} />
      </div>

      {townPicker && (
        <div className="px-4 mt-3 stagger-item">
          {townPicker}
        </div>
      )}
    </section>
  )
}
