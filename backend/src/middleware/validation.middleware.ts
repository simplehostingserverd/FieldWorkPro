// Validation middleware
import { Request, Response, NextFunction } from 'express';

interface ValidationError {
  field: string;
  message: string;
}

export const validateRequiredFields = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];
    
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

export const validateEmail = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: [{
        field: 'email',
        message: 'Invalid email format'
      }]
    });
  }
  
  next();
};

export const validatePhone = (req: Request, res: Response, next: NextFunction) => {
  const { phone } = req.body;
  
  if (phone && !/^\+?[\d\s\-\(\)]{10,20}$/.test(phone)) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: [{
        field: 'phone',
        message: 'Invalid phone number format'
      }]
    });
  }
  
  next();
};

export const validateDate = (dateField: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dateValue = req.body[dateField];
    
    if (dateValue && isNaN(Date.parse(dateValue))) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: [{
          field: dateField,
          message: 'Invalid date format'
        }]
      });
    }
    
    next();
  };
};

export const validateEnum = (field: string, allowedValues: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.body[field];
    
    if (value && !allowedValues.includes(value)) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: [{
          field,
          message: `Invalid value for ${field}. Allowed values: ${allowedValues.join(', ')}`
        }]
      });
    }
    
    next();
  };
};

export const validateNumber = (field: string, options?: { min?: number, max?: number }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.body[field];
    
    if (value !== undefined) {
      const numValue = Number(value);
      
      if (isNaN(numValue)) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: [{
            field,
            message: `${field} must be a number`
          }]
        });
      }
      
      if (options?.min !== undefined && numValue < options.min) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: [{
            field,
            message: `${field} must be at least ${options.min}`
          }]
        });
      }
      
      if (options?.max !== undefined && numValue > options.max) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: [{
            field,
            message: `${field} must be no more than ${options.max}`
          }]
        });
      }
    }
    
    next();
  };
};

export default {
  validateRequiredFields,
  validateEmail,
  validatePhone,
  validateDate,
  validateEnum,
  validateNumber
};
