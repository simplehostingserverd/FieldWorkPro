// Stripe Payment Processing Integration
import { BaseIntegration, IntegrationConfig, WebhookPayload, SyncResult } from '../base/IntegrationManager';
import { query } from '../../database';
import crypto from 'crypto';

export interface StripeConfig extends IntegrationConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  testMode: boolean;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
  created: number;
  metadata: Record<string, string>;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customer?: string;
  invoice?: string;
  metadata: Record<string, string>;
  created: number;
}

export interface StripeInvoice {
  id: string;
  customer: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  due_date?: number;
  metadata: Record<string, string>;
}

export class StripeIntegration extends BaseIntegration {
  private stripeConfig: StripeConfig;

  constructor(config: StripeConfig) {
    super(config);
    this.stripeConfig = config;
    this.config.baseUrl = 'https://api.stripe.com/v1';
  }

  async authenticate(): Promise<boolean> {
    try {
      // Test the API key by making a simple request
      const response = await this.makeRequest('GET', '/account');
      return response && response.id;
    } catch (error) {
      this.logger.error('Stripe authentication failed', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    return await this.authenticate();
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
        case 'payments':
          await this.syncPayments(result, lastSyncTime);
          break;
        case 'invoices':
          await this.syncInvoices(result, lastSyncTime);
          break;
        case 'all':
          await this.syncCustomers(result, lastSyncTime);
          await this.syncPayments(result, lastSyncTime);
          await this.syncInvoices(result, lastSyncTime);
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
    } catch (error) {
      result.success = false;
      result.errors.push(error.message);
      this.logger.error('Stripe sync failed', error);
    }

    this.emit('sync:complete', result);
    return result;
  }

  async handleWebhook(payload: WebhookPayload): Promise<void> {
    try {
      // Verify webhook signature
      if (!this.validateWebhookSignature(JSON.stringify(payload.data), payload.signature || '')) {
        throw new Error('Invalid Stripe webhook signature');
      }

      const event = payload.data;
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePayment(event.data.object);
          break;
        case 'customer.created':
        case 'customer.updated':
          await this.handleCustomerChange(event.data.object);
          break;
        default:
          this.logger.info(`Unhandled webhook event: ${event.type}`);
      }

      this.emit('webhook:processed', payload);
    } catch (error) {
      this.logger.error('Stripe webhook handling failed', error);
      throw error;
    }
  }

  // Payment processing methods
  async createPaymentIntent(amount: number, currency: string, customerId?: string, metadata?: Record<string, string>): Promise<any> {
    const data: any = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
    };

    if (customerId) {
      data.customer = customerId;
    }

    if (metadata) {
      data.metadata = metadata;
    }

    return await this.makeRequest('POST', '/payment_intents', data);
  }

  async createCustomer(customerData: {
    email: string;
    name: string;
    phone?: string;
    address?: any;
    metadata?: Record<string, string>;
  }): Promise<StripeCustomer> {
    return await this.makeRequest('POST', '/customers', customerData);
  }

  async createInvoice(customerId: string, items: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>, metadata?: Record<string, string>): Promise<StripeInvoice> {
    // First create invoice items
    for (const item of items) {
      await this.makeRequest('POST', '/invoiceitems', {
        customer: customerId,
        amount: Math.round(item.amount * 100),
        currency: 'usd',
        description: item.description,
        quantity: item.quantity || 1,
      });
    }

    // Then create the invoice
    const invoiceData: any = {
      customer: customerId,
      auto_advance: true,
    };

    if (metadata) {
      invoiceData.metadata = metadata;
    }

    const invoice = await this.makeRequest('POST', '/invoices', invoiceData);
    
    // Finalize the invoice
    await this.makeRequest('POST', `/invoices/${invoice.id}/finalize`);
    
    return invoice;
  }

  async setupRecurringBilling(customerId: string, priceId: string, metadata?: Record<string, string>): Promise<any> {
    const subscriptionData: any = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    };

    if (metadata) {
      subscriptionData.metadata = metadata;
    }

    return await this.makeRequest('POST', '/subscriptions', subscriptionData);
  }

  // Sync methods
  private async syncCustomers(result: SyncResult, lastSyncTime?: Date): Promise<void> {
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const params: any = { limit: 100 };
      
      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      if (lastSyncTime) {
        params.created = { gte: Math.floor(lastSyncTime.getTime() / 1000) };
      }

      const response = await this.makeRequest('GET', '/customers', params);
      
      for (const customer of response.data) {
        try {
          await this.upsertCustomer(customer);
          result.recordsProcessed++;
        } catch (error) {
          result.errors.push(`Customer ${customer.id}: ${error.message}`);
        }
      }

      hasMore = response.has_more;
      if (hasMore && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }
  }

  private async syncPayments(result: SyncResult, lastSyncTime?: Date): Promise<void> {
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const params: any = { limit: 100 };
      
      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      if (lastSyncTime) {
        params.created = { gte: Math.floor(lastSyncTime.getTime() / 1000) };
      }

      const response = await this.makeRequest('GET', '/payment_intents', params);
      
      for (const payment of response.data) {
        try {
          await this.upsertPayment(payment);
          result.recordsProcessed++;
        } catch (error) {
          result.errors.push(`Payment ${payment.id}: ${error.message}`);
        }
      }

      hasMore = response.has_more;
      if (hasMore && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }
  }

  private async syncInvoices(result: SyncResult, lastSyncTime?: Date): Promise<void> {
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const params: any = { limit: 100 };
      
      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      if (lastSyncTime) {
        params.created = { gte: Math.floor(lastSyncTime.getTime() / 1000) };
      }

      const response = await this.makeRequest('GET', '/invoices', params);
      
      for (const invoice of response.data) {
        try {
          await this.upsertInvoice(invoice);
          result.recordsProcessed++;
        } catch (error) {
          result.errors.push(`Invoice ${invoice.id}: ${error.message}`);
        }
      }

      hasMore = response.has_more;
      if (hasMore && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }
  }

  // Database operations
  private async upsertCustomer(stripeCustomer: StripeCustomer): Promise<void> {
    // Check if customer exists
    const existingCustomer = await query(
      'SELECT id FROM customers WHERE stripe_customer_id = $1',
      [stripeCustomer.id]
    );

    const customerData = {
      stripe_customer_id: stripeCustomer.id,
      email: stripeCustomer.email || '',
      name: stripeCustomer.name || '',
      phone: stripeCustomer.phone || '',
      address: stripeCustomer.address?.line1 || '',
      city: stripeCustomer.address?.city || '',
      state: stripeCustomer.address?.state || '',
      zip_code: stripeCustomer.address?.postal_code || '',
      stripe_created_time: new Date(stripeCustomer.created * 1000),
    };

    if (existingCustomer.rows.length > 0) {
      // Update existing customer
      await query(
        `UPDATE customers SET 
         email = $2, phone = $3, address = $4, city = $5, state = $6, zip_code = $7,
         updated_at = NOW()
         WHERE stripe_customer_id = $1`,
        [
          customerData.stripe_customer_id,
          customerData.email,
          customerData.phone,
          customerData.address,
          customerData.city,
          customerData.state,
          customerData.zip_code,
        ]
      );
    } else {
      // Create new customer record or update existing one based on email
      const existingByEmail = await query(
        'SELECT id FROM customers WHERE email = $1',
        [customerData.email]
      );

      if (existingByEmail.rows.length > 0) {
        // Update existing customer with Stripe ID
        await query(
          'UPDATE customers SET stripe_customer_id = $1, updated_at = NOW() WHERE email = $2',
          [customerData.stripe_customer_id, customerData.email]
        );
      }
    }
  }

  private async upsertPayment(stripePayment: StripePaymentIntent): Promise<void> {
    // Implementation for payment sync
    this.logger.info(`Syncing payment ${stripePayment.id}`);
  }

  private async upsertInvoice(stripeInvoice: StripeInvoice): Promise<void> {
    // Implementation for invoice sync
    this.logger.info(`Syncing invoice ${stripeInvoice.id}`);
  }

  // Webhook handlers
  private async handlePaymentSuccess(paymentIntent: StripePaymentIntent): Promise<void> {
    this.logger.info(`Payment succeeded: ${paymentIntent.id}`);
    // Update payment status in database
  }

  private async handlePaymentFailure(paymentIntent: StripePaymentIntent): Promise<void> {
    this.logger.info(`Payment failed: ${paymentIntent.id}`);
    // Update payment status and notify customer
  }

  private async handleInvoicePayment(invoice: StripeInvoice): Promise<void> {
    this.logger.info(`Invoice paid: ${invoice.id}`);
    // Update invoice status in database
  }

  private async handleCustomerChange(customer: StripeCustomer): Promise<void> {
    await this.upsertCustomer(customer);
  }

  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const requestHeaders = {
      'Authorization': `Bearer ${this.stripeConfig.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...headers,
    };

    let body: string | undefined;
    if (data && method !== 'GET') {
      // Convert data to URL-encoded format for Stripe API
      body = new URLSearchParams(this.flattenObject(data)).toString();
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    if (method === 'GET' && data) {
      const params = new URLSearchParams(this.flattenObject(data));
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stripe API error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  private flattenObject(obj: any, prefix = ''): Record<string, string> {
    const flattened: Record<string, string> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}[${key}]` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = String(obj[key]);
        }
      }
    }
    
    return flattened;
  }

  protected validateWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.stripeConfig.webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');
    
    return signature.includes(expectedSignature);
  }
}
