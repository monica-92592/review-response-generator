'use client'

import { useState } from 'react'
import Card from './Card'
import Button from './Button'
import Input from './Input'
import { ResponseTemplate, shareTemplate, importSharedTemplate, getSharedTemplates } from '@/lib/templates'
import { Share2, Download, Upload, Copy, Check, AlertCircle } from 'lucide-react'

interface TemplateSharingProps {
  template?: ResponseTemplate
  onImport?: (template: ResponseTemplate) => void
}

export function TemplateSharing({ template, onImport }: TemplateSharingProps) {
  const [shareId, setShareId] = useState('')
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleShare = () => {
    if (!template) return

    const id = shareTemplate(template.id)
    if (id) {
      setShareId(id)
      setCopyStatus('idle')
    }
  }

  const handleCopyShareLink = async () => {
    if (!shareId) return

    const shareUrl = `${window.location.origin}/templates/import/${shareId}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const handleImport = async () => {
    if (!shareId.trim()) {
      setErrorMessage('Please enter a share ID')
      return
    }

    setImportStatus('loading')
    setErrorMessage('')

    try {
      const importedTemplate = importSharedTemplate(shareId.trim())
      
      if (importedTemplate) {
        setImportStatus('success')
        setShareId('')
        onImport?.(importedTemplate)
        setTimeout(() => setImportStatus('idle'), 3000)
      } else {
        setImportStatus('error')
        setErrorMessage('Invalid share ID or template not found')
      }
    } catch (error) {
      setImportStatus('error')
      setErrorMessage('Failed to import template')
    }
  }

  const handleExportTemplate = () => {
    if (!template) return

    const exportData = {
      template,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importData = JSON.parse(content)
        
        if (importData.template && importData.template.name) {
          const importedTemplate = importSharedTemplate(importData.template.id || 'imported')
          if (importedTemplate) {
            onImport?.(importedTemplate)
            setImportStatus('success')
            setTimeout(() => setImportStatus('idle'), 3000)
          }
        } else {
          setErrorMessage('Invalid template file format')
        }
      } catch (error) {
        setErrorMessage('Failed to parse template file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      {/* Share Template */}
      {template && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Share Template</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Share "{template.name}" with others by generating a share link.
            </p>
            
            <div className="flex gap-2">
              <Button onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Generate Share Link
              </Button>
              
              <Button variant="outline" onClick={handleExportTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Export Template
              </Button>
            </div>

            {shareId && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">Share ID:</p>
                    <p className="text-sm text-gray-600 font-mono">{shareId}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCopyShareLink}
                    className="ml-2"
                  >
                    {copyStatus === 'copied' ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Import Template */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Import Template</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Import a template using a share ID or upload a template file.
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Share ID</label>
              <div className="flex gap-2">
                <Input
                  value={shareId}
                  onChange={(value) => setShareId(value)}
                  placeholder="Enter share ID"
                  className="flex-1"
                />
                <Button 
                  onClick={handleImport}
                  disabled={importStatus === 'loading'}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Or Upload File</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFromFile}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {importStatus === 'loading' && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Importing template...</span>
            </div>
          )}

          {importStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-4 h-4" />
              <span>Template imported successfully!</span>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Shared Templates List */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Recently Shared Templates</h3>
        </div>
        
        <SharedTemplatesList onImport={onImport} />
      </Card>
    </div>
  )
}

function SharedTemplatesList({ onImport }: { onImport?: (template: ResponseTemplate) => void }) {
  const [sharedTemplates, setSharedTemplates] = useState<Record<string, ResponseTemplate>>({})

  // Load shared templates on mount
  useState(() => {
    const templates = getSharedTemplates()
    setSharedTemplates(templates)
  })

  const handleImport = (shareId: string) => {
    const importedTemplate = importSharedTemplate(shareId)
    if (importedTemplate) {
      onImport?.(importedTemplate)
    }
  }

  const templateList = Object.entries(sharedTemplates).slice(0, 5) // Show last 5

  if (templateList.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No shared templates found
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {templateList.map(([shareId, template]) => (
        <div
          key={shareId}
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
        >
          <div className="flex-1">
            <h4 className="font-medium">{template.name}</h4>
            <p className="text-sm text-gray-600">
              {template.description || 'No description'}
            </p>
            <div className="flex gap-2 mt-1">
              {template.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleImport(shareId)}
          >
            <Download className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      ))}
    </div>
  )
} 