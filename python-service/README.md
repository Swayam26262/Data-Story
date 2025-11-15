# DataStory AI - Python Analysis Service

Statistical analysis and AI narrative generation microservice for DataStory AI.

## Features

- Automated data preprocessing and type detection
- Statistical analysis (trends, correlations, distributions)
- AI-powered narrative generation using Google Gemini
- Intelligent visualization selection
- RESTful API with FastAPI
- Cloudinary integration for file storage

## Setup

### Local Development

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment variables:
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

4. Run the service:
```bash
python main.py
```

The service will be available at `http://localhost:8000`

### Testing Configuration

Before deploying, test your configuration:
```bash
python test-vercel-config.py
```

This will verify:
- All required environment variables are set
- All dependencies are installed
- Service modules load correctly
- FastAPI app initializes properly

## API Endpoints

### Health Check
```
GET /health
```

Returns service health status.

### Analyze Data
```
POST /analyze
```

Analyzes uploaded dataset and generates narrative with visualizations.

**Request Body:**
```json
{
  "fileUrl": "https://res.cloudinary.com/...",
  "userId": "user_id",
  "jobId": "job_id",
  "options": {
    "audienceLevel": "general"
  }
}
```

**Response:**
```json
{
  "narratives": {
    "summary": "...",
    "keyFindings": "...",
    "recommendations": "..."
  },
  "charts": [...],
  "statistics": {...}
}
```

## Development

Run tests:
```bash
pytest tests/
```

## Deployment

### Vercel Deployment

This service is deployed as a Vercel serverless function.

**Quick Deploy:**
```bash
cd python-service
vercel
```

**Configuration:**
- See `vercel.json` for deployment configuration
- Set environment variables in Vercel dashboard
- See `docs/python-service-vercel-deployment.md` for detailed instructions

**Environment Variables Required:**
- `MONGODB_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins

**Verify Deployment:**
```bash
curl https://your-service.vercel.app/health
```

See `docs/deployment-checklist.md` for complete deployment guide.
