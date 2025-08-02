// Job controller
import { Request, Response } from 'express';
import { 
  getJobsByOrganization, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob 
} from '../services/job.service';
import { CreateJob } from '../types/job.types';

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user.organizationId;
    const jobs = await getJobsByOrganization(organizationId);
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving jobs', error: error.message });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const organizationId = (req as any).user.organizationId;
    
    const job = await getJobById(jobId, organizationId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving job', error: error.message });
  }
};

export const createNewJob = async (req: Request, res: Response) => {
  try {
    const jobData: CreateJob = req.body;
    const organizationId = (req as any).user.organizationId;
    
    const job = await createJob({
      ...jobData,
      organizationId
    });
    
    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
};

export const updateExistingJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const jobData = req.body;
    const organizationId = (req as any).user.organizationId;
    
    const job = await updateJob(jobId, jobData, organizationId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.status(200).json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
};

export const deleteExistingJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const organizationId = (req as any).user.organizationId;
    
    const result = await deleteJob(jobId, organizationId);
    
    if (!result) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};

export default {
  getAllJobs,
  getJob,
  createNewJob,
  updateExistingJob,
  deleteExistingJob
};
