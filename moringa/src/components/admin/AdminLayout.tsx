'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LogoImage } from '@/components/ui/optimized-image';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Palette } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationListener } from '@/components/admin/NotificationListener';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Dashboard' }: AdminLayoutProps) {
  const { language } = useLanguage();
  const { isDarkMode, setColorMode, theme, setTheme } = useAccessibility();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  const navigation = [
    { name: getTranslation('admin', 'dashboard', language), href: '/admin/dashboard', icon: LayoutDashboard },
    { name: getTranslation('admin', 'categories', language), href: '/admin/categories', icon: Package },
    { name: getTranslation('admin', 'meals', language), href: '/admin/meals', icon: ShoppingBag },
    { name: getTranslation('admin', 'ingredients', language), href: '/admin/ingredients', icon: Package },
    { name: getTranslation('admin', 'orders', language), href: '/admin/orders', icon: ShoppingBag },
    { name: getTranslation('admin', 'users', language), href: '/admin/users', icon: Users },
    { name: getTranslation('admin', 'settings', language), href: '/admin/settings', icon: Settings },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-sm text-[hsl(var(--muted-foreground))]">{getTranslation('admin', 'loading', language)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]" dir="ltr">
      {/* Notification Listener - only active on admin pages */}
      <NotificationListener />
      
      {/* Main content */}
      <div className="flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[hsl(var(--card))]/70 backdrop-blur-2xl border-b border-[hsl(var(--border))]/40 shadow-sm relative">
          {/* Gradient accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-all"
                aria-label="Toggle navigation"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <Link href="/admin" className="flex items-center gap-3" aria-label="Moringa Admin Home">
                <LogoImage
                  src="/logo.jpg"
                  alt="Moringa"
                  width={32}
                  height={32}
                  className="rounded-sm"
                />
              </Link>
              
              {/* Navigation Links - Desktop */}
              <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Admin navigation">
                {navigation.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        isActive 
                          ? 'text-primary bg-primary/10' 
                          : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Dark/Light toggle */}
              <button
                onClick={() => setColorMode(isDarkMode ? 'light' : 'dark')}
                className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-all"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition-all"
                  aria-label="Change color theme"
                  title="Color Theme"
                >
                  <Palette className="h-5 w-5" />
                </button>

                {showThemeMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-[hsl(var(--card))] rounded-xl shadow-lg border border-[hsl(var(--border))] p-2 z-50">
                      <div className="space-y-1">
                        {[
                          { name: 'moringa', color: '#f97316' },
                          { name: 'emerald', color: '#10b981' },
                          { name: 'rose', color: '#f43f5e' },
                          { name: 'violet', color: '#8b5cf6' },
                          { name: 'sky', color: '#0ea5e9' },
                          { name: 'amber', color: '#f59e0b' },
                        ].map(t => (
                          <button
                            key={t.name}
                            onClick={() => { setTheme(t.name as any); setShowThemeMenu(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                              theme === (t.name as any) ? 'bg-primary-soft text-primary font-medium' : 'hover:bg-[hsl(var(--muted))]'
                            }`}
                          >
                            <div className="w-4 h-4 rounded-full border-2 border-[hsl(var(--background))] shadow-sm" style={{ backgroundColor: t.color }} />
                            <span className="capitalize">{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <LanguageSwitcher />
              
              <NotificationBell />
              
              <div className="flex items-center gap-2 pl-2 ml-2 border-l border-[hsl(var(--border))]">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">{user?.name}</p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    {getTranslation('admin', 'signOut', language)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed top-16 left-0 right-0 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] shadow-lg z-50 md:hidden">
              <nav className="p-4 space-y-1" role="navigation" aria-label="Mobile navigation">
                {navigation.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                        isActive 
                          ? 'text-primary bg-primary/10' 
                          : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </>
        )}

        {/* Page content */}
        <main className="flex-1 px-6 pb-6 pt-4 text-[hsl(var(--foreground))]">
          {children}
        </main>
      </div>
    </div>
  );
}