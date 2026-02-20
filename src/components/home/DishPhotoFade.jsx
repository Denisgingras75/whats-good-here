import { useState, useEffect } from 'react'

/**
 * DishPhotoFade — gradient-fade dish photo with shimmer loading state.
 *
 * Renders an absolutely-positioned photo that fades from transparent (left)
 * to visible (right) via CSS mask-image. Shows a shimmer placeholder while
 * the image loads, then fades in over 200ms.
 *
 * Falls back gracefully on error or timeout (5s) — parent should check
 * `onPhotoError` to show CategoryIcon instead.
 *
 * The parent container must have `position: relative` and `overflow: hidden`.
 */
export function DishPhotoFade({ photoUrl, dishName, width = '55%', loading = 'lazy', onPhotoError }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Reset state when URL changes
  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [photoUrl])

  // Timeout — fall back after 5s on slow networks
  useEffect(() => {
    if (loaded || error || !photoUrl) return
    const timer = setTimeout(() => {
      setError(true)
      if (onPhotoError) onPhotoError()
    }, 5000)
    return () => clearTimeout(timer)
  }, [photoUrl, loaded, error])

  if (error) return null

  return (
    <>
      {!loaded && (
        <div className="photo-shimmer" style={{ width }} />
      )}
      <img
        src={photoUrl}
        alt={dishName}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true)
          if (onPhotoError) onPhotoError()
        }}
        className="dish-photo-fade"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 200ms ease',
          width,
        }}
      />
    </>
  )
}
