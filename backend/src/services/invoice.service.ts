// Invoice service
import { query } from '../config/database';
import { Invoice, CreateInvoice } from '../types/invoice.types';

export const getInvoicesByOrganization = async (organizationId: string): Promise<Invoice[]> => {
  try {
    const result = await query(
      `SELECT i.*, 
              c.first_name as customer_first_name, 
              c.last_name as customer_last_name
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.organization_id = $1 
       ORDER BY i.created_at DESC`,
      [organizationId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Error retrieving invoices: ${error.message}`);
  }
};

export const getInvoiceById = async (id: string, organizationId: string): Promise<Invoice | null> => {
  try {
    const result = await query(
      `SELECT i.*, 
              c.first_name as customer_first_name, 
              c.last_name as customer_last_name
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = $1 AND i.organization_id = $2`,
      [id, organizationId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error(`Error retrieving invoice: ${error.message}`);
  }
};

export const createInvoice = async (invoiceData: CreateInvoice & { organizationId: string }): Promise<Invoice> => {
  try {
    const result = await query(
      `INSERT INTO invoices (
        organization_id, customer_id, job_id, invoice_number, issue_date, 
        due_date, subtotal, tax, total, status, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) 
      RETURNING *`,
      [
        invoiceData.organizationId,
        invoiceData.customerId,
        invoiceData.jobId,
        invoiceData.invoiceNumber,
        invoiceData.issueDate,
        invoiceData.dueDate,
        invoiceData.subtotal,
        invoiceData.tax || 0,
        invoiceData.total,
        invoiceData.status,
        invoiceData.notes || ''
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating invoice: ${error.message}`);
  }
};

export const updateInvoice = async (
  id: string, 
  invoiceData: Partial<CreateInvoice>, 
  organizationId: string
): Promise<Invoice | null> => {
  try {
    // First check if invoice exists and belongs to organization
    const existingInvoice = await getInvoiceById(id, organizationId);
    if (!existingInvoice) {
      return null;
    }
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    let index = 1;
    
    if (invoiceData.customerId !== undefined) {
      fields.push(`customer_id = $${index}`);
      values.push(invoiceData.customerId);
      index++;
    }
    
    if (invoiceData.jobId !== undefined) {
      fields.push(`job_id = $${index}`);
      values.push(invoiceData.jobId);
      index++;
    }
    
    if (invoiceData.invoiceNumber !== undefined) {
      fields.push(`invoice_number = $${index}`);
      values.push(invoiceData.invoiceNumber);
      index++;
    }
    
    if (invoiceData.issueDate !== undefined) {
      fields.push(`issue_date = $${index}`);
      values.push(invoiceData.issueDate);
      index++;
    }
    
    if (invoiceData.dueDate !== undefined) {
      fields.push(`due_date = $${index}`);
      values.push(invoiceData.dueDate);
      index++;
    }
    
    if (invoiceData.subtotal !== undefined) {
      fields.push(`subtotal = $${index}`);
      values.push(invoiceData.subtotal);
      index++;
    }
    
    if (invoiceData.tax !== undefined) {
      fields.push(`tax = $${index}`);
      values.push(invoiceData.tax);
      index++;
    }
    
    if (invoiceData.total !== undefined) {
      fields.push(`total = $${index}`);
      values.push(invoiceData.total);
      index++;
    }
    
    if (invoiceData.status !== undefined) {
      fields.push(`status = $${index}`);
      values.push(invoiceData.status);
      index++;
    }
    
    if (invoiceData.notes !== undefined) {
      fields.push(`notes = $${index}`);
      values.push(invoiceData.notes);
      index++;
    }
    
    // Always update the updated_at timestamp
    fields.push(`updated_at = NOW()`);
    values.push(id); // Add id for WHERE clause
    
    const result = await query(
      `UPDATE invoices SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error(`Error updating invoice: ${error.message}`);
  }
};

export const deleteInvoice = async (id: string, organizationId: string): Promise<boolean> => {
  try {
    const result = await query(
      'DELETE FROM invoices WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    throw new Error(`Error deleting invoice: ${error.message}`);
  }
};

export default {
  getInvoicesByOrganization,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
