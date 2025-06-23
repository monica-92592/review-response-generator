import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility function for combining class names
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

// Validate Anthropic API key format
export const validateAnthropicKey = (key: string): boolean => {
  // Anthropic API keys start with 'sk-ant-' and are typically 48 characters long
  return key.startsWith('sk-ant-') && key.length >= 20
}

// Sanitize text for API requests
export const sanitizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ')
}

// Format error messages for user display
export const formatErrorMessage = (error: string): string => {
  const errorMap: Record<string, string> = {
    'rate limit': 'Rate limit exceeded. Please wait a moment and try again.',
    'api key': 'API configuration error. Please check your Anthropic API key.',
    'quota': 'API quota exceeded. Please check your Anthropic account.',
    'timeout': 'Request timed out. Please try again.',
    'network': 'Network error. Please check your connection and try again.',
    'invalid': 'Invalid request. Please check your input and try again.'
  }

  const lowerError = error.toLowerCase()
  for (const [key, message] of Object.entries(errorMap)) {
    if (lowerError.includes(key)) {
      return message
    }
  }

  return error || 'An unexpected error occurred. Please try again.'
}

// Debounce function for API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Format date for display
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Get business type display name
export const getBusinessTypeDisplayName = (type: string): string => {
  const displayNames: Record<string, string> = {
    restaurant: 'Restaurant & Food',
    retail: 'Retail & E-commerce',
    healthcare: 'Healthcare',
    professional: 'Professional Services',
    hospitality: 'Hospitality & Travel',
    technology: 'Technology',
    other: 'Other'
  }
  return displayNames[type] || 'Other'
}

// Get tone display name
export const getToneDisplayName = (tone: string): string => {
  const displayNames: Record<string, string> = {
    professional: 'Professional',
    friendly: 'Friendly',
    formal: 'Formal',
    casual: 'Casual',
    empathetic: 'Empathetic'
  }
  return displayNames[tone] || 'Professional'
}

// Get response length display name
export const getLengthDisplayName = (length: string): string => {
  const displayNames: Record<string, string> = {
    short: 'Short (1-2 sentences)',
    medium: 'Medium (2-3 sentences)',
    long: 'Long (3-4 sentences)'
  }
  return displayNames[length] || 'Medium (2-3 sentences)'
} 