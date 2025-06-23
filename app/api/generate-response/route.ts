import { NextRequest, NextResponse } from 'next/server'
import { generateReviewResponse, getAvailableProviders } from '@/lib/ai-providers'
import { responseCache, ResponseCache } from '@/lib/cache'
import { 
  withSecurity, 
  withRateLimit, 
  apiRateLimiter, 
  InputSanitizer, 
  Validator 
} from '@/lib/security'

// Apply security and rate limiting middleware
const securedHandler = withSecurity(
  withRateLimit(apiRateLimiter)(
    async (request: NextRequest) => {
      try {
        // Parse and sanitize request body
        const body = await request.json()
        const sanitizedBody = InputSanitizer.sanitizeObject(body)
        
        const { 
          reviewText, 
          rating, 
          businessType, 
          tone, 
          responseLength, 
          provider,
          variations = 3,
          toneAdjustments = {},
          useTemplate = null,
          skipCache = false
        } = sanitizedBody

        // Enhanced validation with sanitized inputs
        if (!reviewText || !rating || !businessType || !tone || !responseLength) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          )
        }

        // Validate review text length and content
        const sanitizedReviewText = InputSanitizer.sanitizeReviewText(reviewText)
        if (sanitizedReviewText.trim().length < 10) {
          return NextResponse.json(
            { error: 'Review text must be at least 10 characters' },
            { status: 400 }
          )
        }

        if (sanitizedReviewText.trim().length > 5000) {
          return NextResponse.json(
            { error: 'Review text must be less than 5000 characters' },
            { status: 400 }
          )
        }

        // Validate all inputs using the Validator class
        if (!Validator.isValidRating(rating)) {
          return NextResponse.json(
            { error: 'Invalid rating value' },
            { status: 400 }
          )
        }

        if (!Validator.isValidBusinessType(businessType)) {
          return NextResponse.json(
            { error: 'Invalid business type' },
            { status: 400 }
          )
        }

        if (!Validator.isValidTone(tone)) {
          return NextResponse.json(
            { error: 'Invalid tone' },
            { status: 400 }
          )
        }

        if (!Validator.isValidResponseLength(responseLength)) {
          return NextResponse.json(
            { error: 'Invalid response length' },
            { status: 400 }
          )
        }

        // Validate provider (optional)
        if (provider && !Validator.isValidProvider(provider)) {
          return NextResponse.json(
            { error: 'Invalid AI provider' },
            { status: 400 }
          )
        }

        // Validate variations count
        if (!Validator.isValidVariations(variations)) {
          return NextResponse.json(
            { error: 'Variations must be between 1 and 5' },
            { status: 400 }
          )
        }

        // Validate tone adjustments
        if (toneAdjustments && typeof toneAdjustments === 'object') {
          const validAdjustments = ['formality', 'empathy', 'enthusiasm', 'professionalism']
          const adjustmentKeys = Object.keys(toneAdjustments)
          for (const key of adjustmentKeys) {
            if (!validAdjustments.includes(key)) {
              return NextResponse.json(
                { error: `Invalid tone adjustment: ${key}` },
                { status: 400 }
              )
            }
            const value = toneAdjustments[key]
            if (!Validator.isValidToneAdjustment(value)) {
              return NextResponse.json(
                { error: `Tone adjustment ${key} must be a number between 0 and 10` },
                { status: 400 }
              )
            }
          }
        }

        // Check if any AI provider is configured
        const availableProviders = getAvailableProviders()
        if (!availableProviders.openai && !availableProviders.claude) {
          return NextResponse.json(
            { error: 'No AI provider configured. Please set up OpenAI or Anthropic API keys.' },
            { status: 500 }
          )
        }

        // Generate cache key using sanitized review text
        const cacheKey = ResponseCache.generateKey(sanitizedReviewText, tone, useTemplate)
        
        // Check cache first (unless skipCache is true)
        if (!skipCache) {
          const cachedResponse = responseCache.get<any>(cacheKey)
          if (cachedResponse && cachedResponse.metadata) {
            return NextResponse.json({
              ...cachedResponse,
              metadata: {
                ...cachedResponse.metadata,
                cached: true,
                cacheKey
              }
            })
          }
        }

        // Generate multiple response variations
        const responses = []
        const numVariations = Math.min(variations || 3, 5)
        
        for (let i = 0; i < numVariations; i++) {
          const result = await generateReviewResponse({
            reviewText: sanitizedReviewText.trim(),
            rating,
            businessType,
            tone,
            responseLength,
            provider: provider || 'auto',
            variation: i + 1,
            toneAdjustments,
            useTemplate
          })

          if (result.error) {
            return NextResponse.json(
              { error: result.error },
              { status: 500 }
            )
          }

          responses.push({
            id: i + 1,
            text: result.response,
            provider: result.provider,
            validation: result.validation
          })
        }

        const responseData = {
          responses,
          metadata: {
            reviewLength: sanitizedReviewText.length,
            rating,
            businessType,
            tone,
            responseLength,
            variations: numVariations,
            toneAdjustments,
            useTemplate,
            timestamp: new Date().toISOString(),
            cached: false
          }
        }

        // Cache the successful response (unless skipCache is true)
        if (!skipCache) {
          responseCache.set(cacheKey, responseData)
        }

        // Return successful response with all variations
        return NextResponse.json(responseData)

      } catch (error: any) {
        console.error('API Error:', error)

        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          )
        }

        // Handle other errors
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  )
)

export const POST = securedHandler

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
} 