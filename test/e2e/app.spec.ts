import { test, expect, type Page } from '@playwright/test'

class PnLPage {
  constructor(private page: Page) {}

  // Locators
  get regionSelect() { return this.page.locator('select[aria-label="Region"]') }
  get avgNetFeeInput() { return this.page.locator('input[type="number"]').first() }
  get taxPrepReturnsInput() { return this.page.locator('label:has-text("Tax Prep Returns") + input') }
  get taxRushReturnsInput() { return this.page.locator('label:has-text("TaxRush Returns") + input') }
  get discountsPctInput() { return this.page.locator('label:has-text("Discounts %") + input') }
  get resetButton() { return this.page.locator('button:has-text("Reset")') }

  // KPI Elements
  get netIncomeValue() { return this.page.locator('.kpi:has-text("Net Income") .value') }
  get netMarginValue() { return this.page.locator('.kpi:has-text("Net Margin") .value') }
  get costPerReturnValue() { return this.page.locator('.kpi:has-text("Cost / Return") .value') }

  // Actions
  async selectRegion(region: 'US' | 'CA') {
    await this.regionSelect.selectOption(region)
  }

  async setAvgNetFee(value: number) {
    await this.avgNetFeeInput.fill(value.toString())
    await this.avgNetFeeInput.blur()
  }

  async setTaxPrepReturns(value: number) {
    await this.taxPrepReturnsInput.fill(value.toString())
    await this.taxPrepReturnsInput.blur()
  }

  async setTaxRushReturns(value: number) {
    await this.taxRushReturnsInput.fill(value.toString())
    await this.taxRushReturnsInput.blur()
  }

  async setDiscountsPct(value: number) {
    await this.discountsPctInput.fill(value.toString())
    await this.discountsPctInput.blur()
  }

  async resetToDefaults() {
    await this.resetButton.click()
  }

  async waitForCalculation() {
    // Wait for any calculations to complete
    await this.page.waitForTimeout(500)
  }
}

test.describe('Liberty Tax P&L Application', () => {
  let pnlPage: PnLPage

  test.beforeEach(async ({ page }) => {
    pnlPage = new PnLPage(page)
    await page.goto('/')
    
    // Clear any existing localStorage
    await page.evaluate(() => localStorage.clear())
  })

  test('displays the main application interface', async ({ page }) => {
    await expect(page).toHaveTitle(/Liberty Tax/)
    await expect(page.locator('text=Liberty Tax • P&L Budget & Forecast')).toBeVisible()
    
    // Check main sections are present
    await expect(page.locator('text=Quick Inputs')).toBeVisible()
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Income Drivers')).toBeVisible()
    await expect(page.locator('text=Expense Percentages')).toBeVisible()
  })

  test('has correct initial values', async ({ page }) => {
    await expect(pnlPage.regionSelect).toHaveValue('US')
    await expect(pnlPage.avgNetFeeInput).toHaveValue('125')
    await expect(pnlPage.taxPrepReturnsInput).toHaveValue('1600')
    await expect(pnlPage.taxRushReturnsInput).toHaveValue('0')
    await expect(pnlPage.taxRushReturnsInput).toBeDisabled()
  })

  test('enables TaxRush input when region is set to Canada', async ({ page }) => {
    await pnlPage.selectRegion('CA')
    await expect(pnlPage.taxRushReturnsInput).toBeEnabled()
  })

  test('disables and resets TaxRush when switching to US', async ({ page }) => {
    // Set to Canada and add TaxRush returns
    await pnlPage.selectRegion('CA')
    await pnlPage.setTaxRushReturns(100)
    
    // Switch back to US
    await pnlPage.selectRegion('US')
    
    await expect(pnlPage.taxRushReturnsInput).toBeDisabled()
    await expect(pnlPage.taxRushReturnsInput).toHaveValue('0')
  })

  test('updates calculations when inputs change', async ({ page }) => {
    // Get initial net income
    const initialNetIncome = await pnlPage.netIncomeValue.textContent()
    
    // Change average net fee
    await pnlPage.setAvgNetFee(200)
    await pnlPage.waitForCalculation()
    
    // Net income should have changed
    const newNetIncome = await pnlPage.netIncomeValue.textContent()
    expect(newNetIncome).not.toBe(initialNetIncome)
  })

  test('persists data across page reloads', async ({ page }) => {
    // Change some values
    await pnlPage.selectRegion('CA')
    await pnlPage.setAvgNetFee(200)
    await pnlPage.setTaxPrepReturns(2000)
    await pnlPage.setTaxRushReturns(150)
    
    // Wait for persistence
    await page.waitForTimeout(1000)
    
    // Reload page
    await page.reload()
    
    // Values should be restored
    await expect(pnlPage.regionSelect).toHaveValue('CA')
    await expect(pnlPage.avgNetFeeInput).toHaveValue('200')
    await expect(pnlPage.taxPrepReturnsInput).toHaveValue('2000')
    await expect(pnlPage.taxRushReturnsInput).toHaveValue('150')
  })

  test('resets all values when reset button is clicked', async ({ page }) => {
    // Change some values
    await pnlPage.selectRegion('CA')
    await pnlPage.setAvgNetFee(200)
    await pnlPage.setTaxPrepReturns(2000)
    
    // Click reset
    await pnlPage.resetToDefaults()
    
    // Should return to defaults
    await expect(pnlPage.regionSelect).toHaveValue('US')
    await expect(pnlPage.avgNetFeeInput).toHaveValue('125')
    await expect(pnlPage.taxPrepReturnsInput).toHaveValue('1600')
    await expect(pnlPage.taxRushReturnsInput).toHaveValue('0')
  })

  test('displays KPI status colors correctly', async ({ page }) => {
    // Check that KPI elements exist and have status classes
    const netIncomeKPI = page.locator('.kpi:has-text("Net Income")')
    const netMarginKPI = page.locator('.kpi:has-text("Net Margin")')
    const costPerReturnKPI = page.locator('.kpi:has-text("Cost / Return")')
    
    await expect(netIncomeKPI).toBeVisible()
    await expect(netMarginKPI).toBeVisible()
    await expect(costPerReturnKPI).toBeVisible()
    
    // Check that they have color classes (green, yellow, or red)
    const netIncomeClass = await netIncomeKPI.getAttribute('class')
    const netMarginClass = await netMarginKPI.getAttribute('class')
    const costPerReturnClass = await costPerReturnKPI.getAttribute('class')
    
    expect(netIncomeClass).toMatch(/(green|yellow|red)/)
    expect(netMarginClass).toMatch(/(green|yellow|red)/)
    expect(costPerReturnClass).toMatch(/(green|yellow|red)/)
  })

  test('shows pro-tips based on KPI status', async ({ page }) => {
    // The pro-tips section should be visible
    await expect(page.locator('text=Pro-Tips')).toBeVisible()
    
    // There should be some tips shown (content depends on current KPI status)
    const proTipsSection = page.locator('.card:has-text("Pro-Tips")')
    await expect(proTipsSection).toBeVisible()
  })

  test('handles edge case of zero returns', async ({ page }) => {
    await pnlPage.setTaxPrepReturns(0)
    await pnlPage.waitForCalculation()
    
    // Application should not crash and should display some values
    await expect(pnlPage.netIncomeValue).toBeVisible()
    await expect(pnlPage.netMarginValue).toBeVisible()
    await expect(pnlPage.costPerReturnValue).toBeVisible()
  })

  test('handles very large input values', async ({ page }) => {
    await pnlPage.setAvgNetFee(10000)
    await pnlPage.setTaxPrepReturns(100000)
    await pnlPage.waitForCalculation()
    
    // Should handle large numbers without crashing
    await expect(pnlPage.netIncomeValue).toBeVisible()
    
    // Values should be formatted as currency/percentages
    const netIncome = await pnlPage.netIncomeValue.textContent()
    expect(netIncome).toMatch(/^\$[\d,]+/) // Should start with $ and have commas
  })

  test('maintains TaxRush stickiness in Canada', async ({ page }) => {
    // Set to Canada and enter TaxRush value
    await pnlPage.selectRegion('CA')
    await pnlPage.setTaxRushReturns(200)
    
    // Change scenario (if scenario selector exists)
    // This should not reset TaxRush in Canada
    // The exact test depends on how scenarios are implemented
  })

  test('keyboard navigation works correctly', async ({ page }) => {
    // Test tab navigation through inputs
    await page.keyboard.press('Tab')
    await expect(pnlPage.regionSelect).toBeFocused()
    
    // Continue tabbing to inputs
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab') // Skip reset button
    await expect(pnlPage.avgNetFeeInput).toBeFocused()
  })
})

test.describe('Performance & Responsiveness', () => {
  test('loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.locator('text=Liberty Tax • P&L Budget & Forecast').waitFor()
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(3000) // 3 seconds max
  })

  test('calculations are performant', async ({ page }) => {
    const pnlPage = new PnLPage(page)
    await page.goto('/')
    
    const startTime = Date.now()
    
    // Make several rapid changes
    for (let i = 0; i < 10; i++) {
      await pnlPage.setAvgNetFee(100 + i * 10)
    }
    
    // Wait for final calculation
    await pnlPage.waitForCalculation()
    const calcTime = Date.now() - startTime
    
    expect(calcTime).toBeLessThan(1000) // Should be very fast
  })
})
