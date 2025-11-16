#!/usr/bin/env python3
"""
Migration script to upload corrected menu data to MongoDB Atlas
This will REPLACE all existing categories, ingredients, and meals with the corrected data
"""
import asyncio
import json
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.config import settings

async def migrate_data():
    """
    Migrate corrected data to MongoDB Atlas
    """
    print("🚀 Starting migration to MongoDB Atlas...")
    # Extract database info for display
    try:
        db_host = settings.mongodb_url.split('@')[1].split('/')[0] if '@' in settings.mongodb_url else 'localhost'
        print(f"📍 Database: {db_host}")
    except:
        print(f"📍 Database: {settings.mongodb_database_name}")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_database_name]
    
    try:
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas\n")
        
        # Load JSON files
        data_dir = Path(__file__).parent / "data"
        
        with open(data_dir / "corrected_categories.json", 'r', encoding='utf-8') as f:
            categories = json.load(f)
        
        with open(data_dir / "corrected_ingredients.json", 'r', encoding='utf-8') as f:
            ingredients = json.load(f)
        
        with open(data_dir / "corrected_meals.json", 'r', encoding='utf-8') as f:
            meals = json.load(f)
        
        print(f"📦 Loaded data:")
        print(f"   • {len(categories)} categories")
        print(f"   • {len(ingredients)} ingredients")
        print(f"   • {len(meals)} meals\n")
        
        # Backup existing data
        print("💾 Creating backup of existing data...")
        backup_dir = data_dir / "backups"
        backup_dir.mkdir(exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Backup categories
        existing_categories = await db.categories.find().to_list(None)
        if existing_categories:
            with open(backup_dir / f"categories_backup_{timestamp}.json", 'w', encoding='utf-8') as f:
                json.dump(existing_categories, f, ensure_ascii=False, indent=2, default=str)
            print(f"   ✅ Backed up {len(existing_categories)} categories")
        
        # Backup ingredients
        existing_ingredients = await db.ingredients.find().to_list(None)
        if existing_ingredients:
            with open(backup_dir / f"ingredients_backup_{timestamp}.json", 'w', encoding='utf-8') as f:
                json.dump(existing_ingredients, f, ensure_ascii=False, indent=2, default=str)
            print(f"   ✅ Backed up {len(existing_ingredients)} ingredients")
        
        # Backup meals
        existing_meals = await db.meals.find().to_list(None)
        if existing_meals:
            with open(backup_dir / f"meals_backup_{timestamp}.json", 'w', encoding='utf-8') as f:
                json.dump(existing_meals, f, ensure_ascii=False, indent=2, default=str)
            print(f"   ✅ Backed up {len(existing_meals)} meals\n")
        
        # Confirm before deletion
        print("⚠️  WARNING: This will DELETE all existing categories, ingredients, and meals!")
        response = input("   Type 'YES' to continue: ")
        
        if response != "YES":
            print("❌ Migration cancelled")
            return
        
        print("\n🗑️  Deleting old data...")
        
        # Delete old data
        result = await db.categories.delete_many({})
        print(f"   • Deleted {result.deleted_count} categories")
        
        result = await db.ingredients.delete_many({})
        print(f"   • Deleted {result.deleted_count} ingredients")
        
        result = await db.meals.delete_many({})
        print(f"   • Deleted {result.deleted_count} meals\n")
        
        # Insert new data
        print("📤 Uploading corrected data...")
        
        # Add timestamps to new records
        now = datetime.utcnow()
        
        for cat in categories:
            if 'created_at' not in cat:
                cat['created_at'] = now
            cat['updated_at'] = None
        
        for ing in ingredients:
            if 'created_at' not in ing:
                ing['created_at'] = now
            ing['updated_at'] = None
        
        for meal in meals:
            if 'created_at' not in meal:
                meal['created_at'] = now
            meal['updated_at'] = None
            # Ensure all optional fields exist
            meal.setdefault('calories', None)
            meal.setdefault('is_vegetarian', False)
            meal.setdefault('is_vegan', False)
            meal.setdefault('is_gluten_free', False)
            meal.setdefault('is_spicy', False)
            meal.setdefault('is_popular', False)
            meal.setdefault('spice_level', None)
        
        # Insert categories
        if categories:
            result = await db.categories.insert_many(categories)
            print(f"   ✅ Inserted {len(result.inserted_ids)} categories")
        
        # Insert ingredients
        if ingredients:
            result = await db.ingredients.insert_many(ingredients)
            print(f"   ✅ Inserted {len(result.inserted_ids)} ingredients")
        
        # Insert meals
        if meals:
            result = await db.meals.insert_many(meals)
            print(f"   ✅ Inserted {len(result.inserted_ids)} meals\n")
        
        # Verify data
        print("🔍 Verifying migration...")
        
        cat_count = await db.categories.count_documents({})
        ing_count = await db.ingredients.count_documents({})
        meal_count = await db.meals.count_documents({})
        
        print(f"   • Categories in DB: {cat_count}")
        print(f"   • Ingredients in DB: {ing_count}")
        print(f"   • Meals in DB: {meal_count}\n")
        
        # Show sample meal with ingredients
        sample_meal = await db.meals.find_one({"name.he": "סלט קינואה"})
        if sample_meal:
            print("📋 Sample Meal: סלט קינואה")
            print(f"   • Price: ₪{sample_meal['price']}")
            print(f"   • Ingredients: {len(sample_meal.get('ingredients', []))} items")
            
            # Count add-ons
            addons = [ing for ing in sample_meal.get('ingredients', []) 
                     if ing.get('is_optional') and ing.get('extra_price', 0) > 0]
            print(f"   • Optional add-ons: {len(addons)} (Avocado ₪5, Tuna ₪5, Egg ₪5, Chicken ₪20, Schnitzel ₪20, Salmon ₪25)\n")
        
        print("✅ Migration completed successfully!")
        print("\n📌 Next steps:")
        print("   1. Test the menu on your frontend")
        print("   2. Verify ingredient customization works")
        print("   3. Check that prices calculate correctly")
        print("   4. Test the complete order flow\n")
        
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(migrate_data())
