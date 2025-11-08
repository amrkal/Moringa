"""Check all databases and collections"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_all():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    
    # List all databases
    dbs = await client.list_database_names()
    print(f"Available databases: {dbs}\n")
    
    for db_name in dbs:
        if db_name not in ['admin', 'config', 'local']:
            db = client[db_name]
            collections = await db.list_collection_names()
            print(f"Database '{db_name}' collections: {collections}")
            
            if 'orders' in collections:
                count = await db.orders.count_documents({})
                print(f"  - orders collection: {count} documents")
                
                if count > 0:
                    orders = await db.orders.find({}).to_list(5)
                    for o in orders:
                        print(f"    Order: {o.get('_id')}, status={o.get('status')}, payment_status={o.get('payment_status')}")
            
            if 'users' in collections:
                count = await db.users.count_documents({})
                print(f"  - users collection: {count} documents")
            
            print()
    
    client.close()

asyncio.run(check_all())
