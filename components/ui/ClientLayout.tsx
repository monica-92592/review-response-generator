'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'
import Button from './Button'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
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

          {/* Page title - hidden on mobile when sidebar is open */}
          <div className={`flex-1 text-center ${isSidebarOpen ? 'hidden md:block' : ''}`}>
            <h1 className="text-lg font-semibold text-foreground">
              Review Response Generator
            </h1>
          </div>

          {/* Right side - empty for now, can be used for page-specific actions */}
          <div className="w-10 md:hidden" />
        </div>

        {/* Main content area */}
        <main id="main-content" className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 