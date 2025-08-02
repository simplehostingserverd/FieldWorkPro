// Inventory controller - simplified version
import { Request, Response } from 'express';
import { query } from '../database';

export const getAllInventoryItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await query('SELECT * FROM inventory ORDER BY name ASC');
    res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error retrieving inventory:', error);
    res.status(500).json({
      message: 'Error retrieving inventory',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};

export const getInventoryItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const itemId = req.params.id;
    const result = await query('SELECT * FROM inventory WHERE id = $1', [
      itemId,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Inventory item not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error retrieving inventory item:', error);
    res.status(500).json({
      message: 'Error retrieving inventory item',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};

export const createNewInventoryItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      sku,
      category,
      unit_cost,
      unit_price,
      quantity_in_stock,
      reorder_level,
    } = req.body;

    if (!name || !category) {
      res.status(400).json({ message: 'Name and category are required' });
      return;
    }

    const result = await query(
      `INSERT INTO inventory (organization_id, name, description, sku, category, unit_cost, unit_price, quantity_in_stock, reorder_level, created_at, updated_at) 
       VALUES ((SELECT id FROM organizations LIMIT 1), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
       RETURNING *`,
      [
        name,
        description,
        sku,
        category,
        unit_cost || 0,
        unit_price || 0,
        quantity_in_stock || 0,
        reorder_level || 0,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({
      message: 'Error creating inventory item',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};

export const updateExistingInventoryItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const itemId = req.params.id;
    const {
      name,
      description,
      sku,
      category,
      unit_cost,
      unit_price,
      quantity_in_stock,
      reorder_level,
    } = req.body;

    const result = await query(
      `UPDATE inventory 
       SET name = $1, description = $2, sku = $3, category = $4, unit_cost = $5, 
           unit_price = $6, quantity_in_stock = $7, reorder_level = $8, updated_at = NOW()
       WHERE id = $9 
       RETURNING *`,
      [
        name,
        description,
        sku,
        category,
        unit_cost,
        unit_price,
        quantity_in_stock,
        reorder_level,
        itemId,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Inventory item not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({
      message: 'Error updating inventory item',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};

export const deleteExistingInventoryItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const itemId = req.params.id;

    const result = await query(
      'DELETE FROM inventory WHERE id = $1 RETURNING *',
      [itemId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Inventory item not found' });
      return;
    }

    res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      message: 'Error deleting inventory item',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};
