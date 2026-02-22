import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useEvents } from '../hooks/useEvents'
import { useSpecials } from '../hooks/useSpecials'
import { EventCard } from '../components/EventCard'
import { SpecialCard } from '../components/SpecialCard'
import { getEventTypeLabel } from '../constants/eventTypes'

var FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'events', label: 'Events' },
  { value: 'specials', label: 'Specials' },
]

var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getSmartHeading() {
  var now = new Date()
  var day = DAY_NAMES[now.getDay()]
  var hour = now.getHours()
  if (hour >= 17) return day + ' Night'
  if (hour >= 12) return day + ' Afternoon'
  return day + ' Morning'
}

function getDayLabel(dateStr) {
  var d = new Date(dateStr + 'T00:00:00')
  var today = new Date()
  today.setHours(0, 0, 0, 0)
  var tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.getTime() === today.getTime()) return 'Today'
  if (d.getTime() === tomorrow.getTime()) return 'Tomorrow'
  return DAY_NAMES[d.getDay()] + ', ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getThisWeekEvents(events) {
  var today = new Date()
  today.setHours(0, 0, 0, 0)
  var weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)
  return events.filter(function(e) {
    var d = new Date(e.event_date + 'T00:00:00')
    return d >= today && d < weekEnd
  })
}

function groupByDate(events) {
  var groups = {}
  var order = []
  events.forEach(function(e) {
    var key = e.event_date
    if (!groups[key]) {
      groups[key] = []
      order.push(key)
    }
    groups[key].push(e)
  })
  return order.map(function(date) {
    return { date: date, label: getDayLabel(date), events: groups[date] }
  })
}

export function Hub() {
  var _activeFilter = useState('all')
  var activeFilter = _activeFilter[0]
  var setActiveFilter = _activeFilter[1]
  var _expanded = useState(false)
  var expanded = _expanded[0]
  var setExpanded = _expanded[1]

  var eventsData = useEvents()
  var specialsData = useSpecials()
  var events = eventsData.events
  var eventsLoading = eventsData.loading
  var eventsError = eventsData.error
  var specials = specialsData.specials
  var specialsLoading = specialsData.loading
  var specialsError = specialsData.error

  var loading = eventsLoading || specialsLoading
  var error = eventsError || specialsError

  // Only show this week by default, full list when expanded
  var thisWeekEvents = useMemo(function() {
    return getThisWeekEvents(events)
  }, [events])

  var displayEvents = expanded ? events : thisWeekEvents
  var hasMoreEvents = events.length > thisWeekEvents.length

  // Featured: first event today, or first event overall as "next up"
  var featuredEvent = useMemo(function() {
    if (displayEvents.length === 0) return null
    var today = new Date()
    today.setHours(0, 0, 0, 0)
    var todayStr = today.toISOString().split('T')[0]
    var tonightEvent = displayEvents.find(function(e) { return e.event_date === todayStr })
    return tonightEvent || displayEvents[0]
  }, [displayEvents])

  var featuredLabel = useMemo(function() {
    if (!featuredEvent) return ''
    var today = new Date()
    today.setHours(0, 0, 0, 0)
    var todayStr = today.toISOString().split('T')[0]
    if (featuredEvent.event_date === todayStr) return 'Tonight'
    var tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    var tomorrowStr = tomorrow.toISOString().split('T')[0]
    if (featuredEvent.event_date === tomorrowStr) return 'Tomorrow'
    return 'Next Up'
  }, [featuredEvent])

  // Group remaining events by date
  var groupedEvents = useMemo(function() {
    if (!featuredEvent) return groupByDate(displayEvents)
    var remaining = displayEvents.filter(function(e) { return e.id !== featuredEvent.id })
    return groupByDate(remaining)
  }, [displayEvents, featuredEvent])

  var showEvents = activeFilter === 'all' || activeFilter === 'events'
  var showSpecials = activeFilter === 'all' || activeFilter === 'specials'

  var hasEvents = showEvents && displayEvents.length > 0
  var hasSpecials = showSpecials && specials.length > 0
  var hasContent = hasEvents || hasSpecials
  var isEmpty = !loading && !error && !hasContent

  // Count for header
  var thisWeekCount = thisWeekEvents.length

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--color-surface)' }}>
      <h1 className="sr-only">Hub</h1>

      {/* Header */}
      <header className="px-4 pt-6 pb-4" style={{ background: 'var(--color-bg)' }}>
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {getSmartHeading()}
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {thisWeekCount > 0
            ? thisWeekCount + ' event' + (thisWeekCount === 1 ? '' : 's') + ' this week on Martha\'s Vineyard'
            : 'on Martha\'s Vineyard'}
        </p>
      </header>

      {/* Filter chips */}
      <div
        className="px-4 py-3 flex gap-2"
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
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={isActive ? {
                background: 'var(--color-text-primary)',
                color: 'var(--color-surface)',
              } : {
                background: 'var(--color-surface-elevated)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-divider)',
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
          <div className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--color-card)' }} />
          <div className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--color-card)' }} />
          <div className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--color-card)' }} />
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
        <div className="text-center py-16 mx-4 mt-6 rounded-2xl" style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-divider)',
        }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
          </svg>
          <h3
            className="font-semibold text-lg"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Nothing happening yet
          </h3>
          <p
            className="text-sm mt-1 mb-5 px-6"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            The island's waking up — events and specials will show up here.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/restaurants"
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
              style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}
            >
              Browse Restaurants
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
              style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-divider)' }}
            >
              Top Dishes
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && hasContent && (
        <div className="px-4 py-4 space-y-5">

          {/* Specials strip — always visible, horizontal scroll */}
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

          {/* Featured event */}
          {showEvents && featuredEvent && (
            <section>
              <div
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{
                  background: 'var(--color-card)',
                  borderLeft: '4px solid var(--color-accent-gold)',
                  boxShadow: 'var(--glow-gold)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: 'var(--color-primary-muted)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {featuredLabel}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {getEventTypeLabel(featuredEvent.event_type)}
                  </span>
                </div>
                <h3
                  className="text-xl font-bold mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {featuredEvent.event_name}
                </h3>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-accent-gold)' }}
                >
                  {featuredEvent.restaurants?.name}
                  {featuredEvent.restaurants?.town && (' \u00B7 ' + featuredEvent.restaurants.town)}
                </p>
                {featuredEvent.description && (
                  <p
                    className="text-sm mt-2 line-clamp-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {featuredEvent.description}
                  </p>
                )}
                {featuredEvent.start_time && (
                  <p
                    className="text-sm font-semibold mt-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {getDayLabel(featuredEvent.event_date)} \u00B7 {formatTime(featuredEvent.start_time)}
                    {featuredEvent.end_time && (' - ' + formatTime(featuredEvent.end_time))}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Events grouped by day */}
          {showEvents && groupedEvents.length > 0 && (
            <section className="space-y-4">
              {groupedEvents.map(function(group) {
                return (
                  <div key={group.date}>
                    <h3
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {group.label}
                    </h3>
                    <div className="space-y-2">
                      {group.events.map(function(event) {
                        return <EventCard key={event.id} event={event} />
                      })}
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          {/* "See more" button */}
          {showEvents && !expanded && hasMoreEvents && (
            <button
              onClick={function() { setExpanded(true) }}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
              style={{
                background: 'var(--color-surface-elevated)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-divider)',
              }}
            >
              See all upcoming events
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function formatTime(timeStr) {
  if (!timeStr) return null
  var parts = timeStr.split(':')
  var hour = parseInt(parts[0], 10)
  var min = parts[1]
  var ampm = hour >= 12 ? 'PM' : 'AM'
  var hour12 = hour % 12 || 12
  return min === '00' ? (hour12 + ampm) : (hour12 + ':' + min + ampm)
}
