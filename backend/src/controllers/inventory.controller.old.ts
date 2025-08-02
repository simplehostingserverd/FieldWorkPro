// Inventory controller
import { Request, Response } from 'express';
import { 
  getInventoryByOrganization, 
  getInventoryItemById, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem 
} from '../services/inventory.service';
import { CreateInventoryItem } from '../types/inventory.types';

export const getAllInventoryItems = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user.organizationId;
    const inventoryItems = await getInventoryByOrganization(organizationId);
    res.status(200).json(inventoryItems);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving inventory items', error: error.message });
  }
};

export const getInventoryItem = async (req: Request, res: Response) => {
  try {
    const inventoryId = req.params.id;
    const organizationId = (req as any).user.organizationId;
    
    const inventoryItem = await getInventoryItemById(inventoryId, organizationId);
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.status(200).json(inventoryItem);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving inventory item', error: error.message });
  }
};

export const createNewInventoryItem = async (req: Request, res: Response) => {
  try {
    const inventoryData: CreateInventoryItem = req.body;
    const organizationId = (req as any).user.organizationId;
    
    const inventoryItem = await createInventoryItem({
      ...inventoryData,
      organizationId
    });
    
    res.status(201).json({
      message: 'Inventory item created successfully',
      inventoryItem
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating inventory item', error: error.message });
  }
};

export const updateExistingInventoryItem = async (req: Request, res: Response) => {
  try {
    const inventoryId = req.params.id;
    const inventoryData = req.body;
    const organizationId = (req as any).user.organizationId;
    
    const inventoryItem = await updateInventoryItem(inventoryId, inventoryData, organizationId);
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.status(200).json({
      message: 'Inventory item updated successfully',
      inventoryItem
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating inventory item', error: error.message });
  }
};

export const deleteExistingInventoryItem = async (req: Request, res: Response) => {
  try {
    const inventoryId = req.params.id;
    const organizationId = (req as any).user.organizationId;
    
    const result = await deleteInventoryItem(inventoryId, organizationId);
    
    if (!result) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting inventory item', error: error.message });
  }
};

export default {
  getAllInventoryItems,
  getInventoryItem,
  createNewInventoryItem,
  updateExistingInventoryItem,
  deleteExistingInventoryItem
};
