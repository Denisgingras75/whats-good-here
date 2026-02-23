import { test as setup, expect } from '@playwright/test'

setup('authenticate as pioneer', async ({ page }) => {
  const email = process.env.E2E_PIONEER_EMAIL
  const password = process.env.E2E_PIONEER_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Missing E2E_PIONEER_EMAIL or E2E_PIONEER_PASSWORD env vars. ' +
      'Add them to .env.local (see plan prerequisites).'
    )
  }

  await page.goto('/login')

  // Dismiss splash if it appears
  try {
    const splash = page.getByRole('button', { name: /Welcome splash/ })
    await splash.waitFor({ state: 'visible', timeout: 3000 })
    await splash.click()
    await splash.waitFor({ state: 'hidden', timeout: 3000 })
  } catch {
    // No splash on login page (no Layout wrapper)
  }

  // Click "Already have an account? Sign in" to get to auth options
  await page.getByText('Already have an account? Sign in').click()

  // Click "Sign in with Email" to get to the email form
  await page.getByRole('button', { name: /Sign in with Email/i }).click()

  // Fill email and password
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Enter your password').fill(password)

  // Submit
  await page.getByRole('button', { name: /Sign In/i }).click()

  // Wait for redirect to home
  await page.waitForURL('/', { timeout: 15_000 })
  await expect(page.locator('#main-content')).toBeVisible()

  // Save auth state
  await page.context().storageState({ path: 'e2e/.auth/pioneer.json' })
})
