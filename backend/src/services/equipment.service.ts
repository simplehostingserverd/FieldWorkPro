// Equipment service
import { query } from '../config/database';
import { Equipment, CreateEquipment } from '../types/equipment.types';

export const getEquipmentByOrganization = async (organizationId: string): Promise<Equipment[]> => {
  try {
    const result = await query(
      `SELECT e.*, u.first_name as assigned_to_first_name, u.last_name as assigned_to_last_name
       FROM equipment e
       LEFT JOIN users u ON e.assigned_to = u.id
       WHERE e.organization_id = $1 
       ORDER BY e.created_at DESC`,
      [organizationId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Error retrieving equipment: ${error.message}`);
  }
};

export const getEquipmentById = async (id: string, organizationId: string): Promise<Equipment | null> => {
  try {
    const result = await query(
      `SELECT e.*, u.first_name as assigned_to_first_name, u.last_name as assigned_to_last_name
       FROM equipment e
       LEFT JOIN users u ON e.assigned_to = u.id
       WHERE e.id = $1 AND e.organization_id = $2`,
      [id, organizationId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error(`Error retrieving equipment: ${error.message}`);
  }
};

export const createEquipment = async (equipmentData: CreateEquipment & { organizationId: string }): Promise<Equipment> => {
  try {
    const result = await query(
      `INSERT INTO equipment (
        organization_id, name, description, serial_number, category, 
        status, assigned_to, purchase_date, warranty_expiry, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) 
      RETURNING *`,
      [
        equipmentData.organizationId,
        equipmentData.name,
        equipmentData.description,
        equipmentData.serialNumber,
        equipmentData.category,
        equipmentData.status,
        equipmentData.assignedTo,
        equipmentData.purchaseDate,
        equipmentData.warrantyExpiry,
        equipmentData.notes || ''
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating equipment: ${error.message}`);
  }
};

export const updateEquipment = async (
  id: string, 
  equipmentData: Partial<CreateEquipment>, 
  organizationId: string
): Promise<Equipment | null> => {
  try {
    // First check if equipment exists and belongs to organization
    const existingEquipment = await getEquipmentById(id, organizationId);
    if (!existingEquipment) {
      return null;
    }
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    let index = 1;
    
    if (equipmentData.name !== undefined) {
      fields.push(`name = $${index}`);
      values.push(equipmentData.name);
      index++;
    }
    
    if (equipmentData.description !== undefined) {
      fields.push(`description = $${index}`);
      values.push(equipmentData.description);
      index++;
    }
    
    if (equipmentData.serialNumber !== undefined) {
      fields.push(`serial_number = $${index}`);
      values.push(equipmentData.serialNumber);
      index++;
    }
    
    if (equipmentData.category !== undefined) {
      fields.push(`category = $${index}`);
      values.push(equipmentData.category);
      index++;
    }
    
    if (equipmentData.status !== undefined) {
      fields.push(`status = $${index}`);
      values.push(equipmentData.status);
      index++;
    }
    
    if (equipmentData.assignedTo !== undefined) {
      fields.push(`assigned_to = $${index}`);
      values.push(equipmentData.assignedTo);
      index++;
    }
    
    if (equipmentData.purchaseDate !== undefined) {
      fields.push(`purchase_date = $${index}`);
      values.push(equipmentData.purchaseDate);
      index++;
    }
    
    if (equipmentData.warrantyExpiry !== undefined) {
      fields.push(`warranty_expiry = $${index}`);
      values.push(equipmentData.warrantyExpiry);
      index++;
    }
    
    if (equipmentData.notes !== undefined) {
      fields.push(`notes = $${index}`);
      values.push(equipmentData.notes);
      index++;
    }
    
    // Always update the updated_at timestamp
    fields.push(`updated_at = NOW()`);
    values.push(id); // Add id for WHERE clause
    
    const result = await query(
      `UPDATE equipment SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error(`Error updating equipment: ${error.message}`);
  }
};

export const deleteEquipment = async (id: string, organizationId: string): Promise<boolean> => {
  try {
    const result = await query(
      'DELETE FROM equipment WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    throw new Error(`Error deleting equipment: ${error.message}`);
  }
};

export default {
  getEquipmentByOrganization,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};
