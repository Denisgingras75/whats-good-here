import { BottomNav } from './BottomNav'
import { WelcomeModal } from './Auth/WelcomeModal'
import { WelcomeSplash } from './WelcomeSplash'
import { TopBar } from './TopBar'

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <WelcomeSplash />
      <TopBar />
      {children}
      <BottomNav />
      <WelcomeModal />
    </div>
  )
}
