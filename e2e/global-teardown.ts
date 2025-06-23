import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  // Clean up any test data or state here
  // For example, you might want to clear the database or remove test users
  
  await page.goto('http://localhost:3000')
  
  // Perform any cleanup actions
  
  await browser.close()
}

export default globalTeardown 