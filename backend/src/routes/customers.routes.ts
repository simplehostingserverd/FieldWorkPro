// Customer routes
import express from 'express';
import { 
  getAllCustomers,
  getCustomer,
  createNewCustomer,
  updateExistingCustomer,
  deleteExistingCustomer
} from '../controllers/customers.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/customers - Get all customers for organization
router.get('/', getAllCustomers);

// GET /api/customers/:id - Get a specific customer
router.get('/:id', getCustomer);

// POST /api/customers - Create a new customer
router.post('/', createNewCustomer);

// PUT /api/customers/:id - Update a customer
router.put('/:id', updateExistingCustomer);

// DELETE /api/customers/:id - Delete a customer
router.delete('/:id', deleteExistingCustomer);

export default router;
