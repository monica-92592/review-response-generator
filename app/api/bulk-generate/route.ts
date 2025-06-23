import { NextRequest, NextResponse } from 'next/server'
import { generateReviewResponse as generateResponseWithOpenAI } from '@/lib/openai'
import { generateReviewResponse as generateResponseWithClaude } from '@/lib/claude'
import { 
  withSecurity, 
  withRateLimit, 
  bulkApiRateLimiter, 
  InputSanitizer, 
  Validator 
} from '@/lib/security'

interface BulkGenerateRequest {
  responses: Array<{
    id: string
    review: string
    rating: string
    businessType: string
    tone: string
    responseLength: string
    provider?: string
    toneAdjustments?: {
      formality: number
      empathy: number
      enthusiasm: number
      professionalism: number
    }
  }>
}

// Apply security and rate limiting middleware
const securedHandler = withSecurity(
  withRateLimit(bulkApiRateLimiter)(
    async (request: NextRequest) => {
      try {
        // Parse and sanitize request body
        const body: BulkGenerateRequest = await request.json()
        const sanitizedBody = InputSanitizer.sanitizeObject(body)
        const { responses } = sanitizedBody

        if (!responses || !Array.isArray(responses) || responses.length === 0) {
          return NextResponse.json(
            { error: 'No responses provided for bulk generation' },
            { status: 400 }
          )
        }

        if (responses.length > 10) {
          return NextResponse.json(
            { error: 'Maximum 10 responses allowed for bulk generation' },
            { status: 400 }
          )
        }

        // Validate each response in the bulk request
        for (const responseData of responses) {
          const { review, rating, businessType, tone, responseLength, provider, toneAdjustments } = responseData

          // Sanitize and validate review text
          const sanitizedReview = InputSanitizer.sanitizeReviewText(review)
          if (sanitizedReview.trim().length < 10) {
            return NextResponse.json(
              { error: `Review text for ID ${responseData.id} must be at least 10 characters` },
              { status: 400 }
            )
          }

          if (sanitizedReview.trim().length > 5000) {
            return NextResponse.json(
              { error: `Review text for ID ${responseData.id} must be less than 5000 characters` },
              { status: 400 }
            )
          }

          // Validate all inputs
          if (!Validator.isValidRating(rating)) {
            return NextResponse.json(
              { error: `Invalid rating value for ID ${responseData.id}` },
              { status: 400 }
            )
          }

          if (!Validator.isValidBusinessType(businessType)) {
            return NextResponse.json(
              { error: `Invalid business type for ID ${responseData.id}` },
              { status: 400 }
            )
          }

          if (!Validator.isValidTone(tone)) {
            return NextResponse.json(
              { error: `Invalid tone for ID ${responseData.id}` },
              { status: 400 }
            )
          }

          if (!Validator.isValidResponseLength(responseLength)) {
            return NextResponse.json(
              { error: `Invalid response length for ID ${responseData.id}` },
              { status: 400 }
            )
          }

          if (provider && !Validator.isValidProvider(provider)) {
            return NextResponse.json(
              { error: `Invalid AI provider for ID ${responseData.id}` },
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
                  { error: `Invalid tone adjustment ${key} for ID ${responseData.id}` },
                  { status: 400 }
                )
              }
              const value = toneAdjustments[key]
              if (!Validator.isValidToneAdjustment(value)) {
                return NextResponse.json(
                  { error: `Tone adjustment ${key} for ID ${responseData.id} must be a number between 0 and 10` },
                  { status: 400 }
                )
              }
            }
          }
        }

        const results = []

        for (const responseData of responses) {
          try {
            const {
              review,
              rating,
              businessType,
              tone,
              responseLength,
              provider = 'auto',
              toneAdjustments
            } = responseData

            // Sanitize review text
            const sanitizedReview = InputSanitizer.sanitizeReviewText(review)

            // Determine which provider to use
            let selectedProvider = provider
            if (provider === 'auto') {
              // Simple logic: use Claude for longer responses, OpenAI for shorter ones
              selectedProvider = responseLength === 'long' ? 'claude' : 'openai'
            }

            // Generate response based on selected provider
            let generatedResponse: string
            let generationTime: number

            const startTime = Date.now()

            if (selectedProvider === 'claude') {
              const result = await generateResponseWithClaude({
                reviewText: sanitizedReview,
                rating,
                businessType,
                tone,
                responseLength
              })
              if (result.error) {
                throw new Error(result.error)
              }
              generatedResponse = result.response
            } else {
              const result = await generateResponseWithOpenAI({
                reviewText: sanitizedReview,
                rating,
                businessType,
                tone,
                responseLength
              })
              if (result.error) {
                throw new Error(result.error)
              }
              generatedResponse = result.response
            }

            generationTime = (Date.now() - startTime) / 1000

            results.push({
              id: responseData.id,
              success: true,
              response: generatedResponse,
              provider: selectedProvider,
              generationTime
            })

          } catch (error) {
            console.error(`Error generating response for ID ${responseData.id}:`, error)
            results.push({
              id: responseData.id,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            })
          }
        }

        return NextResponse.json({
          success: true,
          results,
          summary: {
            total: responses.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          }
        })

      } catch (error) {
        console.error('Bulk generation error:', error)
        
        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          )
        }
        
        return NextResponse.json(
          { error: 'Failed to process bulk generation request' },
          { status: 500 }
        )
      }
    }
  )
)

export const POST = securedHandler 