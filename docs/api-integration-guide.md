# API Integration Guide

## Quick Start

This guide shows how to integrate the enhanced DataStory API endpoints into your application.

## Installation

No additional dependencies required. All endpoints use standard fetch API.

## Authentication

All protected endpoints require a JWT token:

```typescript
const token = localStorage.getItem('authToken');

const response = await fetch('/api/stories/123', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## Common Patterns

### 1. Fetching Story with Enhanced Statistics

```typescript
async function getStoryWithStats(storyId: string) {
  const response = await fetch(`/api/stories/${storyId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch story');
  }

  const story = await response.json();
  
  // Access enhanced statistics
  console.log(story.statistics.insights); // AI-generated insights
  console.log(story.statistics.correlationMatrix); // Correlation data
  console.log(story.statistics.advancedTrends); // Seasonal patterns, etc.
  
  return story;
}
```

### 2. Exporting Charts

```typescript
async function exportChart(
  storyId: string,
  chartId: string,
  format: 'png' | 'svg' | 'csv' | 'json'
) {
  const response = await fetch(
    `/api/stories/${storyId}/charts/${chartId}/export`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format,
        width: 1200,
        height: 800,
        dpi: 150,
      }),
    }
  );

  // Check rate limit headers
  const remaining = response.headers.get('X-RateLimit-Remaining');
  console.log(`Exports remaining: ${remaining}`);

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
  }

  const result = await response.json();
  
  if (format === 'csv') {
    // Download CSV
    const blob = new Blob([result.data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-${chartId}.csv`;
    a.click();
  }
  
  return result;
}
```

### 3. Generating Share Links

```typescript
async function shareStory(storyId: string) {
  const response = await fetch(`/api/stories/${storyId}/share`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();
  
  // Copy to clipboard
  await navigator.clipboard.writeText(result.shareUrl);
  
  return result.shareUrl;
}

async function revokeShareLink(storyId: string) {
  const response = await fetch(`/api/stories/${storyId}/share`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.json();
}
```

### 4. Regenerating Charts

```typescript
async function regenerateCharts(storyId: string, config: {
  chartTypes?: string[];
  aggregationLevel?: string;
  statisticalOverlays?: {
    trendLines?: boolean;
    movingAverages?: boolean;
    outliers?: boolean;
  };
}) {
  const response = await fetch(`/api/stories/${storyId}/regenerate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  const result = await response.json();
  
  // Updated charts available
  console.log(`Generated ${result.charts.length} charts`);
  
  return result;
}

// Example usage
await regenerateCharts('story-123', {
  chartTypes: ['line', 'bar', 'heatmap'],
  aggregationLevel: 'monthly',
  statisticalOverlays: {
    trendLines: true,
    movingAverages: true,
    outliers: true,
  },
});
```

### 5. Cached Statistics

```typescript
async function getStatistics(storyId: string, forceRefresh = false) {
  if (forceRefresh) {
    // Force recomputation
    const response = await fetch(
      `/api/stories/${storyId}/statistics/recompute`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.json();
  }

  // Get cached statistics
  const response = await fetch(`/api/stories/${storyId}/statistics`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const stats = await response.json();
  
  if (stats.cached) {
    console.log('Served from cache');
  }
  
  return stats;
}
```

## React Hooks

### useStoryExport Hook

```typescript
import { useState } from 'react';

export function useStoryExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportChart = async (
    storyId: string,
    chartId: string,
    format: 'png' | 'svg' | 'csv' | 'json'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `/api/stories/${storyId}/charts/${chartId}/export`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ format }),
        }
      );

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`Rate limited. Try again in ${retryAfter} seconds`);
      }

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { exportChart, loading, error };
}
```

### useShareLink Hook

```typescript
import { useState, useEffect } from 'react';

export function useShareLink(storyId: string) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShareStatus();
  }, [storyId]);

  const fetchShareStatus = async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/stories/${storyId}/share`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    setIsShared(data.isShared);
    setShareUrl(data.shareUrl);
  };

  const generateShareLink = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/stories/${storyId}/share`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setShareUrl(data.shareUrl);
      setIsShared(true);
      return data.shareUrl;
    } finally {
      setLoading(false);
    }
  };

  const revokeShareLink = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/stories/${storyId}/share`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setShareUrl(null);
      setIsShared(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    shareUrl,
    isShared,
    loading,
    generateShareLink,
    revokeShareLink,
  };
}
```

## Error Handling

### Standard Error Response

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    retryable?: boolean;
    details?: string;
  };
}

async function handleApiCall<T>(
  apiCall: () => Promise<Response>
): Promise<T> {
  try {
    const response = await apiCall();

    if (!response.ok) {
      const error: ApiError = await response.json();
      
      if (error.error.code === 'RATE_LIMIT_EXCEEDED') {
        // Handle rate limiting
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`Rate limited. Retry in ${retryAfter}s`);
      }

      if (error.error.retryable) {
        // Implement retry logic
        console.log('Retryable error, implementing backoff...');
      }

      throw new Error(error.error.message);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

## Rate Limiting Best Practices

### Client-Side Rate Limiting

```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerMinute = 10;
  private interval = 60000; // 1 minute
  private requestCount = 0;
  private resetTime = Date.now() + this.interval;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      // Reset counter if interval passed
      if (Date.now() > this.resetTime) {
        this.requestCount = 0;
        this.resetTime = Date.now() + this.interval;
      }

      // Check if we can make a request
      if (this.requestCount >= this.requestsPerMinute) {
        const waitTime = this.resetTime - Date.now();
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.resetTime = Date.now() + this.interval;
      }

      const fn = this.queue.shift();
      if (fn) {
        this.requestCount++;
        await fn();
      }
    }

    this.processing = false;
  }
}

// Usage
const exportLimiter = new RateLimiter();

async function exportWithRateLimit(storyId: string, chartId: string) {
  return exportLimiter.execute(() =>
    fetch(`/api/stories/${storyId}/charts/${chartId}/export`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format: 'csv' }),
    })
  );
}
```

## Caching Strategy

### Client-Side Cache

```typescript
class ApiCache {
  private cache = new Map<string, { data: any; expiresAt: number }>();

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 60000
  ): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && Date.now() < cached.expiresAt) {
      return cached.data as T;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });

    return data;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

// Usage
const apiCache = new ApiCache();

async function getStoryStats(storyId: string) {
  return apiCache.get(
    `story-stats-${storyId}`,
    async () => {
      const response = await fetch(`/api/stories/${storyId}/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.json();
    },
    60000 // 1 minute client-side cache
  );
}
```

## Testing

### Example Test

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Story Export', () => {
  it('should export chart as CSV', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        format: 'csv',
        data: 'col1,col2\nval1,val2',
      }),
      headers: new Headers({
        'X-RateLimit-Remaining': '9',
      }),
    });

    global.fetch = mockFetch;

    const result = await exportChart('story-123', 'chart-456', 'csv');

    expect(result.success).toBe(true);
    expect(result.format).toBe('csv');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/stories/story-123/charts/chart-456/export',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });
});
```

## Production Considerations

1. **Error Boundaries**: Wrap API calls in error boundaries
2. **Retry Logic**: Implement exponential backoff for retryable errors
3. **Loading States**: Show loading indicators during API calls
4. **Optimistic Updates**: Update UI optimistically, rollback on error
5. **Request Cancellation**: Cancel pending requests on component unmount
6. **Monitoring**: Track API errors and performance metrics

## Support

For issues or questions:
- Check API documentation: `/docs/api-endpoints.md`
- Review error codes and messages
- Check rate limit headers
- Verify authentication token validity
