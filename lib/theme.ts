export type Theme = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  theme: Theme
  primaryColor: string
  fontSize: 'small' | 'medium' | 'large'
  reducedMotion: boolean
  highContrast: boolean
}

const THEME_STORAGE_KEY = 'theme-config'

// Default theme configuration
export const defaultThemeConfig: ThemeConfig = {
  theme: 'system',
  primaryColor: 'blue',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false
}

// Get theme configuration from localStorage
export const getThemeConfig = (): ThemeConfig => {
  if (typeof window === 'undefined') return defaultThemeConfig
  
  try {
    const data = localStorage.getItem(THEME_STORAGE_KEY)
    if (!data) return defaultThemeConfig
    
    const parsed = JSON.parse(data)
    return { ...defaultThemeConfig, ...parsed }
  } catch (error) {
    console.error('Error loading theme config:', error)
    return defaultThemeConfig
  }
}

// Save theme configuration to localStorage
export const saveThemeConfig = (config: ThemeConfig) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config))
  } catch (error) {
    console.error('Error saving theme config:', error)
  }
}

// Update theme configuration
export const updateThemeConfig = (updates: Partial<ThemeConfig>) => {
  const currentConfig = getThemeConfig()
  const newConfig = { ...currentConfig, ...updates }
  saveThemeConfig(newConfig)
  return newConfig
}

// Get current effective theme (light/dark)
export const getEffectiveTheme = (): 'light' | 'dark' => {
  const config = getThemeConfig()
  
  if (config.theme === 'system') {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  
  return config.theme
}

// Apply theme to document
export const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark')
  
  // Add new theme class
  root.classList.add(theme)
  
  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff')
  }
}

// Initialize theme on app load
export const initializeTheme = () => {
  const effectiveTheme = getEffectiveTheme()
  applyTheme(effectiveTheme)
  
  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      const config = getThemeConfig()
      if (config.theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    })
  }
}

// Theme color utilities
export const themeColors = {
  blue: {
    light: '#3b82f6',
    dark: '#60a5fa'
  },
  green: {
    light: '#10b981',
    dark: '#34d399'
  },
  purple: {
    light: '#8b5cf6',
    dark: '#a78bfa'
  },
  orange: {
    light: '#f59e0b',
    dark: '#fbbf24'
  },
  pink: {
    light: '#ec4899',
    dark: '#f472b6'
  }
}

// Get current theme color
export const getThemeColor = (colorName: string) => {
  const theme = getEffectiveTheme()
  return themeColors[colorName as keyof typeof themeColors]?.[theme] || themeColors.blue[theme]
}

// Accessibility utilities
export const getAccessibilityConfig = () => {
  const config = getThemeConfig()
  return {
    reducedMotion: config.reducedMotion,
    highContrast: config.highContrast,
    fontSize: config.fontSize
  }
}

// Apply accessibility settings
export const applyAccessibilitySettings = () => {
  const config = getAccessibilityConfig()
  const root = document.documentElement
  
  if (config.reducedMotion) {
    root.classList.add('motion-reduce')
  } else {
    root.classList.remove('motion-reduce')
  }
  
  if (config.highContrast) {
    root.classList.add('high-contrast')
  } else {
    root.classList.remove('high-contrast')
  }
  
  // Apply font size
  root.classList.remove('text-sm', 'text-base', 'text-lg')
  switch (config.fontSize) {
    case 'small':
      root.classList.add('text-sm')
      break
    case 'large':
      root.classList.add('text-lg')
      break
    default:
      root.classList.add('text-base')
  }
} 