import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests against a running site.
 *
 *   npm run dev                      (or npm run build && npm start)
 *   npm run test:e2e                 (first time: npx playwright install chromium)
 *
 * BASE_URL points the tests at another server; PW_CHANNEL=chrome uses the installed Google Chrome instead of
 * Playwright's own Chromium.
 */
const channel = process.env.PW_CHANNEL || undefined

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // The dev server compiles on demand and can drop connections under load; CI should test a production build.
  workers: 2,
  retries: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, channel } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, channel } },
  ],
})
