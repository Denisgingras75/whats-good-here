import { createContext, useContext, useState, useEffect } from 'react'
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../lib/storage'

const ThemeContext = createContext()

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return getStorageItem(STORAGE_KEYS.THEME) || 'dark'
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function setTheme(newTheme) {
    setThemeState(newTheme)
    setStorageItem(STORAGE_KEYS.THEME, newTheme)
    applyTheme(newTheme)
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
