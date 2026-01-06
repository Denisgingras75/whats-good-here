import { useState, useEffect } from 'react'

// Default location: Martha's Vineyard center (between Vineyard Haven, Oak Bluffs, Edgartown)
const DEFAULT_LOCATION = {
  lat: 41.43,
  lng: -70.56,
}

export function useLocation() {
  const [location, setLocation] = useState(null)
  const [radius, setRadius] = useState(5) // Default 5 miles
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLocation(DEFAULT_LOCATION)
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        console.warn('Geolocation error:', err.message)
        setError('Location access denied. Using default location.')
        setLocation(DEFAULT_LOCATION)
        setLoading(false)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    )
  }, [])

  return {
    location,
    radius,
    setRadius,
    loading,
    error,
  }
}
