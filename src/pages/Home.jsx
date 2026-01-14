import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from '../hooks/useLocation'
import { useDishes } from '../hooks/useDishes'
import { useSavedDishes } from '../hooks/useSavedDishes'
import { LocationPicker } from '../components/LocationPicker'
import { DishCard as FullDishCard } from '../components/DishCard'
import { LoginModal } from '../components/Auth/LoginModal'
import { getCategoryImage } from '../constants/categoryImages'
import { supabase } from '../lib/supabase'

const TOP_COUNT = 10
const MIN_VOTES_FOR_RANKING = 5

export function Home() {
  const navigate = useNavigate()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const [user, setUser] = useState(null)

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const { location, radius, setRadius, error: locationError } = useLocation()
  const { dishes, loading, error, refetch } = useDishes(
    location,
    radius,
    null,
    null
  )
  const { isSaved, toggleSave } = useSavedDishes(user?.id)

  // Split dishes into ranked (enough votes) and unrated (not enough votes)
  const rankedDishes = dishes?.filter(d => (d.total_votes || 0) >= MIN_VOTES_FOR_RANKING) || []
  const unratedDishes = dishes?.filter(d => (d.total_votes || 0) < MIN_VOTES_FOR_RANKING) || []

  // Build the Top 10 list: ranked first, fill remaining with unrated
  const topRanked = rankedDishes.slice(0, TOP_COUNT)
  const spotsRemaining = TOP_COUNT - topRanked.length
  const fillerDishes = unratedDishes.slice(0, spotsRemaining)

  const handleVote = () => {
    refetch()
  }

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  const handleToggleSave = async (dishId) => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    await toggleSave(dishId)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Header */}
      <header className="px-4 pt-4 pb-2" style={{ background: 'var(--color-bg)' }}>
        <div className="flex items-center justify-between">
          <img
            src="/logo.png"
            alt="What's Good Here"
            className="h-12 w-auto"
          />
          <button
            onClick={() => navigate('/browse')}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 10%, white)',
              color: 'var(--color-primary)'
            }}
          >
            Browse All
          </button>
        </div>
      </header>

      {/* Location Picker */}
      <LocationPicker
        radius={radius}
        onRadiusChange={setRadius}
        location={location}
        error={locationError}
      />

      {/* Main Content */}
      <main className="px-4 py-4">
        {/* Title + Ranking Explanation */}
        <div className="mb-4">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Top 10 within {radius} {radius === 1 ? 'mile' : 'miles'}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            Ranked by % who would order again · Min {MIN_VOTES_FOR_RANKING} votes to qualify
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: 'var(--color-divider)' }}
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Top 10 List */}
        {!loading && !error && (
          <div className="space-y-2">
            {/* Ranked dishes */}
            {topRanked.map((dish, index) => (
              <DishRow
                key={dish.dish_id}
                dish={dish}
                rank={index + 1}
                onClick={() => setSelectedDish(dish)}
                isRanked={true}
              />
            ))}

            {/* Divider if we have filler dishes */}
            {fillerDishes.length > 0 && topRanked.length > 0 && (
              <div className="flex items-center gap-3 py-3">
                <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  New — be first to rate
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
              </div>
            )}

            {/* Unrated filler dishes */}
            {fillerDishes.map((dish, index) => (
              <DishRow
                key={dish.dish_id}
                dish={dish}
                rank={topRanked.length + index + 1}
                onClick={() => setSelectedDish(dish)}
                isRanked={false}
              />
            ))}

            {/* Empty state */}
            {topRanked.length === 0 && fillerDishes.length === 0 && (
              <div className="py-12 text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-surface)' }}
                >
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  No dishes found nearby
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Try increasing your search radius
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!loading && (topRanked.length > 0 || fillerDishes.length > 0) && (
          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'var(--color-divider)' }}>
            <button
              onClick={() => navigate('/browse')}
              className="text-sm font-semibold"
              style={{ color: 'var(--color-primary)' }}
            >
              View all {dishes?.length || 0} dishes →
            </button>
          </div>
        )}
      </main>

      {/* Dish Detail Modal */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedDish(null)}
          />

          {/* Modal Content */}
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl animate-slide-up"
            style={{ background: 'var(--color-surface)' }}
          >
            {/* Handle */}
            <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2" style={{ background: 'var(--color-surface)' }}>
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-divider)' }} />
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Dish Card */}
            <div className="px-4 pb-8">
              <FullDishCard
                dish={selectedDish}
                onVote={handleVote}
                onLoginRequired={handleLoginRequired}
                isFavorite={isSaved ? isSaved(selectedDish.dish_id) : false}
                onToggleFavorite={handleToggleSave}
              />
            </div>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}

// Scannable dish row: # | photo | dish + restaurant | rating | votes | distance
function DishRow({ dish, rank, onClick, isRanked }) {
  const {
    dish_name,
    restaurant_name,
    category,
    photo_url,
    percent_worth_it,
    total_votes,
    distance_miles,
  } = dish

  const imgSrc = photo_url || getCategoryImage(category)
  const votes = total_votes || 0

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] group"
      style={{
        background: 'var(--color-bg)',
        borderColor: 'var(--color-divider)'
      }}
    >
      {/* Rank */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{
          background: rank <= 3 && isRanked ? 'var(--color-primary)' : 'var(--color-surface)',
          color: rank <= 3 && isRanked ? 'white' : 'var(--color-text-tertiary)',
          border: rank <= 3 && isRanked ? 'none' : '1px solid var(--color-divider)'
        }}
      >
        {rank}
      </div>

      {/* Photo */}
      <div
        className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: 'var(--color-surface)' }}
      >
        <img
          src={imgSrc}
          alt={dish_name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Dish + Restaurant */}
      <div className="flex-1 min-w-0 text-left">
        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
          {dish_name}
        </h3>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {restaurant_name}
        </p>
      </div>

      {/* Rating + Votes + Distance */}
      <div className="flex-shrink-0 text-right">
        {isRanked ? (
          <>
            <div className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {Math.round(percent_worth_it)}%
            </div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              {votes} votes{distance_miles ? ` · ${Number(distance_miles).toFixed(1)}mi` : ''}
            </div>
          </>
        ) : (
          <>
            <div
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--color-primary) 12%, white)',
                color: 'var(--color-primary)'
              }}
            >
              New
            </div>
            {distance_miles && (
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                {Number(distance_miles).toFixed(1)} mi
              </div>
            )}
          </>
        )}
      </div>

      {/* Tap indicator */}
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all group-hover:scale-110"
        style={{
          background: 'color-mix(in srgb, var(--color-primary) 10%, white)',
          color: 'var(--color-primary)'
        }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
