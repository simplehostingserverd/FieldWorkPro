// Payment routes
import express from 'express';
import { 
  getAllPayments,
  getPayment,
  createNewPayment,
  updateExistingPayment,
  deleteExistingPayment
} from '../controllers/payments.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/payments - Get all payments for organization
router.get('/', getAllPayments);

// GET /api/payments/:id - Get a specific payment
router.get('/:id', getPayment);

// POST /api/payments - Create a new payment
router.post('/', createNewPayment);

// PUT /api/payments/:id - Update a payment
router.put('/:id', updateExistingPayment);

// DELETE /api/payments/:id - Delete a payment
router.delete('/:id', deleteExistingPayment);

export default router;
