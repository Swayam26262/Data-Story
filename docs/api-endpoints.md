# DataStory API Endpoints Documentation

## Overview

This document describes the enhanced API endpoints for the DataStory application, including endpoints for story management, chart regeneration, export, sharing, and statistics.

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limiting

Export endpoints are rate-limited to prevent abuse:
- **Export endpoints**: 10 requests per minute per user
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

## Caching

Expensive operations are cached to improve performance:
- **Statistics**: Cached for 1 hour
- **Exports**: Cached for 5 minutes
- Cache status is indicated in response with `cached: true/false`

---

## Story Endpoints

### Get Story Details

**GET** `/api/stories/[storyId]`

Fetch complete story with enhanced statistics.

**Authentication**: Required

**Response**:
```json
{
  "storyId": "string",
  "title": "string",
  "createdAt": "ISO8601",
  "narratives": {
    "summary": "string",
    "keyFindings": "string",
    "recommendations": "string"
  },
  "charts": [...],
  "statistics": {
    "trends": [...],
    "correlations": [...],
    "distributions": [...],
    "advancedTrends": {...},
    "correlationMatrix": {...},
    "outlierAnalysis": [...],
    "insights": [...]
  },
  "metadata": {
    "datasetRows": "number",
    "columnsAnalyzed": "number",
    "processingTime": "number"
  }
}
```

---

### Regenerate Charts

**POST** `/api/stories/[storyId]/regenerate`

Regenerate charts with different configurations.

**Authentication**: Required

**Request Body**:
```json
{
  "chartTypes": ["line", "bar", "heatmap", "boxplot"],
  "aggregationLevel": "daily" | "weekly" | "monthly" | "quarterly" | "yearly",
  "statisticalOverlays": {
    "trendLines": true,
    "movingAverages": true,
    "outliers": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "storyId": "string",
  "charts": [...],
  "statistics": {...}
}
```

**Notes**:
- Invalidates cached statistics
- Calls Python service for reanalysis
- Updates story in database

---

## Statistics Endpoints

### Get Enhanced Statistics

**GET** `/api/stories/[storyId]/statistics`

Get enhanced statistics with caching.

**Authentication**: Required

**Response**:
```json
{
  "trends": [...],
  "correlations": [...],
  "distributions": [...],
  "advancedTrends": {
    "seasonal": [...],
    "changePoints": [...],
    "movingAverages": [...]
  },
  "correlationMatrix": {
    "columns": ["col1", "col2"],
    "matrix": [[1.0, 0.8], [0.8, 1.0]],
    "pValues": [[0, 0.001], [0.001, 0]]
  },
  "outlierAnalysis": [...],
  "insights": [...],
  "cached": true
}
```

**Cache**: 1 hour TTL

---

### Recompute Statistics

**POST** `/api/stories/[storyId]/statistics/recompute`

Force recomputation of statistics (invalidates cache).

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "statistics": {...}
}
```

**Notes**:
- Fetches original dataset from storage
- Calls Python service for reanalysis
- Updates story in database
- Invalidates cache

---

## Chart Endpoints

### Get Individual Chart

**GET** `/api/stories/[storyId]/charts/[chartId]`

Fetch individual chart data for embedding or display.

**Authentication**: Optional (supports public access via share token)

**Query Parameters**:
- `token` (optional): Share token for public access

**Response**:
```json
{
  "chartId": "string",
  "type": "string",
  "title": "string",
  "data": [...],
  "config": {...},
  "statistics": {...},
  "interactions": {...},
  "insights": {...}
}
```

**Access Control**:
- Public access: Story must be public with valid share token
- Private access: User must be authenticated and own the story

---

### Export Chart

**POST** `/api/stories/[storyId]/charts/[chartId]/export`

Export individual chart in various formats.

**Authentication**: Required

**Rate Limit**: 10 requests per minute

**Request Body**:
```json
{
  "format": "png" | "svg" | "csv" | "json",
  "width": 1200,
  "height": 800,
  "dpi": 150,
  "backgroundColor": "#ffffff",
  "includeWatermark": false
}
```

**Response**:
```json
{
  "success": true,
  "format": "string",
  "data": "string",
  "cached": false
}
```

**Format Details**:

- **PNG/SVG**: Returns chart data with export options (client-side rendering)
- **CSV**: Returns formatted CSV string with chart data
- **JSON**: Returns complete chart object with metadata

**Cache**: 5 minutes TTL

**Rate Limit Response** (429):
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many export requests. Please try again later.",
    "retryAfter": 45
  }
}
```

---

## Sharing Endpoints

### Generate Share Link

**POST** `/api/stories/[storyId]/share`

Generate a shareable link for a story.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "shareUrl": "https://app.com/story/123?token=abc...",
  "shareToken": "string",
  "expiresAt": null
}
```

**Notes**:
- Generates unique share token if not exists
- Sets story visibility to 'public'
- Share links do not expire (can be revoked)

---

### Get Share Status

**GET** `/api/stories/[storyId]/share`

Get current share status of a story.

**Authentication**: Required

**Response**:
```json
{
  "isShared": true,
  "shareUrl": "https://app.com/story/123?token=abc...",
  "visibility": "public"
}
```

---

### Revoke Share Link

**DELETE** `/api/stories/[storyId]/share`

Revoke shareable link for a story.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "message": "Share link revoked successfully"
}
```

**Notes**:
- Removes share token
- Sets story visibility to 'private'
- Existing share links become invalid

---

## Error Responses

All endpoints follow a consistent error format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "retryable": true,
    "details": "Additional error details"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): User does not have access
- `NOT_FOUND` (404): Resource not found
- `INVALID_ID` (400): Invalid ID format
- `INVALID_FORMAT` (400): Invalid export format
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Usage Examples

### Export Chart as CSV

```javascript
const response = await fetch(
  `/api/stories/${storyId}/charts/${chartId}/export`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      format: 'csv',
    }),
  }
);

const result = await response.json();
console.log(result.data); // CSV string
```

### Generate Share Link

```javascript
const response = await fetch(`/api/stories/${storyId}/share`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const result = await response.json();
console.log(result.shareUrl); // Shareable URL
```

### Regenerate Charts

```javascript
const response = await fetch(`/api/stories/${storyId}/regenerate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    chartTypes: ['line', 'bar', 'heatmap'],
    aggregationLevel: 'monthly',
    statisticalOverlays: {
      trendLines: true,
      movingAverages: true,
      outliers: true,
    },
  }),
});

const result = await response.json();
console.log(result.charts); // Updated charts
```

### Get Cached Statistics

```javascript
const response = await fetch(`/api/stories/${storyId}/statistics`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const result = await response.json();
console.log(result.cached); // true if served from cache
console.log(result.insights); // AI-generated insights
```

---

## Performance Considerations

1. **Caching**: Use cached endpoints when possible to reduce load
2. **Rate Limiting**: Implement client-side rate limiting for exports
3. **Pagination**: Use pagination for large result sets
4. **Compression**: Enable gzip compression for large responses
5. **CDN**: Consider CDN for static chart exports

---

## Security Considerations

1. **Authentication**: Always verify JWT tokens
2. **Authorization**: Check user ownership before operations
3. **Rate Limiting**: Prevent abuse with rate limits
4. **Input Validation**: Validate all input parameters
5. **Share Tokens**: Use cryptographically secure random tokens
6. **CORS**: Configure CORS for embedded charts

---

## Future Enhancements

- [ ] Add expiration dates for share links
- [ ] Support password-protected shares
- [ ] Add webhook notifications for chart updates
- [ ] Implement batch export for multiple charts
- [ ] Add real-time collaboration features
- [ ] Support custom export templates
