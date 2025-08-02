import Redis from 'ioredis';

interface CacheStats {
  connected: boolean;
  memory: string;
  keyspace: string;
}

class CacheService {
  private redis: Redis | null = null;
  private isConnected: boolean = false;
  private defaultTTL: number = 3600; // 1 hour default TTL

  async connect(): Promise<boolean> {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      this.redis.on('connect', () => {
        console.log('🔗 Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('error', (err) => {
        console.error('❌ Redis connection error:', err.message);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });

      await this.redis.connect();
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', (error as Error).message);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
      this.isConnected = false;
    }
  }

  // Get data from cache
  async get(key: string): Promise<any> {
    if (!this.isConnected || !this.redis) return null;

    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(
        `Cache get error for key ${key}:`,
        (error as Error).message
      );
      return null;
    }
  }

  // Set data in cache with TTL
  async set(
    key: string,
    data: any,
    ttl: number = this.defaultTTL
  ): Promise<boolean> {
    if (!this.isConnected || !this.redis) return false;

    try {
      await this.redis.setex(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(
        `Cache set error for key ${key}:`,
        (error as Error).message
      );
      return false;
    }
  }

  // Delete data from cache
  async del(key: string): Promise<boolean> {
    if (!this.isConnected || !this.redis) return false;

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error(
        `Cache delete error for key ${key}:`,
        (error as Error).message
      );
      return false;
    }
  }

  // Delete multiple keys matching pattern
  async delPattern(pattern: string): Promise<boolean> {
    if (!this.isConnected || !this.redis) return false;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(
        `Cache delete pattern error for ${pattern}:`,
        (error as Error).message
      );
      return false;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.redis) return false;

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(
        `Cache exists error for key ${key}:`,
        (error as Error).message
      );
      return false;
    }
  }

  // Set expiration for existing key
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isConnected || !this.redis) return false;

    try {
      await this.redis.expire(key, ttl);
      return true;
    } catch (error) {
      console.error(
        `Cache expire error for key ${key}:`,
        (error as Error).message
      );
      return false;
    }
  }

  // Get multiple keys at once
  async mget(keys: string[]): Promise<any[]> {
    if (!this.isConnected || !this.redis || !keys.length) return [];

    try {
      const results = await this.redis.mget(...keys);
      return results.map((result) => (result ? JSON.parse(result) : null));
    } catch (error) {
      console.error(`Cache mget error:`, (error as Error).message);
      return [];
    }
  }

  // Set multiple key-value pairs
  async mset(
    keyValuePairs: [string, any][],
    ttl: number = this.defaultTTL
  ): Promise<boolean> {
    if (!this.isConnected || !this.redis || !keyValuePairs.length) return false;

    try {
      const pipeline = this.redis.pipeline();

      for (const [key, value] of keyValuePairs) {
        pipeline.setex(key, ttl, JSON.stringify(value));
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      console.error(`Cache mset error:`, (error as Error).message);
      return false;
    }
  }

  // Increment a counter
  async incr(key: string, amount: number = 1): Promise<number | null> {
    if (!this.isConnected || !this.redis) return null;

    try {
      const result = await this.redis.incrby(key, amount);
      return result;
    } catch (error) {
      console.error(
        `Cache incr error for key ${key}:`,
        (error as Error).message
      );
      return null;
    }
  }

  // Get cache statistics
  async getStats(): Promise<CacheStats | null> {
    if (!this.isConnected || !this.redis) return null;

    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');

      return {
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace,
      };
    } catch (error) {
      console.error('Cache stats error:', (error as Error).message);
      return null;
    }
  }

  // Clear all cache
  async flush(): Promise<boolean> {
    if (!this.isConnected || !this.redis) return false;

    try {
      await this.redis.flushdb();
      console.log('🧹 Cache cleared successfully');
      return true;
    } catch (error) {
      console.error('Cache flush error:', (error as Error).message);
      return false;
    }
  }

  // Generate cache keys for different data types
  generateKey(type: string, id: string, suffix: string = ''): string {
    const key = `fieldpro:${type}:${id}`;
    return suffix ? `${key}:${suffix}` : key;
  }

  // Cache keys for common data types
  keys = {
    user: (id: string) => this.generateKey('user', id),
    organization: (id: string) => this.generateKey('org', id),
    customer: (id: string) => this.generateKey('customer', id),
    job: (id: string) => this.generateKey('job', id),
    jobs: (orgId: string) => this.generateKey('jobs', orgId, 'list'),
    customers: (orgId: string) => this.generateKey('customers', orgId, 'list'),
    inventory: (orgId: string) => this.generateKey('inventory', orgId, 'list'),
    equipment: (orgId: string) => this.generateKey('equipment', orgId, 'list'),
    session: (sessionId: string) => this.generateKey('session', sessionId),
    apiRate: (ip: string) => this.generateKey('rate', ip),
  };
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;
