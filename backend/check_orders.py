"""Check orders in database"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.moringa_food
    
    count = await db.orders.count_documents({})
    print(f'Total orders in DB: {count}')
    
    if count > 0:
        orders = await db.orders.find({}).to_list(10)
        for o in orders:
            print(f"\nOrder ID: {o['_id']}")
            print(f"  user_id: {o.get('user_id')}")
            print(f"  status: {o.get('status')}")
            print(f"  payment_status: {o.get('payment_status')}")
            print(f"  total_amount: {o.get('total_amount')}")
            print(f"  phone_number: {o.get('phone_number')}")
            print(f"  created_at: {o.get('created_at')}")
    
    client.close()

asyncio.run(check())
