// Debug test to capture full UI state
import { test, expect } from '@playwright/test';

test.describe('Debug UI Capture', () => {
  test('Capture full UI state for debugging', async ({ page }) => {
    console.log('🔍 Starting UI debug capture...');

    // Go to the Angular app
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take a full page screenshot
    await page.screenshot({
      path: 'debug-full-page.png',
      fullPage: true,
    });

    // Get the page title and content for debugging
    const title = await page.title();
    console.log('📄 Page title:', title);

    // Get the main content structure
    const appRoot = page.locator('app-root');
    const isAppRootVisible = await appRoot.isVisible();
    console.log('🎯 app-root visible:', isAppRootVisible);

    // Get current URL
    const url = page.url();
    console.log('🌐 Current URL:', url);

    // Check if we can find the Quick Start Wizard
    const quickStart = page.locator('app-quick-start-wizard');
    const hasQuickStart = await quickStart.isVisible();
    console.log('🚀 Quick Start Wizard visible:', hasQuickStart);

    // Check if we can find the Income Drivers content
    const incomeDrivers = page.locator('h1');
    const headingCount = await incomeDrivers.count();
    console.log('📊 Number of h1 headings:', headingCount);

    if (headingCount > 0) {
      const headingText = await incomeDrivers.first().textContent();
      console.log('📝 First heading text:', headingText);
    }

    // Get all visible text content for debugging
    const bodyText = await page.locator('body').textContent();
    console.log('📄 Page contains text (first 200 chars):', bodyText?.substring(0, 200));

    // Try to find navigation links
    const expensesLink = page.locator('a[href*="expenses"]');
    const hasExpensesLink = await expensesLink.isVisible();
    console.log('💰 Expenses link visible:', hasExpensesLink);

    if (hasExpensesLink) {
      console.log('🔄 Navigating to expenses page...');
      await expensesLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: 'debug-expenses-page.png',
        fullPage: true,
      });
      console.log('💰 Expenses page URL:', page.url());
    }

    // Try to navigate to P&L page
    await page.goto('/wizard/pnl');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'debug-pnl-page.png',
      fullPage: true,
    });
    console.log('📊 P&L page URL:', page.url());

    console.log('✅ Debug capture complete! Check the screenshots.');
  });
});
