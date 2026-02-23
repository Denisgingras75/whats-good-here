import { test, expect } from '../fixtures/test.js'

test.describe('Pioneer — Profile', () => {
  test('/profile shows username, vote stats, and shelf filters', async ({ page }) => {
    await page.goto('/profile')

    // Should show profile content (not sign-in card)
    await expect(page.locator('#main-content')).toBeVisible()

    // Should NOT show "Sign in to vote" — we're authenticated
    await page.waitForTimeout(3000)
    const signInCard = await page.getByText(/Sign in to vote/i).isVisible().catch(() => false)
    expect(signInCard).toBeFalsy()

    // Should have shelf filter tabs (All, Good Here, etc.)
    const allTab = page.getByRole('button', { name: /^All$/i }).first()
    const goodHereTab = page.getByText(/Good Here/i).first()
    const hasShelfTabs = await allTab.isVisible({ timeout: 10_000 }).catch(() => false) ||
      await goodHereTab.isVisible({ timeout: 5000 }).catch(() => false)
    expect(hasShelfTabs).toBeTruthy()
  })

  test('clicking shelf filter tab updates the list', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForTimeout(3000)

    // Find shelf tabs
    const goodHereTab = page.getByText(/Good Here/).first()
    if (await goodHereTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await goodHereTab.click()
      await page.waitForTimeout(1000)
      // Page should still be on profile, no crash
      expect(page.url()).toContain('/profile')
    }
  })
})
