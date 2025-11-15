import mongoose from 'mongoose';
import { setupMongoDBMonitoring } from './mongodb-monitoring';

interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  monitoringSetup: boolean;
}

// Extend global to include mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: ConnectionCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Initialize cache
let cached: ConnectionCache = global.mongoose || {
  conn: null,
  promise: null,
  monitoringSetup: false,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Database connection utility with connection pooling and error handling
 * Implements singleton pattern to reuse connections in serverless environment
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing connection promise if in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        cached.promise = null; // Reset promise on error
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;

    // Setup monitoring event listeners (only once)
    if (!cached.monitoringSetup) {
      setupMongoDBMonitoring();
      cached.monitoringSetup = true;
    }
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Disconnect from database (primarily for testing)
 */
async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('MongoDB disconnected');
  }
}

/**
 * Check if database is connected
 */
function isConnected(): boolean {
  return cached.conn !== null && mongoose.connection.readyState === 1;
}

export { connectDB, disconnectDB, isConnected };
export default connectDB;
