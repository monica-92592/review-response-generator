'use client'

import React, { useState, useEffect } from 'react'
import Container from '@/components/ui/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Grid from '@/components/ui/Grid'
import Stack from '@/components/ui/Stack'
import Flex from '@/components/ui/Flex'
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

interface ResponseVariation {
  id: number
  text: string
  provider: string
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
  const [variations, setVariations] = useState('3')
  const [responseVariations, setResponseVariations] = useState<ResponseVariation[]>([])
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [responseHistory, setResponseHistory] = useState<ResponseHistory[]>([])
  const [isClient, setIsClient] = useState(false)

  // Load response history from localStorage on component mount
  useEffect(() => {
    setIsClient(true)
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
    if (isClient) {
      localStorage.setItem('responseHistory', JSON.stringify(responseHistory))
    }
  }, [responseHistory, isClient])

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

  const variationOptions = [
    { value: '1', label: '1 Variation' },
    { value: '2', label: '2 Variations' },
    { value: '3', label: '3 Variations' },
    { value: '4', label: '4 Variations' },
    { value: '5', label: '5 Variations' }
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
    // Clear previous messages and validation
    clearMessages()
    setResponseVariations([])
    setSelectedVariation(null)

    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors above before generating a response')
      return
    }

    setIsGenerating(true)

    try {
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
          aiProvider,
          variations: parseInt(variations),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setResponseVariations(data.variations)
        setSuccess('Response generated successfully!')
        
        // Add to history
        const newResponse: ResponseHistory = {
          id: Date.now().toString(),
          review: reviewText,
          rating,
          businessType,
          tone,
          responseLength,
          response: data.variations[0]?.text || '',
          timestamp: new Date()
        }
        setResponseHistory(prev => [newResponse, ...prev.slice(0, 9)]) // Keep last 10
      } else {
        setError(data.error || 'Failed to generate response')
      }
    } catch (err) {
      console.error('Error generating response:', err)
      setError('Failed to generate response. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyResponse = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setSuccess('Response copied to clipboard!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  const getRatingColor = (rating: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
    const colors = {
      '1': 'error' as const,
      '2': 'warning' as const,
      '3': 'info' as const,
      '4': 'success' as const,
      '5': 'success' as const
    }
    return colors[rating as keyof typeof colors] || 'default'
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Container maxWidth="full" padding="lg">
      <Stack spacing="xl" className="py-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            AI Review Response Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create professional, contextually appropriate responses to customer reviews with AI-powered assistance
          </p>
        </div>

        {/* Main Form */}
        <Grid cols={2} gap="xl">
          {/* Input Form */}
          <Card className="p-8" hover>
            <Stack spacing="lg">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Review Details
                </h2>
                <p className="text-muted-foreground">
                  Provide the customer review and your preferences
                </p>
              </div>

              {/* Review Text */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-foreground">
                  Review Text *
                </label>
                <Input
                  value={reviewText}
                  onChange={setReviewText}
                  placeholder="Paste the customer review here..."
                  error={formErrors.reviewText}
                  type="textarea"
                  rows={5}
                />
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-foreground">
                  Rating *
                </label>
                <Select
                  value={rating}
                  onChange={setRating}
                  options={[
                    { value: '1', label: '⭐ 1 Star' },
                    { value: '2', label: '⭐⭐ 2 Stars' },
                    { value: '3', label: '⭐⭐⭐ 3 Stars' },
                    { value: '4', label: '⭐⭐⭐⭐ 4 Stars' },
                    { value: '5', label: '⭐⭐⭐⭐⭐ 5 Stars' }
                  ]}
                  placeholder="Select rating"
                  error={formErrors.rating}
                />
              </div>

              {/* Business Type */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-foreground">
                  Business Type *
                </label>
                <Select
                  value={businessType}
                  onChange={setBusinessType}
                  options={businessTypes}
                  placeholder="Select business type"
                  error={formErrors.businessType}
                />
              </div>

              {/* Response Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Response Settings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize the tone and length of your response
                  </p>
                </div>
                <Grid cols={2} gap="md">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-foreground">
                      Tone *
                    </label>
                    <Select
                      value={tone}
                      onChange={setTone}
                      options={tones}
                      placeholder="Select tone"
                      error={formErrors.tone}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-foreground">
                      Length *
                    </label>
                    <Select
                      value={responseLength}
                      onChange={setResponseLength}
                      options={responseLengths}
                      placeholder="Select length"
                      error={formErrors.responseLength}
                    />
                  </div>
                </Grid>
              </div>

              {/* AI Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    AI Settings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred AI provider and number of variations
                  </p>
                </div>
                <Grid cols={2} gap="md">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-foreground">
                      AI Provider
                    </label>
                    <Select
                      value={aiProvider}
                      onChange={setAiProvider}
                      options={aiProviders}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-foreground">
                      Variations
                    </label>
                    <Select
                      value={variations}
                      onChange={setVariations}
                      options={variationOptions}
                    />
                  </div>
                </Grid>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateResponse}
                disabled={isGenerating}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating Response...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Response
                  </>
                )}
              </Button>
            </Stack>
          </Card>

          {/* Response Display */}
          <Card className="p-8" hover>
            <Stack spacing="lg">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  Generated Response
                </h2>
                <p className="text-muted-foreground">
                  Choose from multiple AI-generated variations
                </p>
              </div>

              {/* Messages */}
              {error && (
                <div className="flex items-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive mr-3 flex-shrink-0" />
                  <span className="text-destructive font-medium">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-green-500 font-medium">{success}</span>
                </div>
              )}

              {/* Response Variations */}
              {responseVariations.length > 0 && (
                <Stack spacing="md">
                  {responseVariations.map((variation, index) => (
                    <div
                      key={variation.id}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedVariation === variation.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedVariation(variation.id)}
                    >
                      <Flex justify="between" align="center" className="mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge variant="default" className="text-xs font-semibold">
                            Variation {index + 1}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {variation.provider}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyResponse(variation.text)
                          }}
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </Flex>
                      <p className="text-foreground text-sm leading-relaxed">
                        {variation.text}
                      </p>
                    </div>
                  ))}
                </Stack>
              )}

              {/* Placeholder */}
              {responseVariations.length === 0 && !isGenerating && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Ready to Generate
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Fill out the form and click "Generate Response" to create AI-powered review responses.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Generating Response
                  </h3>
                  <p className="text-muted-foreground">
                    Our AI is crafting the perfect response for you...
                  </p>
                </div>
              )}
            </Stack>
          </Card>
        </Grid>

        {/* Recent History */}
        {responseHistory.length > 0 && (
          <Card className="p-8" hover>
            <div className="space-y-2 mb-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Recent Responses
              </h2>
              <p className="text-muted-foreground">
                Your recently generated review responses
              </p>
            </div>
            <Stack spacing="md">
              {responseHistory.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <Badge variant={getRatingColor(item.rating)} className="flex-shrink-0">
                    {item.rating} ⭐
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium line-clamp-2 mb-1">
                      {item.review}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{formatDate(item.timestamp)}</span>
                      <span>•</span>
                      <span className="capitalize">{item.businessType}</span>
                      <span>•</span>
                      <span className="capitalize">{item.tone}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyResponse(item.response)}
                    className="flex-shrink-0 hover:bg-primary hover:text-primary-foreground"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  )
} 