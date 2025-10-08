/**
 * Visual Regression Tests
 * These tests capture screenshots and compare them to ensure UI consistency
 * during React → Angular migration
 */

import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  
  test('Homepage - Welcome Step', async ({ page }) => {
    await page.goto('/')
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle')
    
    // Take screenshot of the welcome step
    await expect(page).toHaveScreenshot('homepage-welcome-step.png')
  })
  
  test('Homepage - US Region Selected', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Select US region
    await page.selectOption('select[aria-label="Select region"]', 'US')
    
    // Take screenshot after region selection
    await expect(page).toHaveScreenshot('homepage-us-region-selected.png')
  })
  
  test('Homepage - CA Region Selected', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Select CA region
    await page.selectOption('select[aria-label="Select region"]', 'CA')
    
    // Take screenshot after region selection
    await expect(page).toHaveScreenshot('homepage-ca-region-selected.png')
  })
  
  test('Mobile View - Welcome Step', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Take mobile screenshot
    await expect(page).toHaveScreenshot('mobile-welcome-step.png')
  })
  
  test('Desktop View - Welcome Step', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Take desktop screenshot
    await expect(page).toHaveScreenshot('desktop-welcome-step.png')
  })
  
  test('Header Components', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Take screenshot of just the header
    const header = page.locator('.header')
    await expect(header).toHaveScreenshot('header-components.png')
  })
  
  test('Brand Logo Display', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Take screenshot of brand logo area
    const logoArea = page.locator('div[style*="justify-self: start"]')
    await expect(logoArea).toHaveScreenshot('brand-logo.png')
  })
  
  test('Reset Button States', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Take screenshot of reset button
    const resetButton = page.locator('button[aria-label*="Reset"]')
    await expect(resetButton).toHaveScreenshot('reset-button.png')
  })
})
