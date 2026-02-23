import { test, expect } from '@playwright/test'

// These tests run WITHOUT storageState (fresh browser)
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Pioneer — Login flows', () => {
  test('log in via email/password redirects to home', async ({ page }) => {
    const email = process.env.E2E_PIONEER_EMAIL
    const password = process.env.E2E_PIONEER_PASSWORD
    if (!email || !password) test.skip()

    await page.goto('/login')

    // Dismiss splash if present
    try {
      const splash = page.getByRole('button', { name: /Welcome splash/ })
      await splash.waitFor({ state: 'visible', timeout: 3000 })
      await splash.click()
      await splash.waitFor({ state: 'hidden', timeout: 3000 })
    } catch {
      // No splash
    }

    // Navigate to sign-in flow
    await page.getByText('Already have an account? Sign in').click()
    await page.getByRole('button', { name: /Sign in with Email/i }).click()

    // Fill and submit
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByPlaceholder('Enter your password').fill(password)
    await page.getByRole('button', { name: /Sign In/i }).click()

    // Should redirect to home
    await page.waitForURL('/', { timeout: 15_000 })
    await expect(page.locator('#main-content')).toBeVisible()
  })

  test('/profile without auth redirects to login', async ({ page }) => {
    await page.goto('/profile')

    // Dismiss splash if present
    try {
      const splash = page.getByRole('button', { name: /Welcome splash/ })
      await splash.waitFor({ state: 'visible', timeout: 3000 })
      await splash.click()
      await splash.waitFor({ state: 'hidden', timeout: 3000 })
    } catch {
      // No splash
    }

    // ProtectedRoute should redirect to /login or show sign-in card
    await page.waitForTimeout(3000)
    const url = page.url()
    const hasLoginUrl = url.includes('/login')
    const hasSignInCard = await page.getByText(/Sign in to vote/i).isVisible().catch(() => false)
    expect(hasLoginUrl || hasSignInCard).toBeTruthy()
  })
})
