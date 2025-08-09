import React from 'react'

export function Card({ 
  children, 
  className = '', 
  padding = 'p-5',
  shadow = 'shadow',
  hover = false,
  onClick,
  ...props 
}) {
  const baseClasses = 'bg-white rounded-lg border border-gray-200'
  const shadowClasses = shadow === 'shadow' ? 'shadow' : shadow === 'shadow-lg' ? 'shadow-lg' : ''
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : ''
  const classes = `${baseClasses} ${shadowClasses} ${hoverClasses} ${padding} ${className}`.trim()
  
  const Component = onClick ? 'button' : 'div'
  
  return (
    <Component 
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  )
} 