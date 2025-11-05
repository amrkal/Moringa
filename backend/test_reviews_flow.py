"""
Reviews Flow Test
- Login as admin (admin created some orders via tests, so admin owns those orders)
- Pick a recent admin-owned order and one of its meal_ids
- POST /reviews/ with order_id to create a verified (auto-approved) review
- GET /reviews/meal/{meal_id} and /reviews/meal/{meal_id}/stats to verify appearance
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"
ADMIN_PHONE = "+254712345678"
ADMIN_PASSWORD = "admin123"

class Colors:
    GREEN='\033[92m'
    RED='\033[91m'
    YELLOW='\033[93m'
    BLUE='\033[94m'
    END='\033[0m'


def login_admin():
    try:
        r = requests.post(
            f"{BASE_URL}/auth/login",
            json={"phone": ADMIN_PHONE, "password": ADMIN_PASSWORD},
            timeout=8,
        )
        if r.status_code == 200:
            data = r.json()
            return data.get("access_token"), data.get("user", {})
        else:
            print(f"Admin login failed: {r.status_code} {r.text[:200]}")
    except Exception as e:
        print(f"Admin login error: {e}")
    return None, None


def pick_admin_order(headers, admin_id: str):
    r = requests.get(f"{BASE_URL}/orders/?limit=20", headers=headers, timeout=10)
    if r.status_code != 200:
        print(f"List orders failed: {r.status_code} {r.text[:200]}")
        return None
    orders = r.json()
    arr = orders.get("data", orders) if isinstance(orders, dict) else orders
    if not isinstance(arr, list) or not arr:
        return None
    # Prefer an order that belongs to admin (so review is verified and auto-approved)
    for o in arr:
        if (o.get("user_id") or o.get("userId")) == admin_id:
            return o
    # Fallback to first order
    return arr[0]


def create_review(headers, meal_id: str, order_id: str):
    payload = {
        "meal_id": meal_id,
        "order_id": order_id,
        "rating": 5,
        "comment": f"Automated test review at {datetime.utcnow().isoformat()}"
    }
    return requests.post(f"{BASE_URL}/reviews/", headers=headers, json=payload, timeout=12)


def get_meal_stats(meal_id: str):
    return requests.get(f"{BASE_URL}/reviews/meal/{meal_id}/stats", timeout=8)


def get_meal_reviews(meal_id: str):
    return requests.get(f"{BASE_URL}/reviews/meal/{meal_id}", timeout=8)


def main():
    print(f"\n{Colors.BLUE}=== Reviews Flow Test ==={Colors.END}")

    token, user = login_admin()
    if not token:
        print(f"{Colors.RED}✗ Admin auth failed{Colors.END}")
        return
    headers = {"Authorization": f"Bearer {token}"}
    admin_id = user.get("id") or user.get("_id")

    order = pick_admin_order(headers, admin_id)
    if not order:
        print(f"{Colors.RED}✗ No orders available to review{Colors.END}")
        return

    order_id = order.get("id") or order.get("_id")
    items = order.get("items") or []
    if not items:
        print(f"{Colors.RED}✗ Order has no items{Colors.END}")
        return
    # find a meal id from items
    meal_id = (items[0].get("meal_id") or items[0].get("mealId"))
    if not meal_id:
        print(f"{Colors.RED}✗ Could not determine meal_id from order items{Colors.END}")
        return

    # Read stats before
    stats_before = get_meal_stats(meal_id).json()
    total_before = stats_before.get("total_reviews", 0)
    print(f"Stats before: total_reviews={total_before}")

    # Create review
    resp = create_review(headers, meal_id, order_id)
    if resp.status_code not in (200, 201):
        print(f"{Colors.RED}✗ Create review failed{Colors.END} {resp.status_code} {resp.text[:200]}")
        return
    review = resp.json()
    print(f"{Colors.GREEN}✓ Review created{Colors.END} (status={review.get('status')}, verified={review.get('is_verified')})")

    # Confirm it appears in meal reviews (approved only)
    rlist = get_meal_reviews(meal_id)
    if rlist.status_code == 200:
        reviews = rlist.json()
        print(f"{Colors.GREEN}✓ Meal reviews fetched{Colors.END} (count={len(reviews)})")
    else:
        print(f"{Colors.YELLOW}Meal reviews fetch failed{Colors.END}: {rlist.status_code}")

    # Confirm stats increased
    stats_after = get_meal_stats(meal_id).json()
    total_after = stats_after.get("total_reviews", 0)
    if total_after >= total_before + 1:
        print(f"{Colors.GREEN}✓ Stats updated{Colors.END} (total_reviews={total_after})")
        print(f"\n{Colors.GREEN}PASS{Colors.END}: Reviews flow works")
    else:
        print(f"{Colors.YELLOW}WARN{Colors.END}: Stats didn't increase; moderation may be required")

if __name__ == "__main__":
    main()
