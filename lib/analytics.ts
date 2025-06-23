export interface ResponseMetrics {
  id: string
  reviewText: string
  rating: string
  businessType: string
  tone: string
  responseLength: string
  variations: number
  selectedVariation: number
  wasEdited: boolean
  editCount: number
  copyCount: number
  qualityScore: number
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  provider: string
  generationTime: number
  timestamp: Date
  templateUsed?: string
  toneAdjustments?: {
    formality: number
    empathy: number
    enthusiasm: number
    professionalism: number
  }
}

export interface AnalyticsData {
  totalResponses: number
  totalReviews: number
  averageQualityScore: number
  averageGenerationTime: number
  mostUsedTone: string
  mostUsedBusinessType: string
  averageRating: number
  responseEffectiveness: {
    editedResponses: number
    copiedResponses: number
    averageVariations: number
    templateUsage: number
  }
  sentimentDistribution: {
    positive: number
    negative: number
    neutral: number
    mixed: number
  }
  providerUsage: {
    openai: number
    claude: number
    auto: number
  }
  qualityTrends: {
    excellent: number // 90-100
    good: number // 70-89
    fair: number // 50-69
    poor: number // 0-49
  }
  businessTypePerformance: {
    [key: string]: {
      count: number
      averageScore: number
      averageRating: number
    }
  }
  tonePerformance: {
    [key: string]: {
      count: number
      averageScore: number
      editRate: number
    }
  }
}

// Analytics storage key
const ANALYTICS_STORAGE_KEY = 'responseAnalytics'

// Get all analytics data
export const getAnalyticsData = (): ResponseMetrics[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(ANALYTICS_STORAGE_KEY)
    if (!data) return []
    
    const parsed = JSON.parse(data)
    return parsed.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }))
  } catch (error) {
    console.error('Error loading analytics data:', error)
    return []
  }
}

// Save analytics data
export const saveAnalyticsData = (data: ResponseMetrics[]) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving analytics data:', error)
  }
}

// Add new response metrics
export const addResponseMetrics = (metrics: Omit<ResponseMetrics, 'id' | 'timestamp'>) => {
  const newMetric: ResponseMetrics = {
    ...metrics,
    id: Date.now().toString(),
    timestamp: new Date()
  }
  
  const existingData = getAnalyticsData()
  const updatedData = [newMetric, ...existingData]
  
  // Keep only last 1000 entries to prevent storage bloat
  const trimmedData = updatedData.slice(0, 1000)
  saveAnalyticsData(trimmedData)
  
  return newMetric
}

// Update existing metrics (for edits, copies, etc.)
export const updateResponseMetrics = (id: string, updates: Partial<ResponseMetrics>) => {
  const data = getAnalyticsData()
  const updatedData = data.map(item => 
    item.id === id ? { ...item, ...updates } : item
  )
  saveAnalyticsData(updatedData)
}

// Calculate comprehensive analytics
export const calculateAnalytics = (): AnalyticsData => {
  const data = getAnalyticsData()
  
  if (data.length === 0) {
    return {
      totalResponses: 0,
      totalReviews: 0,
      averageQualityScore: 0,
      averageGenerationTime: 0,
      mostUsedTone: '',
      mostUsedBusinessType: '',
      averageRating: 0,
      responseEffectiveness: {
        editedResponses: 0,
        copiedResponses: 0,
        averageVariations: 0,
        templateUsage: 0
      },
      sentimentDistribution: {
        positive: 0,
        negative: 0,
        neutral: 0,
        mixed: 0
      },
      providerUsage: {
        openai: 0,
        claude: 0,
        auto: 0
      },
      qualityTrends: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0
      },
      businessTypePerformance: {},
      tonePerformance: {}
    }
  }

  // Basic metrics
  const totalResponses = data.length
  const totalReviews = new Set(data.map(d => d.reviewText)).size
  const averageQualityScore = data.reduce((sum, d) => sum + d.qualityScore, 0) / totalResponses
  const averageGenerationTime = data.reduce((sum, d) => sum + d.generationTime, 0) / totalResponses
  const averageRating = data.reduce((sum, d) => sum + parseInt(d.rating), 0) / totalResponses

  // Most used categories
  const toneCounts = data.reduce((acc, d) => {
    acc[d.tone] = (acc[d.tone] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const mostUsedTone = Object.entries(toneCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || ''

  const businessTypeCounts = data.reduce((acc, d) => {
    acc[d.businessType] = (acc[d.businessType] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const mostUsedBusinessType = Object.entries(businessTypeCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || ''

  // Response effectiveness
  const editedResponses = data.filter(d => d.wasEdited).length
  const copiedResponses = data.filter(d => d.copyCount > 0).length
  const averageVariations = data.reduce((sum, d) => sum + d.variations, 0) / totalResponses
  const templateUsage = data.filter(d => d.templateUsed).length

  // Sentiment distribution
  const sentimentCounts = data.reduce((acc, d) => {
    acc[d.sentiment] = (acc[d.sentiment] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Provider usage
  const providerCounts = data.reduce((acc, d) => {
    acc[d.provider] = (acc[d.provider] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Quality trends
  const qualityTrends = data.reduce((acc, d) => {
    if (d.qualityScore >= 90) acc.excellent++
    else if (d.qualityScore >= 70) acc.good++
    else if (d.qualityScore >= 50) acc.fair++
    else acc.poor++
    return acc
  }, { excellent: 0, good: 0, fair: 0, poor: 0 })

  // Business type performance
  const businessTypePerformance = data.reduce((acc, d) => {
    if (!acc[d.businessType]) {
      acc[d.businessType] = { count: 0, averageScore: 0, averageRating: 0 }
    }
    acc[d.businessType].count++
    acc[d.businessType].averageScore += d.qualityScore
    acc[d.businessType].averageRating += parseInt(d.rating)
    return acc
  }, {} as Record<string, { count: number; averageScore: number; averageRating: number }>)

  // Calculate averages for business types
  Object.keys(businessTypePerformance).forEach(type => {
    const perf = businessTypePerformance[type]
    perf.averageScore = perf.averageScore / perf.count
    perf.averageRating = perf.averageRating / perf.count
  })

  // Tone performance
  const tonePerformance = data.reduce((acc, d) => {
    if (!acc[d.tone]) {
      acc[d.tone] = { count: 0, averageScore: 0, editRate: 0 }
    }
    acc[d.tone].count++
    acc[d.tone].averageScore += d.qualityScore
    if (d.wasEdited) acc[d.tone].editRate++
    return acc
  }, {} as Record<string, { count: number; averageScore: number; editRate: number }>)

  // Calculate averages and rates for tones
  Object.keys(tonePerformance).forEach(tone => {
    const perf = tonePerformance[tone]
    perf.averageScore = perf.averageScore / perf.count
    perf.editRate = perf.editRate / perf.count
  })

  return {
    totalResponses,
    totalReviews,
    averageQualityScore: Math.round(averageQualityScore * 10) / 10,
    averageGenerationTime: Math.round(averageGenerationTime * 10) / 10,
    mostUsedTone,
    mostUsedBusinessType,
    averageRating: Math.round(averageRating * 10) / 10,
    responseEffectiveness: {
      editedResponses,
      copiedResponses,
      averageVariations: Math.round(averageVariations * 10) / 10,
      templateUsage
    },
    sentimentDistribution: {
      positive: sentimentCounts.positive || 0,
      negative: sentimentCounts.negative || 0,
      neutral: sentimentCounts.neutral || 0,
      mixed: sentimentCounts.mixed || 0
    },
    providerUsage: {
      openai: providerCounts.openai || 0,
      claude: providerCounts.claude || 0,
      auto: providerCounts.auto || 0
    },
    qualityTrends,
    businessTypePerformance,
    tonePerformance
  }
}

// Get recent activity (last 30 days)
export const getRecentActivity = (days: number = 30) => {
  const data = getAnalyticsData()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  return data.filter(item => item.timestamp >= cutoffDate)
}

// Get performance trends over time
export const getPerformanceTrends = (days: number = 30) => {
  const recentData = getRecentActivity(days)
  
  // Group by day
  const dailyData = recentData.reduce((acc, item) => {
    const date = item.timestamp.toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { count: 0, totalScore: 0, totalTime: 0 }
    }
    acc[date].count++
    acc[date].totalScore += item.qualityScore
    acc[date].totalTime += item.generationTime
    return acc
  }, {} as Record<string, { count: number; totalScore: number; totalTime: number }>)

  // Convert to trend data
  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    count: data.count,
    averageScore: Math.round((data.totalScore / data.count) * 10) / 10,
    averageTime: Math.round((data.totalTime / data.count) * 10) / 10
  })).sort((a, b) => a.date.localeCompare(b.date))
}

// Clear analytics data
export const clearAnalyticsData = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ANALYTICS_STORAGE_KEY)
} 