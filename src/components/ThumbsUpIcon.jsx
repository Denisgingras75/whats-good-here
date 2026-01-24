/**
 * ThumbsUpIcon - Neon thumbs up icon to replace emoji
 */

export function ThumbsUpIcon({ size = 20, className = '', active = false }) {
  return (
    <img
      src="/thumbs-up.png"
      alt="thumbs up"
      className={`inline-block object-contain ${className}`}
      style={{
        width: size,
        height: size,
        filter: active ? 'brightness(1.3) drop-shadow(0 0 3px white)' : 'none',
      }}
    />
  )
}

export default ThumbsUpIcon
