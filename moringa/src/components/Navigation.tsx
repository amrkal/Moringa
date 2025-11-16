'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Sun, Moon, Menu, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useAccessibility } from '@/contexts/AccessibilityContext';
// Removed unused getLocalizedText import after redesign
import { LogoImage } from '@/components/ui/optimized-image';

export function Navigation() {
  const { language } = useLanguage();
  const { setColorMode, isDarkMode } = useAccessibility();
  // Mobile drawer state removed in lean header redesign
  const [isOpen] = useState(false);
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
    <>
      {/* Top Navigation Bar */}
      <nav 
        id="app-top-nav"
        className="fixed top-0 left-0 right-0 z-50 bg-card/70 backdrop-blur-2xl border-b border-border/40 shadow-lg"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Premium gradient accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo - Enhanced */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group" aria-label="Moringa Home">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-20 rounded-lg sm:rounded-xl blur-xl group-hover:opacity-30 transition-opacity"></div>
                <LogoImage
                  src="/logo.jpg"
                  alt="Moringa"
                  width={40}
                  height={40}
                  className="rounded-lg sm:rounded-xl shadow-md group-hover:scale-105 transition-transform relative z-10 w-10 h-10 sm:w-12 sm:h-12"
                />
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden xs:block">
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
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                  pathname === '/menu' 
                    ? 'text-primary bg-primary/10 shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {getTranslation('common', 'menu', language)}
              </Link>

              {/* Cart Button */}
              <Link 
                href="/cart"
                role="menuitem"
                aria-current={pathname === '/cart' ? 'page' : undefined}
                aria-label={`Shopping cart with ${mounted && itemCount > 0 ? itemCount : 'no'} items`}
                className={cn(
                  "relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                  pathname === '/cart' 
                    ? 'text-primary bg-primary/10 shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {getTranslation('common', 'cart', language)}
                {mounted && itemCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 bg-destructive text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg ring-2 ring-background"
                    aria-label={`${itemCount} items in cart`}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Orders Link */}
              <Link 
                href="/orders" 
                role="menuitem"
                aria-current={pathname === '/orders' ? 'page' : undefined}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
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
              
              {/* Dark/Light Mode Toggle */}
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
            </div>

            {/* Mobile - Only Language and Theme */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => setColorMode(isDarkMode ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-muted/50 transition-all"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? 
                  <Sun className="h-4 w-4 text-amber-500" /> : 
                  <Moon className="h-4 w-4 text-primary" />
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-2xl border-t border-border/40 shadow-2xl pb-safe"
        role="navigation"
        aria-label="Mobile bottom navigation"
      >
        {/* Premium gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          {/* Menu */}
          <Link
            href="/menu"
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2.5 px-3 rounded-xl transition-all duration-200 active:scale-95",
              pathname === '/menu' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
            aria-label="Menu"
            aria-current={pathname === '/menu' ? 'page' : undefined}
          >
            <Menu className="h-6 w-6" strokeWidth={2.5} />
            <span className="text-[11px] font-semibold">{getTranslation('common', 'menu', language)}</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 py-2.5 px-3 rounded-xl transition-all duration-200 active:scale-95",
              pathname === '/cart' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
            aria-label={`Cart with ${mounted && itemCount > 0 ? itemCount : 'no'} items`}
            aria-current={pathname === '/cart' ? 'page' : undefined}
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" strokeWidth={2.5} />
              {mounted && itemCount > 0 && (
                <span 
                  className="absolute -top-2 -right-2 bg-destructive text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg ring-2 ring-card"
                  aria-label={`${itemCount} items`}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold">{getTranslation('common', 'cart', language)}</span>
          </Link>

          {/* Orders */}
          <Link
            href="/orders"
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2.5 px-3 rounded-xl transition-all duration-200 active:scale-95",
              pathname === '/orders' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
            aria-label="My Orders"
            aria-current={pathname === '/orders' ? 'page' : undefined}
          >
            <Receipt className="h-6 w-6" strokeWidth={2.5} />
            <span className="text-[11px] font-semibold">{getTranslation('common', 'myOrders', language)}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}