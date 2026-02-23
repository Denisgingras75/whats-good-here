import { test, expect } from '../fixtures/test.js'

test.describe('Hub — Events and guides', () => {
  test('/hub loads with filter chips and guide cards', async ({ page }) => {
    await page.goto('/hub')

    // Should show filter chips (All, Events, Specials)
    await expect(page.getByRole('button', { name: /^All$/i }).first()).toBeVisible({ timeout: 20_000 })

    // Should show Food Guides section with guide cards
    const guideText = page.getByText(/must-try|lobster roll|seafood|pizza|breakfast|burger|chowder/i).first()
    await expect(guideText).toBeVisible({ timeout: 10_000 })
  })
})
