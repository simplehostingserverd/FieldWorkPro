// Retry Manager for failed API requests
export interface RetryConfig {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number;
}

export class RetryManager {
  private config: RetryConfig;

  constructor(config: RetryConfig) {
    this.config = config;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.config.maxRetries) {
          throw new Error(
            `Operation failed after ${this.config.maxRetries} retries${
              context ? ` (${context})` : ''
            }: ${lastError.message}`
          );
        }
        
        // Check if error is retryable
        if (!this.isRetryableError(error as Error)) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempt);
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  private isRetryableError(error: Error): boolean {
    // Retry on network errors, timeouts, and 5xx HTTP errors
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /5\d\d/,
      /rate limit/i,
      /too many requests/i,
    ];
    
    return retryablePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
