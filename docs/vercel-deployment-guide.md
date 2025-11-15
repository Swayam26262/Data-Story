# Vercel Deployment Guide

## Overview

This guide covers deploying the DataStory AI Next.js application to Vercel with automatic deployments and environment configuration.

## Prerequisites

- GitHub repository with the DataStory AI codebase
- Vercel account (free or Pro plan)
- Environment variables ready (see `.env.example`)

## Step 1: Connect GitHub Repository to Vercel

### Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the repository: `datastory-ai` (or your repo name)
5. Vercel will auto-detect Next.js framework

### Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

## Step 2: Configure Environment Variables

### Required Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

#### Database
```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/datastory-ai?retryWrites=true&w=majority
```

#### Authentication
```
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
```

#### AWS S3 Storage
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=datastory-ai-uploads-prod
```

#### Python Analysis Service
```
PYTHON_SERVICE_URL=https://your-python-service.com
PYTHON_SERVICE_API_KEY=your-python-service-api-key
```

#### AI Services
```
OPENAI_API_KEY=sk-your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
```

#### Application Settings
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

#### Optional: Monitoring
```
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

### Setting Environment Variables

**Via Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate scope:
   - Production: For main branch deployments
   - Preview: For PR and branch deployments
   - Development: For local development

**Via CLI:**
```bash
# Set production variable
vercel env add DATABASE_URL production

# Set for all environments
vercel env add JWT_SECRET production preview development
```

## Step 3: Configure Build Settings

### Build Configuration

Vercel auto-detects these from `package.json`, but you can override:

**Framework Preset:** Next.js

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm install
```

**Development Command:**
```bash
npm run dev
```

### Advanced Build Settings

In `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "crons": [
    {
      "path": "/api/cron/reset-usage",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

## Step 4: Set Up Automatic Deployments

### Production Deployments (main branch)

1. Go to Project Settings → Git
2. Configure Production Branch: `main`
3. Enable "Automatic Deployments from Git"
4. Every push to `main` triggers production deployment

### Preview Deployments (PRs and branches)

1. Enable "Deploy Previews" in Git settings
2. Configure which branches trigger previews
3. Each PR gets a unique preview URL
4. Comments automatically added to PRs with preview link

### Deployment Protection

**Production:**
- Enable "Deployment Protection" for production
- Require approval before deployment (optional)
- Set up deployment notifications

**Preview:**
- Password protect preview deployments (optional)
- Restrict preview access to team members

## Step 5: Configure Custom Domain (Optional)

### Add Custom Domain

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `app.datastory.ai`
4. Follow DNS configuration instructions

### DNS Configuration

**Option A: Vercel Nameservers (Recommended)**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B: CNAME Record**
```
Type: CNAME
Name: app (or @)
Value: cname.vercel-dns.com
```

**Option C: A Record**
```
Type: A
Name: @ (or subdomain)
Value: 76.76.21.21
```

### SSL Certificate

- Vercel automatically provisions SSL certificates
- Certificates auto-renew
- HTTPS enforced by default

## Step 6: Test Deployment

### Deployment Checklist

- [ ] Build completes successfully
- [ ] Environment variables loaded correctly
- [ ] Database connection works
- [ ] S3 file upload works
- [ ] Python service communication works
- [ ] Authentication flow works
- [ ] Story generation end-to-end works

### Testing Steps

1. **Verify Build Logs**
   - Check Vercel deployment logs
   - Ensure no build errors
   - Verify all dependencies installed

2. **Test Core Functionality**
   ```bash
   # Test health endpoint
   curl https://your-domain.vercel.app/api/health
   
   # Test authentication
   curl -X POST https://your-domain.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test1234"}'
   ```

3. **Test with Sample Data**
   - Register a test account
   - Upload a sample CSV file
   - Verify story generation completes
   - Test PDF export
   - Test story deletion

4. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor response times
   - Check error rates

## Step 7: Configure Deployment Notifications

### Slack Integration

1. Go to Project Settings → Integrations
2. Add Slack integration
3. Configure notification preferences:
   - Deployment started
   - Deployment succeeded
   - Deployment failed
   - Deployment ready

### Email Notifications

1. Go to Account Settings → Notifications
2. Enable email notifications for:
   - Failed deployments
   - Production deployments
   - Domain configuration changes

### Webhook Notifications

```json
{
  "webhooks": [
    {
      "url": "https://your-webhook-endpoint.com/vercel",
      "events": ["deployment.created", "deployment.succeeded", "deployment.failed"]
    }
  ]
}
```

## Troubleshooting

### Build Failures

**Issue:** Build fails with module not found
```bash
# Solution: Clear build cache
vercel --force
```

**Issue:** Environment variables not available
```bash
# Solution: Verify variables are set for correct environment
vercel env ls
```

### Runtime Errors

**Issue:** Database connection fails
- Verify `DATABASE_URL` is correct
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for Vercel)
- Verify network access settings

**Issue:** S3 upload fails
- Verify AWS credentials are correct
- Check S3 bucket CORS configuration
- Verify bucket region matches `AWS_REGION`

### Performance Issues

**Issue:** Cold start latency
- Upgrade to Vercel Pro for faster cold starts
- Implement function warming with cron jobs
- Optimize bundle size

**Issue:** Function timeout
- Vercel Hobby: 10s timeout
- Vercel Pro: 60s timeout
- Consider moving long-running tasks to Python service

## Monitoring and Maintenance

### Vercel Analytics

1. Enable Vercel Analytics in Project Settings
2. Monitor:
   - Page views and unique visitors
   - Core Web Vitals (LCP, FID, CLS)
   - Top pages and referrers

### Deployment History

- View all deployments in Deployments tab
- Instant rollback to previous deployment
- Compare deployment performance

### Logs and Debugging

```bash
# View real-time logs
vercel logs

# View logs for specific deployment
vercel logs [deployment-url]

# Filter logs
vercel logs --since 1h
vercel logs --until 2023-01-01
```

## Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use different values for production/preview
   - Rotate secrets regularly

2. **Deployment Strategy**
   - Test in preview before merging to main
   - Use feature flags for gradual rollouts
   - Keep main branch always deployable

3. **Performance**
   - Enable Edge Caching where appropriate
   - Optimize images with Next.js Image component
   - Use ISR for static content

4. **Security**
   - Enable Deployment Protection for production
   - Use Vercel Firewall (Pro plan)
   - Implement rate limiting
   - Regular security audits

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
