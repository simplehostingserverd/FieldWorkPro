// Job routes
import express from 'express';
import { 
  getAllJobs,
  getJob,
  createNewJob,
  updateExistingJob,
  deleteExistingJob
} from '../controllers/jobs.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/jobs - Get all jobs for organization
router.get('/', getAllJobs);

// GET /api/jobs/:id - Get a specific job
router.get('/:id', getJob);

// POST /api/jobs - Create a new job
router.post('/', createNewJob);

// PUT /api/jobs/:id - Update a job
router.put('/:id', updateExistingJob);

// DELETE /api/jobs/:id - Delete a job
router.delete('/:id', deleteExistingJob);

export default router;
