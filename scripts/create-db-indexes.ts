/**
 * Database Index Creation Script
 * Creates optimal indexes for MongoDB collections to improve query performance
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function createIndexes() {
  console.log('DataStory AI - Database Index Creation');
  console.log('======================================\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✓ Connected to MongoDB\n');

    const db = client.db();

    // Users collection indexes
    console.log('Creating indexes for users collection...');
    const usersCollection = db.collection('users');
    
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('  ✓ Created unique index on email');
    
    await usersCollection.createIndex({ tier: 1 });
    console.log('  ✓ Created index on tier');
    
    await usersCollection.createIndex({ createdAt: -1 });
    console.log('  ✓ Created index on createdAt');
    
    await usersCollection.createIndex({ lastLoginAt: -1 });
    console.log('  ✓ Created index on lastLoginAt');

    // Stories collection indexes
    console.log('\nCreating indexes for stories collection...');
    const storiesCollection = db.collection('stories');
    
    await storiesCollection.createIndex({ userId: 1, createdAt: -1 });
    console.log('  ✓ Created compound index on userId + createdAt');
    
    await storiesCollection.createIndex({ userId: 1, visibility: 1 });
    console.log('  ✓ Created compound index on userId + visibility');
    
    await storiesCollection.createIndex({ shareToken: 1 }, { sparse: true });
    console.log('  ✓ Created sparse index on shareToken');
    
    await storiesCollection.createIndex({ createdAt: -1 });
    console.log('  ✓ Created index on createdAt');

    // Jobs collection indexes
    console.log('\nCreating indexes for jobs collection...');
    const jobsCollection = db.collection('jobs');
    
    await jobsCollection.createIndex({ jobId: 1 }, { unique: true });
    console.log('  ✓ Created unique index on jobId');
    
    await jobsCollection.createIndex({ userId: 1, status: 1 });
    console.log('  ✓ Created compound index on userId + status');
    
    await jobsCollection.createIndex({ status: 1, createdAt: -1 });
    console.log('  ✓ Created compound index on status + createdAt');
    
    await jobsCollection.createIndex({ createdAt: -1 });
    console.log('  ✓ Created index on createdAt');
    
    // TTL index for old completed/failed jobs (delete after 7 days)
    await jobsCollection.createIndex(
      { updatedAt: 1 },
      { 
        expireAfterSeconds: 7 * 24 * 60 * 60,
        partialFilterExpression: { 
          status: { $in: ['completed', 'failed'] } 
        }
      }
    );
    console.log('  ✓ Created TTL index for job cleanup');

    // Sessions collection indexes
    console.log('\nCreating indexes for sessions collection...');
    const sessionsCollection = db.collection('sessions');
    
    await sessionsCollection.createIndex({ token: 1 }, { unique: true });
    console.log('  ✓ Created unique index on token');
    
    await sessionsCollection.createIndex({ userId: 1 });
    console.log('  ✓ Created index on userId');
    
    // TTL index for expired sessions
    await sessionsCollection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );
    console.log('  ✓ Created TTL index for session expiration');

    // List all indexes
    console.log('\n' + '='.repeat(50));
    console.log('Index Summary:');
    console.log('='.repeat(50) + '\n');

    const collections = ['users', 'stories', 'jobs', 'sessions'];
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();
      console.log(`${collectionName}:`);
      indexes.forEach(index => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      });
      console.log('');
    }

    console.log('✓ All indexes created successfully!\n');

    // Performance recommendations
    console.log('Performance Recommendations:');
    console.log('============================\n');
    console.log('1. Monitor index usage with db.collection.stats()');
    console.log('2. Use explain() to analyze query performance');
    console.log('3. Consider adding indexes for custom queries');
    console.log('4. Review slow query logs regularly');
    console.log('5. Update indexes as query patterns change\n');

  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('✓ Database connection closed');
  }
}

// Run the script
createIndexes().catch(console.error);
