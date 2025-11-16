import { Suspense } from 'react';
import EmbeddableChartViewer from '@/components/EmbeddableChartViewer';

interface EmbedPageProps {
  params: {
    storyId: string;
    chartId: string;
  };
  searchParams: {
    theme?: 'light' | 'dark';
    interactive?: string;
    showTitle?: string;
    showLegend?: string;
  };
}

export default function EmbedChartPage({
  params,
  searchParams,
}: EmbedPageProps) {
  const { storyId, chartId } = params;
  const theme = searchParams.theme || 'light';
  const interactive = searchParams.interactive !== 'false';
  const showTitle = searchParams.showTitle !== 'false';
  const showLegend = searchParams.showLegend !== 'false';

  return (
    <div className="w-full h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <EmbeddableChartViewer
          chartId={chartId}
          storyId={storyId}
          theme={theme}
          interactive={interactive}
          showTitle={showTitle}
          showLegend={showLegend}
        />
      </Suspense>
    </div>
  );
}

// Metadata for the embed page
export const metadata = {
  title: 'DataStory Chart Embed',
  description: 'Embedded chart from DataStory',
};
