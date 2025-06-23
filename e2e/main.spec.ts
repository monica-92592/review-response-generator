import { test, expect } from '@playwright/test'

test.describe('Main Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the main page', async ({ page }) => {
    // Check if the page loads correctly
    await expect(page).toHaveTitle(/Review Response Generator/)
    
    // Check for main elements
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('textarea[name="reviewText"]')).toBeVisible()
    await expect(page.locator('select[name="rating"]')).toBeVisible()
    await expect(page.locator('select[name="businessType"]')).toBeVisible()
    await expect(page.locator('select[name="tone"]')).toBeVisible()
    await expect(page.locator('select[name="responseLength"]')).toBeVisible()
  })

  test('should generate response successfully', async ({ page }) => {
    // Fill in the form
    await page.fill('textarea[name="reviewText"]', 'Great service and amazing food! The staff was very friendly and the atmosphere was perfect.')
    await page.selectOption('select[name="rating"]', '5')
    await page.selectOption('select[name="businessType"]', 'restaurant')
    await page.selectOption('select[name="tone"]', 'professional')
    await page.selectOption('select[name="responseLength"]', 'medium')

    // Mock the API response
    await page.route('**/api/generate-response', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          responses: [
            {
              id: 1,
              text: 'Thank you for your wonderful review! We are delighted to hear that you enjoyed our service and food.',
              provider: 'openai',
              validation: { isValid: true, score: 0.9 }
            }
          ],
          metadata: {
            reviewLength: 85,
            rating: '5',
            businessType: 'restaurant',
            tone: 'professional',
            responseLength: 'medium',
            variations: 1,
            timestamp: new Date().toISOString(),
            cached: false
          }
        })
      })
    })

    // Click generate button
    await page.click('button[type="submit"]')

    // Wait for response
    await page.waitForSelector('[data-testid="response-card"]', { timeout: 10000 })

    // Check if response is displayed
    await expect(page.locator('[data-testid="response-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="response-text"]')).toContainText('Thank you for your wonderful review')
  })

  test('should show validation errors for invalid input', async ({ page }) => {
    // Try to submit with short review text
    await page.fill('textarea[name="reviewText"]', 'Good')
    await page.selectOption('select[name="rating"]', '5')
    await page.selectOption('select[name="businessType"]', 'restaurant')
    await page.selectOption('select[name="tone"]', 'professional')
    await page.selectOption('select[name="responseLength"]', 'medium')

    await page.click('button[type="submit"]')

    // Check for validation error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('at least 10 characters')
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Fill in the form
    await page.fill('textarea[name="reviewText"]', 'Great service and amazing food! The staff was very friendly and the atmosphere was perfect.')
    await page.selectOption('select[name="rating"]', '5')
    await page.selectOption('select[name="businessType"]', 'restaurant')
    await page.selectOption('select[name="tone"]', 'professional')
    await page.selectOption('select[name="responseLength"]', 'medium')

    // Mock API error
    await page.route('**/api/generate-response', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error'
        })
      })
    })

    // Click generate button
    await page.click('button[type="submit"]')

    // Wait for error message
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 })

    // Check if error is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('error')
  })

  test('should copy response to clipboard', async ({ page }) => {
    // Fill in the form and generate response
    await page.fill('textarea[name="reviewText"]', 'Great service and amazing food! The staff was very friendly and the atmosphere was perfect.')
    await page.selectOption('select[name="rating"]', '5')
    await page.selectOption('select[name="businessType"]', 'restaurant')
    await page.selectOption('select[name="tone"]', 'professional')
    await page.selectOption('select[name="responseLength"]', 'medium')

    // Mock the API response
    await page.route('**/api/generate-response', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          responses: [
            {
              id: 1,
              text: 'Thank you for your wonderful review! We are delighted to hear that you enjoyed our service and food.',
              provider: 'openai',
              validation: { isValid: true, score: 0.9 }
            }
          ],
          metadata: {
            reviewLength: 85,
            rating: '5',
            businessType: 'restaurant',
            tone: 'professional',
            responseLength: 'medium',
            variations: 1,
            timestamp: new Date().toISOString(),
            cached: false
          }
        })
      })
    })

    await page.click('button[type="submit"]')
    await page.waitForSelector('[data-testid="response-card"]')

    // Click copy button
    await page.click('[data-testid="copy-button"]')

    // Check if copy success message appears
    await expect(page.locator('[data-testid="copy-success"]')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check if elements are properly sized for mobile
    await expect(page.locator('textarea[name="reviewText"]')).toBeVisible()
    await expect(page.locator('select[name="rating"]')).toBeVisible()
    await expect(page.locator('select[name="businessType"]')).toBeVisible()
    await expect(page.locator('select[name="tone"]')).toBeVisible()
    await expect(page.locator('select[name="responseLength"]')).toBeVisible()

    // Check if form is usable on mobile
    await page.fill('textarea[name="reviewText"]', 'Great service!')
    await page.selectOption('select[name="rating"]', '5')
    await page.selectOption('select[name="businessType"]', 'restaurant')
    await page.selectOption('select[name="tone"]', 'professional')
    await page.selectOption('select[name="responseLength"]', 'medium')
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab')
    await expect(page.locator('textarea[name="reviewText"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('select[name="rating"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('select[name="businessType"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('select[name="tone"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('select[name="responseLength"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('button[type="submit"]')).toBeFocused()
  })
}) 