import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Browse } from './pages/Browse'
import { Restaurants } from './pages/Restaurants'
import { Profile } from './pages/Profile'
import { preloadSounds } from './lib/sounds'

function App() {
  // Preload sound files on app start
  useEffect(() => {
    preloadSounds()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/browse" element={<Layout><Browse /></Layout>} />
        <Route path="/restaurants" element={<Layout><Restaurants /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
