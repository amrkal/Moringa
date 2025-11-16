import asyncio
from app.database import connect_to_mongo, close_mongo_connection
from app.models import Meal

async def check_meal():
    await connect_to_mongo()
    
    # Find a specific meal by name
    meal = await Meal.find_one(Meal.name["en"] == "Vegan Sandwich")
    
    if meal:
        print(f"\n📋 Meal: {meal.name.get('en')}")
        print(f"Price: ₪{meal.price}")
        print(f"\nIngredients ({len(meal.ingredients)} total):")
        
        for idx, ing in enumerate(meal.ingredients, 1):
            print(f"\n{idx}. Ingredient ID: {ing.ingredient_id}")
            print(f"   Type: {ing.ingredient_type}")
            print(f"   Extra Price: ₪{ing.extra_price}")
            
            # Check if old fields still exist in the raw data
            print(f"   Raw data: {ing.dict()}")
    else:
        print("Meal not found")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(check_meal())
