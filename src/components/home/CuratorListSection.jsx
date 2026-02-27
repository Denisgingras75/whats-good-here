import { useCurators } from '../../hooks/useCurators'
import { CuratorCard } from './CuratorCard'
import { SectionHeader } from '../SectionHeader'

export function CuratorListSection({ onCuratorClick }) {
  var { curators, loading } = useCurators()

  if (loading) {
    return (
      <div className="px-4 pb-3">
        <SectionHeader title="Local Picks" />
        <div className="flex gap-3 overflow-x-auto py-2">
          {[0, 1, 2, 3, 4].map(function (i) {
            return (
              <div key={i} className="flex flex-col items-center flex-shrink-0 w-20 animate-pulse">
                <div className="w-14 h-14 rounded-full mb-1" style={{ background: 'var(--color-divider)' }} />
                <div className="h-3 w-12 rounded" style={{ background: 'var(--color-divider)' }} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (!curators || curators.length === 0) return null

  return (
    <div className="px-4 pb-3">
      <SectionHeader title="Local Picks" />
      <div
        className="flex gap-3 overflow-x-auto py-2"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {curators.map(function (curator) {
          return (
            <CuratorCard
              key={curator.curator_id}
              curator={curator}
              onClick={onCuratorClick}
            />
          )
        })}
      </div>
    </div>
  )
}

export default CuratorListSection
