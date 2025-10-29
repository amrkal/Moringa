'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export function Navigation() {
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/menu" className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Moringa</h1>
          </Link>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-6">
            <LanguageSwitcher />
            
            <Link href="/orders" className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === '/orders' ? 'text-primary' : 'text-gray-600'
            )}>
              My Orders
            </Link>

            <Link 
              href="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu + Cart */}
          <div className="md:hidden flex items-center gap-3">
            <Link 
              href="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-16 right-0 bottom-0 w-64 bg-white shadow-2xl md:hidden">
            <div className="p-6 space-y-4">
              <LanguageSwitcher />
              
              <Link
                href="/orders"
                className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === '/orders' ? 'bg-primary-soft text-primary' : 'text-gray-700 hover:bg-gray-100'
                )}
                onClick={() => setIsOpen(false)}
              >
                My Orders
              </Link>

              <Link
                href="/about"
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About Us
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}