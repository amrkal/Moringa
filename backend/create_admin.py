"""
Script to create an admin user in MongoDB
Run this with: python create_admin.py
"""
import asyncio
import bcrypt
from app.database import connect_to_mongo, close_mongo_connection
from app.models import User, UserRole

async def create_admin_user():
    """Create an admin user if it doesn't exist"""
    
    # Connect to MongoDB
    await connect_to_mongo()
    
    # Admin credentials
    admin_phone = "0504707027"  # Admin phone
    admin_password = "Admin123"     # Admin password
    admin_name = "Admin User"
    admin_email = "admin@moringa.com"
    
    try:
        # Check if admin already exists
        existing_admin = await User.find_one(User.phone == admin_phone)
        
        if existing_admin:
            print(f"⚠️  Admin user already exists. Updating password...")
            # Update the password with proper bcrypt hash
            password_bytes = admin_password.encode('utf-8')
            salt = bcrypt.gensalt(rounds=12)
            hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
            existing_admin.password = hashed_password
            await existing_admin.save()
            print(f"✅ Admin password updated successfully!")
            print(f"\n📋 Admin Login Credentials:")
            print(f"   Phone: {admin_phone}")
            print(f"   Password: {admin_password}")
            print(f"   Email: {existing_admin.email}")
            print(f"   Name: {existing_admin.name}")
            print(f"\n🔗 Login at: http://localhost:3000/admin/login")
        else:
            # Create new admin user
            password_bytes = admin_password.encode('utf-8')
            salt = bcrypt.gensalt(rounds=12)
            hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
            
            admin_user = User(
                phone=admin_phone,
                email=admin_email,
                name=admin_name,
                password=hashed_password,
                role=UserRole.ADMIN,
                is_verified=True
            )
            
            await admin_user.insert()
            
            print("✅ Admin user created successfully!")
            print(f"\n📋 Admin Login Credentials:")
            print(f"   Phone: {admin_phone}")
            print(f"   Password: {admin_password}")
            print(f"   Email: {admin_email}")
            print(f"   Name: {admin_name}")
            print(f"\n🔗 Login at: http://localhost:3000/admin/login")
            print("\n⚠️  IMPORTANT: Change the default password after first login!")
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Close connection
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
