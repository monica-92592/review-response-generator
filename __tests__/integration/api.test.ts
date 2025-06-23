import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { NextRequest } from 'next/server'
import { POST as generateResponseHandler } from '@/app/api/generate-response/route'
import { POST as bulkGenerateHandler } from '@/app/api/bulk-generate/route'
import { GET as cacheGetHandler, POST as cachePostHandler, DELETE as cacheDeleteHandler } from '@/app/api/cache/route'

// Mock the AI providers
jest.mock('@/lib/ai-providers', () => ({
  generateReviewResponse: jest.fn().mockResolvedValue({
    response: 'Thank you for your review! We appreciate your feedback.',
    provider: 'openai',
    validation: { isValid: true, score: 0.9 }
  }),
  getAvailableProviders: jest.fn().mockReturnValue({
    openai: true,
    claude: true
  })
}))

jest.mock('@/lib/cache', () => ({
  responseCache: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    has: jest.fn(),
    getStats: jest.fn().mockReturnValue({
      size: 10,
      hits: 50,
      misses: 20
    })
  },
  ResponseCache: {
    generateKey: jest.fn().mockReturnValue('test-cache-key')
  }
}))

// Setup MSW server
const server = setupServer(
  // Mock OpenAI API
  rest.post('https://api.openai.com/v1/chat/completions', (req, res, ctx) => {
    return res(
      ctx.json({
        choices: [
          {
            message: {
              content: 'Thank you for your review! We appreciate your feedback.'
            }
          }
        ]
      })
    )
  }),

  // Mock Anthropic API
  rest.post('https://api.anthropic.com/v1/messages', (req, res, ctx) => {
    return res(
      ctx.json({
        content: [
          {
            type: 'text',
            text: 'Thank you for your review! We appreciate your feedback.'
          }
        ]
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('API Integration Tests', () => {
  describe('/api/generate-response', () => {
    const createRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    }

    test('should generate response successfully', async () => {
      const request = createRequest({
        reviewText: 'Great service and amazing food!',
        rating: '5',
        businessType: 'restaurant',
        tone: 'professional',
        responseLength: 'medium'
      })

      const response = await generateResponseHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.responses).toBeDefined()
      expect(data.responses).toHaveLength(3) // Default variations
      expect(data.metadata).toBeDefined()
      expect(data.metadata.cached).toBe(false)
    })

    test('should return 400 for missing required fields', async () => {
      const request = createRequest({
        reviewText: 'Great service!',
        // Missing other required fields
      })

      const response = await generateResponseHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })

    test('should return 400 for invalid rating', async () => {
      const request = createRequest({
        reviewText: 'Great service and amazing food!',
        rating: '6', // Invalid rating
        businessType: 'restaurant',
        tone: 'professional',
        responseLength: 'medium'
      })

      const response = await generateResponseHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid rating value')
    })

    test('should return 400 for review text too short', async () => {
      const request = createRequest({
        reviewText: 'Good', // Too short
        rating: '5',
        businessType: 'restaurant',
        tone: 'professional',
        responseLength: 'medium'
      })

      const response = await generateResponseHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Review text must be at least 10 characters')
    })

    test('should sanitize input with XSS attempts', async () => {
      const request = createRequest({
        reviewText: '<script>alert("xss")</script>Great service!',
        rating: '5',
        businessType: 'restaurant',
        tone: 'professional',
        responseLength: 'medium'
      })

      const response = await generateResponseHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      // The response should be generated with sanitized input
      expect(data.responses).toBeDefined()
    })
  })

  describe('/api/bulk-generate', () => {
    const createRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/bulk-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    }

    test('should generate bulk responses successfully', async () => {
      const request = createRequest({
        responses: [
          {
            id: '1',
            review: 'Great service and amazing food!',
            rating: '5',
            businessType: 'restaurant',
            tone: 'professional',
            responseLength: 'medium'
          },
          {
            id: '2',
            review: 'Excellent customer service, highly recommended!',
            rating: '4',
            businessType: 'retail',
            tone: 'friendly',
            responseLength: 'short'
          }
        ]
      })

      const response = await bulkGenerateHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.results).toHaveLength(2)
      expect(data.summary.total).toBe(2)
      expect(data.summary.successful).toBe(2)
    })

    test('should return 400 for empty responses array', async () => {
      const request = createRequest({
        responses: []
      })

      const response = await bulkGenerateHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No responses provided for bulk generation')
    })

    test('should return 400 for too many responses', async () => {
      const responses = Array.from({ length: 11 }, (_, i) => ({
        id: String(i + 1),
        review: 'Test review',
        rating: '5',
        businessType: 'restaurant',
        tone: 'professional',
        responseLength: 'medium'
      }))

      const request = createRequest({ responses })

      const response = await bulkGenerateHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Maximum 10 responses allowed for bulk generation')
    })
  })

  describe('/api/cache', () => {
    const createRequest = (method: string, body?: any, searchParams?: string) => {
      const url = searchParams 
        ? `http://localhost:3000/api/cache?${searchParams}`
        : 'http://localhost:3000/api/cache'
      
      return new NextRequest(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })
    }

    test('should get cache stats successfully', async () => {
      const request = createRequest('GET')
      const response = await cacheGetHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.stats).toBeDefined()
    })

    test('should set cache item successfully', async () => {
      const request = createRequest('POST', {
        action: 'set',
        key: 'test-key',
        data: { test: 'data' },
        ttl: 3600
      })

      const response = await cachePostHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Cache item set successfully')
    })

    test('should get cache item successfully', async () => {
      const request = createRequest('POST', {
        action: 'get',
        key: 'test-key'
      })

      const response = await cachePostHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.found).toBeDefined()
    })

    test('should check cache item existence', async () => {
      const request = createRequest('POST', {
        action: 'has',
        key: 'test-key'
      })

      const response = await cachePostHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.exists).toBeDefined()
    })

    test('should delete specific cache item', async () => {
      const request = createRequest('DELETE', undefined, 'key=test-key')
      const response = await cacheDeleteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.deleted).toBeDefined()
    })

    test('should clear entire cache', async () => {
      const request = createRequest('DELETE')
      const response = await cacheDeleteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Cache cleared successfully')
    })

    test('should return 400 for invalid action', async () => {
      const request = createRequest('POST', {
        action: 'invalid',
        key: 'test-key'
      })

      const response = await cachePostHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid action. Supported actions: set, get, has')
    })
  })
}) 