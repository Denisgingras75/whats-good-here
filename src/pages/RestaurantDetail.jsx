import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { capture } from '../lib/analytics'
import { useAuth } from '../context/AuthContext'
import { logger } from '../utils/logger'
import { shareOrCopy } from '../utils/share'
import { restaurantsApi } from '../api/restaurantsApi'
import { followsApi } from '../api/followsApi'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useFavorites } from '../hooks/useFavorites'
import { LoginModal } from '../components/Auth/LoginModal'
import { AddDishModal } from '../components/AddDishModal'
import { RestaurantDishes, RestaurantMenu } from '../components/restaurants'
import { useNearbyRestaurant } from '../hooks/useNearbyRestaurant'
import { useRestaurantSpecials } from '../hooks/useSpecials'
import { useRestaurantEvents } from '../hooks/useEvents'
import { SpecialCard } from '../components/SpecialCard'
import { EventCard } from '../components/EventCard'
import { CaretLeft, ShareNetwork, MapPin, ArrowSquareOut, Phone, Globe, FacebookLogo, InstagramLogo, Plus, ShoppingBag } from '@phosphor-icons/react'

export function RestaurantDetail() {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { location, radius } = useLocationContext()

  const [restaurant, setRestaurant] = useState(null)
  const [loadingRestaurant, setLoadingRestaurant] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [activeTab, setActiveTab] = useState(null) // null = auto-detect
  const [dishSearchQuery, setDishSearchQuery] = useState('')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [addDishModalOpen, setAddDishModalOpen] = useState(false)
  const [friendsVotesByDish, setFriendsVotesByDish] = useState({})

  // Fetch restaurant by ID
  useEffect(() => {
    if (!restaurantId) return

    let cancelled = false
    setLoadingRestaurant(true)
    setFetchError(null)

    restaurantsApi.getById(restaurantId)
      .then(data => {
        if (!cancelled) {
          setRestaurant(data)
          capture('restaurant_viewed', {
            restaurant_id: data.id,
            restaurant_name: data.name,
            restaurant_address: data.address,
          })
        }
      })
      .catch(err => {
        if (!cancelled) {
          logger.error('Failed to fetch restaurant:', err)
          setFetchError(err)
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingRestaurant(false)
      })

    return () => { cancelled = true }
  }, [restaurantId])

  // Fetch dishes for this restaurant
  const { dishes, loading: dishesLoading, error: dishesError, refetch } = useDishes(
    location, radius, null, restaurantId
  )

  // Auto-detect best default tab: Menu if no votes yet, Top Rated if votes exist
  useEffect(() => {
    if (activeTab !== null || dishesLoading || !dishes) return
    const hasVotes = dishes.some(d => (d.total_votes || 0) > 0)
    const hasMenuSections = dishes.some(d => d.menu_section)
    setActiveTab(hasVotes ? 'top' : (hasMenuSections ? 'menu' : 'top'))
  }, [dishes, dishesLoading, activeTab])

  const { isFavorite, toggleFavorite } = useFavorites(user?.id)

  // Check if user is physically near this restaurant
  const { nearbyRestaurant } = useNearbyRestaurant()
  const isHere = nearbyRestaurant?.id === restaurantId

  // Fetch specials and events for this restaurant
  const { specials } = useRestaurantSpecials(restaurantId)
  const { events } = useRestaurantEvents(restaurantId)

  // Fetch friend votes
  useEffect(() => {
    if (!restaurantId || !user) {
      setFriendsVotesByDish({})
      return
    }

    let cancelled = false

    async function fetchFriendsVotes() {
      try {
        const votes = await followsApi.getFriendsVotesForRestaurant(restaurantId)
        if (cancelled) return
        const byDish = {}
        votes.forEach(vote => {
          if (!byDish[vote.dish_id]) {
            byDish[vote.dish_id] = []
          }
          byDish[vote.dish_id].push(vote)
        })
        setFriendsVotesByDish(byDish)
      } catch (err) {
        logger.error('Failed to fetch friends votes for restaurant:', err)
        if (!cancelled) setFriendsVotesByDish({})
      }
    }

    fetchFriendsVotes()
    return () => { cancelled = true }
  }, [restaurantId, user])

  const handleVote = () => {
    refetch()
  }

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  const handleToggleFavorite = async (dishId) => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    await toggleFavorite(dishId)
  }

  // Loading state
  if (loadingRestaurant) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <div className="px-4 py-6 space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full" style={{ background: 'var(--color-surface-elevated)' }} />
            <div>
              <div className="h-5 w-40 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
              <div className="h-3 w-24 rounded mt-2" style={{ background: 'var(--color-surface-elevated)' }} />
            </div>
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl" style={{ background: 'var(--color-card)' }} />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center px-4">
          <p role="alert" className="text-sm mb-4" style={{ color: 'var(--color-danger)' }}>
            {fetchError?.message || 'Failed to load restaurant'}
          </p>
          <button
            onClick={() => navigate('/restaurants')}
            className="px-4 py-2 text-sm font-medium rounded-lg"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    )
  }

  if (!restaurant) return null

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--color-bg)' }}>
      <h1 className="sr-only">{restaurant.name}</h1>

      {/* Sticky header with back button */}
      <div
        className="sticky top-0 z-20 px-4 py-3"
        style={{
          background: 'var(--color-bg)',
          boxShadow: 'none',
          borderBottom: '1px solid var(--color-divider)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/restaurants')}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
            style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)' }}
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <div className="min-w-0 flex-1">
            <h2
              className="font-bold truncate"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: '20px',
                letterSpacing: '-0.02em',
              }}
            >
              {restaurant.name}
            </h2>
            <p className="font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
              {dishesLoading ? '…' : `${dishes.length} dish${dishes.length === 1 ? '' : 'es'}`}
              {restaurant.distance_miles != null && (
                <span> · {restaurant.distance_miles} mi away</span>
              )}
            </p>
          </div>
          <button
            onClick={async () => {
              const result = await shareOrCopy({
                url: `${window.location.origin}/restaurants/${restaurantId}`,
                title: restaurant.name,
                text: `Check out ${restaurant.name} on What's Good Here!`,
              })
              capture('restaurant_shared', { restaurant_id: restaurantId, method: result.method })
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
            style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)' }}
            aria-label="Share restaurant"
          >
            <ShareNetwork size={20} weight="duotone" />
          </button>
        </div>
      </div>

      {/* Restaurant Details Card */}
      <div className="px-4 py-4 relative" style={{ background: 'var(--color-bg)' }}>
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
          style={{
            width: '90%',
            background: 'linear-gradient(90deg, transparent, var(--color-divider), transparent)',
          }}
        />
        <div className="space-y-3">
          {restaurant.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 hover:text-orange-400 transition-colors group"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <MapPin size={20} weight="fill" className="mt-0.5 flex-shrink-0 group-hover:opacity-80" style={{ color: 'var(--color-text-tertiary)' }} />
              <span className="text-sm">{restaurant.address}</span>
              <ArrowSquareOut size={16} weight="duotone" className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-divider)' }} />
            </a>
          )}

          {/* Contact info row */}
          {(restaurant.phone || restaurant.website_url || restaurant.facebook_url || restaurant.instagram_url) && (
            <div className="flex items-center gap-3 flex-wrap">
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-accent-gold)' }}
                >
                  <Phone size={16} weight="duotone" />
                  {restaurant.phone}
                </a>
              )}
              {restaurant.website_url && (
                <a
                  href={restaurant.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-accent-gold)' }}
                >
                  <Globe size={16} weight="duotone" />
                  Website
                </a>
              )}
              {restaurant.facebook_url && (
                <a
                  href={restaurant.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-accent-gold)' }}
                >
                  <FacebookLogo size={16} weight="duotone" />
                  Facebook
                </a>
              )}
              {restaurant.instagram_url && (
                <a
                  href={restaurant.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-accent-gold)' }}
                >
                  <InstagramLogo size={16} weight="duotone" />
                  Instagram
                </a>
              )}
            </div>
          )}

          {isHere && (
            <button
              onClick={() => {
                if (!user) { setLoginModalOpen(true); return }
                setAddDishModalOpen(true)
              }}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
              style={{
                background: 'var(--color-accent-gold)',
                color: 'var(--color-bg)',
              }}
            >
              <MapPin size={20} weight="fill" />
              I&apos;m Here — Rate a Dish
            </button>
          )}

          {user && !isHere && (
            <button
              onClick={() => setAddDishModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98]"
              style={{
                background: 'var(--color-accent-gold-muted)',
                color: 'var(--color-accent-gold)',
                border: '1px solid var(--color-accent-gold)',
              }}
            >
              <Plus size={16} weight="bold" />
              Add a dish
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 pt-4">
        <div
          className="flex rounded-xl p-1"
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-divider)',
          }}
          role="tablist"
          aria-label="Restaurant view"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'top'}
            onClick={() => setActiveTab('top')}
            className="flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all"
            style={{
              background: activeTab === 'top' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'top' ? 'white' : 'var(--color-text-secondary)',
              boxShadow: 'none',
            }}
          >
            Top Rated
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'menu'}
            onClick={() => setActiveTab('menu')}
            className="flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all"
            style={{
              background: activeTab === 'menu' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'menu' ? 'white' : 'var(--color-text-secondary)',
              boxShadow: activeTab === 'menu' ? '0 2px 8px -2px rgba(200, 90, 84, 0.4)' : 'none',
            }}
          >
            Menu
          </button>
        </div>
        <div
          className="mt-3 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent-gold), transparent)' }}
        />
      </div>

      {/* Dish Content */}
      {(activeTab || 'top') === 'top' ? (
        <RestaurantDishes
          dishes={dishes}
          loading={dishesLoading}
          error={dishesError}
          onVote={handleVote}
          onLoginRequired={handleLoginRequired}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          user={user}
          searchQuery={dishSearchQuery}
          friendsVotesByDish={friendsVotesByDish}
          onAddDish={() => setAddDishModalOpen(true)}
        />
      ) : (
        <RestaurantMenu
          dishes={dishes}
          loading={dishesLoading}
          error={dishesError}
          searchQuery={dishSearchQuery}
          menuSectionOrder={restaurant?.menu_section_order || []}
        />
      )}

      {/* Happening Here - Specials & Events */}
      {(specials.length > 0 || events.length > 0) && (
        <div className="px-4 py-4">
          <div
            className="mb-3 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-divider), transparent)' }}
          />
          <h3
            className="text-sm font-semibold mb-3 uppercase tracking-wider"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Happening Here
          </h3>
          <div className="space-y-3">
            {specials.map((special) => (
              <SpecialCard
                key={`special-${special.id}`}
                special={{ ...special, restaurants: restaurant }}
                promoted={special.is_promoted}
              />
            ))}
            {events.map((event) => (
              <EventCard
                key={`event-${event.id}`}
                event={{ ...event, restaurants: restaurant }}
                promoted={event.is_promoted}
              />
            ))}
          </div>
        </div>
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <AddDishModal
        isOpen={addDishModalOpen}
        onClose={() => setAddDishModalOpen(false)}
        restaurantId={restaurantId}
        restaurantName={restaurant.name}
        onDishCreated={() => refetch()}
        existingDishes={dishes}
      />

      {/* Sticky bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 px-4 pt-3"
        style={{
          background: 'var(--color-bg)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex gap-2 pb-2">
          {restaurant.toast_slug && (
            <a
              href={'https://order.toasttab.com/online/' + restaurant.toast_slug}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
              style={{
                background: 'var(--color-accent-orange)',
                color: 'var(--color-bg)',
              }}
            >
              <ShoppingBag size={18} weight="duotone" />
              Order Now
            </a>
          )}
          <a
            href={restaurant.lat && restaurant.lng
              ? 'https://www.google.com/maps/dir/?api=1&destination=' + restaurant.lat + ',' + restaurant.lng
              : 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent((restaurant.address || (restaurant.name + ', ' + (restaurant.town || "Martha's Vineyard") + ', MA')))
            }
            target="_blank"
            rel="noopener noreferrer"
            className={(restaurant.toast_slug ? 'flex-1' : 'w-full') + ' flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]'}
            style={{
              background: 'var(--color-accent-gold)',
              color: 'var(--color-bg)',
            }}
          >
            <MapPin size={20} weight="fill" />
            Directions
          </a>
        </div>
      </div>
    </div>
  )
}
