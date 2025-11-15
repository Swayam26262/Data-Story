# Monitoring Quick Reference

## Quick Access

### Health Check
```bash
curl https://your-app.vercel.app/api/health
```

### Monitoring Dashboard (requires auth)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-app.vercel.app/api/monitoring
```

## Common Logging Patterns

### Basic Logging
```typescript
import { logger } from '@/lib/logger';

// Info
logger.info('User action completed', { userId: '123', action: 'upload' });

// Error
logger.error('Operation failed', error, { operation: 'story-generation' });

// Warning
logger.warn('High usage detected', { percentage: 85 });

// Critical
logger.critical('Service unavailable', error, { service: 'database' });
```

### Performance Tracking
```typescript
import { PerformanceTimer } from '@/lib/monitoring';

const timer = new PerformanceTimer('story_generation', { userId: '123' });
// ... perform operation
const duration = timer.end(true); // true = success
```

### Track Story Generation
```typescript
import { trackStoryGeneration } from '@/lib/monitoring';

trackStoryGeneration(
  userId,
  true,        // success
  45000,       // duration (ms)
  500,         // dataset rows
  4            // charts generated
);
```

### Track Analytics Events
```typescript
import { trackEvent, AnalyticsEvent } from '@/lib/analytics';

trackEvent(AnalyticsEvent.STORY_GENERATION_COMPLETED, {
  userId: '123',
  storyId: 'abc',
  processingTime: 45000,
});
```

## Monitoring Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | No | Health check for all services |
| `/api/monitoring` | GET | Yes | Detailed monitoring data |
| `/api/analytics/track` | POST | No | Track analytics events |
| `/api/cron/monitor` | GET | Cron Secret | Periodic monitoring checks |

## Key Metrics

### Application
- Request rate
- Error rate
- Response time (p50, p95, p99)
- Story generation success rate

### Infrastructure
- Database connection count
- Database query latency
- Storage usage
- Memory usage

### Business
- Daily/monthly active users
- Stories created per day
- Conversion rate

## Alert Thresholds

### Critical (Immediate Action)
- Database disconnected
- Python service down
- Error rate > 10%
- Storage quota > 95%

### Warning (Monitor)
- Response time p95 > 5s
- Storage quota > 80%
- Query latency > 1s
- Connection pool > 80%

## Monitoring Services

### Vercel Analytics
- Dashboard: Vercel Project → Analytics
- Tracks: Page views, Web Vitals, sessions

### MongoDB Atlas
- Dashboard: Atlas → Cluster → Metrics
- Tracks: Operations, connections, disk usage

### Cloudinary
- Dashboard: Cloudinary → Analytics
- Tracks: Storage, bandwidth, transformations

## Common Commands

### Check MongoDB Stats
```typescript
import { getMongoDBStats } from '@/lib/mongodb-monitoring';
const stats = await getMongoDBStats();
```

### Check Cloudinary Usage
```typescript
import { getCloudinaryUsage } from '@/lib/cloudinary-monitoring';
const usage = await getCloudinaryUsage();
```

### Monitor Cloudinary Quota
```typescript
import { monitorCloudinaryQuota } from '@/lib/cloudinary-monitoring';
await monitorCloudinaryQuota();
```

### Check Application Health
```typescript
import { checkHealth } from '@/lib/monitoring';
const health = await checkHealth();
```

## Troubleshooting

### No Logs Appearing
1. Check Vercel deployment status
2. Verify functions are being invoked
3. Review Vercel Dashboard → Logs

### Health Check Failing
1. Verify DATABASE_URL is set
2. Check PYTHON_SERVICE_URL
3. Verify Cloudinary credentials

### High Memory Usage
1. Check for memory leaks
2. Review connection pool settings
3. Optimize database queries

### Slow Performance
1. Review slow query logs
2. Check database indexes
3. Monitor external service latency

## Environment Variables

```bash
# Required
DATABASE_URL=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PYTHON_SERVICE_URL=https://...
CRON_SECRET=...

# Optional
SENTRY_DSN=https://...
ANALYTICS_ENDPOINT=https://...
```

## Cron Jobs

| Path | Schedule | Description |
|------|----------|-------------|
| `/api/cron/reset-usage` | `0 0 1 * *` | Reset monthly usage (1st of month) |
| `/api/cron/monitor` | `0 */6 * * *` | Health checks (every 6 hours) |

## Support

- Implementation Guide: `docs/monitoring-implementation.md`
- Setup Guide: `docs/monitoring-setup-guide.md`
- Task Summary: `docs/task-16.4-implementation-summary.md`
