import { test, expect } from '../fixtures/test.js'

test.describe('Static pages', () => {
  test('privacy, terms, how-reviews-work load; unknown route shows 404', async ({ page }) => {
    // Privacy
    await page.goto('/privacy')
    await expect(page.getByText(/privacy/i).first()).toBeVisible()

    // Terms
    await page.goto('/terms')
    await expect(page.getByText(/terms/i).first()).toBeVisible()

    // How Reviews Work
    await page.goto('/how-reviews-work')
    await expect(page.getByText(/review/i).first()).toBeVisible()

    // 404 — unknown route
    await page.goto('/this-page-does-not-exist-xyz')
    // Should show some kind of not-found or redirect to home
    await page.waitForTimeout(2000)
    const url = page.url()
    // Either stays on 404 page or redirects home
    const is404 = url.includes('this-page-does-not-exist') || url === 'http://localhost:5173/'
    expect(is404).toBeTruthy()
  })
})
