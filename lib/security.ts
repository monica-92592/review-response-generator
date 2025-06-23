import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

// Encryption utilities
export class Encryption {
  private static algorithm = 'aes-256-gcm'
  private static keyLength = 32
  private static ivLength = 16
  private static saltLength = 64
  private static tagLength = 16

  static encrypt(text: string, secretKey: string): string {
    try {
      // Generate salt and derive key
      const salt = crypto.randomBytes(this.saltLength)
      const key = crypto.pbkdf2Sync(secretKey, salt, 100000, this.keyLength, 'sha512')
      
      // Generate IV
      const iv = crypto.randomBytes(this.ivLength)
      
      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, key)
      
      // Encrypt
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      // Combine all parts: salt + iv + encrypted
      const result = salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted
      
      return result
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  static decrypt(encryptedText: string, secretKey: string): string {
    try {
      // Split the encrypted text
      const parts = encryptedText.split(':')
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format')
      }
      
      const [saltHex, ivHex, encrypted] = parts
      
      // Convert hex strings back to buffers
      const salt = Buffer.from(saltHex, 'hex')
      const iv = Buffer.from(ivHex, 'hex')
      
      // Derive key
      const key = crypto.pbkdf2Sync(secretKey, salt, 100000, this.keyLength, 'sha512')
      
      // Create decipher
      const decipher = crypto.createDecipher(this.algorithm, key)
      
      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt data')
    }
  }
}

// Input sanitization utilities
export class InputSanitizer {
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return ''
    }
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 10000) // Limit length
  }

  static sanitizeReviewText(input: string): string {
    const sanitized = this.sanitizeString(input)
    
    // Additional review-specific sanitization
    return sanitized
      .replace(/[^\w\s.,!?-]/g, '') // Only allow safe characters
      .replace(/\s+/g, ' ') // Normalize whitespace
  }

  static sanitizeEmail(input: string): string {
    if (typeof input !== 'string') {
      return ''
    }
    
    const email = input.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    return emailRegex.test(email) ? email : ''
  }

  static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item))
    }
    
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value)
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }
}

// Rate limiting utilities
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: NextRequest) => string
}

export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs
      })
      return true
    }

    if (record.count >= this.config.maxRequests) {
      return false
    }

    record.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record || Date.now() > record.resetTime) {
      return this.config.maxRequests
    }
    return Math.max(0, this.config.maxRequests - record.count)
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier)
    return record ? record.resetTime : Date.now() + this.config.windowMs
  }

  // Clean up expired records periodically
  cleanup() {
    const now = Date.now()
    const entries = Array.from(this.requests.entries())
    for (const [key, record] of entries) {
      if (now > record.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// Global rate limiters
export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30 // 30 requests per minute
})

export const bulkApiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5 // 5 bulk requests per minute
})

// Clean up expired records every 5 minutes
setInterval(() => {
  apiRateLimiter.cleanup()
  bulkApiRateLimiter.cleanup()
}, 5 * 60 * 1000)

// CORS configuration
export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
}

// Security middleware
export function withSecurity(handler: Function) {
  return async (request: NextRequest) => {
    // Add security headers
    const response = await handler(request)
    
    if (response instanceof NextResponse) {
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
      
      // Add CORS headers
      const origin = request.headers.get('origin')
      if (origin && corsConfig.origin.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }
      response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '))
      response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '))
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString())
    }
    
    return response
  }
}

// Rate limiting middleware
export function withRateLimit(rateLimiter: RateLimiter, keyGenerator?: (req: NextRequest) => string) {
  return (handler: Function) => {
    return async (request: NextRequest) => {
      const identifier = keyGenerator 
        ? keyGenerator(request)
        : request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      
      if (!rateLimiter.isAllowed(identifier)) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((rateLimiter.getResetTime(identifier) - Date.now()) / 1000)
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': '30',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimiter.getResetTime(identifier).toString(),
              'Retry-After': Math.ceil((rateLimiter.getResetTime(identifier) - Date.now()) / 1000).toString()
            }
          }
        )
      }
      
      const response = await handler(request)
      
      if (response instanceof NextResponse) {
        response.headers.set('X-RateLimit-Limit', '30')
        response.headers.set('X-RateLimit-Remaining', rateLimiter.getRemainingRequests(identifier).toString())
        response.headers.set('X-RateLimit-Reset', rateLimiter.getResetTime(identifier).toString())
      }
      
      return response
    }
  }
}

// Validation utilities
export class Validator {
  static isValidRating(rating: any): boolean {
    return ['1', '2', '3', '4', '5'].includes(String(rating))
  }

  static isValidBusinessType(businessType: any): boolean {
    const validTypes = [
      'restaurant', 'retail', 'healthcare', 'professional', 
      'hospitality', 'technology', 'other'
    ]
    return validTypes.includes(String(businessType))
  }

  static isValidTone(tone: any): boolean {
    const validTones = ['professional', 'friendly', 'formal', 'casual', 'empathetic']
    return validTones.includes(String(tone))
  }

  static isValidResponseLength(length: any): boolean {
    const validLengths = ['short', 'medium', 'long']
    return validLengths.includes(String(length))
  }

  static isValidProvider(provider: any): boolean {
    const validProviders = ['openai', 'claude', 'auto']
    return validProviders.includes(String(provider))
  }

  static isValidVariations(variations: any): boolean {
    const num = parseInt(String(variations))
    return !isNaN(num) && num >= 1 && num <= 5
  }

  static isValidToneAdjustment(value: any): boolean {
    const num = parseFloat(String(value))
    return !isNaN(num) && num >= 0 && num <= 10
  }
} 