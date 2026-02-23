import { NotificationBell } from './NotificationBell'
import { SettingsDropdown } from './SettingsDropdown'
import { WghLogo } from './WghLogo'

/**
 * TopBar - Brand anchor with WGH food icon logo, settings gear, and notification bell
 */
export function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 12px' }}>
        {/* Spacer for symmetry */}
        <div style={{ width: '28px' }} />

        {/* WGH food icon logo — centered */}
        <WghLogo size={32} />

        {/* Settings + Notifications grouped right */}
        <div className="flex items-center">
          <SettingsDropdown />
          <NotificationBell />
        </div>
      </div>
    </div>
  )
}
