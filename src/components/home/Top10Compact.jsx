import { useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'
import { CategoryIcon } from './CategoryIcons'

/**
 * Top10Compact - Ranked dish list for the homepage
 *
 * Editorial layout: big rank numbers, bold names, rating colored by value.
 */
export function Top10Compact({
  dishes,
  town,
  categoryLabel,
  startRank = 1,
}) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const allDishes = dishes || []

  const INITIAL_COUNT = 10
  const hasMore = categoryLabel && allDishes.length > INITIAL_COUNT
  const activeDishes = expanded ? allDishes : allDishes.slice(0, INITIAL_COUNT)

  if (!dishes?.length && !categoryLabel) return null

  // Podium = ranks that get bordered card treatment (up to rank 3)
  const podiumCount = Math.max(0, 4 - startRank)
  const podiumDishes = activeDishes.slice(0, podiumCount)
  const finalistDishes = activeDishes.slice(podiumCount)

  return (
    <section className="animate-fadeIn">
      {/* Section headline */}
      {categoryLabel ? (
        <p
          className="font-bold mb-4"
          style={{
            fontFamily: "'aglet-sans', sans-serif",
            color: '#E4440A',
            fontSize: '20px',
            letterSpacing: '-0.02em',
          }}
        >
          {town ? `Best ${categoryLabel} in ${town}` : `Best ${categoryLabel} on the Vineyard`}
        </p>
      ) : (
        <p
          className="mb-4"
          style={{
            fontFamily: "'aglet-sans', sans-serif",
            fontWeight: 800,
            fontSize: '14px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#999999',
          }}
        >
          Top 10
        </p>
      )}

      {/* Dishes list */}
      <div>
        {activeDishes.length > 0 ? (
          <>
            {/* Podium rows — bordered cards */}
            {podiumDishes.map((dish, index) => (
              <div key={dish.dish_id} style={{ marginBottom: '6px' }}>
                <Top10Row
                  dish={dish}
                  rank={index + startRank}
                  onClick={() => navigate(`/dish/${dish.dish_id}`)}
                />
              </div>
            ))}

            {/* Finalists — grouped in one bordered container */}
            {finalistDishes.length > 0 && (
              <div
                className="mt-2 rounded-xl overflow-hidden"
                style={{ border: '3px solid #1A1A1A' }}
              >
                {finalistDishes.map((dish, index) => (
                  <Top10Row
                    key={dish.dish_id}
                    dish={dish}
                    rank={index + startRank + podiumCount}
                    onClick={() => navigate(`/dish/${dish.dish_id}`)}
                    isLast={index === finalistDishes.length - 1}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: '#999999' }}>
              {categoryLabel ? `No ${categoryLabel} ranked yet` : 'No dishes found'}
            </p>
          </div>
        )}
      </div>

      {/* Show more / Show less for category lists */}
      {hasMore && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="w-full mt-3 pt-3 text-sm font-bold transition-opacity hover:opacity-70"
          style={{
            color: '#E4440A',
            borderTop: '1px solid #E8E8E8',
          }}
        >
          {expanded ? 'Show less' : `Show all ${allDishes.length} ${categoryLabel}`}
        </button>
      )}
    </section>
  )
}

// Podium rows: ranks 1-3 get individual bordered cards
// Finalist rows: ranks 4+ sit inside a shared bordered container with dividers
const Top10Row = memo(function Top10Row({ dish, rank, onClick, isLast }) {
  const { dish_name, restaurant_name, avg_rating, total_votes, category } = dish
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING
  const isPodium = rank <= 3

  const accessibleLabel = isRanked
    ? `Rank ${rank}: ${dish_name} at ${restaurant_name}, rated ${avg_rating} out of 10 with ${total_votes} votes`
    : `Rank ${rank}: ${dish_name} at ${restaurant_name}, ${total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'new dish'}`

  if (isPodium) {
    return (
      <button
        onClick={onClick}
        aria-label={accessibleLabel}
        className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl transition-colors text-left active:scale-[0.98]"
        style={{
          background: '#FFFFFF',
          border: '3px solid #1A1A1A',
        }}
      >
        <span
          className="font-bold flex-shrink-0"
          style={{
            fontFamily: "'aglet-sans', sans-serif",
            fontWeight: 800,
            color: '#1A1A1A',
            fontSize: rank === 1 ? '28px' : rank === 2 ? '24px' : '22px',
            lineHeight: 1,
            minWidth: '28px',
            textAlign: 'center',
          }}
        >
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="font-bold truncate"
            style={{
              color: '#1A1A1A',
              fontSize: rank === 1 ? '17px' : '16px',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {dish_name}
          </p>
          <p
            className="truncate font-medium"
            style={{
              color: '#999999',
              fontSize: '11px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            {restaurant_name}
          </p>
        </div>
        {isRanked ? (
          <span
            className="font-bold flex-shrink-0"
            style={{
              fontFamily: "'aglet-sans', sans-serif",
              fontSize: '18px',
              color: getRatingColor(avg_rating),
            }}
          >
            {avg_rating}
          </span>
        ) : (
          <span className="text-xs flex-shrink-0" style={{ color: '#999999' }}>
            {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
          </span>
        )}
        <CategoryIcon categoryId={category} size={24} color="#E4440A" />
      </button>
    )
  }

  // Finalist row (4+)
  return (
    <button
      onClick={onClick}
      aria-label={accessibleLabel}
      className="w-full flex items-center gap-3 py-3.5 px-4 transition-colors text-left active:scale-[0.99]"
      style={{
        background: '#FFFFFF',
        borderBottom: isLast ? 'none' : '1px solid #E8E8E8',
      }}
    >
      <span
        className="font-bold flex-shrink-0"
        style={{
          fontFamily: "'aglet-sans', sans-serif",
          color: '#1A1A1A',
          fontSize: '16px',
          minWidth: '28px',
          textAlign: 'center',
        }}
      >
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm truncate"
          style={{ color: '#1A1A1A' }}
        >
          {dish_name}
        </p>
        <p
          className="truncate font-medium"
          style={{
            color: '#999999',
            fontSize: '11px',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            marginTop: '1px',
          }}
        >
          {restaurant_name}
        </p>
      </div>
      {isRanked ? (
        <span
          className="font-bold flex-shrink-0"
          style={{
            fontFamily: "'aglet-sans', sans-serif",
            fontSize: '15px',
            color: getRatingColor(avg_rating),
          }}
        >
          {avg_rating}
        </span>
      ) : (
        <span className="text-xs flex-shrink-0" style={{ color: '#999999' }}>
          {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
        </span>
      )}
      <CategoryIcon categoryId={category} size={20} color="#E4440A" />
    </button>
  )
})
