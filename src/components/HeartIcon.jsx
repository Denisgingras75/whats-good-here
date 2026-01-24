/**
 * HeartIcon - Neon heart icon to replace emoji
 */

export function HeartIcon({ size = 20, className = '', active = false }) {
  return (
    <img
      src="/heart.png"
      alt="heart"
      className={`inline-block object-contain ${className}`}
      style={{
        width: size,
        height: size,
        filter: active ? 'brightness(1.3) drop-shadow(0 0 3px white)' : 'none',
      }}
    />
  )
}

export default HeartIcon
