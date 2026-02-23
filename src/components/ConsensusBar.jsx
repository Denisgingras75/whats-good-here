import { ScorePill } from './ScorePill'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'

/**
 * ConsensusBar — shows the full rating context.
 *
 * Props:
 *   avgRating      - number (0-10)
 *   totalVotes     - number
 *   percentWorthIt - number (0-100)
 *   compact        - boolean (single line vs stacked, default: false)
 */
export function ConsensusBar({ avgRating, totalVotes = 0, percentWorthIt = 0, compact = false }) {
  // Zero votes — call to action
  if (!totalVotes || totalVotes === 0) {
    return (
      <div style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
        Be first to rate
      </div>
    )
  }

  // Below minimum — show early state
  if (totalVotes < MIN_VOTES_FOR_RANKING) {
    return (
      <div className="flex items-center gap-2" style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
        <ScorePill score={avgRating} size="sm" />
        <span style={{ color: 'var(--color-text-tertiary)' }}>
          {' \u00b7 '}{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} so far
        </span>
      </div>
    )
  }

  // Compact mode — single line
  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap" style={{ fontSize: '13px' }}>
        <ScorePill score={avgRating} size="sm" />
        <span style={{ color: 'var(--color-text-tertiary)' }}>
          {' \u00b7 '}{totalVotes} votes{' \u00b7 '}{Math.round(percentWorthIt)}% again
        </span>
      </div>
    )
  }

  // Full mode — ScorePill hero + stats column
  return (
    <div className="flex items-center gap-4">
      <ScorePill score={avgRating} size="xl" showMax />
      <div className="flex flex-col">
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '15px', fontWeight: 700 }}>
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', marginTop: '2px' }}>
          {Math.round(percentWorthIt)}% would order again
        </span>
      </div>
    </div>
  )
}
