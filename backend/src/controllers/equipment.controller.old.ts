// Equipment controller
import { Request, Response } from 'express';
import { 
  getEquipmentByOrganization, 
  getEquipmentById, 
  createEquipment, 
  updateEquipment, 
  deleteEquipment 
} from '../services/equipment.service';
import { CreateEquipment } from '../types/equipment.types';

export const getAllEquipment = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user.organizationId;
    const equipment = await getEquipmentByOrganization(organizationId);
    res.status(200).json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving equipment', error: error.message });
  }
};

export const getEquipmentItem = async (req: Request, res: Response) => {
  try {
    const equipmentId = req.params.id;
    const organizationId = (req as any).user.organizationId;
    
    const equipment = await getEquipmentById(equipmentId, organizationId);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.status(200).json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving equipment', error: error.message });
  }
};

export const createNewEquipment = async (req: Request, res: Response) => {
  try {
    const equipmentData: CreateEquipment = req.body;
    const organizationId = (req as any).user.organizationId;
    
    const equipment = await createEquipment({
      ...equipmentData,
      organizationId
    });
    
    res.status(201).json({
      message: 'Equipment created successfully',
      equipment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating equipment', error: error.message });
  }
};

export const updateExistingEquipment = async (req: Request, res: Response) => {
  try {
    const equipmentId = req.params.id;
    const equipmentData = req.body;
    const organizationId = (req as any).user.organizationId;
    
    const equipment = await updateEquipment(equipmentId, equipmentData, organizationId);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.status(200).json({
      message: 'Equipment updated successfully',
      equipment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating equipment', error: error.message });
  }
};

export const deleteExistingEquipment = async (req: Request, res: Response) => {
  try {
    const equipmentId = req.params.id;
    const organizationId = (req as any).user.organizationId;
    
    const result = await deleteEquipment(equipmentId, organizationId);
    
    if (!result) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    res.status(200).json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting equipment', error: error.message });
  }
};

export default {
  getAllEquipment,
  getEquipmentItem,
  createNewEquipment,
  updateExistingEquipment,
  deleteExistingEquipment
};
