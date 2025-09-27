import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['json', { outputFile: 'playwright-results.json' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
  ],
  use: {
    baseURL: process.env.PW_BASEURL || 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  testIgnore: ['**/compare-react-angular.spec.*'],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/mobile/**'],
    },
    // Mobile project for touch/viewport validations
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        hasTouch: true,
        isMobile: true,
      },
      testMatch: ['**/mobile/**'],
    },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: ['**/mobile/**'] },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: ['**/mobile/**'] },
  ],
  // No webServer; assumes Angular dev server is already running at baseURL
});
