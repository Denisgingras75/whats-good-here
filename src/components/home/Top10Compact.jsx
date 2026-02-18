import { useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'
import { CategoryIcon } from './CategoryIcons'

/**
 * Top10Compact - Ranked dish list for the homepage
 *
 * Editorial layout: big rank numbers, bold names, rating colored by value.
 * Staggered row entrances for smooth reveal.
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

  // Stagger offset — accounts for hero sections above (title, search, categories, #1 hero = ~4 items)
  const staggerBase = 4

  return (
    <section>
      {/* Dishes list — podium cards (2-3) then clean rows (4+) */}
      <div className="flex flex-col" style={{ gap: '6px' }}>
        {activeDishes.length > 0 ? (
          activeDishes.map((dish, index) => {
            const rank = index + startRank
            const isPodiumBreak = rank === 3 && activeDishes.length > 3
            const isAfterPodium = rank > 3
            const isLastRow = index === activeDishes.length - 1
            const nextRank = index + startRank + 1
            const nextIsAfterPodium = nextRank > 3
            return (
              <div
                key={dish.dish_id}
                className="stagger-item"
                style={{
                  animationDelay: `${(staggerBase + 1 + index) * 50}ms`,
                  marginBottom: isPodiumBreak ? '12px' : 0,
                  borderBottom: 'none', // rows handle their own dividers
                }}
              >
                <Top10Row
                  dish={dish}
                  rank={rank}
                  town={town}
                  onClick={() => navigate(`/dish/${dish.dish_id}`)}
                />
              </div>
            )
          })
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
            borderTop: '1px solid #E0E0E0',
          }}
        >
          {expanded ? 'Show less' : `Show all ${allDishes.length} ${categoryLabel}`}
        </button>
      )}
    </section>
  )
}

// Podium colors — silver (#2) and bronze (#3) banner bars
const PODIUM_COLORS = {
  2: { bg: '#8A8A8A', text: '#FFFFFF' },
  3: { bg: '#A0764E', text: '#FFFFFF' },
}

// Podium (2-3) get banner cards, ranks 4+ are clean rows
const Top10Row = memo(function Top10Row({ dish, rank, town, onClick }) {
  const { dish_name, restaurant_name, avg_rating, total_votes, category } = dish
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING
  const isPodium = rank <= 3
  const podium = PODIUM_COLORS[rank]

  const accessibleLabel = isRanked
    ? `Rank ${rank}: ${dish_name} at ${restaurant_name}, rated ${avg_rating} out of 10 with ${total_votes} votes`
    : `Rank ${rank}: ${dish_name} at ${restaurant_name}, ${total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'new dish'}`

  if (podium) {
    return (
      <button
        onClick={onClick}
        aria-label={accessibleLabel}
        className="w-full text-left rounded-xl overflow-hidden card-press"
        style={{
          background: '#FFFFFF',
          border: '2px solid #1A1A1A',
          boxShadow: rank === 2 ? '3px 3px 0px #1A1A1A' : '2px 2px 0px #1A1A1A',
        }}
      >
        {/* Colored banner bar */}
        <div
          className="px-5 py-2"
          style={{
            background: podium.bg,
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: podium.text,
            }}
          >
            #{rank} {town ? `in ${town}` : 'on the Vineyard'}
          </span>
        </div>
        {/* Content — text left, icon right. #2 is bigger than #3. */}
        <div className={`flex items-center gap-3 ${rank === 2 ? 'py-5 px-5' : 'py-3 px-5'}`}>
          <div className="flex-1 min-w-0">
            <p
              className="font-bold truncate"
              style={{
                color: '#1A1A1A',
                fontSize: rank === 2 ? '18px' : '15px',
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
                marginTop: '3px',
              }}
            >
              {restaurant_name}
            </p>
            <div className="flex items-baseline gap-2" style={{ marginTop: '6px' }}>
              {isRanked ? (
                <>
                  <span
                    className="font-bold"
                    style={{
                      fontFamily: "'aglet-sans', sans-serif",
                      fontSize: rank === 2 ? '22px' : '18px',
                      color: getRatingColor(avg_rating),
                    }}
                  >
                    {avg_rating}
                  </span>
                  <span style={{ fontSize: '11px', color: '#BBBBBB', fontWeight: 500 }}>
                    {total_votes} vote{total_votes === 1 ? '' : 's'}
                  </span>
                </>
              ) : (
                <span className="text-xs font-medium" style={{ color: '#999999' }}>
                  {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
                </span>
              )}
            </div>
          </div>
          <CategoryIcon categoryId={category} dishName={dish_name} size={rank === 2 ? 72 : 60} color="#E4440A" />
        </div>
      </button>
    )
  }

  // Ranks 4+ — clean rows with divider line, editorial list feel
  return (
    <button
      onClick={onClick}
      aria-label={accessibleLabel}
      className="w-full flex gap-3 py-3 px-4 text-left card-press"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #CCCCCC',
      }}
    >
      <span
        className="font-bold flex-shrink-0"
        style={{
          fontFamily: "'aglet-sans', sans-serif",
          fontWeight: 800,
          color: '#1A1A1A',
          fontSize: '14px',
          lineHeight: 1.3,
          minWidth: '20px',
          textAlign: 'center',
        }}
      >
        #{rank}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className="font-bold truncate"
          style={{
            color: '#1A1A1A',
            fontSize: '15px',
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
            marginTop: '3px',
          }}
        >
          {restaurant_name}
        </p>
        <div className="flex items-baseline gap-2" style={{ marginTop: '4px' }}>
          {isRanked ? (
            <>
              <span
                className="font-bold"
                style={{
                  fontFamily: "'aglet-sans', sans-serif",
                  fontSize: '18px',
                  color: getRatingColor(avg_rating),
                }}
              >
                {avg_rating}
              </span>
              <span style={{ fontSize: '11px', color: '#BBBBBB', fontWeight: 500 }}>
                {total_votes} vote{total_votes === 1 ? '' : 's'}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium" style={{ color: '#999999' }}>
              {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
            </span>
          )}
        </div>
      </div>
      <CategoryIcon categoryId={category} dishName={dish_name} size={56} color="#E4440A" />
    </button>
  )
})
