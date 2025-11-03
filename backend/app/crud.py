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

        # Fetch user for customer details
        user = await crud_user.get(id=user_id)
        customer_name = user.name if user and getattr(user, "name", None) else "Guest"
        customer_email = user.email if user else None

        # Build order items with full details required by models.Order
        order_items: list[models.OrderItem] = []
        items_subtotal = 0.0
        for item in obj_in.items:
            meal = await models.Meal.get(item.meal_id)
            if not meal:
                # Should be validated by router; safeguard
                continue
            # Build selected ingredients details
            selected_ings: list[models.OrderItemIngredient] = []
            extras_total = 0.0
            for sel in item.selected_ingredients:
                ing = await models.Ingredient.get(sel.ingredient_id)
                if not ing:
                    continue
                # Ensure ingredient name is stored as a plain string (English as default, like meals)
                if isinstance(ing.name, str):
                    ing_name_str = ing.name
                elif isinstance(ing.name, dict):
                    # Strictly use English if available; otherwise leave empty
                    ing_name_str = ing.name.get('en') or ''
                else:
                    ing_name_str = str(ing.name or '')
                selected_ings.append(
                    models.OrderItemIngredient(
                        ingredient_id=ing.id,
                        name=ing_name_str,
                        price=ing.price,
                    )
                )
                extras_total += float(ing.price or 0)

            unit_price = float(meal.price) + extras_total
            line_subtotal = unit_price * item.quantity
            items_subtotal += line_subtotal

            # Use meal_name from request if provided, otherwise extract English from meal.name
            meal_name_str = item.meal_name if item.meal_name else (
                meal.name if isinstance(meal.name, str) else meal.name.get('en', '')
            )
            
            # Compute removed ingredients (IDs and names in English)
            removed_ids: list[str] = []
            removed_names: list[str] = []
            try:
                for rid in getattr(item, 'removed_ingredients', []) or []:
                    # Match both raw id and ObjectId-like strings
                    clean_id = str(rid).replace("ObjectId('", '').replace("')", '').replace('"', '').replace("ObjectId(\"", '').replace("\")", '')
                    ing = await models.Ingredient.get(clean_id)
                    if ing:
                        removed_ids.append(ing.id)
                        if isinstance(ing.name, str):
                            removed_names.append(ing.name)
                        elif isinstance(ing.name, dict):
                            removed_names.append(ing.name.get('en') or '')
                        else:
                            removed_names.append(str(ing.name or ''))
                    else:
                        removed_ids.append(str(rid))
            except Exception:
                # Be resilient; if anything goes wrong, still create order without removed names
                removed_ids = [str(r) for r in (getattr(item, 'removed_ingredients', []) or [])]

            order_items.append(
                models.OrderItem(
                    meal_id=meal.id,
                    meal_name=meal_name_str,
                    meal_price=float(meal.price),
                    quantity=item.quantity,
                    selected_ingredients=selected_ings,
                    removed_ingredients=removed_ids,
                    removed_ingredients_names=removed_names,
                    special_instructions=item.special_instructions,
                    subtotal=line_subtotal,
                )
            )

        # Calculate totals
        subtotal = items_subtotal
        tax_amount = subtotal * 0.08  # 8% tax (could be moved to settings)
        delivery_fee = 5.0 if obj_in.order_type == models.OrderType.DELIVERY else 0.0
        total_amount = subtotal + tax_amount + delivery_fee

        # Create order document
        db_obj = models.Order(
            id=str(uuid.uuid4()),
            user_id=user_id,
            status=models.OrderStatus.PENDING,
            order_type=models.OrderType(obj_in.order_type),
            payment_method=models.PaymentMethod(obj_in.payment_method),
            payment_status=models.PaymentStatus.PENDING,
            items=order_items,
            subtotal=subtotal,
            tax_amount=tax_amount,
            delivery_fee=delivery_fee,
            discount_amount=0.0,
            total_amount=total_amount,
            customer_name=customer_name,
            customer_phone=obj_in.phone_number,
            customer_email=customer_email,
            delivery_address=obj_in.delivery_address,
            special_instructions=obj_in.special_instructions,
            order_number=order_number,
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