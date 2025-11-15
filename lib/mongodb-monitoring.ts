/**
 * MongoDB Atlas monitoring utilities
 * Tracks database performance, connection health, and query metrics
 */

import mongoose from 'mongoose';
import { logger } from './logger';
import { recordMetric, MetricType } from './monitoring';

/**
 * MongoDB connection statistics
 */
export interface MongoDBStats {
  connected: boolean;
  readyState: string;
  host?: string;
  port?: number;
  database?: string;
  collections: number;
  indexes: number;
  connectionPool: {
    current: number;
    available: number;
    inUse: number;
  };
}

export interface CollectionStats {
  count: number;
  collection: string;
}

/**
 * Get MongoDB connection statistics
 */
export async function getMongoDBStats(): Promise<MongoDBStats | null> {
  try {
    const connection = mongoose.connection;

    if (connection.readyState !== 1) {
      logger.warn('MongoDB not connected', {
        readyState: getReadyStateString(connection.readyState),
      });

      return {
        connected: false,
        readyState: getReadyStateString(connection.readyState),
        collections: 0,
        indexes: 0,
        connectionPool: {
          current: 0,
          available: 0,
          inUse: 0,
        },
      };
    }

    // Get database stats
    const db = connection.db;
    
    if (!db) {
      logger.warn('MongoDB database not available');
      return null;
    }
    
    await db.stats();

    // Get collection count
    const collections = await db.listCollections().toArray();

    // Get total index count across all collections
    let totalIndexes = 0;
    for (const collection of collections) {
      const indexes = await db
        .collection(collection.name)
        .listIndexes()
        .toArray();
      totalIndexes += indexes.length;
    }

    const stats: MongoDBStats = {
      connected: true,
      readyState: getReadyStateString(connection.readyState),
      host: connection.host,
      port: connection.port,
      database: connection.name,
      collections: collections.length,
      indexes: totalIndexes,
      connectionPool: {
        current: 0, // Connection pool info not directly accessible in Mongoose
        available: 0,
        inUse: 0,
      },
    };

    logger.info('MongoDB stats retrieved', {
      database: stats.database,
      collections: stats.collections,
      indexes: stats.indexes,
    });

    // Record metrics
    recordMetric({
      name: 'mongodb.collections.count',
      type: MetricType.GAUGE,
      value: stats.collections,
      timestamp: new Date().toISOString(),
    });

    recordMetric({
      name: 'mongodb.indexes.count',
      type: MetricType.GAUGE,
      value: stats.indexes,
      timestamp: new Date().toISOString(),
    });

    recordMetric({
      name: 'mongodb.connections.inUse',
      type: MetricType.GAUGE,
      value: stats.connectionPool.inUse,
      timestamp: new Date().toISOString(),
    });

    return stats;
  } catch (error: unknown) {
    logger.error('Failed to retrieve MongoDB stats', error);
    return null;
  }
}

/**
 * Get MongoDB ready state as string
 */
function getReadyStateString(state: number): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return states[state] || 'unknown';
}

/**
 * Track MongoDB query performance
 */
export function trackMongoDBQuery(
  collection: string,
  operation: string,
  duration: number,
  success: boolean
) {
  recordMetric({
    name: 'mongodb.query.duration',
    type: MetricType.HISTOGRAM,
    value: duration,
    timestamp: new Date().toISOString(),
    tags: {
      collection,
      operation,
      success: String(success),
    },
  });

  if (!success) {
    recordMetric({
      name: 'mongodb.query.errors',
      type: MetricType.COUNTER,
      value: 1,
      timestamp: new Date().toISOString(),
      tags: {
        collection,
        operation,
      },
    });
  }

  // Log slow queries (> 1 second)
  if (duration > 1000) {
    logger.warn('Slow MongoDB query detected', {
      collection,
      operation,
      duration,
    });
  }
}

/**
 * Monitor MongoDB connection health
 */
export async function monitorMongoDBHealth(): Promise<void> {
  const stats = await getMongoDBStats();

  if (!stats) {
    logger.error('Unable to monitor MongoDB health - stats unavailable');
    return;
  }

  if (!stats.connected) {
    logger.critical('MongoDB disconnected', undefined, {
      readyState: stats.readyState,
    });
    return;
  }

  // Check connection pool usage
  const poolUsagePercentage =
    stats.connectionPool.current > 0
      ? (stats.connectionPool.inUse / stats.connectionPool.current) * 100
      : 0;

  if (poolUsagePercentage > 80) {
    logger.warn('MongoDB connection pool usage high', {
      percentage: poolUsagePercentage,
      inUse: stats.connectionPool.inUse,
      total: stats.connectionPool.current,
    });
  }

  // Check for missing indexes (collections without indexes)
  if (stats.collections > 0 && stats.indexes === 0) {
    logger.warn('MongoDB collections have no indexes', {
      collections: stats.collections,
    });
  }
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(
  collectionName: string
): Promise<CollectionStats | null> {
  try {
    const connection = mongoose.connection;

    if (connection.readyState !== 1 || !connection.db) {
      logger.warn('MongoDB not connected');
      return null;
    }

    const collection = connection.db.collection(collectionName);
    const count = await collection.countDocuments();

    const collectionStats: CollectionStats = {
      count,
      collection: collectionName,
    };

    logger.info(`Collection stats retrieved: ${collectionName}`, {
      count,
    });

    // Record metrics
    recordMetric({
      name: 'mongodb.collection.documents',
      type: MetricType.GAUGE,
      value: count,
      timestamp: new Date().toISOString(),
      tags: { collection: collectionName },
    });

    return collectionStats;
  } catch (error: unknown) {
    logger.error(`Failed to retrieve stats for collection: ${collectionName}`, error);
    return null;
  }
}

/**
 * Monitor database size and alert if approaching limits
 */
export async function monitorDatabaseSize(): Promise<void> {
  try {
    const connection = mongoose.connection;

    if (connection.readyState !== 1 || !connection.db) {
      return;
    }

    const dbStats = await connection.db.stats();

    const sizeInMB = dbStats.dataSize / (1024 * 1024);
    const storageSizeInMB = dbStats.storageSize / (1024 * 1024);

    logger.info('Database size monitored', {
      dataSize: `${sizeInMB.toFixed(2)} MB`,
      storageSize: `${storageSizeInMB.toFixed(2)} MB`,
      collections: dbStats.collections,
      objects: dbStats.objects,
    });

    recordMetric({
      name: 'mongodb.database.size',
      type: MetricType.GAUGE,
      value: sizeInMB,
      timestamp: new Date().toISOString(),
      tags: { unit: 'MB' },
    });

    // Alert if database is getting large (adjust threshold as needed)
    if (sizeInMB > 1000) {
      // 1 GB
      logger.warn('Database size exceeds 1 GB', {
        dataSize: `${sizeInMB.toFixed(2)} MB`,
      });
    }
  } catch (error: unknown) {
    logger.error('Failed to monitor database size', error);
  }
}

/**
 * Setup MongoDB event listeners for monitoring
 */
export function setupMongoDBMonitoring(): void {
  const connection = mongoose.connection;

  connection.on('connected', () => {
    logger.info('MongoDB connected', {
      host: connection.host,
      port: connection.port,
      database: connection.name,
    });

    recordMetric({
      name: 'mongodb.connection.status',
      type: MetricType.GAUGE,
      value: 1,
      timestamp: new Date().toISOString(),
      tags: { status: 'connected' },
    });
  });

  connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');

    recordMetric({
      name: 'mongodb.connection.status',
      type: MetricType.GAUGE,
      value: 0,
      timestamp: new Date().toISOString(),
      tags: { status: 'disconnected' },
    });
  });

  connection.on('error', (error) => {
    logger.error('MongoDB connection error', error);

    recordMetric({
      name: 'mongodb.connection.errors',
      type: MetricType.COUNTER,
      value: 1,
      timestamp: new Date().toISOString(),
    });
  });

  connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');

    recordMetric({
      name: 'mongodb.connection.reconnects',
      type: MetricType.COUNTER,
      value: 1,
      timestamp: new Date().toISOString(),
    });
  });

  logger.info('MongoDB monitoring event listeners setup complete');
}
