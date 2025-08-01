// Utility functions for validation
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneFormat = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/;
  return phoneRegex.test(phone);
};

export const validateDateFormat = (date: string): boolean => {
  return !isNaN(Date.parse(date));
};

export const validateEnumValue = (value: string, allowedValues: string[]): boolean => {
  return allowedValues.includes(value);
};

export default {
  validateEmailFormat,
  validatePhoneFormat,
  validateDateFormat,
  validateEnumValue
};
