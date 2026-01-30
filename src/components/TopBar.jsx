import { NotificationBell } from './NotificationBell'

/**
 * TopBar - Brand anchor with notification bell
 */
export function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 12px' }}>
        {/* Martha's Vineyard island silhouette */}
        <img
          src="/mv-outline.png"
          alt="Martha's Vineyard"
          className="top-bar-icon"
          style={{ height: '20px', width: 'auto', opacity: 0.9 }}
        />

        {/* Notification Bell */}
        <NotificationBell />
      </div>
    </div>
  )
}
