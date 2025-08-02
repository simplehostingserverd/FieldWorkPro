// src/components/ImprovedFormModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronDown, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaCalendar, FaTag, FaDollarSign } from 'react-icons/fa';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import AddressForm from './AddressForm';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'date' | 'address';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  icon?: React.ComponentType<any>;
  group?: string;
  validation?: (value: string) => string | null;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  title: string;
  fields: FormField[];
  initialData?: any;
  loading?: boolean;
  submitText?: string;
}

const ImprovedFormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  initialData = {},
  loading = false,
  submitText = 'Submit',
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setErrors({});
      setCollapsedGroups(new Set());
    }
  }, [isOpen, initialData]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleAddressChange = (addressData: any) => {
    setFormData((prev: any) => ({
      ...prev,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zip_code: addressData.zipCode,
    }));
    // Clear address-related errors
    ['address', 'city', 'state', 'zip_code'].forEach(field => {
      if (errors[field]) {
        setErrors((prev: any) => ({
          ...prev,
          [field]: '',
        }));
      }
    });
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    fields.forEach((field) => {
      const value = formData[field.name];
      
      // Required field validation
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }
      
      // Skip validation if field is empty and not required
      if (!value) return;
      
      // Custom validation
      if (field.validation) {
        const validationError = field.validation(value);
        if (validationError) {
          newErrors[field.name] = validationError;
          return;
        }
      }
      
      // Built-in validations
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            newErrors[field.name] = 'Please enter a valid email address';
          }
          break;
        case 'tel':
          const cleanPhone = value.replace(/\D/g, '');
          if (cleanPhone.length < 10) {
            newErrors[field.name] = 'Please enter a valid phone number (at least 10 digits)';
          }
          break;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGroup = (groupName: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupName)) {
      newCollapsed.delete(groupName);
    } else {
      newCollapsed.add(groupName);
    }
    setCollapsedGroups(newCollapsed);
  };

  const getFieldIcon = (field: FormField) => {
    if (field.icon) return field.icon;
    
    // Default icons based on field type/name
    switch (field.name.toLowerCase()) {
      case 'first_name':
      case 'last_name':
      case 'name':
        return FaUser;
      case 'email':
        return FaEnvelope;
      case 'phone':
        return FaPhone;
      case 'address':
        return FaMapMarkerAlt;
      case 'company':
      case 'company_name':
        return FaBuilding;
      case 'date':
      case 'created_at':
      case 'updated_at':
        return FaCalendar;
      case 'category':
      case 'status':
        return FaTag;
      case 'amount':
      case 'price':
      case 'cost':
        return FaDollarSign;
      default:
        return null;
    }
  };

  // Group fields by their group property
  const groupedFields = fields.reduce((acc, field) => {
    const group = field.group || 'main';
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {} as Record<string, FormField[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-t-xl sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 rounded-full hover:bg-gray-100"
                disabled={isSubmitting}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
              {Object.entries(groupedFields).map(([groupName, groupFields]) => (
                <div key={groupName}>
                  {groupName !== 'main' && (
                    <button
                      type="button"
                      onClick={() => toggleGroup(groupName)}
                      className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span className="font-medium text-gray-900 capitalize">{groupName.replace('_', ' ')}</span>
                      <FaChevronDown 
                        className={`transform transition-transform ${
                          collapsedGroups.has(groupName) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                  
                  <div className={`space-y-4 ${
                    groupName !== 'main' && collapsedGroups.has(groupName) ? 'hidden' : ''
                  }`}>
                    {groupFields.map((field) => (
                      <div key={field.name}>
                        {field.type === 'address' ? (
                          <AddressForm
                            data={{
                              address: formData.address || '',
                              city: formData.city || '',
                              state: formData.state || '',
                              zipCode: formData.zip_code || '',
                            }}
                            onChange={handleAddressChange}
                            errors={{
                              address: errors.address,
                              city: errors.city,
                              state: errors.state,
                              zipCode: errors.zip_code,
                            }}
                            required={field.required}
                          />
                        ) : (
                          <>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            <div className="relative">
                              {(() => {
                                const IconComponent = getFieldIcon(field);
                                return IconComponent && (
                                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <IconComponent size={16} />
                                  </div>
                                );
                              })()}

                              {field.type === 'textarea' ? (
                                <textarea
                                  value={formData[field.name] || ''}
                                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                                  disabled={isSubmitting}
                                  className={`w-full ${getFieldIcon(field) ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                                    errors[field.name] ? 'border-red-500' : 'border-gray-300'
                                  } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                  rows={3}
                                />
                              ) : field.type === 'select' ? (
                                <select
                                  value={formData[field.name] || ''}
                                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                                  disabled={isSubmitting}
                                  className={`w-full ${getFieldIcon(field) ? 'pl-10' : 'pl-3'} pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none ${
                                    errors[field.name] ? 'border-red-500' : 'border-gray-300'
                                  } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                >
                                  <option value="">Select {field.label.toLowerCase()}</option>
                                  {field.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={field.type}
                                  value={formData[field.name] || ''}
                                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                                  disabled={isSubmitting}
                                  className={`w-full ${getFieldIcon(field) ? 'pl-10' : 'pl-3'} pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors[field.name] ? 'border-red-500' : 'border-gray-300'
                                  } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                />
                              )}

                              {field.type === 'select' && (
                                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                              )}
                            </div>

                            {errors[field.name] && (
                              <p className="mt-2 text-sm text-red-600 flex items-center">
                                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                                {errors[field.name]}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                submitText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedFormModal;
