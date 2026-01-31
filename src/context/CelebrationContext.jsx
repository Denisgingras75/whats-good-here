import { createContext, useContext, useState, useCallback } from 'react'

const CelebrationContext = createContext(null)

export function CelebrationProvider({ children }) {
  const [queue, setQueue] = useState([])

  const queueBadgeUnlock = useCallback((badges) => {
    if (!badges || badges.length === 0) return
    setQueue(prev => [...prev, { type: 'badge', badges, id: Date.now() }])
  }, [])

  const dismiss = useCallback(() => {
    setQueue(prev => prev.slice(1))
  }, [])

  const current = queue[0] || null

  return (
    <CelebrationContext.Provider value={{ current, queue, queueBadgeUnlock, dismiss }}>
      {children}
    </CelebrationContext.Provider>
  )
}

export function useCelebration() {
  const ctx = useContext(CelebrationContext)
  if (!ctx) {
    throw new Error('useCelebration must be used within CelebrationProvider')
  }
  return ctx
}
