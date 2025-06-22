'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/ui/Header'
import Container from '@/components/ui/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import { MessageSquare, Copy, RefreshCw, Star, Zap, AlertCircle, CheckCircle } from 'lucide-react'

interface ResponseHistory {
  id: string
  review: string
  rating: string
  businessType: string
  tone: string
  responseLength: string
  response: string
  timestamp: Date
}

interface FormErrors {
  reviewText?: string
  rating?: string
  businessType?: string
  tone?: string
  responseLength?: string
}

export default function Home() {
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [tone, setTone] = useState('')
  const [responseLength, setResponseLength] = useState('')
  const [aiProvider, setAiProvider] = useState('auto')
  const [generatedResponse, setGeneratedResponse] = useState('')
  const [usedProvider, setUsedProvider] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [responseHistory, setResponseHistory] = useState<ResponseHistory[]>([])

  // Load response history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('responseHistory')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setResponseHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })))
      } catch (err) {
        console.error('Error loading response history:', err)
      }
    }
  }, [])

  // Save response history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('responseHistory', JSON.stringify(responseHistory))
  }, [responseHistory])

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

  const aiProviders = [
    { value: 'auto', label: '🤖 Auto (Best Available)' },
    { value: 'claude', label: '🧠 Claude (Anthropic)' },
    { value: 'openai', label: '⚡ OpenAI (GPT-4)' }
  ]

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!reviewText.trim()) {
      errors.reviewText = 'Review text is required'
    } else if (reviewText.trim().length < 10) {
      errors.reviewText = 'Review text must be at least 10 characters'
    }

    if (!rating) {
      errors.rating = 'Please select a rating'
    }

    if (!businessType) {
      errors.businessType = 'Please select a business type'
    }

    if (!tone) {
      errors.tone = 'Please select a response tone'
    }

    if (!responseLength) {
      errors.responseLength = 'Please select response length'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const handleGenerateResponse = async () => {
    // Clear previous messages
    clearMessages()

    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors above before generating a response')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Call the API endpoint
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewText,
          rating,
          businessType,
          tone,
          responseLength,
          provider: aiProvider
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate response')
      }

      setGeneratedResponse(data.response)
      setUsedProvider(data.provider || 'unknown')
      setSuccess('Response generated successfully!')

      // Add to history
      const newHistoryItem: ResponseHistory = {
        id: Date.now().toString(),
        review: reviewText,
        rating,
        businessType,
        tone,
        responseLength,
        response: data.response,
        timestamp: new Date()
      }

      setResponseHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]) // Keep last 10 items

    } catch (err: any) {
      console.error('Error generating response:', err)
      
      // Handle specific error types
      if (err.message.includes('Rate limit')) {
        setError('Rate limit exceeded. Please wait a moment and try again.')
      } else if (err.message.includes('API key')) {
        setError('API configuration error. Please check your API keys.')
      } else if (err.message.includes('quota')) {
        setError('API quota exceeded. Please check your account.')
      } else if (err.message.includes('timeout')) {
        setError('Request timed out. Please try again.')
      } else {
        setError(err.message || 'Failed to generate response. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(generatedResponse)
      setSuccess('Response copied to clipboard!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to copy response to clipboard')
    }
  }

  const getRatingColor = (rating: string) => {
    const numRating = parseInt(rating)
    if (numRating >= 4) return 'success'
    if (numRating >= 3) return 'warning'
    return 'error'
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'claude':
        return '🧠'
      case 'openai':
        return '⚡'
      default:
        return '🤖'
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'claude':
        return 'Claude'
      case 'openai':
        return 'OpenAI'
      default:
        return 'AI'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        <Container>
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <Card>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Review Details</h2>
                    <p className="text-sm text-gray-500">Enter the customer review to generate a response</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Customer Review"
                    placeholder="Paste the customer review here..."
                    value={reviewText}
                    onChange={setReviewText}
                    type="textarea"
                    rows={4}
                    required
                    error={formErrors.reviewText}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Rating"
                      options={[
                        { value: '5', label: '⭐⭐⭐⭐⭐ 5 Stars' },
                        { value: '4', label: '⭐⭐⭐⭐ 4 Stars' },
                        { value: '3', label: '⭐⭐⭐ 3 Stars' },
                        { value: '2', label: '⭐⭐ 2 Stars' },
                        { value: '1', label: '⭐ 1 Star' }
                      ]}
                      value={rating}
                      onChange={setRating}
                      placeholder="Select rating"
                      error={formErrors.rating}
                    />

                    <Select
                      label="Business Type"
                      options={businessTypes}
                      value={businessType}
                      onChange={setBusinessType}
                      placeholder="Select business type"
                      error={formErrors.businessType}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Response Tone"
                      options={tones}
                      value={tone}
                      onChange={setTone}
                      placeholder="Select tone"
                      error={formErrors.tone}
                    />

                    <Select
                      label="Response Length"
                      options={responseLengths}
                      value={responseLength}
                      onChange={setResponseLength}
                      placeholder="Select length"
                      error={formErrors.responseLength}
                    />
                  </div>

                  <Select
                    label="AI Provider"
                    options={aiProviders}
                    value={aiProvider}
                    onChange={setAiProvider}
                    placeholder="Select AI provider"
                  />

                  <Button
                    onClick={handleGenerateResponse}
                    loading={isGenerating}
                    disabled={!reviewText || !rating}
                    className="w-full"
                    icon={Zap}
                  >
                    {isGenerating ? 'Generating Response...' : 'Generate Response'}
                  </Button>
                </div>
              </Card>

              {/* Quick Tips */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Quick Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Include specific details from the review for more personalized responses</li>
                  <li>• Choose the appropriate tone based on your brand voice</li>
                  <li>• Consider the rating when crafting your response</li>
                  <li>• Keep responses genuine and authentic to your business</li>
                  <li>• Use "Auto" to let the system choose the best available AI provider</li>
                </ul>
              </Card>
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Generated Response</h2>
                      <p className="text-sm text-gray-500">Your AI-generated response</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {rating && (
                      <Badge variant={getRatingColor(rating) as any}>
                        {rating} Star{rating !== '1' ? 's' : ''}
                      </Badge>
                    )}
                    {usedProvider && (
                      <Badge variant="info" size="sm">
                        {getProviderIcon(usedProvider)} {getProviderName(usedProvider)}
                      </Badge>
                    )}
                  </div>
                </div>

                {generatedResponse ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-800 leading-relaxed">{generatedResponse}</p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleCopyResponse}
                        variant="outline"
                        icon={Copy}
                        className="flex-1"
                      >
                        Copy Response
                      </Button>
                      <Button
                        onClick={handleGenerateResponse}
                        variant="secondary"
                        icon={RefreshCw}
                        disabled={isGenerating}
                      >
                        Regenerate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Response Generated</h3>
                    <p className="text-gray-500">Fill in the review details and click "Generate Response" to get started.</p>
                  </div>
                )}
              </Card>

              {/* Response History */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Recent Responses</h3>
                {responseHistory.length > 0 ? (
                  <div className="space-y-3">
                    {responseHistory.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <div>
                            <span className="text-sm text-gray-700">
                              {item.rating}-star {item.businessType} review
                            </span>
                            <p className="text-xs text-gray-500">{formatDate(item.timestamp)}</p>
                          </div>
                        </div>
                        <Badge variant="primary" size="sm">{item.tone}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No responses generated yet</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </Container>
      </main>
    </div>
  )
} 