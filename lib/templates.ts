export interface ResponseTemplate {
  id: string
  name: string
  category: string
  rating: number
  template: string
  tags: string[]
  businessTypes: string[]
  tones: string[]
  isCustom?: boolean
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
  isShared?: boolean
  shareId?: string
  usageCount?: number
  description?: string
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export const templateCategories: TemplateCategory[] = [
  {
    id: 'restaurant',
    name: 'Restaurant & Food',
    description: 'Templates for restaurants, cafes, and food services',
    icon: '🍽️',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'retail',
    name: 'Retail & E-commerce',
    description: 'Templates for retail stores and online shops',
    icon: '🛍️',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Templates for medical practices and healthcare services',
    icon: '🏥',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'professional',
    name: 'Professional Services',
    description: 'Templates for consulting, legal, and professional services',
    icon: '💼',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Travel',
    description: 'Templates for hotels, travel, and hospitality services',
    icon: '🏨',
    color: 'bg-pink-100 text-pink-800'
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Templates for tech companies and software services',
    icon: '💻',
    color: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'general',
    name: 'General',
    description: 'Universal templates for any business type',
    icon: '🌟',
    color: 'bg-gray-100 text-gray-800'
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    description: 'Templates for customer support and service issues',
    icon: '🎧',
    color: 'bg-teal-100 text-teal-800'
  }
]

export const responseTemplates: ResponseTemplate[] = [
  {
    id: 'positive-restaurant',
    name: "Positive Restaurant Review",
    category: "restaurant",
    rating: 5,
    template: "Thank you for your wonderful 5-star review! We're thrilled to hear you enjoyed your dining experience with us. Your feedback means the world to our team, and we can't wait to serve you again soon!",
    tags: ["positive", "restaurant", "5-star"],
    businessTypes: ["restaurant"],
    tones: ["friendly", "professional", "empathetic"],
    isCustom: false,
    usageCount: 0
  },
  {
    id: 'negative-general',
    name: "Negative Review Response",
    category: "general",
    rating: 2,
    template: "We sincerely apologize for your disappointing experience. Your feedback is valuable to us, and we take all concerns seriously. Please reach out to us directly so we can address your specific concerns and work toward a resolution.",
    tags: ["negative", "apology", "resolution"],
    businessTypes: ["restaurant", "retail", "healthcare", "professional", "hospitality", "technology", "other"],
    tones: ["professional", "empathetic", "formal"],
    isCustom: false,
    usageCount: 0
  },
  {
    id: 'thankful-feedback',
    name: "Thank You for Feedback",
    category: "general",
    rating: 4,
    template: "Thank you for taking the time to share your feedback with us! We appreciate your 4-star review and are glad you had a positive experience. We're always working to improve and your input helps us do that.",
    tags: ["thankful", "feedback", "improvement"],
    businessTypes: ["restaurant", "retail", "healthcare", "professional", "hospitality", "technology", "other"],
    tones: ["professional", "friendly", "empathetic"],
    isCustom: false,
    usageCount: 0
  },
  {
    id: 'service-resolution',
    name: "Service Issue Resolution",
    category: "customer-service",
    rating: 3,
    template: "We appreciate you bringing this to our attention. We understand how frustrating this situation must have been, and we're committed to making it right. Our team is reviewing your feedback to prevent similar issues in the future.",
    tags: ["service", "resolution", "improvement"],
    businessTypes: ["restaurant", "retail", "healthcare", "professional", "hospitality", "technology", "other"],
    tones: ["professional", "empathetic", "formal"],
    isCustom: false,
    usageCount: 0
  },
  {
    id: 'healthcare-positive',
    name: "Healthcare Positive Review",
    category: "healthcare",
    rating: 5,
    template: "Thank you for your kind words and 5-star review! We're honored to have been part of your healthcare journey. Your trust in our team means everything to us, and we're committed to continuing to provide the highest quality care.",
    tags: ["positive", "healthcare", "5-star", "trust"],
    businessTypes: ["healthcare"],
    tones: ["professional", "empathetic", "formal"],
    isCustom: false,
    usageCount: 0
  },
  {
    id: 'retail-positive',
    name: "Retail Positive Experience",
    category: "retail",
    rating: 5,
    template: "Thank you for your fantastic 5-star review! We're delighted that you had such a positive shopping experience with us. Your satisfaction is our top priority, and we look forward to serving you again soon!",
    tags: ["positive", "retail", "5-star", "shopping"],
    businessTypes: ["retail"],
    tones: ["friendly", "professional", "casual"],
    isCustom: false,
    usageCount: 0
  },
  {
    id: 'technology-support',
    name: "Technology Support Response",
    category: "technology",
    rating: 4,
    template: "Thank you for your 4-star review! We're glad we could help resolve your technical issue. We're constantly working to improve our support services, and your feedback helps us provide even better assistance to our customers.",
    tags: ["technology", "support", "technical", "improvement"],
    businessTypes: ["technology"],
    tones: ["professional", "friendly", "casual"],
    isCustom: false,
    usageCount: 0
  },
  {
    id: 'hospitality-welcome',
    name: "Hospitality Welcome Back",
    category: "hospitality",
    rating: 5,
    template: "Thank you for your wonderful 5-star review! We're thrilled that you enjoyed your stay with us. It's guests like you who make our job so rewarding. We can't wait to welcome you back for another memorable experience!",
    tags: ["positive", "hospitality", "5-star", "welcome"],
    businessTypes: ["hospitality"],
    tones: ["friendly", "professional", "empathetic"],
    isCustom: false,
    usageCount: 0
  }
]

// Template storage key
const TEMPLATE_STORAGE_KEY = 'customTemplates'

// Get all templates (built-in + custom)
export const getAllTemplates = (): ResponseTemplate[] => {
  const customTemplates = getCustomTemplates()
  return [...responseTemplates, ...customTemplates]
}

// Get custom templates from localStorage
export const getCustomTemplates = (): ResponseTemplate[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(TEMPLATE_STORAGE_KEY)
    if (!data) return []
    
    const parsed = JSON.parse(data)
    return parsed.map((template: any) => ({
      ...template,
      createdAt: template.createdAt ? new Date(template.createdAt) : new Date(),
      updatedAt: template.updatedAt ? new Date(template.updatedAt) : new Date()
    }))
  } catch (error) {
    console.error('Error loading custom templates:', error)
    return []
  }
}

// Save custom templates to localStorage
export const saveCustomTemplates = (templates: ResponseTemplate[]) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates))
  } catch (error) {
    console.error('Error saving custom templates:', error)
  }
}

// Add new custom template
export const addCustomTemplate = (template: Omit<ResponseTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): ResponseTemplate => {
  const newTemplate: ResponseTemplate = {
    ...template,
    id: `custom-${Date.now()}`,
    isCustom: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0
  }
  
  const existingTemplates = getCustomTemplates()
  const updatedTemplates = [newTemplate, ...existingTemplates]
  saveCustomTemplates(updatedTemplates)
  
  return newTemplate
}

// Update existing template
export const updateCustomTemplate = (id: string, updates: Partial<ResponseTemplate>): ResponseTemplate | null => {
  const templates = getCustomTemplates()
  const templateIndex = templates.findIndex(t => t.id === id)
  
  if (templateIndex === -1) return null
  
  const updatedTemplate: ResponseTemplate = {
    ...templates[templateIndex],
    ...updates,
    updatedAt: new Date()
  }
  
  templates[templateIndex] = updatedTemplate
  saveCustomTemplates(templates)
  
  return updatedTemplate
}

// Delete custom template
export const deleteCustomTemplate = (id: string): boolean => {
  const templates = getCustomTemplates()
  const filteredTemplates = templates.filter(t => t.id !== id)
  
  if (filteredTemplates.length === templates.length) return false
  
  saveCustomTemplates(filteredTemplates)
  return true
}

// Increment template usage count
export const incrementTemplateUsage = (id: string): void => {
  // Update built-in templates
  const builtInIndex = responseTemplates.findIndex(t => t.id === id)
  if (builtInIndex !== -1) {
    responseTemplates[builtInIndex].usageCount = (responseTemplates[builtInIndex].usageCount || 0) + 1
  }
  
  // Update custom templates
  const customTemplates = getCustomTemplates()
  const customIndex = customTemplates.findIndex(t => t.id === id)
  if (customIndex !== -1) {
    customTemplates[customIndex].usageCount = (customTemplates[customIndex].usageCount || 0) + 1
    saveCustomTemplates(customTemplates)
  }
}

// Generate share ID for template
export const generateShareId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Share template
export const shareTemplate = (id: string): string | null => {
  const allTemplates = getAllTemplates()
  const template = allTemplates.find(t => t.id === id)
  
  if (!template) return null
  
  const shareId = generateShareId()
  const sharedTemplate = {
    ...template,
    shareId,
    isShared: true
  }
  
  // Save shared template
  const sharedTemplates = getSharedTemplates()
  sharedTemplates[shareId] = sharedTemplate
  saveSharedTemplates(sharedTemplates)
  
  // Update original template
  if (template.isCustom) {
    updateCustomTemplate(id, { shareId, isShared: true })
  }
  
  return shareId
}

// Get shared templates
export const getSharedTemplates = (): Record<string, ResponseTemplate> => {
  if (typeof window === 'undefined') return {}
  
  try {
    const data = localStorage.getItem('sharedTemplates')
    if (!data) return {}
    
    const parsed = JSON.parse(data)
    return Object.fromEntries(
      Object.entries(parsed).map(([key, template]: [string, any]) => [
        key,
        {
          ...template,
          createdAt: template.createdAt ? new Date(template.createdAt) : new Date(),
          updatedAt: template.updatedAt ? new Date(template.updatedAt) : new Date()
        }
      ])
    )
  } catch (error) {
    console.error('Error loading shared templates:', error)
    return {}
  }
}

// Save shared templates
export const saveSharedTemplates = (templates: Record<string, ResponseTemplate>) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('sharedTemplates', JSON.stringify(templates))
  } catch (error) {
    console.error('Error saving shared templates:', error)
  }
}

// Import shared template
export const importSharedTemplate = (shareId: string): ResponseTemplate | null => {
  const sharedTemplates = getSharedTemplates()
  const sharedTemplate = sharedTemplates[shareId]
  
  if (!sharedTemplate) return null
  
  // Create new custom template from shared template
  const newTemplate = addCustomTemplate({
    name: sharedTemplate.name,
    category: sharedTemplate.category,
    rating: sharedTemplate.rating,
    template: sharedTemplate.template,
    tags: sharedTemplate.tags,
    businessTypes: sharedTemplate.businessTypes,
    tones: sharedTemplate.tones,
    description: sharedTemplate.description,
    isCustom: true,
    createdBy: 'Imported from shared template'
  })
  
  return newTemplate
}

// Template filtering and search functions
export const getTemplatesByCategory = (category?: string): ResponseTemplate[] => {
  const allTemplates = getAllTemplates()
  if (!category) return allTemplates
  return allTemplates.filter(template => template.category === category)
}

export const getTemplatesByBusinessType = (businessType: string): ResponseTemplate[] => {
  const allTemplates = getAllTemplates()
  return allTemplates.filter(template => 
    template.businessTypes.includes(businessType) || 
    template.businessTypes.includes('other')
  )
}

export const getTemplatesByRating = (rating: number): ResponseTemplate[] => {
  const allTemplates = getAllTemplates()
  return allTemplates.filter(template => template.rating === rating)
}

export const searchTemplates = (query: string): ResponseTemplate[] => {
  const allTemplates = getAllTemplates()
  const lowercaseQuery = query.toLowerCase()
  
  return allTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.template.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    template.description?.toLowerCase().includes(lowercaseQuery)
  )
}

export const getTemplateById = (id: string): ResponseTemplate | undefined => {
  const allTemplates = getAllTemplates()
  return allTemplates.find(template => template.id === id)
}

export const getCategoryById = (id: string): TemplateCategory | undefined => {
  return templateCategories.find(category => category.id === id)
} 