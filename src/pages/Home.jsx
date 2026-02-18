import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useProfile } from '../hooks/useProfile'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { BROWSE_CATEGORIES } from '../constants/categories'
import { NearbyDiscovery } from '../components/home'
import { DishSearch } from '../components/DishSearch'
import { RadiusSheet } from '../components/LocationPicker'
import { NearbyNudge } from '../components/NearbyNudge'
import {
  PizzaSVG, BurgerSVG, SandwichSVG, WingsSVG, SushiSVG, TacoSVG,
  BreakfastSVG, LobsterRollSVG, SeafoodSVG, ChowderSVG, PastaSVG,
  SaladSVG, TendysSVG, DessertSVG, CoffeeSVG, CocktailSVG,
  FriesSVG, SoupSVG, PokeBowlSVG, FriedChickenSVG, AppsSVG, EntreeSVG,
  BreakfastSandwichSVG,
} from '../components/foods'

// Map category IDs to SVG components
const CATEGORY_SVG_MAP = {
  pizza: PizzaSVG,
  burger: BurgerSVG,
  sandwich: SandwichSVG,
  wings: WingsSVG,
  sushi: SushiSVG,
  taco: TacoSVG,
  breakfast: BreakfastSVG,
  'lobster roll': LobsterRollSVG,
  seafood: SeafoodSVG,
  chowder: ChowderSVG,
  pasta: PastaSVG,
  salad: SaladSVG,
  tendys: TendysSVG,
  dessert: DessertSVG,
  coffee: CoffeeSVG,
  cocktails: CocktailSVG,
  fries: FriesSVG,
  soup: SoupSVG,
  pokebowl: PokeBowlSVG,
  'fried chicken': FriedChickenSVG,
  apps: AppsSVG,
  entree: EntreeSVG,
  'breakfast sandwich': BreakfastSandwichSVG,
}

// Render food illustration SVG for a category
function FoodIcon({ category, size = 48, className = '' }) {
  const SVGComponent = CATEGORY_SVG_MAP[category?.toLowerCase()]
  if (!SVGComponent) {
    // Fallback emoji for categories without SVGs
    const cat = BROWSE_CATEGORIES.find(c => c.id === category?.toLowerCase())
    return <span style={{ fontSize: `${size * 0.65}px` }}>{cat?.emoji || '🍽️'}</span>
  }
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ overflow: 'visible' }}
    >
      <SVGComponent eatenPercent={0} value={0} />
    </svg>
  )
}

// Home category grid items
const HOME_CATEGORIES = [
  { id: 'pizza', label: 'Pizza' },
  { id: 'burger', label: 'Burgers' },
  { id: 'sandwich', label: 'Sandwiches' },
  { id: 'wings', label: 'Wings' },
  { id: 'sushi', label: 'Sushi' },
  { id: 'taco', label: 'Tacos' },
]

export function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)

  const { location, radius, setRadius, town, permissionState } = useLocationContext()
  const [showRadiusSheet, setShowRadiusSheet] = useState(false)

  const { dishes, loading, error } = useDishes(location, radius, null, null, town)

  const rankSort = (a, b) => {
    const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
    const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
    if (aRanked && !bRanked) return -1
    if (!aRanked && bRanked) return 1
    return (b.avg_rating || 0) - (a.avg_rating || 0)
  }

  // Top 10 dishes
  const top10Dishes = useMemo(() => {
    if (!dishes?.length) return []
    return dishes.slice().sort(rankSort).slice(0, 10)
  }, [dishes])

  // "More Top Picks" — dishes 11-20
  const moreTopPicks = useMemo(() => {
    if (!dishes?.length) return []
    return dishes.slice().sort(rankSort).slice(10, 20)
  }, [dishes])

  return (
    <div className="min-h-screen pb-20" style={{ background: '#FFFFFF' }}>
      <h1 className="sr-only">What&apos;s Good Here - Top Ranked Dishes Near You</h1>

      {/* Header: Logo */}
      <header className="px-5 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: '#F97316',
              border: '3px solid #000000',
              boxShadow: '4px 4px 0px 0px #000000',
            }}
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#000000" stroke="none">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h2 style={{ color: '#000000', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em' }}>
            What&apos;s Good Here
          </h2>
        </div>
      </header>

      {/* Search bar */}
      <div className="px-5 py-3">
        <DishSearch loading={loading} placeholder="What are you craving?" town={town} />
      </div>

      {/* Category Grid — 2x3 brutal cards with food illustrations */}
      <section className="px-5 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {HOME_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/browse?category=${encodeURIComponent(cat.id)}`)}
              className="flex flex-col items-center justify-center py-4 rounded-xl transition-all duration-150"
              style={{
                background: '#FFFFFF',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0px 0px #000000',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translate(2px, 2px)'
                e.currentTarget.style.boxShadow = '2px 2px 0px 0px #000000'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)'
                e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)'
                e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000'
              }}
            >
              <FoodIcon category={cat.id} size={52} />
              <span className="mt-1.5 text-sm" style={{ color: '#000000', fontWeight: 700 }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* See all categories link */}
        <button
          onClick={() => navigate('/browse')}
          className="w-full mt-3 py-2.5 text-sm text-center rounded-xl transition-all duration-150"
          style={{
            color: '#000000',
            fontWeight: 700,
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
            background: '#F97316',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(2px, 2px)'
            e.currentTarget.style.boxShadow = '2px 2px 0px 0px #000000'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)'
            e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)'
            e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000'
          }}
        >
          See all categories
        </button>
      </section>

      {/* Nearby nudge / check-in */}
      <NearbyNudge />

      {/* Locals' Top 10 */}
      <section className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ color: '#000000', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Locals&apos; Top 10
          </h2>
          <button
            onClick={() => setShowRadiusSheet(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs transition-all duration-150"
            style={{
              border: '3px solid #000000',
              color: '#000000',
              fontWeight: 700,
              boxShadow: '3px 3px 0px 0px #000000',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(2px, 2px)'
              e.currentTarget.style.boxShadow = '1px 1px 0px 0px #000000'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)'
              e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)'
              e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000'
            }}
          >
            {radius} mi
          </button>
        </div>

        {loading ? (
          <Top10Skeleton />
        ) : error ? (
          <div
            className="py-8 text-center rounded-xl"
            style={{ border: '3px solid #000000', boxShadow: '6px 6px 0px 0px #000000' }}
          >
            <p role="alert" className="text-sm" style={{ color: '#DC2626', fontWeight: 700 }}>
              {error?.message || error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-5 py-2 text-sm rounded-xl"
              style={{
                background: '#F97316',
                color: '#000000',
                fontWeight: 700,
                border: '3px solid #000000',
                boxShadow: '4px 4px 0px 0px #000000',
              }}
            >
              Retry
            </button>
          </div>
        ) : top10Dishes.length > 0 ? (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '3px solid #000000', boxShadow: '6px 6px 0px 0px #000000' }}
          >
            {top10Dishes.map((dish, i) => (
              <button
                key={dish.id}
                onClick={() => navigate(`/dish/${dish.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                style={{
                  borderBottom: i < top10Dishes.length - 1 ? '2px solid #000000' : 'none',
                  background: '#FFFFFF',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF7ED' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF' }}
              >
                {/* Rank number */}
                <span
                  className="w-7 text-center flex-shrink-0"
                  style={{
                    color: i < 3 ? '#F97316' : '#666666',
                    fontSize: i < 3 ? '20px' : '15px',
                    fontWeight: 800,
                  }}
                >
                  {i + 1}
                </span>

                {/* Dish info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ color: '#000000', fontSize: '15px', fontWeight: 700 }}>
                    {dish.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#666666' }}>
                    {dish.restaurant_name}
                  </p>
                </div>

                {/* Rating badge — Neo-Brutalist */}
                <RatingBadge rating={dish.avg_rating} votes={dish.total_votes} />

                {/* Category food illustration */}
                <div className="flex-shrink-0">
                  <FoodIcon category={dish.category} size={28} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            <EmptyState onBrowse={(path) => navigate(path || '/restaurants')} />
            <NearbyDiscovery />
          </>
        )}
      </section>

      {/* More Top Picks — horizontal scroll cards with food illustrations */}
      {!loading && moreTopPicks.length > 0 && (
        <section className="py-4">
          <h2
            className="px-5 mb-3"
            style={{ color: '#000000', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            More Top Picks
          </h2>
          <div
            className="flex gap-3 px-5 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {moreTopPicks.map((dish) => (
              <button
                key={dish.id}
                onClick={() => navigate(`/dish/${dish.id}`)}
                className="flex-shrink-0 w-44 rounded-xl overflow-hidden text-left transition-all duration-150"
                style={{
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0px 0px #000000',
                  background: '#FFFFFF',
                }}
              >
                {/* Food illustration area */}
                <div
                  className="h-28 flex items-center justify-center"
                  style={{ background: '#FFF7ED', borderBottom: '3px solid #000000' }}
                >
                  <FoodIcon category={dish.category} size={64} />
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate flex-1" style={{ color: '#000000', fontSize: '14px', fontWeight: 700 }}>
                      {dish.name}
                    </p>
                    <RatingBadge rating={dish.avg_rating} votes={dish.total_votes} size="sm" />
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: '#666666' }}>
                    {dish.restaurant_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Browse all button */}
      {!loading && !error && top10Dishes.length > 0 && (
        <div className="px-5 pb-6 text-center">
          <button
            onClick={() => navigate('/browse')}
            className="w-full py-3 rounded-xl text-sm transition-all duration-150"
            style={{
              background: '#F97316',
              color: '#000000',
              fontWeight: 800,
              border: '3px solid #000000',
              boxShadow: '6px 6px 0px 0px #000000',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(3px, 3px)'
              e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)'
              e.currentTarget.style.boxShadow = '6px 6px 0px 0px #000000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)'
              e.currentTarget.style.boxShadow = '6px 6px 0px 0px #000000'
            }}
          >
            Browse all dishes
          </button>
        </div>
      )}

      <RadiusSheet
        isOpen={showRadiusSheet}
        onClose={() => setShowRadiusSheet(false)}
        radius={radius}
        onRadiusChange={setRadius}
      />
    </div>
  )
}

// Neo-Brutalist rating badge — 1-10 decimal, orange bg, black border, hard shadow
function RatingBadge({ rating, votes, size = 'md' }) {
  const isRanked = (votes || 0) >= MIN_VOTES_FOR_RANKING
  if (!isRanked) {
    return (
      <span
        className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-lg"
        style={{
          background: '#F5F5F5',
          color: '#666666',
          fontWeight: 700,
          border: '2px solid #000000',
        }}
      >
        Early
      </span>
    )
  }

  const isSm = size === 'sm'
  return (
    <span
      className={`flex-shrink-0 ${isSm ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-0.5'} rounded-lg`}
      style={{
        background: '#F97316',
        color: '#000000',
        fontWeight: 800,
        border: '2px solid #000000',
        boxShadow: '2px 2px 0px 0px #000000',
      }}
    >
      {rating || '—'}
    </span>
  )
}

// Skeleton for Top 10
function Top10Skeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{ border: '3px solid #000000', boxShadow: '6px 6px 0px 0px #000000' }}
    >
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: i < 4 ? '2px solid #000000' : 'none' }}
        >
          <div className="w-7 h-5 rounded" style={{ background: '#F5F5F5' }} />
          <div className="flex-1">
            <div className="h-4 w-32 rounded mb-1" style={{ background: '#F5F5F5' }} />
            <div className="h-3 w-24 rounded" style={{ background: '#F5F5F5' }} />
          </div>
          <div className="h-6 w-10 rounded-lg" style={{ background: '#F5F5F5', border: '2px solid #000000' }} />
        </div>
      ))}
    </div>
  )
}

// Empty state
function EmptyState({ onBrowse }) {
  return (
    <div
      className="py-10 text-center rounded-xl"
      style={{ border: '3px solid #000000', boxShadow: '6px 6px 0px 0px #000000' }}
    >
      <FoodIcon category="entree" size={56} />
      <p className="mt-3" style={{ color: '#000000', fontSize: '16px', fontWeight: 800 }}>
        No dishes rated here yet
      </p>
      <p className="text-sm mt-1" style={{ color: '#666666' }}>
        Be the first to rate a dish nearby
      </p>
      <button
        onClick={() => onBrowse('/restaurants')}
        className="mt-4 px-6 py-2.5 rounded-xl text-sm transition-all duration-150"
        style={{
          background: '#F97316',
          color: '#000000',
          fontWeight: 700,
          border: '3px solid #000000',
          boxShadow: '4px 4px 0px 0px #000000',
        }}
      >
        Browse Restaurants
      </button>
    </div>
  )
}
