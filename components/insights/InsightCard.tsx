'use client';

import { useState } from 'react';
import type { Insight } from '@/types/chart';

interface InsightCardProps {
  insight: Insight;
  onChartClick?: (chartId: string) => void;
}

export default function InsightCard({ insight, onChartClick }: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get impact color
  const getImpactColor = () => {
    switch (insight.impact) {
      case 'high':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/50',
          text: 'text-red-400',
          badge: 'bg-red-500',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          badge: 'bg-yellow-500',
        };
      case 'low':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/50',
          text: 'text-blue-400',
          badge: 'bg-blue-500',
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/50',
          text: 'text-gray-400',
          badge: 'bg-gray-500',
        };
    }
  };

  // Get insight type icon
  const getInsightIcon = () => {
    switch (insight.type) {
      case 'trend':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'correlation':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
      case 'outlier':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'distribution':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'seasonality':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'anomaly':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'inflection':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const colors = getImpactColor();

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-lg p-4 transition-all hover:shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon */}
          <div className={`${colors.text} mt-0.5`}>
            {getInsightIcon()}
          </div>

          {/* Title and Type */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base mb-1 leading-tight">
              {insight.title}
            </h3>
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              {insight.type}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col items-end gap-2">
          {/* Impact Badge */}
          <span
            className={`${colors.badge} text-white text-xs font-bold px-2 py-1 rounded uppercase`}
          >
            {insight.impact}
          </span>

          {/* Significance Score */}
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs text-gray-300 font-medium">
              {(insight.significance * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm leading-relaxed mb-3">
        {insight.description}
      </p>

      {/* Expandable Section */}
      {(insight.recommendation || insight.relatedChartId) && (
        <div className="border-t border-white/10 pt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-left text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span className="font-medium">
              {isExpanded ? 'Show less' : 'Show more details'}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-3 animate-fadeIn">
              {/* Recommendation */}
              {insight.recommendation && (
                <div className="bg-white/5 rounded p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Recommendation</p>
                      <p className="text-sm text-gray-200">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Chart Link */}
              {insight.relatedChartId && onChartClick && (
                <button
                  onClick={() => onChartClick(insight.relatedChartId!)}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>View related chart</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
