import { NextRequest, NextResponse } from 'next/server'
import { generateReviewResponse, getAvailableProviders } from '@/lib/ai-providers'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { reviewText, rating, businessType, tone, responseLength, provider } = body

    // Validate required fields
    if (!reviewText || !rating || !businessType || !tone || !responseLength) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate review text length
    if (reviewText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review text must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Validate rating
    if (!['1', '2', '3', '4', '5'].includes(rating)) {
      return NextResponse.json(
        { error: 'Invalid rating value' },
        { status: 400 }
      )
    }

    // Validate business type
    const validBusinessTypes = [
      'restaurant', 'retail', 'healthcare', 'professional', 
      'hospitality', 'technology', 'other'
    ]
    if (!validBusinessTypes.includes(businessType)) {
      return NextResponse.json(
        { error: 'Invalid business type' },
        { status: 400 }
      )
    }

    // Validate tone
    const validTones = ['professional', 'friendly', 'formal', 'casual', 'empathetic']
    if (!validTones.includes(tone)) {
      return NextResponse.json(
        { error: 'Invalid tone' },
        { status: 400 }
      )
    }

    // Validate response length
    const validLengths = ['short', 'medium', 'long']
    if (!validLengths.includes(responseLength)) {
      return NextResponse.json(
        { error: 'Invalid response length' },
        { status: 400 }
      )
    }

    // Validate provider (optional)
    if (provider && !['openai', 'claude', 'auto'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid AI provider' },
        { status: 400 }
      )
    }

    // Check if any AI provider is configured
    const availableProviders = getAvailableProviders()
    if (!availableProviders.openai && !availableProviders.claude) {
      return NextResponse.json(
        { error: 'No AI provider configured. Please set up OpenAI or Anthropic API keys.' },
        { status: 500 }
      )
    }

    // Generate response
    const result = await generateReviewResponse({
      reviewText: reviewText.trim(),
      rating,
      businessType,
      tone,
      responseLength,
      provider: provider || 'auto'
    })

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Return successful response
    return NextResponse.json({
      response: result.response,
      provider: result.provider,
      metadata: {
        reviewLength: reviewText.length,
        rating,
        businessType,
        tone,
        responseLength,
        timestamp: new Date().toISOString()
      }
    })

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