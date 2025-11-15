# Monitoring Setup Guide

This guide walks you through setting up monitoring and observability for DataStory AI.

## Quick Start

### 1. Enable Vercel Analytics

1. Go to your Vercel project dashboard
2. Navigate to **Analytics** tab
3. Click **Enable Analytics**
4. Analytics will start collecting data automatically

### 2. Configure MongoDB Atlas Monitoring

1. Log in to MongoDB Atlas
2. Select your cluster
3. Go to **Metrics** tab to view performance data
4. Set up alerts:
   - Click **Alerts** → **Add Alert**
   - Configure alerts for:
     - Connection count > 80%
     - Query execution time > 1000ms
     - Disk usage > 80%

### 3. Configure Cloudinary Monitoring

1. Log in to Cloudinary dashboard
2. Navigate to **Settings** → **Notifications**
3. Enable email alerts for:
   - Storage quota warnings (80%)
   - Bandwidth quota warnings (80%)
   - Transformation limit warnings

### 4. Set Up Cron Jobs

The monitoring cron job is already configured in `vercel.json`:

```json
{
  "path": "/api/cron/monitor",
  "schedule": "0 */6 * * *"
}
```

This runs every 6 hours and checks:
- MongoDB health
- Database size
- Cloudinary quota

### 5. Test Health Endpoint

```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": { "status": "up", "latency": 45 },
    "storage": { "status": "up", "latency": 12 },
    "pythonService": { "status": "up", "latency": 234 }
  }
}
```

## Accessing Monitoring Data

### Vercel Dashboard

**Logs:**
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** → Select deployment
3. Click **Functions** → Select function
4. View real-time logs

**Analytics:**
1. Go to **Analytics** tab
2. View:
   - Page views
   - Web Vitals (LCP, FID, CLS)
   - Top pages
   - Geographic distribution

### MongoDB Atlas Dashboard

**Metrics:**
1. Go to Atlas Dashboard → Your Cluster
2. Click **Metrics** tab
3. View:
   - Operations per second
   - Query execution time
   - Connection count
   - Network traffic

**Performance Advisor:**
1. Click **Performance Advisor** tab
2. Review:
   - Slow queries
   - Index suggestions
   - Query patterns

### Cloudinary Dashboard

**Analytics:**
1. Go to Cloudinary Dashboard
2. Click **Analytics** tab
3. View:
   - Storage usage
   - Bandwidth usage
   - Transformation count
   - API requests

## Monitoring API Endpoints

### Health Check

```bash
GET /api/health
```

Returns comprehensive health status for all services.

### Monitoring Dashboard

```bash
GET /api/monitoring
Authorization: Bearer <your-jwt-token>
```

Returns detailed monitoring data (requires authentication).

### Analytics Tracking

```bash
POST /api/analytics/track
Content-Type: application/json

{
  "event": "story_generation_completed",
  "properties": {
    "userId": "123",
    "processingTime": 45000
  }
}
```

## Setting Up Alerts

### Vercel Alerts

1. Go to Vercel Dashboard → Settings → Notifications
2. Configure email notifications for:
   - Deployment failures
   - Function errors
   - Performance degradation

### MongoDB Atlas Alerts

Recommended alerts:

| Metric | Threshold | Action |
|--------|-----------|--------|
| Connection count | > 80% of limit | Email team |
| Query execution time | > 1000ms | Email team |
| Disk usage | > 80% | Email team |
| Replication lag | > 10 seconds | Email team |

### Cloudinary Alerts

Cloudinary automatically sends alerts for:
- Storage > 80% of quota
- Bandwidth > 80% of quota
- Transformation limit approaching

## Optional: Sentry Integration

For advanced error tracking:

### 1. Install Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 2. Configure Environment Variables

Add to `.env.local`:

```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### 3. Initialize Sentry

The wizard creates configuration files:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

### 4. Test Sentry

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  throw new Error('Test error');
} catch (error) {
  Sentry.captureException(error);
}
```

## Monitoring Best Practices

### 1. Regular Reviews

- **Daily:** Check error logs and critical alerts
- **Weekly:** Review performance metrics and trends
- **Monthly:** Analyze usage patterns and optimize

### 2. Performance Budgets

Set and enforce performance budgets:
- Page load time: < 3 seconds
- Story generation: < 60 seconds
- API response time: < 500ms (p95)

### 3. Log Retention

- **Development:** 7 days
- **Production:** 30 days
- **Critical logs:** Archive for 1 year

### 4. Alert Fatigue

Avoid alert fatigue:
- Set appropriate thresholds
- Use warning vs critical levels
- Group related alerts
- Review and adjust regularly

## Troubleshooting

### No Logs Appearing

1. Check Vercel deployment status
2. Verify functions are being invoked
3. Check log level configuration
4. Review Vercel log retention settings

### Health Check Failing

1. Check database connection string
2. Verify environment variables
3. Test Python service URL
4. Review Cloudinary credentials

### High Memory Usage

1. Check for memory leaks
2. Review connection pool settings
3. Optimize database queries
4. Consider upgrading Vercel plan

### Slow Performance

1. Review slow query logs
2. Check database indexes
3. Optimize API endpoints
4. Enable caching where appropriate

## Monitoring Checklist

- [ ] Vercel Analytics enabled
- [ ] MongoDB Atlas alerts configured
- [ ] Cloudinary notifications enabled
- [ ] Health endpoint tested
- [ ] Monitoring cron job verified
- [ ] Log aggregation working
- [ ] Alert channels configured
- [ ] Performance budgets set
- [ ] Documentation reviewed
- [ ] Team trained on monitoring tools

## Support

For issues with monitoring setup:

1. Check [Monitoring Implementation Guide](./monitoring-implementation.md)
2. Review Vercel documentation
3. Check MongoDB Atlas documentation
4. Contact support if needed

## Next Steps

1. Set up custom dashboards
2. Implement advanced analytics
3. Configure log drains
4. Set up incident response procedures
5. Create runbooks for common issues
