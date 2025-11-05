"""
Comprehensive Feature Testing Script
Tests all implemented features: WebSocket, Orders, Analytics, Reviews
"""
import requests
import json
from datetime import datetime
import time

BASE_URL = "http://localhost:8000/api/v1"

# ANSI color codes
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.END}\n")

def print_test(name, status, details=""):
    status_symbol = "✓" if status else "✗"
    status_color = Colors.GREEN if status else Colors.RED
    print(f"{status_color}{status_symbol} {name}{Colors.END}")
    if details:
        print(f"  {Colors.CYAN}{details}{Colors.END}")

def login_as_admin():
    """Login and get admin token"""
    print_header("🔐 Authentication Test")
    try:
        # Try to login with default admin credentials (seeded): phone + password
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                # Use seeded/admin phone from DB (adjust if different in your environment)
                "phone": "+254712345678",
                "password": "admin123",
            },
            timeout=8,
        )
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            print_test("Admin Login", True, f"Token: {token[:20]}...")
            return token
        else:
            print_test("Admin Login", False, f"Status: {response.status_code} - {response.text[:120]}")
            print(f"  {Colors.YELLOW}Note: If database isn't seeded, run the seeding script or create an admin via DB{Colors.END}")
            return None
    except Exception as e:
        print_test("Admin Login", False, str(e))
        return None

def test_analytics(token):
    """Test all analytics endpoints"""
    print_header("📊 Analytics & Reports Test")
    
    if not token:
        print(f"{Colors.YELLOW}Skipping analytics tests - no admin token{Colors.END}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    endpoints = [
        ("Sales Overview", "/analytics/sales/overview"),
        ("Daily Sales", "/analytics/sales/daily?days=7"),
        ("Weekly Sales", "/analytics/sales/weekly?weeks=4"),
        ("Monthly Sales", "/analytics/sales/monthly?months=12"),
        ("Popular Meals", "/analytics/meals/popular?limit=5"),
        ("Peak Hours", "/analytics/orders/peak-hours?days=7"),
        ("Orders by Type", "/analytics/orders/by-type"),
        ("Orders by Status", "/analytics/orders/by-status"),
        ("Revenue Trends", "/analytics/revenue/trends?days=30"),
    ]
    
    for name, endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=5)
            if response.status_code == 200:
                data = response.json()
                data_size = len(json.dumps(data))
                print_test(name, True, f"Status: 200, Data size: {data_size} bytes")
            else:
                print_test(name, False, f"Status: {response.status_code}")
        except Exception as e:
            print_test(name, False, str(e))

def test_reviews():
    """Test review endpoints"""
    print_header("⭐ Reviews & Ratings Test")
    
    test_meal_id = "test-meal-123"
    
    # Test public endpoints (no auth required)
    tests = [
        ("Get Meal Reviews", f"/reviews/meal/{test_meal_id}"),
        ("Get Meal Stats", f"/reviews/meal/{test_meal_id}/stats"),
    ]
    
    for name, endpoint in tests:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print_test(name, True, f"Status: 200, Response: {json.dumps(data)[:100]}")
            else:
                print_test(name, False, f"Status: {response.status_code}")
        except Exception as e:
            print_test(name, False, str(e))

def test_orders(token):
    """Test order endpoints"""
    print_header("🛒 Orders Test")
    
    if not token:
        print(f"{Colors.YELLOW}Skipping order tests - no admin token{Colors.END}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Get all orders
        response = requests.get(f"{BASE_URL}/orders/", headers=headers, timeout=5)
        if response.status_code == 200:
            orders = response.json()
            order_count = len(orders.get("data", orders) if isinstance(orders, dict) else orders)
            print_test("List Orders", True, f"Found {order_count} orders")
            
            # If we have orders, test getting details of the first one
            order_list = orders.get("data", orders) if isinstance(orders, dict) else orders
            if isinstance(order_list, list) and len(order_list) > 0:
                first_order_id = order_list[0].get("id") or order_list[0].get("_id")
                if first_order_id:
                    detail_response = requests.get(
                        f"{BASE_URL}/orders/{first_order_id}",
                        headers=headers,
                        timeout=5
                    )
                    if detail_response.status_code == 200:
                        print_test("Get Order Details", True, f"Order ID: {first_order_id}")
                    else:
                        print_test("Get Order Details", False, f"Status: {detail_response.status_code}")
        else:
            print_test("List Orders", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test("Orders", False, str(e))

def test_websocket():
    """Test WebSocket connection availability"""
    print_header("🔌 WebSocket Test")
    
    print(f"{Colors.CYAN}WebSocket endpoints available at:{Colors.END}")
    print(f"  • Admin: ws://localhost:8000/api/v1/ws/admin")
    print(f"  • Customer: ws://localhost:8000/api/v1/ws/customer/{{user_id}}")
    print(f"\n{Colors.YELLOW}Note: WebSocket connections tested via browser{Colors.END}")
    print(f"{Colors.YELLOW}Check browser console for connection status{Colors.END}")
    
    # Test if the WebSocket test page is accessible
    try:
        response = requests.get("http://localhost:8080/websocket_test.html", timeout=5)
        if response.status_code == 200:
            print_test("WebSocket Test Page", True, "http://localhost:8080/websocket_test.html")
        else:
            print_test("WebSocket Test Page", False, f"Status: {response.status_code}")
    except:
        print_test("WebSocket Test Page", False, "Test page not accessible")

def test_frontend():
    """Test if frontend is accessible"""
    print_header("🖥️  Frontend Test")
    
    pages = [
        ("Admin Dashboard", "http://localhost:3001/admin"),
        ("Menu Page", "http://localhost:3001/menu"),
        ("Orders Page", "http://localhost:3001/admin/orders"),
        ("Analytics Page", "http://localhost:3001/admin/dashboard"),
        ("Reviews Page", "http://localhost:3001/admin/reviews"),
    ]
    
    for name, url in pages:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print_test(name, True, url)
            else:
                print_test(name, False, f"Status: {response.status_code}")
        except Exception as e:
            print_test(name, False, "Not accessible")

def main():
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}🍴 Moringa Restaurant - Feature Testing Suite{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"\n{Colors.CYAN}Starting comprehensive feature tests...{Colors.END}\n")
    
    # Run all tests
    token = login_as_admin()
    test_websocket()
    test_frontend()
    test_orders(token)
    test_analytics(token)
    test_reviews()
    
    # Summary
    print_header("📋 Test Summary")
    print(f"{Colors.GREEN}✓ All endpoint tests completed{Colors.END}")
    print(f"\n{Colors.BOLD}Next Steps:{Colors.END}")
    print(f"  1. {Colors.CYAN}Open browser console (F12) to check WebSocket{Colors.END}")
    print(f"  2. {Colors.CYAN}Test creating orders from customer side{Colors.END}")
    print(f"  3. {Colors.CYAN}Verify admin receives real-time notifications{Colors.END}")
    print(f"  4. {Colors.CYAN}Test analytics dashboard charts{Colors.END}")
    print(f"  5. {Colors.CYAN}Test review submission and moderation{Colors.END}")
    print(f"  6. {Colors.CYAN}Test CSV/PDF export functionality{Colors.END}")
    
    print(f"\n{Colors.YELLOW}{'='*70}{Colors.END}")
    print(f"{Colors.YELLOW}For manual testing, follow: TESTING_CHECKLIST.md{Colors.END}")
    print(f"{Colors.YELLOW}{'='*70}{Colors.END}\n")

if __name__ == "__main__":
    main()
