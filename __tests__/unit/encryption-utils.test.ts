import { EncryptionUtils } from '@/lib/encryption-utils'

describe('EncryptionUtils', () => {
  const testData = 'sensitive test data'
  const testObject = { name: 'John', email: 'john@example.com' }

  beforeEach(() => {
    // Mock environment variable
    process.env.ENCRYPTION_KEY = 'test-encryption-key-32-bytes-long'
  })

  afterEach(() => {
    delete process.env.ENCRYPTION_KEY
  })

  describe('encryptSensitiveData', () => {
    test('should encrypt data successfully', () => {
      const encrypted = EncryptionUtils.encryptSensitiveData(testData)
      expect(encrypted).toBeDefined()
      expect(encrypted).not.toBe(testData)
      expect(typeof encrypted).toBe('string')
    })

    test('should throw error when encryption key is not set', () => {
      delete process.env.ENCRYPTION_KEY
      expect(() => {
        EncryptionUtils.encryptSensitiveData(testData)
      }).toThrow('ENCRYPTION_KEY environment variable is not set')
    })
  })

  describe('decryptSensitiveData', () => {
    test('should decrypt data successfully', () => {
      const encrypted = EncryptionUtils.encryptSensitiveData(testData)
      const decrypted = EncryptionUtils.decryptSensitiveData(encrypted)
      expect(decrypted).toBe(testData)
    })

    test('should throw error for invalid encrypted data', () => {
      expect(() => {
        EncryptionUtils.decryptSensitiveData('invalid-data')
      }).toThrow('Decryption failed')
    })
  })

  describe('encryptApiKey', () => {
    test('should encrypt API key successfully', () => {
      const apiKey = 'sk-test-api-key'
      const encrypted = EncryptionUtils.encryptApiKey(apiKey)
      expect(encrypted).toBeDefined()
      expect(encrypted).not.toBe(apiKey)
    })

    test('should throw error for empty API key', () => {
      expect(() => {
        EncryptionUtils.encryptApiKey('')
      }).toThrow('API key cannot be empty')
    })
  })

  describe('decryptApiKey', () => {
    test('should decrypt API key successfully', () => {
      const apiKey = 'sk-test-api-key'
      const encrypted = EncryptionUtils.encryptApiKey(apiKey)
      const decrypted = EncryptionUtils.decryptApiKey(encrypted)
      expect(decrypted).toBe(apiKey)
    })

    test('should throw error for empty encrypted API key', () => {
      expect(() => {
        EncryptionUtils.decryptApiKey('')
      }).toThrow('Encrypted API key cannot be empty')
    })
  })

  describe('encryptUserData', () => {
    test('should encrypt user data successfully', () => {
      const encrypted = EncryptionUtils.encryptUserData(testObject)
      expect(encrypted).toBeDefined()
      expect(encrypted).not.toBe(JSON.stringify(testObject))
    })
  })

  describe('decryptUserData', () => {
    test('should decrypt user data successfully', () => {
      const encrypted = EncryptionUtils.encryptUserData(testObject)
      const decrypted = EncryptionUtils.decryptUserData(encrypted)
      expect(decrypted).toEqual(testObject)
    })
  })

  describe('isEncryptionConfigured', () => {
    test('should return true when encryption key is set', () => {
      expect(EncryptionUtils.isEncryptionConfigured()).toBe(true)
    })

    test('should return false when encryption key is not set', () => {
      delete process.env.ENCRYPTION_KEY
      expect(EncryptionUtils.isEncryptionConfigured()).toBe(false)
    })
  })

  describe('generateEncryptionKey', () => {
    test('should generate a valid encryption key', () => {
      const key = EncryptionUtils.generateEncryptionKey()
      expect(key).toBeDefined()
      expect(typeof key).toBe('string')
      expect(key.length).toBe(64) // 32 bytes = 64 hex characters
    })
  })
}) 