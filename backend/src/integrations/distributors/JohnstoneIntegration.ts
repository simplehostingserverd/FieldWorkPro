// Johnstone Supply Parts Distributor Integration
import {
  BaseIntegration,
  IntegrationConfig,
  WebhookPayload,
  SyncResult,
} from '../base/IntegrationManager';
import { query } from '../../database';

export interface JohnstoneConfig extends IntegrationConfig {
  accountNumber: string;
  apiKey: string;
  branchCode: string;
  environment: 'sandbox' | 'production';
}

export interface JohnstoneProduct {
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
    nextShipmentDate?: string;
    nextShipmentQuantity?: number;
  };
  specifications: Record<string, string>;
  images: string[];
  dataSheets: string[];
  substitutes: string[];
  relatedProducts: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface JohnstonePricing {
  sku: string;
  listPrice: number;
  contractPrice: number;
  discountPercent: number;
  priceBreaks: Array<{
    quantity: number;
    price: number;
    discountPercent: number;
  }>;
  effectiveDate: string;
  expirationDate?: string;
  specialPricing?: {
    type: string;
    description: string;
    price: number;
    validUntil: string;
  };
}

export interface JohnstoneOrder {
  orderNumber: string;
  customerPO?: string;
  orderDate: string;
  requestedDeliveryDate?: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'picking'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  items: Array<{
    sku: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status: string;
    backorderQuantity?: number;
    expectedShipDate?: string;
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
    deliveryInstructions?: string;
  };
  specialInstructions?: string;
}

export class JohnstoneIntegration extends BaseIntegration {
  private johnstoneConfig: JohnstoneConfig;

  constructor(config: JohnstoneConfig) {
    super(config);
    this.johnstoneConfig = config;
    this.config.baseUrl =
      config.environment === 'production'
        ? 'https://api.johnstoneconnect.com/v1'
        : 'https://sandbox-api.johnstoneconnect.com/v1';
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.makeRequest('GET', '/account/verify', {
        accountNumber: this.johnstoneConfig.accountNumber,
      });

      return response && response.status === 'active';
    } catch (error) {
      this.logger.error('Johnstone authentication failed', error);
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
      this.logger.error('Johnstone sync failed', error);
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
        case 'product.discontinued':
          await this.handleProductDiscontinued(event.data);
          break;
        default:
          this.logger.info(`Unhandled Johnstone webhook: ${event.type}`);
      }

      this.emit('webhook:processed', payload);
    } catch (error) {
      this.logger.error('Johnstone webhook handling failed', error);
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
  }): Promise<{ products: JohnstoneProduct[]; total: number }> {
    try {
      const response = await this.makeRequest('GET', '/products/search', {
        ...query,
        accountNumber: this.johnstoneConfig.accountNumber,
        branchCode: this.johnstoneConfig.branchCode,
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

  async getProductDetails(sku: string): Promise<JohnstoneProduct | null> {
    try {
      const response = await this.makeRequest('GET', `/products/${sku}`, {
        accountNumber: this.johnstoneConfig.accountNumber,
        branchCode: this.johnstoneConfig.branchCode,
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
          accountNumber: this.johnstoneConfig.accountNumber,
          branchCode: this.johnstoneConfig.branchCode,
        }
      );

      return response?.availability || {};
    } catch (error) {
      this.logger.error('Availability lookup failed', error);
      return {};
    }
  }

  async getProductsByCategory(category: string): Promise<JohnstoneProduct[]> {
    try {
      const response = await this.makeRequest(
        'GET',
        `/products/category/${category}`,
        {
          accountNumber: this.johnstoneConfig.accountNumber,
          branchCode: this.johnstoneConfig.branchCode,
        }
      );

      return response?.products || [];
    } catch (error) {
      this.logger.error(`Category lookup failed for ${category}`, error);
      return [];
    }
  }

  // Pricing methods
  async getProductPricing(
    skus: string[]
  ): Promise<Record<string, JohnstonePricing>> {
    try {
      const response = await this.makeRequest('POST', '/pricing/products', {
        skus,
        accountNumber: this.johnstoneConfig.accountNumber,
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
        accountNumber: this.johnstoneConfig.accountNumber,
      });

      return response?.contractPrice || null;
    } catch (error) {
      this.logger.error(`Contract pricing lookup failed for ${sku}`, error);
      return null;
    }
  }

  async getSpecialPricing(): Promise<JohnstonePricing[]> {
    try {
      const response = await this.makeRequest('GET', '/pricing/specials', {
        accountNumber: this.johnstoneConfig.accountNumber,
      });

      return response?.specialPricing || [];
    } catch (error) {
      this.logger.error('Special pricing lookup failed', error);
      return [];
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
    rushOrder?: boolean;
  }): Promise<JohnstoneOrder | null> {
    try {
      const response = await this.makeRequest('POST', '/orders', {
        ...orderData,
        accountNumber: this.johnstoneConfig.accountNumber,
        branchCode: this.johnstoneConfig.branchCode,
      });

      return response?.order || null;
    } catch (error) {
      this.logger.error('Order creation failed', error);
      return null;
    }
  }

  async getOrderStatus(orderNumber: string): Promise<JohnstoneOrder | null> {
    try {
      const response = await this.makeRequest('GET', `/orders/${orderNumber}`, {
        accountNumber: this.johnstoneConfig.accountNumber,
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
          accountNumber: this.johnstoneConfig.accountNumber,
        }
      );

      return response?.success === true;
    } catch (error) {
      this.logger.error(`Order cancellation failed for ${orderNumber}`, error);
      return false;
    }
  }

  async getOrderHistory(days: number = 30): Promise<JohnstoneOrder[]> {
    try {
      const response = await this.makeRequest('GET', '/orders/history', {
        accountNumber: this.johnstoneConfig.accountNumber,
        days,
      });

      return response?.orders || [];
    } catch (error) {
      this.logger.error('Order history lookup failed', error);
      return [];
    }
  }

  // Automated ordering based on inventory levels
  async createAutomaticOrder(jobId: string): Promise<JohnstoneOrder | null> {
    try {
      const jobParts = await query(
        'SELECT ji.inventory_id, ji.quantity_used, i.name, i.sku FROM job_inventory ji JOIN inventory i ON ji.inventory_id = i.id WHERE ji.job_id = $1',
        [jobId]
      );

      if (jobParts.rows.length === 0) {
        return null;
      }

      const skus = jobParts.rows.map((part) => part.sku).filter(Boolean);
      const availability = await this.getProductAvailability(skus);
      const pricing = await this.getProductPricing(skus);

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
    const categories = ['HVAC', 'Plumbing', 'Electrical', 'Refrigeration'];

    for (const category of categories) {
      try {
        const products = await this.getProductsByCategory(category);

        for (const product of products) {
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
    const productsQuery = await query(
      'SELECT johnstone_sku FROM inventory WHERE johnstone_sku IS NOT NULL'
    );

    const skus = productsQuery.rows.map((row) => row.johnstone_sku);

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
    const productsQuery = await query(
      'SELECT johnstone_sku FROM inventory WHERE johnstone_sku IS NOT NULL'
    );

    const skus = productsQuery.rows.map((row) => row.johnstone_sku);

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
    const days = lastSyncTime
      ? Math.ceil((Date.now() - lastSyncTime.getTime()) / (1000 * 60 * 60 * 24))
      : 7;

    try {
      const orders = await this.getOrderHistory(days);

      for (const order of orders) {
        await this.updateOrderStatus(order);
        result.recordsProcessed++;
      }
    } catch (error) {
      result.errors.push(
        `Orders sync: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  // Database operations
  private async upsertProduct(product: JohnstoneProduct): Promise<void> {
    const existingProduct = await query(
      'SELECT id FROM distributor_products WHERE sku = $1 AND distributor = $2',
      [product.sku, 'Johnstone']
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
          'Johnstone',
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
          'Johnstone',
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
    pricing: JohnstonePricing
  ): Promise<void> {
    await query(
      `UPDATE distributor_products SET 
       list_price = $3, contract_price = $4, discount_percent = $5,
       price_breaks = $6, pricing_updated_at = NOW()
       WHERE sku = $1 AND distributor = $2`,
      [
        sku,
        'Johnstone',
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
        'Johnstone',
        availability.branchStock,
        availability.warehouseStock,
        availability.totalAvailable,
        availability.nextShipmentDate
          ? new Date(availability.nextShipmentDate)
          : null,
      ]
    );
  }

  private async recordOrder(
    order: JohnstoneOrder,
    jobId?: string
  ): Promise<void> {
    await query(
      `INSERT INTO distributor_orders (
        distributor, order_number, job_id, status, order_date,
        subtotal, tax, shipping, total, order_data, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
      [
        'Johnstone',
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

  private async updateOrderStatus(order: JohnstoneOrder): Promise<void> {
    await query(
      `UPDATE distributor_orders SET 
       status = $3, order_data = $4, last_synced_at = NOW(), updated_at = NOW()
       WHERE order_number = $1 AND distributor = $2`,
      [order.orderNumber, 'Johnstone', order.status, JSON.stringify(order)]
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

  private async handleProductDiscontinued(data: any): Promise<void> {
    await query(
      `UPDATE distributor_products SET 
       availability = 'discontinued', availability_updated_at = NOW()
       WHERE sku = $1 AND distributor = $2`,
      [data.sku, 'Johnstone']
    );
    this.logger.info(`Product discontinued: ${data.sku}`);
  }

  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const requestHeaders = {
      'X-API-Key': this.johnstoneConfig.apiKey,
      'X-Account-Number': this.johnstoneConfig.accountNumber,
      'Content-Type': 'application/json',
      ...headers,
    };

    return await super.makeRequest(method, endpoint, data, requestHeaders);
  }
}
