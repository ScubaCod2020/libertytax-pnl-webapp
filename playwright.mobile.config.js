// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Mobile-focused Playwright configuration
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/mobile',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report-mobile' }],
    ['json', { outputFile: 'test-results/mobile-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Mobile-specific projects */
  projects: [
    {
      name: 'iPhone SE',
      use: { 
        ...devices['iPhone SE'],
        // Additional mobile-specific settings
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'iPhone 12 Pro',
      use: { 
        ...devices['iPhone 12 Pro'],
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'Samsung Galaxy S21',
      use: { 
        ...devices['Galaxy S9+'],
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'iPad',
      use: { 
        ...devices['iPad Pro'],
        hasTouch: true,
        isMobile: false, // Tablet
      },
    },
    {
      name: 'iPad Landscape',
      use: { 
        ...devices['iPad Pro landscape'],
        hasTouch: true,
        isMobile: false,
      },
    },
  ],

  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
