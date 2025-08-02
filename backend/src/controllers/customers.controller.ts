// Customer controller - simplified version
import { Request, Response } from 'express';
import { query } from '../database';

export const getAllCustomers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await query(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error retrieving customers:', error);
    res.status(500).json({
      message: 'Error retrieving customers',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};

export const getCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.params.id;
    const result = await query('SELECT * FROM customers WHERE id = $1', [
      customerId,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error retrieving customer:', error);
    res.status(500).json({
      message: 'Error retrieving customer',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};

export const createNewCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      zip_code,
      notes,
    } = req.body;

    // Basic validation
    if (!first_name || !last_name) {
      res
        .status(400)
        .json({ message: 'First name and last name are required' });
      return;
    }

    const result = await query(
      `INSERT INTO customers (organization_id, first_name, last_name, email, phone, address, city, state, zip_code, notes, created_at, updated_at)
       VALUES ((SELECT id FROM organizations LIMIT 1), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        notes,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      message: 'Error creating customer',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};

export const updateExistingCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.params.id;
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      zip_code,
      notes,
    } = req.body;

    const result = await query(
      `UPDATE customers 
       SET first_name = $1, last_name = $2, email = $3, phone = $4, address = $5, 
           city = $6, state = $7, zip_code = $8, notes = $9, updated_at = NOW()
       WHERE id = $10 
       RETURNING *`,
      [
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        notes,
        customerId,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      message: 'Error updating customer',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};

export const deleteExistingCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.params.id;

    const result = await query(
      'DELETE FROM customers WHERE id = $1 RETURNING *',
      [customerId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      message: 'Error deleting customer',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};
