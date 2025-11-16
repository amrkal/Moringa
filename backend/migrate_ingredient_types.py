"""
Migration script to update meal ingredients from old system to new system
Old: is_optional, is_default
New: ingredient_type ("required", "removable", "extra")

Mapping logic:
- is_optional=False, is_default=True  → "required" (can't remove, not shown)
- is_optional=True, is_default=True   → "removable" (included, can remove)
- is_optional=True, is_default=False  → "extra" (not included, can add)
"""
import asyncio
from app.database import connect_to_mongo, close_mongo_connection
from app.models import Meal

async def migrate_ingredient_types():
    """Migrate meal ingredients to new type system"""
    await connect_to_mongo()
    
    try:
        meals = await Meal.find_all().to_list()
        updated_count = 0
        
        for meal in meals:
            if not meal.ingredients:
                continue
                
            modified = False
            for ingredient in meal.ingredients:
                # Check if already migrated (has ingredient_type field)
                if hasattr(ingredient, 'ingredient_type'):
                    continue
                
                # Get old values
                is_optional = getattr(ingredient, 'is_optional', True)
                is_default = getattr(ingredient, 'is_default', False)
                
                # Determine new type
                if not is_optional and is_default:
                    # Fixed ingredient that can't be removed
                    ingredient.ingredient_type = "required"
                elif is_optional and is_default:
                    # Included by default but can be removed
                    ingredient.ingredient_type = "removable"
                else:  # is_optional and not is_default
                    # Extra add-on
                    ingredient.ingredient_type = "extra"
                
                # Remove old fields
                if hasattr(ingredient, 'is_optional'):
                    delattr(ingredient, 'is_optional')
                if hasattr(ingredient, 'is_default'):
                    delattr(ingredient, 'is_default')
                    
                modified = True
            
            if modified:
                await meal.save()
                updated_count += 1
                print(f"✅ Updated meal: {meal.name.get('en', 'Unknown')} ({len(meal.ingredients)} ingredients)")
        
        print(f"\n🎉 Migration complete! Updated {updated_count} meals")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(migrate_ingredient_types())
