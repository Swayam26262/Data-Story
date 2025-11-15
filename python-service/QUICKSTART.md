# Python Service - Quick Start

## Local Development

1. **Setup environment:**
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Test configuration:**
```bash
python test-vercel-config.py
```

4. **Run service:**
```bash
python main.py
```

Service runs at `http://localhost:8000`

## Vercel Deployment

1. **Test configuration:**
```bash
python test-vercel-config.py
```

2. **Deploy:**
```bash
vercel
```

3. **Set environment variables in Vercel dashboard:**
   - MONGODB_URI
   - GEMINI_API_KEY
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - ALLOWED_ORIGINS

4. **Verify:**
```bash
curl https://your-service.vercel.app/health
```

## Testing

**Run tests:**
```bash
pytest tests/
```

**Test specific module:**
```bash
pytest tests/test_preprocessor.py -v
```

## API Usage

**Health check:**
```bash
curl http://localhost:8000/health
```

**Analyze data:**
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrl": "https://res.cloudinary.com/...",
    "userId": "user123",
    "jobId": "job456"
  }'
```

## Documentation

- Full deployment guide: `../docs/python-service-vercel-deployment.md`
- Deployment checklist: `../docs/deployment-checklist.md`
- Implementation details: `IMPLEMENTATION.md`

## Troubleshooting

**Import errors:**
```bash
pip install -r requirements.txt
```

**Environment variable errors:**
```bash
python test-vercel-config.py
```

**MongoDB connection errors:**
- Check connection string format
- Verify IP whitelist in MongoDB Atlas

**Cloudinary errors:**
- Verify API credentials
- Check storage quota
