# Storage Migration: S3 → Cloudinary

## Summary

DataStory AI now uses **Cloudinary** instead of AWS S3 for file storage. This change simplifies setup and provides a better developer experience.

## What Changed

### Files Updated

1. **lib/storage.ts** (NEW)
   - Replaces `lib/s3.ts`
   - Uses Cloudinary SDK instead of AWS SDK
   - Same function interface for easy migration

2. **lib/models/Story.ts**
   - Changed `s3Key` → `storageKey`
   - Now storage-agnostic (works with any provider)

3. **Environment Variables**
   - Removed: AWS credentials
   - Added: Cloudinary credentials

### API Changes

The function signatures remain similar:

**Before (S3):**
```typescript
import { uploadFile } from '@/lib/s3';

const result = await uploadFile(key, buffer, {
  contentType: 'text/csv',
});
// Returns: { key, bucket, url, size }
```

**After (Cloudinary):**
```typescript
import { uploadFile } from '@/lib/storage';

const result = await uploadFile(buffer, filename, {
  folder: 'uploads',
  tags: ['csv'],
});
// Returns: { publicId, url, secureUrl, format, size }
```

### Database Schema

**Story Model:**
```typescript
// Before
dataset: {
  s3Key: string;  // AWS S3 specific
}

// After
dataset: {
  storageKey: string;  // Provider agnostic
}
```

## Why Cloudinary?

### Advantages

1. **Easier Setup**
   - No IAM policies
   - No bucket configuration
   - No CORS setup
   - Just 3 environment variables

2. **Better Free Tier**
   - 25 GB storage (vs S3's 5 GB for 12 months)
   - 25 GB bandwidth/month
   - Global CDN included
   - No credit card required

3. **Simpler API**
   - Fewer configuration options
   - Built-in transformations
   - Automatic optimization
   - Better error messages

4. **Developer Experience**
   - Faster to get started
   - Better documentation
   - Visual dashboard
   - Easier debugging

### Trade-offs

**Cloudinary Limitations:**
- Less control over infrastructure
- Vendor lock-in (but easy to migrate)
- Pricing can be higher at scale

**When to Use S3 Instead:**
- Enterprise requirements
- Need full AWS integration
- Very large scale (TB+ storage)
- Specific compliance requirements

## Migration Guide

If you need to switch back to S3 or another provider:

### 1. Keep Both Implementations

```typescript
// lib/storage.ts (current - Cloudinary)
// lib/s3.ts (keep for reference)
```

### 2. Create Storage Adapter

```typescript
// lib/storage-adapter.ts
const provider = process.env.STORAGE_PROVIDER || 'cloudinary';

export const storage = provider === 's3' 
  ? require('./s3')
  : require('./storage');
```

### 3. Update Imports

```typescript
// Before
import { uploadFile } from '@/lib/storage';

// After
import { uploadFile } from '@/lib/storage-adapter';
```

## Setup Instructions

### Quick Start

1. **Sign up for Cloudinary**
   ```
   https://cloudinary.com/users/register/free
   ```

2. **Get credentials from dashboard**
   - Cloud Name
   - API Key
   - API Secret

3. **Update .env.local**
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Test connection**
   ```bash
   node test-cloudinary.js
   ```

### Detailed Guide

See `docs/cloudinary-setup.md` for:
- Step-by-step setup
- Configuration options
- Usage examples
- Troubleshooting
- Best practices

## Code Examples

### Upload File

```typescript
import { uploadFile } from '@/lib/storage';

// In API route
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const result = await uploadFile(buffer, file.name, {
    folder: `datastory-uploads/${userId}`,
    tags: ['user-upload'],
  });
  
  // Save to database
  await Story.create({
    dataset: {
      originalFilename: file.name,
      storageKey: result.publicId, // Save this!
      fileSize: result.size,
    },
  });
  
  return Response.json({ url: result.secureUrl });
}
```

### Download File

```typescript
import { downloadFile } from '@/lib/storage';

const story = await Story.findById(storyId);
const fileBuffer = await downloadFile(story.dataset.storageKey);

// Process the file...
```

### Generate Secure URL

```typescript
import { getSecureUrl } from '@/lib/storage';

// Generate URL that expires in 1 hour
const url = getSecureUrl(story.dataset.storageKey, 3600);

return Response.json({ downloadUrl: url });
```

## Testing

### Test Cloudinary Connection

```bash
node test-cloudinary.js
```

### Test Upload/Download

```javascript
const { uploadFile, downloadFile, deleteFile } = require('./lib/storage');

async function test() {
  // Upload
  const result = await uploadFile(
    Buffer.from('test data'),
    'test.txt',
    { folder: 'test' }
  );
  
  console.log('Uploaded:', result.secureUrl);
  
  // Download
  const data = await downloadFile(result.publicId);
  console.log('Downloaded:', data.toString());
  
  // Delete
  await deleteFile(result.publicId);
  console.log('Deleted');
}

test();
```

## Monitoring

### Cloudinary Dashboard

Monitor usage at: https://console.cloudinary.com/

**Key Metrics:**
- Storage used / 25 GB
- Bandwidth used / 25 GB per month
- Transformations used / 25,000 per month

### Set Up Alerts

1. Go to Settings → Notifications
2. Enable alerts for:
   - 80% storage quota
   - 80% bandwidth quota
   - Failed uploads

## Cost Comparison

### Free Tier (1,000 users, 3 stories each)

**Cloudinary:**
- Storage: 15 GB / 25 GB ✅ FREE
- Bandwidth: ~15 GB / 25 GB ✅ FREE
- **Total: $0/month**

**AWS S3:**
- Storage: 15 GB × $0.023 = $0.35
- PUT requests: 3,000 × $0.005/1000 = $0.015
- GET requests: ~10,000 × $0.0004/1000 = $0.004
- Data transfer: 15 GB × $0.09 = $1.35
- **Total: ~$1.70/month**

### At Scale (10,000 users)

**Cloudinary Plus ($99/month):**
- 100 GB storage
- 100 GB bandwidth
- Includes CDN

**AWS S3:**
- Storage: 150 GB × $0.023 = $3.45
- Requests: ~$0.50
- Data transfer: 150 GB × $0.09 = $13.50
- CloudFront CDN: ~$10
- **Total: ~$27.45/month**

## Rollback Plan

If you need to rollback to S3:

1. **Keep S3 code**: Don't delete `lib/s3.ts`
2. **Revert environment variables**: Use AWS credentials
3. **Update imports**: Change `lib/storage` → `lib/s3`
4. **Update database**: Change `storageKey` back to `s3Key`
5. **Migrate files**: Use AWS CLI to copy from Cloudinary

## Support

**Cloudinary:**
- Docs: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com/
- Community: https://community.cloudinary.com/

**Questions?**
- Check `docs/cloudinary-setup.md`
- Review `lib/storage.ts` code
- Test with `test-cloudinary.js`

## Next Steps

1. ✅ Sign up for Cloudinary
2. ✅ Configure credentials in `.env.local`
3. ✅ Test connection with `node test-cloudinary.js`
4. ✅ Start building file upload endpoints
5. ✅ Monitor usage in Cloudinary dashboard
