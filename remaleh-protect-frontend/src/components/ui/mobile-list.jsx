import React from 'react';

export function MobileList({ children, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  )
}

export function MobileListItem({ 
  children, 
  onClick, 
  interactive = false,
  className = '',
  ...props 
}) {
  const baseClasses = 'bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200'
  const interactiveClasses = interactive ? 'hover:shadow-md active:scale-[0.98] cursor-pointer' : ''
  const classes = `${baseClasses} ${interactiveClasses} ${className}`.trim()
  
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

export function MobileListItemWithIcon({ 
  icon,
  title,
  subtitle,
  rightContent,
  onClick,
  className = '',
  ...props 
}) {
  return (
    <MobileListItem 
      onClick={onClick}
      interactive={!!onClick}
      className={className}
      {...props}
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
        {rightContent && (
          <div className="flex-shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </MobileListItem>
  )
}

export function MobileListItemWithAvatar({ 
  avatar,
  title,
  subtitle,
  rightContent,
  onClick,
  className = '',
  ...props 
}) {
  return (
    <MobileListItem 
      onClick={onClick}
      interactive={!!onClick}
      className={className}
      {...props}
    >
      <div className="flex items-center space-x-3">
        {avatar && (
          <div className="flex-shrink-0">
            {typeof avatar === 'string' ? (
              <img 
                src={avatar} 
                alt={title}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              avatar
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
        {rightContent && (
          <div className="flex-shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </MobileListItem>
  )
}

export function MobileListItemWithBadge({ 
  icon,
  title,
  subtitle,
  badge,
  badgeColor = 'blue',
  onClick,
  className = '',
  ...props 
}) {
  const badgeColors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800'
  }

  return (
    <MobileListItem 
      onClick={onClick}
      interactive={!!onClick}
      className={className}
      {...props}
    >
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
            {badge && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[badgeColor]}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </MobileListItem>
  )
}

export function MobileListItemWithActions({ 
  icon,
  title,
  subtitle,
  actions = [],
  onClick,
  className = '',
  ...props 
}) {
  return (
    <MobileListItem 
      onClick={onClick}
      interactive={!!onClick}
      className={className}
      {...props}
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
        {actions.length > 0 && (
          <div className="flex-shrink-0 flex items-center space-x-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  if (action.onClick) {
                    action.onClick()
                  }
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                title={action.title}
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </MobileListItem>
  )
}
