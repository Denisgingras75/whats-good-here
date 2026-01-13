import { useState } from 'react'
import { useLocation } from '../hooks/useLocation'
import { useDishes } from '../hooks/useDishes'
import { LocationPicker } from '../components/LocationPicker'
import { DishFeed } from '../components/DishFeed'
import { LoginModal } from '../components/Auth/LoginModal'
import { isSoundMuted, toggleSoundMute } from '../lib/sounds'

export function Home() {
  const { location, radius, setRadius, loading: locationLoading, error: locationError } = useLocation()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [soundMuted, setSoundMuted] = useState(isSoundMuted())

  const handleToggleSound = () => {
    const newMutedState = toggleSoundMute()
    setSoundMuted(newMutedState)
  }

  const { dishes, loading: dishesLoading, error: dishesError, refetch } = useDishes(
    location,
    radius,
    null, // No category filter on home
    null  // No restaurant filter on home
  )

  const handleVote = () => {
    refetch()
  }

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  return (
    <div className="bg-stone-50">
      {/* Header */}
      <header className="relative bg-white border-b border-neutral-200 overflow-hidden">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 opacity-50" />

        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {/* Logo and Title */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <span className="text-2xl">🍽️</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900 font-serif leading-none">
                    What's Good Here
                  </h1>
                  <p className="text-sm text-neutral-600 mt-1 font-medium">
                    Discover the best dishes, skip the rest
                  </p>
                </div>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={handleToggleSound}
                className="w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-neutral-200 flex items-center justify-center transition-all shadow-sm hover:shadow"
                title={soundMuted ? 'Unmute bite sounds' : 'Mute bite sounds'}
              >
                {soundMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Location Picker */}
      <LocationPicker
        radius={radius}
        onRadiusChange={setRadius}
        location={location}
        error={locationError}
      />

      {/* Dish Feed */}
      <main>
        <DishFeed
          dishes={dishes}
          loading={locationLoading || dishesLoading}
          error={dishesError}
          onVote={handleVote}
          onLoginRequired={handleLoginRequired}
        />
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}
