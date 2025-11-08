"""Fix existing orders with lowercase payment_status"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def fix_orders():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.moringa_food_ordering  # Correct database name
    
    # Fix all possible lowercase values
    updates = [
        ('paid', 'PAID'),
        ('pending', 'PENDING'),
        ('failed', 'FAILED'),
        ('refunded', 'REFUNDED'),
    ]
    
    total_updated = 0
    for old_val, new_val in updates:
        result = await db.orders.update_many(
            {'payment_status': old_val},
            {'$set': {'payment_status': new_val}}
        )
        if result.modified_count > 0:
            print(f"Updated {result.modified_count} orders: '{old_val}' -> '{new_val}'")
            total_updated += result.modified_count
    
    if total_updated == 0:
        print("No orders needed updating")
    else:
        print(f"\n✅ Total updated: {total_updated} orders")
    
    # Verify
    orders = await db.orders.find({}).to_list(100)
    print(f"\nCurrent orders ({len(orders)} total):")
    for o in orders:
        print(f"  Order {str(o['_id'])[:8]}: payment_status={o.get('payment_status')}, status={o.get('status')}")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(fix_orders())
