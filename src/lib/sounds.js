// Sound system for bite sounds
import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storage'

let crunchSound = null

// Initialize sounds on first user interaction
export function preloadSounds() {
  crunchSound = new Audio('/sounds/crunch.wav')
  crunchSound.preload = 'auto'
  crunchSound.volume = 0.5
}

// Check if sounds are muted
export function isSoundMuted() {
  return getStorageItem(STORAGE_KEYS.SOUND_MUTED) === 'true'
}

// Set mute state
export function setSoundMuted(muted) {
  setStorageItem(STORAGE_KEYS.SOUND_MUTED, String(muted))
}

// Toggle mute state
export function toggleSoundMute() {
  const newState = !isSoundMuted()
  setSoundMuted(newState)
  return newState
}

// Play the bite sound
export function playBiteSound() {
  if (isSoundMuted()) return
  if (!crunchSound) return

  crunchSound.currentTime = 0
  crunchSound.play().catch(() => {})
}


