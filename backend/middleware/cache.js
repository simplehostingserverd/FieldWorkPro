const cacheService = require('../services/cache');

// Cache middleware for GET requests
const cacheMiddleware = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      let cacheKey;
      if (keyGenerator && typeof keyGenerator === 'function') {
        cacheKey = keyGenerator(req);
      } else {
        // Default key generation
        const orgId = req.user?.organization_id || 'public';
        const path = req.originalUrl.replace(/[^a-zA-Z0-9]/g, '_');
        cacheKey = `api:${orgId}:${path}`;
      }

      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`🚀 Cache HIT for key: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`💾 Cache MISS for key: ${cacheKey}`);

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response data
        cacheService.set(cacheKey, data, ttl).catch(err => {
          console.error('Cache set error:', err.message);
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      next();
    }
  };
};

// Cache invalidation middleware for write operations
const invalidateCacheMiddleware = (patterns = []) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to invalidate cache after successful operations
    const invalidateCache = async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const orgId = req.user?.organization_id;
          
          // Default patterns based on the route
          const defaultPatterns = [
            `api:${orgId}:*`,
            `fieldpro:*:${orgId}:*`
          ];

          // Combine with custom patterns
          const allPatterns = [...defaultPatterns, ...patterns];

          for (const pattern of allPatterns) {
            await cacheService.delPattern(pattern);
          }

          console.log(`🧹 Cache invalidated for patterns: ${allPatterns.join(', ')}`);
        } catch (error) {
          console.error('Cache invalidation error:', error.message);
        }
      }
    };

    res.json = function(data) {
      invalidateCache();
      return originalJson.call(this, data);
    };

    res.send = function(data) {
      invalidateCache();
      return originalSend.call(this, data);
    };

    next();
  };
};

// Specific cache key generators
const cacheKeyGenerators = {
  // Users list
  users: (req) => {
    const orgId = req.user?.organization_id || 'public';
    return cacheService.keys.users(orgId);
  },

  // Single user
  user: (req) => {
    const userId = req.params.id || req.user?.id;
    return cacheService.keys.user(userId);
  },

  // Customers list
  customers: (req) => {
    const orgId = req.user?.organization_id || 'public';
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;
    return `${cacheService.keys.customers(orgId)}:page_${page}_${limit}`;
  },

  // Single customer
  customer: (req) => {
    const customerId = req.params.id;
    return cacheService.keys.customer(customerId);
  },

  // Jobs list
  jobs: (req) => {
    const orgId = req.user?.organization_id || 'public';
    const status = req.query.status || 'all';
    const date = req.query.date || 'all';
    return `${cacheService.keys.jobs(orgId)}:${status}_${date}`;
  },

  // Single job
  job: (req) => {
    const jobId = req.params.id;
    return cacheService.keys.job(jobId);
  },

  // Inventory list
  inventory: (req) => {
    const orgId = req.user?.organization_id || 'public';
    return cacheService.keys.inventory(orgId);
  },

  // Equipment list
  equipment: (req) => {
    const orgId = req.user?.organization_id || 'public';
    return cacheService.keys.equipment(orgId);
  },

  // Dashboard stats
  dashboard: (req) => {
    const orgId = req.user?.organization_id || 'public';
    const period = req.query.period || 'month';
    return `${cacheService.generateKey('dashboard', orgId)}:${period}`;
  }
};

// Pre-configured cache middleware for common routes
const cache = {
  // Short cache for frequently changing data (5 minutes)
  short: cacheMiddleware(300),
  
  // Medium cache for moderately changing data (30 minutes)
  medium: cacheMiddleware(1800),
  
  // Long cache for rarely changing data (2 hours)
  long: cacheMiddleware(7200),
  
  // Custom cache with specific TTL and key generator
  custom: (ttl, keyGenerator) => cacheMiddleware(ttl, keyGenerator),

  // Specific caches for different data types
  users: cacheMiddleware(1800, cacheKeyGenerators.users),
  user: cacheMiddleware(3600, cacheKeyGenerators.user),
  customers: cacheMiddleware(900, cacheKeyGenerators.customers),
  customer: cacheMiddleware(1800, cacheKeyGenerators.customer),
  jobs: cacheMiddleware(300, cacheKeyGenerators.jobs),
  job: cacheMiddleware(600, cacheKeyGenerators.job),
  inventory: cacheMiddleware(1800, cacheKeyGenerators.inventory),
  equipment: cacheMiddleware(3600, cacheKeyGenerators.equipment),
  dashboard: cacheMiddleware(600, cacheKeyGenerators.dashboard),

  // Cache invalidation
  invalidate: invalidateCacheMiddleware,
  invalidateCustom: (patterns) => invalidateCacheMiddleware(patterns)
};

module.exports = {
  cache,
  cacheMiddleware,
  invalidateCacheMiddleware,
  cacheKeyGenerators
};
