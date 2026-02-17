import { useRef, useCallback, useEffect } from 'react'

// Keys that don't count as "human typing" — editing/navigation only
const EDITING_KEYS = new Set([
  'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Home', 'End', 'PageUp', 'PageDown',
])

// Max flight times to keep for jitter calculation
const MAX_FLIGHT_TIMES = 50
// Flight time bounds (ms) — filter out outliers
const MIN_FLIGHT_MS = 20
const MAX_FLIGHT_MS = 2000
// Minimum human chars before we trust the score
const MIN_CHARS_FOR_SCORE = 20
// Max mutation length to tolerate (autocorrect/autocomplete)
const AUTOCORRECT_TOLERANCE = 15

export function usePurityTracker() {
  const dataRef = useRef({
    humanChars: 0,
    alienChars: 0,
    flightTimes: [],
    lastKeyTime: 0,
  })
  const observerRef = useRef(null)
  const textareaRef = useRef(null)
  const listenersRef = useRef(null)

  // Compute current purity snapshot
  const getPurity = useCallback(() => {
    const { humanChars, alienChars, flightTimes } = dataRef.current
    const total = humanChars + alienChars

    // Not enough signal — return null
    if (total < MIN_CHARS_FOR_SCORE) {
      return { purity: null, jitter: null, humanChars, alienChars }
    }

    const purity = Math.round((humanChars / total) * 100 * 100) / 100

    // Calculate jitter (stddev of flight times)
    let jitter = null
    if (flightTimes.length >= 5) {
      const mean = flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length
      const variance = flightTimes.reduce((sum, t) => sum + (t - mean) ** 2, 0) / flightTimes.length
      jitter = Math.round(Math.sqrt(variance) * 100) / 100
    }

    return { purity, jitter, humanChars, alienChars }
  }, [])

  const handleKeydown = useCallback((e) => {
    const now = performance.now()
    const data = dataRef.current

    // Skip modifier-only keys and editing keys
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (EDITING_KEYS.has(e.key)) return
    // Skip non-printable (single char = printable)
    if (e.key.length !== 1) return

    data.humanChars++

    // Record flight time
    if (data.lastKeyTime > 0) {
      const flight = now - data.lastKeyTime
      if (flight >= MIN_FLIGHT_MS && flight <= MAX_FLIGHT_MS) {
        data.flightTimes.push(flight)
        if (data.flightTimes.length > MAX_FLIGHT_TIMES) {
          data.flightTimes.shift()
        }
      }
    }
    data.lastKeyTime = now
  }, [])

  const handlePaste = useCallback((e) => {
    const pasted = e.clipboardData?.getData('text') || ''
    if (pasted.length > 0) {
      dataRef.current.alienChars += pasted.length
    }
  }, [])

  // Ref callback to attach/detach listeners
  const attachToTextarea = useCallback((node) => {
    // Cleanup previous
    if (listenersRef.current) {
      const { el, keydown, paste } = listenersRef.current
      el.removeEventListener('keydown', keydown)
      el.removeEventListener('paste', paste)
      listenersRef.current = null
    }
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (!node) {
      textareaRef.current = null
      return
    }

    textareaRef.current = node

    // Attach keyboard + paste listeners
    node.addEventListener('keydown', handleKeydown)
    node.addEventListener('paste', handlePaste)
    listenersRef.current = { el: node, keydown: handleKeydown, paste: handlePaste }

    // MutationObserver for non-keyboard insertions (voice input, drag-drop, etc.)
    // Skip small mutations (autocorrect tolerance)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          const addedLength = (mutation.target.textContent || '').length -
            (mutation.oldValue || '').length
          if (addedLength > AUTOCORRECT_TOLERANCE) {
            dataRef.current.alienChars += addedLength
          }
        }
      }
    })

    observer.observe(node, {
      characterData: true,
      characterDataOldValue: true,
      subtree: true,
    })
    observerRef.current = observer
  }, [handleKeydown, handlePaste])

  // Reset tracking data (for when review text is cleared)
  const reset = useCallback(() => {
    dataRef.current = {
      humanChars: 0,
      alienChars: 0,
      flightTimes: [],
      lastKeyTime: 0,
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        const { el, keydown, paste } = listenersRef.current
        el.removeEventListener('keydown', keydown)
        el.removeEventListener('paste', paste)
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return { getPurity, attachToTextarea, reset }
}
