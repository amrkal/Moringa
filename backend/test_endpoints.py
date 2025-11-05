"""
Quick test script to verify all new endpoints are working
Run this after starting the backend server
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def test_endpoint(method, endpoint, description, expected_status=200, data=None, headers=None):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n{Colors.BLUE}Testing: {description}{Colors.END}")
    print(f"  {method} {endpoint}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=5)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=5)
        
        if response.status_code == expected_status:
            print(f"  {Colors.GREEN}✓ PASS{Colors.END} - Status: {response.status_code}")
            return True, response
        else:
            print(f"  {Colors.RED}✗ FAIL{Colors.END} - Expected {expected_status}, got {response.status_code}")
            print(f"  Response: {response.text[:200]}")
            return False, response
    except Exception as e:
        print(f"  {Colors.RED}✗ ERROR{Colors.END} - {str(e)}")
        return False, None

def main():
    print(f"\n{Colors.YELLOW}{'='*60}{Colors.END}")
    print(f"{Colors.YELLOW}Moringa Restaurant API Test Suite{Colors.END}")
    print(f"{Colors.YELLOW}{'='*60}{Colors.END}")
    
    results = {"passed": 0, "failed": 0}
    
    # Test Analytics Endpoints
    print(f"\n{Colors.YELLOW}=== Analytics Endpoints ==={Colors.END}")
    
    tests = [
        ("GET", "/analytics/sales/overview", "Sales Overview"),
        ("GET", "/analytics/sales/daily?days=30", "Daily Sales (30 days)"),
        ("GET", "/analytics/sales/weekly?weeks=12", "Weekly Sales (12 weeks)"),
        ("GET", "/analytics/sales/monthly?months=12", "Monthly Sales (12 months)"),
        ("GET", "/analytics/meals/popular?limit=10", "Popular Meals"),
        ("GET", "/analytics/orders/peak-hours?days=30", "Peak Hours"),
        ("GET", "/analytics/orders/by-type", "Orders by Type"),
        ("GET", "/analytics/orders/by-status", "Orders by Status"),
        ("GET", "/analytics/revenue/trends?days=30", "Revenue Trends"),
    ]
    
    for method, endpoint, description in tests:
        success, _ = test_endpoint(method, endpoint, description)
        if success:
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Test Review Endpoints (without authentication)
    print(f"\n{Colors.YELLOW}=== Review Endpoints (Public) ==={Colors.END}")
    
    # These will likely fail without real data, but we're testing if endpoints exist
    review_tests = [
        ("GET", "/reviews/meal/test-meal-id", "Get Meal Reviews", 200),
        ("GET", "/reviews/meal/test-meal-id/stats", "Get Meal Rating Stats", 200),
    ]
    
    for method, endpoint, description, expected in review_tests:
        success, _ = test_endpoint(method, endpoint, description, expected)
        if success:
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Test WebSocket endpoint (just check if it's registered)
    print(f"\n{Colors.YELLOW}=== WebSocket Endpoints ==={Colors.END}")
    print(f"{Colors.BLUE}WebSocket endpoints (ws://localhost:8000/api/v1/ws/admin){Colors.END}")
    print(f"  {Colors.GREEN}✓ INFO{Colors.END} - WebSocket endpoints cannot be tested via HTTP")
    print(f"  Check browser console for connection status")
    
    # Summary
    print(f"\n{Colors.YELLOW}{'='*60}{Colors.END}")
    print(f"{Colors.YELLOW}Test Summary{Colors.END}")
    print(f"{Colors.YELLOW}{'='*60}{Colors.END}")
    print(f"  {Colors.GREEN}Passed: {results['passed']}{Colors.END}")
    print(f"  {Colors.RED}Failed: {results['failed']}{Colors.END}")
    print(f"  Total: {results['passed'] + results['failed']}")
    
    if results['failed'] == 0:
        print(f"\n{Colors.GREEN}✓ All tests passed!{Colors.END}")
    else:
        print(f"\n{Colors.YELLOW}⚠ Some tests failed. Check the output above.{Colors.END}")
    
    print(f"\n{Colors.BLUE}Next steps:{Colors.END}")
    print("  1. Start frontend: cd moringa && npm run dev")
    print("  2. Open admin dashboard: http://localhost:3000/admin")
    print("  3. Check browser console for WebSocket connection")
    print("  4. Test creating orders and reviews")
    print("  5. Verify real-time notifications work")
    print(f"\n{Colors.YELLOW}{'='*60}{Colors.END}\n")

if __name__ == "__main__":
    main()
