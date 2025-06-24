'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'
import Button from './Button'
import { cn } from '@/lib/utils'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  // Close sidebar on mobile when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [pathname])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Get page title based on current route
  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Generate Response'
      case '/templates':
        return 'Templates'
      case '/history':
        return 'Response History'
      case '/analytics':
        return 'Analytics Dashboard'
      case '/settings':
        return 'Settings'
      default:
        return 'AI Review Response Generator'
    }
  }

  // Get page description based on current route
  const getPageDescription = () => {
    switch (pathname) {
      case '/':
        return 'Create AI-powered responses to customer reviews'
      case '/templates':
        return 'Manage and organize response templates'
      case '/history':
        return 'View and manage your response history'
      case '/analytics':
        return 'Track performance and business intelligence'
      case '/settings':
        return 'Configure your preferences and settings'
      default:
        return 'AI-powered review response generator'
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-16 bg-background border-b border-border flex items-center justify-between px-4 md:px-6">
          {/* Mobile menu button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* Page title and description */}
          <div className={`flex-1 text-center ${isSidebarOpen ? 'hidden md:block' : ''}`}>
            <h1 className="text-lg font-semibold text-foreground">
              {getPageTitle()}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {getPageDescription()}
            </p>
          </div>

          {/* Right side - empty for now, can be used for page-specific actions */}
          <div className="w-10 md:hidden" />
        </div>

        {/* Main content area */}
        <main 
          id="main-content" 
          className="flex-1 overflow-auto focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  )
} 