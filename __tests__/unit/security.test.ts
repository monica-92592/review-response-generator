import { 
  Encryption, 
  InputSanitizer, 
  Validator, 
  RateLimiter,
  apiRateLimiter,
  bulkApiRateLimiter 
} from '@/lib/security'

describe('Security Utilities', () => {
  describe('Encryption', () => {
    const testKey = 'test-encryption-key-32-bytes-long'
    const testData = 'sensitive test data'

    test('should encrypt and decrypt data correctly', () => {
      const encrypted = Encryption.encrypt(testData, testKey)
      const decrypted = Encryption.decrypt(encrypted, testKey)
      
      expect(encrypted).toBeDefined()
      expect(encrypted).not.toBe(testData)
      expect(decrypted).toBe(testData)
    })

    test('should throw error for invalid encrypted data format', () => {
      expect(() => {
        Encryption.decrypt('invalid-format', testKey)
      }).toThrow('Invalid encrypted data format')
    })

    test('should throw error for empty key', () => {
      expect(() => {
        Encryption.encrypt(testData, '')
      }).toThrow('Failed to encrypt data')
    })
  })

  describe('InputSanitizer', () => {
    describe('sanitizeString', () => {
      test('should remove HTML tags', () => {
        const input = '<script>alert("xss")</script>Hello World'
        const result = InputSanitizer.sanitizeString(input)
        expect(result).toBe('alert("xss")Hello World')
      })

      test('should remove javascript protocol', () => {
        const input = 'javascript:alert("xss")'
        const result = InputSanitizer.sanitizeString(input)
        expect(result).toBe('alert("xss")')
      })

      test('should remove event handlers', () => {
        const input = 'onclick=alert("xss") onload=alert("xss")'
        const result = InputSanitizer.sanitizeString(input)
        expect(result).toBe('alert("xss") alert("xss")')
      })

      test('should limit string length', () => {
        const longString = 'a'.repeat(15000)
        const result = InputSanitizer.sanitizeString(longString)
        expect(result.length).toBeLessThanOrEqual(10000)
      })

      test('should handle non-string input', () => {
        const result = InputSanitizer.sanitizeString(null as any)
        expect(result).toBe('')
      })

      test('should trim whitespace', () => {
        const input = '  Hello World  '
        const result = InputSanitizer.sanitizeString(input)
        expect(result).toBe('Hello World')
      })
    })

    describe('sanitizeReviewText', () => {
      test('should sanitize review text with special characters', () => {
        const input = 'Great service! <script>alert("xss")</script>'
        const result = InputSanitizer.sanitizeReviewText(input)
        expect(result).toBe('Great service! alert("xss")')
      })

      test('should normalize whitespace', () => {
        const input = 'Great   service!\n\nAmazing!'
        const result = InputSanitizer.sanitizeReviewText(input)
        expect(result).toBe('Great service! Amazing!')
      })

      test('should allow safe characters', () => {
        const input = 'Great service! Amazing food. 5 stars!'
        const result = InputSanitizer.sanitizeReviewText(input)
        expect(result).toBe('Great service! Amazing food. 5 stars!')
      })
    })

    describe('sanitizeEmail', () => {
      test('should validate correct email format', () => {
        const email = 'test@example.com'
        const result = InputSanitizer.sanitizeEmail(email)
        expect(result).toBe('test@example.com')
      })

      test('should return empty string for invalid email', () => {
        const email = 'invalid-email'
        const result = InputSanitizer.sanitizeEmail(email)
        expect(result).toBe('')
      })

      test('should handle non-string input', () => {
        const result = InputSanitizer.sanitizeEmail(null as any)
        expect(result).toBe('')
      })

      test('should convert to lowercase', () => {
        const email = 'TEST@EXAMPLE.COM'
        const result = InputSanitizer.sanitizeEmail(email)
        expect(result).toBe('test@example.com')
      })
    })

    describe('sanitizeObject', () => {
      test('should sanitize object with string values', () => {
        const input = {
          name: '<script>alert("xss")</script>John',
          email: 'test@example.com',
          message: 'Hello <b>World</b>'
        }
        const result = InputSanitizer.sanitizeObject(input)
        expect(result.name).toBe('alert("xss")John')
        expect(result.email).toBe('test@example.com')
        expect(result.message).toBe('Hello World')
      })

      test('should handle arrays', () => {
        const input = ['<script>alert("xss")</script>', 'normal text']
        const result = InputSanitizer.sanitizeObject(input)
        expect(result[0]).toBe('alert("xss")')
        expect(result[1]).toBe('normal text')
      })

      test('should handle nested objects', () => {
        const input = {
          user: {
            name: '<script>alert("xss")</script>John',
            settings: {
              theme: 'dark'
            }
          }
        }
        const result = InputSanitizer.sanitizeObject(input)
        expect(result.user.name).toBe('alert("xss")John')
        expect(result.user.settings.theme).toBe('dark')
      })

      test('should handle null and undefined', () => {
        expect(InputSanitizer.sanitizeObject(null)).toBeNull()
        expect(InputSanitizer.sanitizeObject(undefined)).toBeUndefined()
      })
    })
  })

  describe('Validator', () => {
    describe('isValidRating', () => {
      test('should validate correct ratings', () => {
        expect(Validator.isValidRating('1')).toBe(true)
        expect(Validator.isValidRating('5')).toBe(true)
        expect(Validator.isValidRating(3)).toBe(true)
      })

      test('should reject invalid ratings', () => {
        expect(Validator.isValidRating('0')).toBe(false)
        expect(Validator.isValidRating('6')).toBe(false)
        expect(Validator.isValidRating('abc')).toBe(false)
      })
    })

    describe('isValidBusinessType', () => {
      test('should validate correct business types', () => {
        expect(Validator.isValidBusinessType('restaurant')).toBe(true)
        expect(Validator.isValidBusinessType('healthcare')).toBe(true)
        expect(Validator.isValidBusinessType('other')).toBe(true)
      })

      test('should reject invalid business types', () => {
        expect(Validator.isValidBusinessType('invalid')).toBe(false)
        expect(Validator.isValidBusinessType('')).toBe(false)
      })
    })

    describe('isValidTone', () => {
      test('should validate correct tones', () => {
        expect(Validator.isValidTone('professional')).toBe(true)
        expect(Validator.isValidTone('friendly')).toBe(true)
        expect(Validator.isValidTone('empathetic')).toBe(true)
      })

      test('should reject invalid tones', () => {
        expect(Validator.isValidTone('invalid')).toBe(false)
        expect(Validator.isValidTone('')).toBe(false)
      })
    })

    describe('isValidResponseLength', () => {
      test('should validate correct lengths', () => {
        expect(Validator.isValidResponseLength('short')).toBe(true)
        expect(Validator.isValidResponseLength('medium')).toBe(true)
        expect(Validator.isValidResponseLength('long')).toBe(true)
      })

      test('should reject invalid lengths', () => {
        expect(Validator.isValidResponseLength('invalid')).toBe(false)
        expect(Validator.isValidResponseLength('')).toBe(false)
      })
    })

    describe('isValidProvider', () => {
      test('should validate correct providers', () => {
        expect(Validator.isValidProvider('openai')).toBe(true)
        expect(Validator.isValidProvider('claude')).toBe(true)
        expect(Validator.isValidProvider('auto')).toBe(true)
      })

      test('should reject invalid providers', () => {
        expect(Validator.isValidProvider('invalid')).toBe(false)
        expect(Validator.isValidProvider('')).toBe(false)
      })
    })

    describe('isValidVariations', () => {
      test('should validate correct variations', () => {
        expect(Validator.isValidVariations(1)).toBe(true)
        expect(Validator.isValidVariations(3)).toBe(true)
        expect(Validator.isValidVariations(5)).toBe(true)
      })

      test('should reject invalid variations', () => {
        expect(Validator.isValidVariations(0)).toBe(false)
        expect(Validator.isValidVariations(6)).toBe(false)
        expect(Validator.isValidVariations('abc')).toBe(false)
      })
    })

    describe('isValidToneAdjustment', () => {
      test('should validate correct adjustments', () => {
        expect(Validator.isValidToneAdjustment(0)).toBe(true)
        expect(Validator.isValidToneAdjustment(5)).toBe(true)
        expect(Validator.isValidToneAdjustment(10)).toBe(true)
      })

      test('should reject invalid adjustments', () => {
        expect(Validator.isValidToneAdjustment(-1)).toBe(false)
        expect(Validator.isValidToneAdjustment(11)).toBe(false)
        expect(Validator.isValidToneAdjustment('abc')).toBe(false)
      })
    })
  })

  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter

    beforeEach(() => {
      rateLimiter = new RateLimiter({
        windowMs: 1000, // 1 second for testing
        maxRequests: 3
      })
    })

    test('should allow requests within limit', () => {
      const identifier = 'test-ip'
      
      expect(rateLimiter.isAllowed(identifier)).toBe(true)
      expect(rateLimiter.isAllowed(identifier)).toBe(true)
      expect(rateLimiter.isAllowed(identifier)).toBe(true)
      expect(rateLimiter.isAllowed(identifier)).toBe(false)
    })

    test('should reset after window expires', async () => {
      const identifier = 'test-ip'
      
      expect(rateLimiter.isAllowed(identifier)).toBe(true)
      expect(rateLimiter.isAllowed(identifier)).toBe(true)
      expect(rateLimiter.isAllowed(identifier)).toBe(true)
      expect(rateLimiter.isAllowed(identifier)).toBe(false)
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      expect(rateLimiter.isAllowed(identifier)).toBe(true)
    })

    test('should track remaining requests', () => {
      const identifier = 'test-ip'
      
      expect(rateLimiter.getRemainingRequests(identifier)).toBe(2)
      rateLimiter.isAllowed(identifier)
      expect(rateLimiter.getRemainingRequests(identifier)).toBe(1)
      rateLimiter.isAllowed(identifier)
      expect(rateLimiter.getRemainingRequests(identifier)).toBe(0)
    })

    test('should cleanup expired records', async () => {
      const identifier = 'test-ip'
      rateLimiter.isAllowed(identifier)
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      rateLimiter.cleanup()
      expect(rateLimiter.getRemainingRequests(identifier)).toBe(3)
    })
  })

  describe('Global Rate Limiters', () => {
    test('should have correct configuration for API rate limiter', () => {
      expect(apiRateLimiter).toBeDefined()
    })

    test('should have correct configuration for bulk API rate limiter', () => {
      expect(bulkApiRateLimiter).toBeDefined()
    })
  })
}) 