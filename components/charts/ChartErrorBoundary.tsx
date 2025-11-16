'use client';

/**
 * Chart Error Boundary Component
 * Provides graceful error handling for chart rendering failures
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ChartErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  chartId?: string;
  chartType?: string;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary for Chart Components
 * Catches rendering errors and displays fallback UI
 */
export class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ChartErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Chart Error Boundary caught an error:', error, errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to monitoring service (e.g., Sentry, LogRocket)
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // Placeholder for error logging service integration
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      chartId: this.props.chartId,
      chartType: this.props.chartType,
      timestamp: new Date().toISOString(),
    };

    // In production, send to your monitoring service
    console.error('Chart error logged:', errorData);
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          className="chart-error-boundary"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            minHeight: '300px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              textAlign: 'center',
            }}
          >
            <svg
              style={{
                width: '48px',
                height: '48px',
                marginBottom: '1rem',
                color: '#dc2626',
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>

            <h3
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#991b1b',
                marginBottom: '0.5rem',
              }}
            >
              Chart Rendering Error
            </h3>

            <p
              style={{
                fontSize: '14px',
                color: '#7f1d1d',
                marginBottom: '1rem',
              }}
            >
              {this.state.error?.message || 'An error occurred while rendering this chart.'}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#fff',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  textAlign: 'left',
                  fontSize: '12px',
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                  }}
                >
                  Error Details (Development Only)
                </summary>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '11px',
                    color: '#7f1d1d',
                  }}
                >
                  {this.state.error?.stack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a chart component with error boundary
 */
export function withChartErrorBoundary<P extends object>(
  ChartComponent: React.ComponentType<P>,
  chartType?: string
): React.FC<P> {
  return function ChartWithErrorBoundary(props: P) {
    return (
      <ChartErrorBoundary chartType={chartType}>
        <ChartComponent {...props} />
      </ChartErrorBoundary>
    );
  };
}

export default ChartErrorBoundary;
