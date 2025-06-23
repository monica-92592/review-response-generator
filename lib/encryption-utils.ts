import { Encryption } from './security'

// Encryption utilities for sensitive data
export class EncryptionUtils {
  private static getEncryptionKey(): string {
    const key = process.env.ENCRYPTION_KEY
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is not set')
    }
    if (key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long')
    }
    return key
  }

  /**
   * Encrypt sensitive data like API keys or user information
   */
  static encryptSensitiveData(data: string): string {
    try {
      const key = this.getEncryptionKey()
      return Encryption.encrypt(data, key)
    } catch (error) {
      console.error('Failed to encrypt sensitive data:', error)
      throw new Error('Encryption failed')
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decryptSensitiveData(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey()
      return Encryption.decrypt(encryptedData, key)
    } catch (error) {
      console.error('Failed to decrypt sensitive data:', error)
      throw new Error('Decryption failed')
    }
  }

  /**
   * Encrypt API keys for storage
   */
  static encryptApiKey(apiKey: string): string {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API key cannot be empty')
    }
    return this.encryptSensitiveData(apiKey)
  }

  /**
   * Decrypt API keys for use
   */
  static decryptApiKey(encryptedApiKey: string): string {
    if (!encryptedApiKey || encryptedApiKey.trim().length === 0) {
      throw new Error('Encrypted API key cannot be empty')
    }
    return this.decryptSensitiveData(encryptedApiKey)
  }

  /**
   * Encrypt user preferences or settings
   */
  static encryptUserData(data: any): string {
    const jsonString = JSON.stringify(data)
    return this.encryptSensitiveData(jsonString)
  }

  /**
   * Decrypt user preferences or settings
   */
  static decryptUserData(encryptedData: string): any {
    const jsonString = this.decryptSensitiveData(encryptedData)
    return JSON.parse(jsonString)
  }

  /**
   * Check if encryption is properly configured
   */
  static isEncryptionConfigured(): boolean {
    try {
      this.getEncryptionKey()
      return true
    } catch {
      return false
    }
  }

  /**
   * Generate a secure encryption key
   */
  static generateEncryptionKey(): string {
    const crypto = require('crypto')
    return crypto.randomBytes(32).toString('hex')
  }
}

// Utility functions for secure storage
export const secureStorage = {
  /**
   * Securely store data in localStorage with encryption
   */
  setItem(key: string, value: any): void {
    if (typeof window === 'undefined') return // Server-side
    
    try {
      const encryptedValue = EncryptionUtils.encryptUserData(value)
      localStorage.setItem(key, encryptedValue)
    } catch (error) {
      console.error('Failed to store data securely:', error)
      // Fallback to unencrypted storage for non-sensitive data
      localStorage.setItem(key, JSON.stringify(value))
    }
  },

  /**
   * Securely retrieve data from localStorage with decryption
   */
  getItem(key: string): any {
    if (typeof window === 'undefined') return null // Server-side
    
    try {
      const encryptedValue = localStorage.getItem(key)
      if (!encryptedValue) return null
      
      return EncryptionUtils.decryptUserData(encryptedValue)
    } catch (error) {
      console.error('Failed to retrieve data securely:', error)
      // Fallback to unencrypted retrieval
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    }
  },

  /**
   * Remove data from localStorage
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') return // Server-side
    localStorage.removeItem(key)
  },

  /**
   * Clear all data from localStorage
   */
  clear(): void {
    if (typeof window === 'undefined') return // Server-side
    localStorage.clear()
  }
} 