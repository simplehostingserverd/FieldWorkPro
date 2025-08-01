// Payment service
import { query } from '../config/database';
import { Payment, CreatePayment } from '../types/payment.types';

export const getPaymentsByOrganization = async (organizationId: string): Promise<Payment[]> => {
  try {
    const result = await query(
      `SELECT p.*, 
              c.first_name as customer_first_name, 
              c.last_name as customer_last_name
       FROM payments p
       LEFT JOIN customers c ON p.customer_id = c.id
       WHERE p.organization_id = $1 
       ORDER BY p.created_at DESC`,
      [organizationId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Error retrieving payments: ${error.message}`);
  }
};

export const getPaymentById = async (id: string, organizationId: string): Promise<Payment | null> => {
  try {
    const result = await query(
      `SELECT p.*, 
              c.first_name as customer_first_name, 
              c.last_name as customer_last_name
       FROM payments p
       LEFT JOIN customers c ON p.customer_id = c.id
       WHERE p.id = $1 AND p.organization_id = $2`,
      [id, organizationId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error(`Error retrieving payment: ${error.message}`);
  }
};

export const createPayment = async (paymentData: CreatePayment & { organizationId: string }): Promise<Payment> => {
  try {
    const result = await query(
      `INSERT INTO payments (
        organization_id, customer_id, invoice_id, amount, payment_method, 
        payment_date, status, transaction_id, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) 
      RETURNING *`,
      [
        paymentData.organizationId,
        paymentData.customerId,
        paymentData.invoiceId,
        paymentData.amount,
        paymentData.paymentMethod,
        paymentData.paymentDate,
        paymentData.status,
        paymentData.transactionId || '',
        paymentData.notes || ''
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating payment: ${error.message}`);
  }
};

export const updatePayment = async (
  id: string, 
  paymentData: Partial<CreatePayment>, 
  organizationId: string
): Promise<Payment | null> => {
  try {
    // First check if payment exists and belongs to organization
    const existingPayment = await getPaymentById(id, organizationId);
    if (!existingPayment) {
      return null;
    }
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    let index = 1;
    
    if (paymentData.customerId !== undefined) {
      fields.push(`customer_id = $${index}`);
      values.push(paymentData.customerId);
      index++;
    }
    
    if (paymentData.invoiceId !== undefined) {
      fields.push(`invoice_id = $${index}`);
      values.push(paymentData.invoiceId);
      index++;
    }
    
    if (paymentData.amount !== undefined) {
      fields.push(`amount = $${index}`);
      values.push(paymentData.amount);
      index++;
    }
    
    if (paymentData.paymentMethod !== undefined) {
      fields.push(`payment_method = $${index}`);
      values.push(paymentData.paymentMethod);
      index++;
    }
    
    if (paymentData.paymentDate !== undefined) {
      fields.push(`payment_date = $${index}`);
      values.push(paymentData.paymentDate);
      index++;
    }
    
    if (paymentData.status !== undefined) {
      fields.push(`status = $${index}`);
      values.push(paymentData.status);
      index++;
    }
    
    if (paymentData.transactionId !== undefined) {
      fields.push(`transaction_id = $${index}`);
      values.push(paymentData.transactionId);
      index++;
    }
    
    if (paymentData.notes !== undefined) {
      fields.push(`notes = $${index}`);
      values.push(paymentData.notes);
      index++;
    }
    
    // Always update the updated_at timestamp
    fields.push(`updated_at = NOW()`);
    values.push(id); // Add id for WHERE clause
    
    const result = await query(
      `UPDATE payments SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error(`Error updating payment: ${error.message}`);
  }
};

export const deletePayment = async (id: string, organizationId: string): Promise<boolean> => {
  try {
    const result = await query(
      'DELETE FROM payments WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    throw new Error(`Error deleting payment: ${error.message}`);
  }
};

export default {
  getPaymentsByOrganization,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};
