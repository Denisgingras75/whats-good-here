import { NotificationBell } from './NotificationBell'
import { SettingsDropdown } from './SettingsDropdown'
import { useTheme } from '../context/ThemeContext'

/**
 * TopBar - Brand anchor with WGH wordmark, settings gear, and notification bell
 */
export function TopBar() {
  const { theme } = useTheme()
  const wordmark = theme === 'dark' ? '/logo-wordmark-light.svg' : '/logo-wordmark.svg'

  return (
    <div className="top-bar">
      <div className="top-bar-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 12px' }}>
        {/* Spacer for symmetry */}
        <div style={{ width: '28px' }} />

        {/* WGH wordmark — centered */}
        <img
          src={wordmark}
          alt="What's Good Here"
          className="top-bar-icon"
          style={{ height: '22px', width: 'auto' }}
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
