"""
Quick script to update existing menu data to new translation structure
Run this to convert from old format (name, name_en, name_ar, name_he) to new format (name: {en, ar, he})
"""

import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
from app import models

async def migrate_data():
    client = AsyncIOMotorClient(settings.mongodb_url)
    
    await init_beanie(
        database=client[settings.mongodb_database_name],
        document_models=[
            models.User,
            models.Category,
            models.Ingredient,
            models.Meal,
            models.Order,
            models.RestaurantSettings
        ]
    )
    
    print("🔄 Migrating data to new translation structure...")
    
    # Migrate Categories
    print("\n📁 Migrating categories...")
    categories = await models.Category.find_all().to_list()
    for cat in categories:
        # If old structure exists, convert it
        if hasattr(cat, 'name') and isinstance(cat.name, str):
            old_name = cat.name
            old_name_en = getattr(cat, 'name_en', old_name)
            old_name_ar = getattr(cat, 'name_ar', old_name)
            old_name_he = getattr(cat, 'name_he', old_name)
            
            cat.name = {
                "en": old_name_en or old_name,
                "ar": old_name_ar or old_name,
                "he": old_name_he or old_name
            }
            
            old_desc = getattr(cat, 'description', "")
            old_desc_en = getattr(cat, 'description_en', old_desc)
            old_desc_ar = getattr(cat, 'description_ar', old_desc)
            old_desc_he = getattr(cat, 'description_he', old_desc)
            
            cat.description = {
                "en": old_desc_en or old_desc or "",
                "ar": old_desc_ar or old_desc or "",
                "he": old_desc_he or old_desc or ""
            }
            
            await cat.save()
            print(f"✅ Migrated category: {cat.name['en']}")
    
    # Migrate Ingredients
    print("\n🥗 Migrating ingredients...")
    ingredients = await models.Ingredient.find_all().to_list()
    for ing in ingredients:
        if hasattr(ing, 'name') and isinstance(ing.name, str):
            old_name = ing.name
            old_name_en = getattr(ing, 'name_en', old_name)
            old_name_ar = getattr(ing, 'name_ar', old_name)
            old_name_he = getattr(ing, 'name_he', old_name)
            
            ing.name = {
                "en": old_name_en or old_name,
                "ar": old_name_ar or old_name,
                "he": old_name_he or old_name
            }
            
            old_desc = getattr(ing, 'description', "")
            old_desc_en = getattr(ing, 'description_en', "")
            old_desc_ar = getattr(ing, 'description_ar', "")
            old_desc_he = getattr(ing, 'description_he', "")
            
            ing.description = {
                "en": old_desc_en or old_desc or "",
                "ar": old_desc_ar or old_desc or "",
                "he": old_desc_he or old_desc or ""
            }
            
            await ing.save()
            print(f"✅ Migrated ingredient: {ing.name['en']}")
    
    # Migrate Meals
    print("\n🍽️  Migrating meals...")
    meals = await models.Meal.find_all().to_list()
    for meal in meals:
        if hasattr(meal, 'name') and isinstance(meal.name, str):
            old_name = meal.name
            old_name_en = getattr(meal, 'name_en', old_name)
            old_name_ar = getattr(meal, 'name_ar', old_name)
            old_name_he = getattr(meal, 'name_he', old_name)
            
            meal.name = {
                "en": old_name_en or old_name,
                "ar": old_name_ar or old_name,
                "he": old_name_he or old_name
            }
            
            old_desc = getattr(meal, 'description', "")
            old_desc_en = getattr(meal, 'description_en', old_desc)
            old_desc_ar = getattr(meal, 'description_ar', old_desc)
            old_desc_he = getattr(meal, 'description_he', old_desc)
            
            meal.description = {
                "en": old_desc_en or old_desc or "",
                "ar": old_desc_ar or old_desc or "",
                "he": old_desc_he or old_desc or ""
            }
            
            await meal.save()
            print(f"✅ Migrated meal: {meal.name['en']}")
    
    print("\n✨ Migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(migrate_data())
