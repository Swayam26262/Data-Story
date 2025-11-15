# DataStory AI - Deployment Guide

Quick reference for deploying DataStory AI to Vercel.

## Prerequisites

- Vercel account
- MongoDB Atlas database
- Cloudinary account
- Google Gemini API key

## Quick Deploy

### 1. Deploy Python Service

```bash
cd python-service
vercel
```

Set environment variables in Vercel dashboard:
- `MONGODB_URI`
- `GEMINI_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ALLOWED_ORIGINS` (your Next.js URL)

Note the deployed URL (e.g., `https://your-python-service.vercel.app`)

### 2. Deploy Next.js App

```bash
cd ..
vercel
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL` (MongoDB URI)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `JWT_SECRET` (random secure string)
- `CRON_SECRET` (random secure string)
- `PYTHON_SERVICE_URL` (from step 1)
- `NEXT_PUBLIC_APP_URL` (your Vercel URL)

### 3. Update CORS

Go back to Python service in Vercel dashboard:
- Update `ALLOWED_ORIGINS` to include your Next.js URL
- Redeploy

### 4. Test

```bash
# Test Python service
curl https://your-python-service.vercel.app/health

# Test Next.js app
curl https://your-nextjs-app.vercel.app/api/health
```

## Detailed Documentation

- **Complete Deployment Checklist:** `docs/deployment-checklist.md`
- **Python Service Guide:** `docs/python-service-vercel-deployment.md`
- **Next.js Deployment:** `docs/vercel-deployment-guide.md`

## Pre-Deployment Testing

Test Python service configuration locally:

```bash
cd python-service
python test-vercel-config.py
```

## Environment Variables Reference

### Next.js App
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MongoDB connection string | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `CRON_SECRET` | Cron authentication secret | Yes |
| `PYTHON_SERVICE_URL` | Python service URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | Yes |

### Python Service
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `ALLOWED_ORIGINS` | Allowed CORS origins | Yes |
| `GEMINI_MODEL` | AI model name | No (default: gemini-1.5-flash) |
| `MIN_COLUMNS` | Minimum columns | No (default: 2) |
| `MIN_ROWS` | Minimum rows | No (default: 10) |

## Troubleshooting

### CORS Errors
- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check for trailing slashes
- Ensure HTTPS in production

### MongoDB Connection
- Verify connection string format
- Check IP whitelist in MongoDB Atlas
- Ensure database user has permissions

### Cloudinary Errors
- Verify API credentials
- Check storage quota
- Ensure file size within limits

### Function Timeout
- Check execution time in Vercel logs
- Optimize data processing
- Consider upgrading Vercel plan

## Support

For issues, see:
- `docs/deployment-checklist.md` - Complete checklist
- `docs/python-service-vercel-deployment.md` - Python service details
- Vercel documentation: https://vercel.com/docs
