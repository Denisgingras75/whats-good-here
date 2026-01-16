import { useState } from 'react'
import { PHOTO_TIERS } from '../constants/photoQuality'

export function PhotoUploadConfirmation({
  dishName,
  photoUrl,
  status = 'community',
  onRateNow,
  onLater,
}) {
  const [showInfo, setShowInfo] = useState(false)
  const tier = PHOTO_TIERS[status] || PHOTO_TIERS.community

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
      <p className="tier-description">{tier.uploadDescription}</p>

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
