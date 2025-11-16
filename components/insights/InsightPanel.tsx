'use client';

import { useState, useMemo } from 'react';
import type { Insight, InsightType, InsightImpact } from '@/types/chart';
import InsightCard from './InsightCard';

interface InsightPanelProps {
  insights: Insight[];
  onChartClick?: (chartId: string) => void;
  onExport?: () => void;
  className?: string;
}

type SortOption = 'significance' | 'impact' | 'type';
type FilterOption = InsightType | 'all';

export default function InsightPanel({
  insights,
  onChartClick,
  onExport,
  className = '',
}: InsightPanelProps) {
  const [sortBy, setSortBy] = useState<SortOption>('significance');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get unique insight types for filter options
  const insightTypes = useMemo(() => {
    const types = new Set(insights.map((i) => i.type));
    return Array.from(types).sort();
  }, [insights]);

  // Filter and sort insights
  const processedInsights = useMemo(() => {
    let filtered = insights;

    // Apply filter
    if (filterBy !== 'all') {
      filtered = filtered.filter((insight) => insight.type === filterBy);
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'significance':
          return b.significance - a.significance;
        case 'impact': {
          const impactOrder: Record<InsightImpact, number> = {
            high: 3,
            medium: 2,
            low: 1,
          };
          return impactOrder[b.impact] - impactOrder[a.impact];
        }
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return sorted;
  }, [insights, filterBy, sortBy]);

  // Handle export
  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }

    // Default export as JSON
    const dataStr = JSON.stringify(processedInsights, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `insights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle jump to chart
  const handleChartClick = (chartId: string) => {
    if (onChartClick) {
      onChartClick(chartId);
    } else {
      // Default behavior: scroll to chart
      const chartElement = document.querySelector(`[data-chart-id="${chartId}"]`);
      if (chartElement) {
        chartElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (insights.length === 0) {
    return (
      <div className={`bg-[#0A0A0A] border border-white/10 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <p className="text-sm">No insights available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#0A0A0A] border border-white/10 rounded-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <div>
              <h2 className="text-xl font-bold text-white">Key Insights</h2>
              <p className="text-sm text-gray-400">
                {processedInsights.length} insight{processedInsights.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Button */}
            <button
              onClick={handleExport}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
              title="Export insights"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>

            {/* Collapse/Expand Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              <svg
                className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Controls */}
        {!isCollapsed && (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Sort Dropdown */}
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="significance">Significance</option>
                <option value="impact">Impact</option>
                <option value="type">Type</option>
              </select>
            </div>

            {/* Filter Dropdown */}
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Filter by type</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="all">All types ({insights.length})</option>
                {insightTypes.map((type) => {
                  const count = insights.filter((i) => i.type === type).length;
                  return (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Insights List */}
      {!isCollapsed && (
        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
          {processedInsights.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-sm">No insights match the current filter</p>
            </div>
          ) : (
            processedInsights.map((insight, index) => (
              <InsightCard
                key={`${insight.type}-${index}`}
                insight={insight}
                onChartClick={handleChartClick}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
