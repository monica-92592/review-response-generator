import React, { useState } from 'react'
import { Copy, Edit3, Check, X, Star, MessageSquare } from 'lucide-react'
import Badge from './Badge'

interface ResponseVariation {
  id: number
  text: string
  provider: string
  validation?: {
    isValid: boolean
    score: number
    issues: string[]
    suggestions: string[]
  }
}

interface ResponseVariationsProps {
  variations: ResponseVariation[]
  selectedVariation: number | null
  onSelectVariation: (id: number) => void
  onEditVariation: (id: number, text: string) => void
  onCopyVariation: (text: string) => void
  getProviderIcon: (provider: string) => React.ReactNode
  getProviderName: (provider: string) => string
  getValidationColor: (score: number) => string
  getValidationIcon: (score: number) => React.ComponentType<any>
}

export default function ResponseVariations({
  variations,
  selectedVariation,
  onSelectVariation,
  onEditVariation,
  onCopyVariation,
  getProviderIcon,
  getProviderName,
  getValidationColor,
  getValidationIcon
}: ResponseVariationsProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  const handleEdit = (variation: ResponseVariation) => {
    setEditingId(variation.id)
    setEditText(variation.text)
  }

  const handleSave = (id: number) => {
    onEditVariation(id, editText)
    setEditingId(null)
    setEditText('')
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditText('')
  }

  const getVariationStyle = (id: number) => {
    const styles = [
      'border-blue-200 bg-blue-50',
      'border-green-200 bg-green-50',
      'border-purple-200 bg-purple-50',
      'border-orange-200 bg-orange-50',
      'border-pink-200 bg-pink-50'
    ]
    return styles[(id - 1) % styles.length]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Response Variations</h3>
        <Badge variant="info" size="sm">
          {variations.length} Options
        </Badge>
      </div>

      <div className="space-y-3">
        {variations.map((variation) => (
          <div
            key={variation.id}
            className={`border-2 rounded-lg p-4 transition-all duration-200 ${
              selectedVariation === variation.id
                ? 'border-primary-500 bg-primary-50'
                : `border-gray-200 hover:border-gray-300 ${getVariationStyle(variation.id)}`
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-600">
                    {variation.id}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="info" size="sm">
                    {getProviderIcon(variation.provider)} {getProviderName(variation.provider)}
                  </Badge>
                  {variation.validation && (
                    <Badge variant={getValidationColor(variation.validation.score) as any} size="sm">
                      {React.createElement(getValidationIcon(variation.validation.score), {
                        className: 'w-3 h-3 mr-1'
                      })}
                      {variation.validation.score}/100
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {editingId === variation.id ? (
                  <>
                    <button
                      onClick={() => handleSave(variation.id)}
                      className="p-1 text-green-600 hover:text-green-700"
                      title="Save changes"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-1 text-red-600 hover:text-red-700"
                      title="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(variation)}
                      className="p-1 text-gray-600 hover:text-gray-700"
                      title="Edit response"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onCopyVariation(variation.text)}
                      className="p-1 text-gray-600 hover:text-gray-700"
                      title="Copy response"
                      data-shortcut="copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            {editingId === variation.id ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="Edit your response..."
              />
            ) : (
              <div className="space-y-3">
                <p className="text-gray-800 leading-relaxed">{variation.text}</p>
                
                {/* Validation Details */}
                {variation.validation && (
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">Quality Score</h4>
                      <Badge variant={getValidationColor(variation.validation.score) as any} size="sm">
                        {variation.validation.score}/100
                      </Badge>
                    </div>
                    
                    {variation.validation.issues.length > 0 && (
                      <div className="mb-2">
                        <h5 className="text-xs font-semibold text-red-700 mb-1">Issues:</h5>
                        <ul className="space-y-1">
                          {variation.validation.issues.slice(0, 2).map((issue, index) => (
                            <li key={index} className="text-xs text-red-600">
                              • {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {variation.validation.suggestions.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-blue-700 mb-1">Suggestions:</h5>
                        <ul className="space-y-1">
                          {variation.validation.suggestions.slice(0, 2).map((suggestion, index) => (
                            <li key={index} className="text-xs text-blue-600">
                              • {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Selection Button */}
            {editingId !== variation.id && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => onSelectVariation(variation.id)}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    selectedVariation === variation.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedVariation === variation.id ? 'Selected' : 'Select This Response'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 