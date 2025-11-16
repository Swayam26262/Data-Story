'use client';

/**
 * Legend Controller
 * Provides interactive legend functionality with series visibility toggling,
 * hover effects, "show only" mode, and mobile collapsible support
 */

import React, { useState, useCallback, useEffect } from 'react';

/**
 * Legend item state
 */
export interface LegendItemState {
  dataKey: string;
  name: string;
  color: string;
  visible: boolean;
  hovered: boolean;
}

/**
 * Legend state management
 */
export interface LegendState {
  items: Map<string, LegendItemState>;
  collapsed: boolean;
}

/**
 * Legend controller props
 */
export interface LegendControllerProps {
  children: (state: LegendState, handlers: LegendHandlers) => React.ReactNode;
  items: Array<{ dataKey: string; name: string; color: string }>;
  onVisibilityChange?: (dataKey: string, visible: boolean) => void;
  onShowOnly?: (dataKey: string) => void;
  onHoverChange?: (dataKey: string | null) => void;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  syncKey?: string; // Key for synchronizing legend state across charts
  className?: string;
}

/**
 * Event handlers for legend interactions
 */
export interface LegendHandlers {
  toggleVisibility: (dataKey: string, modifierKey?: boolean) => void;
  showOnly: (dataKey: string) => void;
  showAll: () => void;
  hideAll: () => void;
  setHovered: (dataKey: string | null) => void;
  toggleCollapsed: () => void;
}

// Global state for synchronizing legends across charts
const legendSyncState = new Map<string, Map<string, boolean>>();

/**
 * Legend Controller Component
 * Manages legend state and provides event handlers for interactions
 */
export function LegendController({
  children,
  items,
  onVisibilityChange,
  onShowOnly,
  onHoverChange,
  collapsible = false,
  defaultCollapsed = false,
  syncKey,
  className = '',
}: LegendControllerProps) {
  // Initialize legend items state
  const [legendItems, setLegendItems] = useState<Map<string, LegendItemState>>(() => {
    const itemsMap = new Map<string, LegendItemState>();
    
    // Check if we have synced state
    const syncedVisibility = syncKey ? legendSyncState.get(syncKey) : null;
    
    items.forEach((item) => {
      itemsMap.set(item.dataKey, {
        dataKey: item.dataKey,
        name: item.name,
        color: item.color,
        visible: syncedVisibility?.get(item.dataKey) ?? true,
        hovered: false,
      });
    });
    
    return itemsMap;
  });

  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // Sync visibility state across charts with same syncKey
  useEffect(() => {
    if (!syncKey) return;

    // Initialize sync state if not exists
    if (!legendSyncState.has(syncKey)) {
      const visibilityMap = new Map<string, boolean>();
      legendItems.forEach((item) => {
        visibilityMap.set(item.dataKey, item.visible);
      });
      legendSyncState.set(syncKey, visibilityMap);
    }

    // Listen for storage events for cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `legend-sync-${syncKey}` && e.newValue) {
        try {
          const syncedState = JSON.parse(e.newValue);
          setLegendItems((prev) => {
            const updated = new Map(prev);
            Object.entries(syncedState).forEach(([key, visible]) => {
              const item = updated.get(key);
              if (item) {
                updated.set(key, { ...item, visible: visible as boolean });
              }
            });
            return updated;
          });
        } catch (error) {
          console.error('Failed to parse legend sync state:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [syncKey, legendItems]);

  // Update sync state when visibility changes
  const updateSyncState = useCallback(
    (updatedItems: Map<string, LegendItemState>) => {
      if (!syncKey) return;

      const visibilityMap = new Map<string, boolean>();
      updatedItems.forEach((item) => {
        visibilityMap.set(item.dataKey, item.visible);
      });
      
      legendSyncState.set(syncKey, visibilityMap);

      // Persist to localStorage for cross-tab sync
      try {
        const syncObject: Record<string, boolean> = {};
        visibilityMap.forEach((visible, key) => {
          syncObject[key] = visible;
        });
        localStorage.setItem(`legend-sync-${syncKey}`, JSON.stringify(syncObject));
      } catch (error) {
        console.error('Failed to sync legend state:', error);
      }
    },
    [syncKey]
  );

  // Toggle visibility of a single series
  const toggleVisibility = useCallback(
    (dataKey: string, modifierKey = false) => {
      setLegendItems((prev) => {
        const updated = new Map(prev);
        const item = updated.get(dataKey);
        
        if (!item) return prev;

        // If modifier key (Ctrl/Cmd) is pressed, show only this item
        if (modifierKey) {
          updated.forEach((legendItem) => {
            updated.set(legendItem.dataKey, {
              ...legendItem,
              visible: legendItem.dataKey === dataKey,
            });
          });
          onShowOnly?.(dataKey);
        } else {
          // Regular toggle
          const newVisible = !item.visible;
          updated.set(dataKey, { ...item, visible: newVisible });
          onVisibilityChange?.(dataKey, newVisible);
        }

        updateSyncState(updated);
        return updated;
      });
    },
    [onVisibilityChange, onShowOnly, updateSyncState]
  );

  // Show only one series, hide all others
  const showOnly = useCallback(
    (dataKey: string) => {
      setLegendItems((prev) => {
        const updated = new Map(prev);
        updated.forEach((item) => {
          const newVisible = item.dataKey === dataKey;
          updated.set(item.dataKey, { ...item, visible: newVisible });
          onVisibilityChange?.(item.dataKey, newVisible);
        });
        updateSyncState(updated);
        onShowOnly?.(dataKey);
        return updated;
      });
    },
    [onVisibilityChange, onShowOnly, updateSyncState]
  );

  // Show all series
  const showAll = useCallback(() => {
    setLegendItems((prev) => {
      const updated = new Map(prev);
      updated.forEach((item) => {
        updated.set(item.dataKey, { ...item, visible: true });
        onVisibilityChange?.(item.dataKey, true);
      });
      updateSyncState(updated);
      return updated;
    });
  }, [onVisibilityChange, updateSyncState]);

  // Hide all series
  const hideAll = useCallback(() => {
    setLegendItems((prev) => {
      const updated = new Map(prev);
      updated.forEach((item) => {
        updated.set(item.dataKey, { ...item, visible: false });
        onVisibilityChange?.(item.dataKey, false);
      });
      updateSyncState(updated);
      return updated;
    });
  }, [onVisibilityChange, updateSyncState]);

  // Set hovered state for a legend item
  const setHovered = useCallback(
    (dataKey: string | null) => {
      setLegendItems((prev) => {
        const updated = new Map(prev);
        updated.forEach((item) => {
          updated.set(item.dataKey, {
            ...item,
            hovered: item.dataKey === dataKey,
          });
        });
        return updated;
      });
      onHoverChange?.(dataKey);
    },
    [onHoverChange]
  );

  // Toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const state: LegendState = {
    items: legendItems,
    collapsed,
  };

  const handlers: LegendHandlers = {
    toggleVisibility,
    showOnly,
    showAll,
    hideAll,
    setHovered,
    toggleCollapsed,
  };

  return (
    <div className={`legend-controller ${className}`}>
      {children(state, handlers)}
    </div>
  );
}

/**
 * Interactive Legend Component
 * Renders a styled legend with all interactive features
 */
export interface InteractiveLegendProps {
  state: LegendState;
  handlers: LegendHandlers;
  position?: 'top' | 'bottom' | 'left' | 'right';
  orientation?: 'horizontal' | 'vertical';
  collapsible?: boolean;
  className?: string;
}

export function InteractiveLegend({
  state,
  handlers,
  position = 'bottom',
  orientation = 'horizontal',
  collapsible = false,
  className = '',
}: InteractiveLegendProps) {
  const { items, collapsed } = state;
  const { toggleVisibility, setHovered, toggleCollapsed } = handlers;
  
  // Use collapsible prop to determine if toggle button should be shown
  const showToggle = collapsible;

  // Determine layout classes based on position and orientation
  const containerClasses = [
    'interactive-legend',
    'flex',
    'items-center',
    'gap-4',
    orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
    position === 'top' || position === 'bottom' ? 'justify-center' : '',
    className,
  ].filter(Boolean).join(' ');

  const itemsArray = Array.from(items.values());

  return (
    <div className={containerClasses}>
      {/* Collapse toggle button for mobile */}
      {showToggle && (
        <button
          onClick={toggleCollapsed}
          className="legend-toggle px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors md:hidden"
          aria-label={collapsed ? 'Expand legend' : 'Collapse legend'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          )}
        </button>
      )}

      {/* Legend items */}
      {(!showToggle || !collapsed) && (
        <div
          className={`legend-items flex gap-4 ${
            orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'
          }`}
        >
          {itemsArray.map((item) => (
            <LegendItem
              key={item.dataKey}
              item={item}
              onToggle={(modifierKey) => toggleVisibility(item.dataKey, modifierKey)}
              onHover={() => setHovered(item.dataKey)}
              onLeave={() => setHovered(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Individual Legend Item Component
 */
interface LegendItemProps {
  item: LegendItemState;
  onToggle: (modifierKey: boolean) => void;
  onHover: () => void;
  onLeave: () => void;
}

function LegendItem({ item, onToggle, onHover, onLeave }: LegendItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    const modifierKey = e.ctrlKey || e.metaKey;
    onToggle(modifierKey);
  };

  return (
    <button
      className={`legend-item flex items-center gap-2 px-2 py-1 rounded transition-all duration-200 cursor-pointer select-none ${
        item.visible
          ? 'opacity-100'
          : 'opacity-40'
      } ${
        item.hovered
          ? 'bg-gray-100 scale-105'
          : 'hover:bg-gray-50'
      }`}
      onClick={handleClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      title={`Click to toggle ${item.name}. Ctrl/Cmd+Click to show only this series.`}
      aria-label={`${item.name}: ${item.visible ? 'visible' : 'hidden'}`}
      aria-pressed={item.visible}
    >
      {/* Color indicator */}
      <div
        className={`legend-color w-3 h-3 rounded-sm flex-shrink-0 transition-all ${
          item.visible ? '' : 'opacity-50'
        }`}
        style={{ backgroundColor: item.color }}
      />

      {/* Series name */}
      <span
        className={`legend-label text-xs font-medium transition-colors ${
          item.visible ? 'text-gray-700' : 'text-gray-400'
        }`}
      >
        {item.name}
      </span>

      {/* Visibility indicator */}
      {!item.visible && (
        <svg
          className="w-3 h-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * Hook for using legend functionality
 * Provides a simpler API for common use cases
 */
export function useLegend(
  items: Array<{ dataKey: string; name: string; color: string }>,
  onVisibilityChange?: (dataKey: string, visible: boolean) => void
) {
  const [visibilityMap, setVisibilityMap] = useState<Map<string, boolean>>(() => {
    const map = new Map<string, boolean>();
    items.forEach((item) => map.set(item.dataKey, true));
    return map;
  });

  const toggleVisibility = useCallback(
    (dataKey: string) => {
      setVisibilityMap((prev) => {
        const updated = new Map(prev);
        const currentValue = updated.get(dataKey) ?? true;
        const newValue = !currentValue;
        updated.set(dataKey, newValue);
        onVisibilityChange?.(dataKey, newValue);
        return updated;
      });
    },
    [onVisibilityChange]
  );

  const isVisible = useCallback(
    (dataKey: string) => {
      return visibilityMap.get(dataKey) ?? true;
    },
    [visibilityMap]
  );

  const showOnly = useCallback(
    (dataKey: string) => {
      setVisibilityMap((prev) => {
        const updated = new Map(prev);
        items.forEach((item) => {
          const newValue = item.dataKey === dataKey;
          updated.set(item.dataKey, newValue);
          onVisibilityChange?.(item.dataKey, newValue);
        });
        return updated;
      });
    },
    [items, onVisibilityChange]
  );

  return {
    visibilityMap,
    toggleVisibility,
    isVisible,
    showOnly,
  };
}

export default LegendController;
