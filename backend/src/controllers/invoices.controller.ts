// Invoices controller - simplified version
import { Request, Response } from 'express';
import { query } from '../database';

export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT i.*, 
             c.first_name || ' ' || c.last_name as customer_name,
             j.title as job_title
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN jobs j ON i.job_id = j.id
      ORDER BY i.created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error retrieving invoices:', error);
    res.status(500).json({ 
      message: 'Error retrieving invoices', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const getInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.id;
    const result = await query(`
      SELECT i.*, 
             c.first_name || ' ' || c.last_name as customer_name,
             c.email as customer_email,
             c.address, c.city, c.state, c.zip_code,
             j.title as job_title
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN jobs j ON i.job_id = j.id
      WHERE i.id = $1
    `, [invoiceId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error retrieving invoice:', error);
    res.status(500).json({ 
      message: 'Error retrieving invoice', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const createNewInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customer_id, job_id, invoice_number, issue_date, due_date, subtotal, total_amount, status, notes } = req.body;
    
    if (!customer_id || !invoice_number || !issue_date || !due_date || !subtotal || !total_amount) {
      res.status(400).json({ message: 'Customer ID, invoice number, dates, subtotal, and total amount are required' });
      return;
    }
    
    const result = await query(
      `INSERT INTO invoices (organization_id, customer_id, job_id, invoice_number, issue_date, due_date, subtotal, total_amount, status, notes, created_at, updated_at) 
       VALUES ((SELECT id FROM organizations LIMIT 1), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) 
       RETURNING *`,
      [customer_id, job_id, invoice_number, issue_date, due_date, subtotal, total_amount, status || 'draft', notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ 
      message: 'Error creating invoice', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const updateExistingInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.id;
    const { customer_id, job_id, invoice_number, issue_date, due_date, subtotal, total_amount, status, notes } = req.body;
    
    const result = await query(
      `UPDATE invoices 
       SET customer_id = $1, job_id = $2, invoice_number = $3, issue_date = $4, due_date = $5, 
           subtotal = $6, total_amount = $7, status = $8, notes = $9, updated_at = NOW()
       WHERE id = $10 
       RETURNING *`,
      [customer_id, job_id, invoice_number, issue_date, due_date, subtotal, total_amount, status, notes, invoiceId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ 
      message: 'Error updating invoice', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const deleteExistingInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoiceId = req.params.id;
    
    const result = await query('DELETE FROM invoices WHERE id = $1 RETURNING *', [invoiceId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }
    
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ 
      message: 'Error deleting invoice', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};
