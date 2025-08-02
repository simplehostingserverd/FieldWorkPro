// Trane Equipment Manufacturer Integration
import { BaseIntegration, IntegrationConfig, WebhookPayload, SyncResult } from '../base/IntegrationManager';
import { query } from '../../database';

export interface TraneConfig extends IntegrationConfig {
  dealerCode: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
}

export interface TraneEquipment {
  modelNumber: string;
  serialNumber: string;
  productFamily: string;
  brand: string;
  description: string;
  warrantyInfo: {
    startDate?: string;
    endDate?: string;
    type: string;
    status: 'active' | 'expired' | 'voided';
  };
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
      weight: string;
    };
    operatingLimits?: {
      minTemp: string;
      maxTemp: string;
      maxPressure: string;
    };
  };
  documentation: {
    installationGuide?: string;
    operationManual?: string;
    serviceManual?: string;
    partsManual?: string;
    wiring_diagram?: string;
  };
}

export interface TranePart {
  partNumber: string;
  description: string;
  category: string;
  compatibleModels: string[];
  listPrice: number;
  availability: 'available' | 'backordered' | 'discontinued' | 'special_order';
  leadTime?: number;
  specifications?: Record<string, string>;
  imageUrl?: string;
  technicalDrawing?: string;
  supersededBy?: string;
  alternativeParts?: string[];
}

export interface TraneServiceBulletin {
  bulletinNumber: string;
  title: string;
  description: string;
  affectedModels: string[];
  severity: 'critical' | 'important' | 'informational';
  publishDate: string;
  category: 'safety' | 'performance' | 'maintenance' | 'installation';
  documentUrl: string;
}

export class TraneIntegration extends BaseIntegration {
  private traneConfig: TraneConfig;

  constructor(config: TraneConfig) {
    super(config);
    this.traneConfig = config;
    this.config.baseUrl = config.environment === 'production' 
      ? 'https://api.trane.com/v1'
      : 'https://sandbox-api.trane.com/v1';
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.makeRequest('GET', '/dealer/authenticate', {
        dealerCode: this.traneConfig.dealerCode,
      });
      
      return response && response.authenticated === true;
    } catch (error) {
      this.logger.error('Trane authentication failed', error);
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
        case 'bulletins':
          await this.syncServiceBulletins(result);
          break;
        case 'all':
          await this.syncEquipmentData(result);
          await this.syncPartsData(result);
          await this.syncWarrantyData(result);
          await this.syncServiceBulletins(result);
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      this.logger.error('Trane sync failed', error);
    }

    this.emit('sync:complete', result);
    return result;
  }

  async handleWebhook(payload: WebhookPayload): Promise<void> {
    this.logger.info('Trane webhook received', payload);
    this.emit('webhook:processed', payload);
  }

  // Equipment lookup methods
  async lookupEquipmentBySerial(serialNumber: string): Promise<TraneEquipment | null> {
    try {
      const response = await this.makeRequest('GET', `/equipment/serial/${serialNumber}`, {
        dealerCode: this.traneConfig.dealerCode,
      });

      return response?.equipment || null;
    } catch (error) {
      this.logger.error(`Equipment lookup failed for serial ${serialNumber}`, error);
      return null;
    }
  }

  async lookupEquipmentByModel(modelNumber: string): Promise<TraneEquipment[]> {
    try {
      const response = await this.makeRequest('GET', `/equipment/model/${modelNumber}`, {
        dealerCode: this.traneConfig.dealerCode,
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
  }): Promise<TranePart[]> {
    try {
      const response = await this.makeRequest('GET', '/parts/search', {
        ...query,
        dealerCode: this.traneConfig.dealerCode,
      });

      return response?.parts || [];
    } catch (error) {
      this.logger.error('Parts search failed', error);
      return [];
    }
  }

  async getPartDetails(partNumber: string): Promise<TranePart | null> {
    try {
      const response = await this.makeRequest('GET', `/parts/${partNumber}`, {
        dealerCode: this.traneConfig.dealerCode,
      });

      return response?.part || null;
    } catch (error) {
      this.logger.error(`Part details lookup failed for ${partNumber}`, error);
      return null;
    }
  }

  async getCompatibleParts(modelNumber: string): Promise<TranePart[]> {
    try {
      const response = await this.makeRequest('GET', `/parts/compatible/${modelNumber}`, {
        dealerCode: this.traneConfig.dealerCode,
      });

      return response?.parts || [];
    } catch (error) {
      this.logger.error(`Compatible parts lookup failed for ${modelNumber}`, error);
      return [];
    }
  }

  // Warranty methods
  async checkWarranty(serialNumber: string): Promise<any> {
    try {
      const response = await this.makeRequest('GET', `/warranty/check/${serialNumber}`, {
        dealerCode: this.traneConfig.dealerCode,
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
    installerInfo: {
      companyName: string;
      contractorLicense: string;
      technicianName: string;
    };
  }): Promise<boolean> {
    try {
      const response = await this.makeRequest('POST', '/warranty/register', {
        ...warrantyData,
        dealerCode: this.traneConfig.dealerCode,
      });

      return response?.success === true;
    } catch (error) {
      this.logger.error('Warranty registration failed', error);
      return false;
    }
  }

  // Service bulletin methods
  async getServiceBulletins(modelNumber?: string): Promise<TraneServiceBulletin[]> {
    try {
      const params: any = {
        dealerCode: this.traneConfig.dealerCode,
      };

      if (modelNumber) {
        params.modelNumber = modelNumber;
      }

      const response = await this.makeRequest('GET', '/bulletins', params);

      return response?.bulletins || [];
    } catch (error) {
      this.logger.error('Service bulletins lookup failed', error);
      return [];
    }
  }

  async getCriticalBulletins(): Promise<TraneServiceBulletin[]> {
    try {
      const response = await this.makeRequest('GET', '/bulletins/critical', {
        dealerCode: this.traneConfig.dealerCode,
      });

      return response?.bulletins || [];
    } catch (error) {
      this.logger.error('Critical bulletins lookup failed', error);
      return [];
    }
  }

  // Documentation methods
  async getServiceManual(modelNumber: string): Promise<string | null> {
    try {
      const response = await this.makeRequest('GET', `/documentation/service/${modelNumber}`, {
        dealerCode: this.traneConfig.dealerCode,
      });

      return response?.documentUrl || null;
    } catch (error) {
      this.logger.error(`Service manual lookup failed for ${modelNumber}`, error);
      return null;
    }
  }

  async getInstallationGuide(modelNumber: string): Promise<string | null> {
    try {
      const response = await this.makeRequest('GET', `/documentation/installation/${modelNumber}`, {
        dealerCode: this.traneConfig.dealerCode,
      });

      return response?.documentUrl || null;
    } catch (error) {
      this.logger.error(`Installation guide lookup failed for ${modelNumber}`, error);
      return null;
    }
  }

  async getWiringDiagram(modelNumber: string): Promise<string | null> {
    try {
      const response = await this.makeRequest('GET', `/documentation/wiring/${modelNumber}`, {
        dealerCode: this.traneConfig.dealerCode,
      });

      return response?.documentUrl || null;
    } catch (error) {
      this.logger.error(`Wiring diagram lookup failed for ${modelNumber}`, error);
      return null;
    }
  }

  // Sync methods
  private async syncEquipmentData(result: SyncResult): Promise<void> {
    const equipmentQuery = await query(
      'SELECT id, serial_number, model FROM equipment WHERE manufacturer = $1 AND trane_data_synced_at IS NULL OR trane_data_synced_at < NOW() - INTERVAL \'30 days\'',
      ['Trane']
    );

    for (const equipment of equipmentQuery.rows) {
      try {
        const traneData = await this.lookupEquipmentBySerial(equipment.serial_number);
        
        if (traneData) {
          await this.updateEquipmentWithTraneData(equipment.id, traneData);
          result.recordsProcessed++;
        }
      } catch (error) {
        result.errors.push(`Equipment ${equipment.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async syncPartsData(result: SyncResult): Promise<void> {
    const modelsQuery = await query(
      'SELECT DISTINCT model FROM equipment WHERE manufacturer = $1',
      ['Trane']
    );

    for (const modelRow of modelsQuery.rows) {
      try {
        const parts = await this.getCompatibleParts(modelRow.model);
        
        for (const part of parts) {
          await this.upsertPartData(part);
          result.recordsProcessed++;
        }
      } catch (error) {
        result.errors.push(`Parts for model ${modelRow.model}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async syncWarrantyData(result: SyncResult): Promise<void> {
    const equipmentQuery = await query(
      'SELECT id, serial_number FROM equipment WHERE manufacturer = $1',
      ['Trane']
    );

    for (const equipment of equipmentQuery.rows) {
      try {
        const warranty = await this.checkWarranty(equipment.serial_number);
        
        if (warranty) {
          await this.updateEquipmentWarranty(equipment.id, warranty);
          result.recordsProcessed++;
        }
      } catch (error) {
        result.errors.push(`Warranty for ${equipment.serial_number}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async syncServiceBulletins(result: SyncResult): Promise<void> {
    try {
      const bulletins = await this.getServiceBulletins();
      
      for (const bulletin of bulletins) {
        await this.upsertServiceBulletin(bulletin);
        result.recordsProcessed++;
      }
    } catch (error) {
      result.errors.push(`Service bulletins: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Database operations
  private async updateEquipmentWithTraneData(equipmentId: string, traneData: TraneEquipment): Promise<void> {
    await query(
      `UPDATE equipment SET 
       manufacturer_model_number = $2,
       manufacturer_description = $3,
       specifications = $4,
       service_manual_url = $5,
       parts_manual_url = $6,
       installation_manual_url = $7,
       trane_data_synced_at = NOW(),
       updated_at = NOW()
       WHERE id = $1`,
      [
        equipmentId,
        traneData.modelNumber,
        traneData.description,
        JSON.stringify(traneData.specifications),
        traneData.documentation.serviceManual,
        traneData.documentation.partsManual,
        traneData.documentation.installationGuide,
      ]
    );
  }

  private async upsertPartData(part: TranePart): Promise<void> {
    const existingPart = await query(
      'SELECT id FROM manufacturer_parts WHERE part_number = $1 AND manufacturer = $2',
      [part.partNumber, 'Trane']
    );

    if (existingPart.rows.length > 0) {
      await query(
        `UPDATE manufacturer_parts SET 
         description = $3, category = $4, list_price = $5, availability = $6,
         lead_time = $7, specifications = $8, image_url = $9,
         updated_at = NOW()
         WHERE part_number = $1 AND manufacturer = $2`,
        [
          part.partNumber,
          'Trane',
          part.description,
          part.category,
          part.listPrice,
          part.availability,
          part.leadTime,
          JSON.stringify(part.specifications),
          part.imageUrl,
        ]
      );
    } else {
      await query(
        `INSERT INTO manufacturer_parts (
          part_number, manufacturer, description, category, list_price,
          availability, lead_time, specifications, image_url,
          compatible_models, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          part.partNumber,
          'Trane',
          part.description,
          part.category,
          part.listPrice,
          part.availability,
          part.leadTime,
          JSON.stringify(part.specifications),
          part.imageUrl,
          JSON.stringify(part.compatibleModels),
        ]
      );
    }
  }

  private async updateEquipmentWarranty(equipmentId: string, warranty: any): Promise<void> {
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
        warranty.startDate ? new Date(warranty.startDate) : null,
        warranty.endDate ? new Date(warranty.endDate) : null,
        warranty.status,
        JSON.stringify(warranty),
      ]
    );
  }

  private async upsertServiceBulletin(bulletin: TraneServiceBulletin): Promise<void> {
    const existingBulletin = await query(
      'SELECT id FROM service_bulletins WHERE bulletin_number = $1 AND manufacturer = $2',
      [bulletin.bulletinNumber, 'Trane']
    );

    if (existingBulletin.rows.length > 0) {
      await query(
        `UPDATE service_bulletins SET 
         title = $3, description = $4, affected_models = $5, severity = $6,
         category = $7, document_url = $8, updated_at = NOW()
         WHERE bulletin_number = $1 AND manufacturer = $2`,
        [
          bulletin.bulletinNumber,
          'Trane',
          bulletin.title,
          bulletin.description,
          JSON.stringify(bulletin.affectedModels),
          bulletin.severity,
          bulletin.category,
          bulletin.documentUrl,
        ]
      );
    } else {
      await query(
        `INSERT INTO service_bulletins (
          bulletin_number, manufacturer, title, description, affected_models,
          severity, publish_date, category, document_url, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          bulletin.bulletinNumber,
          'Trane',
          bulletin.title,
          bulletin.description,
          JSON.stringify(bulletin.affectedModels),
          bulletin.severity,
          new Date(bulletin.publishDate),
          bulletin.category,
          bulletin.documentUrl,
        ]
      );
    }
  }

  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const requestHeaders = {
      'X-API-Key': this.traneConfig.apiKey,
      'X-Dealer-Code': this.traneConfig.dealerCode,
      'Content-Type': 'application/json',
      ...headers,
    };

    return await super.makeRequest(method, endpoint, data, requestHeaders);
  }
}
