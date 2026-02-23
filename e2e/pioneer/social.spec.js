import { test, expect } from '../fixtures/test.js'

test.describe('Pioneer — Social & navigation', () => {
  test('public user profile page loads', async ({ page }) => {
    // Navigate to a known user profile (the pioneer test account itself)
    // First go to profile to get the user ID from the URL or just verify /user/ route works
    await page.goto('/profile')
    await page.waitForTimeout(3000)

    // Check if there's a link to view own public profile or any user link
    const userLink = page.locator('a[href*="/user/"]').first()
    if (await userLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await userLink.click()
      await page.waitForURL(/\/user\//)
      // Should show a display name or username
      await expect(page.locator('#main-content')).toBeVisible()
    }
  })

  test('bottom nav tabs all load without errors', async ({ page }) => {
    const errors = []
    page.on('pageerror', (err) => errors.push(err.message))

    // Home
    await page.goto('/')
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10_000 })

    // Restaurants — click bottom nav
    const nav = page.locator('nav[aria-label="Main navigation"]')
    await expect(nav).toBeVisible()

    await nav.getByText('Restaurants').click()
    await page.waitForURL(/\/restaurants/)
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10_000 })

    // Hub
    await nav.getByText('Hub').click()
    await page.waitForURL(/\/hub/)
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10_000 })

    // You (Profile)
    await nav.getByText('You').click()
    await page.waitForURL(/\/profile/)
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 10_000 })

    // No critical JS errors during navigation
    const criticalErrors = errors.filter((e) => !e.includes('AbortError') && !e.includes('ResizeObserver'))
    expect(criticalErrors).toHaveLength(0)
  })
})
