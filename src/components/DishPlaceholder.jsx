import { RestaurantAvatar, getTownStyle } from './RestaurantAvatar'
import { getCategoryNeonImage } from '../constants/categories'

/**
 * Placeholder for dish cards without a user photo.
 * Shows full-bleed RestaurantAvatar with optional category neon icon overlay.
 */
export function DishPlaceholder({ restaurantName, restaurantTown, category }) {
  const neonIcon = getCategoryNeonImage(category)
  const townStyle = getTownStyle(restaurantTown)

  return neonIcon ? (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: townStyle.bg }}
    >
      <img
        src={neonIcon}
        alt=""
        className="w-4/5 h-4/5 object-contain opacity-40"
      />
    </div>
  ) : (
    <RestaurantAvatar
      name={restaurantName}
      town={restaurantTown}
      fill
    />
  )
}
