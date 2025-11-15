# MongoDB Atlas Setup Guide for DataStory AI

This guide walks you through setting up MongoDB Atlas for DataStory AI.

## Prerequisites

- MongoDB Atlas account (free tier available)
- Basic understanding of MongoDB

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with email or Google/GitHub
3. Verify your email address

## Step 2: Create a Cluster

### Free Tier (M0) - Recommended for Development

1. Click "Build a Database"
2. Choose **Shared** (Free tier)
3. Select cloud provider and region:
   - **Provider**: AWS (recommended)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
4. **Cluster Name**: `datastory-ai-dev`
5. Click "Create Cluster"

### Production Tier (M10+)

For production, use at least M10:

- **Tier**: M10 (2GB RAM, 10GB storage)
- **Region**: Same as your application
- **Backup**: Enable continuous backups
- **Auto-scaling**: Enable for storage

**Estimated Cost**: M10 starts at ~$57/month

## Step 3: Configure Network Access

### Add IP Whitelist

1. Go to **Network Access** in left sidebar
2. Click "Add IP Address"
3. For development:
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ **Not recommended for production**
4. For production:
   - Add specific IP addresses or CIDR blocks
   - Add Vercel IP ranges (see below)

### Vercel IP Ranges

If deploying to Vercel, whitelist these IP ranges:

```
76.76.21.0/24
76.76.21.21
76.76.21.142
76.76.21.164
76.76.21.241
```

Or use MongoDB Atlas's Vercel integration for automatic configuration.

## Step 4: Create Database User

1. Go to **Database Access** in left sidebar
2. Click "Add New Database User"
3. Configure user:
   - **Authentication Method**: Password
   - **Username**: `datastory-app`
   - **Password**: datastory-app
   - **Database User Privileges**: Read and write to any database
4. Click "Add User"

**Security Best Practices:**

- Use strong, randomly generated passwords
- Create separate users for dev/staging/production
- Use least privilege principle (specific database access)

## Step 5: Get Connection String

1. Go to **Database** in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. Copy the connection string:

```
mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
```

6. Replace `<username>` and `<password>` with your credentials
7. Add database name: `mongodb+srv://...mongodb.net/datastory-ai?retryWrites=true&w=majority`

## Step 6: Configure Environment Variables

Add to your `.env.local`:

```bash
DATABASE_URL=mongodb+srv://datastory-app:YOUR_PASSWORD@cluster.mongodb.net/datastory-ai?retryWrites=true&w=majority
```

**⚠️ Security Warning:**

- Never commit `.env.local` to version control
- Use different credentials for dev/staging/production
- Rotate passwords regularly

## Step 7: Test Connection

Create a test script:

```typescript
import connectDB, { isConnected } from "@/lib/db";

async function testConnection() {
  try {
    await connectDB();
    console.log("✅ MongoDB connected:", isConnected());

    // Test a simple query
    const { User } = await import("@/lib/models");
    const count = await User.countDocuments();
    console.log("✅ User count:", count);

    console.log("\n🎉 MongoDB Atlas is configured correctly!");
  } catch (error) {
    console.error("❌ Connection failed:", error);
  }
}

testConnection();
```

## Step 8: Create Indexes (Optional but Recommended)

Indexes improve query performance. Our models already define indexes, but you can verify them:

```typescript
import connectDB from "@/lib/db";
import { User, Story, Job, Session } from "@/lib/models";

async function createIndexes() {
  await connectDB();

  // Indexes are created automatically on first use
  // But you can manually ensure them:
  await User.createIndexes();
  await Story.createIndexes();
  await Job.createIndexes();
  await Session.createIndexes();

  console.log("✅ All indexes created");
}

createIndexes();
```

## Database Structure

DataStory AI uses these collections:

```
datastory-ai/
├── users          # User accounts and authentication
├── stories        # Generated data stories
├── jobs           # Async processing jobs
└── sessions       # User sessions
```

## Monitoring and Alerts

### Enable Monitoring

1. Go to **Metrics** tab in your cluster
2. Monitor:
   - **Connections**: Should stay below 100 for M0, 500 for M10
   - **Operations**: Track reads/writes per second
   - **Storage**: Monitor disk usage
   - **Network**: Track data transfer

### Set Up Alerts

1. Go to **Alerts** in left sidebar
2. Create alerts for:
   - **Connections**: Alert when > 80% of max
   - **Disk Usage**: Alert when > 80% full
   - **Replication Lag**: Alert when > 10 seconds
   - **Query Performance**: Alert on slow queries (> 1s)

## Performance Optimization

### Connection Pooling

Our `lib/db.ts` already implements connection pooling:

```typescript
const opts = {
  maxPoolSize: 10, // Max connections
  minPoolSize: 2, // Min connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};
```

### Query Optimization

1. **Use indexes**: All frequently queried fields are indexed
2. **Limit results**: Use `.limit()` for pagination
3. **Select fields**: Use `.select()` to fetch only needed fields
4. **Avoid $where**: Use native operators instead

Example:

```typescript
// Good: Uses index on userId
const stories = await Story.find({ userId })
  .select("title createdAt dataset.rowCount")
  .sort({ createdAt: -1 })
  .limit(20);

// Bad: Full collection scan
const stories = await Story.find({}).sort({ createdAt: -1 });
```

## Backup and Recovery

### Automatic Backups (M10+)

1. Go to **Backup** tab
2. Enable continuous backups
3. Configure:
   - **Snapshot frequency**: Every 6 hours
   - **Retention**: 7 days (free), up to 365 days (paid)
   - **Point-in-time restore**: Last 24 hours

### Manual Backup (All Tiers)

```bash
# Export entire database
mongodump --uri="mongodb+srv://..." --out=./backup

# Export specific collection
mongodump --uri="mongodb+srv://..." --collection=users --out=./backup

# Restore from backup
mongorestore --uri="mongodb+srv://..." ./backup
```

## Security Best Practices

1. **Enable encryption at rest**: Enabled by default on Atlas
2. **Use TLS/SSL**: Always use `mongodb+srv://` (TLS enabled)
3. **Rotate credentials**: Change passwords quarterly
4. **Audit logs**: Enable on M10+ for compliance
5. **VPC Peering**: Use for production (AWS/GCP/Azure)
6. **Private endpoints**: Avoid public internet access
7. **Database-level permissions**: Restrict user access

## Cost Optimization

### Free Tier (M0) Limits

- **Storage**: 512 MB
- **RAM**: Shared
- **Connections**: 500 max
- **Backups**: None
- **Good for**: Development, small projects

### Scaling Strategy

1. **Start with M0**: Free tier for development
2. **Upgrade to M10**: When you hit 500 MB or need backups
3. **Enable auto-scaling**: Storage scales automatically
4. **Monitor costs**: Use Atlas billing dashboard

### Cost Estimation

**M10 Cluster (Production):**

- Base: $57/month
- Storage: $0.25/GB/month (beyond 10GB)
- Backups: $0.20/GB/month
- Data transfer: $0.10/GB

**Example for 1,000 users:**

- 1,000 users × 3 stories × 100KB metadata = 300 MB
- Total storage: ~1 GB
- Monthly cost: **~$57-60/month**

## Troubleshooting

### Error: "Authentication failed"

**Cause**: Incorrect username or password

**Solution**:

1. Verify credentials in `.env.local`
2. Check user exists in Database Access
3. Ensure password doesn't contain special characters (URL encode if needed)

### Error: "Connection timeout"

**Cause**: IP not whitelisted or network issues

**Solution**:

1. Add your IP to Network Access whitelist
2. Check firewall settings
3. Verify connection string is correct
4. Try `0.0.0.0/0` temporarily to test

### Error: "Too many connections"

**Cause**: Connection pool exhausted

**Solution**:

1. Reduce `maxPoolSize` in connection options
2. Ensure connections are properly closed
3. Upgrade to higher tier (M10+)
4. Check for connection leaks in code

### Slow Queries

**Cause**: Missing indexes or inefficient queries

**Solution**:

1. Use MongoDB Atlas Performance Advisor
2. Check slow query logs
3. Add indexes for frequently queried fields
4. Use `.explain()` to analyze queries

## Production Checklist

Before going to production:

- [ ] Upgrade to M10 or higher
- [ ] Enable continuous backups
- [ ] Configure IP whitelist (remove 0.0.0.0/0)
- [ ] Set up monitoring alerts
- [ ] Enable audit logs
- [ ] Use VPC peering or private endpoints
- [ ] Create separate users for different environments
- [ ] Document connection strings securely
- [ ] Test backup and restore procedures
- [ ] Set up automated index creation
- [ ] Configure data retention policies

## MongoDB Atlas Features

### Performance Advisor

Automatically suggests indexes based on query patterns:

1. Go to **Performance Advisor** tab
2. Review suggested indexes
3. Create recommended indexes with one click

### Real-Time Performance Panel

Monitor live database performance:

- Query execution times
- Index usage
- Collection scans
- Memory usage

### Data Explorer

Browse and query data directly in Atlas:

1. Go to **Collections** tab
2. Select database and collection
3. Use filters to query data
4. Export results as JSON/CSV

## Vercel Integration

MongoDB Atlas has native Vercel integration:

1. Go to Vercel project settings
2. Integrations → Browse Marketplace
3. Search "MongoDB Atlas"
4. Install and authorize
5. Select cluster and database
6. Environment variables added automatically

## Next Steps

After MongoDB Atlas is configured:

1. ✅ Test connection from your application
2. ✅ Verify all models work correctly
3. ✅ Create test data for development
4. ✅ Set up monitoring and alerts
5. ✅ Document connection strings for team
6. ✅ Plan backup and disaster recovery strategy

## Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [Atlas Pricing Calculator](https://www.mongodb.com/pricing)
- [Best Practices](https://docs.atlas.mongodb.com/best-practices/)
