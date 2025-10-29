#!/usr/bin/env python3
"""
Test script to verify the Moringa Food Ordering API endpoints.
This script tests all major API functionality including authentication,
categories, meals, ingredients, and orders.
"""

import requests
import json
from pprint import pprint

# Base API URL
BASE_URL = "http://localhost:8000/api/v1"

class MoringaAPIClient:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
        self.token = None

    def login(self, phone: str, password: str) -> bool:
        """Authenticate with the API and store the JWT token."""
        try:
            response = self.session.post(
                f"{self.base_url}/auth/login",
                data={
                    "username": phone,  # FastAPI OAuth2PasswordRequestForm uses 'username'
                    "password": password
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.session.headers.update({
                    "Authorization": f"Bearer {self.token}"
                })
                print(f"✅ Login successful for {phone}")
                return True
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False

    def get_categories(self):
        """Get all categories."""
        try:
            response = self.session.get(f"{self.base_url}/categories")
            if response.status_code == 200:
                categories = response.json()
                print(f"✅ Retrieved {len(categories)} categories")
                return categories
            else:
                print(f"❌ Failed to get categories: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Categories error: {e}")
            return None

    def get_meals(self, category_id: str = None):
        """Get meals, optionally filtered by category."""
        try:
            url = f"{self.base_url}/meals"
            if category_id:
                url += f"?category_id={category_id}"
            
            response = self.session.get(url)
            if response.status_code == 200:
                meals = response.json()
                print(f"✅ Retrieved {len(meals)} meals")
                return meals
            else:
                print(f"❌ Failed to get meals: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Meals error: {e}")
            return None

    def get_ingredients(self):
        """Get all ingredients."""
        try:
            response = self.session.get(f"{self.base_url}/ingredients")
            if response.status_code == 200:
                ingredients = response.json()
                print(f"✅ Retrieved {len(ingredients)} ingredients")
                return ingredients
            else:
                print(f"❌ Failed to get ingredients: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Ingredients error: {e}")
            return None

    def create_order(self, order_data: dict):
        """Create a new order."""
        try:
            response = self.session.post(
                f"{self.base_url}/orders",
                json=order_data
            )
            if response.status_code == 200:
                order = response.json()
                print(f"✅ Order created: {order['id']}")
                return order
            else:
                print(f"❌ Failed to create order: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"❌ Order creation error: {e}")
            return None

    def get_user_orders(self):
        """Get orders for the current user."""
        try:
            response = self.session.get(f"{self.base_url}/orders/my-orders")
            if response.status_code == 200:
                orders = response.json()
                print(f"✅ Retrieved {len(orders)} user orders")
                return orders
            else:
                print(f"❌ Failed to get user orders: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ User orders error: {e}")
            return None


def main():
    """Test all API endpoints."""
    print("🧪 Testing Moringa Food Ordering API")
    print("=" * 50)
    
    # Initialize API client
    client = MoringaAPIClient()
    
    # Test health check
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ API health check passed")
            pprint(response.json())
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")
        return
    
    print("\n" + "=" * 50)
    
    # Test authentication
    print("🔐 Testing Authentication...")
    success = client.login("+1234567891", "customer")  # Customer credentials from seed data
    
    if not success:
        print("❌ Authentication failed. Cannot proceed with authenticated tests.")
        return
    
    print("\n" + "=" * 50)
    
    # Test categories
    print("📂 Testing Categories...")
    categories = client.get_categories()
    if categories:
        print("Categories:")
        for cat in categories[:3]:  # Show first 3
            print(f"  - {cat['name']}: {cat['description']}")
    
    print("\n" + "=" * 50)
    
    # Test meals
    print("🍽️ Testing Meals...")
    meals = client.get_meals()
    if meals:
        print("Meals:")
        for meal in meals[:3]:  # Show first 3
            print(f"  - {meal['name']}: ${meal['price']} - {meal['description'][:50]}...")
    
    print("\n" + "=" * 50)
    
    # Test ingredients
    print("🥬 Testing Ingredients...")
    ingredients = client.get_ingredients()
    if ingredients:
        print("Ingredients:")
        for ing in ingredients[:3]:  # Show first 3
            print(f"  - {ing['name']}: ${ing['price']} - {ing['description']}")
    
    print("\n" + "=" * 50)
    
    # Test order creation
    print("📦 Testing Order Creation...")
    if meals and len(meals) > 0:
        order_data = {
            "order_type": "DELIVERY",
            "payment_method": "CARD",
            "phone_number": "+1234567891",
            "delivery_address": "123 Test Street, Test City",
            "special_instructions": "Test order from API client",
            "items": [
                {
                    "meal_id": meals[0]["id"],
                    "quantity": 2,
                    "price": meals[0]["price"],
                    "selected_ingredients": []
                }
            ]
        }
        
        order = client.create_order(order_data)
        if order:
            print(f"Order details:")
            print(f"  - ID: {order['id']}")
            print(f"  - Total: ${order['total_amount']}")
            print(f"  - Status: {order['status']}")
    
    print("\n" + "=" * 50)
    
    # Test getting user orders
    print("📋 Testing User Orders...")
    client.get_user_orders()
    
    print("\n" + "=" * 50)
    print("✅ API testing completed!")
    print("\n💡 Next steps:")
    print("1. Update Next.js frontend to use these API endpoints")
    print("2. Replace mock data with real API calls")
    print("3. Handle authentication in the frontend")
    print("4. Test the complete application flow")


if __name__ == "__main__":
    main()