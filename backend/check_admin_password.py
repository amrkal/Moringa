"""
Script to check admin user password hash in MongoDB Atlas
"""
import asyncio
from app.database import connect_to_mongo, close_mongo_connection
from app.models import User

async def check_admin_password():
    """Check admin user password hash"""
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
            print(f"\n🔐 Password Hash Info:")
            if user.password:
                print(f"   Hash exists: Yes")
                print(f"   Hash length: {len(user.password)}")
                print(f"   Hash starts with: {user.password[:10]}...")
                print(f"   Is bcrypt format: {user.password.startswith('$2b$')}")
            else:
                print(f"   ❌ Password is None/Empty!")
        else:
            print("❌ Admin user not found in Atlas")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(check_admin_password())
