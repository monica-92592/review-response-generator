'use client'

import { useState, useEffect } from 'react'
import { X, Keyboard, Search } from 'lucide-react'
import { keyboardShortcuts, ShortcutCategory } from '@/lib/keyboard-shortcuts'
import Card from './Card'
import Button from './Button'
import Input from './Input'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCategories, setFilteredCategories] = useState<ShortcutCategory[]>([])

  useEffect(() => {
    if (isOpen) {
      const categories = keyboardShortcuts.getShortcutsByCategory()
      setFilteredCategories(categories)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    const categories = keyboardShortcuts.getShortcutsByCategory()
    
    if (searchQuery.trim()) {
      const filtered = categories.map(category => ({
        ...category,
        shortcuts: category.shortcuts.filter(shortcut =>
          shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          keyboardShortcuts.getShortcutDisplay(shortcut).toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.shortcuts.length > 0)
      
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <Card className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Keyboard Shortcuts</h2>
                <p className="text-sm text-muted-foreground">
                  Quick access to all available shortcuts
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              aria-label="Close keyboard shortcuts"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
                placeholder="Search shortcuts..."
                className="pl-10"
                aria-label="Search keyboard shortcuts"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {filteredCategories.length > 0 ? (
              <div className="space-y-8">
                {filteredCategories.map((category) => (
                  <div key={category.name}>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      {category.name}
                    </h3>
                    
                    <div className="grid gap-3">
                      {category.shortcuts.map((shortcut, index) => (
                        <div
                          key={`${shortcut.key}-${index}`}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {shortcut.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {keyboardShortcuts.getShortcutDisplay(shortcut).split(' + ').map((key, keyIndex) => (
                              <kbd
                                key={keyIndex}
                                className="px-2 py-1 text-xs font-mono bg-muted text-muted-foreground rounded border border-border"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No shortcuts found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">?</kbd> to open this modal anytime
              </p>
              
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 