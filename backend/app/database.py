from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import Optional
import asyncio
from .config import settings

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

database = Database()

async def get_database() -> AsyncIOMotorClient:
    return database.client

async def connect_to_mongo():
    """Create database connection"""
    try:
        database.client = AsyncIOMotorClient(settings.mongodb_url)
        database.database = database.client[settings.mongodb_database_name]
        
        # Test connection
        await database.client.admin.command('ping')
        print(f"✅ Connected to MongoDB at {settings.mongodb_url}")
        
        # Initialize Beanie with the models
        from .models import User, Category, Meal, Ingredient, Order, Coupon, Review, Notification, RestaurantSettings
        
        await init_beanie(
            database=database.database,
            document_models=[
                User,
                Category, 
                Meal,
                Ingredient,
                Order,
                Coupon,
                Review,
                Notification,
                RestaurantSettings
            ]
        )
        print("✅ Beanie initialized successfully")
        
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        print("💡 Please ensure MongoDB is running or use MongoDB Atlas")
        print("📖 See MONGODB_SETUP.md for setup instructions")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if database.client:
        database.client.close()
        print("✅ Disconnected from MongoDB")

# Dependency to get database
async def get_db():
    return database.database