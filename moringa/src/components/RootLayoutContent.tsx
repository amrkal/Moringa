'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function RootLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className={`flex-1 bg-background text-foreground ${isAdmin ? '' : 'pt-16'}`}>
          {children}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
