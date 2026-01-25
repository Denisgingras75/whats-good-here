import { memo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ReviewFlow } from './ReviewFlow'
import { getWorthItBadge, formatScore10, calculateWorthItScore10, getRatingColor } from '../utils/ranking'
import { getCategoryImage } from '../constants/categoryImages'
import { votesApi } from '../api/votesApi'
import { ThumbsUpIcon } from './ThumbsUpIcon'

export const DishCard = memo(function DishCard({ dish, onVote, onLoginRequired, isFavorite, onToggleFavorite, showOrderAgainPercent = false }) {
  const {
    dish_id,
    dish_name,
    restaurant_id,
    restaurant_name,
    category,
    price,
    photo_url,
    total_votes,
    yes_votes,
    percent_worth_it,
    avg_rating,
    distance_miles,
  } = dish

  const totalVotes = total_votes || 0
  const worthItScore10 = calculateWorthItScore10(percent_worth_it || 0)
  const badge = getWorthItBadge(worthItScore10, totalVotes)

  // Use photo_url if dish has one, otherwise use category-based image
  const imageUrl = photo_url || getCategoryImage(category)

  // Smart snippet state
  const [snippet, setSnippet] = useState(null)
  const [snippetLoading, setSnippetLoading] = useState(false)

  // Fetch smart snippet for dishes with reviews
  useEffect(() => {
    async function fetchSnippet() {
      if (totalVotes < 1) return // No votes means no reviews
      setSnippetLoading(true)
      try {
        const result = await votesApi.getSmartSnippetForDish(dish_id)
        setSnippet(result)
      } catch (error) {
        console.error('Error fetching snippet:', error)
      } finally {
        setSnippetLoading(false)
      }
    }
    fetchSnippet()
  }, [dish_id, totalVotes])

  return (
    <article className="card-elevated overflow-hidden mb-6 stagger-item dish-card-virtualized">
      {/* Dish Photo - Hero Element */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden group">
        <img
          src={imageUrl}
          alt={dish_name}
          className="w-full h-full object-cover image-zoom"
          loading="lazy"
        />

        {/* Subtle gradient for badge contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Rating badge - bottom left (only show if 10+ votes) */}
        {totalVotes >= 10 && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
            <span className="text-sm font-semibold text-white flex items-center gap-1">
              <ThumbsUpIcon size={24} /> {Math.round(percent_worth_it)}%
            </span>
          </div>
        )}

        {/* Top badges row */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(dish_id)
              }}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/95 backdrop-blur-sm text-neutral-400 hover:text-red-500'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </button>
          )}

          {/* Distance badge */}
          {distance_miles && (
            <div className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm shadow-lg">
              <span className="text-xs font-semibold text-neutral-700">
                {Number(distance_miles).toFixed(1)} mi
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Dish Name - Primary Focus (2 lines max) */}
        <h3
          className="text-xl font-bold leading-snug line-clamp-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {dish_name}
        </h3>

        {/* Restaurant & Meta Info */}
        <div className="mt-1.5 space-y-0.5">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {restaurant_name}
            </span>
            {price && (
              <>
                <span style={{ color: 'var(--color-divider)' }}>•</span>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  ${Number(price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Rating summary line - subtle, not a big box */}
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {totalVotes === 0
              ? 'Be first to rate'
              : totalVotes < 10
                ? `${totalVotes} ${totalVotes === 1 ? 'vote' : 'votes'} so far`
                : `${totalVotes} votes · ${Math.round(percent_worth_it)}% say it's good here`
            }
          </p>
        </div>

        {/* Detailed Rating Section - only for 10+ votes */}
        {totalVotes >= 10 && (
          <div
            className="mt-4 p-4 rounded-xl"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-divider)'
            }}
          >
            {/* Badge row */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xl">{badge.emoji}</span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {badge.label}
              </span>
            </div>

            {/* Stats Grid - Order based on view context */}
            <div className="grid grid-cols-2 gap-4">
              {showOrderAgainPercent ? (
                <>
                  {/* Confidence view: Order Again % is primary (ranking criterion) */}
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                      {Math.round(percent_worth_it)}%
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      say it's good here
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: getRatingColor(avg_rating) }}>
                      {avg_rating ? formatScore10(avg_rating) : '—'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      avg rating
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Discovery view: Avg Rating is primary (ranking criterion) */}
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: getRatingColor(avg_rating) }}>
                      {avg_rating ? formatScore10(avg_rating) : '—'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      avg rating
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {Math.round(percent_worth_it)}%
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      say it's good here
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Smart Snippet - Review Preview */}
        {!snippetLoading && snippet && (
          <div className="mt-4 p-3 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}>
            <p className="text-sm italic" style={{ color: 'var(--color-text-secondary)' }}>
              "{snippet.review_text}"
            </p>
            <div className="mt-2 flex items-center justify-between">
              <Link
                to={`/profile/${snippet.user_id}`}
                className="text-xs font-medium hover:underline"
                style={{ color: 'var(--color-primary)' }}
                onClick={(e) => e.stopPropagation()}
              >
                @{snippet.profiles?.display_name || 'Anonymous'}
              </Link>
              <span className="text-xs font-semibold" style={{ color: getRatingColor(snippet.rating_10) }}>
                {snippet.rating_10 ? formatScore10(snippet.rating_10) : ''}
              </span>
            </div>
          </div>
        )}

        {/* No reviews CTA */}
        {!snippetLoading && !snippet && totalVotes > 0 && (
          <div className="mt-4 p-3 rounded-xl text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              No reviews yet — be the first!
            </p>
          </div>
        )}

        {/* Review Flow */}
        <div className="mt-4">
          <ReviewFlow
            dishId={dish_id}
            dishName={dish_name}
            restaurantId={restaurant_id}
            restaurantName={restaurant_name}
            category={category}
            price={price}
            totalVotes={totalVotes}
            yesVotes={yes_votes || 0}
            onVote={onVote}
            onLoginRequired={onLoginRequired}
          />
        </div>
      </div>
    </article>
  )
})
