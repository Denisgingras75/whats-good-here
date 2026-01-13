import { BottomNav } from './BottomNav'

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {children}
      <BottomNav />
    </div>
  )
}
