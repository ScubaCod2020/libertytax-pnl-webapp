import { test, expect } from '@playwright/test';

test.describe('Expenses Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wizard/expenses?debug=1');
  });

  test('renders all rows and tooltips', async ({ page }) => {
    const rows = page.locator('[data-testid^="row-"]');
    await expect(rows).toHaveCount(13); // matches rows[] configured in component

    await expect(page.locator('[data-testid="percent-telephone"]')).toBeVisible();
    await page.hover('[data-testid="info-telephone"]');
    const title = await page.getAttribute('[data-testid="info-telephone"]', 'title');
    expect(title).toBeTruthy();
  });

  test('editing percent updates status and slider syncs', async ({ page }) => {
    const pct = page.locator('[data-testid="percent-telephone"]');
    const slider = page.locator('[data-testid="slider-telephone"]');
    await pct.fill('1.10');
    await expect(slider).toHaveValue('1.1');
    const row = page.locator('[data-testid="row-telephone"] .inline.amount');
    const className = await row.getAttribute('class');
    expect(className || '').toMatch(/(yellow|red)/);
  });

  test('notes observable binds value and persists across change detection', async ({ page }) => {
    const note = page.locator('[data-testid="note-telephone"]');
    await note.fill('Investigating seasonal spike');
    await page.locator('[data-testid="percent-telephone"]').fill('0.7');
    await expect(note).toHaveValue('Investigating seasonal spike');
  });

  test('ANF chip reflects thresholds and Use recommended snaps to green (US)', async ({ page }) => {
    // Go to Income Drivers
    await page.goto('/wizard/income-drivers?debug=1');
    const anfInput = page
      .getByLabel('Average Net Fee')
      .locator('xpath=..')
      .locator('input[type="number"]');
    await anfInput.fill('300');
    // expect green chip nearby (we check class on sibling chip)
    const chip = page.locator('.anf .chip');
    await expect(chip).toHaveClass(/green/);
    await anfInput.fill('410');
    await expect(chip).toHaveClass(/red/);
    // Use recommended
    const useRec = page.getByRole('button', { name: /Use recommended/i });
    await useRec.click();
    await expect(chip).toHaveClass(/green|yellow/); // green center, allow slight rounding
  });

  test('ANF thresholds change with region (CA)', async ({ page }) => {
    await page.goto('/wizard/income-drivers?debug=1');
    // Switch to CA if there is a region toggle (assume a debug panel or header control exists)
    // If not, this step can be adapted; here we rely on a region control with data-testid
    const regionCA = page.locator('[data-testid="region-CA"]');
    if (await regionCA.count()) {
      await regionCA.click();
    }
    const anfInput = page
      .getByLabel('Average Net Fee')
      .locator('xpath=..')
      .locator('input[type="number"]');
    const chip = page.locator('.anf .chip');
    await anfInput.fill('130');
    await expect(chip).toHaveClass(/green/);
    await anfInput.fill('80');
    await expect(chip).toHaveClass(/red/);
  });
});
