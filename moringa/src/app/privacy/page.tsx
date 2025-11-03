'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPage() {
  const { language } = useLanguage();

  const content = {
    en: { title: 'Privacy Policy', lastUpdated: 'Last updated: November 2, 2025' },
    ar: { title: 'سياسة الخصوصية', lastUpdated: 'آخر تحديث: 2 نوفمبر 2025' },
    he: { title: 'מדיניות פרטיות', lastUpdated: 'עודכן לאחרונה: 2 בנובמבר 2025' }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] py-6" dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">{currentContent.title}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">{currentContent.lastUpdated}</p>
        <div className="bg-[hsl(var(--card))] rounded-lg p-6 border border-[hsl(var(--border))]">
          <p className="text-[hsl(var(--muted-foreground))]">Privacy Policy content will be added here.</p>
        </div>
      </div>
    </div>
  );
}
