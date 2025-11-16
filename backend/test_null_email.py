"""
Test creating users with null email
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test_null_email():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.moringa_food_ordering
    
    # Try to insert a user with null email
    try:
        result = await db.users.insert_one({
            "_id": "test-user-1",
            "phone": "+254700000001",
            "name": "Test User 1",
            "email": None,
            "role": "CUSTOMER",
            "is_verified": True,
            "is_active": True
        })
        print(f"✅ Inserted user 1: {result.inserted_id}")
    except Exception as e:
        print(f"❌ Error inserting user 1: {e}")
    
    # Try to insert another user with null email
    try:
        result = await db.users.insert_one({
            "_id": "test-user-2",
            "phone": "+254700000002",
            "name": "Test User 2",
            "email": None,
            "role": "CUSTOMER",
            "is_verified": True,
            "is_active": True
        })
        print(f"✅ Inserted user 2: {result.inserted_id}")
    except Exception as e:
        print(f"❌ Error inserting user 2: {e}")
    
    # Clean up
    await db.users.delete_many({"_id": {"$in": ["test-user-1", "test-user-2"]}})
    print("🧹 Cleaned up test users")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_null_email())
