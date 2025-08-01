// Inventory service
import { query } from '../config/database';
import { InventoryItem, CreateInventoryItem } from '../types/inventory.types';

export const getInventoryByOrganization = async (organizationId: string): Promise<InventoryItem[]> => {
  try {
    const result = await query(
      'SELECT * FROM inventory WHERE organization_id = $1 ORDER BY created_at DESC',
      [organizationId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Error retrieving inventory items: ${error.message}`);
  }
};

export const getInventoryItemById = async (id: string, organizationId: string): Promise<InventoryItem | null> => {
  try {
    const result = await query(
      'SELECT * FROM inventory WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error(`Error retrieving inventory item: ${error.message}`);
  }
};

export const createInventoryItem = async (inventoryData: CreateInventoryItem & { organizationId: string }): Promise<InventoryItem> => {
  try {
    const result = await query(
      `INSERT INTO inventory (
        organization_id, name, description, sku, category, 
        unit_cost, unit_price, quantity_in_stock, reorder_level, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) 
      RETURNING *`,
      [
        inventoryData.organizationId,
        inventoryData.name,
        inventoryData.description,
        inventoryData.sku,
        inventoryData.category,
        inventoryData.unitCost,
        inventoryData.unitPrice,
        inventoryData.quantityInStock,
        inventoryData.reorderLevel,
        inventoryData.notes || ''
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating inventory item: ${error.message}`);
  }
};

export const updateInventoryItem = async (
  id: string, 
  inventoryData: Partial<CreateInventoryItem>, 
  organizationId: string
): Promise<InventoryItem | null> => {
  try {
    // First check if inventory item exists and belongs to organization
    const existingItem = await getInventoryItemById(id, organizationId);
    if (!existingItem) {
      return null;
    }
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    let index = 1;
    
    if (inventoryData.name !== undefined) {
      fields.push(`name = $${index}`);
      values.push(inventoryData.name);
      index++;
    }
    
    if (inventoryData.description !== undefined) {
      fields.push(`description = $${index}`);
      values.push(inventoryData.description);
      index++;
    }
    
    if (inventoryData.sku !== undefined) {
      fields.push(`sku = $${index}`);
      values.push(inventoryData.sku);
      index++;
    }
    
    if (inventoryData.category !== undefined) {
      fields.push(`category = $${index}`);
      values.push(inventoryData.category);
      index++;
    }
    
    if (inventoryData.unitCost !== undefined) {
      fields.push(`unit_cost = $${index}`);
      values.push(inventoryData.unitCost);
      index++;
    }
    
    if (inventoryData.unitPrice !== undefined) {
      fields.push(`unit_price = $${index}`);
      values.push(inventoryData.unitPrice);
      index++;
    }
    
    if (inventoryData.quantityInStock !== undefined) {
      fields.push(`quantity_in_stock = $${index}`);
      values.push(inventoryData.quantityInStock);
      index++;
    }
    
    if (inventoryData.reorderLevel !== undefined) {
      fields.push(`reorder_level = $${index}`);
      values.push(inventoryData.reorderLevel);
      index++;
    }
    
    if (inventoryData.notes !== undefined) {
      fields.push(`notes = $${index}`);
      values.push(inventoryData.notes);
      index++;
    }
    
    // Always update the updated_at timestamp
    fields.push(`updated_at = NOW()`);
    values.push(id); // Add id for WHERE clause
    
    const result = await query(
      `UPDATE inventory SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error(`Error updating inventory item: ${error.message}`);
  }
};

export const deleteInventoryItem = async (id: string, organizationId: string): Promise<boolean> => {
  try {
    const result = await query(
      'DELETE FROM inventory WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    throw new Error(`Error deleting inventory item: ${error.message}`);
  }
};

export default {
  getInventoryByOrganization,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
};
