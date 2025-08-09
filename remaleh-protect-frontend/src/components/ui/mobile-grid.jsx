import React from 'react';

export function MobileGrid({ 
  children, 
  cols = 1,
  gap = 4,
  className = '',
  ...props 
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  const gridGaps = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8'
  }

  const responsiveCols = {
    1: 'grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  }

  const classes = `grid ${responsiveCols[cols] || responsiveCols[1]} ${gridGaps[gap] || gridGaps[4]} ${className}`.trim()

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export function MobileGridItem({ 
  children, 
  span = 1,
  className = '',
  ...props 
}) {
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-1 sm:col-span-2',
    3: 'col-span-1 sm:col-span-2 md:col-span-3',
    4: 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4'
  }

  const classes = `${spanClasses[span] || spanClasses[1]} ${className}`.trim()

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

// Mobile-specific grid layouts
export function MobileStatsGrid({ children, className = '' }) {
  return (
    <MobileGrid cols={2} gap={4} className={className}>
      {children}
    </MobileGrid>
  )
}

export function MobileCardsGrid({ children, className = '' }) {
  return (
    <MobileGrid cols={1} gap={4} className={`sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {children}
    </MobileGrid>
  )
}

export function MobileListGrid({ children, className = '' }) {
  return (
    <MobileGrid cols={1} gap={3} className={className}>
      {children}
    </MobileGrid>
  )
}

export function MobileFormGrid({ children, className = '' }) {
  return (
    <MobileGrid cols={1} gap={4} className={`sm:grid-cols-2 ${className}`}>
      {children}
    </MobileGrid>
  )
}

// Mobile masonry-like grid
export function MobileMasonryGrid({ children, className = '' }) {
  return (
    <div className={`columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 ${className}`}>
      {children}
    </div>
  )
}

export function MobileMasonryItem({ children, className = '' }) {
  return (
    <div className={`break-inside-avoid mb-4 ${className}`}>
      {children}
    </div>
  )
}

// Mobile carousel-like grid
export function MobileCarouselGrid({ children, className = '' }) {
  return (
    <div className={`flex space-x-4 overflow-x-auto pb-4 ${className}`}>
      {children}
    </div>
  )
}

export function MobileCarouselItem({ children, className = '', width = 'w-80' }) {
  return (
    <div className={`flex-shrink-0 ${width} ${className}`}>
      {children}
    </div>
  )
}

// Mobile responsive grid with breakpoints
export function MobileResponsiveGrid({ 
  children, 
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  gap = 4,
  className = '',
  ...props 
}) {
  const responsiveClasses = `grid grid-cols-${mobileCols} sm:grid-cols-${tabletCols} lg:grid-cols-${desktopCols} gap-${gap}`
  const classes = `${responsiveClasses} ${className}`.trim()

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
