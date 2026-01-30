import { DishSearch } from '../DishSearch'
import { TownPicker } from '../TownPicker'

/**
 * SearchHero - Hero section with value proposition and prominent search
 *
 * Design Philosophy:
 * - Clear value proposition headline
 * - Prominent search bar as primary CTA
 * - Town dropdown for filtering by MV town
 */
export function SearchHero({ town, onTownChange, loading }) {
  return (
    <section
      className="px-4 pt-8 pb-6 relative"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200, 90, 84, 0.05) 0%, transparent 70%),
          radial-gradient(ellipse 60% 50% at 50% 100%, rgba(217, 167, 101, 0.04) 0%, transparent 70%),
          var(--color-bg)
        `,
      }}
    >
      {/* Value proposition */}
      <div className="mb-5 text-center">
        <h1
          className="font-bold mb-1.5 leading-tight text-shadow-warm"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '22px',
            letterSpacing: '-0.01em',
          }}
        >
          Find What's Good on the Vineyard
        </h1>
        <p
          className="font-medium"
          style={{
            color: 'var(--color-text-tertiary)',
            fontSize: '13px',
          }}
        >
          Ranked by locals and people who know
        </p>
      </div>

      {/* Search - hero element (respects town filter) */}
      <DishSearch loading={loading} placeholder="Search dishes or categories" town={town} />

      {/* Town filter dropdown */}
      <div className="mt-4 text-center">
        <TownPicker town={town} onTownChange={onTownChange} />
      </div>

      {/* Bottom divider */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
        style={{
          width: '80%',
          background: 'linear-gradient(90deg, transparent, var(--color-divider), transparent)',
        }}
      />
    </section>
  )
}
