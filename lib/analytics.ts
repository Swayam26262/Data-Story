/**
 * Analytics and tracking utilities
 * Integrates with Vercel Analytics and custom event tracking
 */

import { logger } from './logger';

/**
 * Analytics event types
 */
export enum AnalyticsEvent {
  // User events
  USER_REGISTERED = 'user_registered',
  USER_LOGGED_IN = 'user_logged_in',
  USER_LOGGED_OUT = 'user_logged_out',

  // Story events
  STORY_UPLOAD_STARTED = 'story_upload_started',
  STORY_UPLOAD_COMPLETED = 'story_upload_completed',
  STORY_UPLOAD_FAILED = 'story_upload_failed',
  STORY_GENERATION_STARTED = 'story_generation_started',
  STORY_GENERATION_COMPLETED = 'story_generation_completed',
  STORY_GENERATION_FAILED = 'story_generation_failed',
  STORY_VIEWED = 'story_viewed',
  STORY_EXPORTED = 'story_exported',
  STORY_DELETED = 'story_deleted',

  // Tier events
  TIER_LIMIT_REACHED = 'tier_limit_reached',
  UPGRADE_MODAL_VIEWED = 'upgrade_modal_viewed',
  UPGRADE_CLICKED = 'upgrade_clicked',

  // Error events
  ERROR_OCCURRED = 'error_occurred',
  API_ERROR = 'api_error',
}

/**
 * Track analytics event
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>
) {
  try {
    // Log event for debugging
    logger.info(`Analytics event: ${event}`, properties);

    // In production, send to analytics service
    // For Vercel Analytics, events are automatically tracked via Web Vitals
    // For custom events, you can use Vercel Analytics API or third-party service

    // Example: Send to Vercel Analytics (if available)
    if (typeof window !== 'undefined' && (window as Window & { va?: (action: string, event: string, properties?: Record<string, unknown>) => void }).va) {
      (window as Window & { va: (action: string, event: string, properties?: Record<string, unknown>) => void }).va('track', event, properties);
    }

    // Example: Send to custom analytics endpoint
    if (typeof window !== 'undefined') {
      // Client-side tracking
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, properties, timestamp: new Date().toISOString() }),
      }).catch((error) => {
        // Silently fail - don't block user experience
        console.error('Analytics tracking failed:', error);
      });
    }
  } catch (error) {
    // Never let analytics errors affect user experience
    console.error('Analytics error:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView(page: string, properties?: Record<string, unknown>) {
  trackEvent(AnalyticsEvent.STORY_VIEWED, {
    page,
    ...properties,
  });
}

/**
 * Track user action
 */
export function trackUserAction(
  action: string,
  properties?: Record<string, unknown>
) {
  trackEvent(action as AnalyticsEvent, properties);
}

/**
 * Track error
 */
export function trackError(
  error: Error,
  context?: Record<string, unknown>
) {
  trackEvent(AnalyticsEvent.ERROR_OCCURRED, {
    errorMessage: error.message,
    errorStack: error.stack,
    ...context,
  });
}

/**
 * Track API call
 */
export function trackApiCall(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number
) {
  if (statusCode >= 400) {
    trackEvent(AnalyticsEvent.API_ERROR, {
      endpoint,
      method,
      statusCode,
      duration,
    });
  }
}

/**
 * Track story generation metrics
 */
export function trackStoryMetrics(metrics: {
  userId: string;
  storyId: string;
  datasetRows: number;
  chartsGenerated: number;
  processingTime: number;
  success: boolean;
}) {
  const event = metrics.success
    ? AnalyticsEvent.STORY_GENERATION_COMPLETED
    : AnalyticsEvent.STORY_GENERATION_FAILED;

  trackEvent(event, metrics);
}

/**
 * Track tier limit reached
 */
export function trackTierLimit(
  userId: string,
  tier: string,
  limitType: 'stories' | 'rows'
) {
  trackEvent(AnalyticsEvent.TIER_LIMIT_REACHED, {
    userId,
    tier,
    limitType,
  });
}

/**
 * Initialize analytics
 * Call this on app startup
 */
export function initializeAnalytics() {
  if (typeof window !== 'undefined') {
    logger.info('Analytics initialized');

    // Track initial page load
    trackPageView(window.location.pathname);

    // Track navigation
    if ('navigation' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      logger.info('Page load performance', {
        domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
        loadComplete: navTiming.loadEventEnd - navTiming.loadEventStart,
        domInteractive: navTiming.domInteractive - navTiming.fetchStart,
      });
    }
  }
}
