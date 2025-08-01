// Job service
import { query } from '../config/database';
import { Job, CreateJob } from '../types/job.types';
import { validateDateFormat, validateEnumValue } from '../utils/validation';

export const getJobsByOrganization = async (organizationId: string): Promise<Job[]> => {
  try {
    const result = await query(
      `SELECT j.*, 
              c.first_name as customer_first_name, 
              c.last_name as customer_last_name,
              u.first_name as technician_first_name,
              u.last_name as technician_last_name
       FROM jobs j
       LEFT JOIN customers c ON j.customer_id = c.id
       LEFT JOIN users u ON j.technician_id = u.id
       WHERE j.organization_id = $1 
       ORDER BY j.created_at DESC`,
      [organizationId]
    );
    return result.rows;
  } catch (error) {
    throw new Error(`Error retrieving jobs: ${error.message}`);
  }
};

export const getJobById = async (id: string, organizationId: string): Promise<Job | null> => {
  try {
    const result = await query(
      `SELECT j.*, 
              c.first_name as customer_first_name, 
              c.last_name as customer_last_name,
              u.first_name as technician_first_name,
              u.last_name as technician_last_name
       FROM jobs j
       LEFT JOIN customers c ON j.customer_id = c.id
       LEFT JOIN users u ON j.technician_id = u.id
       WHERE j.id = $1 AND j.organization_id = $2`,
      [id, organizationId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw new Error(`Error retrieving job: ${error.message}`);
  }
};

export const createJob = async (jobData: CreateJob & { organizationId: string }): Promise<Job> => {
  try {
    // Validate enum values
    const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    
    if (jobData.status && !validateEnumValue(jobData.status, validStatuses)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    if (jobData.priority && !validateEnumValue(jobData.priority, validPriorities)) {
      throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }
    
    // Validate date format if provided
    if (jobData.scheduledDate && !validateDateFormat(jobData.scheduledDate)) {
      throw new Error('Invalid scheduled date format');
    }
    
    const result = await query(
      `INSERT INTO jobs (
        organization_id, customer_id, technician_id, title, description, 
        status, priority, scheduled_date, start_time, end_time, 
        address, city, state, zip_code, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()) 
      RETURNING *`,
      [
        jobData.organizationId,
        jobData.customerId,
        jobData.technicianId,
        jobData.title,
        jobData.description,
        jobData.status || 'scheduled',
        jobData.priority || 'medium',
        jobData.scheduledDate,
        jobData.startTime,
        jobData.endTime,
        jobData.address,
        jobData.city,
        jobData.state,
        jobData.zipCode,
        jobData.notes || ''
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    if (error.message.includes('Invalid status') || 
        error.message.includes('Invalid priority') || 
        error.message.includes('Invalid scheduled date format')) {
      throw error;
    }
    throw new Error(`Error creating job: ${error.message}`);
  }
};

export const updateJob = async (
  id: string, 
  jobData: Partial<CreateJob>, 
  organizationId: string
): Promise<Job | null> => {
  try {
    // First check if job exists and belongs to organization
    const existingJob = await getJobById(id, organizationId);
    if (!existingJob) {
      return null;
    }
    
    // Validate enum values if provided
    const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    
    if (jobData.status && !validateEnumValue(jobData.status, validStatuses)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    if (jobData.priority && !validateEnumValue(jobData.priority, validPriorities)) {
      throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }
    
    // Validate date format if provided
    if (jobData.scheduledDate && !validateDateFormat(jobData.scheduledDate)) {
      throw new Error('Invalid scheduled date format');
    }
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    let index = 1;
    
    if (jobData.customerId !== undefined) {
      fields.push(`customer_id = $${index}`);
      values.push(jobData.customerId);
      index++;
    }
    
    if (jobData.technicianId !== undefined) {
      fields.push(`technician_id = $${index}`);
      values.push(jobData.technicianId);
      index++;
    }
    
    if (jobData.title !== undefined) {
      fields.push(`title = $${index}`);
      values.push(jobData.title);
      index++;
    }
    
    if (jobData.description !== undefined) {
      fields.push(`description = $${index}`);
      values.push(jobData.description);
      index++;
    }
    
    if (jobData.status !== undefined) {
      fields.push(`status = $${index}`);
      values.push(jobData.status);
      index++;
    }
    
    if (jobData.priority !== undefined) {
      fields.push(`priority = $${index}`);
      values.push(jobData.priority);
      index++;
    }
    
    if (jobData.scheduledDate !== undefined) {
      fields.push(`scheduled_date = $${index}`);
      values.push(jobData.scheduledDate);
      index++;
    }
    
    if (jobData.startTime !== undefined) {
      fields.push(`start_time = $${index}`);
      values.push(jobData.startTime);
      index++;
    }
    
    if (jobData.endTime !== undefined) {
      fields.push(`end_time = $${index}`);
      values.push(jobData.endTime);
      index++;
    }
    
    if (jobData.address !== undefined) {
      fields.push(`address = $${index}`);
      values.push(jobData.address);
      index++;
    }
    
    if (jobData.city !== undefined) {
      fields.push(`city = $${index}`);
      values.push(jobData.city);
      index++;
    }
    
    if (jobData.state !== undefined) {
      fields.push(`state = $${index}`);
      values.push(jobData.state);
      index++;
    }
    
    if (jobData.zipCode !== undefined) {
      fields.push(`zip_code = $${index}`);
      values.push(jobData.zipCode);
      index++;
    }
    
    if (jobData.notes !== undefined) {
      fields.push(`notes = $${index}`);
      values.push(jobData.notes);
      index++;
    }
    
    // Always update the updated_at timestamp
    fields.push(`updated_at = NOW()`);
    values.push(id); // Add id for WHERE clause
    
    const result = await query(
      `UPDATE jobs SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    if (error.message.includes('Invalid status') || 
        error.message.includes('Invalid priority') || 
        error.message.includes('Invalid scheduled date format')) {
      throw error;
    }
    throw new Error(`Error updating job: ${error.message}`);
  }
};

export const deleteJob = async (id: string, organizationId: string): Promise<boolean> => {
  try {
    const result = await query(
      'DELETE FROM jobs WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    throw new Error(`Error deleting job: ${error.message}`);
  }
};

export default {
  getJobsByOrganization,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};
