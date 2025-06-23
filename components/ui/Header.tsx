'use client'

import React from 'react'
import { Menu, X, Sun, Moon, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import Button from './Button'

interface HeaderProps {
  className?: string;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  className,
  onMenuToggle,
  isMenuOpen = false,
  onThemeToggle,
  isDarkMode = false
}) => {
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    onMenuToggle?.()
  }, [pathname, onMenuToggle])

  const navigation = [
    { name: 'Generator', href: '/', current: pathname === '/' },
    { name: 'Templates', href: '/templates', current: pathname === '/templates' },
    { name: 'History', href: '/history', current: pathname === '/history' },
    { name: 'Analytics', href: '/analytics', current: pathname === '/analytics' },
    { name: 'Settings', href: '/settings', current: pathname === '/settings' }
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className={cn(
      'sticky top-0 z-50',
      'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      'border-b border-border',
      'transition-colors duration-200',
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AI</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">
                  Review Response Generator
                </h1>
                <p className="text-xs text-muted-foreground">
                  AI-powered customer review responses
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-semibold text-foreground">
                  Review Generator
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium text-foreground hover:text-primary transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            {onThemeToggle && (
              <button
                onClick={onThemeToggle}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Settings */}
            <button
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header 