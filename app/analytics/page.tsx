'use client'

import React, { useState, useEffect } from 'react'
import Container from '@/components/ui/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Chart from '@/components/ui/Chart'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity, 
  Clock, 
  Star, 
  MessageSquare, 
  Edit3, 
  Copy, 
  Trash2,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { 
  calculateAnalytics, 
  getPerformanceTrends, 
  getRecentActivity, 
  clearAnalyticsData,
  ResponseMetrics 
} from '@/lib/analytics'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(calculateAnalytics())
  const [performanceTrends, setPerformanceTrends] = useState(getPerformanceTrends(30))
  const [recentActivity, setRecentActivity] = useState<ResponseMetrics[]>([])
  const [timeRange, setTimeRange] = useState(30)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setAnalytics(calculateAnalytics())
      setPerformanceTrends(getPerformanceTrends(timeRange))
      setRecentActivity(getRecentActivity(timeRange))
      setIsRefreshing(false)
    }, 500)
  }

  useEffect(() => {
    refreshData()
  }, [timeRange])

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
      clearAnalyticsData()
      refreshData()
    }
  }

  const handleExportData = () => {
    const data = {
      analytics,
      performanceTrends,
      recentActivity,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getQualityColor = (score: number) => {
    if (score >= 85) return 'success'
    if (score >= 70) return 'warning'
    return 'error'
  }

  const getQualityIcon = (score: number) => {
    if (score >= 85) return CheckCircle
    if (score >= 70) return Info
    return AlertTriangle
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'success'
      case 'negative': return 'error'
      case 'neutral': return 'default'
      case 'mixed': return 'warning'
      default: return 'default'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <Container>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Track response effectiveness and business intelligence</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
              <Button
                variant="outline"
                icon={RefreshCw}
                onClick={refreshData}
                loading={isRefreshing}
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                icon={Download}
                onClick={handleExportData}
              >
                Export
              </Button>
              <Button
                variant="outline"
                icon={Trash2}
                onClick={handleClearData}
                className="text-red-600 hover:text-red-700"
              >
                Clear Data
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalResponses}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Quality Score</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.averageQualityScore}/100</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Generation Time</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.averageGenerationTime}s</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.averageRating}/5</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Chart
              data={[
                { label: 'Excellent', value: analytics.qualityTrends.excellent },
                { label: 'Good', value: analytics.qualityTrends.good },
                { label: 'Fair', value: analytics.qualityTrends.fair },
                { label: 'Poor', value: analytics.qualityTrends.poor }
              ]}
              title="Response Quality Distribution"
              type="bar"
              height={250}
            />

            <Chart
              data={[
                { label: 'Positive', value: analytics.sentimentDistribution.positive },
                { label: 'Negative', value: analytics.sentimentDistribution.negative },
                { label: 'Neutral', value: analytics.sentimentDistribution.neutral },
                { label: 'Mixed', value: analytics.sentimentDistribution.mixed }
              ]}
              title="Sentiment Distribution"
              type="pie"
              height={250}
            />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Chart
              data={[
                { label: 'OpenAI', value: analytics.providerUsage.openai },
                { label: 'Claude', value: analytics.providerUsage.claude },
                { label: 'Auto', value: analytics.providerUsage.auto }
              ]}
              title="AI Provider Usage"
              type="bar"
              height={200}
            />

            <Chart
              data={performanceTrends.map(trend => ({
                label: new Date(trend.date).toLocaleDateString(),
                value: trend.averageScore
              }))}
              title="Quality Score Trends"
              type="line"
              height={200}
            />
          </div>

          {/* Business Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Business Type Performance */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Type Performance</h3>
              <div className="space-y-3">
                {Object.entries(analytics.businessTypePerformance).map(([type, perf]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{type}</p>
                      <p className="text-sm text-gray-600">{perf.count} responses</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getQualityColor(perf.averageScore) as any} size="sm">
                          {Math.round(perf.averageScore)}/100
                        </Badge>
                        <Badge variant="default" size="sm">
                          {perf.averageRating.toFixed(1)}★
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tone Performance */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tone Performance</h3>
              <div className="space-y-3">
                {Object.entries(analytics.tonePerformance).map(([tone, perf]) => (
                  <div key={tone} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{tone}</p>
                      <p className="text-sm text-gray-600">{perf.count} responses</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getQualityColor(perf.averageScore) as any} size="sm">
                          {Math.round(perf.averageScore)}/100
                        </Badge>
                        <Badge variant="info" size="sm">
                          {Math.round(perf.editRate * 100)}% edited
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Response Effectiveness */}
          <Card className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Effectiveness</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Edit3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{analytics.responseEffectiveness.editedResponses}</p>
                <p className="text-sm text-blue-700">Edited Responses</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Copy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{analytics.responseEffectiveness.copiedResponses}</p>
                <p className="text-sm text-green-700">Copied Responses</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">{analytics.responseEffectiveness.averageVariations}</p>
                <p className="text-sm text-purple-700">Avg Variations</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <PieChart className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-900">{analytics.responseEffectiveness.templateUsage}</p>
                <p className="text-sm text-orange-700">Template Usage</p>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.businessType} • {activity.tone} • {activity.rating}★
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getQualityColor(activity.qualityScore) as any} size="sm">
                        {activity.qualityScore}/100
                      </Badge>
                      <Badge variant={getSentimentColor(activity.sentiment) as any} size="sm">
                        {activity.sentiment}
                      </Badge>
                      {activity.wasEdited && (
                        <Badge variant="warning" size="sm">
                          Edited
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity. Generate some responses to see analytics data.</p>
              </div>
            )}
          </Card>
        </Container>
      </main>
    </div>
  )
} 