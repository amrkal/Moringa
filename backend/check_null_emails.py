"""
Check for users with null email
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_null_emails():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.moringa_food_ordering
    
    # Count users with null email
    count = await db.users.count_documents({"email": None})
    print(f"Users with email=null: {count}")
    
    # List them
    users = await db.users.find({"email": None}).to_list(length=10)
    for user in users:
        print(f"  - {user.get('phone')}: {user.get('name')} (id: {user.get('_id')})")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_null_emails())
