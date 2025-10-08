<<<<<<< HEAD
import { defineConfig, devices } from '@playwright/test';
=======
import { defineConfig, devices } from '@playwright/test'
>>>>>>> origin/cursor/enhance-github-testing-and-virtual-team-4d10_archive

/**
 * @see https://playwright.dev/docs/test-configuration
 */
<<<<<<< HEAD
// React E2E config (uses Vite preview on 4173)
export default defineConfig({
  testDir: './test/e2e',
=======
export default defineConfig({
  testDir: './tests',
>>>>>>> origin/cursor/enhance-github-testing-and-virtual-team-4d10_archive
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
<<<<<<< HEAD
    ['list'],
    ['html', { outputFolder: 'playwright-report-react' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
=======
    ['html'],
    ['json', { outputFile: 'playwright-results.json' }],
    ['junit', { outputFile: 'playwright-results.xml' }]
>>>>>>> origin/cursor/enhance-github-testing-and-virtual-team-4d10_archive
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
<<<<<<< HEAD
    baseURL: process.env.PW_BASEURL || 'http://localhost:3000',
    /* Collect trace for failures and retries */
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
=======
    baseURL: 'http://localhost:3001',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
>>>>>>> origin/cursor/enhance-github-testing-and-virtual-team-4d10_archive
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    /* Record video on retry */
    video: 'retain-on-failure',
<<<<<<< HEAD
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
=======
>>>>>>> origin/cursor/enhance-github-testing-and-virtual-team-4d10_archive
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
<<<<<<< HEAD
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
=======
      use: { ...devices['Pixel 5'], hasTouch: true },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'], hasTouch: true },
>>>>>>> origin/cursor/enhance-github-testing-and-virtual-team-4d10_archive
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Run your local dev server before starting the tests */
<<<<<<< HEAD
  webServer: {
    command: 'npm run dev:dual',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 240000,
  },
});
=======
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3001',
          reuseExistingServer: !process.env.CI,
          timeout: 30000,
        },
})
>>>>>>> origin/cursor/enhance-github-testing-and-virtual-team-4d10_archive
