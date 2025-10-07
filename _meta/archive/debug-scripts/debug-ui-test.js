// Quick debug test to capture full UI state
const { test, expect } = require('@playwright/test');

test('Capture full UI state for debugging', async ({ page }) => {
  // Go to the Angular app
  await page.goto('http://localhost:4200');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Take a full page screenshot
  await page.screenshot({
    path: 'debug-full-page.png',
    fullPage: true,
  });

  // Get the page title and content for debugging
  const title = await page.title();
  console.log('Page title:', title);

  // Get the main content structure
  const appRoot = page.locator('app-root');
  const isAppRootVisible = await appRoot.isVisible();
  console.log('app-root visible:', isAppRootVisible);

  // Get current URL
  const url = page.url();
  console.log('Current URL:', url);

  // Get any error messages in console
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('Browser console error:', msg.text());
    }
  });

  // Check if we can find the Quick Start Wizard
  const quickStart = page.locator('app-quick-start-wizard');
  const hasQuickStart = await quickStart.isVisible();
  console.log('Quick Start Wizard visible:', hasQuickStart);

  // Check if we can find the Income Drivers content
  const incomeDrivers = page.locator('h1');
  const headingText = await incomeDrivers.first().textContent();
  console.log('First heading text:', headingText);

  // Try to navigate to expenses
  const expensesLink = page.locator('a[href*="expenses"]');
  const hasExpensesLink = await expensesLink.isVisible();
  console.log('Expenses link visible:', hasExpensesLink);

  if (hasExpensesLink) {
    await expensesLink.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'debug-expenses-page.png',
      fullPage: true,
    });
    console.log('Expenses page URL:', page.url());
  }
});
