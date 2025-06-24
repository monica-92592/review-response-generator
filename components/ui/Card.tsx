import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
  hover?: boolean
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }
  
  const borderClasses = border ? 'border border-border' : ''
  const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5' : ''

  return (
    <div className={cn(
      'bg-card text-card-foreground rounded-xl',
      paddingClasses[padding],
      shadowClasses[shadow],
      borderClasses,
      hoverClasses,
      className
    )}>
      {children}
    </div>
  )
} 