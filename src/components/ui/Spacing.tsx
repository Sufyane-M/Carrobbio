import React from 'react'
import { designSystem, SpacingKey } from '../../styles/design-system'

// Base spacing props
interface SpacingProps {
  children?: React.ReactNode
  className?: string
}

// Stack component for vertical spacing
interface StackProps extends SpacingProps {
  gap?: keyof typeof designSystem.spacing
  direction?: 'row' | 'column'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
}

export const Stack: React.FC<StackProps> = ({ 
  children, 
  gap = 'md', 
  direction = 'column', 
  align = 'stretch', 
  justify = 'start',
  wrap = false,
  className = '' 
}) => {
  const gapClass = `gap-${designSystem.spacing[gap]}`
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col'
  const alignClass = {
    start: direction === 'row' ? 'items-start' : 'items-start',
    center: 'items-center',
    end: direction === 'row' ? 'items-end' : 'items-end',
    stretch: 'items-stretch'
  }[align]
  
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center', 
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }[justify]
  
  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap'
  
  return (
    <div className={`flex ${directionClass} ${alignClass} ${justifyClass} ${gapClass} ${wrapClass} ${className}`}>
      {children}
    </div>
  )
}

// Inline component for horizontal spacing
interface InlineProps extends SpacingProps {
  gap?: keyof typeof designSystem.spacing
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
}

export const Inline: React.FC<InlineProps> = ({
  children,
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  className = '',
}) => {
  const gapClass = `gap-${designSystem.spacing[gap]}`
  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align]

  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }[justify]

  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap'

  return (
    <div className={`flex flex-row ${alignClass} ${justifyClass} ${gapClass} ${wrapClass} ${className}`}>
      {children}
    </div>
  )
}

// Box component for consistent padding and margins
interface BoxProps extends SpacingProps {
  padding?: SpacingKey | 'none'
  paddingX?: SpacingKey | 'none'
  paddingY?: SpacingKey | 'none'
  margin?: SpacingKey | 'none'
  marginX?: SpacingKey | 'none'
  marginY?: SpacingKey | 'none'
  as?: keyof JSX.IntrinsicElements
  style?: React.CSSProperties
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnter?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onClick?: () => void
}

export const Box: React.FC<BoxProps> = ({ 
  children, 
  padding = 'none',
  paddingX = 'none',
  paddingY = 'none',
  margin = 'none',
  marginX = 'none', 
  marginY = 'none',
  as: Component = 'div',
  className = '',
  style,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
  onClick
}) => {
  const paddingClass = padding !== 'none' ? `p-${designSystem.spacing[padding]}` : ''
  const paddingXClass = paddingX !== 'none' ? `px-${designSystem.spacing[paddingX]}` : ''
  const paddingYClass = paddingY !== 'none' ? `py-${designSystem.spacing[paddingY]}` : ''
  const marginClass = margin !== 'none' ? `m-${designSystem.spacing[margin]}` : ''
  const marginXClass = marginX !== 'none' ? `mx-${designSystem.spacing[marginX]}` : ''
  const marginYClass = marginY !== 'none' ? `my-${designSystem.spacing[marginY]}` : ''
  
  const classes = [
    paddingClass,
    paddingXClass, 
    paddingYClass,
    marginClass,
    marginXClass,
    marginYClass,
    className
  ].filter(Boolean).join(' ')
  
  return (
    <Component 
      className={classes}
      style={style}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onClick={onClick}
    >
      {children}
    </Component>
  )
}

// Divider component for visual separation
interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  spacing?: SpacingKey
  className?: string
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  spacing = 'lg',
  className = '',
}) => {
  const spacingClasses = {
    xs: orientation === 'horizontal' ? 'my-1' : 'mx-1',
    sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    md: orientation === 'horizontal' ? 'my-3' : 'mx-3',
    lg: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    xl: orientation === 'horizontal' ? 'my-5' : 'mx-5',
    '2xl': orientation === 'horizontal' ? 'my-6' : 'mx-6',
    '3xl': orientation === 'horizontal' ? 'my-8' : 'mx-8',
    '4xl': orientation === 'horizontal' ? 'my-10' : 'mx-10',
    '5xl': orientation === 'horizontal' ? 'my-12' : 'mx-12',
    '6xl': orientation === 'horizontal' ? 'my-16' : 'mx-16',
  }

  const orientationClasses = {
    horizontal: 'w-full h-px',
    vertical: 'h-full w-px',
  }

  return (
    <div
      className={`bg-gray-200 ${orientationClasses[orientation]} ${spacingClasses[spacing]} ${className}`}
    />
  )
}

// Container component for consistent max-width and centering
interface ContainerProps extends SpacingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  center?: boolean
  padding?: SpacingKey
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  center = true,
  padding = 'lg',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  }

  const paddingClasses = {
    xs: 'px-1',
    sm: 'px-2',
    md: 'px-3',
    lg: 'px-4',
    xl: 'px-5',
    '2xl': 'px-6',
    '3xl': 'px-8',
    '4xl': 'px-10',
    '5xl': 'px-12',
    '6xl': 'px-16',
  }

  return (
    <div
      className={`${sizeClasses[size]} ${center ? 'mx-auto' : ''} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  )
}

// Export all components
export const Spacing = {
  Stack,
  Inline,
  Box,
  Divider,
  Container,
}

export default Spacing