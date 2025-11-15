# Cloudinary Setup Guide for DataStory AI

This guide walks you through setting up Cloudinary for file storage in DataStory AI.

## Why Cloudinary?

- **Free Tier**: 25 GB storage, 25 GB bandwidth/month
- **Easy Setup**: No complex IAM policies or bucket configurations
- **Fast**: Global CDN included
- **Simple API**: Easier than S3 for most use cases
- **Automatic Optimization**: Built-in file optimization

## Step 1: Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up with email or Google/GitHub
3. Verify your email address
4. Complete the onboarding

## Step 2: Get Your Credentials

After signing in:

1. Go to your [Dashboard](https://console.cloudinary.com/)
2. You'll see your credentials:
   - **Cloud Name**: Your unique cloud identifier
   - **API Key**: Your API key
   - **API Secret**: Your API secret (click "eye" icon to reveal)

## Step 3: Configure Environment Variables

Add these to your `.env.local`:

```bash
# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Example:**

```bash
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

**⚠️ Security Warning:**

- Never commit `.env.local` to version control
- Add `.env.local` to `.gitignore`
- Use different credentials for development and production
- Keep your API Secret secure

## Step 4: Configure Upload Settings (Optional)

### Enable Unsigned Uploads (for direct browser uploads)

1. Go to Settings → Upload
2. Enable "Unsigned uploading"
3. Create an upload preset:
   - Name: `datastory-uploads`
   - Signing Mode: Unsigned
   - Folder: `datastory-uploads`
   - Resource Type: Auto

### Set Upload Restrictions

1. Go to Settings → Security
2. Configure:
   - **Allowed formats**: csv, xlsx, xls, json
   - **Max file size**: 10 MB (adjust as needed)
   - **Max image dimensions**: N/A (we're uploading data files)

## Step 5: Test Your Configuration

Create a test file `test-cloudinary.js`:

```javascript
require("dotenv").config({ path: ".env.local" });
const { uploadFile, downloadFile, deleteFile } = require("./lib/storage");

async function testCloudinary() {
  try {
    console.log("🧪 Testing Cloudinary...\n");

    // Test upload
    const testData = Buffer.from("Hello, DataStory!");
    const result = await uploadFile(testData, "test.txt", {
      folder: "test",
      tags: ["test"],
    });
    console.log("✅ Upload successful:", result.secureUrl);

    // Test download
    const downloaded = await downloadFile(result.publicId);
    console.log("✅ Download successful:", downloaded.toString());

    // Test delete
    await deleteFile(result.publicId);
    console.log("✅ Delete successful");

    console.log("\n🎉 Cloudinary is configured correctly!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testCloudinary();
```

Run the test:

```bash
node test-cloudinary.js
```

## Usage Examples

### Upload a CSV File

```typescript
import { uploadFile } from "@/lib/storage";

// From file upload
const buffer = await file.arrayBuffer();
const result = await uploadFile(Buffer.from(buffer), file.name, {
  folder: `datastory-uploads/${userId}`,
  tags: ["csv", "user-upload"],
});

console.log("File URL:", result.secureUrl);
console.log("Public ID:", result.publicId); // Save this to database
```

### Download a File

```typescript
import { downloadFile } from "@/lib/storage";

const fileBuffer = await downloadFile(publicId);
// Process the file...
```

### Get Secure URL (with expiration)

```typescript
import { getSecureUrl } from "@/lib/storage";

// Generate URL that expires in 1 hour
const url = getSecureUrl(publicId, 3600);
```

### Delete a File

```typescript
import { deleteFile } from "@/lib/storage";

await deleteFile(publicId);
```

## Folder Structure

Organize files in Cloudinary with this structure:

```
datastory-uploads/
├── user-id-1/
│   ├── 1234567890-data.csv
│   └── 1234567891-sales.xlsx
└── user-id-2/
    └── 1234567892-report.csv
```

This is automatically handled by the `generateUploadKey()` function.

## Free Tier Limits

**Cloudinary Free Plan:**

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **API calls**: Unlimited

**Estimated Usage for 1,000 users:**

- Average file size: 5 MB
- 3 uploads/user/month = 3,000 uploads
- Total storage: 15 GB
- Total bandwidth: ~15 GB/month
- **Cost**: FREE (within limits)

## Upgrade Options

If you exceed free tier:

**Plus Plan ($99/month):**

- 100 GB storage
- 100 GB bandwidth
- 100,000 transformations

**Advanced Plan ($249/month):**

- 500 GB storage
- 500 GB bandwidth
- 500,000 transformations

## Security Best Practices

1. **Use signed URLs**: For sensitive files
2. **Set upload restrictions**: Limit file types and sizes
3. **Enable moderation**: Review uploads if needed
4. **Use folders**: Organize by user/project
5. **Rotate credentials**: Change API keys regularly
6. **Monitor usage**: Set up alerts for quota limits

## Cloudinary Features

### Automatic Optimization

Cloudinary automatically optimizes files:

- Compression
- Format conversion
- Lazy loading support

### Transformations

You can transform files on-the-fly:

```typescript
const url = cloudinary.url(publicId, {
  width: 800,
  height: 600,
  crop: "fill",
  quality: "auto",
  fetch_format: "auto",
});
```

### Backup and Versioning

- **Automatic backups**: Included in paid plans
- **Version history**: Keep previous versions
- **Restore deleted files**: Within 30 days (paid plans)

## Monitoring

### Dashboard Metrics

Monitor in your Cloudinary dashboard:

- Storage usage
- Bandwidth usage
- Transformations count
- API calls
- Popular files

### Set Up Alerts

1. Go to Settings → Notifications
2. Configure alerts for:
   - Storage quota (80% threshold)
   - Bandwidth quota (80% threshold)
   - Failed uploads

## Troubleshooting

### Error: "Invalid API credentials"

**Cause**: Incorrect credentials in `.env.local`

**Solution**:

1. Verify credentials in Cloudinary dashboard
2. Check for typos in environment variables
3. Ensure no extra spaces in values
4. Restart your dev server after changes

### Error: "Upload failed"

**Cause**: File size or format restrictions

**Solution**:

1. Check file size limits in Settings → Upload
2. Verify allowed formats
3. Check your quota usage

### Error: "Resource not found"

**Cause**: Incorrect public_id or file deleted

**Solution**:

1. Verify the public_id is correct
2. Check if file exists in Media Library
3. Ensure resource_type matches (raw, image, video)

## Migration from S3

If you need to migrate from S3 later:

1. **Keep the interface**: Our storage utility uses the same function names
2. **Update imports**: Change from `lib/s3` to `lib/storage`
3. **Update database**: Change `s3Key` to `storageKey` (already done)
4. **Migrate files**: Use Cloudinary's fetch API to import from S3

## Cloudinary vs S3

| Feature         | Cloudinary         | AWS S3                  |
| --------------- | ------------------ | ----------------------- |
| Setup           | Easy               | Complex                 |
| Free Tier       | 25 GB              | 5 GB (12 months)        |
| CDN             | Included           | Extra cost              |
| Transformations | Built-in           | Manual                  |
| Pricing         | Simple             | Complex                 |
| Best For        | Quick setup, media | Enterprise, large scale |

## Next Steps

After Cloudinary is configured:

1. ✅ Test upload/download with sample files
2. ✅ Verify URLs are accessible
3. ✅ Set up upload restrictions
4. ✅ Monitor usage in dashboard
5. ✅ Configure alerts for quota limits

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Upload API](https://cloudinary.com/documentation/upload_images)
- [Pricing](https://cloudinary.com/pricing)
- [Status Page](https://status.cloudinary.com/)

## Support

- [Help Center](https://support.cloudinary.com/)
- [Community Forum](https://community.cloudinary.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/cloudinary)
