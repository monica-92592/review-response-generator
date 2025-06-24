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
  const [rating, setRating] = useState('5')
  const [businessType, setBusinessType] = useState('other')
  const [tone, setTone] = useState('professional')
  const [responseLength, setResponseLength] = useState('medium')
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
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setResponseHistory(historyWithDates)
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
          provider: aiProvider,
          variations: parseInt(variations),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate response')
      }

      if (data.responses && data.responses.length > 0) {
        const variations = data.responses.map((resp: any) => ({
          id: resp.id,
          text: resp.text,
          provider: resp.provider || 'Unknown'
        }))
        setResponseVariations(variations)
        setSelectedVariation(1)
        setSuccess(`Generated ${variations.length} response variation${variations.length > 1 ? 's' : ''}`)

        // Save to history
        const historyItem: ResponseHistory = {
          id: Date.now().toString(),
          review: reviewText,
          rating,
          businessType,
          tone,
          responseLength,
          response: variations[0].text,
          timestamp: new Date()
        }
        setResponseHistory(prev => [historyItem, ...prev.slice(0, 49)]) // Keep last 50 items
      } else {
        throw new Error('No response generated')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate response. Please try again.')
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
      setError('Failed to copy response')
    }
  }

  const getRatingColor = (rating: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
    const numRating = parseInt(rating)
    if (numRating <= 2) return 'error'
    if (numRating === 3) return 'warning'
    if (numRating === 4) return 'info'
    return 'success'
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
    <Container className="py-6">
      <Grid cols={1} gap="lg">
        {/* Input Form */}
        <Card className="space-y-6">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Generate Response</h2>
          </div>

          <Stack spacing="md">
            {/* Review Text */}
            <div>
              <Input
                label="Customer Review *"
                type="textarea"
                rows={4}
                value={reviewText}
                onChange={setReviewText}
                placeholder="Paste the customer review here..."
                error={formErrors.reviewText}
              />
            </div>

            {/* Rating */}
            <div>
              <Select
                label="Rating *"
                options={[
                  { value: '', label: 'Select rating' },
                  { value: '1', label: '⭐ 1 Star' },
                  { value: '2', label: '⭐⭐ 2 Stars' },
                  { value: '3', label: '⭐⭐⭐ 3 Stars' },
                  { value: '4', label: '⭐⭐⭐⭐ 4 Stars' },
                  { value: '5', label: '⭐⭐⭐⭐⭐ 5 Stars' }
                ]}
                value={rating}
                onChange={setRating}
                error={formErrors.rating}
              />
            </div>

            {/* Business Type */}
            <div>
              <Select
                label="Business Type *"
                options={[
                  { value: '', label: 'Select business type' },
                  ...businessTypes
                ]}
                value={businessType}
                onChange={setBusinessType}
                error={formErrors.businessType}
              />
            </div>

            {/* Tone */}
            <div>
              <Select
                label="Response Tone *"
                options={[
                  { value: '', label: 'Select tone' },
                  ...tones
                ]}
                value={tone}
                onChange={setTone}
                error={formErrors.tone}
              />
            </div>

            {/* Response Length */}
            <div>
              <Select
                label="Response Length *"
                options={[
                  { value: '', label: 'Select length' },
                  ...responseLengths
                ]}
                value={responseLength}
                onChange={setResponseLength}
                error={formErrors.responseLength}
              />
            </div>

            {/* AI Provider */}
            <div>
              <Select
                label="AI Provider"
                options={aiProviders}
                value={aiProvider}
                onChange={setAiProvider}
              />
            </div>

            {/* Variations */}
            <div>
              <Select
                label="Number of Variations"
                options={variationOptions}
                value={variations}
                onChange={setVariations}
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateResponse}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Response
                </>
              )}
            </Button>
          </Stack>
        </Card>

        {/* Response Display */}
        <div className="space-y-6">
          {/* Messages */}
          {error && (
            <Card className="border-error bg-error/5">
              <Flex align="center" spacing="sm">
                <AlertCircle className="w-5 h-5 text-error" />
                <span className="text-error">{error}</span>
              </Flex>
            </Card>
          )}

          {success && (
            <Card className="border-success bg-success/5">
              <Flex align="center" spacing="sm">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-success">{success}</span>
              </Flex>
            </Card>
          )}

          {/* Response Variations */}
          {responseVariations.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Generated Responses</h3>
                <Badge variant={getRatingColor(rating)}>
                  {rating} Star{rating !== '1' ? 's' : ''}
                </Badge>
              </div>

              <Stack spacing="md">
                {responseVariations.map((variation) => (
                  <div
                    key={variation.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedVariation === variation.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" size="sm">
                          Variation {variation.id}
                        </Badge>
                        <Badge variant="primary" size="sm">
                          {variation.provider}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyResponse(variation.text)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {variation.text}
                    </p>
                  </div>
                ))}
              </Stack>
            </Card>
          )}

          {/* Recent History */}
          {responseHistory.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">Recent Responses</h3>
              <Stack spacing="sm">
                {responseHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRatingColor(item.rating)} size="sm">
                          {item.rating} Star{item.rating !== '1' ? 's' : ''}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyResponse(item.response)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {item.review}
                    </p>
                    <p className="text-sm leading-relaxed line-clamp-3">
                      {item.response}
                    </p>
                  </div>
                ))}
              </Stack>
            </Card>
          )}
        </div>
      </Grid>
    </Container>
  )
} 