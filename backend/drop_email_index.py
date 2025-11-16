"""
Script to drop the old non-sparse email_1 index
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def drop_email_index():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.moringa_food_ordering
    
    try:
        result = await db.users.drop_index('email_1')
        print("✅ Dropped email_1 index successfully")
    except Exception as e:
        print(f"⚠️  Could not drop index: {e}")
    
    # List remaining indexes
    indexes = await db.users.list_indexes().to_list(length=100)
    print("\nCurrent indexes on users collection:")
    for idx in indexes:
        print(f"  - {idx.get('name')}: {idx.get('key')} (sparse: {idx.get('sparse', False)})")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(drop_email_index())
