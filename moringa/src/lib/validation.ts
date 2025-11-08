/**
 * Form Validation Utilities
 * Centralized validation functions with i18n support
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validators = {
  required: (value: any, fieldName: string = 'This field'): ValidationResult => {
    const isEmpty = value === null || value === undefined || 
                   (typeof value === 'string' && value.trim() === '') ||
                   (Array.isArray(value) && value.length === 0);
    
    return {
      isValid: !isEmpty,
      error: isEmpty ? `${fieldName} is required` : undefined
    };
  },

  minLength: (value: string, min: number, fieldName: string = 'This field'): ValidationResult => {
    const isValid = Boolean(value && value.length >= min);
    return {
      isValid,
      error: !isValid ? `${fieldName} must be at least ${min} characters` : undefined
    };
  },

  maxLength: (value: string, max: number, fieldName: string = 'This field'): ValidationResult => {
    const isValid = !value || value.length <= max;
    return {
      isValid,
      error: !isValid ? `${fieldName} must be at most ${max} characters` : undefined
    };
  },

  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    return {
      isValid,
      error: !isValid ? 'Please enter a valid email address' : undefined
    };
  },

  phone: (value: string): ValidationResult => {
    // International phone format: +[country code][number]
    const phoneRegex = /^\+\d{10,15}$/;
    const isValid = phoneRegex.test(value);
    return {
      isValid,
      error: !isValid ? 'Please enter a valid phone number (format: +1234567890)' : undefined
    };
  },

  number: (value: any, fieldName: string = 'This field'): ValidationResult => {
    const num = Number(value);
    const isValid = !isNaN(num) && isFinite(num);
    return {
      isValid,
      error: !isValid ? `${fieldName} must be a valid number` : undefined
    };
  },

  min: (value: number, min: number, fieldName: string = 'This field'): ValidationResult => {
    const isValid = value >= min;
    return {
      isValid,
      error: !isValid ? `${fieldName} must be at least ${min}` : undefined
    };
  },

  max: (value: number, max: number, fieldName: string = 'This field'): ValidationResult => {
    const isValid = value <= max;
    return {
      isValid,
      error: !isValid ? `${fieldName} must be at most ${max}` : undefined
    };
  },

  url: (value: string): ValidationResult => {
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Please enter a valid URL' };
    }
  },

  imageUrl: (value: string): ValidationResult => {
    if (!value) return { isValid: true }; // Optional field
    
    // Check if it's a valid URL or base64 image
    if (value.startsWith('data:image/')) {
      return { isValid: true };
    }
    
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Please enter a valid image URL or upload an image' };
    }
  },

  price: (value: number): ValidationResult => {
    const isValid = !isNaN(value) && value >= 0;
    return {
      isValid,
      error: !isValid ? 'Price must be a positive number' : undefined
    };
  },

  positiveNumber: (value: number, fieldName: string = 'This field'): ValidationResult => {
    const isValid = !isNaN(value) && value > 0;
    return {
      isValid,
      error: !isValid ? `${fieldName} must be a positive number` : undefined
    };
  }
};

/**
 * Validate multiple fields at once
 */
export function validateFields(
  fields: Array<{ value: any; validators: Array<(value: any) => ValidationResult> }>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const field of fields) {
    for (const validator of field.validators) {
      const result = validator(field.value);
      if (!result.isValid && result.error) {
        errors.push(result.error);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Form validation hook-style helper
 */
export function useValidation<T extends Record<string, any>>(
  values: T,
  rules: Partial<Record<keyof T, Array<(value: any) => ValidationResult>>>
): { errors: Partial<Record<keyof T, string>>; isValid: boolean } {
  const errors: Partial<Record<keyof T, string>> = {};
  
  for (const key in rules) {
    const fieldRules = rules[key];
    if (!fieldRules) continue;
    
    for (const rule of fieldRules) {
      const result = rule(values[key]);
      if (!result.isValid && result.error) {
        errors[key] = result.error;
        break; // Only show first error per field
      }
    }
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}
