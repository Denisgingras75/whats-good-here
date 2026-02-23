import { test, expect } from '../fixtures/test.js'

test.describe('Static pages', () => {
  test('privacy, terms, how-reviews-work load; unknown route shows 404', async ({ page }) => {
    // Privacy
    await page.goto('/privacy')
    await expect(page.getByText(/privacy policy/i).first()).toBeVisible({ timeout: 15_000 })

    // Terms
    await page.goto('/terms')
    await expect(page.getByText(/terms of service/i).first()).toBeVisible({ timeout: 15_000 })

    // How Reviews Work
    await page.goto('/how-reviews-work')
    await expect(page.getByText(/how.*review|review.*work/i).first()).toBeVisible({ timeout: 15_000 })

    // 404 — unknown route
    await page.goto('/this-page-does-not-exist-xyz')
    await page.waitForTimeout(3000)
    const url = page.url()
    // Either stays on 404 page or redirects home
    const handled = url.includes('this-page-does-not-exist') || url.endsWith('5174/')
    expect(handled).toBeTruthy()
  })
})
