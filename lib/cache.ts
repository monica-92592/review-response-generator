interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheConfig {
  maxSize?: number
  defaultTTL?: number
}

class ResponseCache {
  private cache: Map<string, CacheItem<any>>
  private maxSize: number
  private defaultTTL: number

  constructor(config: CacheConfig = {}) {
    this.cache = new Map()
    this.maxSize = config.maxSize || 100
    this.defaultTTL = config.defaultTTL || 5 * 60 * 1000 // 5 minutes default

    // Load from localStorage on initialization
    this.loadFromStorage()
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }

    // Remove expired items first
    this.cleanup()

    // If cache is full, remove oldest item
    if (this.cache.size >= this.maxSize) {
      const keys = Array.from(this.cache.keys())
      const oldestKey = keys[0]
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, item)
    this.saveToStorage()
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item is expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.saveToStorage()
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.saveToStorage()
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.saveToStorage()
  }

  size(): number {
    this.cleanup()
    return this.cache.size
  }

  private cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    for (const [key, item] of entries) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries())
      localStorage.setItem('response-cache', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error)
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('response-cache')
      if (data) {
        const entries = JSON.parse(data)
        this.cache = new Map(entries)
        this.cleanup() // Remove expired items on load
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error)
    }
  }

  // Generate cache key for response generation
  static generateKey(review: string, tone: string, template?: string): string {
    const normalizedReview = review.trim().toLowerCase()
    const normalizedTone = tone.toLowerCase()
    const templatePart = template ? `-${template}` : ''
    return `response-${btoa(normalizedReview).slice(0, 20)}-${normalizedTone}${templatePart}`
  }

  // Get cache statistics
  getStats() {
    this.cleanup()
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses to calculate
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  private estimateMemoryUsage(): number {
    try {
      const data = JSON.stringify(Array.from(this.cache.entries()))
      return new Blob([data]).size
    } catch {
      return 0
    }
  }
}

// Export singleton instance
export const responseCache = new ResponseCache({
  maxSize: 50,
  defaultTTL: 10 * 60 * 1000 // 10 minutes for responses
})

export { ResponseCache }
export default ResponseCache 