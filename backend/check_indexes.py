"""
Script to check indexes on users collection
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_indexes():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.moringa_food_ordering
    
    # List indexes
    indexes = await db.users.list_indexes().to_list(length=100)
    print("Current indexes on users collection:")
    for idx in indexes:
        print(f"  - {idx.get('name')}: {idx.get('key')} (sparse: {idx.get('sparse', False)}, unique: {idx.get('unique', False)})")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_indexes())
