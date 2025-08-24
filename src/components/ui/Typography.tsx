import React from 'react'
import { designSystem } from '../../styles/design-system'

// Typography component props
interface TypographyProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

// Heading variants
interface HeadingProps extends TypographyProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

// Text variants
interface TextProps extends TypographyProps {
  variant?: 'body' | 'caption' | 'overline' | 'subtitle1' | 'subtitle2'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'muted' | 'disabled'
}

// Heading Component
export const Heading: React.FC<HeadingProps> = ({ 
  children, 
  level = 1, 
  className = '', 
  as 
}) => {
  const Component = as || (`h${level}` as keyof JSX.IntrinsicElements)
  
  const headingStyles = {
    1: 'text-4xl font-bold leading-tight tracking-tight text-gray-900',
    2: 'text-3xl font-bold leading-tight tracking-tight text-gray-900',
    3: 'text-2xl font-semibold leading-tight tracking-tight text-gray-900',
    4: 'text-xl font-semibold leading-tight text-gray-900',
    5: 'text-lg font-medium leading-tight text-gray-900',
    6: 'text-base font-medium leading-tight text-gray-900',
  }
  
  return (
    <Component className={`${headingStyles[level]} ${className}`}>
      {children}
    </Component>
  )
}

// Text Component
export const Text: React.FC<TextProps> = ({ 
  children, 
  variant = 'body', 
  weight = 'normal',
  color,
  className = '', 
  as = 'p' 
}) => {
  const Component = as
  
  const variantStyles = {
    body: 'text-base leading-relaxed',
    caption: 'text-sm leading-normal',
    overline: 'text-xs uppercase tracking-wider leading-normal',
    subtitle1: 'text-lg leading-relaxed',
    subtitle2: 'text-base leading-relaxed',
  }
  
  const weightStyles = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }
  
  const colorStyles = {
    primary: 'text-primary-600',      // Enhanced: Using design system terracotta
    secondary: 'text-gray-700',       // Enhanced: Was text-gray-600, improved contrast
    success: 'text-secondary-600',    // Enhanced: Using design system green
    warning: 'text-warning-600',      // Enhanced: Using design system warning
    error: 'text-error-600',          // Enhanced: Using design system error
    info: 'text-info-600',           // Enhanced: Using design system info
    muted: 'text-gray-600',          // New: Accessible muted content
    disabled: 'text-gray-600 opacity-60', // New: Disabled states with proper contrast
  }
  
  const baseColor = color ? colorStyles[color] : 'text-gray-900'
  
  return (
    <Component className={`${variantStyles[variant]} ${weightStyles[weight]} ${baseColor} ${className}`}>
      {children}
    </Component>
  )
}

// Display Component (for large text)
export const Display: React.FC<TypographyProps> = ({ 
  children, 
  className = '', 
  as = 'h1' 
}) => {
  const Component = as
  
  return (
    <Component className={`text-5xl font-extrabold leading-none tracking-tight text-gray-900 ${className}`}>
      {children}
    </Component>
  )
}

// Label Component (for form labels)
interface LabelProps extends TypographyProps {
  required?: boolean
  htmlFor?: string
}

export const Label: React.FC<LabelProps> = ({ 
  children, 
  required = false,
  htmlFor,
  className = '', 
  as = 'label' 
}) => {
  const Component = as
  
  return (
    <Component 
      htmlFor={htmlFor}
      className={`text-sm font-medium text-gray-700 ${className}`}
    >
      {children}
      {required && <span className="text-error-600 ml-1">*</span>}
    </Component>
  )
}

// Code Component (for inline code)
export const Code: React.FC<TypographyProps> = ({ 
  children, 
  className = '', 
  as = 'code' 
}) => {
  const Component = as
  
  return (
    <Component className={`px-2 py-1 text-sm font-mono bg-gray-100 text-gray-800 rounded-md ${className}`}>
      {children}
    </Component>
  )
}

// Link Component (for styled links)
interface LinkProps extends TypographyProps {
  href?: string
  external?: boolean
  variant?: 'primary' | 'secondary' | 'subtle'
}

export const Link: React.FC<LinkProps> = ({ 
  children, 
  href,
  external = false,
  variant = 'primary',
  className = '', 
  as = 'a' 
}) => {
  const Component = as
  
  const variantStyles = {
    primary: 'text-primary-600 hover:text-primary-700 font-medium',     // Enhanced: Using design system colors
    secondary: 'text-secondary-600 hover:text-secondary-700 font-medium', // Enhanced: Using design system colors
    subtle: 'text-gray-700 hover:text-gray-900',                        // Enhanced: Improved contrast from gray-600
  }
  
  const baseStyles = 'transition-colors duration-200 underline decoration-2 underline-offset-2'
  
  return (
    <Component 
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </Component>
  )
}

// Export all components as default
export const Typography = {
  Heading,
  Text,
  Display,
  Label,
  Code,
  Link,
}

export default Typography