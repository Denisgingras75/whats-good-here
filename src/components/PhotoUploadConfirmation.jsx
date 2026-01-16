import { useState } from 'react'

const TIER_CONFIG = {
  featured: {
    icon: '⭐',
    label: 'Featured',
    description: 'Your photo may be shown as the main image for this dish.',
    color: '#F59E0B', // amber
  },
  community: {
    icon: '👥',
    label: 'Community',
    description: 'Your photo is visible under Community Photos for this dish.',
    color: '#3B82F6', // blue
  },
  hidden: {
    icon: '📁',
    label: 'Saved',
    description: 'Your photo is saved and visible under "See all photos."',
    color: '#6B7280', // gray
    tip: 'Tip: Better lighting or a closer shot can help it become Featured.',
  },
}

export function PhotoUploadConfirmation({
  dishName,
  photoUrl,
  status = 'community',
  onRateNow,
  onLater,
}) {
  const [showInfo, setShowInfo] = useState(false)
  const tier = TIER_CONFIG[status] || TIER_CONFIG.community

  return (
    <div className="photo-upload-confirmation">
      <div className="photo-preview">
        <img src={photoUrl} alt={dishName} />
        <div className="checkmark">✓</div>
      </div>

      <h3>Photo Added!</h3>

      {/* Tier badge */}
      <div
        className="photo-tier-badge"
        style={{ '--tier-color': tier.color }}
      >
        <span className="tier-icon">{tier.icon}</span>
        <span className="tier-label">{tier.label}</span>
      </div>

      {/* Tier explanation */}
      <p className="tier-description">{tier.description}</p>

      {/* Tip for hidden photos */}
      {status === 'hidden' && tier.tip && (
        <p className="tier-tip">{tier.tip}</p>
      )}

      {/* How photos work link */}
      <button
        className="photo-info-link"
        onClick={() => setShowInfo(!showInfo)}
      >
        How photos work {showInfo ? '▲' : '▼'}
      </button>

      {showInfo && (
        <div className="photo-info-content">
          <ul>
            <li>Photos are automatically sorted so the clearest ones represent each dish.</li>
            <li>Everyone can contribute — not all photos are shown the same way.</li>
            <li>Featured photos may appear as the main dish image.</li>
          </ul>
        </div>
      )}

      <p className="rate-prompt">Would you like to rate this dish now?</p>

      <div className="confirmation-buttons">
        <button
          onClick={onRateNow}
          className="btn-primary"
        >
          Rate Now
        </button>
        <button
          onClick={onLater}
          className="btn-secondary"
        >
          Later
        </button>
      </div>

      <p className="hint">
        You can rate this dish anytime from your Profile
      </p>
    </div>
  )
}
