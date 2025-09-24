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
      // Region quick inputs (header recap reflects SettingsService)
      // Navigate to dashboard then back to wizard if needed to ensure settings panel present
      await page.goto('/wizard/income-drivers');

      // Step 1 basic inputs
      // Note: selectors reflect current Angular scaffold labels; adjust when wiring completes
      // Tax Prep Returns
      const returnsInput = page.getByLabel('Tax Prep Returns');
      await returnsInput.fill(String(sc.returns));
      await returnsInput.blur();

      // Avg Net Fee
      const feeInput = page.getByLabel('Average Net Fee');
      await feeInput.fill(String(sc.fee));
      await feeInput.blur();

      // Growth percent (if present)
      const growthField = page.getByRole('spinbutton').first();
      if (sc.growth !== 0 && (await growthField.count()) > 0) {
        await growthField.fill(String(sc.growth));
        await growthField.blur();
      }

      // Go to Step 2 (Expenses)
      await page.goto('/wizard/expenses');

      // Validate revenue breakdown header appears (visual presence only; value checks later)
      await expect(page.getByText(/Total Expenses/i)).toBeVisible();

      // Go to Step 3 (P&L / Reports)
      await page.goto('/wizard/pnl');
      await expect(page.getByText(/Reports|P&L/i)).toBeVisible();

      // Return to dashboard and ensure presence
      await page.goto('/dashboard');
      await expect(page.getByText(/Dashboard/i)).toBeVisible();
    });
  }
});
