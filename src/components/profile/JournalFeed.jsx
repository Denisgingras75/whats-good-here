import { JournalCard } from './JournalCard'

/**
 * JournalFeed — reverse-chronological feed of food journal entries.
 *
 * Merges worthIt, avoid, and heard data sources into a single feed.
 * Shelf filtering narrows to a specific category.
 *
 * Props:
 *   worthIt     - array of "Good Here" dishes (from useUserVotes)
 *   avoid       - array of "Wasn't Good Here" dishes (from useUserVotes)
 *   heard       - array of "Heard That's Good There" dishes (from useFavorites)
 *   activeShelf - 'all' | 'good-here' | 'not-good-here' | 'heard'
 *   onTriedIt   - callback when "Tried it?" is tapped on a heard card
 *   loading     - show loading skeletons
 */
export function JournalFeed({ worthIt, avoid, heard, activeShelf, onTriedIt, loading }) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[0, 1, 2].map(function (i) {
          return (
            <div
              key={i}
              data-testid="journal-skeleton"
              className="h-24 rounded-xl animate-pulse"
              style={{ background: 'var(--color-surface-elevated)' }}
            />
          )
        })}
      </div>
    )
  }

  // Tag each entry with its type and normalize the timestamp field
  var entries = []

  if (activeShelf === 'all' || activeShelf === 'good-here') {
    var tagged = worthIt.map(function (d) {
      return { dish: d, variant: 'good-here', time: d.voted_at }
    })
    entries = entries.concat(tagged)
  }

  if (activeShelf === 'all' || activeShelf === 'not-good-here') {
    var taggedAvoid = avoid.map(function (d) {
      return { dish: d, variant: 'not-good-here', time: d.voted_at }
    })
    entries = entries.concat(taggedAvoid)
  }

  if (activeShelf === 'all' || activeShelf === 'heard') {
    var taggedHeard = heard.map(function (d) {
      return { dish: d, variant: 'heard', time: d.saved_at || d.created_at }
    })
    entries = entries.concat(taggedHeard)
  }

  // Sort reverse chronological
  entries = entries.slice().sort(function (a, b) {
    return new Date(b.time || 0) - new Date(a.time || 0)
  })

  if (entries.length === 0) {
    return (
      <div className="p-4">
        <div
          className="rounded-2xl border p-8 text-center"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-divider)',
          }}
        >
          <p
            className="font-semibold"
            style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}
          >
            No dishes here yet
          </p>
          <p
            className="mt-1"
            style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}
          >
            {activeShelf === 'good-here' && "Dishes you'd order again will show up here"}
            {activeShelf === 'not-good-here' && "Dishes that weren't good will show up here"}
            {activeShelf === 'heard' && "Save dishes you want to try later"}
            {activeShelf === 'all' && "Start rating dishes to build your food journal"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {entries.map(function (entry) {
        var key = entry.variant + '-' + (entry.dish.dish_id || entry.dish.id)
        return (
          <JournalCard
            key={key}
            dish={entry.dish}
            variant={entry.variant}
            onTriedIt={onTriedIt}
          />
        )
      })}
    </div>
  )
}
