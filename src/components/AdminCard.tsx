import React from 'react'
import { cn } from '../lib/utils'

interface AdminCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'featured'
}

export const AdminCard: React.FC<AdminCardProps> = ({ children, className, hover = false, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl',
    primary: 'bg-gray-800 border border-primary-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-800 border border-secondary-700 shadow-lg hover:shadow-xl',
    accent: 'bg-gray-800 border border-accent-700 shadow-lg hover:shadow-xl',
    featured: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-primary-600 shadow-xl hover:shadow-2xl hover:scale-102'
  }

  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-300',
        variants[variant],
        hover && 'hover:shadow-2xl hover:scale-105',
        className
      )}
    >
      {children}
    </div>
  )
}

interface AdminCardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const AdminCardHeader: React.FC<AdminCardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 pb-4', className)}>
      {children}
    </div>
  )
}

interface AdminCardContentProps {
  children: React.ReactNode
  className?: string
}

export const AdminCardContent: React.FC<AdminCardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  )
}

interface AdminCardFooterProps {
  children: React.ReactNode
  className?: string
}

export const AdminCardFooter: React.FC<AdminCardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 pt-4 border-t border-gray-700', className)}>
      {children}
    </div>
  )
}