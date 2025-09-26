// Test to verify header updates correctly from Quick Start Wizard
import { test, expect } from '@playwright/test';

test.describe('Header Updates from Quick Start Wizard', () => {
  test('should update header when Quick Start Wizard values change', async ({ page }) => {
    console.log('🔍 Starting header update test...');

    // Go to income drivers page
    await page.goto('/wizard/income-drivers');
    await page.waitForSelector('app-root', { timeout: 10000 });

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/header-before-changes.png', fullPage: true });

    // Check initial header values
    const headerText = await page.locator('.small.text-xs').nth(1).textContent();
    console.log('📊 Initial header text:', headerText);

    // Change Quick Start Wizard selections
    console.log('🔄 Changing region to Canada...');
    await page.locator('input[value="CA"]').click();
    await page.waitForTimeout(1000); // Wait for state update

    // Check if header updated
    const updatedHeaderText = await page.locator('.small.text-xs').nth(1).textContent();
    console.log('📊 Updated header text:', updatedHeaderText);

    // Take screenshot after changes
    await page.screenshot({ path: 'test-results/header-after-region-change.png', fullPage: true });

    // Verify header contains CA
    expect(updatedHeaderText).toContain('CA Canada');

    // Change store type
    console.log('🔄 Changing store type to new...');
    await page.locator('input[value="new"]').click();
    await page.waitForTimeout(1000);

    // Check header again
    const finalHeaderText = await page.locator('.small.text-xs').nth(1).textContent();
    console.log('📊 Final header text:', finalHeaderText);

    // Take final screenshot
    await page.screenshot({
      path: 'test-results/header-after-store-type-change.png',
      fullPage: true,
    });

    // Verify header contains both CA and new
    expect(finalHeaderText).toContain('CA Canada');
    expect(finalHeaderText).toContain('new');

    console.log('✅ Header update test complete!');
  });

  test('should navigate correctly between pages', async ({ page }) => {
    console.log('🔍 Starting navigation test...');

    await page.goto('/wizard/income-drivers');
    await page.waitForSelector('app-root', { timeout: 10000 });

    // Test expenses navigation
    console.log('🔄 Clicking Expenses button...');
    await page.locator('button:has-text("Expenses")').click();
    await page.waitForTimeout(2000);

    const expensesUrl = page.url();
    console.log('💰 Expenses URL:', expensesUrl);
    expect(expensesUrl).toContain('/wizard/expenses');

    // Test reports navigation
    console.log('🔄 Clicking Reports button...');
    await page.locator('button:has-text("Reports")').click();
    await page.waitForTimeout(2000);

    const reportsUrl = page.url();
    console.log('📊 Reports URL:', reportsUrl);
    expect(reportsUrl).toContain('/wizard/pnl');

    // Test dashboard navigation
    console.log('🔄 Clicking Dashboard button...');
    await page.locator('button:has-text("Dashboard")').click();
    await page.waitForTimeout(2000);

    const dashboardUrl = page.url();
    console.log('📈 Dashboard URL:', dashboardUrl);
    expect(dashboardUrl).toContain('/dashboard');

    // Go back to income drivers
    console.log('🔄 Clicking Income button...');
    await page.locator('button:has-text("Income")').click();
    await page.waitForTimeout(2000);

    const incomeUrl = page.url();
    console.log('💵 Income URL:', incomeUrl);
    expect(incomeUrl).toContain('/wizard/income-drivers');

    console.log('✅ Navigation test complete!');
  });
});
