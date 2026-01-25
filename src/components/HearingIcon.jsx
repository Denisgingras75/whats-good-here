/**
 * HearingIcon - Neon hearing icon for "Heard Good Here" section
 */

export function HearingIcon({ size = 20, className = '', active = false }) {
  return (
    <img
      src="/hearing.png"
      alt="heard good here"
      className={`inline-block object-contain ${className}`}
      style={{
        width: size,
        height: size,
        filter: active ? 'brightness(1.3) drop-shadow(0 0 3px white)' : 'none',
      }}
    />
  )
}

export default HearingIcon
