# Python Service Vercel Deployment Guide

This guide explains how to deploy the DataStory AI Python analysis service to Vercel.

## Prerequisites

- Vercel account
- GitHub repository connected to Vercel
- MongoDB Atlas database
- Cloudinary account
- Google Gemini API key

## Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Configure Environment Variables

In your Vercel dashboard or using the CLI, set the following environment variables:

**Required Variables:**
- `MONGODB_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (e.g., `https://your-app.vercel.app`)

**Optional Variables:**
- `GEMINI_MODEL` - Default: `gemini-1.5-flash`
- `GEMINI_MAX_RETRIES` - Default: `3`
- `GEMINI_TEMPERATURE` - Default: `0.7`
- `GEMINI_MAX_OUTPUT_TOKENS` - Default: `2048`
- `MIN_COLUMNS` - Default: `2`
- `MIN_ROWS` - Default: `10`
- `CORRELATION_THRESHOLD` - Default: `0.5`

### 3. Deploy Using Vercel CLI

From the `python-service` directory:

```bash
cd python-service
vercel
```

Follow the prompts to:
1. Link to your Vercel project
2. Confirm the project settings
3. Deploy

### 4. Deploy Using GitHub Integration

1. Push your code to GitHub
2. In Vercel dashboard, import your repository
3. Set the root directory to `python-service`
4. Configure environment variables
5. Deploy

### 5. Verify Deployment

Test the health endpoint:

```bash
curl https://your-python-service.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "datastory-analysis",
  "version": "1.0.0"
}
```

## Configuration Files

### vercel.json

The `python-service/vercel.json` file configures:
- Python runtime
- Environment variables
- Routes
- Lambda size limits
- Region (iad1 - US East)

### .vercelignore

Excludes unnecessary files from deployment:
- Test files
- Documentation
- Development files
- Cache directories

## CORS Configuration

The Python service is configured to accept requests from origins specified in the `ALLOWED_ORIGINS` environment variable. Make sure to set this to your Next.js frontend URL:

```
ALLOWED_ORIGINS=https://your-nextjs-app.vercel.app,https://your-custom-domain.com
```

## Connecting from Next.js Frontend

Update your Next.js environment variables to point to the Python service:

```env
PYTHON_SERVICE_URL=https://your-python-service.vercel.app
```

In your Next.js API routes, use this URL to call the Python service:

```typescript
const response = await fetch(`${process.env.PYTHON_SERVICE_URL}/analyze`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileUrl: cloudinaryUrl,
    userId: userId,
    jobId: jobId,
  }),
});
```

## Monitoring

### Vercel Dashboard

Monitor your Python service in the Vercel dashboard:
- Function logs
- Invocation metrics
- Error rates
- Response times

### Logs

View real-time logs:

```bash
vercel logs your-python-service
```

## Troubleshooting

### Lambda Size Limit

If deployment fails due to size limits:
1. Check `maxLambdaSize` in `vercel.json` (currently 50mb)
2. Remove unnecessary dependencies
3. Use `.vercelignore` to exclude files

### Cold Start Performance

Vercel serverless functions may experience cold starts. To minimize impact:
- Use the `gemini-1.5-flash` model (faster)
- Keep dependencies minimal
- Consider upgrading to Vercel Pro for better performance

### CORS Errors

If you encounter CORS errors:
1. Verify `ALLOWED_ORIGINS` includes your frontend URL
2. Check that the frontend is using the correct Python service URL
3. Ensure HTTPS is used in production

### Memory Limits

Vercel serverless functions have memory limits. If you encounter memory errors:
1. Optimize pandas operations
2. Process data in chunks
3. Consider upgrading your Vercel plan

## Cost Considerations

Vercel pricing is based on:
- Function invocations
- Execution time
- Bandwidth

For the MVP:
- Free tier: 100GB-hours of function execution
- Monitor usage in Vercel dashboard
- Optimize function execution time to reduce costs

## Security

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: Restrict `ALLOWED_ORIGINS` to your domains only
3. **Rate Limiting**: Consider adding rate limiting for production
4. **Authentication**: Verify requests from your Next.js backend

## Next Steps

After deployment:
1. Test the `/analyze` endpoint with sample data
2. Monitor function performance and errors
3. Set up alerts for failures
4. Configure custom domain (optional)
5. Implement caching if needed

## Resources

- [Vercel Python Runtime Documentation](https://vercel.com/docs/functions/runtimes/python)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
