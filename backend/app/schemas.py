from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PREPARING = "PREPARING"
    READY = "READY"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class OrderType(str, Enum):
    DELIVERY = "DELIVERY"
    DINE_IN = "DINE_IN"
    TAKE_AWAY = "TAKE_AWAY"

class PaymentMethod(str, Enum):
    CASH = "CASH"
    CARD = "CARD"
    MOBILE_MONEY = "MOBILE_MONEY"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

# Base schemas
class CategoryBase(BaseModel):
    name: str
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    name_he: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    description_he: Optional[str] = None
    image: Optional[str] = None
    is_active: bool = True
    order: int = 0

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    name_he: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    description_he: Optional[str] = None
    image: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

class Category(CategoryBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CategoryWithMealCount(Category):
    meal_count: int = 0

# Ingredient schemas
class IngredientBase(BaseModel):
    name: str
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    name_he: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    description_he: Optional[str] = None
    price: float = 0.0
    is_active: bool = True

class IngredientCreate(IngredientBase):
    pass

class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    name_he: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    description_he: Optional[str] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None

class Ingredient(IngredientBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Meal Ingredient schemas
class MealIngredientBase(BaseModel):
    ingredient_id: str
    is_optional: bool = False
    is_default: bool = False

class MealIngredientCreate(MealIngredientBase):
    pass

class MealIngredient(MealIngredientBase):
    id: str
    meal_id: str
    ingredient: Ingredient
    
    class Config:
        from_attributes = True

# Meal schemas
class MealBase(BaseModel):
    name: str
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    name_he: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    description_he: Optional[str] = None
    price: float
    image: Optional[str] = None
    is_active: bool = True
    category_id: str

class MealCreate(MealBase):
    ingredients: List[MealIngredientCreate] = []

class MealUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    name_he: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    description_he: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    is_active: Optional[bool] = None
    category_id: Optional[str] = None
    ingredients: Optional[List[MealIngredientCreate]] = None

class Meal(MealBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    ingredients: List[MealIngredient] = []
    
    class Config:
        from_attributes = True

class MealWithCategory(Meal):
    category: Category

# User schemas
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    phone: str
    name: str
    role: UserRole = UserRole.CUSTOMER

class UserCreate(UserBase):
    password: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    is_verified: Optional[bool] = None

class User(UserBase):
    id: str
    is_verified: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Order Item Ingredient schemas
class OrderItemIngredientBase(BaseModel):
    ingredient_id: str

class OrderItemIngredientCreate(OrderItemIngredientBase):
    pass

class OrderItemIngredient(OrderItemIngredientBase):
    id: str
    order_item_id: str
    ingredient: Ingredient
    
    class Config:
        from_attributes = True

# Order Item schemas
class OrderItemBase(BaseModel):
    meal_id: str
    quantity: int
    price: float
    special_instructions: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    selected_ingredients: List[OrderItemIngredientCreate] = []

class OrderItem(OrderItemBase):
    id: str
    order_id: str
    meal: Meal
    selected_ingredients: List[OrderItemIngredient] = []
    
    class Config:
        from_attributes = True

# Order schemas
class OrderBase(BaseModel):
    order_type: OrderType
    payment_method: PaymentMethod
    delivery_address: Optional[str] = None
    phone_number: str
    special_instructions: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    estimated_delivery_time: Optional[datetime] = None

class Order(OrderBase):
    id: str
    user_id: str
    total_amount: float
    status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    estimated_delivery_time: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OrderItem] = []
    
    class Config:
        from_attributes = True

class OrderWithUser(Order):
    user: User

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[User] = None
    
    class Config:
        from_attributes = True

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    phone: str
    password: str

class PhoneVerification(BaseModel):
    phone: str
    method: str = "SMS"  # SMS or WHATSAPP

class PhoneVerificationConfirm(BaseModel):
    phone: str
    code: str

# Dashboard schemas
class DashboardStats(BaseModel):
    total_orders: int
    total_revenue: float
    total_customers: int
    total_meals: int
    today_orders: int
    today_revenue: float

# Response schemas
class APIResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    data: Optional[dict] = None

class PaginatedResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int
    pages: int

# Restaurant Settings
class RestaurantSettingsBase(BaseModel):
    restaurant_name: str
    restaurant_name_en: Optional[str] = None
    restaurant_name_ar: Optional[str] = None
    restaurant_name_he: Optional[str] = None
    restaurant_description: str
    restaurant_description_en: Optional[str] = None
    restaurant_description_ar: Optional[str] = None
    restaurant_description_he: Optional[str] = None
    restaurant_phone: str
    restaurant_email: str
    restaurant_address: str
    restaurant_address_en: Optional[str] = None
    restaurant_address_ar: Optional[str] = None
    restaurant_address_he: Optional[str] = None
    opening_time: str
    closing_time: str
    delivery_fee: float
    minimum_order_amount: float
    delivery_radius_km: int
    estimated_delivery_time: int
    tax_rate: float
    currency: str
    accept_cash: bool
    accept_card: bool
    accept_mobile_money: bool
    is_accepting_orders: bool
    # Theme
    theme_primary: Optional[str] = None
    theme_primary_foreground: Optional[str] = None
    theme_background: Optional[str] = None
    theme_foreground: Optional[str] = None
    theme_accent: Optional[str] = None
    theme_accent_foreground: Optional[str] = None
    theme_radius: Optional[str] = None

class RestaurantSettingsUpdate(BaseModel):
    restaurant_name: Optional[str] = None
    restaurant_name_en: Optional[str] = None
    restaurant_name_ar: Optional[str] = None
    restaurant_name_he: Optional[str] = None
    restaurant_description: Optional[str] = None
    restaurant_description_en: Optional[str] = None
    restaurant_description_ar: Optional[str] = None
    restaurant_description_he: Optional[str] = None
    restaurant_phone: Optional[str] = None
    restaurant_email: Optional[str] = None
    restaurant_address: Optional[str] = None
    restaurant_address_en: Optional[str] = None
    restaurant_address_ar: Optional[str] = None
    restaurant_address_he: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    delivery_fee: Optional[float] = None
    minimum_order_amount: Optional[float] = None
    delivery_radius_km: Optional[int] = None
    estimated_delivery_time: Optional[int] = None
    tax_rate: Optional[float] = None
    currency: Optional[str] = None
    accept_cash: Optional[bool] = None
    accept_card: Optional[bool] = None
    accept_mobile_money: Optional[bool] = None
    is_accepting_orders: Optional[bool] = None
    # Theme
    theme_primary: Optional[str] = None
    theme_primary_foreground: Optional[str] = None
    theme_background: Optional[str] = None
    theme_foreground: Optional[str] = None
    theme_accent: Optional[str] = None
    theme_accent_foreground: Optional[str] = None
    theme_radius: Optional[str] = None

class RestaurantSettings(RestaurantSettingsBase):
    id: str
    updated_at: datetime

    class Config:
        from_attributes = True