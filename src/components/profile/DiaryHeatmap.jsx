import { useMemo } from 'react'

var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
var DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getDateKey(date) {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0')
}

export function DiaryHeatmap({ entries }) {
  var heatmapData = useMemo(function () {
    if (!entries || entries.length === 0) return null

    // Count entries per day for last 12 weeks
    var counts = {}
    entries.forEach(function (entry) {
      var date = entry.logged_at || entry.voted_at || entry.created_at
      if (!date) return
      var key = getDateKey(new Date(date))
      counts[key] = (counts[key] || 0) + 1
    })

    // Build 12-week grid (84 days ending today)
    var today = new Date()
    today.setHours(0, 0, 0, 0)
    var weeks = []
    var startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 83) // 84 days back
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay())

    var current = new Date(startDate)
    var week = []
    while (current <= today) {
      var key = getDateKey(current)
      week.push({ date: key, count: counts[key] || 0 })
      if (week.length === 7) {
        weeks.push(week)
        week = []
      }
      current.setDate(current.getDate() + 1)
    }
    if (week.length > 0) {
      weeks.push(week)
    }

    // Max count for color scaling
    var maxCount = 0
    Object.values(counts).forEach(function (c) {
      if (c > maxCount) maxCount = c
    })

    return { weeks: weeks, maxCount: maxCount, total: entries.length }
  }, [entries])

  if (!heatmapData || heatmapData.total === 0) return null

  function getCellColor(count) {
    if (count === 0) return 'var(--color-surface-elevated)'
    var intensity = Math.min(count / Math.max(heatmapData.maxCount, 1), 1)
    if (intensity <= 0.25) return 'var(--color-accent-gold-muted)'
    if (intensity <= 0.5) return 'var(--color-accent-gold)'
    if (intensity <= 0.75) return 'var(--color-accent-orange)'
    return 'var(--color-primary)'
  }

  return (
    <div className="px-4 pt-3">
      <div
        className="rounded-2xl border p-4"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className="font-bold"
            style={{ color: 'var(--color-text-primary)', fontSize: '15px' }}
          >
            Diary Activity
          </h3>
          <span style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
            {heatmapData.total} total
          </span>
        </div>

        {/* Day labels + grid */}
        <div className="flex gap-1">
          {/* Day of week labels */}
          <div className="flex flex-col gap-1 mr-1">
            {DAYS.map(function (day, i) {
              return (
                <div
                  key={i}
                  className="flex items-center justify-center"
                  style={{
                    width: '12px',
                    height: '12px',
                    fontSize: '9px',
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  {i % 2 === 1 ? day : ''}
                </div>
              )
            })}
          </div>

          {/* Heatmap cells */}
          <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {heatmapData.weeks.map(function (week, wi) {
              return (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map(function (day, di) {
                    return (
                      <div
                        key={day.date}
                        className="rounded-sm"
                        title={day.date + ': ' + day.count + ' entries'}
                        style={{
                          width: '12px',
                          height: '12px',
                          background: getCellColor(day.count),
                        }}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-2">
          <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>Less</span>
          {[0, 1, 2, 3, 4].map(function (i) {
            return (
              <div
                key={i}
                className="rounded-sm"
                style={{
                  width: '10px',
                  height: '10px',
                  background: getCellColor(i),
                }}
              />
            )
          })}
          <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>More</span>
        </div>
      </div>
    </div>
  )
}

export default DiaryHeatmap
