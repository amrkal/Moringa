import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys, invalidateQueries } from '@/lib/query-client';
import toast from 'react-hot-toast';
import type { Meal, Category, Ingredient, Order } from '@/types';

/**
 * Custom React Query Hooks
 * 
 * These hooks provide a clean API for data fetching with:
 * - Automatic caching and background refetching
 * - Loading and error states
 * - Optimistic updates
 * - Type safety
 */

// Extended Meal type with backward compatibility snake_case properties
export type MealWithLegacyProps = Meal & {
  _id?: string;
  image_url?: string;
  is_popular?: boolean;
  is_spicy?: boolean;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  created_at?: string;
};

// Helper function to extract array from various response formats
const extractArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

// Helper function to normalize Meal from API response
// Returns both camelCase and snake_case properties for backward compatibility
const normalizeMeal = (m: any): MealWithLegacyProps => ({
  id: m.id || m._id || m?._id?.$oid || '',
  _id: m._id || m.id || m?._id?.$oid || '', // Backward compat
  name: m.name && typeof m.name === 'object'
    ? { en: m.name?.en ?? m.name_en ?? m.name ?? '', ar: m.name?.ar ?? m.name_ar ?? '', he: m.name?.he ?? m.name_he ?? '' }
    : { en: m.name_en ?? m.name ?? '', ar: m.name_ar ?? '', he: m.name_he ?? '' },
  description: m.description && typeof m.description === 'object'
    ? { en: m.description?.en ?? m.description_en ?? m.description ?? '', ar: m.description?.ar ?? m.description_ar ?? '', he: m.description?.he ?? m.description_he ?? '' }
    : { en: m.description_en ?? m.description ?? '', ar: m.description_ar ?? '', he: m.description_he ?? '' },
  price: Number(m.price ?? m.base_price ?? 0),
  categoryId: m.categoryId || m.category_id || m.category?.id || m.category || '',
  image: m.image || m.image_url || m.imageUrl || '',
  image_url: m.image_url || m.image || m.imageUrl || '', // Backward compat
  isActive: m.isActive ?? m.is_available ?? m.is_active ?? true,
  is_popular: m.is_popular ?? m.popular ?? false, // Backward compat
  is_spicy: m.is_spicy ?? m.spicy ?? false, // Backward compat
  is_vegetarian: m.is_vegetarian ?? m.vegetarian ?? false, // Backward compat
  is_vegan: m.is_vegan ?? m.vegan ?? false, // Backward compat
  is_gluten_free: m.is_gluten_free ?? m.gluten_free ?? false, // Backward compat
  category: m.category || {} as Category,
  ingredients: m.ingredients || [],
  createdAt: m.createdAt || m.created_at || new Date(),
  created_at: m.created_at || m.createdAt?.toISOString() || new Date().toISOString(), // Backward compat
  updatedAt: m.updatedAt || m.updated_at || new Date(),
});

// Helper function to normalize Category from API response
const normalizeCategory = (c: any): Category => ({
  id: c.id || c._id || c?._id?.$oid || '',
  name: c.name && typeof c.name === 'object'
    ? { en: c.name?.en ?? c.name_en ?? c.name ?? '', ar: c.name?.ar ?? c.name_ar ?? '', he: c.name?.he ?? c.name_he ?? '' }
    : { en: c.name_en ?? c.name ?? '', ar: c.name_ar ?? '', he: c.name_he ?? '' },
  description: c.description && typeof c.description === 'object'
    ? { en: c.description?.en ?? c.description_en ?? c.description ?? '', ar: c.description?.ar ?? c.description_ar ?? '', he: c.description?.he ?? c.description_he ?? '' }
    : { en: c.description_en ?? c.description ?? '', ar: c.description_ar ?? '', he: c.description_he ?? '' },
  image: c.image || c.image_url || c.imageUrl || '',
  isActive: c.isActive ?? c.is_active ?? true,
  order: c.order ?? 0,
  createdAt: c.createdAt || c.created_at || new Date(),
  updatedAt: c.updatedAt || c.updated_at || new Date(),
  meals: c.meals || [],
});

// ============================================================================
// MENU & MEALS
// ============================================================================

/**
 * Fetch all meals with caching
 */
export function useMeals(active_only = false) {
  return useQuery<MealWithLegacyProps[]>({
    queryKey: [...queryKeys.menu.meals(), { active_only }],
    queryFn: async () => {
      const response = await api.get('/meals/', { params: { active_only } });
      const rawData = extractArray(response.data);
      const normalized = rawData.map(normalizeMeal).filter((m: MealWithLegacyProps) => !active_only || m.isActive);
      return normalized;
    },
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });
}

/**
 * Fetch single meal by ID
 */
export function useMeal(id: string | null) {
  return useQuery<MealWithLegacyProps>({
    queryKey: queryKeys.menu.meal(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Meal ID is required');
      const response = await api.get(`/meals/${id}/`);
      return normalizeMeal(response.data);
    },
    enabled: !!id, // Only run if ID is provided
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch all categories with caching
 */
export function useCategories(active_only = false) {
  return useQuery<Category[]>({
    queryKey: [...queryKeys.menu.categories(), { active_only }],
    queryFn: async () => {
      const response = await api.get('/categories/', { params: { active_only } });
      const rawData = extractArray(response.data);
      const normalized = rawData.map(normalizeCategory).filter((c: Category) => !active_only || c.isActive);
      return normalized;
    },
    staleTime: 10 * 60 * 1000, // Consider fresh for 10 minutes
  });
}

/**
 * Create/Update/Delete Meal Mutations
 */
export function useMealMutations() {
  const queryClient = useQueryClient();

  const createMeal = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/meals', data);
      return response.data;
    },
    onSuccess: () => {
      invalidateQueries.menu();
      toast.success('Meal created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create meal');
    },
  });

  const updateMeal = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/meals/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      invalidateQueries.meal(variables.id);
      invalidateQueries.menu();
      toast.success('Meal updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update meal');
    },
  });

  const deleteMeal = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/meals/${id}`);
    },
    onSuccess: () => {
      invalidateQueries.menu();
      toast.success('Meal deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete meal');
    },
  });

  return { createMeal, updateMeal, deleteMeal };
}

// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * Create/Update/Delete Category Mutations
 */
export function useCategoryMutations() {
  const createCategory = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/categories', data);
      return response.data;
    },
    onSuccess: () => {
      invalidateQueries.menu();
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create category');
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/categories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      invalidateQueries.menu();
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update category');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      invalidateQueries.menu();
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete category');
    },
  });

  return { createCategory, updateCategory, deleteCategory };
}

// ============================================================================
// INGREDIENTS
// ============================================================================

/**
 * Fetch all ingredients with caching
 */
export function useIngredients() {
  return useQuery({
    queryKey: queryKeys.ingredients.list(),
    queryFn: async () => {
      const response = await api.get('/ingredients');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Ingredients change less frequently
  });
}

/**
 * Create/Update/Delete Ingredient Mutations
 */
export function useIngredientMutations() {
  const createIngredient = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/ingredients', data);
      return response.data;
    },
    onSuccess: () => {
      invalidateQueries.ingredients();
      toast.success('Ingredient created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create ingredient');
    },
  });

  const updateIngredient = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/ingredients/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      invalidateQueries.ingredients();
      toast.success('Ingredient updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update ingredient');
    },
  });

  const deleteIngredient = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ingredients/${id}`);
    },
    onSuccess: () => {
      invalidateQueries.ingredients();
      toast.success('Ingredient deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete ingredient');
    },
  });

  return { createIngredient, updateIngredient, deleteIngredient };
}

// ============================================================================
// ORDERS
// ============================================================================

/**
 * Fetch all orders with optional filters
 */
export function useOrders(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: async () => {
      const response = await api.get('/orders', { params: filters });
      return response.data;
    },
    staleTime: 30 * 1000, // Orders are more dynamic, refresh more frequently
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
}

/**
 * Fetch single order by ID
 */
export function useOrder(id: string | null) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');
      const response = await api.get(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
}

/**
 * Update order status mutation
 */
export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.put(`/orders/${id}`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      invalidateQueries.order(variables.id);
      invalidateQueries.orders();
      toast.success('Order status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update order');
    },
  });
}

// ============================================================================
// REVIEWS
// ============================================================================

/**
 * Fetch reviews for a specific meal
 */
export function useMealReviews(mealId: string | null) {
  return useQuery({
    queryKey: queryKeys.reviews.meal(mealId || ''),
    queryFn: async () => {
      if (!mealId) throw new Error('Meal ID is required');
      const response = await api.get(`/reviews/meal/${mealId}`);
      return response.data;
    },
    enabled: !!mealId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Create review mutation
 */
export function useCreateReview() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/reviews', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (variables.meal_id) {
        invalidateQueries.mealReviews(variables.meal_id);
      }
      invalidateQueries.reviews();
      toast.success('Review submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    },
  });
}
