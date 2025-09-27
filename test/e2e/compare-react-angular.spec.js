// Comparison test to capture React vs Angular layouts
import { test, expect } from '@playwright/test';

test.describe.skip('React vs Angular Layout Comparison', () => {
  test('Capture React app screenshots for comparison', async ({ page }) => {
    console.log('📱 Capturing React app screenshots...');

    // Go to React app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
      path: 'react-homepage.png',
      fullPage: true,
    });

    console.log('🏠 React homepage captured');

    // Get page info
    const title = await page.title();
    console.log('📄 React page title:', title);

    // Look for main content areas
    const hasQuickStart = await page
      .locator('[class*="quick"], [class*="wizard"], [id*="wizard"]')
      .count();
    console.log('🚀 React Quick Start elements found:', hasQuickStart);

    // Try to find income drivers or similar
    const hasIncomeDrivers = await page.locator('h1, h2, h3').count();
    console.log('📊 React headings found:', hasIncomeDrivers);

    // Check for navigation
    const navLinks = await page.locator('a, button').count();
    console.log('🔗 React navigation elements found:', navLinks);

    // Try to navigate to different sections if possible
    const expensesButton = page.locator('text=/expenses/i').first();
    if (await expensesButton.isVisible()) {
      await expensesButton.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: 'react-expenses.png',
        fullPage: true,
      });
      console.log('💰 React expenses page captured');
    }

    // Try P&L or reports
    const reportsButton = page.locator('text=/report|p&l/i').first();
    if (await reportsButton.isVisible()) {
      await reportsButton.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: 'react-reports.png',
        fullPage: true,
      });
      console.log('📊 React reports page captured');
    }
  });

  test('Capture Angular app screenshots for comparison', async ({ page }) => {
    console.log('⚡ Capturing Angular app screenshots...');

    // Go to Angular app
    await page.goto('http://localhost:4200');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
      path: 'angular-homepage.png',
      fullPage: true,
    });

    console.log('🏠 Angular homepage captured');

    // Get page info
    const title = await page.title();
    console.log('📄 Angular page title:', title);

    // Look for Quick Start Wizard
    const quickStartElements = await page.locator('app-quick-start-wizard').count();
    console.log('🚀 Angular Quick Start components found:', quickStartElements);

    // Check headings
    const headings = await page.locator('h1, h2, h3').count();
    console.log('📊 Angular headings found:', headings);

    if (headings > 0) {
      const firstHeading = await page.locator('h1, h2, h3').first().textContent();
      console.log('📝 Angular first heading:', firstHeading);
    }

    // Try expenses navigation
    const expensesLink = page.locator('a[href*="expenses"]');
    if (await expensesLink.isVisible()) {
      await expensesLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: 'angular-expenses.png',
        fullPage: true,
      });
      console.log('💰 Angular expenses page captured');
      console.log('💰 Angular expenses URL:', page.url());
    }

    // Try P&L navigation
    await page.goto('http://localhost:4200/wizard/pnl');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'angular-pnl.png',
      fullPage: true,
    });
    console.log('📊 Angular P&L page captured');

    // Try dashboard
    await page.goto('http://localhost:4200/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'angular-dashboard.png',
      fullPage: true,
    });
    console.log('📈 Angular dashboard captured');
  });
});
