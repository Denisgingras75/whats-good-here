import { test as base, expect } from '@playwright/test'

/**
 * Custom test fixture that handles the WelcomeSplash animation.
 *
 * The splash uses a module-level variable (not localStorage), so we
 * dismiss it by clicking on first navigation. Subsequent SPA navigations
 * within the same page context won't trigger it again.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    let splashHandled = false

    // Wrap goto to auto-dismiss splash on first real navigation
    const originalGoto = page.goto.bind(page)
    page.goto = async (url, options) => {
      const response = await originalGoto(url, options)
      if (!splashHandled) {
        splashHandled = true
        try {
          const splash = page.getByRole('button', { name: /Welcome splash/ })
          await splash.waitFor({ state: 'visible', timeout: 3000 })
          await splash.click()
          await splash.waitFor({ state: 'hidden', timeout: 3000 })
        } catch {
          // Splash already gone or not present
        }
      }
      return response
    }

    await use(page)
  },
})

export { expect }
