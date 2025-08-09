import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

export default function MobilePullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  className = '' 
}) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling) return;
      
      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, currentY.current - startY.current);
      
      if (distance > 0) {
        setPullDistance(distance);
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      if (pullDistance >= threshold && onRefresh) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Pull to refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setIsPulling(false);
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, threshold, onRefresh]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = isPulling && pullDistance > 20;

  return (
    <div className={`relative ${className}`}>
      {/* Pull to refresh indicator */}
      {shouldShowIndicator && (
        <div 
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center bg-blue-50 border-b border-blue-200 transition-all duration-200"
          style={{
            height: `${Math.min(pullDistance, threshold)}px`,
            opacity: pullProgress
          }}
        >
          <div className="flex items-center space-x-2 text-blue-600">
            <RefreshCw 
              className={`w-5 h-5 transition-transform duration-200 ${
                pullProgress >= 1 ? 'animate-spin' : ''
              }`}
              style={{
                transform: `rotate(${pullProgress * 180}deg)`
              }}
            />
            <span className="text-sm font-medium">
              {pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Refreshing indicator */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center bg-blue-50 border-b border-blue-200 h-16">
          <div className="flex items-center space-x-2 text-blue-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Content container */}
      <div 
        ref={containerRef}
        className="h-full overflow-auto"
        style={{
          transform: shouldShowIndicator ? `translateY(${Math.min(pullDistance, threshold)}px)` : 'translateY(0)',
          transition: shouldShowIndicator ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Hook for pull to refresh functionality
export function usePullToRefresh(onRefresh) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Pull to refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return { isRefreshing, handleRefresh };
}
