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
    <section className="px-4 pt-6 pb-6" style={{ background: 'var(--color-bg)' }}>
      {/* Value proposition */}
      <div className="mb-4 text-center">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Find What's Good on the Vineyard
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Ranked by locals and people who know
        </p>
      </div>

      {/* Search - hero element (respects town filter) */}
      <DishSearch loading={loading} placeholder="Search dishes or categories" town={town} />

      {/* Town filter dropdown */}
      <div className="mt-3 text-center">
        <TownPicker town={town} onTownChange={onTownChange} />
      </div>
    </section>
  )
}
