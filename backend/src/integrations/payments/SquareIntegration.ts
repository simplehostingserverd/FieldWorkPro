// Square Payment Processing Integration
import {
  BaseIntegration,
  IntegrationConfig,
  WebhookPayload,
  SyncResult,
} from '../base/IntegrationManager';
import { query } from '../../database';
import crypto from 'crypto';

export interface SquareConfig extends IntegrationConfig {
  accessToken: string;
  applicationId: string;
  webhookSignatureKey: string;
  environment: 'sandbox' | 'production';
  locationId: string;
}

export interface SquareCustomer {
  id: string;
  given_name?: string;
  family_name?: string;
  email_address?: string;
  phone_number?: string;
  address?: {
    address_line_1?: string;
    locality?: string;
    administrative_district_level_1?: string;
    postal_code?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SquarePayment {
  id: string;
  amount_money: {
    amount: number;
    currency: string;
  };
  status: string;
  source_type: string;
  customer_id?: string;
  order_id?: string;
  created_at: string;
  updated_at: string;
  receipt_number?: string;
  receipt_url?: string;
}

export interface SquareInvoice {
  id: string;
  version: number;
  location_id: string;
  order_id: string;
  primary_recipient: {
    customer_id: string;
  };
  payment_requests: Array<{
    request_method: string;
    request_type: string;
    due_date?: string;
  }>;
  delivery_method: string;
  invoice_number?: string;
  title?: string;
  description?: string;
  scheduled_at?: string;
  public_url?: string;
  status: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export class SquareIntegration extends BaseIntegration {
  private squareConfig: SquareConfig;

  constructor(config: SquareConfig) {
    super(config);
    this.squareConfig = config;
    this.config.baseUrl =
      config.environment === 'production'
        ? 'https://connect.squareup.com/v2'
        : 'https://connect.squareupsandbox.com/v2';
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.makeRequest('GET', '/locations');
      return response && response.locations && response.locations.length > 0;
    } catch (error) {
      this.logger.error('Square authentication failed', error);
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
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      );
      this.logger.error('Square sync failed', error);
    }

    this.emit('sync:complete', result);
    return result;
  }

  async handleWebhook(payload: WebhookPayload): Promise<void> {
    try {
      if (
        !this.validateWebhookSignature(
          JSON.stringify(payload.data),
          payload.signature || ''
        )
      ) {
        throw new Error('Invalid Square webhook signature');
      }

      const event = payload.data;

      switch (event.type) {
        case 'payment.created':
        case 'payment.updated':
          await this.handlePaymentEvent(event.data.object.payment);
          break;
        case 'invoice.created':
        case 'invoice.updated':
          await this.handleInvoiceEvent(event.data.object.invoice);
          break;
        case 'customer.created':
        case 'customer.updated':
          await this.handleCustomerEvent(event.data.object.customer);
          break;
        default:
          this.logger.info(`Unhandled Square webhook event: ${event.type}`);
      }

      this.emit('webhook:processed', payload);
    } catch (error) {
      this.logger.error('Square webhook handling failed', error);
      throw error;
    }
  }

  // Payment processing methods
  async createPayment(paymentData: {
    amount: number;
    currency: string;
    sourceId: string;
    customerId?: string;
    note?: string;
    referenceId?: string;
  }): Promise<SquarePayment | null> {
    try {
      const requestBody = {
        source_id: paymentData.sourceId,
        idempotency_key: crypto.randomUUID(),
        amount_money: {
          amount: Math.round(paymentData.amount * 100), // Convert to cents
          currency: paymentData.currency.toUpperCase(),
        },
        autocomplete: true,
        location_id: this.squareConfig.locationId,
      };

      if (paymentData.customerId) {
        (requestBody as any).customer_id = paymentData.customerId;
      }

      if (paymentData.note) {
        (requestBody as any).note = paymentData.note;
      }

      if (paymentData.referenceId) {
        (requestBody as any).reference_id = paymentData.referenceId;
      }

      const response = await this.makeRequest('POST', '/payments', requestBody);
      return response?.payment || null;
    } catch (error) {
      this.logger.error('Payment creation failed', error);
      return null;
    }
  }

  async createCustomer(customerData: {
    givenName?: string;
    familyName?: string;
    emailAddress?: string;
    phoneNumber?: string;
    address?: {
      addressLine1?: string;
      locality?: string;
      administrativeDistrictLevel1?: string;
      postalCode?: string;
    };
  }): Promise<SquareCustomer | null> {
    try {
      const response = await this.makeRequest(
        'POST',
        '/customers',
        customerData
      );
      return response?.customer || null;
    } catch (error) {
      this.logger.error('Customer creation failed', error);
      return null;
    }
  }

  async createInvoice(invoiceData: {
    customerId: string;
    items: Array<{
      name: string;
      quantity: string;
      basePriceMoney: {
        amount: number;
        currency: string;
      };
    }>;
    requestMethod?: string;
    dueDate?: string;
    invoiceNumber?: string;
    title?: string;
    description?: string;
  }): Promise<SquareInvoice | null> {
    try {
      // First create an order
      const orderData = {
        location_id: this.squareConfig.locationId,
        line_items: invoiceData.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          base_price_money: item.basePriceMoney,
        })),
      };

      const orderResponse = await this.makeRequest('POST', '/orders', {
        order: orderData,
      });

      if (!orderResponse?.order) {
        throw new Error('Failed to create order for invoice');
      }

      // Then create the invoice
      const invoiceRequestData = {
        invoice: {
          location_id: this.squareConfig.locationId,
          order_id: orderResponse.order.id,
          primary_recipient: {
            customer_id: invoiceData.customerId,
          },
          payment_requests: [
            {
              request_method: invoiceData.requestMethod || 'EMAIL',
              request_type: 'BALANCE',
              due_date: invoiceData.dueDate,
            },
          ],
          delivery_method: 'EMAIL',
          invoice_number: invoiceData.invoiceNumber,
          title: invoiceData.title,
          description: invoiceData.description,
          timezone: 'America/New_York',
        },
      };

      const response = await this.makeRequest(
        'POST',
        '/invoices',
        invoiceRequestData
      );
      return response?.invoice || null;
    } catch (error) {
      this.logger.error('Invoice creation failed', error);
      return null;
    }
  }

  async publishInvoice(invoiceId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(
        'POST',
        `/invoices/${invoiceId}/publish`,
        {
          request_method: 'EMAIL',
        }
      );

      return response?.invoice?.status === 'UNPAID';
    } catch (error) {
      this.logger.error(`Invoice publishing failed for ${invoiceId}`, error);
      return false;
    }
  }

  async getPayment(paymentId: string): Promise<SquarePayment | null> {
    try {
      const response = await this.makeRequest('GET', `/payments/${paymentId}`);
      return response?.payment || null;
    } catch (error) {
      this.logger.error(`Payment lookup failed for ${paymentId}`, error);
      return null;
    }
  }

  async refundPayment(
    paymentId: string,
    refundData: {
      amount?: number;
      currency?: string;
      reason?: string;
    }
  ): Promise<any> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      const refundAmount = refundData.amount
        ? Math.round(refundData.amount * 100)
        : payment.amount_money.amount;

      const requestBody = {
        idempotency_key: crypto.randomUUID(),
        amount_money: {
          amount: refundAmount,
          currency: refundData.currency || payment.amount_money.currency,
        },
        payment_id: paymentId,
        reason: refundData.reason || 'Customer refund',
      };

      const response = await this.makeRequest('POST', '/refunds', requestBody);
      return response?.refund || null;
    } catch (error) {
      this.logger.error(`Refund failed for payment ${paymentId}`, error);
      return null;
    }
  }

  // Sync methods
  private async syncCustomers(
    result: SyncResult,
    lastSyncTime?: Date
  ): Promise<void> {
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      try {
        const params: any = { limit: 100 };

        if (cursor) {
          params.cursor = cursor;
        }

        if (lastSyncTime) {
          params.filter = {
            updated_at: {
              start_at: lastSyncTime.toISOString(),
            },
          };
        }

        const response = await this.makeRequest('GET', '/customers', params);

        if (response?.customers) {
          for (const customer of response.customers) {
            try {
              await this.upsertCustomer(customer);
              result.recordsProcessed++;
            } catch (error) {
              result.errors.push(
                `Customer ${customer.id}: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`
              );
            }
          }
        }

        cursor = response?.cursor;
        hasMore = !!cursor;
      } catch (error) {
        result.errors.push(
          `Customers sync: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
        break;
      }
    }
  }

  private async syncPayments(
    result: SyncResult,
    lastSyncTime?: Date
  ): Promise<void> {
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      try {
        const params: any = {
          location_id: this.squareConfig.locationId,
          limit: 100,
        };

        if (cursor) {
          params.cursor = cursor;
        }

        if (lastSyncTime) {
          params.begin_time = lastSyncTime.toISOString();
        }

        const response = await this.makeRequest('GET', '/payments', params);

        if (response?.payments) {
          for (const payment of response.payments) {
            try {
              await this.upsertPayment(payment);
              result.recordsProcessed++;
            } catch (error) {
              result.errors.push(
                `Payment ${payment.id}: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`
              );
            }
          }
        }

        cursor = response?.cursor;
        hasMore = !!cursor;
      } catch (error) {
        result.errors.push(
          `Payments sync: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
        break;
      }
    }
  }

  private async syncInvoices(
    result: SyncResult,
    lastSyncTime?: Date
  ): Promise<void> {
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      try {
        const params: any = {
          location_id: this.squareConfig.locationId,
          limit: 100,
        };

        if (cursor) {
          params.cursor = cursor;
        }

        const response = await this.makeRequest('GET', '/invoices', params);

        if (response?.invoices) {
          for (const invoice of response.invoices) {
            try {
              await this.upsertInvoice(invoice);
              result.recordsProcessed++;
            } catch (error) {
              result.errors.push(
                `Invoice ${invoice.id}: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`
              );
            }
          }
        }

        cursor = response?.cursor;
        hasMore = !!cursor;
      } catch (error) {
        result.errors.push(
          `Invoices sync: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
        break;
      }
    }
  }

  // Database operations
  private async upsertCustomer(squareCustomer: SquareCustomer): Promise<void> {
    const existingCustomer = await query(
      'SELECT id FROM customers WHERE square_customer_id = $1',
      [squareCustomer.id]
    );

    const customerData = {
      square_customer_id: squareCustomer.id,
      first_name: squareCustomer.given_name || '',
      last_name: squareCustomer.family_name || '',
      email: squareCustomer.email_address || '',
      phone: squareCustomer.phone_number || '',
      address: squareCustomer.address?.address_line_1 || '',
      city: squareCustomer.address?.locality || '',
      state: squareCustomer.address?.administrative_district_level_1 || '',
      zip_code: squareCustomer.address?.postal_code || '',
      square_created_time: new Date(squareCustomer.created_at),
    };

    if (existingCustomer.rows.length > 0) {
      await query(
        `UPDATE customers SET 
         first_name = $2, last_name = $3, email = $4, phone = $5,
         address = $6, city = $7, state = $8, zip_code = $9,
         updated_at = NOW()
         WHERE square_customer_id = $1`,
        [
          customerData.square_customer_id,
          customerData.first_name,
          customerData.last_name,
          customerData.email,
          customerData.phone,
          customerData.address,
          customerData.city,
          customerData.state,
          customerData.zip_code,
        ]
      );
    } else {
      const existingByEmail = await query(
        'SELECT id FROM customers WHERE email = $1',
        [customerData.email]
      );

      if (existingByEmail.rows.length > 0) {
        await query(
          'UPDATE customers SET square_customer_id = $1, updated_at = NOW() WHERE email = $2',
          [customerData.square_customer_id, customerData.email]
        );
      }
    }
  }

  private async upsertPayment(squarePayment: SquarePayment): Promise<void> {
    this.logger.info(`Syncing payment ${squarePayment.id}`);
  }

  private async upsertInvoice(squareInvoice: SquareInvoice): Promise<void> {
    this.logger.info(`Syncing invoice ${squareInvoice.id}`);
  }

  // Webhook handlers
  private async handlePaymentEvent(payment: SquarePayment): Promise<void> {
    await this.upsertPayment(payment);
    this.logger.info(`Payment event processed: ${payment.id}`);
  }

  private async handleInvoiceEvent(invoice: SquareInvoice): Promise<void> {
    await this.upsertInvoice(invoice);
    this.logger.info(`Invoice event processed: ${invoice.id}`);
  }

  private async handleCustomerEvent(customer: SquareCustomer): Promise<void> {
    await this.upsertCustomer(customer);
    this.logger.info(`Customer event processed: ${customer.id}`);
  }

  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const requestHeaders = {
      Authorization: `Bearer ${this.squareConfig.accessToken}`,
      'Content-Type': 'application/json',
      'Square-Version': '2023-10-18',
      ...headers,
    };

    return await super.makeRequest(method, endpoint, data, requestHeaders);
  }

  protected validateWebhookSignature(
    payload: string,
    signature: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha1', this.squareConfig.webhookSignatureKey)
      .update(this.squareConfig.webhookSignatureKey + payload)
      .digest('base64');

    return signature === expectedSignature;
  }
}
