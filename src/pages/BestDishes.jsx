import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { dishesApi } from '../api/dishesApi'
import { getUserMessage } from '../utils/errorHandler'
import { logger } from '../utils/logger'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { DishListItem } from '../components/DishListItem'

// MV center — covers the whole island with 30mi radius
var MV_CENTER_LAT = 41.3955
var MV_CENTER_LNG = -70.6132
var MV_RADIUS = 30

function MedalIcon({ rank }) {
  var color = rank === 1
    ? 'var(--color-medal-gold)'
    : rank === 2
      ? 'var(--color-medal-silver)'
      : 'var(--color-medal-bronze)'

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill={color} opacity="0.15" />
      <circle cx="10" cy="10" r="7" fill={color} opacity="0.3" />
      <circle cx="10" cy="10" r="5" fill={color} />
      <text
        x="10"
        y="13.5"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="800"
      >
        {rank}
      </text>
    </svg>
  )
}

export function BestDishes() {
  var navigate = useNavigate()

  var { data, isLoading, error } = useQuery({
    queryKey: ['best-dishes-50'],
    queryFn: function () {
      return dishesApi.getRankedDishes({
        lat: MV_CENTER_LAT,
        lng: MV_CENTER_LNG,
        radiusMiles: MV_RADIUS,
        category: null,
        town: null,
      })
    },
    staleTime: 1000 * 60 * 5,
  })

  var top50 = useMemo(function () {
    if (!data || data.length === 0) return []
    return data
      .slice()
      .sort(function (a, b) {
        var aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
        var bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
        if (aRanked && !bRanked) return -1
        if (!aRanked && bRanked) return 1
        return (b.avg_rating || 0) - (a.avg_rating || 0)
      })
      .slice(0, 50)
  }, [data])

  var rankedCount = top50.filter(function (d) {
    return (d.total_votes || 0) >= MIN_VOTES_FOR_RANKING
  }).length

  var handleShare = function () {
    var url = window.location.origin + '/best'
    var title = 'The 50 Best Dishes on Martha\'s Vineyard'
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function () {})
    } else {
      navigator.clipboard.writeText(url).then(function () {
        // Brief visual feedback could go here
      }).catch(function () {})
    }
  }

  var transformedError = error
    ? { message: getUserMessage(error, 'loading best dishes') }
    : null

  if (error) {
    logger.error('Error fetching best dishes:', error)
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--color-bg)' }}>

      {/* Magazine Header */}
      <header
        className="relative px-4 pt-6 pb-5"
        style={{
          background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)',
        }}
      >
        {/* Back button */}
        <button
          onClick={function () { navigate('/') }}
          className="mb-4 p-1 -ml-1 rounded-lg transition-opacity hover:opacity-70"
          aria-label="Back to home"
        >
          <svg className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Title block */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-1"
              style={{ color: 'var(--color-accent-gold)' }}
            >
              Curated List
            </p>
            <h1
              className="text-2xl font-extrabold leading-tight"
              style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
            >
              The 50 Best Dishes<br />
              <span style={{ color: 'var(--color-primary)' }}>on Martha's Vineyard</span>
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Ranked by locals. Updated daily.
            </p>
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex-shrink-0 p-2.5 rounded-full transition-all active:scale-95"
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1.5px solid var(--color-divider)',
            }}
            aria-label="Share this list"
          >
            <svg className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        {/* Stats bar */}
        {!isLoading && top50.length > 0 && (
          <div
            className="flex items-center gap-3 mt-4 px-3 py-2 rounded-lg"
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-divider)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '13px' }}>
                <MedalIcon rank={1} />
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {rankedCount} ranked
              </span>
            </div>
            <span style={{ color: 'var(--color-divider)' }}>|</span>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {top50.length} dishes from across the island
            </span>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="px-4 pt-2">
        {isLoading ? (
          <div className="animate-pulse">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(function (i) {
              return (
                <div key={i} className="flex items-center gap-3 py-3 px-3">
                  <div className="w-7 h-5 rounded" style={{ background: 'var(--color-divider)' }} />
                  <div className="w-12 h-12 rounded-lg" style={{ background: 'var(--color-divider)' }} />
                  <div className="flex-1">
                    <div className="h-4 w-32 rounded mb-1" style={{ background: 'var(--color-divider)' }} />
                    <div className="h-3 w-24 rounded" style={{ background: 'var(--color-divider)' }} />
                  </div>
                  <div className="h-5 w-10 rounded" style={{ background: 'var(--color-divider)' }} />
                </div>
              )
            })}
          </div>
        ) : transformedError ? (
          <div className="py-16 text-center">
            <p role="alert" className="text-sm" style={{ color: 'var(--color-danger, var(--color-primary))' }}>
              {transformedError.message}
            </p>
            <button
              onClick={function () { window.location.reload() }}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
            >
              Retry
            </button>
          </div>
        ) : top50.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              No ranked dishes yet. Be the first to vote!
            </p>
          </div>
        ) : (
          <div>
            {/* Podium: Top 3 with medal decorations */}
            {top50.slice(0, 3).map(function (dish, index) {
              var rank = index + 1
              return (
                <div key={dish.dish_id} className="relative" style={{ marginBottom: '6px' }}>
                  {/* Medal badge */}
                  <div
                    className="absolute z-10 flex items-center justify-center"
                    style={{
                      top: '8px',
                      left: '8px',
                      width: '22px',
                      height: '22px',
                    }}
                  >
                    <MedalIcon rank={rank} />
                  </div>
                  <DishListItem
                    dish={dish}
                    rank={rank}
                    onClick={function () { navigate('/dish/' + dish.dish_id) }}
                  />
                </div>
              )
            })}

            {/* Ranks 4-10 — grouped list */}
            {top50.length > 3 && (
              <div className="mt-3 rounded-xl overflow-hidden">
                {top50.slice(3, 10).map(function (dish, index) {
                  return (
                    <DishListItem
                      key={dish.dish_id}
                      dish={dish}
                      rank={index + 4}
                      onClick={function () { navigate('/dish/' + dish.dish_id) }}
                      isLast={index === Math.min(top50.length - 4, 6)}
                    />
                  )
                })}
              </div>
            )}

            {/* Ranks 11-25 */}
            {top50.length > 10 && (
              <div className="mt-4">
                <p
                  className="text-[11px] font-semibold tracking-[0.15em] uppercase px-1 mb-2"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  The Next 15
                </p>
                <div className="rounded-xl overflow-hidden">
                  {top50.slice(10, 25).map(function (dish, index) {
                    return (
                      <DishListItem
                        key={dish.dish_id}
                        dish={dish}
                        rank={index + 11}
                        onClick={function () { navigate('/dish/' + dish.dish_id) }}
                        isLast={index === Math.min(top50.length - 11, 14)}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Ranks 26-50 */}
            {top50.length > 25 && (
              <details className="mt-4">
                <summary
                  className="cursor-pointer py-3 text-center text-sm font-medium rounded-xl transition-colors"
                  style={{
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-secondary)',
                    border: '1.5px solid var(--color-divider)',
                  }}
                >
                  Show #{26}\u2013{Math.min(top50.length, 50)}
                </summary>
                <div className="mt-3 rounded-xl overflow-hidden">
                  {top50.slice(25).map(function (dish, index) {
                    return (
                      <DishListItem
                        key={dish.dish_id}
                        dish={dish}
                        rank={index + 26}
                        onClick={function () { navigate('/dish/' + dish.dish_id) }}
                        isLast={index === top50.length - 26}
                      />
                    )
                  })}
                </div>
              </details>
            )}

            {/* Footer */}
            <div
              className="mt-8 pt-6 pb-4 text-center border-t"
              style={{ borderColor: 'var(--color-divider)' }}
            >
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Rankings based on {rankedCount} dishes with {MIN_VOTES_FOR_RANKING}+ votes
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                whatsgoodhere.com/best
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BestDishes
