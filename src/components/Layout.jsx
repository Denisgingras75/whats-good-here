import { BottomNav } from './BottomNav'
import { WelcomeModal } from './Auth/WelcomeModal'

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {children}
      <BottomNav />
      <WelcomeModal />
    </div>
  )
}
