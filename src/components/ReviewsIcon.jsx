/**
 * ReviewsIcon - Neon reviews icon for "Reviews" section
 */

export function ReviewsIcon({ size = 20, className = '', active = false }) {
  return (
    <img
      src="/reviews.png"
      alt="reviews"
      className={`inline-block object-contain ${className}`}
      style={{
        width: size,
        height: size,
        filter: active ? 'brightness(1.3) drop-shadow(0 0 3px white)' : 'none',
      }}
    />
  )
}

export default ReviewsIcon
