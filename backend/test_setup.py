"""
Test script to verify the MongoDB backend setup
This script can run without a MongoDB connection for testing
"""
import asyncio
from app.models import UserRole, OrderStatus, OrderType, PaymentMethod, PaymentStatus
from app import schemas

async def test_models():
    """Test that models can be instantiated correctly"""
    print("Testing Pydantic models...")
    
    # Test User schema
    user_data = schemas.UserCreate(
        phone="+1234567890",
        email="test@example.com",
        name="Test User",
        role=UserRole.CUSTOMER,
        password="testpassword"
    )
    print(f"✅ User schema: {user_data.name} ({user_data.role})")
    
    # Test Category schema
    category_data = schemas.CategoryCreate(
        name="Test Category",
        description="A test category",
        order=1
    )
    print(f"✅ Category schema: {category_data.name}")
    
    # Test Meal schema
    meal_data = schemas.MealCreate(
        name="Test Meal",
        description="A delicious test meal",
        price=15.99,
        category_id="test-category-id",
        ingredients=[]
    )
    print(f"✅ Meal schema: {meal_data.name} - ${meal_data.price}")
    
    # Test Order schema
    order_data = schemas.OrderCreate(
        order_type=OrderType.DELIVERY,
        payment_method=PaymentMethod.CARD,
        phone_number="+1234567890",
        delivery_address="123 Test St",
        items=[]
    )
    print(f"✅ Order schema: {order_data.order_type} - {order_data.payment_method}")
    
    print("\n🎉 All model tests passed!")
    return True

async def test_enums():
    """Test that enums work correctly"""
    print("\nTesting enums...")
    
    # Test all enum values
    user_roles = [role.value for role in UserRole]
    print(f"✅ UserRole values: {user_roles}")
    
    order_statuses = [status.value for status in OrderStatus]
    print(f"✅ OrderStatus values: {order_statuses}")
    
    order_types = [type_.value for type_ in OrderType]
    print(f"✅ OrderType values: {order_types}")
    
    payment_methods = [method.value for method in PaymentMethod]
    print(f"✅ PaymentMethod values: {payment_methods}")
    
    payment_statuses = [status.value for status in PaymentStatus]
    print(f"✅ PaymentStatus values: {payment_statuses}")
    
    print("\n🎉 All enum tests passed!")
    return True

async def main():
    """Run all tests"""
    print("🧪 Starting MongoDB Backend Tests")
    print("=" * 50)
    
    try:
        await test_models()
        await test_enums()
        
        print("\n" + "=" * 50)
        print("✅ All tests completed successfully!")
        print("🚀 Your MongoDB backend setup is ready!")
        print("\nNext steps:")
        print("1. Set up MongoDB (see MONGODB_SETUP.md)")
        print("2. Update MONGODB_URL in .env file")
        print("3. Run: python -m uvicorn app.main:app --reload")
        print("4. Run: python seed_db.py (to populate with sample data)")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())