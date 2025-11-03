import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Prefer admin token but fall back to customer token so both flows work
    const adminToken = localStorage.getItem('token');
    const customerToken = localStorage.getItem('customerToken');
    const token = adminToken || customerToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerUser');

      try {
        const pathname = window.location?.pathname || '';
        // If user is on an admin page, redirect to admin login
        if (pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          // For customer pages, trigger re-authentication by reloading
          // This will reset the AuthContext state
          if (typeof window !== 'undefined' && (pathname.startsWith('/checkout') || pathname.startsWith('/orders'))) {
            // Dispatch custom event to notify AuthContext to reset state
            window.dispatchEvent(new CustomEvent('auth:logout'));
          }
        }
      } catch (e) {
        console.error('Error handling 401 redirect logic', e);
      }
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Auth API
export const authApi = {
  login: (phone: string, password: string) =>
    api.post('/auth/login', { phone, password }),
  
  register: (userData: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    role?: 'CUSTOMER' | 'ADMIN';
  }) =>
    api.post('/auth/register', userData),
  
  sendOTP: (phone: string, method: 'sms' | 'whatsapp' = 'sms') =>
    api.post('/auth/verify-phone', { phone, method: method.toUpperCase() }),
  
  verifyOTP: (phone: string, otpCode: string) =>
    api.post('/auth/confirm-phone', { phone, code: otpCode }),
  
  verifyPhone: (phone: string, code: string) =>
    api.post('/auth/verify-phone', { phone, code }),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Categories API
export const categoriesApi = {
  getAll: (params?: { skip?: number; limit?: number; active_only?: boolean }) =>
    api.get('/categories/', { params }),
  
  getById: (id: string) =>
    api.get(`/categories/${id}`),
  
  getWithMealCount: (params?: { skip?: number; limit?: number; active_only?: boolean }) =>
    api.get('/categories/with-meal-count', { params }),
  
  create: (categoryData: {
    name: string;
    description?: string;
    image?: string;
    order?: number;
    is_active?: boolean;
  }) =>
    api.post('/categories', categoryData),
  
  update: (id: string, categoryData: Partial<{
    name: string;
    description: string;
    image: string;
    order: number;
    is_active: boolean;
  }>) =>
    api.put(`/categories/${id}`, categoryData),
  
  delete: (id: string) =>
    api.delete(`/categories/${id}`),
};

// Meals API
export const mealsApi = {
  getAll: (params?: { 
    skip?: number; 
    limit?: number; 
    active_only?: boolean;
    category_id?: string;
    search?: string;
  }) =>
    api.get('/meals/', { params }),
  
  getById: (id: string) =>
    api.get(`/meals/${id}`),
  
  getByCategory: (categoryId: string, params?: { skip?: number; limit?: number; active_only?: boolean }) =>
    api.get(`/meals/category/${categoryId}`, { params }),
  
  search: (query: string, params?: { skip?: number; limit?: number }) =>
    api.get('/meals/search', { params: { ...params, q: query } }),
  
  create: (mealData: {
    name: string;
    description?: string;
    price: number;
    image?: string;
    category_id: string;
    ingredients?: any[];
    preparation_time?: number;
    calories?: number;
    is_vegetarian?: boolean;
    is_vegan?: boolean;
    is_gluten_free?: boolean;
    is_spicy?: boolean;
    spice_level?: number;
    is_active?: boolean;
    is_available?: boolean;
  }) =>
    api.post('/meals', mealData),
  
  update: (id: string, mealData: Partial<{
    name: string;
    description: string;
    price: number;
    image: string;
    category_id: string;
    ingredients: any[];
    preparation_time: number;
    calories: number;
    is_vegetarian: boolean;
    is_vegan: boolean;
    is_gluten_free: boolean;
    is_spicy: boolean;
    spice_level: number;
    is_active: boolean;
    is_available: boolean;
  }>) =>
    api.put(`/meals/${id}`, mealData),
  
  delete: (id: string) =>
    api.delete(`/meals/${id}`),
};

// Ingredients API
export const ingredientsApi = {
  getAll: (params?: { skip?: number; limit?: number; active_only?: boolean }) =>
    api.get('/ingredients/', { params }),
  
  getById: (id: string) =>
    api.get(`/ingredients/${id}`),
  
  create: (ingredientData: {
    name: string;
    description?: string;
    price?: number;
    image?: string;
    is_active?: boolean;
  }) =>
    api.post('/ingredients', ingredientData),
  
  update: (id: string, ingredientData: Partial<{
    name: string;
    description: string;
    price: number;
    image: string;
    is_active: boolean;
  }>) =>
    api.put(`/ingredients/${id}`, ingredientData),
  
  delete: (id: string) =>
    api.delete(`/ingredients/${id}`),
};

// Orders API
export const ordersApi = {
  getAll: (params?: { 
    skip?: number; 
    limit?: number;
    status?: string;
    user_id?: string;
  }) =>
    api.get('/orders', { params }),
  
  getById: (id: string) =>
    api.get(`/orders/${id}`),
  
  getByUser: (userId: string, params?: { skip?: number; limit?: number }) =>
    api.get(`/orders/user/${userId}`, { params }),
  
  getByStatus: (status: string, params?: { skip?: number; limit?: number }) =>
    api.get(`/orders/status/${status}`, { params }),
  
  create: (orderData: {
    order_type: 'DELIVERY' | 'DINE_IN' | 'TAKE_AWAY';
    payment_method: 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'MPESA' | 'STRIPE';
    phone_number: string;
    delivery_address?: string;
    special_instructions?: string;
    items: Array<{
      meal_id: string;
      quantity: number;
      price: number;
      selected_ingredients?: Array<{
        ingredient_id: string;
      }>;
      special_instructions?: string;
    }>;
  }) =>
    api.post('/orders', orderData),
  
  update: (id: string, orderData: Partial<{
    status: string;
    payment_status: string;
    delivery_address: string;
    special_instructions: string;
  }>) =>
    api.put(`/orders/${id}`, orderData),
  
  getStats: () =>
    api.get('/orders/stats'),
};

// Users API
export const usersApi = {
  getAll: (params?: { skip?: number; limit?: number; role?: string }) =>
    api.get('/users', { params }),
  
  getById: (id: string) =>
    api.get(`/users/${id}`),
  
  update: (id: string, userData: Partial<{
    name: string;
    email: string;
    phone: string;
    role: string;
    is_active: boolean;
    is_verified: boolean;
  }>) =>
    api.put(`/users/${id}`, userData),
  
  delete: (id: string) =>
    api.delete(`/users/${id}`),
};

// File upload API
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;