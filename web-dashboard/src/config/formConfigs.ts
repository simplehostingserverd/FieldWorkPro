// src/config/formConfigs.ts
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaTag, FaCalendar, FaDollarSign, FaFileAlt, FaMapMarkerAlt, FaCog } from 'react-icons/fa';

export interface FormField {
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

// Equipment Form Configuration
export const equipmentFormFields: FormField[] = [
  {
    name: 'name',
    label: 'Equipment Name',
    type: 'text',
    required: true,
    placeholder: 'Enter equipment name',
    icon: FaTag,
    group: 'basic_info'
  },
  {
    name: 'serial_number',
    label: 'Serial Number',
    type: 'text',
    required: true,
    placeholder: 'Enter serial number',
    icon: FaCog,
    group: 'basic_info'
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'drill', label: 'Drill' },
      { value: 'excavator', label: 'Excavator' },
      { value: 'bulldozer', label: 'Bulldozer' },
      { value: 'crane', label: 'Crane' },
      { value: 'compressor', label: 'Compressor' },
      { value: 'generator', label: 'Generator' },
      { value: 'pump', label: 'Pump' },
      { value: 'truck', label: 'Truck' },
      { value: 'trailer', label: 'Trailer' },
      { value: 'other', label: 'Other' }
    ],
    icon: FaTag,
    group: 'basic_info'
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: [
      { value: 'available', label: 'Available' },
      { value: 'in_use', label: 'In Use' },
      { value: 'maintenance', label: 'Under Maintenance' },
      { value: 'out_of_service', label: 'Out of Service' }
    ],
    icon: FaCog,
    group: 'basic_info'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter equipment description',
    icon: FaFileAlt,
    group: 'basic_info'
  },
  {
    name: 'assigned_to',
    label: 'Assigned To',
    type: 'text',
    placeholder: 'Enter assigned person/team',
    icon: FaUser,
    group: 'assignment'
  },
  {
    name: 'purchase_date',
    label: 'Purchase Date',
    type: 'date',
    icon: FaCalendar,
    group: 'purchase_info'
  },
  {
    name: 'purchase_price',
    label: 'Purchase Price',
    type: 'number',
    placeholder: 'Enter purchase price',
    icon: FaDollarSign,
    group: 'purchase_info',
    validation: (value: string) => {
      if (value && parseFloat(value) < 0) {
        return 'Price must be a positive number';
      }
      return null;
    }
  },
  {
    name: 'warranty_expiry',
    label: 'Warranty Expiry',
    type: 'date',
    icon: FaCalendar,
    group: 'purchase_info'
  },
  {
    name: 'notes',
    label: 'Additional Notes',
    type: 'textarea',
    placeholder: 'Enter any additional notes',
    icon: FaFileAlt,
    group: 'additional_info'
  }
];

// Customer Form Configuration
export const customerFormFields: FormField[] = [
  {
    name: 'first_name',
    label: 'First Name',
    type: 'text',
    required: true,
    placeholder: 'Enter first name',
    icon: FaUser,
    group: 'personal_info'
  },
  {
    name: 'last_name',
    label: 'Last Name',
    type: 'text',
    required: true,
    placeholder: 'Enter last name',
    icon: FaUser,
    group: 'personal_info'
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'Enter email address',
    icon: FaEnvelope,
    group: 'contact_info',
    validation: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    required: true,
    placeholder: 'Enter phone number',
    icon: FaPhone,
    group: 'contact_info',
    validation: (value: string) => {
      if (value) {
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
          return 'Please enter a valid phone number (at least 10 digits)';
        }
      }
      return null;
    }
  },
  {
    name: 'company_name',
    label: 'Company Name',
    type: 'text',
    placeholder: 'Enter company name (optional)',
    icon: FaBuilding,
    group: 'company_info'
  },
  {
    name: 'address',
    label: 'Address',
    type: 'address',
    required: true,
    icon: FaMapMarkerAlt,
    group: 'address_info'
  },
  {
    name: 'customer_type',
    label: 'Customer Type',
    type: 'select',
    required: true,
    options: [
      { value: 'individual', label: 'Individual' },
      { value: 'business', label: 'Business' },
      { value: 'contractor', label: 'Contractor' },
      { value: 'government', label: 'Government' }
    ],
    icon: FaTag,
    group: 'classification'
  },
  {
    name: 'preferred_contact',
    label: 'Preferred Contact Method',
    type: 'select',
    options: [
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'text', label: 'Text Message' }
    ],
    icon: FaPhone,
    group: 'preferences'
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Enter any additional notes about the customer',
    icon: FaFileAlt,
    group: 'additional_info'
  }
];

// Job Form Configuration
export const jobFormFields: FormField[] = [
  {
    name: 'title',
    label: 'Job Title',
    type: 'text',
    required: true,
    placeholder: 'Enter job title',
    icon: FaTag,
    group: 'basic_info'
  },
  {
    name: 'customer_id',
    label: 'Customer',
    type: 'select',
    required: true,
    options: [], // Will be populated dynamically
    icon: FaUser,
    group: 'basic_info'
  },
  {
    name: 'description',
    label: 'Job Description',
    type: 'textarea',
    required: true,
    placeholder: 'Enter detailed job description',
    icon: FaFileAlt,
    group: 'basic_info'
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ],
    icon: FaCog,
    group: 'basic_info'
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    required: true,
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' }
    ],
    icon: FaTag,
    group: 'scheduling'
  },
  {
    name: 'scheduled_date',
    label: 'Scheduled Date',
    type: 'date',
    required: true,
    icon: FaCalendar,
    group: 'scheduling'
  },
  {
    name: 'estimated_duration',
    label: 'Estimated Duration (hours)',
    type: 'number',
    placeholder: 'Enter estimated hours',
    icon: FaCalendar,
    group: 'scheduling',
    validation: (value: string) => {
      if (value && parseFloat(value) <= 0) {
        return 'Duration must be greater than 0';
      }
      return null;
    }
  },
  {
    name: 'location',
    label: 'Job Location',
    type: 'address',
    required: true,
    icon: FaMapMarkerAlt,
    group: 'location_info'
  },
  {
    name: 'estimated_cost',
    label: 'Estimated Cost',
    type: 'number',
    placeholder: 'Enter estimated cost',
    icon: FaDollarSign,
    group: 'financial_info',
    validation: (value: string) => {
      if (value && parseFloat(value) < 0) {
        return 'Cost must be a positive number';
      }
      return null;
    }
  },
  {
    name: 'notes',
    label: 'Additional Notes',
    type: 'textarea',
    placeholder: 'Enter any additional notes',
    icon: FaFileAlt,
    group: 'additional_info'
  }
];

// Form group labels for better UX
export const formGroupLabels: Record<string, string> = {
  basic_info: 'Basic Information',
  personal_info: 'Personal Information',
  contact_info: 'Contact Information',
  company_info: 'Company Information',
  address_info: 'Address Information',
  classification: 'Classification',
  preferences: 'Preferences',
  assignment: 'Assignment',
  purchase_info: 'Purchase Information',
  scheduling: 'Scheduling',
  location_info: 'Location',
  financial_info: 'Financial Information',
  additional_info: 'Additional Information'
};
