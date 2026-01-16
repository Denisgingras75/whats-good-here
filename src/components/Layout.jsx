import { BottomNav } from './BottomNav'
import { WelcomeModal } from './Auth/WelcomeModal'
import { TopBar } from './TopBar'

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <TopBar />
      {children}
      <BottomNav />
      <WelcomeModal />
    </div>
  )
}
