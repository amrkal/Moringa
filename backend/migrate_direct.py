"""
Direct MongoDB migration script
Converts string fields to translation objects
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.config import settings

async def migrate_data():
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_database_name]
    
    print("🔄 Migrating data to new translation structure...")
    
    # Migrate Categories
    print("\n📁 Migrating categories...")
    categories = db.categories
    async for cat in categories.find({}):
        name = cat.get('name', '')
        name_en = cat.get('name_en', name)
        name_ar = cat.get('name_ar', name)
        name_he = cat.get('name_he', name)
        
        desc = cat.get('description', '')
        desc_en = cat.get('description_en', desc)
        desc_ar = cat.get('description_ar', desc)
        desc_he = cat.get('description_he', desc)
        
        update = {
            '$set': {
                'name': {
                    'en': name_en or name,
                    'ar': name_ar or name,
                    'he': name_he or name
                },
                'description': {
                    'en': desc_en or desc or '',
                    'ar': desc_ar or desc or '',
                    'he': desc_he or desc or ''
                }
            },
            '$unset': {
                'name_en': '',
                'name_ar': '',
                'name_he': '',
                'description_en': '',
                'description_ar': '',
                'description_he': ''
            }
        }
        
        await categories.update_one({'_id': cat['_id']}, update)
        print(f"✅ Migrated category: {name_en or name}")
    
    # Migrate Ingredients
    print("\n🥗 Migrating ingredients...")
    ingredients = db.ingredients
    async for ing in ingredients.find({}):
        name = ing.get('name', '')
        name_en = ing.get('name_en', name)
        name_ar = ing.get('name_ar', name)
        name_he = ing.get('name_he', name)
        
        desc = ing.get('description', '')
        desc_en = ing.get('description_en', desc)
        desc_ar = ing.get('description_ar', desc)
        desc_he = ing.get('description_he', desc)
        
        update = {
            '$set': {
                'name': {
                    'en': name_en or name,
                    'ar': name_ar or name,
                    'he': name_he or name
                },
                'description': {
                    'en': desc_en or desc or '',
                    'ar': desc_ar or desc or '',
                    'he': desc_he or desc or ''
                }
            },
            '$unset': {
                'name_en': '',
                'name_ar': '',
                'name_he': '',
                'description_en': '',
                'description_ar': '',
                'description_he': ''
            }
        }
        
        await ingredients.update_one({'_id': ing['_id']}, update)
        print(f"✅ Migrated ingredient: {name_en or name}")
    
    # Migrate Meals
    print("\n🍽️  Migrating meals...")
    meals = db.meals
    async for meal in meals.find({}):
        name = meal.get('name', '')
        name_en = meal.get('name_en', name)
        name_ar = meal.get('name_ar', name)
        name_he = meal.get('name_he', name)
        
        desc = meal.get('description', '')
        desc_en = meal.get('description_en', desc)
        desc_ar = meal.get('description_ar', desc)
        desc_he = meal.get('description_he', desc)
        
        update = {
            '$set': {
                'name': {
                    'en': name_en or name,
                    'ar': name_ar or name,
                    'he': name_he or name
                },
                'description': {
                    'en': desc_en or desc or '',
                    'ar': desc_ar or desc or '',
                    'he': desc_he or desc or ''
                }
            },
            '$unset': {
                'name_en': '',
                'name_ar': '',
                'name_he': '',
                'description_en': '',
                'description_ar': '',
                'description_he': ''
            }
        }
        
        await meals.update_one({'_id': meal['_id']}, update)
        print(f"✅ Migrated meal: {name_en or name}")
    
    print("\n✨ Migration completed successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_data())
