/**
 * Currency formatting utilities for the application
 */

export type Currency = 'ILS' | 'USD' | 'EUR';

/**
 * Format a number as currency with proper symbol and locale
 * @param value - The numeric value to format
 * @param language - The current language ('en', 'ar', 'he')
 * @param currency - The currency code (default: 'ILS' for Israeli Shekel)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  language: 'en' | 'ar' | 'he' = 'en',
  currency: Currency = 'ILS'
): string {
  // Map language codes to BCP 47 locale identifiers
  const localeMap: Record<string, string> = {
    en: 'en-US',
    ar: 'ar-IL', // Arabic (Israel) for proper ILS support
    he: 'he-IL', // Hebrew (Israel)
  };

  const locale = localeMap[language] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    // Fallback if Intl fails
    const symbols: Record<Currency, string> = {
      ILS: '₪',
      USD: '$',
      EUR: '€',
    };
    const symbol = symbols[currency] || currency;
    const formatted = value.toFixed(2);
    // For RTL languages, put symbol after number
    return language === 'ar' || language === 'he'
      ? `${formatted} ${symbol}`
      : `${symbol}${formatted}`;
  }
}

/**
 * Format a price input value (strips non-numeric except decimal point)
 * @param input - The raw input string
 * @returns Cleaned numeric string
 */
export function sanitizePriceInput(input: string): string {
  return input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
}
