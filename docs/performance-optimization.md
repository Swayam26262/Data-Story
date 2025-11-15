# Performance Optimization Guide

This document outlines the performance optimizations implemented in DataStory AI and provides guidelines for maintaining optimal performance.

## Performance Targets

- **Initial Page Load**: < 3 seconds (4G connection)
- **Dashboard Load**: < 2 seconds
- **Story Viewer Load**: < 2 seconds
- **Story Generation**: < 60 seconds (95th percentile for 1000 rows)
- **PDF Export**: < 10 seconds
- **Lighthouse Score**: > 85 (Performance, Accessibility, Best Practices, SEO)

## Implemented Optimizations

### 1. Frontend Optimizations

#### Code Splitting
- Automatic route-based code splitting via Next.js
- Dynamic imports for heavy components (charts, PDF viewer)
- Vendor chunk separation for better caching

```typescript
// Example: Dynamic import for chart components
const LineChart = dynamic(() => import('@/components/charts/LineChart'), {
  loading: () => <SkeletonLoader />,
  ssr: false,
});
```

#### Image Optimization
- Next.js Image component with automatic optimization
- AVIF and WebP format support
- Responsive image sizes
- Lazy loading for below-the-fold images

```typescript
import Image from 'next/image';

<Image
  src="/story-thumbnail.jpg"
  alt="Story thumbnail"
  width={300}
  height={200}
  loading="lazy"
  placeholder="blur"
/>
```

#### Asset Caching
- Static assets cached for 1 year (immutable)
- Font files cached with long TTL
- API responses cached where appropriate

#### Bundle Size Optimization
- Tree shaking enabled
- SWC minification
- Package import optimization for large libraries (recharts, d3)

### 2. Backend Optimizations

#### Database Indexing
Run the index creation script to optimize database queries:

```bash
npm run create-indexes
```

**Indexes Created:**
- Users: `email` (unique), `tier`, `createdAt`, `lastLoginAt`
- Stories: `userId + createdAt`, `userId + visibility`, `shareToken`, `createdAt`
- Jobs: `jobId` (unique), `userId + status`, `status + createdAt`, `createdAt`
- Sessions: `token` (unique), `userId`, `expiresAt` (TTL)

#### Query Optimization
- Use projection to fetch only required fields
- Implement pagination for large result sets
- Use aggregation pipelines for complex queries

```typescript
// Example: Optimized story fetch
const stories = await db.collection('stories')
  .find({ userId: new ObjectId(userId) })
  .project({ 
    title: 1, 
    createdAt: 1, 
    'dataset.rowCount': 1,
    'charts.0.data': 1 // Only first chart for thumbnail
  })
  .sort({ createdAt: -1 })
  .limit(20)
  .toArray();
```

#### Caching Strategy
- In-memory caching for frequently accessed data
- Cache user tier limits and permissions
- Cache story metadata for dashboard

```typescript
import { CacheManager } from '@/lib/performance';

const storyCache = new CacheManager<Story>(300); // 5 minute TTL

const story = await storyCache.getOrCompute(
  `story:${storyId}`,
  () => fetchStoryFromDB(storyId)
);
```

#### Connection Pooling
- MongoDB connection pool configured
- Reuse connections across requests
- Proper connection cleanup

### 3. API Optimizations

#### Response Compression
- Gzip compression enabled for all responses
- Brotli compression for static assets

#### Rate Limiting
- Prevent abuse and ensure fair resource allocation
- 100 requests per hour per user
- 1000 requests per hour per IP

#### Async Processing
- File upload returns immediately with job ID
- Story generation runs asynchronously
- Client polls for status updates

### 4. Python Service Optimizations

#### Data Processing
- Use pandas vectorized operations
- Avoid loops where possible
- Process data in chunks for large datasets

```python
# Optimized: Vectorized operation
df['normalized'] = (df['value'] - df['value'].mean()) / df['value'].std()

# Avoid: Loop-based operation
for i in range(len(df)):
    df.loc[i, 'normalized'] = (df.loc[i, 'value'] - mean) / std
```

#### Memory Management
- Stream large files instead of loading entirely
- Clean up DataFrames after processing
- Use appropriate data types (int32 vs int64)

#### API Call Optimization
- Batch Gemini API calls where possible
- Implement retry with exponential backoff
- Cache API responses for identical requests

### 5. Storage Optimizations

#### S3 Configuration
- Use S3 Transfer Acceleration for faster uploads
- Implement lifecycle policies to delete old files
- Use presigned URLs with short expiration

#### File Size Limits
- Enforce 10 MB upload limit
- Compress files before storage
- Use efficient file formats

## Performance Monitoring

### Metrics to Track

1. **Frontend Metrics**
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Time to Interactive (TTI)
   - Cumulative Layout Shift (CLS)

2. **Backend Metrics**
   - API response time (p50, p95, p99)
   - Database query time
   - Error rate
   - Request rate

3. **Business Metrics**
   - Story generation success rate
   - Average processing time
   - User session duration

### Monitoring Tools

- **Vercel Analytics**: Frontend performance
- **MongoDB Atlas**: Database performance
- **Custom Logging**: Application-level metrics
- **Lighthouse CI**: Automated performance audits

### Running Performance Audits

```bash
# Run Lighthouse audit
npm run audit:performance

# Analyze bundle size
npm run build
npm run analyze

# Check database indexes
npm run create-indexes

# Monitor memory usage
node --inspect scripts/memory-profile.js
```

## Performance Best Practices

### Frontend Development

1. **Use React.memo for expensive components**
```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});
```

2. **Implement virtual scrolling for long lists**
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={stories.length}
  itemSize={100}
>
  {StoryCard}
</FixedSizeList>
```

3. **Debounce user input**
```typescript
import { debounce } from '@/lib/performance';

const handleSearch = debounce((query: string) => {
  // Search logic
}, 300);
```

4. **Use loading states and skeletons**
```typescript
{loading ? <SkeletonLoader /> : <StoryList stories={stories} />}
```

### Backend Development

1. **Use performance timers**
```typescript
import { PerformanceTimer } from '@/lib/performance';

const timer = new PerformanceTimer('story-generation');
// ... operations
timer.mark('preprocessing');
// ... more operations
timer.mark('analysis');
timer.end();
```

2. **Implement batch operations**
```typescript
import { BatchProcessor } from '@/lib/performance';

const processor = new BatchProcessor(
  async (items) => {
    await db.collection('analytics').insertMany(items);
  },
  10, // batch size
  1000 // max wait ms
);

processor.add(analyticsEvent);
```

3. **Use database projections**
```typescript
// Only fetch needed fields
const user = await db.collection('users').findOne(
  { _id: userId },
  { projection: { email: 1, tier: 1 } }
);
```

4. **Implement proper error handling**
```typescript
import { retryWithBackoff } from '@/lib/performance';

const result = await retryWithBackoff(
  () => callExternalAPI(),
  3, // max attempts
  1000 // initial delay
);
```

### Database Optimization

1. **Use compound indexes for common queries**
```typescript
// Query: Find user's recent stories
db.collection('stories').createIndex({ userId: 1, createdAt: -1 });
```

2. **Implement TTL indexes for temporary data**
```typescript
// Auto-delete old jobs after 7 days
db.collection('jobs').createIndex(
  { updatedAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
);
```

3. **Use aggregation pipelines efficiently**
```typescript
const stats = await db.collection('stories').aggregate([
  { $match: { userId: new ObjectId(userId) } },
  { $group: { 
    _id: null, 
    totalStories: { $sum: 1 },
    avgProcessingTime: { $avg: '$processingTime' }
  }}
]).toArray();
```

## Troubleshooting Performance Issues

### Slow Page Load
1. Check Lighthouse report for specific issues
2. Analyze bundle size with webpack-bundle-analyzer
3. Review network waterfall in DevTools
4. Check for render-blocking resources

### Slow API Responses
1. Check database query performance with explain()
2. Review API logs for slow endpoints
3. Check for N+1 query problems
4. Verify proper indexing

### High Memory Usage
1. Monitor with `getMemoryUsage()` utility
2. Check for memory leaks with heap snapshots
3. Review large object allocations
4. Implement proper cleanup in useEffect

### Slow Story Generation
1. Profile Python service with cProfile
2. Check Gemini API response times
3. Review data preprocessing efficiency
4. Monitor CPU and memory usage

## Performance Checklist

Before deploying to production:

- [ ] Run Lighthouse audit on all key pages
- [ ] Verify bundle size is optimized
- [ ] Confirm database indexes are created
- [ ] Test with realistic data volumes
- [ ] Check API response times under load
- [ ] Verify caching headers are set correctly
- [ ] Test on slow network connections (3G)
- [ ] Profile memory usage
- [ ] Review error rates and retry logic
- [ ] Set up performance monitoring alerts

## Continuous Optimization

Performance optimization is an ongoing process:

1. **Monitor regularly**: Review performance metrics weekly
2. **Set alerts**: Get notified when metrics degrade
3. **Profile periodically**: Run performance audits monthly
4. **Update dependencies**: Keep libraries up to date
5. **Review user feedback**: Listen to performance complaints
6. **A/B test optimizations**: Measure impact of changes
7. **Document learnings**: Share optimization insights with team

## Resources

- [Next.js Performance Documentation](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
