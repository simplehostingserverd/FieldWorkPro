// src/components/Form.tsx
import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  error,
  required = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

interface FormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  className = '',
}) => {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
};

interface InputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  required = false,
  error,
}) => {
  const inputElement = (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${className}`}
    />
  );

  if (label) {
    return (
      <FormField label={label} required={required} error={error}>
        {inputElement}
      </FormField>
    );
  }

  return inputElement;
};

interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
}) => {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${className}`}
    />
  );
};

interface SelectProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children?: React.ReactNode;
  options?: { value: string; label: string }[];
  className?: string;
  required?: boolean;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  children,
  options,
  className = '',
  required = false,
  error,
}) => {
  const selectElement = (
    <select
      value={value}
      onChange={onChange}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${className}`}
    >
      {options
        ? options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        : children}
    </select>
  );

  if (label) {
    return (
      <FormField label={label} required={required} error={error}>
        {selectElement}
      </FormField>
    );
  }

  return selectElement;
};
