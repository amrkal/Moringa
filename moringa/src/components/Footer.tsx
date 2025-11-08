'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { LogoImage } from '@/components/ui/optimized-image';

export function Footer() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card/80 backdrop-blur-xl border-t border-border/40 mt-auto relative">
      {/* Premium gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* First Row: Logo + Legal Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <LogoImage
              src="/logo.jpg"
              alt="Moringa"
              width={24}
              height={24}
              className="rounded-md shadow-sm"
            />
            <span className="text-muted-foreground hidden sm:inline">
              {getTranslation('footer', 'tagline', language)}
            </span>
          </div>
          
          {/* Legal Links - Horizontal */}
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/terms" 
              className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {getTranslation('footer', 'termsConditions', language)}
            </Link>
            <span className="text-border">•</span>
            <Link 
              href="/privacy" 
              className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {getTranslation('footer', 'privacyPolicy', language)}
            </Link>
            <span className="text-border">•</span>
            <Link 
              href="/refund" 
              className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {getTranslation('footer', 'refundPolicy', language)}
            </Link>
            <span className="text-border">•</span>
            <Link 
              href="/cookies" 
              className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {getTranslation('footer', 'cookiePolicy', language)}
            </Link>
          </div>
        </div>

        {/* Second Row: Contact + Copyright */}
        <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span>+972 52-589-9214</span>
            <span className="text-border">•</span>
            <span>info@moringa.com</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span>© {currentYear} Moringa. {getTranslation('footer', 'allRightsReserved', language)}</span>
            <span className="text-border">•</span>
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
