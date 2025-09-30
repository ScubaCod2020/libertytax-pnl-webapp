import { test, expect } from '@playwright/test';

test.describe('Wizard Flow Matrix (Angular approx)', () => {
  const scenarios = [
    { region: 'US', returns: 500, fee: 250, growth: 5, otherIncome: 0 },
    { region: 'CA', returns: 1600, fee: 250, growth: 0, otherIncome: 0 },
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('/wizard/income-drivers');
    await page.evaluate(() => localStorage.clear());
  });

  for (const sc of scenarios) {
    test(`Scenario: ${sc.region} returns=${sc.returns}, fee=${sc.fee}, growth=${sc.growth}, other=${sc.otherIncome}`, async ({
      page,
    }) => {
      // Ensure on wizard inputs
      await page.goto('/wizard/income-drivers');

      // Region (if needed later, use radios by data-testid)
      // const region = sc.region === 'US' ? 'region-select-us' : 'region-select-ca'
      // await page.locator(`[data-testid="${region}"]`).check()

      // Tax Prep Returns
      const returnsInput = page.locator('input[data-testid="tax-prep-returns-input"]');
      await returnsInput.fill(String(sc.returns));
      await returnsInput.blur();

      // Avg Net Fee
      const feeInput = page.locator('input[data-testid="average-net-fee-input"]');
      await feeInput.fill(String(sc.fee));
      await feeInput.blur();

      // Growth percent (guarded)
      const growthField = page.locator('input[type="number"]').nth(1);
      if ((await growthField.count()) > 0) {
        await growthField.fill(String(sc.growth));
        await growthField.blur();
      }

      // Go to Step 2 (Expenses)
      await page.goto('/wizard/expenses');
      const expensesHeader = page.locator('text=/^Total Expenses[:\s]/i').first();
      await expect(expensesHeader).toBeVisible();

      // Go to Step 3 (P&L / Reports)
      await page.goto('/wizard/pnl');
      await expect(page.locator('.card-title', { hasText: 'Monthly P&L Breakdown' })).toBeVisible();

      // Return to dashboard and ensure presence
      await page.goto('/dashboard');
      await expect(
        page.locator('app-dashboard-results-panel .card-title', { hasText: 'Dashboard' }).first()
      ).toBeVisible();
    });
  }
});
