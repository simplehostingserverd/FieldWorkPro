// Equipment routes
import express from 'express';
import { 
  getAllEquipment,
  getEquipmentItem,
  createNewEquipment,
  updateExistingEquipment,
  deleteExistingEquipment
} from '../controllers/equipment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/equipment - Get all equipment for organization
router.get('/', getAllEquipment);

// GET /api/equipment/:id - Get a specific equipment item
router.get('/:id', getEquipmentItem);

// POST /api/equipment - Create a new equipment item
router.post('/', createNewEquipment);

// PUT /api/equipment/:id - Update an equipment item
router.put('/:id', updateExistingEquipment);

// DELETE /api/equipment/:id - Delete an equipment item
router.delete('/:id', deleteExistingEquipment);

export default router;
