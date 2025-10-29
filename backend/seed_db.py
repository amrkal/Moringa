import asyncio
from datetime import datetime
from app.database import connect_to_mongo, close_mongo_connection
from app import models, schemas, crud
import uuid

async def create_sample_data():
    """Create sample data for MongoDB."""
    try:
        print("Seeding MongoDB database...")
        
        # Create admin user
        admin_data = schemas.UserCreate(
            phone="+1234567890",
            email="admin@moringa.com",
            name="Admin User",
            role=schemas.UserRole.ADMIN,
            password="admin123"
        )
        admin = await crud.crud_user.create(obj_in=admin_data)
        admin.is_verified = True
        await admin.save()
        print(f"Created admin user: {admin.name}")
        
        # Create customer user
        customer_data = schemas.UserCreate(
            phone="+1234567891",
            email="customer@example.com",
            name="John Doe",
            role=schemas.UserRole.CUSTOMER,
            password="customer123"
        )
        customer = await crud.crud_user.create(obj_in=customer_data)
        customer.is_verified = True
        await customer.save()
        print(f"Created customer user: {customer.name}")
        
        # Create categories
        categories_data = [
            {
                "name": "Breakfast",
                "description": "Start your day with our delicious breakfast options",
                "image": "/images/categories/breakfast.jpg",
                "order": 1
            },
            {
                "name": "Lunch",
                "description": "Hearty meals for your midday appetite",
                "image": "/images/categories/lunch.jpg",
                "order": 2
            },
            {
                "name": "Dinner",
                "description": "End your day with our satisfying dinner meals",
                "image": "/images/categories/dinner.jpg",
                "order": 3
            },
            {
                "name": "Beverages",
                "description": "Refreshing drinks to complement your meal",
                "image": "/images/categories/beverages.jpg",
                "order": 4
            },
            {
                "name": "Desserts",
                "description": "Sweet treats to end your meal perfectly",
                "image": "/images/categories/desserts.jpg",
                "order": 5
            }
        ]
        
        categories = []
        for cat_data in categories_data:
            category = await crud.crud_category.create(
                obj_in=schemas.CategoryCreate(**cat_data)
            )
            categories.append(category)
        print("Created categories")
        
        # Create ingredients
        ingredients_data = [
            {"name": "Extra Cheese", "description": "Add more cheese to your meal", "price": 2.50},
            {"name": "Bacon", "description": "Crispy bacon strips", "price": 3.00},
            {"name": "Avocado", "description": "Fresh sliced avocado", "price": 2.00},
            {"name": "Mushrooms", "description": "Sautéed mushrooms", "price": 1.50},
            {"name": "Lettuce", "description": "Fresh lettuce leaves", "price": 0.50},
            {"name": "Tomato", "description": "Fresh tomato slices", "price": 0.75},
            {"name": "Onions", "description": "Caramelized onions", "price": 0.50},
            {"name": "Pickles", "description": "Tangy pickle slices", "price": 0.25},
            {"name": "Hot Sauce", "description": "Spicy hot sauce", "price": 0.00},
            {"name": "BBQ Sauce", "description": "Smoky BBQ sauce", "price": 0.00}
        ]
        
        ingredients = []
        for ing_data in ingredients_data:
            ingredient = await crud.crud_ingredient.create(
                obj_in=schemas.IngredientCreate(**ing_data)
            )
            ingredients.append(ingredient)
        print("Created ingredients")
        
        # Create meals
        meals_data = [
            {
                "name": "Fluffy Pancakes",
                "description": "Stack of three fluffy pancakes served with maple syrup and butter",
                "price": 12.99,
                "image": "/images/meals/pancakes.jpg",
                "category_id": categories[0].id,  # Breakfast
                "preparation_time": 15,
                "calories": 450,
                "is_vegetarian": True,
                "ingredients": []
            },
            {
                "name": "Cheese Omelette",
                "description": "Three-egg omelette with your choice of fillings",
                "price": 10.99,
                "image": "/images/meals/omelette.jpg",
                "category_id": categories[0].id,  # Breakfast
                "preparation_time": 10,
                "calories": 320,
                "is_vegetarian": True,
                "ingredients": [
                    models.MealIngredient(ingredient_id=ingredients[0].id, is_optional=True, is_default=False),  # Extra Cheese
                    models.MealIngredient(ingredient_id=ingredients[1].id, is_optional=True, is_default=False),  # Bacon
                    models.MealIngredient(ingredient_id=ingredients[3].id, is_optional=True, is_default=False),  # Mushrooms
                ]
            },
            {
                "name": "Classic Burger",
                "description": "Juicy beef patty with lettuce, tomato, and special sauce",
                "price": 15.99,
                "image": "/images/meals/burger.jpg",
                "category_id": categories[1].id,  # Lunch
                "preparation_time": 20,
                "calories": 650,
                "ingredients": [
                    models.MealIngredient(ingredient_id=ingredients[4].id, is_optional=False, is_default=True),  # Lettuce
                    models.MealIngredient(ingredient_id=ingredients[5].id, is_optional=False, is_default=True),  # Tomato
                    models.MealIngredient(ingredient_id=ingredients[0].id, is_optional=True, is_default=False),  # Extra Cheese
                    models.MealIngredient(ingredient_id=ingredients[1].id, is_optional=True, is_default=False),  # Bacon
                    models.MealIngredient(ingredient_id=ingredients[2].id, is_optional=True, is_default=False),  # Avocado
                ]
            },
            {
                "name": "Vegetarian Pizza",
                "description": "Fresh vegetables on a crispy crust with mozzarella cheese",
                "price": 18.99,
                "image": "/images/meals/veggie-pizza.jpg",
                "category_id": categories[1].id,  # Lunch
                "preparation_time": 25,
                "calories": 520,
                "is_vegetarian": True,
                "ingredients": []
            },
            {
                "name": "Grilled Salmon",
                "description": "Fresh Atlantic salmon grilled to perfection with herbs",
                "price": 24.99,
                "image": "/images/meals/salmon.jpg",
                "category_id": categories[2].id,  # Dinner
                "preparation_time": 18,
                "calories": 380,
                "is_gluten_free": True,
                "ingredients": []
            },
            {
                "name": "Artisan Coffee",
                "description": "Freshly brewed coffee from premium beans",
                "price": 4.99,
                "image": "/images/meals/coffee.jpg",
                "category_id": categories[3].id,  # Beverages
                "preparation_time": 5,
                "calories": 5,
                "is_vegan": True,
                "ingredients": []
            },
            {
                "name": "Chocolate Lava Cake",
                "description": "Warm chocolate cake with molten center and vanilla ice cream",
                "price": 8.99,
                "image": "/images/meals/lava-cake.jpg",
                "category_id": categories[4].id,  # Desserts
                "preparation_time": 12,
                "calories": 480,
                "is_vegetarian": True,
                "ingredients": []
            }
        ]
        
        meals = []
        for meal_data in meals_data:
            meal = await crud.crud_meal.create(
                obj_in=schemas.MealCreate(**meal_data)
            )
            meals.append(meal)
        print("Created meals")
        
        # Create sample orders
        sample_orders = [
            {
                "order_type": models.OrderType.DELIVERY,
                "payment_method": models.PaymentMethod.CARD,
                "customer_name": customer.name,
                "customer_phone": customer.phone,
                "customer_email": customer.email,
                "delivery_address": "123 Main St, City, State 12345",
                "special_instructions": "Please ring the doorbell",
                "items": [
                    models.OrderItem(
                        meal_id=meals[2].id,  # Classic Burger
                        meal_name=meals[2].name,
                        meal_price=meals[2].price,
                        quantity=1,
                        selected_ingredients=[
                            models.OrderItemIngredient(ingredient_id=ingredients[0].id, name=ingredients[0].name, price=ingredients[0].price),  # Extra Cheese
                            models.OrderItemIngredient(ingredient_id=ingredients[1].id, name=ingredients[1].name, price=ingredients[1].price),  # Bacon
                        ],
                        subtotal=15.99 + 2.50 + 3.00
                    ),
                    models.OrderItem(
                        meal_id=meals[5].id,  # Artisan Coffee
                        meal_name=meals[5].name,
                        meal_price=meals[5].price,
                        quantity=2,
                        selected_ingredients=[],
                        subtotal=4.99 * 2
                    )
                ]
            },
            {
                "order_type": models.OrderType.DINE_IN,
                "payment_method": models.PaymentMethod.CASH,
                "customer_name": customer.name,
                "customer_phone": customer.phone,
                "customer_email": customer.email,
                "special_instructions": "Table for 2",
                "items": [
                    models.OrderItem(
                        meal_id=meals[0].id,  # Fluffy Pancakes
                        meal_name=meals[0].name,
                        meal_price=meals[0].price,
                        quantity=2,
                        selected_ingredients=[],
                        subtotal=12.99 * 2
                    ),
                    models.OrderItem(
                        meal_id=meals[5].id,  # Artisan Coffee
                        meal_name=meals[5].name,
                        meal_price=meals[5].price,
                        quantity=2,
                        selected_ingredients=[],
                        subtotal=4.99 * 2
                    )
                ]
            }
        ]
        
        orders = []
        for order_data in sample_orders:
            order = await crud.crud_order.create(
                obj_in=schemas.OrderCreate(**order_data), 
                user_id=customer.id
            )
            # Update first order to PREPARING status
            if len(orders) == 0:
                order.status = models.OrderStatus.PREPARING
                await order.save()
            orders.append(order)
        
        print("Created sample orders")
        
        # Create sample coupons
        coupons_data = [
            {
                "code": "WELCOME10",
                "name": "Welcome Discount",
                "description": "10% off your first order",
                "discount_type": "percentage",
                "discount_value": 10.0,
                "minimum_order_amount": 20.0,
                "usage_limit": 100,
                "is_active": True
            },
            {
                "code": "FREESHIP",
                "name": "Free Shipping",
                "description": "Free delivery on orders over $30",
                "discount_type": "fixed",
                "discount_value": 5.0,
                "minimum_order_amount": 30.0,
                "usage_limit": 50,
                "is_active": True
            }
        ]
        
        for coupon_data in coupons_data:
            coupon = models.Coupon(id=str(uuid.uuid4()), **coupon_data)
            await coupon.insert()
        
        print("Created sample coupons")
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        import traceback
        traceback.print_exc()

async def main():
    """Main function to run the seeding script."""
    await connect_to_mongo()
    await create_sample_data()
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())