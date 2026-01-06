import { VoteButtons } from './VoteButtons'
import { getConfidenceIndicator } from '../utils/ranking'

export function DishCard({ dish, onVote, onLoginRequired }) {
  const {
    dish_id,
    dish_name,
    restaurant_name,
    price,
    photo_url,
    total_votes,
    percent_worth_it,
    distance_miles,
  } = dish

  const confidence = getConfidenceIndicator(total_votes || 0)

  return (
    <article className="card-elevated overflow-hidden mb-6 stagger-item">
      {/* Dish Photo - Hero Element */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden group">
        <img
          src={photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'}
          alt={dish_name}
          className="w-full h-full object-cover image-zoom"
          loading="lazy"
        />

        {/* Subtle overlay for better text contrast if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Distance badge - floating on image */}
        {distance_miles && (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-lg">
            <span className="text-xs font-semibold text-neutral-700">
              {Number(distance_miles).toFixed(1)} mi
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Dish Name - Primary Focus */}
        <h3 className="text-xl font-bold text-neutral-900 mb-1 leading-snug font-serif">
          {dish_name}
        </h3>

        {/* Restaurant & Price - Secondary Info */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
          <span className="font-medium">{restaurant_name}</span>
          {price && (
            <>
              <span className="text-neutral-300">•</span>
              <span className="font-semibold text-neutral-900">
                ${Number(price).toFixed(2)}
              </span>
            </>
          )}
        </div>

        {/* Rating Section */}
        {total_votes > 0 ? (
          <div className="mb-4 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="flex items-center justify-between">
              {/* Percentage Display */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-neutral-900 leading-none">
                  {percent_worth_it}
                  <span className="text-2xl text-neutral-500">%</span>
                </span>
                <div className="text-sm text-neutral-600 font-medium">
                  Worth It
                </div>
              </div>

              {/* Confidence Indicator */}
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                confidence.level === 'low'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : confidence.level === 'high'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-neutral-100 text-neutral-600'
              }`}>
                {confidence.icon && (
                  <span className="text-base">{confidence.icon}</span>
                )}
                <span className="text-xs font-semibold whitespace-nowrap">
                  {total_votes} {total_votes === 1 ? 'vote' : 'votes'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 border-dashed">
            <p className="text-sm text-neutral-500 text-center font-medium">
              No votes yet — be the first to review!
            </p>
          </div>
        )}

        {/* Vote Buttons */}
        <VoteButtons
          dishId={dish_id}
          onVote={onVote}
          onLoginRequired={onLoginRequired}
        />
      </div>
    </article>
  )
}
