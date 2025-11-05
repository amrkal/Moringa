import asyncio
from app.database import connect_to_mongo, close_mongo_connection
from app import models

async def main():
    await connect_to_mongo()
    try:
        users = await models.User.find().to_list()
        print(f"Found {len(users)} users:")
        for u in users:
            print({
                'id': str(u.id),
                'name': u.name,
                'email': u.email,
                'phone': u.phone,
                'role': u.role,
                'verified': u.is_verified,
                'has_password': bool(u.password),
            })
    finally:
        await close_mongo_connection()

if __name__ == '__main__':
    asyncio.run(main())
