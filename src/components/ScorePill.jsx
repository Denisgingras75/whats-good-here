import { getRatingColor, formatScore10, getScoreBg } from '../utils/ranking'

/**
 * ScorePill — displays a rating score with semantic color.
 *
 * Props:
 *   score    - number (0-10)
 *   size     - 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 *   showMax  - show "/10" suffix (default: false)
 *   variant  - 'filled' | 'text' (default: 'filled')
 */

var SIZE_STYLES = {
  sm: {
    fontSize: '13px',
    padding: '0',
    minWidth: 'auto',
    background: 'transparent',
    borderRadius: '0',
  },
  md: {
    fontSize: '15px',
    padding: '4px 10px',
    minWidth: '44px',
    borderRadius: '8px',
  },
  lg: {
    fontSize: '28px',
    padding: '6px 14px',
    minWidth: '56px',
    borderRadius: '12px',
  },
  xl: {
    fontSize: '48px',
    padding: '8px 18px',
    minWidth: '72px',
    borderRadius: '14px',
  },
}

export function ScorePill({ score, size, showMax, variant }) {
  size = size || 'md'
  showMax = showMax || false
  variant = variant || 'filled'

  var color = getRatingColor(score)
  var formatted = formatScore10(score)
  var sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md
  var isText = variant === 'text' || size === 'sm'

  var style = {
    fontSize: sizeStyle.fontSize,
    padding: sizeStyle.padding,
    minWidth: sizeStyle.minWidth,
    borderRadius: sizeStyle.borderRadius,
    color: color,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  }

  if (!isText) {
    style.background = getScoreBg(score)
  }

  return (
    <span className="score-pill" style={style}>
      {formatted}
      {showMax && (
        <span style={{ fontSize: '0.5em', fontWeight: 600, opacity: 0.5, marginLeft: '3px' }}>
          /10
        </span>
      )}
    </span>
  )
}
