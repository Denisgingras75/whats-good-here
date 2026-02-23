import { getRatingColor, formatScore10 } from '../utils/ranking'

/**
 * ScorePill — displays a rating score with semantic color.
 *
 * Props:
 *   score    - number (0-10)
 *   size     - 'sm' | 'md' | 'lg' (default: 'md')
 *   showMax  - show "/10" suffix (default: false)
 *   variant  - 'filled' | 'text' (default: 'filled')
 */

function getScoreBg(score) {
  if (score === null || score === undefined) return 'transparent'
  const n = Number(score)
  if (n >= 8.0) return 'var(--color-score-great-bg)'
  if (n >= 6.5) return 'var(--color-score-good-bg)'
  if (n >= 5.0) return 'var(--color-score-mid-bg)'
  return 'var(--color-score-low-bg)'
}

const SIZE_STYLES = {
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
}

export function ScorePill({ score, size = 'md', showMax = false, variant = 'filled' }) {
  const color = getRatingColor(score)
  const formatted = formatScore10(score)
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md
  const isText = variant === 'text' || size === 'sm'

  const style = {
    ...sizeStyle,
    color,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  if (!isText) {
    style.background = getScoreBg(score)
  }

  return (
    <span className="score-pill" style={style}>
      {formatted}
      {showMax && (
        <span style={{ fontSize: '0.6em', fontWeight: 600, opacity: 0.6, marginLeft: '2px' }}>
          /10
        </span>
      )}
    </span>
  )
}
