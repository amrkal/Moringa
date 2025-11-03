'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { getLocalizedText } from '@/lib/i18n';

export function Navigation() {
  const { language } = useLanguage();
  const { colorMode, setColorMode, isDarkMode } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isAdmin = pathname?.startsWith('/admin');
  
  // Don't show customer nav on admin pages
  if (isAdmin) return null;

  

  return (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--card))/0.8] backdrop-blur-xl border-b border-[hsl(var(--border))] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/menu" className="flex items-center group" aria-label="Moringa Home">
            <img src="/logo.jpg" alt="Moringa" className="h-8 w-auto rounded-sm" />
          </Link>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setColorMode(isDarkMode ? 'light' : 'dark')}
              className="p-2.5 hover:bg-[hsl(var(--muted))] rounded-xl transition-all"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <Link href="/orders" className={cn(
              "text-sm font-medium transition-all px-3 py-2 rounded-lg",
              pathname === '/orders' 
                ? 'text-primary bg-primary-soft' 
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
            )} aria-current={pathname === '/orders' ? 'page' : undefined}>
              {getTranslation('common', 'myOrders', language)}
            </Link>

            <Link 
              href="/cart"
              className="relative p-2.5 hover:bg-[hsl(var(--muted))] rounded-xl transition-all"
            >
              <ShoppingCart className="h-5 w-5 text-[hsl(var(--foreground))]" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu + Cart */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setColorMode(isDarkMode ? 'light' : 'dark')}
              className="p-2.5 hover:bg-[hsl(var(--muted))] rounded-xl transition-all"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <Link href="/orders" className={cn(
              "text-sm font-medium transition-all px-3 py-2 rounded-lg",
              pathname === '/orders' 
                ? 'text-primary bg-primary-soft' 
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
            )} aria-current={pathname === '/orders' ? 'page' : undefined}>
              {getTranslation('common', 'myOrders', language)}
            </Link>

            <Link 
              href="/cart"
              className="relative p-2.5 hover:bg-[hsl(var(--muted))] rounded-xl transition-all"
            >
              <ShoppingCart className="h-5 w-5 text-[hsl(var(--foreground))]" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}