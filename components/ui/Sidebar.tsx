'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  FileText, 
  History, 
  BarChart3, 
  Settings,
  Menu,
  X,
  HelpCircle,
  Star,
  MessageSquare,
  Zap,
  TrendingUp
} from 'lucide-react'
import Button from './Button'
import ThemeToggle from './ThemeToggle'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  isOpen = false, 
  onClose,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const pathname = usePathname()

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      onClose?.()
    }
  }, [pathname, onClose])

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when sidebar is open on mobile
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const navigation = [
    { name: 'Generate Response', href: '/', icon: MessageSquare, description: 'Create AI-powered responses' },
    { name: 'Templates', href: '/templates', icon: FileText, description: 'Manage response templates' },
    { name: 'History', href: '/history', icon: History, description: 'View response history' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Track performance metrics' },
    { name: 'Settings', href: '/settings', icon: Settings, description: 'Configure preferences' }
  ];

  const quickActions = [
    { name: 'Recent Responses', href: '/history', icon: Star, description: 'Quick access to recent responses' },
    { name: 'Popular Templates', href: '/templates', icon: FileText, description: 'Most used templates' },
    { name: 'Performance Stats', href: '/analytics', icon: TrendingUp, description: 'View key metrics' }
  ];

  const isActive = (href: string) => pathname === href

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      onClose?.()
    }
  }

  const handleCollapseClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleCollapse?.()
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-50 h-full transition-all duration-300 ease-in-out',
        'bg-background border-r border-border',
        'md:relative md:translate-x-0',
        isCollapsed ? 'w-16' : 'w-64',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        className
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <span className="font-semibold text-foreground">AI Review</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {/* Collapse/Expand button - only show on desktop */}
              <button
                onClick={handleCollapseClick}
                className="hidden md:flex p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
              {/* Close button - only show on mobile */}
              <button
                onClick={onClose}
                className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Main Navigation
                </h3>
              )}
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                      'hover:bg-accent hover:text-accent-foreground',
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={handleNavClick}
                    title={isCollapsed ? item.description : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="ml-3 truncate">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </h3>
              )}
              {quickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      'hover:bg-accent hover:text-accent-foreground',
                      'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={handleNavClick}
                    title={isCollapsed ? item.description : undefined}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="ml-3 truncate text-xs">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              {!isCollapsed && (
                <Link
                  href="/settings"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Settings
                </Link>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar 