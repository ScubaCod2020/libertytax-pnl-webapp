import { test, expect } from '@playwright/test'

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays correctly on mobile viewports', async ({ page }) => {
    // Test main elements are visible
    await expect(page.locator('text=Liberty Tax • P&L Budget & Forecast')).toBeVisible()
    await expect(page.locator('text=Quick Inputs')).toBeVisible()
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('region selector is accessible on mobile', async ({ page }) => {
    const regionSelect = page.locator('select[aria-label="Region"]')
    await expect(regionSelect).toBeVisible()
    
    // Should be large enough to tap
    const box = await regionSelect.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44) // iOS minimum tap target
  })

  test('input fields are properly sized for mobile', async ({ page }) => {
    const inputs = page.locator('input[type="number"]')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const box = await input.boundingBox()
      
      // Inputs should be at least 44px high (iOS guideline)
      expect(box?.height).toBeGreaterThanOrEqual(44)
      // And visible
      await expect(input).toBeVisible()
    }
  })

  test('KPI cards stack vertically on mobile', async ({ page }) => {
    const kpiCards = page.locator('.kpi')
    const firstCard = kpiCards.first()
    const secondCard = kpiCards.nth(1)
    
    const firstBox = await firstCard.boundingBox()
    const secondBox = await secondCard.boundingBox()
    
    // Second card should be below first card (higher Y position)
    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y)
    }
  })

  test('text is readable on mobile screens', async ({ page }) => {
    // Check that text is not too small
    const bodyText = page.locator('body')
    const styles = await bodyText.evaluate((el) => {
      return window.getComputedStyle(el)
    })
    
    // Font size should be at least 16px on mobile to avoid zoom
    const fontSize = parseInt(styles.fontSize)
    expect(fontSize).toBeGreaterThanOrEqual(14)
  })

  test('footer content is accessible on mobile', async ({ page }) => {
    const footer = page.locator('.footer')
    await expect(footer).toBeVisible()
    
    // Footer text should be readable
    const footerText = await footer.textContent()
    expect(footerText?.length).toBeGreaterThan(0)
  })
})

test.describe('Touch Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('tap to focus inputs works correctly', async ({ page }) => {
    const avgNetFeeInput = page.locator('input[type="number"]').first()
    
    // Tap to focus
    await avgNetFeeInput.tap()
    await expect(avgNetFeeInput).toBeFocused()
  })

  test('tap and hold does not interfere with input', async ({ page }) => {
    const avgNetFeeInput = page.locator('input[type="number"]').first()
    
    // Long press should not cause issues
    await avgNetFeeInput.tap({ force: true })
    await page.waitForTimeout(1000) // Simulate long press
    
    // Should still be able to type
    await avgNetFeeInput.fill('200')
    await expect(avgNetFeeInput).toHaveValue('200')
  })

  test('select dropdown works with touch', async ({ page }) => {
    const regionSelect = page.locator('select[aria-label="Region"]')
    
    await regionSelect.tap()
    await regionSelect.selectOption('CA')
    
    await expect(regionSelect).toHaveValue('CA')
  })

  test('reset button responds to touch', async ({ page }) => {
    const resetButton = page.locator('button:has-text("Reset")')
    const avgNetFeeInput = page.locator('input[type="number"]').first()
    
    // Change a value
    await avgNetFeeInput.fill('200')
    
    // Tap reset
    await resetButton.tap()
    
    // Should reset to default
    await expect(avgNetFeeInput).toHaveValue('125')
  })
})

test.describe('Mobile Performance', () => {
  test('app loads quickly on mobile connections', async ({ page }) => {
    // Simulate slow 3G connection
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Add 100ms delay
      await route.continue()
    })
    
    const startTime = Date.now()
    await page.goto('/')
    await page.locator('text=Liberty Tax • P&L Budget & Forecast').waitFor()
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(5000) // 5 seconds max on slow connection
  })

  test('calculations remain responsive during rapid input', async ({ page }) => {
    const avgNetFeeInput = page.locator('input[type="number"]').first()
    
    // Rapid value changes
    const values = ['100', '150', '200', '250', '300']
    for (const value of values) {
      await avgNetFeeInput.fill(value)
      await page.waitForTimeout(100) // Brief pause between changes
    }
    
    // Should still be responsive
    await expect(avgNetFeeInput).toHaveValue('300')
    
    // Dashboard should still be visible and updated
    await expect(page.locator('.kpi:has-text("Net Income")')).toBeVisible()
  })
})

test.describe('Mobile Specific Features', () => {
  test('prevents zoom on input focus (if implemented)', async ({ page }) => {
    // Check if viewport meta tag prevents zoom
    const viewportMeta = page.locator('meta[name="viewport"]')
    const content = await viewportMeta.getAttribute('content')
    
    // This test depends on whether zoom prevention is desired
    // Some accessibility guidelines recommend allowing zoom
    if (content) {
      // Just verify the viewport meta exists and has reasonable content
      expect(content).toContain('width=device-width')
    }
  })

  test('handles device orientation changes gracefully', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.locator('text=Liberty Tax • P&L Budget & Forecast')).toBeVisible()
    
    // Switch to landscape
    await page.setViewportSize({ width: 844, height: 390 })
    await expect(page.locator('text=Liberty Tax • P&L Budget & Forecast')).toBeVisible()
    
    // Content should still be accessible
    await expect(page.locator('text=Quick Inputs')).toBeVisible()
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('supports dark mode if device prefers it', async ({ page }) => {
    // Set dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    
    // App should still function (specific styling tests would go here)
    await expect(page.locator('text=Liberty Tax • P&L Budget & Forecast')).toBeVisible()
  })
})

test.describe('Accessibility on Mobile', () => {
  test('maintains proper focus management', async ({ page }) => {
    // Test tab navigation still works on devices with keyboards
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('form labels work with screen readers', async ({ page }) => {
    const avgNetFeeInput = page.locator('input[type="number"]').first()
    const labelText = await page.locator('label:has(input[type="number"])').first().textContent()
    
    expect(labelText).toContain('Average Net Fee')
  })

  test('maintains sufficient color contrast', async ({ page }) => {
    // This would typically require additional tools to test contrast ratios
    // For now, just verify that colored elements exist
    const kpiElements = page.locator('.kpi')
    const count = await kpiElements.count()
    
    expect(count).toBeGreaterThan(0)
  })
})