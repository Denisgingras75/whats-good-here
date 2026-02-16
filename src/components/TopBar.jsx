import { NotificationBell } from './NotificationBell'
import { SettingsDropdown } from './SettingsDropdown'

/**
 * TopBar - Brand anchor with MV island silhouette, settings gear, and notification bell
 */
export function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 12px' }}>
        {/* Spacer for symmetry */}
        <div style={{ width: '28px' }} />

        {/* Martha's Vineyard island silhouette — centered */}
        <img
          src="/mv-outline.png"
          alt="Martha's Vineyard"
          className="top-bar-icon"
          style={{ height: '28px', width: 'auto', opacity: 0.9 }}
        />

        {/* Settings + Notifications grouped right */}
        <div className="flex items-center">
          <SettingsDropdown />
          <NotificationBell />
        </div>
      </div>
    </div>
  )
}
