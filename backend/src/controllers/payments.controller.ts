// Payments controller - simplified version
import { Request, Response } from 'express';
import { query } from '../database';

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT p.*, 
             c.first_name || ' ' || c.last_name as customer_name,
             i.invoice_number
      FROM payments p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN invoices i ON p.invoice_id = i.id
      ORDER BY p.payment_date DESC, p.created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error retrieving payments:', error);
    res.status(500).json({ 
      message: 'Error retrieving payments', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const getPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.id;
    const result = await query(`
      SELECT p.*, 
             c.first_name || ' ' || c.last_name as customer_name,
             i.invoice_number
      FROM payments p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN invoices i ON p.invoice_id = i.id
      WHERE p.id = $1
    `, [paymentId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error retrieving payment:', error);
    res.status(500).json({ 
      message: 'Error retrieving payment', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const createNewPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customer_id, invoice_id, amount, payment_date, payment_method, notes } = req.body;
    
    if (!customer_id || !amount || !payment_date || !payment_method) {
      res.status(400).json({ message: 'Customer ID, amount, payment date, and payment method are required' });
      return;
    }
    
    const result = await query(
      `INSERT INTO payments (organization_id, customer_id, invoice_id, amount, payment_date, payment_method, notes, created_at, updated_at) 
       VALUES ((SELECT id FROM organizations LIMIT 1), $1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       RETURNING *`,
      [customer_id, invoice_id, amount, payment_date, payment_method, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(500).json({ 
      message: 'Error creating payment', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const updateExistingPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.id;
    const { customer_id, invoice_id, amount, payment_date, payment_method, notes } = req.body;
    
    const result = await query(
      `UPDATE payments 
       SET customer_id = $1, invoice_id = $2, amount = $3, payment_date = $4, 
           payment_method = $5, notes = $6, updated_at = NOW()
       WHERE id = $7 
       RETURNING *`,
      [customer_id, invoice_id, amount, payment_date, payment_method, notes, paymentId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating payment:', error);
    res.status(500).json({ 
      message: 'Error updating payment', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const deleteExistingPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.id;
    
    const result = await query('DELETE FROM payments WHERE id = $1 RETURNING *', [paymentId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }
    
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ 
      message: 'Error deleting payment', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};
