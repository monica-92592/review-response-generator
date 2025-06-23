'use client'

import { useState, useEffect } from 'react'
import Container from '@/components/ui/Container'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { 
  ResponseTemplate, 
  TemplateCategory,
  getAllTemplates, 
  getTemplatesByCategory,
  searchTemplates,
  templateCategories,
  getCategoryById,
  incrementTemplateUsage
} from '@/lib/templates'
import { TemplateCreator } from '@/components/ui/TemplateCreator'
import { TemplateSharing } from '@/components/ui/TemplateSharing'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Edit, 
  Trash2, 
  Share2, 
  Copy, 
  Star,
  Tag,
  Calendar,
  Eye
} from 'lucide-react'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ResponseTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<ResponseTemplate[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreator, setShowCreator] = useState(false)
  const [showSharing, setShowSharing] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseTemplate | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'usage'>('name')

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, selectedCategory, searchQuery, sortBy])

  const loadTemplates = () => {
    const allTemplates = getAllTemplates()
    setTemplates(allTemplates)
  }

  const filterTemplates = () => {
    let filtered = templates

    // Filter by category
    if (selectedCategory) {
      filtered = getTemplatesByCategory(selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = searchTemplates(searchQuery)
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        case 'usage':
          return (b.usageCount || 0) - (a.usageCount || 0)
        default:
          return 0
      }
    })

    setFilteredTemplates(filtered)
  }

  const handleTemplateSelect = (template: ResponseTemplate) => {
    incrementTemplateUsage(template.id)
    setSelectedTemplate(template)
    setShowSharing(true)
  }

  const handleTemplateEdit = (template: ResponseTemplate) => {
    setEditingTemplate(template)
    setShowCreator(true)
  }

  const handleTemplateDelete = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null)
      setShowSharing(false)
    }
  }

  const handleTemplateSave = (template: ResponseTemplate) => {
    loadTemplates()
    setShowCreator(false)
    setEditingTemplate(null)
  }

  const handleTemplateImport = (template: ResponseTemplate) => {
    loadTemplates()
  }

  const copyTemplate = async (template: ResponseTemplate) => {
    try {
      await navigator.clipboard.writeText(template.template)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy template:', error)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const renderTemplateCard = (template: ResponseTemplate) => {
    const category = getCategoryById(template.category)
    
    return (
      <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs ${category?.color || 'bg-gray-100 text-gray-800'}`}>
                {category?.icon} {category?.name}
              </span>
              <div className="flex items-center gap-1">
                {renderStars(template.rating)}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyTemplate(template)}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTemplateEdit(template)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTemplateSelect(template)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {template.description || template.template.substring(0, 100)}...
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              +{template.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3" />
            <span>{template.usageCount || 0} uses</span>
          </div>
          {template.isCustom && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{template.createdAt?.toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </Card>
    )
  }

  const renderTemplateList = (template: ResponseTemplate) => {
    const category = getCategoryById(template.category)
    
    return (
      <div
        key={template.id}
        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold">{template.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs ${category?.color || 'bg-gray-100 text-gray-800'}`}>
              {category?.icon} {category?.name}
            </span>
            <div className="flex items-center gap-1">
              {renderStars(template.rating)}
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-2">
            {template.description || template.template.substring(0, 150)}...
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{template.usageCount || 0} uses</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{template.tags.length} tags</span>
            </div>
            {template.isCustom && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{template.createdAt?.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyTemplate(template)}
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTemplateEdit(template)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTemplateSelect(template)}
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Container>
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Library</h1>
            <p className="text-gray-600 mt-2">
              Create, manage, and share response templates for your business
            </p>
          </div>
          <Button onClick={() => setShowCreator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Search Templates</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(value) => setSearchQuery(value)}
                  placeholder="Search by name, content, or tags..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...templateCategories.map(cat => ({ value: cat.id, label: cat.name }))
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <Select
                value={sortBy}
                onChange={(value) => setSortBy(value as 'name' | 'created' | 'usage')}
                options={[
                  { value: 'name', label: 'Name' },
                  { value: 'created', label: 'Recently Created' },
                  { value: 'usage', label: 'Most Used' }
                ]}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Templates Grid/List */}
        {filteredTemplates.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredTemplates.map(template => 
              viewMode === 'grid' ? renderTemplateCard(template) : renderTemplateList(template)
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first template'
                }
              </p>
              {!searchQuery && !selectedCategory && (
                <Button onClick={() => setShowCreator(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Template Creator Modal */}
        {showCreator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <TemplateCreator
                template={editingTemplate || undefined}
                onSave={handleTemplateSave}
                onCancel={() => {
                  setShowCreator(false)
                  setEditingTemplate(null)
                }}
                onDelete={editingTemplate ? handleTemplateDelete : undefined}
                mode={editingTemplate ? 'edit' : 'create'}
              />
            </div>
          </div>
        )}

        {/* Template Sharing Modal */}
        {showSharing && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Template Sharing</h2>
                  <Button variant="outline" onClick={() => setShowSharing(false)}>
                    Close
                  </Button>
                </div>
                <TemplateSharing
                  template={selectedTemplate}
                  onImport={handleTemplateImport}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
} 