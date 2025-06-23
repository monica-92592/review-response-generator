import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  // Set up any global test data or state here
  // For example, you might want to seed the database or set up test users
  
  await page.goto('http://localhost:3000')
  
  // Wait for the app to be ready
  await page.waitForLoadState('networkidle')
  
  await browser.close()
}

export default globalSetup 