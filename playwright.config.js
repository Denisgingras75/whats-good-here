import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 390, height: 844 },
    geolocation: { latitude: 41.43, longitude: -70.56 },
    permissions: ['geolocation'],
  },

  projects: [
    // --- Setup projects (produce storageState for auth personas) ---
    {
      name: 'pioneer-setup',
      testMatch: /pioneer\/auth\.setup\.js/,
    },
    {
      name: 'business-setup',
      testMatch: /business\/auth\.setup\.js/,
    },

    // --- Browser persona: no auth, two engines ---
    {
      name: 'browser-chromium',
      testDir: './e2e/browser',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'browser-webkit',
      testDir: './e2e/browser',
      use: { ...devices['iPhone 14'] },
    },

    // --- Pioneer persona: authenticated foodie ---
    {
      name: 'pioneer-chromium',
      testDir: './e2e/pioneer',
      testIgnore: /auth\.setup\.js/,
      dependencies: ['pioneer-setup'],
      use: {
        ...devices['Pixel 7'],
        storageState: 'e2e/.auth/pioneer.json',
      },
    },

    // --- Business persona: restaurant manager ---
    {
      name: 'business-chromium',
      testDir: './e2e/business',
      testIgnore: /auth\.setup\.js/,
      dependencies: ['business-setup'],
      use: {
        ...devices['Pixel 7'],
        storageState: 'e2e/.auth/business.json',
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
