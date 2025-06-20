import Redis from 'ioredis';
import { logger } from '../utils/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  skipCache?: boolean;
}

export class CacheService {
  private redis: Redis | null = null;
  private isEnabled: boolean = false;
  private defaultTTL: number = 3600; // 1 hour default

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Check if Redis should be enabled
      const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING;
      
      if (!redisUrl && process.env.NODE_ENV === 'production') {
        logger.warn('Redis URL not found in production environment. Caching disabled.');
        return;
      }

      // For development, we can skip Redis if not available
      if (!redisUrl && process.env.NODE_ENV === 'development') {
        logger.info('Redis not configured for development. Caching disabled.');
        return;
      }

      // Initialize Redis connection
      this.redis = new Redis(redisUrl || 'redis://localhost:6379', {
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          return err.message.includes(targetError);
        }
      });

      // Test connection
      await this.redis.ping();
      this.isEnabled = true;
      logger.info('Redis cache service initialized successfully');

      // Handle Redis events
      this.redis.on('error', (error) => {
        logger.error('Redis connection error:', error);
        this.isEnabled = false;
      });

      this.redis.on('connect', () => {
        logger.info('Redis connected');
        this.isEnabled = true;
      });

      this.redis.on('disconnect', () => {
        logger.warn('Redis disconnected');
        this.isEnabled = false;
      });

    } catch (error) {
      logger.error('Failed to initialize Redis cache service:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Check if caching is available
   */
  public isAvailable(): boolean {
    return this.isEnabled && this.redis !== null;
  }

  /**
   * Get value from cache
   */
  public async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.isAvailable() || options.skipCache) {
      return null;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const cached = await this.redis!.get(fullKey);
      
      if (cached) {
        logger.debug(`Cache HIT: ${fullKey}`);
        return JSON.parse(cached);
      }
      
      logger.debug(`Cache MISS: ${fullKey}`);
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  public async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    if (!this.isAvailable() || options.skipCache) {
      return;
    }

    try {
      const fullKey = this.buildKey(key, options.prefix);
      const ttl = options.ttl || this.defaultTTL;
      const serialized = JSON.stringify(value);
      
      await this.redis!.setex(fullKey, ttl, serialized);
      logger.debug(`Cache SET: ${fullKey} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  public async del(key: string, prefix?: string): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const fullKey = this.buildKey(key, prefix);
      await this.redis!.del(fullKey);
      logger.debug(`Cache DELETE: ${fullKey}`);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Clear cache by pattern
   */
  public async clearPattern(pattern: string): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const keys = await this.redis!.keys(pattern);
      if (keys.length > 0) {
        await this.redis!.del(...keys);
        logger.info(`Cache cleared: ${keys.length} keys matching pattern ${pattern}`);
      }
    } catch (error) {
      logger.error(`Cache clear pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Cache with automatic retrieval and setting
   */
  public async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Fetch the data
    const data = await fetcher();
    
    // Store in cache for next time
    await this.set(key, data, options);
    
    return data;
  }

  /**
   * Increment a counter in cache
   */
  public async increment(key: string, amount: number = 1, ttl?: number): Promise<number> {
    if (!this.isAvailable()) {
      return amount;
    }

    try {
      const fullKey = this.buildKey(key);
      const newValue = await this.redis!.incrby(fullKey, amount);
      
      if (ttl) {
        await this.redis!.expire(fullKey, ttl);
      }
      
      return newValue;
    } catch (error) {
      logger.error(`Cache increment error for key ${key}:`, error);
      return amount;
    }
  }

  /**
   * Check if key exists in cache
   */
  public async exists(key: string, prefix?: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key, prefix);
      const exists = await this.redis!.exists(fullKey);
      return exists === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<any> {
    if (!this.isAvailable()) {
      return {
        enabled: false,
        connected: false
      };
    }

    try {
      const info = await this.redis!.info('memory');
      const stats = await this.redis!.info('stats');
      
      return {
        enabled: true,
        connected: true,
        memory: this.parseInfo(info),
        stats: this.parseInfo(stats)
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        enabled: true,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clear all cache
   */
  public async flush(): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      await this.redis!.flushdb();
      logger.info('Cache flushed successfully');
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }

  /**
   * Cache middleware for Express routes
   */
  public middleware(defaultTTL: number = 300) {
    return (req: any, res: any, next: any) => {
      // Add cache methods to request object
      req.cache = {
        get: (key: string, options?: CacheOptions) => this.get(key, options),
        set: (key: string, value: any, options?: CacheOptions) => this.set(key, value, options),
        del: (key: string, prefix?: string) => this.del(key, prefix),
        getOrSet: (key: string, fetcher: () => Promise<any>, options?: CacheOptions) => 
          this.getOrSet(key, fetcher, options)
      };

      // Helper method to cache responses
      req.cacheResponse = (key: string, ttl: number = defaultTTL) => {
        const originalSend = res.send;
        res.send = function(data: any) {
          // Cache the response data
          if (res.statusCode === 200) {
            req.cache.set(key, data, { ttl });
          }
          return originalSend.call(this, data);
        };
      };

      next();
    };
  }

  /**
   * Build cache key with optional prefix
   */
  private buildKey(key: string, prefix?: string): string {
    const basePrefix = process.env.CACHE_PREFIX || 'tcm';
    const fullPrefix = prefix ? `${basePrefix}:${prefix}` : basePrefix;
    return `${fullPrefix}:${key}`;
  }

  /**
   * Parse Redis info response
   */
  private parseInfo(info: string): any {
    const result: any = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (key && value !== undefined) {
          result[key] = isNaN(Number(value)) ? value : Number(value);
        }
      }
    }
    
    return result;
  }

  /**
   * Disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
      this.isEnabled = false;
      logger.info('Redis cache service disconnected');
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService(); 