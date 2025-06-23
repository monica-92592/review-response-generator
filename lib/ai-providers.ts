import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import {
  analyzeSentiment,
  createAdvancedPrompt,
  validateResponse,
  ReviewData
} from './prompt-engineer'

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30000,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 10,
  requestsPerHour: 100,
}

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitStore = {
  requests: [] as number[],
  lastCleanup: Date.now(),
}

// Clean up old requests (older than 1 hour)
const cleanupRateLimit = () => {
  const now = Date.now()
  const oneHourAgo = now - 60 * 60 * 1000
  rateLimitStore.requests = rateLimitStore.requests.filter(
    timestamp => timestamp > oneHourAgo
  )
  rateLimitStore.lastCleanup = now
}

// Check rate limits
const checkRateLimit = (): { allowed: boolean; message?: string } => {
  const now = Date.now()
  const oneMinuteAgo = now - 60 * 1000
  const oneHourAgo = now - 60 * 60 * 1000

  // Clean up old requests if needed
  if (now - rateLimitStore.lastCleanup > 60 * 60 * 1000) {
    cleanupRateLimit()
  }

  // Count recent requests
  const requestsLastMinute = rateLimitStore.requests.filter(
    timestamp => timestamp > oneMinuteAgo
  ).length

  const requestsLastHour = rateLimitStore.requests.filter(
    timestamp => timestamp > oneHourAgo
  ).length

  // Check limits
  if (requestsLastMinute >= RATE_LIMIT.requestsPerMinute) {
    return {
      allowed: false,
      message: 'Rate limit exceeded: Too many requests per minute',
    }
  }

  if (requestsLastHour >= RATE_LIMIT.requestsPerHour) {
    return {
      allowed: false,
      message: 'Rate limit exceeded: Too many requests per hour',
    }
  }

  // Add current request to tracking
  rateLimitStore.requests.push(now)

  return { allowed: true }
}

// AI Provider types
export type AIProvider = 'openai' | 'claude' | 'auto'

// Generate review response using specified AI provider
export const generateReviewResponse = async (params: {
  reviewText: string
  rating: string
  businessType: string
  tone: string
  responseLength: string
  provider?: AIProvider
  variation?: number
  toneAdjustments?: {
    formality?: number
    empathy?: number
    enthusiasm?: number
    professionalism?: number
  }
  useTemplate?: string | null
}): Promise<{ response: string; error?: string; provider?: string; validation?: any }> => {
  try {
    // Check rate limits
    const rateLimitCheck = checkRateLimit()
    if (!rateLimitCheck.allowed) {
      return { response: '', error: rateLimitCheck.message }
    }

    const { provider = 'auto', variation = 1, toneAdjustments = {}, useTemplate = null } = params
    const selectedProvider = await selectProvider(provider)

    // Advanced prompt engineering
    const reviewData: ReviewData = {
      text: params.reviewText,
      rating: params.rating,
      businessType: params.businessType,
      tone: params.tone,
      responseLength: params.responseLength,
      provider: selectedProvider as AIProvider,
      variation,
      toneAdjustments,
      useTemplate
    }
    const sentiment = analyzeSentiment(params.reviewText, params.rating)
    const prompt = createAdvancedPrompt(reviewData)

    let result
    if (selectedProvider === 'openai') {
      result = await generateWithOpenAIAdvanced(prompt)
    } else if (selectedProvider === 'claude') {
      result = await generateWithClaudeAdvanced(prompt)
    } else {
      return { response: '', error: 'No AI provider available' }
    }

    // Response quality validation
    const validation = validateResponse(result.response, reviewData, sentiment)
    return { ...result, validation }

  } catch (error: any) {
    console.error('AI Generation Error:', error)
    return {
      response: '',
      error: 'Failed to generate response. Please try again.'
    }
  }
}

// Select the best available provider
const selectProvider = async (preference: AIProvider): Promise<string> => {
  if (preference === 'auto') {
    // Check which providers are available
    const openaiAvailable = !!process.env.OPENAI_API_KEY
    const claudeAvailable = !!process.env.ANTHROPIC_API_KEY

    if (openaiAvailable && claudeAvailable) {
      // Both available, prefer Claude for better quality
      return 'claude'
    } else if (openaiAvailable) {
      return 'openai'
    } else if (claudeAvailable) {
      return 'claude'
    } else {
      throw new Error('No AI provider configured')
    }
  }

  // Check if preferred provider is available
  if (preference === 'openai' && !process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }
  if (preference === 'claude' && !process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  return preference
}

// Generate response using OpenAI with advanced prompt
const generateWithOpenAIAdvanced = async (prompt: any): Promise<{ response: string; error?: string; provider?: string }> => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ],
      max_tokens: prompt.maxTokens,
      temperature: prompt.temperature,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })
    const response = completion.choices[0]?.message?.content?.trim()
    if (!response) {
      return { response: '', error: 'No response generated from OpenAI' }
    }
    return { response, provider: 'openai' }
  } catch (error: any) {
    console.error('OpenAI API Error:', error)
    
    // Handle specific OpenAI errors
    if (error?.status === 429) {
      return { response: '', error: 'Rate limit exceeded. Please try again in a moment.' }
    }
    
    if (error?.status === 401) {
      return { response: '', error: 'Invalid OpenAI API key. Please check your configuration.' }
    }
    
    if (error?.status === 402) {
      return { response: '', error: 'OpenAI API quota exceeded. Please check your account.' }
    }
    
    if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
      return { response: '', error: 'Connection timeout. Please try again.' }
    }

    return { 
      response: '', 
      error: 'OpenAI API error. Please try again.' 
    }
  }
}

// Generate response using Claude with advanced prompt
const generateWithClaudeAdvanced = async (prompt: any): Promise<{ response: string; error?: string; provider?: string }> => {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: prompt.maxTokens,
      temperature: prompt.temperature,
      system: prompt.system,
      messages: [
        { role: 'user', content: prompt.user }
      ]
    })
    const response = message.content[0]?.type === 'text' ? message.content[0].text.trim() : ''
    if (!response) {
      return { response: '', error: 'No response generated from Claude' }
    }
    return { response, provider: 'claude' }
  } catch (error: any) {
    console.error('Claude API Error:', error)
    
    // Handle specific Claude errors
    if (error?.status === 429) {
      return { response: '', error: 'Rate limit exceeded. Please try again in a moment.' }
    }
    
    if (error?.status === 401) {
      return { response: '', error: 'Invalid Anthropic API key. Please check your configuration.' }
    }
    
    if (error?.status === 402) {
      return { response: '', error: 'Anthropic API quota exceeded. Please check your account.' }
    }
    
    if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
      return { response: '', error: 'Connection timeout. Please try again.' }
    }

    return { 
      response: '', 
      error: 'Claude API error. Please try again.' 
    }
  }
}

// Get available providers
export const getAvailableProviders = (): { openai: boolean; claude: boolean } => {
  return {
    openai: !!process.env.OPENAI_API_KEY,
    claude: !!process.env.ANTHROPIC_API_KEY
  }
}

export default { generateReviewResponse, getAvailableProviders } 