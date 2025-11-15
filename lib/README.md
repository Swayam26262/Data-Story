# DataStory AI - Database and Storage Infrastructure

This directory contains the database models, connection utilities, and S3 storage functions for the DataStory AI platform.

## Database Connection

### Usage

```typescript
import connectDB from '@/lib/db';

// In API routes or server components
await connectDB();
```

The connection utility implements:
- **Singleton pattern** for connection reuse in serverless environments
- **Connection pooling** (2-10 connections)
- **Automatic reconnection** on connection loss
- **Error handling** with detailed logging

### Environment Variables

Required in `.env.local`:
```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/datastory-ai?retryWrites=true&w=majority
```

## Database Models

### User Model

Manages user accounts, authentication, and tier limits.

```typescript
import { User } from '@/lib/models';

// Create a new user
const user = await User.create({
  email: 'user@example.com',
  passwordHash: hashedPassword,
  tier: 'free',
});

// Check if user can create more stories
if (user.canCreateStory()) {
  // Allow story creation
}

// Get tier limits
const limits = User.getTierLimits('professional');
```

**Key Fields:**
- `email`: Unique user email (indexed)
- `passwordHash`: bcrypt hashed password
- `tier`: User subscription tier (free, professional, business, enterprise)
- `storiesThisMonth`: Current month's story count
- `limits`: Tier-specific limits (stories/month, max rows, team members)

### Story Model

Stores generated data stories with narratives and visualizations.

```typescript
import { Story } from '@/lib/models';

// Create a new story
const story = await Story.create({
  userId: user._id,
  title: 'Sales Analysis Q4 2024',
  dataset: {
    originalFilename: 'sales_data.csv',
    s3Key: 'uploads/user123/1234567890-sales_data.csv',
    rowCount: 500,
    columnCount: 8,
    fileSize: 102400,
  },
  narratives: {
    summary: '...',
    keyFindings: '...',
    recommendations: '...',
  },
  charts: [...],
  statistics: {...},
  processingTime: 45000,
});

// Find user's stories
const stories = await Story.find({ userId: user._id })
  .sort({ createdAt: -1 })
  .limit(20);
```

**Key Fields:**
- `userId`: Reference to User (indexed)
- `dataset`: Original file metadata and S3 location
- `narratives`: Three AI-generated narrative sections
- `charts`: Array of chart configurations and data
- `statistics`: Statistical analysis results (trends, correlations, distributions)
- `visibility`: 'private' or 'public'

### Job Model

Tracks asynchronous story generation jobs.

```typescript
import { Job } from '@/lib/models';
import { v4 as uuidv4 } from 'uuid';

// Create a new job
const job = await Job.create({
  jobId: uuidv4(),
  userId: user._id,
  status: 'queued',
  fileUrl: presignedUrl,
  options: { audienceLevel: 'executive' },
});

// Update job progress
job.updateProgress('analyzing', 25);
await job.save();

// Mark as failed
job.markAsFailed('ANALYSIS_ERROR', 'Failed to parse CSV file');
await job.save();

// Check job status
const currentJob = await Job.findOne({ jobId });
```

**Key Fields:**
- `jobId`: Unique UUID (indexed)
- `status`: 'queued', 'processing', 'completed', 'failed'
- `currentStage`: Current processing stage
- `progress`: 0-100 percentage
- `storyId`: Reference to completed Story (when done)
- `error`: Error details if failed

### Session Model

Manages user authentication sessions.

```typescript
import { Session } from '@/lib/models';

// Create a new session
const session = await Session.create({
  userId: user._id,
  token: jwtToken,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  userAgent: req.headers['user-agent'],
  ipAddress: req.ip,
  rememberMe: false,
});

// Check if session is valid
if (!session.isExpired()) {
  session.updateActivity();
  await session.save();
}

// Cleanup expired sessions (run periodically)
const deletedCount = await Session.cleanupExpired();
```

**Key Fields:**
- `userId`: Reference to User (indexed)
- `token`: JWT or session token (indexed, unique)
- `expiresAt`: Session expiration timestamp
- `lastActivityAt`: Last activity timestamp
- `rememberMe`: Extended session flag

## File Storage (Cloudinary)

### Usage

```typescript
import {
  uploadFile,
  downloadFile,
  deleteFile,
  getSecureUrl,
  generateUploadKey,
} from '@/lib/storage';

// Upload a file
const result = await uploadFile(fileBuffer, 'data.csv', {
  folder: `datastory-uploads/${userId}`,
  tags: ['csv', 'user-upload'],
});

// Save result.publicId to database as storageKey
console.log('Storage Key:', result.publicId);
console.log('URL:', result.secureUrl);

// Generate secure URL with expiration (1 hour)
const url = getSecureUrl(result.publicId, 3600);

// Download a file
const fileBuffer = await downloadFile(result.publicId);

// Delete a file
await deleteFile(result.publicId);

// Check if file exists
const exists = await fileExists(result.publicId);

// Get file metadata
const metadata = await getFileMetadata(result.publicId);
```

### Environment Variables

Required in `.env.local`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Cloudinary Configuration

**Free Tier Benefits:**
- 25 GB storage
- 25 GB bandwidth/month
- Global CDN included
- Automatic optimization

**Setup Steps:**
1. Sign up at [Cloudinary](https://cloudinary.com/users/register/free)
2. Get credentials from dashboard
3. Add to `.env.local`
4. See `docs/cloudinary-setup.md` for detailed guide

## File Organization

```
lib/
├── db.ts                 # Database connection utility
├── s3.ts                 # S3 storage utilities
├── models/
│   ├── index.ts         # Model exports
│   ├── User.ts          # User model
│   ├── Story.ts         # Story model
│   ├── Job.ts           # Job model
│   └── Session.ts       # Session model
└── README.md            # This file
```

## Best Practices

### Database

1. **Always connect before queries**: Call `connectDB()` in API routes
2. **Use indexes**: Models have indexes on frequently queried fields
3. **Validate input**: Use Mongoose schema validation
4. **Handle errors**: Wrap database operations in try-catch blocks
5. **Close connections**: Not needed in serverless (handled automatically)

### S3 Storage

1. **Use presigned URLs**: For secure temporary access
2. **Generate unique keys**: Use `generateUploadKey()` to avoid collisions
3. **Set content types**: Always specify correct MIME types
4. **Handle errors**: S3 operations can fail due to network issues
5. **Clean up files**: Delete S3 files when stories are deleted

## Testing

To test the database connection:

```typescript
import connectDB, { isConnected } from '@/lib/db';

await connectDB();
console.log('Connected:', isConnected()); // true
```

To test S3 operations (requires valid AWS credentials):

```typescript
import { uploadFile, downloadFile } from '@/lib/s3';

const testData = Buffer.from('Hello, World!');
const result = await uploadFile('test/hello.txt', testData);
console.log('Uploaded:', result);

const downloaded = await downloadFile('test/hello.txt');
console.log('Downloaded:', downloaded.toString());
```

## Security Considerations

1. **Never commit credentials**: Use environment variables
2. **Encrypt at rest**: S3 uses AES-256, MongoDB Atlas encrypts by default
3. **Encrypt in transit**: TLS 1.3 for all connections
4. **Validate inputs**: Sanitize all user inputs before database operations
5. **Use presigned URLs**: Time-limited access (1 hour default)
6. **Implement rate limiting**: Prevent abuse of upload/download endpoints

## Troubleshooting

### Database Connection Issues

- **Error: "Please define the DATABASE_URL"**: Add `DATABASE_URL` to `.env.local`
- **Error: "MongoServerError: Authentication failed"**: Check MongoDB credentials
- **Error: "Connection timeout"**: Check network/firewall, MongoDB Atlas IP whitelist

### S3 Issues

- **Error: "AWS credentials not configured"**: Add AWS env variables
- **Error: "Access Denied"**: Check IAM permissions (s3:PutObject, s3:GetObject, s3:DeleteObject)
- **Error: "NoSuchBucket"**: Verify S3_BUCKET name and region
- **CORS errors**: Configure bucket CORS policy to allow your domain

## Next Steps

After setting up the infrastructure:

1. Implement authentication endpoints (Task 3)
2. Create file upload API (Task 7)
3. Build job processing system (Task 10)
4. Integrate with Python analysis service (Task 8-9)
