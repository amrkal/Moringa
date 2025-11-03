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
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Palette } from 'lucide-react';

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
    { name: getTranslation('admin', 'dashboard', language), href: '/admin', icon: LayoutDashboard },
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
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-[hsl(var(--foreground))/0.5]" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-[hsl(var(--card))] shadow-xl border-r border-[hsl(var(--border))]" dir="ltr">
            <div className="flex h-16 items-center justify-between px-6 border-b border-[hsl(var(--border))]">
              <Link href="/admin" className="flex items-center gap-3" aria-label="Moringa Admin Home" onClick={() => setSidebarOpen(false)}>
                <img src="/logo.jpg" alt="Moringa" className="h-8 w-auto rounded-sm" />
                <span className="sr-only">{getTranslation('admin', 'adminPanel', language)}</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]" aria-label="Close sidebar">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav id="admin-sidebar" className="flex-1 px-4 py-6 space-y-2" role="navigation" aria-label="Admin sidebar">
              {navigation.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-[hsl(var(--muted))] ${
                      isActive ? 'text-primary bg-primary-soft' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col" dir="ltr">
        <div className="flex flex-col min-h-0 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))]">
          <div className="flex h-16 items-center px-6 border-b border-[hsl(var(--border))]">
            <Link href="/admin" className="flex items-center gap-3" aria-label="Moringa Admin Home">
              <img src="/logo.jpg" alt="Moringa" className="h-8 w-auto rounded-sm" />
              <span className="sr-only">{getTranslation('admin', 'adminPanel', language)}</span>
            </Link>
          </div>
          <nav id="admin-sidebar" className="flex-1 px-4 py-6 space-y-2" role="navigation" aria-label="Admin sidebar">
            {navigation.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-[hsl(var(--muted))] ${
                    isActive ? 'text-primary bg-primary-soft' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 border-t border-[hsl(var(--border))] p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
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

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[hsl(var(--ring))]"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                aria-expanded={sidebarOpen}
                aria-controls="admin-sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-[hsl(var(--foreground))]">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark/Light toggle */}
              <button
                onClick={() => setColorMode(isDarkMode ? 'light' : 'dark')}
                className="p-2.5 hover:bg-[hsl(var(--muted))] rounded-xl transition-all"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-2.5 hover:bg-[hsl(var(--muted))] rounded-xl transition-all"
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
              <button className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <span className="ml-2 text-sm font-medium text-[hsl(var(--foreground))] hidden sm:block">
                  {user?.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 text-[hsl(var(--foreground))]">
          {children}
        </main>
      </div>
    </div>
  );
}