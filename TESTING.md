# Testing & Quality Assurance

This document outlines the comprehensive testing strategy implemented for the AI Review Response Generator.

## 🧪 Testing Strategy

### Test Pyramid
- **Unit Tests**: 70% - Testing individual functions and components
- **Integration Tests**: 20% - Testing API endpoints and component interactions
- **End-to-End Tests**: 10% - Testing complete user workflows

## 📋 Test Types

### 1. Unit Tests
**Location**: `__tests__/unit/`

**Coverage**:
- Security utilities (encryption, sanitization, validation)
- Business logic functions
- Utility functions
- Component logic (without rendering)

**Example**:
```typescript
// __tests__/unit/security.test.ts
describe('Security Utilities', () => {
  test('should encrypt and decrypt data correctly', () => {
    const encrypted = Encryption.encrypt(testData, testKey)
    const decrypted = Encryption.decrypt(encrypted, testKey)
    expect(decrypted).toBe(testData)
  })
})
```

### 2. Integration Tests
**Location**: `__tests__/integration/`

**Coverage**:
- API endpoint functionality
- Database interactions
- External service integrations
- Component integration

**Example**:
```typescript
// __tests__/integration/api.test.ts
describe('API Integration Tests', () => {
  test('should generate response successfully', async () => {
    const response = await generateResponseHandler(request)
    expect(response.status).toBe(200)
    expect(data.responses).toBeDefined()
  })
})
```

### 3. End-to-End Tests
**Location**: `e2e/`

**Coverage**:
- Complete user workflows
- Cross-browser compatibility
- Mobile responsiveness
- Performance testing

**Example**:
```typescript
// e2e/main.spec.ts
test('should generate response successfully', async ({ page }) => {
  await page.fill('textarea[name="reviewText"]', 'Great service!')
  await page.click('button[type="submit"]')
  await expect(page.locator('[data-testid="response-card"]')).toBeVisible()
})
```

## 🚀 Running Tests

### Install Dependencies
```bash
npm install
```

### Unit & Integration Tests (Jest)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:api
```

### End-to-End Tests (Playwright)
```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

## 📊 Coverage Requirements

### Minimum Coverage Thresholds
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Coverage Reports
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **JSON Report**: `coverage/coverage-final.json`

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### Playwright Configuration (`playwright.config.ts`)
```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
})
```

## 🛠️ Test Utilities

### Mock Service Worker (MSW)
Used for mocking external API calls in integration tests.

```typescript
// Mock OpenAI API
rest.post('https://api.openai.com/v1/chat/completions', (req, res, ctx) => {
  return res(ctx.json({
    choices: [{ message: { content: 'Mock response' } }]
  }))
})
```

### Test Data Factories
Create consistent test data across tests.

```typescript
// __tests__/utils/test-data.ts
export const createTestReview = (overrides = {}) => ({
  reviewText: 'Great service and amazing food!',
  rating: '5',
  businessType: 'restaurant',
  tone: 'professional',
  responseLength: 'medium',
  ...overrides
})
```

## 🔍 Error Monitoring & Logging

### Error Monitor (`lib/error-monitoring.ts`)
Comprehensive error tracking and performance monitoring.

```typescript
import { errorMonitor, securityMonitor } from '@/lib/error-monitoring'

// Log errors
errorMonitor.logError(new Error('Something went wrong'))

// Track performance
errorMonitor.trackApiCall('/api/generate-response', 'POST', 1500, 200)

// Log security events
securityMonitor.logRateLimit('192.168.1.1', '/api/generate-response', 30)
```

### Monitoring Features
- **Error Tracking**: Automatic error capture and reporting
- **Performance Monitoring**: API call timing, page load times
- **Security Monitoring**: Rate limiting, XSS attempts, invalid inputs
- **User Action Tracking**: User interaction timing

## 📱 Browser Testing

### Supported Browsers
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: Chrome (Android), Safari (iOS)
- **Viewports**: Desktop, tablet, mobile

### Cross-Browser Testing
```bash
# Run tests on all browsers
npm run test:e2e

# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## 🧪 Test Data Management

### Test Database
- Separate test database for integration tests
- Automatic cleanup between tests
- Seeded test data

### Environment Variables
```env
# Test environment
NODE_ENV=test
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/test_db
TEST_API_KEY=test-api-key
```

## 🔄 Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:unit",
      "pre-push": "npm run test"
    }
  }
}
```

## 📈 Performance Testing

### Lighthouse CI
Automated performance testing with Lighthouse.

```bash
# Run Lighthouse tests
npm run test:lighthouse

# Performance budgets
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

## 🐛 Debugging Tests

### Jest Debugging
```bash
# Run specific test file
npm test -- security.test.ts

# Run tests with verbose output
npm test -- --verbose

# Debug failing tests
npm test -- --detectOpenHandles
```

### Playwright Debugging
```bash
# Run tests in headed mode
npm run test:e2e:headed

# Debug specific test
npx playwright test main.spec.ts --debug

# Show test traces
npx playwright show-trace test-results/trace.zip
```

## 📝 Writing Tests

### Unit Test Guidelines
1. **Arrange**: Set up test data and mocks
2. **Act**: Execute the function being tested
3. **Assert**: Verify the expected outcome

```typescript
test('should validate email format', () => {
  // Arrange
  const validEmail = 'test@example.com'
  const invalidEmail = 'invalid-email'

  // Act
  const validResult = InputSanitizer.sanitizeEmail(validEmail)
  const invalidResult = InputSanitizer.sanitizeEmail(invalidEmail)

  // Assert
  expect(validResult).toBe(validEmail)
  expect(invalidResult).toBe('')
})
```

### Integration Test Guidelines
1. **Setup**: Mock external dependencies
2. **Execute**: Make actual API calls
3. **Verify**: Check responses and side effects

### E2E Test Guidelines
1. **Navigate**: Go to the page being tested
2. **Interact**: Perform user actions
3. **Assert**: Verify the expected outcome

## 🚨 Common Issues & Solutions

### Test Environment Issues
- **Problem**: Tests failing due to missing environment variables
- **Solution**: Use `.env.test` file with test-specific values

### Async Test Issues
- **Problem**: Tests timing out or not waiting for async operations
- **Solution**: Use proper async/await and waitFor utilities

### Mock Issues
- **Problem**: Mocks not working as expected
- **Solution**: Ensure mocks are set up before tests run

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library Documentation](https://testing-library.com/docs/)
- [MSW Documentation](https://mswjs.io/docs/)

## 🤝 Contributing to Tests

### Adding New Tests
1. Create test file in appropriate directory
2. Follow naming convention: `*.test.ts` or `*.spec.ts`
3. Write descriptive test names
4. Ensure good coverage
5. Update documentation if needed

### Test Review Checklist
- [ ] Tests are descriptive and easy to understand
- [ ] Tests cover edge cases and error scenarios
- [ ] Tests are independent and don't rely on each other
- [ ] Tests clean up after themselves
- [ ] Tests follow the project's testing patterns 