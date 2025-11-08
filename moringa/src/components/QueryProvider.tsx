'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

/**
 * React Query Provider
 * 
 * Wraps the application with TanStack Query for:
 * - API response caching
 * - Automatic background refetching
 * - Optimistic updates
 * - Request deduplication
 * - Stale-while-revalidate pattern
 * 
 * IMPORTANT: Creates a new QueryClient instance per component mount
 * to avoid sharing state between server and client in Next.js App Router
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // Create a new QueryClient instance for each component mount
  // This prevents sharing cache between server and client
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            refetchOnReconnect: true,
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
        />
      )}
    </QueryClientProvider>
  );
}
