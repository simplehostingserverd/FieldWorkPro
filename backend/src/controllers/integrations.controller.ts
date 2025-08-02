// Integration Management API Controller
import { Request, Response } from 'express';
import { 
  integrationManager,
  getQuickBooksIntegration,
  getStripeIntegration,
  getCarrierIntegration,
  getFergusonIntegration,
  getHubSpotIntegration,
  syncCustomerToAllPlatforms,
  createJobInAllPlatforms,
  processPaymentWithStripe,
  lookupEquipmentInfo,
  searchPartsFromDistributors,
  createAutomaticPartsOrder
} from '../integrations';

// Get integration status
export const getIntegrationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = integrationManager.getIntegrationStatus();
    const enabledIntegrations = integrationManager.getEnabledIntegrations();
    
    const detailedStatus = await Promise.all(
      enabledIntegrations.map(async (integration) => {
        const connectionTest = await integration.testConnection();
        return {
          name: integration.name,
          enabled: integration.isEnabled,
          connected: connectionTest,
        };
      })
    );

    res.json({
      success: true,
      data: {
        overview: status,
        detailed: detailedStatus,
      },
    });
  } catch (error) {
    console.error('Error getting integration status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get integration status',
      error: error.message,
    });
  }
};

// Test all integration connections
export const testConnections = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await integrationManager.testAllConnections();
    
    res.json({
      success: true,
      data: Object.fromEntries(results),
    });
  } catch (error) {
    console.error('Error testing connections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test connections',
      error: error.message,
    });
  }
};

// Sync data from all integrations
export const syncAllData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityType } = req.query;
    const results = await integrationManager.syncAllData(entityType as string);
    
    res.json({
      success: true,
      data: Object.fromEntries(results),
    });
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync data',
      error: error.message,
    });
  }
};

// Sync specific integration
export const syncIntegration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { integrationName } = req.params;
    const { entityType } = req.query;
    
    const integration = integrationManager.getIntegration(integrationName);
    if (!integration) {
      res.status(404).json({
        success: false,
        message: `Integration '${integrationName}' not found`,
      });
      return;
    }

    const result = await integration.syncData(entityType as string || 'all');
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(`Error syncing ${req.params.integrationName}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to sync ${req.params.integrationName}`,
      error: error.message,
    });
  }
};

// Handle webhooks
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { integrationName } = req.params;
    const signature = req.headers['x-signature'] as string;
    
    const payload = {
      integrationName,
      eventType: req.body.type || 'unknown',
      data: req.body,
      timestamp: new Date(),
      signature,
    };

    await integrationManager.handleWebhook(integrationName, payload);
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Webhook error for ${req.params.integrationName}:`, error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message,
    });
  }
};

// QuickBooks specific endpoints
export const getQuickBooksAuthUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const quickbooks = getQuickBooksIntegration();
    if (!quickbooks) {
      res.status(404).json({
        success: false,
        message: 'QuickBooks integration not available',
      });
      return;
    }

    // In a real implementation, generate OAuth URL
    const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${process.env.QUICKBOOKS_CLIENT_ID}&scope=com.intuit.quickbooks.accounting&redirect_uri=${process.env.QUICKBOOKS_REDIRECT_URI}&response_type=code&access_type=offline`;
    
    res.json({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    console.error('Error generating QuickBooks auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate auth URL',
      error: error.message,
    });
  }
};

// Stripe specific endpoints
export const createStripePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency, customerId, metadata } = req.body;
    
    const paymentIntent = await processPaymentWithStripe({
      amount,
      currency,
      customerId,
      metadata,
    });
    
    res.json({
      success: true,
      data: paymentIntent,
    });
  } catch (error) {
    console.error('Error creating Stripe payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message,
    });
  }
};

// Equipment manufacturer endpoints
export const lookupEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serialNumber, manufacturer } = req.query;
    
    if (!serialNumber || !manufacturer) {
      res.status(400).json({
        success: false,
        message: 'Serial number and manufacturer are required',
      });
      return;
    }

    const equipmentInfo = await lookupEquipmentInfo(
      serialNumber as string,
      manufacturer as string
    );
    
    res.json({
      success: true,
      data: equipmentInfo,
    });
  } catch (error) {
    console.error('Error looking up equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to lookup equipment',
      error: error.message,
    });
  }
};

export const getEquipmentWarranty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serialNumber } = req.params;
    
    const carrier = getCarrierIntegration();
    if (!carrier?.isEnabled) {
      res.status(404).json({
        success: false,
        message: 'Carrier integration not available',
      });
      return;
    }

    const warranty = await carrier.checkWarranty(serialNumber);
    
    res.json({
      success: true,
      data: warranty,
    });
  } catch (error) {
    console.error('Error checking warranty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check warranty',
      error: error.message,
    });
  }
};

// Parts distributor endpoints
export const searchParts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword, manufacturer, partNumber } = req.query;
    
    const parts = await searchPartsFromDistributors({
      keyword: keyword as string,
      manufacturer: manufacturer as string,
      partNumber: partNumber as string,
    });
    
    res.json({
      success: true,
      data: parts,
    });
  } catch (error) {
    console.error('Error searching parts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search parts',
      error: error.message,
    });
  }
};

export const createPartsOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.body;
    
    if (!jobId) {
      res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
      return;
    }

    const order = await createAutomaticPartsOrder(jobId);
    
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error creating parts order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create parts order',
      error: error.message,
    });
  }
};

// Customer sync endpoints
export const syncCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    
    await syncCustomerToAllPlatforms(customerId);
    
    res.json({
      success: true,
      message: 'Customer synced to all platforms',
    });
  } catch (error) {
    console.error('Error syncing customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync customer',
      error: error.message,
    });
  }
};

// Job sync endpoints
export const syncJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    
    await createJobInAllPlatforms(jobId);
    
    res.json({
      success: true,
      message: 'Job synced to all platforms',
    });
  } catch (error) {
    console.error('Error syncing job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync job',
      error: error.message,
    });
  }
};
