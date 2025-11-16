'use client';

import React, { useState } from 'react';
import { useChartConfig } from '@/lib/contexts/ChartConfigContext';
import { themes } from '@/lib/theme/config';
import type { ThemeName } from '@/lib/theme/types';

interface ChartConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  chartId?: string;
}

/**
 * Chart Configuration Panel
 * Provides UI for customizing chart appearance and behavior
 */
export function ChartConfigPanel({ isOpen, onClose, chartId }: ChartConfigPanelProps) {
  const {
    config,
    updateConfig,
    updateStatisticalOverlay,
    updateInteraction,
    addAnnotation,
    removeAnnotation,
    resetConfig,
    saveConfig,
  } = useChartConfig();

  const [activeTab, setActiveTab] = useState<'theme' | 'statistics' | 'interactions' | 'annotations'>('theme');
  const [annotationForm, setAnnotationForm] = useState({
    type: 'text' as 'text' | 'line' | 'region',
    x: '',
    y: '',
    content: '',
  });

  if (!isOpen) return null;

  const handleAddAnnotation = () => {
    if (!annotationForm.content || !annotationForm.x || !annotationForm.y) {
      return;
    }

    addAnnotation({
      id: `annotation-${Date.now()}`,
      type: annotationForm.type,
      chartId,
      position: {
        x: annotationForm.x,
        y: annotationForm.y,
      },
      content: annotationForm.content,
    });

    // Reset form
    setAnnotationForm({
      type: 'text',
      x: '',
      y: '',
      content: '',
    });
  };

  const handleSaveAndClose = async () => {
    await saveConfig();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0A0A0A] border-l border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Chart Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6">
          {[
            { id: 'theme', label: 'Theme', icon: '🎨' },
            { id: 'statistics', label: 'Statistics', icon: '📊' },
            { id: 'interactions', label: 'Interactions', icon: '🖱️' },
            { id: 'annotations', label: 'Annotations', icon: '📝' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Color Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(themes).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => updateConfig({ theme: key as ThemeName })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        config.theme === key
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex gap-1 mb-2">
                        {theme.colors.categorical.slice(0, 4).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-sm font-medium text-white">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Color Palette Type
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'categorical', label: 'Categorical', desc: 'For distinct categories' },
                    { value: 'sequential', label: 'Sequential', desc: 'For ordered data' },
                    { value: 'diverging', label: 'Diverging', desc: 'For data with midpoint' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateConfig({ colorPalette: option.value as any })}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        config.colorPalette === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className="text-sm font-medium text-white">{option.label}</p>
                      <p className="text-xs text-gray-400 mt-1">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                Enable statistical overlays to enhance your charts with analytical insights
              </p>
              
              {[
                { key: 'trendLine', label: 'Trend Line', desc: 'Show linear regression with R² value' },
                { key: 'movingAverage', label: 'Moving Average', desc: 'Display 7, 30, and 90-day averages' },
                { key: 'outliers', label: 'Outlier Detection', desc: 'Highlight statistical outliers' },
                { key: 'confidenceInterval', label: 'Confidence Interval', desc: 'Show 95% confidence bands' },
              ].map((option) => (
                <label
                  key={option.key}
                  className="flex items-start gap-3 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={config.statisticalOverlays[option.key as keyof typeof config.statisticalOverlays]}
                    onChange={(e) =>
                      updateStatisticalOverlay(
                        option.key as keyof typeof config.statisticalOverlays,
                        e.target.checked
                      )
                    }
                    className="mt-1 w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{option.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Interactions Tab */}
          {activeTab === 'interactions' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                Configure interactive features for exploring your data
              </p>
              
              {[
                { key: 'zoom', label: 'Zoom', desc: 'Enable zoom controls' },
                { key: 'pan', label: 'Pan', desc: 'Allow panning across data' },
                { key: 'brush', label: 'Brush Selection', desc: 'Select data ranges' },
                { key: 'crosshair', label: 'Crosshair', desc: 'Show crosshair on hover' },
                { key: 'tooltipEnhanced', label: 'Enhanced Tooltips', desc: 'Show detailed statistics' },
                { key: 'legendInteractive', label: 'Interactive Legend', desc: 'Click to toggle series' },
              ].map((option) => (
                <label
                  key={option.key}
                  className="flex items-start gap-3 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={config.interactions[option.key as keyof typeof config.interactions]}
                    onChange={(e) =>
                      updateInteraction(
                        option.key as keyof typeof config.interactions,
                        e.target.checked
                      )
                    }
                    className="mt-1 w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{option.label}</p>
                    <p className="text-xs text-gray-400 mt-1">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Annotations Tab */}
          {activeTab === 'annotations' && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={config.annotations.enabled}
                    onChange={(e) =>
                      updateConfig({
                        annotations: { ...config.annotations, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <span className="text-sm font-medium text-white">Enable Annotations</span>
                </label>
              </div>

              {config.annotations.enabled && (
                <>
                  {/* Add Annotation Form */}
                  <div className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3">
                    <h3 className="text-sm font-medium text-white">Add Annotation</h3>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Type</label>
                      <select
                        value={annotationForm.type}
                        onChange={(e) =>
                          setAnnotationForm({ ...annotationForm, type: e.target.value as any })
                        }
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="text">Text</option>
                        <option value="line">Reference Line</option>
                        <option value="region">Region</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">X Position</label>
                        <input
                          type="text"
                          value={annotationForm.x}
                          onChange={(e) =>
                            setAnnotationForm({ ...annotationForm, x: e.target.value })
                          }
                          placeholder="e.g., 2024-01"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Y Position</label>
                        <input
                          type="text"
                          value={annotationForm.y}
                          onChange={(e) =>
                            setAnnotationForm({ ...annotationForm, y: e.target.value })
                          }
                          placeholder="e.g., 100"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Content</label>
                      <input
                        type="text"
                        value={annotationForm.content}
                        onChange={(e) =>
                          setAnnotationForm({ ...annotationForm, content: e.target.value })
                        }
                        placeholder="Annotation text"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <button
                      onClick={handleAddAnnotation}
                      className="w-full px-4 py-2 bg-primary text-background-dark rounded-lg hover:bg-opacity-80 transition-colors text-sm font-medium"
                    >
                      Add Annotation
                    </button>
                  </div>

                  {/* Existing Annotations */}
                  {config.annotations.items.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-white">Existing Annotations</h3>
                      {config.annotations.items
                        .filter((item) => !chartId || item.chartId === chartId)
                        .map((annotation) => (
                          <div
                            key={annotation.id}
                            className="p-3 rounded-lg border border-white/10 bg-white/5 flex items-start justify-between"
                          >
                            <div className="flex-1">
                              <p className="text-sm text-white">{annotation.content}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {annotation.type} at ({annotation.position.x}, {annotation.position.y})
                              </p>
                            </div>
                            <button
                              onClick={() => removeAnnotation(annotation.id)}
                              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                              aria-label="Remove annotation"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={handleSaveAndClose}
              className="flex-1 px-4 py-3 bg-primary text-background-dark rounded-lg hover:bg-opacity-80 transition-colors font-medium"
            >
              Save & Close
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
          <button
            onClick={resetConfig}
            className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
