// Jobs controller - simplified version
import { Request, Response } from 'express';
import { query } from '../database';

export const getAllJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT j.*, 
             c.first_name || ' ' || c.last_name as customer_name,
             u.first_name || ' ' || u.last_name as technician_name
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN users u ON j.technician_id = u.id
      ORDER BY j.scheduled_date DESC, j.created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error retrieving jobs:', error);
    res.status(500).json({ 
      message: 'Error retrieving jobs', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const getJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = req.params.id;
    const result = await query(`
      SELECT j.*, 
             c.first_name || ' ' || c.last_name as customer_name,
             u.first_name || ' ' || u.last_name as technician_name
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN users u ON j.technician_id = u.id
      WHERE j.id = $1
    `, [jobId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error retrieving job:', error);
    res.status(500).json({ 
      message: 'Error retrieving job', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const createNewJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customer_id, technician_id, title, description, status, priority, scheduled_date, start_time, end_time, address, city, state, zip_code, notes } = req.body;
    
    if (!customer_id || !title || !scheduled_date) {
      res.status(400).json({ message: 'Customer ID, title, and scheduled date are required' });
      return;
    }
    
    const result = await query(
      `INSERT INTO jobs (organization_id, customer_id, technician_id, title, description, status, priority, scheduled_date, start_time, end_time, address, city, state, zip_code, notes, created_at, updated_at) 
       VALUES ((SELECT id FROM organizations LIMIT 1), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()) 
       RETURNING *`,
      [customer_id, technician_id, title, description, status || 'scheduled', priority || 'medium', scheduled_date, start_time, end_time, address, city, state, zip_code, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating job:', error);
    res.status(500).json({ 
      message: 'Error creating job', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const updateExistingJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = req.params.id;
    const { customer_id, technician_id, title, description, status, priority, scheduled_date, start_time, end_time, address, city, state, zip_code, notes } = req.body;
    
    const result = await query(
      `UPDATE jobs 
       SET customer_id = $1, technician_id = $2, title = $3, description = $4, status = $5, 
           priority = $6, scheduled_date = $7, start_time = $8, end_time = $9, address = $10,
           city = $11, state = $12, zip_code = $13, notes = $14, updated_at = NOW()
       WHERE id = $15 
       RETURNING *`,
      [customer_id, technician_id, title, description, status, priority, scheduled_date, start_time, end_time, address, city, state, zip_code, notes, jobId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating job:', error);
    res.status(500).json({ 
      message: 'Error updating job', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const deleteExistingJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = req.params.id;
    
    const result = await query('DELETE FROM jobs WHERE id = $1 RETURNING *', [jobId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }
    
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    res.status(500).json({ 
      message: 'Error deleting job', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};
