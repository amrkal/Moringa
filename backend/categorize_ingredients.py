"""
Script to set proper ingredient types for all meals.
Run this to ensure all meals have sensible defaults:
- Bread, rice, pasta → required (hidden)
- Vegetables, basic toppings → removable  
- Premium add-ons → extra
"""
import asyncio
from app.database import connect_to_mongo, close_mongo_connection
from app.models import Meal, Ingredient

# Define ingredients that should be "required" (hidden from customer)
REQUIRED_INGREDIENTS = {
    'bread', 'bun', 'tortilla', 'pita', 'rice', 'pasta', 'noodles',
    'baguette', 'ciabatta', 'sourdough', 'לחם', 'פיתה', 'לחמניה'
}

# Define premium ingredients that should be "extra"
EXTRA_INGREDIENTS = {
    'truffle', 'caviar', 'lobster', 'salmon', 'tuna', 'shrimp',
    'prosciutto', 'bacon', 'foie gras', 'avocado', 'extra cheese',
    'טונה', 'סלמון', 'חזה עוף', 'אבוקדו'
}

async def categorize_ingredients():
    await connect_to_mongo()
    print("✅ Connected to database\n")
    
    # Get all ingredients to check names
    all_ingredients = await Ingredient.find_all().to_list()
    ingredient_map = {ing.id: ing for ing in all_ingredients}
    
    # Get all meals
    meals = await Meal.find_all().to_list()
    print(f"📋 Found {len(meals)} meals\n")
    
    updated_count = 0
    
    for meal in meals:
        meal_name = meal.name.get('en', 'Unknown')
        print(f"\n🍽️  Processing: {meal_name}")
        
        changes_made = False
        for ing_link in meal.ingredients:
            ing_id = ing_link.ingredient_id
            ingredient = ingredient_map.get(ing_id)
            
            if not ingredient:
                print(f"   ⚠️  Ingredient {ing_id} not found")
                continue
            
            ing_name_en = ingredient.name.get('en', '').lower()
            ing_name_he = ingredient.name.get('he', '').lower()
            current_type = ing_link.ingredient_type
            
            # Determine the proper type
            new_type = current_type  # Keep current by default
            
            # Check if should be required (hidden)
            if any(keyword in ing_name_en or keyword in ing_name_he for keyword in REQUIRED_INGREDIENTS):
                new_type = 'required'
            
            # Check if should be extra
            elif any(keyword in ing_name_en or keyword in ing_name_he for keyword in EXTRA_INGREDIENTS):
                new_type = 'extra'
                # Set a reasonable price if not set
                if ing_link.extra_price == 0:
                    ing_link.extra_price = 5.0  # Default extra price
            
            # Otherwise keep as removable (default)
            else:
                new_type = 'removable'
            
            if new_type != current_type:
                print(f"   📝 {ing_name_en}: {current_type} → {new_type}")
                ing_link.ingredient_type = new_type
                changes_made = True
        
        if changes_made:
            await meal.save()
            updated_count += 1
            print(f"   ✅ Updated!")
    
    print(f"\n🎉 Categorization complete! Updated {updated_count} meals")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(categorize_ingredients())
