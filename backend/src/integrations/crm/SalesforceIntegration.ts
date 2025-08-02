// Salesforce CRM Integration
import {
  BaseIntegration,
  IntegrationConfig,
  WebhookPayload,
  SyncResult,
} from '../base/IntegrationManager';
import { query } from '../../database';

export interface SalesforceConfig extends IntegrationConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  securityToken: string;
  instanceUrl: string;
  environment: 'sandbox' | 'production';
}

export interface SalesforceContact {
  Id: string;
  FirstName?: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  MailingStreet?: string;
  MailingCity?: string;
  MailingState?: string;
  MailingPostalCode?: string;
  AccountId?: string;
  LeadSource?: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

export interface SalesforceAccount {
  Id: string;
  Name: string;
  Type?: string;
  Industry?: string;
  Phone?: string;
  BillingStreet?: string;
  BillingCity?: string;
  BillingState?: string;
  BillingPostalCode?: string;
  NumberOfEmployees?: number;
  AnnualRevenue?: number;
  CreatedDate: string;
  LastModifiedDate: string;
}

export interface SalesforceOpportunity {
  Id: string;
  Name: string;
  AccountId?: string;
  ContactId?: string;
  Amount?: number;
  StageName: string;
  CloseDate: string;
  Probability?: number;
  LeadSource?: string;
  Description?: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

export interface SalesforceCase {
  Id: string;
  CaseNumber: string;
  ContactId?: string;
  AccountId?: string;
  Subject: string;
  Description?: string;
  Status: string;
  Priority: string;
  Origin: string;
  Type?: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

export class SalesforceIntegration extends BaseIntegration {
  private salesforceConfig: SalesforceConfig;
  private accessToken?: string;
  private instanceUrl?: string;

  constructor(config: SalesforceConfig) {
    super(config);
    this.salesforceConfig = config;
    this.instanceUrl = config.instanceUrl;
  }

  async authenticate(): Promise<boolean> {
    try {
      const authUrl =
        this.salesforceConfig.environment === 'production'
          ? 'https://login.salesforce.com/services/oauth2/token'
          : 'https://test.salesforce.com/services/oauth2/token';

      const authData = new URLSearchParams({
        grant_type: 'password',
        client_id: this.salesforceConfig.clientId,
        client_secret: this.salesforceConfig.clientSecret,
        username: this.salesforceConfig.username,
        password:
          this.salesforceConfig.password + this.salesforceConfig.securityToken,
      });

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: authData.toString(),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const authResult = await response.json();
      this.accessToken = (authResult as any).access_token;
      this.instanceUrl = (authResult as any).instance_url;

      return true;
    } catch (error) {
      this.logger.error('Salesforce authentication failed', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.accessToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) return false;
      }

      const response = await this.makeRequest('GET', '/services/data/v58.0/');
      return response && response.length > 0;
    } catch (error) {
      this.logger.error('Salesforce connection test failed', error);
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
        case 'contacts':
          await this.syncContacts(result, lastSyncTime);
          break;
        case 'accounts':
          await this.syncAccounts(result, lastSyncTime);
          break;
        case 'opportunities':
          await this.syncOpportunities(result, lastSyncTime);
          break;
        case 'cases':
          await this.syncCases(result, lastSyncTime);
          break;
        case 'all':
          await this.syncContacts(result, lastSyncTime);
          await this.syncAccounts(result, lastSyncTime);
          await this.syncOpportunities(result, lastSyncTime);
          await this.syncCases(result, lastSyncTime);
          break;
        default:
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
    } catch (error) {
      result.success = false;
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      );
      this.logger.error('Salesforce sync failed', error);
    }

    this.emit('sync:complete', result);
    return result;
  }

  async handleWebhook(payload: WebhookPayload): Promise<void> {
    try {
      const events = payload.data;

      for (const event of events) {
        switch (event.sobjectType) {
          case 'Contact':
            await this.handleContactChange(event);
            break;
          case 'Account':
            await this.handleAccountChange(event);
            break;
          case 'Opportunity':
            await this.handleOpportunityChange(event);
            break;
          case 'Case':
            await this.handleCaseChange(event);
            break;
          default:
            this.logger.info(
              `Unhandled Salesforce webhook: ${event.sobjectType}`
            );
        }
      }

      this.emit('webhook:processed', payload);
    } catch (error) {
      this.logger.error('Salesforce webhook handling failed', error);
      throw error;
    }
  }

  // Contact management methods
  async createContact(contactData: {
    firstName?: string;
    lastName: string;
    email?: string;
    phone?: string;
    accountId?: string;
    mailingStreet?: string;
    mailingCity?: string;
    mailingState?: string;
    mailingPostalCode?: string;
    leadSource?: string;
  }): Promise<SalesforceContact | null> {
    try {
      const response = await this.makeRequest(
        'POST',
        '/services/data/v58.0/sobjects/Contact/',
        {
          FirstName: contactData.firstName,
          LastName: contactData.lastName,
          Email: contactData.email,
          Phone: contactData.phone,
          AccountId: contactData.accountId,
          MailingStreet: contactData.mailingStreet,
          MailingCity: contactData.mailingCity,
          MailingState: contactData.mailingState,
          MailingPostalCode: contactData.mailingPostalCode,
          LeadSource: contactData.leadSource,
        }
      );

      if (response?.id) {
        return await this.getContact(response.id);
      }

      return null;
    } catch (error) {
      this.logger.error('Contact creation failed', error);
      return null;
    }
  }

  async updateContact(
    contactId: string,
    contactData: Record<string, any>
  ): Promise<boolean> {
    try {
      await this.makeRequest(
        'PATCH',
        `/services/data/v58.0/sobjects/Contact/${contactId}`,
        contactData
      );
      return true;
    } catch (error) {
      this.logger.error(`Contact update failed for ${contactId}`, error);
      return false;
    }
  }

  async getContact(contactId: string): Promise<SalesforceContact | null> {
    try {
      const response = await this.makeRequest(
        'GET',
        `/services/data/v58.0/sobjects/Contact/${contactId}`
      );
      return response || null;
    } catch (error) {
      this.logger.error(`Contact lookup failed for ${contactId}`, error);
      return null;
    }
  }

  async getContactByEmail(email: string): Promise<SalesforceContact | null> {
    try {
      const query = `SELECT Id, FirstName, LastName, Email, Phone, MailingStreet, MailingCity, MailingState, MailingPostalCode, AccountId, LeadSource, CreatedDate, LastModifiedDate FROM Contact WHERE Email = '${email}' LIMIT 1`;
      const response = await this.makeRequest(
        'GET',
        `/services/data/v58.0/query/?q=${encodeURIComponent(query)}`
      );

      return response?.records?.[0] || null;
    } catch (error) {
      this.logger.error(`Contact lookup failed for ${email}`, error);
      return null;
    }
  }

  // Account management methods
  async createAccount(accountData: {
    name: string;
    type?: string;
    industry?: string;
    phone?: string;
    billingStreet?: string;
    billingCity?: string;
    billingState?: string;
    billingPostalCode?: string;
  }): Promise<SalesforceAccount | null> {
    try {
      const response = await this.makeRequest(
        'POST',
        '/services/data/v58.0/sobjects/Account/',
        {
          Name: accountData.name,
          Type: accountData.type,
          Industry: accountData.industry,
          Phone: accountData.phone,
          BillingStreet: accountData.billingStreet,
          BillingCity: accountData.billingCity,
          BillingState: accountData.billingState,
          BillingPostalCode: accountData.billingPostalCode,
        }
      );

      if (response?.id) {
        return await this.getAccount(response.id);
      }

      return null;
    } catch (error) {
      this.logger.error('Account creation failed', error);
      return null;
    }
  }

  async getAccount(accountId: string): Promise<SalesforceAccount | null> {
    try {
      const response = await this.makeRequest(
        'GET',
        `/services/data/v58.0/sobjects/Account/${accountId}`
      );
      return response || null;
    } catch (error) {
      this.logger.error(`Account lookup failed for ${accountId}`, error);
      return null;
    }
  }

  // Opportunity management methods
  async createOpportunity(opportunityData: {
    name: string;
    accountId?: string;
    contactId?: string;
    amount?: number;
    stageName: string;
    closeDate: string;
    probability?: number;
    leadSource?: string;
    description?: string;
  }): Promise<SalesforceOpportunity | null> {
    try {
      const response = await this.makeRequest(
        'POST',
        '/services/data/v58.0/sobjects/Opportunity/',
        {
          Name: opportunityData.name,
          AccountId: opportunityData.accountId,
          ContactId: opportunityData.contactId,
          Amount: opportunityData.amount,
          StageName: opportunityData.stageName,
          CloseDate: opportunityData.closeDate,
          Probability: opportunityData.probability,
          LeadSource: opportunityData.leadSource,
          Description: opportunityData.description,
        }
      );

      if (response?.id) {
        return await this.getOpportunity(response.id);
      }

      return null;
    } catch (error) {
      this.logger.error('Opportunity creation failed', error);
      return null;
    }
  }

  async getOpportunity(
    opportunityId: string
  ): Promise<SalesforceOpportunity | null> {
    try {
      const response = await this.makeRequest(
        'GET',
        `/services/data/v58.0/sobjects/Opportunity/${opportunityId}`
      );
      return response || null;
    } catch (error) {
      this.logger.error(
        `Opportunity lookup failed for ${opportunityId}`,
        error
      );
      return null;
    }
  }

  // Case management methods
  async createCase(caseData: {
    contactId?: string;
    accountId?: string;
    subject: string;
    description?: string;
    status?: string;
    priority?: string;
    origin?: string;
    type?: string;
  }): Promise<SalesforceCase | null> {
    try {
      const response = await this.makeRequest(
        'POST',
        '/services/data/v58.0/sobjects/Case/',
        {
          ContactId: caseData.contactId,
          AccountId: caseData.accountId,
          Subject: caseData.subject,
          Description: caseData.description,
          Status: caseData.status || 'New',
          Priority: caseData.priority || 'Medium',
          Origin: caseData.origin || 'Web',
          Type: caseData.type,
        }
      );

      if (response?.id) {
        return await this.getCase(response.id);
      }

      return null;
    } catch (error) {
      this.logger.error('Case creation failed', error);
      return null;
    }
  }

  async getCase(caseId: string): Promise<SalesforceCase | null> {
    try {
      const response = await this.makeRequest(
        'GET',
        `/services/data/v58.0/sobjects/Case/${caseId}`
      );
      return response || null;
    } catch (error) {
      this.logger.error(`Case lookup failed for ${caseId}`, error);
      return null;
    }
  }

  // Customer lifecycle automation
  async syncCustomerToSalesforce(customerId: string): Promise<void> {
    try {
      const customerQuery = await query(
        'SELECT * FROM customers WHERE id = $1',
        [customerId]
      );

      if (customerQuery.rows.length === 0) {
        throw new Error(`Customer ${customerId} not found`);
      }

      const customer = customerQuery.rows[0];

      let salesforceContact = await this.getContactByEmail(customer.email);

      if (salesforceContact) {
        await this.updateContact(salesforceContact.Id, {
          FirstName: customer.first_name,
          LastName: customer.last_name,
          Phone: customer.phone,
          MailingStreet: customer.address,
          MailingCity: customer.city,
          MailingState: customer.state,
          MailingPostalCode: customer.zip_code,
        });
      } else {
        salesforceContact = await this.createContact({
          firstName: customer.first_name,
          lastName: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          mailingStreet: customer.address,
          mailingCity: customer.city,
          mailingState: customer.state,
          mailingPostalCode: customer.zip_code,
          leadSource: 'Field Service App',
        });
      }

      if (salesforceContact) {
        await query(
          'UPDATE customers SET salesforce_contact_id = $1, salesforce_synced_at = NOW() WHERE id = $2',
          [salesforceContact.Id, customerId]
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to sync customer ${customerId} to Salesforce`,
        error
      );
      throw error;
    }
  }

  async createJobOpportunity(jobId: string): Promise<void> {
    try {
      const jobQuery = await query(
        `SELECT j.*, c.first_name, c.last_name, c.email, c.salesforce_contact_id 
         FROM jobs j 
         JOIN customers c ON j.customer_id = c.id 
         WHERE j.id = $1`,
        [jobId]
      );

      if (jobQuery.rows.length === 0) {
        throw new Error(`Job ${jobId} not found`);
      }

      const job = jobQuery.rows[0];

      if (!job.salesforce_contact_id) {
        await this.syncCustomerToSalesforce(job.customer_id);

        const updatedJobQuery = await query(
          `SELECT j.*, c.salesforce_contact_id 
           FROM jobs j 
           JOIN customers c ON j.customer_id = c.id 
           WHERE j.id = $1`,
          [jobId]
        );

        if (updatedJobQuery.rows.length > 0) {
          job.salesforce_contact_id =
            updatedJobQuery.rows[0].salesforce_contact_id;
        }
      }

      const opportunity = await this.createOpportunity({
        name: `${job.title} - ${job.first_name} ${job.last_name}`,
        contactId: job.salesforce_contact_id,
        amount: job.total_cost,
        stageName: this.mapJobStatusToOpportunityStage(job.status),
        closeDate: job.scheduled_date || new Date().toISOString().split('T')[0],
        leadSource: 'Field Service',
        description: job.description,
      });

      if (opportunity) {
        await query(
          'UPDATE jobs SET salesforce_opportunity_id = $1, salesforce_synced_at = NOW() WHERE id = $2',
          [opportunity.Id, jobId]
        );
      }
    } catch (error) {
      this.logger.error(`Failed to create opportunity for job ${jobId}`, error);
      throw error;
    }
  }

  // Sync methods
  private async syncContacts(
    result: SyncResult,
    lastSyncTime?: Date
  ): Promise<void> {
    try {
      let query =
        'SELECT Id, FirstName, LastName, Email, Phone, MailingStreet, MailingCity, MailingState, MailingPostalCode, AccountId, LeadSource, CreatedDate, LastModifiedDate FROM Contact';

      if (lastSyncTime) {
        const formattedDate = lastSyncTime.toISOString();
        query += ` WHERE LastModifiedDate > ${formattedDate}`;
      }

      query += ' ORDER BY LastModifiedDate DESC LIMIT 2000';

      const response = await this.makeRequest(
        'GET',
        `/services/data/v58.0/query/?q=${encodeURIComponent(query)}`
      );

      if (response?.records) {
        for (const contact of response.records) {
          try {
            await this.upsertContact(contact);
            result.recordsProcessed++;
          } catch (error) {
            result.errors.push(
              `Contact ${contact.Id}: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`
            );
          }
        }
      }
    } catch (error) {
      result.errors.push(
        `Contacts sync: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  private async syncAccounts(
    result: SyncResult,
    lastSyncTime?: Date
  ): Promise<void> {
    this.logger.info('Syncing accounts from Salesforce');
  }

  private async syncOpportunities(
    result: SyncResult,
    lastSyncTime?: Date
  ): Promise<void> {
    this.logger.info('Syncing opportunities from Salesforce');
  }

  private async syncCases(
    result: SyncResult,
    lastSyncTime?: Date
  ): Promise<void> {
    this.logger.info('Syncing cases from Salesforce');
  }

  // Database operations
  private async upsertContact(
    salesforceContact: SalesforceContact
  ): Promise<void> {
    const existingCustomer = await query(
      'SELECT id FROM customers WHERE salesforce_contact_id = $1 OR email = $2',
      [salesforceContact.Id, salesforceContact.Email]
    );

    if (existingCustomer.rows.length > 0) {
      await query(
        `UPDATE customers SET 
         salesforce_contact_id = $2, first_name = $3, last_name = $4, phone = $5,
         address = $6, city = $7, state = $8, zip_code = $9,
         salesforce_synced_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [
          existingCustomer.rows[0].id,
          salesforceContact.Id,
          salesforceContact.FirstName || '',
          salesforceContact.LastName,
          salesforceContact.Phone || '',
          salesforceContact.MailingStreet || '',
          salesforceContact.MailingCity || '',
          salesforceContact.MailingState || '',
          salesforceContact.MailingPostalCode || '',
        ]
      );
    } else if (salesforceContact.Email) {
      await query(
        `INSERT INTO customers (
          organization_id, salesforce_contact_id, first_name, last_name, email, phone,
          address, city, state, zip_code, salesforce_synced_at, created_at, updated_at
        ) VALUES (
          (SELECT id FROM organizations LIMIT 1), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW()
        )`,
        [
          salesforceContact.Id,
          salesforceContact.FirstName || '',
          salesforceContact.LastName,
          salesforceContact.Email,
          salesforceContact.Phone || '',
          salesforceContact.MailingStreet || '',
          salesforceContact.MailingCity || '',
          salesforceContact.MailingState || '',
          salesforceContact.MailingPostalCode || '',
        ]
      );
    }
  }

  // Webhook handlers
  private async handleContactChange(event: any): Promise<void> {
    const contactId = event.Id;

    try {
      const contact = await this.getContact(contactId);
      if (contact) {
        await this.upsertContact(contact);
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle contact change for ${contactId}`,
        error
      );
    }
  }

  private async handleAccountChange(event: any): Promise<void> {
    this.logger.info(`Account change event: ${event.Id}`);
  }

  private async handleOpportunityChange(event: any): Promise<void> {
    this.logger.info(`Opportunity change event: ${event.Id}`);
  }

  private async handleCaseChange(event: any): Promise<void> {
    this.logger.info(`Case change event: ${event.Id}`);
  }

  // Utility methods
  private mapJobStatusToOpportunityStage(jobStatus: string): string {
    const statusMap: Record<string, string> = {
      scheduled: 'Prospecting',
      in_progress: 'Qualification',
      completed: 'Closed Won',
      cancelled: 'Closed Lost',
    };

    return statusMap[jobStatus] || 'Prospecting';
  }

  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Salesforce authentication failed');
      }
    }

    const requestHeaders = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...headers,
    };

    const url = `${this.instanceUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to re-authenticate
        this.accessToken = undefined;
        const authenticated = await this.authenticate();
        if (authenticated) {
          // Retry the request
          return this.makeRequest(method, endpoint, data, headers);
        }
      }

      const error = await response.text();
      throw new Error(`Salesforce API error: ${response.status} ${error}`);
    }

    const responseText = await response.text();
    return responseText ? JSON.parse(responseText) : null;
  }
}
