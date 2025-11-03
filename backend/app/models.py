from beanie import Document, Indexed, Link, BackLink
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum as PyEnum
from pymongo import IndexModel, ASCENDING, DESCENDING, TEXT
import uuid

# Enums
class UserRole(str, PyEnum):
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"

class OrderStatus(str, PyEnum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PREPARING = "PREPARING"
    READY = "READY"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class OrderType(str, PyEnum):
    DELIVERY = "DELIVERY"
    DINE_IN = "DINE_IN"
    TAKE_AWAY = "TAKE_AWAY"

class PaymentMethod(str, PyEnum):
    CASH = "CASH"
    CARD = "CARD"
    MOBILE_MONEY = "MOBILE_MONEY"
    MPESA = "MPESA"
    STRIPE = "STRIPE"

class PaymentStatus(str, PyEnum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

# MongoDB Documents
class User(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    email: Optional[EmailStr] = Field(None, unique=True)
    phone: str = Field(..., unique=True)
    name: str
    role: UserRole = UserRole.CUSTOMER
    is_verified: bool = False
    password: Optional[str] = None
    profile_image: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    is_active: bool = True
    
    # Verification fields
    phone_verification_code: Optional[str] = None
    phone_verification_expires: Optional[datetime] = None
    email_verification_token: Optional[str] = None
    password_reset_token: Optional[str] = None
    password_reset_expires: Optional[datetime] = None

    class Settings:
        name = "users"
        indexes = [
            IndexModel([("phone", ASCENDING)], unique=True),
            IndexModel([("email", ASCENDING)], unique=True, sparse=True),
            IndexModel([("created_at", DESCENDING)]),
        ]

class Category(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    name: dict = Field(default_factory=lambda: {"en": "", "ar": "", "he": ""})  # {"en": "...", "ar": "...", "he": "..."}
    description: dict = Field(default_factory=lambda: {"en": "", "ar": "", "he": ""})
    image: Optional[str] = None
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Settings:
        name = "categories"
        indexes = [
            IndexModel([("order", ASCENDING)]),
            IndexModel([("is_active", ASCENDING)]),
        ]

class Ingredient(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    name: dict = Field(default_factory=lambda: {"en": "", "ar": "", "he": ""})  # {"en": "...", "ar": "...", "he": "..."}
    description: dict = Field(default_factory=lambda: {"en": "", "ar": "", "he": ""})
    price: float = 0.0
    image: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Settings:
        name = "ingredients"
        indexes = [
            IndexModel([("is_active", ASCENDING)]),
        ]

class MealIngredient(BaseModel):
    ingredient_id: str
    is_optional: bool = True
    is_default: bool = False
    extra_price: float = 0.0

class Meal(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    name: dict = Field(default_factory=lambda: {"en": "", "ar": "", "he": ""})  # {"en": "...", "ar": "...", "he": "..."}
    description: dict = Field(default_factory=lambda: {"en": "", "ar": "", "he": ""})
    price: float
    image: Optional[str] = None
    category_id: str
    ingredients: List[MealIngredient] = []
    preparation_time: Optional[int] = None  # in minutes
    calories: Optional[int] = None
    is_vegetarian: bool = False
    is_vegan: bool = False
    is_gluten_free: bool = False
    is_spicy: bool = False
    spice_level: Optional[int] = None  # 1-5 scale
    is_active: bool = True
    is_available: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Settings:
        name = "meals"
        indexes = [
            IndexModel([("category_id", ASCENDING)]),
            IndexModel([("price", ASCENDING)]),
            IndexModel([("is_active", ASCENDING)]),
            IndexModel([("is_available", ASCENDING)]),
            IndexModel([("is_vegetarian", ASCENDING)]),
            IndexModel([("is_vegan", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]

class OrderItemIngredient(BaseModel):
    ingredient_id: str
    name: str
    price: float

class OrderItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    meal_id: str
    meal_name: str
    meal_price: float
    quantity: int = 1
    selected_ingredients: List[OrderItemIngredient] = []
    # Track removed default ingredients
    removed_ingredients: List[str] = []  # IDs
    removed_ingredients_names: List[str] = []  # English names
    special_instructions: Optional[str] = None
    subtotal: float

class Order(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    user_id: str
    status: OrderStatus = OrderStatus.PENDING
    order_type: OrderType
    payment_method: PaymentMethod
    payment_status: PaymentStatus = PaymentStatus.PENDING
    
    # Order details
    items: List[OrderItem] = []
    subtotal: float
    tax_amount: float = 0.0
    delivery_fee: float = 0.0
    discount_amount: float = 0.0
    total_amount: float
    
    # Customer information
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    
    # Delivery information
    delivery_address: Optional[str] = None
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    estimated_delivery_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    
    # Additional information
    special_instructions: Optional[str] = None
    coupon_code: Optional[str] = None
    
    # Tracking
    order_number: Optional[str] = None
    preparation_time: Optional[int] = None  # in minutes
    
    # Payment information
    payment_intent_id: Optional[str] = None
    payment_reference: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Settings:
        name = "orders"
        indexes = [
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("status", ASCENDING)]),
            IndexModel([("order_type", ASCENDING)]),
            IndexModel([("payment_status", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
            IndexModel([("order_number", ASCENDING)], unique=True, sparse=True),
        ]

class Coupon(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    code: str = Field(..., unique=True)
    name: str  # Default/fallback name
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    name_he: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    description_he: Optional[str] = None
    discount_type: str  # 'percentage' or 'fixed'
    discount_value: float
    minimum_order_amount: float = 0.0
    maximum_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    usage_count: int = 0
    is_active: bool = True
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "coupons"
        indexes = [
            IndexModel([("code", ASCENDING)], unique=True),
            IndexModel([("is_active", ASCENDING)]),
            IndexModel([("expires_at", ASCENDING)]),
        ]

class Review(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    user_id: str
    meal_id: Optional[str] = None
    order_id: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    images: List[str] = []
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reviews"
        indexes = [
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("meal_id", ASCENDING)]),
            IndexModel([("order_id", ASCENDING)]),
            IndexModel([("rating", DESCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]

class Notification(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    user_id: str
    title: str
    message: str
    type: str  # 'order_update', 'promotion', 'system'
    data: Optional[dict] = {}
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notifications"
        indexes = [
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("is_read", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]

class RestaurantSettings(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    
    # Restaurant Info
    restaurant_name: str = "Moringa"
    restaurant_name_en: Optional[str] = None
    restaurant_name_ar: Optional[str] = None
    restaurant_name_he: Optional[str] = None
    restaurant_description: str = "Fresh and delicious meals"
    restaurant_description_en: Optional[str] = None
    restaurant_description_ar: Optional[str] = None
    restaurant_description_he: Optional[str] = None
    restaurant_phone: str = ""
    restaurant_email: str = ""
    restaurant_address: str = ""
    restaurant_address_en: Optional[str] = None
    restaurant_address_ar: Optional[str] = None
    restaurant_address_he: Optional[str] = None
    
    # Business Hours
    opening_time: str = "09:00"
    closing_time: str = "22:00"
    
    # Delivery Settings
    delivery_fee: float = 5.00
    minimum_order_amount: float = 15.00
    delivery_radius_km: int = 10
    estimated_delivery_time: int = 30  # in minutes
    
    # Tax & Payments
    tax_rate: float = 0.15
    currency: str = "USD"
    accept_cash: bool = True
    accept_card: bool = True
    accept_mobile_money: bool = False
    
    # Order Types
    accept_delivery: bool = True
    accept_dine_in: bool = True
    accept_takeaway: bool = True
    
    # Other
    is_accepting_orders: bool = True
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Theme (customizable site appearance)
    theme_primary: str = "#16a34a"  # green-600
    theme_primary_foreground: str = "#ffffff"
    theme_background: str = "#f9fafb"  # gray-50
    theme_foreground: str = "#111827"  # gray-900
    theme_accent: str = "#22c55e"     # green-500
    theme_accent_foreground: str = "#ffffff"
    theme_radius: str = "0.5rem"

    class Settings:
        name = "restaurant_settings"