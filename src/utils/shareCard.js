import { logger } from './logger'

/**
 * Generate a shareable card image using Canvas API.
 * Produces a 1080x1080 image suitable for Instagram feed/stories.
 *
 * @param {{ dishName: string, restaurantName: string, rating: number, wouldOrderAgain: boolean, category?: string }} options
 * @returns {Promise<Blob>} PNG blob of the generated card
 */
export async function generateShareCard({ dishName, restaurantName, rating, wouldOrderAgain, category }) {
  const SIZE = 1080
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')

  // --- Background ---
  // Deep gradient matching Island Depths theme
  const bgGrad = ctx.createLinearGradient(0, 0, 0, SIZE)
  bgGrad.addColorStop(0, '#0D1B22')
  bgGrad.addColorStop(0.5, '#0F1F2B')
  bgGrad.addColorStop(1, '#0D1B22')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Subtle texture dots
  ctx.fillStyle = 'rgba(245, 241, 232, 0.02)'
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * SIZE
    const y = Math.random() * SIZE
    ctx.beginPath()
    ctx.arc(x, y, 1.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // --- Decorative border ---
  const borderInset = 40
  ctx.strokeStyle = 'rgba(200, 90, 84, 0.3)'
  ctx.lineWidth = 2
  roundRect(ctx, borderInset, borderInset, SIZE - borderInset * 2, SIZE - borderInset * 2, 24)
  ctx.stroke()

  // --- Rating circle (center-top area) ---
  const circleY = 340
  const circleRadius = 120

  // Outer glow
  const glowGrad = ctx.createRadialGradient(SIZE / 2, circleY, circleRadius - 20, SIZE / 2, circleY, circleRadius + 40)
  const ratingColor = wouldOrderAgain ? '#6BB384' : '#C85A54'
  glowGrad.addColorStop(0, ratingColor + '40')
  glowGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = glowGrad
  ctx.fillRect(SIZE / 2 - 200, circleY - 200, 400, 400)

  // Circle background
  ctx.beginPath()
  ctx.arc(SIZE / 2, circleY, circleRadius, 0, Math.PI * 2)
  ctx.fillStyle = ratingColor + '20'
  ctx.fill()
  ctx.strokeStyle = ratingColor
  ctx.lineWidth = 4
  ctx.stroke()

  // Rating number
  ctx.fillStyle = '#F5F1E8'
  ctx.font = 'bold 80px "DM Sans", -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(rating.toFixed(1), SIZE / 2, circleY - 8)

  // "/10" below rating
  ctx.fillStyle = 'rgba(245, 241, 232, 0.5)'
  ctx.font = '600 28px "DM Sans", -apple-system, sans-serif'
  ctx.fillText('/10', SIZE / 2, circleY + 48)

  // --- Verdict ---
  const verdict = wouldOrderAgain ? 'Worth ordering' : 'One to skip'
  const verdictY = circleY + circleRadius + 50
  ctx.fillStyle = ratingColor
  ctx.font = '600 32px "DM Sans", -apple-system, sans-serif'
  ctx.fillText(verdict, SIZE / 2, verdictY)

  // --- Dish name ---
  const dishY = 600
  ctx.fillStyle = '#F5F1E8'
  ctx.font = 'bold 56px "DM Sans", -apple-system, sans-serif'
  const dishLines = wrapText(ctx, dishName, SIZE - 160, 56)
  dishLines.forEach((line, i) => {
    ctx.fillText(line, SIZE / 2, dishY + i * 68)
  })

  // --- Restaurant name ---
  const restY = dishY + dishLines.length * 68 + 24
  ctx.fillStyle = '#D9A765'
  ctx.font = '500 36px "DM Sans", -apple-system, sans-serif'
  const restLines = wrapText(ctx, restaurantName, SIZE - 160, 36)
  restLines.forEach((line, i) => {
    ctx.fillText(line, SIZE / 2, restY + i * 44)
  })

  // --- Divider line ---
  const dividerY = restY + restLines.length * 44 + 50
  ctx.strokeStyle = 'rgba(200, 90, 84, 0.4)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(SIZE / 2 - 100, dividerY)
  ctx.lineTo(SIZE / 2 + 100, dividerY)
  ctx.stroke()

  // --- Branding ---
  const brandY = SIZE - 120
  ctx.fillStyle = '#F5F1E8'
  ctx.font = 'bold 36px "DM Sans", -apple-system, sans-serif'
  ctx.fillText("What's Good Here", SIZE / 2, brandY)

  ctx.fillStyle = 'rgba(184, 169, 154, 0.6)'
  ctx.font = '500 22px "DM Sans", -apple-system, sans-serif'
  ctx.fillText('whats-good-here.vercel.app', SIZE / 2, brandY + 40)

  // --- Convert to blob ---
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate share card image'))
      }
    }, 'image/png')
  })
}

/**
 * Share or download the generated card image.
 * Uses Web Share API on mobile (can share directly to Instagram),
 * falls back to download on desktop.
 *
 * @param {Blob} blob - PNG image blob
 * @param {string} dishName - For the filename
 * @returns {Promise<{ method: string, success: boolean }>}
 */
export async function shareCardImage(blob, dishName) {
  const fileName = `whats-good-here-${dishName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`
  const file = new File([blob], fileName, { type: 'image/png' })

  // Try Web Share API with file (works on iOS/Android - opens Instagram directly)
  if (navigator.share && navigator.canShare) {
    const shareData = { files: [file] }
    if (navigator.canShare(shareData)) {
      try {
        await navigator.share({
          files: [file],
          title: "What's Good Here",
          text: `Check out my rating on What's Good Here!`,
        })
        return { method: 'native', success: true }
      } catch (err) {
        if (err.name === 'AbortError') {
          return { method: 'native', success: false }
        }
        // Fall through to download
      }
    }
  }

  // Fallback: download the image
  try {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return { method: 'download', success: true }
  } catch (err) {
    logger.error('Failed to download share card:', err)
    return { method: 'download', success: false }
  }
}

// --- Helpers ---

/**
 * Draw a rounded rectangle path (no fill/stroke — caller does that)
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * Wrap text into multiple lines that fit within maxWidth
 */
function wrapText(ctx, text, maxWidth, fontSize) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)

  // Limit to 3 lines max with ellipsis
  if (lines.length > 3) {
    lines.length = 3
    lines[2] = lines[2].slice(0, -3) + '...'
  }

  return lines
}
