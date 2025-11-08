import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * 
 * Configured with optimized defaults for the restaurant application:
 * - Stale-while-revalidate strategy for better UX
 * - Automatic retries with exponential backoff
 * - Cache persistence during session
 * - Refetch on window focus for fresh data
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      
      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
      
      // Refetch on reconnect to get latest data
      refetchOnReconnect: true,
      
      // Show stale data while fetching new data (stale-while-revalidate)
      placeholderData: (previousData: any) => previousData,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,
    },
  },
});

/**
 * Query Keys Factory
 * 
 * Centralized query key management for type safety and consistency.
 * Keys are structured hierarchically for efficient cache invalidation.
 */
export const queryKeys = {
  // Menu-related queries
  menu: {
    all: ['menu'] as const,
    meals: () => [...queryKeys.menu.all, 'meals'] as const,
    meal: (id: string) => [...queryKeys.menu.meals(), id] as const,
    categories: () => [...queryKeys.menu.all, 'categories'] as const,
    category: (id: string) => [...queryKeys.menu.categories(), id] as const,
  },
  
  // Ingredients
  ingredients: {
    all: ['ingredients'] as const,
    list: () => [...queryKeys.ingredients.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.ingredients.all, id] as const,
  },
  
  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.orders.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.orders.all, id] as const,
    customer: (customerId: string) => 
      [...queryKeys.orders.all, 'customer', customerId] as const,
  },
  
  // Reviews
  reviews: {
    all: ['reviews'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.reviews.all, 'list', filters] as const,
    meal: (mealId: string) => [...queryKeys.reviews.all, 'meal', mealId] as const,
  },
  
  // Users (Admin)
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.users.all, id] as const,
  },
  
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
} as const;

/**
 * Cache Invalidation Helpers
 * 
 * Common patterns for invalidating related queries after mutations.
 */
export const invalidateQueries = {
  // Invalidate all menu data (after creating/updating/deleting meals or categories)
  menu: () => queryClient.invalidateQueries({ queryKey: queryKeys.menu.all }),
  
  // Invalidate specific meal
  meal: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.menu.meal(id) }),
  
  // Invalidate all ingredients
  ingredients: () => queryClient.invalidateQueries({ queryKey: queryKeys.ingredients.all }),
  
  // Invalidate all orders
  orders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  
  // Invalidate specific order
  order: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) }),
  
  // Invalidate customer orders
  customerOrders: (customerId: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.customer(customerId) }),
  
  // Invalidate all reviews
  reviews: () => queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all }),
  
  // Invalidate meal reviews
  mealReviews: (mealId: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.meal(mealId) }),
};

/**
 * Prefetch Helpers
 * 
 * Prefetch data before it's needed for instant loading.
 */
export const prefetchQueries = {
  // Prefetch menu data on app load
  menu: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.menu.meals(),
      queryFn: async () => {
        const { default: api } = await import('@/lib/api');
        const response = await api.get('/meals');
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
    
    await queryClient.prefetchQuery({
      queryKey: queryKeys.menu.categories(),
      queryFn: async () => {
        const { default: api } = await import('@/lib/api');
        const response = await api.get('/categories');
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  },
};
