import React from 'react';

export function MobileCard({ 
  children, 
  className = '', 
  padding = 'p-4',
  shadow = 'shadow-sm',
  hover = false,
  onClick,
  interactive = false,
  ...props 
}) {
  const baseClasses = 'bg-white rounded-xl border border-gray-200'
  const shadowClasses = shadow === 'shadow' ? 'shadow' : shadow === 'shadow-lg' ? 'shadow-lg' : 'shadow-sm'
  const hoverClasses = hover ? 'hover:shadow-lg transition-all duration-200' : ''
  const interactiveClasses = interactive ? 'active:scale-95 transition-transform duration-100' : ''
  const classes = `${baseClasses} ${shadowClasses} ${hoverClasses} ${interactiveClasses} ${padding} ${className}`.trim()
  
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

export function MobileCardHeader({ children, className = '' }) {
  return (
    <div className={`mb-3 ${className}`}>
      {children}
    </div>
  )
}

export function MobileCardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function MobileCardFooter({ children, className = '' }) {
  return (
    <div className={`mt-3 pt-3 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  )
}

// Mobile-specific card variants
export function MobileActionCard({ 
  children, 
  icon, 
  title, 
  subtitle, 
  onClick, 
  className = '' 
}) {
  return (
    <MobileCard 
      onClick={onClick} 
      interactive={true}
      className={`text-left ${className}`}
    >
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      {children}
    </MobileCard>
  )
}

export function MobileStatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendDirection = 'up',
  className = '' 
}) {
  return (
    <MobileCard className={`text-center ${className}`}>
      <div className="flex flex-col items-center">
        {icon && (
          <div className="mb-2 text-blue-600">
            {icon}
          </div>
        )}
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm text-gray-600 mb-2">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-500">{subtitle}</div>
        )}
        {trend && (
          <div className={`flex items-center text-xs ${
            trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <svg className={`w-3 h-3 mr-1 ${trendDirection === 'up' ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {trend}
          </div>
        )}
      </div>
    </MobileCard>
  )
}
