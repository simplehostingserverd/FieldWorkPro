// Customer controller
import { Request, Response } from 'express';
import { 
  getCustomersByOrganization, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} from '../services/customer.service';
import { CreateCustomer } from '../types/customer.types';
import { validateEmailFormat } from '../utils/validation';

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user.organizationId;
    const customers = await getCustomersByOrganization(organizationId);
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error retrieving customers:', error);
    res.status(500).json({ 
      message: 'Error retrieving customers', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.id;
    const organizationId = (req as any).user.organizationId;
    
    const customer = await getCustomerById(customerId, organizationId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error retrieving customer:', error);
    res.status(500).json({ 
      message: 'Error retrieving customer', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const createNewCustomer = async (req: Request, res: Response) => {
  try {
    const customerData: CreateCustomer = req.body;
    const organizationId = (req as any).user.organizationId;
    
    // Validate required fields
    if (!customerData.firstName || !customerData.lastName) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: [
          !customerData.firstName ? { field: 'firstName', message: 'First name is required' } : null,
          !customerData.lastName ? { field: 'lastName', message: 'Last name is required' } : null
        ].filter(Boolean)
      });
    }
    
    // Validate email format if provided
    if (customerData.email && !validateEmailFormat(customerData.email)) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: [{ field: 'email', message: 'Invalid email format' }] 
      });
    }
    
    const customer = await createCustomer({
      ...customerData,
      organizationId
    });
    
    res.status(201).json({
      message: 'Customer created successfully',
      customer
    });
  } catch (error) {
    if (error.message.includes('Invalid email format')) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: [{ field: 'email', message: 'Invalid email format' }] 
      });
    }
    
    console.error('Error creating customer:', error);
    res.status(500).json({ 
      message: 'Error creating customer', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const updateExistingCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.id;
    const customerData = req.body;
    const organizationId = (req as any).user.organizationId;
    
    const customer = await updateCustomer(customerId, customerData, organizationId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json({
      message: 'Customer updated successfully',
      customer
    });
  } catch (error) {
    if (error.message.includes('Invalid email format')) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: [{ field: 'email', message: 'Invalid email format' }] 
      });
    }
    
    console.error('Error updating customer:', error);
    res.status(500).json({ 
      message: 'Error updating customer', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export const deleteExistingCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.id;
    const organizationId = (req as any).user.organizationId;
    
    const result = await deleteCustomer(customerId, organizationId);
    
    if (!result) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ 
      message: 'Error deleting customer', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
};

export default {
  getAllCustomers,
  getCustomer,
  createNewCustomer,
  updateExistingCustomer,
  deleteExistingCustomer
};
