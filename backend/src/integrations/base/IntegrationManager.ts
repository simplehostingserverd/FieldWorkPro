// Integration Manager - Central hub for all third-party integrations
import { EventEmitter } from 'events';
import { Logger } from '../../utils/logger';
import { RateLimiter } from '../../utils/rateLimiter';
import { RetryManager } from '../../utils/retryManager';

export interface IntegrationConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  webhookUrl?: string;
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  retryConfig?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}

export interface IntegrationCredentials {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string[];
}

export interface WebhookPayload {
  integrationName: string;
  eventType: string;
  data: any;
  timestamp: Date;
  signature?: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  lastSyncTime: Date;
}

export abstract class BaseIntegration extends EventEmitter {
  protected config: IntegrationConfig;
  protected credentials: IntegrationCredentials;
  protected rateLimiter: RateLimiter;
  protected retryManager: RetryManager;
  protected logger: Logger;

  constructor(config: IntegrationConfig) {
    super();
    this.config = config;
    this.logger = new Logger(`Integration:${config.name}`);
    
    if (config.rateLimits) {
      this.rateLimiter = new RateLimiter(config.rateLimits);
    }
    
    if (config.retryConfig) {
      this.retryManager = new RetryManager(config.retryConfig);
    }
  }

  // Abstract methods that each integration must implement
  abstract authenticate(): Promise<boolean>;
  abstract testConnection(): Promise<boolean>;
  abstract syncData(entityType: string, lastSyncTime?: Date): Promise<SyncResult>;
  abstract handleWebhook(payload: WebhookPayload): Promise<void>;

  // Common utility methods
  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    if (this.rateLimiter) {
      await this.rateLimiter.checkLimit();
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.credentials.accessToken) {
      requestHeaders['Authorization'] = `Bearer ${this.credentials.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  protected async refreshAccessToken(): Promise<boolean> {
    // Override in specific integrations that support token refresh
    return false;
  }

  protected validateWebhookSignature(payload: string, signature: string): boolean {
    // Override in specific integrations that use webhook signatures
    return true;
  }

  // Getters
  get isEnabled(): boolean {
    return this.config.enabled;
  }

  get name(): string {
    return this.config.name;
  }
}

export class IntegrationManager extends EventEmitter {
  private integrations: Map<string, BaseIntegration> = new Map();
  private logger: Logger;

  constructor() {
    super();
    this.logger = new Logger('IntegrationManager');
  }

  registerIntegration(integration: BaseIntegration): void {
    this.integrations.set(integration.name, integration);
    
    // Forward integration events
    integration.on('sync:complete', (result: SyncResult) => {
      this.emit('integration:sync:complete', integration.name, result);
    });

    integration.on('sync:error', (error: Error) => {
      this.emit('integration:sync:error', integration.name, error);
    });

    integration.on('webhook:received', (payload: WebhookPayload) => {
      this.emit('integration:webhook:received', integration.name, payload);
    });

    this.logger.info(`Registered integration: ${integration.name}`);
  }

  getIntegration(name: string): BaseIntegration | undefined {
    return this.integrations.get(name);
  }

  getEnabledIntegrations(): BaseIntegration[] {
    return Array.from(this.integrations.values()).filter(integration => integration.isEnabled);
  }

  async authenticateAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const [name, integration] of this.integrations) {
      if (integration.isEnabled) {
        try {
          const success = await integration.authenticate();
          results.set(name, success);
          this.logger.info(`Authentication ${success ? 'successful' : 'failed'} for ${name}`);
        } catch (error) {
          results.set(name, false);
          this.logger.error(`Authentication error for ${name}:`, error);
        }
      }
    }
    
    return results;
  }

  async testAllConnections(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const [name, integration] of this.integrations) {
      if (integration.isEnabled) {
        try {
          const success = await integration.testConnection();
          results.set(name, success);
        } catch (error) {
          results.set(name, false);
          this.logger.error(`Connection test failed for ${name}:`, error);
        }
      }
    }
    
    return results;
  }

  async syncAllData(entityType?: string): Promise<Map<string, SyncResult>> {
    const results = new Map<string, SyncResult>();
    
    for (const [name, integration] of this.integrations) {
      if (integration.isEnabled) {
        try {
          const result = await integration.syncData(entityType || 'all');
          results.set(name, result);
          this.emit('integration:sync:complete', name, result);
        } catch (error) {
          const errorResult: SyncResult = {
            success: false,
            recordsProcessed: 0,
            errors: [error.message],
            lastSyncTime: new Date(),
          };
          results.set(name, errorResult);
          this.emit('integration:sync:error', name, error);
        }
      }
    }
    
    return results;
  }

  async handleWebhook(integrationName: string, payload: WebhookPayload): Promise<void> {
    const integration = this.integrations.get(integrationName);
    
    if (!integration) {
      throw new Error(`Integration not found: ${integrationName}`);
    }

    if (!integration.isEnabled) {
      throw new Error(`Integration disabled: ${integrationName}`);
    }

    await integration.handleWebhook(payload);
    this.emit('integration:webhook:processed', integrationName, payload);
  }

  getIntegrationStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    for (const [name, integration] of this.integrations) {
      status[name] = {
        enabled: integration.isEnabled,
        // Add more status info as needed
      };
    }
    
    return status;
  }
}

// Singleton instance
export const integrationManager = new IntegrationManager();
