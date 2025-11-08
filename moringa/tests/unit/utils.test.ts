import { describe, it, expect, vi } from 'vitest';
import {
  cn,
  formatDate,
  formatDateShort,
  formatPhone,
  generateOrderNumber,
  calculateItemTotal,
  calculateCartTotal,
  slugify,
  truncateText,
  debounce,
} from '@/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should merge tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });
  });

  describe('formatDate', () => {
    it('should format date in English', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDate(date, 'en');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should format date in Hebrew', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDate(date, 'he');
      expect(formatted).toBeTruthy();
    });

    it('should format date in Arabic', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDate(date, 'ar');
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatDateShort', () => {
    it('should format date in short format', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDateShort(date, 'en');
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatPhone', () => {
    it('should format US phone number', () => {
      expect(formatPhone('11234567890')).toBe('+1 (123) 456-7890');
    });

    it('should return original for non-US numbers', () => {
      expect(formatPhone('+972501234567')).toBe('+972501234567');
    });

    it('should handle numbers with non-digits', () => {
      expect(formatPhone('1-123-456-7890')).toBe('+1 (123) 456-7890');
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate unique order numbers', () => {
      const order1 = generateOrderNumber();
      const order2 = generateOrderNumber();
      expect(order1).toMatch(/^ORD-\d+-[A-Z0-9]+$/);
      expect(order2).toMatch(/^ORD-\d+-[A-Z0-9]+$/);
      expect(order1).not.toBe(order2);
    });

    it('should start with ORD- prefix', () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber).toMatch(/^ORD-/);
    });
  });

  describe('calculateItemTotal', () => {
    it('should calculate item total without ingredients', () => {
      expect(calculateItemTotal(10, 2, [])).toBe(20);
    });

    it('should calculate item total with ingredients', () => {
      const ingredients = [{ price: 2 }, { price: 3 }];
      expect(calculateItemTotal(10, 2, ingredients)).toBe(30); // (10 + 2 + 3) * 2
    });

    it('should handle single quantity', () => {
      const ingredients = [{ price: 5 }];
      expect(calculateItemTotal(10, 1, ingredients)).toBe(15);
    });
  });

  describe('calculateCartTotal', () => {
    it('should calculate total for empty cart', () => {
      expect(calculateCartTotal([])).toBe(0);
    });

    it('should calculate total for single item', () => {
      const items = [
        { price: 10, quantity: 2, selectedIngredients: [] }
      ];
      expect(calculateCartTotal(items)).toBe(20);
    });

    it('should calculate total for multiple items', () => {
      const items = [
        { price: 10, quantity: 2, selectedIngredients: [{ price: 2 }] },
        { price: 15, quantity: 1, selectedIngredients: [] }
      ];
      expect(calculateCartTotal(items)).toBe(39); // (10+2)*2 + 15*1
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello @World! #2024')).toBe('hello-world-2024');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('Hello   World')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('should truncate long text', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...');
    });

    it('should handle exact length', () => {
      expect(truncateText('Hello', 5)).toBe('Hello');
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should pass arguments to debounced function', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      vi.useRealTimers();
    });
  });
});
