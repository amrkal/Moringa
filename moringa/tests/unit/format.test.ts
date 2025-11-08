import { describe, it, expect } from 'vitest';
import { formatCurrency, sanitizePriceInput } from '@/lib/format';

describe('Format', () => {
  describe('formatCurrency', () => {
    it('should format currency in ILS for English', () => {
      const formatted = formatCurrency(100, 'en', 'ILS');
      expect(formatted).toContain('100');
      expect(formatted).toContain('₪');
    });

    it('should format currency in ILS for Hebrew', () => {
      const formatted = formatCurrency(100, 'he', 'ILS');
      expect(formatted).toContain('100');
      expect(formatted).toContain('₪');
    });

    it('should format currency in ILS for Arabic', () => {
      const formatted = formatCurrency(100, 'ar', 'ILS');
      // Arabic uses Arabic-Indic numerals, so we check for the presence of the currency symbol
      expect(formatted).toContain('₪');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should format currency in USD', () => {
      const formatted = formatCurrency(100, 'en', 'USD');
      expect(formatted).toContain('100');
      expect(formatted).toContain('$');
    });

    it('should format currency in EUR', () => {
      const formatted = formatCurrency(100, 'en', 'EUR');
      expect(formatted).toContain('100');
      expect(formatted).toContain('€');
    });

    it('should format decimal values correctly', () => {
      const formatted = formatCurrency(123.456, 'en', 'USD');
      expect(formatted).toContain('123.46');
    });

    it('should format zero correctly', () => {
      const formatted = formatCurrency(0, 'en', 'USD');
      expect(formatted).toContain('0.00');
    });

    it('should format negative values', () => {
      const formatted = formatCurrency(-50, 'en', 'USD');
      expect(formatted).toContain('50');
      expect(formatted).toMatch(/-|\(/); // Either minus sign or parentheses
    });

    it('should use default language when not specified', () => {
      const formatted = formatCurrency(100);
      expect(formatted).toBeTruthy();
      expect(formatted).toContain('100');
    });

    it('should use default currency (ILS) when not specified', () => {
      const formatted = formatCurrency(100, 'en');
      expect(formatted).toContain('₪');
    });

    it('should handle large numbers', () => {
      const formatted = formatCurrency(1234567.89, 'en', 'USD');
      expect(formatted).toContain('1,234,567.89');
    });
  });

  describe('sanitizePriceInput', () => {
    it('should remove non-numeric characters', () => {
      expect(sanitizePriceInput('abc123def')).toBe('123');
    });

    it('should preserve decimal point', () => {
      expect(sanitizePriceInput('123.45')).toBe('123.45');
    });

    it('should remove multiple decimal points', () => {
      expect(sanitizePriceInput('123.45.67')).toBe('123.4567');
    });

    it('should handle currency symbols', () => {
      expect(sanitizePriceInput('$123.45')).toBe('123.45');
      expect(sanitizePriceInput('₪100.50')).toBe('100.50');
      expect(sanitizePriceInput('€50.25')).toBe('50.25');
    });

    it('should handle empty string', () => {
      expect(sanitizePriceInput('')).toBe('');
    });

    it('should handle only symbols', () => {
      expect(sanitizePriceInput('$€₪')).toBe('');
    });

    it('should preserve leading/trailing digits', () => {
      expect(sanitizePriceInput('0.99')).toBe('0.99');
      expect(sanitizePriceInput('100.00')).toBe('100.00');
    });

    it('should handle comma separators', () => {
      expect(sanitizePriceInput('1,234.56')).toBe('1234.56');
    });

    it('should handle spaces', () => {
      expect(sanitizePriceInput('1 234.56')).toBe('1234.56');
    });
  });
});
