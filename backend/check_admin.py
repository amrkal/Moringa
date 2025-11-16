"""
Script to verify admin user exists in MongoDB Atlas
"""
import asyncio
from app.database import connect_to_mongo, close_mongo_connection
from app.models import User

async def check_admin():
    """Check if admin user exists in Atlas"""
    await connect_to_mongo()
    
    try:
        user = await User.find_one(User.phone == "0504707027")
        
        if user:
            print("✅ Admin user found in MongoDB Atlas!")
            print(f"\n📋 User Details:")
            print(f"   Name: {user.name}")
            print(f"   Phone: {user.phone}")
            print(f"   Email: {user.email}")
            print(f"   Role: {user.role}")
            print(f"   Verified: {user.is_verified}")
            print(f"   User ID: {user.id}")
        else:
            print("❌ Admin user not found in Atlas")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(check_admin())
