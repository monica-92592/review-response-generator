export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description: string
  action: () => void
  category: 'navigation' | 'actions' | 'accessibility' | 'templates'
}

export interface ShortcutCategory {
  name: string
  shortcuts: KeyboardShortcut[]
}

export const defaultShortcuts: KeyboardShortcut[] = [
  // Navigation shortcuts
  {
    key: 'g',
    ctrl: true,
    description: 'Go to main page',
    action: () => window.location.href = '/',
    category: 'navigation'
  },
  {
    key: 't',
    ctrl: true,
    description: 'Go to templates',
    action: () => window.location.href = '/templates',
    category: 'navigation'
  },
  {
    key: 'a',
    ctrl: true,
    description: 'Go to analytics',
    action: () => window.location.href = '/analytics',
    category: 'navigation'
  },
  
  // Action shortcuts
  {
    key: 'Enter',
    ctrl: true,
    description: 'Generate response',
    action: () => {
      const generateButton = document.querySelector('[data-shortcut="generate"]') as HTMLButtonElement
      if (generateButton && !generateButton.disabled) {
        generateButton.click()
      }
    },
    category: 'actions'
  },
  {
    key: 'c',
    ctrl: true,
    description: 'Copy selected response',
    action: () => {
      const copyButton = document.querySelector('[data-shortcut="copy"]') as HTMLButtonElement
      if (copyButton) {
        copyButton.click()
      }
    },
    category: 'actions'
  },
  {
    key: 'r',
    ctrl: true,
    description: 'Refresh page',
    action: () => window.location.reload(),
    category: 'actions'
  },
  
  // Template shortcuts
  {
    key: '1',
    ctrl: true,
    description: 'Select template 1',
    action: () => {
      const template1 = document.querySelector('[data-template-index="0"]') as HTMLElement
      if (template1) template1.click()
    },
    category: 'templates'
  },
  {
    key: '2',
    ctrl: true,
    description: 'Select template 2',
    action: () => {
      const template2 = document.querySelector('[data-template-index="1"]') as HTMLElement
      if (template2) template2.click()
    },
    category: 'templates'
  },
  {
    key: '3',
    ctrl: true,
    description: 'Select template 3',
    action: () => {
      const template3 = document.querySelector('[data-template-index="2"]') as HTMLElement
      if (template3) template3.click()
    },
    category: 'templates'
  },
  
  // Accessibility shortcuts
  {
    key: 'd',
    ctrl: true,
    description: 'Toggle dark mode',
    action: () => {
      const event = new CustomEvent('toggleTheme')
      window.dispatchEvent(event)
    },
    category: 'accessibility'
  },
  {
    key: 'h',
    ctrl: true,
    description: 'Toggle high contrast',
    action: () => {
      const event = new CustomEvent('toggleHighContrast')
      window.dispatchEvent(event)
    },
    category: 'accessibility'
  },
  {
    key: 'm',
    ctrl: true,
    description: 'Toggle reduced motion',
    action: () => {
      const event = new CustomEvent('toggleReducedMotion')
      window.dispatchEvent(event)
    },
    category: 'accessibility'
  },
  {
    key: '?',
    description: 'Show keyboard shortcuts',
    action: () => {
      const event = new CustomEvent('showShortcuts')
      window.dispatchEvent(event)
    },
    category: 'accessibility'
  }
]

class KeyboardShortcutsManager {
  private shortcuts: KeyboardShortcut[] = []
  private isEnabled: boolean = true
  private isListening: boolean = false

  constructor() {
    this.shortcuts = [...defaultShortcuts]
  }

  // Initialize the keyboard shortcuts system
  init() {
    if (this.isListening) return
    
    this.isListening = true
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    
    // Listen for custom events
    window.addEventListener('toggleTheme', this.handleToggleTheme.bind(this))
    window.addEventListener('toggleHighContrast', this.handleToggleHighContrast.bind(this))
    window.addEventListener('toggleReducedMotion', this.handleToggleReducedMotion.bind(this))
    window.addEventListener('showShortcuts', this.showShortcutsModal.bind(this))
  }

  // Handle keydown events
  private handleKeyDown(event: KeyboardEvent) {
    if (!this.isEnabled) return
    
    // Don't trigger shortcuts when typing in input fields
    if (this.isTypingInInput(event.target as HTMLElement)) return
    
    const shortcut = this.findMatchingShortcut(event)
    if (shortcut) {
      event.preventDefault()
      shortcut.action()
    }
  }

  // Check if user is typing in an input field
  private isTypingInInput(element: HTMLElement | null): boolean {
    if (!element) return false
    
    const inputTypes = ['input', 'textarea', 'select']
    const contentEditable = element.getAttribute('contenteditable') === 'true'
    
    return inputTypes.includes(element.tagName.toLowerCase()) || contentEditable
  }

  // Find matching shortcut for the keydown event
  private findMatchingShortcut(event: KeyboardEvent): KeyboardShortcut | undefined {
    return this.shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()
      const ctrlMatch = !!shortcut.ctrl === event.ctrlKey
      const shiftMatch = !!shortcut.shift === event.shiftKey
      const altMatch = !!shortcut.alt === event.altKey
      const metaMatch = !!shortcut.meta === event.metaKey
      
      return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch
    })
  }

  // Add a new shortcut
  addShortcut(shortcut: KeyboardShortcut) {
    this.shortcuts.push(shortcut)
  }

  // Remove a shortcut
  removeShortcut(key: string, ctrl?: boolean, shift?: boolean, alt?: boolean, meta?: boolean) {
    this.shortcuts = this.shortcuts.filter(shortcut => {
      return !(shortcut.key === key && 
               shortcut.ctrl === ctrl && 
               shortcut.shift === shift && 
               shortcut.alt === alt && 
               shortcut.meta === meta)
    })
  }

  // Get all shortcuts grouped by category
  getShortcutsByCategory(): ShortcutCategory[] {
    const categories: Record<string, KeyboardShortcut[]> = {}
    
    this.shortcuts.forEach(shortcut => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = []
      }
      categories[shortcut.category].push(shortcut)
    })
    
    return Object.entries(categories).map(([name, shortcuts]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      shortcuts
    }))
  }

  // Enable/disable shortcuts
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  // Get shortcut display text
  getShortcutDisplay(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.meta) parts.push('⌘')
    
    parts.push(shortcut.key.toUpperCase())
    
    return parts.join(' + ')
  }

  // Handle theme toggle
  private handleToggleTheme() {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark')
    
    // Update localStorage
    const config = JSON.parse(localStorage.getItem('theme-config') || '{}')
    config.theme = currentTheme
    localStorage.setItem('theme-config', JSON.stringify(config))
  }

  // Handle high contrast toggle
  private handleToggleHighContrast() {
    document.documentElement.classList.toggle('high-contrast')
    
    // Update localStorage
    const config = JSON.parse(localStorage.getItem('theme-config') || '{}')
    config.highContrast = document.documentElement.classList.contains('high-contrast')
    localStorage.setItem('theme-config', JSON.stringify(config))
  }

  // Handle reduced motion toggle
  private handleToggleReducedMotion() {
    document.documentElement.classList.toggle('motion-reduce')
    
    // Update localStorage
    const config = JSON.parse(localStorage.getItem('theme-config') || '{}')
    config.reducedMotion = document.documentElement.classList.contains('motion-reduce')
    localStorage.setItem('theme-config', JSON.stringify(config))
  }

  // Show shortcuts modal
  private showShortcutsModal() {
    const event = new CustomEvent('openShortcutsModal')
    window.dispatchEvent(event)
  }

  // Cleanup
  destroy() {
    if (!this.isListening) return
    
    this.isListening = false
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    
    window.removeEventListener('toggleTheme', this.handleToggleTheme.bind(this))
    window.removeEventListener('toggleHighContrast', this.handleToggleHighContrast.bind(this))
    window.removeEventListener('toggleReducedMotion', this.handleToggleReducedMotion.bind(this))
    window.removeEventListener('showShortcuts', this.showShortcutsModal.bind(this))
  }
}

// Create singleton instance
export const keyboardShortcuts = new KeyboardShortcutsManager()

// Initialize on client side
if (typeof window !== 'undefined') {
  keyboardShortcuts.init()
} 