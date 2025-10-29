// Core entity types
export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  meals: Meal[];
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isActive: boolean;
  categoryId: string;
  category: Category;
  ingredients: MealIngredient[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  price: number; // Additional price for this ingredient
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  mealIngredients: MealIngredient[];
}

export interface MealIngredient {
  id: string;
  mealId: string;
  ingredientId: string;
  meal: Meal;
  ingredient: Ingredient;
  isOptional: boolean;
  isDefault: boolean; // If this ingredient is included by default
}

// User and Authentication types
export interface User {
  id: string;
  email?: string;
  phone: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  orders: Order[];
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

// Cart types
export interface CartItem {
  id: string;
  mealId: string;
  meal: Meal;
  quantity: number;
  selectedIngredients: string[]; // Array of ingredient IDs
  specialInstructions?: string;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  user: User;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress?: string;
  phoneNumber: string;
  specialInstructions?: string;
  estimatedDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  mealId: string;
  meal: Meal;
  quantity: number;
  price: number;
  selectedIngredients: OrderItemIngredient[];
  specialInstructions?: string;
}

export interface OrderItemIngredient {
  id: string;
  orderItemId: string;
  ingredientId: string;
  ingredient: Ingredient;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum OrderType {
  DELIVERY = 'DELIVERY',
  DINE_IN = 'DINE_IN',
  TAKE_AWAY = 'TAKE_AWAY'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MOBILE_MONEY = 'MOBILE_MONEY'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// UI and Form types
export interface CategoryFormData {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  order: number;
}

export interface MealFormData {
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  isActive: boolean;
  ingredients: {
    ingredientId: string;
    isOptional: boolean;
    isDefault: boolean;
  }[];
}

export interface IngredientFormData {
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
}

export interface OrderFormData {
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  deliveryAddress?: string;
  phoneNumber: string;
  specialInstructions?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Verification types
export interface VerificationRequest {
  phone: string;
  method: 'SMS' | 'WHATSAPP';
}

export interface VerificationConfirm {
  phone: string;
  code: string;
}

// Admin Dashboard types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalMeals: number;
  todayOrders: number;
  todayRevenue: number;
  recentOrders: Order[];
  topMeals: {
    meal: Meal;
    totalOrders: number;
    totalRevenue: number;
  }[];
}

// Search and Filter types
export interface SearchFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  search?: string;
  isActive?: boolean;
}

export interface OrderFilters {
  status?: OrderStatus;
  orderType?: OrderType;
  paymentStatus?: PaymentStatus;
  dateRange?: {
    from: Date;
    to: Date;
  };
  userId?: string;
}