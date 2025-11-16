import asyncio
from app.database import connect_to_mongo, close_mongo_connection
from app.models import Meal

async def check_structure():
    await connect_to_mongo()
    print("✅ Connected to database")
    
    meals = await Meal.find().limit(1).to_list()
    if meals:
        meal = meals[0]
        print(f"\n📋 Checking meal: {meal.name.get('en', 'Unknown')}")
        print(f"Ingredients count: {len(meal.ingredients)}")
        
        if meal.ingredients:
            first_ing = meal.ingredients[0]
            print(f"\nFirst ingredient structure:")
            print(f"  - ingredient_id: {first_ing.ingredient_id}")
            print(f"  - ingredient_type: {first_ing.ingredient_type}")
            print(f"  - extra_price: {first_ing.extra_price}")
            
            print(f"\nAll ingredients ({len(meal.ingredients)} total):")
            for idx, ing in enumerate(meal.ingredients, 1):
                print(f"  {idx}. Type: {ing.ingredient_type}, ID: {ing.ingredient_id[:8]}...")
    else:
        print("❌ No meals found in database")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(check_structure())
