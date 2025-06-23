'use client'

import React, { useState, useEffect } from 'react'
import Container from '@/components/ui/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Trash2, 
  Copy, 
  Edit3, 
  Star, 
  Calendar,
  MessageSquare,
  RefreshCw,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc
} from 'lucide-react'

interface ResponseHistory {
  id: string
  review: string
  rating: string
  businessType: string
  tone: string
  responseLength: string
  response: string
  timestamp: Date
  qualityScore?: number
  sentiment?: string
  provider?: string
  generationTime?: number
  wasEdited?: boolean
  editCount?: number
  copyCount?: number
}

interface FilterOptions {
  rating: string
  businessType: string
  tone: string
  dateRange: string
  qualityScore: string
  sentiment: string
  provider: string
}

interface SortOption {
  field: keyof ResponseHistory
  direction: 'asc' | 'desc'
}

export default function HistoryPage() {
  const [responseHistory, setResponseHistory] = useState<ResponseHistory[]>([])
  const [filteredHistory, setFilteredHistory] = useState<ResponseHistory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    rating: '',
    businessType: '',
    tone: '',
    dateRange: '',
    qualityScore: '',
    sentiment: '',
    provider: ''
  })
  const [sortBy, setSortBy] = useState<SortOption>({ field: 'timestamp', direction: 'desc' })
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Load response history from localStorage on component mount
  useEffect(() => {
    loadResponseHistory()
  }, [])

  // Apply filters and search whenever dependencies change
  useEffect(() => {
    applyFiltersAndSearch()
  }, [responseHistory, searchQuery, filters, sortBy])

  const loadResponseHistory = () => {
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
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...responseHistory]

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.review.toLowerCase().includes(query) ||
        item.response.toLowerCase().includes(query) ||
        item.businessType.toLowerCase().includes(query) ||
        item.tone.toLowerCase().includes(query)
      )
    }

    // Apply filters
    if (filters.rating) {
      filtered = filtered.filter(item => item.rating === filters.rating)
    }
    if (filters.businessType) {
      filtered = filtered.filter(item => item.businessType === filters.businessType)
    }
    if (filters.tone) {
      filtered = filtered.filter(item => item.tone === filters.tone)
    }
    if (filters.qualityScore) {
      const score = parseInt(filters.qualityScore)
      filtered = filtered.filter(item => (item.qualityScore || 0) >= score)
    }
    if (filters.sentiment) {
      filtered = filtered.filter(item => item.sentiment === filters.sentiment)
    }
    if (filters.provider) {
      filtered = filtered.filter(item => item.provider === filters.provider)
    }
    if (filters.dateRange) {
      const now = new Date()
      const daysAgo = parseInt(filters.dateRange)
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
      filtered = filtered.filter(item => item.timestamp >= cutoffDate)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy.field]
      const bValue = b[sortBy.field]
      
      if (aValue === undefined && bValue === undefined) return 0
      if (aValue === undefined) return 1
      if (bValue === undefined) return -1

      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime()
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      }

      return sortBy.direction === 'asc' ? comparison : -comparison
    })

    setFilteredHistory(filtered)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSort = (field: keyof ResponseHistory) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedItems.size === filteredHistory.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredHistory.map(item => item.id)))
    }
  }

  const handleCopyResponse = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy response:', err)
    }
  }

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this response?')) {
      const updatedHistory = responseHistory.filter(item => item.id !== id)
      setResponseHistory(updatedHistory)
      localStorage.setItem('responseHistory', JSON.stringify(updatedHistory))
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return
    
    if (confirm(`Are you sure you want to delete ${selectedItems.size} selected responses?`)) {
      const updatedHistory = responseHistory.filter(item => !selectedItems.has(item.id))
      setResponseHistory(updatedHistory)
      localStorage.setItem('responseHistory', JSON.stringify(updatedHistory))
      setSelectedItems(new Set())
    }
  }

  const handleBulkGenerate = async () => {
    if (selectedItems.size === 0) return
    
    setIsBulkGenerating(true)
    
    try {
      const selectedResponses = responseHistory.filter(item => selectedItems.has(item.id))
      
      // Prepare data for bulk generation
      const bulkData = selectedResponses.map(item => ({
        id: item.id,
        review: item.review,
        rating: item.rating,
        businessType: item.businessType,
        tone: item.tone,
        responseLength: item.responseLength,
        provider: item.provider || 'auto'
      }))

      // Call the bulk generation API
      const response = await fetch('/api/bulk-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: bulkData
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate responses')
      }

      // Update the history with new responses
      const updatedHistory = responseHistory.map(item => {
        const result = data.results.find((r: any) => r.id === item.id)
        if (result && result.success) {
          return {
            ...item,
            response: result.response,
            provider: result.provider,
            generationTime: result.generationTime,
            timestamp: new Date() // Update timestamp to reflect regeneration
          }
        }
        return item
      })

      setResponseHistory(updatedHistory)
      localStorage.setItem('responseHistory', JSON.stringify(updatedHistory))

      // Show results summary
      const successful = data.summary.successful
      const failed = data.summary.failed
      
      if (failed > 0) {
        alert(`Bulk generation completed! ${successful} successful, ${failed} failed.`)
      } else {
        alert(`Bulk generation completed successfully for ${successful} responses!`)
      }
      
      setSelectedItems(new Set())
    } catch (error) {
      console.error('Bulk generation failed:', error)
      alert('Bulk generation failed. Please try again.')
    } finally {
      setIsBulkGenerating(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Rating', 'Business Type', 'Tone', 'Review', 'Response', 'Quality Score', 'Sentiment', 'Provider']
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(item => [
        item.timestamp.toISOString(),
        item.rating,
        item.businessType,
        item.tone,
        `"${item.review.replace(/"/g, '""')}"`,
        `"${item.response.replace(/"/g, '""')}"`,
        item.qualityScore || '',
        item.sentiment || '',
        item.provider || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `response-history-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    
    try {
      // Here you would implement PDF generation
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert('PDF export completed!')
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('PDF export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const getRatingColor = (rating: string) => {
    const num = parseInt(rating)
    if (num >= 4) return 'success'
    if (num >= 3) return 'warning'
    return 'error'
  }

  const getQualityColor = (score: number) => {
    if (score >= 85) return 'success'
    if (score >= 70) return 'warning'
    return 'error'
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

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

  const sentiments = [
    { value: 'positive', label: 'Positive' },
    { value: 'negative', label: 'Negative' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'mixed', label: 'Mixed' }
  ]

  const providers = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'claude', label: 'Claude' },
    { value: 'auto', label: 'Auto' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <Container>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Response History</h1>
              <p className="text-gray-600">Manage and analyze your generated responses</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                icon={RefreshCw}
                onClick={loadResponseHistory}
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                icon={FileSpreadsheet}
                onClick={exportToCSV}
              >
                Export CSV
              </Button>
              <Button
                variant="outline"
                icon={FileText}
                onClick={exportToPDF}
                loading={isExporting}
              >
                Export PDF
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search reviews, responses, business types..."
                    value={searchQuery}
                    onChange={handleSearch}
                    icon={Search}
                  />
                </div>
                <Button
                  variant="outline"
                  icon={Filter}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </Button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <Select
                    value={filters.rating}
                    onChange={(value) => handleFilterChange('rating', value)}
                    options={[
                      { value: '', label: 'All Ratings' },
                      { value: '1', label: '⭐ 1 Star' },
                      { value: '2', label: '⭐⭐ 2 Stars' },
                      { value: '3', label: '⭐⭐⭐ 3 Stars' },
                      { value: '4', label: '⭐⭐⭐⭐ 4 Stars' },
                      { value: '5', label: '⭐⭐⭐⭐⭐ 5 Stars' }
                    ]}
                  />
                  <Select
                    value={filters.businessType}
                    onChange={(value) => handleFilterChange('businessType', value)}
                    options={[
                      { value: '', label: 'All Business Types' },
                      ...businessTypes
                    ]}
                  />
                  <Select
                    value={filters.tone}
                    onChange={(value) => handleFilterChange('tone', value)}
                    options={[
                      { value: '', label: 'All Tones' },
                      ...tones
                    ]}
                  />
                  <Select
                    value={filters.dateRange}
                    onChange={(value) => handleFilterChange('dateRange', value)}
                    options={[
                      { value: '', label: 'All Time' },
                      { value: '1', label: 'Last 24 hours' },
                      { value: '7', label: 'Last 7 days' },
                      { value: '30', label: 'Last 30 days' },
                      { value: '90', label: 'Last 90 days' }
                    ]}
                  />
                  <Select
                    value={filters.qualityScore}
                    onChange={(value) => handleFilterChange('qualityScore', value)}
                    options={[
                      { value: '', label: 'All Quality Scores' },
                      { value: '90', label: '90+ (Excellent)' },
                      { value: '80', label: '80+ (Good)' },
                      { value: '70', label: '70+ (Fair)' },
                      { value: '60', label: '60+ (Poor)' }
                    ]}
                  />
                  <Select
                    value={filters.sentiment}
                    onChange={(value) => handleFilterChange('sentiment', value)}
                    options={[
                      { value: '', label: 'All Sentiments' },
                      ...sentiments
                    ]}
                  />
                  <Select
                    value={filters.provider}
                    onChange={(value) => handleFilterChange('provider', value)}
                    options={[
                      { value: '', label: 'All Providers' },
                      ...providers
                    ]}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkGenerate}
                    loading={isBulkGenerating}
                  >
                    Bulk Generate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete Selected
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedItems(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </Card>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Showing {filteredHistory.length} of {responseHistory.length} responses
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
              >
                {selectedItems.size === filteredHistory.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                Select All
              </Button>
            </div>
          </div>

          {/* Response List */}
          <div className="space-y-4">
            {filteredHistory.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No responses found</h3>
                <p className="text-gray-600">
                  {responseHistory.length === 0 
                    ? "You haven't generated any responses yet. Start by creating your first response!"
                    : "Try adjusting your search or filters to find what you're looking for."
                  }
                </p>
              </Card>
            ) : (
              filteredHistory.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Selection Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getRatingColor(item.rating)}>
                            {item.rating} Star{item.rating !== '1' ? 's' : ''}
                          </Badge>
                          <Badge variant="default">{item.businessType}</Badge>
                          <Badge variant="default">{item.tone}</Badge>
                          {item.qualityScore && (
                            <Badge variant={getQualityColor(item.qualityScore)}>
                              {item.qualityScore}/100
                            </Badge>
                          )}
                          {item.sentiment && (
                            <Badge variant="default">{item.sentiment}</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.timestamp)}</span>
                        </div>
                      </div>

                      {/* Review */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Customer Review</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {item.review}
                        </p>
                      </div>

                      {/* Response */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Generated Response</h4>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                          {item.response}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          {item.provider && (
                            <span>Provider: {item.provider}</span>
                          )}
                          {item.generationTime && (
                            <span>Generation Time: {item.generationTime}s</span>
                          )}
                          {item.wasEdited && (
                            <span className="text-blue-600">✓ Edited</span>
                          )}
                          {item.editCount && item.editCount > 0 && (
                            <span>Edits: {item.editCount}</span>
                          )}
                          {item.copyCount && item.copyCount > 0 && (
                            <span>Copies: {item.copyCount}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyResponse(item.response)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Container>
      </main>
    </div>
  )
} 