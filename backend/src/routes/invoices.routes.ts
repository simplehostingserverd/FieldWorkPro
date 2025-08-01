// Invoice routes
import express from 'express';
import { 
  getAllInvoices,
  getInvoice,
  createNewInvoice,
  updateExistingInvoice,
  deleteExistingInvoice
} from '../controllers/invoices.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/invoices - Get all invoices for organization
router.get('/', getAllInvoices);

// GET /api/invoices/:id - Get a specific invoice
router.get('/:id', getInvoice);

// POST /api/invoices - Create a new invoice
router.post('/', createNewInvoice);

// PUT /api/invoices/:id - Update an invoice
router.put('/:id', updateExistingInvoice);

// DELETE /api/invoices/:id - Delete an invoice
router.delete('/:id', deleteExistingInvoice);

export default router;
