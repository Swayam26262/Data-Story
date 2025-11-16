'use client';

import type { ChartData, IChart } from '@/lib/models/Story';
import type { Insight, AllChartTypes, StatisticalOverlay, InteractionConfig } from '@/types/chart';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  LineChart,
  BarChart,
  ScatterPlot,
  PieChart,
  CombinationChart,
  Heatmap,
  BoxPlot,
  WaterfallChart,
  FunnelChart,
  RadarChart,
  AreaChart,
  CandlestickChart,
  LazyChart,
} from './charts';
import AggregatedChart from './charts/AggregatedChart';
import AggregationControls from './AggregationControls';
import ComparisonOverlay from './ComparisonOverlay';
import PoweredByBadge from './PoweredByBadge';
import InsightPanel from './insights/InsightPanel';
import { usePDFExport } from '@/lib/hooks/usePDFExport';
import { useAggregation } from '@/lib/hooks/useAggregation';
import { useResponsiveChart } from '@/lib/hooks/useResponsiveChart';
import { CrossChartHighlightProvider } from './charts/interactions/CrossChartHighlightContext';
import type { AggregationLevel, ComparisonType } from '@/lib/aggregation';

interface Chart extends IChart {
  chartId: string;
  type: AllChartTypes;
  title: string;
  data: ChartData;
  config: {
    xAxis?: string;
    yAxis?: string;
    nameKey?: string;
    valueKey?: string;
    colors?: string[];
    legend?: boolean;
    orientation?: 'horizontal' | 'vertical';
    trendLine?: boolean;
  };
  statistics?: StatisticalOverlay;
  interactions?: InteractionConfig;
  insights?: {
    primary: string;
    secondary?: string;
    significance: number;
  };
}

interface Narratives {
  summary: string;
  keyFindings: string;
  recommendations: string;
}

interface StoryViewerProps {
  narratives: Narratives;
  charts: Chart[];
  userTier: 'free' | 'professional' | 'business' | 'enterprise';
  storyTitle?: string;
  storyId: string;
  insights?: Insight[];
}

// Wrapper component to use aggregation hook
function ChartWithAggregation({
  chart,
  aggregationLevel,
  comparisonType,
}: {
  chart: Chart;
  aggregationLevel: AggregationLevel;
  comparisonType: ComparisonType;
}) {
  const { aggregatedData, comparisonResult, hasComparison } = useAggregation(
    chart.data,
    {
      initialAggregationLevel: aggregationLevel,
      initialComparisonType: comparisonType,
      dateField: chart.config.xAxis,
      valueFields: chart.config.yAxis ? [chart.config.yAxis] : undefined,
    }
  );

  const dataToRender = aggregatedData.length > 0 ? aggregatedData : chart.data;

  // For line and bar charts, use AggregatedChart with comparison support
  if (chart.type === 'line' || chart.type === 'bar') {
    return (
      <AggregatedChart
        chartId={chart.chartId}
        type={chart.type}
        title={chart.title}
        data={dataToRender}
        config={chart.config}
        comparisonResult={comparisonResult}
        showComparison={hasComparison}
      />
    );
  }

  // For other chart types, use standard rendering with aggregated data
  switch (chart.type) {
    case 'scatter':
      return (
        <ScatterPlot data={dataToRender} title={chart.title} config={chart.config} />
      );
    case 'pie':
      return (
        <PieChart data={dataToRender} title={chart.title} config={chart.config} />
      );
    default:
      return null;
  }
}

export default function StoryViewer({
  narratives,
  charts,
  userTier,
  storyTitle,
  storyId,
  insights = [],
}: StoryViewerProps) {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [aggregationLevel, setAggregationLevel] = useState<AggregationLevel>('daily');
  const [comparisonType, setComparisonType] = useState<ComparisonType>('none');
  const [focusedChartIndex, setFocusedChartIndex] = useState<number>(-1);
  const [showInsights, setShowInsights] = useState(true);
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRefs = useRef<Map<string, HTMLElement>>(new Map());
  
  // Responsive configuration
  const responsiveConfig = useResponsiveChart();

  // PDF Export functionality
  const { isExporting, error: exportError, exportPDF } = usePDFExport({
    storyId,
    storyTitle: storyTitle || 'Data Story',
  });

  const handleExportPDF = async () => {
    if (!containerRef.current) return;
    await exportPDF(containerRef.current);
  };

  // Check if any chart has time-series data
  const hasTimeSeriesData = charts.some((chart) => {
    if (!chart.data || chart.data.length === 0) return false;
    const firstPoint = chart.data[0];
    return Object.keys(firstPoint).some((key) => {
      const value = firstPoint[key];
      if (typeof value === 'string') {
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
      return false;
    });
  });

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute('data-section-id');
          if (sectionId) {
            setVisibleSections((prev) => {
              const newSet = new Set(prev);
              if (entry.isIntersecting) {
                newSet.add(sectionId);
              }
              return newSet;
            });
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    sectionsRef.current.forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Scroll progress indicator
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow keys for chart navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const direction = e.key === 'ArrowDown' ? 1 : -1;
        const newIndex = Math.max(
          0,
          Math.min(charts.length - 1, focusedChartIndex + direction)
        );
        setFocusedChartIndex(newIndex);
        
        // Scroll to chart
        const chart = charts[newIndex];
        if (chart) {
          const chartElement = chartRefs.current.get(chart.chartId);
          if (chartElement) {
            chartElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
      
      // 'i' key to toggle insights panel
      if (e.key === 'i' || e.key === 'I') {
        if (!e.ctrlKey && !e.metaKey) {
          setShowInsights((prev) => !prev);
        }
      }
      
      // 'h' key to go to top (home)
      if (e.key === 'h' || e.key === 'H') {
        if (!e.ctrlKey && !e.metaKey) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedChartIndex, charts]);

  // Jump to chart from insights
  const handleChartJump = useCallback((chartId: string) => {
    const chartElement = chartRefs.current.get(chartId);
    if (chartElement) {
      chartElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the chart briefly
      chartElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background-dark');
      setTimeout(() => {
        chartElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background-dark');
      }, 2000);
    }
  }, []);

  const renderChart = (chart: Chart) => {
    // Render chart with aggregation wrapper if time-series data exists and chart supports it
    const supportsAggregation = ['line', 'bar'].includes(chart.type);
    
    if (hasTimeSeriesData && supportsAggregation) {
      return (
        <ChartWithAggregation
          chart={chart}
          aggregationLevel={aggregationLevel}
          comparisonType={comparisonType}
        />
      );
    }

    // Render chart based on type with lazy loading for performance
    const chartComponent = (() => {
      switch (chart.type) {
        case 'line':
          return <LineChart data={chart.data} title={chart.title} config={chart.config} />;
        case 'bar':
          return <BarChart data={chart.data} title={chart.title} config={chart.config} />;
        case 'scatter':
          return <ScatterPlot data={chart.data} title={chart.title} config={chart.config} />;
        case 'pie':
          return <PieChart data={chart.data} title={chart.title} config={chart.config} />;
        
        // Advanced chart types - these require specific data structures from the backend
        // They will be rendered when the Python service provides the correct format
        case 'combination':
        case 'heatmap':
        case 'boxplot':
        case 'waterfall':
        case 'funnel':
        case 'radar':
        case 'area':
        case 'candlestick':
          // For now, show a placeholder - these will be properly rendered when backend provides correct data
          return (
            <div className="text-center text-gray-400 py-8">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-sm">
                {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart
              </p>
              <p className="text-xs mt-1">Advanced visualization ready for data</p>
            </div>
          );
        
        default:
          return (
            <div className="text-center text-gray-400 py-8">
              <p>Unsupported chart type: {chart.type}</p>
            </div>
          );
      }
    })();

    // Wrap in LazyChart for performance optimization
    // Map chart type to LazyChart supported types
    const lazyChartType = (['line', 'bar', 'scatter', 'pie', 'area'].includes(chart.type)
      ? chart.type
      : 'line') as 'line' | 'bar' | 'scatter' | 'pie' | 'area';
    
    return (
      <LazyChart 
        chartId={chart.chartId}
        chartType={lazyChartType}
        data={chart.data}
        enableSampling={chart.data.length > 1000}
        enableLazyLoading={true}
      >
        {chartComponent}
      </LazyChart>
    );
  };

  const sections = [
    { id: 'summary', title: 'Summary', content: narratives.summary, chartIndex: 0 },
    {
      id: 'keyFindings',
      title: 'Key Findings',
      content: narratives.keyFindings,
      chartIndex: 1,
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      content: narratives.recommendations,
      chartIndex: 2,
    },
  ];

  return (
    <CrossChartHighlightProvider>
      <div ref={containerRef} className="relative min-h-screen bg-background-dark">
        {/* Scroll Progress Indicator */}
        <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-50">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Keyboard Navigation Help - Hidden but accessible */}
        <div className="sr-only" role="status" aria-live="polite">
          Use arrow keys to navigate between charts. Press 'i' to toggle insights. Press 'h' to go to top.
        </div>

        {/* Story Header */}
        <div className="bg-[#0A0A0A] border-b border-white/10 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {storyTitle || 'Data Story'}
                </h1>
                {insights.length > 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    {insights.length} key insight{insights.length !== 1 ? 's' : ''} discovered
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                {/* Toggle Insights Button */}
                {insights.length > 0 && (
                  <button
                    onClick={() => setShowInsights(!showInsights)}
                    className="min-h-[44px] px-3 sm:px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-all text-sm sm:text-base flex items-center gap-2"
                    title="Toggle insights panel (keyboard: i)"
                  >
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5"
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
                    <span className="hidden sm:inline">
                      {showInsights ? 'Hide' : 'Show'} Insights
                    </span>
                  </button>
                )}
                
                {/* Export PDF Button */}
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="min-h-[44px] px-4 sm:px-6 py-2 sm:py-3 bg-primary text-background-dark rounded-lg hover:bg-opacity-80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-bold text-sm sm:text-base flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="hidden sm:inline">Export PDF</span>
                      <span className="sm:hidden">Export</span>
                    </>
                  )}
                </button>
                {userTier === 'free' && (
                  <div className="hidden sm:block">
                    <PoweredByBadge />
                  </div>
                )}
              </div>
            </div>
          {/* Export Error Message */}
          {exportError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{exportError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Aggregation Controls - Only show if time-series data exists */}
      {hasTimeSeriesData && (
        <div className="bg-background-dark border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <AggregationControls
              aggregationLevel={aggregationLevel}
              comparisonType={comparisonType}
              onAggregationChange={setAggregationLevel}
              onComparisonChange={setComparisonType}
              disabled={isExporting}
            />
            {comparisonType !== 'none' && (
              <div className="mt-4">
                <ComparisonOverlay
                  percentageChange={0}
                  comparisonType={comparisonType}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insights Panel - Sticky on desktop */}
      {insights.length > 0 && showInsights && (
        <div className="bg-background-dark border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <InsightPanel
              insights={insights}
              onChartClick={handleChartJump}
              className="transition-all duration-300"
            />
          </div>
        </div>
      )}

      {/* Scrollytelling Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {sections.map((section) => {
          const chart = charts[section.chartIndex];
          const isVisible = visibleSections.has(section.id);

          return (
            <section
              key={section.id}
              data-section-id={section.id}
              ref={(el) => {
                if (el) sectionsRef.current.set(section.id, el);
              }}
              className="scroll-mt-20 mb-24"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
                {/* Narrative Section */}
                <div
                  className={`transition-all duration-700 ${isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                    }`}
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                    {section.title}
                  </h2>
                  <div className="prose prose-base sm:prose-lg max-w-none text-[#D4D4D4] leading-relaxed">
                    {section.content.split('\n').map((paragraph) => (
                      <p key={paragraph} className="mb-3 sm:mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Chart Section */}
                {chart && (
                  <div
                    className={`transition-all duration-700 delay-300 ${isVisible
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-8'
                      }`}
                  >
                    <div
                      ref={(el) => {
                        if (el) chartRefs.current.set(chart.chartId, el);
                      }}
                      className="bg-[#0A0A0A] border border-secondary/50 rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-24 transition-all duration-300"
                      data-chart-id={chart.chartId}
                      tabIndex={0}
                      role="figure"
                      aria-label={`Chart: ${chart.title}`}
                    >
                      {renderChart(chart)}
                      {/* Chart Insight Badge */}
                      {chart.insights && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-start gap-2">
                            <svg
                              className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm text-gray-300">{chart.insights.primary}</p>
                              {chart.insights.secondary && (
                                <p className="text-xs text-gray-400 mt-1">{chart.insights.secondary}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}

        {/* Additional Charts */}
        {charts.length > 3 && (
          <section className="mt-16 sm:mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">
              Additional Insights
            </h2>
            <div 
              className="grid gap-6 sm:gap-8"
              style={{
                gridTemplateColumns: `repeat(${responsiveConfig.layout.columns}, minmax(0, 1fr))`,
              }}
            >
              {charts.slice(3).map((chart) => (
                <div
                  key={chart.chartId}
                  ref={(el) => {
                    if (el) chartRefs.current.set(chart.chartId, el);
                  }}
                  className="bg-[#0A0A0A] border border-secondary/50 rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300"
                  data-chart-id={chart.chartId}
                  tabIndex={0}
                  role="figure"
                  aria-label={`Chart: ${chart.title}`}
                >
                  {renderChart(chart)}
                  {/* Chart Insight Badge */}
                  {chart.insights && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm text-gray-300">{chart.insights.primary}</p>
                          {chart.insights.secondary && (
                            <p className="text-xs text-gray-400 mt-1">{chart.insights.secondary}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer with Badge for Free Tier */}
      {userTier === 'free' && (
        <div className="bg-[#0A0A0A] border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <PoweredByBadge />
          </div>
        </div>
      )}

      {/* Keyboard Navigation Hints - Visible on focus */}
      <div className="fixed bottom-4 right-4 bg-[#0A0A0A] border border-white/20 rounded-lg p-3 text-xs text-gray-400 opacity-0 focus-within:opacity-100 hover:opacity-100 transition-opacity z-30">
        <p className="font-semibold text-white mb-2">Keyboard Shortcuts</p>
        <ul className="space-y-1">
          <li><kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑↓</kbd> Navigate charts</li>
          <li><kbd className="px-1.5 py-0.5 bg-white/10 rounded">I</kbd> Toggle insights</li>
          <li><kbd className="px-1.5 py-0.5 bg-white/10 rounded">H</kbd> Go to top</li>
        </ul>
      </div>
    </div>
    </CrossChartHighlightProvider>
  );
}
