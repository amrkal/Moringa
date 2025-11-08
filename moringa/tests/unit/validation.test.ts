import { describe, it, expect } from 'vitest';
import { validators, validateFields, useValidation } from '@/lib/validation';

describe('Validation', () => {
  describe('validators.required', () => {
    it('should validate required field with value', () => {
      const result = validators.required('test', 'Name');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should invalidate empty string', () => {
      const result = validators.required('', 'Name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name is required');
    });

    it('should invalidate whitespace-only string', () => {
      const result = validators.required('   ', 'Name');
      expect(result.isValid).toBe(false);
    });

    it('should invalidate null', () => {
      const result = validators.required(null, 'Name');
      expect(result.isValid).toBe(false);
    });

    it('should invalidate undefined', () => {
      const result = validators.required(undefined, 'Name');
      expect(result.isValid).toBe(false);
    });

    it('should invalidate empty array', () => {
      const result = validators.required([], 'Items');
      expect(result.isValid).toBe(false);
    });

    it('should validate non-empty array', () => {
      const result = validators.required([1, 2, 3], 'Items');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validators.minLength', () => {
    it('should validate string meeting minimum length', () => {
      const result = validators.minLength('hello', 3, 'Name');
      expect(result.isValid).toBe(true);
    });

    it('should invalidate string below minimum length', () => {
      const result = validators.minLength('hi', 3, 'Name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name must be at least 3 characters');
    });

    it('should validate string equal to minimum length', () => {
      const result = validators.minLength('abc', 3, 'Name');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validators.maxLength', () => {
    it('should validate string within maximum length', () => {
      const result = validators.maxLength('hello', 10, 'Name');
      expect(result.isValid).toBe(true);
    });

    it('should invalidate string exceeding maximum length', () => {
      const result = validators.maxLength('hello world!', 10, 'Name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name must be at most 10 characters');
    });
  });

  describe('validators.email', () => {
    it('should validate valid email addresses', () => {
      expect(validators.email('test@example.com').isValid).toBe(true);
      expect(validators.email('user.name@domain.co.uk').isValid).toBe(true);
      expect(validators.email('user+tag@example.com').isValid).toBe(true);
    });

    it('should invalidate invalid email addresses', () => {
      expect(validators.email('invalid').isValid).toBe(false);
      expect(validators.email('invalid@').isValid).toBe(false);
      expect(validators.email('@example.com').isValid).toBe(false);
      expect(validators.email('invalid@domain').isValid).toBe(false);
      expect(validators.email('user name@domain.com').isValid).toBe(false);
    });
  });

  describe('validators.phone', () => {
    it('should validate valid phone numbers', () => {
      expect(validators.phone('+1234567890').isValid).toBe(true);
      expect(validators.phone('+972501234567').isValid).toBe(true);
      expect(validators.phone('+441234567890').isValid).toBe(true);
    });

    it('should invalidate invalid phone numbers', () => {
      expect(validators.phone('1234567890').isValid).toBe(false);
      expect(validators.phone('+123').isValid).toBe(false);
      expect(validators.phone('phone').isValid).toBe(false);
      expect(validators.phone('+12 34 56 78 90').isValid).toBe(false);
    });
  });

  describe('validators.number', () => {
    it('should validate valid numbers', () => {
      expect(validators.number(123, 'Age').isValid).toBe(true);
      expect(validators.number(0, 'Age').isValid).toBe(true);
      expect(validators.number(-5, 'Age').isValid).toBe(true);
      expect(validators.number(3.14, 'Age').isValid).toBe(true);
    });

    it('should invalidate non-numbers', () => {
      expect(validators.number('abc', 'Age').isValid).toBe(false);
      expect(validators.number(NaN, 'Age').isValid).toBe(false);
      expect(validators.number(Infinity, 'Age').isValid).toBe(false);
    });
  });

  describe('validators.min', () => {
    it('should validate numbers meeting minimum', () => {
      expect(validators.min(10, 5, 'Age').isValid).toBe(true);
      expect(validators.min(5, 5, 'Age').isValid).toBe(true);
    });

    it('should invalidate numbers below minimum', () => {
      const result = validators.min(3, 5, 'Age');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Age must be at least 5');
    });
  });

  describe('validators.max', () => {
    it('should validate numbers within maximum', () => {
      expect(validators.max(5, 10, 'Age').isValid).toBe(true);
      expect(validators.max(10, 10, 'Age').isValid).toBe(true);
    });

    it('should invalidate numbers exceeding maximum', () => {
      const result = validators.max(15, 10, 'Age');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Age must be at most 10');
    });
  });

  describe('validators.url', () => {
    it('should validate valid URLs', () => {
      expect(validators.url('https://example.com').isValid).toBe(true);
      expect(validators.url('http://example.com').isValid).toBe(true);
      expect(validators.url('https://example.com/path?query=1').isValid).toBe(true);
    });

    it('should invalidate invalid URLs', () => {
      expect(validators.url('not a url').isValid).toBe(false);
      expect(validators.url('example.com').isValid).toBe(false);
      expect(validators.url('').isValid).toBe(false);
    });
  });

  describe('validators.imageUrl', () => {
    it('should validate valid image URLs', () => {
      expect(validators.imageUrl('https://example.com/image.jpg').isValid).toBe(true);
      expect(validators.imageUrl('data:image/png;base64,iVBOR...').isValid).toBe(true);
    });

    it('should allow empty value (optional)', () => {
      expect(validators.imageUrl('').isValid).toBe(true);
    });

    it('should invalidate invalid image URLs', () => {
      expect(validators.imageUrl('not a url').isValid).toBe(false);
    });
  });

  describe('validators.price', () => {
    it('should validate valid prices', () => {
      expect(validators.price(10.50).isValid).toBe(true);
      expect(validators.price(0).isValid).toBe(true);
      expect(validators.price(100).isValid).toBe(true);
    });

    it('should invalidate negative prices', () => {
      expect(validators.price(-5).isValid).toBe(false);
    });

    it('should invalidate non-numeric prices', () => {
      expect(validators.price(NaN).isValid).toBe(false);
    });
  });

  describe('validators.positiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(validators.positiveNumber(1, 'Quantity').isValid).toBe(true);
      expect(validators.positiveNumber(100, 'Quantity').isValid).toBe(true);
    });

    it('should invalidate zero and negative numbers', () => {
      expect(validators.positiveNumber(0, 'Quantity').isValid).toBe(false);
      expect(validators.positiveNumber(-1, 'Quantity').isValid).toBe(false);
    });
  });

  describe('validateFields', () => {
    it('should validate all fields successfully', () => {
      const result = validateFields([
        {
          value: 'test@example.com',
          validators: [validators.email]
        },
        {
          value: 'John Doe',
          validators: [(v) => validators.required(v, 'Name')]
        }
      ]);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect all validation errors', () => {
      const result = validateFields([
        {
          value: '',
          validators: [(v) => validators.required(v, 'Name')]
        },
        {
          value: 'invalid-email',
          validators: [validators.email]
        }
      ]);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('useValidation', () => {
    it('should validate form values with rules', () => {
      const values = {
        email: 'test@example.com',
        name: 'John',
        age: 25
      };

      const rules = {
        email: [validators.email],
        name: [(v: string) => validators.required(v, 'Name')],
        age: [(v: number) => validators.min(v, 18, 'Age')]
      };

      const result = useValidation(values, rules);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should collect field-specific errors', () => {
      const values = {
        email: 'invalid',
        name: '',
        age: 15
      };

      const rules = {
        email: [validators.email],
        name: [(v: string) => validators.required(v, 'Name')],
        age: [(v: number) => validators.min(v, 18, 'Age')]
      };

      const result = useValidation(values, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.name).toBeDefined();
      expect(result.errors.age).toBeDefined();
    });

    it('should show only first error per field', () => {
      const values = {
        name: ''
      };

      const rules = {
        name: [
          (v: string) => validators.required(v, 'Name'),
          (v: string) => validators.minLength(v, 3, 'Name')
        ]
      };

      const result = useValidation(values, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name is required');
    });
  });
});
