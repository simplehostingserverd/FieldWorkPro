// Rate Limiter for API requests
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
}

export class RateLimiter {
  private minuteRequests: number[] = [];
  private hourRequests: number[] = [];
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();
    
    // Clean old requests
    this.cleanOldRequests(now);
    
    // Check minute limit
    if (this.minuteRequests.length >= this.config.requestsPerMinute) {
      const oldestRequest = this.minuteRequests[0];
      const waitTime = 60000 - (now - oldestRequest); // 1 minute in ms
      if (waitTime > 0) {
        await this.sleep(waitTime);
        return this.checkLimit(); // Recheck after waiting
      }
    }
    
    // Check hour limit
    if (this.hourRequests.length >= this.config.requestsPerHour) {
      const oldestRequest = this.hourRequests[0];
      const waitTime = 3600000 - (now - oldestRequest); // 1 hour in ms
      if (waitTime > 0) {
        await this.sleep(waitTime);
        return this.checkLimit(); // Recheck after waiting
      }
    }
    
    // Record this request
    this.minuteRequests.push(now);
    this.hourRequests.push(now);
  }

  private cleanOldRequests(now: number): void {
    // Remove requests older than 1 minute
    this.minuteRequests = this.minuteRequests.filter(
      timestamp => now - timestamp < 60000
    );
    
    // Remove requests older than 1 hour
    this.hourRequests = this.hourRequests.filter(
      timestamp => now - timestamp < 3600000
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRemainingRequests(): { minute: number; hour: number } {
    const now = Date.now();
    this.cleanOldRequests(now);
    
    return {
      minute: Math.max(0, this.config.requestsPerMinute - this.minuteRequests.length),
      hour: Math.max(0, this.config.requestsPerHour - this.hourRequests.length),
    };
  }
}
