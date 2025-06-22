import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

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
}): Promise<{ response: string; error?: string; provider?: string }> => {
  try {
    // Check rate limits
    const rateLimitCheck = checkRateLimit()
    if (!rateLimitCheck.allowed) {
      return { response: '', error: rateLimitCheck.message }
    }

    const { provider = 'auto' } = params

    // Determine which provider to use
    const selectedProvider = await selectProvider(provider)

    if (selectedProvider === 'openai') {
      return await generateWithOpenAI(params)
    } else if (selectedProvider === 'claude') {
      return await generateWithClaude(params)
    } else {
      return { response: '', error: 'No AI provider available' }
    }

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

// Generate response using OpenAI
const generateWithOpenAI = async (params: {
  reviewText: string
  rating: string
  businessType: string
  tone: string
  responseLength: string
}): Promise<{ response: string; error?: string; provider?: string }> => {
  try {
    const prompt = createPrompt(params)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional customer service representative who writes thoughtful, authentic responses to customer reviews. Your responses should be:
- Appropriate for the business type and industry
- Match the specified tone (professional, friendly, formal, casual, or empathetic)
- Address the specific feedback in the review
- Be the specified length (short: 1-2 sentences, medium: 2-3 sentences, long: 3-4 sentences)
- Genuine and authentic, not generic
- Thank the customer for their feedback
- Show appreciation for their business
- Encourage future engagement when appropriate`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: getMaxTokens(params.responseLength),
      temperature: 0.7,
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

// Generate response using Claude
const generateWithClaude = async (params: {
  reviewText: string
  rating: string
  businessType: string
  tone: string
  responseLength: string
}): Promise<{ response: string; error?: string; provider?: string }> => {
  try {
    const prompt = createPrompt(params)

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: getMaxTokens(params.responseLength),
      temperature: 0.7,
      system: `You are a professional customer service representative who writes thoughtful, authentic responses to customer reviews. Your responses should be:
- Appropriate for the business type and industry
- Match the specified tone (professional, friendly, formal, casual, or empathetic)
- Address the specific feedback in the review
- Be the specified length (short: 1-2 sentences, medium: 2-3 sentences, long: 3-4 sentences)
- Genuine and authentic, not generic
- Thank the customer for their feedback
- Show appreciation for their business
- Encourage future engagement when appropriate

Always respond with just the review response text, no additional formatting or explanations.`,
      messages: [
        {
          role: 'user',
          content: prompt
        }
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

// Create dynamic prompt based on parameters
const createPrompt = (params: {
  reviewText: string
  rating: string
  businessType: string
  tone: string
  responseLength: string
}): string => {
  const { reviewText, rating, businessType, tone, responseLength } = params
  
  const businessContext = getBusinessContext(businessType)
  const toneInstructions = getToneInstructions(tone)
  const lengthInstructions = getLengthInstructions(responseLength)
  
  return `Please write a ${tone} response to this ${rating}-star review for a ${businessType} business:

Review: "${reviewText}"

Business Context: ${businessContext}
Tone: ${toneInstructions}
Length: ${lengthInstructions}

Write a response that addresses the specific feedback while maintaining the appropriate tone and length.`
}

// Get business-specific context
const getBusinessContext = (businessType: string): string => {
  const contexts: Record<string, string> = {
    restaurant: 'Restaurant/food service business. Focus on food quality, service, atmosphere, and dining experience.',
    retail: 'Retail/e-commerce business. Focus on products, customer service, shopping experience, and value.',
    healthcare: 'Healthcare/medical business. Focus on patient care, professionalism, and medical expertise.',
    professional: 'Professional services business. Focus on expertise, reliability, and professional standards.',
    hospitality: 'Hospitality/travel business. Focus on guest experience, accommodations, and service quality.',
    technology: 'Technology/software business. Focus on product functionality, support, and innovation.',
    other: 'General business. Focus on customer satisfaction and service quality.'
  }
  
  return contexts[businessType] || contexts.other
}

// Get tone-specific instructions
const getToneInstructions = (tone: string): string => {
  const instructions: Record<string, string> = {
    professional: 'Use formal, business-appropriate language. Be courteous and professional.',
    friendly: 'Use warm, approachable language. Be personable and welcoming.',
    formal: 'Use very formal, corporate language. Be respectful and proper.',
    casual: 'Use relaxed, conversational language. Be approachable and informal.',
    empathetic: 'Show understanding and compassion. Acknowledge feelings and concerns.'
  }
  
  return instructions[tone] || instructions.professional
}

// Get length-specific instructions
const getLengthInstructions = (length: string): string => {
  const instructions: Record<string, string> = {
    short: 'Keep it brief: 1-2 sentences maximum.',
    medium: 'Moderate length: 2-3 sentences.',
    long: 'Detailed response: 3-4 sentences.'
  }
  
  return instructions[length] || instructions.medium
}

// Get max tokens based on response length
const getMaxTokens = (length: string): number => {
  const tokenLimits: Record<string, number> = {
    short: 100,
    medium: 150,
    long: 200
  }
  
  return tokenLimits[length] || 150
}

// Get available providers
export const getAvailableProviders = (): { openai: boolean; claude: boolean } => {
  return {
    openai: !!process.env.OPENAI_API_KEY,
    claude: !!process.env.ANTHROPIC_API_KEY
  }
}

export default { generateReviewResponse, getAvailableProviders } 