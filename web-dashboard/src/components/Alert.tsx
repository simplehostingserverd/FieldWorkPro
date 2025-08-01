// src/components/Alert.tsx
import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

interface AlertProps {
  children?: React.ReactNode;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  children,
  message,
  type,
  variant = 'info',
  className = '',
  title,
  dismissible = false,
  onDismiss,
  onClose
}) => {
  // Support both 'type' and 'variant' props for backward compatibility
  const alertVariant = type || variant;
  const content = message || children;
  const handleClose = onClose || onDismiss;

  const variantClasses = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  };

  const iconClasses = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400'
  };

  const Icon = {
    info: FaInfoCircle,
    success: FaCheckCircle,
    warning: FaExclamationTriangle,
    error: FaExclamationCircle
  }[alertVariant];
  
  return (
    <div className={`rounded-lg border p-4 ${variantClasses[alertVariant]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconClasses[alertVariant]}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">
              {title}
            </h3>
          )}
          <div className={`text-sm ${title ? 'mt-1' : ''}`}>
            {content}
          </div>
        </div>
        {(dismissible || handleClose) && (
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleClose}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
