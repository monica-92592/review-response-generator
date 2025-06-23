class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null
  private isSupported = 'serviceWorker' in navigator

  async register(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Service Worker not supported')
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered successfully:', this.registration)

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              this.showUpdateNotification()
            }
          })
        }
      })

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed')
        window.location.reload()
      })

      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      const unregistered = await this.registration.unregister()
      if (unregistered) {
        console.log('Service Worker unregistered successfully')
        this.registration = null
      }
      return unregistered
    } catch (error) {
      console.error('Service Worker unregistration failed:', error)
      return false
    }
  }

  async update(): Promise<void> {
    if (!this.registration) {
      return
    }

    try {
      await this.registration.update()
      console.log('Service Worker update check completed')
    } catch (error) {
      console.error('Service Worker update failed:', error)
    }
  }

  private showUpdateNotification(): void {
    // Create a simple update notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>🔄 New version available</span>
        <button onclick="window.location.reload()" class="underline">Update</button>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white/80 hover:text-white">×</button>
      </div>
    `
    document.body.appendChild(notification)

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 10000)
  }

  // Check if app is running offline
  isOffline(): boolean {
    return !navigator.onLine
  }

  // Get cache statistics
  async getCacheStats(): Promise<Record<string, any> | null> {
    if (!this.isSupported) {
      return null
    }

    try {
      const cacheNames = await caches.keys()
      const stats: Record<string, any> = {}

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        stats[cacheName] = {
          size: keys.length,
          entries: keys.map(key => key.url)
        }
      }

      return stats
    } catch (error) {
      console.error('Failed to get cache stats:', error)
      return null
    }
  }

  // Clear all caches
  async clearCaches(): Promise<void> {
    if (!this.isSupported) {
      return
    }

    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('All caches cleared')
    } catch (error) {
      console.error('Failed to clear caches:', error)
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.isSupported || !('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission()
    }

    return Notification.permission
  }

  // Send notification
  async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return
    }

    try {
      await this.registration?.showNotification(title, options)
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager()

// Auto-register service worker when module is imported
if (typeof window !== 'undefined') {
  serviceWorkerManager.register()
}

export default ServiceWorkerManager 