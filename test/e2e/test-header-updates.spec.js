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
    const headerText = await page.locator('[data-testid="app-header-summary"]').textContent();
    console.log('📊 Initial header text:', headerText);

    // Change Quick Start Wizard selections
    console.log('🔄 Changing region to Canada...');
    const caRadio = page
      .locator('input[data-testid="region-select-ca"]')
      .or(page.locator('input[aria-label="Region"][value="CA"]'));
    if (await caRadio.count()) {
      await caRadio.first().check();
    } else {
      // Fallback: click visible Canada option label
      await page.goto('/wizard/income-drivers');
      await page.locator('[data-testid="region-option-ca"] input[value="CA"]').click();
    }
    await page.waitForTimeout(1000); // Wait for state update

    // Check if header updated
    const updatedHeaderText = await page
      .locator('[data-testid="app-header-summary"]')
      .textContent();
    console.log('📊 Updated header text:', updatedHeaderText);

    // Take screenshot after changes
    await page.screenshot({ path: 'test-results/header-after-region-change.png', fullPage: true });

    // Verify header reflects CA
    expect(updatedHeaderText).toContain('Region: CA');

    // Change store type (if present)
    const newStoreRadio = page.locator('input[value="new"]');
    if (await newStoreRadio.count()) {
      console.log('🔄 Changing store type to new...');
      await newStoreRadio.check();
      await page.waitForTimeout(1000);
    }

    // Check header again
    const finalHeaderText = await page.locator('[data-testid="app-header-summary"]').textContent();
    console.log('📊 Final header text:', finalHeaderText);

    // Take final screenshot
    await page.screenshot({
      path: 'test-results/header-after-store-type-change.png',
      fullPage: true,
    });

    // Verify header remains CA (store type may not reflect in header summary)
    expect(finalHeaderText).toContain('Region: CA');

    console.log('✅ Header update test complete!');
  });

  test('should navigate correctly between pages', async ({ page }) => {
    console.log('🔍 Starting navigation test...');

    await page.goto('/wizard/income-drivers');
    await page.waitForSelector('app-root', { timeout: 10000 });

    // Test expenses navigation
    console.log('🔄 Clicking Expenses button...');
    await page.getByRole('button', { name: 'Expenses', exact: true }).first().click();
    await page.waitForTimeout(2000);

    const expensesUrl = page.url();
    console.log('💰 Expenses URL:', expensesUrl);
    expect(expensesUrl).toContain('/wizard/expenses');

    // Test reports navigation
    console.log('🔄 Clicking Reports button...');
    await page.getByRole('button', { name: 'Reports', exact: true }).first().click();
    await page.waitForTimeout(2000);

    const reportsUrl = page.url();
    console.log('📊 Reports URL:', reportsUrl);
    expect(reportsUrl).toContain('/wizard/pnl');

    // Test dashboard navigation
    console.log('🔄 Clicking Dashboard button...');
    await page.getByRole('button', { name: 'Dashboard', exact: true }).first().click();
    await page.waitForTimeout(2000);

    const dashboardUrl = page.url();
    console.log('📈 Dashboard URL:', dashboardUrl);
    expect(dashboardUrl).toContain('/dashboard');

    // Go back to income drivers
    console.log('🔄 Clicking Income button...');
    await page.getByRole('button', { name: 'Income', exact: true }).first().click();
    await page.waitForTimeout(2000);

    const incomeUrl = page.url();
    console.log('💵 Income URL:', incomeUrl);
    expect(incomeUrl).toContain('/wizard/income-drivers');

    console.log('✅ Navigation test complete!');
  });
});
