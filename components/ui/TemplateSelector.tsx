import React, { useState } from 'react'
import { FileText, Star, X } from 'lucide-react'
import { ResponseTemplate, getTemplatesByBusinessType, getTemplatesByRating } from '@/lib/templates'
import Badge from './Badge'

interface TemplateSelectorProps {
  businessType: string
  rating: string
  selectedTemplate: string | null
  onTemplateSelect: (templateId: string | null) => void
}

export default function TemplateSelector({
  businessType,
  rating,
  selectedTemplate,
  onTemplateSelect
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Get relevant templates based on business type and rating
  const businessTemplates = getTemplatesByBusinessType(businessType)
  const ratingTemplates = getTemplatesByRating(parseInt(rating))
  const relevantTemplates = businessTemplates.filter(template => 
    ratingTemplates.some(rt => rt.id === template.id)
  )

  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect(templateId)
    setIsOpen(false)
  }

  const handleClearTemplate = () => {
    onTemplateSelect(null)
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'success'
    if (rating >= 3) return 'warning'
    return 'error'
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <h4 className="text-sm font-semibold text-gray-900">Response Template</h4>
        </div>
        {selectedTemplate && (
          <button
            onClick={handleClearTemplate}
            className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {selectedTemplate ? (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-medium text-primary-900">Selected Template</h5>
            <Badge variant="primary" size="sm">
              Template
            </Badge>
          </div>
          <p className="text-sm text-primary-800">
            Using template as starting point for response generation
          </p>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-3 border border-gray-300 rounded-lg text-left hover:border-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {relevantTemplates.length > 0 
                  ? `Choose from ${relevantTemplates.length} templates` 
                  : 'No templates available for this combination'
                }
              </span>
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          {isOpen && relevantTemplates.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              <div className="p-2">
                <h5 className="text-xs font-semibold text-gray-700 mb-2 px-2">Available Templates</h5>
                <div className="space-y-2">
                  {relevantTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h6 className="text-sm font-medium text-gray-900">{template.name}</h6>
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center space-x-1">
                            {[...Array(template.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                            ))}
                          </div>
                          <Badge variant={getRatingColor(template.rating) as any} size="sm">
                            {template.rating}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {template.template}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {relevantTemplates.length === 0 && businessType && rating && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          No templates available for {businessType} with {rating} star rating. 
          You can still generate responses without a template.
        </div>
      )}
    </div>
  )
} 