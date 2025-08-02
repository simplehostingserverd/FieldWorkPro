// Equipment controller - simplified version
import { Request, Response } from 'express';
import { query } from '../database';

export const getAllEquipment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await query('SELECT * FROM equipment ORDER BY name ASC');
    res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error retrieving equipment:', error);
    res.status(500).json({
      message: 'Error retrieving equipment',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};

export const getEquipmentItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const equipmentId = req.params.id;
    const result = await query('SELECT * FROM equipment WHERE id = $1', [
      equipmentId,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Equipment not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error retrieving equipment:', error);
    res.status(500).json({
      message: 'Error retrieving equipment',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};

export const createNewEquipment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, serial_number, category, status } = req.body;

    if (!name || !category) {
      res.status(400).json({ message: 'Name and category are required' });
      return;
    }

    const result = await query(
      `INSERT INTO equipment (organization_id, name, description, serial_number, category, status, created_at, updated_at) 
       VALUES ((SELECT id FROM organizations LIMIT 1), $1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING *`,
      [name, description, serial_number, category, status || 'available']
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating equipment:', error);
    res.status(500).json({
      message: 'Error creating equipment',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};

export const updateExistingEquipment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const equipmentId = req.params.id;
    const { name, description, serial_number, category, status } = req.body;

    const result = await query(
      `UPDATE equipment 
       SET name = $1, description = $2, serial_number = $3, category = $4, status = $5, updated_at = NOW()
       WHERE id = $6 
       RETURNING *`,
      [name, description, serial_number, category, status, equipmentId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Equipment not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating equipment:', error);
    res.status(500).json({
      message: 'Error updating equipment',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};

export const deleteExistingEquipment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const equipmentId = req.params.id;

    const result = await query(
      'DELETE FROM equipment WHERE id = $1 RETURNING *',
      [equipmentId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Equipment not found' });
      return;
    }

    res.status(200).json({ message: 'Equipment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({
      message: 'Error deleting equipment',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
};
