interface ErrorEvent {
  id: string
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  stack?: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  ip?: string
}

interface PerformanceEvent {
  id: string
  timestamp: string
  type: 'api_call' | 'page_load' | 'user_action'
  name: string
  duration: number
  metadata?: Record<string, any>
}

interface SecurityEvent {
  id: string
  timestamp: string
  type: 'rate_limit' | 'invalid_input' | 'xss_attempt' | 'unauthorized_access'
  details: string
  ip?: string
  userAgent?: string
  context?: Record<string, any>
}

class ErrorMonitor {
  private errors: ErrorEvent[] = []
  private performance: PerformanceEvent[] = []
  private security: SecurityEvent[] = []
  private maxEvents = 1000 // Keep last 1000 events in memory

  // Error logging
  logError(error: Error | string, context?: Record<string, any>) {
    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    }

    this.errors.push(errorEvent)
    this.trimEvents(this.errors)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorEvent)
    }

    // Send to external monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(errorEvent)
    }
  }

  logWarning(message: string, context?: Record<string, any>) {
    const warningEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    }

    this.errors.push(warningEvent)
    this.trimEvents(this.errors)

    if (process.env.NODE_ENV === 'development') {
      console.warn('Warning logged:', warningEvent)
    }
  }

  logInfo(message: string, context?: Record<string, any>) {
    const infoEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    }

    this.errors.push(infoEvent)
    this.trimEvents(this.errors)

    if (process.env.NODE_ENV === 'development') {
      console.info('Info logged:', infoEvent)
    }
  }

  // Performance monitoring
  logPerformance(type: PerformanceEvent['type'], name: string, duration: number, metadata?: Record<string, any>) {
    const performanceEvent: PerformanceEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type,
      name,
      duration,
      metadata,
    }

    this.performance.push(performanceEvent)
    this.trimEvents(this.performance)

    if (process.env.NODE_ENV === 'development') {
      console.log('Performance logged:', performanceEvent)
    }
  }

  // Security monitoring
  logSecurityEvent(type: SecurityEvent['type'], details: string, context?: Record<string, any>) {
    const securityEvent: SecurityEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type,
      details,
      context,
    }

    this.security.push(securityEvent)
    this.trimEvents(this.security)

    if (process.env.NODE_ENV === 'development') {
      console.warn('Security event logged:', securityEvent)
    }

    // Always send security events to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(securityEvent, 'security')
    }
  }

  // Rate limiting events
  logRateLimit(ip: string, endpoint: string, limit: number) {
    this.logSecurityEvent('rate_limit', `Rate limit exceeded for IP ${ip} on endpoint ${endpoint}`, {
      ip,
      endpoint,
      limit,
    })
  }

  // XSS attempt detection
  logXssAttempt(input: string, sanitizedInput: string) {
    this.logSecurityEvent('xss_attempt', 'XSS attempt detected and sanitized', {
      originalInput: input,
      sanitizedInput,
    })
  }

  // Invalid input attempts
  logInvalidInput(field: string, value: any, validation: string) {
    this.logSecurityEvent('invalid_input', `Invalid input for field ${field}`, {
      field,
      value,
      validation,
    })
  }

  // API performance tracking
  trackApiCall(endpoint: string, method: string, duration: number, statusCode: number) {
    this.logPerformance('api_call', `${method} ${endpoint}`, duration, {
      endpoint,
      method,
      statusCode,
    })
  }

  // Page load performance
  trackPageLoad(page: string, loadTime: number) {
    this.logPerformance('page_load', page, loadTime, {
      page,
    })
  }

  // User action tracking
  trackUserAction(action: string, duration: number, metadata?: Record<string, any>) {
    this.logPerformance('user_action', action, duration, metadata)
  }

  // Get events for analysis
  getErrors(limit = 100): ErrorEvent[] {
    return this.errors.slice(-limit)
  }

  getPerformance(limit = 100): PerformanceEvent[] {
    return this.performance.slice(-limit)
  }

  getSecurityEvents(limit = 100): SecurityEvent[] {
    return this.security.slice(-limit)
  }

  // Get statistics
  getStats() {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recentErrors = this.errors.filter(e => new Date(e.timestamp) > oneHourAgo)
    const recentSecurity = this.security.filter(e => new Date(e.timestamp) > oneHourAgo)
    const recentPerformance = this.performance.filter(e => new Date(e.timestamp) > oneHourAgo)

    return {
      total: {
        errors: this.errors.length,
        security: this.security.length,
        performance: this.performance.length,
      },
      recent: {
        errors: recentErrors.length,
        security: recentSecurity.length,
        performance: recentPerformance.length,
      },
      hourly: {
        errors: recentErrors.length,
        security: recentSecurity.length,
        performance: recentPerformance.length,
      },
      daily: {
        errors: this.errors.filter(e => new Date(e.timestamp) > oneDayAgo).length,
        security: this.security.filter(e => new Date(e.timestamp) > oneDayAgo).length,
        performance: this.performance.filter(e => new Date(e.timestamp) > oneDayAgo).length,
      },
    }
  }

  // Clear events
  clearEvents() {
    this.errors = []
    this.performance = []
    this.security = []
  }

  // Private methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private trimEvents<T>(events: T[]) {
    if (events.length > this.maxEvents) {
      events.splice(0, events.length - this.maxEvents)
    }
  }

  private async sendToMonitoringService(event: any, type = 'error') {
    try {
      // In a real implementation, you would send to a monitoring service like Sentry, LogRocket, etc.
      if (process.env.MONITORING_ENDPOINT) {
        await fetch(process.env.MONITORING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            event,
            timestamp: new Date().toISOString(),
          }),
        })
      }
    } catch (error) {
      console.error('Failed to send to monitoring service:', error)
    }
  }
}

// Global error monitor instance
export const errorMonitor = new ErrorMonitor()

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorMonitor.logError(event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    errorMonitor.logError(`Unhandled promise rejection: ${event.reason}`, {
      reason: event.reason,
    })
  })
}

// Performance monitoring
export const performanceMonitor = {
  startTimer(name: string) {
    const start = performance.now()
    return {
      end: (metadata?: Record<string, any>) => {
        const duration = performance.now() - start
        errorMonitor.trackUserAction(name, duration, metadata)
      },
    }
  },

  trackPageLoad() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const loadTime = performance.now()
        errorMonitor.trackPageLoad(window.location.pathname, loadTime)
      })
    }
  },
}

// Security monitoring helpers
export const securityMonitor = {
  logRateLimit: (ip: string, endpoint: string, limit: number) => {
    errorMonitor.logRateLimit(ip, endpoint, limit)
  },

  logXssAttempt: (input: string, sanitizedInput: string) => {
    errorMonitor.logXssAttempt(input, sanitizedInput)
  },

  logInvalidInput: (field: string, value: any, validation: string) => {
    errorMonitor.logInvalidInput(field, value, validation)
  },
} 