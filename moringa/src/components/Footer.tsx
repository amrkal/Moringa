'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

export function Footer() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* First Row: Logo + Legal Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Moringa" className="h-6 w-auto rounded-sm" />
            <span className="text-[hsl(var(--muted-foreground))] hidden sm:inline">
              {getTranslation('footer', 'tagline', language)}
            </span>
          </div>
          
          {/* Legal Links - Horizontal */}
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/terms" 
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors whitespace-nowrap"
            >
              {getTranslation('footer', 'termsConditions', language)}
            </Link>
            <span className="text-[hsl(var(--border))]">•</span>
            <Link 
              href="/privacy" 
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors whitespace-nowrap"
            >
              {getTranslation('footer', 'privacyPolicy', language)}
            </Link>
            <span className="text-[hsl(var(--border))]">•</span>
            <Link 
              href="/refund" 
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors whitespace-nowrap"
            >
              {getTranslation('footer', 'refundPolicy', language)}
            </Link>
            <span className="text-[hsl(var(--border))]">•</span>
            <Link 
              href="/cookies" 
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors whitespace-nowrap"
            >
              {getTranslation('footer', 'cookiePolicy', language)}
            </Link>
          </div>
        </div>

        {/* Second Row: Contact + Copyright */}
        <div className="mt-2 pt-2 border-t border-[hsl(var(--border))] flex flex-wrap items-center justify-between gap-3 text-xs text-[hsl(var(--muted-foreground))]">
          <div className="flex flex-wrap items-center gap-3">
            <span>+972 52-589-9214</span>
            <span className="text-[hsl(var(--border))]">•</span>
            <span>info@moringa.com</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span>© {currentYear} Moringa. {getTranslation('footer', 'allRightsReserved', language)}</span>
            <span className="text-[hsl(var(--border))]">•</span>
            <span className="flex items-center gap-1.5">
              <span>{getTranslation('footer', 'poweredBy', language)}</span>
              <a 
                href="https://github.com/amrkal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                amrkal
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
