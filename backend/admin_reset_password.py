import asyncio
from app.database import connect_to_mongo, close_mongo_connection
from app import models
from app.security import get_password_hash

ADMIN_PHONE = "+1234567890"
ADMIN_EMAIL = "admin@moringa.com"
NEW_PASSWORD = "admin123"

async def main():
    await connect_to_mongo()
    try:
        user = await models.User.find_one(models.User.phone == ADMIN_PHONE)
        if not user:
            user = await models.User.find_one(models.User.email == ADMIN_EMAIL)
        if not user:
            print("✗ Admin user not found")
            return
        user.password = get_password_hash(NEW_PASSWORD)
        user.is_verified = True
        await user.save()
        print("✓ Admin password reset and verified")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
