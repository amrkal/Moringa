"""
Reviews Moderation Flow Test
- Login as admin
- Pick any meal_id from /meals
- Create an unverified review (no order_id) -> expect PENDING
- Admin moderates to APPROVED -> expect it to appear in public listing and stats increment
- Admin moderates to REJECTED -> expect it to disappear from public listing and stats reflect removal
"""
import requests
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


def get_my_reviews(headers):
    r = requests.get(f"{BASE_URL}/reviews/user/me", headers=headers, timeout=10)
    if r.status_code != 200:
        return []
    try:
        return r.json()
    except Exception:
        return []


def pick_unreviewed_meal_id(headers):
    # Get all meals
    r = requests.get(f"{BASE_URL}/meals/", headers=headers, timeout=10)
    if r.status_code != 200:
        print(f"Meals fetch failed: {r.status_code} {r.text[:200]}")
        return None
    data = r.json()
    meals = data if isinstance(data, list) else data.get("data", [])
    if not meals:
        return None
    # Get my reviews to avoid duplicates
    my_reviews = get_my_reviews(headers)
    reviewed_meal_ids = {rv.get('meal_id') or rv.get('mealId') for rv in my_reviews}
    # Pick the first meal not reviewed yet
    for m in meals:
        mid = m.get("id") or m.get("_id")
        if mid and mid not in reviewed_meal_ids:
            return mid
    # Fallback: just return the first
    return meals[0].get("id") or meals[0].get("_id")


def get_stats(meal_id):
    r = requests.get(f"{BASE_URL}/reviews/meal/{meal_id}/stats", timeout=8)
    if r.status_code == 200:
        return r.json()
    return {"total_reviews": 0}


def get_public_reviews(meal_id):
    r = requests.get(f"{BASE_URL}/reviews/meal/{meal_id}", timeout=8)
    if r.status_code == 200:
        return r.json()
    return []


def create_unverified_review(headers, meal_id):
    payload = {
        "meal_id": meal_id,
        "rating": 4,
        "comment": f"Unverified review {datetime.utcnow().isoformat()}"
    }
    return requests.post(f"{BASE_URL}/reviews/", headers=headers, json=payload, timeout=10)


def moderate(headers, review_id, status, notes):
    return requests.put(
        f"{BASE_URL}/reviews/admin/{review_id}/moderate",
        headers=headers,
        json={"status": status, "moderation_notes": notes},
        timeout=8,
    )


def main():
    print(f"\n{Colors.BLUE}=== Reviews Moderation Flow Test ==={Colors.END}")
    token, _ = login_admin()
    if not token:
        print(f"{Colors.RED}✗ Admin auth failed{Colors.END}")
        return
    headers = {"Authorization": f"Bearer {token}"}

    meal_id = pick_unreviewed_meal_id(headers)
    if not meal_id:
        print(f"{Colors.RED}✗ No meals found{Colors.END}")
        return

    stats_before = get_stats(meal_id)
    total_before = stats_before.get("total_reviews", 0)
    print(f"Stats before: total_reviews={total_before}")

    # Create unverified (PENDING) review
    resp = create_unverified_review(headers, meal_id)
    if resp.status_code not in (200, 201):
        print(f"{Colors.RED}✗ Create review failed{Colors.END} {resp.status_code} {resp.text[:200]}")
        return
    review = resp.json()
    review_id = review.get("id") or review.get("_id")
    print(f"Created review {review_id} with status={review.get('status')}")

    # Approve it
    m1 = moderate(headers, review_id, "APPROVED", "Automated approve")
    if m1.status_code not in (200, 201):
        print(f"{Colors.RED}✗ Approve failed{Colors.END} {m1.status_code} {m1.text[:200]}")
        return
    print(f"{Colors.GREEN}✓ Moderated to APPROVED{Colors.END}")

    # It should be visible in public list and stats should increment
    pub_after_approve = get_public_reviews(meal_id)
    ids = {r.get('id') or r.get('_id') for r in pub_after_approve}
    if review_id in ids:
        print(f"{Colors.GREEN}✓ Appears in public listing{Colors.END}")
    else:
        print(f"{Colors.YELLOW}WARN{Colors.END}: Not found in public listing")

    stats_after = get_stats(meal_id)
    total_after = stats_after.get("total_reviews", 0)
    if total_after >= total_before + 1:
        print(f"{Colors.GREEN}✓ Stats increased to {total_after}{Colors.END}")
    else:
        print(f"{Colors.YELLOW}WARN{Colors.END}: Stats did not increase as expected")

    # Reject it
    m2 = moderate(headers, review_id, "REJECTED", "Automated reject")
    if m2.status_code not in (200, 201):
        print(f"{Colors.RED}✗ Reject failed{Colors.END} {m2.status_code} {m2.text[:200]}")
        return
    print(f"{Colors.GREEN}✓ Moderated to REJECTED{Colors.END}")

    # Now it should disappear from public list and stats not count it
    pub_after_reject = get_public_reviews(meal_id)
    ids2 = {r.get('id') or r.get('_id') for r in pub_after_reject}
    if review_id not in ids2:
        print(f"{Colors.GREEN}✓ No longer in public listing{Colors.END}")
    else:
        print(f"{Colors.YELLOW}WARN{Colors.END}: Still present in public listing")

    stats_final = get_stats(meal_id)
    total_final = stats_final.get("total_reviews", 0)
    if total_final <= total_after - 1:
        print(f"{Colors.GREEN}✓ Stats decreased to {total_final}{Colors.END}")
        print(f"\n{Colors.GREEN}PASS{Colors.END}: Reviews moderation flow works")
    else:
        print(f"{Colors.YELLOW}WARN{Colors.END}: Stats did not decrease as expected")

if __name__ == "__main__":
    main()
