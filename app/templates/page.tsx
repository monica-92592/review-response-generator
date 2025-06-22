'use client'

import React from 'react'
import Header from '@/components/ui/Header'
import Container from '@/components/ui/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Copy, Star, MessageSquare, Plus } from 'lucide-react'

export default function TemplatesPage() {
  const templates = [
    {
      id: 1,
      name: "Positive Restaurant Review",
      category: "Restaurant",
      rating: 5,
      template: "Thank you for your wonderful 5-star review! We're thrilled to hear you enjoyed your dining experience with us. Your feedback means the world to our team, and we can't wait to serve you again soon!",
      tags: ["positive", "restaurant", "5-star"]
    },
    {
      id: 2,
      name: "Negative Review Response",
      category: "General",
      rating: 2,
      template: "We sincerely apologize for your disappointing experience. Your feedback is valuable to us, and we take all concerns seriously. Please reach out to us directly so we can address your specific concerns and work toward a resolution.",
      tags: ["negative", "apology", "resolution"]
    },
    {
      id: 3,
      name: "Thank You for Feedback",
      category: "General",
      rating: 4,
      template: "Thank you for taking the time to share your feedback with us! We appreciate your 4-star review and are glad you had a positive experience. We're always working to improve and your input helps us do that.",
      tags: ["thankful", "feedback", "improvement"]
    },
    {
      id: 4,
      name: "Service Issue Resolution",
      category: "Customer Service",
      rating: 3,
      template: "We appreciate you bringing this to our attention. We understand how frustrating this situation must have been, and we're committed to making it right. Our team is reviewing your feedback to prevent similar issues in the future.",
      tags: ["service", "resolution", "improvement"]
    }
  ]

  const handleCopyTemplate = (template: string) => {
    navigator.clipboard.writeText(template)
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'success'
    if (rating >= 3) return 'warning'
    return 'error'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Response Templates</h1>
              <p className="text-gray-600">Pre-built response templates for common scenarios</p>
            </div>
            <Button icon={Plus}>
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="primary">{template.category}</Badge>
                      <div className="flex items-center space-x-1">
                        {[...Array(template.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <Badge variant={getRatingColor(template.rating) as any} size="sm">
                        {template.rating} Star{template.rating !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">
                    {template.template}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Copy}
                    onClick={() => handleCopyTemplate(template.template)}
                  >
                    Copy
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create Custom Template</h3>
              <p className="text-gray-500 mb-4">Build your own response templates for your specific business needs</p>
              <Button icon={Plus}>
                Create New Template
              </Button>
            </div>
          </Card>
        </Container>
      </main>
    </div>
  )
} 