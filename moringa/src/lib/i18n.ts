// Helper to get translated text from translation object based on current language
export function getLocalizedText(
  text: { en: string; ar: string; he: string } | string | undefined,
  language: 'en' | 'ar' | 'he'
): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[language] || text.en || '';
}
