"""
Drop and recreate email index as sparse
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING

async def fix_email_index():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.moringa_food_ordering
    
    try:
        # Drop existing email_1 index
        await db.users.drop_index('email_1')
        print("✅ Dropped email_1 index")
    except Exception as e:
        print(f"⚠️  Could not drop index: {e}")
    
    try:
        # Create sparse unique index on email
        await db.users.create_index(
            [("email", ASCENDING)],
            name="email_1",
            unique=True,
            sparse=True
        )
        print("✅ Created sparse unique index on email")
    except Exception as e:
        print(f"❌ Error creating index: {e}")
    
    # Verify
    indexes = await db.users.list_indexes().to_list(length=100)
    print("\nCurrent indexes:")
    for idx in indexes:
        print(f"  - {idx.get('name')}: sparse={idx.get('sparse', False)}, unique={idx.get('unique', False)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_email_index())
