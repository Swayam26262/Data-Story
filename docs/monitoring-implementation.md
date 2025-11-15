# Monitoring and Logging Implementation

## Overview

This document describes the comprehensive monitoring and logging infrastructure implemented for DataStory AI. The system provides observability across all services including the Next.js frontend, MongoDB Atlas database, Cloudinary storage, and Python analysis service.

## Components

### 1. Structured Logging (`lib/logger.ts`)

Enhanced logger with structured JSON output for better log aggregation and analysis.

**Features:**
- Structured JSON logging with timestamps
- Automatic sensitive data redaction (passwords, tokens, API keys)
- Log levels: DEBUG, INFO, WARN, ERROR, CRITICAL
- Request/response logging with duration tracking
- Context-aware logging with userId and requestId

**Usage:**
```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId: '123', email: 'user@example.com' });
logger.error('Database query failed', error, { query: 'findUser' });
logger.critical('Service unavailable', error, { service: 'python-analysis' });
```

### 2. Performance Monitoring (`lib/monitoring.ts`)

Tracks application metrics, performance, and health across all services.

**Features:**
- Performance timers for operation duration tracking
- API endpoint performance monitoring
- Story generation metrics
- Authentication event tracking
- File upload metrics
- External service call tracking
- Comprehensive health checks

**Usage:**
```typescript
import { PerformanceTimer, trackStoryGeneration } from '@/lib/monitoring';

// Track operation duration
const timer = new PerformanceTimer('story_generation', { userId: '123' });
// ... perform operation
timer.end(true); // true = success

// Track story generation
trackStoryGeneration(userId, true, 45000, 500, 4);
```

### 3. MongoDB Monitoring (`lib/mongodb-monitoring.ts`)

Monitors MongoDB Atlas connection health, query performance, and database metrics.

**Features:**
- Connection status monitoring
- Query performance tracking
- Slow query detection (> 1 second)
- Connection pool usage monitoring
- Database size monitoring
- Collection statistics
- Automatic event listeners for connection events

**Metrics Tracked:**
- Connection status (connected/disconnected)
- Query duration by collection and operation
- Connection pool usage
- Database size
- Collection document counts
- Index counts

**Usage:**
```typescript
import { getMongoDBStats, trackMongoDBQuery } from '@/lib/mongodb-monitoring';

// Get current stats
const stats = await getMongoDBStats();

// Track query performance
const startTime = Date.now();
// ... execute query
trackMongoDBQuery('users', 'findOne', Date.now() - startTime, true);
```

### 4. Cloudinary Monitoring (`lib/cloudinary-monitoring.ts`)

Tracks Cloudinary storage usage, bandwidth, and API calls.

**Features:**
- Storage usage monitoring
- Bandwidth usage tracking
- Transformation quota monitoring
- Resource count tracking
- Automatic alerts for high usage (>80%)
- Upload/deletion tracking

**Metrics Tracked:**
- Storage usage (bytes and percentage)
- Bandwidth usage (bytes and percentage)
- Transformation count
- API request count
- Resource counts (images, videos, raw files)

**Usage:**
```typescript
import { getCloudinaryUsage, monitorCloudinaryQuota } from '@/lib/cloudinary-monitoring';

// Get current usage
const usage = await getCloudinaryUsage();

// Monitor quota and send alerts
await monitorCloudinaryQuota();
```

### 5. Analytics Tracking (`lib/analytics.ts`)

Client-side and server-side event tracking for user behavior and application metrics.

**Features:**
- User event tracking (registration, login, logout)
- Story lifecycle tracking (upload, generation, view, export, delete)
- Tier limit tracking
- Error tracking
- Page view tracking
- API call tracking

**Events Tracked:**
- User registration/login/logout
- Story upload/generation/view/export/delete
- Tier limits reached
- Upgrade modal views
- Errors and API failures

**Usage:**
```typescript
import { trackEvent, AnalyticsEvent } from '@/lib/analytics';

trackEvent(AnalyticsEvent.STORY_GENERATION_COMPLETED, {
  userId: '123',
  storyId: 'abc',
  processingTime: 45000,
});
```

## API Endpoints

### Health Check Endpoint

**Endpoint:** `GET /api/health`

Returns comprehensive health status for all services.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": {
      "status": "up",
      "latency": 45,
      "lastCheck": "2024-01-15T10:30:00.000Z"
    },
    "storage": {
      "status": "up",
      "latency": 12,
      "lastCheck": "2024-01-15T10:30:00.000Z"
    },
    "pythonService": {
      "status": "up",
      "latency": 234,
      "lastCheck": "2024-01-15T10:30:00.000Z"
    }
  },
  "metrics": {
    "uptime": 86400,
    "memoryUsage": 245.67
  }
}
```

### Monitoring Dashboard Endpoint

**Endpoint:** `GET /api/monitoring`

Returns detailed monitoring data (requires authentication).

**Response:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "mongodb": {
    "connection": {
      "connected": true,
      "collections": 5,
      "indexes": 12
    },
    "collections": {
      "users": { "count": 150, "size": 1024000 },
      "stories": { "count": 450, "size": 5120000 },
      "jobs": { "count": 500, "size": 2048000 }
    }
  },
  "cloudinary": {
    "usage": {
      "storage": { "used": 1024000000, "limit": 10240000000, "percentage": 10 },
      "bandwidth": { "used": 512000000, "limit": 5120000000, "percentage": 10 }
    },
    "resources": {
      "images": 50,
      "videos": 0,
      "raw": 450,
      "total": 500
    }
  },
  "system": {
    "uptime": 86400,
    "memoryUsage": {
      "heapUsed": 245,
      "heapTotal": 512,
      "rss": 678
    }
  }
}
```

### Analytics Tracking Endpoint

**Endpoint:** `POST /api/analytics/track`

Receives client-side analytics events.

**Request:**
```json
{
  "event": "story_generation_completed",
  "properties": {
    "userId": "123",
    "storyId": "abc",
    "processingTime": 45000
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Monitoring Cron Job

**Endpoint:** `GET /api/cron/monitor`

Runs periodic health checks and sends alerts (called by Vercel Cron).

**Schedule:** Every 6 hours (`0 */6 * * *`)

**Checks:**
- MongoDB connection health
- Database size monitoring
- Cloudinary quota monitoring

## Vercel Configuration

### Cron Jobs

Added to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-usage",
      "schedule": "0 0 1 * *"
    },
    {
      "path": "/api/cron/monitor",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Environment Variables

Required for monitoring:

```bash
# Existing variables
DATABASE_URL=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PYTHON_SERVICE_URL=https://...

# Cron authentication
CRON_SECRET=your-secret-key
```

## Vercel Analytics Integration

### Setup

1. **Enable Vercel Analytics** in your Vercel project dashboard
2. **Install Vercel Analytics package** (optional for custom events):
   ```bash
   npm install @vercel/analytics
   ```

3. **Add to root layout** (`app/layout.tsx`):
   ```typescript
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

### Automatic Metrics

Vercel Analytics automatically tracks:
- Page views
- Web Vitals (LCP, FID, CLS, FCP, TTFB)
- User sessions
- Geographic distribution
- Device types and browsers

### Custom Events

Use the analytics utility to track custom events:

```typescript
import { trackEvent, AnalyticsEvent } from '@/lib/analytics';

trackEvent(AnalyticsEvent.STORY_GENERATION_COMPLETED, {
  userId: user.id,
  processingTime: 45000,
});
```

## MongoDB Atlas Monitoring

### Built-in Monitoring

MongoDB Atlas provides built-in monitoring:

1. **Access Atlas Dashboard** → Select your cluster → Metrics tab
2. **Key Metrics:**
   - Operations per second
   - Query execution time
   - Connection count
   - Network traffic
   - Disk usage

### Alerts Configuration

Set up alerts in MongoDB Atlas:

1. **Navigate to:** Alerts → Add Alert
2. **Recommended Alerts:**
   - Connection count > 80% of limit
   - Query execution time > 1000ms
   - Disk usage > 80%
   - Replication lag > 10 seconds

### Performance Advisor

Use MongoDB Atlas Performance Advisor:
- Identifies slow queries
- Suggests index improvements
- Analyzes query patterns

## Cloudinary Monitoring

### Dashboard Access

1. **Access Cloudinary Dashboard** → Analytics
2. **Key Metrics:**
   - Storage usage
   - Bandwidth usage
   - Transformation count
   - API requests

### Usage Alerts

Cloudinary sends email alerts when:
- Storage reaches 80% of quota
- Bandwidth reaches 80% of quota
- Transformation limit approaching

### API Monitoring

Use the monitoring utilities:

```typescript
import { monitorCloudinaryQuota } from '@/lib/cloudinary-monitoring';

// Run periodically (via cron)
await monitorCloudinaryQuota();
```

## Error Tracking

### Vercel Built-in Error Tracking

Vercel automatically captures:
- Runtime errors
- Build errors
- Function timeouts
- Memory limit exceeded

Access in Vercel Dashboard → Logs → Errors

### Optional: Sentry Integration

For advanced error tracking, integrate Sentry:

1. **Install Sentry:**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Initialize Sentry:**
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Configure** `sentry.client.config.ts` and `sentry.server.config.ts`

4. **Track errors:**
   ```typescript
   import * as Sentry from '@sentry/nextjs';
   
   try {
     // ... code
   } catch (error) {
     Sentry.captureException(error);
     throw error;
   }
   ```

## Log Aggregation

### Vercel Logs

Access logs in Vercel Dashboard:
- **Real-time logs:** Deployments → Functions → Logs
- **Search and filter** by function, status, time range
- **Download logs** for analysis

### Structured Logging Benefits

All logs are JSON-formatted for easy parsing:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Story generation completed",
  "context": {
    "userId": "123",
    "storyId": "abc",
    "duration": 45000
  }
}
```

### Log Analysis

Use tools like:
- **Vercel Log Drains** → Send logs to external services
- **Datadog** → Full observability platform
- **LogDNA/Mezmo** → Log aggregation and analysis
- **Papertrail** → Simple log management

## Metrics and Dashboards

### Key Metrics to Monitor

**Application Metrics:**
- Request rate (requests/minute)
- Error rate (errors/total requests)
- Response time (p50, p95, p99)
- Story generation success rate
- Average processing time

**Infrastructure Metrics:**
- Database connection count
- Database query latency
- Storage usage (Cloudinary)
- Memory usage
- Function execution time

**Business Metrics:**
- Daily/monthly active users
- Stories created per day
- Conversion rate (free → paid)
- Average stories per user

### Creating Dashboards

**Option 1: Vercel Analytics Dashboard**
- Built-in dashboard with Web Vitals
- Custom events visualization
- Geographic distribution

**Option 2: Custom Dashboard**
- Use monitoring API endpoint
- Build custom dashboard with React
- Visualize metrics with Recharts

**Option 3: External Tools**
- Datadog dashboards
- Grafana with Prometheus
- New Relic dashboards

## Alerting Strategy

### Critical Alerts (Immediate Action)

- Database connection lost
- Python service unavailable
- Error rate > 10%
- Storage quota > 95%
- Function timeout rate > 5%

### Warning Alerts (Monitor)

- Response time p95 > 5 seconds
- Storage quota > 80%
- Database query latency > 1 second
- Connection pool usage > 80%

### Alert Channels

1. **Email** (Vercel built-in)
2. **Slack** (via webhooks)
3. **PagerDuty** (for critical alerts)
4. **SMS** (for production incidents)

## Best Practices

### Logging

1. **Use structured logging** for all log entries
2. **Never log sensitive data** (passwords, tokens, PII)
3. **Include context** (userId, requestId, operation)
4. **Use appropriate log levels** (DEBUG, INFO, WARN, ERROR, CRITICAL)
5. **Log errors with stack traces**

### Monitoring

1. **Monitor all external dependencies** (database, storage, APIs)
2. **Track business metrics** alongside technical metrics
3. **Set up alerts** for critical thresholds
4. **Review metrics regularly** (daily/weekly)
5. **Optimize based on insights**

### Performance

1. **Track slow queries** and optimize
2. **Monitor memory usage** and prevent leaks
3. **Measure user-facing metrics** (page load time, story generation time)
4. **Set performance budgets** and enforce them
5. **Use caching** where appropriate

## Troubleshooting

### High Error Rate

1. Check Vercel logs for error details
2. Review MongoDB connection status
3. Verify external service availability
4. Check for recent deployments

### Slow Performance

1. Review slow query logs
2. Check database connection pool usage
3. Monitor Python service response time
4. Analyze API endpoint latency

### Storage Issues

1. Check Cloudinary usage dashboard
2. Review storage quota alerts
3. Implement cleanup for old files
4. Consider upgrading plan

## Future Enhancements

1. **Real-time Dashboards** - Build custom monitoring dashboard
2. **Advanced Analytics** - Implement user behavior tracking
3. **Predictive Alerts** - Use ML to predict issues
4. **Cost Monitoring** - Track infrastructure costs
5. **Performance Optimization** - Automated performance tuning

## Conclusion

The monitoring and logging infrastructure provides comprehensive observability across all DataStory AI services. Regular monitoring and proactive alerting ensure high availability and optimal performance for users.
