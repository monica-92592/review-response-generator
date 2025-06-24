'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor, Settings } from 'lucide-react'
import { Theme, getThemeConfig, updateThemeConfig, applyTheme, getEffectiveTheme } from '@/lib/theme'
import { keyboardShortcuts } from '@/lib/keyboard-shortcuts'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ThemeToggle({ 
  className = '', 
  showLabel = false, 
  size = 'md' 
}: ThemeToggleProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system')
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const config = getThemeConfig()
    setCurrentTheme(config.theme)
    
    // Listen for theme changes
    const handleThemeChange = () => {
      const newConfig = getThemeConfig()
      setCurrentTheme(newConfig.theme)
    }
    
    window.addEventListener('storage', handleThemeChange)
    return () => window.removeEventListener('storage', handleThemeChange)
  }, [])

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme)
    updateThemeConfig({ theme })
    
    if (theme === 'system') {
      const effectiveTheme = getEffectiveTheme()
      applyTheme(effectiveTheme)
    } else {
      applyTheme(theme)
    }
    
    setIsOpen(false)
  }

  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />
      case 'dark':
        return <Moon className="w-4 h-4" />
      case 'system':
        return <Monitor className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  const getThemeLabel = (theme: Theme) => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
      default:
        return 'Theme'
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center rounded-lg border border-border bg-background`}>
        <Monitor className={iconSizes[size]} />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
        aria-label={`Current theme: ${getThemeLabel(currentTheme)}. Click to change theme.`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getThemeIcon(currentTheme)}
      </button>

      {showLabel && (
        <span className="ml-2 text-sm font-medium text-foreground">
          {getThemeLabel(currentTheme)}
        </span>
      )}

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-lg border border-border bg-popover p-2 shadow-lg">
            <div className="space-y-1">
              {(['light', 'dark', 'system'] as Theme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`w-full flex items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    currentTheme === theme
                      ? 'bg-accent text-accent-foreground'
                      : 'text-popover-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  aria-label={`Switch to ${getThemeLabel(theme)} theme`}
                >
                  <span className={iconSizes[size]}>
                    {getThemeIcon(theme)}
                  </span>
                  <span>{getThemeLabel(theme)}</span>
                  {currentTheme === theme && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Keyboard shortcut hint */}
            <div className="mt-2 border-t border-border pt-2">
              <p className="text-xs text-muted-foreground px-3">
                Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded text-xs">D</kbd> to toggle
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 