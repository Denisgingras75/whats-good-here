import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from '../hooks/useLocation'
import { useDishes } from '../hooks/useDishes'
import { DishFeed } from '../components/DishFeed'
import { LoginModal } from '../components/Auth/LoginModal'
import { getCategoryImage } from '../constants/categoryImages'

const QUICK_CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burgers', emoji: '🍔' },
  { id: 'taco', label: 'Tacos', emoji: '🌮' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'lobster roll', label: 'Lobster', emoji: '🦞' },
  { id: 'wings', label: 'Wings', emoji: '🍗' },
]

export function Home() {
  const navigate = useNavigate()
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const { location, radius } = useLocation()
  const { dishes, loading, error, refetch } = useDishes(
    location,
    radius,
    null,
    null
  )

  // Get top 5 dishes only
  const topDishes = dishes?.slice(0, 5) || []

  const handleCategoryClick = (categoryId) => {
    navigate(`/browse?category=${categoryId}`)
  }

  const handleVote = () => {
    refetch()
  }

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 px-6 pt-10 pb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white font-serif leading-tight">
            What are you craving?
          </h1>
          <p className="text-orange-100 mt-2">
            Martha's Vineyard's best dishes
          </p>
        </div>

        {/* Quick Category Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {QUICK_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-all active:scale-95"
            >
              <span className="text-2xl block">{category.emoji}</span>
              <span className="text-white text-sm font-medium mt-1 block">
                {category.label}
              </span>
            </button>
          ))}
        </div>

        {/* See All Link */}
        <button
          onClick={() => navigate('/browse')}
          className="w-full mt-4 text-white/80 text-sm font-medium hover:text-white transition-colors"
        >
          See all categories →
        </button>
      </div>

      {/* Top Picks Section */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900 font-serif">
            Top Rated
          </h2>
          <button
            onClick={() => navigate('/browse')}
            className="text-orange-500 text-sm font-semibold hover:text-orange-600"
          >
            See all
          </button>
        </div>

        {/* Top Dishes */}
        <DishFeed
          dishes={topDishes}
          loading={loading}
          error={error}
          onVote={handleVote}
          onLoginRequired={handleLoginRequired}
          compact
        />
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}
