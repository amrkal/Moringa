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
import { LogoImage } from '@/components/ui/optimized-image';

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
    <nav 
      className="fixed top-0 left-0 right-0 z-50 bg-card/70 backdrop-blur-2xl border-b border-border/40 shadow-lg"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Premium gradient accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Enhanced */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Moringa Home">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-opacity"></div>
              <LogoImage
                src="/logo.jpg"
                alt="Moringa"
                width={48}
                height={48}
                className="rounded-xl shadow-md group-hover:scale-105 transition-transform relative z-10"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">
              Moringa
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2" role="menubar" aria-label="Desktop menu">
            {/* Menu Link */}
            <Link 
              href="/menu" 
              role="menuitem"
              aria-current={pathname === '/menu' ? 'page' : undefined}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                pathname === '/menu' 
                  ? 'text-primary bg-primary/10 shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {getTranslation('common', 'menu', language)}
            </Link>

            {/* Orders Link */}
            <Link 
              href="/orders" 
              role="menuitem"
              aria-current={pathname === '/orders' ? 'page' : undefined}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                pathname === '/orders' 
                  ? 'text-primary bg-primary/10 shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {getTranslation('common', 'myOrders', language)}
            </Link>

            {/* Divider */}
            <div className="h-8 w-px bg-border mx-2" aria-hidden="true"></div>

            {/* Language Switcher */}
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>
            
            {/* Dark/Light Mode Toggle - Enhanced */}
            <button
              onClick={() => setColorMode(isDarkMode ? 'light' : 'dark')}
              className="relative p-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200 group"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isDarkMode ? 
                <Sun className="h-5 w-5 text-amber-500 relative z-10" /> : 
                <Moon className="h-5 w-5 text-primary relative z-10" />
              }
            </button>
            
            {/* Cart Button - Premium */}
            <Link 
              href="/cart"
              aria-label={`Shopping cart with ${mounted && itemCount > 0 ? itemCount : 'no'} items`}
              className="relative ml-2 bg-gradient-to-br from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 hover:shadow-lg hover:scale-105 transition-all duration-200 rounded-xl p-3 group"
            >
              <ShoppingCart className="h-5 w-5 text-white" strokeWidth={2.5} aria-hidden="true" />
              {mounted && itemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-destructive text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse ring-2 ring-background"
                  aria-label={`${itemCount} items in cart`}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Right Side */}
          <div className="md:hidden flex items-center gap-2" role="menubar" aria-label="Mobile menu">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setColorMode(isDarkMode ? 'light' : 'dark')}
              className="p-2.5 rounded-xl hover:bg-muted/50 transition-all"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? 
                <Sun className="h-5 w-5 text-amber-500" /> : 
                <Moon className="h-5 w-5 text-primary" />
              }
            </button>
            
            {/* Orders Link */}
            <Link 
              href="/orders" 
              role="menuitem"
              aria-current={pathname === '/orders' ? 'page' : undefined}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-semibold transition-all",
                pathname === '/orders' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              Orders
            </Link>

            {/* Cart Button - Mobile */}
            <Link 
              href="/cart"
              aria-label={`Shopping cart with ${mounted && itemCount > 0 ? itemCount : 'no'} items`}
              className="relative bg-gradient-to-br from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 rounded-xl p-2.5"
            >
              <ShoppingCart className="h-5 w-5 text-white" strokeWidth={2.5} aria-hidden="true" />
              {mounted && itemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-destructive text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                  aria-label={`${itemCount} items in cart`}
                >
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