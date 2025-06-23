'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Volume2, VolumeX, Type, Palette, Zap } from 'lucide-react'
import { getThemeConfig, updateThemeConfig, applyAccessibilitySettings } from '@/lib/theme'
import Card from './Card'
import Button from './Button'
import Select from './Select'

interface AccessibilitySettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function AccessibilitySettings({ isOpen, onClose }: AccessibilitySettingsProps) {
  const [config, setConfig] = useState({
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    soundEnabled: true,
    autoPlay: false
  })

  useEffect(() => {
    if (isOpen) {
      const themeConfig = getThemeConfig()
      setConfig({
        highContrast: themeConfig.highContrast,
        reducedMotion: themeConfig.reducedMotion,
        fontSize: themeConfig.fontSize,
        soundEnabled: true,
        autoPlay: false
      })
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleSettingChange = (setting: string, value: any) => {
    const newConfig = { ...config, [setting]: value }
    setConfig(newConfig)
    
    // Update theme config
    updateThemeConfig({
      highContrast: newConfig.highContrast,
      reducedMotion: newConfig.reducedMotion,
      fontSize: newConfig.fontSize
    })
    
    // Apply accessibility settings
    applyAccessibilitySettings()
  }

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <Card className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Accessibility Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Customize your experience for better accessibility
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              aria-label="Close accessibility settings"
            >
              ✕
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Visual Settings */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Visual Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">High Contrast</p>
                        <p className="text-sm text-muted-foreground">
                          Increase contrast for better visibility
                        </p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.highContrast}
                        onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                        className="sr-only"
                        aria-label="Toggle high contrast mode"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${
                        config.highContrast ? 'bg-primary' : 'bg-muted'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                          config.highContrast ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Reduced Motion</p>
                        <p className="text-sm text-muted-foreground">
                          Reduce animations and transitions
                        </p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.reducedMotion}
                        onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                        className="sr-only"
                        aria-label="Toggle reduced motion"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${
                        config.reducedMotion ? 'bg-primary' : 'bg-muted'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                          config.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </label>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Type className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Font Size</p>
                        <p className="text-sm text-muted-foreground">
                          Adjust text size for better readability
                        </p>
                      </div>
                    </div>
                    
                    <Select
                      value={config.fontSize}
                      onChange={(value) => handleSettingChange('fontSize', value)}
                      options={fontSizeOptions}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Audio Settings */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Volume2 className="w-5 h-5 mr-2" />
                  Audio Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Volume2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Sound Effects</p>
                        <p className="text-sm text-muted-foreground">
                          Enable audio feedback for actions
                        </p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.soundEnabled}
                        onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                        className="sr-only"
                        aria-label="Toggle sound effects"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${
                        config.soundEnabled ? 'bg-primary' : 'bg-muted'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                          config.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <VolumeX className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Auto-play Audio</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically play audio notifications
                        </p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoPlay}
                        onChange={(e) => handleSettingChange('autoPlay', e.target.checked)}
                        className="sr-only"
                        aria-label="Toggle auto-play audio"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${
                        config.autoPlay ? 'bg-primary' : 'bg-muted'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                          config.autoPlay ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Keyboard Shortcuts</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">?</kbd> to view all shortcuts</p>
                  <p>• Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-background rounded text-xs">D</kbd> to toggle dark mode</p>
                  <p>• Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-background rounded text-xs">H</kbd> to toggle high contrast</p>
                  <p>• Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-background rounded text-xs">M</kbd> to toggle reduced motion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Settings are automatically saved
              </p>
              
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 