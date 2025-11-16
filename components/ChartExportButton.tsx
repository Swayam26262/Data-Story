'use client';

import { useState, useRef } from 'react';
import ChartExportDialog from './ChartExportDialog';
import type { ChartExportData } from '@/lib/export/types';

interface ChartExportButtonProps {
  chartData: ChartExportData;
  storyId: string;
  userTier?: 'free' | 'professional' | 'business' | 'enterprise';
  className?: string;
}

export default function ChartExportButton({
  chartData,
  storyId,
  userTier = 'free',
  className = '',
}: ChartExportButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const chartElementRef = useRef<HTMLElement | null>(null);

  const handleOpenDialog = () => {
    // Find the chart element by data-chart-id attribute
    const element = document.querySelector(
      `[data-chart-id="${chartData.chartId}"]`
    ) as HTMLElement;
    chartElementRef.current = element;
    setIsDialogOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpenDialog}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all ${className}`}
        title="Export chart"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span className="text-sm font-medium">Export</span>
      </button>

      <ChartExportDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        chartElement={chartElementRef.current}
        chartData={chartData}
        storyId={storyId}
        userTier={userTier}
      />
    </>
  );
}
