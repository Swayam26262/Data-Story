'use client';

import { useState, useRef } from 'react';
import { exportManager } from '@/lib/export';
import type {
  PNGExportOptions,
  SVGExportOptions,
  CSVExportOptions,
  JSONExportOptions,
  EmbedOptions,
  ChartExportData,
} from '@/lib/export/types';

interface ChartExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chartElement: HTMLElement | null;
  chartData: ChartExportData;
  storyId: string;
  userTier: 'free' | 'professional' | 'business' | 'enterprise';
}

type ExportFormat = 'png' | 'svg' | 'csv' | 'json' | 'embed';

export default function ChartExportDialog({
  isOpen,
  onClose,
  chartElement,
  chartData,
  storyId,
  userTier,
}: ChartExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // PNG options
  const [pngDPI, setPngDPI] = useState(300);
  const [pngWidth, setPngWidth] = useState(1200);
  const [pngHeight, setPngHeight] = useState(800);
  const [pngTransparent, setPngTransparent] = useState(false);

  // SVG options
  const [svgWidth, setSvgWidth] = useState(1200);
  const [svgHeight, setSvgHeight] = useState(800);
  const [svgEmbedFonts, setSvgEmbedFonts] = useState(true);

  // CSV/JSON options
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [jsonPretty, setJsonPretty] = useState(true);

  // Embed options
  const [embedType, setEmbedType] = useState<'iframe' | 'script'>('iframe');
  const [embedTheme, setEmbedTheme] = useState<'light' | 'dark'>('light');
  const [embedInteractive, setEmbedInteractive] = useState(true);
  const embedCodeRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus({ type: null, message: '' });

    try {
      let result;

      switch (selectedFormat) {
        case 'png':
          if (!chartElement) throw new Error('Chart element not found');
          const pngOptions: PNGExportOptions = {
            width: pngWidth,
            height: pngHeight,
            dpi: pngDPI,
            transparent: pngTransparent,
            includeWatermark: userTier === 'free',
          };
          result = await exportManager.exportPNG(chartElement, pngOptions);
          break;

        case 'svg':
          if (!chartElement) throw new Error('Chart element not found');
          const svgOptions: SVGExportOptions = {
            width: svgWidth,
            height: svgHeight,
            embedFonts: svgEmbedFonts,
            includeCSS: true,
          };
          result = await exportManager.exportSVG(chartElement, svgOptions);
          break;

        case 'csv':
          const csvOptions: CSVExportOptions = {
            includeStatistics,
          };
          result = exportManager.exportCSV(chartData, csvOptions);
          break;

        case 'json':
          const jsonOptions: JSONExportOptions = {
            includeStatistics,
            pretty: jsonPretty,
            includeMetadata: true,
          };
          result = exportManager.exportJSON(chartData, jsonOptions);
          break;

        case 'embed':
          // Embed code is handled separately
          setExportStatus({
            type: 'success',
            message: 'Embed code generated successfully',
          });
          setIsExporting(false);
          return;

        default:
          throw new Error('Invalid export format');
      }

      if (result.success && result.data) {
        exportManager.download(result.data as Blob, result.filename!);
        setExportStatus({
          type: 'success',
          message: `Chart exported successfully as ${selectedFormat.toUpperCase()}`,
        });
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Export failed',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyEmbedCode = async () => {
    const embedOptions: EmbedOptions = {
      theme: embedTheme,
      interactive: embedInteractive,
      showTitle: true,
      showLegend: true,
    };

    const embedCode =
      embedType === 'iframe'
        ? exportManager.generateIframeEmbed(
            chartData.chartId,
            storyId,
            embedOptions
          )
        : exportManager.generateScriptEmbed(
            chartData.chartId,
            storyId,
            embedOptions
          );

    const success = await exportManager.copyToClipboard(embedCode);
    
    if (success) {
      setExportStatus({
        type: 'success',
        message: 'Embed code copied to clipboard',
      });
    } else {
      setExportStatus({
        type: 'error',
        message: 'Failed to copy to clipboard',
      });
    }
  };

  const getEmbedCode = () => {
    const embedOptions: EmbedOptions = {
      theme: embedTheme,
      interactive: embedInteractive,
      showTitle: true,
      showLegend: true,
    };

    return embedType === 'iframe'
      ? exportManager.generateIframeEmbed(
          chartData.chartId,
          storyId,
          embedOptions
        )
      : exportManager.generateScriptEmbed(
          chartData.chartId,
          storyId,
          embedOptions
        );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Export Chart</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['png', 'svg', 'csv', 'json', 'embed'] as ExportFormat[]).map(
                (format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedFormat === format
                        ? 'bg-primary text-background-dark'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Format-specific options */}
          <div className="space-y-4 mb-6">
            {selectedFormat === 'png' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={pngWidth}
                      onChange={(e) => setPngWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={pngHeight}
                      onChange={(e) => setPngHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    DPI (150-300)
                  </label>
                  <input
                    type="range"
                    min="150"
                    max="300"
                    step="50"
                    value={pngDPI}
                    onChange={(e) => setPngDPI(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-white/60 mt-1">{pngDPI} DPI</div>
                </div>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={pngTransparent}
                    onChange={(e) => setPngTransparent(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Transparent background</span>
                </label>
                {userTier === 'free' && (
                  <div className="text-sm text-yellow-400">
                    ⓘ Free tier exports include a watermark
                  </div>
                )}
              </>
            )}

            {selectedFormat === 'svg' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={svgWidth}
                      onChange={(e) => setSvgWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={svgHeight}
                      onChange={(e) => setSvgHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={svgEmbedFonts}
                    onChange={(e) => setSvgEmbedFonts(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Embed fonts</span>
                </label>
              </>
            )}

            {(selectedFormat === 'csv' || selectedFormat === 'json') && (
              <>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={includeStatistics}
                    onChange={(e) => setIncludeStatistics(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Include statistics</span>
                </label>
                {selectedFormat === 'json' && (
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      checked={jsonPretty}
                      onChange={(e) => setJsonPretty(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Pretty print (formatted)</span>
                  </label>
                )}
              </>
            )}

            {selectedFormat === 'embed' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Embed Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEmbedType('iframe')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        embedType === 'iframe'
                          ? 'bg-primary text-background-dark'
                          : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      iFrame
                    </button>
                    <button
                      onClick={() => setEmbedType('script')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        embedType === 'script'
                          ? 'bg-primary text-background-dark'
                          : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      Script
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Theme
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEmbedTheme('light')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        embedTheme === 'light'
                          ? 'bg-primary text-background-dark'
                          : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setEmbedTheme('dark')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        embedTheme === 'dark'
                          ? 'bg-primary text-background-dark'
                          : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={embedInteractive}
                    onChange={(e) => setEmbedInteractive(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Enable interactions</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Embed Code
                  </label>
                  <textarea
                    ref={embedCodeRef}
                    value={getEmbedCode()}
                    readOnly
                    rows={8}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-xs"
                  />
                </div>
              </>
            )}
          </div>

          {/* Status Message */}
          {exportStatus.type && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                exportStatus.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/50'
                  : 'bg-red-500/10 text-red-400 border border-red-500/50'
              }`}
            >
              {exportStatus.message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {selectedFormat === 'embed' ? (
              <button
                onClick={handleCopyEmbedCode}
                className="flex-1 px-6 py-3 bg-primary text-background-dark rounded-lg hover:bg-opacity-80 transition-all font-bold"
              >
                Copy Embed Code
              </button>
            ) : (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 px-6 py-3 bg-primary text-background-dark rounded-lg hover:bg-opacity-80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-bold"
              >
                {isExporting ? 'Exporting...' : 'Export'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
