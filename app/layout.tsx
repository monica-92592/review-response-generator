'use client'

import { useState, useEffect } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeInitializer from '@/components/ui/ThemeInitializer'
import Sidebar from '@/components/ui/Sidebar'
import { Menu } from 'lucide-react'
import Button from '@/components/ui/Button'
import '@/lib/service-worker' // Register service worker

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3B82F6" />
        <title>Review Response Generator</title>
        <meta name="description" content="AI-powered review response generator for businesses" />
      </head>
      <body className={inter.className}>
        <ThemeInitializer />
        
        <div className="flex h-screen bg-background">
          {/* Sidebar */}
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Bar */}
            <div className="h-16 bg-background border-b border-border flex items-center justify-between px-4 md:px-6">
              {/* Mobile menu button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden"
                aria-label="Open sidebar"
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
      </body>
    </html>
  )
} 