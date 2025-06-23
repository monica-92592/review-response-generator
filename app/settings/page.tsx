'use client'

import React, { useState, useEffect } from 'react'
import Container from '@/components/ui/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import { 
  Settings, 
  User, 
  Building, 
  Zap, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Key,
  Palette,
  Bell,
  Shield,
  Download,
  Upload,
  Keyboard,
  Info
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'preferences' | 'accessibility' | 'shortcuts' | 'defaults' | 'business' | 'api' | 'cache'>('preferences')
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [isClearingCache, setIsClearingCache] = useState(false)

  // User Preferences
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    notifications: {
      email: false,
      browser: true,
      sound: false
    }
  })

  // Default Response Settings
  const [defaultSettings, setDefaultSettings] = useState({
    defaultTone: 'professional',
    defaultLength: 'medium',
    defaultProvider: 'auto',
    defaultVariations: 3,
    autoSave: true,
    autoValidate: true
  })

  // Business Profile
  const [businessProfile, setBusinessProfile] = useState({
    name: '',
    type: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    brandColors: {
      primary: '#3B82F6',
      secondary: '#6B7280'
    },
    responseGuidelines: ''
  })

  // API Usage
  const [apiUsage, setApiUsage] = useState({
    totalRequests: 0,
    monthlyRequests: 0,
    dailyRequests: 0,
    providerUsage: {
      openai: 0,
      claude: 0,
      auto: 0
    },
    quotaLimit: 1000,
    quotaUsed: 0,
    lastReset: new Date()
  })

  // Load settings from localStorage on component mount
  useEffect(() => {
    loadSettings()
    loadApiUsage()
    loadCacheStats()
  }, [])

  const loadSettings = () => {
    try {
      const savedPreferences = localStorage.getItem('userPreferences')
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences))
      }

      const savedDefaults = localStorage.getItem('defaultResponseSettings')
      if (savedDefaults) {
        setDefaultSettings(JSON.parse(savedDefaults))
      }

      const savedBusiness = localStorage.getItem('businessProfile')
      if (savedBusiness) {
        setBusinessProfile(JSON.parse(savedBusiness))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadApiUsage = () => {
    try {
      const analyticsData = localStorage.getItem('analyticsData')
      if (analyticsData) {
        const data = JSON.parse(analyticsData)
        const totalRequests = data.length
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        const monthlyRequests = data.filter((item: any) => 
          new Date(item.timestamp) >= thirtyDaysAgo
        ).length

        const dailyRequests = data.filter((item: any) => 
          new Date(item.timestamp) >= oneDayAgo
        ).length

        const providerUsage = {
          openai: data.filter((item: any) => item.provider === 'openai').length,
          claude: data.filter((item: any) => item.provider === 'claude').length,
          auto: data.filter((item: any) => item.provider === 'auto').length
        }

        setApiUsage(prev => ({
          ...prev,
          totalRequests,
          monthlyRequests,
          dailyRequests,
          providerUsage,
          quotaUsed: totalRequests
        }))
      }
    } catch (error) {
      console.error('Error loading API usage:', error)
    }
  }

  const loadCacheStats = async () => {
    try {
      const response = await fetch('/api/cache')
      if (response.ok) {
        const data = await response.json()
        setCacheStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading cache stats:', error)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences))
      localStorage.setItem('defaultResponseSettings', JSON.stringify(defaultSettings))
      localStorage.setItem('businessProfile', JSON.stringify(businessProfile))
      
      // Apply theme changes immediately
      if (preferences.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (preferences.theme === 'light') {
        document.documentElement.classList.remove('dark')
      }

      // Apply accessibility settings
      if (preferences.highContrast) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }

      if (preferences.reducedMotion) {
        document.documentElement.classList.add('motion-reduce')
      } else {
        document.documentElement.classList.remove('motion-reduce')
      }

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const exportSettings = () => {
    const settingsData = {
      preferences,
      defaultSettings,
      businessProfile,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `settings-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.preferences) setPreferences(data.preferences)
        if (data.defaultSettings) setDefaultSettings(data.defaultSettings)
        if (data.businessProfile) setBusinessProfile(data.businessProfile)
        alert('Settings imported successfully!')
      } catch (error) {
        console.error('Error importing settings:', error)
        alert('Failed to import settings. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      setPreferences({
        theme: 'system',
        language: 'en',
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false,
        notifications: {
          email: false,
          browser: true,
          sound: false
        }
      })
      setDefaultSettings({
        defaultTone: 'professional',
        defaultLength: 'medium',
        defaultProvider: 'auto',
        defaultVariations: 3,
        autoSave: true,
        autoValidate: true
      })
      setBusinessProfile({
        name: '',
        type: '',
        industry: '',
        website: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        brandColors: {
          primary: '#3B82F6',
          secondary: '#6B7280'
        },
        responseGuidelines: ''
      })
    }
  }

  const getQuotaPercentage = () => {
    return Math.min((apiUsage.quotaUsed / apiUsage.quotaLimit) * 100, 100)
  }

  const getQuotaColor = () => {
    const percentage = getQuotaPercentage()
    if (percentage >= 90) return 'error'
    if (percentage >= 75) return 'warning'
    return 'success'
  }

  const tabs = [
    { id: 'preferences', name: 'Preferences', icon: User },
    { id: 'accessibility', name: 'Accessibility', icon: Eye },
    { id: 'shortcuts', name: 'Keyboard Shortcuts', icon: Keyboard },
    { id: 'defaults', name: 'Default Settings', icon: Settings },
    { id: 'business', name: 'Business Profile', icon: Building },
    { id: 'api', name: 'API Usage', icon: Zap },
    { id: 'cache', name: 'Cache Management', icon: Info }
  ]

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant & Food' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'professional', label: 'Professional Services' },
    { value: 'hospitality', label: 'Hospitality & Travel' },
    { value: 'technology', label: 'Technology' },
    { value: 'other', label: 'Other' }
  ]

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'casual', label: 'Casual' },
    { value: 'empathetic', label: 'Empathetic' }
  ]

  const responseLengths = [
    { value: 'short', label: 'Short (1-2 sentences)' },
    { value: 'medium', label: 'Medium (2-3 sentences)' },
    { value: 'long', label: 'Long (3-4 sentences)' }
  ]

  const providers = [
    { value: 'auto', label: 'Auto (Best Available)' },
    { value: 'claude', label: 'Claude (Anthropic)' },
    { value: 'openai', label: 'OpenAI (GPT-4)' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <Container>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings & Preferences</h1>
              <p className="text-gray-600">Customize your experience and manage your account</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                icon={Download}
                onClick={exportSettings}
              >
                Export Settings
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" icon={Upload}>
                  Import Settings
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </label>
              <Button
                variant="outline"
                icon={RefreshCw}
                onClick={resetSettings}
                className="text-red-600 hover:text-red-700"
              >
                Reset All
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white p-1 rounded-lg border mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* User Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Palette className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
                      <p className="text-sm text-gray-500">Customize the look and feel</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <Select
                        value={preferences.theme}
                        onChange={(value) => setPreferences(prev => ({ ...prev, theme: value as any }))}
                        options={[
                          { value: 'light', label: 'Light' },
                          { value: 'dark', label: 'Dark' },
                          { value: 'system', label: 'System' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <Select
                        value={preferences.language}
                        onChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'es', label: 'Spanish' },
                          { value: 'fr', label: 'French' },
                          { value: 'de', label: 'German' }
                        ]}
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                      <p className="text-sm text-gray-500">Manage your notification preferences</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Browser Notifications</label>
                        <p className="text-xs text-gray-500">Show notifications in your browser</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.browser}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          notifications: { ...prev.notifications, browser: e.target.checked }
                        }))}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                        <p className="text-xs text-gray-500">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.email}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          notifications: { ...prev.notifications, email: e.target.checked }
                        }))}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Visual Settings</h2>
                      <p className="text-sm text-gray-500">Enhance visibility and readability</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">High Contrast</label>
                        <p className="text-xs text-gray-500">Increase contrast for better visibility</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.highContrast}
                        onChange={(e) => setPreferences(prev => ({ ...prev, highContrast: e.target.checked }))}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Reduced Motion</label>
                        <p className="text-xs text-gray-500">Minimize animations and transitions</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.reducedMotion}
                        onChange={(e) => setPreferences(prev => ({ ...prev, reducedMotion: e.target.checked }))}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size
                      </label>
                      <Select
                        value={preferences.fontSize}
                        onChange={(value) => setPreferences(prev => ({ ...prev, fontSize: value as any }))}
                        options={[
                          { value: 'small', label: 'Small' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'large', label: 'Large' }
                        ]}
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Audio & Feedback</h2>
                      <p className="text-sm text-gray-500">Configure audio and haptic feedback</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Sound Notifications</label>
                        <p className="text-xs text-gray-500">Play sounds for notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.sound}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          notifications: { ...prev.notifications, sound: e.target.checked }
                        }))}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Browser Notifications</label>
                        <p className="text-xs text-gray-500">Show notifications in your browser</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.browser}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          notifications: { ...prev.notifications, browser: e.target.checked }
                        }))}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                        <p className="text-xs text-gray-500">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.email}
                        onChange={(e) => setPreferences(prev => ({ 
                          ...prev, 
                          notifications: { ...prev.notifications, email: e.target.checked }
                        }))}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Keyboard Shortcuts Tab */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-6">
                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Keyboard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
                      <p className="text-sm text-gray-500">Quick access to all available shortcuts</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Navigation Shortcuts */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Go to Generator</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">G</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Go to Templates</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">T</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Go to History</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">H</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Go to Analytics</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">A</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Go to Settings</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">S</kbd>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Shortcuts */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Generate Response</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">Ctrl</kbd>
                            <span className="text-gray-500">+</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">Enter</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Copy Response</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">Ctrl</kbd>
                            <span className="text-gray-500">+</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">C</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Save Template</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">Ctrl</kbd>
                            <span className="text-gray-500">+</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">S</kbd>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Template Shortcuts */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates</h3>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Quick Template 1</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">1</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Quick Template 2</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">2</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Quick Template 3</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">3</kbd>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Accessibility Shortcuts */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessibility</h3>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Toggle High Contrast</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">Ctrl</kbd>
                            <span className="text-gray-500">+</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">H</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Toggle Reduced Motion</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">Ctrl</kbd>
                            <span className="text-gray-500">+</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">M</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Increase Font Size</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">Ctrl</kbd>
                            <span className="text-gray-500">+</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">+</kbd>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Decrease Font Size</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">Ctrl</kbd>
                            <span className="text-gray-500">+</span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded border">-</kbd>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Help */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">Keyboard Shortcuts Help</h4>
                          <p className="text-xs text-blue-700 mt-1">
                            Press <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">?</kbd> anywhere in the app to quickly open this shortcuts reference.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Default Settings Tab */}
            {activeTab === 'defaults' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Response Defaults</h2>
                      <p className="text-sm text-gray-500">Set default values for new responses</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Tone
                      </label>
                      <Select
                        value={defaultSettings.defaultTone}
                        onChange={(value) => setDefaultSettings(prev => ({ ...prev, defaultTone: value }))}
                        options={tones}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Length
                      </label>
                      <Select
                        value={defaultSettings.defaultLength}
                        onChange={(value) => setDefaultSettings(prev => ({ ...prev, defaultLength: value }))}
                        options={responseLengths}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Provider
                      </label>
                      <Select
                        value={defaultSettings.defaultProvider}
                        onChange={(value) => setDefaultSettings(prev => ({ ...prev, defaultProvider: value }))}
                        options={providers}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Variations
                      </label>
                      <Select
                        value={defaultSettings.defaultVariations.toString()}
                        onChange={(value) => setDefaultSettings(prev => ({ ...prev, defaultVariations: parseInt(value) }))}
                        options={[
                          { value: '1', label: '1 Variation' },
                          { value: '2', label: '2 Variations' },
                          { value: '3', label: '3 Variations' },
                          { value: '4', label: '4 Variations' },
                          { value: '5', label: '5 Variations' }
                        ]}
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Auto Features</h2>
                      <p className="text-sm text-gray-500">Configure automatic behaviors</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Auto Save</label>
                        <p className="text-xs text-gray-500">Automatically save responses as you type</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={defaultSettings.autoSave}
                        onChange={(e) => setDefaultSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Auto Validate</label>
                        <p className="text-xs text-gray-500">Automatically validate response quality</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={defaultSettings.autoValidate}
                        onChange={(e) => setDefaultSettings(prev => ({ ...prev, autoValidate: e.target.checked }))}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Business Profile Tab */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
                      <p className="text-sm text-gray-500">Manage your business profile and branding</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Business Name"
                      value={businessProfile.name}
                      onChange={(value) => setBusinessProfile(prev => ({ ...prev, name: value }))}
                      placeholder="Enter your business name"
                    />

                    <Select
                      value={businessProfile.type}
                      onChange={(value) => setBusinessProfile(prev => ({ ...prev, type: value }))}
                      options={[
                        { value: '', label: 'Select business type' },
                        ...businessTypes
                      ]}
                    />

                    <Input
                      label="Industry"
                      value={businessProfile.industry}
                      onChange={(value) => setBusinessProfile(prev => ({ ...prev, industry: value }))}
                      placeholder="e.g., Technology, Healthcare, Retail"
                    />

                    <Input
                      label="Website"
                      value={businessProfile.website}
                      onChange={(value) => setBusinessProfile(prev => ({ ...prev, website: value }))}
                      placeholder="https://yourwebsite.com"
                    />

                    <Input
                      label="Email"
                      value={businessProfile.email}
                      onChange={(value) => setBusinessProfile(prev => ({ ...prev, email: value }))}
                      placeholder="contact@yourbusiness.com"
                    />

                    <Input
                      label="Phone"
                      value={businessProfile.phone}
                      onChange={(value) => setBusinessProfile(prev => ({ ...prev, phone: value }))}
                      placeholder="+1 (555) 123-4567"
                    />

                    <Input
                      label="Address"
                      value={businessProfile.address}
                      onChange={(value) => setBusinessProfile(prev => ({ ...prev, address: value }))}
                      placeholder="123 Business St, City, State 12345"
                    />
                  </div>

                  <div className="mt-4">
                    <Input
                      label="Business Description"
                      value={businessProfile.description}
                      onChange={(value) => setBusinessProfile(prev => ({ ...prev, description: value }))}
                      placeholder="Brief description of your business..."
                      type="textarea"
                      rows={3}
                    />
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Palette className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Branding & Guidelines</h2>
                      <p className="text-sm text-gray-500">Set your brand colors and response guidelines</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={businessProfile.brandColors.primary}
                          onChange={(e) => setBusinessProfile(prev => ({ 
                            ...prev, 
                            brandColors: { ...prev.brandColors, primary: e.target.value }
                          }))}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={businessProfile.brandColors.primary}
                          onChange={(value) => setBusinessProfile(prev => ({ 
                            ...prev, 
                            brandColors: { ...prev.brandColors, primary: value }
                          }))}
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={businessProfile.brandColors.secondary}
                          onChange={(e) => setBusinessProfile(prev => ({ 
                            ...prev, 
                            brandColors: { ...prev.brandColors, secondary: e.target.value }
                          }))}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={businessProfile.brandColors.secondary}
                          onChange={(value) => setBusinessProfile(prev => ({ 
                            ...prev, 
                            brandColors: { ...prev.brandColors, secondary: value }
                          }))}
                          placeholder="#6B7280"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Input
                      label="Response Guidelines"
                      value={businessProfile.responseGuidelines}
                      onChange={(value) => setBusinessProfile(prev => ({ ...prev, responseGuidelines: value }))}
                      placeholder="Guidelines for how responses should be written..."
                      type="textarea"
                      rows={4}
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* API Usage Tab */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">API Usage & Limits</h2>
                      <p className="text-sm text-gray-500">Monitor your API usage and costs</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{apiUsage.totalRequests}</div>
                      <div className="text-sm text-gray-500">Total Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{apiUsage.monthlyRequests}</div>
                      <div className="text-sm text-gray-500">This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{apiUsage.dailyRequests}</div>
                      <div className="text-sm text-gray-500">Today</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Usage Quota</span>
                      <span className="text-sm text-gray-500">
                        {apiUsage.quotaUsed} / {apiUsage.quotaLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          getQuotaColor() === 'error' ? 'bg-red-500' :
                          getQuotaColor() === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${getQuotaPercentage()}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        Last reset: {apiUsage.lastReset.toLocaleDateString()}
                      </span>
                      <Badge variant={getQuotaColor()}>
                        {getQuotaPercentage().toFixed(1)}% used
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">{apiUsage.providerUsage.openai}</div>
                      <div className="text-sm text-gray-500">OpenAI</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">{apiUsage.providerUsage.claude}</div>
                      <div className="text-sm text-gray-500">Claude</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">{apiUsage.providerUsage.auto}</div>
                      <div className="text-sm text-gray-500">Auto</div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Key className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">API Configuration</h2>
                      <p className="text-sm text-gray-500">Manage your API keys and settings</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OpenAI API Key
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={showApiKeys ? process.env.OPENAI_API_KEY || 'Not configured' : '••••••••••••••••'}
                          onChange={() => {}}
                          placeholder="sk-..."
                          disabled
                        />
                        <Button
                          variant="outline"
                          onClick={() => setShowApiKeys(!showApiKeys)}
                        >
                          {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Anthropic API Key
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={showApiKeys ? process.env.ANTHROPIC_API_KEY || 'Not configured' : '••••••••••••••••'}
                          onChange={() => {}}
                          placeholder="sk-ant-..."
                          disabled
                        />
                        <Button
                          variant="outline"
                          onClick={() => setShowApiKeys(!showApiKeys)}
                        >
                          {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">API Keys Security</h4>
                        <p className="text-xs text-yellow-700">
                          API keys are stored securely in environment variables and are not visible in the browser.
                        </p>
                      </div>
                      <Shield className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Cache Management Tab */}
            {activeTab === 'cache' && (
              <div className="space-y-6">
                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Info className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Cache Management</h2>
                      <p className="text-sm text-gray-500">Manage your application cache and storage</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Cache Statistics */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Cache Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">
                            {cacheStats?.size || 0}
                          </div>
                          <div className="text-sm text-gray-500">Cached Responses</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">
                            {cacheStats?.maxSize || 50}
                          </div>
                          <div className="text-sm text-gray-500">Max Cache Size</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900">
                            {cacheStats?.memoryUsage ? `${(cacheStats.memoryUsage / 1024).toFixed(1)} KB` : '0 KB'}
                          </div>
                          <div className="text-sm text-gray-500">Memory Usage</div>
                        </div>
                      </div>
                    </div>

                    {/* Cache Actions */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Cache Actions</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div>
                            <h4 className="text-sm font-medium text-blue-800">Response Cache</h4>
                            <p className="text-xs text-blue-700">
                              Cached responses are stored for 10 minutes to improve performance.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={async () => {
                              setIsClearingCache(true)
                              try {
                                const response = await fetch('/api/cache', { method: 'DELETE' })
                                if (response.ok) {
                                  alert('Cache cleared successfully!')
                                  // Refresh cache stats
                                  const statsResponse = await fetch('/api/cache')
                                  if (statsResponse.ok) {
                                    const data = await statsResponse.json()
                                    setCacheStats(data.stats)
                                  }
                                }
                              } catch (error) {
                                console.error('Failed to clear cache:', error)
                                alert('Failed to clear cache')
                              } finally {
                                setIsClearingCache(false)
                              }
                            }}
                            loading={isClearingCache}
                          >
                            Clear Cache
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div>
                            <h4 className="text-sm font-medium text-green-800">Service Worker Cache</h4>
                            <p className="text-xs text-green-700">
                              Static assets are cached for offline access.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={async () => {
                              try {
                                if ('caches' in window) {
                                  const cacheNames = await caches.keys()
                                  await Promise.all(
                                    cacheNames.map(name => caches.delete(name))
                                  )
                                  alert('Service Worker cache cleared!')
                                }
                              } catch (error) {
                                console.error('Failed to clear SW cache:', error)
                                alert('Failed to clear Service Worker cache')
                              }
                            }}
                          >
                            Clear SW Cache
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Cache Information */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">About Caching</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Response cache improves performance by storing generated responses</li>
                        <li>• Cache expires after 10 minutes to ensure fresh content</li>
                        <li>• Service Worker cache enables offline functionality</li>
                        <li>• Clearing cache may temporarily slow down the application</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={saveSettings}
              loading={isSaving}
              icon={Save}
            >
              Save Settings
            </Button>
          </div>
        </Container>
      </main>
    </div>
  )
}
