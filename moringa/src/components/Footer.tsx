'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { LogoImage } from '@/components/ui/optimized-image';

export function Footer() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
  <footer className="bg-card/80 backdrop-blur-xl border-t border-border/40 mt-auto relative pb-[env(safe-area-inset-bottom)]">
      {/* Premium gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* First Row: Logo + Legal Links */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LogoImage
              src="/logo.jpg"
              alt="Moringa"
              width={24}
              height={24}
              className="rounded-md shadow-sm shrink-0"
            />
            <span className="text-muted-foreground text-[11px] sm:text-xs shrink-0">
              {getTranslation('footer', 'tagline', language)}
            </span>
          </div>
          
          {/* Legal Links - Single line with dots */}
          <div className="overflow-x-auto scrollbar-hide min-w-0">
            <div className="text-[10px] sm:text-xs whitespace-nowrap">
              <Link 
                href="/terms" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {getTranslation('footer', 'termsConditions', language)}
              </Link>
              {' • '}
              <Link 
                href="/privacy" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {getTranslation('footer', 'privacyPolicy', language)}
              </Link>
              {' • '}
              <Link 
                href="/refund" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {getTranslation('footer', 'refundPolicy', language)}
              </Link>
              {' • '}
              <Link 
                href="/cookies" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {getTranslation('footer', 'cookiePolicy', language)}
              </Link>
            </div>
          </div>
        </div>

        {/* Second Row: Contact + Copyright */}
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] sm:text-xs text-muted-foreground">
          {/* Contact - Single line */}
          <div className="overflow-x-auto scrollbar-hide min-w-0">
            <div className="whitespace-nowrap">
              <span>+972 52-589-9214</span>
              {' • '}
              <span>info@moringa.com</span>
            </div>
          </div>
          
          {/* Copyright - Single line */}
          <div className="overflow-x-auto scrollbar-hide min-w-0">
            <div className="whitespace-nowrap">
              <span>© {currentYear} Moringa. {getTranslation('footer', 'allRightsReserved', language)}</span>
              {' • '}
              <span>{getTranslation('footer', 'poweredBy', language)} <a 
                href="https://github.com/amrkal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >amrkal</a></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
