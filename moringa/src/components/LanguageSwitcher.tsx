'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en' as const, name: 'English', native: 'English' },
    { code: 'ar' as const, name: 'Arabic', native: 'العربية' },
    { code: 'he' as const, name: 'Hebrew', native: 'עברית' }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
        aria-label="Change language"
      >
        <Languages size={16} className="text-[hsl(var(--muted-foreground))]" />
        <span className="text-sm font-medium text-[hsl(var(--foreground))] uppercase">{currentLanguage.code}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[hsl(var(--card))] rounded-lg shadow-lg border border-[hsl(var(--border))] py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-[hsl(var(--muted))] transition-colors ${
                language === lang.code ? 'bg-success-soft text-success' : 'text-[hsl(var(--foreground))]'
              }`}
            >
              <div className="font-medium">{lang.native}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{lang.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
