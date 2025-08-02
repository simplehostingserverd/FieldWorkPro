// Ferguson Parts Distributor Integration
import {
  BaseIntegration,
  IntegrationConfig,
  WebhookPayload,
  SyncResult,
} from '../base/IntegrationManager';
import { query } from '../../database';

export interface FergusonConfig extends IntegrationConfig {
  accountNumber: string;
  apiKey: string;
  branchCode: string;
  environment: 'sandbox' | 'production';
}

export interface FergusonProduct {
  sku: string;
  manufacturerPartNumber: string;
  manufacturer: string;
  description: string;
  category: string;
  subcategory: string;
  unitOfMeasure: string;
  listPrice: number;
  contractPrice?: number;
  availability: {
    branchStock: number;
    warehouseStock: number;
    totalAvailable: number;
    nextAvailableDate?: string;
  };
  specifications: Record<string, string>;
  images: string[];
  dataSheets: string[];
  substitutes: string[];
  relatedProducts: string[];
}

export interface FergusonPricing {
  sku: string;
  listPrice: number;
  contractPrice: number;
  discountPercent: number;
  priceBreaks: Array<{
    quantity: number;
    price: number;
  }>;
  effectiveDate: string;
  expirationDate?: string;
}

export interface FergusonOrder {
  orderNumber: string;
  customerPO?: string;
  orderDate: string;
  requestedDeliveryDate?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    sku: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status: string;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  deliveryAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  tracking?: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery?: string;
  };
}

export class FergusonIntegration extends BaseIntegration {
  private fergusonConfig: FergusonConfig;

  constructor(config: FergusonConfig) {
    super(config);
    this.fergusonConfig = config;
    this.config.baseUrl =
      config.environment === 'production'
        ? 'https://api.ferguson.com/v1'
        : 'https://sandbox-api.ferguson.com/v1';
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.makeRequest('GET', '/account/verify', {
        accountNumber: this.fergusonConfig.accountNumber,
      });

      return response && response.status === 'active';
    } catch (error) {
      this.logger.error('Ferguson authentication failed', error);
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
        case 'products':
          await this.syncProducts(result);
          break;
        case 'pricing':
          await this.syncPricing(result);
          break;
        case 'inventory':
          await this.syncInventoryLevels(result);
          break;
        case 'orders':
          await this.syncOrders(result, lastSyncTime);
          break;
        case 'all':
          await this.syncProducts(result);
          await this.syncPricing(result);
          await this.syncInventoryLevels(result);
          await this.syncOrders(result, lastSyncTime);
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
    } catch (error) {
      result.success = false;
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      );
      this.logger.error(
        'Ferguson sync failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    this.emit('sync:complete', result);
    return result;
  }

  async handleWebhook(payload: WebhookPayload): Promise<void> {
    try {
      const event = payload.data;

      switch (event.type) {
        case 'order.status_changed':
          await this.handleOrderStatusChange(event.data);
          break;
        case 'product.price_changed':
          await this.handlePriceChange(event.data);
          break;
        case 'product.availability_changed':
          await this.handleAvailabilityChange(event.data);
          break;
        default:
          this.logger.info(`Unhandled Ferguson webhook: ${event.type}`);
      }

      this.emit('webhook:processed', payload);
    } catch (error) {
      this.logger.error('Ferguson webhook handling failed', error);
      throw error;
    }
  }

  // Product search and catalog methods
  async searchProducts(query: {
    keyword?: string;
    manufacturer?: string;
    category?: string;
    partNumber?: string;
    sku?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ products: FergusonProduct[]; total: number }> {
    try {
      const response = await this.makeRequest('GET', '/products/search', {
        ...query,
        accountNumber: this.fergusonConfig.accountNumber,
        branchCode: this.fergusonConfig.branchCode,
      });

      return {
        products: response?.products || [],
        total: response?.total || 0,
      };
    } catch (error) {
      this.logger.error('Product search failed', error);
      return { products: [], total: 0 };
    }
  }

  async getProductDetails(sku: string): Promise<FergusonProduct | null> {
    try {
      const response = await this.makeRequest('GET', `/products/${sku}`, {
        accountNumber: this.fergusonConfig.accountNumber,
        branchCode: this.fergusonConfig.branchCode,
      });

      return response?.product || null;
    } catch (error) {
      this.logger.error(`Product details lookup failed for ${sku}`, error);
      return null;
    }
  }

  async getProductAvailability(skus: string[]): Promise<Record<string, any>> {
    try {
      const response = await this.makeRequest(
        'POST',
        '/products/availability',
        {
          skus,
          accountNumber: this.fergusonConfig.accountNumber,
          branchCode: this.fergusonConfig.branchCode,
        }
      );

      return response?.availability || {};
    } catch (error) {
      this.logger.error('Availability lookup failed', error);
      return {};
    }
  }

  // Pricing methods
  async getProductPricing(
    skus: string[]
  ): Promise<Record<string, FergusonPricing>> {
    try {
      const response = await this.makeRequest('POST', '/pricing/products', {
        skus,
        accountNumber: this.fergusonConfig.accountNumber,
      });

      return response?.pricing || {};
    } catch (error) {
      this.logger.error('Pricing lookup failed', error);
      return {};
    }
  }

  async getContractPricing(
    sku: string,
    quantity: number
  ): Promise<number | null> {
    try {
      const response = await this.makeRequest('GET', '/pricing/contract', {
        sku,
        quantity,
        accountNumber: this.fergusonConfig.accountNumber,
      });

      return response?.contractPrice || null;
    } catch (error) {
      this.logger.error(`Contract pricing lookup failed for ${sku}`, error);
      return null;
    }
  }

  // Order management methods
  async createOrder(orderData: {
    customerPO?: string;
    requestedDeliveryDate?: string;
    items: Array<{
      sku: string;
      quantity: number;
    }>;
    deliveryAddress: {
      name: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      zipCode: string;
    };
    specialInstructions?: string;
  }): Promise<FergusonOrder | null> {
    try {
      const response = await this.makeRequest('POST', '/orders', {
        ...orderData,
        accountNumber: this.fergusonConfig.accountNumber,
        branchCode: this.fergusonConfig.branchCode,
      });

      return response?.order || null;
    } catch (error) {
      this.logger.error('Order creation failed', error);
      return null;
    }
  }

  async getOrderStatus(orderNumber: string): Promise<FergusonOrder | null> {
    try {
      const response = await this.makeRequest('GET', `/orders/${orderNumber}`, {
        accountNumber: this.fergusonConfig.accountNumber,
      });

      return response?.order || null;
    } catch (error) {
      this.logger.error(`Order status lookup failed for ${orderNumber}`, error);
      return null;
    }
  }

  async cancelOrder(orderNumber: string, reason?: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(
        'POST',
        `/orders/${orderNumber}/cancel`,
        {
          reason,
          accountNumber: this.fergusonConfig.accountNumber,
        }
      );

      return response?.success === true;
    } catch (error) {
      this.logger.error(`Order cancellation failed for ${orderNumber}`, error);
      return false;
    }
  }

  // Automated ordering based on inventory levels
  async createAutomaticOrder(jobId: string): Promise<FergusonOrder | null> {
    try {
      // Get parts needed for the job
      const jobParts = await query(
        'SELECT ji.inventory_id, ji.quantity_used, i.name, i.sku FROM job_inventory ji JOIN inventory i ON ji.inventory_id = i.id WHERE ji.job_id = $1',
        [jobId]
      );

      if (jobParts.rows.length === 0) {
        return null;
      }

      // Check Ferguson availability and pricing
      const skus = jobParts.rows.map((part) => part.sku).filter(Boolean);
      const availability = await this.getProductAvailability(skus);
      const pricing = await this.getProductPricing(skus);

      // Create order items
      const orderItems = jobParts.rows
        .filter(
          (part) =>
            part.sku &&
            availability[part.sku]?.totalAvailable >= part.quantity_used
        )
        .map((part) => ({
          sku: part.sku,
          quantity: part.quantity_used,
        }));

      if (orderItems.length === 0) {
        this.logger.warn(`No available parts found for job ${jobId}`);
        return null;
      }

      // Get job delivery address
      const jobQuery = await query(
        'SELECT j.*, c.first_name, c.last_name, c.address, c.city, c.state, c.zip_code FROM jobs j JOIN customers c ON j.customer_id = c.id WHERE j.id = $1',
        [jobId]
      );

      if (jobQuery.rows.length === 0) {
        throw new Error(`Job ${jobId} not found`);
      }

      const job = jobQuery.rows[0];

      const order = await this.createOrder({
        customerPO: `JOB-${job.job_number}`,
        requestedDeliveryDate: job.scheduled_date,
        items: orderItems,
        deliveryAddress: {
          name: `${job.first_name} ${job.last_name}`,
          address1: job.address,
          city: job.city,
          state: job.state,
          zipCode: job.zip_code,
        },
        specialInstructions: `Parts for job ${job.job_number}: ${job.title}`,
      });

      if (order) {
        // Record the order in our database
        await this.recordOrder(order, jobId);
      }

      return order;
    } catch (error) {
      this.logger.error(
        `Automatic order creation failed for job ${jobId}`,
        error
      );
      return null;
    }
  }

  // Sync methods
  private async syncProducts(result: SyncResult): Promise<void> {
    // Sync products for categories we commonly use
    const categories = ['HVAC', 'Plumbing', 'Electrical'];

    for (const category of categories) {
      try {
        const searchResult = await this.searchProducts({
          category,
          limit: 1000,
        });

        for (const product of searchResult.products) {
          await this.upsertProduct(product);
          result.recordsProcessed++;
        }
      } catch (error) {
        result.errors.push(
          `Category ${category}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
  }

  private async syncPricing(result: SyncResult): Promise<void> {
    // Get all Ferguson products we have in inventory
    const productsQuery = await query(
      'SELECT ferguson_sku FROM inventory WHERE ferguson_sku IS NOT NULL'
    );

    const skus = productsQuery.rows.map((row) => row.ferguson_sku);

    if (skus.length > 0) {
      try {
        const pricing = await this.getProductPricing(skus);

        for (const [sku, priceData] of Object.entries(pricing)) {
          await this.updateProductPricing(sku, priceData);
          result.recordsProcessed++;
        }
      } catch (error) {
        result.errors.push(
          `Pricing sync: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
  }

  private async syncInventoryLevels(result: SyncResult): Promise<void> {
    // Get availability for all Ferguson products
    const productsQuery = await query(
      'SELECT ferguson_sku FROM inventory WHERE ferguson_sku IS NOT NULL'
    );

    const skus = productsQuery.rows.map((row) => row.ferguson_sku);

    if (skus.length > 0) {
      try {
        const availability = await this.getProductAvailability(skus);

        for (const [sku, availData] of Object.entries(availability)) {
          await this.updateProductAvailability(sku, availData);
          result.recordsProcessed++;
        }
      } catch (error) {
        result.errors.push(
          `Availability sync: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
  }

  private async syncOrders(
    result: SyncResult,
    lastSyncTime?: Date
  ): Promise<void> {
    // Sync recent orders
    const ordersQuery = await query(
      'SELECT ferguson_order_number FROM distributor_orders WHERE distributor = $1 AND (last_synced_at IS NULL OR last_synced_at < $2)',
      [
        'Ferguson',
        lastSyncTime || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ]
    );

    for (const orderRow of ordersQuery.rows) {
      try {
        const order = await this.getOrderStatus(orderRow.ferguson_order_number);

        if (order) {
          await this.updateOrderStatus(order);
          result.recordsProcessed++;
        }
      } catch (error) {
        result.errors.push(
          `Order ${orderRow.ferguson_order_number}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
  }

  // Database operations
  private async upsertProduct(product: FergusonProduct): Promise<void> {
    const existingProduct = await query(
      'SELECT id FROM distributor_products WHERE sku = $1 AND distributor = $2',
      [product.sku, 'Ferguson']
    );

    if (existingProduct.rows.length > 0) {
      await query(
        `UPDATE distributor_products SET 
         manufacturer_part_number = $3, manufacturer = $4, description = $5,
         category = $6, list_price = $7, contract_price = $8,
         specifications = $9, updated_at = NOW()
         WHERE sku = $1 AND distributor = $2`,
        [
          product.sku,
          'Ferguson',
          product.manufacturerPartNumber,
          product.manufacturer,
          product.description,
          product.category,
          product.listPrice,
          product.contractPrice,
          JSON.stringify(product.specifications),
        ]
      );
    } else {
      await query(
        `INSERT INTO distributor_products (
          sku, distributor, manufacturer_part_number, manufacturer, description,
          category, list_price, contract_price, specifications, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          product.sku,
          'Ferguson',
          product.manufacturerPartNumber,
          product.manufacturer,
          product.description,
          product.category,
          product.listPrice,
          product.contractPrice,
          JSON.stringify(product.specifications),
        ]
      );
    }
  }

  private async updateProductPricing(
    sku: string,
    pricing: FergusonPricing
  ): Promise<void> {
    await query(
      `UPDATE distributor_products SET 
       list_price = $3, contract_price = $4, discount_percent = $5,
       price_breaks = $6, pricing_updated_at = NOW()
       WHERE sku = $1 AND distributor = $2`,
      [
        sku,
        'Ferguson',
        pricing.listPrice,
        pricing.contractPrice,
        pricing.discountPercent,
        JSON.stringify(pricing.priceBreaks),
      ]
    );
  }

  private async updateProductAvailability(
    sku: string,
    availability: any
  ): Promise<void> {
    await query(
      `UPDATE distributor_products SET 
       branch_stock = $3, warehouse_stock = $4, total_available = $5,
       next_available_date = $6, availability_updated_at = NOW()
       WHERE sku = $1 AND distributor = $2`,
      [
        sku,
        'Ferguson',
        availability.branchStock,
        availability.warehouseStock,
        availability.totalAvailable,
        availability.nextAvailableDate
          ? new Date(availability.nextAvailableDate)
          : null,
      ]
    );
  }

  private async recordOrder(
    order: FergusonOrder,
    jobId?: string
  ): Promise<void> {
    await query(
      `INSERT INTO distributor_orders (
        distributor, order_number, job_id, status, order_date,
        subtotal, tax, shipping, total, order_data, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
      [
        'Ferguson',
        order.orderNumber,
        jobId,
        order.status,
        new Date(order.orderDate),
        order.totals.subtotal,
        order.totals.tax,
        order.totals.shipping,
        order.totals.total,
        JSON.stringify(order),
      ]
    );
  }

  private async updateOrderStatus(order: FergusonOrder): Promise<void> {
    await query(
      `UPDATE distributor_orders SET 
       status = $3, order_data = $4, last_synced_at = NOW(), updated_at = NOW()
       WHERE order_number = $1 AND distributor = $2`,
      [order.orderNumber, 'Ferguson', order.status, JSON.stringify(order)]
    );
  }

  // Webhook handlers
  private async handleOrderStatusChange(data: any): Promise<void> {
    await this.updateOrderStatus(data.order);
    this.logger.info(
      `Order status updated: ${data.order.orderNumber} -> ${data.order.status}`
    );
  }

  private async handlePriceChange(data: any): Promise<void> {
    await this.updateProductPricing(data.sku, data.pricing);
    this.logger.info(`Price updated for SKU: ${data.sku}`);
  }

  private async handleAvailabilityChange(data: any): Promise<void> {
    await this.updateProductAvailability(data.sku, data.availability);
    this.logger.info(`Availability updated for SKU: ${data.sku}`);
  }

  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const requestHeaders = {
      'X-API-Key': this.fergusonConfig.apiKey,
      'X-Account-Number': this.fergusonConfig.accountNumber,
      'Content-Type': 'application/json',
      ...headers,
    };

    return await super.makeRequest(method, endpoint, data, requestHeaders);
  }
}
