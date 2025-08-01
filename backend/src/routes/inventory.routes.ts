// Inventory routes
import express from 'express';
import { 
  getAllInventoryItems,
  getInventoryItem,
  createNewInventoryItem,
  updateExistingInventoryItem,
  deleteExistingInventoryItem
} from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/inventory - Get all inventory items for organization
router.get('/', getAllInventoryItems);

// GET /api/inventory/:id - Get a specific inventory item
router.get('/:id', getInventoryItem);

// POST /api/inventory - Create a new inventory item
router.post('/', createNewInventoryItem);

// PUT /api/inventory/:id - Update an inventory item
router.put('/:id', updateExistingInventoryItem);

// DELETE /api/inventory/:id - Delete an inventory item
router.delete('/:id', deleteExistingInventoryItem);

export default router;
