'use client';

import type { ChartData } from '@/lib/models/Story';
import { useEffect, useRef, useState } from 'react';
import { LineChart, BarChart, ScatterPlot, PieChart } from './charts';
import PoweredByBadge from './PoweredByBadge';
import { usePDFExport } from '@/lib/hooks/usePDFExport';

interface Chart {
  chartId: string;
  type: 'line' | 'bar' | 'scatter' | 'pie';
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
}

export default function StoryViewer({
  narratives,
  charts,
  userTier,
  storyTitle,
  storyId,
}: StoryViewerProps) {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  
  // PDF Export functionality
  const { isExporting, error: exportError, exportPDF } = usePDFExport({
    storyId,
    storyTitle: storyTitle || 'Data Story',
  });

  const handleExportPDF = async () => {
    if (!containerRef.current) return;
    await exportPDF(containerRef.current);
  };

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

  const renderChart = (chart: Chart) => {
    switch (chart.type) {
      case 'line':
        return (
          <LineChart data={chart.data} title={chart.title} config={chart.config} />
        );
      case 'bar':
        return (
          <BarChart data={chart.data} title={chart.title} config={chart.config} />
        );
      case 'scatter':
        return (
          <ScatterPlot
            data={chart.data}
            title={chart.title}
            config={chart.config}
          />
        );
      case 'pie':
        return (
          <PieChart data={chart.data} title={chart.title} config={chart.config} />
        );
      default:
        return null;
    }
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
    <div ref={containerRef} className="relative min-h-screen bg-gray-50">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Story Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {storyTitle || 'Data Story'}
            </h1>
            <div className="flex items-center gap-4">
              {/* Export PDF Button */}
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="min-h-[44px] px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base flex items-center gap-2"
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
                    <span>Export PDF</span>
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
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{exportError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Scrollytelling Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {sections.map((section, index) => {
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
                  className={`transition-all duration-700 ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    {section.title}
                  </h2>
                  <div className="prose prose-base sm:prose-lg max-w-none text-gray-700 leading-relaxed">
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
                    className={`transition-all duration-700 delay-300 ${
                      isVisible
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 translate-x-8'
                    }`}
                  >
                    <div 
                      className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:sticky lg:top-24"
                      data-chart-id={chart.chartId}
                    >
                      {renderChart(chart)}
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
              Additional Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {charts.slice(3).map((chart) => (
                <div
                  key={chart.chartId}
                  className="bg-white rounded-lg shadow-lg p-4 sm:p-6"
                  data-chart-id={chart.chartId}
                >
                  {renderChart(chart)}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer with Badge for Free Tier */}
      {userTier === 'free' && (
        <div className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <PoweredByBadge />
          </div>
        </div>
      )}
    </div>
  );
}
