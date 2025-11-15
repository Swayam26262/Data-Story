# DataStory AI Deployment Checklist

Complete checklist for deploying both Next.js frontend and Python service to Vercel.

## Prerequisites

- [ ] Vercel account created
- [ ] GitHub repository set up
- [ ] MongoDB Atlas database created
- [ ] Cloudinary account created
- [ ] Google Gemini API key obtained

## Part 1: Next.js Frontend Deployment

### 1.1 Environment Variables Setup

In Vercel dashboard, configure these environment variables for your Next.js project:

**Database:**
- [ ] `DATABASE_URL` - MongoDB connection string

**Cloudinary:**
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

**Authentication:**
- [ ] `JWT_SECRET` - Random secure string for JWT signing
- [ ] `CRON_SECRET` - Random secure string for cron job authentication

**Services:**
- [ ] `PYTHON_SERVICE_URL` - URL of deployed Python service (set after Python deployment)

**App Configuration:**
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel app URL
- [ ] `NODE_ENV` - Set to `production`

### 1.2 Deploy Next.js App

- [ ] Connect GitHub repository to Vercel
- [ ] Select Next.js framework preset
- [ ] Set root directory to `/` (project root)
- [ ] Configure environment variables
- [ ] Deploy
- [ ] Verify deployment at your Vercel URL
- [ ] Test health endpoint: `https://your-app.vercel.app/api/health`

### 1.3 Configure Custom Domain (Optional)

- [ ] Add custom domain in Vercel dashboard
- [ ] Update DNS records
- [ ] Wait for SSL certificate provisioning
- [ ] Update `NEXT_PUBLIC_APP_URL` environment variable

## Part 2: Python Service Deployment

### 2.1 Environment Variables Setup

In Vercel dashboard, create a new project for Python service with these variables:

**Database:**
- [ ] `MONGODB_URI` - Same MongoDB connection string as frontend

**Cloudinary:**
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

**AI Service:**
- [ ] `GEMINI_API_KEY` - Google Gemini API key

**CORS:**
- [ ] `ALLOWED_ORIGINS` - Your Next.js app URL (e.g., `https://your-app.vercel.app`)

**Optional Configuration:**
- [ ] `GEMINI_MODEL` - Default: `gemini-1.5-flash`
- [ ] `GEMINI_MAX_RETRIES` - Default: `3`
- [ ] `GEMINI_TEMPERATURE` - Default: `0.7`
- [ ] `GEMINI_MAX_OUTPUT_TOKENS` - Default: `2048`
- [ ] `MIN_COLUMNS` - Default: `2`
- [ ] `MIN_ROWS` - Default: `10`
- [ ] `CORRELATION_THRESHOLD` - Default: `0.5`

### 2.2 Deploy Python Service

- [ ] Connect same GitHub repository to new Vercel project
- [ ] Set root directory to `python-service`
- [ ] Configure environment variables
- [ ] Deploy
- [ ] Verify deployment: `https://your-python-service.vercel.app/health`
- [ ] Note the Python service URL

### 2.3 Update Next.js Environment

- [ ] Go back to Next.js project in Vercel
- [ ] Update `PYTHON_SERVICE_URL` to Python service URL
- [ ] Redeploy Next.js app

### 2.4 Update Python Service CORS

- [ ] Update `ALLOWED_ORIGINS` in Python service to include Next.js URL
- [ ] Redeploy Python service if needed

## Part 3: Integration Testing

### 3.1 Test Authentication Flow

- [ ] Register new user
- [ ] Login with credentials
- [ ] Verify JWT token in cookies
- [ ] Test logout

### 3.2 Test File Upload

- [ ] Upload CSV file (< 1000 rows for free tier)
- [ ] Verify file uploaded to Cloudinary
- [ ] Check job created in MongoDB
- [ ] Monitor job status updates

### 3.3 Test Analysis Pipeline

- [ ] Wait for analysis to complete
- [ ] Verify story created in MongoDB
- [ ] Check all narrative sections generated
- [ ] Verify charts rendered correctly
- [ ] Test scrollytelling interface

### 3.4 Test Story Management

- [ ] View story list in dashboard
- [ ] Open individual story
- [ ] Test PDF export
- [ ] Test story deletion

### 3.5 Test Tier Limits

- [ ] Create 3 stories (free tier limit)
- [ ] Verify 4th upload blocked
- [ ] Check upgrade modal appears
- [ ] Test usage indicator

### 3.6 Test Error Handling

- [ ] Upload invalid file format
- [ ] Upload file > 1000 rows (free tier)
- [ ] Test with malformed data
- [ ] Verify error messages display correctly

## Part 4: Monitoring Setup

### 4.1 Vercel Analytics

- [ ] Enable Vercel Analytics for Next.js app
- [ ] Monitor page views and performance
- [ ] Check Core Web Vitals

### 4.2 Function Logs

- [ ] Monitor Next.js API route logs
- [ ] Monitor Python service function logs
- [ ] Set up log retention

### 4.3 MongoDB Monitoring

- [ ] Enable MongoDB Atlas monitoring
- [ ] Set up alerts for:
  - High connection count
  - Slow queries
  - Storage usage
  - CPU usage

### 4.4 Cloudinary Monitoring

- [ ] Check storage usage
- [ ] Monitor bandwidth
- [ ] Set up usage alerts

### 4.5 Error Tracking (Optional)

- [ ] Integrate Sentry or similar
- [ ] Configure error notifications
- [ ] Test error reporting

## Part 5: Performance Optimization

### 5.1 Next.js Optimization

- [ ] Run Lighthouse audit
- [ ] Optimize images
- [ ] Enable caching headers
- [ ] Test loading performance

### 5.2 Python Service Optimization

- [ ] Monitor cold start times
- [ ] Optimize function execution time
- [ ] Check memory usage
- [ ] Consider upgrading Vercel plan if needed

### 5.3 Database Optimization

- [ ] Create indexes on frequently queried fields
- [ ] Monitor query performance
- [ ] Optimize data models if needed

## Part 6: Security Checklist

### 6.1 Environment Variables

- [ ] All secrets stored in Vercel environment variables
- [ ] No secrets committed to Git
- [ ] `.env` files in `.gitignore`

### 6.2 CORS Configuration

- [ ] `ALLOWED_ORIGINS` restricted to your domains
- [ ] No wildcard (`*`) in production

### 6.3 Authentication

- [ ] JWT secret is strong and random
- [ ] Cookies are httpOnly and secure
- [ ] Session expiration configured

### 6.4 Rate Limiting

- [ ] Rate limiting enabled on API routes
- [ ] Monitor for abuse

### 6.5 Data Encryption

- [ ] HTTPS enabled (Vercel default)
- [ ] MongoDB encryption at rest enabled
- [ ] Cloudinary secure URLs used

## Part 7: Documentation

- [ ] Update README with deployment instructions
- [ ] Document environment variables
- [ ] Create troubleshooting guide
- [ ] Document API endpoints

## Part 8: CI/CD Setup (Optional - Task 16.3)

### 8.1 GitHub Actions

- [ ] Create workflow file
- [ ] Add linting step
- [ ] Add testing step
- [ ] Configure automatic deployment

### 8.2 Staging Environment

- [ ] Create staging Vercel project
- [ ] Configure staging environment variables
- [ ] Set up automatic deployment from develop branch

## Part 9: Launch Preparation

### 9.1 Content

- [ ] Create sample datasets
- [ ] Write user documentation
- [ ] Prepare demo video
- [ ] Create landing page

### 9.2 Analytics

- [ ] Set up user signup tracking
- [ ] Track story generation events
- [ ] Track PDF export events
- [ ] Monitor conversion funnel

### 9.3 Marketing

- [ ] Prepare Product Hunt launch
- [ ] Create social media posts
- [ ] Set up feedback collection

## Troubleshooting

### Common Issues

**CORS Errors:**
- Verify `ALLOWED_ORIGINS` includes frontend URL
- Check both HTTP and HTTPS variants
- Ensure no trailing slashes

**MongoDB Connection Errors:**
- Verify connection string format
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

**Cloudinary Upload Errors:**
- Verify API credentials
- Check storage quota
- Ensure file size within limits

**Python Service Timeout:**
- Check function execution time
- Optimize data processing
- Consider upgrading Vercel plan

**Cold Start Issues:**
- Use lighter AI model (gemini-1.5-flash)
- Minimize dependencies
- Consider keeping functions warm

## Post-Deployment

- [ ] Monitor error rates for 24 hours
- [ ] Check function invocation costs
- [ ] Gather user feedback
- [ ] Plan next iteration

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Python on Vercel](https://vercel.com/docs/functions/runtimes/python)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
