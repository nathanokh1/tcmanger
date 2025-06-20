import { logger } from '../utils/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  skipCache?: boolean;
}

export class CacheService {
  private isEnabled: boolean = false;

  constructor() {
    // For now, always disable Redis to stop the connection spam
    // TODO: Re-enable when Redis is properly configured
    this.isEnabled = false;
    logger.info('Cache service disabled (Redis not configured)');
  }

  /**
   * Check if caching is available
   */
  public isAvailable(): boolean {
    return false; // Always return false to disable caching
  }

  /**
   * Get value from cache (always returns null when disabled)
   */
  public async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    return null;
  }

  /**
   * Set value in cache (no-op when disabled)
   */
  public async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    // No-op
  }

  /**
   * Delete value from cache (no-op when disabled)
   */
  public async del(key: string, prefix?: string): Promise<void> {
    // No-op
  }

  /**
   * Clear cache by pattern (no-op when disabled)
   */
  public async clearPattern(pattern: string): Promise<void> {
    // No-op
  }

  /**
   * Cache with automatic retrieval and setting
   */
  public async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Always fetch data directly when cache is disabled
    return await fetcher();
  }

  /**
   * Increment a counter in cache (returns the amount when disabled)
   */
  public async increment(key: string, amount: number = 1, ttl?: number): Promise<number> {
    return amount;
  }

  /**
   * Check if key exists in cache (always returns false when disabled)
   */
  public async exists(key: string, prefix?: string): Promise<boolean> {
    return false;
  }

  /**
   * Get cache statistics (returns empty stats when disabled)
   */
  public async getStats(): Promise<any> {
    return {
      status: 'disabled',
      memory: 0,
      keys: 0,
      hits: 0,
      misses: 0
    };
  }

  /**
   * Flush all cache (no-op when disabled)
   */
  public async flush(): Promise<void> {
    // No-op
  }

  /**
   * Express middleware for caching (pass-through when disabled)
   */
  public middleware(defaultTTL: number = 300) {
    return (req: any, res: any, next: any) => {
      // Pass through without caching
      next();
    };
  }

  /**
   * Build cache key (utility function)
   */
  private buildKey(key: string, prefix?: string): string {
    const cleanKey = key.replace(/[^a-zA-Z0-9:_-]/g, '_');
    return prefix ? `${prefix}:${cleanKey}` : cleanKey;
  }

  /**
   * Disconnect (no-op when disabled)
   */
  public async disconnect(): Promise<void> {
    logger.info('Cache service disconnect (was already disabled)');
  }
}

// Export singleton instance
export const cacheService = new CacheService(); 