"""Fix payment_status case mismatch in orders collection"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def fix_payment_status():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.moringa_food
    
    # Check current values
    print("Current payment_status values:")
    orders = await db.orders.find({}, {'payment_status': 1, '_id': 1}).to_list(100)
    for order in orders:
        print(f"  {order['_id']}: {order.get('payment_status')}")
    
    # Update lowercase to uppercase
    result = await db.orders.update_many(
        {'payment_status': 'paid'},
        {'$set': {'payment_status': 'PAID'}}
    )
    print(f"\nUpdated 'paid' -> 'PAID': {result.modified_count} documents")
    
    result = await db.orders.update_many(
        {'payment_status': 'pending'},
        {'$set': {'payment_status': 'PENDING'}}
    )
    print(f"Updated 'pending' -> 'PENDING': {result.modified_count} documents")
    
    result = await db.orders.update_many(
        {'payment_status': 'failed'},
        {'$set': {'payment_status': 'FAILED'}}
    )
    print(f"Updated 'failed' -> 'FAILED': {result.modified_count} documents")
    
    result = await db.orders.update_many(
        {'payment_status': 'refunded'},
        {'$set': {'payment_status': 'REFUNDED'}}
    )
    print(f"Updated 'refunded' -> 'REFUNDED': {result.modified_count} documents")
    
    # Verify
    print("\nAfter fix:")
    orders = await db.orders.find({}, {'payment_status': 1, '_id': 1}).to_list(100)
    for order in orders:
        print(f"  {order['_id']}: {order.get('payment_status')}")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(fix_payment_status())
