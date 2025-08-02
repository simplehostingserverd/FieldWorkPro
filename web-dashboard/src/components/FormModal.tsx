// src/components/FormModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { FormField, Input, Textarea, Select } from './Form';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'email';
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  fields: FormField[];
  initialData?: any;
  loading?: boolean;
  submitText?: string;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  initialData = {},
  loading = false,
  submitText = 'Save'
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      // Initialize form data with initial values or empty strings
      const initialFormData: any = {};
      fields.forEach(field => {
        initialFormData[field.name] = initialData[field.name] || '';
      });
      setFormData(initialFormData);
      setErrors({});
    }
  }, [isOpen, fields, initialData]);

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it was set
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    
    switch (field.type) {
      case 'textarea':
        return (
          <FormField label={field.label} required={field.required} error={error}>
            <Textarea
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              rows={4}
            />
          </FormField>
        );
      
      case 'select':
        return (
          <FormField label={field.label} required={field.required} error={error}>
            <Select
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        );
      
      default:
        return (
          <FormField label={field.label} required={field.required} error={error}>
            <Input
              type={field.type}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </FormField>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(field => (
          <div key={field.name}>
            {renderField(field)}
          </div>
        ))}
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FormModal;
