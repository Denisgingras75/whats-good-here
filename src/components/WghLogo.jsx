/**
 * WghLogo — Three food icons spelling WGH.
 * Cup (W) + Pizza Box (G) + Fry Box (H)
 *
 * Props:
 *   size      - base height in px (default: 40)
 *   color     - icon fill color (default: var(--color-accent-gold))
 *   textColor - letter color (default: var(--color-bg))
 *   className - extra class
 *   style     - extra styles
 */
export function WghLogo({ size = 40, color = 'var(--color-accent-gold)', textColor = 'var(--color-text-on-primary)', className = '', style = {} }) {
  var scale = size / 52
  var width = Math.round(156 * scale)

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 156 52"
      width={width}
      height={size}
      className={className}
      style={style}
      aria-label="What's Good Here"
      role="img"
    >
      {/* Soft drink cup — W */}
      <g transform="translate(0,0)">
        <path d="M10 18 L8 46 C8 48 10 50 14 50 L30 50 C34 50 36 48 36 46 L34 18 Z" fill={color} />
        <path d="M7 16 C7 12 14 9 22 9 C30 9 37 12 37 16 L37 18 L7 18 Z" fill={color} />
        <rect x="24" y="2" width="3" height="16" rx="1.5" fill={color} transform="rotate(8, 25.5, 10)" />
        <text x="22" y="40" textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="18" fill={textColor} letterSpacing="-0.5">W</text>
      </g>

      {/* Pizza box — G */}
      <g transform="translate(52,0)">
        <rect x="4" y="26" width="44" height="24" rx="3" fill={color} />
        <path d="M4 26 L4 20 C4 18 6 16 8 16 L44 16 C46 16 48 18 48 20 L48 26 Z" fill={color} />
        <line x1="4" y1="26" x2="48" y2="26" stroke={textColor} strokeWidth="1.5" opacity="0.3" />
        <circle cx="26" cy="23" r="4" fill={textColor} opacity="0.15" />
        <text x="26" y="45" textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="18" fill={textColor} letterSpacing="-0.5">G</text>
      </g>

      {/* French fry box — H */}
      <g transform="translate(108,0)">
        <path d="M10 20 L6 46 C6 48 8 50 12 50 L36 50 C40 50 42 48 42 46 L38 20 Z" fill={color} />
        <path d="M10 20 L10 16 C10 15 11 14 12 14 L36 14 C37 14 38 15 38 16 L38 20 Z" fill={color} />
        <rect x="14" y="4" width="4" height="16" rx="2" fill={color} transform="rotate(-8, 16, 12)" />
        <rect x="22" y="2" width="4" height="18" rx="2" fill={color} transform="rotate(3, 24, 11)" />
        <rect x="30" y="5" width="4" height="15" rx="2" fill={color} transform="rotate(10, 32, 12)" />
        <text x="24" y="42" textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="18" fill={textColor} letterSpacing="-0.5">H</text>
      </g>
    </svg>
  )
}
