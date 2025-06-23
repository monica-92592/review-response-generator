'use client'

import { useState } from 'react'
import Card from './Card'
import Button from './Button'
import Input from './Input'
import Select from './Select'
import { 
  ResponseTemplate, 
  templateCategories, 
  addCustomTemplate, 
  updateCustomTemplate,
  deleteCustomTemplate 
} from '@/lib/templates'
import { X, Plus, Edit, Trash2, Save, Copy, Share2 } from 'lucide-react'

interface TemplateCreatorProps {
  template?: ResponseTemplate
  onSave: (template: ResponseTemplate) => void
  onCancel: () => void
  onDelete?: (id: string) => void
  mode: 'create' | 'edit'
}

export function TemplateCreator({ 
  template, 
  onSave, 
  onCancel, 
  onDelete, 
  mode 
}: TemplateCreatorProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    category: template?.category || 'general',
    rating: template?.rating || 5,
    template: template?.template || '',
    description: template?.description || '',
    tags: template?.tags || [],
    businessTypes: template?.businessTypes || ['other'],
    tones: template?.tones || ['professional']
  })

  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const businessTypeOptions = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'retail', label: 'Retail' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'professional', label: 'Professional Services' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'technology', label: 'Technology' },
    { value: 'other', label: 'Other' }
  ]

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'casual', label: 'Casual' },
    { value: 'empathetic', label: 'Empathetic' },
    { value: 'formal', label: 'Formal' },
    { value: 'enthusiastic', label: 'Enthusiastic' }
  ]

  const ratingOptions = [
    { value: '1', label: '1 Star' },
    { value: '2', label: '2 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '5', label: '5 Stars' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required'
    }

    if (!formData.template.trim()) {
      newErrors.template = 'Template content is required'
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required'
    }

    if (formData.businessTypes.length === 0) {
      newErrors.businessTypes = 'At least one business type is required'
    }

    if (formData.tones.length === 0) {
      newErrors.tones = 'At least one tone is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const templateData = {
      name: formData.name.trim(),
      category: formData.category,
      rating: formData.rating,
      template: formData.template.trim(),
      description: formData.description.trim(),
      tags: formData.tags,
      businessTypes: formData.businessTypes,
      tones: formData.tones
    }

    if (mode === 'create') {
      const newTemplate = addCustomTemplate(templateData)
      onSave(newTemplate)
    } else if (template) {
      const updatedTemplate = updateCustomTemplate(template.id, templateData)
      if (updatedTemplate) {
        onSave(updatedTemplate)
      }
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const toggleBusinessType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      businessTypes: prev.businessTypes.includes(type)
        ? prev.businessTypes.filter(t => t !== type)
        : [...prev.businessTypes, type]
    }))
  }

  const toggleTone = (tone: string) => {
    setFormData(prev => ({
      ...prev,
      tones: prev.tones.includes(tone)
        ? prev.tones.filter(t => t !== tone)
        : [...prev.tones, tone]
    }))
  }

  const handleDelete = () => {
    if (template && onDelete) {
      if (confirm('Are you sure you want to delete this template?')) {
        deleteCustomTemplate(template.id)
        onDelete(template.id)
      }
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {mode === 'create' ? 'Create New Template' : 'Edit Template'}
        </h2>
        <div className="flex gap-2">
          {mode === 'edit' && onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Template Name *</label>
            <Input
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              placeholder="Enter template name"
              error={errors.name}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select
              value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              options={templateCategories.map(cat => ({ value: cat.id, label: cat.name }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <Select
              value={formData.rating.toString()}
              onChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
              options={ratingOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Optional description"
            />
          </div>
        </div>

        {/* Template Content */}
        <div>
          <label className="block text-sm font-medium mb-2">Template Content *</label>
          <textarea
            value={formData.template}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, template: e.target.value }))}
            placeholder="Enter your response template..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            style={{ minHeight: '120px' }}
          />
          {errors.template && (
            <p className="text-red-600 text-sm mt-1">{errors.template}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">Tags *</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={(value) => setNewTag(value)}
              placeholder="Add a tag"
            />
            <Button type="button" onClick={addTag} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {errors.tags && (
            <p className="text-red-600 text-sm mt-1">{errors.tags}</p>
          )}
        </div>

        {/* Business Types */}
        <div>
          <label className="block text-sm font-medium mb-2">Business Types *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {businessTypeOptions.map(option => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.businessTypes.includes(option.value)}
                  onChange={() => toggleBusinessType(option.value)}
                  className="rounded"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.businessTypes && (
            <p className="text-red-600 text-sm mt-1">{errors.businessTypes}</p>
          )}
        </div>

        {/* Tones */}
        <div>
          <label className="block text-sm font-medium mb-2">Tones *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {toneOptions.map(option => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.tones.includes(option.value)}
                  onChange={() => toggleTone(option.value)}
                  className="rounded"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.tones && (
            <p className="text-red-600 text-sm mt-1">{errors.tones}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            {mode === 'create' ? 'Create Template' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  )
} 