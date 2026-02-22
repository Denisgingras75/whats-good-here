import { useState, useMemo } from 'react'
import { useEvents } from '../hooks/useEvents'
import { useSpecials } from '../hooks/useSpecials'
import { EventCard } from '../components/EventCard'
import { SpecialCard } from '../components/SpecialCard'
import { EVENT_TYPES } from '../constants/eventTypes'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'tonight', label: 'Tonight' },
  { value: 'this_week', label: 'This Week' },
  ...EVENT_TYPES.map(t => ({ value: t.value, label: t.label })),
  { value: 'specials', label: 'Specials' },
]

function getDateContext() {
  const now = new Date()
  const hour = now.getHours()
  if (hour >= 17) return 'Tonight'
  if (hour >= 12) return 'This Afternoon'
  return 'Today'
}

export function Hub() {
  const [activeFilter, setActiveFilter] = useState('all')
  const { events, loading: eventsLoading, error: eventsError } = useEvents()
  const { specials, loading: specialsLoading, error: specialsError } = useSpecials()

  const loading = eventsLoading || specialsLoading
  const error = eventsError || specialsError

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'specials') return []

    var filtered = events.slice()

    if (activeFilter === 'tonight') {
      var today = new Date()
      today.setHours(0, 0, 0, 0)
      var todayStr = today.toISOString().split('T')[0]
      filtered = filtered.filter(function(e) { return e.event_date === todayStr })
    } else if (activeFilter === 'this_week') {
      var weekStart = new Date()
      weekStart.setHours(0, 0, 0, 0)
      var weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      filtered = filtered.filter(function(e) {
        var d = new Date(e.event_date + 'T00:00:00')
        return d >= weekStart && d < weekEnd
      })
    } else if (activeFilter !== 'all') {
      filtered = filtered.filter(function(e) { return e.event_type === activeFilter })
    }

    return filtered
  }, [events, activeFilter])

  var showSpecials = activeFilter === 'all' || activeFilter === 'specials' ||
    activeFilter === 'tonight' || activeFilter === 'this_week'

  var hasEvents = filteredEvents.length > 0
  var hasSpecials = showSpecials && specials.length > 0
  var hasContent = hasEvents || hasSpecials
  var isEmpty = !loading && !error && !hasContent

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--color-surface)' }}>
      <h1 className="sr-only">Hub</h1>

      {/* Header */}
      <header className="px-4 pt-6 pb-4" style={{ background: 'var(--color-bg)' }}>
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          What's Happening
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {getDateContext()} on Martha's Vineyard
        </p>
      </header>

      {/* Filter chips */}
      <div
        className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide"
        style={{
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-divider)',
        }}
      >
        {FILTERS.map(function(filter) {
          var isActive = activeFilter === filter.value
          return (
            <button
              key={filter.value}
              onClick={function() { setActiveFilter(filter.value) }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: isActive ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                border: isActive ? 'none' : '1px solid var(--color-divider)',
              }}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="px-4 py-4 space-y-3">
          {[0, 1, 2, 3].map(function(i) {
            return (
              <div
                key={i}
                className="h-28 rounded-xl animate-pulse"
                style={{ background: 'var(--color-card)' }}
              />
            )
          })}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12 px-4">
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
            {error?.message || 'Unable to load events'}
          </p>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-16 mx-4 mt-4 rounded-xl" style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-divider)',
        }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          <h3
            className="font-semibold text-lg"
            style={{ color: 'var(--color-text-primary)' }}
          >
            No events yet
          </h3>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Check back soon — the island's waking up!
          </p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && hasContent && (
        <div className="px-4 py-4 space-y-6">
          {/* Events section */}
          {hasEvents && (
            <section>
              {showSpecials && (
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Events
                </h3>
              )}
              <div className="space-y-3">
                {filteredEvents.map(function(event) {
                  return <EventCard key={event.id} event={event} />
                })}
              </div>
            </section>
          )}

          {/* Specials section */}
          {hasSpecials && (
            <section>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Specials & Deals
              </h3>
              <div className="space-y-3">
                {specials.map(function(special) {
                  return <SpecialCard key={special.id} special={special} />
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
