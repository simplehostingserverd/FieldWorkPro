// Integration API Routes
import { Router } from 'express';
import {
  getIntegrationStatus,
  testConnections,
  syncAllData,
  syncIntegration,
  handleWebhook,
  getQuickBooksAuthUrl,
  createStripePayment,
  createSquarePayment,
  lookupEquipment,
  getEquipmentWarranty,
  searchParts,
  createPartsOrder,
  syncCustomer,
  syncJob,
} from '../controllers/integrations.controller';

const router = Router();

// General integration management
router.get('/status', getIntegrationStatus);
router.post('/test-connections', testConnections);
router.post('/sync', syncAllData);
router.post('/sync/:integrationName', syncIntegration);

// Webhook endpoints
router.post('/webhooks/:integrationName', handleWebhook);

// QuickBooks specific routes
router.get('/quickbooks/auth-url', getQuickBooksAuthUrl);

// Stripe specific routes
router.post('/stripe/payment', createStripePayment);

// Square specific routes
router.post('/square/payment', createSquarePayment);

// Equipment manufacturer routes
router.get('/equipment/lookup', lookupEquipment);
router.get('/equipment/warranty/:serialNumber', getEquipmentWarranty);

// Parts distributor routes
router.get('/parts/search', searchParts);
router.post('/parts/order', createPartsOrder);

// Customer and job sync routes
router.post('/customers/:customerId/sync', syncCustomer);
router.post('/jobs/:jobId/sync', syncJob);

export default router;
