// QuickBooks Online API Integration
import { BaseIntegration, IntegrationConfig, IntegrationCredentials, WebhookPayload, SyncResult } from '../base/IntegrationManager';
import { query } from '../../database';
import crypto from 'crypto';

export interface QuickBooksConfig extends IntegrationConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sandbox: boolean;
  companyId: string;
}

export interface QuickBooksCustomer {
  Id: string;
  Name: string;
  CompanyName?: string;
  GivenName?: string;
  FamilyName?: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
  };
  Active: boolean;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
}

export interface QuickBooksInvoice {
  Id: string;
  DocNumber: string;
  TxnDate: string;
  DueDate: string;
  CustomerRef: { value: string; name: string };
  Line: Array<{
    Amount: number;
    DetailType: string;
    SalesItemLineDetail?: {
      ItemRef: { value: string; name: string };
      Qty: number;
      UnitPrice: number;
    };
  }>;
  TxnTaxDetail?: {
    TotalTax: number;
  };
  TotalAmt: number;
  Balance: number;
  EmailStatus: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
}

export class QuickBooksIntegration extends BaseIntegration {
  private qbConfig: QuickBooksConfig;
  private baseApiUrl: string;

  constructor(config: QuickBooksConfig) {
    super(config);
    this.qbConfig = config;
    this.baseApiUrl = config.sandbox 
      ? 'https://sandbox-quickbooks.api.intuit.com'
      : 'https://quickbooks.api.intuit.com';
  }

  async authenticate(): Promise<boolean> {
    try {
      // In a real implementation, this would handle OAuth 2.0 flow
      // For now, assume we have valid credentials stored
      const storedCredentials = await this.getStoredCredentials();
      
      if (storedCredentials && storedCredentials.accessToken) {
        this.credentials = storedCredentials;
        
        // Test the credentials
        const isValid = await this.testConnection();
        if (isValid) {
          return true;
        }
      }

      // If credentials are invalid or missing, initiate OAuth flow
      return await this.initiateOAuthFlow();
    } catch (error) {
      this.logger.error('Authentication failed', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest(
        'GET',
        `/v3/company/${this.qbConfig.companyId}/companyinfo/${this.qbConfig.companyId}`
      );
      return response && response.QueryResponse;
    } catch (error) {
      this.logger.error('Connection test failed', error);
      return false;
    }
  }

  async syncData(entityType: string, lastSyncTime?: Date): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      recordsProcessed: 0,
      errors: [],
      lastSyncTime: new Date(),
    };

    try {
      switch (entityType.toLowerCase()) {
        case 'customers':
          await this.syncCustomers(result, lastSyncTime);
          break;
        case 'invoices':
          await this.syncInvoices(result, lastSyncTime);
          break;
        case 'payments':
          await this.syncPayments(result, lastSyncTime);
          break;
        case 'all':
          await this.syncCustomers(result, lastSyncTime);
          await this.syncInvoices(result, lastSyncTime);
          await this.syncPayments(result, lastSyncTime);
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
    } catch (error) {
      result.success = false;
      result.errors.push(error.message);
      this.logger.error('Sync failed', error);
    }

    this.emit('sync:complete', result);
    return result;
  }

  async handleWebhook(payload: WebhookPayload): Promise<void> {
    try {
      // Verify webhook signature
      if (!this.validateWebhookSignature(JSON.stringify(payload.data), payload.signature || '')) {
        throw new Error('Invalid webhook signature');
      }

      const { eventNotifications } = payload.data;
      
      for (const notification of eventNotifications) {
        for (const entity of notification.dataChangeEvent.entities) {
          await this.handleEntityChange(entity.name, entity.id, entity.operation);
        }
      }

      this.emit('webhook:processed', payload);
    } catch (error) {
      this.logger.error('Webhook handling failed', error);
      throw error;
    }
  }

  // Customer synchronization
  private async syncCustomers(result: SyncResult, lastSyncTime?: Date): Promise<void> {
    let query = "SELECT * FROM Customer";
    
    if (lastSyncTime) {
      const formattedDate = lastSyncTime.toISOString().split('T')[0];
      query += ` WHERE MetaData.LastUpdatedTime > '${formattedDate}'`;
    }

    const response = await this.makeRequest('GET', `/v3/company/${this.qbConfig.companyId}/query?query=${encodeURIComponent(query)}`);
    
    if (response.QueryResponse && response.QueryResponse.Customer) {
      const customers: QuickBooksCustomer[] = response.QueryResponse.Customer;
      
      for (const qbCustomer of customers) {
        try {
          await this.upsertCustomer(qbCustomer);
          result.recordsProcessed++;
        } catch (error) {
          result.errors.push(`Customer ${qbCustomer.Id}: ${error.message}`);
        }
      }
    }
  }

  // Invoice synchronization
  private async syncInvoices(result: SyncResult, lastSyncTime?: Date): Promise<void> {
    let query = "SELECT * FROM Invoice";
    
    if (lastSyncTime) {
      const formattedDate = lastSyncTime.toISOString().split('T')[0];
      query += ` WHERE MetaData.LastUpdatedTime > '${formattedDate}'`;
    }

    const response = await this.makeRequest('GET', `/v3/company/${this.qbConfig.companyId}/query?query=${encodeURIComponent(query)}`);
    
    if (response.QueryResponse && response.QueryResponse.Invoice) {
      const invoices: QuickBooksInvoice[] = response.QueryResponse.Invoice;
      
      for (const qbInvoice of invoices) {
        try {
          await this.upsertInvoice(qbInvoice);
          result.recordsProcessed++;
        } catch (error) {
          result.errors.push(`Invoice ${qbInvoice.Id}: ${error.message}`);
        }
      }
    }
  }

  // Payment synchronization
  private async syncPayments(result: SyncResult, lastSyncTime?: Date): Promise<void> {
    let query = "SELECT * FROM Payment";
    
    if (lastSyncTime) {
      const formattedDate = lastSyncTime.toISOString().split('T')[0];
      query += ` WHERE MetaData.LastUpdatedTime > '${formattedDate}'`;
    }

    const response = await this.makeRequest('GET', `/v3/company/${this.qbConfig.companyId}/query?query=${encodeURIComponent(query)}`);
    
    if (response.QueryResponse && response.QueryResponse.Payment) {
      const payments = response.QueryResponse.Payment;
      
      for (const qbPayment of payments) {
        try {
          await this.upsertPayment(qbPayment);
          result.recordsProcessed++;
        } catch (error) {
          result.errors.push(`Payment ${qbPayment.Id}: ${error.message}`);
        }
      }
    }
  }

  // Create/Update customer in local database
  private async upsertCustomer(qbCustomer: QuickBooksCustomer): Promise<void> {
    const customerData = {
      quickbooks_id: qbCustomer.Id,
      first_name: qbCustomer.GivenName || '',
      last_name: qbCustomer.FamilyName || '',
      email: qbCustomer.PrimaryEmailAddr?.Address || '',
      phone: qbCustomer.PrimaryPhone?.FreeFormNumber || '',
      address: qbCustomer.BillAddr?.Line1 || '',
      city: qbCustomer.BillAddr?.City || '',
      state: qbCustomer.BillAddr?.CountrySubDivisionCode || '',
      zip_code: qbCustomer.BillAddr?.PostalCode || '',
      company_name: qbCustomer.CompanyName || '',
      is_active: qbCustomer.Active,
      qb_created_time: new Date(qbCustomer.MetaData.CreateTime),
      qb_updated_time: new Date(qbCustomer.MetaData.LastUpdatedTime),
    };

    // Check if customer exists
    const existingCustomer = await query(
      'SELECT id FROM customers WHERE quickbooks_id = $1',
      [qbCustomer.Id]
    );

    if (existingCustomer.rows.length > 0) {
      // Update existing customer
      await query(
        `UPDATE customers SET 
         first_name = $2, last_name = $3, email = $4, phone = $5, 
         address = $6, city = $7, state = $8, zip_code = $9,
         company_name = $10, is_active = $11, qb_updated_time = $12,
         updated_at = NOW()
         WHERE quickbooks_id = $1`,
        [
          customerData.quickbooks_id,
          customerData.first_name,
          customerData.last_name,
          customerData.email,
          customerData.phone,
          customerData.address,
          customerData.city,
          customerData.state,
          customerData.zip_code,
          customerData.company_name,
          customerData.is_active,
          customerData.qb_updated_time,
        ]
      );
    } else {
      // Insert new customer
      await query(
        `INSERT INTO customers (
          organization_id, quickbooks_id, first_name, last_name, email, phone,
          address, city, state, zip_code, company_name, is_active,
          qb_created_time, qb_updated_time, created_at, updated_at
        ) VALUES (
          (SELECT id FROM organizations LIMIT 1), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
        )`,
        [
          customerData.quickbooks_id,
          customerData.first_name,
          customerData.last_name,
          customerData.email,
          customerData.phone,
          customerData.address,
          customerData.city,
          customerData.state,
          customerData.zip_code,
          customerData.company_name,
          customerData.is_active,
          customerData.qb_created_time,
          customerData.qb_updated_time,
        ]
      );
    }
  }

  // Additional methods would be implemented here for invoices, payments, etc.
  private async upsertInvoice(qbInvoice: QuickBooksInvoice): Promise<void> {
    // Implementation for invoice sync
    this.logger.info(`Syncing invoice ${qbInvoice.Id}`);
  }

  private async upsertPayment(qbPayment: any): Promise<void> {
    // Implementation for payment sync
    this.logger.info(`Syncing payment ${qbPayment.Id}`);
  }

  private async handleEntityChange(entityName: string, entityId: string, operation: string): Promise<void> {
    this.logger.info(`Handling ${operation} for ${entityName} ${entityId}`);
    // Implement real-time sync based on webhook notifications
  }

  private async getStoredCredentials(): Promise<IntegrationCredentials | null> {
    // In a real implementation, retrieve from secure storage
    return null;
  }

  private async initiateOAuthFlow(): Promise<boolean> {
    // In a real implementation, this would redirect to QuickBooks OAuth
    this.logger.info('OAuth flow would be initiated here');
    return false;
  }

  protected validateWebhookSignature(payload: string, signature: string): boolean {
    // Implement QuickBooks webhook signature validation
    const expectedSignature = crypto
      .createHmac('sha256', this.qbConfig.webhookSecret || '')
      .update(payload)
      .digest('base64');
    
    return signature === expectedSignature;
  }
}
