'use client'

import { useEffect } from 'react'
import { getThemeConfig, applyTheme, applyAccessibilitySettings } from '@/lib/theme'

export default function ThemeInitializer() {
  useEffect(() => {
    try {
      // Initialize theme before page loads to prevent flash
      const themeConfig = getThemeConfig()
      const theme = themeConfig.theme || 'system'
      
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
      }
      
      // Apply accessibility settings
      if (themeConfig.highContrast) {
        document.documentElement.classList.add('high-contrast')
      }
      if (themeConfig.reducedMotion) {
        document.documentElement.classList.add('motion-reduce')
      }
      
      // Apply font size
      const fontSize = themeConfig.fontSize || 'medium'
      document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg')
      switch (fontSize) {
        case 'small':
          document.documentElement.classList.add('text-sm')
          break
        case 'large':
          document.documentElement.classList.add('text-lg')
          break
        default:
          document.documentElement.classList.add('text-base')
      }
    } catch (e) {
      console.error('Error initializing theme:', e)
    }
  }, [])

  return null
} 