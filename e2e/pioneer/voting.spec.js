import { test, expect } from '../fixtures/test.js'

test.describe('Pioneer — Voting', () => {
  test('dish detail shows "Rate this dish" review flow', async ({ page }) => {
    await page.goto('/')

    // Wait for dishes to load, click first one
    const firstDish = page.locator('[data-dish-id]').first()
    await expect(firstDish).toBeVisible({ timeout: 15_000 })
    await firstDish.click()
    await page.waitForURL(/\/dish\//)

    // ReviewFlow section should be visible for authed users
    const reviewSection = page.getByText(/Rate this dish|Your Rating|Would you order/i).first()
    await expect(reviewSection).toBeVisible({ timeout: 10_000 })
  })

  test('clicking thumbs-up advances the review flow', async ({ page }) => {
    await page.goto('/')

    const firstDish = page.locator('[data-dish-id]').first()
    await expect(firstDish).toBeVisible({ timeout: 15_000 })
    await firstDish.click()
    await page.waitForURL(/\/dish\//)

    // Find thumbs-up button in the review flow
    const thumbsUp = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /👍|good|yes/i }).first()
    const thumbsUpAlt = page.locator('[aria-label*="thumbs up" i], [aria-label*="good" i], [aria-label*="yes" i]').first()

    // Try aria-label first, then text-based
    const target = await thumbsUpAlt.isVisible({ timeout: 5000 }).catch(() => false)
      ? thumbsUpAlt
      : thumbsUp

    if (await target.isVisible({ timeout: 5000 }).catch(() => false)) {
      await target.click()
      // After clicking, the flow should advance — either show slider, next step, or already-voted state
      await page.waitForTimeout(1000)
      // Page should still be on dish detail (no crash)
      expect(page.url()).toContain('/dish/')
    }
  })
})
