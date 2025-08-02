const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour default TTL
  }

  async connect() {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        retryDelayOnFailover: 100,
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
      console.error('❌ Failed to connect to Redis:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.redis) {
      await this.redis.disconnect();
      this.isConnected = false;
    }
  }

  // Get data from cache
  async get(key) {
    if (!this.isConnected) return null;
    
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  // Set data in cache with TTL
  async set(key, data, ttl = this.defaultTTL) {
    if (!this.isConnected) return false;
    
    try {
      await this.redis.setex(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error.message);
      return false;
    }
  }

  // Delete data from cache
  async del(key) {
    if (!this.isConnected) return false;
    
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error.message);
      return false;
    }
  }

  // Delete multiple keys matching pattern
  async delPattern(pattern) {
    if (!this.isConnected) return false;
    
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error.message);
      return false;
    }
  }

  // Check if key exists
  async exists(key) {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error.message);
      return false;
    }
  }

  // Set expiration for existing key
  async expire(key, ttl) {
    if (!this.isConnected) return false;
    
    try {
      await this.redis.expire(key, ttl);
      return true;
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error.message);
      return false;
    }
  }

  // Get multiple keys at once
  async mget(keys) {
    if (!this.isConnected || !keys.length) return [];
    
    try {
      const results = await this.redis.mget(...keys);
      return results.map(result => result ? JSON.parse(result) : null);
    } catch (error) {
      console.error(`Cache mget error:`, error.message);
      return [];
    }
  }

  // Set multiple key-value pairs
  async mset(keyValuePairs, ttl = this.defaultTTL) {
    if (!this.isConnected || !keyValuePairs.length) return false;
    
    try {
      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of keyValuePairs) {
        pipeline.setex(key, ttl, JSON.stringify(value));
      }
      
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error(`Cache mset error:`, error.message);
      return false;
    }
  }

  // Increment a counter
  async incr(key, amount = 1) {
    if (!this.isConnected) return null;
    
    try {
      const result = await this.redis.incrby(key, amount);
      return result;
    } catch (error) {
      console.error(`Cache incr error for key ${key}:`, error.message);
      return null;
    }
  }

  // Get cache statistics
  async getStats() {
    if (!this.isConnected) return null;
    
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      
      return {
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace
      };
    } catch (error) {
      console.error('Cache stats error:', error.message);
      return null;
    }
  }

  // Clear all cache
  async flush() {
    if (!this.isConnected) return false;
    
    try {
      await this.redis.flushdb();
      console.log('🧹 Cache cleared successfully');
      return true;
    } catch (error) {
      console.error('Cache flush error:', error.message);
      return false;
    }
  }

  // Generate cache keys for different data types
  generateKey(type, id, suffix = '') {
    const key = `fieldpro:${type}:${id}`;
    return suffix ? `${key}:${suffix}` : key;
  }

  // Cache keys for common data types
  keys = {
    user: (id) => this.generateKey('user', id),
    organization: (id) => this.generateKey('org', id),
    customer: (id) => this.generateKey('customer', id),
    job: (id) => this.generateKey('job', id),
    jobs: (orgId) => this.generateKey('jobs', orgId, 'list'),
    customers: (orgId) => this.generateKey('customers', orgId, 'list'),
    inventory: (orgId) => this.generateKey('inventory', orgId, 'list'),
    equipment: (orgId) => this.generateKey('equipment', orgId, 'list'),
    session: (sessionId) => this.generateKey('session', sessionId),
    apiRate: (ip) => this.generateKey('rate', ip),
  };
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
