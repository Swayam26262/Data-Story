/**
 * Responsive Legend Component
 * Provides collapsible legends for mobile and full legends for desktop
 */

'use client';

import { useState } from 'react';
import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';

export interface LegendItem {
  name: string;
  color: string;
  value?: string | number;
  visible?: boolean;
}

export interface ResponsiveLegendProps {
  items: LegendItem[];
  onToggle?: (name: string) => void;
  interactive?: boolean;
  position?: 'bottom' | 'right' | 'top';
  className?: string;
}

/**
 * Responsive Legend Component
 * Automatically collapses on mobile devices
 */
export function ResponsiveLegend({
  items,
  onToggle,
  interactive = false,
  position,
  className = '',
}: ResponsiveLegendProps) {
  const { interactions, layout, isMobile } = useResponsiveChart();
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  const legendPosition = position || layout.legendPosition;
  const isCollapsible = interactions.legendCollapsible && items.length > 3;

  const handleToggle = (name: string) => {
    if (interactive && onToggle) {
      onToggle(name);
    }
  };

  const visibleItems = isCollapsible && !isExpanded ? items.slice(0, 3) : items;

  const legendClasses = `
    ${legendPosition === 'right' ? 'flex-col' : 'flex-row flex-wrap'}
    ${className}
  `;

  return (
    <div className={`flex gap-2 ${legendClasses}`}>
      {visibleItems.map((item, index) => (
        <button
          key={`${item.name}-${index}`}
          onClick={() => handleToggle(item.name)}
          disabled={!interactive}
          className={`
            flex items-center gap-2 px-2 py-1 text-xs border rounded
            ${interactive ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
            ${item.visible === false ? 'opacity-50' : 'opacity-100'}
            transition-opacity duration-200
          `}
          style={{
            minWidth: interactions.touchTargetSize,
            minHeight: interactions.touchTargetSize,
          }}
          aria-label={`${item.visible === false ? 'Show' : 'Hide'} ${item.name}`}
        >
          <div
            className="w-3 h-3 rounded flex-shrink-0"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="truncate max-w-[120px]">{item.name}</span>
          {item.value !== undefined && !isMobile && (
            <span className="font-medium text-gray-700 ml-1">({item.value})</span>
          )}
        </button>
      ))}
      
      {isCollapsible && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200"
          style={{
            minWidth: interactions.touchTargetSize,
            minHeight: interactions.touchTargetSize,
          }}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Show less' : 'Show more'}
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              <span>+{items.length - 3} More</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default ResponsiveLegend;
