from typing import List, Optional
from beanie import PydanticObjectId
from pymongo import ASCENDING, DESCENDING
import asyncio
from datetime import datetime, timedelta
import uuid

from . import models, schemas
from .security import get_password_hash, verify_password

class CRUDCategory:
    async def get(self, id: str) -> Optional[models.Category]:
        """Get category by ID"""
        return await models.Category.get(id)
    
    async def get_multi(self, *, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[models.Category]:
        """Get multiple categories"""
        query = models.Category.find()
        if active_only:
            query = query.find(models.Category.is_active == True)
        return await query.sort(+models.Category.order).skip(skip).limit(limit).to_list()
    
    async def get_with_meal_count(self, *, skip: int = 0, limit: int = 100, active_only: bool = True):
        """Get categories with meal count"""
        categories = await self.get_multi(skip=skip, limit=limit, active_only=active_only)
        result = []
        
        for category in categories:
            meal_query = models.Meal.find(models.Meal.category_id == category.id)
            if active_only:
                meal_query = meal_query.find(models.Meal.is_active == True)
            meal_count = await meal_query.count()
            
            result.append({
                "category": category,
                "meal_count": meal_count
            })
        
        return result
    
    async def create(self, *, obj_in: schemas.CategoryCreate) -> models.Category:
        """Create new category"""
        db_obj = models.Category(
            id=str(uuid.uuid4()),
            **obj_in.dict()
        )
        return await db_obj.insert()
    
    async def update(self, *, db_obj: models.Category, obj_in: schemas.CategoryUpdate) -> models.Category:
        """Update category"""
        update_data = obj_in.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        return await db_obj.save()
    
    async def delete(self, *, id: str) -> bool:
        """Delete category"""
        category = await models.Category.get(id)
        if category:
            await category.delete()
            return True
        return False

class CRUDMeal:
    async def get(self, id: str) -> Optional[models.Meal]:
        """Get meal by ID"""
        return await models.Meal.get(id)
    
    async def get_multi(self, *, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[models.Meal]:
        """Get multiple meals"""
        query = models.Meal.find()
        if active_only:
            query = query.find(models.Meal.is_active == True)
        return await query.skip(skip).limit(limit).to_list()
    
    async def get_by_category(self, *, category_id: str, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[models.Meal]:
        """Get meals by category"""
        query = models.Meal.find(models.Meal.category_id == category_id)
        if active_only:
            query = query.find(models.Meal.is_active == True)
        return await query.skip(skip).limit(limit).to_list()
    
    async def search(self, *, search: str, skip: int = 0, limit: int = 100) -> List[models.Meal]:
        """Search meals by name or description"""
        return await models.Meal.find(
            {
                "$and": [
                    {"is_active": True},
                    {
                        "$or": [
                            {"name": {"$regex": search, "$options": "i"}},
                            {"description": {"$regex": search, "$options": "i"}}
                        ]
                    }
                ]
            }
        ).skip(skip).limit(limit).to_list()
    
    async def create(self, *, obj_in: schemas.MealCreate) -> models.Meal:
        """Create new meal"""
        create_data = obj_in.dict()
        
        # Convert ingredients from schema to model format
        if "ingredients" in create_data:
            create_data["ingredients"] = [
                models.MealIngredient(**ing) for ing in create_data["ingredients"]
            ]
        
        db_obj = models.Meal(
            id=str(uuid.uuid4()),
            **create_data
        )
        return await db_obj.insert()
    
    async def update(self, *, db_obj: models.Meal, obj_in: schemas.MealUpdate) -> models.Meal:
        """Update meal"""
        update_data = obj_in.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        # Convert ingredients from schema to model format
        if "ingredients" in update_data and update_data["ingredients"] is not None:
            update_data["ingredients"] = [
                models.MealIngredient(**ing) for ing in update_data["ingredients"]
            ]
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        return await db_obj.save()
    
    async def delete(self, *, id: str) -> bool:
        """Delete meal"""
        meal = await models.Meal.get(id)
        if meal:
            await meal.delete()
            return True
        return False

class CRUDIngredient:
    async def get(self, id: str) -> Optional[models.Ingredient]:
        """Get ingredient by ID"""
        return await models.Ingredient.get(id)
    
    async def get_multi(self, *, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[models.Ingredient]:
        """Get multiple ingredients"""
        query = models.Ingredient.find()
        if active_only:
            query = query.find(models.Ingredient.is_active == True)
        return await query.skip(skip).limit(limit).to_list()
    
    async def create(self, *, obj_in: schemas.IngredientCreate) -> models.Ingredient:
        """Create new ingredient"""
        db_obj = models.Ingredient(
            id=str(uuid.uuid4()),
            **obj_in.dict()
        )
        return await db_obj.insert()
    
    async def update(self, *, db_obj: models.Ingredient, obj_in: schemas.IngredientUpdate) -> models.Ingredient:
        """Update ingredient"""
        update_data = obj_in.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        return await db_obj.save()
    
    async def delete(self, *, id: str) -> bool:
        """Delete ingredient"""
        ingredient = await models.Ingredient.get(id)
        if ingredient:
            await ingredient.delete()
            return True
        return False

class CRUDUser:
    async def get(self, id: str) -> Optional[models.User]:
        """Get user by ID"""
        return await models.User.get(id)
    
    async def get_by_phone(self, *, phone: str) -> Optional[models.User]:
        """Get user by phone"""
        return await models.User.find_one(models.User.phone == phone)
    
    async def get_by_email(self, *, email: str) -> Optional[models.User]:
        """Get user by email"""
        return await models.User.find_one(models.User.email == email)
    
    async def get_multi(self, *, skip: int = 0, limit: int = 100) -> List[models.User]:
        """Get multiple users"""
        return await models.User.find().skip(skip).limit(limit).to_list()
    
    async def create(self, *, obj_in: schemas.UserCreate) -> models.User:
        """Create new user"""
        create_data = obj_in.dict()
        if create_data.get("password"):
            create_data["password"] = get_password_hash(create_data["password"])
        
        db_obj = models.User(
            id=str(uuid.uuid4()),
            **create_data
        )
        return await db_obj.insert()
    
    async def update(self, *, db_obj: models.User, obj_in: schemas.UserUpdate) -> models.User:
        """Update user"""
        update_data = obj_in.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["password"] = get_password_hash(update_data["password"])
        update_data["updated_at"] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        return await db_obj.save()
    
    async def authenticate(self, *, phone: str, password: str) -> Optional[models.User]:
        """Authenticate user"""
        user = await self.get_by_phone(phone=phone)
        if not user:
            return None
        if not verify_password(password, user.password):
            return None
        return user
    
    async def delete(self, *, id: str) -> bool:
        """Delete user"""
        user = await models.User.get(id)
        if user:
            await user.delete()
            return True
        return False

class CRUDOrder:
    async def get(self, id: str) -> Optional[models.Order]:
        """Get order by ID"""
        return await models.Order.get(id)
    
    async def get_multi(self, *, skip: int = 0, limit: int = 100) -> List[models.Order]:
        """Get multiple orders"""
        return await models.Order.find().sort(-models.Order.created_at).skip(skip).limit(limit).to_list()
    
    async def get_by_user(self, *, user_id: str, skip: int = 0, limit: int = 100) -> List[models.Order]:
        """Get orders by user"""
        return await models.Order.find(
            models.Order.user_id == user_id
        ).sort(-models.Order.created_at).skip(skip).limit(limit).to_list()
    
    async def get_by_status(self, *, status: models.OrderStatus, skip: int = 0, limit: int = 100) -> List[models.Order]:
        """Get orders by status"""
        return await models.Order.find(
            models.Order.status == status
        ).sort(-models.Order.created_at).skip(skip).limit(limit).to_list()
    
    async def create(self, *, obj_in: schemas.OrderCreate, user_id: str) -> models.Order:
        """Create new order"""
        # Generate order number
        order_count = await models.Order.count() + 1
        order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{order_count:06d}"
        
        # Calculate totals
        subtotal = sum(item.price * item.quantity for item in obj_in.items)
        tax_amount = subtotal * 0.08  # 8% tax
        delivery_fee = 5.0 if obj_in.order_type == models.OrderType.DELIVERY else 0.0
        total_amount = subtotal + tax_amount + delivery_fee
        
        db_obj = models.Order(
            id=str(uuid.uuid4()),
            user_id=user_id,
            order_number=order_number,
            subtotal=subtotal,
            tax_amount=tax_amount,
            delivery_fee=delivery_fee,
            total_amount=total_amount,
            **obj_in.dict()
        )
        return await db_obj.insert()
    
    async def update(self, *, db_obj: models.Order, obj_in: schemas.OrderUpdate) -> models.Order:
        """Update order"""
        update_data = obj_in.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        # Update status timestamps
        if "status" in update_data:
            if update_data["status"] == models.OrderStatus.CONFIRMED:
                update_data["confirmed_at"] = datetime.utcnow()
            elif update_data["status"] == models.OrderStatus.DELIVERED:
                update_data["completed_at"] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        return await db_obj.save()
    
    async def get_stats(self):
        """Get order statistics"""
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Total counts
        total_orders = await models.Order.count()
        total_customers = await models.User.find(models.User.role == models.UserRole.CUSTOMER).count()
        total_meals = await models.Meal.find(models.Meal.is_active == True).count()
        
        # Revenue calculations
        delivered_orders = models.Order.find(models.Order.status == models.OrderStatus.DELIVERED)
        total_revenue = 0
        async for order in delivered_orders:
            total_revenue += order.total_amount
        
        # Today's stats
        today_orders = await models.Order.find(
            models.Order.created_at >= today
        ).count()
        
        today_delivered = models.Order.find({
            "created_at": {"$gte": today},
            "status": models.OrderStatus.DELIVERED
        })
        today_revenue = 0
        async for order in today_delivered:
            today_revenue += order.total_amount
        
        return {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_customers": total_customers,
            "total_meals": total_meals,
            "today_orders": today_orders,
            "today_revenue": today_revenue
        }

# Create CRUD instances
crud_category = CRUDCategory()
crud_meal = CRUDMeal()
crud_ingredient = CRUDIngredient()
crud_user = CRUDUser()
crud_order = CRUDOrder()