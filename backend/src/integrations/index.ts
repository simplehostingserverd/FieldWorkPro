// Integration Setup and Configuration
import { integrationManager } from './base/IntegrationManager';
import {
  QuickBooksIntegration,
  QuickBooksConfig,
} from './quickbooks/QuickBooksIntegration';
import { StripeIntegration, StripeConfig } from './stripe/StripeIntegration';
import {
  CarrierIntegration,
  CarrierConfig,
} from './manufacturers/CarrierIntegration';
import {
  FergusonIntegration,
  FergusonConfig,
} from './distributors/FergusonIntegration';
// import {
//   HubSpotIntegration,
//   HubSpotConfig,
// } from './marketing/HubSpotIntegration';
import {
  TraneIntegration,
  TraneConfig,
} from './manufacturers/TraneIntegration';
import {
  JohnstoneIntegration,
  JohnstoneConfig,
} from './distributors/JohnstoneIntegration';
import { SquareIntegration, SquareConfig } from './payments/SquareIntegration';
import {
  SalesforceIntegration,
  SalesforceConfig,
} from './crm/SalesforceIntegration';

// Integration configurations - these would typically come from environment variables or database
const integrationConfigs = {
  quickbooks: {
    name: 'QuickBooks',
    enabled: process.env.QUICKBOOKS_ENABLED === 'true',
    clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
    redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || '',
    sandbox: process.env.QUICKBOOKS_SANDBOX === 'true',
    companyId: process.env.QUICKBOOKS_COMPANY_ID || '',
    webhookSecret: process.env.QUICKBOOKS_WEBHOOK_SECRET || '',
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 500,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
  } as QuickBooksConfig,

  stripe: {
    name: 'Stripe',
    enabled: process.env.STRIPE_ENABLED === 'true',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    testMode: process.env.STRIPE_TEST_MODE === 'true',
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
  } as StripeConfig,

  carrier: {
    name: 'Carrier',
    enabled: process.env.CARRIER_ENABLED === 'true',
    dealerCode: process.env.CARRIER_DEALER_CODE || '',
    apiKey: process.env.CARRIER_API_KEY || '',
    environment:
      (process.env.CARRIER_ENVIRONMENT as 'sandbox' | 'production') ||
      'sandbox',
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
  } as CarrierConfig,

  ferguson: {
    name: 'Ferguson',
    enabled: process.env.FERGUSON_ENABLED === 'true',
    accountNumber: process.env.FERGUSON_ACCOUNT_NUMBER || '',
    apiKey: process.env.FERGUSON_API_KEY || '',
    branchCode: process.env.FERGUSON_BRANCH_CODE || '',
    environment:
      (process.env.FERGUSON_ENVIRONMENT as 'sandbox' | 'production') ||
      'sandbox',
    rateLimits: {
      requestsPerMinute: 120,
      requestsPerHour: 2000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
  } as FergusonConfig,

  // hubspot: {
  //   name: 'HubSpot',
  //   enabled: process.env.HUBSPOT_ENABLED === 'true',
  //   accessToken: process.env.HUBSPOT_ACCESS_TOKEN || '',
  //   portalId: process.env.HUBSPOT_PORTAL_ID || '',
  //   appId: process.env.HUBSPOT_APP_ID || '',
  //   rateLimits: {
  //     requestsPerMinute: 100,
  //     requestsPerHour: 40000,
  //   },
  //   retryConfig: {
  //     maxRetries: 3,
  //     backoffMultiplier: 2,
  //     initialDelay: 1000,
  //   },
  // } as HubSpotConfig,

  trane: {
    name: 'Trane',
    enabled: process.env.TRANE_ENABLED === 'true',
    dealerCode: process.env.TRANE_DEALER_CODE || '',
    apiKey: process.env.TRANE_API_KEY || '',
    environment:
      (process.env.TRANE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
  } as TraneConfig,

  johnstone: {
    name: 'Johnstone',
    enabled: process.env.JOHNSTONE_ENABLED === 'true',
    accountNumber: process.env.JOHNSTONE_ACCOUNT_NUMBER || '',
    apiKey: process.env.JOHNSTONE_API_KEY || '',
    branchCode: process.env.JOHNSTONE_BRANCH_CODE || '',
    environment:
      (process.env.JOHNSTONE_ENVIRONMENT as 'sandbox' | 'production') ||
      'sandbox',
    rateLimits: {
      requestsPerMinute: 120,
      requestsPerHour: 2000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
  } as JohnstoneConfig,

  square: {
    name: 'Square',
    enabled: process.env.SQUARE_ENABLED === 'true',
    accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
    applicationId: process.env.SQUARE_APPLICATION_ID || '',
    webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || '',
    environment:
      (process.env.SQUARE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    locationId: process.env.SQUARE_LOCATION_ID || '',
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
  } as SquareConfig,

  salesforce: {
    name: 'Salesforce',
    enabled: process.env.SALESFORCE_ENABLED === 'true',
    clientId: process.env.SALESFORCE_CLIENT_ID || '',
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
    username: process.env.SALESFORCE_USERNAME || '',
    password: process.env.SALESFORCE_PASSWORD || '',
    securityToken: process.env.SALESFORCE_SECURITY_TOKEN || '',
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL || '',
    environment:
      (process.env.SALESFORCE_ENVIRONMENT as 'sandbox' | 'production') ||
      'production',
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 5000,
    },
    retryConfig: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
  } as SalesforceConfig,
};

// Initialize integrations
export function initializeIntegrations(): void {
  console.log('Initializing integrations...');

  // QuickBooks Integration
  if (integrationConfigs.quickbooks.enabled) {
    const quickbooksIntegration = new QuickBooksIntegration(
      integrationConfigs.quickbooks
    );
    integrationManager.registerIntegration(quickbooksIntegration);
  }

  // Stripe Integration
  if (integrationConfigs.stripe.enabled) {
    const stripeIntegration = new StripeIntegration(integrationConfigs.stripe);
    integrationManager.registerIntegration(stripeIntegration);
  }

  // Carrier Integration
  if (integrationConfigs.carrier.enabled) {
    const carrierIntegration = new CarrierIntegration(
      integrationConfigs.carrier
    );
    integrationManager.registerIntegration(carrierIntegration);
  }

  // Ferguson Integration
  if (integrationConfigs.ferguson.enabled) {
    const fergusonIntegration = new FergusonIntegration(
      integrationConfigs.ferguson
    );
    integrationManager.registerIntegration(fergusonIntegration);
  }

  // HubSpot Integration
  // if (integrationConfigs.hubspot.enabled) {
  //   const hubspotIntegration = new HubSpotIntegration(
  //     integrationConfigs.hubspot
  //   );
  //   integrationManager.registerIntegration(hubspotIntegration);
  // }

  // Trane Integration
  if (integrationConfigs.trane.enabled) {
    const traneIntegration = new TraneIntegration(integrationConfigs.trane);
    integrationManager.registerIntegration(traneIntegration);
  }

  // Johnstone Integration
  if (integrationConfigs.johnstone.enabled) {
    const johnstoneIntegration = new JohnstoneIntegration(
      integrationConfigs.johnstone
    );
    integrationManager.registerIntegration(johnstoneIntegration);
  }

  // Square Integration
  if (integrationConfigs.square.enabled) {
    const squareIntegration = new SquareIntegration(integrationConfigs.square);
    integrationManager.registerIntegration(squareIntegration);
  }

  // Salesforce Integration
  if (integrationConfigs.salesforce.enabled) {
    const salesforceIntegration = new SalesforceIntegration(
      integrationConfigs.salesforce
    );
    integrationManager.registerIntegration(salesforceIntegration);
  }

  // Set up event listeners
  setupIntegrationEventListeners();

  console.log(
    `Initialized ${
      integrationManager.getEnabledIntegrations().length
    } integrations`
  );
}

function setupIntegrationEventListeners(): void {
  integrationManager.on(
    'integration:sync:complete',
    (integrationName: string, result: any) => {
      console.log(`Integration sync completed: ${integrationName}`, {
        recordsProcessed: result.recordsProcessed,
        errors: result.errors.length,
      });
    }
  );

  integrationManager.on(
    'integration:sync:error',
    (integrationName: string, error: Error) => {
      console.error(
        `Integration sync error: ${integrationName}`,
        error.message
      );
    }
  );

  integrationManager.on(
    'integration:webhook:received',
    (integrationName: string, payload: any) => {
      console.log(
        `Webhook received from ${integrationName}:`,
        payload.eventType
      );
    }
  );
}

// Authenticate all integrations on startup
export async function authenticateIntegrations(): Promise<void> {
  console.log('Authenticating integrations...');

  const results = await integrationManager.authenticateAll();

  for (const [name, success] of results) {
    if (success) {
      console.log(`✅ ${name} authentication successful`);
    } else {
      console.log(`❌ ${name} authentication failed`);
    }
  }
}

// Test all integration connections
export async function testIntegrationConnections(): Promise<void> {
  console.log('Testing integration connections...');

  const results = await integrationManager.testAllConnections();

  for (const [name, success] of results) {
    if (success) {
      console.log(`✅ ${name} connection test passed`);
    } else {
      console.log(`❌ ${name} connection test failed`);
    }
  }
}

// Sync all integration data
export async function syncAllIntegrationData(): Promise<void> {
  console.log('Syncing all integration data...');

  const results = await integrationManager.syncAllData();

  for (const [name, result] of results) {
    if (result.success) {
      console.log(
        `✅ ${name} sync completed: ${result.recordsProcessed} records processed`
      );
    } else {
      console.log(`❌ ${name} sync failed:`, result.errors);
    }
  }
}

// Export the integration manager for use in other parts of the application
export { integrationManager };

// Export specific integrations for direct access
export function getQuickBooksIntegration(): QuickBooksIntegration | undefined {
  return integrationManager.getIntegration(
    'QuickBooks'
  ) as QuickBooksIntegration;
}

export function getStripeIntegration(): StripeIntegration | undefined {
  return integrationManager.getIntegration('Stripe') as StripeIntegration;
}

export function getCarrierIntegration(): CarrierIntegration | undefined {
  return integrationManager.getIntegration('Carrier') as CarrierIntegration;
}

export function getFergusonIntegration(): FergusonIntegration | undefined {
  return integrationManager.getIntegration('Ferguson') as FergusonIntegration;
}

// export function getHubSpotIntegration(): HubSpotIntegration | undefined {
//   return integrationManager.getIntegration('HubSpot') as HubSpotIntegration;
// }

export function getTraneIntegration(): TraneIntegration | undefined {
  return integrationManager.getIntegration('Trane') as TraneIntegration;
}

export function getJohnstoneIntegration(): JohnstoneIntegration | undefined {
  return integrationManager.getIntegration('Johnstone') as JohnstoneIntegration;
}

export function getSquareIntegration(): SquareIntegration | undefined {
  return integrationManager.getIntegration('Square') as SquareIntegration;
}

export function getSalesforceIntegration(): SalesforceIntegration | undefined {
  return integrationManager.getIntegration(
    'Salesforce'
  ) as SalesforceIntegration;
}

// Utility functions for common integration tasks
export async function syncCustomerToAllPlatforms(
  customerId: string
): Promise<void> {
  // const hubspot = getHubSpotIntegration();
  const salesforce = getSalesforceIntegration();
  const quickbooks = getQuickBooksIntegration();

  const promises = [];

  // if (hubspot?.isEnabled) {
  //   promises.push(hubspot.syncCustomerToHubSpot(customerId));
  // }

  if (salesforce?.isEnabled) {
    promises.push(salesforce.syncCustomerToSalesforce(customerId));
  }

  // Add QuickBooks customer sync when implemented
  // if (quickbooks?.isEnabled) {
  //   promises.push(quickbooks.syncCustomerToQuickBooks(customerId));
  // }

  await Promise.allSettled(promises);
}

export async function createJobInAllPlatforms(jobId: string): Promise<void> {
  // const hubspot = getHubSpotIntegration();
  const salesforce = getSalesforceIntegration();

  const promises = [];

  // if (hubspot?.isEnabled) {
  //   promises.push(hubspot.createJobDeal(jobId));
  // }

  if (salesforce?.isEnabled) {
    promises.push(salesforce.createJobOpportunity(jobId));
  }

  await Promise.allSettled(promises);
}

export async function processPaymentWithStripe(paymentData: {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}): Promise<any> {
  const stripe = getStripeIntegration();

  if (!stripe?.isEnabled) {
    throw new Error('Stripe integration is not enabled');
  }

  return await stripe.createPaymentIntent(
    paymentData.amount,
    paymentData.currency,
    paymentData.customerId,
    paymentData.metadata
  );
}

export async function processPaymentWithSquare(paymentData: {
  amount: number;
  currency: string;
  sourceId: string;
  customerId?: string;
  note?: string;
  referenceId?: string;
}): Promise<any> {
  const square = getSquareIntegration();

  if (!square?.isEnabled) {
    throw new Error('Square integration is not enabled');
  }

  return await square.createPayment(paymentData);
}

export async function lookupEquipmentInfo(
  serialNumber: string,
  manufacturer: string
): Promise<any> {
  switch (manufacturer.toLowerCase()) {
    case 'carrier':
      const carrier = getCarrierIntegration();
      if (carrier?.isEnabled) {
        return await carrier.lookupEquipmentBySerial(serialNumber);
      }
      break;
    case 'trane':
      const trane = getTraneIntegration();
      if (trane?.isEnabled) {
        return await trane.lookupEquipmentBySerial(serialNumber);
      }
      break;
  }

  return null;
}

export async function searchPartsFromDistributors(query: {
  keyword?: string;
  manufacturer?: string;
  partNumber?: string;
}): Promise<any[]> {
  const results = [];

  const ferguson = getFergusonIntegration();
  if (ferguson?.isEnabled) {
    const fergusonResults = await ferguson.searchProducts(query);
    results.push(
      ...fergusonResults.products.map((p) => ({
        ...p,
        distributor: 'Ferguson',
      }))
    );
  }

  const johnstone = getJohnstoneIntegration();
  if (johnstone?.isEnabled) {
    const johnstoneResults = await johnstone.searchProducts(query);
    results.push(
      ...johnstoneResults.products.map((p) => ({
        ...p,
        distributor: 'Johnstone',
      }))
    );
  }

  return results;
}

export async function createAutomaticPartsOrder(jobId: string): Promise<any> {
  const ferguson = getFergusonIntegration();
  const johnstone = getJohnstoneIntegration();

  // Try Ferguson first
  if (ferguson?.isEnabled) {
    const fergusonOrder = await ferguson.createAutomaticOrder(jobId);
    if (fergusonOrder) {
      return fergusonOrder;
    }
  }

  // Fallback to Johnstone
  if (johnstone?.isEnabled) {
    const johnstoneOrder = await johnstone.createAutomaticOrder(jobId);
    if (johnstoneOrder) {
      return johnstoneOrder;
    }
  }

  return null;
}
