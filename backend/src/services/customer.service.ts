// Customer service
import { query } from '../config/database';
import { Customer, CreateCustomer } from '../types/customer.types';
import { validateEmailFormat } from '../utils/validation';

export const getCustomersByOrganization = async (organizationId: string): Promise<Customer[]> => {
  try {
    const result = await query(
      'SELECT * FROM customers WHERE organization_id = $1 ORDER BY created_at DESC',
      [organizationId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Error retrieving customers: ${error.message}`);
  }
};

export const getCustomerById = async (id: string, organizationId: string): Promise<Customer | null> => {
  try {
    const result = await query(
      'SELECT * FROM customers WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error(`Error retrieving customer: ${error.message}`);
  }
};

export const createCustomer = async (customerData: CreateCustomer & { organizationId: string }): Promise<Customer> => {
  try {
    // Validate email format if provided
    if (customerData.email && !validateEmailFormat(customerData.email)) {
      throw new Error('Invalid email format');
    }
    
    const result = await query(
      `INSERT INTO customers (
        organization_id, first_name, last_name, email, phone, address, 
        city, state, zip_code, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) 
      RETURNING *`,
      [
        customerData.organizationId,
        customerData.firstName,
        customerData.lastName,
        customerData.email,
        customerData.phone,
        customerData.address,
        customerData.city,
        customerData.state,
        customerData.zipCode,
        customerData.notes || ''
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    if (error.message.includes('Invalid email format')) {
      throw error;
    }
    throw new Error(`Error creating customer: ${error.message}`);
  }
};

export const updateCustomer = async (
  id: string, 
  customerData: Partial<CreateCustomer>, 
  organizationId: string
): Promise<Customer | null> => {
  try {
    // First check if customer exists and belongs to organization
    const existingCustomer = await getCustomerById(id, organizationId);
    if (!existingCustomer) {
      return null;
    }
    
    // Validate email format if provided
    if (customerData.email && !validateEmailFormat(customerData.email)) {
      throw new Error('Invalid email format');
    }
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    let index = 1;
    
    if (customerData.firstName !== undefined) {
      fields.push(`first_name = $${index}`);
      values.push(customerData.firstName);
      index++;
    }
    
    if (customerData.lastName !== undefined) {
      fields.push(`last_name = $${index}`);
      values.push(customerData.lastName);
      index++;
    }
    
    if (customerData.email !== undefined) {
      fields.push(`email = $${index}`);
      values.push(customerData.email);
      index++;
    }
    
    if (customerData.phone !== undefined) {
      fields.push(`phone = $${index}`);
      values.push(customerData.phone);
      index++;
    }
    
    if (customerData.address !== undefined) {
      fields.push(`address = $${index}`);
      values.push(customerData.address);
      index++;
    }
    
    if (customerData.city !== undefined) {
      fields.push(`city = $${index}`);
      values.push(customerData.city);
      index++;
    }
    
    if (customerData.state !== undefined) {
      fields.push(`state = $${index}`);
      values.push(customerData.state);
      index++;
    }
    
    if (customerData.zipCode !== undefined) {
      fields.push(`zip_code = $${index}`);
      values.push(customerData.zipCode);
      index++;
    }
    
    if (customerData.notes !== undefined) {
      fields.push(`notes = $${index}`);
      values.push(customerData.notes);
      index++;
    }
    
    // Always update the updated_at timestamp
    fields.push(`updated_at = NOW()`);
    values.push(id); // Add id for WHERE clause
    
    const result = await query(
      `UPDATE customers SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    if (error.message.includes('Invalid email format')) {
      throw error;
    }
    throw new Error(`Error updating customer: ${error.message}`);
  }
};

export const deleteCustomer = async (id: string, organizationId: string): Promise<boolean> => {
  try {
    const result = await query(
      'DELETE FROM customers WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    throw new Error(`Error deleting customer: ${error.message}`);
  }
};

export default {
  getCustomersByOrganization,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
