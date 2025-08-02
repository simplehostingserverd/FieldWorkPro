// Carrier Equipment Manufacturer Integration
import { BaseIntegration, IntegrationConfig, WebhookPayload, SyncResult } from '../base/IntegrationManager';
import { query } from '../../database';

export interface CarrierConfig extends IntegrationConfig {
  dealerCode: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
}

export interface CarrierEquipment {
  modelNumber: string;
  serialNumber: string;
  productType: string;
  brand: string;
  description: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  installationDate?: string;
  specifications: {
    capacity?: string;
    efficiency?: string;
    refrigerant?: string;
    voltage?: string;
    dimensions?: {
      height: string;
      width: string;
      depth: string;
    };
  };
  manuals: {
    installation?: string;
    operation?: string;
    service?: string;
    parts?: string;
  };
}

export interface CarrierPart {
  partNumber: string;
  description: string;
  category: string;
  compatibleModels: string[];
  listPrice: number;
  availability: 'in-stock' | 'backordered' | 'discontinued';
  leadTime?: number;
  specifications?: Record<string, string>;
  imageUrl?: string;
  dataSheetUrl?: string;
}

export interface CarrierWarranty {
  serialNumber: string;
  modelNumber: string;
  warrantyType: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'voided';
  coverageDetails: {
    parts: boolean;
    labor: boolean;
    compressor: boolean;
    heatExchanger: boolean;
  };
  registrationRequired: boolean;
  transferable: boolean;
}

export class CarrierIntegration extends BaseIntegration {
  private carrierConfig: CarrierConfig;

  constructor(config: CarrierConfig) {
    super(config);
    this.carrierConfig = config;
    this.config.baseUrl = config.environment === 'production' 
      ? 'https://api.carrier.com/v1'
      : 'https://sandbox-api.carrier.com/v1';
  }

  async authenticate(): Promise<boolean> {
    try {
      // Test authentication with dealer verification
      const response = await this.makeRequest('GET', '/dealer/verify', {
        dealerCode: this.carrierConfig.dealerCode,
      });
      
      return response && response.status === 'verified';
    } catch (error) {
      this.logger.error('Carrier authentication failed', error);
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
        case 'equipment':
          await this.syncEquipmentData(result);
          break;
        case 'parts':
          await this.syncPartsData(result);
          break;
        case 'warranties':
          await this.syncWarrantyData(result);
          break;
        case 'all':
          await this.syncEquipmentData(result);
          await this.syncPartsData(result);
          await this.syncWarrantyData(result);
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
    } catch (error) {
      result.success = false;
      result.errors.push(error.message);
      this.logger.error('Carrier sync failed', error);
    }

    this.emit('sync:complete', result);
    return result;
  }

  async handleWebhook(payload: WebhookPayload): Promise<void> {
    // Carrier doesn't typically use webhooks, but we can handle notifications
    this.logger.info('Carrier webhook received', payload);
    this.emit('webhook:processed', payload);
  }

  // Equipment lookup methods
  async lookupEquipmentBySerial(serialNumber: string): Promise<CarrierEquipment | null> {
    try {
      const response = await this.makeRequest('GET', `/equipment/lookup`, {
        serialNumber,
        dealerCode: this.carrierConfig.dealerCode,
      });

      if (response && response.equipment) {
        return response.equipment;
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Equipment lookup failed for serial ${serialNumber}`, error);
      return null;
    }
  }

  async lookupEquipmentByModel(modelNumber: string): Promise<CarrierEquipment[]> {
    try {
      const response = await this.makeRequest('GET', `/equipment/model/${modelNumber}`, {
        dealerCode: this.carrierConfig.dealerCode,
      });

      return response?.equipment || [];
    } catch (error) {
      this.logger.error(`Model lookup failed for ${modelNumber}`, error);
      return [];
    }
  }

  // Parts catalog methods
  async searchParts(query: {
    modelNumber?: string;
    partNumber?: string;
    category?: string;
    keyword?: string;
  }): Promise<CarrierPart[]> {
    try {
      const response = await this.makeRequest('GET', '/parts/search', {
        ...query,
        dealerCode: this.carrierConfig.dealerCode,
      });

      return response?.parts || [];
    } catch (error) {
      this.logger.error('Parts search failed', error);
      return [];
    }
  }

  async getPartDetails(partNumber: string): Promise<CarrierPart | null> {
    try {
      const response = await this.makeRequest('GET', `/parts/${partNumber}`, {
        dealerCode: this.carrierConfig.dealerCode,
      });

      return response?.part || null;
    } catch (error) {
      this.logger.error(`Part details lookup failed for ${partNumber}`, error);
      return null;
    }
  }

  async getCompatibleParts(modelNumber: string): Promise<CarrierPart[]> {
    try {
      const response = await this.makeRequest('GET', `/parts/compatible/${modelNumber}`, {
        dealerCode: this.carrierConfig.dealerCode,
      });

      return response?.parts || [];
    } catch (error) {
      this.logger.error(`Compatible parts lookup failed for ${modelNumber}`, error);
      return [];
    }
  }

  // Warranty methods
  async checkWarranty(serialNumber: string): Promise<CarrierWarranty | null> {
    try {
      const response = await this.makeRequest('GET', `/warranty/check`, {
        serialNumber,
        dealerCode: this.carrierConfig.dealerCode,
      });

      return response?.warranty || null;
    } catch (error) {
      this.logger.error(`Warranty check failed for serial ${serialNumber}`, error);
      return null;
    }
  }

  async registerWarranty(warrantyData: {
    serialNumber: string;
    modelNumber: string;
    installationDate: string;
    customerInfo: {
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      phone: string;
      email: string;
    };
  }): Promise<boolean> {
    try {
      const response = await this.makeRequest('POST', '/warranty/register', {
        ...warrantyData,
        dealerCode: this.carrierConfig.dealerCode,
      });

      return response?.success === true;
    } catch (error) {
      this.logger.error('Warranty registration failed', error);
      return false;
    }
  }

  // Service manual methods
  async getServiceManual(modelNumber: string): Promise<string | null> {
    try {
      const response = await this.makeRequest('GET', `/manuals/service/${modelNumber}`, {
        dealerCode: this.carrierConfig.dealerCode,
      });

      return response?.manualUrl || null;
    } catch (error) {
      this.logger.error(`Service manual lookup failed for ${modelNumber}`, error);
      return null;
    }
  }

  async getInstallationManual(modelNumber: string): Promise<string | null> {
    try {
      const response = await this.makeRequest('GET', `/manuals/installation/${modelNumber}`, {
        dealerCode: this.carrierConfig.dealerCode,
      });

      return response?.manualUrl || null;
    } catch (error) {
      this.logger.error(`Installation manual lookup failed for ${modelNumber}`, error);
      return null;
    }
  }

  async getPartsManual(modelNumber: string): Promise<string | null> {
    try {
      const response = await this.makeRequest('GET', `/manuals/parts/${modelNumber}`, {
        dealerCode: this.carrierConfig.dealerCode,
      });

      return response?.manualUrl || null;
    } catch (error) {
      this.logger.error(`Parts manual lookup failed for ${modelNumber}`, error);
      return null;
    }
  }

  // Sync methods
  private async syncEquipmentData(result: SyncResult): Promise<void> {
    // Get all equipment from our database that needs manufacturer data
    const equipmentQuery = await query(
      'SELECT id, serial_number, model FROM equipment WHERE manufacturer = $1 AND carrier_data_synced_at IS NULL OR carrier_data_synced_at < NOW() - INTERVAL \'30 days\'',
      ['Carrier']
    );

    for (const equipment of equipmentQuery.rows) {
      try {
        const carrierData = await this.lookupEquipmentBySerial(equipment.serial_number);
        
        if (carrierData) {
          await this.updateEquipmentWithCarrierData(equipment.id, carrierData);
          result.recordsProcessed++;
        }
      } catch (error) {
        result.errors.push(`Equipment ${equipment.id}: ${error.message}`);
      }
    }
  }

  private async syncPartsData(result: SyncResult): Promise<void> {
    // Sync parts catalog data for equipment we service
    const modelsQuery = await query(
      'SELECT DISTINCT model FROM equipment WHERE manufacturer = $1',
      ['Carrier']
    );

    for (const modelRow of modelsQuery.rows) {
      try {
        const parts = await this.getCompatibleParts(modelRow.model);
        
        for (const part of parts) {
          await this.upsertPartData(part);
          result.recordsProcessed++;
        }
      } catch (error) {
        result.errors.push(`Parts for model ${modelRow.model}: ${error.message}`);
      }
    }
  }

  private async syncWarrantyData(result: SyncResult): Promise<void> {
    // Sync warranty information for all Carrier equipment
    const equipmentQuery = await query(
      'SELECT id, serial_number FROM equipment WHERE manufacturer = $1',
      ['Carrier']
    );

    for (const equipment of equipmentQuery.rows) {
      try {
        const warranty = await this.checkWarranty(equipment.serial_number);
        
        if (warranty) {
          await this.updateEquipmentWarranty(equipment.id, warranty);
          result.recordsProcessed++;
        }
      } catch (error) {
        result.errors.push(`Warranty for ${equipment.serial_number}: ${error.message}`);
      }
    }
  }

  // Database operations
  private async updateEquipmentWithCarrierData(equipmentId: string, carrierData: CarrierEquipment): Promise<void> {
    await query(
      `UPDATE equipment SET 
       manufacturer_model_number = $2,
       manufacturer_description = $3,
       specifications = $4,
       service_manual_url = $5,
       parts_manual_url = $6,
       installation_manual_url = $7,
       carrier_data_synced_at = NOW(),
       updated_at = NOW()
       WHERE id = $1`,
      [
        equipmentId,
        carrierData.modelNumber,
        carrierData.description,
        JSON.stringify(carrierData.specifications),
        carrierData.manuals.service,
        carrierData.manuals.parts,
        carrierData.manuals.installation,
      ]
    );
  }

  private async upsertPartData(part: CarrierPart): Promise<void> {
    const existingPart = await query(
      'SELECT id FROM manufacturer_parts WHERE part_number = $1 AND manufacturer = $2',
      [part.partNumber, 'Carrier']
    );

    if (existingPart.rows.length > 0) {
      await query(
        `UPDATE manufacturer_parts SET 
         description = $3, category = $4, list_price = $5, availability = $6,
         lead_time = $7, specifications = $8, image_url = $9, data_sheet_url = $10,
         updated_at = NOW()
         WHERE part_number = $1 AND manufacturer = $2`,
        [
          part.partNumber,
          'Carrier',
          part.description,
          part.category,
          part.listPrice,
          part.availability,
          part.leadTime,
          JSON.stringify(part.specifications),
          part.imageUrl,
          part.dataSheetUrl,
        ]
      );
    } else {
      await query(
        `INSERT INTO manufacturer_parts (
          part_number, manufacturer, description, category, list_price,
          availability, lead_time, specifications, image_url, data_sheet_url,
          compatible_models, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          part.partNumber,
          'Carrier',
          part.description,
          part.category,
          part.listPrice,
          part.availability,
          part.leadTime,
          JSON.stringify(part.specifications),
          part.imageUrl,
          part.dataSheetUrl,
          JSON.stringify(part.compatibleModels),
        ]
      );
    }
  }

  private async updateEquipmentWarranty(equipmentId: string, warranty: CarrierWarranty): Promise<void> {
    await query(
      `UPDATE equipment SET 
       warranty_start_date = $2,
       warranty_end_date = $3,
       warranty_status = $4,
       warranty_details = $5,
       warranty_synced_at = NOW(),
       updated_at = NOW()
       WHERE id = $1`,
      [
        equipmentId,
        new Date(warranty.startDate),
        new Date(warranty.endDate),
        warranty.status,
        JSON.stringify({
          type: warranty.warrantyType,
          coverage: warranty.coverageDetails,
          registrationRequired: warranty.registrationRequired,
          transferable: warranty.transferable,
        }),
      ]
    );
  }

  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const requestHeaders = {
      'X-API-Key': this.carrierConfig.apiKey,
      'X-Dealer-Code': this.carrierConfig.dealerCode,
      'Content-Type': 'application/json',
      ...headers,
    };

    return await super.makeRequest(method, endpoint, data, requestHeaders);
  }
}
