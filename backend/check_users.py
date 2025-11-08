"""Check users in database"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.moringa_food
    
    count = await db.users.count_documents({})
    print(f'Total users in DB: {count}')
    
    if count > 0:
        users = await db.users.find({}).to_list(10)
        for u in users:
            print(f"\nUser ID: {u['_id']}")
            print(f"  name: {u.get('name')}")
            print(f"  phone: {u.get('phone')}")
            print(f"  email: {u.get('email')}")
            print(f"  role: {u.get('role')}")
            print(f"  is_verified: {u.get('is_verified')}")
    
    client.close()

asyncio.run(check())
