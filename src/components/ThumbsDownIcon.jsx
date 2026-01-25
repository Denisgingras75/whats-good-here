/**
 * ThumbsDownIcon - Neon thumbs down icon to replace emoji
 */

export function ThumbsDownIcon({ size = 20, className = '', active = false }) {
  return (
    <img
      src="/thumbs-down.png"
      alt="thumbs down"
      className={`inline-block object-contain ${className}`}
      style={{
        width: size,
        height: size,
        filter: active ? 'brightness(1.3) drop-shadow(0 0 3px white)' : 'none',
      }}
    />
  )
}

export default ThumbsDownIcon
