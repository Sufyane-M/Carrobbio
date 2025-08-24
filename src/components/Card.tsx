import React from 'react'
import { cn } from '../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'featured'
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false, variant = 'default' }) => {
  const variants = {
    default: 'bg-gradient-to-br from-white to-neutral-50 border border-neutral-200 shadow-md hover:shadow-lg',
    primary: 'bg-gradient-to-br from-white to-primary-50 border border-primary-100 shadow-md hover:shadow-lg',
    secondary: 'bg-gradient-to-br from-white to-secondary-50 border border-secondary-100 shadow-md hover:shadow-lg',
    accent: 'bg-gradient-to-br from-white to-accent-50 border border-accent-100 shadow-md hover:shadow-lg',
    featured: 'bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 shadow-lg hover:shadow-xl hover:scale-102'
  }

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        variants[variant],
        hover && 'hover:shadow-xl hover:scale-105',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 pb-4 rounded-t-2xl', className)}>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 pt-4 border-t border-neutral-200', className)}>
      {children}
    </div>
  )
}